import React from 'react';
import BaseEmail from './BaseEmail';

interface InvitationEmailProps {
  userEmail: string;
  roleName: string;
  invitationUrl: string;
}

export const InvitationEmail = ({
  userEmail,
  roleName,
  invitationUrl,
}: InvitationEmailProps) => {
  return (
    <BaseEmail
      preview="Invitación a la Plataforma Educativa"
      title="¡Has sido invitado!"
      greeting="Hola,"
      mainMessage={
        <>
          Has sido invitado a unirte a la <strong>Plataforma Educativa</strong>{' '}
          con el rol de <strong>{roleName}</strong>.
          <br />
          <br />
          Para completar tu registro y acceder a la plataforma, haz clic en el
          botón de abajo.
        </>
      }
      buttonText="Completar Registro"
      buttonUrl={invitationUrl}
      footerMessage="Este enlace expirará en 72 horas por seguridad. Si no solicitaste esta invitación, puedes ignorar este email de forma segura."
      additionalInfo={
        <>
          <strong>Email invitado:</strong> {userEmail}
        </>
      }
    />
  );
};

export default InvitationEmail;
