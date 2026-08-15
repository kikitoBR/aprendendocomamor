import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#EA4F05',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: 'Escola Aprendendo com Amor • Sistema Integrado de Gestão Escolar & Secretaria',
    template: '%s | Escola Aprendendo com Amor',
  },
  description:
    'Sistema oficial da Escola Aprendendo com Amor. Gestão pedagógica completa, matrículas com fichas timbradas oficiais, controle financeiro com PIX/recibos em 2 vias, diário de classe da Educação Infantil e Fundamental e Portal da Família.',
  applicationName: 'Aprendendo com Amor',
  authors: [{ name: 'Escola Aprendendo com Amor' }],
  generator: 'Next.js',
  keywords: [
    'Escola Aprendendo com Amor',
    'Educação Infantil',
    'Ensino Fundamental',
    'Gestão Escolar',
    'Secretaria Escolar',
    'Campos dos Goytacazes',
    'Ficha de Matrícula',
    'Diário de Classe',
    'Controle Financeiro Escolar',
    'Mensalidades Escolares',
    'Portal dos Pais',
  ],
  creator: 'Escola Aprendendo com Amor',
  publisher: 'Escola Aprendendo com Amor',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://escolaaprendendocomamor.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Escola Aprendendo com Amor • Educação Infantil & Fundamental',
    description:
      'Educação com afeto, excelência e transparência. Portal oficial de gestão pedagógica, matrículas e acompanhamento da família.',
    url: 'https://escolaaprendendocomamor.vercel.app',
    siteName: 'Escola Aprendendo com Amor',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Escola Aprendendo com Amor • Gestão Escolar & Secretaria',
    description:
      'Sistema de Gestão Escolar e Portal da Família da Escola Aprendendo com Amor.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={outfit.variable}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any" />
        <link rel="shortcut icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <meta name="apple-mobile-web-app-title" content="Aprendendo com Amor" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="font-sans antialiased bg-slate-50 text-slate-900 min-h-screen selection:bg-orange-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
