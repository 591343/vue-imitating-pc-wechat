import request from "../services/request";  // 前面封装的request

// 在request中，设置了根路径/invoice，所以每一个请求都会自动在前面带上invoice；
// 由于在config中的index配置过了代理（监听）的路径也是/invoice，但凡遇到/invoice路径就会替换为target目标地址（后台接口根地址）
// 实现跨域，即不限于只能访问根路径为127.0.0.1下的地址
export function postLogin(form) {
  return request({
    url: '/renren-api/api/login',
    method: 'post',
    data: {
      // 具体传参（键）要看后台要求
      "mobile": form.username,
      "password": form.password
    }
  })
}

export function postRegister(form) {
  return request({
    url: '/renren-api/api/register',
    method: 'post',
    data: {
      // 具体传参（键）要看后台要求
      "mobile": form.username,
      "password": form.password
    }
  })
}


export function loginOut(userId) {
  return request({
    url: '/renren-api/api/logout',
    method: 'post',
    data: {
      // 具体传参（键）要看后台要求
      "userId": userId
    }
  })

}



