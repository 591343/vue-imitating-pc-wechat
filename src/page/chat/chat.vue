<template>
  <div class="content">
    <div class="msglist">
      <search></search>
      <chatlist></chatlist>
    </div>
    <div class="chatbox" v-if="selectedChat!==null">
      <message></message>
      <v-text></v-text>
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

export default {
  components: {
    search,
    chatlist,
    message,
    vText
  },

  data(){
    return{
      backgroundImage:'static/images/empty_box_bg.png'
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
  .empty-box
    display: flex
    justify-content: center
    align-items: center
    margin: 0 auto
</style>
