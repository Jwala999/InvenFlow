import React, { useEffect, useState, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, SlidersHorizontal,
  ArrowUpCircle, ArrowDownCircle, RefreshCw, X, AlertTriangle,
} from 'lucide-react';
import { API } from '../context/AuthContext';

const S = {
  card:       { background:'#0d1117', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16 },
  input:      { background:'#111827', border:'1px solid rgba(255,255,255,0.10)', color:'#e5e7eb', borderRadius:12, padding:'9px 14px', outline:'none', width:'100%', fontSize:13 },
  label:      { display:'block', fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em', color:'#9ca3af', marginBottom:6, fontFamily:'monospace' },
  btnPrimary: { background:'#6EE7B7', color:'#052e16', fontWeight:700, borderRadius:12, padding:'9px 20px', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontSize:13 },
  btnGhost:   { background:'transparent', color:'#9ca3af', borderRadius:12, padding:'9px 16px', border:'1px solid rgba(255,255,255,0.12)', cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontSize:13 },
  th:         { padding:'12px 20px', fontSize:11, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'monospace', textAlign:'left', borderBottom:'1px solid rgba(255,255,255,0.07)', whiteSpace:'nowrap' },
  td:         { padding:'14px 20px', verticalAlign:'middle', borderBottom:'1px solid rgba(255,255,255,0.04)' },
};

const TYPE_CFG = {
  stock_in:   { label:'Stock In',   icon: ArrowUpCircle,    color:'#4ade80', bg:'rgba(34,197,94,0.12)',   border:'rgba(34,197,94,0.25)'  },
  stock_out:  { label:'Stock Out',  icon: ArrowDownCircle,  color:'#fb7185', bg:'rgba(244,63,94,0.12)',   border:'rgba(244,63,94,0.25)'  },
  adjustment: { label:'Adjustment', icon: SlidersHorizontal,color:'#38bdf8', bg:'rgba(56,189,248,0.12)',  border:'rgba(56,189,248,0.25)' },
  return:     { label:'Return',     icon: TrendingUp,        color:'#fbbf24', bg:'rgba(245,158,11,0.12)', border:'rgba(245,158,11,0.25)' },
};

/* ─── Stock Action Modal ─────────────────────────────────────────────── */
function StockActionModal({ mode, products, onClose, onDone }) {
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity]   = useState('');
  const [newQty, setNewQty]       = useState('');
  const [reason, setReason]       = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const titles = { in:'Stock In', out:'Stock Out', adj:'Adjust Stock' };
  const colors = { in:'#4ade80', out:'#fb7185', adj:'#38bdf8' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (mode==='in')  await API.post('/stock/in',     { productId, quantity:Number(quantity), reason });
      if (mode==='out') await API.post('/stock/out',    { productId, quantity:Number(quantity), reason });
      if (mode==='adj') await API.post('/stock/adjust', { productId, newQuantity:Number(newQty), reason });
      onDone(); onClose();
    } catch(err) {
      setError(err.response?.data?.message || 'Operation failed.');
    } finally { setLoading(false); }
  };

  const fieldStyle = { ...S.input };
  const selectStyle = { ...S.input, cursor:'pointer' };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.78)', backdropFilter:'blur(6px)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ ...S.card, width:'100%', maxWidth:440 }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'18px 24px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          <span style={{ color: colors[mode], fontSize:18 }}>
            {mode==='in' ? <ArrowUpCircle size={18}/> : mode==='out' ? <ArrowDownCircle size={18}/> : <SlidersHorizontal size={18}/>}
          </span>
          <h2 style={{ color:'#fff', fontWeight:700, fontSize:17 }}>{titles[mode]}</h2>
          <button onClick={onClose} style={{ marginLeft:'auto', background:'none', border:'none', color:'#6b7280', cursor:'pointer', padding:4 }}><X size={17}/></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding:24, display:'flex', flexDirection:'column', gap:16 }}>
          {error && (
            <div style={{ padding:'10px 14px', borderRadius:10, background:'rgba(244,63,94,0.1)', border:'1px solid rgba(244,63,94,0.25)', color:'#fb7185', fontSize:13, display:'flex', alignItems:'center', gap:8 }}>
              <AlertTriangle size={14}/>{error}
            </div>
          )}

          <div>
            <label style={S.label}>Select Product *</label>
            <select value={productId} onChange={e=>setProductId(e.target.value)} style={selectStyle} required>
              <option value="" style={{background:'#111827',color:'#9ca3af'}}>Choose a product…</option>
              {products.map(p => (
                <option key={p._id} value={p._id} style={{background:'#111827',color:'#e5e7eb'}}>
                  {p.name} (SKU: {p.sku}) — {p.quantity} in stock
                </option>
              ))}
            </select>
          </div>

          {mode !== 'adj' ? (
            <div>
              <label style={S.label}>Quantity *</label>
              <input type="number" min="1" value={quantity} onChange={e=>setQuantity(e.target.value)} style={fieldStyle} required />
            </div>
          ) : (
            <div>
              <label style={S.label}>New Quantity *</label>
              <input type="number" min="0" value={newQty} onChange={e=>setNewQty(e.target.value)} style={fieldStyle} required />
            </div>
          )}

          <div>
            <label style={S.label}>Reason</label>
            <input value={reason} onChange={e=>setReason(e.target.value)} style={fieldStyle} placeholder="e.g. Order #1234, Restock…" />
          </div>

          <div style={{ display:'flex', gap:10, marginTop:4 }}>
            <button type="button" onClick={onClose} style={{...S.btnGhost, flex:1}}>Cancel</button>
            <button type="submit" disabled={loading} style={{...S.btnPrimary, flex:1}}>
              {loading ? 'Processing…' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────────── */
export default function StockPage() {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [modal, setModal]               = useState(null);
  const [typeFilter, setTypeFilter]     = useState('');
  const [page, setPage]                 = useState(1);
  const [pagination, setPagination]     = useState({});
  const [hovered, setHovered]           = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [txnRes, prodRes] = await Promise.all([
        API.get('/stock/transactions', { params:{ page, limit:15, ...(typeFilter&&{type:typeFilter}) } }),
        API.get('/products', { params:{ limit:200 } }),
      ]);
      setTransactions(txnRes.data.data.transactions);
      setPagination(txnRes.data.data.pagination);
      setProducts(prodRes.data.data.products);
    } catch { setTransactions([]); }
    finally { setLoading(false); }
  }, [page, typeFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const lowStock = products.filter(p => p.quantity <= p.lowStockThreshold);

  const ActionBtn = ({ mode, label, icon: Icon, color, bg, border }) => (
    <button onClick={() => setModal(mode)}
      style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 16px', borderRadius:12, background:bg, border:`1px solid ${border}`, color, fontSize:13, fontWeight:600, cursor:'pointer' }}>
      <Icon size={14}/>{label}
    </button>
  );

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div style={{ display:'flex', flexWrap:'wrap', alignItems:'flex-start', gap:16 }}>
        <div>
          <h2 style={{ color:'#fff', fontWeight:700, fontSize:20 }}>Stock Management</h2>
          <p style={{ color:'#6b7280', fontSize:13, marginTop:2 }}>{pagination.total||0} total transactions</p>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', flexWrap:'wrap', gap:8 }}>
          <ActionBtn mode="in"  label="Stock In"  icon={TrendingUp}        color="#4ade80" bg="rgba(34,197,94,0.1)"   border="rgba(34,197,94,0.25)"  />
          <ActionBtn mode="out" label="Stock Out" icon={TrendingDown}       color="#fb7185" bg="rgba(244,63,94,0.1)"  border="rgba(244,63,94,0.25)"  />
          <ActionBtn mode="adj" label="Adjust"    icon={SlidersHorizontal}  color="#38bdf8" bg="rgba(56,189,248,0.1)" border="rgba(56,189,248,0.25)" />
          <button onClick={fetchData} style={S.btnGhost}><RefreshCw size={13}/></button>
        </div>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div style={{ ...S.card, padding:'14px 18px', background:'rgba(245,158,11,0.07)', borderColor:'rgba(245,158,11,0.25)', display:'flex', alignItems:'flex-start', gap:12 }}>
          <AlertTriangle size={16} style={{ color:'#fbbf24', marginTop:1, flexShrink:0 }} />
          <div>
            <p style={{ color:'#fbbf24', fontSize:13, fontWeight:600 }}>
              {lowStock.length} product{lowStock.length>1?'s':''} need{lowStock.length===1?'s':''} restocking
            </p>
            <p style={{ color:'#9ca3af', fontSize:12, marginTop:3, fontFamily:'monospace' }}>
              {lowStock.slice(0,4).map(p=>p.name).join(', ')}{lowStock.length>4?` +${lowStock.length-4} more`:''}
            </p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div style={{ ...S.card, padding:'14px 18px', display:'flex', flexWrap:'wrap', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:11, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'monospace' }}>Filter:</span>
        {['', 'stock_in', 'stock_out', 'adjustment', 'return'].map(t => {
          const active = typeFilter===t;
          return (
            <button key={t} onClick={()=>{setTypeFilter(t);setPage(1);}}
              style={{ padding:'6px 14px', borderRadius:8, fontSize:12, fontFamily:'monospace', border: active ? 'none' : '1px solid rgba(255,255,255,0.1)', background: active ? '#6EE7B7' : 'transparent', color: active ? '#052e16' : '#9ca3af', fontWeight: active ? 700 : 400, cursor:'pointer', transition:'all 0.15s' }}>
              {t==='' ? 'All' : TYPE_CFG[t]?.label}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div style={S.card}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                {['Type','Product','Qty Change','Before → After','Reason','By','Date'].map(h=>(
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_,i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_,j) => (
                      <td key={j} style={S.td}>
                        <div style={{ height:12, background:'rgba(255,255,255,0.06)', borderRadius:4 }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : transactions.length===0 ? (
                <tr>
                  <td colSpan={7} style={{ padding:'60px 20px', textAlign:'center' }}>
                    <SlidersHorizontal size={32} style={{ color:'#374151', margin:'0 auto 12px' }} />
                    <p style={{ color:'#6b7280', fontSize:14 }}>No transactions found</p>
                  </td>
                </tr>
              ) : (
                transactions.map(t => {
                  const cfg = TYPE_CFG[t.type] || {};
                  const Icon = cfg.icon || SlidersHorizontal;
                  const delta = t.newQuantity - t.previousQuantity;
                  return (
                    <tr key={t._id}
                      onMouseEnter={()=>setHovered(t._id)}
                      onMouseLeave={()=>setHovered(null)}
                      style={{ background: hovered===t._id ? 'rgba(255,255,255,0.02)' : 'transparent', transition:'background 0.1s' }}>

                      <td style={S.td}>
                        <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:8, fontSize:11, fontFamily:'monospace', fontWeight:600, background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}` }}>
                          <Icon size={10}/>{cfg.label}
                        </span>
                      </td>
                      <td style={S.td}>
                        <p style={{ color:'#f3f4f6', fontSize:13, fontWeight:600 }}>{t.product?.name || '—'}</p>
                        <p style={{ color:'#6b7280', fontSize:11, marginTop:2, fontFamily:'monospace' }}>{t.product?.sku}</p>
                      </td>
                      <td style={S.td}>
                        <span style={{ fontFamily:'monospace', fontSize:13, fontWeight:700, color: delta>0 ? '#4ade80' : '#f87171' }}>
                          {delta>0?'+':''}{delta}
                        </span>
                      </td>
                      <td style={S.td}>
                        <span style={{ fontFamily:'monospace', fontSize:12, color:'#9ca3af' }}>
                          {t.previousQuantity} → {t.newQuantity}
                        </span>
                      </td>
                      <td style={S.td}>
                        <p style={{ fontSize:13, color:'#9ca3af', maxWidth:150, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.reason||'—'}</p>
                      </td>
                      <td style={S.td}>
                        <p style={{ fontSize:12, color:'#6b7280' }}>{t.performedBy?.name||'—'}</p>
                      </td>
                      <td style={S.td}>
                        <p style={{ fontSize:11, fontFamily:'monospace', color:'#6b7280', whiteSpace:'nowrap' }}>
                          {new Date(t.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                        </p>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {pagination.pages>1 && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
            <p style={{ fontSize:11, color:'#6b7280', fontFamily:'monospace' }}>Page {pagination.page} of {pagination.pages}</p>
            <div style={{ display:'flex', gap:8 }}>
              <button disabled={page===1} onClick={()=>setPage(p=>p-1)}
                style={{ ...S.btnGhost, padding:'6px 14px', color: page===1?'#374151':'#9ca3af', cursor:page===1?'not-allowed':'pointer' }}>Prev</button>
              <button disabled={page>=pagination.pages} onClick={()=>setPage(p=>p+1)}
                style={{ ...S.btnGhost, padding:'6px 14px', color: page>=pagination.pages?'#374151':'#9ca3af', cursor:page>=pagination.pages?'not-allowed':'pointer' }}>Next</button>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <StockActionModal mode={modal} products={products}
          onClose={()=>setModal(null)} onDone={fetchData} />
      )}
    </div>
  );
}