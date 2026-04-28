import React, { useState } from 'react';
import { X, User, Lock, Bell, Palette, Globe, Save, CheckCircle } from 'lucide-react';
import { useAuth, API } from '../context/AuthContext';

const TABS = [
  { k:'profile', label:'Profile', icon: User },
  { k:'password', label:'Security', icon: Lock },
  { k:'notifications', label:'Alerts', icon: Bell },
  { k:'appearance', label:'Appearance', icon: Palette },
];

export default function SettingsModal({ onClose }) {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwords, setPasswords] = useState({ current:'', newPw:'', confirm:'' });
  const [notifPrefs, setNotifPrefs] = useState({ purchases:true, lowStock:true, newUsers:true, systemAlerts:false });

  const inputStyle = { background:'#111827', border:'1px solid rgba(255,255,255,0.10)', color:'#e5e7eb', borderRadius:12, padding:'10px 14px', outline:'none', width:'100%', fontSize:13 };
  const labelStyle = { display:'block', fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em', color:'#9ca3af', marginBottom:6, fontFamily:'monospace' };

  const showSuccess = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const saveProfile = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await API.put('/auth/profile', { name: profile.name });
      updateUser(data.data.user);
      showSuccess();
    } catch(e) { setError('Failed to save profile.'); }
    finally { setLoading(false); }
  };

  const savePassword = async () => {
    if (passwords.newPw !== passwords.confirm) { setError('Passwords do not match.'); return; }
    if (passwords.newPw.length < 6) { setError('New password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    try {
      await API.put('/auth/change-password', { currentPassword: passwords.current, newPassword: passwords.newPw });
      setPasswords({ current:'', newPw:'', confirm:'' });
      showSuccess();
    } catch(e) { setError(e.response?.data?.message || 'Failed to update password.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:'#0d1117', border:'1px solid rgba(255,255,255,0.08)', borderRadius:22, width:'100%', maxWidth:680, maxHeight:'88vh', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          <h2 style={{ color:'#fff', fontWeight:700, fontSize:18, margin:0 }}>⚙ Settings</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#6b7280', cursor:'pointer', padding:6, display:'flex', borderRadius:8 }}><X size={18}/></button>
        </div>

        <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
          {/* Sidebar tabs */}
          <div style={{ width:180, borderRight:'1px solid rgba(255,255,255,0.07)', padding:'12px 10px', flexShrink:0 }}>
            {TABS.map(({k,label,icon:Icon}) => (
              <button key={k} onClick={() => { setTab(k); setError(''); }}
                style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 14px', borderRadius:12, border:'none', cursor:'pointer', marginBottom:2, textAlign:'left', fontSize:13, fontWeight: tab===k ? 700 : 400,
                  background: tab===k ? 'rgba(110,231,183,0.1)' : 'transparent',
                  color: tab===k ? '#6EE7B7' : '#9ca3af' }}>
                <Icon size={15}/>{label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex:1, overflowY:'auto', padding:'24px 28px' }}>
            {saved && (
              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', marginBottom:20, borderRadius:12, background:'rgba(110,231,183,0.1)', border:'1px solid rgba(110,231,183,0.2)', color:'#6EE7B7', fontSize:13 }}>
                <CheckCircle size={14}/> Saved successfully!
              </div>
            )}
            {error && (
              <div style={{ padding:'10px 14px', marginBottom:20, borderRadius:12, background:'rgba(244,63,94,0.1)', border:'1px solid rgba(244,63,94,0.25)', color:'#fb7185', fontSize:13 }}>{error}</div>
            )}

            {tab === 'profile' && (
              <div>
                <h3 style={{ color:'#fff', fontWeight:700, fontSize:16, margin:'0 0 20px' }}>Profile Information</h3>
                {/* Avatar */}
                <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:28 }}>
                  <div style={{ width:64, height:64, borderRadius:20, background:'rgba(110,231,183,0.1)', border:'2px solid rgba(110,231,183,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ color:'#6EE7B7', fontWeight:800, fontSize:26 }}>{user?.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p style={{ color:'#f3f4f6', fontWeight:600, fontSize:15, margin:'0 0 3px' }}>{user?.name}</p>
                    <p style={{ color:'#6b7280', fontSize:13, fontFamily:'monospace', margin:0 }}>{user?.email}</p>
                    <span style={{ fontSize:11, padding:'2px 8px', borderRadius:6, background:'rgba(110,231,183,0.1)', border:'1px solid rgba(110,231,183,0.2)', color:'#6EE7B7', fontFamily:'monospace', marginTop:6, display:'inline-block' }}>{user?.role}</span>
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                  <div>
                    <label style={labelStyle}>Display Name</label>
                    <input value={profile.name} onChange={e=>setProfile(p=>({...p,name:e.target.value}))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Email (read-only)</label>
                    <input value={profile.email} readOnly style={{...inputStyle, color:'#6b7280', cursor:'not-allowed'}} />
                  </div>
                </div>
                <button onClick={saveProfile} disabled={loading}
                  style={{ marginTop:24, display:'flex', alignItems:'center', gap:8, background:'#6EE7B7', color:'#052e16', fontWeight:700, padding:'10px 20px', borderRadius:12, border:'none', cursor:'pointer', fontSize:13 }}>
                  <Save size={14}/>{loading ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            )}

            {tab === 'password' && (
              <div>
                <h3 style={{ color:'#fff', fontWeight:700, fontSize:16, margin:'0 0 20px' }}>Change Password</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                  {[{label:'Current Password',key:'current'},{label:'New Password',key:'newPw'},{label:'Confirm New Password',key:'confirm'}].map(({label,key}) => (
                    <div key={key}>
                      <label style={labelStyle}>{label}</label>
                      <input type="password" value={passwords[key]} onChange={e=>setPasswords(p=>({...p,[key]:e.target.value}))} style={inputStyle} />
                    </div>
                  ))}
                </div>
                <button onClick={savePassword} disabled={loading}
                  style={{ marginTop:24, display:'flex', alignItems:'center', gap:8, background:'#6EE7B7', color:'#052e16', fontWeight:700, padding:'10px 20px', borderRadius:12, border:'none', cursor:'pointer', fontSize:13 }}>
                  <Lock size={14}/>{loading ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            )}

            {tab === 'notifications' && (
              <div>
                <h3 style={{ color:'#fff', fontWeight:700, fontSize:16, margin:'0 0 20px' }}>Notification Preferences</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {[
                    {k:'purchases',   label:'Purchase Alerts',    desc:'Get notified when orders are placed'},
                    {k:'lowStock',    label:'Low Stock Alerts',   desc:'Alert when products run low'},
                    {k:'newUsers',    label:'New User Signups',   desc:'When someone creates an account'},
                    {k:'systemAlerts',label:'System Alerts',      desc:'Maintenance and system updates'},
                  ].map(({k,label,desc}) => (
                    <div key={k} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderRadius:14, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                      <div>
                        <p style={{ color:'#f3f4f6', fontSize:13, fontWeight:600, margin:'0 0 3px' }}>{label}</p>
                        <p style={{ color:'#6b7280', fontSize:12, margin:0 }}>{desc}</p>
                      </div>
                      <button onClick={() => setNotifPrefs(p=>({...p,[k]:!p[k]}))}
                        style={{ width:44, height:24, borderRadius:12, border:'none', cursor:'pointer', transition:'all 0.2s', position:'relative',
                          background: notifPrefs[k] ? '#6EE7B7' : 'rgba(255,255,255,0.1)' }}>
                        <div style={{ width:18, height:18, borderRadius:'50%', background:'#fff', position:'absolute', top:3, transition:'all 0.2s', left: notifPrefs[k] ? 23 : 3 }} />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={() => { localStorage.setItem('notifPrefs', JSON.stringify(notifPrefs)); showSuccess(); }}
                  style={{ marginTop:24, display:'flex', alignItems:'center', gap:8, background:'#6EE7B7', color:'#052e16', fontWeight:700, padding:'10px 20px', borderRadius:12, border:'none', cursor:'pointer', fontSize:13 }}>
                  <Save size={14}/> Save Preferences
                </button>
              </div>
            )}

            {tab === 'appearance' && (
              <div>
                <h3 style={{ color:'#fff', fontWeight:700, fontSize:16, margin:'0 0 20px' }}>Appearance</h3>
                <div style={{ padding:'16px', borderRadius:14, background:'rgba(110,231,183,0.05)', border:'1px solid rgba(110,231,183,0.15)', marginBottom:20 }}>
                  <p style={{ color:'#6EE7B7', fontSize:13, fontWeight:600, margin:'0 0 4px' }}>🌑 Dark Mode Active</p>
                  <p style={{ color:'#6b7280', fontSize:12, margin:0 }}>InvenFlow is built for dark mode — easy on the eyes, beautiful in the dark.</p>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {[
                    {label:'Accent Color', val:'Emerald Green ✓', active:true},
                    {label:'Font Size',    val:'Medium (Default)'},
                    {label:'Sidebar Width', val:'Standard (256px)'},
                  ].map(({label, val, active}) => (
                    <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ color:'#9ca3af', fontSize:13 }}>{label}</span>
                      <span style={{ color: active ? '#6EE7B7' : '#f3f4f6', fontSize:13, fontWeight: active ? 700 : 400 }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}