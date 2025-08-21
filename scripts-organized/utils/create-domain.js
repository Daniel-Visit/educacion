require('dotenv').config();
const { Resend } = require('resend');

// Configurar Resend con tu API key
const resend = new Resend(process.env.RESEND_API_KEY);

async function createAndVerifyDomain() {
  try {
    console.log('🔍 Creando dominio goodly.cl...');
    
    // Crear el dominio raíz
    const newDomain = await resend.domains.create({ 
      name: 'goodly.cl',
      region: 'us-east-1' // Misma región que notifications.goodly.cl
    });
    
    console.log('✅ Dominio creado:', newDomain);
    
    // Obtener los registros DNS necesarios
    console.log('📋 Registros DNS necesarios para goodly.cl:');
    console.log('   - SPF: v=spf1 include:amazonses.com ~all');
    console.log('   - DKIM: Se generará automáticamente');
    console.log('   - MX: feedback-smtp.us-east-1.amazonses.com (prioridad 10)');
    
    // Listar todos los dominios para confirmar
    const domains = await resend.domains.list();
    console.log('📋 Dominios actuales:', domains);
    
    console.log('\n🚀 Pasos siguientes:');
    console.log('1. Agrega los registros DNS en tu proveedor DNS');
    console.log('2. Espera unos minutos para que se propaguen');
    console.log('3. Ejecuta: node scripts/verify-domain.js');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Ejecutar el script
createAndVerifyDomain();
