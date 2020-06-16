const fs = require('fs')
const d3 = require('d3')

const url = require('url')
const qs = require('querystring')
const request = require('request')
const http = require('http')
const port = 8080

const server = http.createServer( function(req, res) {
   if ((req.url === '/topic') && (req.method == 'POST')) {
      var whole = '';
      var topic = '';

      req.on('data', (chunk) => {
         if(whole.length > 1e4) {
            whole = '';
            response.writeHead(413, {'Content-Type': 'text/plain'}).end();
            request.connection.destroy();
         }
         whole += chunk.toString()
      })

      req.on('end', () => {
         res.writeHead(200, 'Elówa', { "Content-Type": "text/html" });
         res.end();
         topic = JSON.parse(whole)['topic'];

         const jsonString = JSON.stringify({ topic: topic });
         const requestOptions = {
            hostname: "127.0.0.1",
            port: 5000,
            path: '/',
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Content-Length': jsonString.length
            }
         }

         const reqest = http.request(requestOptions, (response) => {
            console.log(`Request to fetch server ended with code: ${response.statusCode}`);
            response.on('data', () => {});
         });
         reqest.on('error', (error) => {
            console.log(error);
            res.writeHead(400, { message: 'Request failed' });
            res.end();
         });

         reqest.write(jsonString);
         reqest.end();
      })




      res.writeHead(200, 'Request successful', { "Content-Type": "text/html" });
      res.end();

   } else if (req.url === '/index.js') {
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
   } else if (req.url === '/favicon.ico') {
      res.writeHead(200, { "Content-Type": "image" })
      fs.readFile('favicon.ico', (err, data) => {
         if (err) {
            res.writeHead(404, { message: "File not found" })
            res.write('Could not find the desired page :(')
            console.log(err.message);
         } else {
            res.write(data)
         }
         res.end()
      })
   } else if (url.parse(req.url,true).pathname.startsWith("/analyses/")) {
      var path = url.parse(req.url,true).pathname
      var topic = path.substr(path.lastIndexOf('/'))
      res.writeHead(200, { "Content-Type": "text/json" })
      fs.readFile('public/analyses/'+topic+'.json', (err, data) => {
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
