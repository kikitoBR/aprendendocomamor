import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'Escola Aprendendo com Amor • Sistema de Gestão Escolar & Secretaria',
  description: 'Sistema completo de gestão escolar, matrículas com fichas oficiais timbradas, controle de mensalidades com PIX/recibos e diário de classe da Educação Infantil e Fundamental.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={outfit.variable}>
      <body className="font-sans antialiased bg-slate-50 text-slate-900 min-h-screen selection:bg-orange-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
