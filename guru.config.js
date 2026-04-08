const path = require('path');
const apps = [
  {
    // project.config.json所在目录，其中 miniprogramRoot 指定小程序代码目录
    projectDir: path.resolve(__dirname, 'dist/build/mp-weixin-component'),
    type: 'main',
  },
  {
    projectDir: path.resolve(__dirname, 'dist/build/mp-weixin'),
    namespace: 'starter',
    type: 'single-independent', // 主应用-main 独立分包-single-independent 普通分包-single-normal  多分包-multi-origin
  },
  {
    projectDir: path.resolve(__dirname, 'dist/build/mp-weixin-starter-apply'),
    namespace: 'starter-apply',
    type: 'single-independent',
  },
];
module.exports = {
  compose: {
    apps,
    distDir: path.resolve(__dirname, 'dist/mini-merge'),
  },
};
