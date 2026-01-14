import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function Share() {
  const router = useRouter()
  const { id } = router.query
  const [meta, setMeta] = useState<any>(null)
  const [progress, setProgress] = useState(0)

  useEffect(()=>{
    if(!id) return
    fetch('/api/metadata?id='+id).then(r=>r.json()).then(setMeta)
    // record view
    fetch('/api/analytics', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id, type:'view'})})
  }, [id])

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Shared Video</h1>
      {id && (
        <div>
          <video src={`/api/files/${id}`} controls className="w-full max-w-xl" onTimeUpdate={async (e)=>{
            const v = e.currentTarget
            const percent = Math.round((v.currentTime / v.duration) * 100)
            if(percent > progress){
              setProgress(percent)
              await fetch('/api/analytics', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id, type:'progress', value: percent})})
            }
          }} />
        </div>
      )}
      {meta && (
        <div className="mt-4 text-sm text-slate-700">Uploaded: {new Date(meta.createdAt).toLocaleString()} • Views: {meta.views} • Max completion: {meta.maxCompletion}%</div>
      )}
    </div>
  )
}
