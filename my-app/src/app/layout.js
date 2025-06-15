'use client';
import "./globals.css";
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css'; // ✅ THIS IS CRITICAL

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
