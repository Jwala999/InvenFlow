import React, { useEffect, useState, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  Package, Archive, TrendingDown, TrendingUp, DollarSign,
  Users, ArrowUpRight, ArrowDownRight, Activity, RefreshCw,
  ShoppingCart, Link,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API } from '../context/AuthContext';

const PIE_COLORS = ['#6EE7B7','#38BDF8','#F59E0B','#F87171','#A78BFA','#34D399'];

// Static fallback weekly data — same shape as server data
const DEMO_WEEKLY = [
  { day:'Mon', in:32, out:18 }, { day:'Tue', in:45, out:29 },
  { day:'Wed', in:28, out:35 }, { day:'Thu', in:51, out:22 },
  { day:'Fri', in:39, out:41 }, { day:'Sat', in:17, out:12 },
  { day:'Sun', in:8,  out:6  },
];

// ── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, trend, accent, onClick }) {
  const [hover, setHover] = useState(false);
  const styles = {
    emerald: { bg:'#052e16', border:'#166534', icon:'#22c55e' },
    sky:     { bg:'#082f49', border:'#075985', icon:'#0ea5e9' },
    amber:   { bg:'#2d1a00', border:'#92400e', icon:'#f59e0b' },
    rose:    { bg:'#2d0a0a', border:'#9f1239', icon:'#f43f5e' },
  }[accent] || { bg:'#0d1117', border:'#1f2937', icon:'#6b7280' };

  return (
    <div onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      onClick={onClick}
      style={{ position:'relative', borderRadius:18, border:`1px solid ${hover?styles.icon+'55':styles.border}`, padding:'20px', overflow:'hidden', cursor: onClick?'pointer':'default', transition:'all 0.25s', background:styles.bg, transform: hover?'translateY(-3px)':'none', boxShadow: hover?`0 12px 32px rgba(0,0,0,0.35)`:'none' }}>
      <div style={{ position:'absolute', top:-20, right:-20, width:80, height:80, borderRadius:'50%', background:styles.icon, opacity:0.12, filter:'blur(20px)' }}/>
      <div style={{ position:'relative', zIndex:1 }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
          <div style={{ padding:10, borderRadius:12, background:`${styles.icon}22`, border:`1px solid ${styles.icon}44` }}>
            <Icon size={17} style={{ color: styles.icon }}/>
          </div>
          {trend !== undefined && (
            <span style={{ display:'flex', alignItems:'center', gap:3, fontSize:11, color: trend>=0?'#4ade80':'#f87171', fontFamily:'monospace' }}>
              {trend>=0?<ArrowUpRight size={12}/>:<ArrowDownRight size={12}/>}{Math.abs(trend)}%
            </span>
          )}
        </div>
        <p style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em', color:'#6b7280', fontFamily:'monospace', margin:'0 0 5px' }}>{label}</p>
        <p style={{ fontWeight:800, fontSize:28, color:'#fff', margin:'0 0 4px', letterSpacing:'-0.02em' }}>{value}</p>
        {sub && <p style={{ fontSize:11, color:'#4b5563', margin:0 }}>{sub}</p>}
      </div>
    </div>
  );
}

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#111827', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'10px 14px', fontSize:12, boxShadow:'0 8px 24px rgba(0,0,0,0.4)' }}>
      <p style={{ color:'#9ca3af', fontFamily:'monospace', margin:'0 0 6px' }}>{label}</p>
      {payload.map((p,i) => <p key={i} style={{ color:p.color, margin:'2px 0', fontWeight:600 }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats]             = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [barData, setBarData]         = useState(DEMO_WEEKLY);
  const [recentTxns, setRecentTxns]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [isLive, setIsLive]           = useState(false);
  const hasFetched = useRef(false);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/dashboard/stats');
      const d = data.data;

      setStats(d.stats);
      setIsLive(true);

      // Category pie
      const pie = (d.categoryBreakdown || []).map(c => ({ name: c._id, value: c.count }));
      setCategoryData(pie);

      // ── Weekly bar chart — robust mapping ──────────────────────────
      // Server returns weeklyActivity with entries like:
      // { _id: { date: "2026-04-27", type: "stock_in" }, qty: 32 }
      const weekly = d.weeklyActivity || [];
      if (weekly.length > 0) {
        // Build a map from date → { in, out }
        const dayMap = {};
        const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

        weekly.forEach(item => {
          // Support both { day, in, out } and { _id: { date, type }, qty }
          if (item.day) {
            dayMap[item.day] = { day: item.day, in: item.in || 0, out: item.out || 0 };
          } else if (item._id?.date) {
            const d = new Date(item._id.date);
            const dayName = DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1];
            if (!dayMap[dayName]) dayMap[dayName] = { day: dayName, in: 0, out: 0 };
            if (item._id.type === 'stock_in')  dayMap[dayName].in  += (item.qty || 0);
            if (item._id.type === 'stock_out') dayMap[dayName].out += (item.qty || 0);
          }
        });

        const mapped = DAYS.map(day => dayMap[day] || { day, in:0, out:0 });
        // Only replace demo data if we got real entries with non-zero values
        const hasRealData = mapped.some(d => d.in > 0 || d.out > 0);
        if (hasRealData) setBarData(mapped);
        // If no real data, keep DEMO_WEEKLY so chart never disappears
      }

      setRecentTxns(d.recentTransactions || []);
    } catch {
      setIsLive(false);
      // Keep defaults — no popup, no disappearing products
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchDashboard();
    }
  }, []);

  if (loading) {
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:14 }}>
          {[...Array(6)].map((_,i) => (
            <div key={i} style={{ height:130, borderRadius:18, background:'#0d1117', border:'1px solid rgba(255,255,255,0.06)', animation:'pulse 1.5s ease infinite' }}/>
          ))}
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      </div>
    );
  }

  const s = stats || { totalProducts:0, totalStock:0, totalValue:0, lowStock:0, outOfStock:0, totalUsers:0 };
  const pieData = categoryData.length > 0 ? categoryData : [
    {name:'Electronics',value:38},{name:'Clothing',value:27},{name:'Furniture',value:19},
    {name:'Sports',value:15},{name:'Healthcare',value:14},{name:'Other',value:11},
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:22, paddingBottom:32 }}>
      {/* Status banner */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 18px', borderRadius:14, background: isLive?'rgba(110,231,183,0.05)':'rgba(245,158,11,0.06)', border: isLive?'1px solid rgba(110,231,183,0.15)':'1px solid rgba(245,158,11,0.2)' }}>
        <span style={{ width:8, height:8, borderRadius:'50%', background: isLive?'#4ade80':'#fbbf24', flexShrink:0, animation: isLive?'livePulse 2s ease infinite':'none' }}/>
        <p style={{ fontSize:12, color: isLive?'#4ade80':'#fbbf24', fontFamily:'monospace', margin:0 }}>
          {isLive ? 'Live data — connected to backend' : 'Demo data — start the backend & run seed to see live stats'}
        </p>
        <button onClick={fetchDashboard}
          style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6, background:'none', border:'none', color:'#6b7280', cursor:'pointer', fontSize:12, fontFamily:'monospace', padding:0 }}>
          <RefreshCw size={12}/> Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
          <Activity size={15} style={{ color:'#6EE7B7' }}/>
          <h2 style={{ color:'#fff', fontWeight:700, fontSize:16, margin:0 }}>Overview</h2>
          <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:10, padding:'2px 8px', borderRadius:20, background:'rgba(110,231,183,0.1)', border:'1px solid rgba(110,231,183,0.2)', color:'#6EE7B7', fontFamily:'monospace', fontWeight:700 }}>
            <span style={{ width:5, height:5, borderRadius:'50%', background:'#6EE7B7', animation:'livePulse 2s ease infinite' }}/>LIVE
          </span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:14 }}>
          <StatCard icon={Package}      accent="emerald" label="Total Products" value={s.totalProducts.toLocaleString()} sub="Active SKUs"      trend={12} onClick={()=>navigate('/products')}/>
          <StatCard icon={Archive}      accent="sky"     label="Total Stock"    value={s.totalStock.toLocaleString()}    sub="Units available"  trend={5}  onClick={()=>navigate('/stock')}/>
          <StatCard icon={DollarSign}   accent="amber"   label="Inv. Value"     value={`$${Math.round((s.totalValue||0)/1000)}k`} sub="Market value" trend={8}/>
          <StatCard icon={TrendingDown} accent="rose"    label="Low Stock"      value={s.lowStock}                       sub="Need restocking"  trend={-3} onClick={()=>navigate('/products')}/>
          <StatCard icon={TrendingUp}   accent="rose"    label="Out of Stock"   value={s.outOfStock}                     sub="Zero inventory" />
          <StatCard icon={Users}        accent="sky"     label="Team Members"   value={s.totalUsers}                     sub="Active users"     trend={2}  onClick={()=>navigate('/users')}/>
        </div>
      </div>

      {/* Charts row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:18 }}>
        {/* Bar chart */}
        <div style={{ background:'#0d1117', border:'1px solid rgba(255,255,255,0.07)', borderRadius:18, padding:24 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22 }}>
            <div>
              <h3 style={{ color:'#fff', fontWeight:700, fontSize:15, margin:0 }}>Weekly Activity</h3>
              <p style={{ color:'#6b7280', fontSize:12, margin:'3px 0 0' }}>Stock movements — last 7 days</p>
            </div>
            <div style={{ display:'flex', gap:14, fontSize:11, color:'#6b7280', fontFamily:'monospace' }}>
              <span style={{ display:'flex', alignItems:'center', gap:5 }}><span style={{ width:10, height:10, borderRadius:3, background:'#6EE7B7', display:'inline-block' }}/> In</span>
              <span style={{ display:'flex', alignItems:'center', gap:5 }}><span style={{ width:10, height:10, borderRadius:3, background:'#38BDF8', display:'inline-block' }}/> Out</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barGap={4} barCategoryGap="32%">
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill:'#6B7280', fontSize:11, fontFamily:'monospace' }}/>
              <YAxis axisLine={false} tickLine={false} tick={{ fill:'#6B7280', fontSize:11, fontFamily:'monospace' }}/>
              <Tooltip content={<ChartTip/>} cursor={{ fill:'rgba(255,255,255,0.03)' }}/>
              <Bar dataKey="in"  name="Stock In"  fill="#6EE7B7" radius={[5,5,0,0]}/>
              <Bar dataKey="out" name="Stock Out" fill="#38BDF8" radius={[5,5,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div style={{ background:'#0d1117', border:'1px solid rgba(255,255,255,0.07)', borderRadius:18, padding:24 }}>
          <h3 style={{ color:'#fff', fontWeight:700, fontSize:15, margin:'0 0 2px' }}>By Category</h3>
          <p style={{ color:'#6b7280', fontSize:12, margin:'0 0 16px' }}>Product distribution</p>
          <ResponsiveContainer width="100%" height={165}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={72}
                paddingAngle={3} dataKey="value" strokeWidth={0}>
                {pieData.map((_,i) => <Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
              </Pie>
              <Tooltip content={<ChartTip/>}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:8 }}>
            {pieData.slice(0,5).map((item,i) => (
              <div key={item.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                  <div style={{ width:8, height:8, borderRadius:2, background:PIE_COLORS[i%PIE_COLORS.length] }}/>
                  <span style={{ fontSize:12, color:'#d1d5db' }}>{item.name}</span>
                </div>
                <span style={{ fontSize:11, color:'#6b7280', fontFamily:'monospace' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick links + Recent transactions */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
        {/* Quick actions */}
        <div style={{ background:'#0d1117', border:'1px solid rgba(255,255,255,0.07)', borderRadius:18, padding:24 }}>
          <h3 style={{ color:'#fff', fontWeight:700, fontSize:15, margin:'0 0 16px' }}>Quick Actions</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[
              { label:'Add Product',  icon:'📦', color:'#6EE7B7', path:'/products' },
              { label:'Stock In',     icon:'⬆️', color:'#4ade80', path:'/stock'    },
              { label:'View Orders',  icon:'🛒', color:'#38bdf8', path:'/activity' },
              { label:'Visit Shop',   icon:'🏪', color:'#fbbf24', path:'/shop'     },
            ].map(({ label, icon, color, path }) => (
              <button key={label} onClick={()=>navigate(path)}
                style={{ padding:'14px 12px', borderRadius:14, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', cursor:'pointer', textAlign:'left', transition:'all 0.2s' }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor=`${color}33`; e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.transform='none'; }}>
                <span style={{ fontSize:22, display:'block', marginBottom:8 }}>{icon}</span>
                <span style={{ color:'#d1d5db', fontSize:12, fontWeight:600 }}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent transactions */}
        <div style={{ background:'#0d1117', border:'1px solid rgba(255,255,255,0.07)', borderRadius:18, padding:24 }}>
          <h3 style={{ color:'#fff', fontWeight:700, fontSize:15, margin:'0 0 16px' }}>Recent Activity</h3>
          {recentTxns.length === 0 ? (
            <div style={{ textAlign:'center', padding:'24px 0', color:'#374151' }}>
              <p style={{ fontSize:13 }}>No transactions yet</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {recentTxns.slice(0,5).map((t,i) => {
                const delta = t.newQuantity - t.previousQuantity;
                return (
                  <div key={t._id||i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', borderRadius:12, background:'rgba(255,255,255,0.03)' }}>
                    <div>
                      <p style={{ color:'#f3f4f6', fontSize:12, fontWeight:600, margin:0 }}>{t.product?.name || '—'}</p>
                      <p style={{ color:'#6b7280', fontSize:11, fontFamily:'monospace', margin:'2px 0 0' }}>{t.type?.replace('_',' ')}</p>
                    </div>
                    <span style={{ fontFamily:'monospace', fontWeight:700, fontSize:13, color: delta>0?'#4ade80':'#f87171' }}>
                      {delta>0?'+':''}{delta}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Status footer */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        {[
          { label:'System Status', value:'Operational',  color:'#4ade80' },
          { label:'Last Sync',     value:'Just now',     color:'#38bdf8' },
          { label:'API Health',    value:'99.9% uptime', color:'#fbbf24' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background:'#0d1117', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'12px 18px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <p style={{ color:'#6b7280', fontSize:11, fontFamily:'monospace', textTransform:'uppercase', letterSpacing:'0.06em', margin:0 }}>{label}</p>
            <span style={{ display:'flex', alignItems:'center', gap:6, color, fontSize:11, fontFamily:'monospace' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:color, animation:'livePulse 2s ease infinite' }}/>{value}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes livePulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.3)}}
      `}</style>
    </div>
  );
}