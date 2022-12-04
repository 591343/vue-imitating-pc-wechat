<template>
  <div class="chat-info-friend">

    <div class="avatar-area">
      <el-row>
        <el-col :span="7">
          <div class="friend-avatar">
            <img class="avatar"
                 :src="selectedChat.profile">
            <div class="name">{{selectedChat.remark!=null&&selectedChat.remark!==''?selectedChat.remark:selectedChat.nickname}}</div>
          </div>
        </el-col>
        <el-col :span="17">
          <div class="add-to-group">
            <img class="avatar" style="height: 33px;width: 33px" src="static/images/add.png" @click="dialogAddFriends=true">
            <div class="add" >添加</div>
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="chat-record-area" @click="lookChatRecord">
      <el-row>
        <el-col :span="22">
          <div class="chat-record">聊天记录</div>
        </el-col>
        <el-col :span="2">
          <i class="el-icon-arrow-right"></i>
        </el-col>
      </el-row>
    </div>
    <div class="function-area">
      <el-row>
        <el-col :span="19">
          <div class="message-mute">消息免打扰</div>
        </el-col>
        <el-col :span="5">
          <el-switch
            v-model="activationMessageMute"
            active-color="limegreen"
            inactive-color="gray">
          </el-switch>
        </el-col>
      </el-row>
      <el-row style="margin-top: 10px">
        <el-col :span="19">
          <div class="top-chat">置顶聊天</div>
        </el-col>
        <el-col :span="5">
          <el-switch
            v-model="activationTopChat"
            active-color="limegreen"
            inactive-color="gray">
          </el-switch>
        </el-col>
      </el-row>
    </div>
    <el-button type="text" class="delete-chat-record" @click="deleteChatRecord">清空聊天记录</el-button>


    <el-dialog
      :visible.sync="dialogAddFriends"
      width="550px"
      :modal="false"
      @close="resetData"
      class="recommend-friend--dialog"
      center>
      <friend-transfer :open="dialogAddFriends" :function-type="functionType" ref="friendTransfer"  @closeTransferDialog="dialogAddFriends=false"></friend-transfer>
    </el-dialog>
  </div>

</template>
<script>

import {mapGetters, mapState} from "vuex";
import FriendTransfer from "../friend/friendtransfer";
import {ADD_FRIEND_FUNCTION} from "../../services/constant"
import GroupMemberSearch from "../search/groupmembersearch";
export default {
  name: 'ChatInfoFriend',
  components: {GroupMemberSearch, FriendTransfer},
  data() {
    return {
      activationTopChat: false,
      activationMessageMute: false,
      dialogAddFriends:false,
      functionType:ADD_FRIEND_FUNCTION
    }
  },
  computed: {
    ...mapGetters([
      'selectedChat',
    ]),
  },
  methods: {

    // 查看聊天记录
    lookChatRecord() {

    },
    // 删除聊天记录
    deleteChatRecord() {
      this.$confirm('删除聊天后，将同时删除聊天记录，包括聊天中的图片等内容。', '', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const data = {
          "selfXiuxianId": this.getUser.xiuxianUserId,
          "friendXiuxianId": this.selectedFriendXiuxianId
        }
        // deleteChatListItemRes(data).then(res => {
        //
        // }).catch(error => {
        //   this.$message.error(error);
        // })
      })
    },
    resetData(){
      this.$refs.friendTransfer.resetData()
    }
  },

}
</script>
<style lang="stylus" scoped>
.chat-info-friend
  width: 250px
  padding: 10px

  .avatar-area
    padding-bottom: 20px
    border-bottom 1px solid #f2efee

    .friend-avatar
      margin-left: 14px
      margin-top: 25px

      .avatar
        cursor: pointer
        width: 35px
        height: 35px

      .name
        font-size: 10px
        margin-top: 5px
        width: 36
        vertical-align: center
        overflow: hidden
        white-space: nowrap
        text-overflow: ellipsis

    .add-to-group
      margin-top: 25px

      .avatar
        cursor: pointer
        width: 35px
        height: 35px
        border: 1px solid #8a8a8a
      .add
        font-size: 10px
        margin-top: 5px
        margin-left: 5px

  .chat-record-area
    padding: 15px
    border-bottom: 1px solid #f2efee

    .chat-record
      font-size: 14px
      cursor: pointer

  .function-area
    padding: 15px
    border-bottom: 1px solid #f2efee

    .message-mute, .top-chat
      font-size: 14px

  .delete-chat-record
    font-size: 14px
    margin-top: 10px
    width: 100%
    color: red
    vertical-align: center
</style>
