import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-blue-600 shrink-0" />
          <span className="text-xl font-bold tracking-tight text-slate-900">
            LocalVoice <span className="text-blue-600">AI</span>
          </span>
        </div>
        
        <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <Link href="/#features" className="transition-colors hover:text-blue-600">Features</Link>
          <Link href="/#how-it-works" className="transition-colors hover:text-blue-600">How it Works</Link>
          <Link href="/#pricing" className="transition-colors hover:text-blue-600">Pricing</Link>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600">
            Login
          </Link>
          <Link href="/register" className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700 hover:scale-105 active:scale-95">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
