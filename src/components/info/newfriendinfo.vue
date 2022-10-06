<template>

  <div class="new-friend-info">
    <div class="main-info" v-show="showMain">
      <header class="header">
        <div class="new-friend-name">
          新的朋友
        </div>
      </header>
      <div class="new-friend-list">
        <ul>
          <li v-for="item in newFriendList" :key="item.id" class="new-friend"
              @click="selectNewFriend(item.fromId)">
            <div class="list-left">
              <img class="avatar" width="50" height="50"
                   :src="item.profile">
            </div>
            <div class="list-middle">
              <p class="name">{{ item.nickname }}</p>
              <p class="lastmsg">{{
                  getLatestValidMessage(item.messages, item.nickname)
                }}</p>
            </div>
            <div class="list-right" v-if="item.status!==WAITING_FOR_RECEIVE_STATUS">
              <p class="new-friend-status">{{ item.status | showStatus }}</p>
            </div>
            <div class="receive" v-else>
              <el-button type="success" size="mini" style="margin-right: 1px"
                         @click.stop="openFriendSetUpDialog(item.fromId)">接受
              </el-button>
            </div>
          </li>

        </ul>
      </div>
      <el-dialog
        title="申请添加朋友"
        :visible.sync="friendSetUpDialogVisible"
        width="300px"
        :show-close="false"
        :modal="false"
        class="accept-add-friend-dialog"
        center>
        <span class="input-name">发送打招呼语句</span>
        <el-input
          v-model="form.introduce"
          placeholder="请输入内容"
          clearable
          style="margin-top: 10px;margin-bottom: 10px">
        </el-input>
        <span class="input-name">备注名</span>
        <el-input
          v-model="form.remark"
          placeholder="备注名"
          clearable
          style="margin-top: 10px;margin-bottom: 10px">
        </el-input>
        <span class="input-name">设置朋友权限</span>
        <div class="accept-permission">
          <el-radio-group v-model="form.permission" style="width:100%;margin-top: 10px;margin-bottom: 10px"
                          fill="#1aad19">
            <div class="friend-permission">
              <el-radio-button class="friend-permission-button" label="0">聊天、朋友圈、修仙运动</el-radio-button>
            </div>
            <div class="friend-permission">
              <el-radio-button class="friend-permission-button" label="1">仅聊天</el-radio-button>
            </div>
          </el-radio-group>
        </div>

        <span slot="footer" class="dialog-footer">
        <el-button type="success" @click="accept" size="medium">确 定</el-button>
        <el-button @click="friendSetUpDialogVisible = false" size="medium">取 消</el-button>
      </span>
      </el-dialog>
    </div>

    <div class="valid-info" v-show="!showMain">
      <header class="valid-header">
        <div class="back">
          <i class="el-icon-back" @click="showMain=true"></i>
        </div>
      </header>
      <div class="valid-friend-info">
        <div class="valid-es-info">
          <div class="left">
            <div class="people">
              <div class="nickname" v-model="friend.nickname">{{ friend.nickname }}</div>
              <div v-model="friend.sex" :class="[friend.sex===1?'gender-male':'gender-female']"></div>
            </div>
            <div class="signature" v-model="friend.signature">{{ friend.signature }}</div>
          </div>
          <div class="right">
            <img class="avatar" v-model="friend.profile" width="60" height="60" :src="friend.profile">
          </div>
        </div>
        <div class="detInfo">
          <div class="area" v-model="friend.area"><span>地&nbsp&nbsp&nbsp区</span>{{ friend.area }}</div>
        </div>
        <div class="valid-session">
          <ul v-if="selectValidFriend">
            <li v-for="(item,i) in selectValidFriend.messages" class="valid-message-item" :key="item.id">
              <span class="valid-name">{{ getName(item.self) }}:</span> <span class="valid-message">{{
                item.content
              }}</span>
            </li>
          </ul>
        </div>
        <div class="valid-send">
          <el-button icon="el-icon-chat-round" type="success" circle @click="openValidMessageBox"></el-button>
        </div>

        <el-dialog
          title="回复"
          :visible.sync="dialogVisible"
          width="20%"
          :modal="false"
          :close-on-click-modal="false"
          class="send-valid-message-dialog">
          <el-input
            type="textarea"
            :rows="5"
            maxlength="40"
            placeholder="请输入内容"
            v-model="validMessage"
            resize="none">
          </el-input>
          <span slot="footer" class="dialog-footer">
            <el-button type="success" size="mini" @click="sendValidMessage">确 定</el-button>
            <el-button size="mini" @click="dialogVisible = false">取 消</el-button>
          </span>
        </el-dialog>
      </div>
    </div>
  </div>


</template>

<script>
import {mapGetters, mapMutations, mapState} from "vuex";
import {newFriendNoticeMessage, sendValidMessageToUser} from "../../apis/notification_message.api";
import {
  ADD_FRIEND_NOTICE,
  ADDED_STATUS,
  EXPIREd_STATUS, SEND_MESSAGE_NOTICE, SUCCESS_SEND_STATUS,
  WAITING_FOR_RECEIVE_STATUS,
  WAITING_FOR_VERIFY_STATUS
} from "../../services/constant";
import {acceptFriend, getFriendListItem, getFriendsByFromIdAndToId} from "../../apis/friend.api";
import {searchFriend} from "../../apis/search.api";

export default {
  name: "newfriendinfo",

  data() {
    return {
      WAITING_FOR_RECEIVE_STATUS: 1,
      showMain: true,
      friend: {},
      form: {
        introduce: "我是",
        remark: '',
        permission: '0',
      },
      friendSetUpDialogVisible: false,
      dialogVisible: false,
      validMessage: '' //验证消息
    }
  },
  filters: {
    showStatus(status) {
      switch (status) {
        case EXPIREd_STATUS:
          return "已过期"
        case ADDED_STATUS:
          return "已添加"
        case WAITING_FOR_VERIFY_STATUS:
          return "等待验证"
      }
    },

  },

  mounted() {
    //加载新的朋友通知消息
    const xiuxianUserId = this.getUser.xiuxianUserId;
    newFriendNoticeMessage(xiuxianUserId).then(res => {
      if (res.data.data != null) {
        this.setNewFriendList(res.data.data.newFriendVoList)
      }
    }).catch(error => {
      this.$message.error(error)
    })
  },
  methods: {
    ...mapMutations([
      'setNewFriendList',
      'selectValidId',
      'selectFriend'
    ]),

    openFriendSetUpDialog(fromId){
      this.friendSetUpDialogVisible=true
      this.selectValidId(fromId)
      this.form.remark=this.selectValidFriend.nickname
      this.form.introduce="我是"+this.getUser.nickname
    },
    selectNewFriend(xiuxianUserId) {
      const fromId = this.getUser.xiuxianUserId
      getFriendsByFromIdAndToId(fromId, xiuxianUserId).then(res => {
        if (res.data.data) {
          this.selectFriend(xiuxianUserId)
          this.$router.push("/friendInfo")
        } else {
          searchFriend(xiuxianUserId).then(res => {
            const data = res.data.data
            if (data != null) {
              this.friend.nickname = data.nickname
              this.friend.sex = data.sex
              this.friend.signature = data.signature
              this.friend.area = data.area
              this.friend.xiuxianId = data.xiuxianUserId
              this.friend.profile = data.profile
              this.showMain = false
              this.selectValidId(data.xiuxianUserId)
            }
          }).catch(error => {
            this.$message.error(error)
          })
        }
      }).catch(error => {
        this.$message.error(error)
      })
      //1.已经成为好友，展示人员信息

      //2. 不是好友，展示验证对话信息
    },
    getLatestValidMessage(messages, nickname) {
      if (messages !== null && messages.length !== 0) {
        if (messages[0].self) {
          return "我: " + messages[0].content
        } else {
          return nickname + ": " + messages[0].content
        }
      }
      return ""
    },
    getName(self) {
      if (this.selectValidFriend) {
        return self ? "我" : this.selectValidFriend.nickname
      }
    },
    openValidMessageBox() {
      this.dialogVisible = true
      this.validMessage = ""

    },
    //发送验证消息
    sendValidMessage() {
      this.dialogVisible = false
      //验证是否过期
      if (this.selectValidFriend.status === EXPIREd_STATUS) {
        this.$message.warning("朋友请求已过期，请主动重新添加好友")
        return
      }
      if (this.validMessage === "") {
        this.$message.warning("验证回复不得为空")
        return
      }
      let data = {
        fromId: this.getUser.xiuxianUserId,
        toId: this.selectValidFriend.fromId,
        noticeMessageType: SEND_MESSAGE_NOTICE,
        noticeTime: new Date().getTime(),
        status: SUCCESS_SEND_STATUS,
        content: this.validMessage
      }
      sendValidMessageToUser(data).then(res => {
        const messageStatus = res.data.data

        if (messageStatus === EXPIREd_STATUS) {
          this.$message.warning("朋友请求已过期，请主动重新添加好友")
          return
        }
        this.selectValidFriend.messages.push({
          content: this.validMessage,
          date: new Date().getTime() + "",
          self: true
        })
        this.selectValidFriend.messages.sort((a, b) => b.date - a.date)
        console.log("验证回复消息发送成功")
      }).catch(error => {
        this.$message.error(error)
      })
    },

    //接受添加好友请求
    accept() {
      this.friendSetUpDialogVisible=false
      const noticeMessage={
        id:this.selectValidFriend.id,
        fromId:this.getUser.xiuxianUserId,
        toId:this.selectValidFriend.fromId,
        noticeMessageType:ADD_FRIEND_NOTICE,
        noticeTime:new Date().getTime(),
        status:ADDED_STATUS,
        content:this.form.introduce
      }
      const acceptFriendData={
        noticeMessageVo: noticeMessage,
        remark: this.form.remark,
        permission: this.form.permission
      }
      acceptFriend(acceptFriendData).then(res=>{
        getFriendListItem(this.getUser.xiuxianUserId,this.selectValidFriend.fromId).then(res=>{
          if(res.data.data!==null){
            this.$message.success("成功接受添加好友申请")
            this.selectValidFriend.status=ADDED_STATUS
            let friendListItem=res.data.data
            this.friendlist.push(friendListItem)
            //接受成功跳转到好友信息页面
            this.selectFriend(friendListItem.friendXiuxianId)
            this.$router.push("/friendInfo")
          }else {
            this.$message.error("服务器内部错误，请主动重新添加好友")
          }
        }).catch(error=>{
          this.$message.error(error)
        })
      }).catch(error=>{
        this.$message.error(error)
      })
    }
  },
  computed: {
    ...mapGetters([
      'getNewFriendList',
      'getUser',
      'selectValidFriend'

    ]),
    ...mapState([
      'newFriendList',
      'friendlist'
    ]),
  }


}
</script>

<style lang="stylus">

.main-info
  width: 100%
  height: 500px

  .header
    height: 60px
    padding: 28px 0 0 30px
    box-sizing: border-box
    border-bottom: 1px solid #e7e7e7

    .new-friend-name
      font-size: 18px

.new-friend-list
  height: 540px
  width: 70%
  margin-left: 15%
  overflow-y: auto

  .new-friend
    display: flex
    padding-bottom: 14px
    padding-top: 14px
    transition: background-color .1s
    font-size: 0
    border-bottom: 1px solid #dadada

  .avatar
    border-radius: 2px
    margin-right: 12px

  .list-middle
    position: relative
    flex: 1
    margin-top: 4px

  .list-right
    position: relative
    flex: 1
    margin-top: 4px

  .name
    display: inline-block
    vertical-align: top
    font-size: 12px

  .new-friend-status
    float: right
    color: #999
    font-size: 10px
    vertical-align: center
    line-height: 46px

  .receive
    position: relative
    margin-top: 4px
    float: right
    line-height: 46px

  .lastmsg
    position: absolute
    font-size: 12px
    width: 130px
    height: 15px
    line-height: 15px
    color: #999
    bottom: 4px
    overflow: hidden
    white-space: nowrap
    text-overflow: ellipsis

.accept-add-friend-dialog
  .el-dialog__header
    background: #efefec
    border: 1px double gainsboro

  .el-dialog__body
    background: #efefec

  .el-dialog__footer
    background: #efefec

  .el-dialog__title
    color: black
    font-size: 10px

  .input-name
    font-size: 10px
    color: gray
    margin-bottom: 5px

.accept-permission
  .friend-permission
    .friend-permission-button
      .el-radio-button__inner
        width: 250px
        color: black

.valid-info
  width: 100%
  height: 500px

  .valid-header
    height: 60px
    padding: 20px 0 0 30px
    box-sizing: border-box
    border-bottom: 1px solid #e7e7e7

    .back
      font-size: 23px
      cursor: pointer

  .valid-friend-info
    padding: 0 90px

    .valid-es-info
      display: flex
      align-items: center
      padding: 30px 0 30px 0

      .left
        flex: 1

        .people
          .nickname
            display: inline-block
            font-size: 20px
            margin-bottom: 16px

          .gender-male, .gender-female
            display: inline-block
            width: 18px
            height: 18px
            vertical-align: top
            margin-top: 2px

          .gender-male
            background-image: url(man.png)
            background-size: cover

          .gender-female
            background-image: url(woman.png)
            background-size: cover

        .signature
          font-size: 14px
          color: rgba(153, 153, 153, .8)

      .right
        .avatar
          border-radius: 3px

    .detInfo
      padding: 10px 0 30px 0
      border-top: 1px solid #e7e7e7
      border-bottom: 1px solid #e7e7e7

      .area, .wxid
        font-size: 14px
        margin-top: 20px

        span
          font-size: 14px
          color: rgba(153, 153, 153, .8)
          margin-right: 40px

    .valid-session
      margin-top: 20px
      border-bottom: 1px solid #e7e7e7
      overflow-y: auto
      height: 100px

      .valid-message-item
        margin-bottom: 10px

      .valid-name
        font-size: 14px
        color: rgba(153, 153, 153, .8)
        margin-right: 40px

      .valid-message
        font-size: 14px

    .valid-send
      float: right
      margin-top: 10px

    .send-valid-message-dialog
      .el-dialog__title
        color: black
        font-size: 12px
</style>
