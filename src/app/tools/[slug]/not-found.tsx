import Link from 'next/link';

export default function ToolNotFound() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Tool Not Found</h1>
        <p className="text-gray-400 mb-6">The tool you are looking for does not exist or has been removed.</p>
        <Link href="/tools" className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-semibold hover:opacity-90 transition">Browse All Tools</Link>
      </div>
    </main>
  );
}
