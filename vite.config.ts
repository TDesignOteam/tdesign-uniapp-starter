import { resolve } from 'path';

import { defineConfig } from 'vite';

import uni from '@dcloudio/vite-plugin-uni';
import {
  postCssPluginRemoveSelector,
  TDESIGN_ICON_REMOVE_SELECTOR,
  TDESIGN_USED_ICONS,
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
        postCssPluginRemoveSelector({
          list: [
            {
              ...TDESIGN_ICON_REMOVE_SELECTOR.list[0],
              include: [
                ...TDESIGN_USED_ICONS,
                'chat-double',
                'chart-bar',
                'user-add',
              ],
            },
          ],
          // 开启调试模式可查看处理日志
          debug: true,
        }),
      ],
    },
  },
});
