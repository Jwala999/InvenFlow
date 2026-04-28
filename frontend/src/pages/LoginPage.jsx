import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, ArrowRight, Lock, Mail, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { user, login } = useAuth();
  const [email, setEmail]       = useState('admin@inventory.com');
  const [password, setPassword] = useState('admin123');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [mounted, setMounted]   = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally { setLoading(false); }
  };

  const inputStyle = {
    background:'#111827', border:'1px solid rgba(255,255,255,0.10)', color:'#e5e7eb',
    borderRadius:12, padding:'10px 14px 10px 38px', outline:'none', width:'100%', fontSize:14,
    transition:'border-color 0.2s',
  };

  return (
    <div style={{ minHeight:'100vh', background:'#080B12', display:'flex', alignItems:'center', justifyContent:'center', padding:16, position:'relative', overflow:'hidden' }}>
      {/* Glow blobs */}
      <div style={{ position:'fixed', top:'-20%', left:'-10%', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle,rgba(110,231,183,0.07) 0%,transparent 70%)', pointerEvents:'none', animation:'floatBlob 8s ease-in-out infinite' }}/>
      <div style={{ position:'fixed', bottom:'-20%', right:'-10%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(56,189,248,0.05) 0%,transparent 70%)', pointerEvents:'none', animation:'floatBlob 10s ease-in-out infinite reverse' }}/>
      {/* Grid */}
      <div style={{ position:'fixed', inset:0, backgroundImage:'linear-gradient(rgba(110,231,183,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(110,231,183,0.03) 1px,transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none', opacity:0.6 }}/>

      <div style={{ width:'100%', maxWidth:440, position:'relative', zIndex:10, opacity: mounted?1:0, transform: mounted?'translateY(0)':'translateY(20px)', transition:'opacity 0.5s ease, transform 0.5s ease' }}>
        {/* Brand */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:64, height:64, borderRadius:20, background:'rgba(110,231,183,0.1)', border:'1px solid rgba(110,231,183,0.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', boxShadow:'0 0 40px rgba(110,231,183,0.12)' }}>
            <Zap size={28} style={{ color:'#6EE7B7' }}/>
          </div>
          <h1 style={{ color:'#fff', fontWeight:800, fontSize:28, letterSpacing:'-0.02em', margin:0 }}>InvenFlow</h1>
          <p style={{ color:'#6b7280', fontSize:14, marginTop:6 }}>Inventory Management System</p>
        </div>

        {/* Card */}
        <div style={{ background:'#0d1117', border:'1px solid rgba(255,255,255,0.07)', borderRadius:22, padding:32, boxShadow:'0 32px 64px rgba(0,0,0,0.4)' }}>
          <h2 style={{ color:'#fff', fontWeight:700, fontSize:20, margin:'0 0 4px' }}>Welcome back</h2>
          <p style={{ color:'#6b7280', fontSize:14, margin:'0 0 24px' }}>Sign in to your account</p>

          {error && (
            <div style={{ padding:'12px 16px', marginBottom:20, borderRadius:12, background:'rgba(244,63,94,0.08)', border:'1px solid rgba(244,63,94,0.2)', color:'#fb7185', fontSize:13, display:'flex', alignItems:'center', gap:8 }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* Email */}
            <div>
              <label style={{ display:'block', fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em', color:'#9ca3af', marginBottom:6, fontFamily:'monospace' }}>Email</label>
              <div style={{ position:'relative' }}>
                <Mail size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#6b7280' }}/>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} style={inputStyle} placeholder="you@example.com" required
                  onFocus={e=>e.target.style.borderColor='rgba(110,231,183,0.4)'}
                  onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.10)'}/>
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display:'block', fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em', color:'#9ca3af', marginBottom:6, fontFamily:'monospace' }}>Password</label>
              <div style={{ position:'relative' }}>
                <Lock size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#6b7280' }}/>
                <input type={showPw?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}
                  style={{...inputStyle, paddingRight:40}} placeholder="••••••••" required
                  onFocus={e=>e.target.style.borderColor='rgba(110,231,183,0.4)'}
                  onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.10)'}/>
                <button type="button" onClick={()=>setShowPw(!showPw)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#6b7280', cursor:'pointer', display:'flex' }}>
                  {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, background: loading?'#4ade80':'#6EE7B7', color:'#052e16', fontWeight:700, borderRadius:12, padding:'11px 20px', border:'none', cursor: loading?'not-allowed':'pointer', fontSize:14, marginTop:4, transition:'all 0.2s', boxShadow:'0 0 20px rgba(110,231,183,0.2)' }}>
              {loading
                ? <div style={{ width:16, height:16, border:'2px solid rgba(5,46,22,0.3)', borderTopColor:'#052e16', borderRadius:'50%', animation:'spin 0.7s linear infinite' }}/>
                : <><span>Sign In</span><ArrowRight size={16}/></>}
            </button>
          </form>

          {/* Demo creds */}
          <div style={{ marginTop:24, paddingTop:20, borderTop:'1px solid rgba(255,255,255,0.07)' }}>
            <p style={{ fontSize:11, color:'#6b7280', textAlign:'center', marginBottom:12, fontFamily:'monospace', textTransform:'uppercase', letterSpacing:'0.06em' }}>Demo Credentials</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                { role:'Admin', email:'admin@inventory.com', pw:'admin123', color:'#6EE7B7', bg:'rgba(110,231,183,0.05)', border:'rgba(110,231,183,0.15)' },
                { role:'Staff', email:'staff@inventory.com', pw:'staff123', color:'#38bdf8', bg:'rgba(56,189,248,0.05)', border:'rgba(56,189,248,0.15)' },
              ].map(({ role, email:e, pw, color, bg, border }) => (
                <button key={role} type="button" onClick={()=>{ setEmail(e); setPassword(pw); }}
                  style={{ textAlign:'left', padding:'10px 12px', borderRadius:12, background:bg, border:`1px solid ${border}`, cursor:'pointer', transition:'all 0.15s' }}
                  onMouseEnter={ev=>ev.currentTarget.style.opacity='0.8'}
                  onMouseLeave={ev=>ev.currentTarget.style.opacity='1'}>
                  <p style={{ fontSize:11, fontWeight:700, color, fontFamily:'monospace', margin:0 }}>{role}</p>
                  <p style={{ fontSize:10, color:'#6b7280', margin:'3px 0 0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Register + Shop links */}
          <div style={{ marginTop:20, paddingTop:18, borderTop:'1px solid rgba(255,255,255,0.07)', display:'flex', flexDirection:'column', gap:10 }}>
            <p style={{ color:'#6b7280', fontSize:13, textAlign:'center', margin:0 }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color:'#6EE7B7', textDecoration:'none', fontWeight:700 }}>Create one free</Link>
            </p>
            <Link to="/shop"
              style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'9px', borderRadius:12, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'#9ca3af', textDecoration:'none', fontSize:13, fontWeight:500, transition:'all 0.2s' }}
              onMouseEnter={e=>{ e.currentTarget.style.color='#6EE7B7'; e.currentTarget.style.borderColor='rgba(110,231,183,0.2)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.color='#9ca3af'; e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; }}>
              <ShoppingBag size={14}/> Browse Shop without signing in
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes floatBlob{0%,100%{transform:translateY(0)}50%{transform:translateY(-30px)}}
      `}</style>
    </div>
  );
}