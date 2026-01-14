import useSWR from 'swr'
import Link from 'next/link'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function List() {
  const { data } = useSWR('/api/videos', fetcher)

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Uploaded Videos</h1>
      {!data ? <div>Loading...</div> : (
        <ul>
          {data.map((v: any) => (
            <li key={v.id} className="mb-3">
              <Link href={`/share/${v.id}`} className="text-indigo-600">{v.originalName || v.filename} — {new Date(v.createdAt).toLocaleString()}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
