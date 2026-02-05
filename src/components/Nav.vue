<template>
  <view class="home-navbar">
    <t-navbar :title="navType === 'search' ? '' : titleText" placeholder>
      <template #left>
        <view class="home-navbar__left">
          <t-icon t-class="home-navbar__icon" name="view-list" size="48rpx" @click="openDrawer" custom-style="padding: 12rpx" />
          <t-search
            v-if="navType === 'search'"
            shape="round"
            placeholder="请搜索你想要的内容"
            @click="searchTurn"
          />
        </view>
      </template>
    </t-navbar>
    <t-drawer
      :style="{ paddingTop: statusHeight + 'px' }"
      :visible="visible"
      :items="sidebar"
      placement="left"
      title="页面目录"
      @item-click="itemClick"
      @close="visible = false"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps({
  navType: {
    type: String,
    default: 'title'
  },
  titleText: {
    type: String,
    default: ''
  }
});

const visible = ref(false);
const statusHeight = ref(0);

const sidebar = ref([
  { title: '首页', url: 'pages/home/index', isSidebar: true, icon: 'home' },
  { title: '搜索页', url: 'pages/search/index', isSidebar: false, icon: 'search' },
  { title: '发布页', url: 'pages/release/index', isSidebar: false, icon: 'upload' },
  { title: '消息列表页', url: 'pages/message/index', isSidebar: true, icon: 'chat' },
  { title: '对话页', url: 'pages/chat/index?userId=1', isSidebar: false, icon: 'chat' },
  { title: '个人中心页', url: 'pages/my/index', isSidebar: true, icon: 'user' },
  { title: '个人信息表单页', url: 'pages/my/info-edit/index', isSidebar: false, icon: 'edit' },
  { title: '设置页', url: 'pages/setting/index', isSidebar: false, icon: 'setting' },
  { title: '数据图表页', url: 'pages/dataCenter/index', isSidebar: false, icon: 'chart-bar' },
  { title: '登录注册页', url: 'pages/login/login', isSidebar: false, icon: 'user-add' },
]);

onMounted(() => {
  const systemInfo = uni.getWindowInfo();
  statusHeight.value = systemInfo.statusBarHeight || 0;
});

const openDrawer = () => {
  visible.value = true;
};

const itemClick = (e: any) => {
  const item = e?.item || e.item;
  const { isSidebar, url } = item;
  
  if (isSidebar) {
    uni.redirectTo({
      url: `/${url}`,
      success: () => {
        visible.value = false;
      }
    });
  } else {
    uni.navigateTo({
      url: `/${url}`,
      success: () => {
        visible.value = false;
      }
    });
  }
};

const searchTurn = () => {
  uni.navigateTo({
    url: '/pages/search/index',
  });
};


defineOptions({
  styleIsolation: 'shared'
})
</script>

<style lang="less" scoped>
@import '@/styles/variable.less';

.home-navbar {
  :deep(.t-navbar) {
    &__left {
      margin-left: 12rpx;
    }
  }

  // :deep(.home-navbar__icon) {
  //   padding: 12rpx;
  // }

  &__left {
    display: flex;
    align-items: center;
    padding: 0 16rpx;

    :deep(.t-search) {
      --td-search-height: 64rpx;
      --td-search-font-size: @font-size-mini;
      width: 375rpx;

      .t-icon {
        font-size: @font-size-default !important;
      }
    }
  }
  --td-drawer-title-font-size: 48rpx;
}
</style>
