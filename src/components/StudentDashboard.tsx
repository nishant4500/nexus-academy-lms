'use client';

import React, { useState } from 'react';
import CoursePlayer from './CoursePlayer';

interface Props {
  token: string;
  user: { id: string, email: string, role: string };
  courses: any[];
  fetchCourses: () => void;
}

export default function StudentDashboard({ token, user, courses }: Props) {
  const [playingCourseId, setPlayingCourseId] = useState<string | null>(null);

  if (playingCourseId) {
    return <CoursePlayer courseId={playingCourseId} token={token} user={user} goBack={() => setPlayingCourseId(null)} />;
  }

  return (
    <div className="fade-in">
        <h2 style={{ marginBottom: '30px' }}>Course Discoverability Hub</h2>
        <div className="dashboard-grid">
            {courses.map((course: any) => (
                <div key={course.id} className="glass-panel">
                    <h3 style={{ marginBottom: '5px' }}>{course.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>Instructor: {course.instructor?.name || 'Platform Expert'}</p>
                    <button className="btn-primary" onClick={() => setPlayingCourseId(course.id)}>Enter Course</button>
                </div>
            ))}
            {courses.length === 0 && <p className="glass-panel">No courses available. Tell an instructor to create some!</p>}
        </div>
    </div>
  );
}
