import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const color = await prisma.avatarBackgroundColor.findUnique({
      where: { id },
    });

    if (!color) {
      return NextResponse.json({ error: 'Color not found' }, { status: 404 });
    }

    return NextResponse.json(color);
  } catch (error) {
    console.error('Error fetching color:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
