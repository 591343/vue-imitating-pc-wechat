<template>
  <div class="delivery-info">
    <div class="main">
      <div class="left-info">
        <el-image
          class="delivery-info-avatar"
          :src="userInfo.profile"
          :preview-src-list="[userInfo.profile]">
        </el-image>
      </div>
      <div class="right-info">
        <div class="name"><span>{{ showName(userInfo) }}</span></div>
        <div :class="[userInfo.sex===1?'gender-male':'gender-female']"></div>
        <div class="nickname"><span>昵称:&nbsp&nbsp</span>{{ userInfo.nickname }}</div>
        <div class="wxid"><span>修仙号:&nbsp&nbsp</span>{{ userInfo.xiuxianUserId }}</div>
        <div class="area"><span>地区:&nbsp&nbsp</span>{{ userInfo.area }}</div>
      </div>
    </div>
    <div class="middle-info" v-show="isFriend(userInfo.xiuxianUserId)&&userInfo.xiuxianUserId!==user.xiuxianUserId">
      <div class="divider"/>
      <div class="remark-info" v-if="remark!==undefined&&remark!==''">
        <span class="remark-span" style="margin-right: 22px">备注名</span>
        {{ remark }}
        <i class="el-icon-edit change-remark" @click="changeRemark" ></i>
      </div>
      <div class="remark-info-add" v-else>
        <span class="remark-span" style="margin-right: 22px">备注名</span>
        <span style="cursor: pointer" v-if="!showInput" @click="showInput=true">点击添加备注</span>
        <el-input  ref="remarkInput" size="mini"  maxlength="15" v-model="remarkBackUp" @change="addRemark"  @blur="remarkBackUp===''?showInput=false:remark=remarkBackUp" v-else></el-input>
      </div>
      <div class="permission-info" v-show="onlyChat(userInfo.xiuxianUserId)"><span
        class="permission-span" style="margin-right: 13px">朋友权限</span>仅聊天
      </div>


      <div class="divider"/>
    </div>


    <div class="send-info" v-show="userInfo.xiuxianUserId!==user.xiuxianUserId">
      <div class="add-friend" @click="sendMessage(userInfo.xiuxianUserId)" v-if="isFriend(userInfo.xiuxianUserId)">
        <span style="font-size: 12px">发消息</span>
      </div>
      <div class="send-message" style="margin-top: 20px" @click="addFriend(userInfo.xiuxianUserId)" v-else>
        <span style="font-size: 12px">添加到通讯录</span>
      </div>
    </div>




  </div>
</template>

<script>

import {mapActions, mapState} from "vuex";
import {changeFriendsRemark} from "../../apis/friend.api";

export default {
  name: "DeliveryInfo",
  props: ['userInfo', 'chatType'],
  data() {
    return {
      remark: "",
      showInput: false,
      remarkBackUp: "",
      findFlag: false,
      name: "",
      changRemarkFlag:true,
    }
  },

  computed: {
    ...mapState([
      'user',
      'friendlist'

    ])
  },
  methods: {
    ...mapActions([
      'selectFriend'
    ]),
    isFriend(xiuxianUserId) {
      let find = this.friendlist.find(friend => friend.friendXiuxianId === xiuxianUserId)
      return find !== undefined
    },
    onlyChat(xiuxianUserId) {
      let find = this.friendlist.find(friend => friend.friendXiuxianId === xiuxianUserId)
      return find !== undefined && find.permission === 1
    },
    sendMessage(xiuxianUserId) {

      this.$emit("chatEvent")
      if (this.chatType === 1) {
        this.selectFriend(xiuxianUserId)
        this.$store.dispatch('send')
        this.$store.dispatch('search', '')
      }

    },
    addFriend(xiuxianUserId) {
      this.dialogVisible=true
      this.$emit("closeEvent")
    },
    showName(userInfo) {
      const xiuxianUserId = userInfo.xiuxianUserId

      if(!this.findFlag){
        let find = this.friendlist.find(friend => friend.friendXiuxianId === xiuxianUserId)
        if (find !== undefined) {
          if (find.remark != null && find.remark !== "") {
            this.remark=find.remark
            return this.remark
          }
        }
      }
      if(this.remarkBackUp.length>0) return this.remarkBackUp

      return userInfo.nickname
    },
    addRemark() {
      this.showInput = true
      let changeFriendRemark = {
        selfXiuxianId: this.user.xiuxianUserId,
        friendXiuxianId: this.userInfo.xiuxianUserId,
        remark: this.remarkBackUp
      }
      this.remark = this.remarkBackUp
      //修改朋友的备注
      changeFriendsRemark(changeFriendRemark).then(res => {
        this.$emit('callBack', this.userInfo.xiuxianUserId, this.remark)
        this.findFlag = false
      }).catch(error => {
        this.$message.error(error)
      })
    },
    changeRemark() {
      this.showInput = true
      this.remarkBackUp = this.remark
      this.remark = ""
      this.findFlag=true
    }
  },
}
</script>

<style lang="stylus" scoped>
.delivery-info

  padding: 12px

  .main
    display: flex

    .delivery-info-avatar
      width: 55px
      height: 55px
      cursor: pointer
      border-radius: 5px

    .right-info
      position: relative
      flex: 1
      margin-left: 10px
      .name
        display: inline-block
        font-size: 14px
        color: black
        font-family: "Microsoft YaHei"
        margin-bottom: 2px

      .gender-male, .gender-female
        display: inline-block
        width: 16px
        height: 16px
        vertical-align: top
        margin-top: 2px

      .gender-male
        background-image: url(man.png)
        background-size: cover

      .gender-female
        background-image: url(woman.png)
        background-size: cover

      .wxid, .area, .nickname
        font-size: 11px
        color: #8c939d


  .middle-info
    .divider
      margin-top: 20px
      margin-bottom: 20px
      width: 100%
      border-bottom: 1px solid #f2efee

    .remark-info, .permission-info
      font-size: 13px
      color: black
      margin-bottom: 10px

      .remark-span, .permission-span
        font-size: 13px
        color: #8c939d
      .change-remark
        opacity: 0
        &:hover
          cursor: pointer
          opacity: 1

    .remark-info-add
      font-size: 13px
      color: #8c939d
      margin-bottom: 10px

      .el-input
        width: 100px


  .send-info
    width: 100%
    display: flex
    justify-content: center

    .add-friend, .send-message
      width: 100px
      height: 33px
      text-align: center
      line-height: 33px
      border-radius: 2px
      color: #fff
      background-color: #1aad19
      cursor: pointer

      &:hover
        background: rgb(18, 150, 17)


</style>
