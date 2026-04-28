import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, ArrowRight, User, Mail, Lock } from 'lucide-react';
import { useAuth, API } from '../context/AuthContext';

export default function RegisterPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to="/" replace />;

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Passwords do not match.'); return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }
    setError(''); setLoading(true);
    try {
      await API.post('/auth/register', { name: form.name, email: form.email, password: form.password });
      await login(form.email, form.password);
      navigate('/shop');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  const inputStyle = {
    background:'#111827', border:'1px solid rgba(255,255,255,0.10)', color:'#e5e7eb',
    borderRadius:12, padding:'10px 14px 10px 38px', outline:'none', width:'100%', fontSize:14,
    transition:'border-color 0.2s',
  };

  return (
    <div style={{ minHeight:'100vh', background:'#080B12', display:'flex', alignItems:'center', justifyContent:'center', padding:16, position:'relative', overflow:'hidden' }}>
      <div style={{ position:'fixed', top:'-20%', right:'-10%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(110,231,183,0.07) 0%,transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'fixed', bottom:'-20%', left:'-10%', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle,rgba(56,189,248,0.05) 0%,transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'fixed', inset:0, backgroundImage:'linear-gradient(rgba(110,231,183,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(110,231,183,0.03) 1px,transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none', opacity:0.5 }} />

      <div style={{ width:'100%', maxWidth:460, position:'relative', zIndex:10 }}>
        {/* Brand */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <Link to="/login" style={{ textDecoration:'none' }}>
            <div style={{ width:60, height:60, borderRadius:18, background:'rgba(110,231,183,0.1)', border:'1px solid rgba(110,231,183,0.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', boxShadow:'0 0 30px rgba(110,231,183,0.1)' }}>
              <Zap size={26} style={{ color:'#6EE7B7' }} />
            </div>
          </Link>
          <h1 style={{ color:'#fff', fontWeight:800, fontSize:26, letterSpacing:'-0.02em', margin:0 }}>Create Account</h1>
          <p style={{ color:'#6b7280', fontSize:14, marginTop:6 }}>Join InvenFlow — start shopping today</p>
        </div>

        <div style={{ background:'#0d1117', border:'1px solid rgba(255,255,255,0.07)', borderRadius:20, padding:32 }}>
          {error && (
            <div style={{ padding:'11px 16px', marginBottom:18, borderRadius:12, background:'rgba(244,63,94,0.1)', border:'1px solid rgba(244,63,94,0.25)', color:'#fb7185', fontSize:13 }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* Full Name */}
            <div>
              <label style={{ display:'block', fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em', color:'#9ca3af', marginBottom:6, fontFamily:'monospace' }}>Full Name *</label>
              <div style={{ position:'relative' }}>
                <User size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#6b7280' }} />
                <input type="text" value={form.name} onChange={e=>f('name',e.target.value)} style={inputStyle} placeholder="John Doe" required />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ display:'block', fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em', color:'#9ca3af', marginBottom:6, fontFamily:'monospace' }}>Email Address *</label>
              <div style={{ position:'relative' }}>
                <Mail size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#6b7280' }} />
                <input type="email" value={form.email} onChange={e=>f('email',e.target.value)} style={inputStyle} placeholder="you@example.com" required />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display:'block', fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em', color:'#9ca3af', marginBottom:6, fontFamily:'monospace' }}>Password *</label>
              <div style={{ position:'relative' }}>
                <Lock size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#6b7280' }} />
                <input type={showPw?'text':'password'} value={form.password} onChange={e=>f('password',e.target.value)} style={{...inputStyle, paddingRight:40}} placeholder="Min. 6 characters" required />
                <button type="button" onClick={()=>setShowPw(!showPw)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#6b7280', cursor:'pointer', padding:0 }}>
                  {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div>
              <label style={{ display:'block', fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em', color:'#9ca3af', marginBottom:6, fontFamily:'monospace' }}>Confirm Password *</label>
              <div style={{ position:'relative' }}>
                <Lock size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#6b7280' }} />
                <input type={showPw?'text':'password'} value={form.confirm} onChange={e=>f('confirm',e.target.value)}
                  style={{...inputStyle, borderColor: form.confirm && form.password !== form.confirm ? 'rgba(244,63,94,0.5)' : 'rgba(255,255,255,0.10)'}}
                  placeholder="Repeat password" required />
              </div>
              {form.confirm && form.password !== form.confirm && (
                <p style={{ color:'#fb7185', fontSize:11, marginTop:5 }}>Passwords do not match</p>
              )}
            </div>

            <button type="submit" disabled={loading}
              style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'#6EE7B7', color:'#052e16', fontWeight:700, borderRadius:12, padding:'11px 20px', border:'none', cursor:loading?'not-allowed':'pointer', fontSize:14, marginTop:4 }}>
              {loading
                ? <div style={{ width:16, height:16, border:'2px solid rgba(5,46,22,0.3)', borderTopColor:'#052e16', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
                : <><span>Create Account</span><ArrowRight size={16}/></>}
            </button>
          </form>

          <div style={{ marginTop:22, paddingTop:18, borderTop:'1px solid rgba(255,255,255,0.07)', textAlign:'center' }}>
            <p style={{ color:'#6b7280', fontSize:13 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color:'#6EE7B7', textDecoration:'none', fontWeight:600 }}>Sign in</Link>
            </p>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}