import { createSSRApp } from 'vue';

import App from './App.vue';
import '@tdesign/uniapp/theme.less';
// @ts-ignore
import './styles/index.less';

const chooseImage = uni.chooseImage || {};
uni.chooseImage = chooseImage;

export function createApp() {
  const app = createSSRApp(App);
  return {
    app,
  };
}
