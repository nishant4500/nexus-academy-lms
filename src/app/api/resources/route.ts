import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenPayload, checkRole } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = getTokenPayload(req);
    if (!checkRole(user, ['INSTRUCTOR'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { title, url, moduleId } = await req.json();
    if (!title || !url || !moduleId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const module = await prisma.module.findUnique({ where: { id: moduleId }, include: { course: true } });
    if (!module || (module.course.instructorId !== user.id && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const resource = await prisma.resource.create({
      data: { title, url, moduleId }
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
