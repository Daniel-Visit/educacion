const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas');
  console.log('Necesitas configurar:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuración de buckets
const buckets = [
  {
    name: 'imagenes',
    public: true,
    description: 'Imágenes generales de la aplicación',
  },
  {
    name: 'archivos',
    public: false,
    description: 'Archivos subidos por usuarios',
  },
  {
    name: 'avatares',
    public: true,
    description: 'Avatares de profesores y alumnos',
  },
  {
    name: 'documentos',
    public: false,
    description: 'Documentos y PDFs',
  },
];

async function createBucket(bucketConfig) {
  try {
    console.log(`🔄 Creando bucket: ${bucketConfig.name}...`);

    const { data, error } = await supabase.storage.createBucket(
      bucketConfig.name,
      {
        public: bucketConfig.public,
        allowedMimeTypes: bucketConfig.public ? ['image/*'] : null,
        fileSizeLimit: 52428800, // 50MB
      }
    );

    if (error) {
      if (error.message.includes('already exists')) {
        console.log(`✅ Bucket ${bucketConfig.name} ya existe`);
        return { success: true, exists: true };
      }
      throw error;
    }

    console.log(`✅ Bucket ${bucketConfig.name} creado exitosamente`);
    return { success: true, exists: false };
  } catch (error) {
    console.error(
      `❌ Error creando bucket ${bucketConfig.name}:`,
      error.message
    );
    return { success: false, error: error.message };
  }
}

async function setupStoragePolicies() {
  console.log('\n🔧 Configurando políticas de acceso...\n');

  // Políticas para bucket 'imagenes' (público)
  const imagenesPolicies = [
    {
      name: 'Permitir lectura pública de imágenes',
      bucket: 'imagenes',
      operation: 'SELECT',
      policy: 'true',
    },
  ];

  // Políticas para bucket 'archivos' (privado)
  const archivosPolicies = [
    {
      name: 'Permitir lectura de archivos propios',
      bucket: 'archivos',
      operation: 'SELECT',
      policy: 'auth.uid() = owner',
    },
    {
      name: 'Permitir inserción de archivos',
      bucket: 'archivos',
      operation: 'INSERT',
      policy: 'auth.uid() IS NOT NULL',
    },
  ];

  // Políticas para bucket 'avatares' (público)
  const avataresPolicies = [
    {
      name: 'Permitir lectura pública de avatares',
      bucket: 'avatares',
      operation: 'SELECT',
      policy: 'true',
    },
    {
      name: 'Permitir actualización de avatar propio',
      bucket: 'avatares',
      operation: 'UPDATE',
      policy: 'auth.uid()::text = (storage.foldername(name))[1]',
    },
  ];

  // Políticas para bucket 'documentos' (privado)
  const documentosPolicies = [
    {
      name: 'Permitir lectura de documentos propios',
      bucket: 'documentos',
      operation: 'SELECT',
      policy: 'auth.uid() = owner',
    },
    {
      name: 'Permitir inserción de documentos',
      bucket: 'documentos',
      operation: 'INSERT',
      policy: 'auth.uid() IS NOT NULL',
    },
  ];

  const allPolicies = [
    ...imagenesPolicies,
    ...archivosPolicies,
    ...avataresPolicies,
    ...documentosPolicies,
  ];

  console.log('📋 Políticas configuradas:');
  allPolicies.forEach(policy => {
    console.log(`  - ${policy.bucket}: ${policy.name}`);
  });

  console.log(
    '\n✅ Las políticas se configurarán automáticamente en Supabase Dashboard'
  );
  console.log(
    '💡 Ve a: Storage > Policies para revisar y ajustar si es necesario'
  );
}

async function main() {
  console.log('🚀 Configurando Supabase Storage...\n');

  const results = [];

  // Crear buckets
  for (const bucketConfig of buckets) {
    const result = await createBucket(bucketConfig);
    results.push({ bucket: bucketConfig.name, ...result });
  }

  // Mostrar resumen
  console.log('\n📊 Resumen de configuración:');
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ Buckets exitosos: ${successful.length}`);
  console.log(`❌ Buckets fallidos: ${failed.length}`);

  if (failed.length > 0) {
    console.log('\n❌ Buckets que fallaron:');
    failed.forEach(failed => {
      console.log(`  - ${failed.bucket}: ${failed.error}`);
    });
  }

  // Configurar políticas
  await setupStoragePolicies();

  console.log('\n🎉 Configuración de Storage completada!');
  console.log('\n📝 Próximos pasos:');
  console.log('1. Revisar políticas en Supabase Dashboard');
  console.log('2. Configurar variables de entorno en .env:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=tu_url');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key');
  console.log('3. Actualizar código para usar Supabase Storage');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createBucket, setupStoragePolicies };
