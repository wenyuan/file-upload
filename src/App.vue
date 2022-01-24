<template>
  <div id="app">
    <div class="file-upload">
      <!-- 上传组件 -->
      <el-upload action="#" :auto-upload="false" :show-file-list="false" :on-change="handleChange">
        <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
        <el-button style="margin-left: 10px;" size="small" type="success" @click="handleUpload">上传到服务器</el-button>
        <div slot="tip" class="el-upload__tip" v-if="file">待上传文件：{{ file.name }}</div>
      </el-upload>
      <!-- 进度显示 -->
      <div class="progress-box">
        <span>上传进度：{{ percent.toFixed() }}%</span>
        <el-button type="primary" size="mini" @click="handleClickBtn">{{ upload | btnTextFilter}}</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import SparkMD5 from 'spark-md5'
import axios from 'axios'

const SIZE = 10 * 1024 * 1024 // 切片大小
const BaseUrl = 'http://localhost:7777'

export default {
  name: 'App',
  filters: {
    btnTextFilter(val) {
      return val ? '暂停' : '继续'
    }
  },
  data() {
    return {
      file: null,
      chunkList: [],
      hash: '',
      percentCount: 0,
      percent: 0,
      upload: true
    }
  },
  methods: {
    // 提交文件后触发
    handleChange(file) {
      Object.assign(this.$data, this.$options.data()) // 将 data 重置为初始状态
      this.file = file
    },
    // 点击上传按钮后触发
    async handleUpload() {
      if (!this.file) return
      this.percent = 0
      // 获取文件对象
      const fileObj = this.file.raw
      // 将 File 对象转为 ArrayBuffer
      let buffer
      try {
        buffer = await this.fileToBuffer(fileObj)
      } catch (e) {
        console.log(e)
      }
      // 生成文件切片
      this.createChunks(buffer, fileObj)
      // 上传文件切片
      this.uploadChunks()
    },
    fileToBuffer(fileObj) {
      return new Promise((resolve, reject) => {
        const fileReader = new FileReader()
        fileReader.onload = event => {
          resolve(event.target.result)
        }
        fileReader.readAsArrayBuffer(fileObj)
        fileReader.onerror = () => {
          reject(new Error('转换文件格式发生错误'))
        }
      })
    },
    createChunks(buffer, fileObj, chunkSize = SIZE) {
      // 声明几个变量, 后面切分文件要用
      const chunkList = [] // 保存所有切片的数组
      const chunkListLength = Math.ceil(fileObj.size / chunkSize) // 计算总共多个切片
      const suffix = /\.([0-9A-z]+)$/.exec(fileObj.name)[1] // 文件后缀名(文件格式)

      // 根据文件内容生成 hash 值
      const spark = new SparkMD5.ArrayBuffer()
      spark.append(buffer)
      const hash = spark.end()

      // 生成切片, 这里后端要求传递的参数为字节数据块(chunk)和每个数据块的文件名(fileName)
      let cur = 0 // 切片时的初始位置
      for (let i = 0; i < chunkListLength; i++) {
        const item = {
          chunk: fileObj.slice(cur, cur + chunkSize),
          fileName: `${hash}_${i}.${suffix}` // 文件名规则按照 hash_1.jpg 命名
        }
        cur += chunkSize
        chunkList.push(item)
      }
      console.log('切片完后的数组：', chunkList)
      this.chunkList = chunkList // uploadChunks 要用到
      this.hash = hash           // uploadChunks 要用到
    },
    uploadChunks() {
      const requestList = [] // 请求集合
      this.chunkList.forEach((item, index) => {
        const fn = () => {
          const formData = new FormData()
          formData.append('chunk', item.chunk)
          formData.append('filename', item.fileName)
          return axios({
            url: BaseUrl + '/upload/',
            method: 'post',
            headers: { 'Content-Type': 'multipart/form-data' },
            data: formData
          }).then(res => {
            if (res.data.code === 0) { // 成功
              if (this.percentCount === 0) { // 避免上传成功后会删除切片改变 chunkList 的长度影响到 percentCount 的值
                this.percentCount = 100 / this.chunkList.length
              }
              this.percent += this.percentCount // 改变进度
              this.chunkList.splice(index, 1)   // 一旦上传成功就删除这一个 chunk, 方便断点续传
            }
          }).catch(error => {
            console.log('上传失败：', error)
            this.$message.error('上传失败，请检查服务端是否正常')
          })
        }
        requestList.push(fn)
      })

      let i = 0 // 记录发送的请求个数
      // 文件切片全部发送完毕后, 需要请求 merge 接口, 把文件的 hash 传递给服务器
      const complete = () => {
        axios({
          url: BaseUrl + '/merge/',
          method: 'get',
          params: { hash: this.hash }
        }).then(res => {
          if (res.data.code === 0) { // 请求发送成功
            this.$message({
              message: '恭喜你，文件上传成功',
              type: 'success'
            })
          }
        })
      }
      const send = async () => {
        if (!this.upload) return
        if (i >= requestList.length) {
          // 全部发送完毕
          complete()
          return
        }
        await requestList[i]()
        i++
        send()
      }
      send() // 发送请求
    },
    // 按下暂停按钮
    handleClickBtn() {
      this.upload = !this.upload
      // 如果不暂停则继续上传
      if (this.upload) this.uploadChunks()
    }
  }
}
</script>

<style>
.file-upload {
  margin-top: 50px;
  margin-left: 50px;
}

.progress-box {
  box-sizing: border-box;
  width: 360px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding: 8px 10px;
  background-color: #ecf5ff;
  font-size: 14px;
  border-radius: 4px;
}
</style>
