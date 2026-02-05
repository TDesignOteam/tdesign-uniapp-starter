<template>
  <t-toast ref="t-toast" />
  <view class="my">
    <image class="nav-bg" src="/static/bg_navbar.png" />
    <Nav title-text="我的" />
    <view class="my-info">
      <t-cell-group>
        <t-cell v-if="isLoad" :bordered="false">
          <template #left-icon>
            <t-avatar :image="personalInfo.image" size="large" />
          </template>
          <template #description>
            <view class="my-info__person">
              <view class="name">{{ personalInfo.name }}</view>
              <view class="tags">
                <t-tag class="tag" variant="light" icon="discount">{{ personalInfo.star }}</t-tag>
                <t-tag class="tag" variant="light" icon="location">{{ personalInfo.city }}</t-tag>
              </view>
            </view>
          </template>
          <template #right-icon>
            <t-icon name="edit" size="40rpx" color="#000000e6" @click="onNavigateTo" />
          </template>
        </t-cell>
        <t-cell
          v-if="!isLoad"
          title="请先登录/注册"
          :bordered="false"
          @click="onLogin"
        >
          <template #left-icon>
            <t-avatar icon="user" size="128rpx" />
          </template>
        </t-cell>
      </t-cell-group>
      <t-divider />
      <t-grid>
        <t-grid-item
          v-for="gridItem in gridList"
          :key="gridItem.type"
          :text="gridItem.name"
          :icon="gridItem.icon"
          :class="['grid-item', gridItem.type === 'all' ? 'split-line' : '']"
          @click="onEleClick(gridItem)"
        />
      </t-grid>
    </view>

    <view class="my-service">
      <view class="my-service--tips">推荐服务</view>
      <t-grid :column="4" class="my-service__list">
        <t-grid-item
          v-for="item in service"
          :key="item.name"
          class="my-service__list-item"
          :text="item.name"
          :image="item.image"
          @click="onEleClick(item)"
        />
      </t-grid>
    </view>

    <t-cell-group theme="card">
      <t-cell
        v-for="item in settingList"
        :key="item.type"
        :title="item.name"
        :left-icon="item.icon"
        hover
        arrow
        @click="onEleClick(item)"
      />
    </t-cell-group>
  </view>
  <CustomTabBar />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import Nav from '@/components/Nav.vue';
import CustomTabBar from '@/components/CustomTabBar.vue';
import request from '@/api/request';
import { showToast} from '@tdesign/uniapp/toast/index.js';

interface PersonalInfo {
  name: string;
  image: string;
  star: string;
  city: string;
}

interface ServiceItem {
  name: string;
  image: string;
  url: string;
}

interface GridItem {
  name: string;
  icon: string;
  type: string;
  url: string;
}

interface SettingItem {
  name: string;
  icon: string;
  type: string;
  url?: string;
}

const isLoad = ref(false);
const service = ref<ServiceItem[]>([]);
const personalInfo = ref<PersonalInfo>({
  name: '',
  image: '',
  star: '',
  city: ''
});

const gridList = ref<GridItem[]>([
  { name: '全部发布', icon: 'root-list', type: 'all', url: '' },
  { name: '审核中', icon: 'search', type: 'progress', url: '' },
  { name: '已发布', icon: 'upload', type: 'published', url: '' },
  { name: '草稿箱', icon: 'file-copy', type: 'draft', url: '' },
]);

const settingList = ref<SettingItem[]>([
  { name: '联系客服', icon: 'service', type: 'service' },
  { name: '设置', icon: 'setting', type: 'setting', url: '/pages/setting/index' },
]);

const getServiceList = () => {
  request('/api/getServiceList').then((res: any) => {
    service.value = res.data.service;
  });
};

const getPersonalInfo = async () => {
  const res: any = await request('/api/genPersonalInfo');
  return res.data;
};

onMounted(() => {
  getServiceList();
});

onShow(async () => {
  const token = uni.getStorageSync('access_token');
  const info = await getPersonalInfo();

  if (token) {
    isLoad.value = true;
    personalInfo.value = info;
  }
});

const onLogin = () => {
  uni.navigateTo({
    url: '/pages/login/login',
  });
};

const onNavigateTo = () => {
  uni.navigateTo({ url: '/pages/my/info-edit/index' });
};

const onEleClick = (item: any) => {
  const { name, url } = item;
  if (url) {
    uni.navigateTo({ url });
    return;
  }
  showToast({ message: name });
};
</script>

<style lang="less" scoped>
.my {
  height: calc(100vh - 56px);
  overflow-y: auto;

  --td-navbar-bg-color: transparent;
  
  .nav-bg {
    width: 750rpx;
    height: 200rpx;
    position: fixed;
    top: 0;
  }

  &-info,
  &-service,
  &-setting {
    background-color: #fff;
  }

  &-info {
    border-radius: 24rpx;
    margin: 8rpx 32rpx 0rpx 32rpx;
    padding-bottom: 32rpx;
    overflow: hidden;

    // .cell-class-title 
    :deep(.t-cell__title) {
      font-weight: 600 !important;
    }

    // .cell-class-center
    :deep(.t-cell__title) {
      display: flex;
      align-items: center !important;
    }

    // .divider-class
    :deep(.t-divider) {
      margin-top: 0 !important;
      margin-bottom: 0 !important;
    }

    // .grid-class
    :deep(.t-grid) {
      margin-top: 40rpx;
    }

    .grid-item :deep(.t-grid-item__content) {
      padding: 0px !important;
    }

    .split-line {
      border-right: 1px solid #e7e7e7;
    }

    --td-spacer-1: 32rpx;

    &__person {
      .name {
        line-height: 48rpx;
        font-size: 32rpx;
        color: #000000e6;
        font-weight: 600;
      }

      .tags {
        display: flex;
        margin-top: 16rpx;

        --td-text-color-primary: #000000e6;
        --td-tag-medium-font-size: 20rpx;
        --td-tag-medium-icon-size: 24rpx;
      }

      .tag:not(:last-child) {
        margin-right: 16rpx;
      }
    }
  }

  &-service {
    border-radius: 24rpx;
    margin: 32rpx;
    padding-bottom: 8rpx;
    overflow: hidden;

    &__list-item {
      :deep(.t-grid-item__content) {
        padding-bottom: 16rpx !important;
      }
      :deep(.t-grid-item__text) {
        height: 40rpx !important;
      }
    }

    &--tips {
      height: 44rpx;
      line-height: 44rpx;
      padding-left: 40rpx;
      margin-top: 32rpx;
      color: #000000e6;
      font-size: 28rpx;
      font-weight: 600;
    }
  }
}
</style>
