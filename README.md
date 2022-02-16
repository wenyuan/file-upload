# File Upload

Vue + Node 实现大文件分片上传和断点续传。

## 前端

* Vue.js、Element-Ui 界面展示
* Blob.slice() 实现文件切片
* FileReader + spark-md5 生成文件 hash
* Axios 异步请求

前端运行：

```bash
npm install
npm run serve
```

前端访问端口：8080

## 后端

* Node.js
* multiparty 处理 formData

后端运行：

```bash
node backend/index.js
```

后端访问端口：5000

## 相关博客

* [大文件分片上传和断点续传](https://www.fedbook.cn/project/solution/file-upload/)

## 参考几个不错的项目

这个仓库是从实现思路角度出发，用尽可能精简的代码进行方案试验。如果是在实际业务中，可能对大文件上传有更细化的需求，并且需要兼容和考虑很多种情况，因此可以借鉴现成的轮子，经过调研，我发现了几个不错的项目：

* [vue-simple-uploader](https://github.com/simple-uploader/vue-uploader)
* [file-chunk](https://github.com/yangrds/file-chunk)
* [webuploader](https://github.com/fex-team/webuploader)
