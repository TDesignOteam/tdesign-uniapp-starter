/**
 * 融合构建脚本
 *
 * 功能：
 * 1. clone tdesign-uniapp-starter-apply，构建小程序，复制产物到 dist/build/mp-weixin-starter-apply
 * 2. clone tdesign-miniprogram，初始化 uniapp 示例并构建，复制产物到 dist/build/mp-weixin-component
 * 3. 构建当前项目（tdesign-uniapp-starter），产物在 dist/build/mp-weixin
 * 4. 执行 guru compose -c guru.config.js 融合，产物在 dist/mini-merge
 *
 * 使用方式：
 *   node script/mp-compose-build.mjs
 */

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, cpSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __scriptDir = dirname(__filename);
const ROOT_DIR = resolve(__scriptDir, '..');

/** 临时目录，用于 clone 外部仓库 */
const TEMP_DIR = resolve(ROOT_DIR, '.tmp-compose');

/** 产物目录配置 */
const DIST_DIR = resolve(ROOT_DIR, 'dist/build');
const STARTER_APPLY_DIST = resolve(DIST_DIR, 'mp-weixin-starter-apply');
const COMPONENT_DIST = resolve(DIST_DIR, 'mp-weixin-component');

/** 外部仓库配置 */
const REPOS = {
  starterApply: {
    url: 'https://github.com/TDesignOteam/tdesign-uniapp-starter-apply.git',
    dir: resolve(TEMP_DIR, 'tdesign-uniapp-starter-apply'),
    buildOutput: 'dist/build/mp-weixin',
    targetDir: STARTER_APPLY_DIST,
    buildSteps: [
      { cmd: 'pnpm install', desc: '安装依赖' },
      { cmd: 'npm run build:mp', desc: '构建小程序' },
    ],
  },
  component: {
    url: 'https://github.com/Tencent/tdesign-miniprogram.git',
    dir: resolve(TEMP_DIR, 'tdesign-miniprogram'),
    buildOutput: 'packages/tdesign-uniapp/example/dist/build/mp-weixin',
    targetDir: COMPONENT_DIST,
    buildSteps: [
      { cmd: 'pnpm install', desc: '安装依赖' },
      { cmd: 'pnpm run uniapp -- run init', desc: '初始化 uniapp 示例' },
      { cmd: 'pnpm run uniapp -- run build:mp', desc: '构建小程序' },
    ],
  },
};

// ===================== 工具函数 =====================

function log(msg) {
  console.log(`[compose] ${msg}`);
}

function error(msg) {
  console.error(`[compose] ❌ ${msg}`);
}

function run(cmd, options = {}) {
  log(`执行命令: ${cmd}`);
  execSync(cmd, {
    stdio: 'inherit',
    ...options,
  });
}

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function cleanDir(dir) {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ===================== 核心逻辑 =====================

/**
 * clone 并构建外部仓库（支持缓存复用）
 * - 首次执行：git clone --depth 1
 * - 后续执行：git fetch + git reset --hard，复用 node_modules 等缓存
 */
function cloneAndBuild(repoConfig) {
  const { url, dir, buildOutput, targetDir, buildSteps } = repoConfig;

  if (existsSync(dir)) {
    log(`📦 目录已存在，拉取最新代码: ${url}`);
    run('git fetch --depth 1 origin', { cwd: dir });
    run('git reset --hard origin/HEAD', { cwd: dir });
    run('git clean -dfx -e node_modules -e .cache', { cwd: dir });
  } else {
    log(`📦 克隆仓库: ${url}`);
    run(`git clone --depth 1 ${url} ${dir}`);
  }

  // 构建
  for (const step of buildSteps) {
    log(`🔨 ${step.desc}...`);
    run(step.cmd, { cwd: dir });
  }

  // 复制产物
  const outputDir = resolve(dir, buildOutput);
  if (!existsSync(outputDir)) {
    throw new Error(`构建产物目录不存在: ${outputDir}`);
  }

  log(`📋 复制产物到: ${targetDir}`);
  cleanDir(targetDir);
  ensureDir(targetDir);
  cpSync(outputDir, targetDir, { recursive: true });

  log(`✅ 完成: ${url}`);
}

/**
 * 构建当前项目（tdesign-uniapp-starter）
 */
function buildCurrentProject() {
  log('🔨 构建当前项目 (tdesign-uniapp-starter)...');
  run('npm run build:mp', { cwd: ROOT_DIR });
  log('✅ 当前项目构建完成');
}

/**
 * 执行 guru compose 融合
 */
function guruCompose() {
  log('🔗 执行 guru compose 融合...');
  run('npx guru compose -c guru.config.js', { cwd: ROOT_DIR });
  log('✅ 融合完成，产物目录: dist/mini-merge');
}

// ===================== 主流程 =====================

async function main() {
  const startTime = Date.now();

  log('========================================');
  log('开始融合构建流程');
  log('========================================');

  try {
    // 1. 准备临时目录
    ensureDir(TEMP_DIR);
    ensureDir(DIST_DIR);

    // 2. 构建当前项目
    buildCurrentProject();

    // 3. clone 并构建外部仓库（顺序执行，避免资源竞争）
    log('');
    log('--- 构建 tdesign-uniapp-starter-apply ---');
    cloneAndBuild(REPOS.starterApply);

    log('');
    log('--- 构建 tdesign-miniprogram (uniapp component) ---');
    cloneAndBuild(REPOS.component);

    // 4. 执行 guru compose 融合
    log('');
    guruCompose();

    // 5. 保留临时目录以复用缓存（node_modules 等），下次构建时通过 git fetch + reset 更新代码

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    log('========================================');
    log(`🎉 融合构建全部完成，耗时 ${duration}s`);
    log('========================================');
  } catch (err) {
    error(`融合构建失败: ${err.message}`);
    console.error(err);
    process.exit(1);
  }
}

main();
