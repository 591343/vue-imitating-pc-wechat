// 实现websocket通信相关的功能
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import store from "../store";
//搜索相关的api
import request from "../services/request"; // 前面封装的request
import {addChatList, getChatListItem, sendPing, updateChatMessageToTimeById} from "./chat.api";
import router from "../router";
import {
  ADD_FRIEND_NOTICE,
  ADD_FRIEND_SUCCESS_NOTICE,
  FRIEND_TYPE,
  GROUP_TYPE,
  IMAGE_CHAT_MESSAGE_TYPE,
  INVITE_JOIN_GROUP_NOTICE,
  REMOVE_FROM_GROUP_NOTICE,
  SEND_MESSAGE_NOTICE,
  SOMEONE_JOIN_GROUP_NOTICE,
  SOMEONE_REMOVE_GROUP_NOTICE,
  SUB_MESSAGE_GROUP_MEMBER_ADD,
  SUB_MESSAGE_GROUP_MEMBER_REMOVE,
  SUB_MESSAGE_TYPE,
  TEXT_CHAT_MESSAGE_TYPE,
  WAITING_FOR_RECEIVE_STATUS
} from "../services/constant";
import {searchFriend} from "./search.api";
import {getFriendListItem, getGroupListItem} from "./friend.api";
import {getMemberName, getNewMember} from "./group"
import Vue from "vue";


let stompClient = null
let tryTimes = 0 //重连次数
let channels = {} //管理每个连接通道
export function connect() {
  console.log('CONNECT>>>')
  let url = request.getUri() + "/xiuxian-websocket/ws" + "?token=" + store.getters.getToken
  let socket = new SockJS(url, null, {
    timeout: 10000
  });//连接SockJS的endpoint名称为"bullet"

  console.log('socket连接地址：' + url);
// 获取STOMP子协议的客户端对象
  stompClient = Stomp.over(socket);
// 定义客户端的认证信息,按需求配置
  let headers = {
    Authorization: store.getters.getToken
  };
  stompClient.connect(headers, () => {
    heartCheck.reset().start(); //开始心跳检测
    tryTimes = 0;//重置重连次数
    console.log('connect')
    //获取群组
    let friendlist = store.state.friendlist.filter(friends => friends.type === GROUP_TYPE)
    //订阅(该路由专门用于心跳检测)
    stompClient.subscribe('/user/' + store.getters.getUser.xiuxianUserId + '/heartbeat', (response) => {
      heartCheck.reset().start(); //心跳检测重置
    });

    // 用户通知消息
    stompClient.subscribe('/user/' + store.getters.getUser.xiuxianUserId + '/notice', (response) => {
      const body = JSON.parse(response.body);
      const noticeMessageType = body.noticeMessageType
      const messageId = body.id
      const status = body.status
      const fromId = body.fromId
      const toId = body.toId
      if (isMessageRepeat(messageId)) {
        return;
      }
      switch (noticeMessageType) {
        //添加好友通知
        case ADD_FRIEND_NOTICE:
          switch (status) {
            case WAITING_FOR_RECEIVE_STATUS:
              searchFriend(fromId).then(res => {
                let data = res.data.data
                let find = store.state.newFriendList.find(newFriend => newFriend.xiuxianUserId === data.xiuxianUserId)

                //对于刚好处于新的朋友页面时
                if (!find) {
                  store.state.newFriendList.push({
                    id: body.id,
                    fromId: fromId,
                    nickname: data.nickname,
                    profile: data.profile,
                    status: status,
                    noticeTime: body.noticeTime + "",
                    messages: [
                      {
                        content: body.content,
                        date: body.noticeTime + "",
                        self: false
                      }
                    ]
                  })
                  console.log('newFriendList', store.state.newFriendList)
                }
              }).catch(error => {
                  console.log(error)
                }
              )
          }

          // TODO 提醒用户
          break;
        case SEND_MESSAGE_NOTICE:  //消息验证通知
          let find = store.state.newFriendList.find(newFriend => newFriend.fromId === fromId)
          console.log(store.state.newFriendList, fromId, find)
          if (find !== undefined) {
            find.messages.push({
              content: body.content,
              date: body.noticeTime + "",
              self: false
            })
            find.messages.sort((a, b) => b.date - a.date)
          }

          // TODO 提醒用户
          break;
        case ADD_FRIEND_SUCCESS_NOTICE: //添加好友申请成功通知
          getFriendListItem(toId, fromId).then(res => {
            if (res.data.data !== null) {
              let friend = store.state.friendlist.find(friend => friend.friendXiuxianId === fromId)
              if (!friend) {
                let friendListItem = res.data.data
                store.state.friendlist.push(friendListItem)
                let result = store.state.chatlist.find(session => session.friendXiuxianId === fromId)
                if (!result) {
                  getChatListItem(toId, fromId).then(res => {
                    if (!res.data.data) return
                    const chatListItem = res.data.data
                    //还没添加到聊天列表中,但是对方给我发消息了，先把对方加入聊天列表中
                    for (let i = 0; i < store.state.chatlist.length; i++) {
                      store.state.chatlist[i].index++;
                    }
                    store.state.chatlist.unshift(chatListItem)
                    store.state.selectId = fromId
                    router.push({path: '/chat'})
                  })
                }
              }

            }
          })
          // TODO 提醒用户
          break;
        case INVITE_JOIN_GROUP_NOTICE:
          let group = store.state.friendlist.find(friend => friend.friendXiuxianId === fromId)
          console.log('INVITE_JOIN_GROUP_NOTICE',group)
          if (!group) {
            getGroupListItem(toId, fromId).then(res => {
              if (res.data.data != null) {
                //订阅群聊的聊天消息通道和通知消息通道
                addSubscribe(res.data.data.friendXiuxianId)

                let friendListItem = res.data.data
                store.state.friendlist.push(
                  friendListItem
                )
                let result = store.state.chatlist.find(session => session.friendXiuxianId === fromId)
                getChatListItem(toId, fromId).then(res => {
                  if (!res.data.data) return
                  const chatListItem = res.data.data
                  //还没添加到聊天列表中,但是对方给我发消息了，先把对方加入聊天列表中
                  for (let i = 0; i < chatListItem.messages.length; i++) {
                    store.state.messageRepeatSet[chatListItem.messages[i].id] = true
                  }
                  if (result !== undefined) {
                    for (let i = 0; i < store.state.chatlist.length; i++) {
                      //如果有存在的群聊则删除掉
                      if (store.state.chatlist[i].friendXiuxianId === fromId) {
                        store.state.chatlist.splice(i, 1)
                        break
                      }
                    }
                  }
                  for (let i = 0; i < store.state.chatlist.length; i++) {
                    store.state.chatlist[i].index++;
                  }
                  store.state.chatlist.unshift(chatListItem)
                })
              }

            }).catch(err => {
              Vue.prototype.$message.error('获取群聊失败,请刷新页面重新获取')
            })
          } else {
            //订阅群聊的聊天消息通道和通知消息通道
            addSubscribe(group.friendXiuxianId)
          }

          break;
        case REMOVE_FROM_GROUP_NOTICE:
          if (store.state.groupMembers.hasOwnProperty(fromId)) {
            delete store.state.groupMembers.fromId
          }
          for(let i=0;i<store.state.friendlist.length;i++) {
            const friendXiuxianId = store.state.friendlist[i].friendXiuxianId
            if (friendXiuxianId === fromId) {
              store.state.friendlist.splice(i, 1)
              break
            }
          }
          break

      }
    });
    // 订阅群聊通知消息
    for (let i = 0; i < friendlist.length; i++) {
      channels['/topic/notice/' + friendlist[i].friendXiuxianId] = stompClient.subscribe('/topic/notice/' + friendlist[i].friendXiuxianId, (response) => {
        groupNoticeSubscribe(response)
      }, (error) => {
        //连接失败的操作...（该方法非必须）
        console.log(error)
        reconnect();
      })
    }
    // 订阅单聊
    stompClient.subscribe('/user/' + store.getters.getUser.xiuxianUserId + '/chat', (response) => {
      if (response.body) {
        const repObj = JSON.parse(response.body);
        const messageId = repObj.id
        if (isMessageRepeat(messageId)) {
          return;
        }
        // 首次聊天时，不添加空消息
        if (repObj.toTime != null) return;

        const timestamp = new Date().getTime();
        const fromTime = repObj.fromTime
        let result = store.state.chatlist.find(session => session.friendXiuxianId === repObj.fromId);
        //还没添加到聊天列表中,但是对方给我发消息了，先把对方加入聊天列表中
        if (!result) {

          let friend = store.state.friendlist.find(friend => friend.friendXiuxianId === repObj.fromId)
          for (let i = 0; i < store.state.chatlist.length; i++) {
            store.state.chatlist[i].index++;
          }

          let message = {
            content: '',
            remoteMediaUrl: '',
            date: fromTime + "",
            self: false
          }
          if (repObj.chatMessageType === TEXT_CHAT_MESSAGE_TYPE) {
            message.content = repObj.content
            message.chatMessageType = repObj.chatMessageType
          } else if (repObj.chatMessageType === IMAGE_CHAT_MESSAGE_TYPE) {
            message.remoteMediaUrl = repObj.remoteMediaUrl
            message.chatMessageType = repObj.chatMessageType
          }
          store.state.chatlist.unshift({
            friendXiuxianId: friend.friendXiuxianId,
            nickname: friend.nickname,
            profile: friend.profile,
            remark: friend.remark,
            type: FRIEND_TYPE,
            messages: [
              message
            ],
            index: 1
          })
          let chatList = {
            selfXiuxianId: store.getters.getUser.xiuxianUserId,
            friendXiuxianId: repObj.fromId,
            type: FRIEND_TYPE,
            startTime: fromTime
          }
          addChatList(chatList)
          store.state.selectId = repObj.fromId
          router.push({path: '/chat'})
        } else {
          if (repObj.chatMessageType === TEXT_CHAT_MESSAGE_TYPE) {
            result.messages.push({
              content: repObj.content,
              remoteMediaUrl: "",
              date: fromTime + "",
              chatMessageType: repObj.chatMessageType,
              self: false
            });
          } else if (repObj.chatMessageType === IMAGE_CHAT_MESSAGE_TYPE) {

            result.messages.push({
              content: "",
              remoteMediaUrl: repObj.remoteMediaUrl,
              date: fromTime + "",
              chatMessageType: repObj.chatMessageType,
              self: false
            });
          }

          result.messages.sort((a, b) => a.date - b.date)
          //按消息时间从大到小排列chatlist
          store.state.chatlist.sort((a, b) => b.messages[b.messages.length - 1].date - a.messages[a.messages.length - 1].date)
          for (let i = 0; i < store.state.chatlist.length; i++) {
            store.state.chatlist[i].index = i + 1;
          }
        }

        const id = repObj.id; //消息id
        const data = {
          id: id,
          toTime: timestamp
        }

        updateChatMessageToTimeById(data)
        console.log('websokcket接收单聊消息')
      }
    });

    //订阅群聊
    for (let i = 0; i < friendlist.length; i++) {
      channels['/topic/notice/' + friendlist[i].friendXiuxianId] = stompClient.subscribe('/topic/info/' + friendlist[i].friendXiuxianId, (response) => {
        groupChatSubscribe(response)
      }, (error) => {
        //连接失败的操作...（该方法非必须）
        console.log(error)
        reconnect();
      });

    }
  })

}


function addSubscribe(friendXiuxianId){
  const chatChannelName='/topic/info/' + friendXiuxianId
  if (!channels.hasOwnProperty(chatChannelName)) {
    channels[chatChannelName] = stompClient.subscribe(chatChannelName, (response) => {
      groupChatSubscribe(response)
    }, (error) => {
      //连接失败的操作...（该方法非必须）
      console.log(error)
      reconnect();
    })
  }
  const noticeChannelName='/topic/notice/' + friendXiuxianId
  if (!channels.hasOwnProperty(noticeChannelName)) {
    channels[noticeChannelName] = stompClient.subscribe(noticeChannelName, (response) => {
      groupNoticeSubscribe(response)
    }, (error) => {
      //连接失败的操作...（该方法非必须）
      console.log(error)
      reconnect();
    })
  }

}
function groupNoticeSubscribe(response){
  const body = JSON.parse(response.body);
  const noticeMessageType = body.noticeMessageType
  const messageId = body.id
  const status = body.status
  const content = body.content
  const fromId = body.fromId
  const toId = body.toId

  if (isMessageRepeat(messageId)) {

    return;
  }
  switch (noticeMessageType) {
    case SOMEONE_JOIN_GROUP_NOTICE:
      // 邀请朋友加入群聊发起人修仙号
      if (content === store.state.user.xiuxianUserId) break
      //添加新成员信息
      if (store.state.groupMembers.hasOwnProperty(toId) && store.state.groupMembers[toId].hasOwnProperty('xiuxianUsers')) {
        let member = store.state.groupMembers[toId].xiuxianUsers.find(member => member.xiuxianUsers === fromId)
        //防止重复添加
        if (!member) {
          getNewMember(store.state.user.xiuxianUserId, fromId).then(res => {
            if (res.data.data != null) {
              const groupNumber = store.state.groupMembers[toId].xiuxianUsers.length
              store.dispatch('actionAddGroupMembers', {
                xiuxianGroupId: toId,
                membersList: [fromId]
              })
              const memberNumber = groupNumber + 1
              store.dispatch('actionSetGroupNumber', {
                xiuxianGroupId: toId,
                number: memberNumber
              })
            }
          })
        }
      } else {
        let group = store.state.friendlist.find(friend => friend.friendXiuxianId === toId);
        if (group !== undefined) {
          const memberNumber = group.number + 1

          store.dispatch('actionSetGroupNumber', {
            xiuxianGroupId: toId,
            number: memberNumber
          })
        }
      }
      break
    case SOMEONE_REMOVE_GROUP_NOTICE:
      if (content === store.state.user.xiuxianUserId) break

      if (store.state.groupMembers.hasOwnProperty(toId) && store.state.groupMembers[toId].hasOwnProperty('xiuxianUsers')) {
        let member = store.state.groupMembers[toId].xiuxianUsers.find(member => member.xiuxianUsers === fromId)
        //防止重复添加
        if (!member) {
          const groupNumber = store.state.groupMembers[toId].xiuxianUsers.length
          store.dispatch('actionRemoveGroupMembers', {
            xiuxianGroupId: toId,
            membersList: [fromId]
          })
          const memberNumber = groupNumber - 1
          store.dispatch('actionSetGroupNumber', {
            xiuxianGroupId: toId,
            number: memberNumber
          })
        }
      } else {
        let group = store.state.chatlist.find(session => session.friendXiuxianId === toId);

        if (group !== undefined) {
          const memberNumber = group.number - 1

          store.dispatch('actionSetGroupNumber', {
            xiuxianGroupId: toId,
            number: memberNumber
          })
        }
      }
      if (store.state.user.xiuxianUserId === fromId) {
        const channelName = '/topic/notice/' + toId
        if (channels.hasOwnProperty(channelName)) {
          //关闭群聊通知消息通道

          channels[channelName].unsubscribe()
          delete channels[channelName]
        }
      }
      break
  }
}
function groupChatSubscribe(response) {
  if (response.body) {

    let repObj = JSON.parse(response.body);
    const messageId = repObj.id

    if (isMessageRepeat(messageId)) {
      return;
    }

    // 首次聊天时，不添加空消息
    if (repObj.toTime != null) return;
    //如果是自己发送的就不接收了
    if (repObj.fromId === store.state.user.xiuxianUserId && repObj.chatMessageType !== SUB_MESSAGE_TYPE) return;
    const timestamp = new Date().getTime();
    const fromTime = repObj.fromTime
    let result = store.state.chatlist.find(session => session.friendXiuxianId === repObj.toId);
    //还没添加到聊天列表中,但是对方给我发消息了，先把对方加入聊天列表中


    const userFriend = store.state.friendlist.find(friend => friend.friendXiuxianId === repObj.fromId)
    if (userFriend !== undefined && repObj.chatMessageType !== SUB_MESSAGE_TYPE) {
      repObj.chatUser.remark = userFriend.remark
    }
    if (!result) {
      const friend = store.state.friendlist.find(friend => friend.friendXiuxianId === repObj.toId)
      for (let i = 0; i < store.state.chatlist.length; i++) {
        store.state.chatlist[i].index++;
      }

      let message = {
        chatUser: repObj.chatUser,
        content: '',
        remoteMediaUrl: '',
        date: fromTime + "",
        self: false
      }
      if (repObj.chatMessageType === TEXT_CHAT_MESSAGE_TYPE) {
        message.content = repObj.content
        message.chatMessageType = repObj.chatMessageType
      } else if (repObj.chatMessageType === IMAGE_CHAT_MESSAGE_TYPE) {
        message.remoteMediaUrl = repObj.remoteMediaUrl
        message.chatMessageType = repObj.chatMessageType
      } else if (repObj.chatMessageType === SUB_MESSAGE_TYPE) {
        message.content = repObj.content
        message.chatMessageType = repObj.chatMessageType

      }
      store.state.chatlist.unshift({
        friendXiuxianId: friend.friendXiuxianId,
        nickname: friend.groupName,
        profile: friend.groupProfile,
        remark: friend.remark,
        type: GROUP_TYPE,
        messages: [
          message
        ],
        index: 1
      })

      if (repObj.chatMessageType === SUB_MESSAGE_TYPE) {
        let find = store.state.chatlist.find(session => session.friendXiuxianId === repObj.toId);

        if (find !== undefined) {
          const timestamp = fromTime + ""
          for (let i = find.messages.length - 1; i >= 0; i--) {
            if (find.messages[i].date === timestamp) {
              showSubMessage(repObj.toId, repObj.content, i)
              break
            }
          }
        }
      }
      let chatList = {
        selfXiuxianId: store.getters.getUser.xiuxianUserId,
        friendXiuxianId: repObj.toId,
        type: GROUP_TYPE,
        startTime: fromTime
      }
      addChatList(chatList)
      store.state.selectId = repObj.toId
      router.push({path: '/chat'})
    } else {
      if (repObj.chatMessageType === TEXT_CHAT_MESSAGE_TYPE) {
        result.messages.push({
          chatUser: repObj.chatUser,
          content: repObj.content,
          remoteMediaUrl: "",
          date: fromTime + "",
          chatMessageType: repObj.chatMessageType,
          self: false
        });
      } else if (repObj.chatMessageType === IMAGE_CHAT_MESSAGE_TYPE) {
        result.messages.push({
          chatUser: repObj.chatUser,
          content: "",
          remoteMediaUrl: repObj.remoteMediaUrl,
          date: fromTime + "",
          chatMessageType: repObj.chatMessageType,
          self: false
        });
      } else if (repObj.chatMessageType === SUB_MESSAGE_TYPE) {

        result.messages.push({
          chatUser: {},
          content: repObj.content,
          remoteMediaUrl: "",
          date: fromTime + "",
          chatMessageType: repObj.chatMessageType,
          self: false
        });
      }
      //按消息时间从大到小排列chatlist
      result.messages.sort((a, b) => a.date - b.date)
      if (repObj.chatMessageType === SUB_MESSAGE_TYPE) {
        const timestamp = fromTime + ""
        for (let i = result.messages.length - 1; i >= 0; i--) {
          if (result.messages[i].date === timestamp) {
            showSubMessage(repObj.toId, repObj.content, i)
            break
          }
        }
      }
      store.state.chatlist.sort((a, b) => b.messages[b.messages.length - 1].date - a.messages[a.messages.length - 1].date)
      for (let i = 0; i < store.state.chatlist.length; i++) {
        store.state.chatlist[i].index = i + 1;
      }


      //进行判断并关闭通道
      if (repObj.chatMessageType === SUB_MESSAGE_TYPE) {
        let split = repObj.content.split("-")
        const subMessageFunctionType = parseInt(split[0])
        if (subMessageFunctionType === SUB_MESSAGE_GROUP_MEMBER_REMOVE) {
          const removeMemberXixuianUserId = split[2]
          if (store.state.user.xiuxianUserId === removeMemberXixuianUserId) {
            const channelName = '/topic/info/' + repObj.toId
            if (channels.hasOwnProperty(channelName)) {
              //关闭群聊通知消息通道
              channels[channelName].unsubscribe()
              delete channels[channelName]
            }
          }
        }
      }
    }

    const id = repObj.id; //消息id
    const data = {
      id: id,
      toTime: timestamp
    }
    // TODO 此处在群聊消息时有大量查询(取决于群中人数)，要进行优化
    // updateChatMessageToTimeById(data)

    console.log('websokcket接收群聊消息')
  }
}
function reconnect() {
  if (tryTimes > 10) {
    alert("重连次数以达上限 连接失败")
    return;
  }
  setTimeout(function () { //没连接上会一直重连，设置延迟避免请求过多
    connect();
  }, 3000);
}

//判断消息是否重复接收
function isMessageRepeat(messageId) {

  if (store.state.messageRepeatSet.hasOwnProperty(messageId)) {
    return true
  }
  store.state.messageRepeatSet[messageId] = true
  return false
}

//手动关闭连接
export function disconnect() {
  if (stompClient !== null) {
    stompClient.disconnect();

    stompClient = null;
  }
  //断开连接成功之后的操作...
}

async function showSubMessage(sessionId, content, messageIndex) {

  let split = content.split("-")
  const subMessageFunctionType = parseInt(split[0])
  let message = ''
  switch (subMessageFunctionType) {
    case SUB_MESSAGE_GROUP_MEMBER_ADD || SUB_MESSAGE_GROUP_MEMBER_REMOVE:
      if (split[1] === store.state.user.xiuxianUserId) {
        const res = await getMemberName(store.state.user.xiuxianUserId, split[2], false)
        if (res.data.data != null) {
          if (subMessageFunctionType === SUB_MESSAGE_GROUP_MEMBER_ADD) {
            message = '你邀请"' + res.data.data + '"加入了群聊'
          } else if (subMessageFunctionType === SUB_MESSAGE_GROUP_MEMBER_REMOVE) {
            message = '你将"' + res.data.data + '"移出了群聊'
          }

        }
      } else if (split[2] === store.state.user.xiuxianUserId) {
        const res = await getMemberName(store.state.user.xiuxianUserId, split[1], false)
        if (res.data.data != null) {
          if (subMessageFunctionType === SUB_MESSAGE_GROUP_MEMBER_ADD) {
            message = '你被"' + res.data.data + '"邀请加入了群聊'
          } else if (subMessageFunctionType === SUB_MESSAGE_GROUP_MEMBER_REMOVE) {
            message = '你被"' + res.data.data + '"移出了群聊'
          }

        }
      } else {
        let name1 = ''
        let name2 = ''
        const res1 = await getMemberName(store.state.user.xiuxianUserId, split[1], false)
        if (res1.data.data != null) {
          name1 = res1.data.data
        }
        const res2 = await getMemberName(store.state.user.xiuxianUserId, split[2], false)
        if (res2.data.data != null) {
          name2 = res2.data.data
        }
        if (name1 != null && name2 != null) {
          if (subMessageFunctionType === SUB_MESSAGE_GROUP_MEMBER_ADD) {
            message = '"' + name1 + '"邀请"' + name2 + '"加入了群聊'
          } else if (subMessageFunctionType === SUB_MESSAGE_GROUP_MEMBER_REMOVE) {
            message = '"' + name1 + '"将"' + name2 + '"移出了群聊'
          }
        }
      }
      break
  }

  if (message !== '') {
    let value = {
      selectId: sessionId,
      content: message,
      index: messageIndex
    }
    await store.dispatch('actionSetChatMessage', value)
  }
}


//心跳检测与重连
var heartCheck = {
  timeout: 10000, //10s发一次心跳
  timeoutObj: null,
  serverTimeoutObj: null,
  reset: function () {
    clearTimeout(this.timeoutObj);//清除定时任务
    clearTimeout(this.serverTimeoutObj);
    return this;
  },
  start: function () {
    var self = this;
    this.timeoutObj = setTimeout(function () {
      //这里发送一个心跳到后端指定路由，后端该路径收到将再发一条消息到前端指定路由，从而完成一次交互（消息content可以为空 只要能到达路由就可以）
      sendPing({
        'fromId': store.getters.getUser.xiuxianUserId
      })


      //如果超过一定时间还没重置才会执行到这，说明后端主动断开了
      self.serverTimeoutObj = setTimeout(function () {
        disconnect();
        connect();
      }, self.timeout)
    }, this.timeout)
  }
}





