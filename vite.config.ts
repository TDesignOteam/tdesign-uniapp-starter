import { resolve } from 'path';

import { defineConfig } from 'vite';

import uni from '@dcloudio/vite-plugin-uni';
import {
  postcssPluginRemoveSelector,
} from '@novlan/postcss-plugin-remove-selector';


// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [uni()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  css: {
    postcss: {
      plugins: [
        // tdesign-uniapp 图标减包插件
        postcssPluginRemoveSelector({
          mode: 'tdesign',
          customUsed: [
            'chat-double',
            'chart-bar',
            'user-add',
          ],
          // 开启调试模式可查看处理日志
          debug: true,
        }),
      ],
    },
  },
});
