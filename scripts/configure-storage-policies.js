const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuración de Supabase con service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function configureStoragePolicies() {
  console.log('🔧 Configurando políticas de Storage...\n');
  
  try {
    // 1. Configurar bucket 'imagenes' como público
    console.log('🖼️  Configurando bucket "imagenes"...');
    
    // Hacer el bucket público
    const { error: bucketError } = await supabase.storage
      .updateBucket('imagenes', { public: true });
    
    if (bucketError) {
      console.log(`  ⚠️  Error actualizando bucket: ${bucketError.message}`);
    } else {
      console.log('  ✅ Bucket "imagenes" configurado como público');
    }
    
    // 2. Configurar bucket 'avatares' como público
    console.log('\n👤 Configurando bucket "avatares"...');
    
    const { error: avataresError } = await supabase.storage
      .updateBucket('avatares', { public: true });
    
    if (avataresError) {
      console.log(`  ⚠️  Error actualizando bucket: ${avataresError.message}`);
    } else {
      console.log('  ✅ Bucket "avatares" configurado como público');
    }
    
    // 3. Configurar bucket 'archivos' como privado
    console.log('\n📁 Configurando bucket "archivos"...');
    
    const { error: archivosError } = await supabase.storage
      .updateBucket('archivos', { public: false });
    
    if (archivosError) {
      console.log(`  ⚠️  Error actualizando bucket: ${archivosError.message}`);
    } else {
      console.log('  ✅ Bucket "archivos" configurado como privado');
    }
    
    // 4. Configurar bucket 'documentos' como privado
    console.log('\n📄 Configurando bucket "documentos"...');
    
    const { error: documentosError } = await supabase.storage
      .updateBucket('documentos', { public: false });
    
    if (documentosError) {
      console.log(`  ⚠️  Error actualizando bucket: ${documentosError.message}`);
    } else {
      console.log('  ✅ Bucket "documentos" configurado como privado');
    }
    
    console.log('\n🎉 Configuración de buckets completada!');
    console.log('\n📝 Notas importantes:');
    console.log('- Los buckets públicos permiten subida sin autenticación');
    console.log('- Los buckets privados requieren autenticación');
    console.log('- Las políticas RLS se pueden ajustar desde el Dashboard');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

async function testPublicUpload() {
  console.log('\n🧪 Probando subida a bucket público...\n');
  
  try {
    // Crear un archivo de prueba simple
    const testContent = 'Archivo de prueba - ' + new Date().toISOString();
    const fileName = `test-${Date.now()}.txt`;
    
    console.log(`🔄 Subiendo archivo: ${fileName}`);
    
    const { data, error } = await supabase.storage
      .from('imagenes')
      .upload(fileName, testContent, {
        contentType: 'text/plain',
        upsert: true
      });
    
    if (error) {
      console.error('❌ Error subiendo archivo:', error.message);
    } else {
      console.log('✅ Archivo subido exitosamente');
      console.log('📁 Path:', data.path);
      
      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('imagenes')
        .getPublicUrl(data.path);
      
      console.log('🔗 URL pública:', urlData.publicUrl);
      
      // Listar archivos
      const { data: files } = await supabase.storage
        .from('imagenes')
        .list();
      
      console.log(`📋 Total de archivos en "imagenes": ${files?.length || 0}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'test':
      await testPublicUpload();
      break;
    case 'configure':
    default:
      await configureStoragePolicies();
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
} 