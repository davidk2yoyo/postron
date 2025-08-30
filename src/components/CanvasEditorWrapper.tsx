'use client';

import dynamic from 'next/dynamic';
import { Logo } from '@/types';

// Dynamically import CanvasEditor with no SSR to avoid Node.js canvas issues
const CanvasEditor = dynamic(() => import('./CanvasEditor'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-2"></div>
        <p className="text-gray-600">Cargando editor...</p>
      </div>
    </div>
  ),
});

interface CanvasEditorWrapperProps {
  logos: Logo[];
  backgroundImage?: string;
  onExport?: (dataURL: string) => void;
  selectedPreset?: string;
  onPresetChange?: (preset: string) => void;
  onExportRef?: (exportFn: () => void) => void;
}

export default function CanvasEditorWrapper(props: CanvasEditorWrapperProps) {
  return <CanvasEditor {...props} />;
}