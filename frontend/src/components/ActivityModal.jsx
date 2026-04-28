import React, { useEffect, useState, useRef } from 'react';
import {
  X, Activity, ArrowUpCircle, ArrowDownCircle,
  SlidersHorizontal, TrendingUp, Package, Clock,
  CheckCircle, User, RefreshCw,
} from 'lucide-react';
import { API } from '../context/AuthContext';

/* ─── Type config ────────────────────────────────────────────────────────── */
const TYPE_CFG = {
  stock_in:   { label:'Stock In',   icon: ArrowUpCircle,    color:'#4ade80', bg:'rgba(74,222,128,0.12)',   border:'rgba(74,222,128,0.25)'  },
  stock_out:  { label:'Stock Out',  icon: ArrowDownCircle,  color:'#f87171', bg:'rgba(248,113,113,0.12)', border:'rgba(248,113,113,0.25)' },
  adjustment: { label:'Adjustment', icon: SlidersHorizontal,color:'#38bdf8', bg:'rgba(56,189,248,0.12)',  border:'rgba(56,189,248,0.25)'  },
  return:     { label:'Return',     icon: TrendingUp,        color:'#fbbf24', bg:'rgba(251,191,36,0.12)',  border:'rgba(251,191,36,0.25)'  },
};

/* ─── Time helper ─────────────────────────────────────────────────────────── */
function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/* ─── Single transaction row ─────────────────────────────────────────────── */
function TxnRow({ txn, index }) {
  const cfg = TYPE_CFG[txn.type] || TYPE_CFG.adjustment;
  const Icon = cfg.icon;
  const delta = txn.newQuantity - txn.previousQuantity;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 55);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        padding: '14px 0',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(-16px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
    >
      {/* Icon bubble */}
      <div style={{
        width: 38, height: 38, borderRadius: 12, flexShrink: 0, marginTop: 2,
        background: cfg.bg, border: `1px solid ${cfg.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={16} style={{ color: cfg.color }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: 11, fontFamily: 'monospace', fontWeight: 700,
                padding: '2px 8px', borderRadius: 6,
                background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
              }}
            >
              {cfg.label}
            </span>
            <span style={{
              fontFamily: 'monospace', fontWeight: 800, fontSize: 14,
              color: delta > 0 ? '#4ade80' : '#f87171',
            }}>
              {delta > 0 ? '+' : ''}{delta} units
            </span>
          </div>
          <span style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
            {timeAgo(txn.createdAt)}
          </span>
        </div>

        {/* Product */}
        {txn.product && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <Package size={12} style={{ color: '#9ca3af' }} />
            <span style={{ color: '#d1d5db', fontSize: 13, fontWeight: 600 }}>{txn.product.name}</span>
            <span style={{ color: '#4b5563', fontSize: 11, fontFamily: 'monospace' }}>· {txn.product.sku}</span>
          </div>
        )}

        {/* Before → After */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#6b7280' }}>
            Stock: <span style={{ color: '#9ca3af' }}>{txn.previousQuantity}</span>
            {' → '}
            <span style={{ color: '#f3f4f6', fontWeight: 700 }}>{txn.newQuantity}</span>
          </span>
          {txn.reason && (
            <span style={{
              fontSize: 11, fontFamily: 'monospace', color: '#6b7280',
              background: 'rgba(255,255,255,0.04)', borderRadius: 6,
              padding: '1px 8px', border: '1px solid rgba(255,255,255,0.07)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200,
            }}>
              {txn.reason}
            </span>
          )}
        </div>

        {/* Performed by */}
        {txn.performedBy && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}>
            <User size={11} style={{ color: '#4b5563' }} />
            <span style={{ fontSize: 11, color: '#4b5563' }}>{txn.performedBy.name}</span>
            <span style={{ fontSize: 10, color: '#374151', fontFamily: 'monospace' }}>
              · {new Date(txn.createdAt).toLocaleString('en-US', {
                month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Modal ─────────────────────────────────────────────────────────── */
export default function ActivityModal({ title, productId, orderId, onClose }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [filter, setFilter]             = useState('');
  const overlayRef = useRef(null);
  const panelRef   = useRef(null);

  /* mount animation */
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px) scale(0.97)';
    requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0) scale(1)';
    });
  }, []);

  /* close animation */
  const handleClose = () => {
    const el = panelRef.current;
    if (el) {
      el.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px) scale(0.97)';
      setTimeout(onClose, 200);
    } else {
      onClose();
    }
  };

  /* fetch data */
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      let txns = [];
      if (productId) {
        const { data } = await API.get('/stock/transactions', {
          params: { productId, limit: 50 },
        });
        txns = data.data.transactions;
      } else if (orderId) {
        // For an order we search by reference (orderNumber stored in transactions)
        const orderRes = await API.get(`/orders/my`);
        const order = orderRes.data.data.orders.find(o => o._id === orderId);
        if (order) {
          const { data } = await API.get('/stock/transactions', {
            params: { reference: order.orderNumber, limit: 50 },
          });
          txns = data.data.transactions;
          // fallback: search by each product
          if (txns.length === 0 && order.items?.length) {
            const results = await Promise.all(
              order.items.map(item =>
                API.get('/stock/transactions', { params: { productId: item.product?._id || item.product, limit: 10 } })
                  .then(r => r.data.data.transactions.filter(t => t.reason?.includes(order.orderNumber)))
                  .catch(() => [])
              )
            );
            txns = results.flat();
          }
        }
      } else {
        // General: last 50 transactions
        const { data } = await API.get('/stock/transactions', { params: { limit: 50 } });
        txns = data.data.transactions;
      }
      setTransactions(txns);
    } catch {
      setError('Could not load activity. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [productId, orderId]);

  /* filtered list */
  const filtered = filter ? transactions.filter(t => t.type === filter) : transactions;

  /* summary counts */
  const counts = Object.keys(TYPE_CFG).reduce((acc, k) => {
    acc[k] = transactions.filter(t => t.type === k).length;
    return acc;
  }, {});

  return (
    /* ── Backdrop ── */
    <div
      ref={overlayRef}
      onClick={e => e.target === overlayRef.current && handleClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      {/* ── Panel ── */}
      <div
        ref={panelRef}
        className="activity-modal-panel"
        style={{
          background: '#0d1117',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 22,
          width: '100%',
          maxWidth: 680,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 11,
            background: 'rgba(110,231,183,0.1)', border: '1px solid rgba(110,231,183,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Activity size={16} style={{ color: '#6EE7B7' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 16, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {title || 'Stock Activity'}
            </h2>
            <p style={{ color: '#6b7280', fontSize: 11, fontFamily: 'monospace', margin: '2px 0 0' }}>
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} recorded
            </p>
          </div>
          <button
            onClick={fetchData}
            title="Refresh"
            style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 8, borderRadius: 9, display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#6EE7B7'}
            onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
          >
            <RefreshCw size={15} />
          </button>
          <button
            onClick={handleClose}
            style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 8, borderRadius: 9, display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Summary chips */}
        <div style={{
          display: 'flex', gap: 8, flexWrap: 'wrap',
          padding: '12px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}>
          <button
            onClick={() => setFilter('')}
            style={{
              padding: '5px 12px', borderRadius: 20, fontSize: 11,
              fontFamily: 'monospace', cursor: 'pointer', border: 'none',
              fontWeight: !filter ? 700 : 400,
              background: !filter ? '#6EE7B7' : 'rgba(255,255,255,0.06)',
              color: !filter ? '#052e16' : '#9ca3af',
              transition: 'all 0.15s',
            }}
          >
            All ({transactions.length})
          </button>
          {Object.entries(TYPE_CFG).map(([key, cfg]) => {
            const cnt = counts[key] || 0;
            if (cnt === 0 && !filter) return null;
            const active = filter === key;
            return (
              <button
                key={key}
                onClick={() => setFilter(f => f === key ? '' : key)}
                style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 11,
                  fontFamily: 'monospace', cursor: 'pointer',
                  border: active ? `1px solid ${cfg.border}` : 'none',
                  fontWeight: active ? 700 : 400,
                  background: active ? cfg.bg : 'rgba(255,255,255,0.05)',
                  color: active ? cfg.color : '#9ca3af',
                  transition: 'all 0.15s',
                }}
              >
                {cfg.label} ({cnt})
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 24px 20px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 16 }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} style={{
                  height: 76, borderRadius: 14,
                  background: 'rgba(255,255,255,0.04)',
                  animation: 'am-pulse 1.5s ease infinite',
                  animationDelay: `${i * 0.1}s`,
                }} />
              ))}
            </div>
          ) : error ? (
            <div style={{
              margin: '24px 0', padding: '16px 18px', borderRadius: 14,
              background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
              color: '#f87171', fontSize: 13, textAlign: 'center',
            }}>
              ⚠ {error}
              <br />
              <button onClick={fetchData} style={{ marginTop: 10, background: 'none', border: 'none', color: '#6EE7B7', cursor: 'pointer', fontSize: 13, textDecoration: 'underline' }}>
                Try again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '56px 24px' }}>
              <CheckCircle size={42} style={{ color: '#1f2937', margin: '0 auto 14px' }} />
              <p style={{ color: '#6b7280', fontSize: 15, fontWeight: 600, margin: '0 0 6px' }}>
                {filter ? `No ${TYPE_CFG[filter]?.label} transactions` : 'No transactions yet'}
              </p>
              <p style={{ color: '#374151', fontSize: 12 }}>
                {filter ? 'Clear the filter to see all activity' : 'Stock movements will appear here'}
              </p>
              {filter && (
                <button onClick={() => setFilter('')}
                  style={{ marginTop: 14, padding: '7px 16px', borderRadius: 10, background: 'rgba(110,231,183,0.1)', border: '1px solid rgba(110,231,183,0.2)', color: '#6EE7B7', cursor: 'pointer', fontSize: 12 }}>
                  Clear Filter
                </button>
              )}
            </div>
          ) : (
            <div>
              {filtered.map((txn, i) => (
                <TxnRow key={txn._id || i} txn={txn} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 11, color: '#4b5563', fontFamily: 'monospace' }}>
            Showing {filtered.length} of {transactions.length} transactions
          </span>
          <button
            onClick={handleClose}
            style={{
              padding: '8px 20px', borderRadius: 11,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#9ca3af', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes am-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .activity-modal-panel { scrollbar-width: thin; scrollbar-color: #374151 #0d1117; }
        .activity-modal-panel::-webkit-scrollbar { width: 5px; }
        .activity-modal-panel::-webkit-scrollbar-track { background: #0d1117; }
        .activity-modal-panel::-webkit-scrollbar-thumb { background: #374151; border-radius: 3px; }
      `}</style>
    </div>
  );
}