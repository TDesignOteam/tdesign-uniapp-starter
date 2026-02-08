/**
 * PostCSS 配置文件
 *
 * 包含 tdesign-uniapp 图标减包插件
 */
const postCssPluginRemoveSelector = require('./build/postcss-plugin-remove-selector');
const { TDESIGN_ICON_REMOVE_SELECTOR } = require('./build/postcss-plugin-remove-selector/tdesign-uniapp-icon');

module.exports = {
  plugins: [
    // tdesign-uniapp 图标减包插件
    postCssPluginRemoveSelector({
      ...TDESIGN_ICON_REMOVE_SELECTOR,
      // 开启调试模式可查看处理日志
      debug: false,
    }),
  ],
};
