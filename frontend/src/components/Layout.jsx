import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, BarChart3, Users, LogOut,
  Bell, Search, Menu, X, Zap, ShieldCheck, Settings,
  Activity, ShoppingCart, Store, ChevronRight, ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotif } from '../context/NotifContext';
import NotificationPanel from './NotificationPanel';
import SettingsModal from './SettingsModal';

const NAV_ITEMS = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard',  end: true },
  { to: '/products',  icon: Package,         label: 'Products' },
  { to: '/stock',     icon: BarChart3,        label: 'Stock Logs' },
  { to: '/orders',    icon: ShoppingBag,      label: 'My Orders' },
  { to: '/activity',  icon: Activity,         label: 'Activity' },
  { to: '/users',     icon: Users,            label: 'Users',     adminOnly: true },
];

const PAGE_TITLES = {
  '/':          'Dashboard',
  '/products':  'Products',
  '/stock':     'Stock Logs',
  '/orders':    'My Orders',
  '/activity':  'Activity',
  '/users':     'Users',
};

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const { totalItems, setIsOpen: openCart } = useCart();
  const { unread, isOpen: notifOpen, setIsOpen: setNotifOpen } = useNotif();
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const pageTitle = PAGE_TITLES[location.pathname] || 'Overview';

  // Page-transition animation (no opacity:0 flash)
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(10px)';
    const raf = requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.28s ease, transform 0.28s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
    return () => cancelAnimationFrame(raf);
  }, [location.pathname]);

  // Global quick-search: navigate to products with ?search=
  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchVal.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal('');
    }
  };

  return (
    <div style={{ display:'flex', height:'100vh', background:'#080B12', overflow:'hidden', position:'relative' }}>

      {/* ── Background grid ── */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', opacity:0.25,
        backgroundImage:'linear-gradient(rgba(110,231,183,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(110,231,183,0.05) 1px,transparent 1px)',
        backgroundSize:'40px 40px' }} />

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:20, backdropFilter:'blur(4px)' }} />
      )}

      {/* ══════════════ SIDEBAR ══════════════ */}
      <aside style={{
        position: 'fixed', top:0, left:0, bottom:0, width:256,
        background:'#0d1117', borderRight:'1px solid rgba(255,255,255,0.06)',
        display:'flex', flexDirection:'column', zIndex:30,
        transition:'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
      }}
      className="lg-sidebar">

        {/* Brand */}
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'20px 24px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width:36, height:36, borderRadius:12, background:'#6EE7B7', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 20px rgba(110,231,183,0.3)', flexShrink:0 }}>
            <Zap size={17} fill="#052e16" color="#052e16" />
          </div>
          <div>
            <p style={{ color:'#fff', fontWeight:800, fontSize:15, margin:0, letterSpacing:'-0.02em' }}>InvenFlow</p>
            <p style={{ color:'#4b5563', fontSize:10, fontFamily:'monospace', margin:0, textTransform:'uppercase', letterSpacing:'0.1em' }}>Management</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} style={{ marginLeft:'auto', background:'none', border:'none', color:'#6b7280', cursor:'pointer', display:'flex', padding:4 }} className="lg-hide">
            <X size={17}/>
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex:1, padding:'12px', overflowY:'auto' }}>
          <p style={{ fontSize:10, color:'#4b5563', textTransform:'uppercase', letterSpacing:'0.1em', fontFamily:'monospace', padding:'4px 12px 10px' }}>Navigation</p>

          {NAV_ITEMS.filter(i => !i.adminOnly || isAdmin).map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display:'flex', alignItems:'center', gap:12, padding:'10px 14px',
                borderRadius:12, marginBottom:2, textDecoration:'none', fontSize:13,
                fontWeight: isActive ? 700 : 500, transition:'all 0.18s',
                color: isActive ? '#6EE7B7' : '#9ca3af',
                background: isActive ? 'rgba(110,231,183,0.1)' : 'transparent',
                border: isActive ? '1px solid rgba(110,231,183,0.18)' : '1px solid transparent',
              })}>
              <Icon size={16}/>
              <span>{label}</span>
              {to === '/' && <ChevronRight size={13} style={{ marginLeft:'auto', opacity:0.4 }}/>}
            </NavLink>
          ))}

          {/* System section */}
          <p style={{ fontSize:10, color:'#4b5563', textTransform:'uppercase', letterSpacing:'0.1em', fontFamily:'monospace', padding:'16px 12px 10px' }}>System</p>

          <button onClick={() => { setSettingsOpen(true); setSidebarOpen(false); }}
            style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:12, marginBottom:2, border:'1px solid transparent', background:'none', color:'#9ca3af', fontSize:13, fontWeight:500, cursor:'pointer', width:'100%', transition:'all 0.18s' }}
            onMouseEnter={e=>{ e.currentTarget.style.color='#6EE7B7'; e.currentTarget.style.background='rgba(110,231,183,0.06)'; }}
            onMouseLeave={e=>{ e.currentTarget.style.color='#9ca3af'; e.currentTarget.style.background='none'; }}>
            <Settings size={16}/><span>Settings</span>
          </button>

          <NavLink to="/activity" onClick={() => setSidebarOpen(false)}
            style={({ isActive }) => ({
              display:'flex', alignItems:'center', gap:12, padding:'10px 14px',
              borderRadius:12, marginBottom:2, textDecoration:'none', fontSize:13,
              fontWeight: isActive ? 700 : 500, transition:'all 0.18s',
              color: isActive ? '#6EE7B7' : '#9ca3af',
              background: isActive ? 'rgba(110,231,183,0.1)' : 'transparent',
              border: isActive ? '1px solid rgba(110,231,183,0.18)' : '1px solid transparent',
            })}>
            <Activity size={16}/><span>Activity Log</span>
          </NavLink>

          {/* Shop link */}
          <Link to="/shop"
            style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:12, marginBottom:2, border:'1px solid transparent', color:'#9ca3af', fontSize:13, fontWeight:500, textDecoration:'none', transition:'all 0.18s' }}
            onMouseEnter={e=>{ e.currentTarget.style.color='#6EE7B7'; e.currentTarget.style.background='rgba(110,231,183,0.06)'; }}
            onMouseLeave={e=>{ e.currentTarget.style.color='#9ca3af'; e.currentTarget.style.background='none'; }}>
            <Store size={16}/><span>Visit Shop</span>
          </Link>
        </nav>

        {/* User footer */}
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', padding:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:14, cursor:'pointer', transition:'background 0.2s' }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.04)'}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <div style={{ width:36, height:36, borderRadius:12, background:'rgba(110,231,183,0.1)', border:'1px solid rgba(110,231,183,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ color:'#6EE7B7', fontWeight:800, fontSize:15 }}>{user?.name?.charAt(0).toUpperCase()}</span>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ color:'#f3f4f6', fontWeight:600, fontSize:13, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</p>
              <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:2 }}>
                <ShieldCheck size={10} style={{ color: isAdmin ? '#6EE7B7' : '#38bdf8' }}/>
                <p style={{ color:'#6b7280', fontSize:10, fontFamily:'monospace', textTransform:'capitalize', margin:0 }}>{user?.role}</p>
              </div>
            </div>
            <button onClick={logout} title="Logout"
              style={{ background:'none', border:'none', color:'#4b5563', cursor:'pointer', display:'flex', padding:6, borderRadius:8, transition:'color 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.color='#f87171'}
              onMouseLeave={e=>e.currentTarget.style.color='#4b5563'}>
              <LogOut size={14}/>
            </button>
          </div>
        </div>
      </aside>

      {/* ══════════════ MAIN AREA ══════════════ */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', marginLeft: 0, minWidth:0 }}>

        {/* ── Top Navbar ── */}
        <header style={{ borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(13,17,23,0.85)', backdropFilter:'blur(20px)', padding:'0 24px', flexShrink:0, zIndex:10 }}>
          <div style={{ display:'flex', alignItems:'center', height:64, gap:14 }}>
            {/* Mobile hamburger */}
            <button onClick={() => setSidebarOpen(true)}
              style={{ background:'none', border:'none', color:'#9ca3af', cursor:'pointer', display:'flex', padding:8, borderRadius:8, alignItems:'center' }}>
              <Menu size={22}/>
            </button>

            {/* Page title */}
            <div>
              <h1 style={{ color:'#fff', fontWeight:800, fontSize:19, margin:0, letterSpacing:'-0.02em' }}>{pageTitle}</h1>
              <p style={{ color:'#4b5563', fontSize:11, fontFamily:'monospace', margin:0 }}>
                {new Date().toLocaleDateString('en-US',{ weekday:'long', year:'numeric', month:'long', day:'numeric' })}
              </p>
            </div>

            {/* Right controls */}
            <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:10 }}>

              {/* Search */}
              <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
                <Search size={13} style={{ position:'absolute', left:11, color:'#6b7280' }}/>
                <input
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  onKeyDown={handleSearch}
                  placeholder="Search products… (Enter)"
                  style={{ background:'#111827', border:'1px solid rgba(255,255,255,0.08)', color:'#e5e7eb', borderRadius:12, padding:'8px 14px 8px 32px', width:220, fontSize:12, outline:'none', transition:'border-color 0.2s' }}
                  onFocus={e=>e.target.style.borderColor='rgba(110,231,183,0.4)'}
                  onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.08)'}
                />
              </div>

              {/* Cart */}
              <button onClick={() => openCart(true)}
                style={{ position:'relative', display:'flex', alignItems:'center', gap:7, padding:'7px 13px', borderRadius:12, background:'rgba(110,231,183,0.07)', border:'1px solid rgba(110,231,183,0.18)', color:'#6EE7B7', cursor:'pointer', fontSize:13, fontWeight:700, transition:'all 0.2s' }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(110,231,183,0.14)'}
                onMouseLeave={e=>e.currentTarget.style.background='rgba(110,231,183,0.07)'}>
                <ShoppingCart size={15}/>
                <span style={{ display:'none' }} className="sm-show">Cart</span>
                {totalItems > 0 && (
                  <span style={{ position:'absolute', top:-7, right:-7, width:18, height:18, borderRadius:'50%', background:'#6EE7B7', color:'#052e16', fontSize:10, fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center', animation:'notifPop 0.3s ease' }}>
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Notifications bell */}
              <button onClick={() => setNotifOpen(!notifOpen)}
                style={{ position:'relative', padding:'9px', borderRadius:12, background: notifOpen ? 'rgba(110,231,183,0.1)' : 'transparent', border:'1px solid rgba(255,255,255,0.08)', color: notifOpen ? '#6EE7B7' : '#9ca3af', cursor:'pointer', display:'flex', alignItems:'center', transition:'all 0.2s' }}
                onMouseEnter={e=>{ if(!notifOpen){e.currentTarget.style.borderColor='rgba(110,231,183,0.3)'; e.currentTarget.style.color='#6EE7B7';} }}
                onMouseLeave={e=>{ if(!notifOpen){e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; e.currentTarget.style.color='#9ca3af';} }}>
                <Bell size={16}/>
                {unread > 0 && (
                  <span style={{ position:'absolute', top:-4, right:-4, minWidth:16, height:16, borderRadius:'50%', background:'#f43f5e', color:'#fff', fontSize:9, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 3px', animation:'notifPop 0.3s ease' }}>
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>

              {/* Avatar */}
              <div style={{ width:36, height:36, borderRadius:12, background:'rgba(110,231,183,0.1)', border:'1px solid rgba(110,231,183,0.2)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'default' }}>
                <span style={{ color:'#6EE7B7', fontWeight:800, fontSize:14 }}>{user?.name?.charAt(0).toUpperCase()}</span>
              </div>
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main ref={mainRef} style={{ flex:1, overflowY:'auto', padding:24 }}>
          <Outlet />
        </main>
      </div>

      {/* ── Notification panel (portal-like absolute) ── */}
      <NotificationPanel />

      {/* ── Settings modal ── */}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}

      {/* Global animations */}
      <style>{`
        @keyframes notifPop { from{transform:scale(0.5);opacity:0} to{transform:scale(1);opacity:1} }
        @media(min-width:1024px){ .lg-hide{display:none!important} .lg-sidebar{transform:translateX(0)!important} }
        @media(min-width:640px){ .sm-show{display:inline!important} }
      `}</style>
    </div>
  );
}
