import React, { useState, useEffect, useCallback } from 'react';
import InstructorDashboard from '@/components/InstructorDashboard';
import StudentDashboard from '@/components/StudentDashboard';

export default function Home() {
  const [token, setToken] = useState('');
  const [user, setUser] = useState<{ id: string, email: string, role: string } | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const [courses, setCourses] = useState<any[]>([]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin ? { email, password } : { email, password, name: email.split('@')[0] };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const data = await res.json();
    if (data.token) {
      setToken(data.token);
      setUser(data.user);
    } else alert(data.error);
  };

  const fetchCourses = useCallback(async () => {
    if (!token) return;
    const res = await fetch('/api/courses', { headers: { Authorization: `Bearer ${token}` } });
    const d = await res.json();
    if(Array.isArray(d)) setCourses(d);
  }, [token]);

  useEffect(() => { if (token) fetchCourses(); }, [token, fetchCourses]);

  if (!token) {
    return (
      <div className="auth-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        
        {/* Animated Background Spheres */}
        <div className="blob-bg" style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(40px)', animation: 'float 6s ease-in-out infinite' }}></div>
        <div className="blob-bg" style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(40px)', animation: 'float 8s ease-in-out infinite reverse' }}></div>

        <div className="auth-container fade-in" style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '420px' }}>
          <div className="glass-panel auth-panel" style={{ padding: '40px', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h1 style={{ fontSize: '2.5rem', background: 'linear-gradient(to right, #60a5fa, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '10px' }}>Nexus Academy</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Log in to shape your future.</p>
            </div>

            <h2 style={{ marginBottom: '24px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 500 }}>
              {isLogin ? 'Welcome Back' : 'Create an Account'}
            </h2>
            
            <form onSubmit={handleAuth}>
              <div className="input-group">
                <label className="input-label">Email Address</label>
                <input type="email" className="glass-input auth-input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="input-group" style={{ marginBottom: '30px' }}>
                <label className="input-label">Password</label>
                <input type="password" className="glass-input auth-input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary auth-submit" style={{ padding: '14px', fontSize: '1.1rem', letterSpacing: '1px' }}>
                {isLogin ? 'Secure Sign In' : 'Join the Platform'}
              </button>
            </form>
            
            <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '20px' }}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span style={{ color: '#60a5fa', cursor: 'pointer', fontWeight: 600, transition: 'color 0.3s' }} className="hover-glow" onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'Register' : 'Sign In'}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <nav className="navbar fade-in" style={{ padding: '15px 30px' }}>
        <div className="nav-brand" style={{ fontSize: '1.8rem' }}>Nexus Academy</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '0.9rem' }}>Logged in as <b style={{ color: 'white' }}>{user.email}</b> <span style={{ padding: '2px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '0.7rem' }}>{user.role}</span></span>
          <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => { setToken(''); setUser(null); }}>Logout</button>
        </div>
      </nav>

      <main className="container" style={{ animationDelay: '0.2s', maxWidth: '1400px' }}>
        {user.role === 'INSTRUCTOR' || user.role === 'ADMIN' ? (
            <InstructorDashboard token={token} user={user} courses={courses} fetchCourses={fetchCourses} />
        ) : (
            <StudentDashboard token={token} user={user} courses={courses} fetchCourses={fetchCourses} />
        )}
      </main>
    </div>
  );
}
