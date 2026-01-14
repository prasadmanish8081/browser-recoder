import type { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm } from 'formidable'
import type { File as FormidableFile, Files } from 'formidable'
import { promises as fs } from 'fs'
import { nanoid } from 'nanoid'
import { join } from 'path'
import getDB from '../../lib/db'

export const config = {
  api: {
    bodyParser: false,
  },
}

function parseForm(req: NextApiRequest): Promise<{ fields: any; files: Files }> {
  const form = new IncomingForm()
  return new Promise((resolve, reject) => {
    form.parse(req as any, (err, fields, files) => {
      if (err) return reject(err)
      resolve({ fields, files })
    })
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const { files } = await parseForm(req)
    // formidable v2 types: file object has filepath and originalFilename
    const file = files?.file as FormidableFile | undefined
    if (!file) return res.status(400).json({ error: 'No file uploaded' })

    const id = nanoid(8)
    const storageDir = join(process.cwd(), 'storage')

    await fs.mkdir(storageDir, { recursive: true })
    const srcPath = file.filepath
    if (!srcPath) throw new Error('Uploaded file missing filepath')
    const filename = `${id}-${file.originalFilename || 'video'}`
    const dest = join(storageDir, filename)
    await fs.copyFile(srcPath, dest)

    const db = await getDB()
    db.data!.videos.push({
      id,
      filename,
      originalName: file.originalFilename,
      createdAt: new Date().toISOString(),
      views: 0,
      maxCompletion: 0,
    })
    await db.write()
    res.status(200).json({ id })
  } catch (e) {
    console.error('upload error', e)
    res.status(500).json({ error: 'Upload failed' })
  }
}
