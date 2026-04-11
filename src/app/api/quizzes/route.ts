import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenPayload, checkRole } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = getTokenPayload(req);
    if (!checkRole(user, ['INSTRUCTOR', 'ADMIN'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { title, moduleId, questions } = await req.json();
    if (!title || !moduleId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const quiz = await prisma.quiz.create({
      data: {
        title,
        moduleId,
        questions: {
          create: questions.map((q: { text: string, options: Array<{ text: string, isCorrect: boolean }> }) => ({
            text: q.text,
            options: {
              create: q.options.map((o: { text: string, isCorrect: boolean }) => ({
                text: o.text,
                isCorrect: o.isCorrect
              }))
            }
          }))
        }
      }
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
