<template>
  <Nav nav-type="title" title-text="全部消息" />
  <scroll-view
    class="message-list"
    scroll-y
    refresher-enabled
    :refresher-triggered="loading"
    @refresherrefresh="getMessageList"
  >
    <t-cell
      v-for="(item, index) in messageList"
      :key="index"
      :image="item.avatar"
      :title="item.name"
      :description="item.messages[item.messages.length - 1].content"
      hover
      @click="toChat(item.userId)"
    >
      <template #right-icon>
        <t-badge :count="computeUnreadNum(item.messages)" class="wrapper" />
      </template>
    </t-cell>
  </scroll-view>
  <CustomTabBar />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import Nav from '@/components/Nav.vue';
import CustomTabBar from '@/components/CustomTabBar.vue';
import { fetchMessageList, markMessagesRead } from '@/mock/chat';

interface Message {
  messageId: number;
  from: number;
  content: string;
  time: number;
  read: boolean;
}

interface User {
  userId: number;
  name: string;
  avatar: string;
  messages: Message[];
}

const messageList = ref<User[]>([]);
const loading = ref(true);

// 使用挂载在 uni 上的全局数据，解决页面切换后 inject 失效的问题
const globalData = (uni as any).$globalData;
const eventBus = (uni as any).$eventBus;

let currentUser: { userId: number; eventChannel?: any } | null = null;

const getMessageList = () => {
  loading.value = true;
  fetchMessageList().then(({ data }) => {
    messageList.value = data;
    loading.value = false;
  });
};

const getUserById = (userId: number) => {
  let index = 0;
  while (index < messageList.value.length) {
    const user = messageList.value[index];
    if (user.userId === userId) return { user, index };
    index += 1;
  }
  return { user: null, index: -1 };
};

const computeUnreadNum = (messages: Message[]) => {
  return messages.filter((item) => !item.read).length;
};

const computeTotalUnreadNum = () => {
  let unreadNum = 0;
  messageList.value.forEach(({ messages }) => {
    unreadNum += messages.filter((item) => !item.read).length;
  });
  return unreadNum;
};

const toChat = (userId: number) => {
  const { user } = getUserById(userId);
  console.log('user.user', user)
  if (user) {
    // 使用 uni.$emit 传递数据
    uni.$emit('updateChat', user);
  }
  uni.navigateTo({ 
    url: `/pages/chat/index?userId=${userId}&name=${encodeURIComponent(user.name)}&avatar=${encodeURIComponent(user.avatar)}`
  });
  setMessagesRead(userId);
};

const setMessagesRead = (userId: number) => {
  const { user } = getUserById(userId);
  if (user) {
    user.messages.forEach((message) => {
      message.read = true;
    });
    if (globalData) {
      globalData.unreadNum = computeTotalUnreadNum();
      eventBus?.emit('unread-num-change', globalData.unreadNum);
    }
    markMessagesRead(userId);
  }
};

// 处理 WebSocket 消息
const handleSocketMessage = (data: { userId: number; message: Message }) => {
  console.log('message/index.vue handleSocketMessage:', data);
  const { userId, message } = data;
  const { user, index } = getUserById(userId);
  if (user) {
    messageList.value.splice(index, 1);
    messageList.value.unshift(user);
    user.messages.push(message);
    if (currentUser && userId === currentUser.userId) {
      setMessagesRead(userId);
    }
  }
};

onMounted(() => {
  getMessageList();
  
  // 使用 uni.$on 监听消息事件（App.vue 中 socket.onMessage 会通过 uni.$emit 转发）
  uni.$on('onChatMessage', handleSocketMessage);
});

// 页面卸载时移除监听
onUnmounted(() => {
  uni.$off('onChatMessage', handleSocketMessage);
});

onShow(() => {
  currentUser = null;
});
</script>

<style lang="less" scoped>
page {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  height: 100vh;
  padding-bottom: calc(env(safe-area-inset-bottom) + 112rpx);
}

.nav-bar {
  border-bottom: 1rpx solid #e7e7e7;
}

.message-list {
  // height: 0;
  flex-grow: 1;
}

.avatar {
  border-radius: 50% !important;
}

.content > view {
  width: 560rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.content.unread > view {
  width: 510rpx;
}
</style>
