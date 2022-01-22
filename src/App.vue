<template>
  <div id="app">
    <div class="file-upload">
      <input type="file" @change="handleFileChange"/>
      <el-button @click="handleUpload">上传</el-button>
    </div>
  </div>
</template>

<script>

export default {
  name: 'App',
  data() {
    return {
      file: null
    }
  },
  methods: {
    // 提交文件后触发
    handleFileChange(e) {
      const [file] = e.target.files
      if (!file) return
      // 将 data 重置为初始状态
      Object.assign(this.$data, this.$options.data())
      this.file = file
    },
    // 点击上传按钮后触发
    async handleUpload() {}
  }
}
</script>

<style>
.file-upload {
  text-align: center;
  margin-top: 60px;
}
</style>
