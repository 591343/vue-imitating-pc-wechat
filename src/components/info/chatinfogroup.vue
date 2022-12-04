<template>
  <div class="chat-info-group" v-if="selectedGroup!==null">
    <div class="search-area">
      <group-member-search ref="groupMemberSearch"></group-member-search>
    </div>
    <div class="avatar-area" v-show="avatarsCollapse">
      <div class="avatars-info">
        <div v-for="item in selectedGroup.xiuxianUsers.slice(0,15)" :key="item.xiuxianUserId" class="friend-avatar">
          <el-popover
            popper-class="poppover"
            placement="left-end"
            width="200"
            :ref="`group_${item.xiuxianUserId}`"
            trigger="click"
            :visible-arrow="false"
            @show="getUserInfo(item.xiuxianUserId)"
          >
            <delivery-info
              :user-info="userInfo" :chat-type="1"  @callBack="changUserInfo"
              @closeEvent="closeDeliveryInfo(item.xiuxianUserId,1,true)"></delivery-info>
            <img class="avatar"
                 :src="item.profile"  slot="reference">
          </el-popover>
          <div class="name">{{ item.remark === null || item.remark === '' ? item.nickname : item.remark }}</div>
        </div>
        <div class="add-to-group" v-show="memberSearchText===''">
          <img class="avatar" style="height: 33px;width: 33px" src="static/images/add.png"
               @click="addMembers">
          <div class="add">添加</div>
        </div>
        <div class="remove-to-group" v-show="memberSearchText===''&&getUser.xiuxianUserId===selectedGroup.managerId">
          <img class="avatar" style="height: 33px;width: 33px" src="static/images/remove.png"
               @click="removeMembers">
          <div class="remove">移除</div>
        </div>
      </div>
      <div class="look-more" v-show="selectedGroup.xiuxianUsers.length>15" @click="avatarsCollapse=false">
        <span class="look-more-text">查看更多</span>
        <i class="el-icon-arrow-down "></i>
      </div>
    </div>
    <div class="avatar-area" v-show="!avatarsCollapse">
      <div class="avatars-info">
        <div v-for="item in selectedGroup.xiuxianUsers" :key="item.xiuxianUserId" class="friend-avatar">
          <el-popover
            popper-class="poppover"
            placement="left-end"
            width="200"
            :ref="`group_${item.xiuxianUserId}`"
            trigger="click"
            :visible-arrow="false"
            @show="getUserInfo(item.xiuxianUserId)"
          >
            <delivery-info
              :user-info="userInfo" :chat-type="1"  @callBack="changUserInfo"
              @closeEvent="closeDeliveryInfo(item.xiuxianUserId,1,true)"></delivery-info>
            <img class="avatar"
                 :src="item.profile"  slot="reference">
          </el-popover>
          <div class="name">{{ item.remark === null || item.remark === '' ? item.nickname : item.remark }}</div>
        </div>
        <div class="add-to-group" v-show="memberSearchText===''">
          <img class="avatar" style="height: 33px;width: 33px" src="static/images/add.png"
               @click="addMembers">
          <div class="add">添加</div>
        </div>

        <div class="remove-to-group" v-show="memberSearchText===''||getUser.xiuxianUserId===selectedGroup.managerId">
          <img class="avatar" style="height: 33px;width: 33px" src="static/images/remove.png"
               @click="removeMembers">
          <div class="remove">移除</div>
        </div>
      </div>
      <div class="look-more" @click="avatarsCollapse=true">
        <span class="look-more-text">收起</span>
        <i class="el-icon-arrow-up "></i>
      </div>
    </div>

    <div class="group-info-area">
      <div class="group-name-area">
        <span style="font-size: 14px">群聊名称</span>
        <div class="group-name" style="" @click="showGroupNameSetUpInput" @mouseenter="groupNameSetUpIcon=true"
             @mouseleave="groupNameSetUpIcon=false" v-show="!setUpGroupNameFlag">
          {{ selectedGroup.groupName }}
          <i class="el-icon-edit" v-show="groupNameSetUpIcon"></i>
        </div>
        <div v-show="setUpGroupNameFlag">
          <el-input size="mini" style="margin-top: 5px" v-model="groupName" ref="groupNameSetUpInput"
                    @blur="setUpGroupName" @keydown.enter.native="setUpGroupName"></el-input>
        </div>
      </div>
      <div class="group-announcement-area">
        <span style="font-size: 14px">群公告</span>
        <div class="group-announcement" @click="showGroupAnnouncement" @mouseenter="groupAnnouncementIcon=true"
             @mouseleave="groupAnnouncementIcon=false">
          {{
            selectedGroup.hasOwnProperty('announcement') ? selectedGroup.announcement.content : '仅群主和管理员可设置'
          }}
        </div>
      </div>

      <div class="group-remark-area">
        <span style="font-size: 14px">备注</span>
        <div class="group-remark" @click="showGroupRemarkSetupInput" v-show="!setupGroupRemarkFlag">
          {{ selectedChat.remark !== null && selectedChat.remark !== '' ? selectedChat.remark : '群聊备注仅自己可见' }}
        </div>
        <div v-show="setupGroupRemarkFlag">
          <el-input size="mini" style="margin-top: 5px" v-model="groupRemark" ref="groupRemarkSetUpInput"
                    @blur="setUpGroupRemark" @keydown.enter.native="setUpGroupRemark"></el-input>
        </div>
      </div>

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

    <div class="group-function-area">
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
    <div class="delete-chat-record-area">
      <el-button type="text" class="delete-chat-record" @click="deleteChatRecord">清空聊天记录</el-button>
    </div>

    <div class="exit-chat-record-area">
      <el-button type="text" class="exit-chat-record" @click="deleteAndExitGroup">删除并退出</el-button>
    </div>


    <el-dialog
      :visible.sync="dialogFriendTransfer"
      width="550px"
      :modal="false"
      @close="resetData"
      class="members-select-dialog"
      center>
      <friend-transfer :open="dialogFriendTransfer" :function-type="functionType" :show-members="showMembers" @addFriendEvent="sendFriendValid"    ref="friendTransfer"
                       @closeTransferDialog="dialogFriendTransfer=false"></friend-transfer>
    </el-dialog>
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
    <group-announcement :dialogGroupAnnouncement.sync="dialogGroupAnnouncement"></group-announcement>

  </div>
</template>

<script>
import {mapGetters, mapMutations, mapState} from "vuex";
import FriendTransfer from "../friend/friendtransfer";
import {
  ADD_FRIEND_NOTICE,
  INVITATION_FRIEND_ENTER_GROUP_FUNCTION,
  REMOVE_MEMBER_FROM_GROUP_FUNCTION, WAITING_FOR_RECEIVE_STATUS
} from "../../services/constant";
import GroupMemberSearch from "../search/groupmembersearch";
import {changeGroupRemark, changGroupName} from "../../apis/group";
import Vue from "vue";
import GroupAnnouncement from "../info/groupannouncement";
import {searchFriend} from "../../apis/search.api";
import DeliveryInfo from "./deliveryinfo";
import {getFriendListItem, getFriendsByFromIdAndToId, sendAddFriend} from "../../apis/friend.api";
import {getChatListItem} from "../../apis/chat.api";

export default {
  name: "ChatInfoGroup",
  components: {DeliveryInfo, GroupAnnouncement, GroupMemberSearch, FriendTransfer},
  computed: {
    ...mapGetters([
      'selectedChat',
      'selectedGroup',
      'getUser'
    ]),
    ...mapState([
      'groupMembers',
      'memberSearchText',
      'chatlist',
      'friendlist'
    ]),
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
      avatarsCollapse: true,
      dialogFriendTransfer: false,
      functionType: 0, //默认为0匹配不到任何功能
      setUpGroupNameFlag: false,
      groupNameSetUpIcon: false,
      groupName: '',
      groupAnnouncementIcon: false,
      dialogGroupAnnouncement: false,
      setupGroupRemarkFlag: false,
      groupRemark: '',
      activationMessageMute: false,
      activationTopChat: false,
      showMembers:false,
    }
  },


  methods: {
    ...mapMutations(
      [
        'setGroupAnnouncement',
        'setGroupAnnouncementNotificationBarShowed',
        'setupGroupName'
      ]
    ),
    getUserInfo(xiuxianUserId) {
      searchFriend(xiuxianUserId).then(res => {
        if (res.data.data != null) {
          this.userInfo = res.data.data
        }
      }).catch(error=>{
        this.$message.error('服务器异常,请重试')
      })
    },

    changUserInfo(xiuxianUserId, remark) {
      let friend = this.friendlist.find(friend => friend.friendXiuxianId === xiuxianUserId)
      let chat = this.chatlist.find(session => session.friendXiuxianId === xiuxianUserId)
      if (chat !== undefined) chat.remark = remark
      friend.remark = remark
    },
    closeDeliveryInfo(index, type, showDialog) {
      if (type === 0) {
        this.$refs[`ref_${index}`][0].doClose()
      } else if (type === 1) {
        console.log(this.$refs[`group_${index}`])
        this.$refs[`group_${index}`][0].doClose()
      }
      this.dialogVisible = showDialog

      if (showDialog) {
        this.form.introduce = "我是" + this.getUser.nickname
        this.friendInfo = this.userInfo
        this.form.remark = this.friendInfo.nickname
      }
    },
    // 发送朋友验证，这个是从friendtransfer传过来的addFriend事件调用的方法
    sendFriendValid(userInfo){
      this.dialogVisible = true
      this.form.introduce = "我是" + this.getUser.nickname
      this.friendInfo = userInfo
      this.form.remark = this.friendInfo.nickname
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
      getFriendsByFromIdAndToId(this.friendInfo.xiuxianUserId, this.getUser.xiuxianUserId).then((res) => {
        if (res.data.data != null) {
          const isFriends = res.data.data
          sendAddFriend(addFriend).then((res) => {
            if (isFriends) {
              getFriendListItem(this.getUser.xiuxianUserId, this.friendInfo.xiuxianUserId).then(res => {
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
    addMembers() {
      this.showMembers=false
      this.dialogFriendTransfer = true
      this.functionType = INVITATION_FRIEND_ENTER_GROUP_FUNCTION
      this.$nextTick(()=>{
        if(this.$refs.friendTransfer!==undefined){
          let groupMembers=[]
          for (let i=0;i<this.selectedGroup.xiuxianUsers.length;i++){
            groupMembers.push(this.selectedGroup.xiuxianUsers[i].xiuxianUserId)
          }

          const disabledFriends=this.friendlist.filter((friend)=>{
            return groupMembers.indexOf(friend.friendXiuxianId)>-1
          })
          let array=[]
          for(let i=0;i<disabledFriends.length;i++){
            array.push(disabledFriends[i].friendXiuxianId)
          }
          this.$refs.friendTransfer.disabledSelected(array)
        }
      });
    },
    removeMembers() {
      this.showMembers=true
      this.dialogFriendTransfer = true
      this.functionType = REMOVE_MEMBER_FROM_GROUP_FUNCTION
    },
    clearSearchText() {
      if (this.$refs.groupMemberSearch !== undefined) {
        this.$refs.groupMemberSearch.del()
      }
    },
    resetData() {
      this.$refs.friendTransfer.resetData()
    },
    showGroupNameSetUpInput() {
      this.setUpGroupNameFlag = true
      this.groupName = this.selectedGroup.groupName
      this.$nextTick(() => {
        this.$refs.groupNameSetUpInput.focus()
      })
    },
    setUpGroupName() {
      this.setUpGroupNameFlag = false
      let data = {
        xiuxianGroupId: this.selectedGroup.xiuxianGroupId,
        groupName: this.groupName
      }

      if (data.groupName !== this.selectedGroup.groupName) {
        changGroupName(data).then(res => {
          Vue.set(this.groupMembers[this.selectedGroup.xiuxianGroupId], 'groupName', data.groupName)
          this.setupGroupName(data)
        })
      }
    },
    show() {
      this.dialogGroupAnnouncement = false
    },
    showGroupRemarkSetupInput() {
      this.setupGroupRemarkFlag = true
      this.groupRemark = this.selectedChat.remark != null ? this.selectedChat.remark : ''
      this.$nextTick(() => {
        this.$refs.groupRemarkSetUpInput.focus()
      })
    },
    setUpGroupRemark() {
      this.setupGroupRemarkFlag = false
      let data = {
        selfXiuxianId: this.getUser.xiuxianUserId,
        friendXiuxianId: this.selectedGroup.xiuxianGroupId,
        remark: this.groupRemark
      }
      if (data.remark !== this.selectedChat.remark) {
        changeGroupRemark(data).then(res => {
          this.selectedChat.remark = data.remark
          for (let i = 0; i < this.chatlist.length; i++) {
            if (this.chatlist[i].type === 1 && this.chatlist[i].friendXiuxianId === this.selectedGroup.xiuxianGroupId) {
              this.chatlist[i].remark = this.groupRemark
              break
            }
          }
          for (let i = 0; i < this.friendlist.length; i++) {
            if (this.friendlist[i].type === 1 && this.friendlist[i].friendXiuxianId === this.selectedGroup.xiuxianGroupId) {
              this.friendlist[i].remark = this.groupRemark
              break
            }
          }
        })
      }
    },
    showGroupAnnouncement() {
      this.dialogGroupAnnouncement = true
    },
    //查看聊天记录
    lookChatRecord() {
      console.log(this.selectedGroup)
    },

    //删除聊天记录
    deleteChatRecord() {

    },
    //删除并退出群聊
    deleteAndExitGroup() {

    }
  },


}
</script>

<style lang="stylus">
.confirm-btn
  background: #00dc41
.add-friend-dialog
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

.chat-info-group
  width: 250px
  padding: 20px

  .avatar-area
    margin-left: 8px
    padding-bottom: 20px
    border-bottom 1px solid #f2efee

    .avatars-info
      display: grid;
      grid-template-columns: auto auto auto auto;
      grid-row-gap: 10px;
      width: 100%

      .friend-avatar
        width: 45px

        .avatar
          cursor: pointer
          width: 35px
          height: 35px
          margin-left: 4px

        .name
          vertical-align: center
          font-size: 10px
          margin-top: 5px
          text-align: center
          overflow: hidden
          white-space: nowrap
          text-overflow: ellipsis

      .add-to-group, .remove-to-group
        width: 45px


        .avatar
          cursor: pointer
          width: 35px
          height: 35px
          margin-left: 4px
          border: 1px solid #8a8a8a

        .add, .remove
          font-size: 10px
          margin-top: 5px
          text-align: center


    .look-more
      margin-top: 15px
      text-align: center
      vertical-align: center
      line-height: 20px
      width: 100%
      cursor: pointer

      .look-more-text
        font-size: 13px
        color: #adaeaf

  .group-info-area
    margin-top: 20px
    margin-left: 8px

    .group-name-area
      .group-name
        font-size: 14px
        color: #8c939d
        margin-top: 10px
        cursor: pointer

    .group-announcement-area
      margin-top: 20px

      .group-announcement
        margin-top: 10px
        cursor: pointer
        overflow: hidden
        white-space: nowrap
        text-overflow: ellipsis
        font-size: 14px
        color: #8c939d
        width: 95%

    .group-remark-area
      margin-top: 20px
      padding-bottom: 20px
      border-bottom 1px solid #f2efee

      .group-remark
        margin-top: 10px
        cursor: pointer
        overflow: hidden
        white-space: nowrap
        text-overflow: ellipsis
        font-size: 14px
        color: #8c939d
        width: 95%

  .chat-record-area
    margin-left: 8px
    padding-top: 15px
    padding-bottom: 15px
    border-bottom: 1px solid #f2efee

    .chat-record
      font-size: 14px
      cursor: pointer

  .group-function-area
    padding: 15px 0 15px 0
    margin-left: 8px
    border-bottom: 1px solid #f2efee

    .message-mute, .top-chat
      font-size: 14px

  .delete-chat-record-area, .exit-chat-record-area
    padding: 5px 0 5px 0
    margin-left: 8px
    border-bottom: 1px solid #f2efee

    .delete-chat-record, .exit-chat-record
      font-size: 14px
      width: 100%
      color: red
      vertical-align: center

</style>
