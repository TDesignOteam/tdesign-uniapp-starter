<template>
  <view class="home-card">
    <t-image t-class="home-card__image" custom-style="width: 340rpx;height:340rpx;" :src="url" mode="aspectFill" />
    <view class="home-card__info">
      <text>{{ desc }}</text>
      <view class="home-card__tag-group">
        <t-tag
          v-for="(tag, index) in tags"
          :key="index"
          size="small"
          variant="light"
          :theme="tag.theme"
        >
          {{ tag.text }}
        </t-tag>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Tag {
  text: string;
  theme: 'default' | 'primary' | 'warning' | 'danger' | 'success';
}

defineProps<{
  url: string;
  desc: string;
  tags: Tag[];
}>();

defineOptions({
  styleIsolation: 'shared',
})
</script>

<style lang="less" scoped>
@import '@/styles/variable.less';

.home-card {
  display: inline-flex;
  flex-direction: column;
  width: 340rpx;
  height: 488rpx;
  border-radius: 9px;
  background: @bg-color-white;

  :deep(.t-image) {
    width: 340rpx;
    height: 340rpx;
  }

  &__info {
    padding: 32rpx;
    font-weight: 400;
    font-size: @font-size-small;
  }

  &__tag-group {
    display: flex;
    gap: 16rpx;
    margin-top: 16rpx;
  }
}
</style>
