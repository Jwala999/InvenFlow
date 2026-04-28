import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Package, Minus, Plus, Star, Filter, Zap, ArrowRight } from 'lucide-react';
import { API } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CATS = ['All','Electronics','Clothing','Food','Furniture','Stationery','Sports','Healthcare','Other'];
const CAT_ICONS = { Electronics:'⚡', Clothing:'👕', Food:'🍎', Furniture:'🪑', Stationery:'✏️', Sports:'⚽', Healthcare:'💊', Other:'📦' };

function ProductCard({ product }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [hover, setHover] = useState(false);

  const handleAdd = () => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const inStock = product.quantity > 0;
  const isLow = product.quantity > 0 && product.quantity <= product.lowStockThreshold;

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background:'#0d1117', border:`1px solid ${hover ? 'rgba(110,231,183,0.25)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius:18, overflow:'hidden', transition:'all 0.25s', transform: hover ? 'translateY(-4px)' : 'none',
        boxShadow: hover ? '0 20px 40px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.2)',
        display:'flex', flexDirection:'column',
      }}>

      {/* Image placeholder */}
      <div style={{ height:180, background:'linear-gradient(135deg,rgba(110,231,183,0.05) 0%,rgba(56,189,248,0.05) 100%)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <span style={{ fontSize:56 }}>{CAT_ICONS[product.category] || '📦'}</span>
        {!inStock && (
          <div style={{ position:'absolute', top:10, right:10, background:'rgba(244,63,94,0.9)', color:'#fff', fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:6, fontFamily:'monospace' }}>OUT OF STOCK</div>
        )}
        {isLow && inStock && (
          <div style={{ position:'absolute', top:10, right:10, background:'rgba(245,158,11,0.9)', color:'#fff', fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:6, fontFamily:'monospace' }}>LOW STOCK</div>
        )}
        <div style={{ position:'absolute', top:10, left:10, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)', color:'#9ca3af', fontSize:10, padding:'3px 9px', borderRadius:6, fontFamily:'monospace' }}>
          {product.category}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding:'18px 18px 20px', flex:1, display:'flex', flexDirection:'column' }}>
        <h3 style={{ color:'#f3f4f6', fontWeight:700, fontSize:15, margin:'0 0 4px', lineHeight:1.3 }}>{product.name}</h3>
        <p style={{ color:'#6b7280', fontSize:12, margin:'0 0 12px', fontFamily:'monospace' }}>SKU: {product.sku}</p>

        {product.description && (
          <p style={{ color:'#9ca3af', fontSize:12, lineHeight:1.5, margin:'0 0 12px', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
            {product.description}
          </p>
        )}

        {product.supplier && (
          <p style={{ color:'#4b5563', fontSize:11, margin:'0 0 14px' }}>By {product.supplier}</p>
        )}

        <div style={{ marginTop:'auto' }}>
          {/* Rating (cosmetic) */}
          <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:12 }}>
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={12} style={{ color: s <= 4 ? '#fbbf24' : '#374151' }} fill={s <= 4 ? '#fbbf24' : 'none'} />
            ))}
            <span style={{ color:'#4b5563', fontSize:11, marginLeft:4 }}>4.0</span>
          </div>

          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <div>
              <p style={{ color:'#6EE7B7', fontWeight:800, fontSize:22, fontFamily:'monospace', margin:0 }}>${product.price.toLocaleString()}</p>
              <p style={{ color:'#4b5563', fontSize:11, marginTop:2 }}>{inStock ? `${product.quantity} left` : 'Unavailable'}</p>
            </div>
          </div>

          {inStock ? (
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              {/* Qty Selector */}
              <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.05)', borderRadius:10, padding:'4px 6px', border:'1px solid rgba(255,255,255,0.08)' }}>
                <button onClick={() => setQty(q => Math.max(1, q-1))}
                  style={{ background:'none', border:'none', color:'#9ca3af', cursor:'pointer', padding:'2px 4px', display:'flex', alignItems:'center' }}>
                  <Minus size={12}/>
                </button>
                <span style={{ color:'#f3f4f6', fontSize:13, fontWeight:700, minWidth:20, textAlign:'center' }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(q+1, product.quantity))}
                  style={{ background:'none', border:'none', color:'#9ca3af', cursor:'pointer', padding:'2px 4px', display:'flex', alignItems:'center' }}>
                  <Plus size={12}/>
                </button>
              </div>

              <button onClick={handleAdd}
                style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'9px 14px', borderRadius:12, border:'none', cursor:'pointer', fontWeight:700, fontSize:13, transition:'all 0.2s',
                  background: added ? '#4ade80' : '#6EE7B7', color: '#052e16' }}>
                <ShoppingCart size={14}/>
                {added ? '✓ Added!' : 'Add to Cart'}
              </button>
            </div>
          ) : (
            <button disabled style={{ width:'100%', padding:'9px 14px', borderRadius:12, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'#4b5563', cursor:'not-allowed', fontSize:13 }}>
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  const { user } = useAuth();
  const { totalItems, setIsOpen } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, status: 'active', ...(search && { search }), ...(category !== 'All' && { category }) };
      const { data } = await API.get('/products', { params });
      setProducts(data.data.products.filter(p => p.quantity > 0 || p.status === 'active'));
      setPagination(data.data.pagination);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, [page, search, category]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { setPage(1); }, [search, category]);

  return (
    <div style={{ minHeight:'100vh', background:'#080B12', color:'#f3f4f6' }}>
      {/* Top nav */}
      <header style={{ position:'sticky', top:0, zIndex:40, background:'rgba(8,11,18,0.92)', backdropFilter:'blur(16px)', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'0 24px' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', display:'flex', alignItems:'center', height:64, gap:16 }}>
          <Link to="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:10, background:'#6EE7B7', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Zap size={16} style={{ color:'#052e16' }} fill="#052e16" />
            </div>
            <span style={{ color:'#fff', fontWeight:800, fontSize:16 }}>InvenFlow</span>
            <span style={{ color:'#6b7280', fontSize:12, marginLeft:2 }}>/ Shop</span>
          </Link>

          <div style={{ flex:1, maxWidth:480, margin:'0 auto', position:'relative' }}>
            <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#6b7280' }} />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products…"
              style={{ background:'#111827', border:'1px solid rgba(255,255,255,0.10)', color:'#e5e7eb', borderRadius:12, padding:'9px 14px 9px 36px', width:'100%', fontSize:13, outline:'none' }} />
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:10, marginLeft:'auto' }}>
            {!user ? (
              <>
                <Link to="/login" style={{ color:'#9ca3af', textDecoration:'none', fontSize:13, padding:'8px 14px', borderRadius:10, border:'1px solid rgba(255,255,255,0.1)' }}>Sign In</Link>
                <Link to="/register" style={{ color:'#052e16', background:'#6EE7B7', textDecoration:'none', fontSize:13, fontWeight:700, padding:'8px 16px', borderRadius:10 }}>Create Account</Link>
              </>
            ) : (
              <Link to="/" style={{ color:'#9ca3af', textDecoration:'none', fontSize:13, padding:'8px 14px', borderRadius:10, border:'1px solid rgba(255,255,255,0.1)' }}>Dashboard</Link>
            )}
            <button onClick={() => setIsOpen(true)}
              style={{ position:'relative', padding:'8px 12px', borderRadius:10, background:'rgba(110,231,183,0.1)', border:'1px solid rgba(110,231,183,0.2)', color:'#6EE7B7', cursor:'pointer', display:'flex', alignItems:'center', gap:7, fontWeight:700, fontSize:13 }}>
              <ShoppingCart size={16}/>
              Cart
              {totalItems > 0 && (
                <span style={{ position:'absolute', top:-6, right:-6, width:18, height:18, borderRadius:'50%', background:'#6EE7B7', color:'#052e16', fontSize:10, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center' }}>{totalItems}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div style={{ background:'linear-gradient(135deg,rgba(110,231,183,0.05) 0%,rgba(56,189,248,0.03) 100%)', borderBottom:'1px solid rgba(255,255,255,0.05)', padding:'40px 24px' }}>
        <div style={{ maxWidth:1280, margin:'0 auto' }}>
          <h1 style={{ color:'#fff', fontWeight:800, fontSize:32, margin:'0 0 8px', letterSpacing:'-0.02em' }}>
            🛒 Shop Products
          </h1>
          <p style={{ color:'#6b7280', fontSize:15, margin:0 }}>
            Browse {pagination.total || 0}+ items — fast checkout, instant confirmation
          </p>
        </div>
      </div>

      <div style={{ maxWidth:1280, margin:'0 auto', padding:'28px 24px' }}>
        {/* Category Filter */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:28 }}>
          <Filter size={15} style={{ color:'#6b7280', marginTop:6, flexShrink:0 }} />
          {CATS.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              style={{ padding:'7px 16px', borderRadius:20, fontSize:12, fontWeight:600, border:'none', cursor:'pointer', transition:'all 0.2s',
                background: category===c ? '#6EE7B7' : 'rgba(255,255,255,0.05)',
                color: category===c ? '#052e16' : '#9ca3af' }}>
              {c !== 'All' && CAT_ICONS[c] ? `${CAT_ICONS[c]} ` : ''}{c}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:20 }}>
            {[...Array(8)].map((_,i) => (
              <div key={i} style={{ height:380, background:'#0d1117', border:'1px solid rgba(255,255,255,0.07)', borderRadius:18, animation:'pulse 1.5s ease infinite' }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign:'center', padding:'80px 20px' }}>
            <Package size={48} style={{ color:'#374151', margin:'0 auto 16px' }} />
            <h3 style={{ color:'#6b7280', fontWeight:600, fontSize:18, margin:'0 0 8px' }}>No products found</h3>
            <p style={{ color:'#4b5563', fontSize:14 }}>Try a different search or category</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:20 }}>
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:36 }}>
            {[...Array(pagination.pages)].map((_,i) => (
              <button key={i} onClick={() => setPage(i+1)}
                style={{ width:36, height:36, borderRadius:10, border:'1px solid rgba(255,255,255,0.1)', background: page===i+1 ? '#6EE7B7' : 'transparent', color: page===i+1 ? '#052e16' : '#9ca3af', fontWeight: page===i+1 ? 700 : 400, cursor:'pointer', fontSize:13 }}>
                {i+1}
              </button>
            ))}
          </div>
        )}

        {/* CTA for non-logged in users */}
        {!user && products.length > 0 && (
          <div style={{ marginTop:48, padding:'32px', borderRadius:20, background:'linear-gradient(135deg,rgba(110,231,183,0.08),rgba(56,189,248,0.05))', border:'1px solid rgba(110,231,183,0.15)', textAlign:'center' }}>
            <h3 style={{ color:'#fff', fontWeight:700, fontSize:20, margin:'0 0 8px' }}>Ready to shop?</h3>
            <p style={{ color:'#9ca3af', fontSize:14, margin:'0 0 20px' }}>Create an account to checkout and track your orders</p>
            <Link to="/register"
              style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#6EE7B7', color:'#052e16', fontWeight:700, padding:'11px 24px', borderRadius:12, textDecoration:'none', fontSize:14 }}>
              Get Started <ArrowRight size={16}/>
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  );
}