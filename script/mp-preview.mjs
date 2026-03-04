/**
 * 小程序 PR 预览脚本
 *
 * 功能：
 * 1. 校验 PR 发起者是否在白名单中
 * 2. 根据不同用户分配不同的机器人号
 * 3. 执行 UniApp 小程序构建
 * 4. 调用微信小程序 CI 上传并生成预览二维码
 *
 * 环境变量：
 * - MINI_APP_ID: 小程序 AppID
 * - MINI_APP_PRIVATE_KEY: 小程序上传密钥（Base64 编码）
 * - PR_AUTHOR: PR 发起者 GitHub 用户名
 * - PR_NUMBER: PR 编号
 * - PR_TITLE: PR 标题
 * - COMMIT_SHA: 当前 commit SHA
 */

import { execSync } from 'node:child_process';
import { writeFileSync, existsSync, unlinkSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = resolve(__dirname, '..');

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
const BUILD_COMMAND = 'npm run build:mp';

/** 小程序项目产物目录（相对于项目根目录） */
const PROJECT_PATH = resolve(ROOT_DIR, 'dist/build/mp-weixin');

/** 预览二维码输出路径 */
const QRCODE_OUTPUT = resolve(ROOT_DIR, 'preview-qrcode.png');

// ===================== 工具函数 =====================

function log(msg) {
  console.log(`[mp-preview] ${msg}`);
}

function error(msg) {
  console.error(`[mp-preview] ❌ ${msg}`);
}

function run(cmd, options = {}) {
  log(`执行命令: ${cmd}`);
  execSync(cmd, {
    stdio: 'inherit',
    cwd: ROOT_DIR,
    ...options,
  });
}

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
  const privateKeyBase64 = getEnv('MINI_APP_PRIVATE_KEY');
  const keyPath = resolve(ROOT_DIR, 'private.key');

  // 密钥可能是 Base64 编码的，也可能是直接的 PEM 内容
  let keyContent = privateKeyBase64;
  if (!privateKeyBase64.includes('BEGIN')) {
    keyContent = Buffer.from(privateKeyBase64, 'base64').toString('utf-8');
  }

  writeFileSync(keyPath, keyContent);
  log(`密钥文件已写入: ${keyPath}`);
  return keyPath;
}

/**
 * 执行小程序构建
 */
function build() {
  log('🔨 开始构建小程序...');
  const startTime = Date.now();

  run(BUILD_COMMAND);

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  log(`✅ 构建完成，耗时 ${duration}s`);
}

/**
 * 调用微信 CI 上传预览
 */
async function preview({ appId, keyPath, robot, version, description }) {
  log('📱 开始上传小程序预览...');

  // 动态导入 miniprogram-ci
  const ci = await import('miniprogram-ci');

  const project = new ci.default.Project({
    appid: appId,
    type: 'miniProgram',
    projectPath: PROJECT_PATH,
    privateKeyPath: keyPath,
    ignores: ['node_modules/**/*'],
  });

  const previewResult = await ci.default.preview({
    project,
    desc: description,
    version,
    robot,
    qrcodeFormat: 'image',
    qrcodeOutputDest: QRCODE_OUTPUT,
    setting: {
      es6: true,
      es7: true,
      minify: true,
      autoPrefixWXSS: true,
      minifyWXML: true,
    },
    onProgressUpdate: (info) => {
      if (info._msg) {
        log(info._msg);
      }
    },
  });

  log(`✅ 预览上传成功`);
  log(`预览二维码已保存至: ${QRCODE_OUTPUT}`);

  return previewResult;
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
  const author = getEnv('PR_AUTHOR');
  const prNumber = getEnv('PR_NUMBER', false);
  const prTitle = getEnv('PR_TITLE', false);
  const commitSha = getEnv('COMMIT_SHA', false);
  const appId = getEnv('MINI_APP_ID');

  log('========================================');
  log(`PR #${prNumber}: ${prTitle}`);
  log(`发起者: ${author}`);
  log(`Commit: ${commitSha?.slice(0, 7)}`);
  log('========================================');

  // 1. 校验用户白名单
  if (!validateAuthor(author)) {
    process.exit(0); // 非白名单用户，静默退出
  }

  // 2. 获取机器人号
  const robot = getRobot(author);

  // 3. 写入密钥
  const keyPath = writePrivateKey();

  try {
    // 4. 构建
    build();

    // 5. 上传预览
    const version = `PR#${prNumber}-${commitSha?.slice(0, 7) || 'unknown'}`;
    const description = `PR #${prNumber}: ${prTitle || '预览版本'}`;

    await preview({
      appId,
      keyPath,
      robot,
      version,
      description,
    });

    // 6. 设置输出
    setOutput('qrcode-path', QRCODE_OUTPUT);
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
