import './globals.css';

export const metadata = {
    title: 'Test OMS — Order Management',
    description: 'Order Management System for SoftBrainChat integration',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <div className="min-h-screen">
                    {/* Top nav */}
                    <nav className="border-b border-border bg-surface px-8 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-xl">📦</span>
                            <div>
                                <h1 className="text-base font-semibold text-gray-100">Test OMS</h1>
                                <p className="text-xs text-gray-500">SoftBrainChat Integration</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <a href="/orders" className="btn btn-outline btn-sm">Orders</a>
                            <a href="/settings" className="btn btn-outline btn-sm">Settings</a>
                        </div>
                    </nav>

                    <main>{children}</main>
                </div>
            </body>
        </html>
    );
}