var express = require('express')
var app = express()
const port = 8080

app.get('/', (req, res) => res.send('Hello World 2!'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))