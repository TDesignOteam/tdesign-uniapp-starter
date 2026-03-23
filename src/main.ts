import { createSSRApp } from 'vue';

import App from './App.vue';
import '@tdesign/uniapp/common/style/theme/index.less';
// 等待新版本发布
// import '@tdesign/uniapp/theme.less';
import './styles/index.less';

const chooseImage = uni.chooseImage || {};
uni.chooseImage = chooseImage;

export function createApp() {
  const app = createSSRApp(App);
  return {
    app,
  };
}
