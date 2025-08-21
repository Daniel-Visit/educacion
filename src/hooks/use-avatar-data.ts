import { useState, useEffect } from 'react';

interface AvatarData {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
}

interface ColorData {
  id: string;
  name: string;
  hexCode: string;
  category: string;
}

export function useAvatarData(avatarId?: string, colorId?: string) {
  const [avatarData, setAvatarData] = useState<AvatarData | null>(null);
  const [colorData, setColorData] = useState<ColorData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Logs de debug
  console.log('🔍 DEBUG useAvatarData - avatarId recibido:', avatarId);
  console.log('🔍 DEBUG useAvatarData - colorId recibido:', colorId);

  useEffect(() => {
    if (!avatarId || !colorId) {
      console.log(
        '🔍 DEBUG useAvatarData - No hay avatarId o colorId, limpiando datos'
      );
      setAvatarData(null);
      setColorData(null);
      return;
    }

    const fetchAvatarData = async () => {
      try {
        console.log('🔍 DEBUG useAvatarData - Iniciando fetch de datos...');
        setIsLoading(true);
        setError(null);

        // Fetch avatar data
        console.log('🔍 DEBUG useAvatarData - Fetching avatar:', avatarId);
        const avatarResponse = await fetch(`/api/avatars/${avatarId}`);
        if (!avatarResponse.ok) throw new Error('Error fetching avatar');
        const avatar = await avatarResponse.json();
        console.log('🔍 DEBUG useAvatarData - Avatar obtenido:', avatar);

        // Fetch color data
        console.log('🔍 DEBUG useAvatarData - Fetching color:', colorId);
        const colorResponse = await fetch(`/api/avatar-colors/${colorId}`);
        if (!colorResponse.ok) throw new Error('Error fetching color');
        const color = await colorResponse.json();
        console.log('🔍 DEBUG useAvatarData - Color obtenido:', color);

        setAvatarData(avatar);
        setColorData(color);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        console.error('❌ Error fetching avatar data:', errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvatarData();
  }, [avatarId, colorId]);

  return { avatarData, colorData, isLoading, error };
}
