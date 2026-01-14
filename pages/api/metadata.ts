import type { NextApiRequest, NextApiResponse } from 'next'
import getDB from '../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (!id || typeof id !== 'string') return res.status(400).end()
  const db = await getDB()
  const video = db.data!.videos.find(v => v.id === id)
  if (!video) return res.status(404).json({ error: 'Not found' })
  res.status(200).json(video)
}
