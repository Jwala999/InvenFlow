import React from 'react';
import { Bell, X, CheckCheck, LogIn, UserPlus, ShoppingCart, Trash2, AlertTriangle, Package, ArrowUpCircle, Info } from 'lucide-react';
import { useNotif } from '../context/NotifContext';

const TYPE_CONFIG = {
  login:          { icon: LogIn,          color:'#38bdf8', bg:'rgba(56,189,248,0.12)',   border:'rgba(56,189,248,0.2)'  },
  register:       { icon: UserPlus,        color:'#6EE7B7', bg:'rgba(110,231,183,0.12)', border:'rgba(110,231,183,0.2)' },
  purchase:       { icon: ShoppingCart,    color:'#4ade80', bg:'rgba(74,222,128,0.12)',   border:'rgba(74,222,128,0.2)'  },
  delete_product: { icon: Trash2,          color:'#fb7185', bg:'rgba(251,113,133,0.12)', border:'rgba(251,113,133,0.2)' },
  low_stock:      { icon: AlertTriangle,   color:'#fbbf24', bg:'rgba(251,191,36,0.12)',   border:'rgba(251,191,36,0.2)'  },
  stock_in:       { icon: ArrowUpCircle,   color:'#34d399', bg:'rgba(52,211,153,0.12)',   border:'rgba(52,211,153,0.2)'  },
  stock_out:      { icon: Package,         color:'#f87171', bg:'rgba(248,113,113,0.12)', border:'rgba(248,113,113,0.2)' },
  system:         { icon: Info,            color:'#a78bfa', bg:'rgba(167,139,250,0.12)', border:'rgba(167,139,250,0.2)' },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff/1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s/60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m/60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
}

export default function NotificationPanel() {
  const { notifications, unread, isOpen, setIsOpen, markAllRead } = useNotif();

  return (
    <>
      {/* Backdrop */}
      <div onClick={() => setIsOpen(false)}
        style={{
          position:'fixed', inset:0, zIndex:98, background:'rgba(0,0,0,0.4)',
          opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none',
          transition:'opacity 0.25s',
        }} />

      {/* Panel */}
      <div style={{
        position:'fixed', top:70, right:16, width:380, maxWidth:'calc(100vw - 32px)',
        background:'#0d1117', border:'1px solid rgba(255,255,255,0.09)',
        borderRadius:18, zIndex:99, boxShadow:'0 24px 64px rgba(0,0,0,0.5)',
        maxHeight:'80vh', display:'flex', flexDirection:'column',
        opacity: isOpen ? 1 : 0, transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(-12px) scale(0.96)',
        pointerEvents: isOpen ? 'auto' : 'none', transition:'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        transformOrigin:'top right',
      }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <Bell size={16} style={{ color:'#6EE7B7' }} />
            <h3 style={{ color:'#fff', fontWeight:700, fontSize:15, margin:0 }}>Notifications</h3>
            {unread > 0 && (
              <span style={{ background:'#6EE7B7', color:'#052e16', fontSize:10, fontWeight:800, padding:'2px 7px', borderRadius:20 }}>{unread}</span>
            )}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {unread > 0 && (
              <button onClick={markAllRead}
                style={{ display:'flex', alignItems:'center', gap:5, background:'none', border:'none', color:'#6EE7B7', cursor:'pointer', fontSize:12, fontWeight:600 }}>
                <CheckCheck size={13}/> Mark all read
              </button>
            )}
            <button onClick={() => setIsOpen(false)}
              style={{ background:'none', border:'none', color:'#6b7280', cursor:'pointer', padding:4, display:'flex', alignItems:'center' }}>
              <X size={16}/>
            </button>
          </div>
        </div>

        {/* List */}
        <div style={{ overflowY:'auto', flex:1 }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign:'center', padding:'48px 24px' }}>
              <Bell size={36} style={{ color:'#1f2937', margin:'0 auto 12px' }} />
              <p style={{ color:'#6b7280', fontSize:14, fontWeight:500, margin:'0 0 4px' }}>All caught up!</p>
              <p style={{ color:'#374151', fontSize:12 }}>No notifications yet</p>
            </div>
          ) : (
            notifications.map((n, i) => {
              const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
              const Icon = cfg.icon;
              const isUnread = !n.readBy?.includes?.(n.user);
              return (
                <div key={n._id || i}
                  style={{
                    display:'flex', gap:12, padding:'14px 20px',
                    borderBottom:'1px solid rgba(255,255,255,0.04)',
                    background: i===0 && isUnread ? 'rgba(110,231,183,0.02)' : 'transparent',
                    transition:'background 0.15s',
                  }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                  onMouseLeave={e=>e.currentTarget.style.background=i===0&&isUnread?'rgba(110,231,183,0.02)':'transparent'}>

                  <div style={{ width:36, height:36, borderRadius:12, background:cfg.bg, border:`1px solid ${cfg.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Icon size={15} style={{ color: cfg.color }} />
                  </div>

                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ color:'#f3f4f6', fontSize:13, fontWeight:600, margin:'0 0 2px' }}>{n.title}</p>
                    <p style={{ color:'#9ca3af', fontSize:12, margin:'0 0 4px', lineHeight:1.4 }}>{n.message}</p>
                    <p style={{ color:'#4b5563', fontSize:11, fontFamily:'monospace', margin:0 }}>{timeAgo(n.createdAt)}</p>
                  </div>

                  {isUnread && (
                    <div style={{ width:7, height:7, borderRadius:'50%', background:'#6EE7B7', flexShrink:0, marginTop:4 }} />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}