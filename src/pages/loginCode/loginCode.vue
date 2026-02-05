<template>
  <t-navbar left-arrow placeholder/>
  <view class="page login-code">
    <view class="login-code__title">请输入验证码</view>
    <view class="login-code__tips">验证码已通过短信发送至 {{ phoneNumber }}</view>
    <view class="login-code__input">
      <t-input placeholder="输入验证码" v-model:value="verifyCode" type="number" @change="onVerifycodeChange">
        <template #suffix>
          <view class="suffix">
            <view class="suffix--line"></view>
            <t-link
              size="medium"
              hover
              :disabled="sendCodeCount !== 0"
              theme="primary"
              :content="sendCodeCount === 0 ? '发送验证码' : sendCodeCount + '秒后重发'"
              @click="sendCode"
            />
          </view>
        </template>
      </t-input>
    </view>

    <view class="login-code__button">
      <t-button theme="primary" size="large" block :disabled="!verifyCode" @click="login">登录</t-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import request from '@/api/request';

const phoneNumber = ref('');
const sendCodeCount = ref(60);
const verifyCode = ref('');

let timer: number | null = null;

const countDown = () => {
  sendCodeCount.value = 60;
  timer = setInterval(() => {
    if (sendCodeCount.value <= 0) {
      sendCodeCount.value = 0;
      if (timer) clearInterval(timer);
    } else {
      sendCodeCount.value -= 1;
    }
  }, 1000);
};

const onVerifycodeChange = (e: any) => {
  verifyCode.value = e?.value || e.value;
};

const sendCode = () => {
  if (sendCodeCount.value === 0) {
    countDown();
  }
};

const login = async () => {
  const res: any = await request('/login/postCodeVerify', 'GET', { code: verifyCode.value });
  if (res.success) {
    uni.setStorageSync('access_token', res.data.token);
    uni.navigateTo({
      url: '/pages/my/index',
    });
  }
};

onLoad((options) => {
  if (options?.phoneNumber) {
    phoneNumber.value = options.phoneNumber;
  }
  countDown();
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style lang="less" scoped>
.login-code {
  &__title {
    color: rgba(0, 0, 0, 0.9);
    font-size: 56rpx;
    font-weight: 600;
    line-height: 72rpx;
    padding: 16rpx 32rpx 40rpx;
  }

  &__tips {
    margin: 0 32rpx;
    color: rgba(0, 0, 0, 0.4);
    font-size: 24rpx;
    line-height: 40rpx;
  }

  &__input {
    margin-top: 48rpx;

    .suffix {
      display: flex;
      align-items: center;
      min-width: 168rpx;
    }

    .suffix--line {
      width: 2rpx;
      height: 48rpx;
      background-color: #f3f3f3;
      margin-right: 32rpx;
    }
  }

  &__button {
    margin: 56rpx 32rpx;
  }
}
</style>
