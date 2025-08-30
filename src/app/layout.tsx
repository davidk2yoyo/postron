import type { Metadata } from "next";
import { Inter, Jost } from 'next/font/google';
import "./globals.css";
import { AppProvider } from "@/stores/AppContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-text',
});

const jost = Jost({
  subsets: ['latin'],
  variable: '--font-title',
});

export const metadata: Metadata = {
  title: "Post-Tron - Generador de Contenido para Redes Sociales",
  description: "Aplicación web para generar contenido de redes sociales con IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${jost.variable} antialiased`}>
        <AuthProvider>
          <AppProvider>
            {children}
            <Toaster />
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
