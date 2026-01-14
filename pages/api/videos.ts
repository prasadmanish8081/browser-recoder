import type { NextApiRequest, NextApiResponse } from 'next'
import getDB from '../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = await getDB()
  res.status(200).json(db.data!.videos)
}
