import type { NextApiRequest, NextApiResponse } from 'next'
import { join } from 'path'
import { createReadStream, statSync } from 'fs'
import getDB from '../../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (!id || typeof id !== 'string') return res.status(400).end()
  const db = await getDB()
  const video = db.data!.videos.find((v) => v.id === id)
  if (!video) return res.status(404).json({ error: 'Not found' })
  const filePath = join(process.cwd(), 'storage', video.filename)
  try {
    const stats = statSync(filePath)
    res.setHeader('Content-Type', 'video/webm')
    res.setHeader('Content-Length', stats.size)
    const stream = createReadStream(filePath)
    stream.pipe(res)
  } catch (e) {
    res.status(500).json({ error: 'File read error' })
  }
}
