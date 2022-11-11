<!-- 消息框 -->
<template>
  <div class="message">
    <header class="header">
      <el-col :span="22">
        <div class="friendname">
          {{ selectedChat.remark === null || selectedChat.remark === '' ? selectedChat.nickname : selectedChat.remark }}
          {{ selectedChat.hasOwnProperty('number') && selectedChat.number !== 0 ? '(' + selectedChat.number + ')' : '' }}
        </div>
      </el-col>
      <el-col :span="2">
        <div class="chat-message">
          <i class="el-icon-more" title="聊天信息" @click="$emit('openChatInfo')"></i>
        </div>
      </el-col>
    </header>
    <div class="notification-bar"
         v-if="selectedGroup!=null&&selectedGroup.hasOwnProperty('announcement')?selectedGroup.announcement.showed:false"
         @click="showGroupAnnouncement">
      <el-row class="notification-content">
        <el-col :span="1" style="height: 30px">
          <img width="13" height="13" style="margin-top: 7px" :src="'static/images/icons/group_announcement.png'"/>
        </el-col>
        <el-col :span="22" style="height: 30px">
          <span class="content">{{ selectedGroup.announcement.content }}</span>
        </el-col>
        <el-col :span="1" style="height: 30px">
          <i class="el-icon-arrow-right" style="float: right;margin-top: 7px"></i>
        </el-col>
      </el-row>
    </div>
    <!--    单聊html-->
    <div class="message-wrapper" ref="list" v-if="selectedChat.type===0">
      <ul v-if="selectedChat">
        <li v-for="(item,i) in selectedChat.messages" v-show="showMessage(item)" class="message-item" :key="i">
          <div class="time"><span>{{ selectedChat.messages[i].date | time }}</span></div>
          <div class="main" :class="{ self: item.self }">
            <el-popover
              popper-class="poppover"
              placement="right-end"
              width="200"
              :ref="`ref_${i}`"
              trigger="click"
              :visible-arrow="false"
              @show="getUserInfo(item.self,selectedChat.friendXiuxianId)"
            >
              <delivery-info
                :user-info="item.self?user:userInfo['user_'+selectedChat.friendXiuxianId]===undefined?{}:userInfo['user_'+selectedChat.friendXiuxianId]"
                :chat-type="0" @chatEvent="refreshChat(i,0)" @callBack="changUserInfo"
                @closeEvent="closeDeliveryInfo(i,0,true,selectedChat.friendXiuxianId)"></delivery-info>
              <img class="avatar" width="36" height="36" :src="item.self ? user.profile : selectedChat.profile"
                   slot="reference"/>
            </el-popover>
            <div class="content" v-if="item.chatMessageType===0&&item.content!==''">
              <div class="text" v-html="replaceFace(item.content)"></div>
            </div>
            <div class="img-content" v-else>
              <el-image
                style="width: 100px; height: 100px"
                :src="item.remoteMediaUrl"
                fit="scale-down"
                :preview-src-list="[item.remoteMediaUrl]"></el-image>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!--    群聊html-->
    <div class="message-wrapper" ref="list" v-else>

      <ul v-if="selectedChat">
        <li v-for="(item,i) in selectedChat.messages" v-show="showMessage(item)" class="message-item" :key="i">
          <div class="time"><span>{{ selectedChat.messages[i].date | time }}</span></div>

          <div class="main" :class="{ self: item.self }" v-bind="userInfo">
            <div class="name">{{ item.chatUser| showName }}</div>

            <el-popover
              popper-class="poppover"
              placement="right-end"
              width="200"
              :ref="`group_${i}`"
              trigger="click"
              :visible-arrow="false"
              @show="getUserInfo(item.self,item.chatUser.xiuxianUserId)"
            >
              <delivery-info
                :user-info="item.self?user:userInfo['user_'+item.chatUser.xiuxianUserId]===undefined?{}:userInfo['user_'+item.chatUser.xiuxianUserId]"
                :chat-type="1" @chatEvent="refreshChat(i,1)" @callBack="changUserInfo"
                @closeEvent="closeDeliveryInfo(i,1,true,item.chatUser.xiuxianUserId)"></delivery-info>
              <img class="avatar" width="36" height="36" :src="item.self ? user.profile : item.chatUser.profile"
                   slot="reference"/>
            </el-popover>
            <div class="content" v-if="item.chatMessageType===0&&item.content!==''">

              <div class="text" v-html="replaceFace(item.content)"></div>
            </div>
            <div class="img-content" v-else-if="item.chatMessageType===1">
              <el-image
                style="width: 100px; height: 100px"
                :src="item.remoteMediaUrl"
                fit="scale-down"
                :preview-src-list="[item.remoteMediaUrl]"></el-image>
            </div>
          </div>
        </li>
      </ul>
    </div>


    <el-dialog
      title="申请添加朋友"
      :visible.sync="dialogVisible"
      width="300px"
      :show-close="false"
      :modal="false"
      class="add-friend-dialog"
      center>
      <span class="input-name">发送添加朋友申请</span>
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
        maxlength="15"
        clearable
        style="margin-top: 10px;margin-bottom: 10px">
      </el-input>
      <span class="input-name">设置朋友权限</span>
      <div class="permission">
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
        <el-button type="success" @click="addFriend" size="medium">确 定</el-button>
        <el-button @click="dialogVisible = false" size="medium">取 消</el-button>
      </span>
    </el-dialog>

    <!--群公告-->
    <group-announcement  :dialogGroupAnnouncement.sync="dialogGroupAnnouncement"></group-announcement>
  </div>
</template>

<script>
import {mapGetters, mapMutations, mapState} from 'vuex'
import {groupPersonNumber, searchFriend} from "../../apis/search.api";
import deliveryinfo from "../info/deliveryinfo";
import {ADD_FRIEND_NOTICE, WAITING_FOR_RECEIVE_STATUS} from "../../services/constant";
import {getFriendListItem, getFriendsByFromIdAndToId, sendAddFriend} from "../../apis/friend.api";
import {getChatListItem} from "../../apis/chat.api";
import Chatinfo from "../info/chatinfofriend";
import GroupAnnouncement from "../info/groupannouncement";
import {groupMembers} from "../../apis/group";

export default {
  components: {
    GroupAnnouncement,
    Chatinfo,
    "delivery-info": deliveryinfo
  },
  data() {
    return {
      userInfo: {},
      dialogVisible: false,
      form: {
        introduce: "",
        remark: '',
        permission: '0',
      },
      friendInfo: {},
      dialogGroupAnnouncement:false,

    }
  },
  computed: {
    ...mapGetters([
      'selectedChat',
      'messages',
      'selectedGroup'
    ]),
    ...mapState([
      'user',
      'emojis',
      'friendlist',
      'chatlist',
      'selectId',
      'groupMembers'
    ])
  },
  mounted() {

    //  在页面加载时让信息滚动到最下面
    setTimeout(() => this.$refs.list.scrollTop = this.$refs.list.scrollHeight, 0)
  },
  watch: {
    // 发送信息后,让信息滚动到最下面
    messages() {
      setTimeout(() => this.$refs.list.scrollTop = this.$refs.list.scrollHeight, 0)
    }
  },
  methods: {
    ...mapMutations([
      'setGroupAnnouncementNotificationBarShowed'
    ]),

    //  在发送信息之后，将输入的内容中属于表情的部分替换成emoji图片标签
    //  再经过v-html 渲染成真正的图片
    replaceFace(con) {

      if (con.match(/\[.*?\]/g) != null) {
        var emojis = this.emojis;
        for (var i = 0; i < emojis.length; i++) {
          let regExp = new RegExp("\\[" + emojis[i].title + "\\]", "g");
          con = con.replace(regExp, '<img src="static/emoji/' + emojis[i].file + '"  alt="" style="vertical-align: middle; width: 24px; height: 24px" />');
        }
        return con;
      }
      return con;
    },
    showMessage(item) {
      if (item.chatMessageType === 0) {
        return item.content !== null && item.content !== ''
      } else {
        return item.remoteMediaUrl !== null && item.remoteMediaUrl !== ''
      }
    },
    getUserInfo(self, xiuxianUserId) {

      if (self || this.userInfo.hasOwnProperty('user_' + xiuxianUserId)) return;
      if (!self) {
        searchFriend(xiuxianUserId).then(res => {
          if (res.data.data != null) {
            this.$set(this.userInfo, "user_" + xiuxianUserId, res.data.data)
          }
        })
      }
      console.log(this.userInfo)
    },
    refreshChat(index, type) {
      this.closeDeliveryInfo(index, type, false)
      setTimeout(() => this.$refs.list.scrollTop = this.$refs.list.scrollHeight, 0)
    },
    changUserInfo(xiuxianUserId, remark) {
      let friend = this.friendlist.find(friend => friend.friendXiuxianId === xiuxianUserId)
      let chat = this.chatlist.find(session => session.friendXiuxianId === xiuxianUserId)
      if (chat !== undefined) chat.remark = remark
      friend.remark = remark
    },
    closeDeliveryInfo(index, type, showDialog, xiuxianUserId) {
      if (type === 0) {
        this.$refs[`ref_${index}`][0].doClose()
      } else if (type === 1) {
        this.$refs[`group_${index}`][0].doClose()
      }
      this.dialogVisible = showDialog

      if (showDialog) {
        this.form.introduce = "我是" + this.user.nickname
        this.friendInfo = this.userInfo['user_' + xiuxianUserId];
        this.form.remark = this.friendInfo.nickname
      }
    },
    //添加朋友到通讯录
    addFriend() {

      this.dialogVisible = false
      let addFriend = {
        noticeMessageVo: {
          fromId: this.user.xiuxianUserId,
          toId: this.friendInfo.xiuxianUserId,
          noticeMessageType: ADD_FRIEND_NOTICE,
          noticeTime: new Date().getTime(),
          status: WAITING_FOR_RECEIVE_STATUS,
          content: this.form.introduce,
        },
        remark: this.form.remark,
        permission: parseInt(this.form.permission)
      }

      //先判断一下对方有没有删除自己
      getFriendsByFromIdAndToId(this.friendInfo.xiuxianUserId, this.user.xiuxianUserId).then((res) => {
        if (res.data.data != null) {
          const isFriends = res.data.data
          sendAddFriend(addFriend).then((res) => {
            if (isFriends) {
              getFriendListItem(this.user.xiuxianUserId, this.friendInfo.xiuxianUserId).then(res => {
                if (res.data.data != null) {
                  let friendListItem = res.data.data
                  this.friendlist.push(friendListItem)
                }
              })
              getChatListItem(this.user.xiuxianUserId, this.friendInfo.xiuxianUserId).then(res => {
                if (!res.data.data) return
                const chatListItem = res.data.data

                let result = this.chatlist.find(session => session.friendXiuxianId === this.friendInfo.xiuxianUserId);
                //还没添加到聊天列表中,但是对方给我发消息了，先把对方加入聊天列表中

                if (!result) {
                  for (let i = 0; i < this.chatlist.length; i++) {
                    this.chatlist[i].index++;
                  }
                  this.chatlist.unshift(chatListItem)
                }
              })
            }
            this.$message.info("已发送")
          }).catch(error => {
            this.$message.error(error)
          })

        }
      })
    },
    //显示群公告
    showGroupAnnouncement() {

      const value = {
        xiuxianGroupId: this.selectId,
        showed: false
      }

      this.setGroupAnnouncementNotificationBarShowed(value)
      this.$forceUpdate()
      this.dialogGroupAnnouncement=true

    },
    getGroupMembers() {
      //如果为群组类型
      if (this.selectedChat.type === 1) {
        //先查看是否有该群组成员缓存，没有的话获取群成员
        if (!this.groupMembers.hasOwnProperty(this.selectId)||!this.groupMembers[this.selectId].hasOwnProperty('xiuxianUsers')) {
          groupMembers(this.selectId).then(res => {
            if (res.data.data != null) {
              this.setGroupMember(res.data.data)
              this.$message({
                message: '群成员数据加载完成,可点击查看',
                type: 'success'
              });
            }
          })
        }
      }
    },
    showChatInfo() {
      this.$refs.chatInfo.handlePack()
    }
  },
  filters: {
    // 将日期过滤为 hour:minutes
    time(date) {

      let timestamp = parseInt(date)
      if (typeof date === 'string') {
        let timestamp = parseInt(date);
        date = new Date(timestamp);
      }
      let now = new Date();

      if (now.getFullYear() === date.getFullYear() && now.getMonth() === date.getMonth()) {
        if (now.getDate() - date.getDate() === 1) return "昨天";
        else if (now.getDate() - date.getDate() === 0) {
          if (date.getMinutes() < 10) {
            return date.getHours() + ':0' + date.getMinutes();
          } else {
            return date.getHours() + ':' + date.getMinutes();
          }
        }
      }

      return date.getFullYear() + "/" + date.getMonth() + "/" + date.getDate()
    },

    //格式化用户昵称
    showName(chatUser) {
      if (chatUser.remark !== null && chatUser.remark !== '') {
        return chatUser.remark
      }
      return chatUser.nickname

    }
  }
}
</script>

<style lang="stylus" scoped>
.message
  width: 100%
  height: 450px

  .header
    height: 60px
    padding: 28px 0 0 30px
    box-sizing: border-box
    border-bottom: 1px solid #e7e7e7

    .friendname
      font-size: 18px

    .chat-message
      cursor: pointer

  .notification-bar
    width: 98%
    height: 30px
    border-bottom: 1px solid #e7e7e7
    padding: 0 5px 0 5px

    .notification-content
      cursor: pointer
      line-height: 30px

      background: white
      height: 100%

      .content
        width: 400px
        overflow: hidden
        white-space: nowrap
        text-overflow: ellipsis
        word-break: break-all
        font-size: 14px
        display: -moz-inline-box;
        display: inline-block;

  .message-wrapper
    min-height: 390px
    max-height: 390px
    padding: 10px 15px
    box-sizing: border-box
    overflow-y: auto
    border-bottom: 1px solid #e7e7e7

    .message
      margin-bottom: 15px

    .time
      width: 100%
      font-size: 12px
      margin: 7px auto
      text-align: center

      span
        display: inline-block
        padding: 4px 6px
        color: #fff
        border-radius: 3px
        background-color: #dcdcdc


    .main
      .name
        font-size: 10px
        color #adaeaf
        margin-left: 15px
        margin-bottom 3px

      .avatar
        float: left
        margin-left: 15px
        border-radius: 3px
        cursor: pointer

      .content
        display: inline-block
        margin-left: 10px
        position: relative
        padding: 6px 10px
        max-width: 330px
        min-height: 36px
        line-height: 24px
        box-sizing: border-box
        font-size: 14px
        text-align: left
        word-break: break-all
        background-color: #fafafa
        border-radius: 4px

      .img-content
        display: inline-block
        margin-left: 10px
        position: relative
        box-sizing: border-box
        text-align: left
        border-radius: 4px

        &:before
          content: " "
          position: absolute
          top: 12px
          right: 100%
          border: 6px solid transparent
          border-right-color: #fafafa

      .el-popover.poppover
        color: black

    .self
      text-align: right

      .name
        margin-right: 15px
        margin-bottom: 3px

      .avatar
        float: right
        margin: 0 15px

      .content
        background-color: #b2e281

        &:before
          right: -12px
          vertical-align: middle
          border-right-color: transparent
          border-left-color: #b2e281
</style>
