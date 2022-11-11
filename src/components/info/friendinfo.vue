<!-- 好友信息 -->
<template>
  <div class="Info-wrapper">
    <!--    <div class="newfriend" v-show="selectedFriend.friendXiuxianId === 0">-->
    <!--      <div class="nickname">{{ selectedFriend.nickname }}</div>-->
    <!--    </div>-->


    <div class="friendInfo" v-show="selectFriendId!==0&&selectFriendId!==-1">
      <div class="esInfo">
        <div class="left">
          <div class="people">
            <div class="nickname">{{ selectedFriend.nickname }}</div>
            <div :class="[selectedFriend.sex===1?'gender-male':'gender-female']"></div>
            <el-popover
              placement="right"
              :visible-arrow="false"
              width="150"
              trigger="click"
              class="popover"
            >
              <ul class="menu">
                <li class="menu_item" style="border-bottom: 1px solid #e5e3e2;" @click="showRecommendToFriendDialog">把他(她)推荐给朋友</li>
                <li class="menu_item" @click="showSetupRemarkDialog">设置备注</li>
                <li class="menu_item" @click="showSetupFriendPermissionDialog">设置朋友权限</li>
              </ul>
              <i class="el-icon-more friend-more" slot="reference"></i>
            </el-popover>
          </div>
          <div class="signature">{{ selectedFriend.signature }}</div>
        </div>
        <div class="right">
          <img class="avatar" width="60" height="60" :src="selectedFriend.profile">
        </div>
      </div>
      <div class="detInfo">
        <div class="remark" v-if="this.selectedFriend.remark!==undefined&&this.selectedFriend.remark!==''">
          <span>备注名</span>{{ this.selectedFriend.remark }}
        </div>

        <div class="area"><span>地&nbsp&nbsp&nbsp区</span>{{ selectedFriend.area }}</div>
        <div class="wxid"><span>修仙号</span>{{ selectedFriend.friendXiuxianId }}</div>
        <div class="permission" v-show="selectedFriend.permission===1"><span style="margin-right: 25px">朋友权限</span>仅聊天
        </div>
      </div>
      <div class="send" @click="send">
        <span>发消息</span>
      </div>
    </div>


    <div class="friendInfo" v-show="selectFriendId === -1 &&friend!=null">
      <div class="esInfo">
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
        <div class="wxid" v-model="friend.xiuxianId"><span>修仙号</span>{{ friend.xiuxianId }}</div>
      </div>
      <div class="send" @click="openAddFriendDialog">
        <span>添加到通讯录</span>
      </div>
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

    <!--    设置备注对话框-->
    <el-dialog
      title="设置备注"
      :visible.sync="dialogSetupRemarkVisible"
      width="300px"
      :modal="false"
      :show-close="false"
      class="setup-remark-dialog"
      center>
      <span class="input-name">备注名</span>
      <el-input
        v-model="remark"
        maxlength="15"
        clearable
        style="margin-top: 10px;margin-bottom: 10px">
      </el-input>
      <span slot="footer" class="dialog-footer">
      <el-button @click="dialogSetupRemarkVisible = false" size="medium">取 消</el-button>
      <el-button type="success" @click="changeRemark" size="medium">确 定</el-button>
    </span>
    </el-dialog>

    <el-dialog
      title="设置备注"
      :visible.sync="dialogSetupFriendPermissionVisible"
      width="300px"
      :modal="false"
      :show-close="false"
      class="setup-friend-permission-dialog"
      center>
      <span class="input-name">设置朋友权限</span>
      <div class="permission">
        <el-radio-group v-model="permission" style="width:100%;margin-top: 10px;margin-bottom: 10px" fill="#1aad19">
          <div class="friend-permission">
            <el-radio-button class="friend-permission-button" label="0">聊天、朋友圈、修仙运动</el-radio-button>
          </div>
          <div class="friend-permission">
            <el-radio-button class="friend-permission-button" label="1">仅聊天</el-radio-button>
          </div>
        </el-radio-group>
      </div>
      <span slot="footer" class="dialog-footer">
      <el-button @click="dialogSetupFriendPermissionVisible = false" size="medium">取 消</el-button>
      <el-button type="success" @click="changePermission" size="medium">确 定</el-button>
    </span>
    </el-dialog>


    <el-dialog
      :visible.sync="dialogRecommendToFriend"
      width="550px"
      :modal="false"
      @close="resetData"
      class="recommend-friend--dialog"
      center>
      <friend-transfer :open="dialogRecommendToFriend" :function-type="functionType" ref="friendTransfer" @closeTransferDialog="dialogRecommendToFriend=false"></friend-transfer>
    </el-dialog>
  </div>


</template>

<script>

import {mapActions, mapGetters, mapState} from 'vuex'
import {searchFriend} from "../../apis/search.api";
import {
  changeFriendsPermission,
  changeFriendsRemark,
  getFriendListItem,
  getFriendsByFromIdAndToId,
  sendAddFriend
} from "../../apis/friend.api";
import {ADD_FRIEND_NOTICE, WAITING_FOR_RECEIVE_STATUS} from "../../services/constant";
import {getChatListItem} from "../../apis/chat.api";
import store from "../../store";
import FriendTransfer from "../friend/friendtransfer";
import {RECOMMENDATION_TO_FRIEND_FUNCTION} from "../../services/constant"
export default {
  name: "friendinfo",
  components: {FriendTransfer},
  data() {
    return {
      friend: {},
      group: {},
      remark: "",
      permission: '0',
      dialogVisible: false,
      form: {
        introduce: "我是",
        remark: '',
        permission: '0',
      },
      dialogSetupRemarkVisible: false,
      dialogSetupFriendPermissionVisible: false,
      dialogRecommendToFriend: false,
      functionType:RECOMMENDATION_TO_FRIEND_FUNCTION,
    }
  },
  computed: {
    ...mapGetters([
      'selectedFriend',

    ]),
    ...mapState([
      'selectFriendId',
      'searchText',
      'user',
      'friendlist'
    ]),
  },
  created() {
    this.friend = {}
    this.getFriendInfo()
  },
  mounted() {
    this.form.introduce = '我是' + this.user.nickname

  },


  methods: {
    ...mapActions([
      'selectFriend',
    ]),
    send() {
      this.$store.dispatch('send')
      this.$store.dispatch('search', '')
    },
    openAddFriendDialog() {
      this.dialogVisible = true
      this.form.remark = this.friend.nickname
    },
    //添加朋友到通讯录
    addFriend() {
      this.dialogVisible = false
      let addFriend = {
        noticeMessageVo: {
          fromId: this.user.xiuxianUserId,
          toId: this.friend.xiuxianId,
          noticeMessageType: ADD_FRIEND_NOTICE,
          noticeTime: new Date().getTime(),
          status: WAITING_FOR_RECEIVE_STATUS,
          content: this.form.introduce,
        },
        remark: this.form.remark,
        permission: parseInt(this.form.permission)
      }

      //先判断一下对方有没有删除自己
      getFriendsByFromIdAndToId(this.friend.xiuxianId, this.user.xiuxianUserId).then((res) => {
        if (res.data.data != null) {
          const isFriends = res.data.data
          sendAddFriend(addFriend).then((res) => {
            if (isFriends) {
              getFriendListItem(this.user.xiuxianUserId, this.friend.xiuxianId).then(res => {
                if (res.data.data != null) {
                  let friendListItem = res.data.data
                  this.friendlist.push(friendListItem)
                  //接受成功跳转到好友信息页面
                  this.selectFriend(this.friend.xiuxianId)
                  this.$router.push("/friendInfo")
                }
              })
              getChatListItem(this.user.xiuxianUserId, this.friend.xiuxianId).then(res => {
                if (!res.data.data) return
                const chatListItem = res.data.data

                let result = store.state.chatlist.find(session => session.friendXiuxianId === this.friend.xiuxianUserId);
                //还没添加到聊天列表中,但是对方给我发消息了，先把对方加入聊天列表中

                if (!result) {
                  for (let i = 0; i < store.state.chatlist.length; i++) {
                    store.state.chatlist[i].index++;
                  }
                  store.state.chatlist.unshift(chatListItem)
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
    getFriendInfo() {
      if (this.selectFriendId === -1) {
        if (this.searchText !== '') {
          this.selectFriend(this.searchText)
          if (this.selectedFriend.friendXiuxianId !== -1 && this.selectedFriend.type === 0) {
            return;
          } else {
            //恢复状态
            this.selectFriend(-1)
          }

          searchFriend(this.searchText).then((res) => {
            // 0代表成功
            if (res.data.code === 0) {
              let data = res.data.data;
              if (data != null) {
                this.friend.nickname = data.nickname
                this.friend.sex = data.sex
                this.friend.signature = data.signature
                this.friend.area = data.area
                this.friend.xiuxianId = data.xiuxianUserId
                this.friend.profile = data.profile
                this.$forceUpdate()  //强制渲染
              } else {
                this.selectFriend(0)
                this.$alert('无法找到该用户,请检查你填写的账号是否正确', '', {
                  confirmButtonText: '确定',
                });
              }
            }
          }).catch(error => {
            this.selectFriend(0)
            // 错误分为 status-请求错误 和 code-账号密码错误
            this.$message.error(error);
            console.log(error);
          })
        }

      }
    },
    showSetupRemarkDialog() {
      this.dialogSetupRemarkVisible = true
      if (this.selectedFriend.remark !== undefined && this.selectedFriend.remark !== "") {
        this.remark = this.selectedFriend.remark
      }
    },
    changeRemark() {

      let changeFriendRemark = {
        selfXiuxianId: this.user.xiuxianUserId,
        friendXiuxianId: this.selectedFriend.friendXiuxianId,
        remark: this.remark
      }
      this.dialogSetupRemarkVisible = false
      //修改朋友的备注
      changeFriendsRemark(changeFriendRemark).then(res => {
        this.selectedFriend.remark = this.remark
        this.$message.success("备注名修成功")

      }).catch(error => {
        this.$message.error(error)
      })

    },
    showSetupFriendPermissionDialog(){
      this.permission=this.selectedFriend.permission
      this.dialogSetupFriendPermissionVisible=true
    },
    changePermission(){
      let changeFriendPermission = {
        selfXiuxianId: this.user.xiuxianUserId,
        friendXiuxianId: this.selectedFriend.friendXiuxianId,
        permission: this.permission
      }
      this.dialogSetupFriendPermissionVisible=false
      changeFriendsPermission(changeFriendPermission).then(res => {
        this.selectedFriend.permission = parseInt(this.permission)
        console.log(this.selectedFriend)
        this.$message.success("朋友权限修改成功")
      }).catch(error => {
        this.$message.error(error)
      })

    },
    showRecommendToFriendDialog(){
      this.dialogRecommendToFriend=true
    },
    resetData(){
      this.$refs.friendTransfer.resetData()
    }

  },


  watch: {
    selectFriendId(newVal, oldVal) {
      this.friend = {}
      this.getFriendInfo()
    }
  }
}

</script>

<style lang="stylus">
.newfriend
  height: 60px
  padding: 28px 0 0 30px
  box-sizing: border-box
  border-bottom: 1px solid #e7e7e7

  .nickname
    font-size: 18px

.friendInfo
  padding: 0 90px

.esInfo
  display: flex
  align-items: center
  padding: 100px 0 45px 0

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

      .friend-more
        display: inline-block
        cursor: pointer

        &:hover
          background-color: #d1d1d1


    .signature
      font-size: 14px
      color: rgba(153, 153, 153, .8)

  .right
    .avatar
      border-radius: 3px

.detInfo
  padding: 40px 0
  border-top: 1px solid #e7e7e7
  border-bottom: 1px solid #e7e7e7


  .remark, .area, .wxid, .permission
    font-size: 14px
    margin-top: 20px


    span
      font-size: 14px
      color: rgba(153, 153, 153, .8)
      margin-right: 40px

  .remark
    margin-top: 0

.send
  position: relative
  text-align: center
  width: 140px
  height: 36px
  left: 115px
  top: 50px
  line-height: 36px
  font-size: 14px
  color: #fff
  background-color: #1aad19
  cursor: pointer
  border-radius: 2px

  &:hover
    background: rgb(18, 150, 17)

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



.menu_item
  line-height: 20px
  font-size: 11px
  text-align: left
  font-family: "Microsoft YaHei"
  color: black
  padding: 3px 25px 3px 20px

.menu_item:hover
  background-color: #e5e5e5;
  cursor: default


.setup-remark-dialog, .setup-friend-permission-dialog
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
    color: #adaeaf
    margin-bottom: 5px



.permission
  .friend-permission
    .friend-permission-button
      .el-radio-button__inner
        width: 250px
        color: black

</style>

