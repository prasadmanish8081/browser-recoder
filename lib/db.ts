import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

const dataDir = join(process.cwd(), 'data')
if (!existsSync(dataDir)) mkdirSync(dataDir)
const file = join(dataDir, 'db.json')
const adapter = new JSONFile(file)
const db = new Low(adapter)

export type VideoRecord = {
  id: string
  filename: string
  originalName?: string
  createdAt: string
  views: number
  maxCompletion: number
}

export type Database = {
  videos: VideoRecord[]
}

export async function getDB() {
  await db.read()
  db.data ||= { videos: [] }
  return db as Low<Database>
}

export default getDB
