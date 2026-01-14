import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'

// Upload -> Server convert helper
async function uploadFileToServer(f: File) {
  const fd = new FormData()
  fd.append('file', f)
  const res = await fetch('/api/upload', { method: 'POST', body: fd })
  return res.json()
}

export default function Trim() {
  const [file, setFile] = useState<File | null>(null)
  const [srcUrl, setSrcUrl] = useState<string | null>(null)
  const [start, setStart] = useState<number>(0)
  const [end, setEnd] = useState<number>(5)
  const [processing, setProcessing] = useState(false)
  const [outUrl, setOutUrl] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    if (file) setSrcUrl(URL.createObjectURL(file))
  }, [file])

  function exportTrim(_: 'webm' | 'mp4') {
    alert('Client-side export is disabled in this build. Use "Server Convert" to export (recommended).')
  }

  async function serverConvert(format: 'mp4' | 'webm') {
    if (!file) return
    setProcessing(true)
    // upload file first
    const up = await uploadFileToServer(file)
    const id = up.id
    const res = await fetch('/api/convert', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, start, end, format }) })
    const data = await res.json()
    setProcessing(false)
    if (data.id) {
      // navigate to the share page for the converted file
      router.push(`/share/${data.id}`)
    } else {
      alert('Conversion failed')
    }
  }

  const router = useRouter()

  async function upload() {
    if (!outUrl) return
    const r = await fetch(outUrl)
    const blob = await r.blob()
    const fd = new FormData()
    fd.append('file', new File([blob], 'export.webm', { type: blob.type }))
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    // navigate to share page for convenience
    router.push(`/share/${data.id}`)
  }

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Trim & Export</h1>
      <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      {srcUrl && (
        <div className="mt-4">
          <video ref={videoRef} src={srcUrl} controls className="w-full max-w-xl" onLoadedMetadata={(e)=>{
            const dur = (e.target as HTMLVideoElement).duration
            if (!isFinite(dur)) return
            setEnd(Math.min(end,dur))
          }} />
          <div className="mt-3">
            <label>Start (s):</label>
            <input type="number" value={start} min={0} step={0.1} onChange={(e)=>setStart(parseFloat(e.target.value))} className="ml-2 p-1 border" />
            <label className="ml-4">End (s):</label>
            <input type="number" value={end} min={0} step={0.1} onChange={(e)=>setEnd(parseFloat(e.target.value))} className="ml-2 p-1 border" />
          </div>
          <div className="mt-4 space-x-2">
            <button onClick={()=>exportTrim('webm')} className="px-3 py-2 bg-indigo-600 text-white rounded">Export WebM (client)</button>
            <button onClick={()=>exportTrim('mp4')} className="px-3 py-2 bg-slate-700 text-white rounded">Export MP4 (client)</button>
            <button onClick={()=>serverConvert('mp4')} className="px-3 py-2 bg-green-600 text-white rounded">Server Convert MP4</button>
          </div>
        </div>
      )}

      {processing && <div className="mt-4">Processing with ffmpeg.wasm... (this may take a while)</div>}

      {outUrl && (
        <div className="mt-6">
          <h3 className="font-semibold">Result</h3>
          <video src={outUrl} controls className="mt-2 w-full max-w-xl" />
          <div className="mt-3">
            <button onClick={upload} className="px-3 py-2 bg-green-600 text-white rounded">Upload & Share</button>
            <a href={outUrl} download className="ml-2 px-3 py-2 bg-slate-700 text-white rounded">Download</a>
          </div>
        </div>
      )}
    </div>
  )
}
