import Link from 'next/link';

export default function Home() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center">
            <div className="text-5xl mb-4">📦</div>
            <h1 className="text-3xl font-bold text-gray-100 mb-2">Test OMS</h1>
            <p className="text-gray-400 mb-8 max-w-md">
                SoftBrainChat integration এর জন্য Order Management System
            </p>
            <div className="flex gap-3">
                <Link href="/orders" className="btn btn-primary">
                    Orders দেখুন →
                </Link>
                <Link href="/settings" className="btn btn-outline">
                    Settings
                </Link>
            </div>
        </div>
    );
}