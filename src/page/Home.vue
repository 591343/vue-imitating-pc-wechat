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
import {groupAnnouncement, groupAnnouncementReceived} from "../apis/group_announcement";


export default {
  components: {
    mycard
  },
  computed: {

    ...mapState([
      'user',
      'friendlist',
      'groupMembers'
    ]),

  },

  created() {
    this.$store.dispatch('initData')
    const xiuxianUserId = this.user.xiuxianUserId;
    getChatList(xiuxianUserId).then((res) => {
        let chatList = res.data.data.chatList;

        chatList.sort(function (a, b) {
          let aTime=a.messages.length>0?a.messages[a.messages.length - 1].date:a.startTime
          let bTime=b.messages.length>0?b.messages[b.messages.length - 1].date:b.startTime
          return bTime - aTime
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
      let groups = res.data.data.groupList;
      friendList.push.apply(friendList,groups)
      this.setFriendList(friendList)
      for(let i=0;i<groups.length;i++){
        const group=groups[i]
        groupAnnouncementReceived(group.friendXiuxianId,this.user.xiuxianUserId).then(res=>{
          if(!res.data.data){
            groupAnnouncement(group.friendXiuxianId).then(res=>{
              if(res.data.data!=null){
                delete  res.data.data.id
                this.setGroupAnnouncement(res.data.data)
                const value={
                  xiuxianGroupId:group.friendXiuxianId,
                  showed:true
                }
                this.setGroupAnnouncementNotificationBarShowed(value)
              }
            }).catch(error=>{
              this.$message.error(error)
            })
          }
        }).catch(error=>{
          this.$message.error(error)
        })
      }
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
      'setFriendList',
      'setGroupAnnouncement',
      'setGroupAnnouncementNotificationBarShowed'
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
