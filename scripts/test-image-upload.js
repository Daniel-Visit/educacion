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

async function createTestImage() {
  // Crear una imagen SVG simple como archivo de prueba
  const svgContent = `
<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="#3b82f6"/>
  <circle cx="50" cy="50" r="30" fill="#ffffff"/>
  <text x="50" y="55" text-anchor="middle" fill="#3b82f6" font-family="Arial" font-size="12">TEST</text>
</svg>`;
  
  const testImagePath = path.join(__dirname, 'test-image.svg');
  fs.writeFileSync(testImagePath, svgContent);
  return testImagePath;
}

async function testImageUpload() {
  console.log('🖼️  Probando subida de imagen a Supabase Storage...\n');
  
  try {
    // 1. Crear imagen de prueba
    const testImagePath = await createTestImage();
    console.log('✅ Imagen de prueba creada (SVG)');
    
    // 2. Leer la imagen como buffer
    const imageBuffer = fs.readFileSync(testImagePath);
    const fileName = `test-image-${Date.now()}.svg`;
    
    console.log(`🔄 Subiendo imagen: ${fileName}`);
    
    // 3. Subir a bucket de imágenes (público)
    const { data, error } = await supabase.storage
      .from('imagenes')
      .upload(fileName, imageBuffer, {
        contentType: 'image/svg+xml',
        upsert: true
      });
    
    if (error) {
      console.error('❌ Error subiendo imagen:', error.message);
    } else {
      console.log('✅ Imagen subida exitosamente');
      console.log('📁 Path:', data.path);
      
      // 4. Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('imagenes')
        .getPublicUrl(data.path);
      
      console.log('🔗 URL pública:', urlData.publicUrl);
      
      // 5. Listar archivos en el bucket
      const { data: files } = await supabase.storage
        .from('imagenes')
        .list();
      
      console.log(`📋 Archivos en bucket "imagenes": ${files?.length || 0}`);
      if (files && files.length > 0) {
        files.forEach(file => {
          console.log(`  - ${file.name} (${file.metadata?.size || 'N/A'} bytes)`);
        });
      }
    }
    
    // 6. Limpiar archivo local
    fs.unlinkSync(testImagePath);
    console.log('\n🧹 Imagen de prueba local eliminada');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

async function testPublicBucket() {
  console.log('📦 Probando bucket público...\n');
  
  try {
    // Crear un archivo JSON de prueba
    const testData = {
      message: 'Archivo de prueba',
      timestamp: new Date().toISOString(),
      test: true
    };
    
    const testFilePath = path.join(__dirname, 'test-data.json');
    fs.writeFileSync(testFilePath, JSON.stringify(testData, null, 2));
    
    const fileBuffer = fs.readFileSync(testFilePath);
    const fileName = `test-data-${Date.now()}.json`;
    
    console.log(`🔄 Subiendo archivo JSON: ${fileName}`);
    
    // Intentar subir a bucket público (sin RLS)
    const { data, error } = await supabase.storage
      .from('imagenes')
      .upload(fileName, fileBuffer, {
        contentType: 'application/json',
        upsert: true
      });
    
    if (error) {
      console.error('❌ Error:', error.message);
    } else {
      console.log('✅ Archivo JSON subido exitosamente');
      console.log('📁 Path:', data.path);
      
      const { data: urlData } = supabase.storage
        .from('imagenes')
        .getPublicUrl(data.path);
      
      console.log('🔗 URL pública:', urlData.publicUrl);
    }
    
    fs.unlinkSync(testFilePath);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'json':
      await testPublicBucket();
      break;
    case 'image':
    default:
      await testImageUpload();
      break;
  }
}

if (require.main === module) {
  main().catch(console.error);
} 