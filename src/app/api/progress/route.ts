import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenPayload, checkRole } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = getTokenPayload(req);
    if (!checkRole(user, ['STUDENT', 'ADMIN'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { moduleId } = await req.json();
    if (!moduleId) return NextResponse.json({ error: 'moduleId required' }, { status: 400 });

    const progress = await prisma.progress.upsert({
      where: { studentId_moduleId: { studentId: user.id, moduleId } },
      update: { completed: true },
      create: { studentId: user.id, moduleId, completed: true }
    });

    return NextResponse.json(progress, { status: 200 });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
