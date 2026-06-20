'use client';

import { useState } from 'react';
import { api } from '../lib/api';

export default function OrderForm({ onClose, onCreated }) {
    const [form, setForm] = useState({
        customerName: '', customerPhone: '', customerAddress: '',
        productName: '', productPrice: '', productQuantity: 1, notes: '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

    const submit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            await api.createOrder(form);
            onCreated();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const field = (label, key, props = {}) => (
        <div>
            <label className="block text-[13px] text-gray-400 mb-1.5">{label}</label>
            <input className="input" value={form[key]} onChange={e => set(key, e.target.value)} {...props} />
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={onClose}>
            <div className="bg-surface border border-border rounded-xl w-full max-w-lg p-6"
                onClick={e => e.stopPropagation()}>

                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-semibold text-gray-100">📝 New Order Entry</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl">✕</button>
                </div>

                {error && (
                    <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm border border-red-500/30">
                        {error}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">

                    <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Customer</div>
                    {field('Full Name', 'customerName', { placeholder: 'Rahim Uddin', required: true })}
                    <div className="grid grid-cols-2 gap-3">
                        {field('Phone', 'customerPhone', { placeholder: '01711234567', required: true })}
                        {field('Quantity', 'productQuantity', { type: 'number', min: 1 })}
                    </div>
                    {field('Delivery Address', 'customerAddress', { placeholder: 'House, Road, Area, City', required: true })}

                    <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide pt-2">Product</div>
                    <div className="grid grid-cols-2 gap-3">
                        {field('Product Name', 'productName', { placeholder: 'Organic Honey 500g', required: true })}
                        {field('Price', 'productPrice', { placeholder: '৳450' })}
                    </div>

                    <div>
                        <label className="block text-[13px] text-gray-400 mb-1.5">Notes (optional)</label>
                        <textarea className="input min-h-[70px]" value={form.notes}
                            onChange={e => set('notes', e.target.value)} placeholder="Any special instructions..." />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="btn btn-outline flex-1">Cancel</button>
                        <button type="submit" disabled={saving} className="btn btn-primary flex-[2]">
                            {saving ? 'Saving...' : 'Create Order'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}