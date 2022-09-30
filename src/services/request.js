import axios from 'axios'
import store from "../store";
import router from "../router";
import storage from "../utils/storage";
//
// import qs from 'qs'
// create an axios instance
const service = axios.create({
  // index.js设置了代理(解决跨域)
  baseURL: "http://localhost:90", // url = base url + request url
  timeout: 10000, // request timeout
})

//添加请求拦截器，若token存在则在请求头中加token，不存在也继续请求
service.interceptors.request.use(
  config => {
    // 每次发送请求之前都检测vuex是否存有token,放在请求头发送给服务器
    // Authorization是根据后端自定义字段
    config.headers.Authorization = store.getters.getToken;
    //如果是oss操作直接返回
    if (config.data instanceof FormData) return config


    if (config.method === 'post') {
      config.data = JSON.stringify(config.data);
      config.headers["Content-Type"] = "application/json;charset=UTF-8";
    }

    return config;
  },
  error => {
    console.log("在request拦截器显示错误：", error.response)
    return Promise.reject(error);
  }
);

//respone拦截器
service.interceptors.response.use(
  response => {
    // 在status正确的情况下，code不正确则返回对应的错误信息（后台自定义为200是正确，并且将错误信息写在message），正确则返回响应
    switch (response.data.code) {
      case 0:
        return response
      case 10021:
        //可能是token过期，清除它
        store.commit("delToken");
        storage.remove("store")

        router.replace({ //跳转到登录页面
          path: '/login',
          // 将跳转的路由path作为参数，登录成功后跳转到该路由
          query: {redirect: router.currentRoute.fullPath}
          });
      this.$message.error('登录过期,请重新登录')
        break;
      case 10020:
        router.replace({ //跳转到登录页面
          path: '/login',
          // 将跳转的路由path作为参数，登录成功后跳转到该路由
          query: {redirect: router.currentRoute.fullPath}
        });
        this.$message.error('请先登录')
        break;
      default:
        return Promise.reject(response.data.msg)
    }
  },
  error => {
    // 在status不为200的情况下，判别status状态码给出对应响应
    console.log("拦截到错误", error)

    switch (error.response.status){
      case 0:
        return Promise.reject("请求超时,请重新请求");
      case 403:
        return Promise.reject("输入数据不合法,请重新输入");
      default:
        return Promise.reject(error.message)
    }

  }
);


export default service
