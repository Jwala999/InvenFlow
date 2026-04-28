import React, { useEffect, useState } from 'react';
import {
  Activity, LogIn, UserPlus, ShoppingCart, Trash2,
  AlertTriangle, Package, ArrowUpCircle, Info, RefreshCw,
  Filter,
} from 'lucide-react';
import { API } from '../context/AuthContext';

const TYPE_CFG = {
  login:          { icon: LogIn,          color:'#38bdf8', bg:'rgba(56,189,248,0.12)',   border:'rgba(56,189,248,0.2)',   label:'Login'         },
  register:       { icon: UserPlus,        color:'#6EE7B7', bg:'rgba(110,231,183,0.12)', border:'rgba(110,231,183,0.2)',  label:'New Account'   },
  purchase:       { icon: ShoppingCart,    color:'#4ade80', bg:'rgba(74,222,128,0.12)',   border:'rgba(74,222,128,0.2)',   label:'Purchase'      },
  delete_product: { icon: Trash2,          color:'#f87171', bg:'rgba(248,113,113,0.12)', border:'rgba(248,113,113,0.2)', label:'Delete'        },
  low_stock:      { icon: AlertTriangle,   color:'#fbbf24', bg:'rgba(251,191,36,0.12)',   border:'rgba(251,191,36,0.2)',   label:'Low Stock'     },
  stock_in:       { icon: ArrowUpCircle,   color:'#34d399', bg:'rgba(52,211,153,0.12)',   border:'rgba(52,211,153,0.2)',   label:'Stock In'      },
  stock_out:      { icon: Package,         color:'#f87171', bg:'rgba(248,113,113,0.12)', border:'rgba(248,113,113,0.2)', label:'Stock Out'     },
  system:         { icon: Info,            color:'#a78bfa', bg:'rgba(167,139,250,0.12)', border:'rgba(167,139,250,0.2)', label:'System'        },
};

const ALL_TYPES = Object.keys(TYPE_CFG);

function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s/60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m/60); if (h < 24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
}

export default function ActivityPage() {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('');
  const [visible, setVisible]   = useState([]);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/notifications/activity');
      setActivity(data.data.activity);
    } catch { setActivity([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  // Stagger items in on load
  useEffect(() => {
    setVisible([]);
    const filtered = filter ? activity.filter(a => a.type === filter) : activity;
    filtered.forEach((_, i) => {
      setTimeout(() => setVisible(v => [...v, i]), i * 45);
    });
  }, [activity, filter]);

  const filtered = filter ? activity.filter(a => a.type === filter) : activity;

  // Summary counts
  const counts = ALL_TYPES.reduce((acc, t) => {
    acc[t] = activity.filter(a => a.type === t).length;
    return acc;
  }, {});

  return (
    <div style={{ paddingBottom:40 }}>
      {/* Header */}
      <div style={{ display:'flex', flexWrap:'wrap', alignItems:'flex-start', gap:16, marginBottom:24 }}>
        <div>
          <h2 style={{ color:'#fff', fontWeight:800, fontSize:22, margin:'0 0 4px', letterSpacing:'-0.02em' }}>
            Activity Log
          </h2>
          <p style={{ color:'#6b7280', fontSize:13, margin:0 }}>{activity.length} total events recorded</p>
        </div>
        <button onClick={fetch}
          style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8, padding:'9px 16px', borderRadius:12, background:'transparent', border:'1px solid rgba(255,255,255,0.1)', color:'#9ca3af', cursor:'pointer', fontSize:13, fontWeight:500, transition:'all 0.2s' }}
          onMouseEnter={e=>{ e.currentTarget.style.color='#6EE7B7'; e.currentTarget.style.borderColor='rgba(110,231,183,0.3)'; }}
          onMouseLeave={e=>{ e.currentTarget.style.color='#9ca3af'; e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; }}>
          <RefreshCw size={13}/> Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:12, marginBottom:24 }}>
        {[
          { type:'login',    label:'Logins',    count: counts.login || 0 },
          { type:'register', label:'Sign-ups',  count: counts.register || 0 },
          { type:'purchase', label:'Purchases', count: counts.purchase || 0 },
          { type:'low_stock',label:'Low Stock', count: counts.low_stock || 0 },
          { type:'delete_product', label:'Deletions', count: counts.delete_product || 0 },
        ].map(({ type, label, count }) => {
          const cfg = TYPE_CFG[type] || TYPE_CFG.system;
          const Icon = cfg.icon;
          return (
            <button key={type} onClick={() => setFilter(f => f === type ? '' : type)}
              style={{ background: filter===type ? cfg.bg : '#0d1117', border:`1px solid ${filter===type ? cfg.border : 'rgba(255,255,255,0.07)'}`, borderRadius:14, padding:'14px 16px', cursor:'pointer', textAlign:'left', transition:'all 0.2s', transform: filter===type ? 'translateY(-2px)' : 'none' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                <Icon size={14} style={{ color: cfg.color }}/>
                <span style={{ color: cfg.color, fontSize:11, fontFamily:'monospace', fontWeight:700 }}>{label}</span>
              </div>
              <p style={{ color:'#fff', fontWeight:800, fontSize:22, margin:0 }}>{count}</p>
            </button>
          );
        })}
      </div>

      {/* Filter pills */}
      <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:8, marginBottom:20, padding:'12px 16px', borderRadius:14, background:'#0d1117', border:'1px solid rgba(255,255,255,0.07)' }}>
        <Filter size={13} style={{ color:'#6b7280' }}/>
        <button onClick={() => setFilter('')}
          style={{ padding:'5px 13px', borderRadius:20, fontSize:12, fontFamily:'monospace', border:'none', cursor:'pointer', fontWeight: !filter ? 700 : 400,
            background: !filter ? '#6EE7B7' : 'rgba(255,255,255,0.06)', color: !filter ? '#052e16' : '#9ca3af' }}>
          All
        </button>
        {ALL_TYPES.map(t => {
          const cfg = TYPE_CFG[t];
          return (
            <button key={t} onClick={() => setFilter(f => f===t ? '' : t)}
              style={{ padding:'5px 13px', borderRadius:20, fontSize:12, fontFamily:'monospace', border: filter===t ? `1px solid ${cfg.border}` : '1px solid transparent', cursor:'pointer', fontWeight: filter===t ? 700 : 400,
                background: filter===t ? cfg.bg : 'rgba(255,255,255,0.04)', color: filter===t ? cfg.color : '#9ca3af' }}>
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Timeline */}
      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {[...Array(8)].map((_,i) => (
            <div key={i} style={{ height:72, borderRadius:14, background:'#0d1117', border:'1px solid rgba(255,255,255,0.06)', animation:'pulse 1.5s ease infinite' }}/>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'80px 20px' }}>
          <Activity size={48} style={{ color:'#1f2937', margin:'0 auto 16px' }}/>
          <p style={{ color:'#6b7280', fontSize:15, fontWeight:500 }}>No activity found</p>
          <p style={{ color:'#374151', fontSize:13 }}>Events will appear here as they happen</p>
        </div>
      ) : (
        <div style={{ position:'relative' }}>
          {/* Vertical timeline line */}
          <div style={{ position:'absolute', left:27, top:0, bottom:0, width:2, background:'rgba(255,255,255,0.05)', borderRadius:2 }}/>

          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {filtered.map((item, i) => {
              const cfg = TYPE_CFG[item.type] || TYPE_CFG.system;
              const Icon = cfg.icon;
              const isVisible = visible.includes(i);
              return (
                <div key={item._id || i}
                  style={{
                    display:'flex', alignItems:'flex-start', gap:16,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateX(0)' : 'translateX(-16px)',
                    transition:'opacity 0.3s ease, transform 0.3s ease',
                  }}>
                  {/* Timeline dot */}
                  <div style={{ width:56, display:'flex', justifyContent:'center', flexShrink:0, paddingTop:16, zIndex:1 }}>
                    <div style={{ width:36, height:36, borderRadius:12, background:cfg.bg, border:`1px solid ${cfg.border}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Icon size={15} style={{ color: cfg.color }}/>
                    </div>
                  </div>

                  {/* Card */}
                  <div style={{ flex:1, background:'#0d1117', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'14px 18px', marginBottom:2, transition:'border-color 0.2s' }}
                    onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.13)'}
                    onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'}>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                          <span style={{ color:'#f3f4f6', fontWeight:700, fontSize:13 }}>{item.title}</span>
                          <span style={{ fontSize:10, padding:'2px 8px', borderRadius:6, background:cfg.bg, border:`1px solid ${cfg.border}`, color:cfg.color, fontFamily:'monospace', fontWeight:700 }}>
                            {cfg.label}
                          </span>
                        </div>
                        <p style={{ color:'#9ca3af', fontSize:12, margin:'4px 0 0', lineHeight:1.5 }}>{item.message}</p>
                        {item.user?.name && (
                          <p style={{ color:'#4b5563', fontSize:11, margin:'4px 0 0', fontFamily:'monospace' }}>
                            by {item.user.name}
                          </p>
                        )}
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <p style={{ color:'#6b7280', fontSize:11, fontFamily:'monospace', margin:0, whiteSpace:'nowrap' }}>{timeAgo(item.createdAt)}</p>
                        <p style={{ color:'#374151', fontSize:10, fontFamily:'monospace', margin:'3px 0 0' }}>
                          {new Date(item.createdAt).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}