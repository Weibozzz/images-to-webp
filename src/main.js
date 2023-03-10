const webp = require('webp-converter');
const glob = require('glob');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs-extra');

function createWebpFn({ quality = 80, hashPath = resolve('./'), imgsPath }) {
  if (!imgsPath) {
    return;
  }
  if (!fs.existsSync(hashPath)) {
    fs.writeJsonSync(hashPath, {}, {
      spaces: 2
    });
  }
  createWebpAndHash(quality, hashPath, imgsPath); // 创建质量为 quality 的缩略图
}
function resolve (filePath) {
  return path.join(__dirname, filePath)
}
function clearWebp (hashJson, newHashJson, hashPath) {
  let count = 0;
  Object.keys(hashJson).forEach(hashKey => {
    if (!newHashJson[hashKey]) {
      const relativePath1 = hashKey
        .replace(/\.png$/, '.webp')
        .replace(/\.jpe?g$/, '.webp');
      console.log(relativePath1);
      try {
        fs.removeSync(relativePath1);
        count += 1;
      } catch (error) {
      }
      fs.writeJsonSync(hashPath, newHashJson, {
        spaces: 2
      });
    }
  });
  count && console.log(`${count}个文件已被清除！`);
}
function getHashJson (filePath) {
  const isExist = fs.pathExistsSync(filePath);
  if (!isExist) {
    fs.ensureFileSync(filePath);
    fs.writeJsonSync(filePath, {});
  }
  return fs.readJsonSync(filePath)
}
function getFileHash (filePath) {
  const hash = crypto.createHash('md5');
  return fs.readFile(filePath)
    .then(buffer => {
      hash.update(buffer);
      const md5 = hash.digest('hex');
      return md5
    })
}
function createWebp (inputImage, outputImage, option = 80) {
  return new Promise((resolve, reject) => {
    webp.cwebp(inputImage, outputImage, `-q ${option}`)
      .then(res => {
        console.log('已创建文件:', res, outputImage);
        resolve();
      })
      .catch(err => {
        reject();
      });
  })
}
function getImgPath (imgsPath) {
  let result = [];
  const arr = ['jpg', 'png', 'jpeg'];
  arr.forEach(v => {
    result.push(v);
    result.push(v.toUpperCase());
  });
  // https://www.npmjs.com/package/glob
  return `${imgsPath}/**/*.@(${result.join('|')})`
}
async function createWebpAndHash (option, hashPath, imgsPath) {
  const newHashJson = {};
  let num = 0;
  const files = glob.sync(getImgPath(imgsPath))
    .map(_path => path.normalize(_path));
  const hashJson = getHashJson(hashPath);
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    // console.log(file)
    const relativePath = path.join(__dirname, './');
    // console.log(relativePath)
    const relativeFilePath = file.replace(relativePath, '/');
    // console.log(relativeFilePath)
    const { dir, ext, base, name } = path.parse(file);
    // console.log(path.parse(file))
    const hash = await getFileHash(file);
    newHashJson[relativeFilePath] = hash;
    // console.log(hash)
    const oldHash = hashJson[relativeFilePath];
    const webpPath = `${dir}/${name}.webp`;
    // console.log(path.parse(webpPath))
    // const webpPath = `../images/webp-images/${name}-${option}.webp`
    const isExist = fs.pathExistsSync(webpPath);
    if (!oldHash || oldHash !== hash || !isExist) {
      hashJson[relativeFilePath] = hash;
      // console.log('input', `${dir}/${base}`)
      // console.log('output', webpPath)
      try {
        num++;
        await createWebp(`${dir}/${base}`, webpPath, option);
      } catch (err) {
        throw Error('报错了')
      }
    }
  }
  num && console.log(`${num}文件已经创建!`);
  fs.writeJsonSync(hashPath, hashJson, {
    spaces: 2
  });
  clearWebp(hashJson, newHashJson, hashPath);
}

module.exports = createWebpFn;
