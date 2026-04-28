import React, { useEffect, useState } from 'react';
import { Users, ShieldCheck, ShieldX, Trash2, UserPlus, X, RefreshCw } from 'lucide-react';
import { API } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';

const S = {
  card:       { background:'#0d1117', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16 },
  input:      { background:'#111827', border:'1px solid rgba(255,255,255,0.10)', color:'#e5e7eb', borderRadius:12, padding:'9px 14px', outline:'none', width:'100%', fontSize:13 },
  label:      { display:'block', fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em', color:'#9ca3af', marginBottom:6, fontFamily:'monospace' },
  btnPrimary: { background:'#6EE7B7', color:'#052e16', fontWeight:700, borderRadius:12, padding:'9px 20px', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontSize:13 },
  btnGhost:   { background:'transparent', color:'#9ca3af', borderRadius:12, padding:'9px 16px', border:'1px solid rgba(255,255,255,0.12)', cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontSize:13 },
};

function AddUserModal({ onClose, onDone }) {
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'staff' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await API.post('/auth/register', form);
      onDone(); onClose();
    } catch(err) {
      setError(err.response?.data?.message || 'Failed to create user.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.78)', backdropFilter:'blur(6px)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ ...S.card, width:'100%', maxWidth:420 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'18px 24px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          <UserPlus size={18} style={{ color:'#6EE7B7' }} />
          <h2 style={{ color:'#fff', fontWeight:700, fontSize:17 }}>Add Team Member</h2>
          <button onClick={onClose} style={{ marginLeft:'auto', background:'none', border:'none', color:'#6b7280', cursor:'pointer', padding:4 }}><X size={17}/></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding:24, display:'flex', flexDirection:'column', gap:16 }}>
          {error && (
            <div style={{ padding:'10px 14px', borderRadius:10, background:'rgba(244,63,94,0.1)', border:'1px solid rgba(244,63,94,0.25)', color:'#fb7185', fontSize:13 }}>{error}</div>
          )}
          {[{label:'Full Name',key:'name',type:'text'},{label:'Email Address',key:'email',type:'email'},{label:'Password',key:'password',type:'password'}].map(({label,key,type}) => (
            <div key={key}>
              <label style={S.label}>{label} *</label>
              <input type={type} value={form[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}
                style={S.input} required />
            </div>
          ))}
          <div>
            <label style={S.label}>Role</label>
            <select value={form.role} onChange={e=>setForm(p=>({...p,role:e.target.value}))}
              style={{...S.input,cursor:'pointer'}}>
              <option value="staff" style={{background:'#111827',color:'#e5e7eb'}}>Staff</option>
              <option value="admin" style={{background:'#111827',color:'#e5e7eb'}}>Admin</option>
            </select>
          </div>
          <div style={{ display:'flex', gap:10, marginTop:4 }}>
            <button type="button" onClick={onClose} style={{...S.btnGhost,flex:1}}>Cancel</button>
            <button type="submit" disabled={loading} style={{...S.btnPrimary,flex:1}}>
              {loading?'Creating…':'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UserCard({ u, currentUserId, onToggle, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const isYou = u._id === currentUserId;

  return (
    <div onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{ ...S.card, padding:'18px 20px', display:'flex', alignItems:'center', gap:14, transition:'border-color 0.2s', borderColor: hovered ? 'rgba(110,231,183,0.2)' : 'rgba(255,255,255,0.07)' }}>

      {/* Avatar */}
      <div style={{ position:'relative', flexShrink:0 }}>
        <div style={{ width:46, height:46, borderRadius:14, background:'rgba(110,231,183,0.1)', border:'1px solid rgba(110,231,183,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ color:'#6EE7B7', fontWeight:700, fontSize:18 }}>{u.name.charAt(0).toUpperCase()}</span>
        </div>
        <span style={{ position:'absolute', bottom:-3, right:-3, width:13, height:13, borderRadius:'50%', border:'2px solid #0d1117', background: u.isActive ? '#4ade80' : '#4b5563' }} />
      </div>

      {/* Info */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          <span style={{ color:'#f3f4f6', fontWeight:600, fontSize:14 }}>{u.name}</span>
          {isYou && (
            <span style={{ fontSize:10, padding:'2px 7px', borderRadius:6, background:'rgba(56,189,248,0.12)', border:'1px solid rgba(56,189,248,0.25)', color:'#38bdf8', fontFamily:'monospace', fontWeight:600 }}>You</span>
          )}
        </div>
        <p style={{ color:'#6b7280', fontSize:12, marginTop:3, fontFamily:'monospace' }}>{u.email}</p>
        <div style={{ display:'flex', gap:6, marginTop:6, flexWrap:'wrap' }}>
          {u.role==='admin'
            ? <span style={{ fontSize:10, padding:'2px 8px', borderRadius:6, background:'rgba(110,231,183,0.1)', border:'1px solid rgba(110,231,183,0.2)', color:'#6EE7B7', fontFamily:'monospace', fontWeight:600, display:'flex', alignItems:'center', gap:4 }}><ShieldCheck size={9}/>Admin</span>
            : <span style={{ fontSize:10, padding:'2px 8px', borderRadius:6, background:'rgba(56,189,248,0.1)', border:'1px solid rgba(56,189,248,0.2)', color:'#38bdf8', fontFamily:'monospace', fontWeight:600 }}>Staff</span>}
          {!u.isActive && (
            <span style={{ fontSize:10, padding:'2px 8px', borderRadius:6, background:'rgba(107,114,128,0.15)', border:'1px solid rgba(107,114,128,0.2)', color:'#9ca3af', fontFamily:'monospace' }}>Deactivated</span>
          )}
        </div>
      </div>

      {/* Meta + Actions */}
      <div style={{ textAlign:'right', flexShrink:0 }}>
        <p style={{ fontSize:11, color:'#4b5563', fontFamily:'monospace', marginBottom:8 }}>
          {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never logged in'}
        </p>
        {!isYou && (
          <div style={{ display:'flex', gap:6, justifyContent:'flex-end' }}>
            <button onClick={() => onToggle(u._id)}
              title={u.isActive ? 'Deactivate' : 'Activate'}
              style={{ padding:8, borderRadius:8, border: u.isActive ? '1px solid rgba(245,158,11,0.25)' : '1px solid rgba(34,197,94,0.25)', background:'none', color: u.isActive ? '#fbbf24' : '#4ade80', cursor:'pointer' }}>
              {u.isActive ? <ShieldX size={13}/> : <ShieldCheck size={13}/>}
            </button>
            <button onClick={() => onDelete(u._id)}
              style={{ padding:8, borderRadius:8, border:'1px solid rgba(244,63,94,0.25)', background:'none', color:'#f87171', cursor:'pointer' }}>
              <Trash2 size={13}/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]   = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/users');
      setUsers(data.data.users);
    } catch { setUsers([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleUser = async (id) => { await API.put(`/users/${id}/toggle`); fetchUsers(); };
  const deleteUser = async (id) => {
    if (!confirm('Delete this user permanently?')) return;
    await API.delete(`/users/${id}`); fetchUsers();
  };

  const admins = users.filter(u => u.role==='admin');
  const staff  = users.filter(u => u.role==='staff');

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', gap:16 }}>
        <div>
          <h2 style={{ color:'#fff', fontWeight:700, fontSize:20 }}>Team Members</h2>
          <p style={{ color:'#6b7280', fontSize:13, marginTop:2 }}>{users.length} total users</p>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', gap:10 }}>
          <button onClick={fetchUsers} style={S.btnGhost}><RefreshCw size={13}/></button>
          <button onClick={()=>setModal(true)} style={S.btnPrimary}><UserPlus size={14}/> Add User</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
        {[
          {label:'Total Users', value:users.length, color:'#f3f4f6'},
          {label:'Active',      value:users.filter(u=>u.isActive).length, color:'#4ade80'},
          {label:'Admins',      value:admins.length, color:'#6EE7B7'},
        ].map(({label,value,color}) => (
          <div key={label} style={{ ...S.card, padding:'18px 20px', textAlign:'center' }}>
            <p style={{ fontWeight:800, fontSize:28, color }}>{value}</p>
            <p style={{ fontSize:11, color:'#6b7280', marginTop:4, fontFamily:'monospace', textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:14 }}>
          {[...Array(4)].map((_,i) => (
            <div key={i} style={{ ...S.card, height:90, animation:'pulse 1.5s ease infinite' }} />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {admins.length > 0 && (
            <section>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                <ShieldCheck size={14} style={{ color:'#6EE7B7' }} />
                <h3 style={{ color:'#f3f4f6', fontWeight:700, fontSize:14 }}>Administrators</h3>
                <span style={{ fontSize:10, padding:'2px 8px', borderRadius:6, background:'rgba(110,231,183,0.1)', border:'1px solid rgba(110,231,183,0.2)', color:'#6EE7B7', fontFamily:'monospace', fontWeight:700 }}>{admins.length}</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:12 }}>
                {admins.map(u => <UserCard key={u._id} u={u} currentUserId={currentUser?._id} onToggle={toggleUser} onDelete={deleteUser}/>)}
              </div>
            </section>
          )}

          {staff.length > 0 && (
            <section>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                <Users size={14} style={{ color:'#38bdf8' }} />
                <h3 style={{ color:'#f3f4f6', fontWeight:700, fontSize:14 }}>Staff Members</h3>
                <span style={{ fontSize:10, padding:'2px 8px', borderRadius:6, background:'rgba(56,189,248,0.1)', border:'1px solid rgba(56,189,248,0.2)', color:'#38bdf8', fontFamily:'monospace', fontWeight:700 }}>{staff.length}</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:12 }}>
                {staff.map(u => <UserCard key={u._id} u={u} currentUserId={currentUser?._id} onToggle={toggleUser} onDelete={deleteUser}/>)}
              </div>
            </section>
          )}

          {users.length === 0 && (
            <div style={{ ...S.card, padding:64, textAlign:'center' }}>
              <Users size={40} style={{ color:'#374151', margin:'0 auto 16px' }} />
              <p style={{ color:'#6b7280', fontSize:14 }}>No users found</p>
            </div>
          )}
        </div>
      )}

      {modal && <AddUserModal onClose={()=>setModal(false)} onDone={fetchUsers}/>}
    </div>
  );
}