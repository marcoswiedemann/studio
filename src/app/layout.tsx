import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/auth-context';
import { AppointmentProvider } from '@/contexts/appointment-context';
import { SettingsProvider } from '@/contexts/settings-context'; // Import SettingsProvider

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AgendaGov',
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
            <SettingsProvider> {/* Wrap with SettingsProvider */}
              {children}
              <Toaster />
            </SettingsProvider>
          </AppointmentProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
