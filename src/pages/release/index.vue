<template>
  <t-navbar title="发布动态" left-arrow placeholder/>
  <view class="page">
    <view class="release-container">
      <view class="upload box">
        <t-upload
          :media-type="['image']"
          :files="originFiles"
          :grid-config="gridConfig"
          :max="4"
          @success="handleSuccess"
          @remove="handleRemove"
        />
      </view>
      <view class="desc box">
        <view class="desc-label">添加描述</view>
        <t-textarea
          placeholder="分享你此刻的想法"
          :maxlength="500"
          :disable-default-padding="true"
          indicator
        />
      </view>
      <view class="taggroup box">
        <t-cell title="添加标签">
          <template #note>
            <t-check-tag
              v-for="(tag, index) in tags"
              :key="index"
              class="tag-class"
              size="medium"
              :default-checked="index === 0"
              variant="dark"
              :content="`#${tag}`"
            />
          </template>
        </t-cell>
      </view>
      <view class="location box">
        <t-cell title="所在位置" hover arrow left-icon="location" @click="gotoMap" />
      </view>
      <view class="btngroup box">
        <t-button class="btn-class" theme="light" icon="file-copy" content="存草稿" size="large" @click="saveDraft" />
        <t-button class="btn-class" theme="primary" icon="upload" content="发布" size="large" @click="release" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface FileItem {
  url: string;
  name: string;
  type: string;
}

const originFiles = ref<FileItem[]>([
  { url: '/static/image1.png', name: 'uploaded1.png', type: 'image' },
  { url: '/static/image2.png', name: 'uploaded2.png', type: 'image' },
]);

const gridConfig = ref({
  column: 4,
  width: 160,
  height: 160,
});

const tags = ref(['AI绘画', '版权素材', '原创', '风格灵动']);

const handleSuccess = (e: any) => {
  const { files } = e;
  originFiles.value = files;
};

const handleRemove = (e: any) => {
  const { index } = e;
  originFiles.value.splice(index, 1);
};

const gotoMap = () => {
  uni.showToast({
    title: '获取当前位置...',
    icon: 'none',
    duration: 1500,
  });
};

const saveDraft = () => {
  uni.reLaunch({
    url: '/pages/home/index?oper=save',
  });
};

const release = () => {
  uni.reLaunch({
    url: '/pages/home/index?oper=release',
  });
};

defineOptions({
  styleIsolation: 'shared',
  virtualHost: true,
});
</script>

<style lang="less" scoped>
.release-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  box-sizing: border-box;

  .box {
    width: 100%;
  }
  
  .upload {
    height: 224rpx;
    position: relative;
    
    // &-class
    :deep(.t-upload) {
      width: 688rpx;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
  
  .desc {
    height: 264rpx;
    display: flex;
    padding: 32rpx;
    align-items: flex-start;
    justify-content: space-between;
    box-sizing: border-box;
    
    // .desc-class
    :deep(.t-textarea) {
      width: 492rpx;
      height: 100%;
      padding: 0;
    }
  }
  
  .taggroup {
    // .cell-title-class
    :deep(.t-cell__title-text) {
      width: 162rpx;
    }
    // .cell-note-class
    :deep(.t-cell__note) {
      overflow-x: auto;
      justify-content: start;
    }
    // .tag-class
    :deep(.t-tag) {
      margin-left: 24rpx;
    }
  }
  
  .btngroup {
    display: flex;
    justify-content: space-evenly;
    padding: 32rpx;
    position: fixed;
    bottom: 64rpx;
    
    // .btn-class
    :deep(.t-button) {
      width: 327rpx;
      margin: 0;
    }
  }
}
</style>
