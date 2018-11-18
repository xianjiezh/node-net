const net = require('net')
const crypto = require('crypto')

const log = console.log.bind(console)
const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'

const server = net.createServer((socket) => {
  socket.once('data', data => {
    const headers = data.toString().split('\r\n')
    
    headers.pop()
    headers.pop()
    headers.shift()
    const headersObj = {}
    headers.forEach(header => {
      const [key, value] = header.split(': ')
      headersObj[key] = value
    })
    if (headersObj['Connection'] == 'Upgrade' && headersObj['Upgrade'] == 'websocket') {
      if (headersObj['Sec-WebSocket-Version'] !== '13') {
        socket.end()
      } else {
        let hash = crypto.createHash('sha1')
        hash.update(headersObj['Sec-WebSocket-Key'] + GUID)
        const base64key = hash.digest('base64')
        const res = `HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept:${base64key}\r\n\r\n`
        log('res', res)

        
        socket.write(res)
      }
    } else {
      log(999)
      socket.end()
    }
  })
  socket.on('end', () => {
    log('end')
  })
})

server.listen(8888)
