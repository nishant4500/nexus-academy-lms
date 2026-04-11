'use client';

import React, { useState, useEffect, useCallback } from 'react';

export default function CoursePlayer({ courseId, token, user, goBack }: { courseId: string, token: string, user: any, goBack: () => void }) {
   const [course, setCourse] = useState<any>(null);
   const [certData, setCertData] = useState<any>(null);
   
   const [quizScores, setQuizScores] = useState<Record<string, number>>({});
   const [quizAnswers, setQuizAnswers] = useState<Record<string, any>>({});
   
   const [progressData, setProgressData] = useState<any>({ completedCount: 0, total: 0, completionRate: 0, completedModules: [] });

   const loadCourseAndProgress = useCallback(async () => {
       const res = await fetch(`/api/courses/${courseId}`);
       setCourse(await res.json());

       if (user.role === 'STUDENT' || user.role === 'ADMIN') {
           const progRes = await fetch(`/api/progress/${courseId}`, { headers: { Authorization: `Bearer ${token}` } });
           setProgressData(await progRes.json());
       }
   }, [courseId, token, user.role]);

   useEffect(() => { loadCourseAndProgress(); }, [loadCourseAndProgress]);

   const enroll = async () => {
    const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ courseId })
    });
    const d = await res.json();
    if(d.error) alert(d.error); else alert('Enrolled successfully!');
  };

   const markComplete = async (moduleId: string) => {
       await fetch('/api/progress', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
           body: JSON.stringify({ moduleId })
       });
       loadCourseAndProgress(); // Refresh progress locally
   };

   const submitQuiz = async (quizId: string) => {
       const res = await fetch(`/api/quizzes/${quizId}/attempt`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
           body: JSON.stringify({ answers: quizAnswers[quizId] || [] })
       });
       const data = await res.json();
       if (data.attempt) {
           setQuizScores({ ...quizScores, [quizId]: data.attempt.score });
           alert(`Quiz Scored! You got ${data.attempt.score}%`);
       } else alert(data.error);
   };

   const claimCertificate = async () => {
       const res = await fetch('/api/certificates', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
           body: JSON.stringify({ courseId })
       });
       const data = await res.json();
       if (data.error) alert(data.error);
       else setCertData(data); // Expects the backend to return visual cert data
   };

   if (!course) return <div>Loading...</div>;

   return (
       <div className="fade-in">
           <button onClick={goBack} className="btn-secondary" style={{ marginBottom: '20px', padding: '8px 16px', fontSize: '0.9rem' }}>← Back</button>
           
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <h2 style={{ fontSize: '2rem' }}>{course.title}</h2>
             <button className="btn-primary" onClick={enroll} style={{ width: 'auto' }}>Confirm Enrollment</button>
           </div>
           
           {/* Visual Progress Bar Component */}
           {progressData.total > 0 && (
               <div style={{ marginTop: '20px', marginBottom: '30px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                       <span style={{ fontWeight: '500' }}>Your Course Progress</span>
                       <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>{progressData.completionRate}%</span>
                   </div>
                   <div style={{ height: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '5px', overflow: 'hidden' }}>
                       <div style={{ width: `${progressData.completionRate}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #10b981)', transition: 'width 0.5s ease-in-out' }}></div>
                   </div>
                   <p style={{ fontSize: '0.8rem', color: 'gray', marginTop: '8px', textAlign: 'right' }}>
                       You have completed {progressData.completedCount} out of {progressData.total} modules.
                   </p>
               </div>
           )}

           <div style={{ display:'flex', flexDirection:'column', gap:'15px' }}>
               {course.modules?.map((mod: any, index: number) => {
                   const isCompleted = progressData.completedModules?.includes(mod.id);

                   return (
                   <div key={mod.id} className="glass-panel" style={{ border: isCompleted ? '1px solid var(--success)' : '' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                         <h4 style={{ color: isCompleted ? 'var(--success)' : 'var(--accent-primary)' }}>Module {index + 1}: {mod.title}</h4>
                         {isCompleted && <span style={{ color: 'var(--success)', fontSize: '0.9rem', fontWeight: 600 }}>✓ COMPLETED</span>}
                       </div>
                       
                       <p style={{ marginBottom: '15px' }}>{mod.content}</p>
                       
                       {mod.resources && mod.resources.length > 0 && (
                           <div style={{ marginBottom: '15px', padding: '10px', background: 'rgba(59, 130, 246, 0.1)', borderLeft: '3px solid var(--accent-primary)', borderRadius: '0 8px 8px 0' }}>
                               <strong>🔗 External Resources:</strong>
                               <ul style={{ marginTop: '5px', listStylePosition: 'inside' }}>
                                   {mod.resources.map((r: any) => (
                                       <li key={r.id}><a href={r.url} target="_blank" style={{ color: '#60a5fa', textDecoration: 'none' }}>{r.title}</a></li>
                                   ))}
                               </ul>
                           </div>
                       )}

                       {mod.quiz && (
                           <div style={{ marginBottom: '15px', padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                               {/* (mod.quiz gets returned correctly now!) */}
                               <h5 style={{ marginBottom: '15px', color: '#f8fafc' }}>📝 Quiz: {mod.quiz.title}</h5>
                               {(mod.quiz as any).questions?.map((q: any, i: number) => (
                                   <div key={q.id} style={{ marginBottom: '20px' }}>
                                       <strong style={{ display: 'block', marginBottom: '10px' }}>{i+1}. {q.text}</strong>
                                       <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                           {q.options.map((opt: any) => (
                                               <label key={opt.id} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', cursor: 'pointer' }}>
                                                   <input type="radio" name={`q-${q.id}`} style={{ marginRight: '10px' }} onChange={() => {
                                                       const currentAnswers = quizAnswers[mod.quiz.id] || [];
                                                       const otherAnswers = currentAnswers.filter((a: any) => a.questionId !== q.id);
                                                       setQuizAnswers({ ...quizAnswers, [mod.quiz.id]: [...otherAnswers, { questionId: q.id, optionId: opt.id }] });
                                                   }} /> {opt.text}
                                               </label>
                                           ))}
                                       </div>
                                   </div>
                               ))}
                               <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                   <button className="btn-primary" style={{ padding: '10px 20px', width: 'auto' }} onClick={() => submitQuiz(mod.quiz.id)}>Grade My Answers</button>
                                   {quizScores[mod.quiz.id] !== undefined && <span style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '1.2rem' }}>You Scored: {quizScores[mod.quiz.id]}%</span>}
                               </div>
                           </div>
                       )}
                       
                       {!isCompleted && <button className="btn-secondary" onClick={() => markComplete(mod.id)}>Mark As Finished</button>}
                   </div>
               )})}
           </div>

           {course.modules?.length > 0 && (
            <div style={{ marginTop: '50px', padding: '30px', background: 'radial-gradient(ellipse at bottom, rgba(16, 185, 129, 0.15), transparent)', border: '1px dashed var(--success)', borderRadius: '16px', textAlign: 'center' }}>
                <h3 style={{ color: 'var(--success)' }}>Graduation & Certification</h3>
                <p style={{ marginTop: '10px', color: 'gray' }}>You must reach a minimum progress rate of 50% across all modules to generate the credential.</p>
                <button className="btn-primary" style={{ background: 'var(--success)', marginTop: '20px', padding: '15px 30px' }} onClick={claimCertificate}>Verify & Generate Certificate</button>
                
                {certData && (
                    <div className="fade-in" style={{ marginTop: '40px', padding: '50px 30px', background: 'linear-gradient(145deg, #1e293b, #0f172a)', border: '3px double #d4af37', borderRadius: '12px', boxShadow: '0 0 40px rgba(212, 175, 55, 0.15)', position: 'relative', overflow: 'hidden' }}>
                        {/* Certificate background seal */}
                        <div style={{ position: 'absolute', opacity: 0.05, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '15rem' }}>🎓</div>
                        
                        <div style={{ position: 'relative', zIndex: 10 }}>
                            <h2 style={{ color: '#d4af37', letterSpacing: '4px', textTransform: 'uppercase', fontSize: '1.8rem', marginBottom: '10px' }}>Certificate of Completion</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontStyle: 'italic' }}>This formally certifies that the student</p>
                            <h1 style={{ fontSize: '3rem', color: '#f8fafc', marginBottom: '20px', fontFamily: '"Georgia", serif' }}>{certData.studentName}</h1>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '10px', fontStyle: 'italic' }}>has successfully accomplished</p>
                            <h2 style={{ color: '#60a5fa', marginBottom: '40px', fontSize: '2rem' }}>{certData.courseName}</h2>
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.85rem' }}>
                                <span>Date: {certData.date}</span>
                                <span>Blockchain ID: {certData.id.split('-')[0]}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
           )}
       </div>
   );
}
