const net = require('net')
const crypto = require('crypto')

const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
const PORT = 8888

const log = console.log.bind(console)

const server = net.createServer((socket) => {
  socket.on('data', data => {
    const headers = data.toString().split('\r\n')

    headers.shift()
    const headersObj = {}
    headers.forEach(header => {
      if (header) {
        const [key, value] = header.split(': ')
        headersObj[key] = value
      }
    })
    if (headersObj['Connection'] === 'Upgrade' && headersObj['Upgrade'] === 'websocket') {
      if (headersObj['Sec-WebSocket-Version'] !== '13') {
        socket.end()
      } else {
        let hash = crypto.createHash('sha1')
        hash.update(headersObj['Sec-WebSocket-Key'] + GUID)
        const base64key = hash.digest('base64')
        const res = 'HTTP/1.1 101 Switching Protocols\r\n' + 
        'Upgrade: websocket\r\n' + 
        'Connection: Upgrade\r\n' + 
        'Sec-WebSocket-Accept:' + base64key + '\r\n\r\n '
        socket.write(res)
      }
    } else {
      socket.end()
    }
  })
  socket.on('end', () => {
    log('end', )
  })
})

server.listen(PORT, () => {
  log(`成功监听${PORT}端口`)
})

