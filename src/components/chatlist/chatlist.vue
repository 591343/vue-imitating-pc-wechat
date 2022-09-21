<!-- 聊天列表 -->
<template>
  <div class="msglist">
    <ul>
      <li v-for="item in searchedChatlist" :key="item.friendXiuxianId" class="sessionlist"
          :class="{ active: item.friendXiuxianId === selectId }"
          @click="selectSession(item.friendXiuxianId)">
        <div class="list-left">
          <img class="avatar" width="42" height="42"
               :alt="item.remark===null||item.remark===''?item.nickname:item.remark" :src="item.profile">
        </div>
        <div class="list-right">
          <p class="name">{{ item.remark === null || item.re === '' ? item.nickname : item.remark }}</p>
          <span class="time">{{ item.messages[item.messages.length - 1].date | time }}</span>
          <p class="lastmsg">{{
              item.messages[item.messages.length - 1].chatMessageType === 0 ? item.messages[item.messages.length - 1].content :
                "[图片]"
            }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import {mapState, mapActions, mapGetters} from 'vuex'
import {getChatList} from '../../apis/chat.api'

export default {

  computed: {
    ...mapState([
      'selectId',
      'searchText'
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
    ])
  },

  //filters用于文本格式化
  filters: {
    // 将日期过滤为 hour:minutes
    time(date) {

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
      margin-right: 12px

    .list-right
      position: relative
      flex: 1
      margin-top: 4px

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
</style>
