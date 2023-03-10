# images-to-webp
批量自动将 png 或者 jpg/jpeg 格式图片变为 webp
## 快速使用
```shell
npm i images-to-webp -D
```
```js
const imagesToWebp = require('./index')
const path = require('path')
function resolve (filePath) {
  return path.join(__dirname, filePath)
}
imagesToWebp({
    quality: 20,
    hashPath: resolve('./hash.json'),
    imgsPath: resolve('./images')
  }
)

```
