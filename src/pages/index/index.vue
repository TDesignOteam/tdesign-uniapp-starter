<template>
  <view class="content">
    <t-button theme="danger" @click="onClick">点击</t-button>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const title = ref('Hello')
const onClick = () => {
  uni.navigateTo({
    url: '/pages/second/index'
  })
}
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
