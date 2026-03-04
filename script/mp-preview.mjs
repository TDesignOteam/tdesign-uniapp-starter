/**
 * 小程序 CI 脚本（预览 & 上传）
 *
 * 功能：
 * 1. 校验 PR 发起者是否在白名单中
 * 2. 根据不同用户分配不同的机器人号
 * 3. 执行 UniApp 小程序构建
 * 4. 调用微信小程序 CI 生成预览二维码 或 上传代码到微信后台
 *
 * 使用方式：
 * - 预览+上传（默认）: node script/mp-preview.mjs
 * - 仅预览:            node script/mp-preview.mjs --mode=preview
 * - 仅上传:            node script/mp-preview.mjs --mode=upload
 *
 * 环境变量：
 * - MINI_APP_ID: 小程序 AppID
 * - MINI_APP_PRIVATE_KEY: 小程序上传密钥（Base64 编码）
 * - PR_AUTHOR: PR 发起者 GitHub 用户名
 * - PR_NUMBER: PR 编号
 * - PR_TITLE: PR 标题
 * - COMMIT_SHA: 当前 commit SHA
 */

// import { execSync } from 'node:child_process';
import { writeFileSync, existsSync, unlinkSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';

// 本地开发时从 .env.local 加载环境变量（不覆盖已有的环境变量）
const __filename = fileURLToPath(import.meta.url);
const __scriptDir = dirname(__filename);
dotenv.config({ path: resolve(__scriptDir, '..', '.env.local') });

const ROOT_DIR = resolve(__scriptDir, '..');

// ===================== 配置 =====================

/**
 * 用户白名单 & 机器人号映射
 * key: GitHub 用户名
 * value: 微信 CI 机器人编号（1~30）
 *
 * 不同用户使用不同的机器人号，避免并发上传时互相覆盖
 */
const USER_ROBOT_MAP = {
  novlan1: 1,
  yao: 2,
  // 在此添加更多用户...
};

/** 默认机器人号（白名单用户未配置专属机器人时使用） */
const DEFAULT_ROBOT = 10;

/** 构建命令 */
// const BUILD_COMMAND = 'npm run build:mp';

/** 小程序项目产物目录（相对于项目根目录） */
const PROJECT_PATH = resolve(ROOT_DIR, 'dist/build/mp-weixin');

/** 预览二维码输出路径 */
const QRCODE_OUTPUT = resolve(ROOT_DIR, 'wx-mp-preview-qrcode.png');

/** 公共 CI 编译设置 */
const CI_SETTING = {
  es6: true,
  es7: true,
  minify: true,
  autoPrefixWXSS: true,
  minifyWXML: true,
};

/**
 * 解析命令行参数中的 --mode 值
 * 不指定时默认 'all'（同时执行 preview 和 upload）
 */
function getMode() {
  const modeArg = process.argv.find(arg => arg.startsWith('--mode='));
  const mode = modeArg ? modeArg.split('=')[1] : 'all';
  if (!['preview', 'upload', 'all'].includes(mode)) {
    throw new Error(`不支持的模式: ${mode}，可选值: preview, upload, all`);
  }
  return mode;
}

// ===================== 工具函数 =====================

function log(msg) {
  console.log(`[mp-ci] ${msg}`);
}

function error(msg) {
  console.error(`[mp-ci] ❌ ${msg}`);
}

// function run(cmd, options = {}) {
//   log(`执行命令: ${cmd}`);
//   execSync(cmd, {
//     stdio: 'inherit',
//     cwd: ROOT_DIR,
//     ...options,
//   });
// }

function getEnv(name, required = true) {
  const value = process.env[name];
  if (required && !value) {
    throw new Error(`缺少必要的环境变量: ${name}`);
  }
  return value || '';
}

/**
 * 设置 GitHub Actions 输出变量
 */
function setOutput(name, value) {
  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    writeFileSync(outputFile, `${name}=${value}\n`, { flag: 'a' });
  }
  log(`输出: ${name}=${value}`);
}

// ===================== 核心逻辑 =====================

/**
 * 校验 PR 发起者是否在白名单中
 */
function validateAuthor(author) {
  const allowedUsers = Object.keys(USER_ROBOT_MAP);

  if (!allowedUsers.includes(author)) {
    error(`用户 "${author}" 不在白名单中，允许的用户: ${allowedUsers.join(', ')}`);
    setOutput('allowed', 'false');
    return false;
  }

  log(`✅ 用户 "${author}" 已通过白名单校验`);
  setOutput('allowed', 'true');
  return true;
}

/**
 * 获取用户对应的机器人号
 */
function getRobot(author) {
  const robot = USER_ROBOT_MAP[author] || DEFAULT_ROBOT;
  log(`用户 "${author}" 使用机器人号: ${robot}`);
  return robot;
}

/**
 * 写入小程序上传密钥文件
 */
function writePrivateKey() {
  const privateKeyRaw = getEnv('MINI_APP_PRIVATE_KEY');
  const keyPath = resolve(ROOT_DIR, 'wx-mp-private.key');

  // 密钥可能是 Base64 编码的，也可能是直接的 PEM 内容
  let keyContent = privateKeyRaw;
  if (!privateKeyRaw.includes('BEGIN')) {
    // Base64 编码的密钥，先解码
    keyContent = Buffer.from(privateKeyRaw, 'base64').toString('utf-8');
  }

  // 处理换行符：环境变量中 \n 可能被转义为字面量 "\\n"，需要替换为真正的换行符
  keyContent = keyContent.replace(/\\n/g, '\n');

  // 确保文件以换行符结尾
  if (!keyContent.endsWith('\n')) {
    keyContent += '\n';
  }

  writeFileSync(keyPath, keyContent);
  log(`密钥文件已写入: ${keyPath}`);
  return keyPath;
}

/**
 * 执行小程序构建
 */
// function build() {
//   log('🔨 开始构建小程序...');
//   const startTime = Date.now();

//   run(BUILD_COMMAND);

//   const duration = ((Date.now() - startTime) / 1000).toFixed(1);
//   log(`✅ 构建完成，耗时 ${duration}s`);
// }

/**
 * 创建 miniprogram-ci 项目实例（公共复用）
 */
async function createProject({ appId, keyPath }) {
  const ci = await import('miniprogram-ci');

  const project = new ci.default.Project({
    appid: appId,
    type: 'miniProgram',
    projectPath: PROJECT_PATH,
    privateKeyPath: keyPath,
    ignores: ['node_modules/**/*'],
  });

  return { ci, project };
}

/**
 * 调用微信 CI 生成预览二维码
 */
async function preview({ appId, keyPath, robot, version, description }) {
  log('📱 开始上传小程序预览...');

  const { ci, project } = await createProject({ appId, keyPath });

  const previewResult = await ci.default.preview({
    project,
    desc: description,
    version,
    robot,
    qrcodeFormat: 'image',
    qrcodeOutputDest: QRCODE_OUTPUT,
    setting: CI_SETTING,
    onProgressUpdate: (info) => {
      if (info._msg) {
        log(info._msg);
      }
    },
  });

  log('✅ 预览上传成功');
  log(`预览二维码已保存至: ${QRCODE_OUTPUT}`);

  return previewResult;
}

/**
 * 调用微信 CI 上传代码到微信后台
 */
async function upload({ appId, keyPath, robot, version, description }) {
  log('📦 开始上传小程序到微信后台...');

  const { ci, project } = await createProject({ appId, keyPath });

  const uploadResult = await ci.default.upload({
    project,
    desc: description,
    version,
    robot,
    setting: CI_SETTING,
    onProgressUpdate: (info) => {
      if (info._msg) {
        log(info._msg);
      }
    },
  });

  log(`✅ 上传成功，版本号: ${version}`);

  return uploadResult;
}

/**
 * 清理临时文件
 */
function cleanup(keyPath) {
  try {
    if (existsSync(keyPath)) {
      unlinkSync(keyPath);
      log('已清理密钥文件');
    }
  } catch {
    // 忽略清理错误
  }
}

// ===================== 主流程 =====================

async function main() {
  const mode = getMode();
  const author = getEnv('PR_AUTHOR', false) || 'unknown';
  const prNumber = getEnv('PR_NUMBER', false);
  const prTitle = getEnv('PR_TITLE', false);
  const commitSha = getEnv('COMMIT_SHA', false);
  const appId = getEnv('MINI_APP_ID');

  const modeLabel = { preview: '仅预览', upload: '仅上传', all: '预览+上传' };

  log('========================================');
  log(`模式: ${modeLabel[mode]}`);
  if (prNumber) {
    log(`PR #${prNumber}: ${prTitle}`);
  } else {
    log(`Push: ${prTitle || 'develop branch'}`);
  }
  log(`发起者: ${author}`);
  log(`Commit: ${commitSha?.slice(0, 7)}`);
  log('========================================');

  // 1. 校验用户白名单（仅 PR 场景校验，push 到 develop 分支时跳过）
  const isPR = getEnv('IS_PR', false) !== 'false';
  if (isPR && !validateAuthor(author)) {
    process.exit(0); // 非白名单用户，静默退出
  }

  // 2. 获取机器人号
  const robot = getRobot(author);

  // 3. 写入密钥
  const keyPath = writePrivateKey();

  try {
    // 4. 构建
    // build();

    // 5. 根据模式执行预览或上传
    const version = prNumber
      ? `PR#${prNumber}-${commitSha?.slice(0, 7) || 'unknown'}`
      : `dev-${commitSha?.slice(0, 7) || 'unknown'}`;
    const description = prNumber
      ? `PR #${prNumber}: ${prTitle || '预览版本'}`
      : prTitle || 'develop branch push';

    const ciParams = { appId, keyPath, robot, version, description };

    if (mode === 'preview' || mode === 'all') {
      await preview(ciParams);
      setOutput('qrcode-path', QRCODE_OUTPUT);
    }

    if (mode === 'upload' || mode === 'all') {
      await upload(ciParams);
    }

    // 6. 设置输出
    setOutput('robot', String(robot));
    setOutput('version', version);

    log('🎉 全部完成！');
  } catch (err) {
    error(`流程执行失败: ${err.message}`);
    console.error(err);
    process.exit(1);
  } finally {
    cleanup(keyPath);
  }
}

main();
