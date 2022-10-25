// 实现websocket通信相关的功能
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import store from "../store";
//搜索相关的api
import request from "../services/request";  // 前面封装的request
import {getChatListItem, updateChatMessageToTimeById} from "./chat.api";
import {addChatList, sendPing} from "./chat.api";
import router from "../router";
import {
  ADD_FRIEND_NOTICE,
  ADD_FRIEND_SUCCESS_NOTICE,
  SEND_MESSAGE_NOTICE,
  WAITING_FOR_RECEIVE_STATUS
} from "../services/constant";
import {searchFriend} from "./search.api";
import {getFriendListItem} from "./friend.api";


let stompClient = null
let tryTimes = 0;//重连次数

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
    //订阅(该路由专门用于心跳检测）
    stompClient.subscribe('/user/' + store.getters.getUser.xiuxianUserId + '/heartbeat', (response) => {
      heartCheck.reset().start(); //心跳检测重置
    });

    // 用户通知消息
    stompClient.subscribe('/user/' + store.getters.getUser.xiuxianUserId + '/notice', (response) => {
      const body = JSON.parse(response.body);
      const noticeMessageType = body.noticeMessageType
      const status = body.status
      const fromId = body.fromId
      const toId = body.toId
      switch (noticeMessageType) {
        //添加好友通知
        case ADD_FRIEND_NOTICE:
          switch (status) {
            case WAITING_FOR_RECEIVE_STATUS:
              searchFriend(fromId).then(res => {
                let data = res.data.data
                let find = store.state.newFriendList.find(newFriend => newFriend.xiuxianUserId === data.xiuxianUserId)

                //对于刚好处于新的朋友页面时
                if (find === undefined) {
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
          console.log(store.state.newFriendList,fromId,find)
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
          getFriendListItem(toId,fromId).then(res=>{
            if(res.data.data!==null){
              let friendListItem=res.data.data
              store.state.friendlist.push(friendListItem)
              getChatListItem(toId,fromId).then(res=>{
                if(!res.data.data) return
                const chatListItem=res.data.data

                let result = store.state.chatlist.find(session => session.friendXiuxianId === fromId);
                //还没添加到聊天列表中,但是对方给我发消息了，先把对方加入聊天列表中

                if (!result) {
                  for (let i = 0; i < store.state.chatlist.length; i++) {
                    store.state.chatlist[i].index++;
                  }
                  store.state.chatlist.unshift(chatListItem)
                  store.state.selectId = fromId
                  router.push({path: '/chat'})
                }
              })

            }
          })
          // TODO 提醒用户
          break;

      }
    });


    // 订阅单聊
    stompClient.subscribe('/user/' + store.getters.getUser.xiuxianUserId + '/chat', (response) => {
      if (response.body) {
        const repObj = JSON.parse(response.body);
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
          if (repObj.chatMessageType === 0) {
            message.content = repObj.content
            message.chatMessageType = repObj.chatMessageType
          } else {
            message.remoteMediaUrl = repObj.remoteMediaUrl
            message.chatMessageType = repObj.chatMessageType
          }
          store.state.chatlist.unshift({
            friendXiuxianId: friend.friendXiuxianId,
            nickname: friend.nickname,
            profile: friend.profile,
            remark: friend.remark,
            type: 0,
            messages: [
              message
            ],
            index: 1
          })
          let chatList = {
            selfXiuxianId: store.getters.getUser.xiuxianUserId,
            friendXiuxianId: repObj.fromId,
            type: 0
          }
          addChatList(chatList)
          store.state.selectId = repObj.fromId
          router.push({path: '/chat'})
        } else {
          if (repObj.chatMessageType === 0) {
            result.messages.push({
              content: repObj.content,
              remoteMediaUrl: "",
              date: fromTime + "",
              chatMessageType: repObj.chatMessageType,
              self: false
            });
          } else {
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
          store.state.chatlist.sort((a,b)=>b.messages[b.messages.length-1].date-a.messages[a.messages.length-1].date)
          for (let i = 0; i < store.state.chatlist.length; i++) {
            store.state.chatlist[i].index=i+1;
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

    //获取群组
    let friendlist = store.state.friendlist.filter(friends => friends.type === 1)

    for (let i = 0; i < friendlist.length; i++) {
      stompClient.subscribe('/topic/info/' + friendlist[i].friendXiuxianId, (response) => {
        if (response.body) {
          let repObj = JSON.parse(response.body);
          // 首次聊天时，不添加空消息
          if (repObj.toTime != null) return;
          //如果是自己发送的就不接收了
          if (repObj.fromId === store.state.user.xiuxianUserId) return;
          const timestamp = new Date().getTime();
          const fromTime = repObj.fromTime
          let result = store.state.chatlist.find(session => session.friendXiuxianId === repObj.toId);
          //还没添加到聊天列表中,但是对方给我发消息了，先把对方加入聊天列表中


          const userFriend = store.state.friendlist.find(friend => friend.friendXiuxianId === repObj.fromId)
          if(userFriend!==undefined){
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
            if (repObj.chatMessageType === 0) {
              message.content = repObj.content
              message.chatMessageType = repObj.chatMessageType
            } else {
              message.remoteMediaUrl = repObj.remoteMediaUrl
              message.chatMessageType = repObj.chatMessageType
            }
            store.state.chatlist.unshift({
              friendXiuxianId: friend.friendXiuxianId,
              nickname: friend.groupName,
              profile: friend.groupProfile,
              remark: friend.remark,
              type: 1,
              messages: [
                message
              ],
              index: 1
            })
            let chatList = {
              selfXiuxianId: store.getters.getUser.xiuxianUserId,
              friendXiuxianId: repObj.toId,
              type: 1
            }
            addChatList(chatList)
            store.state.selectId = repObj.toId
            router.push({path: '/chat'})
          } else {
            if (repObj.chatMessageType === 0) {
              result.messages.push({
                chatUser: repObj.chatUser,
                content: repObj.content,
                remoteMediaUrl: "",
                date: fromTime + "",
                chatMessageType: repObj.chatMessageType,
                self: false
              });
            } else {
              result.messages.push({
                chatUser: repObj.chatUser,
                content: "",
                remoteMediaUrl: repObj.remoteMediaUrl,
                date: fromTime + "",
                chatMessageType: repObj.chatMessageType,
                self: false
              });
            }
            //按消息时间从大到小排列chatlist
            result.messages.sort((a, b) => a.date - b.date)
            store.state.chatlist.sort((a,b)=>b.messages[b.messages.length-1].date-a.messages[a.messages.length-1].date)
            for (let i = 0; i < store.state.chatlist.length; i++) {
              store.state.chatlist[i].index=i+1;
            }
          }

          const id = repObj.id; //消息id
          const data = {
            id: id,
            toTime: timestamp
          }


          // TODO 此处在群聊消息时有大量查询(取决于群中人数)，要进行优化
          updateChatMessageToTimeById(data)

          console.log('websokcket接收群聊消息')
        }
      });
    }
    //订阅群聊

  }, (error) => {
    //连接失败的操作...（该方法非必须）
    console.log(error)
    reconnect();
  });
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

//手动关闭连接
export function disconnect() {
  if (stompClient !== null) {
    stompClient.disconnect();

    stompClient = null;
  }
  //断开连接成功之后的操作...
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





