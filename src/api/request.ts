import config from '@/config';

const { baseUrl } = config;
const delay = config.isMock ? 500 : 0;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
}

function request<T = any>(url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data: any = {}): Promise<T> {
  const header: Record<string, string> = {
    'content-type': 'application/json',
  };
  
  // 获取 token
  const tokenString = uni.getStorageSync('access_token');
  if (tokenString) {
    header.Authorization = `Bearer ${tokenString}`;
  }
  
  return new Promise((resolve, reject) => {
    uni.request({
      url: baseUrl + url,
      method,
      data,
      header,
      success(res: any) {
        setTimeout(() => {
          if (res.statusCode === 200) {
            resolve(res.data as T);
          } else {
            reject(res);
          }
        }, delay);
      },
      fail(err) {
        setTimeout(() => {
          reject(err);
        }, delay);
      },
    });
  });
}

export default request;
