/**
 * 安全返回：如果页面栈中有上一页则返回，否则跳转到首页
 */
export function navigateBack() {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack({ delta: 1 });
  } else {
    uni.reLaunch({ url: '/pages/home/index' });
  }
}
