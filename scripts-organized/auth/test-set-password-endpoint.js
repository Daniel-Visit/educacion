// Script para probar el endpoint de set-password
// Esto nos dirá exactamente qué error está causando el 500

async function testSetPasswordEndpoint() {
  console.log('🧪 TESTING - Endpoint set-password');
  console.log('====================================\n');

  try {
    // Simular una llamada al endpoint
    const response = await fetch('http://localhost:3000/api/auth/set-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: 'test-token-123',
        password: 'TestPassword123'
      })
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Response data:', data);
    } else {
      const errorData = await response.json();
      console.log('❌ Error response:', errorData);
    }

  } catch (error) {
    console.error('❌ Fetch error:', error.message);
    
    // Si es un error de conexión, el servidor no está corriendo
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 El servidor no está corriendo en localhost:3000');
      console.log('💡 Ejecuta: npm run dev');
    }
  }
}

// Ejecutar test
testSetPasswordEndpoint();
