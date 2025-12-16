import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import localFont from 'next/font/local';
import { ThemeProvider } from '@/app/components/ThemeProvider';

import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900'
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900'
});

export const metadata: Metadata = {
  title: 'private-component-codegen',
  description: '基于私有组件的生成业务组件代码的 AI RAG 应用'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <AntdRegistry>
        <ThemeProvider isDarkMode>
          <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            {children}
          </body>
        </ThemeProvider>
      </AntdRegistry>
    </html>
  );
}
