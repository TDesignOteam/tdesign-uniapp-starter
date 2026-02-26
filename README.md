<p align="center">
  <a href="https://tdesign.tencent.com/" target="_blank">
    <img alt="TDesign Logo" width="200" src="https://tdesign.gtimg.com/site/TDesign.png">
  </a>
</p>

<p align="center">
  <a href="https://vuejs.org/"><img src="https://img.shields.io/badge/Vue-3.4-brightgreen.svg" alt="Vue3" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.5-blue.svg" alt="TypeScript" /></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-5.2-purple.svg" alt="Vite" /></a>
  <a href="https://tdesign.tencent.com/mobile-vue/getting-started"><img src="https://img.shields.io/badge/TDesign-Uniapp-0052d9.svg" alt="TDesign" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License" /></a>
</p>

# TDesign Uniapp 组件库模板

基于 Vue 3 + TypeScript + Vite + TDesign Uniapp 的跨端移动应用开发模板，支持 H5、微信小程序、支付宝小程序等多平台。

## ✨ 特性

- 🎨 **TDesign 组件库** - 腾讯出品的企业级设计体系
- 📦 **开箱即用** - 完整的项目结构和配置
- 🔧 **TypeScript** - 完整的类型支持
- ⚡ **Vite** - 极速的开发体验
- 🌐 **多平台支持** - H5 / 微信 / 支付宝 / 抖音 / QQ / 百度 / 快手 / 京东 / 小红书等
- 🎯 **自动导入** - 组件和 API 自动按需导入
- 📝 **代码规范** - ESLint + Stylelint + Husky 保障代码质量

## 📦 分支说明

| 分支                                                                               | 说明                                   |
| ---------------------------------------------------------------------------------- | -------------------------------------- |
| `develop`                                                                          | 主分支，完整模板                       |
| [`template`](https://github.com/TDesignOteam/tdesign-uniapp-starter/tree/template) | 极简模板，适用于新项目启动、复现问题等 |

## 🔧 环境要求

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0 (推荐)

## 🚀 快速开始

```bash
# 克隆项目
git clone https://github.com/TDesignOteam/tdesign-uniapp-starter.git

# 进入项目目录
cd tdesign-uniapp-starter

# 安装依赖
pnpm install

# 启动 H5 开发
pnpm dev:h5

# 启动微信小程序开发
pnpm dev:mp-weixin
```

## 📱 多平台开发

### 开发模式

| 平台         | 命令                   |
| ------------ | ---------------------- |
| H5           | `pnpm dev:h5`          |
| H5 SSR       | `pnpm dev:h5:ssr`      |
| 微信小程序   | `pnpm dev:mp-weixin`   |
| 支付宝小程序 | `pnpm dev:mp-alipay`   |
| 抖音小程序   | `pnpm dev:mp-toutiao`  |
| QQ 小程序    | `pnpm dev:mp-qq`       |
| 百度小程序   | `pnpm dev:mp-baidu`    |
| 快手小程序   | `pnpm dev:mp-kuaishou` |
| 京东小程序   | `pnpm dev:mp-jd`       |
| 飞书小程序   | `pnpm dev:mp-lark`     |
| 小红书小程序 | `pnpm dev:mp-xhs`      |
| 鸿蒙元服务   | `pnpm dev:mp-harmony`  |

### 生产构建

| 平台         | 命令                     |
| ------------ | ------------------------ |
| H5           | `pnpm build:h5`          |
| H5 SSR       | `pnpm build:h5:ssr`      |
| 微信小程序   | `pnpm build:mp-weixin`   |
| 支付宝小程序 | `pnpm build:mp-alipay`   |
| 抖音小程序   | `pnpm build:mp-toutiao`  |
| QQ 小程序    | `pnpm build:mp-qq`       |
| 百度小程序   | `pnpm build:mp-baidu`    |
| 快手小程序   | `pnpm build:mp-kuaishou` |
| 京东小程序   | `pnpm build:mp-jd`       |
| 飞书小程序   | `pnpm build:mp-lark`     |
| 小红书小程序 | `pnpm build:mp-xhs`      |
| 鸿蒙元服务   | `pnpm build:mp-harmony`  |

## 🛠️ 代码规范

### ESLint

```bash
# 检查代码
pnpm lint

# 自动修复
pnpm lint:fix
```

### Stylelint

```bash
# 检查样式
pnpm lint:css

# 自动修复
pnpm lint:css:fix
```

### TypeScript 类型检查

```bash
pnpm type-check
```

> 💡 提交代码时会自动运行 lint-staged 进行代码检查和修复

## 📁 项目结构

```
├── src/
│   ├── api/              # API 接口
│   ├── components/       # 公共组件
│   ├── pages/            # 页面目录
│   ├── static/           # 静态资源
│   ├── styles/           # 全局样式
│   ├── utils/            # 工具函数
│   ├── App.vue           # 根组件
│   ├── main.ts           # 入口文件
│   ├── pages.json        # 页面路由配置
│   ├── manifest.json     # 应用配置
│   └── uni.scss          # uni-app 全局样式变量
├── .eslintrc.js          # ESLint 配置
├── .stylelintrc.js       # Stylelint 配置
├── tsconfig.json         # TypeScript 配置
├── vite.config.ts        # Vite 配置
└── package.json          # 项目依赖
```

## 🔗 相关链接
- [TDesign Uniapp 组件库](https://tdesign.tencent.com/uniapp/getting-started)
- [uni-app 官方文档](https://uniapp.dcloud.net.cn/)
- [Vue 3 文档](https://cn.vuejs.org/)
- [Vite 文档](https://cn.vitejs.dev/)

## 📱 扫码预览

<img src="./docs/image/tdesign-uniapp-starter-h5.png" width="300" />

## 🎨 设计稿

- **移动端通用场景页面模版**: [CoDesign](https://codesign.qq.com/s/567449555703953)
- **访问密码**: `F2FO`

## 📄 License

[MIT](LICENSE)
