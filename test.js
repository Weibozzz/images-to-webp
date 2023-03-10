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
