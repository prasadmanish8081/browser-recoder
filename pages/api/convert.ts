import type { NextApiRequest, NextApiResponse } from 'next'
import { join } from 'path'
import { statSync } from 'fs'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegStatic from 'ffmpeg-static'
import { nanoid } from 'nanoid'
import getDB from '../../lib/db'

// point fluent-ffmpeg to the static binary (guard for type safety)
if (typeof (ffmpeg as any).setFfmpegPath === 'function') {
  try {
    ;(ffmpeg as any).setFfmpegPath(ffmpegStatic as string)
  } catch (e) {
    console.warn('Could not set ffmpeg path:', e)
  }
} else {
  console.warn('fluent-ffmpeg: setFfmpegPath not available')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { id, start, end, format } = req.body as { id: string; start: number; end: number; format: 'mp4' | 'webm' }
  if (!id || typeof start !== 'number' || typeof end !== 'number' || !format) return res.status(400).json({ error: 'Missing fields' })

  const db = await getDB()
  const video = db.data!.videos.find(v => v.id === id)
  if (!video) return res.status(404).json({ error: 'Original video not found' })
  const inputPath = join(process.cwd(), 'storage', video.filename)

  try {
    statSync(inputPath)
  } catch (e) {
    return res.status(500).json({ error: 'Input file not found on disk' })
  }

  const outId = nanoid(8)
  const ext = format === 'mp4' ? 'mp4' : 'webm'
  const outFilename = `${outId}-converted.${ext}`
  const outPath = join(process.cwd(), 'storage', outFilename)

  try {
    await new Promise<void>((resolve, reject) => {
      const command = ffmpeg(inputPath)
        .setStartTime(start)
        .setDuration(Math.max(0, end - start))
        .outputOptions('-y')
        .output(outPath)
        .on('end', () => resolve())
        .on('error', (err: any) => reject(err))
      // choose codec for mp4
      if (format === 'mp4') {
        command.videoCodec('libx264').audioCodec('aac')
      }
      command.run()
    })

    // write metadata
    db.data!.videos.push({
      id: outId,
      filename: outFilename,
      originalName: `${video.originalName || video.filename} (server-converted)`,
      createdAt: new Date().toISOString(),
      views: 0,
      maxCompletion: 0,
    })
    await db.write()
    return res.status(200).json({ id: outId })
  } catch (e) {
    console.error('convert error', e)
    return res.status(500).json({ error: 'Conversion failed' })
  }
}
