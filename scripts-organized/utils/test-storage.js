const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas');
  console.log('Necesitas configurar en .env:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.log(
    '\n💡 Ve a Supabase Dashboard > Settings > API para obtener las keys'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testStorage() {
  console.log('🧪 Probando Supabase Storage...\n');

  try {
    // 1. Crear un archivo de prueba
    const testContent = 'Este es un archivo de prueba para Supabase Storage';
    const testFilePath = path.join(__dirname, 'test-file.txt');

    fs.writeFileSync(testFilePath, testContent);
    console.log('✅ Archivo de prueba creado');

    // 2. Leer el archivo como buffer
    const fileBuffer = fs.readFileSync(testFilePath);
    const fileName = `test-${Date.now()}.txt`;

    console.log(`🔄 Subiendo archivo: ${fileName}`);

    // 3. Subir a Supabase Storage
    const { data, error } = await supabase.storage
      .from('archivos')
      .upload(fileName, fileBuffer, {
        contentType: 'text/plain',
        upsert: true,
      });

    if (error) {
      console.error('❌ Error subiendo archivo:', error.message);

      // Si el bucket no existe, intentar crearlo
      if (
        error.message.includes('bucket') &&
        error.message.includes('not found')
      ) {
        console.log('\n🔄 Intentando crear bucket "archivos"...');
        const { error: bucketError } = await supabase.storage.createBucket(
          'archivos',
          {
            public: false,
          }
        );

        if (bucketError) {
          console.error('❌ Error creando bucket:', bucketError.message);
        } else {
          console.log(
            '✅ Bucket "archivos" creado, intentando subir nuevamente...'
          );

          const { data: retryData, error: retryError } = await supabase.storage
            .from('archivos')
            .upload(fileName, fileBuffer, {
              contentType: 'text/plain',
              upsert: true,
            });

          if (retryError) {
            console.error('❌ Error en segundo intento:', retryError.message);
          } else {
            console.log('✅ Archivo subido exitosamente en segundo intento');
            console.log('📁 Path:', retryData.path);
          }
        }
      }
    } else {
      console.log('✅ Archivo subido exitosamente');
      console.log('📁 Path:', data.path);

      // 4. Obtener URL del archivo
      const { data: urlData } = supabase.storage
        .from('archivos')
        .getPublicUrl(data.path);

      console.log('🔗 URL pública:', urlData.publicUrl);

      // 5. Listar archivos en el bucket
      console.log('\n📋 Listando archivos en bucket "archivos"...');
      const { data: files, error: listError } = await supabase.storage
        .from('archivos')
        .list();

      if (listError) {
        console.error('❌ Error listando archivos:', listError.message);
      } else {
        console.log('📁 Archivos encontrados:');
        files.forEach(file => {
          console.log(
            `  - ${file.name} (${file.metadata?.size || 'N/A'} bytes)`
          );
        });
      }
    }

    // 6. Limpiar archivo de prueba local
    fs.unlinkSync(testFilePath);
    console.log('\n🧹 Archivo de prueba local eliminado');
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

async function listBuckets() {
  console.log('📋 Listando buckets disponibles...\n');

  try {
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error('❌ Error listando buckets:', error.message);
      return;
    }

    if (data.length === 0) {
      console.log('📭 No hay buckets creados');
    } else {
      console.log('📦 Buckets encontrados:');
      data.forEach(bucket => {
        console.log(
          `  - ${bucket.name} (${bucket.public ? 'público' : 'privado'})`
        );
      });
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'list':
      await listBuckets();
      break;
    case 'test':
    default:
      await testStorage();
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testStorage, listBuckets };
