<template>
  <t-navbar title="设置" left-arrow placeholder/>
  <view class="setting">
    <t-cell-group v-for="(group, index) in menuData" :key="index" theme="card">
      <t-cell
        v-for="item in group"
        :key="item.type"
        :title="item.title"
        hover
        arrow
        :left-icon="item.icon"
        @click="onEleClick(item)"
      />
    </t-cell-group>
  </view>
  <t-toast ref="t-toast" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {showToast} from '@tdesign/uniapp/toast/index.js';

interface MenuItem {
  title: string;
  url: string;
  icon: string;
  type: string;
}

const menuData = ref<MenuItem[][]>([
  [
    { title: '通用设置', url: '', icon: 'app', type: 'general' },
    { title: '通知设置', url: '', icon: 'notification', type: 'notification' },
  ],
  [
    { title: '深色模式', url: '', icon: 'image', type: 'dark' },
    { title: '字体大小', url: '', icon: 'chart', type: 'font' },
    { title: '播放设置', url: '', icon: 'sound', type: 'play' },
  ],
  [
    { title: '账号安全', url: '', icon: 'secured', type: 'security' },
    { title: '隐私', url: '', icon: 'info-circle', type: 'privacy' },
  ],
]);

const onEleClick = (item: MenuItem) => {
  const { title, url } = item;
  if (url) {
    uni.navigateTo({ url });
    return;
  }
  showToast({ message: title });
};
</script>

<style lang="less" scoped>
.setting :deep(.t-cell-group) {
  margin: 32rpx;
}
</style>
