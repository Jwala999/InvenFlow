import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Zap, ShoppingCart, CheckCircle, ArrowLeft, CreditCard, MapPin, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { API } from '../context/AuthContext';

const CAT_ICONS = { Electronics:'⚡', Clothing:'👕', Food:'🍎', Furniture:'🪑', Stationery:'✏️', Sports:'⚽', Healthcare:'💊', Other:'📦' };

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=shipping, 2=payment, 3=success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);

  const [shipping, setShipping] = useState({
    fullName: user?.name || '', address: '', city: '', state: '', zip: '', country: 'India',
  });
  const [payment, setPayment] = useState({ method: 'card', cardNumber: '', expiry: '', cvv: '', upi: '' });

  if (!user) return <Navigate to="/login" replace />;
  if (items.length === 0 && step !== 3) return <Navigate to="/shop" replace />;

  const sf = (k, v) => setShipping(p => ({ ...p, [k]: v }));
  const pf = (k, v) => setPayment(p => ({ ...p, [k]: v }));

  const placeOrder = async () => {
    setLoading(true); setError('');
    try {
      const { data } = await API.post('/orders', {
        items: items.map(i => ({ productId: i._id, quantity: i.qty })),
        shippingAddress: shipping,
        paymentMethod: payment.method,
      });
      setOrder(data.data.order);
      clearCart();
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Order failed. Please try again.');
    } finally { setLoading(false); }
  };

  const inputStyle = { background:'#111827', border:'1px solid rgba(255,255,255,0.10)', color:'#e5e7eb', borderRadius:12, padding:'10px 14px', outline:'none', width:'100%', fontSize:13 };
  const labelStyle = { display:'block', fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em', color:'#9ca3af', marginBottom:6, fontFamily:'monospace' };

  // Success screen
  if (step === 3 && order) {
    return (
      <div style={{ minHeight:'100vh', background:'#080B12', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
        <div style={{ maxWidth:520, width:'100%', textAlign:'center' }}>
          <div style={{ width:80, height:80, borderRadius:'50%', background:'rgba(110,231,183,0.1)', border:'2px solid rgba(110,231,183,0.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', animation:'successPop 0.5s ease' }}>
            <CheckCircle size={40} style={{ color:'#6EE7B7' }} />
          </div>
          <h1 style={{ color:'#fff', fontWeight:800, fontSize:28, margin:'0 0 8px' }}>Order Placed! 🎉</h1>
          <p style={{ color:'#9ca3af', fontSize:15, margin:'0 0 6px' }}>Thank you, {user.name}!</p>
          <p style={{ color:'#6b7280', fontSize:13, margin:'0 0 28px' }}>
            Order <span style={{ color:'#6EE7B7', fontFamily:'monospace', fontWeight:700 }}>{order.orderNumber}</span> has been confirmed.
          </p>

          <div style={{ background:'#0d1117', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:24, marginBottom:24, textAlign:'left' }}>
            <p style={{ color:'#9ca3af', fontSize:12, textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'monospace', margin:'0 0 16px' }}>Order Summary</p>
            {order.items.map(item => (
              <div key={item._id || item.name} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                <div>
                  <p style={{ color:'#f3f4f6', fontSize:13, fontWeight:600, margin:0 }}>{item.name}</p>
                  <p style={{ color:'#6b7280', fontSize:11, margin:'2px 0 0', fontFamily:'monospace' }}>x{item.quantity} @ ${item.price}</p>
                </div>
                <p style={{ color:'#6EE7B7', fontSize:13, fontWeight:700, fontFamily:'monospace', margin:0 }}>${item.subtotal?.toFixed(2)}</p>
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', paddingTop:14 }}>
              <p style={{ color:'#9ca3af', fontWeight:600, margin:0 }}>Total</p>
              <p style={{ color:'#fff', fontWeight:800, fontSize:18, fontFamily:'monospace', margin:0 }}>${order.totalAmount?.toFixed(2)}</p>
            </div>
          </div>

          <div style={{ display:'flex', gap:12 }}>
            <Link to="/shop" style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px', borderRadius:13, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#9ca3af', textDecoration:'none', fontSize:14 }}>
              <ShoppingCart size={15}/> Continue Shopping
            </Link>
            <Link to="/" style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px', borderRadius:13, background:'#6EE7B7', color:'#052e16', textDecoration:'none', fontSize:14, fontWeight:700 }}>
              Dashboard
            </Link>
          </div>
        </div>
        <style>{`@keyframes successPop{from{transform:scale(0.5);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight:'100vh', background:'#080B12', color:'#f3f4f6' }}>
      {/* Header */}
      <header style={{ borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'0 24px', background:'rgba(8,11,18,0.95)', backdropFilter:'blur(16px)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', alignItems:'center', height:60, gap:16 }}>
          <Link to="/shop" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:8, color:'#9ca3af', fontSize:13 }}>
            <ArrowLeft size={15}/> Back to Shop
          </Link>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginLeft:'auto' }}>
            <Zap size={18} style={{ color:'#6EE7B7' }} />
            <span style={{ color:'#fff', fontWeight:700 }}>Checkout</span>
          </div>
        </div>
      </header>

      {/* Steps */}
      <div style={{ borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'0 24px' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', gap:0 }}>
          {[{n:1,label:'Shipping'},{n:2,label:'Payment'}].map(({n,label}) => (
            <button key={n} onClick={() => n < step && setStep(n)}
              style={{ padding:'16px 24px', background:'none', border:'none', cursor: n < step ? 'pointer' : 'default',
                borderBottom: step===n ? '2px solid #6EE7B7' : '2px solid transparent',
                color: step===n ? '#6EE7B7' : n < step ? '#9ca3af' : '#374151',
                fontSize:13, fontWeight: step===n ? 700 : 400, display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ width:22, height:22, borderRadius:'50%', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700,
                background: step>=n ? (step===n ? '#6EE7B7' : 'rgba(110,231,183,0.2)') : 'rgba(255,255,255,0.08)',
                color: step>=n ? (step===n ? '#052e16' : '#6EE7B7') : '#6b7280' }}>{n}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:'0 auto', padding:'32px 24px', display:'grid', gridTemplateColumns:'1fr 380px', gap:32 }}>
        {/* Left form */}
        <div>
          {error && (
            <div style={{ padding:'12px 16px', marginBottom:20, borderRadius:12, background:'rgba(244,63,94,0.1)', border:'1px solid rgba(244,63,94,0.25)', color:'#fb7185', fontSize:13 }}>{error}</div>
          )}

          {/* Step 1 - Shipping */}
          {step === 1 && (
            <div style={{ background:'#0d1117', border:'1px solid rgba(255,255,255,0.07)', borderRadius:18, padding:28 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24 }}>
                <MapPin size={18} style={{ color:'#6EE7B7' }} />
                <h2 style={{ color:'#fff', fontWeight:700, fontSize:18, margin:0 }}>Shipping Address</h2>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div style={{ gridColumn:'span 2' }}>
                  <label style={labelStyle}>Full Name *</label>
                  <input value={shipping.fullName} onChange={e=>sf('fullName',e.target.value)} style={inputStyle} required />
                </div>
                <div style={{ gridColumn:'span 2' }}>
                  <label style={labelStyle}>Street Address *</label>
                  <input value={shipping.address} onChange={e=>sf('address',e.target.value)} style={inputStyle} placeholder="123 Main St, Apt 4" required />
                </div>
                <div>
                  <label style={labelStyle}>City *</label>
                  <input value={shipping.city} onChange={e=>sf('city',e.target.value)} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>State *</label>
                  <input value={shipping.state} onChange={e=>sf('state',e.target.value)} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>ZIP / Postal Code *</label>
                  <input value={shipping.zip} onChange={e=>sf('zip',e.target.value)} style={inputStyle} required />
                </div>
                <div>
                  <label style={labelStyle}>Country</label>
                  <input value={shipping.country} onChange={e=>sf('country',e.target.value)} style={inputStyle} />
                </div>
              </div>
              <button onClick={() => {
                if (!shipping.fullName || !shipping.address || !shipping.city || !shipping.state || !shipping.zip) {
                  setError('Please fill all required fields.'); return;
                }
                setError(''); setStep(2);
              }}
                style={{ marginTop:24, display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'#6EE7B7', color:'#052e16', fontWeight:700, padding:'12px 24px', borderRadius:13, border:'none', cursor:'pointer', fontSize:14, width:'100%' }}>
                Continue to Payment →
              </button>
            </div>
          )}

          {/* Step 2 - Payment */}
          {step === 2 && (
            <div style={{ background:'#0d1117', border:'1px solid rgba(255,255,255,0.07)', borderRadius:18, padding:28 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24 }}>
                <CreditCard size={18} style={{ color:'#6EE7B7' }} />
                <h2 style={{ color:'#fff', fontWeight:700, fontSize:18, margin:0 }}>Payment Method</h2>
              </div>

              {/* Method selector */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:24 }}>
                {[{k:'card',label:'💳 Card'},{k:'upi',label:'📱 UPI'},{k:'cod',label:'💵 Cash on Delivery'}].map(({k,label}) => (
                  <button key={k} onClick={() => pf('method', k)}
                    style={{ padding:'14px 10px', borderRadius:12, border:`1px solid ${payment.method===k ? 'rgba(110,231,183,0.4)' : 'rgba(255,255,255,0.1)'}`, background: payment.method===k ? 'rgba(110,231,183,0.08)' : 'transparent', color: payment.method===k ? '#6EE7B7' : '#9ca3af', cursor:'pointer', fontWeight: payment.method===k ? 700 : 400, fontSize:13 }}>
                    {label}
                  </button>
                ))}
              </div>

              {payment.method === 'card' && (
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                  <div>
                    <label style={labelStyle}>Card Number</label>
                    <input value={payment.cardNumber} onChange={e=>pf('cardNumber',e.target.value.replace(/\D/g,'').slice(0,16))}
                      placeholder="1234 5678 9012 3456" style={inputStyle} maxLength={16} />
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                    <div>
                      <label style={labelStyle}>Expiry (MM/YY)</label>
                      <input value={payment.expiry} onChange={e=>pf('expiry',e.target.value)} placeholder="12/27" style={inputStyle} maxLength={5} />
                    </div>
                    <div>
                      <label style={labelStyle}>CVV</label>
                      <input value={payment.cvv} onChange={e=>pf('cvv',e.target.value.replace(/\D/g,'').slice(0,4))} placeholder="•••" style={inputStyle} maxLength={4} type="password" />
                    </div>
                  </div>
                </div>
              )}

              {payment.method === 'upi' && (
                <div>
                  <label style={labelStyle}>UPI ID</label>
                  <input value={payment.upi} onChange={e=>pf('upi',e.target.value)} placeholder="yourname@upi" style={inputStyle} />
                </div>
              )}

              {payment.method === 'cod' && (
                <div style={{ padding:'16px', borderRadius:12, background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)' }}>
                  <p style={{ color:'#fbbf24', fontSize:13, margin:0 }}>💵 You'll pay ₹{totalPrice.toFixed(2)} when your order arrives.</p>
                </div>
              )}

              <button onClick={placeOrder} disabled={loading}
                style={{ marginTop:24, display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'#6EE7B7', color:'#052e16', fontWeight:700, padding:'13px 24px', borderRadius:13, border:'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize:15, width:'100%' }}>
                {loading
                  ? <div style={{ width:16, height:16, border:'2px solid rgba(5,46,22,0.3)', borderTopColor:'#052e16', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
                  : `✓ Place Order — $${totalPrice.toFixed(2)}`}
              </button>
            </div>
          )}
        </div>

        {/* Right - Order Summary */}
        <div>
          <div style={{ background:'#0d1117', border:'1px solid rgba(255,255,255,0.07)', borderRadius:18, padding:24, position:'sticky', top:24 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
              <Package size={16} style={{ color:'#6EE7B7' }} />
              <h3 style={{ color:'#fff', fontWeight:700, fontSize:16, margin:0 }}>Order Summary</h3>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:20 }}>
              {items.map(item => (
                <div key={item._id} style={{ display:'flex', gap:12, padding:'10px 12px', borderRadius:12, background:'rgba(255,255,255,0.03)' }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:'rgba(110,231,183,0.07)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:16 }}>
                    {CAT_ICONS[item.category]||'📦'}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ color:'#f3f4f6', fontSize:12, fontWeight:600, margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.name}</p>
                    <p style={{ color:'#6b7280', fontSize:11, margin:0 }}>x{item.qty} × ${item.price}</p>
                  </div>
                  <p style={{ color:'#6EE7B7', fontSize:12, fontWeight:700, fontFamily:'monospace', margin:0, flexShrink:0 }}>${(item.price*item.qty).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ color:'#9ca3af', fontSize:13 }}>Subtotal</span>
                <span style={{ color:'#fff', fontSize:13, fontFamily:'monospace' }}>${totalPrice.toFixed(2)}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ color:'#9ca3af', fontSize:13 }}>Shipping</span>
                <span style={{ color:'#4ade80', fontSize:13, fontFamily:'monospace' }}>Free</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', paddingTop:12, borderTop:'1px solid rgba(255,255,255,0.07)' }}>
                <span style={{ color:'#fff', fontWeight:700, fontSize:15 }}>Total</span>
                <span style={{ color:'#6EE7B7', fontWeight:800, fontSize:20, fontFamily:'monospace' }}>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}