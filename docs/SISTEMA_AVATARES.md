# 🎨 Sistema de Avatares - Documentación

## 📋 Resumen del Sistema

El sistema de avatares permite a los usuarios personalizar su perfil con:

- **Avatares PNG**: Imágenes predefinidas almacenadas en Supabase
- **Colores de fondo**: Paleta de 18 colores suaves y elegantes
- **Formato de almacenamiento**: `"avatarId/colorId"` en el campo `image` de la tabla `users`

## 🗄️ Estructura de Base de Datos

### Nuevas Tablas

#### `available_avatars`

```sql
- id: String (CUID)
- name: String (Nombre descriptivo)
- imageUrl: String (URL de Supabase)
- category: String? (Categoría opcional)
- isActive: Boolean
- createdAt: DateTime
- updatedAt: DateTime
```

#### `avatar_background_colors`

```sql
- id: String (CUID)
- name: String (Nombre descriptivo)
- hexCode: String (Código hexadecimal)
- category: String? (Categoría)
- isActive: Boolean
- createdAt: DateTime
- updatedAt: DateTime
```

### Campo Existente

- **`users.image`**: String que almacena `"avatarId/colorId"`

## 🚀 Implementación

### 1. Generar Migración

```bash
cd scripts-organized/database
node generate-avatar-migration.js
```

### 2. Poblar Tablas

```bash
cd scripts-organized/database
node seed-avatar-system.js
```

### 3. Subir Imágenes a Supabase

- Subir archivos PNG a Supabase Storage
- Actualizar URLs en la tabla `available_avatars`

### 4. Actualizar URLs de Avatares

```javascript
const { updateAvatarUrls } = require('./seed-avatars');

const avatarUpdates = [
  { id: 'avatar-id-1', imageUrl: 'https://supabase-url/avatar1.png' },
  // ... más avatares
];

await updateAvatarUrls(avatarUpdates);
```

## 🎨 Paleta de Colores

### Cálidos

- `#FBEEB9` - Crema Suave
- `#FDE997` - Amarillo Suave
- `#FFEF6B` - Amarillo Limón
- `#FEE9C8` - Melocotón
- `#FFC9BA` - Coral Suave
- `#F5BEA5` - Beige Rosado

### Naturales

- `#B4E3B0` - Verde Menta
- `#D2E2CF` - Verde Salvia
- `#D7E0D9` - Verde Grisáceo

### Neutros

- `#BAB4A5` - Beige Terroso
- `#B8B3B2` - Gris Suave
- `#6F727A` - Gris Azulado

### Fríos

- `#A999D9` - Lavanda
- `#B4AFF9` - Púrpura Suave
- `#D1D1E2` - Gris Azulado Claro
- `#2167BD` - Azul Profesional
- `#54B8FB` - Azul Cielo
- `#BBD2E3` - Azul Polvo

## 🔧 Uso en el Código

### Obtener Avatar del Usuario

```typescript
function getUserAvatar(user: User) {
  if (!user.image) {
    return { type: 'initials', content: user.name?.charAt(0) || 'U' };
  }

  const [avatarId, colorId] = user.image.split('/');

  return {
    type: 'avatar',
    avatarId,
    colorId,
  };
}
```

### Renderizar Avatar

```typescript
function AvatarComponent({ user }: { user: User }) {
  const avatarInfo = getUserAvatar(user);

  if (avatarInfo.type === 'initials') {
    return (
      <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center shadow-md ring-2 ring-zinc-200 ring-offset-2 ring-offset-white">
        <span className="text-sm font-bold text-white">
          {avatarInfo.content}
        </span>
      </div>
    );
  }

  // Renderizar avatar personalizado
  return <CustomAvatar avatarId={avatarInfo.avatarId} colorId={avatarInfo.colorId} />;
}
```

## 📱 Próximos Pasos

1. ✅ Crear tablas de base de datos
2. ✅ Poblar colores de fondo
3. 🔄 Subir imágenes PNG a Supabase
4. 🔄 Actualizar URLs de avatares
5. 🔄 Implementar avatar en sidebar
6. 🔄 Crear página de perfil
7. 🔄 Implementar selector de avatares

## 🎯 Funcionalidades Futuras

- **Página de Perfil**: Editar información personal
- **Selector de Avatares**: Galería visual para elegir
- **Selector de Colores**: Paleta visual de colores
- **Vista Previa**: Cómo se ve la combinación seleccionada
- **Categorías**: Organizar avatares por estilo

## 🔍 Archivos Relacionados

- `prisma/schema.prisma` - Esquema de base de datos
- `scripts-organized/database/seed-avatar-colors.js` - Seed de colores
- `scripts-organized/database/seed-avatars.js` - Seed de avatares
- `scripts-organized/database/seed-avatar-system.js` - Script principal
- `scripts-organized/database/generate-avatar-migration.js` - Generar migración
