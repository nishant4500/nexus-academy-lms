import React, { useState } from 'react';

interface Props {
  token: string;
  user: { id: string, email: string, role: string };
  courses: any[];
  fetchCourses: () => void;
}

export default function InstructorDashboard({ token, user, courses, fetchCourses }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [activeCourse, setActiveCourse] = useState<any>(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleContent, setModuleContent] = useState('');

  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceUrl, setResourceUrl] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [qText, setQText] = useState('');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');

  const createCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, description })
    });
    fetchCourses();
    setTitle(''); setDescription('');
  };

  const createModule = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: moduleTitle, content: moduleContent, courseId: activeCourse.id })
    });
    setModuleTitle(''); setModuleContent('');
    fetchCourses();
  };

  const attachResource = async (moduleId: string) => {
    await fetch('/api/resources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: resourceTitle, url: resourceUrl, moduleId })
    });
    setResourceTitle(''); setResourceUrl('');
    alert('Resource Link Attached (US-05)');
    fetchCourses();
  };

  const attachQuiz = async (moduleId: string) => {
    await fetch('/api/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: quizTitle,
        moduleId,
        questions: [{
          text: qText,
          options: [
            { text: opt1, isCorrect: true },
            { text: opt2, isCorrect: false }
          ]
        }]
      })
    });
    setQuizTitle(''); setQText(''); setOpt1(''); setOpt2('');
    alert('Quiz Created (US-07)');
    fetchCourses();
  }

  return (
    <div className="fade-in">
        <h2 style={{ marginBottom: '20px' }}>Instructor Command Center</h2>
        
        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)' }}>
           <div>
               <div className="glass-panel" style={{ marginBottom: '20px' }}>
                   <h3 style={{ marginBottom: '10px' }}>🚀 Create New Course</h3>
                   <form onSubmit={createCourse}>
                       <input className="glass-input" placeholder="Course Title" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ marginTop: '10px' }} />
                       <input className="glass-input" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required style={{ marginTop: '10px' }} />
                       <button className="btn-primary" style={{ marginTop: '15px' }}>Publish Course</button>
                   </form>
               </div>

               {courses.filter((c:any) => c.instructorId === user.id || user.role === 'ADMIN').map((c: any) => (
                   <div key={c.id} className="glass-panel" style={{ marginBottom: '10px', cursor: 'pointer', border: activeCourse?.id === c.id ? '1px solid var(--accent-primary)' : '' }} onClick={() => setActiveCourse(c)}>
                       <h4>{c.title}</h4>
                   </div>
               ))}
           </div>
           
           {activeCourse && (
               <div className="glass-panel">
                   <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>Manage Course Modules</h3>
                   <div style={{ marginTop: '20px' }}>
                     <form onSubmit={createModule}>
                       <input className="glass-input" placeholder="New Module Title" value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} required style={{ marginTop: '10px' }} />
                       <textarea className="glass-input" placeholder="Module Subject Material" value={moduleContent} onChange={(e) => setModuleContent(e.target.value)} rows={3} required style={{ marginTop: '10px' }} />
                       <button className="btn-secondary" style={{ marginTop: '15px', width: '100%' }}>Create Module</button>
                     </form>
                   </div>

                   <hr style={{ margin: '20px 0', borderColor: 'rgba(255,255,255,0.1)' }} />
                   
                   <h4>Attach Resources & Quizzes</h4>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                     <div style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                       <h5>🔗 Add URL Resource</h5>
                       <select className="glass-input" id="rid" style={{ marginTop: '5px' }}>
                          {activeCourse.modules?.map((m: any) => <option value={m.id} key={m.id}>{m.title}</option>)}
                       </select>
                       <input className="glass-input" placeholder="Link Title" value={resourceTitle} onChange={e=>setResourceTitle(e.target.value)} style={{ marginTop: '5px' }} />
                       <input className="glass-input" placeholder="https://" value={resourceUrl} onChange={e=>setResourceUrl(e.target.value)} style={{ marginTop: '5px' }} />
                       <button className="btn-secondary" style={{ marginTop: '10px', fontSize: '0.8rem' }} onClick={() => attachResource((document.getElementById('rid') as any).value)}>Add Reference Link</button>
                     </div>

                     <div style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                       <h5>📝 Add Quiz</h5>
                       <select className="glass-input" id="qid" style={{ marginTop: '5px' }}>
                          {activeCourse.modules?.map((m: any) => <option value={m.id} key={m.id}>{m.title}</option>)}
                       </select>
                       <input className="glass-input" placeholder="Quiz Title" value={quizTitle} onChange={e=>setQuizTitle(e.target.value)} style={{ marginTop: '5px' }} />
                       <input className="glass-input" placeholder="Question Text" value={qText} onChange={e=>setQText(e.target.value)} style={{ marginTop: '5px' }} />
                       <input className="glass-input" placeholder="Correct Option" value={opt1} onChange={e=>setOpt1(e.target.value)} style={{ marginTop: '5px' }} />
                       <input className="glass-input" placeholder="Wrong Option" value={opt2} onChange={e=>setOpt2(e.target.value)} style={{ marginTop: '5px' }} />
                       <button className="btn-secondary" style={{ marginTop: '10px', fontSize: '0.8rem' }} onClick={() => attachQuiz((document.getElementById('qid') as any).value)}>Generate Quiz</button>
                     </div>
                   </div>
               </div>
           )}
        </div>
    </div>
  );
}
