// Script para verificar qué OAs existen en la base de datos
async function verificarOAs() {
  try {
    console.log('=== VERIFICANDO OAs EN LA BASE DE DATOS ===');
    
    // 1. Obtener todos los OAs
    console.log('\n1. Obteniendo todos los OAs...');
    const oasResponse = await fetch('http://localhost:3000/api/ejes');
    const ejes = await oasResponse.json();
    
    console.log('Ejes obtenidos:', ejes.length);
    
    // 2. Mostrar todos los OAs con sus IDs
    console.log('\n2. OAs disponibles:');
    ejes.forEach((eje, ejeIndex) => {
      console.log(`\nEje ${ejeIndex + 1}: ${eje.descripcion}`);
      eje.oas.forEach((oa, oaIndex) => {
        console.log(`  ${oaIndex + 1}. ID: ${oa.id} | ${oa.oas_id} | ${oa.descripcion_oas.substring(0, 50)}...`);
      });
    });
    
    // 3. Verificar OAs de Lenguaje específicamente
    console.log('\n3. OAs de Lenguaje (asignatura_id: 7):');
    const oasLenguaje = ejes.flatMap(eje => eje.oas).filter(oa => oa.asignatura_id === 7);
    oasLenguaje.forEach((oa, index) => {
      console.log(`  ${index + 1}. ID: ${oa.id} | ${oa.oas_id} | ${oa.descripcion_oas.substring(0, 50)}...`);
    });
    
    // 4. Verificar OAs de Matemática específicamente
    console.log('\n4. OAs de Matemática (asignatura_id: 9):');
    const oasMatematica = ejes.flatMap(eje => eje.oas).filter(oa => oa.asignatura_id === 9);
    oasMatematica.forEach((oa, index) => {
      console.log(`  ${index + 1}. ID: ${oa.id} | ${oa.oas_id} | ${oa.descripcion_oas.substring(0, 50)}...`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

verificarOAs(); 