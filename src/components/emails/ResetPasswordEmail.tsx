import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Img,
} from '@react-email/components';
import * as React from 'react';

interface ResetPasswordEmailProps {
  userFirstname?: string;
  resetUrl: string;
}

export const ResetPasswordEmail = ({
  userFirstname = 'Usuario',
  resetUrl,
}: ResetPasswordEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Recupera tu contraseña - Plataforma Educativa</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={content}>
            {/* Logo centrado */}
            <div style={logoContainer}>
              <Img
                src="https://pchttmjsbxqaedszjaje.supabase.co/storage/v1/object/public/imagenes/logo-email.png?v=3"
                width="128"
                height="128"
                alt="Logo"
                style={logo}
              />
            </div>

            <Heading style={h1}>Recupera tu contraseña</Heading>
            
            <Text style={text}>Hola {userFirstname},</Text>
            
            <Text style={text}>
              Has solicitado restablecer tu contraseña en la Plataforma Educativa. Haz clic en el botón de abajo para crear una nueva contraseña segura.
            </Text>
            
            <Section style={buttonContainer}>
              <Button style={button} href={resetUrl}>
                Restablecer Contraseña
              </Button>
            </Section>
            
            <Text style={text}>
              Este enlace expirará en 1 hora por seguridad. Si no solicitaste restablecer tu contraseña, puedes ignorar este email de forma segura.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ResetPasswordEmail;

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  margin: 0,
  padding: 0,
};

const container = {
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '600px',
};

const logoContainer = {
  textAlign: 'center' as const,
  marginBottom: '40px',
};

const logo = {
  borderRadius: '16px',
  display: 'block',
  backgroundColor: '#ffffff',
  maxWidth: '128px',
  maxHeight: '128px',
  width: '128px',
  height: '128px',
};

const content = {
  padding: '0 20px',
};

const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '40px 0 20px 0',
  textAlign: 'left' as const,
};

const text = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#374151',
  margin: '16px 0',
};

const buttonContainer = {
  margin: '32px auto',
  textAlign: 'center' as const,
};

const button = {
  lineHeight: '100%',
  textDecoration: 'none',
  display: 'inline-block',
  maxWidth: '100%',
  background: 'linear-gradient(90deg, #6366f1 0%, #9333ea 100%)',
  borderRadius: '10px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textAlign: 'center' as const,
  padding: '12px 24px',
  border: 'none',
};

const warningText = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#dc2626',
  margin: '16px 0',
  padding: '12px',
  backgroundColor: '#fef2f2',
  borderRadius: '6px',
  border: '1px solid #fecaca',
};

const footer = {
  marginTop: '40px',
  padding: '20px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#6b7280',
  margin: '8px 0',
}; 