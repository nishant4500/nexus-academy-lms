const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@example.com' },
    update: {},
    create: {
      name: 'Lead Instructor',
      email: 'instructor@example.com',
      passwordHash,
      role: 'INSTRUCTOR',
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      name: 'John Student',
      email: 'student@example.com',
      passwordHash,
      role: 'STUDENT',
    },
  });

  // Default Course 1
  const course1 = await prisma.course.create({
    data: {
      title: 'Advanced React Architecture',
      description: 'Master enterprise-level Next.js React architecture and server components.',
      instructorId: instructor.id,
      modules: {
        create: [
          { title: 'The App Router', content: 'Deep dive into folder structuring.' },
          { title: 'Server Actions', content: 'Mutate data securely without explicit API routes.' },
          { title: 'Suspense & Streaming', content: 'Stream HTML linearly to the browser.' },
        ]
      }
    }
  });

  // Default Course 2
  const course2 = await prisma.course.create({
    data: {
      title: 'Mastering Cyber Security',
      description: 'Learn modern web vulnerabilities and how to construct secure JWT mechanisms.',
      instructorId: instructor.id,
      modules: {
        create: [
          { title: 'XSS & CSRF', content: 'Protect your DOM from malicious script injections.' },
          { title: 'Stateless Authentication', content: 'Issuing and verifying JSON Web Tokens securely.' }
        ]
      }
    }
  });

  console.log('Seeded successfully with new interactive content.');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
