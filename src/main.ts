import { createSSRApp } from "vue";
import App from "./App.vue";
import '@tdesign/uniapp/theme.less';

export function createApp() {
  const app = createSSRApp(App);
  return {
    app,
  };
}
