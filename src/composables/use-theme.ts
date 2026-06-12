import { ref } from 'vue';

/**
 * 当前系统主题（light | dark）。完全跟随系统，不做手动切换。
 *
 * - H5：依赖 CSS 媒体查询 @media (prefers-color-scheme: dark)，组件库与项目样式自动响应。
 * - 小程序：除组件样式外，还需通过 uni.setNavigationBarColor 同步原生导航栏颜色。
 */
export type ResolvedTheme = 'light' | 'dark';

interface UniWithTheme {
  getSystemInfoSync?: () => { theme?: ResolvedTheme };
  onThemeChange?: (cb: (res: { theme: ResolvedTheme }) => void) => void;
}

const uniThemeApi = uni as unknown as UniWithTheme;

const systemTheme = ref<ResolvedTheme>(detectSystemTheme());

let listenerBound = false;

function detectSystemTheme(): ResolvedTheme {
  // 小程序：通过 systemInfo 读取
  try {
    const sys = uniThemeApi.getSystemInfoSync?.();
    if (sys && (sys.theme === 'dark' || sys.theme === 'light')) {
      return sys.theme;
    }
  } catch {
    // 忽略
  }
  // H5：通过 matchMedia
  // #ifdef H5
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  // #endif
  return 'light';
}

/**
 * 同步原生导航栏颜色（仅小程序生效，H5 端会被静默忽略）
 *
 * 注：本项目所有页面均为 navigationStyle: "custom"（自定义导航栏），
 * 因此小程序端的 setNavigationBarColor 实际不会生效，并且在 onLaunch
 * 阶段调用还会触发 "page not found" 报错；这里仅保留 try/catch 兜底。
 */
function syncNavigationBarColor(theme: ResolvedTheme) {
  // 没有可用页面或页面是自定义导航栏时直接跳过
  try {
    const pages = (typeof getCurrentPages === 'function') ? getCurrentPages() : [];
    if (!pages || pages.length === 0) return;
  } catch {
    return;
  }

  try {
    uni.setNavigationBarColor({
      frontColor: theme === 'dark' ? '#ffffff' : '#000000',
      backgroundColor: theme === 'dark' ? '#181818' : '#ffffff',
      animation: { duration: 0, timingFunc: 'linear' },
    });
  } catch {
    // 自定义导航栏页面调用会失败，忽略
  }
}

function bindSystemThemeListener() {
  if (listenerBound) return;
  listenerBound = true;

  // 小程序
  try {
    uniThemeApi.onThemeChange?.(({ theme }) => {
      systemTheme.value = theme;
      syncNavigationBarColor(theme);
    });
  } catch {
    // 忽略
  }

  // H5
  // #ifdef H5
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (event: MediaQueryListEvent) => {
      systemTheme.value = event.matches ? 'dark' : 'light';
    };
    if (mq.addEventListener) {
      mq.addEventListener('change', handler);
    }
  }
  // #endif
}

/**
 * 应用启动时调用：绑定系统主题监听并同步一次原生导航栏颜色。
 */
export function useTheme() {
  bindSystemThemeListener();

  const applyTheme = () => {
    syncNavigationBarColor(systemTheme.value);
  };

  return {
    systemTheme,
    applyTheme,
  };
}
