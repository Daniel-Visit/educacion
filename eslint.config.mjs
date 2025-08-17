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
      '**/*.config.ts'
    ],
  },
];

export default eslintConfig;
