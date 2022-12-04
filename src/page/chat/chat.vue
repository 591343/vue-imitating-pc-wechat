<template>
  <div class="content">
    <div class="msglist" @click="drawer=false">
      <search></search>
      <chatlist></chatlist>
    </div>
    <div class="chatbox" v-if="selectedChat!==null">
      <message @openChatInfo="openDrawer"></message>
      <v-text></v-text>
      <el-drawer
        @close="resetData"
        :wrapperClosable="true"
        :visible.sync="drawer"
        :with-header="false"
        :close-on-press-escape="false"
        style="position:absolute"
        direction="rtl"
        size="250"
        z-index="-1"
      >
        <chat-info-friend v-if="selectedChat.type===0"></chat-info-friend>
        <chat-info-group  ref="chatInfoGroup" v-else></chat-info-group>
      </el-drawer>
    </div>
    <div class="empty-box" style="align-items: center;vertical-align: center" v-else>
      <el-image :src="backgroundImage" style="width: 100px; height:100px;"></el-image>
    </div>
  </div>
</template>

<script>
import search from '../../components/search/search'
import chatlist from '../../components/chatlist/chatlist'
import message from '../../components/message/message'
import vText from '../../components/text/text'
import {mapGetters, mapMutations, mapState} from "vuex";
import ChatInfo from "../../components/info/chatinfofriend";
import ChatInfoFriend from "../../components/info/chatinfofriend";
import ChatInfoGroup from "../../components/info/chatinfogroup";
import {groupMembers} from "../../apis/group";
import {groupAnnouncement} from "../../apis/group_announcement";
import {getFriendsByFromIdAndToId} from "../../apis/friend.api";

export default {
  components: {
    ChatInfoGroup,
    ChatInfoFriend,
    ChatInfo,
    search,
    chatlist,
    message,
    vText
  },
  computed: {
    ...mapGetters([
      'selectedChat',
      'getUser'
    ]),
    ...mapState([
      'groupMembers',
      'selectId',
      'memberSearchText'
    ]),
  },
  data() {
    return {
      backgroundImage: 'static/images/empty_box_bg.png',
      drawer: false,
    }
  },

  methods: {
    ...mapMutations([
      'searchGroupMember',
      'setGroupMember',
      'setGroupAnnouncement'
    ]),
    openDrawer(){
      if(this.selectedChat.type===1) {
        getFriendsByFromIdAndToId(this.getUser.xiuxianUserId,this.selectId).then(res => {
          if(res.data.data!=null){
            if(res.data.data){
              if (!this.groupMembers.hasOwnProperty(this.selectId)||!this.groupMembers[this.selectId].hasOwnProperty('xiuxianUsers')) {
                this.drawer=false
                this.getGroupMembers()
                this.$message('群成员数据加载中，请等待加载完成提示出现后，可点击查看')
              }else {
                this.getAnnouncement(this.selectId)
                this.drawer=!this.drawer
              }
            }else {
              this.$message.info('你已不在该群聊中')
              this.drawer=false
            }
          }
        })
      }else {
        this.drawer=!this.drawer
      }
    },
    getGroupMembers() {
      //如果为群组类型
      if (this.selectedChat.type === 1) {
        //先查看是否有该群组成员缓存，没有的话获取群成员
        if (!this.groupMembers.hasOwnProperty(this.selectId)||!this.groupMembers[this.selectId].hasOwnProperty('xiuxianUsers')) {
          groupMembers(this.getUser.xiuxianUserId, this.selectId).then(res => {
            if (res.data.data != null) {
              this.setGroupMember(res.data.data)
              this.getAnnouncement(this.selectId)
              this.$message({
                message: '群成员数据加载完成,可点击查看',
                type: 'success'
              });
            }
          })
        }
      }
    },

    getAnnouncement(xiuxianGroupId){
      groupAnnouncement(xiuxianGroupId).then(res=>{
        if(res.data.data!=null){
          delete  res.data.data.id
          this.setGroupAnnouncement(res.data.data)
        }
      }).catch(error=>{
        this.$message.error(error)
      })
    },
    resetData(){
      if(this.selectedChat.type===1){
        this.$refs.chatInfoGroup.clearSearchText()
      }

    },

  }
}
</script>

<style lang="stylus" scoped>
.content
  display: flex
  width: 800px


  .msglist
    width: 250px
    background: rgb(230, 230, 230)

  .chatbox
    flex: 1
    position: relative
    overflow: hidden

  .empty-box
    display: flex
    justify-content: center
    align-items: center
    margin: 0 auto
</style>
