(async ()=>{
  try{
    const res = await fetch('http://localhost:3000/api/videos')
    console.log('GET /api/videos status', res.status)
    console.log(await res.text())

    const convert = await fetch('http://localhost:3000/api/convert', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ id: 'ffcab397', start: 0, end: 1, format: 'mp4' })
    })
    console.log('POST /api/convert status', convert.status)
    console.log(await convert.text())
  }catch(e){
    console.error('error', e)
    process.exit(1)
  }
})()