const { redis } = require('../../src/lib/redis');
const { isTokenRevoked, getSession } = require('../../src/lib/auth-redis');

async function verifyTokenRevocation() {
  try {
    console.log('🔍 VERIFICANDO REVOCACIÓN DE TOKEN\n');
    
    // Pedir JTI del token a verificar
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('🔑 Ingresa el JTI del token a verificar: ', async (jti) => {
      try {
        console.log(`\n🔍 Verificando token: ${jti}\n`);
        
        // 1. Verificar si está en la denylist
        const isRevoked = await isTokenRevoked(jti);
        console.log(`1️⃣ ¿Token revocado? ${isRevoked ? '✅ SÍ' : '❌ NO'}`);
        
        // 2. Verificar si existe en Redis
        const revokedStatus = await redis.get(`revoked:${jti}`);
        console.log(`2️⃣ Estado en Redis: ${revokedStatus || 'null'}`);
        
        // 3. Verificar si la sesión existe
        const session = await getSession(jti);
        console.log(`3️⃣ ¿Sesión existe? ${session ? '✅ SÍ' : '❌ NO'}`);
        
        if (session) {
          console.log(`   - userId: ${session.userId}`);
          console.log(`   - email: ${session.email}`);
          console.log(`   - role: ${session.role}`);
        }
        
        // 4. Verificar TTL del token revocado
        if (revokedStatus) {
          const ttl = await redis.ttl(`revoked:${jti}`);
          console.log(`4️⃣ TTL del token revocado: ${ttl} segundos`);
        }
        
        console.log('\n🎯 RESUMEN:');
        if (isRevoked) {
          console.log('✅ Token REVOCADO correctamente');
        } else {
          console.log('❌ Token NO está revocado');
        }
        
      } catch (error) {
        console.error('❌ Error verificando token:', error);
      } finally {
        rl.close();
      }
    });
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

verifyTokenRevocation();
