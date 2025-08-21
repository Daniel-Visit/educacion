const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function getAvatarUrls() {
  try {
    console.log('🔍 Obteniendo URLs de avatares...\n');
    
    const { data: files, error } = await supabase.storage
      .from('avatares')
      .list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      });
    
    if (error) throw error;
    
    if (!files || files.length === 0) {
      console.log('📭 No se encontraron archivos');
      return;
    }
    
    console.log(`✅ Se encontraron ${files.length} avatares:\n`);
    
    // Solo mostrar los URLs
    files.forEach((file, index) => {
      const publicUrl = supabase.storage
        .from('avatares')
        .getPublicUrl(file.name).data.publicUrl;
      
      console.log(`${index + 1}. ${file.name}`);
      console.log(`   URL: ${publicUrl}\n`);
    });
    
    console.log('📋 Copia estos URLs para usarlos en el seed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await supabase.auth.signOut();
  }
}

getAvatarUrls();
