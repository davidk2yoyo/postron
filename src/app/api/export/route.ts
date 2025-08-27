import { NextRequest, NextResponse } from 'next/server';
import { AssetsService, SettingsService } from '@/services/database';

interface ExportRequest {
  images: {
    dataURL: string;
    width: number;
    height: number;
  }[];
  postData: {
    id: string;
    hook: string;
    slide_ideas: string[];
    caption: string;
    cta: string;
    hashtags: string[];
    platform: string;
    post_type: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { images, postData }: ExportRequest = await request.json();
    if (!images || !images.length || !postData) {
      return NextResponse.json(
        { error: 'Missing images or post data' },
        { status: 400 }
      );
    }

    // Generate timestamp for unique naming
    const timestamp = Date.now();
    const uploadedImages: string[] = [];
    const createdAssets: {
      id: string;
      post_id: string;
      user_id: string;
      kind: string;
      url: string;
      storage_path: string;
      order_index: number;
      width: number;
      height: number;
      created_at: string;
      updated_at: string;
    }[] = [];

    // Upload each image to Supabase Storage and create asset records
    for (let index = 0; index < images.length; index++) {
      const image = images[index];
      
      // Convert data URL to blob
      const blob = AssetsService.dataURLToBlob(image.dataURL);
      
      // Generate storage path with naming convention: platform_timestamp_index.png
      const storagePath = `posts/${postData.id}/${postData.platform}_${timestamp}_${index}.png`;
      
      // Upload to Supabase Storage
      const { url, path } = await AssetsService.uploadImage(blob, storagePath);
      uploadedImages.push(url);
      
      // Create asset record in database
      const asset = await AssetsService.createAsset({
        post_id: postData.id,
        user_id: AssetsService.DEFAULT_USER_ID,
        kind: 'export',
        url: url,
        storage_path: path,
        order_index: index,
        width: image.width,
        height: image.height,
      });
      
      createdAssets.push(asset);
    }

    // Get N8N webhook URL from settings
    const settings = await SettingsService.getSettings();
    const n8nWebhookUrl = settings.n8n_webhook_url;

    // Send webhook to N8N with complete payload
    if (n8nWebhookUrl) {
      const webhookPayload = {
        post_type: postData.platform,
        images: uploadedImages,
        content: {
          hook: postData.hook,
          ideas: postData.slide_ideas,
          caption: postData.caption,
          cta: postData.cta,
          hashtags: postData.hashtags,
        },
        metadata: {
          post_id: postData.id,
          dimensions: `${images[0].width}x${images[0].height}`,
          created_at: new Date().toISOString(),
          asset_count: images.length
        }
      };

      try {
        const response = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload),
        });

        if (!response.ok) {
          console.error('N8N webhook failed:', response.statusText);
        }
      } catch (webhookError) {
        console.error('Failed to send N8N webhook:', webhookError);
        // Don't fail the entire request if webhook fails
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully exported ${images.length} image(s)`,
      images: uploadedImages,
      assets: createdAssets,
      downloadUrls: uploadedImages, // Same as images for download functionality
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export images', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}