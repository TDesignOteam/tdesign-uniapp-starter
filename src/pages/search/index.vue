<template>
  <t-navbar title="搜索" left-arrow placeholder/>
  <view class="page search-page">
    <view class="search-input">
      <t-search
        v-model:value="searchValue"
        left-icon="search"
        action="取消"
        shape="round"
        placeholder="请搜索你想要的内容"
        @submit="handleSubmit"
        @action-click="actionHandle"
        :focus="true"
      />
    </view>
    <view class="search-wrap">
      <view class="history-wrap">
        <view class="search-header">
          <text class="search-title">历史记录</text>
          <t-icon name="delete" size="large" class="search-clear" @click="handleClearHistory" />
        </view>
        <view class="search-content">
          <view
            v-for="(item, index) in historyWords"
            :key="index"
            class="search-item"
            hover-class="hover-history-item"
            @click="handleHistoryTap(index)"
            @longpress="deleteCurr(index)"
          >
            <t-tag class="history-item margin-12" :max-width="343" variant="light">{{ item }}</t-tag>
          </view>
        </view>
      </view>
      <view class="popular-wrap">
        <view class="search-header">
          <text class="search-title">搜索发现</text>
        </view>
        <view class="search-content">
          <view
            v-for="(item, index) in popularWords"
            :key="index"
            class="search-item"
            hover-class="hover-history-item"
            @click="handlePopularTap(index)"
          >
            <t-tag class="popular-item margin-12" :max-width="343" variant="light" icon="search">{{ item }}</t-tag>
          </view>
        </view>
      </view>
    </view>
    <t-dialog
      :visible="dialogShow"
      :content="dialog.message"
      confirm-btn="确定"
      :cancel-btn="dialog.showCancelButton ? '取消' : ''"
      @confirm="confirm"
      @close="close"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import request from '@/api/request';

const historyWords = ref<string[]>([]);
const popularWords = ref<string[]>([]);
const searchValue = ref('');
const dialogShow = ref(false);
const dialog = ref({
  title: '确认删除当前历史记录',
  showCancelButton: true,
  message: '',
});

let deleteType = 0;
let deleteIndex = 0;

const queryHistory = async () => {
  const res: any = await request('/api/searchHistory');
  if (res.code === 200) {
    historyWords.value = res.data.historyWords || [];
  }
};

const queryPopular = async () => {
  const res: any = await request('/api/searchPopular');
  if (res.code === 200) {
    popularWords.value = res.data.popularWords || [];
  }
};

const setHistoryWords = (value: string) => {
  if (!value) return;

  const index = historyWords.value.indexOf(value);
  if (index !== -1) {
    historyWords.value.splice(index, 1);
  }
  historyWords.value.unshift(value);
  searchValue.value = value;
};

const confirm = () => {
  if (deleteType === 0) {
    historyWords.value.splice(deleteIndex, 1);
  } else {
    historyWords.value = [];
  }
  dialogShow.value = false;
};

const close = () => {
  dialogShow.value = false;
};

const handleClearHistory = () => {
  deleteType = 1;
  dialog.value.message = '确认删除所有历史记录';
  dialogShow.value = true;
};

const deleteCurr = (index: number) => {
  deleteIndex = index;
  deleteType = 0;
  dialog.value.message = '确认删除当前历史记录';
  dialogShow.value = true;
};

const handleHistoryTap = (index: number) => {
  const value = historyWords.value[index] || '';
  setHistoryWords(value);
};

const handlePopularTap = (index: number) => {
  const value = popularWords.value[index] || '';
  setHistoryWords(value);
};

const handleSubmit = (e: any) => {
  const value = e?.value || searchValue.value;
  if (!value) return;
  setHistoryWords(value);
};

const actionHandle = () => {
  searchValue.value = '';
  uni.navigateTo({ url: '/pages/home/index' });
};

onShow(() => {
  queryHistory();
  queryPopular();
});
</script>

<style lang="less" scoped>
.search-input {
  padding: 16rpx 0;
}

.search-page {
  box-sizing: border-box;
  width: 100vw;
  height: 100vh;
  padding: 0 30rpx;
}

.search-page :deep(.t-class__input-container) {
  border-radius: 999rpx !important;
}

.search-page :deep(.t-search__input) {
  font-size: 28rpx !important;
  color: #333 !important;
}

.search-page .search-wrap {
  margin-top: 24rpx;
}

.search-page .history-wrap {
  margin-bottom: 20px;
}

.search-page .search-header {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
}

.search-page .search-title {
  font-size: 30rpx;
  font-family: PingFangSC-Semibold, PingFang SC;
  font-weight: 600;
  color: rgba(51, 51, 51, 1);
  line-height: 42rpx;
}

.search-page .search-clear {
  font-size: 30rpx;
  font-family: PingFang SC;
  line-height: 32rpx;
  color: #999999;
  font-weight: bold;
}

.search-page .search-content {
  overflow: hidden;
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  align-items: flex-start;
  margin-top: 24rpx;
}

.search-page .search-item {
  color: #333333;
  font-size: 24rpx;
  line-height: 32rpx;
  font-weight: 400;
  margin-right: 24rpx;
  margin-bottom: 24rpx;
  border-radius: 3rpx;
}

.search-page .hover-history-item {
  position: relative;
  top: 3rpx;
  left: 3rpx;
  box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.1) inset;
}

.popular-wrap {
  margin-top: 32rpx;
}

.search-page .search-item .popular-item {
  background: #f3f3f3;
}

.search-page .search-item .history-item {
  background: #e7e7e7;
}
</style>
