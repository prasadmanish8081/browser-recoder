import type { NextApiRequest, NextApiResponse } from 'next'
import getDB from '../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { id, type, value } = req.body as { id: string; type: string; value?: number }
    if (!id || !type) return res.status(400).json({ error: 'Missing fields' })
    const db = await getDB()
    const vid = db.data!.videos.find((v) => v.id === id)
    if (!vid) return res.status(404).json({ error: 'Not found' })
    if (type === 'view') {
      vid.views += 1
    } else if (type === 'progress' && typeof value === 'number') {
      if (value > vid.maxCompletion) vid.maxCompletion = value
    }
    await db.write()
    return res.status(200).json({ ok: true })
  }
  return res.status(405).end()
}
