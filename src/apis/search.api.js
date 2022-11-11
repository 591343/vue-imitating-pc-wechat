//搜索相关的api
import request from "../services/request";  // 前面封装的request

// 在request中，设置了根路径/invoice，所以每一个请求都会自动在前面带上invoice；
// 由于在config中的index配置过了代理（监听）的路径也是/invoice，但凡遇到/invoice路径就会替换为target目标地址（后台接口根地址）
// 实现跨域，即不限于只能访问根路径为127.0.0.1下的地址
export function searchFriend(searchId) {
  return request({
    url: '/xiuxian-chat/api/xiuxianuser/friend',
    method: 'get',
    params:{
      // 具体传参（键）要看后台要求
      "xiuxianUserId":searchId,
    }
  })
}

export function searchGroupInfo(searchId){
  return request({
    url: '/xiuxian-chat/api/xiuxiangroup/groupInfo',
    method: 'get',
    params:{
      // 具体传参（键）要看后台要求
      "xiuxianGroupId":searchId,

    }
  })
}

export function searchXiuXianUser(mobile){
  return request({
    url: '/xiuxian-chat/api/xiuxianuser/user',
    method: 'get',
    params:{
      // 具体传参（键）要看后台要求
      "mobile":mobile,
    }
  })
}

export function searchUser(mobile){
  return request({
    url: '/renren-api/api/user/user',
    method: 'get',
    params:{
      // 具体传参（键）要看后台要求
      "mobile":mobile,
    }
  })
}

export function isXiuxianUserExist(xiuxianUserId){
  return request({
    url: '/xiuxian-chat/api/xiuxianuser/user/exist',
    method: 'get',
    params:{
      // 具体传参（键）要看后台要求
      "xiuxianUserId":xiuxianUserId,
    }
  })
}

// 获取该群一共有多少人
export function groupPersonNumber(xiuxianGroupId){
  return request({
    url: '/xiuxian-chat/api/xiuxiangroup/groupnumber',
    method: 'get',
    params:{
      // 具体传参（键）要看后台要求
      "xiuxianGroupId":xiuxianGroupId,
    }
  })
}



