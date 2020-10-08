const express = require('express')
const app = express()
const port = process.env.PORT || 3131
const screenshot = require('./screenshot')

app.get('/', (req, res) => res.status(200).json({ status: 'ok' }))
app.get('/screenshot', (req, res) => {
  var url = req.query.url + "&t=" + req.query.t 
  var preview_type=req.query.preview_type
  ;(async () => {
    const buffer = await screenshot(url,preview_type)
    res.setHeader('Content-Disposition', 'attachment; filename="screenshot.png"')
    res.setHeader('Content-Type', 'image/png')
    res.send(buffer)
  })()
})

app.get('/adlibscreenshot', (req, res) => {
  var ad_id = req.query.id
  var url = 'https://www.facebook.com/ads/library/?id=' + ad_id 
  ;(async () => {
    const buffer = await screenshot(url)
    res.setHeader('Content-Disposition', 'attachment; filename="screenshot.png"')
    res.setHeader('Content-Type', 'image/png')
    res.send(buffer)
  })()
})

app.listen(port, () => console.log(`app listening on port ${port}!`))
