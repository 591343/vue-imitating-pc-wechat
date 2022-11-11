//通知消息API，用于加入群组，退出群组，添加好友，删除好友

//发送添加好友申请
import request from "../services/request";



export function newFriendNoticeMessage(xiuxianUserId){
  return request({
    url: '/xiuxian-chat/api/xiuxiannoticemessage/newfriend',
    method: 'get',
    params:{
      // 具体传参（键）要看后台要求
      "xiuxianUserId":xiuxianUserId
    }
  })
}

//回复验证消息
export function sendValidMessageToUser(data){
  return request({
    url: '/xiuxian-chat/api/xiuxiannoticemessage/send/validmessage',
    method: 'post',
    data:data
  })
}



