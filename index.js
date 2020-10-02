const express = require('express')
const app = express()
const port = process.env.PORT || 3131
const screenshot = require('./screenshot')

app.get('/', (req, res) => res.status(200).json({ status: 'ok' }))

app.get('/screenshot', (req, res) => {
  var url = req.query.url + "&t=" + req.query.t
  ;(async () => {
    const buffer = await screenshot(url)
    res.setHeader('Content-Disposition', 'attachment; filename="screenshot.png"')
    res.setHeader('Content-Type', 'image/png')
    res.send(buffer)
  })()
})

app.listen(port, () => console.log(`app listening on port ${port}!`))
