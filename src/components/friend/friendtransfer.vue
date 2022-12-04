<template>
  <el-container class="transfer-main">
    <el-header height="40px" style="padding: 0 0 20px 10px">
      <el-col :span="12">
        <friend-search style="padding: 0 10px 10px 0;width: 218px" ref="friendSearch"></friend-search>
      </el-col>
      <el-col :span="12">
        <div class="friend-number" v-if="functionType===1">
          <span style="color: black;font-size: 14px;margin-left: 20px">分别转发给:</span>
          <span style="color: #adaeaf;font-size: 8px;margin-left: 80px" v-if="selectedNumber===0">未选择聊天</span>
          <span style="color: #adaeaf;font-size: 8px;margin-left: 50px"
                v-else>{{ '已选择' + selectedNumber + '个聊天' }}</span>
        </div>

        <div class="friend-number" v-else>

          <span style="color: black;font-size: 14px;margin-left: 20px" v-if="selectedNumber===0">{{functionType===removeFunctionType?'请勾选需要删除的群成员':'请勾选需要添加的联系人'}}</span>
          <span style="color: black;font-size: 14px;margin-left: 20px"
                v-else>{{functionType===removeFunctionType?'已选择' + selectedNumber + '个群成员':'已选择' + selectedNumber + '个联系人' }}</span>
        </div>
      </el-col>
    </el-header>
    <el-container>
      <el-aside class="left" width="250px" v-if="!showMembers">
        <ul>
          <li v-for="item in searchedFriends " class="left-frienditem" :key="item.friendXiuxianId" v-show="item.type===0" :id="`left_${item.friendXiuxianId}`">
            <div class="left-friend-info">
              <img class="left-avatar" width="36" height="36" :src="item.profile">
              <div  class="left-remark">
                {{ item.remark === null || item.remark === "" ? item.nickname : item.remark }}
              </div>
            </div>
            <div class="left-right-checkbox">
              <input class="left-checkbox" type="checkbox" :id="item.friendXiuxianId"
                     @click="addFriend(item)"></input>
            </div>
          </li>
        </ul>
      </el-aside>
      <el-aside class="left" width="250px" v-else>
        <ul>
          <li v-for="item in searchedMembers " class="left-frienditem" :key="item.xiuxianUserId" v-show="item.xiuxianUserId!==getUser.xiuxianUserId" :id="`left_${item.xiuxianUserId}`">
            <div class="left-friend-info">
              <img class="left-avatar" width="36" height="36" :src="item.profile">
              <div  class="left-remark">
                {{ item.nickname }}
              </div>
            </div>
            <div class="left-right-checkbox">
              <input class="left-checkbox" type="checkbox" :id="item.xiuxianUserId"
                     @click="addFriend(item)"></input>
            </div>
          </li>
        </ul>
      </el-aside>

      <el-main class="right">
        <ul>
          <li v-for="(item) in selectedFriends " class="right-frienditem" :key="item.friendXiuxianId">
            <div class="right-friend-info">
              <img class="right-avatar" width="36" height="36" :src="item.profile">
              <div class="right-remark">
                {{ item.remark === null || item.remark === "" ? item.nickname : item.remark }}
              </div>
            </div>
            <div class="right-right-checkbox">
              <i class="el-icon-error delete-but" @click="deleteSelectedFriend(item.friendXiuxianId)"></i>
            </div>
          </li>
        </ul>


      </el-main>
    </el-container>
    <el-footer height="20px">
      <div class="but-group">
        <el-button type="success" size="mini" ref="send" :disabled="disable" @click="send">发送</el-button>
        <el-button size="mini" @click="$emit('closeTransferDialog')">取消</el-button>
      </div>
    </el-footer>

    <el-dialog
      :visible.sync="dialogRemoveFriends"
      width="20%"
      :modal-append-to-body="false"
      :close-on-click-modal="false"
      center>
      <span>{{removeMemberMessage}}</span>
      <span slot="footer" class="dialog-footer">
    <el-button type="danger" size="mini" @click="removeMembers">确 定</el-button>
    <el-button  size="mini" @click="dialogRemoveFriends = false">取 消</el-button>
  </span>
    </el-dialog>
  </el-container>
</template>

<script>

import FriendSearch from "../search/friendsearch";
import {mapActions, mapGetters, mapState} from "vuex";
import {REMOVE_MEMBER_FROM_GROUP_FUNCTION,INVITATION_FRIEND_ENTER_GROUP_FUNCTION} from "../../services/constant";
import {getFriendsByFromIdAndToId} from "../../apis/friend.api";
import Vue from "vue";
import {sendSingleChat} from "../../apis/chat.api";
import {inviteJoinGroup, removeFromGroup} from "../../apis/group";

export default {
  name: "FriendTransfer",
  props:{
    open:Boolean,
    functionType:Number,
    showMembers:{ //控制显示群成员变量
      type:Boolean,
      default:false
    }
  },
  components: {
    FriendSearch,
  },

  data() {
    return {
      selectedNumber: 0,
      selectedFriends: [],
      friendsSet: undefined,
      disabledFriendsSet:undefined,
      disable:true,
      removeFunctionType:REMOVE_MEMBER_FROM_GROUP_FUNCTION,
      dialogRemoveFriends:false,
      removeMemberMessage:'',//删除那些群成员消息

    };
  },

  mounted() {
    this.friendsSet = new Set()
  },
  computed: {
    ...mapGetters([
      'searchedFriends',
      'getUser',
      'searchedMembers'
    ]),
    ...mapState([
      'friendSearchText',
      'selectId',
      'groupMembers'
    ]),

  },
  methods: {
    ...mapActions([
      'actionAddGroupMembers',
      'actionSetGroupNumber',
      'actionRemoveGroupMembers'
    ]),
    addFriend(item) {

      //先验证双方是否为好友
      if(item.hasOwnProperty('xiuxianUserId')){
        item.friendXiuxianId=item.xiuxianUserId
        item.remark=''
      }

      let pre=document.getElementById(item.friendXiuxianId).checked //先记录点击复选框后的状态
      if(this.functionType===INVITATION_FRIEND_ENTER_GROUP_FUNCTION){
        if(pre){
          document.getElementById(item.friendXiuxianId).checked=false
        }
        getFriendsByFromIdAndToId(item.friendXiuxianId, this.getUser.xiuxianUserId).then(res => {
          if (res.data.data != null) {
            if (!res.data.data) {  //不是朋友
              const h = this.$createElement;
              this.$confirm(item.nickname+' 开启了好友验证,你还不是他(她)好友,请先发送验证请求,对方验证通过后,才能邀请入群.', '', {
                confirmButtonText: '发送',
                cancelButtonText: '取消',
                type: 'warning'
              }).then(() => {
                const userInfo={
                  xiuxianUserId:item.friendXiuxianId,
                  nickname:item.nickname
                }
                //产生主动添加朋友事件
                //TODO 后端相关功能待完成
                this.$emit('addFriendEvent',userInfo)
              }).catch(() => {
              });
            }else {
              document.getElementById(item.friendXiuxianId).checked=pre
              this.selectFriend(item)
            }
          }
        })
      }else {
        this.selectFriend(item)
      }

    },
    selectFriend(item){

      let index = -1;
      if (!document.getElementById(item.friendXiuxianId).checked) {
        for (let i = 0; i < this.selectedFriends.length; i++) {
          if (this.selectedFriends[i].friendXiuxianId === item.friendXiuxianId) {
            index = i
            break
          }
        }
        if (index !== -1) {

          this.friendsSet.delete(this.selectedFriends[index].friendXiuxianId)
          this.selectedFriends.splice(index, 1)
        }
      } else {
        this.selectedFriends.push(item)
        this.friendsSet.add(item.friendXiuxianId)
      }

      this.selectedNumber = this.selectedFriends.length
    },
    deleteSelectedFriend(friendXiuxianId) {
      let index = -1
      for (let i = 0; i < this.selectedFriends.length; i++) {
        if (this.selectedFriends[i].friendXiuxianId === friendXiuxianId) {
          index = i
          break
        }
      }
      if (index !== -1) {
        this.selectedFriends.splice(index, 1)
        document.getElementById(friendXiuxianId).checked = false
        this.friendsSet.delete(friendXiuxianId)
      }
      this.selectedNumber = this.selectedFriends.length

    },

    // 在关闭推荐给朋友这个弹窗框后，重置所有数据
    resetData() {
      this.$refs.friendSearch.del()
      this.selectedNumber=0
      for(let i=0;i<this.selectedFriends.length;i++){
        document.getElementById(this.selectedFriends[i].friendXiuxianId).checked=false
      }
      if(this.disabledFriendsSet!==undefined){
        for(let friendXiuxianId of this.disabledFriendsSet){
          document.getElementById(friendXiuxianId).checked=false
          document.getElementById(friendXiuxianId).removeAttribute("disabled")
          document.getElementById("left_"+friendXiuxianId).style.opacity="1"
        }
      }
      this.selectedFriends=[]
      this.friendsSet=new Set()
      this.disabledFriendsSet=new Set()
    },
    send(){
      // TODO根据functionType的不同实现不同的功能,functionType定义在了constant里面
      //邀请朋友进群
      if(this.functionType===INVITATION_FRIEND_ENTER_GROUP_FUNCTION){
        let members=[]
        let message=''
        let friends=[]
        for(let i=0;i<this.selectedFriends.length;i++){
          const friendXiuxianId=this.selectedFriends[i].friendXiuxianId
          members.push(friendXiuxianId)
          const name=this.selectedFriends[i].remark === null || this.selectedFriends[i].remark === "" ? this.selectedFriends[i].nickname : this.selectedFriends[i].remark
          if(i!==this.selectedFriends.length-1){
            message+=name+","
          }else {
            message+=name
          }
          friends.push({
            xiuxianUserId:this.selectedFriends[i].friendXiuxianId,
            profile:this.selectedFriends[i].profile,
            nickname:this.selectedFriends[i].nickname,
            remark:this.selectedFriends[i].remark
          })
        }
        let data={
          xiuxianUserId:this.getUser.xiuxianUserId,
          xiuxianGroupId:this.selectId,
          membersList:members
        }
        // 计算邀请朋友后,群的总人数
        const membersNumber=this.selectedFriends.length+this.groupMembers[this.selectId].xiuxianUsers.length
        inviteJoinGroup(data).then((res)=>{
          //邀请成功后添加成员
          this.actionAddGroupMembers({
            xiuxianGroupId:this.selectId,
            membersList:friends
          })
          this.actionSetGroupNumber({
            xiuxianGroupId:data.xiuxianGroupId,
            number:membersNumber
          })
          this.$message.success('邀请 '+message+' 加入群聊成功')
          this.$emit('closeTransferDialog')
        }).catch((err)=>{
          this.$message.error('邀请朋友入群失败,请稍后重试.')
        })
        console.log('邀请朋友进入群聊')
      }else if(this.functionType===REMOVE_MEMBER_FROM_GROUP_FUNCTION){
        this.removeMemberMessage="确定要删除群成员 "
        for(let i=0;i<this.selectedFriends.length;i++){
          const name=this.selectedFriends[i].remark === null || this.selectedFriends[i].remark === "" ? this.selectedFriends[i].nickname : this.selectedFriends[i].remark
          this.removeMemberMessage+=name
        }
        this.removeMemberMessage+=" ?"
        this.dialogRemoveFriends=true

      }
    },
    //禁用已经有的成员。
    disabledSelected(disabledFriends){
      this.disabledFriendsSet=new Set()
      for(let i=0;i<disabledFriends.length;i++){
        const friendXiuxianId=disabledFriends[i]
        this.disabledFriendsSet.add(friendXiuxianId)
        document.getElementById(friendXiuxianId).checked=true

        document.getElementById(friendXiuxianId).setAttribute("disabled","disabled")

        document.getElementById("left_"+friendXiuxianId).style.opacity="0.5"
      }
    },

    //移出群中的成员
    removeMembers(){

      let members=[]
      let message=''
      for(let i=0;i<this.selectedFriends.length;i++){
        const friendXiuxianId=this.selectedFriends[i].friendXiuxianId
        const name=this.selectedFriends[i].remark === null || this.selectedFriends[i].remark === "" ? this.selectedFriends[i].nickname : this.selectedFriends[i].remark
        if(i!==this.selectedFriends.length-1){
          message+=name+","
        }else {
          message+=name
        }
        members.push(friendXiuxianId)
      }


      let data={
        xiuxianUserId:this.getUser.xiuxianUserId,
        xiuxianGroupId:this.selectId,
        membersList:members
      }
      const membersNumber=this.groupMembers[this.selectId].xiuxianUsers.length-members.length
      removeFromGroup(data).then(res=>{
        //移出成功添加成员
        this.actionRemoveGroupMembers({
          xiuxianGroupId:this.selectId,
          membersList:members
        })
        this.actionSetGroupNumber({
          xiuxianGroupId:data.xiuxianGroupId,
          number:membersNumber
        })
        this.$message.success('将 '+message+' 移出群聊成功')
        this.$emit('closeTransferDialog')
        console.log('将成员移出群聊')
      }).catch(error=>{
        this.$message.error('将成员移出群聊失败，请稍后重试')
      })
      this.dialogRemoveFriends=false
    }

  },

  watch: {
    searchedFriends() {
      this.$nextTick(function () {
        for(let i = 0; i < this.searchedFriends.length;i++)
        {
          const friendXiuxianId = this.searchedFriends[i].friendXiuxianId
          if (this.friendsSet !== undefined && this.friendsSet.has(this.searchedFriends[i].friendXiuxianId)) {
            document.getElementById(friendXiuxianId).checked = true
          }else if(this.disabledFriendsSet!==undefined&&this.disabledFriendsSet.has(this.searchedFriends[i].friendXiuxianId)){
            document.getElementById(friendXiuxianId).checked=true
            document.getElementById(friendXiuxianId).setAttribute("disabled","disabled")
            document.getElementById("left_"+friendXiuxianId).style.opacity="0.5"
          }
        }
      })
    },
    selectedNumber(val){
      if(val===0){
        this.disable=true
      }else {
        this.disable=false
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.transfer-main
  height: 400px
  padding-bottom: 0px
  .friend-number
    margin-top: 12px

  .left
    border-right 1px solid #e5e3e2
    height: 380px

    .left-frienditem
      display: flex
      padding: 10px
      transition: background-color .1s
      font-size: 0
      height: 40px

      &:hover
        background-color: rgb(220, 220, 220)

      &.active
        background-color: #c4c4c4

      .left-friend-info
        display: flex

        transition: background-color .1s
        font-size: 0
        width: 204px

        .left-avatar
          border-radius: 2px
          margin-right: 12px

        .left-remark
          font-size: 14px
          line-height: 36px
          color: black

      .left-right-checkbox
        position: relative
        flex: 1
        margin-top: 12px

  .right
    height: 345px
    padding: 0 0 20px 20px

    .right-frienditem
      display: flex
      padding: 10px 0 10px 10px
      transition: background-color .1s
      font-size: 0
      height: 40px


      .right-friend-info
        display: flex

        transition: background-color .1s
        font-size: 0
        width: 204px

        .right-avatar
          border-radius: 2px
          margin-right: 12px

        .right-remark
          font-size: 14px
          line-height: 36px
          color: black

      .right-right-checkbox
        position: relative
        flex: 1
        margin-top: 9px

        .delete-but
          font-size: 18px
          cursor: pointer
  .but-group
    margin-left:310px

  input[type=checkbox] {
    cursor: pointer;
    position: relative;
  }

  input[type=checkbox]::after {
    position: absolute;
    top: 0;
    background-color: #fff;
    color: #fff;
    width: 15px;
    height: 15px;
    display: inline-block;
    visibility: visible;
    padding-left: 0px;
    text-align: center;
    content: ' ';

    box-sizing: border-box;
    border: 1px solid #ddd;
  }

  input[type=checkbox]:checked::after {
    content: "";
    background-color: #319950;
    border-color: #319950;
  }

  input[type=checkbox]:checked::before {
    content: '';
    position: absolute;
    top: 1px;
    left: 5px;
    width: 3px;
    height: 8px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
    z-index: 1;

  }

</style>
