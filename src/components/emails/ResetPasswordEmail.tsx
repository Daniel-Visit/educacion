import React from 'react';
import BaseEmail from './BaseEmail';

interface ResetPasswordEmailProps {
  userFirstname?: string;
  resetUrl: string;
}

export const ResetPasswordEmail = ({
  userFirstname = 'Usuario',
  resetUrl,
}: ResetPasswordEmailProps) => {
  return (
    <BaseEmail
      preview="Recupera tu contraseña - Plataforma Educativa"
      title="Recupera tu contraseña"
      greeting={`Hola ${userFirstname},`}
      mainMessage={
        <>
          Has solicitado restablecer tu contraseña en la{' '}
          <strong>Plataforma Educativa</strong>. Haz clic en el botón de abajo
          para crear una nueva contraseña segura.
        </>
      }
      buttonText="Restablecer Contraseña"
      buttonUrl={resetUrl}
      footerMessage="Este enlace expirará en 1 hora por seguridad. Si no solicitaste restablecer tu contraseña, puedes ignorar este email de forma segura."
    />
  );
};

export default ResetPasswordEmail;
