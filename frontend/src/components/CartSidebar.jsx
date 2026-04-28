import React from 'react';
import { Link } from 'react-router-dom';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CAT_ICONS = { Electronics:'⚡', Clothing:'👕', Food:'🍎', Furniture:'🪑', Stationery:'✏️', Sports:'⚽', Healthcare:'💊', Other:'📦' };

export default function CartSidebar() {
  const { items, removeItem, updateQty, totalPrice, isOpen, setIsOpen } = useCart();

  return (
    <>
      {/* Backdrop */}
      <div onClick={() => setIsOpen(false)}
        style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)',
          zIndex:100, opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none',
          transition:'opacity 0.3s',
        }} />

      {/* Drawer */}
      <div style={{
        position:'fixed', top:0, right:0, bottom:0, width:400, maxWidth:'100vw',
        background:'#0d1117', borderLeft:'1px solid rgba(255,255,255,0.08)',
        zIndex:101, display:'flex', flexDirection:'column',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition:'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        boxShadow:'-20px 0 60px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <ShoppingCart size={18} style={{ color:'#6EE7B7' }} />
            <h2 style={{ color:'#fff', fontWeight:700, fontSize:17, margin:0 }}>Cart</h2>
            {items.length > 0 && (
              <span style={{ background:'rgba(110,231,183,0.15)', color:'#6EE7B7', fontSize:12, fontWeight:700, padding:'2px 8px', borderRadius:20, border:'1px solid rgba(110,231,183,0.2)' }}>
                {items.length}
              </span>
            )}
          </div>
          <button onClick={() => setIsOpen(false)}
            style={{ background:'none', border:'none', color:'#6b7280', cursor:'pointer', padding:6, borderRadius:8, display:'flex', alignItems:'center' }}>
            <X size={18}/>
          </button>
        </div>

        {/* Items */}
        <div style={{ flex:1, overflowY:'auto', padding:'16px 24px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 20px' }}>
              <ShoppingBag size={48} style={{ color:'#1f2937', margin:'0 auto 16px' }} />
              <p style={{ color:'#6b7280', fontSize:15, fontWeight:500, margin:'0 0 6px' }}>Your cart is empty</p>
              <p style={{ color:'#4b5563', fontSize:13 }}>Browse the shop to add items</p>
              <Link to="/shop" onClick={() => setIsOpen(false)}
                style={{ display:'inline-flex', alignItems:'center', gap:6, marginTop:20, background:'rgba(110,231,183,0.1)', color:'#6EE7B7', textDecoration:'none', padding:'9px 18px', borderRadius:12, fontSize:13, fontWeight:600, border:'1px solid rgba(110,231,183,0.2)' }}>
                Go to Shop <ArrowRight size={14}/>
              </Link>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {items.map(item => (
                <div key={item._id}
                  style={{ display:'flex', gap:14, padding:'14px 16px', borderRadius:14, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                  {/* Icon */}
                  <div style={{ width:48, height:48, borderRadius:12, background:'rgba(110,231,183,0.07)', border:'1px solid rgba(110,231,183,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:20 }}>
                    {CAT_ICONS[item.category] || '📦'}
                  </div>

                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ color:'#f3f4f6', fontWeight:600, fontSize:13, margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.name}</p>
                    <p style={{ color:'#6b7280', fontSize:11, margin:'0 0 10px', fontFamily:'monospace' }}>{item.sku}</p>

                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      {/* Qty */}
                      <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.05)', borderRadius:8, padding:'4px 8px' }}>
                        <button onClick={() => updateQty(item._id, item.qty - 1)}
                          style={{ background:'none', border:'none', color:'#9ca3af', cursor:'pointer', display:'flex', alignItems:'center', padding:0 }}>
                          <Minus size={12}/>
                        </button>
                        <span style={{ color:'#f3f4f6', fontSize:13, fontWeight:700, minWidth:20, textAlign:'center' }}>{item.qty}</span>
                        <button onClick={() => updateQty(item._id, item.qty + 1)}
                          style={{ background:'none', border:'none', color:'#9ca3af', cursor:'pointer', display:'flex', alignItems:'center', padding:0 }}>
                          <Plus size={12}/>
                        </button>
                      </div>

                      <p style={{ color:'#6EE7B7', fontWeight:700, fontSize:14, fontFamily:'monospace', margin:0 }}>
                        ${(item.price * item.qty).toFixed(2)}
                      </p>

                      <button onClick={() => removeItem(item._id)}
                        style={{ background:'none', border:'none', color:'#374151', cursor:'pointer', display:'flex', padding:4, borderRadius:6 }}
                        onMouseEnter={e=>e.currentTarget.style.color='#f87171'}
                        onMouseLeave={e=>e.currentTarget.style.color='#374151'}>
                        <Trash2 size={13}/>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding:'18px 24px', borderTop:'1px solid rgba(255,255,255,0.07)', background:'rgba(0,0,0,0.3)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <span style={{ color:'#9ca3af', fontSize:14 }}>Subtotal</span>
              <span style={{ color:'#fff', fontWeight:700, fontSize:20, fontFamily:'monospace' }}>${totalPrice.toFixed(2)}</span>
            </div>
            <Link to="/checkout" onClick={() => setIsOpen(false)}
              style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'#6EE7B7', color:'#052e16', fontWeight:700, padding:'13px', borderRadius:13, textDecoration:'none', fontSize:14, width:'100%' }}>
              Checkout <ArrowRight size={16}/>
            </Link>
            <Link to="/shop" onClick={() => setIsOpen(false)}
              style={{ display:'flex', alignItems:'center', justifyContent:'center', marginTop:10, color:'#6b7280', textDecoration:'none', fontSize:13 }}>
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </>
  );
}