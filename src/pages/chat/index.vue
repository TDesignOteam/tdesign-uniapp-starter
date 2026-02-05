<template>
  <view class="chat-page">
    <t-navbar t-class="nav-bar" :title="name" left-arrow placeholder />
    <view class="chat-container">
      <scroll-view class="content" scroll-y :scroll-into-view="anchor">
<view class="messages">
          <template v-for="(item, index) in messages" :key="index">
            <view v-if="index === 0 || item.time - (messages[index - 1]?.time ?? 0) > 120000" class="time">
              {{ formatTime(item.time) }}
            </view>

            <view v-if="item.from === 0" class="message-area">
              <view class="message self">
                <text space="nbsp">{{ item.content }}</text>
                <t-loading
                  v-if="item.messageId === null"
                  t-class="loading"
                  theme="spinner"
                  size="32rpx"
                />
              </view>
              <t-avatar :image="myAvatar" size="small" />
            </view>

            <view v-else class="message-area">
              <t-avatar :image="avatar" size="small" />
              <view class="message other">
                <text space="nbsp">{{ item.content }}</text>
              </view>
            </view>
          </template>
          <view id="bottom" />
        </view>
      </scroll-view>
    </view>

    <view class="block" :style="{ marginBottom: keyboardHeight + 'px' }" />
    <view class="bottom" :style="{ marginBottom: keyboardHeight + 'px' }">
      <view class="input">
        <input
          v-model="inputValue"
          type="text"
          confirm-type="send"
          placeholder="请输入"
          placeholder-style="color: #00000066"
          :adjust-position="false"
          hold-keyboard
          confirm-hold
          @keyboardheightchange="handleKeyboardHeightChange"
          @blur="handleBlur"
          @confirm="sendMessage"
        />
      </view>
      <t-button t-class="send" theme="primary" shape="round" :disabled="!inputValue" @click="sendMessage">发送</t-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { onLoad, onUnload } from '@dcloudio/uni-app';
import { fetchMessageList, markMessagesRead } from '@/mock/chat';

interface Message {
  messageId: number | null;
  from: number;
  content: string;
  time: number;
  read: boolean;
}

const myAvatar = ref('/static/chat/avatar.png');
const userId = ref<number | null>(null);
const avatar = ref('');
const name = ref('');
const messages = ref<Message[]>([]);
const inputValue = ref('');
const anchor = ref('');
const keyboardHeight = ref(0);

// 使用挂载在 uni 上的全局数据，解决页面切换后 inject 失效的问题
const globalData = (uni as any).$globalData;

// 格式化时间
const formatTime = (time: number) => {
  const date = new Date(time);
  const now = new Date();
  const Y = date.getFullYear();
  const M = date.getMonth() + 1;
  const D = date.getDate();
  const h = date.getHours();
  const m = date.getMinutes();
  const Y0 = now.getFullYear();
  const M0 = now.getMonth() + 1;
  const D0 = now.getDate();
  
  const formatNum = (num: number) => num < 10 ? '0' + num : num;
  
  if (Y === Y0) {
    if (M === M0 && D === D0) return `今天 ${formatNum(h)}:${formatNum(m)}`;
    if (M === M0 && D === D0 - 1) return `昨天 ${formatNum(h)}:${formatNum(m)}`;
    return `${M}月${D}日 ${formatNum(h)}:${formatNum(m)}`;
  }
  return `${Y}年${M}月${D}日 ${formatNum(h)}:${formatNum(m)}`;
};

// 更新数据
const update = (data: { userId: number; avatar: string; name: string; messages: Message[] }) => {
  userId.value = data.userId;
  avatar.value = data.avatar;
  name.value = data.name;
  messages.value = [...data.messages];
  nextTick(scrollToBottom);
};

// 处理唤起键盘事件
const handleKeyboardHeightChange = (event: any) => {
  const { height } = event;
  if (!height) return;
  keyboardHeight.value = height;
  nextTick(scrollToBottom);
};

// 处理收起键盘事件
const handleBlur = () => {
  keyboardHeight.value = 0;
};

// 发送消息
const sendMessage = () => {
  const content = inputValue.value;
  if (!content) return;
  
  const message: Message = {
    messageId: null,
    from: 0,
    content,
    time: Date.now(),
    read: true
  };
  // 使用重新赋值的方式触发响应式更新
  messages.value = [...messages.value, message];
  inputValue.value = '';
  console.log('globalData', globalData?.socket?.send, userId.value)
  
  if (globalData?.socket && userId.value) {
    globalData.socket.send({ 
      type: 'message', 
      data: { userId: userId.value, content } 
    });
  }
  
  nextTick(scrollToBottom);
};

// 滚动到底部
const scrollToBottom = () => {
  anchor.value = 'bottom';
};

// 处理 WebSocket 消息
const handleChatMessage = (data: { userId: number; message: Message }) => {
  console.log('handleChatMessage 收到消息:', JSON.stringify(data));
  console.log('当前聊天 userId:', userId.value);
  // 只处理当前聊天用户的消息
  if (data.userId !== userId.value) {
    console.log('消息 userId 不匹配，忽略');
    return;
  }
  
  const { message } = data;
  
  if (message.from === 0) {
    // 自己发送的消息，更新 messageId（取消 loading 状态）
    const index = messages.value.findIndex(
      (m) => m.messageId === null && m.content === message.content
    );
    if (index !== -1) {
      const updatedMessages = [...messages.value];
      updatedMessages[index] = { ...updatedMessages[index], messageId: message.messageId };
      messages.value = updatedMessages;
    }
  } else {
    // 对方发送的消息，添加到列表
    messages.value = [...messages.value, message];
    nextTick(scrollToBottom);
  }
};

onLoad((options) => {
  console.log('chat onLoad, options:', options);
  
  fetchMessageList().then(({ data }) => {
    console.log('fetchMessageList data:', data);
    const user = data.find((user) => user.userId === Number(options?.userId));
    if (user) {
      update(user);
    }
  });

  // 使用 uni.$on 监听事件
  console.log('注册 uni.$on updateChat 和 onChatMessage');
  uni.$on('updateChat', update);
  // 监听 WebSocket 消息
  uni.$on('onChatMessage', handleChatMessage);
});

onUnload(() => {
  // 使用 uni.$off 移除事件监听
  uni.$off('updateChat', update);
  uni.$off('onChatMessage', handleChatMessage);
});
</script>

<style lang="less" scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100vh;
  font-size: 32rpx;
  background-color: #fff;
}

.chat-page :deep(.nav-bar) {
  border-bottom: 1rpx solid #e7e7e7;
}

.chat-container {
  flex: 1;
  overflow: hidden;
}

.content {
  height: 100%;
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
  padding: 32rpx 24rpx;
}

.time {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 56rpx;
  color: #00000066;
  font-size: 24rpx;
  line-height: 40rpx;
}

.message-area {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}

.message {
  position: relative;
  box-sizing: border-box;
  max-width: 510rpx;
  padding: 24rpx;
  font-size: 28rpx;
  line-height: 44rpx;
}

.message.self {
  border-radius: 24rpx 0 24rpx 24rpx;
  margin-left: auto;
  background-color: #d9e1ff;
}

.message.other {
  border-radius: 0 24rpx 24rpx 24rpx;
  background-color: #f3f3f3;
}

.chat-container :deep(.loading) {
  position: absolute;
  right: calc(100% + 16rpx);
  top: 50%;
  transform: translateY(-50%);
}

.block {
  height: calc(env(safe-area-inset-bottom) + 129rpx);
}

.bottom {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24rpx;
  padding: 24rpx 24rpx calc(env(safe-area-inset-bottom) + 24rpx);
  border-top: 1rpx solid #e7e7e7;
  background-color: #ffffff;
}

.input {
  box-sizing: border-box;
  flex-grow: 1;
  height: 80rpx;
  padding: 16rpx 32rpx;
  border-radius: 40rpx;
  border: 1rpx solid #dcdcdc;
  background: #f3f3f3;
  line-height: 48rpx;
}

.input > input {
  width: 100%;
  height: 48rpx;
  line-height: 48rpx;
  margin-bottom: 40rpx;
}

.bottom :deep(.send) {
  width: 128rpx !important;
  margin: 0;
  font-weight: normal !important;
}
</style>
