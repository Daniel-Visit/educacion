'use client';
import AppShell from '@/components/ui/AppShell';
import UnsupportedDevice from '@/components/ui/UnsupportedDevice';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <UnsupportedDevice />
      <AppShell>{children}</AppShell>
    </>
  );
}
