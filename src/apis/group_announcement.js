
import request from "../services/request";

// 获取该群公告
export function groupAnnouncement(xiuxianGroupId){
  return request({
    url: '/xiuxian-chat/api/xiuxian-group-announcement/group-announcement',
    method: 'get',
    params:{
      "xiuxianGroupId":xiuxianGroupId,
    }
  })
}

// 添加群公告
export function addGroupAnnouncement(data){
  return request({
    url: '/xiuxian-chat/api/xiuxian-group-announcement/group-announcement',
    method: 'post',
    data:data
  })
}

// 查询用户是否已经接受了最新的群消息
export function groupAnnouncementReceived(xiuxianGroupId,xiuxianUserId){
  return request({
    url: '/xiuxian-chat/api/xiuxian-group-announcement/group-announcement/received',
    method: 'get',
    params:{
      "xiuxianGroupId":xiuxianGroupId,
      "xiuxianUserId":xiuxianUserId
    }
  })
}
