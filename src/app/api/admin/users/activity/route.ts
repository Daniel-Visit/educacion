import { NextResponse } from 'next/server';
import { auth } from '../../../../../../auth.config';
import { getAllUsersActivity } from '@/lib/auth-redis';

export async function GET() {
  try {
    // Verificar autenticación y rol de admin usando auth()
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    console.log(
      '🔍 API USERS ACTIVITY - Obteniendo actividad de usuarios desde Redis'
    );

    // Obtener todos los usuarios activos desde Redis
    console.log('🔍 API USERS ACTIVITY - Llamando a getAllUsersActivity...');

    let userActivity;
    try {
      userActivity = await getAllUsersActivity();
      console.log('✅ API USERS ACTIVITY - Actividad obtenida:', userActivity);
    } catch (redisError) {
      console.error('❌ API USERS ACTIVITY - Error en Redis:', redisError);
      throw redisError;
    }

    return NextResponse.json({
      success: true,
      userActivity,
    });
  } catch (error) {
    console.error('❌ API USERS ACTIVITY - Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
