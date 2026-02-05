<template>
  <t-navbar left-arrow placeholder/>
  <view class="page login">
    <view class="login__title">欢迎登录 TDesign</view>
    <view class="login__content">
      <view class="login__input">
        <view v-if="isPasswordLogin" class="login__password">
          <t-input
            label="账号"
            placeholder="请输入手机号/邮箱"
            v-model:value="passwordInfo.account"
            @change="onAccountChange"
          />
          <t-input
            label="密码"
            placeholder="请输入密码"
            type="password"
            clearable
            :value="passwordInfo.password"
            @change="onPasswordChange"
          />
        </view>
        <t-input
          v-else
          v-model:value="phoneNumber"
          placeholder="请输入手机号"
          type="number"
          @change="onPhoneInput"
        >
          <template #label>
            <view class="input-label">
              <text>+86</text>
              <t-icon name="caret-down-small" size="40rpx" class="input-icon" />
            </view>
          </template>
        </t-input>
      </view>

      <view class="login__tips">未注册的手机号验证通过后将自动注册</view>

      <t-radio-group allow-uncheck borderless :value="radioValue" @change="onCheckChange">
        <t-radio
          label="同意《协议条款》"
          value="agree"
          class="radio-class"
        />
      </t-radio-group>

      <view class="login__button">
        <t-button theme="primary" size="large" block :disabled="!isSubmit" @click="login">
          {{ isPasswordLogin ? '登录' : '验证并登录' }}
        </t-button>
      </view>

      <view v-if="isPasswordLogin" class="login__password--forget">
        <text>忘记密码？</text>
        <t-link theme="primary" size="small">找回密码</t-link>
      </view>
    </view>

    <view class="login__others">
      <text class="login__others-label">其他方式</text>
      <view class="login__others-buttons">
        <t-button class="button" variant="outline" theme="default" size="medium" shape="round" @click="changeLogin">
          {{ isPasswordLogin ? '验证码登录' : '密码登录' }}
        </t-button>
        <t-button class="button" variant="outline" theme="default" size="medium" icon="logo-wechat-stroke" shape="circle" />
        <t-button class="button" variant="outline" theme="default" size="medium" icon="logo-qq" shape="circle" />
        <t-button class="button" variant="outline" theme="default" size="medium" icon="logo-wecom" shape="circle" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import request from '@/api/request';

const phoneNumber = ref('');
const isPhoneNumber = ref(false);
const isCheck = ref(false);
const isPasswordLogin = ref(false);
const passwordInfo = ref({
  account: '',
  password: '',
});
const radioValue = ref('');

const isSubmit = computed(() => {
  if (isPasswordLogin.value) {
    return passwordInfo.value.account !== '' && passwordInfo.value.password !== '' && isCheck.value;
  }
  return isPhoneNumber.value && isCheck.value;
});

const onPhoneInput = (e: any) => {
  const value = e?.value || e.value;
  isPhoneNumber.value = /^[1][3,4,5,7,8,9][0-9]{9}$/.test(value);
  phoneNumber.value = value;
};

const onCheckChange = (e: any) => {
  const value = e?.value || e.value;
  radioValue.value = value;
  isCheck.value = value === 'agree';
};

const onAccountChange = (e: any) => {
  const value = e?.value || e.value;
  passwordInfo.value.account = value;
};

const onPasswordChange = (e: any) => {
  const value = e?.value || e.value;
  passwordInfo.value.password = value;
};

const changeLogin = () => {
  isPasswordLogin.value = !isPasswordLogin.value;
};

const login = async () => {
  if (isPasswordLogin.value) {
    const res: any = await request('/login/postPasswordLogin', 'POST', passwordInfo.value);
    if (res.success) {
      uni.setStorageSync('access_token', res.data.token);
      uni.navigateTo({
        url: '/pages/my/index',
      });
    }
  } else {
    const res: any = await request('/login/getSendMessage');
    if (res.success) {
      uni.navigateTo({
        url: `/pages/loginCode/loginCode?phoneNumber=${phoneNumber.value}`,
      });
    }
  }
};
</script>

<style lang="less" scoped>
.login {
  &__title {
    color: rgba(0, 0, 0, 0.9);
    font-size: 56rpx;
    font-weight: 600;
    line-height: 72rpx;
    padding: 16rpx 32rpx 40rpx;
  }

  &__input {
    .input-label {
      display: flex;
      padding-right: 32rpx;
      box-sizing: border-box;
      border-right: 1rpx solid #e7e7e7;
    }

    .input-icon {
      margin-left: 8rpx;
    }
  }

  &__tips {
    color: rgba(0, 0, 0, 0.4);
    font-size: 24rpx;
    font-style: normal;
    font-weight: 400;
    line-height: 40rpx;
    margin: 24rpx 32rpx 32rpx;
  }

  &__button {
    margin: 0 32rpx;
  }

  &__password--forget {
    display: flex;
    font-size: 24rpx;
    align-items: center;
    margin: 32rpx;
    line-height: 40rpx;
  }

  &__others {
    margin: 64rpx 32rpx auto 32rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &-label {
      min-width: 96rpx;
      color: rgba(0, 0, 0, 0.6);
      font-size: 24rpx;
      line-height: 40rpx;
    }

    &-buttons {
      flex: 1;
      margin-left: 32rpx;
      display: flex;
      align-items: center;
      justify-content: flex-end;

      .button {
        margin: 0 !important;

        &:not(:last-child) {
          margin-right: 32rpx !important;
        }
      }
    }
  }

  // .radio-class
  :deep(.t-radio) {
    --td-radio-icon-size: 32rpx;
    --td-radio-label-line-height: 40rpx;
    align-items: center;
    margin-left: 32rpx;
  }
}
</style>
