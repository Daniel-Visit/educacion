import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../../auth';
import { db } from '@/lib/db';
import resend from '@/lib/resend';
import { InvitationEmail } from '@/components/emails/InvitationEmail';
import { render } from '@react-email/components';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 INVITE - Endpoint llamado');
    console.log('🚀 INVITE - Instancia de resend importada:', typeof resend);
    console.log(
      '🚀 INVITE - RESEND_API_KEY configurada:',
      !!process.env.RESEND_API_KEY
    );

    // Verificar autenticación
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Resolver usuario real desde BD y validar rol admin
    const currentUser = await db.user.findFirst({
      where: {
        OR: [
          ...(session.user.id ? [{ id: session.user.id }] : []),
          ...(session.user.email ? [{ email: session.user.email }] : []),
        ],
      },
      select: { id: true, email: true, role: true },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    const { emails, roleId } = await request.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: 'Emails requeridos' }, { status: 400 });
    }

    if (!roleId) {
      return NextResponse.json({ error: 'Rol requerido' }, { status: 400 });
    }

    // Verificar que el rol existe
    const role = await db.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return NextResponse.json({ error: 'Rol no válido' }, { status: 400 });
    }

    let invitedCount = 0;
    const errors: string[] = [];

    // Procesar todos los emails con delay para respetar rate limits de Resend
    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];

      // Agregar delay de 1 segundo entre emails (excepto el primero)
      if (i > 0) {
        console.log(
          `📧 INVITE - Esperando 1 segundo antes de enviar email ${i + 1}/${emails.length}...`
        );
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log(
        `📧 INVITE - Procesando email ${i + 1}/${emails.length}: ${email}`
      );

      try {
        // Verificar si el usuario ya existe
        let user = await db.user.findUnique({
          where: { email: email.trim() },
        });

        // Use transaction to ensure user + token are created atomically
        const token = crypto.randomUUID();
        const expires = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 horas

        await db.transaction(async tx => {
          if (user) {
            // Si el usuario existe, actualizar su rol y forzar cambio de contraseña
            await tx.user.update({
              where: { id: user.id },
              data: {
                role: role.slug,
                forcePasswordChange: true,
              },
            });
          } else {
            // Crear nuevo usuario
            user = await tx.user.create({
              data: {
                email: email.trim(),
                role: role.slug,
                password: null, // Sin contraseña inicial
                forcePasswordChange: true, // Forzar cambio de contraseña
              },
            });
          }

          // Crear token de verificación (reutilizando tu sistema existente)
          await tx.verificationToken.create({
            data: {
              identifier: email.trim(),
              token,
              expires,
            },
          });
        });

        // Enviar email de invitación
        const invitationUrl = `${process.env.NEXTAUTH_URL}/auth/set-password?token=${token}`;

        console.log('📧 INVITE - Intentando enviar email a:', email.trim());
        console.log('📧 INVITE - URL de invitación:', invitationUrl);
        console.log('📧 INVITE - Rol:', role.name);
        console.log('📧 INVITE - Instancia de resend:', typeof resend);
        console.log(
          '📧 INVITE - Método emails.send disponible:',
          typeof resend.emails?.send
        );

        try {
          console.log('📧 INVITE - Llamando a resend.emails.send...');

          // Renderizar el componente React Email
          const emailHtml = await render(
            InvitationEmail({
              userEmail: email.trim(),
              roleName: role.name,
              invitationUrl: invitationUrl,
            })
          );

          const result = await resend.emails.send({
            from: 'welcome@notifications.goodly.cl',
            to: [email.trim()],
            subject: 'Invitación a la plataforma educativa',
            html: emailHtml,
            replyTo: 'welcome@notifications.goodly.cl',
          });

          console.log('✅ INVITE - Email enviado exitosamente:', result);
        } catch (resendError) {
          console.error('❌ INVITE - Error enviando email:', resendError);
          throw resendError;
        }

        invitedCount++;
      } catch (error) {
        console.error(`Error al invitar ${email}:`, error);
        errors.push(
          `Error con ${email}: ${error instanceof Error ? error.message : 'Error desconocido'}`
        );
      }
    }

    console.log(
      `✅ INVITE - Proceso completado. Invitaciones exitosas: ${invitedCount}/${emails.length}, Errores: ${errors.length}`
    );

    return NextResponse.json({
      message: `Se procesaron ${emails.length} invitaciones`,
      invitedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error al invitar usuarios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
