import { createSSRApp } from "vue";
import App from "./App.vue";
import '@tdesign/uniapp/common/style/theme/index.less';

export function createApp() {
  const app = createSSRApp(App);
  return {
    app,
  };
}
