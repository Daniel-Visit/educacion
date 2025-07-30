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

async function createTestBucket() {
  console.log('🧪 Creando bucket de prueba sin restricciones...\n');
  
  try {
    // Crear bucket de prueba
    const { data, error } = await supabase.storage.createBucket('test-uploads', {
      public: true,
      allowedMimeTypes: null, // Permitir cualquier tipo de archivo
      fileSizeLimit: 52428800 // 50MB
    });
    
    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Bucket "test-uploads" ya existe');
      } else {
        console.error('❌ Error creando bucket:', error.message);
        return;
      }
    } else {
      console.log('✅ Bucket "test-uploads" creado exitosamente');
    }
    
    // Probar subida de archivo
    console.log('\n🔄 Probando subida de archivo...');
    
    const testContent = 'Archivo de prueba - ' + new Date().toISOString();
    const fileName = `test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('test-uploads')
      .upload(fileName, testContent, {
        contentType: 'text/plain',
        upsert: true
      });
    
    if (uploadError) {
      console.error('❌ Error subiendo archivo:', uploadError.message);
    } else {
      console.log('✅ Archivo subido exitosamente');
      console.log('📁 Path:', uploadData.path);
      
      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('test-uploads')
        .getPublicUrl(uploadData.path);
      
      console.log('🔗 URL pública:', urlData.publicUrl);
      
      // Listar archivos
      const { data: files } = await supabase.storage
        .from('test-uploads')
        .list();
      
      console.log(`📋 Total de archivos en "test-uploads": ${files?.length || 0}`);
      
      if (files && files.length > 0) {
        console.log('📁 Archivos:');
        files.forEach(file => {
          console.log(`  - ${file.name} (${file.metadata?.size || 'N/A'} bytes)`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

async function main() {
  await createTestBucket();
}

if (require.main === module) {
  main().catch(console.error);
} 