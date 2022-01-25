const Controller = require('./controller')
const http = require('http')
const server = http.createServer()

const controller = new Controller()

// 处理跨域
server.on('request', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', '*')
  res.writeHead(200, { 'content-type': 'text/html;charset=utf8' }) // 解决乱码
  if (req.method === 'OPTIONS') {
    res.status = 200
    res.end()
    return
  }

  if (req.url === '/api/merge/') {
    await controller.handleMerge(req, res)
    return
  }

  if (req.url === '/api/upload/') {
    await controller.handleFormData(req, res)
  }

  if (req.url === '/') {
    res.end('Hello World！')
  }
})

server.listen(5000, () => console.log('正在监听 5000 端口'))
