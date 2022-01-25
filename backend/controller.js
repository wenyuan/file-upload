const multiparty = require('multiparty')
const path = require('path')
const fse = require('fs-extra')

const extractExt = filename =>
  filename.slice(filename.lastIndexOf('.'), filename.length) // 提取后缀名
const UPLOAD_DIR = path.resolve(__dirname, '..', 'upload_dir') // 上传文件目录

const pipeStream = (path, writeStream) =>
  new Promise(resolve => {
    const readStream = fse.createReadStream(path)
    readStream.on('end', () => {
      fse.unlinkSync(path)
      resolve()
    })
    readStream.pipe(writeStream)
  })

/**
 * 合并切片
 * @param {string} filePath 文件绝对路径
 * @param {string} fileHash 文件 md5 值
 * @param {number} fileChunkNum 切片个数
 */
const mergeFileChunk = async (filePath, fileHash, fileChunkNum) => {
  const chunkDir = path.resolve(UPLOAD_DIR, fileHash)
  const chunkPaths = await fse.readdir(chunkDir)
  // 根据切片下标进行排序
  // 否则直接读取目录的获得的顺序可能会错乱
  chunkPaths.sort((a, b) => a.split('_')[1] - b.split('_')[1]) // 名字是我们自己约定的, 所以固定索引 1 就行
  console.log('排序后的切片：', chunkPaths)
  await Promise.all(
    chunkPaths.map((chunkPath, index) =>
      pipeStream(
        path.resolve(chunkDir, chunkPath),
        // 指定位置创建可写流
        fse.createWriteStream(filePath, {
          start: index * fileChunkNum,
          end: (index + 1) * fileChunkNum
        })
      )
    )
  )
  fse.rmdirSync(chunkDir) // 合并后删除保存切片的目录
  console.log('合并成功：', filePath)
  console.log('切片文件已删除')
}

const resolvePost = req =>
  new Promise(resolve => {
    let chunk = ''
    req.on('data', data => {
      chunk += data
    })
    req.on('end', () => {
      resolve(JSON.parse(chunk))
    })
  })

module.exports = class {
  // 合并切片接口
  async handleMerge(req, res) {
    const data = await resolvePost(req)
    const { hash, filename, size } = data
    const ext = extractExt(filename)
    const filePath = path.resolve(UPLOAD_DIR, `${hash}${ext}`)
    await mergeFileChunk(filePath, hash, size)
    return resAjax(res, {
      code: 0,
      message: '恭喜你，文件上传成功'
    })
  }

  // 上传切片接口
  async handleFormData(req, res) {
    const multipart = new multiparty.Form()

    multipart.parse(req, async (err, fields, files) => {
      if (err) {
        console.error(err)
        res.status = 500
        res.end('process file chunk failed')
        return
      }
      const [chunk] = files.chunk
      const [hash] = fields.hash
      const [filename] = fields.filename
      console.log('接收到文件：', filename)
      const filePath = path.resolve(UPLOAD_DIR, `${hash}${extractExt(filename)}`)
      const chunkDir = path.resolve(UPLOAD_DIR, hash)

      // 文件存在直接返回
      if (fse.existsSync(filePath)) {
        return resAjax(res, {
          code: 2001,
          message: '文件已存在'
        })
      }

      // 切片目录不存在，创建切片目录
      if (!fse.existsSync(chunkDir)) {
        await fse.mkdirs(chunkDir)
      }
      // fs-extra 专用方法，类似 fs.rename 并且跨平台
      // fs-extra 的 rename 方法 windows 平台会有权限问题
      // https://github.com/meteor/meteor/issues/7852#issuecomment-255767835
      try {
        await fse.move(chunk.path, path.resolve(chunkDir, filename))
        console.log('切片上传成功')
      } catch (error) {
        console.log('剪贴并重命名切片出错：', error)
      }
      resAjax(res, {
        code: 200,
        message: '切片上传成功'
      })
    })
  }
}

const resAjax = (res, obj) => {
  res.end(JSON.stringify(obj))
}
