require('dotenv').config();
const { Resend } = require('resend');

// Configurar Resend con tu API key
const resend = new Resend(process.env.RESEND_API_KEY);

async function verifyDomain() {
  try {
    console.log('🔍 Verificando dominio goodly.cl...');
    
    // Listar dominios para encontrar goodly.cl
    const domains = await resend.domains.list();
    const goodlyDomain = domains.data?.find(d => d.name === 'goodly.cl');
    
    if (!goodlyDomain) {
      console.log('❌ Dominio goodly.cl no encontrado. Ejecuta primero: node scripts/create-domain.js');
      return;
    }
    
    console.log('📋 Dominio encontrado:', goodlyDomain);
    
    // Verificar el dominio
    console.log('🔍 Iniciando verificación...');
    const verifiedDomain = await resend.domains.verify(goodlyDomain.id);
    
    console.log('✅ Dominio verificado:', verifiedDomain);
    
    // Verificar estado final
    const finalCheck = await resend.domains.get(goodlyDomain.id);
    console.log('📋 Estado final del dominio:', finalCheck);
    
    if (finalCheck.data?.status === 'verified') {
      console.log('🎉 ¡Dominio goodly.cl verificado exitosamente!');
      console.log('🚀 Ahora puedes probar enviar emails desde notifications@goodly.cl');
    } else {
      console.log('⏳ Dominio aún en proceso de verificación. Espera unos minutos más.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Ejecutar el script
verifyDomain();
