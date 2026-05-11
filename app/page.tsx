import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { LibraryGrid } from "@/components/library/LibraryGrid";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-white px-4 text-center">
        <h1 className="text-5xl font-extrabold text-indigo-900 mb-6 tracking-tight">
          PageTurner
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-md leading-relaxed">
          The premium, privacy-first PDF reader for your most important documents.
        </p>
        <Link href="/api/auth/signin">
          <Button size="lg" className="px-8 py-6 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all">
            Get Started
          </Button>
        </Link>
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl text-left">
          <div className="p-6 rounded-2xl bg-white/50 backdrop-blur shadow-sm border border-white">
            <div className="text-2xl mb-2">🛡️</div>
            <h3 className="font-bold text-gray-900 mb-1">Privacy First</h3>
            <p className="text-sm text-gray-600">Your books are stored in your own isolated space. No tracking.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/50 backdrop-blur shadow-sm border border-white">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-bold text-gray-900 mb-1">Native Feel</h3>
            <p className="text-sm text-gray-600">60fps transitions and zero-latency page turns for cached books.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/50 backdrop-blur shadow-sm border border-white">
            <div className="text-2xl mb-2">📶</div>
            <h3 className="font-bold text-gray-900 mb-1">Offline Access</h3>
            <p className="text-sm text-gray-600">Works seamlessly even without an internet connection.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <LibraryGrid />
    </main>
  );
}
