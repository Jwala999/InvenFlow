import React, { useEffect, useState, useCallback } from 'react';
import {
  ShoppingBag, ChevronDown, ChevronUp, X, Package,
  MapPin, CreditCard, CheckCircle, Clock, Truck,
  XCircle, RefreshCw, ShoppingCart, ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { API } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import ActivityModal from '../components/ActivityModal';

const CAT_ICONS = {
  Electronics:'⚡', Clothing:'👕', Food:'🍎',
  Furniture:'🪑', Stationery:'✏️', Sports:'⚽',
  Healthcare:'💊', Other:'📦',
};

const STATUS_CFG = {
  pending:   { label:'Pending',   icon: Clock,        color:'#fbbf24', bg:'rgba(251,191,36,0.12)',   border:'rgba(251,191,36,0.25)'  },
  confirmed: { label:'Confirmed', icon: CheckCircle,  color:'#4ade80', bg:'rgba(74,222,128,0.12)',   border:'rgba(74,222,128,0.25)'  },
  shipped:   { label:'Shipped',   icon: Truck,        color:'#38bdf8', bg:'rgba(56,189,248,0.12)',   border:'rgba(56,189,248,0.25)'  },
  delivered: { label:'Delivered', icon: CheckCircle,  color:'#6EE7B7', bg:'rgba(110,231,183,0.12)', border:'rgba(110,231,183,0.25)' },
  cancelled: { label:'Cancelled', icon: XCircle,      color:'#f87171', bg:'rgba(248,113,113,0.12)', border:'rgba(248,113,113,0.25)' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.pending;
  const Icon = cfg.icon;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      padding:'4px 11px', borderRadius:20, fontSize:11,
      fontFamily:'monospace', fontWeight:700,
      background:cfg.bg, border:`1px solid ${cfg.border}`, color:cfg.color,
    }}>
      <Icon size={10}/>{cfg.label}
    </span>
  );
}

function OrderTimeline({ status }) {
  const steps = ['confirmed','shipped','delivered'];
  const cancelledOrPending = status === 'cancelled' || status === 'pending';
  const currentIdx = steps.indexOf(status);
  return (
    <div style={{ display:'flex', alignItems:'center', gap:0, margin:'16px 0' }}>
      {steps.map((step, i) => {
        const cfg = STATUS_CFG[step];
        const done  = !cancelledOrPending && currentIdx >= i;
        const active = !cancelledOrPending && currentIdx === i;
        return (
          <React.Fragment key={step}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, flex: i < steps.length - 1 ? 'none' : 1 }}>
              <div style={{
                width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                background: done ? cfg.bg : 'rgba(255,255,255,0.05)',
                border: `2px solid ${done ? cfg.color : 'rgba(255,255,255,0.1)'}`,
                boxShadow: active ? `0 0 12px ${cfg.color}55` : 'none',
                transition:'all 0.3s',
              }}>
                <cfg.icon size={13} style={{ color: done ? cfg.color : '#4b5563' }}/>
              </div>
              <span style={{ fontSize:10, fontFamily:'monospace', color: done ? cfg.color : '#4b5563', whiteSpace:'nowrap' }}>
                {cfg.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex:1, height:2, margin:'0 6px', marginBottom:18, background: done && currentIdx > i ? '#4ade80' : 'rgba(255,255,255,0.07)', transition:'background 0.5s' }}/>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function OrderCard({ order, onCancel, onViewActivity }) {
  const [expanded, setExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const canCancel = !['delivered','cancelled'].includes(order.status);

  const handleCancel = async () => {
    if (!confirm(`Cancel order ${order.orderNumber}? Stock will be restored.`)) return;
    setCancelling(true);
    await onCancel(order._id);
    setCancelling(false);
  };

  return (
    <div style={{
      background:'#0d1117', border:'1px solid rgba(255,255,255,0.07)',
      borderRadius:18, overflow:'hidden', transition:'border-color 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.13)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}>

      {/* Card Header */}
      <div style={{ padding:'18px 22px', display:'flex', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        {/* Order number + status */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
            <span style={{ color:'#6EE7B7', fontFamily:'monospace', fontWeight:800, fontSize:14 }}>
              {order.orderNumber}
            </span>
            <StatusBadge status={order.status}/>
          </div>
          <p style={{ color:'#6b7280', fontSize:12, fontFamily:'monospace', margin:'4px 0 0' }}>
            {new Date(order.createdAt).toLocaleDateString('en-US',{
              year:'numeric', month:'long', day:'numeric',
              hour:'2-digit', minute:'2-digit',
            })}
          </p>
        </div>

        {/* Total */}
        <div style={{ textAlign:'right' }}>
          <p style={{ color:'#fff', fontWeight:800, fontSize:20, fontFamily:'monospace', margin:0 }}>
            ${order.totalAmount?.toFixed(2)}
          </p>
          <p style={{ color:'#6b7280', fontSize:11, margin:'2px 0 0' }}>
            {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Expand toggle */}
        <button onClick={() => setExpanded(e => !e)}
          style={{ padding:'8px 14px', borderRadius:10, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#9ca3af', cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:600, transition:'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.color='#6EE7B7'; e.currentTarget.style.borderColor='rgba(110,231,183,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.color='#9ca3af'; e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; }}>
          {expanded ? <><ChevronUp size={14}/> Hide</> : <><ChevronDown size={14}/> Details</>}
        </button>
      </div>

      {/* Items preview (always visible) */}
      <div style={{ padding:'0 22px 16px', display:'flex', gap:8, flexWrap:'wrap' }}>
        {order.items?.slice(0, 5).map((item, i) => (
          <div key={i} style={{
            display:'flex', alignItems:'center', gap:7, padding:'5px 10px',
            borderRadius:8, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)',
          }}>
            <span style={{ fontSize:14 }}>{CAT_ICONS[item.product?.category] || '📦'}</span>
            <span style={{ color:'#d1d5db', fontSize:12, fontWeight:500 }}>{item.name}</span>
            <span style={{ color:'#6b7280', fontSize:11, fontFamily:'monospace' }}>×{item.quantity}</span>
          </div>
        ))}
        {order.items?.length > 5 && (
          <div style={{ padding:'5px 10px', borderRadius:8, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', color:'#6b7280', fontSize:12 }}>
            +{order.items.length - 5} more
          </div>
        )}
      </div>

      {/* Expanded details */}
      <div style={{
        maxHeight: expanded ? 800 : 0,
        overflow:'hidden',
        transition:'max-height 0.4s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', padding:'20px 22px', display:'flex', flexDirection:'column', gap:20 }}>

          {/* Timeline */}
          {order.status !== 'cancelled' && (
            <div>
              <p style={{ color:'#9ca3af', fontSize:11, fontFamily:'monospace', textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 4px' }}>Order Progress</p>
              <OrderTimeline status={order.status}/>
            </div>
          )}

          {/* Items table */}
          <div>
            <p style={{ color:'#9ca3af', fontSize:11, fontFamily:'monospace', textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 12px' }}>Order Items</p>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {order.items?.map((item, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'11px 14px', borderRadius:12, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ width:40, height:40, borderRadius:11, background:'rgba(110,231,183,0.07)', border:'1px solid rgba(110,231,183,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
                    {CAT_ICONS[item.product?.category] || '📦'}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ color:'#f3f4f6', fontWeight:600, fontSize:13, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.name}</p>
                    <p style={{ color:'#6b7280', fontSize:11, fontFamily:'monospace', margin:'2px 0 0' }}>SKU: {item.sku} · ${item.price}/unit</p>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <p style={{ color:'#6EE7B7', fontWeight:700, fontSize:14, fontFamily:'monospace', margin:0 }}>${item.subtotal?.toFixed(2)}</p>
                    <p style={{ color:'#6b7280', fontSize:11, margin:'2px 0 0' }}>×{item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total row */}
            <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 14px', marginTop:8, borderRadius:12, background:'rgba(110,231,183,0.04)', border:'1px solid rgba(110,231,183,0.12)' }}>
              <span style={{ color:'#9ca3af', fontWeight:600 }}>Order Total</span>
              <span style={{ color:'#6EE7B7', fontWeight:800, fontSize:18, fontFamily:'monospace' }}>${order.totalAmount?.toFixed(2)}</span>
            </div>
          </div>

          {/* Shipping + Payment row */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            {/* Shipping address */}
            <div style={{ padding:'14px 16px', borderRadius:14, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:10 }}>
                <MapPin size={13} style={{ color:'#6EE7B7' }}/>
                <p style={{ color:'#9ca3af', fontSize:11, fontFamily:'monospace', textTransform:'uppercase', letterSpacing:'0.06em', margin:0 }}>Shipping To</p>
              </div>
              {order.shippingAddress ? (
                <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
                  <p style={{ color:'#f3f4f6', fontSize:13, fontWeight:600, margin:0 }}>{order.shippingAddress.fullName}</p>
                  <p style={{ color:'#9ca3af', fontSize:12, margin:0 }}>{order.shippingAddress.address}</p>
                  <p style={{ color:'#9ca3af', fontSize:12, margin:0 }}>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                  </p>
                  <p style={{ color:'#6b7280', fontSize:12, margin:0 }}>{order.shippingAddress.country}</p>
                </div>
              ) : (
                <p style={{ color:'#6b7280', fontSize:12 }}>No address provided</p>
              )}
            </div>

            {/* Payment method */}
            <div style={{ padding:'14px 16px', borderRadius:14, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:10 }}>
                <CreditCard size={13} style={{ color:'#6EE7B7' }}/>
                <p style={{ color:'#9ca3af', fontSize:11, fontFamily:'monospace', textTransform:'uppercase', letterSpacing:'0.06em', margin:0 }}>Payment</p>
              </div>
              <p style={{ color:'#f3f4f6', fontSize:14, fontWeight:600, margin:'0 0 4px' }}>
                {order.paymentMethod === 'card' ? '💳 Credit/Debit Card'
                  : order.paymentMethod === 'upi' ? '📱 UPI'
                  : order.paymentMethod === 'cod' ? '💵 Cash on Delivery'
                  : order.paymentMethod}
              </p>
              <p style={{ color:'#6b7280', fontSize:11, fontFamily:'monospace', margin:0 }}>
                {order.status === 'cancelled' ? 'Refund initiated' : order.status === 'delivered' ? 'Payment completed' : 'Awaiting delivery'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <button onClick={() => onViewActivity(order)}
              style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 16px', borderRadius:11, background:'rgba(56,189,248,0.08)', border:'1px solid rgba(56,189,248,0.2)', color:'#38bdf8', cursor:'pointer', fontSize:13, fontWeight:600, transition:'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(56,189,248,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(56,189,248,0.08)'}>
              <Package size={14}/> View Activity
            </button>

            {canCancel && (
              <button onClick={handleCancel} disabled={cancelling}
                style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 16px', borderRadius:11, background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.2)', color:'#f87171', cursor: cancelling ? 'not-allowed' : 'pointer', fontSize:13, fontWeight:600, transition:'all 0.2s', opacity: cancelling ? 0.6 : 1 }}
                onMouseEnter={e => { if (!cancelling) e.currentTarget.style.background = 'rgba(248,113,113,0.15)'; }}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}>
                {cancelling
                  ? <><div style={{ width:12, height:12, border:'2px solid rgba(248,113,113,0.3)', borderTopColor:'#f87171', borderRadius:'50%', animation:'spin 0.7s linear infinite' }}/> Cancelling…</>
                  : <><X size={14}/> Cancel Order</>}
              </button>
            )}

            {order.status === 'delivered' && (
              <Link to="/shop"
                style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 16px', borderRadius:11, background:'rgba(110,231,183,0.08)', border:'1px solid rgba(110,231,183,0.2)', color:'#6EE7B7', textDecoration:'none', fontSize:13, fontWeight:600 }}>
                <ShoppingCart size={14}/> Buy Again
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderPage() {
  const { user } = useAuth();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('');
  const [activityOrder, setActivityOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/orders/my');
      setOrders(data.data.orders);
    } catch { setOrders([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleCancel = async (id) => {
    try { await API.put(`/orders/${id}/cancel`); fetchOrders(); }
    catch (e) { alert(e.response?.data?.message || 'Cancel failed.'); }
  };

  const filtered = filter ? orders.filter(o => o.status === filter) : orders;

  // Summary stats
  const totalSpent = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.totalAmount || 0), 0);
  const confirmed  = orders.filter(o => ['confirmed','shipped','delivered'].includes(o.status)).length;

  return (
    <div style={{ paddingBottom:40 }}>
      {/* Header */}
      <div style={{ display:'flex', flexWrap:'wrap', alignItems:'flex-start', gap:14, marginBottom:24 }}>
        <div>
          <h2 style={{ color:'#fff', fontWeight:800, fontSize:22, margin:'0 0 4px', letterSpacing:'-0.02em' }}>
            My Orders
          </h2>
          <p style={{ color:'#6b7280', fontSize:13, margin:0 }}>
            {orders.length} order{orders.length !== 1 ? 's' : ''} placed
          </p>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', gap:10 }}>
          <button onClick={fetchOrders}
            style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 16px', borderRadius:12, background:'transparent', border:'1px solid rgba(255,255,255,0.1)', color:'#9ca3af', cursor:'pointer', fontSize:13, transition:'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.color='#6EE7B7'; e.currentTarget.style.borderColor='rgba(110,231,183,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.color='#9ca3af'; e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; }}>
            <RefreshCw size={13}/> Refresh
          </button>
          <Link to="/shop"
            style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 18px', borderRadius:12, background:'#6EE7B7', color:'#052e16', textDecoration:'none', fontSize:13, fontWeight:700 }}>
            <ShoppingCart size={14}/> Shop More
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:12, marginBottom:22 }}>
        {[
          { label:'Total Orders',  value: orders.length,    color:'#f3f4f6' },
          { label:'Active',        value: confirmed,         color:'#4ade80' },
          { label:'Total Spent',   value:`$${totalSpent.toFixed(2)}`, color:'#6EE7B7' },
          { label:'Cancelled',     value: orders.filter(o => o.status === 'cancelled').length, color:'#f87171' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background:'#0d1117', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'16px 18px', textAlign:'center' }}>
            <p style={{ fontWeight:800, fontSize:22, color, margin:0, fontFamily: typeof value === 'string' && value.startsWith('$') ? 'monospace' : 'inherit' }}>{value}</p>
            <p style={{ fontSize:11, color:'#6b7280', margin:'4px 0 0', fontFamily:'monospace', textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Status filter */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20, padding:'12px 16px', borderRadius:14, background:'#0d1117', border:'1px solid rgba(255,255,255,0.07)' }}>
        {['', 'confirmed','shipped','delivered','cancelled','pending'].map(s => {
          const cfg = s ? STATUS_CFG[s] : null;
          const active = filter === s;
          return (
            <button key={s} onClick={() => setFilter(s)}
              style={{
                padding:'6px 14px', borderRadius:20, fontSize:12,
                fontFamily:'monospace', cursor:'pointer', fontWeight: active ? 700 : 400,
                border: active && cfg ? `1px solid ${cfg.border}` : 'none',
                background: active ? (cfg ? cfg.bg : '#6EE7B7') : 'rgba(255,255,255,0.05)',
                color: active ? (cfg ? cfg.color : '#052e16') : '#9ca3af',
                transition:'all 0.15s',
              }}>
              {s ? (STATUS_CFG[s]?.label || s) : 'All Orders'}
            </button>
          );
        })}
      </div>

      {/* Orders list */}
      {loading ? (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {[...Array(3)].map((_,i) => (
            <div key={i} style={{ height:120, borderRadius:18, background:'#0d1117', border:'1px solid rgba(255,255,255,0.07)', animation:'pulse 1.5s ease infinite' }}/>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'80px 20px' }}>
          <ShoppingBag size={52} style={{ color:'#1f2937', margin:'0 auto 18px' }}/>
          <h3 style={{ color:'#6b7280', fontWeight:600, fontSize:18, margin:'0 0 8px' }}>
            {filter ? `No ${STATUS_CFG[filter]?.label} orders` : 'No orders yet'}
          </h3>
          <p style={{ color:'#374151', fontSize:13, margin:'0 0 24px' }}>
            {filter ? 'Try a different filter' : 'Start shopping to place your first order'}
          </p>
          {!filter && (
            <Link to="/shop"
              style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#6EE7B7', color:'#052e16', fontWeight:700, padding:'11px 24px', borderRadius:12, textDecoration:'none', fontSize:14 }}>
              Browse Shop <ArrowRight size={16}/>
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {filtered.map((order, i) => (
            <div key={order._id} style={{ opacity:0, animation:`fadeSlideIn 0.35s ease ${i * 60}ms forwards` }}>
              <OrderCard
                order={order}
                onCancel={handleCancel}
                onViewActivity={setActivityOrder}
              />
            </div>
          ))}
        </div>
      )}

      {/* Activity modal for selected order */}
      {activityOrder && (
        <ActivityModal
          title={`Activity — ${activityOrder.orderNumber}`}
          orderId={activityOrder._id}
          onClose={() => setActivityOrder(null)}
        />
      )}

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeSlideIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </div>
  );
}