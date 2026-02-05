<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { reactive } from "vue";
import config from "./config";
import { initMock } from "./mock/index";
import createBus from "./utils/eventBus";
import { connectSocket, fetchUnreadNum } from "./mock/chat";

// 初始化 Mock 数据
if (config.isMock) {
  initMock();
}

// 全局状态
const globalData = reactive({
  userInfo: null,
  unreadNum: 0,
  socket: null as any
});

// 全局事件总线
const eventBus = createBus();

// 将全局状态挂载到 uni 上，解决页面切换后 provide/inject 失效的问题
(uni as any).$globalData = globalData;
(uni as any).$eventBus = eventBus;

// 设置未读消息数量
const setUnreadNum = (unreadNum: number) => {
  globalData.unreadNum = unreadNum;
  eventBus.emit('unread-num-change', unreadNum);
};

// 获取未读消息数量
const getUnreadNum = () => {
  fetchUnreadNum().then(({ data }) => {
    globalData.unreadNum = data;
    eventBus.emit('unread-num-change', data);
  });
};

// 初始化 WebSocket
const connect = () => {
  const socket = connectSocket();
  console.log('WebSocket connected, socket:', socket);
  
  socket.onMessage((data: string) => {
    console.log('App.vue socket.onMessage 收到数据:', data);
    const parsedData = JSON.parse(data);
    console.log('App.vue 解析后数据:', parsedData);
    if (parsedData.type === 'message') {
      const { userId, message } = parsedData.data;
      // 将消息转发给聊天页面
      console.log('App.vue uni.$emit onChatMessage:', { userId, message });
      uni.$emit('onChatMessage', { userId, message });
      // 如果是对方发来的消息（未读），更新未读计数
      if (!message.read) {
        setUnreadNum(globalData.unreadNum + 1);
      }
    }
  });
  globalData.socket = socket;
};

onLaunch(() => {
  console.log("App Launch");
  
  // #ifdef MP-WEIXIN
  const updateManager = uni.getUpdateManager();
  updateManager.onCheckForUpdate((res) => {
    // console.log(res.hasUpdate)
  });
  updateManager.onUpdateReady(() => {
    uni.showModal({
      title: '更新提示',
      content: '新版本已经准备好，是否重启应用？',
      success(res) {
        if (res.confirm) {
          updateManager.applyUpdate();
        }
      },
    });
  });
  // #endif
  
  getUnreadNum();
  connect();
});

onShow(() => {
  console.log("App Show");
});

onHide(() => {
  console.log("App Hide");
});

// 导出全局方法供页面使用
// export { globalData, eventBus, setUnreadNum, getUnreadNum };
</script>

<style lang="less">
@import '@tdesign/uniapp/common/style/theme/index.less';

/* 全局样式 */
page {
  background-color: #f3f3f3;
}

.page {
  height: 100vh;
  background-color: #fff;
}
</style>
