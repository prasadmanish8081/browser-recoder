const { writeFileSync, mkdirSync } = require('fs')
const { join } = require('path')
const crypto = require('crypto')

const storageDir = join(process.cwd(), 'storage')
try { mkdirSync(storageDir, { recursive: true }) } catch (e) {}
const id = crypto.randomBytes(4).toString('hex')
const filename = `${id}-sample.webm`
writeFileSync(join(storageDir, filename), 'placeholder video content')

const dataDir = join(process.cwd(), 'data')
try { mkdirSync(dataDir, { recursive: true }) } catch (e) {}
const dbFile = join(dataDir, 'db.json')
let db = { videos: [] }
try { db = require(dbFile) } catch (e) {}
db.videos.push({ id, filename, originalName: 'sample.webm', createdAt: new Date().toISOString(), views: 0, maxCompletion: 0 })
writeFileSync(dbFile, JSON.stringify(db, null, 2))
console.log('Added sample:', id)
