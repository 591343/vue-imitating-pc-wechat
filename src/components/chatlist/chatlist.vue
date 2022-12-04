<!-- 聊天列表 -->
<template>

  <div class="msglist">

    <ul>

        <li v-for="item in searchedChatlist" :key="item.friendXiuxianId" class="sessionlist"
            :class="{ active: item.friendXiuxianId === selectId }"
            @click="selectSession(item.friendXiuxianId)" slot="reference" @contextmenu.prevent="rightClick($event,item.friendXiuxianId)">


          <div class="list-left">
            <el-badge is-dot>
              <img class="avatar" width="42" height="42"
                   :alt="item.remark===null||item.remark===''?item.nickname:item.remark" :src="item.profile">
            </el-badge>
          </div>

          <div class="list-right">
            <p class="name">{{ item.remark === null || item.remark === '' ? item.nickname : item.remark }}</p>
            <span class="time">{{ item | time }}</span>
            <p class="lastmsg">{{item | lastMsg}}</p>
            </div>
        </li>
    </ul>

    <div v-show="menuVisible">
      <ul id="menu" class="menu">
        <li class="menu_item" @click="">置顶</li>
        <li class="menu_item" @click="">标为未读</li>
        <li class="menu_item" @click="">消息免打扰</li>
        <li class="menu_item" style="border-bottom: 1px solid #d1d1d1;" @click="">在独立窗口打开</li>

        <li class="menu_item" @click="deleteChat">删除聊天</li>
      </ul>
    </div>

  </div>

</template>

<script>
import {mapState, mapActions, mapGetters} from 'vuex'
import {deleteChatListItemRes} from '../../apis/chat.api'
import {IMAGE_CHAT_MESSAGE_TYPE, SUB_MESSAGE_TYPE, TEXT_CHAT_MESSAGE_TYPE} from "../../services/constant";

export default {
  data() {
    return {
      menuVisible: false,
      selectedFriendXiuxianId:''
    }
  },
  computed: {
    ...mapState([
      'selectId',
      'searchText',
      'chatlist'
    ]),
    ...mapGetters([
      'searchedChatlist',
      'getUser'
    ])
  },
  created() {
    //获取chatlist
    const now = new Date();

  },
  methods: {
    ...mapActions([
      'selectSession',
    ]),
    rightClick(MouseEvent,friendXiuxianId){
      this.menuVisible = false // 先把模态框关死，目的是 第二次或者第n次右键鼠标的时候 它默认的是true
      this.menuVisible = true  // 显示模态窗口，跳出自定义菜单栏
      var menu = document.querySelector('#menu')
      document.addEventListener('click', this.foo) // 给整个document添加监听鼠标事件，点击任何位置执行foo方法
      menu.style.display = "block";
      menu.style.left = MouseEvent.clientX - 0 + 'px'
      menu.style.top = MouseEvent.clientY - 80 + 'px'
      this.selectedFriendXiuxianId=friendXiuxianId // 设置右键选中的对象Id
    },
    // 取消鼠标监听事件 菜单栏
    foo() {
      this.menuVisible = false
      document.removeEventListener('click', this.foo) // 要及时关掉监听，不关掉的是一个坑，不信你试试，虽然前台显示的时候没有啥毛病，加一个alert你就知道了
    },
    // 删除聊天s
    deleteChat(){
      this.$confirm('删除聊天后，将同时删除聊天记录，包括聊天中的图片等内容。', '', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const data = {
          "selfXiuxianId": this.getUser.xiuxianUserId,
          "friendXiuxianId": this.selectedFriendXiuxianId
        }
        deleteChatListItemRes(data).then(res=>{
          for(let i=0;i<this.chatlist.length;i++){
            if(this.chatlist[i].friendXiuxianId===this.selectedFriendXiuxianId){
              this.chatlist.splice(i,1)
              break;
            }
          }
          for (let i = 0; i < this.chatlist.length; i++) {
            this.chatlist[i].index=i+1;
          }
        }).catch(error => {
          this.$message.error(error);
        })
      })
    }
  },

  //filters用于文本格式化
  filters: {
    // 将日期过滤为 hour:minutes
    time(item) {
      let date=item.messages.length>0?item.messages[item.messages.length - 1].date:item.startTime
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
    lastMsg(item){
      let content=""
      if(item.messages.length>0){
        if(item.messages[item.messages.length - 1].chatMessageType === TEXT_CHAT_MESSAGE_TYPE){
          content=item.messages[item.messages.length - 1].content
        }else if(item.messages[item.messages.length - 1].chatMessageType === SUB_MESSAGE_TYPE){
          content=item.messages[item.messages.length - 1].content.indexOf("-")!==-1?"":item.messages[item.messages.length - 1].content
        }else if(item.messages[item.messages.length - 1].chatMessageType === IMAGE_CHAT_MESSAGE_TYPE){
          content="图片"
        }
      }
      return content
    }
  },
}
</script>

<style lang="stylus" scoped>
.msglist
  height: 540px
  overflow-y: auto

  .sessionlist
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


    .list-right
      position: relative
      flex: 1
      margin-top: 4px
      margin-left: 10px

    .name
      display: inline-block
      vertical-align: top
      font-size: 14px

    .time
      float: right
      color: #999
      font-size: 10px
      vertical-align: top

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
