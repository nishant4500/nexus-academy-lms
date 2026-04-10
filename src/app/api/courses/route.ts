import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenPayload, checkRole } from '@/lib/auth';

export async function GET(_req: Request) {
  try {
    const courses = await prisma.course.findMany({
      include: { instructor: { select: { name: true, email: true } } },
    });
    return NextResponse.json(courses);
  } catch (_error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = getTokenPayload(req);
    if (!checkRole(user, ['INSTRUCTOR'])) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title, description } = await req.json();
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        instructorId: user.id
      }
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
