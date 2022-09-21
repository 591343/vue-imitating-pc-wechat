//搜索相关的api
import request from "../services/request";  // 前面封装的request


export function addXiuxianUserInfo(form) {
  return request({
    url: '/xiuxian-chat/api/xiuxianuser/user',
    method: 'post',
    data: form
  })
}
