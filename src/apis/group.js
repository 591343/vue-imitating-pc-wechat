
import request from "../services/request";


// 获取该群的群成员
export function groupMembers(xiuxianGroupId){
  return request({
    url: '/xiuxian-chat/api/xiuxiangroup/contacts',
    method: 'get',
    params:{
      // 具体传参（键）要看后台要求
      "xiuxianGroupId":xiuxianGroupId,
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
