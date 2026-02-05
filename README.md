# TDesign UniApp 组件库模板

本项目使用 CLI 模式。从 uniapp 官方[脚手架工程](https://uniapp.dcloud.net.cn/quickstart-cli.html#%E5%88%9B%E5%BB%BAuni-app)改造而来。

## ✨ 特性

- [x] 自动导入
- [x] TypeScript 支持
- [x] Less 预处理器
- [x] ESLint 代码检查
- [x] Stylelint 样式检查
- [x] Husky + lint-staged 提交前校验
- [x] Vue 3 + Vite 构建

## 📦 分支说明

- 主分支（`develop`）为完整模板（进行中）
- [template](https://github.com/novlan1/tdesign-uniapp-starter/tree/template) 分支为极简模板，适用于新项目启动、复现问题等

## 🚀 快速开始

```bash
# 安装依赖
pnpm install

# 启动 H5 开发
pnpm dev:h5

# 启动微信小程序开发
pnpm dev:mp-weixin

# 构建 H5
pnpm build:h5

# 构建微信小程序
pnpm build:mp-weixin
```

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

### 类型检查

```bash
pnpm type-check
```

## 📁 项目结构

```
├── src/
│   ├── api/            # API 接口
│   ├── components/     # 公共组件
│   ├── pages/          # 页面
│   ├── static/         # 静态资源
│   ├── styles/         # 全局样式
│   ├── utils/          # 工具函数
│   ├── App.vue         # 根组件
│   ├── main.ts         # 入口文件
│   ├── pages.json      # 页面配置
│   └── manifest.json   # 应用配置
├── .eslintrc.js        # ESLint 配置
├── .stylelintrc.js     # Stylelint 配置
├── tsconfig.json       # TypeScript 配置
├── vite.config.ts      # Vite 配置
└── package.json
```

## 📱 扫码预览

<img src="./docs/image/tdesign-uniapp-starte.-h5.png" width="300" />
