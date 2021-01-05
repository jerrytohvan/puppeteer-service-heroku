const express = require('express')
const path = require('path')
const app = express()
const port = process.env.PORT || 3131
const screenshot = require('./screenshot')

app.get('/', (req, res) => res.status(200).json({ status: 'ok' }))
app.get('/screenshot', (req, res) => {
  var url = req.query.url + "&t=" + req.query.t 
  var preview_type=req.query.preview_type
  var gif= (req.query.gif === undefined || req.query.gif.toLowerCase() === 'false' ? false : true)
  ;(async () => {
    const buffer = await screenshot(url,preview_type,gif)
    res.setHeader('Content-Disposition', `attachment; filename=${gif ? "screenshot.gif" : "screenshot.png"}`)
    res.setHeader('Content-Type', gif ? 'image/gif' : 'image/png')
    gif ? res.sendFile( path.join(__dirname, 'test.gif')) : res.send(buffer) 
  })()
})

app.get('/adlibscreenshot', (req, res) => {
  var ad_id = req.query.id
  var url = 'https://www.facebook.com/ads/library/?id=' + ad_id 
  ;(async () => {
    const buffer = await screenshot(url,null,false,ad_id);
    res.setHeader('Content-Disposition', 'attachment; filename="screenshot.png"')
    res.setHeader('Content-Type', 'image/png')
    res.send(buffer)
  })()
})

app.listen(port, () => console.log(`app listening on port ${port}!`))
