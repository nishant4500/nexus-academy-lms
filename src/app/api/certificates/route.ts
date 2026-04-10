import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenPayload, checkRole } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = getTokenPayload(req);
    if (!checkRole(user, ['STUDENT', 'ADMIN'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { courseId } = await req.json();
    if (!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 });

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { modules: true }
    });
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

    const moduleIds = course.modules.map(m => m.id);
    const progresses = await prisma.progress.findMany({
      where: { studentId: user.id, moduleId: { in: moduleIds }, completed: true }
    });

    const completionRate = moduleIds.length === 0 ? 0 : progresses.length / moduleIds.length;

    // 50% Completion logic
    if (completionRate < 0.5) {
      return NextResponse.json({ error: `Not eligible yet. You are at ${Math.round(completionRate * 100)}% completion. 50% is required.` }, { status: 400 });
    }

    const studentRecord = await prisma.user.findUnique({ where: { id: user.id } });

    const certificate = await prisma.certificate.upsert({
      where: { studentId_courseId: { studentId: user.id, courseId } },
      update: {},
      create: {
        studentId: user.id,
        courseId,
        url: `/certificates/${user.id}-${courseId}`
      }
    });

    return NextResponse.json({
        ...certificate,
        courseName: course.title,
        studentName: studentRecord?.name || user.email,
        date: new Date().toLocaleDateString()
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
