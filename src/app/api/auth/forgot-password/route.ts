import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import resend from '@/lib/resend';
import crypto from 'crypto';
import { render } from '@react-email/render';
import ResetPasswordEmail from '@/components/emails/ResetPasswordEmail';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 FORGOT PASSWORD - Endpoint llamado');
    const { email } = await request.json();
    console.log('📧 FORGOT PASSWORD - Email recibido:', email);

    if (!email) {
      console.log('❌ FORGOT PASSWORD - No hay email');
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    console.log('🔍 FORGOT PASSWORD - Buscando usuario en BD:', email);
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('❌ FORGOT PASSWORD - Usuario no encontrado');
      // Por seguridad, no revelar si el usuario existe o no
      return NextResponse.json(
        { message: 'Si el email existe, recibirás un enlace de recuperación' },
        { status: 200 }
      );
    }

    console.log('✅ FORGOT PASSWORD - Usuario encontrado:', user.email);

    // Generar token único
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    console.log(
      '🔑 FORGOT PASSWORD - Token generado:',
      token.substring(0, 10) + '...'
    );

    // Eliminar tokens anteriores del usuario
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    // Crear nuevo token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    console.log('💾 FORGOT PASSWORD - Token guardado en BD');

    // URL de reset
    const resetUrl = `${process.env.AUTH_URL || process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
    console.log('🔗 FORGOT PASSWORD - URL de reset:', resetUrl);

    console.log('📧 FORGOT PASSWORD - Intentando renderizar template...');

    // Renderizar email usando el template React Email
    let emailHtml;
    try {
      emailHtml = await render(
        ResetPasswordEmail({
          userFirstname: user.name || 'Usuario',
          resetUrl,
        })
      );
      console.log('📧 FORGOT PASSWORD - Tipo de emailHtml:', typeof emailHtml);
      console.log(
        '📧 FORGOT PASSWORD - HTML generado:',
        String(emailHtml).substring(0, 200) + '...'
      );
    } catch (renderError) {
      console.error(
        '❌ FORGOT PASSWORD - Error renderizando template:',
        renderError
      );
      throw renderError;
    }

    console.log('📧 FORGOT PASSWORD - Enviando email con Resend...');
    console.log('📧 FORGOT PASSWORD - From:', 'onboarding@resend.dev');
    console.log('📧 FORGOT PASSWORD - To:', email);
    console.log('📧 FORGOT PASSWORD - Subject:', 'Recupera tu contraseña');

    // Enviar email usando Resend
    try {
      const result = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        subject: 'Recupera tu contraseña',
        html: emailHtml,
      });

      console.log('✅ FORGOT PASSWORD - Resultado de Resend:', result);
      console.log('✅ FORGOT PASSWORD - Email enviado exitosamente');
    } catch (resendError) {
      console.error('❌ FORGOT PASSWORD - Error enviando email:', resendError);
      throw resendError;
    }

    return NextResponse.json(
      { message: 'Email de recuperación enviado' },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ FORGOT PASSWORD - Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
