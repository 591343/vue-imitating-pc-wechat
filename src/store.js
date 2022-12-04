import Vue from 'vue'
import Vuex from 'vuex'
import router from './router'
import storage from "./utils/storage";
import {addChatList, sendGroupChat, sendSingleChat} from "./apis/chat.api";
import {getFriendsByFromIdAndToId} from "./apis/friend.api";
import {FRIEND_TYPE, GROUP_TYPE, IMAGE_CHAT_MESSAGE_TYPE, TEXT_CHAT_MESSAGE_TYPE} from "./services/constant";


Vue.use(Vuex)


const state = {
  // 存储token
  token: "",
  userName: "", // 记录的登录时的手机号
  // 输入的搜索值
  searchText: '',
  friendSearchText: '',//专门在穿梭框中搜索朋友
  memberSearchText: '',//群成员搜索
  // 当前登录用户
  user: {
    xiuxianUserId: '',
    profile: '',
    nickname: '',
    signature: '',
    sex: 1,
    area: ''
  },
  // 对话好友列表
  chatlist: [],
  // 好友列表
  friendlist: [],
  // 群成员缓存
  groupMembers: {},
  // 新的朋友列表
  newFriendList: [],

  // 用于处理消息重复的集合，上线后就初始化，在接受消息的过程中，通过消息Id来判断是否重复，以此避免消息重复
  messageRepeatSet:{},

  //emoji表情
  emojis: [
    {file: '100.gif', code: '/::)', title: '微笑', reg: /\/::\)/g},
    {file: '101.gif', code: '/::~', title: '伤心', reg: /\/::~/g},
    {file: '102.gif', code: '/::B', title: '美女', reg: /\/::B/g},
    {file: '103.gif', code: '/::|', title: '发呆', reg: /\/::\|/g},
    {file: '104.gif', code: '/:8-)', title: '墨镜', reg: /\/:8-\)/g},
    {file: '105.gif', code: '/::<', title: '哭', reg: /\/::</g},
    {file: '106.gif', code: '/::$', title: '羞', reg: /\/::\$/g},
    {file: '107.gif', code: '/::X', title: '哑', reg: /\/::X/g},
    {file: '108.gif', code: '/::Z', title: '睡', reg: /\/::Z/g},
    {file: '109.gif', code: '/::\'(', title: '哭', reg: /\/::'\(/g},
    {file: '110.gif', code: '/::-|', title: '囧', reg: /\/::-\|/g},
    {file: '111.gif', code: '/::@', title: '怒', reg: /\/::@/g},
    {file: '112.gif', code: '/::P', title: '调皮', reg: /\/::P/g},
    {file: '113.gif', code: '/::D', title: '笑', reg: /\/::D/g},
    {file: '114.gif', code: '/::O', title: '惊讶', reg: /\/::O/g},
    {file: '115.gif', code: '/::(', title: '难过', reg: /\/::\(/g},
    {file: '116.gif', code: '/::+', title: '酷', reg: /\/::\+/g},
    {file: '117.gif', code: '/:--b', title: '汗', reg: /\/:--b/g},
    {file: '118.gif', code: '/::Q', title: '抓狂', reg: /\/::Q/g},
    {file: '119.gif', code: '/::T', title: '吐', reg: /\/::T/g},
    {file: '120.gif', code: '/:,@P', title: '笑', reg: /\/:,@P/g},
    {file: '121.gif', code: '/:,@-D', title: '快乐', reg: /\/:,@-D/g},
    {file: '122.gif', code: '/::d', title: '奇', reg: /\/::d/g},
    {file: '123.gif', code: '/:,@o', title: '傲', reg: /\/:,@o/g},
    {file: '124.gif', code: '/::g', title: '饿', reg: /\/::g/g},
    {file: '125.gif', code: '/:|-)', title: '累', reg: /\/:\|-\)/g},
    {file: '126.gif', code: '/::!', title: '吓', reg: /\/::!/g},
    {file: '127.gif', code: '/::L', title: '汗', reg: /\/::L/g},
    {file: '128.gif', code: '/::>', title: '高兴', reg: /\/::>/g},
    {file: '129.gif', code: '/::,@', title: '闲', reg: /\/::,@/g},
    {file: '130.gif', code: '/:,@f', title: '努力', reg: /\/:,@f/g},
    {file: '131.gif', code: '/::-S', title: '骂', reg: /\/::-S/g},
    {file: '133.gif', code: '/:,@x', title: '秘密', reg: /\/:,@x/g},
    {file: '134.gif', code: '/:,@@', title: '乱', reg: /\/:,@@/g},
    {file: '135.gif', code: '/::8', title: '疯', reg: /\/::8/g},
    {file: '136.gif', code: '/:,@!', title: '哀', reg: /\/:,@!/g},
    {file: '137.gif', code: '/:!!!', title: '鬼', reg: /\/:!!!/g},
    {file: '138.gif', code: '/:xx', title: '打击', reg: /\/:xx/g},
    {file: '139.gif', code: '/:bye', title: 'bye', reg: /\/:bye/g},
    {file: '142.gif', code: '/:handclap', title: '鼓掌', reg: /\/:handclap/g},
    {file: '145.gif', code: '/:<@', title: '什么', reg: /\/:<@/g},
    {file: '147.gif', code: '/::-O', title: '累', reg: /\/::-O/g},
    {file: '153.gif', code: '/:@x', title: '吓', reg: /\/:@x/g},
    {file: '155.gif', code: '/:pd', title: '刀', reg: /\/:pd/g},
    {file: '156.gif', code: '/:<W>', title: '水果', reg: /\/:<W>/g},
    {file: '157.gif', code: '/:beer', title: '酒', reg: /\/:beer/g},
    {file: '158.gif', code: '/:basketb', title: '篮球', reg: /\/:basketb/g},
    {file: '159.gif', code: '/:oo', title: '乒乓', reg: /\/:oo/g},
    {file: '195.gif', code: '/:circle', title: '跳舞', reg: /\/:circle/g},
    {file: '160.gif', code: '/:coffee', title: '咖啡', reg: /\/:coffee/g}
  ],
  // 得知当前选择的是哪个对话
  selectId: '',
  // 得知当前选择的是哪个好友 为-1是要查找好友或群组 ,为0时是新的朋友,大于0则是其它好友
  selectFriendId: 0,

  // 得知当前选择的是哪个待验证好友Id
  selectValidId: '',
}

const mutations = {
  // 修改token，并将token存入localStorage
  setToken(state, token) {
    state.token = token;
    storage.set('token', token);

  },
  delToken(state) {
    state.token = "";
    storage.remove("token");
  },
  // 可选
  setUserInfo(state, userName) {
    state.userName = userName;
  },
  setUser(state, user) {
    state.user = user
  },
  setupGroupName(state, value) {
    for (let i = 0; i < state.friendlist.length; i++) {
      if (state.friendlist[i].friendXiuxianId === value.xiuxianGroupId) {

        Vue.set(state.friendlist[i], 'groupName', value.groupName)
        break
      }
    }
  },
  setGroupNumber(state,value){
    for (let i = 0; i < state.friendlist.length; i++) {
      if (state.friendlist[i].friendXiuxianId === value.xiuxianGroupId) {
        Vue.set(state.friendlist[i], 'number', value.number)
        break
      }
    }
    for (let i = 0; i < state.chatlist.length; i++) {
      if (state.chatlist[i].friendXiuxianId === value.xiuxianGroupId) {
        Vue.set(state.chatlist[i], 'number', value.number)
        break
      }
    }
  },
  setGroupMember(state, value) {
    const xiuxianGroupId = value.xiuxianGroupId
    let announcement = undefined
    if (state.groupMembers.hasOwnProperty(xiuxianGroupId) && state.groupMembers[xiuxianGroupId].hasOwnProperty('announcement')) {
      announcement = state.groupMembers[xiuxianGroupId].announcement
    }
    Vue.set(state.groupMembers, xiuxianGroupId, value)
    if (announcement !== undefined) {
      Vue.set(state.groupMembers[xiuxianGroupId], 'announcement', announcement)
    }
  },
  addGroupMembers(state,value) {
    const xiuxianGroupId = value.xiuxianGroupId
    const membersList= value.membersList
    let xiuxianUsers = state.groupMembers[xiuxianGroupId].xiuxianUsers
    xiuxianUsers.push(...membersList)
    Vue.set(state.groupMembers[xiuxianGroupId], 'xiuxianUsers', xiuxianUsers)
  },

  removeGroupMembers(state,value){
    const xiuxianGroupId = value.xiuxianGroupId
    const membersList= value.membersList
    let xiuxianUsers = state.groupMembers[xiuxianGroupId].xiuxianUsers

    if(xiuxianUsers!==undefined){
      for(let i=xiuxianUsers.length-1;i>=0;i--){
        if(membersList.indexOf(xiuxianUsers[i].xiuxianUserId)!==-1){
          xiuxianUsers.splice(i,1)
        }
      }

      Vue.set(state.groupMembers[xiuxianGroupId], 'xiuxianUsers', xiuxianUsers)
    }
  }
  ,
  setGroupAnnouncement(state, value) {
    const xiuxianGroupId = value.xiuxianGroupId
    if (state.groupMembers[xiuxianGroupId] === undefined) {
      Vue.set(state.groupMembers, xiuxianGroupId, {
        announcement: value
      })
      // state.groupMembers[xiuxianGroupId] = {
      //   announcement: value
      // }
    } else {
      Vue.set(state.groupMembers[xiuxianGroupId], 'announcement', value)
      // state.groupMembers[xiuxianGroupId].announcement = value
    }
  },
  setGroupAnnouncementNotificationBarShowed(state, value) {
    const xiuxianGroupId = value.xiuxianGroupId
    Vue.set(state.groupMembers[xiuxianGroupId].announcement, 'showed', value.showed)
  },

  setChatMessage(state,value){
    for(let i =0;i<state.chatlist.length;i++){
      if(state.chatlist[i].friendXiuxianId===value.selectId){
        Vue.set(state.chatlist[i].messages[value.index],'content',value.content)
        break
      }
    }
  },


  // 从localStorage 中获取数据
  initData(state) {
    let data = localStorage.getItem('vue-chat');
    if (data) {
      state.chatlist = JSON.parse(data);
    }
  },
  // 获取搜索值
  search(state, value) {
    state.searchText = value
  },
  searchFriend(state, value) {
    state.friendSearchText = value
  },
  searchGroupMember(state, value) {
    state.memberSearchText = value
  },
  // 得知用户当前选择的是哪个对话。便于匹配对应的对话框
  selectSession(state, value) {
    state.selectId = value
  },
  // 得知用户当前选择的是哪个好友。
  selectFriend(state, value) {
    state.selectFriendId = value
  },

  selectValidId(state, value) {
    state.selectValidId = value
  },

  // 发送信息
  sendMessage(state, msg) {
    let result = state.chatlist.find(session => session.friendXiuxianId === state.selectId);


    const timestamp = msg.timestamp
    let message = {
      content: msg.content === null ? "" : msg.content,
      remoteMediaUrl: msg.remoteMediaUrl === null ? "" : msg.remoteMediaUrl,
      date: timestamp + "",
      chatMessageType: msg.chatMessageType,
      self: true
    }
    let chatMessage = {
      fromId: state.user.xiuxianUserId,
      toId: state.selectId,
      fromTime: timestamp,
      chatMessageType: msg.chatMessageType
    }
    if (msg.chatMessageType === TEXT_CHAT_MESSAGE_TYPE) {
      chatMessage.content = msg.content
    } else if (msg.chatMessageType === IMAGE_CHAT_MESSAGE_TYPE) {
      chatMessage.remoteMediaUrl = msg.remoteMediaUrl
    }

    if (result.type === FRIEND_TYPE) { //如果是单聊
      getFriendsByFromIdAndToId(state.selectId, state.user.xiuxianUserId).then(res => {
        if (res.data.data != null) {
          if (!res.data.data) {  //不是朋友
            Vue.prototype.$message.info("对方开启了好友验证,你还不是他(她)好友,请先发送验证请求,对方验证通过后,才能聊天")
          }else {
            sendSingleChat(chatMessage).then(res => {
              console.log("单聊消息已被服务器接收到")
            }).catch(error => {
              this.$message.error(error)
            })
            result.messages.push(message)
          }
        }
      })
    } else if (result.type === GROUP_TYPE) {
      getFriendsByFromIdAndToId(state.user.xiuxianUserId,state.selectId).then(res => {
        if (res.data.data != null) {
          if(!res.data.data){ //不在群组中了
            Vue.prototype.$message.info("你已不在该群聊中")
          }else {
            let chatUser = {
              xiuxianUserId: state.user.xiuxianUserId,
              profile: state.user.profile,
              nickname: state.user.nickname,
            }
            chatMessage.chatUser = chatUser
            sendGroupChat(chatMessage).then(res => {
              console.log("群聊消息已被服务器接收到")
            }).catch(error => {
              this.$message.error(error)
            })
            message.chatUser = chatUser
            result.messages.push(message)
          }
        }
      })
    }
  }
  ,
  robotSendMessage
    (state, msg) {
    let result = state.chatlist.find(session => session.friendXiuxianId === state.selectId);
    setTimeout(() => {
      result.messages.push({
        content: msg.reply,
        remoteMediaUrl: "",
        date: new Date(),
        chatMessageType: 0,
        self: false
      });
    }, 500)
  }
  ,

// 选择好友后，点击发送信息。判断在聊天列表中是否有该好友，有的话跳到该好友对话。没有的话
// 添加该好友的对话 并置顶
  send(state) {
    const timestamp = new Date().getTime()
    let result = state.friendlist.find(friend => friend.friendXiuxianId === state.selectFriendId)
    let msg = state.chatlist.find(msg => msg.friendXiuxianId === state.selectFriendId)
    if (!msg) {
      state.selectId = result.friendXiuxianId
      for (let i = 0; i < state.chatlist.length; i++) {
        state.chatlist[i].index++;
      }
      // 第一次发送，为特殊聊天消息（空消息）
      let chatMessage = {
        content: '',
        fromId: state.user.xiuxianUserId,
        toId: state.selectId,
        fromTime: timestamp,
        toTime: timestamp,
        chatMessageType: TEXT_CHAT_MESSAGE_TYPE
      }


      //好友
      if (result.type === FRIEND_TYPE) {
        state.chatlist.unshift({
          friendXiuxianId: result.friendXiuxianId,
          nickname: result.nickname,
          profile: result.profile,
          remark: result.remark,
          type: FRIEND_TYPE,
          messages: [
            {
              content: '', //空消息便于显示
              remoteMediaUrl: '',
              date: timestamp + "",
              chatMessageType: TEXT_CHAT_MESSAGE_TYPE,
              self: true
            }
          ],
          index: 1
        })
        sendSingleChat(chatMessage).then(res => {
          console.log("单聊消息已被服务器接收到")
        }).catch(error => {
          this.$message.error(error)
        })
      } else {   //群组
        state.chatlist.unshift({
          friendXiuxianId: result.friendXiuxianId,
          nickname: result.groupName,
          profile: result.groupProfile,
          remark: result.remark,
          type: GROUP_TYPE,
          messages: [
            {
              chatUser: {
                xiuxianUserId: state.user.xiuxianUserId,
                profile: state.user.profile,
                nickname: state.user.nickname,
                remakr: ''
              },
              content: '',
              remoteMediaUrl: '',
              date: timestamp + "",
              chatMessageType: TEXT_CHAT_MESSAGE_TYPE,
              self: true,
            }
          ],
          index: 1
        })

        sendGroupChat(chatMessage).then(res => {
          console.log("群聊消息已被服务器接收到")
        }).catch(error => {
          this.$message.error(error)
        })
      }

      let chatList = {
        selfXiuxianId: state.user.xiuxianUserId,
        friendXiuxianId: result.friendXiuxianId,
        type: result.type
      }
      addChatList(chatList)
      router.push({path: '/chat'})
    } else {
      state.selectId = msg.friendXiuxianId
      router.push({path: '/chat'})
    }
  }
  ,
  setChatList(state, chatList) {
    state.chatlist = chatList
  }
  ,
  setFriendList(state, friendList) {

    state.friendlist = friendList
  }
  ,
  setNewFriendList(state, newFriendList) {

    state.newFriendList = newFriendList
  }
  ,
}
const getters = {
  getToken(state) {
    return state.token || storage.get("token") || "";
  },
  // 筛选出含有搜索值的聊天列表
  searchedChatlist(state) {

    let sessions = state.chatlist.filter(sessions => {
      var res = false
      res = sessions.nickname.includes(state.searchText)
      if (sessions.remark != null) {
        res = res || sessions.remark.includes(state.searchText)
      }
      return res
    });
    return sessions
  },
  // 筛选出含有搜索值的好友列表
  searchedFriendlist(state) {
    let friends = state.friendlist.filter(friends => {
      var res = false
      if (friends.type === FRIEND_TYPE) {
        res = friends.nickname.includes(state.searchText)
      } else if (friends.type === GROUP_TYPE) {
        res = friends.groupName.includes(state.searchText)
      }

      if (friends.remark != null) {
        res = res || friends.remark.includes(state.searchText)
      }
      return res
    });
    return friends
  },
  searchedFriends(state) {
    return state.friendlist.filter(friends => {
      var res = false
      if (friends.type === FRIEND_TYPE) {
        res = friends.nickname.includes(state.friendSearchText)
      }

      if (friends.remark != null) {
        res = res || friends.remark.includes(state.friendSearchText)
      }
      return res
    })
  },
  //搜索群成员
  searchedMembers(state) {
    return state.groupMembers[state.selectId].xiuxianUsers.filter(member => {
      var res = false
      res = member.nickname.includes(state.friendSearchText)
      // if (member.remark != null) {
      //   res = res || member.remark.includes(state.friendSearchText)
      // }
      return res
    })
  },
  // 通过当前选择是哪个对话匹配相应的对话
  selectedChat(state) {
    let session = state.chatlist.find(session => session.friendXiuxianId === state.selectId);
    if (session === undefined) {
      session = null
    }

    return session
  },
  // 通过当前选择是哪个好友匹配相应的好友
  selectedFriend(state) {

    let friend = state.friendlist.find(friend => friend.friendXiuxianId === state.selectFriendId);

    if (friend === undefined) {
      friend = {
        friendXiuxianId: -1,
        nickname: "",  //昵称
      }
    }
    return friend
  },

  selectValidFriend(state) {
    return state.newFriendList.find(friend => friend.fromId === state.selectValidId)
  },
  // 根据修仙Id去在朋友列表中找到该朋友

  messages(state) {
    let session = state.chatlist.find(session => session.friendXiuxianId === state.selectId);
    return session.messages
  },
  getUser(state) {
    return state.user
  },
  getNewFriendList(state) {
    return state.newFriendList
  },
  selectedGroup(state) {

    let groupMember = state.groupMembers[state.selectId]

    if (groupMember !== undefined) {
      if (groupMember.hasOwnProperty('xiuxianUsers')) {
        let members = groupMember.xiuxianUsers.filter(member => member.nickname.includes(state.memberSearchText));
        let group = {
          announcement: groupMember.announcement,
          xiuxianGroupId: groupMember.xiuxianGroupId,
          managerId: groupMember.managerId,
          groupName: groupMember.groupName,
          xiuxianUsers: members
        }
        return group
      } else {
        let group = {
          announcement: groupMember.announcement
        }

        return group
      }
    } else {
      return null
    }
  }
}

const actions = {
  search: ({commit}, value) => {
    setTimeout(() => {
      commit('search', value)
    }, 100)
  },

  searchFriend: ({commit}, value) => {
    setTimeout(() => {
      commit('searchFriend', value)
    }, 100)
  },
  searchMembers:({commit}, value) => {
  setTimeout(() => {
    commit('', value)
  }, 100)
},
  searchGroupMember: ({commit}, value) => {
    setTimeout(() => {
      commit('searchGroupMember', value)
    }, 100)
  },
  actionSetChatMessage:({commit},value)=>commit('setChatMessage',value),
  actionAddGroupMembers:({commit},value)=>commit('addGroupMembers',value),
  actionSetGroupNumber: ({commit},value)=>commit('setGroupNumber',value),
  actionRemoveGroupMembers: ({commit},value)=>commit('removeGroupMembers',value),
  selectSession: ({commit}, value) => commit('selectSession', value),
  selectFriend: ({commit}, value) => commit('selectFriend', value),
  sendMessage: ({commit}, msg) => commit('sendMessage', msg),
  robotSendMessage: ({commit}, msg) => commit('robotSendMessage', msg),
  send: ({commit}) => commit('send'),
  initData: ({commit}) => commit('initData')
}
const store = new Vuex.Store({
  state,
  mutations,
  getters,
  actions
})

// 监听聊天列表的值， 发生变化就保存在localStorage中
store.watch(
  (state) => state.chatlist,
  (val) => {
    localStorage.setItem('vue-chat', JSON.stringify(val));
  },
  {
    deep: true
  }
)
export default store;
