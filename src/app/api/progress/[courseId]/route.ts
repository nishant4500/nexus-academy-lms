import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenPayload } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ courseId: string }> }) {
    try {
        const { courseId } = await params;
        const user = getTokenPayload(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: { modules: true }
        });
        
        if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const moduleIds = course.modules.map(m => m.id);
        const progresses = await prisma.progress.findMany({
            where: { studentId: user.id, moduleId: { in: moduleIds }, completed: true }
        });

        const completedCount = progresses.length;
        const total = moduleIds.length;
        const completionRate = total === 0 ? 0 : completedCount / total;

        return NextResponse.json({ 
            completedCount, 
            total, 
            completionRate: Math.round(completionRate * 100), 
            completedModules: progresses.map((p) => p.moduleId) 
        });
    } catch (_err) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
