import resend from '../../src/lib/resend.js';

console.log('📧 CHECKING - Estado de emails de Resend');
console.log('========================================\n');

async function checkEmailStatus() {
  try {
    console.log('1️⃣ Verificando configuración de Resend...');
    console.log('📊 API Key configurada:', !!process.env.RESEND_API_KEY);
    console.log('📊 Instancia de resend:', typeof resend);
    
    if (!resend || !resend.emails) {
      console.log('❌ Resend no está configurado correctamente');
      return;
    }
    
    console.log('✅ Resend configurado correctamente\n');
    
    console.log('2️⃣ Verificando emails recientes...');
    
    // Obtener emails recientes (últimos 10)
    const emails = await resend.emails.list({
      limit: 10
    });
    
    console.log(`📊 Emails encontrados: ${emails.data.length}`);
    
    if (emails.data.length === 0) {
      console.log('ℹ️ No hay emails recientes para verificar');
      return;
    }
    
    console.log('\n3️⃣ Estado de emails recientes:');
    console.log('--------------------------------');
    
    emails.data.forEach((email, index) => {
      console.log(`\n📧 Email ${index + 1}:`);
      console.log(`   ID: ${email.id}`);
      console.log(`   Para: ${email.to}`);
      console.log(`   Asunto: ${email.subject}`);
      console.log(`   Estado: ${email.lastEvent}`);
      console.log(`   Creado: ${email.createdAt}`);
      console.log(`   Enviado: ${email.sentAt || 'No enviado'}`);
      
      if (email.lastEvent === 'delivered') {
        console.log('   ✅ Entregado exitosamente');
      } else if (email.lastEvent === 'bounced') {
        console.log('   ❌ Rebotó');
      } else if (email.lastEvent === 'failed') {
        console.log('   ❌ Falló');
      } else if (email.lastEvent === 'sent') {
        console.log('   📤 Enviado (pendiente de entrega)');
      } else {
        console.log('   ⚠️ Estado desconocido');
      }
    });
    
    console.log('\n4️⃣ Verificando dominio...');
    
    try {
      const domains = await resend.domains.list();
      console.log(`📊 Dominios configurados: ${domains.data.length}`);
      
      domains.data.forEach(domain => {
        console.log(`   🌐 ${domain.name} - Estado: ${domain.status}`);
        if (domain.status === 'valid') {
          console.log('      ✅ Dominio válido');
        } else {
          console.log('      ⚠️ Dominio no válido');
        }
      });
    } catch (domainError) {
      console.log('❌ Error obteniendo dominios:', domainError.message);
    }
    
    console.log('\n5️⃣ Verificando logs de actividad...');
    
    try {
      const logs = await resend.emails.list({
        limit: 5,
        status: 'failed'
      });
      
      if (logs.data.length > 0) {
        console.log(`📊 Emails fallidos recientes: ${logs.data.length}`);
        logs.data.forEach(email => {
          console.log(`   ❌ ${email.to} - ${email.lastEvent} - ${email.createdAt}`);
        });
      } else {
        console.log('✅ No hay emails fallidos recientes');
      }
    } catch (logsError) {
      console.log('❌ Error obteniendo logs:', logsError.message);
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    process.exit(0);
  }
}

checkEmailStatus();

