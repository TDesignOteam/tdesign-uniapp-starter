<template>
  <NavComp nav-type="search" />
  <view class="home-container">
    <view class="home-content">
      <t-tabs default-value="recommend">
        <t-tab-panel label="推荐" value="recommend">
          <t-pull-down-refresh
            :value="enable"
            :loading-texts="['下拉刷新', '松手刷新', '正在刷新', '刷新完成']"
            @refresh="onRefresh"
          >
            <view class="home-card-list">
              <t-swiper
                :list="swiperList"
                :navigation="{ type: 'dots-bar' }"
                height="488rpx"
                custom-style="width: 340rpx"
              />
              <Card
                v-for="(item, index) in cardInfo"
                :key="index"
                :desc="item.desc"
                :url="item.url"
                :tags="item.tags"
              />
            </view>
          </t-pull-down-refresh>
        </t-tab-panel>
        <t-tab-panel label="我的关注" value="follow">
          <view class="home-card-list">
            <Card
              v-for="(item, index) in focusCardInfo"
              :key="index"
              :desc="item.desc"
              :url="item.url"
              :tags="item.tags"
            />
          </view>
        </t-tab-panel>
      </t-tabs>
    </view>
  </view>

  <view class="home-release">
    <t-button theme="primary" size="large" icon="add" shape="round" @click="goRelease">
      发布
    </t-button>
  </view>
  <t-message ref="t-message" />
  <CustomTabBar />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import NavComp from '@/components/Nav.vue';
import Card from '@/components/Card.vue';
import CustomTabBar from '@/components/CustomTabBar.vue';
import request from '@/api/request';
import MessagePlugin from '@tdesign/uniapp/message/index.js';

interface CardItem {
  url: string;
  desc: string;
  tags: { text: string; theme: string }[];
}

type SwiperItem = string;

const enable = ref(false);
const swiperList = ref<SwiperItem[]>([]);
const cardInfo = ref<CardItem[]>([]);
const focusCardInfo = ref<CardItem[]>([]);

const fetchData = async () => {
  const [cardRes, swiperRes] = await Promise.all([
    request('/home/cards'),
    request('/home/swipers'),
  ]);

  cardInfo.value = cardRes.data;
  focusCardInfo.value = cardRes.data.slice(0, 3);
  swiperList.value = swiperRes.data.map(item => item.image)
};

onMounted(() => {
  fetchData();
});

onLoad((options) => {
  if (options?.oper) {
    let content = '';
    if (options.oper === 'release') {
      content = '发布成功';
    } else if (options.oper === 'save') {
      content = '保存成功';
    }
    if (content) {
      showOperMsg(content);
    }
  }
});

const onRefresh = async () => {
  enable.value = true;
  
  const [cardRes, swiperRes] = await Promise.all([
    request('/home/cards'),
    request('/home/swipers'),
  ]);

  setTimeout(() => {
    enable.value = false;
    cardInfo.value = cardRes.data;
    swiperList.value = swiperRes.data;
  }, 1500);
};

const showOperMsg = (content: string) => {
  MessagePlugin.success({
    offset: [120, 32],
    duration: 4000,
    content,
  });
};

const goRelease = () => {
  uni.navigateTo({
    url: '/pages/release/index',
  });
};
</script>

<style lang="less" scoped>
@import '@/styles/variable.less';

@home-tab-item-height: 96rpx;

.home-container {
  height: calc(100vh - @tab-bar-height);

  .home-content {
    height: calc(100% - @nav-bar-height);
  }

  :deep(.t-tabs) {
    --td-tab-item-tag-height: @home-tab-item-height;
    --td-tab-font-size: @font-size-small;
    width: 100%;
    height: 100%;

    &__content {
      height: calc(100% - @home-tab-item-height);
      overflow: auto;
      background-color: @bg-color;
    }
  }

  .home-card-list {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 24rpx 12rpx;
    padding: 24rpx;
    background-color: @bg-color;
  }
}

.home-release {
  position: fixed;
  bottom: 208rpx;
  right: 32rpx;
}
</style>
