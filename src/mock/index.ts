// Mock 数据存储
const mockStore: Record<string, any> = {};

// 初始化 Mock 数据
export function initMock() {
  // 首页数据
  mockStore['/home/cards'] = {
    code: 200,
    message: '请求成功',
    data: [
      {
        url: '/static/home/card0.png',
        desc: '少年,星空与梦想',
        tags: [
          { text: 'AI绘画', theme: 'primary' },
          { text: '版权素材', theme: 'success' },
        ],
      },
      {
        url: '/static/home/card1.png',
        desc: '仰望星空的少女',
        tags: [
          { text: 'AI绘画', theme: 'primary' },
          { text: '版权素材', theme: 'success' },
        ],
      },
      {
        url: '/static/home/card3.png',
        desc: '仰望星空的少年',
        tags: [
          { text: 'AI绘画', theme: 'primary' },
          { text: '版权素材', theme: 'success' },
        ],
      },
      {
        url: '/static/home/card2.png',
        desc: '少年,星空与梦想',
        tags: [
          { text: 'AI绘画', theme: 'primary' },
          { text: '版权素材', theme: 'success' },
        ],
      },
      {
        url: '/static/home/card4.png',
        desc: '多彩的天空',
        tags: [
          { text: 'AI绘画', theme: 'primary' },
          { text: '版权素材', theme: 'success' },
        ],
      },
    ],
  };

  mockStore['/home/swipers'] = {
    code: 200,
    message: '请求成功',
    data: [
      { image: '/static/home/swiper0.png' },
      { image: '/static/home/card0.png' },
      { image: '/static/home/card1.png' },
    ],
  };

  // 搜索数据
  mockStore['/api/searchHistory'] = {
    code: 200,
    data: {
      historyWords: ['TDesign', '组件库', 'AI绘画', 'Vue3', 'uni-app'],
    },
  };

  mockStore['/api/searchPopular'] = {
    code: 200,
    data: {
      popularWords: ['TDesign 组件', 'Vue3 教程', '小程序开发', 'AI绘画', '跨端开发'],
    },
  };

  // 登录数据
  mockStore['/login/getSendMessage'] = {
    success: true,
    data: { message: '验证码已发送' },
  };

  mockStore['/login/postPasswordLogin'] = {
    success: true,
    data: { token: 'mock_token_12345' },
  };

  mockStore['/login/postCodeVerify'] = {
    success: true,
    data: { token: 'mock_token_12345' },
  };

  // 我的页面数据
  mockStore['/api/getServiceList'] = {
    code: 200,
    data: {
      service: [
        { name: '帮助中心', image: '/static/icon_doc.png', url: '' },
        { name: '官方地图', image: '/static/icon_map.png', url: '' },
        { name: 'QQ群', image: '/static/icon_qq.png', url: '' },
        { name: 'TDesign', image: '/static/icon_td.png', url: '' },
      ],
    },
  };

  mockStore['/api/genPersonalInfo'] = {
    code: 200,
    data: {
      name: 'TDesign',
      image: '/static/avatar1.png',
      star: 'Lv.5',
      city: '深圳',
      gender: 0,
      birth: '2020-01-01',
      address: ['440000', '440300'],
      introduction: 'TDesign 是腾讯各业务团队在服务业务过程中沉淀的一套企业级设计体系。',
      photos: [
        { url: '/static/image1.png', name: 'image1.png', type: 'image' },
        { url: '/static/image2.png', name: 'image2.png', type: 'image' },
      ],
    },
  };

  // 数据中心
  mockStore['/dataCenter/member'] = {
    code: 200,
    data: {
      template: {
        succ: {
          data: {
            list: [
              { name: '内容曝光', number: 8420 },
              { name: '阅读人数', number: 2560 },
              { name: '互动量', number: 980 },
            ],
          },
        },
      },
    },
  };

  mockStore['/dataCenter/interaction'] = {
    code: 200,
    data: {
      template: {
        succ: {
          data: {
            list: [
              { name: '评论', number: 320 },
              { name: '点赞', number: 580 },
              { name: '收藏', number: 240 },
              { name: '转发', number: 120 },
            ],
          },
        },
      },
    },
  };

  mockStore['/dataCenter/complete-rate'] = {
    code: 200,
    data: {
      template: {
        succ: {
          data: {
            list: [
              { time: '0-25%', percentage: 30 },
              { time: '25-50%', percentage: 55 },
              { time: '50-75%', percentage: 42 },
              { time: '75-100%', percentage: 28 },
            ],
          },
        },
      },
    },
  };

  mockStore['/dataCenter/area'] = {
    code: 200,
    data: {
      template: {
        succ: {
          data: {
            list: [],
          },
        },
      },
    },
  };

  // 拦截 uni.request
  const originalRequest = uni.request;
  // @ts-ignore
  uni.request = function (options: UniApp.RequestOptions) {
    const url = options.url || '';
    
    // 检查是否有对应的 mock 数据
    for (const key in mockStore) {
      if (url.endsWith(key)) {
        const mockData = mockStore[key];
        setTimeout(() => {
          if (options.success) {
            options.success({
              data: mockData,
              statusCode: 200,
              header: {},
              cookies: [],
              errMsg: 'request:ok',
            } as UniApp.RequestSuccessCallbackResult);
          }
          if (options.complete) {
            options.complete({} as any);
          }
        }, 300);
        return { abort: () => {} } as UniApp.RequestTask;
      }
    }
    
    // 如果没有 mock 数据，调用原始请求
    return originalRequest(options);
  };
}

export default { initMock };
