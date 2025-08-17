import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    // Configuración de archivos a ignorar
    ignores: [
      // Archivos generados por Prisma
      'src/generated/',
      '**/*.wasm',
      '**/*.wasm.js',
      
      // Archivos de build
      '.next/',
      'out/',
      'dist/',
      
      // Archivos de dependencias
      'node_modules/',
      
      // Archivos de configuración
      '**/*.config.js',
      '**/*.config.ts',
      
      // Scripts y utilidades (JavaScript puro, no TypeScript)
      'scripts/**/*.js',
      'scripts-restauracion/**/*.js',
      'scripts-test/**/*.js',
      'migraciones-postgresql/**/*.js',
      'utilidades/**/*.js',
      'backups/**/*.js',
      'horarios_backup/**/*.js',
      'horarios_backup/**/*.ts',
      
      // Archivos de test que usan require()
      'tests/**/*.js',
      'jest.setup.js',
      'jest.config.js',
      
      // Archivos de seed y configuración de base de datos
      'prisma/seed.ts',
      
      // Archivos de utilidades en la raíz
      'check-*.js',
      'create-*.js',
      'fix-*.js',
      'generate-*.js',
      'diagnose-*.js',
      'process-*.js',
      'convert-*.js',
      
      // Archivos de coverage
      'coverage/**/*',
      
      // Archivos de backup y migración
      '**/backup-*.js',
      '**/migrar-*.js',
      '**/verificar-*.js',
      '**/restore-*.js',
      '**/cargar-*.js',
      '**/poblar-*.js',
      '**/limpiar-*.js',
      '**/debug-*.js'
    ],
  },
];

export default eslintConfig;
