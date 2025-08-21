const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSimpleUpload() {
  console.log('🧪 Probando subida simple a Supabase Storage...\n');

  try {
    // 1. Crear un archivo de prueba
    const testContent =
      'Este es un archivo de prueba para Supabase Storage - ' +
      new Date().toISOString();
    const testFilePath = path.join(__dirname, 'test-simple.txt');

    fs.writeFileSync(testFilePath, testContent);
    console.log('✅ Archivo de prueba creado');

    // 2. Leer el archivo como buffer
    const fileBuffer = fs.readFileSync(testFilePath);
    const fileName = `test-simple-${Date.now()}.txt`;

    console.log(`🔄 Intentando subir archivo: ${fileName}`);

    // 3. Intentar subir a diferentes buckets
    const buckets = ['archivos', 'imagenes', 'documentos', 'avatares'];

    for (const bucketName of buckets) {
      console.log(`\n📦 Probando bucket: ${bucketName}`);

      try {
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(fileName, fileBuffer, {
            contentType: 'text/plain',
            upsert: true,
          });

        if (error) {
          console.log(`  ❌ Error: ${error.message}`);

          // Si el bucket no existe, intentar con otro
          if (error.message.includes('not found')) {
            console.log(
              `  ⚠️  Bucket "${bucketName}" no existe, probando siguiente...`
            );
            continue;
          }
        } else {
          console.log(`  ✅ Archivo subido exitosamente a ${bucketName}`);
          console.log(`  📁 Path: ${data.path}`);

          // Obtener URL
          const { data: urlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(data.path);

          console.log(`  🔗 URL: ${urlData.publicUrl}`);

          // Listar archivos en este bucket
          const { data: files } = await supabase.storage
            .from(bucketName)
            .list();

          console.log(`  📋 Archivos en ${bucketName}: ${files?.length || 0}`);

          break; // Si funcionó, salir del loop
        }
      } catch (bucketError) {
        console.log(
          `  ❌ Error con bucket ${bucketName}: ${bucketError.message}`
        );
      }
    }

    // 4. Limpiar archivo local
    fs.unlinkSync(testFilePath);
    console.log('\n🧹 Archivo de prueba local eliminado');
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

async function listExistingBuckets() {
  console.log('📋 Verificando buckets existentes...\n');

  const buckets = ['archivos', 'imagenes', 'documentos', 'avatares'];

  for (const bucketName of buckets) {
    try {
      const { data, error } = await supabase.storage.from(bucketName).list();

      if (error) {
        if (error.message.includes('not found')) {
          console.log(`❌ Bucket "${bucketName}" no existe`);
        } else {
          console.log(`⚠️  Error con bucket "${bucketName}": ${error.message}`);
        }
      } else {
        console.log(
          `✅ Bucket "${bucketName}" existe con ${data.length} archivos`
        );
      }
    } catch (err) {
      console.log(`❌ Error verificando "${bucketName}": ${err.message}`);
    }
  }
}

async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'list':
      await listExistingBuckets();
      break;
    case 'test':
    default:
      await testSimpleUpload();
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
}
