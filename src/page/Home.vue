<template>
  <div id="app">
    <div class="sidebar">
      <mycard></mycard>
    </div>
    <div class="main">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import mycard from '../components/mycard/mycard'
import {mapActions, mapGetters, mapMutations, mapState} from 'vuex'
import {getChatList} from '../apis/chat.api'
import {getGroupList, getFriendList} from "../apis/friend.api";
import {connect} from "../apis/websocket";

export default {
  components: {
    mycard
  },
  computed: {

    ...mapState([
      'user',
      'friendlist'
    ]),

  },

  created() {
    this.$store.dispatch('initData')
    const xiuxianUserId = this.user.xiuxianUserId;
    getChatList(xiuxianUserId).then((res) => {
        let chatList = res.data.data.chatList;

        chatList.sort(function (a, b) {
          return b.messages[b.messages.length - 1].date - a.messages[a.messages.length - 1].date
        })
        for (let i = 0; i < chatList.length; i++) {
          chatList[i].index = i + 1;
        }
        this.setChatList(chatList)
      }
    ).catch(error => {
      this.$message.error(error)
      console.log("getChatList请求错误")
    })
    let friendList = []
    let connected=false
    getFriendList(xiuxianUserId).then((res) => {

      friendList.push.apply(friendList, res.data.data.friendList)
      this.setFriendList(friendList)
      if(connected){
        connect()//获取朋友列表完成后进行订阅
      }else {
        connected=true
      }
    }).catch(error => {
      this.$message.error(error)
      console.log("getFriendList请求错误")
    })

    getGroupList(xiuxianUserId).then((res)=>{
      friendList.push.apply(friendList, res.data.data.groupList)
      this.setFriendList(friendList)
      if(connected){
        connect()//获取朋友列表完成后进行订阅
      }else {
        connected=true
      }
    }).catch(error => {
      this.$message.error(error)
      console.log("getGroupList请求错误")
    })
  },

  mounted() {

  },
  methods: {
    ...mapMutations([
      'setChatList',
      'setFriendList'
    ])
  },
}
</script>

<style lang="stylus" scoped>
#app
  display: flex
  border-radius 50px
  margin: 20px auto
  width: 860px
  height: 600px
  background-color: #fff

  .sidebar
    width: 60px
    height: 600px
    background: #2b2c2f

  .main
    flex: 1
    height: 600px
    background: #f2f2f2
</style>
