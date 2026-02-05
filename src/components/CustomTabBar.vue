<template>
  <!-- <view class="custom-tab-bar"> -->
    <t-tab-bar fixed placeholder :value="value" theme="tag" :split="false" @change="handleChange">
      <t-tab-bar-item icon="home" value="home">首页</t-tab-bar-item>
      <t-tab-bar-item icon="chat" value="message" :badge-props="{ count: unreadNum }">消息</t-tab-bar-item>
      <t-tab-bar-item icon="user" value="my">我的</t-tab-bar-item>
    </t-tab-bar>
  <!-- </view> -->
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const value = ref('');
const unreadNum = ref(0);

// 使用挂载在 uni 上的全局数据，解决页面切换后 inject 失效的问题
const globalData = (uni as any).$globalData;
const eventBus = (uni as any).$eventBus;

// 获取当前页面对应的 tab 值
const getCurrentTabValue = () => {
  const pages = getCurrentPages();
  const curPage = pages[pages.length - 1];
  if (curPage) {
    const route = (curPage as any).route || '';
    const nameRe = /pages\/(\w+)\/index/.exec(route);
    if (nameRe && nameRe[1]) {
      return nameRe[1];
    }
  }
  return '';
};

// 同步状态
const syncState = () => {
  // 同步当前 tab 值
  value.value = getCurrentTabValue();
  
  // 同步全局未读消息数量
  if (globalData) {
    unreadNum.value = globalData.unreadNum || 0;
  }
};

onMounted(() => {
  syncState();
});

// 监听未读消息数量变化
eventBus?.on('unread-num-change', (num: number) => {
  unreadNum.value = num;
});

const handleChange = (e: any) => {
  const val = e?.value
  console.log(val);
  
  // 如果点击的是当前页面，不做任何操作
  if (val === value.value) {
    return;
  }
  
  // 使用 redirectTo 切换页面（关闭当前页后跳转，避免页面栈累积）
  uni.redirectTo({ 
    url: `/pages/${val}/index`
  });
};
</script>

<style lang="less" scoped>
@import '@/styles/variable.less';

.custom-tab-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background-color: #fff;
  padding-bottom: env(safe-area-inset-bottom);
  
  --td-tab-bar-height: @tab-bar-height;

  :deep(.t-tab-bar) {
    // 在这里可以完全自定义样式
  }

  :deep(.t-tab-bar-item) {
    margin: 0;
    padding: 16rpx 24rpx;
  }
}
</style>
