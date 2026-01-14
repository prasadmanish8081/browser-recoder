import { useRef, useState } from 'react'
import dynamic from 'next/dynamic'

export default function Home() {
  const [recording, setRecording] = useState(false)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const videoRef = useRef<HTMLVideoElement | null>(null)

  async function startRecording() {
    try {
      const displayStream = await (navigator.mediaDevices as any).getDisplayMedia({ video: true, audio: true })
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Add mic audio track to display stream
      const audioTrack = micStream.getAudioTracks()[0]
      if (audioTrack) displayStream.addTrack(audioTrack)

      recordedChunksRef.current = []
      const options = { mimeType: 'video/webm; codecs=vp8,opus' }
      const mr = new MediaRecorder(displayStream, options)
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data)
      }
      mr.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        setBlobUrl(url)
      }
      mediaRecorderRef.current = mr
      mr.start(1000)
      setRecording(true)
    } catch (e) {
      console.error(e)
      alert('Could not start recording: ' + e)
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    setRecording(false)
  }

  function download() {
    if (!recordedChunksRef.current.length) return
    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'recording.webm'
    a.click()
  }

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Screen + Mic Recorder</h1>
      <div className="space-x-2">
        {!recording ? (
          <button onClick={startRecording} className="px-4 py-2 bg-green-600 text-white rounded">Start</button>
        ) : (
          <button onClick={stopRecording} className="px-4 py-2 bg-red-600 text-white rounded">Stop</button>
        )}
        <button onClick={download} className="px-4 py-2 bg-slate-700 text-white rounded">Download .webm</button>
      </div>

      <div className="mt-6">
        {blobUrl ? (
          <div>
            <h2 className="font-semibold">Preview</h2>
            <video ref={videoRef} src={blobUrl} controls className="mt-2 w-full max-w-xl" />
            <div className="mt-3 space-x-2">
              <a href="/trim" className="px-3 py-2 bg-indigo-600 text-white rounded">Trim & Export</a>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-600 mt-4">No recording yet.</p>
        )}
      </div>

      <div className="mt-10 text-sm text-slate-700">Tip: Use the Trim page to cut start/end and export mp4 using ffmpeg.wasm.</div>
    </div>
  )
}
