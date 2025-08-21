const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan variables de entorno de Supabase');
  console.log('💡 Asegúrate de tener en tu .env:');
  console.log('  NEXT_PUBLIC_SUPABASE_URL=tu_url');
  console.log('  SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function getAvatarsFromSupabase() {
  try {
    console.log('🔍 Obteniendo avatares del bucket de Supabase...\n');
    
    // Listar todos los archivos del bucket 'avatares'
    const { data: files, error } = await supabase.storage
      .from('avatares')
      .list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      });
    
    if (error) {
      throw error;
    }
    
    if (!files || files.length === 0) {
      console.log('📭 No se encontraron archivos en el bucket "avatares"');
      return [];
    }
    
    console.log(`✅ Se encontraron ${files.length} archivos en el bucket:`);
    
    // Generar URLs públicas para cada archivo
    const avatars = files.map((file, index) => {
      const publicUrl = supabase.storage
        .from('avatares')
        .getPublicUrl(file.name).data.publicUrl;
      
      return {
        id: `avatar-${index + 1}`,
        name: file.name.replace('.png', '').replace('.jpg', '').replace('.jpeg', ''),
        imageUrl: publicUrl,
        category: getCategoryFromName(file.name),
        originalName: file.name
      };
    });
    
    // Mostrar información de cada avatar
    avatars.forEach((avatar, index) => {
      console.log(`\n${index + 1}. ${avatar.name}`);
      console.log(`   Archivo: ${avatar.originalName}`);
      console.log(`   Categoría: ${avatar.category}`);
      console.log(`   URL: ${avatar.imageUrl}`);
    });
    
    // Generar código para actualizar el seed
    console.log('\n📋 Código para actualizar seed-avatars.js:');
    console.log('const availableAvatars = [');
    avatars.forEach(avatar => {
      console.log(`  { name: "${avatar.name}", imageUrl: "${avatar.imageUrl}", category: "${avatar.category}" },`);
    });
    console.log('];');
    
    return avatars;
    
  } catch (error) {
    console.error('❌ Error al obtener avatares de Supabase:', error.message);
    return [];
  }
}

function getCategoryFromName(filename) {
  const name = filename.toLowerCase();
  
  // Lógica para categorizar basada en el nombre del archivo
  if (name.includes('profesional') || name.includes('business')) return 'profesional';
  if (name.includes('creativo') || name.includes('artistic')) return 'creativo';
  if (name.includes('moderno') || name.includes('modern')) return 'moderno';
  if (name.includes('minimalista') || name.includes('minimal')) return 'minimalista';
  if (name.includes('colorido') || name.includes('colorful')) return 'colorido';
  if (name.includes('geometrico') || name.includes('geometric')) return 'geometrico';
  
  // Categoría por defecto
  return 'general';
}

async function updateAvatarsSeedFile(avatars) {
  try {
    console.log('\n🔄 Actualizando archivo seed-avatars.js...');
    
    const fs = require('fs');
    const path = require('path');
    
    const seedFilePath = path.join(__dirname, 'seed-avatars.js');
    let content = fs.readFileSync(seedFilePath, 'utf8');
    
    // Crear el array de avatares
    const avatarsArray = avatars.map(avatar => 
      `  { name: "${avatar.name}", imageUrl: "${avatar.imageUrl}", category: "${avatar.category}" }`
    ).join(',\n');
    
    // Reemplazar el array existente
    const regex = /const availableAvatars = \[[\s\S]*?\];/;
    const replacement = `const availableAvatars = [\n${avatarsArray}\n];`;
    
    content = content.replace(regex, replacement);
    
    // Escribir el archivo actualizado
    fs.writeFileSync(seedFilePath, content, 'utf8');
    
    console.log('✅ Archivo seed-avatars.js actualizado exitosamente');
    
  } catch (error) {
    console.error('❌ Error al actualizar el archivo:', error.message);
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando obtención de avatares de Supabase...\n');
  
  const avatars = await getAvatarsFromSupabase();
  
  if (avatars.length > 0) {
    console.log(`\n🎉 Se obtuvieron ${avatars.length} avatares exitosamente`);
    
    // Preguntar si quiere actualizar el archivo de seed
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('\n¿Quieres que actualice automáticamente el archivo seed-avatars.js? (y/n): ', async (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        await updateAvatarsSeedFile(avatars);
      } else {
        console.log('💡 Puedes copiar manualmente el código generado arriba');
      }
      
      rl.close();
      process.exit(0);
    });
  } else {
    console.log('❌ No se pudieron obtener avatares');
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { getAvatarsFromSupabase, updateAvatarsSeedFile };
