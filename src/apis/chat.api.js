import request from "../services/request";  // 前面封装的request

// 在request中，设置了根路径/invoice，所以每一个请求都会自动在前面带上invoice；
// 由于在config中的index配置过了代理（监听）的路径也是/invoice，但凡遇到/invoice路径就会替换为target目标地址（后台接口根地址）
// 实现跨域，即不限于只能访问根路径为127.0.0.1下的地址

export function getChatList(selfXiuxianId){
  return request({
    url: '/xiuxian-chat/api/xiuxianchatlist/chatlist',
    method: 'get',
    params:{
      // 具体传参（键）要看后台要求
      "selfXiuxianId":selfXiuxianId,
    }
  })
}

export function getChatListItem(selfXiuxianId,friendXiuxianId){
  return request({
    url: '/xiuxian-chat/api/xiuxianchatlist/chatlistitem',
    method: 'get',
    params:{
      // 具体传参（键）要看后台要求
      "selfXiuxianId":selfXiuxianId,
      "friendXiuxianId":friendXiuxianId
    }
  })
}

export function addChatList(chatList){
  return request({
    url: '/xiuxian-chat/api/xiuxianchalist/chatlist',
    method: 'post',
    data:chatList
  })
}


export function sendSingleChat(chatMessage){
  return request({
    url: '/xiuxian-websocket/api/ws/sendMsgToUser',
    method: 'post',
    data:chatMessage
  })
}

export function sendGroupChat(chatMessage){
  return request({
    url: '/xiuxian-websocket/api/ws/sendMsgToGroup',
    method: 'post',
    data:chatMessage
  })
}

//通过聊天消息id去更新聊天消息的接收时间
export function updateChatMessageToTimeById(data){
  return request({
    url: '/xiuxian-chat/api/xiuxianchatmessage/chatmessage',
    method: 'post',
    data:data
  })
}

//通过聊天消息id去更新聊天消息的接收时间
export function sendPing(data){
  return request({
    url: '/xiuxian-websocket/api/ws/heartbeatCheck',
    method: 'post',
    data:data
  })
}


