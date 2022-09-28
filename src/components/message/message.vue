<!-- 消息框 -->
<template>
  <div class="message">
    <header class="header">
      <div class="friendname">
        {{ selectedChat.remark === null || selectedChat.remark === '' ? selectedChat.nickname : selectedChat.remark }}
      </div>
    </header>

    <div class="message-wrapper" ref="list" v-if="selectedChat.type===0">
      <ul v-if="selectedChat">
        <li v-for="(item,i) in selectedChat.messages" v-show="showMessage(item)" class="message-item" :key="i">
          <div class="time"><span>{{ selectedChat.messages[i].date | time }}</span></div>
          <div class="main" :class="{ self: item.self }">
            <img class="avatar" width="36" height="36" :src="item.self ? user.img : selectedChat.profile"/>
            <div class="content" v-if="item.chatMessageType===0&&item.content!==''">
              <div class="text" v-html="replaceFace(item.content)"></div>
            </div>
            <div class="imgContent" v-else>
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

    <div class="message-wrapper" ref="list" v-else>
      <ul v-if="selectedChat">
        <li v-for="(item,i) in selectedChat.messages" v-show="showMessage(item)" class="message-item" :key="i">
          <div class="time"><span>{{ selectedChat.messages[i].date | time }}</span></div>

          <div class="main" :class="{ self: item.self }">
            <div class="name">{{ item.chatUser| showName }}</div>
            <img class="avatar" width="36" height="36" :src="item.self ? user.img : item.chatUser.profile"/>

            <div class="content" v-if="item.chatMessageType===0&&item.content!==''">

              <div class="text" v-html="replaceFace(item.content)"></div>
            </div>
            <div class="imgContent" v-else>
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
  </div>
</template>

<script>
import {mapGetters, mapState} from 'vuex'

export default {
  computed: {
    ...mapGetters([
      'selectedChat',
      'messages',

    ]),
    ...mapState([
      'user',
      'emojis'
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

      .imgContent
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
