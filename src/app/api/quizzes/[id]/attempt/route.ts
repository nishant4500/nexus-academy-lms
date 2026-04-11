import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenPayload, checkRole } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = getTokenPayload(req);
    if (!checkRole(user, ['STUDENT', 'ADMIN'])) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { answers } = await req.json(); // { questionId, optionId }[]
    
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: { questions: { include: { options: true } } }
    });
    if (!quiz) return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });

    let score = 0;
    const totalQuestions = quiz.questions.length;

    answers.forEach((ans: { questionId: string, optionId: string }) => {
      const question = quiz.questions.find(q => q.id === ans.questionId);
      if (question) {
        const selectedOption = question.options.find(o => o.id === ans.optionId);
        if (selectedOption?.isCorrect) {
          score++;
        }
      }
    });

    const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

    const attempt = await prisma.quizAttempt.create({
      data: {
        studentId: user.id,
        quizId: quiz.id,
        score: percentage
      }
    });

    return NextResponse.json({ attempt, correct: score, total: totalQuestions }, { status: 201 });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
