'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAvatarData } from '@/hooks/use-avatar-data';

interface AvatarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ user, size = 'md', className = '' }: AvatarProps) {
  const [avatarId, setAvatarId] = useState<string | undefined>();
  const [colorId, setColorId] = useState<string | undefined>();

  const { avatarData, colorData, isLoading } = useAvatarData(avatarId, colorId);

  // Tamaños del avatar
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  // Función para obtener iniciales
  const getInitials = () => {
    if (user.name) {
      return user.name.charAt(0).toUpperCase();
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Parsear el campo image del usuario
  useEffect(() => {
    if (user.image) {
      const [avatar, color] = user.image.split('/');
      setAvatarId(avatar);
      setColorId(color);
    } else {
      setAvatarId(undefined);
      setColorId(undefined);
    }
  }, [user.image]);

  // Si no hay imagen o está cargando, mostrar iniciales
  if (!user.image || isLoading) {
    return (
      <div
        className={`
          bg-gradient-to-br from-indigo-400 to-purple-500 
          rounded-full flex items-center justify-center 
          shadow-md ring-2 ring-zinc-200 ring-offset-2 ring-offset-white
          ${sizeClasses[size]}
          ${className}
        `}
      >
        <span className="font-bold text-white">{getInitials()}</span>
      </div>
    );
  }

  // Si hay avatar personalizado, mostrarlo
  if (avatarData && colorData) {
    return (
      <div
        className={`
          rounded-full flex items-center justify-center 
          shadow-md ring-2 ring-zinc-200 ring-offset-2 ring-offset-white
          overflow-hidden
          ${sizeClasses[size]}
          ${className}
        `}
        style={{ backgroundColor: colorData.hexCode }}
      >
        <Image
          src={avatarData.imageUrl}
          alt={avatarData.name}
          width={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
          height={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
          className="rounded-full object-cover"
        />
      </div>
    );
  }

  // Si hay error, mostrar iniciales (silently fall back)

  // Fallback a iniciales
  return (
    <div
      className={`
        bg-gradient-to-br from-indigo-400 to-purple-500 
        rounded-full flex items-center justify-center 
        shadow-md ring-2 ring-zinc-200 ring-offset-2 ring-offset-white
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <span className="font-bold text-white">{getInitials()}</span>
    </div>
  );
}
