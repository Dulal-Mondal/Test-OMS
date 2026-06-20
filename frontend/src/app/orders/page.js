'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '../../lib/api';
import OrderForm from '../../components/OrderForm';

const STATUS = {
    PENDING: { label: 'Pending', cls: 'bg-orange-500/15 text-orange-400 border-orange-500/40' },
    CONFIRMED: { label: 'Confirmed', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/40' },
    PROCESSING: { label: 'Processing', cls: 'bg-purple-500/15 text-purple-400 border-purple-500/40' },
    SHIPPED: { label: 'Shipped', cls: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40' },
    DELIVERED: { label: 'Delivered', cls: 'bg-green-500/15 text-green-400 border-green-500/40' },
    CANCELLED: { label: 'Cancelled', cls: 'bg-red-500/15 text-red-400 border-red-500/40' },
};

const PLATFORM_ICON = { whatsapp: '💬', messenger: '📘', instagram: '📸' };

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [pulling, setPulling] = useState(false);
    const [msg, setMsg] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (filter) params.status = filter;
            if (search) params.search = search;
            const data = await api.listOrders(params);
            setOrders(data.orders || []);
            setStats(data.stats || {});
        } catch (err) {
            setMsg({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    }, [filter, search]);

    useEffect(() => {
        const t = setTimeout(load, 300);
        return () => clearTimeout(t);
    }, [load]);

    const flash = (type, text) => {
        setMsg({ type, text });
        setTimeout(() => setMsg(null), 3000);
    };

    const updateStatus = async (id, status) => {
        try {
            await api.updateStatus(id, status);
            flash('success', `Status updated to ${status}`);
            load();
        } catch (err) { flash('error', err.message); }
    };

    const remove = async (id) => {
        if (!confirm('Delete this order?')) return;
        try {
            await api.deleteOrder(id);
            flash('success', 'Order deleted');
            load();
        } catch (err) { flash('error', err.message); }
    };

    const pullOrders = async () => {
        setPulling(true);
        try {
            const data = await api.pullFromSBC();
            flash('success', `${data.imported} new orders imported from SoftBrainChat`);
            load();
        } catch (err) { flash('error', err.message); }
        finally { setPulling(false); }
    };

    const total = Object.values(stats).reduce((a, b) => a + b, 0);

    return (
        <div className="p-8 max-w-7xl mx-auto">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-100">Orders</h1>
                    <p className="text-sm text-gray-400 mt-1">{total} total orders</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={pullOrders} disabled={pulling} className="btn btn-outline">
                        {pulling ? 'Pulling...' : '⬇ Pull from SoftBrainChat'}
                    </button>
                    <button onClick={() => setShowForm(true)} className="btn btn-primary">
                        + New Order
                    </button>
                </div>
            </div>

            {/* Flash message */}
            {msg && (
                <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm border ${msg.type === 'success'
                        ? 'bg-green-500/10 text-green-400 border-green-500/30'
                        : 'bg-red-500/10 text-red-400 border-red-500/30'
                    }`}>
                    {msg.text}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-6 gap-3 mb-6">
                {Object.entries(STATUS).map(([key, s]) => (
                    <button key={key} onClick={() => setFilter(f => f === key ? '' : key)}
                        className={`card text-center transition ${filter === key ? 'ring-2 ring-accent' : ''}`}>
                        <div className="stat-num text-2xl text-gray-100">{stats[key] || 0}</div>
                        <div className="text-[11px] text-gray-500 mt-1">{s.label}</div>
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="flex gap-3 mb-4">
                <input className="input max-w-xs" placeholder="Search name, phone, product..."
                    value={search} onChange={e => setSearch(e.target.value)} />
                {filter && (
                    <button className="btn btn-outline btn-sm" onClick={() => setFilter('')}>Clear ✕</button>
                )}
            </div>

            {/* Table */}
            <div className="card p-0 overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border bg-card">
                            {['Order', 'Source', 'Customer', 'Product', 'Status', 'Date', ''].map(h => (
                                <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className="text-center py-12 text-gray-500">Loading...</td></tr>
                        ) : orders.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-12 text-gray-500">
                                <div className="text-3xl mb-2">📦</div>No orders yet
                            </td></tr>
                        ) : orders.map(o => {
                            const st = STATUS[o.status] || STATUS.PENDING;
                            return (
                                <tr key={o.id} className="border-b border-border hover:bg-card/50 transition">
                                    <td className="px-4 py-3">
                                        <div className="text-xs font-mono text-blue-400">{o.sourceOrderId}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs text-gray-400">
                                            {o.platform && PLATFORM_ICON[o.platform]} {o.source}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-sm text-gray-200">{o.customerName}</div>
                                        <div className="text-xs text-gray-500">{o.customerPhone}</div>
                                        <div className="text-xs text-gray-500 max-w-[160px] truncate">{o.customerAddress}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2.5">
                                            {o.productImage && !o.productImage.startsWith('whatsapp-media:') && (
                                                <img
                                                    src={o.productImage}
                                                    alt={o.productName}
                                                    className="w-10 h-10 rounded-lg object-cover border border-border flex-shrink-0"
                                                />
                                            )}
                                            <div>
                                                <div className="text-sm text-gray-200">{o.productName}</div>
                                                <div className="text-xs text-gray-500">
                                                    {o.productCode && `Code: ${o.productCode} · `}
                                                    {o.productSize && `Size: ${o.productSize} · `}
                                                    {o.productPrice && `${o.productPrice} · `}Qty: {o.productQuantity}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
                                            className={`text-xs font-semibold rounded-md px-2 py-1 border outline-none cursor-pointer ${st.cls}`}>
                                            {Object.entries(STATUS).map(([k, s]) => (
                                                <option key={k} value={k} className="bg-surface text-gray-200">{s.label}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                                        {new Date(o.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => remove(o.id)} className="btn btn-danger btn-sm">Delete</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* New order modal */}
            {showForm && (
                <OrderForm
                    onClose={() => setShowForm(false)}
                    onCreated={() => { setShowForm(false); flash('success', 'Order created'); load(); }}
                />
            )}
        </div>
    );
}