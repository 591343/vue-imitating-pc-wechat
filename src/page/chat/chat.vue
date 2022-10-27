<template>
  <div class="content">
    <div class="msglist" @click="drawer=false">
      <search></search>
      <chatlist></chatlist>
    </div>
    <div class="chatbox" v-if="selectedChat!==null" >
      <message @openChatInfo="drawer=!drawer"></message>
      <v-text></v-text>
      <el-drawer
        :wrapperClosable="true"
        :visible.sync="drawer"
        :with-header="false"
        style="position:absolute"
        direction="rtl"
        size="250"
        z-index="-1"
      >
        <chat-info-friend v-if="selectedChat.type===0"></chat-info-friend>
        <chat-info-group v-else></chat-info-group>
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
import {mapGetters, mapState} from "vuex";
import ChatInfo from "../../components/info/chatinfofriend";
import ChatInfoFriend from "../../components/info/chatinfofriend";
import ChatInfoGroup from "../../components/info/chatinfogroup";

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

  data(){
    return{
      backgroundImage:'static/images/empty_box_bg.png',
      drawer:false
    }
  },
  computed: {
    ...mapGetters([
      'selectedChat',
    ])
  },
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
    overflow:hidden
  .empty-box
    display: flex
    justify-content: center
    align-items: center
    margin: 0 auto
</style>
