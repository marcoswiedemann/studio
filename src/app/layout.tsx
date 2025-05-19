
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/auth-context';
import { AppointmentProvider } from '@/contexts/appointment-context';
import { SettingsProvider } from '@/contexts/settings-context'; 
import { DEFAULT_THEME_SETTINGS } from '@/lib/constants'; // Import default settings

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Static metadata as a fallback
export const metadata: Metadata = {
  title: DEFAULT_THEME_SETTINGS.appName, // Use default app name as fallback
  description: 'Sistema de Agendamento com Níveis de Acesso',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <AppointmentProvider>
            <SettingsProvider> 
              {children}
              <Toaster />
            </SettingsProvider>
          </AppointmentProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
