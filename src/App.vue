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
      percent: 0,
      upload: true,
      percentCount: 0
    }
  },
  methods: {
    // 提交文件后触发
    handleChange(file) {
      this.file = file
      console.log(this.file)
    },
    // 点击上传按钮后触发
    async handleUpload() {
    },
    // 将 File 对象转为 ArrayBuffer
    fileToBuffer() {
    },
    // 生成文件切片
    createFileChunk() {
    },
    // 上传文件切片
    uploadChunks() {
    },
    // 发送合并指令
    mergeUpload() {
    },
    // 按下暂停按钮
    handleClickBtn() {
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
