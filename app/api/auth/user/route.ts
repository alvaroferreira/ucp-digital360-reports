import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force Node.js runtime for Prisma
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true, active: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { email, name, image } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: { name, image },
      create: {
        email,
        name,
        image,
        role: 'VIEWER',
        active: true,
      },
    });

    return NextResponse.json({
      id: user.id,
      role: user.role,
      active: user.active,
    });
  } catch (error) {
    console.error('Error upserting user:', error);
    return NextResponse.json({ error: 'Failed to upsert user' }, { status: 500 });
  }
}
