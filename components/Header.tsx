import Link from 'next/link'

export default function Header(){
  return (
    <header className="bg-white border-b p-4 mb-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="font-bold text-lg">Marvedge</div>
        <nav className="space-x-4">
          <Link href="/" className="text-slate-700 hover:text-slate-900">Recorder</Link>
          <Link href="/trim" className="text-slate-700 hover:text-slate-900">Trim</Link>
          <Link href="/list" className="text-slate-700 hover:text-slate-900">Uploads</Link>
        </nav>
      </div>
    </header>
  )
}