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
      <el-aside class="left" width="250px">
        <ul>
          <li v-for="item in searchedFriends " class="left-frienditem" :key="item.friendXiuxianId" v-show="item.type===0">
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
  </el-container>
</template>

<script>

import FriendSearch from "../search/friendsearch";
import {mapGetters, mapState} from "vuex";
import {REMOVE_MEMBER_FROM_GROUP_FUNCTION} from "../../services/constant";

export default {
  name: "FriendTransfer",
  props:{
    open:Boolean,
    functionType:Number,
  },
  components: {
    FriendSearch,
  },

  data() {
    return {
      selectedNumber: 0,
      selectedFriends: [],
      setFriends: undefined,
      disable:true,
      removeFunctionType:REMOVE_MEMBER_FROM_GROUP_FUNCTION
    };
  },

  mounted() {
    this.setFriends = new Set()

  },
  computed: {
    ...mapGetters([
      'searchedFriends',
    ]),
    ...mapState([
      'friendSearchText',
    ]),

  },
  methods: {
    addFriend(item) {
      let index = -1;
      if (!document.getElementById(item.friendXiuxianId).checked) {
        for (let i = 0; i < this.selectedFriends.length; i++) {
          if (this.selectedFriends[i].friendXiuxianId === item.friendXiuxianId) {
            index = i
            break
          }
        }
        if (index !== -1) {
          console.log(this.selectedFriends.length,'find')
          this.setFriends.delete(this.selectedFriends[index].friendXiuxianId)
          this.selectedFriends.splice(index, 1)
        }
      } else {
        this.selectedFriends.push(item)
        this.setFriends.add(item.friendXiuxianId)
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
        this.setFriends.delete(friendXiuxianId)
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
      this.selectedFriends=[]
      this.setFriends=new Set()
    },
    send(){
      // TODO根据functionType的不同实现不同的功能,functionType定义在了constant里面

    }

  },

  watch: {
    searchedFriends() {
      this.$nextTick(function () {
        for(let i = 0; i < this.searchedFriends.length;i++)
        {
          const friendXiuxianId = this.searchedFriends[i].friendXiuxianId
          if (this.setFriends !== undefined && this.setFriends.has(this.searchedFriends[i].friendXiuxianId)) {
            document.getElementById(friendXiuxianId).checked = true
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
