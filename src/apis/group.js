
import request from "../services/request";


// 获取该群的群成员
export function groupMembers(xiuxianUserId,xiuxianGroupId){
  return request({
    url: '/xiuxian-chat/api/xiuxiangroup/contacts',
    method: 'get',
    params:{
      // 具体传参（键）要看后台要求
      "xiuxianUserId":xiuxianUserId,
      "xiuxianGroupId":xiuxianGroupId
    }
  })
}

// 修改群名
export function changGroupName(data){
  return request({
    url: '/xiuxian-chat/api/xiuxiangroup/changegroupname',
    method: 'post',
    data:data
  })
}

//修改朋友的备注信息
export function changeGroupRemark(data){
  return request({
    url: '/xiuxian-chat/api/xiuxianfriend/changeremark',
    method: 'post',
    data:data
  })
}


//邀请加入群聊
export function inviteJoinGroup(data){
  return request({
    url: '/xiuxian-chat/api/xiuxiangroup/invite-join-group',
    method: 'post',
    data:data
  })
}

//将成员移出群聊
export function removeFromGroup(data){
  return request({
    url: '/xiuxian-chat/api/xiuxiangroup/remove-from-group',
    method: 'post',
    data:data
  })
}

//获取成员名字(优先获取备注名，其次获取昵称)
export function getMemberName(fromId,toId,async=true){
  return request({
    url: '/xiuxian-chat/api/xiuxiangroup/member-name',
    async: async,
    method: 'get',
    params:{
      // 具体传参（键）要看后台要求
      "fromId":fromId,
      "toId":toId
    }
  })
}

//获取新加入成员信息
export function getNewMember(selfXiuxianId,memberId){
  return request({
    url: '/xiuxian-chat/api/xiuxiangroup/new-member',
    method: 'get',
    params:{
      // 具体传参（键）要看后台要求
      "selfXiuxianId":selfXiuxianId,
      "memberId":memberId
    }
  })
}
