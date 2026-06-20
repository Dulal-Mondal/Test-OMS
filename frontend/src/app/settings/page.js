'use client';

import { useState } from 'react';

export default function SettingsPage() {
    const [copied, setCopied] = useState('');

    const copy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(''), 2000);
    };

    const webhookUrl = typeof window !== 'undefined'
        ? `${window.location.origin.replace('3000', '4000')}/api/webhook/order`
        : 'http://localhost:4000/api/webhook/order';

    const CodeBox = ({ children, id }) => (
        <div className="relative">
            <button onClick={() => copy(children, id)}
                className="absolute top-2 right-2 text-xs bg-card border border-border rounded px-2.5 py-1 text-gray-400 hover:text-gray-200">
                {copied === id ? '✓ Copied' : 'Copy'}
            </button>
            <pre className="bg-[#0d1117] text-gray-200 rounded-lg p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all">
                {children}
            </pre>
        </div>
    );

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-100 mb-2">Settings</h1>
            <p className="text-sm text-gray-400 mb-8">SoftBrainChat এর সাথে এই OMS connect করার নির্দেশনা</p>

            {/* Method 1: Push */}
            <div className="card mb-6">
                <h2 className="text-base font-semibold text-gray-100 mb-2">
                    📥 Method 1 — SoftBrainChat আপনাকে order push করবে (Recommended)
                </h2>
                <p className="text-sm text-gray-400 mb-4">
                    SoftBrainChat এ order confirm হওয়া মাত্র instantly এই OMS এ চলে আসবে।
                </p>

                <div className="space-y-4">
                    <div>
                        <div className="text-[13px] text-gray-400 mb-1.5">১. SoftBrainChat Dashboard → Orders → OMS Integration tab এ যান</div>
                    </div>
                    <div>
                        <div className="text-[13px] text-gray-400 mb-1.5">২. OMS API URL এ এটি দিন:</div>
                        <CodeBox id="url">{webhookUrl}</CodeBox>
                    </div>
                    <div>
                        <div className="text-[13px] text-gray-400 mb-1.5">৩. Format: <span className="text-blue-400 font-medium">SoftBrainChat Default</span></div>
                    </div>
                    <div>
                        <div className="text-[13px] text-gray-400 mb-1.5">৪. Auth Type: <span className="text-blue-400 font-medium">API Key (Header)</span>, Header name: <code className="bg-card px-2 py-0.5 rounded">X-API-Key</code></div>
                        <div className="text-[13px] text-gray-400 mb-1.5">API Key (আপনার backend .env এর <code className="bg-card px-1.5 rounded">OMS_RECEIVE_API_KEY</code>):</div>
                        <CodeBox id="key">oms_test_secret_key_123</CodeBox>
                    </div>
                    <div>
                        <div className="text-[13px] text-gray-400">৫. Connection Test → Save। ব্যাস! এখন নতুন order automatically আসবে।</div>
                    </div>
                </div>
            </div>

            {/* Method 2: Pull */}
            <div className="card mb-6">
                <h2 className="text-base font-semibold text-gray-100 mb-2">
                    ⬇ Method 2 — এই OMS থেকে orders টানুন
                </h2>
                <p className="text-sm text-gray-400 mb-4">
                    Orders page এর "Pull from SoftBrainChat" button দিয়ে manually orders import করুন।
                    এর জন্য backend <code className="bg-card px-1.5 rounded">.env</code> এ এগুলো সেট করুন:
                </p>
                <CodeBox id="pullenv">{`SBC_API_URL=https://softbrainchat.onrender.com/api/v1
SBC_API_KEY=sbc_your_softbrainchat_key`}</CodeBox>
                <p className="text-xs text-gray-500 mt-3">
                    SBC_API_KEY = SoftBrainChat Dashboard → Orders → OMS API Keys → Create Key
                </p>
            </div>

            {/* Status sync back */}
            <div className="card">
                <h2 className="text-base font-semibold text-gray-100 mb-2">
                    🔄 Status Sync Back
                </h2>
                <p className="text-sm text-gray-400">
                    এই OMS এ যখন কোনো order এর status পরিবর্তন করবেন (যেমন Shipped/Delivered),
                    সেটা automatically SoftBrainChat এ update হয়ে যাবে — যদি <code className="bg-card px-1.5 rounded">SBC_API_URL</code> ও <code className="bg-card px-1.5 rounded">SBC_API_KEY</code> সেট থাকে।
                </p>
            </div>
        </div>
    );
}