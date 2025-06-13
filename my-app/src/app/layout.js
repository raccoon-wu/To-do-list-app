'use client';
import "./globals.css";
import { MantineProvider } from '@mantine/core';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <MantineProvider withGlobalStyles withNormalizeCSS>
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
