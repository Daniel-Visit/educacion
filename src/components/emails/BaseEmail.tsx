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

interface BaseEmailProps {
  preview: string;
  title: string;
  greeting?: string;
  mainMessage: React.ReactNode;
  buttonText: string;
  buttonUrl: string;
  footerMessage: string;
  additionalInfo?: React.ReactNode;
}

export const BaseEmail = ({
  preview,
  title,
  greeting = 'Hola,',
  mainMessage,
  buttonText,
  buttonUrl,
  footerMessage,
  additionalInfo,
}: BaseEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
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

            <Heading style={h1}>{title}</Heading>

            <Text style={text}>{greeting}</Text>

            <Text style={text}>{mainMessage}</Text>

            <Section style={buttonContainer}>
              <Button style={button} href={buttonUrl}>
                {buttonText}
              </Button>
            </Section>

            <Text style={text}>{footerMessage}</Text>

            {additionalInfo && <Text style={text}>{additionalInfo}</Text>}
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default BaseEmail;

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
