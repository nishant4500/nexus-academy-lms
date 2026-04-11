import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenPayload, checkRole } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = getTokenPayload(req);
    if (!checkRole(user, ['INSTRUCTOR'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { title, content, videoUrl, courseId } = await req.json();
    if (!title || !courseId) return NextResponse.json({ error: 'Title and courseId required' }, { status: 400 });

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || (course.instructorId !== user.id && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized to add module to this course' }, { status: 403 });
    }

    const newModule = await prisma.module.create({
      data: { title, content, videoUrl, courseId }
    });

    return NextResponse.json(newModule, { status: 201 });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
