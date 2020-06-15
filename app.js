const fs = require('fs')
const d3 = require('d3')

const http = require('http')
const port = 8080

const server = http.createServer( function(req, res) {
   if (req.url === '/index.js') {
      res.writeHead(200, { "Content-Type": "application/ecmascript" })
      fs.readFile('public/index.js', (err, data) => {
         if (err) {
            res.writeHead(404, { message: "File not found" })
            res.write('Could not find the desired page :(')
            console.log(err.message);
         } else {
            res.write(data)
         }
         res.end()
      })
   } else if (req.url === '/functions.js') {
      res.writeHead(200, { "Content-Type": "application/ecmascript" })
      fs.readFile('public/functions.js', (err, data) => {
         if (err) {
            res.writeHead(404, { message: "File not found" })
            res.write('Could not find the desired page :(')
            console.log(err.message);
         } else {
            res.write(data)
         }
         res.end()
      })
   } else if (req.url === '/analyses/school.json') {
      res.writeHead(200, { "Content-Type": "text/json" })
      fs.readFile('public/analyses/school.json', (err, data) => {
         if (err) {
            res.writeHead(404, { message: "File not found" })
            res.write('Could not find the desired page :(')
            console.log(err.message);
         } else {
            res.write(data)
         }
         res.end()
      })
   } else {
      res.writeHead(200, { "Content-Type": "text/html" })
      fs.readFile('public/index.html', function (err, data) {
         if (err) {
            res.writeHead(404, { message: "File not found" })
            res.write('Could not find the desired page :(')
            console.log(err.message);
         } else {
            res.write(data)
         }
         res.end()
      })
   }
})

server.listen(port, function (err) {
   if (err) {
      console.log(err.message);
   } else {
      console.log('Server listening on port ' + port);
   }
})
