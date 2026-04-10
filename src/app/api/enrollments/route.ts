import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenPayload, checkRole } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = getTokenPayload(req);
    if (!checkRole(user, ['STUDENT', 'ADMIN'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { courseId } = await req.json();
    if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 });

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: user.id, courseId } }
    });

    if (existingEnrollment) {
      return NextResponse.json({ error: 'Already enrolled' }, { status: 400 });
    }

    const enrollment = await prisma.enrollment.create({
      data: { studentId: user.id, courseId, progress: 0 }
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
