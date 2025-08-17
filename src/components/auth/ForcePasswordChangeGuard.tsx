'use client';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function ForcePasswordChangeGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  console.log('🚀 ForcePasswordChangeGuard - Componente cargado');
  console.log('🚀 ForcePasswordChangeGuard - Status:', status);
  console.log('🚀 ForcePasswordChangeGuard - Pathname:', pathname);

  useEffect(() => {
    console.log('🔄 ForcePasswordChangeGuard - useEffect ejecutado');
    console.log('🔄 ForcePasswordChangeGuard - Status en useEffect:', status);
    console.log('🔄 ForcePasswordChangeGuard - Session en useEffect:', session);

    // Solo verificar si la sesión está cargada y el usuario está autenticado
    if (status === 'loading') {
      console.log('⏳ ForcePasswordChangeGuard - Status loading, esperando...');
      return;
    }

    if (status === 'unauthenticated') {
      console.log('❌ ForcePasswordChangeGuard - Usuario no autenticado');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      // Verificar si forcePasswordChange es true
      const forcePasswordChange = session.user.forcePasswordChange;

      console.log('🔍 ForcePasswordChangeGuard - Session:', session.user);
      console.log(
        '🔍 ForcePasswordChangeGuard - forcePasswordChange:',
        forcePasswordChange
      );

      if (forcePasswordChange === true) {
        // Solo redirigir si NO estamos ya en la página de change-password
        if (pathname !== '/auth/change-password') {
          console.log(
            '🔒 ForcePasswordChangeGuard: Redirigiendo a change-password'
          );
          router.push('/auth/change-password');
        }
      }
    }
  }, [session, status, router, pathname]);

  // Mostrar loading mientras verifica
  if (status === 'loading') {
    return <div>Cargando...</div>;
  }

  return <>{children}</>;
}
