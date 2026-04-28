import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Plus, Search, Filter, Edit2, Trash2, Package,
  ChevronLeft, ChevronRight, X, RefreshCw, AlertTriangle,
} from 'lucide-react';
import { API } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Electronics','Clothing','Food','Furniture','Stationery','Sports','Healthcare','Other'];

/* ── Inline styles (no Tailwind custom colors) ─────────────────────────── */
const S = {
  page:     { background:'#080B12', minHeight:'100%' },
  card:     { background:'#0d1117', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16 },
  input:    { background:'#111827', border:'1px solid rgba(255,255,255,0.10)', color:'#e5e7eb', borderRadius:12, padding:'9px 14px', outline:'none', width:'100%', fontSize:13 },
  label:    { display:'block', fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em', color:'#9ca3af', marginBottom:6, fontFamily:'monospace' },
  btnPrimary: { background:'#6EE7B7', color:'#052e16', fontWeight:700, borderRadius:12, padding:'9px 20px', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontSize:13 },
  btnGhost:   { background:'transparent', color:'#9ca3af', fontWeight:500, borderRadius:12, padding:'9px 16px', border:'1px solid rgba(255,255,255,0.12)', cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontSize:13 },
  row:      { borderBottom:'1px solid rgba(255,255,255,0.05)' },
  th:       { padding:'12px 20px', fontSize:11, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'monospace', textAlign:'left', borderBottom:'1px solid rgba(255,255,255,0.07)', whiteSpace:'nowrap' },
  td:       { padding:'14px 20px', verticalAlign:'middle' },
};

const stockBadge = (s) => {
  const base = { display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:8, fontSize:11, fontFamily:'monospace', fontWeight:600 };
  if (s === 'out_of_stock') return <span style={{...base, background:'rgba(244,63,94,0.12)', color:'#fb7185', border:'1px solid rgba(244,63,94,0.25)'}}>Out of Stock</span>;
  if (s === 'low_stock')    return <span style={{...base, background:'rgba(245,158,11,0.12)', color:'#fbbf24', border:'1px solid rgba(245,158,11,0.25)'}}>Low Stock</span>;
  return <span style={{...base, background:'rgba(34,197,94,0.12)', color:'#4ade80', border:'1px solid rgba(34,197,94,0.25)'}}>In Stock</span>;
};

/* ── Product Modal ─────────────────────────────────────────────────────── */
function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(product || {
    name:'', sku:'', category:'Electronics', price:'', costPrice:'',
    quantity:'', lowStockThreshold:10, supplier:'', description:'', status:'active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (product) {
        const { data } = await API.put(`/products/${product._id}`, form);
        onSave(data.data.product);
      } else {
        const { data } = await API.post('/products', form);
        onSave(data.data.product);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product.');
    } finally { setLoading(false); }
  };

  const fieldStyle = { ...S.input, marginTop: 0 };
  const selectStyle = { ...S.input, appearance: 'none', cursor: 'pointer' };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...S.card, width:'100%', maxWidth:640, maxHeight:'90vh', overflowY:'auto' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          <h2 style={{ color:'#fff', fontWeight:700, fontSize:18 }}>{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'#6b7280', cursor:'pointer', padding:4 }}><X size={18}/></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding:24 }}>
          {error && (
            <div style={{ padding:'12px 16px', marginBottom:16, borderRadius:12, background:'rgba(244,63,94,0.1)', border:'1px solid rgba(244,63,94,0.25)', color:'#fb7185', fontSize:13 }}>
              {error}
            </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div>
              <label style={S.label}>Product Name *</label>
              <input value={form.name} onChange={e=>f('name',e.target.value)} style={fieldStyle} required />
            </div>
            <div>
              <label style={S.label}>SKU *</label>
              <input value={form.sku} onChange={e=>f('sku',e.target.value.toUpperCase())} style={{...fieldStyle,fontFamily:'monospace'}} required />
            </div>
            <div>
              <label style={S.label}>Category *</label>
              <select value={form.category} onChange={e=>f('category',e.target.value)} style={selectStyle}>
                {CATEGORIES.map(c=><option key={c} value={c} style={{background:'#111827',color:'#e5e7eb'}}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={S.label}>Status</label>
              <select value={form.status} onChange={e=>f('status',e.target.value)} style={selectStyle}>
                {['active','inactive','discontinued'].map(s=><option key={s} value={s} style={{background:'#111827',color:'#e5e7eb'}}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={S.label}>Selling Price ($) *</label>
              <input type="number" min="0" step="0.01" value={form.price} onChange={e=>f('price',e.target.value)} style={fieldStyle} required />
            </div>
            <div>
              <label style={S.label}>Cost Price ($) *</label>
              <input type="number" min="0" step="0.01" value={form.costPrice} onChange={e=>f('costPrice',e.target.value)} style={fieldStyle} required />
            </div>
            <div>
              <label style={S.label}>Quantity</label>
              <input type="number" min="0" value={form.quantity} onChange={e=>f('quantity',e.target.value)} style={fieldStyle} />
            </div>
            <div>
              <label style={S.label}>Low Stock Threshold</label>
              <input type="number" min="0" value={form.lowStockThreshold} onChange={e=>f('lowStockThreshold',e.target.value)} style={fieldStyle} />
            </div>
            <div style={{ gridColumn:'span 2' }}>
              <label style={S.label}>Supplier</label>
              <input value={form.supplier} onChange={e=>f('supplier',e.target.value)} style={fieldStyle} />
            </div>
            <div style={{ gridColumn:'span 2' }}>
              <label style={S.label}>Description</label>
              <textarea value={form.description} onChange={e=>f('description',e.target.value)}
                rows={3} style={{...fieldStyle, resize:'none'}} />
            </div>
          </div>

          <div style={{ display:'flex', gap:12, marginTop:20 }}>
            <button type="button" onClick={onClose} style={{...S.btnGhost, flex:1, justifyContent:'center'}}>Cancel</button>
            <button type="submit" disabled={loading} style={{...S.btnPrimary, flex:1, justifyContent:'center'}}>
              {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main Component ────────────────────────────────────────────────────── */
export default function ProductsPage() {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const urlSearch = new URLSearchParams(location.search).get('search') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(urlSearch);
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [modal, setModal] = useState(null);
  const [hovered, setHovered] = useState(null);

  // When URL query param changes (from navbar search), update local state
  useEffect(() => {
    if (urlSearch) { setSearch(urlSearch); setPage(1); }
  }, [urlSearch]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit:12, ...(search&&{search}), ...(category&&{category}) };
      const { data } = await API.get('/products', { params });
      setProducts(data.data.products);
      setPagination(data.data.pagination);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, [page, search, category]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    await API.delete(`/products/${id}`);
    fetchProducts();
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div style={{ display:'flex', flexWrap:'wrap', alignItems:'flex-start', gap:16 }}>
        <div>
          <h2 style={{ color:'#fff', fontWeight:700, fontSize:20 }}>Products</h2>
          <p style={{ color:'#6b7280', fontSize:13, marginTop:2 }}>{pagination.total||0} total products</p>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', gap:10 }}>
          <button onClick={fetchProducts} style={S.btnGhost}>
            <RefreshCw size={13}/> Refresh
          </button>
          <button onClick={() => setModal('new')} style={S.btnPrimary}>
            <Plus size={15}/> Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{...S.card, padding:'14px 18px', display:'flex', flexWrap:'wrap', gap:12, alignItems:'center'}}>
        <div style={{ position:'relative', flex:'1', minWidth:200 }}>
          <Search size={13} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#6b7280' }} />
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}
            placeholder="Search products…" style={{...S.input, paddingLeft:34}} />
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Filter size={13} style={{ color:'#6b7280' }} />
          <select value={category} onChange={e=>{setCategory(e.target.value);setPage(1);}}
            style={{...S.input, width:160, cursor:'pointer'}}>
            <option value="" style={{background:'#111827'}}>All Categories</option>
            {CATEGORIES.map(c=><option key={c} value={c} style={{background:'#111827'}}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={S.card}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                {['Product','SKU','Category','Price','Stock','Status',''].map(h=>(
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_,i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_,j) => (
                      <td key={j} style={S.td}>
                        <div style={{ height:12, background:'rgba(255,255,255,0.06)', borderRadius:4, animation:'pulse 1.5s ease infinite' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding:'60px 20px', textAlign:'center' }}>
                    <Package size={36} style={{ color:'#374151', margin:'0 auto 12px' }} />
                    <p style={{ color:'#6b7280', fontSize:14 }}>No products found</p>
                    <p style={{ color:'#374151', fontSize:12, marginTop:4 }}>Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                products.map(p => (
                  <tr key={p._id}
                    onMouseEnter={() => setHovered(p._id)}
                    onMouseLeave={() => setHovered(null)}
                    style={{ ...S.row, background: hovered===p._id ? 'rgba(255,255,255,0.02)' : 'transparent', transition:'background 0.15s' }}>

                    {/* Product */}
                    <td style={S.td}>
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ width:34, height:34, borderRadius:10, background:'rgba(110,231,183,0.08)', border:'1px solid rgba(110,231,183,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <Package size={14} style={{ color:'#6EE7B7' }} />
                        </div>
                        <div>
                          <p style={{ color:'#f3f4f6', fontWeight:600, fontSize:13 }}>{p.name}</p>
                          <p style={{ color:'#6b7280', fontSize:11, marginTop:2 }}>{p.supplier || '—'}</p>
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td style={S.td}>
                      <span style={{ fontFamily:'monospace', fontSize:11, color:'#9ca3af', background:'rgba(255,255,255,0.06)', padding:'3px 8px', borderRadius:6 }}>{p.sku}</span>
                    </td>

                    {/* Category */}
                    <td style={S.td}>
                      <span style={{ fontSize:13, color:'#9ca3af' }}>{p.category}</span>
                    </td>

                    {/* Price */}
                    <td style={S.td}>
                      <p style={{ fontFamily:'monospace', fontSize:13, color:'#f3f4f6', fontWeight:600 }}>${p.price.toLocaleString()}</p>
                      <p style={{ fontSize:11, color:'#6b7280', marginTop:2 }}>Cost: ${p.costPrice}</p>
                    </td>

                    {/* Stock */}
                    <td style={S.td}>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <span style={{ fontFamily:'monospace', fontSize:13, color:'#f3f4f6', fontWeight:600 }}>{p.quantity}</span>
                        {p.quantity <= p.lowStockThreshold && p.quantity > 0 && (
                          <AlertTriangle size={12} style={{ color:'#fbbf24' }} />
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td style={S.td}>{stockBadge(p.stockStatus)}</td>

                    {/* Actions */}
                    <td style={S.td}>
                      <div style={{ display:'flex', gap:6 }}>
                        <button onClick={() => setModal(p)}
                          style={{ padding:8, borderRadius:8, background:'none', border:'none', color:'#6b7280', cursor:'pointer' }}
                          onMouseEnter={e=>e.currentTarget.style.color='#6EE7B7'}
                          onMouseLeave={e=>e.currentTarget.style.color='#6b7280'}>
                          <Edit2 size={13}/>
                        </button>
                        {isAdmin && (
                          <button onClick={() => handleDelete(p._id)}
                            style={{ padding:8, borderRadius:8, background:'none', border:'none', color:'#6b7280', cursor:'pointer' }}
                            onMouseEnter={e=>e.currentTarget.style.color='#f87171'}
                            onMouseLeave={e=>e.currentTarget.style.color='#6b7280'}>
                            <Trash2 size={13}/>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
            <p style={{ fontSize:11, color:'#6b7280', fontFamily:'monospace' }}>
              Page {pagination.page} of {pagination.pages} ({pagination.total} items)
            </p>
            <div style={{ display:'flex', gap:8 }}>
              <button disabled={page===1} onClick={()=>setPage(p=>p-1)}
                style={{ padding:8, borderRadius:8, border:'1px solid rgba(255,255,255,0.1)', background:'none', color: page===1 ? '#374151' : '#9ca3af', cursor: page===1 ? 'not-allowed' : 'pointer' }}>
                <ChevronLeft size={14}/>
              </button>
              <button disabled={page>=pagination.pages} onClick={()=>setPage(p=>p+1)}
                style={{ padding:8, borderRadius:8, border:'1px solid rgba(255,255,255,0.1)', background:'none', color: page>=pagination.pages ? '#374151' : '#9ca3af', cursor: page>=pagination.pages ? 'not-allowed' : 'pointer' }}>
                <ChevronRight size={14}/>
              </button>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <ProductModal
          product={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetchProducts(); }}
        />
      )}
    </div>
  );
}