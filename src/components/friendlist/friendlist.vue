<!-- 好友列表 -->
<template>
  <div class="friendlist">
    <ul v-show="searchText!==''&&searchedFriendlist.length===0">
      <li class="frienditem">
        <div class="friend-info" :class="{ active:searchFriendActive}" @click="router_to_friend_info">
          <img class="avatar" width="36" height="36" :src="searchFriendImg">
          <div class="remark">网络查找好友</div>
        </div>
      </li>
    </ul>
    <ul v-show="searchText!==''&&searchedFriendlist.length===0">
      <li class="frienditem">
        <div class="friend-info" :class="{ active:searchGroupActive}" @click="router_to_group_info">
          <img class="avatar" width="36" height="36" :src="searchGroupImg">
          <div class="remark">网络查找群组</div>
        </div>
      </li>
    </ul>

    <ul>
      <li class="frienditem noborder" v-show="this.searchText==='新的朋友'||this.searchText===''">
        <div class="list_title" >新的朋友</div>
        <div class="friend-info" :class="{ active:newFriendActive}"
             @click="new_friend">
          <img class="avatar" width="36" height="36" :src="newFriend">
          <div class="remark">新的朋友</div>
        </div>
      </li>
      <li v-for="item in searchedFriendlist" class="frienditem" :class="{ noborder: !item.initial}"
          @contextmenu.prevent="rightClick($event,item.friendXiuxianId)">
        <div class="list_title" v-if="item.initial">{{ item.initial }}</div>
        <div class="friend-info" :class="{ active: item.friendXiuxianId === selectFriendId }"
             @click="router_to_friend_info1(item.friendXiuxianId,item.type)">
          <img v-if="item.type===0" class="avatar" width="36" height="36" :src="item.profile">
          <img v-else class="avatar" width="36" height="36" :src="item.groupProfile">
          <div v-if="item.type===0" class="remark">{{ item.remark===null||item.remark===""?item.nickname:item.remark }}</div>
          <div v-else class="remark">{{ item.remark===null?item.groupName:item.remark }}</div>
        </div>
      </li>
    </ul>

    <div v-show="menuVisible">
      <ul id="menu" class="menu">
        <li class="menu_item" style="border-bottom: 1px solid #d1d1d1;" @click="">发消息</li>
        <li class="menu_item"  @click="deleteFriend">删除朋友</li>
      </ul>
    </div>
  </div>
</template>

<script>
import {mapState, mapActions, mapGetters} from 'vuex'
import {deleteFriendApi} from "../../apis/friend.api";

export default {

  data() {
    return {
      searchFriendImg: 'static/images/addFriend.png',
      searchGroupImg: 'static/images/addGroup.png',
      newFriend:'static/images/newFriend.png',
      searchFriendActive: false,
      searchGroupActive: false,
      newFriendActive:false,
      menuVisible: false,
      selectedFriendXiuxianId:'',
    }
  },
  computed: {
    ...mapState([
      'selectFriendId',
      'searchText',
      'chatlist',
      'friendlist'
    ]),
    ...mapGetters([
      'searchedFriendlist',
      'getUser'
    ])
  },

  methods: {
    ...mapActions([
      'selectFriend',
    ]),

    router_to_friend_info() {
      this.$router.push("/friendInfo")
      this.selectFriend(-1)
      if (this.searchGroupActive) this.searchGroupActive = false
      this.searchFriendActive = !this.searchFriendActive

    },
    router_to_friend_info1(id, type) {

      this.selectFriend(id)
      if (type === 0) { //type 0:好友，1:群组

        this.$router.push("/friendInfo")
      } else {
        this.$router.push("/groupInfo")
      }

      this.newFriendActive=false
    },
    router_to_group_info() {
      this.$router.push("/groupInfo")
      this.selectFriend(-2)
      if (this.searchFriendActive) this.searchFriendActive = false
      this.searchGroupActive = !this.searchGroupActive
    },
    new_friend(){
      this.newFriendActive=true
      this.selectFriend(-1)
      this.$router.push("/newFriendInfo")
    },
    rightClick(MouseEvent,friendXiuxianId){
      this.menuVisible = false // 先把模态框关死，目的是 第二次或者第n次右键鼠标的时候 它默认的是true
      this.menuVisible = true  // 显示模态窗口，跳出自定义菜单栏
      var menu = document.querySelector('#menu')
      document.addEventListener('click', this.foo) // 给整个document添加监听鼠标事件，点击任何位置执行foo方法
      menu.style.display = "block";
      menu.style.left = MouseEvent.clientX - 0 + 'px'
      menu.style.top = MouseEvent.clientY - 80 + 'px'
      this.selectedFriendXiuxianId=friendXiuxianId
    },
    foo() { // 取消鼠标监听事件 菜单栏
      this.menuVisible = false
      document.removeEventListener('click', this.foo) // 要及时关掉监听，不关掉的是一个坑，不信你试试，虽然前台显示的时候没有啥毛病，加一个alert你就知道了
    },

    //删除朋友
    deleteFriend(){
      this.$confirm('删除朋友后，将同时删除与该联系人的聊天记录。', '', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(()=>{
        const data={
          "selfXiuxianId":this.getUser.xiuxianUserId,
          "friendXiuxianId":this.selectedFriendXiuxianId
        }
        deleteFriendApi(data).then(res=>{
          // 删除朋友
          for (let i=0;i<this.friendlist.length;i++){
            if(this.friendlist[i].friendXiuxianId===this.selectedFriendXiuxianId){
              this.friendlist.splice(i,1)
              break;
            }
          }

          // 删除聊天
          for(let i=0;i<this.chatlist.length;i++){
            if(this.chatlist[i].friendXiuxianId===this.selectedFriendXiuxianId){
              this.chatlist.splice(i,1)
              break;
            }
          }
          for (let i = 0; i < this.chatlist.length; i++) {
            this.chatlist[i].index=i+1;
          }
          //删除好友后，展示空白页面
          this.selectFriend(0)
        }).catch(err=>{
          this.$message.error(err)
        })
      })

    }

  }
}
</script>

<style lang="stylus" scoped>
.friendlist
  height: 540px
  overflow-y: auto

  .frienditem
    border-top: 1px solid #dadada

    &:first-child, &.noborder
      border-top: none

    .list_title
      box-sizing: border-box
      width: 100%
      font-size: 12px
      padding: 15px 0 3px 12px
      color: #999

    .friend-info
      display: flex
      padding: 12px
      transition: background-color .1s
      font-size: 0

      &:hover
        background-color: rgb(220, 220, 220)

      &.active
        background-color: #c4c4c4

      .avatar
        border-radius: 2px
        margin-right: 12px

      .remark
        font-size: 14px
        line-height: 36px

  .menu_item
    line-height: 20px
    font-size :11px
    text-align: left
    font-family: "Microsoft YaHei"
    color:black
    padding: 3px 25px 3px 20px

  .menu_item:hover
    background-color: #e5e5e5;
    cursor:default

  .menu
    width: 140px
    z-index: 99999
    position: absolute
    border-radius: 2px
    border: 1px solid #d1d1d1
    background-color: white
    box-shadow: 0px 0px 5px #adaeaf


</style>
