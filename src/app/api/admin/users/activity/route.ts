import { NextResponse } from 'next/server';
import { auth } from '../../../../../../auth';

/**
 * Get user activity.
 * Note: Session tracking was removed. Returns empty array for compatibility.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Session tracking removed - return empty for backward compatibility
    return NextResponse.json({
      success: true,
      userActivity: [],
    });
  } catch (error) {
    console.error('Error getting user activity:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
