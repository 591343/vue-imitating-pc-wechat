<!-- 文本输入框 -->
<template>
  <div class="text">
    <div class="emoji">

      <i class="icon iconfont icon-look" @click="showEmoji=!showEmoji"></i>
      <el-upload
        class="avatar-uploader"
        action="string"
        :http-request="uploadProfile"
        :show-file-list="false"
        :before-upload="beforeAvatarUpload">
        <i class="el-icon-folder"></i>
      </el-upload>
      <i class="el-icon-scissors" style="margin-top: 10px;margin-left: 12px" @click="screenShot"></i>

      <transition name="showbox">
        <div class="emojiBox" v-show="showEmoji">
          <li v-for="(item, index) in emojis">
            <img :src="'static/emoji/'+item.file" :data="item.code" @click="content +='['+item.title+']'">
          </li>
        </div>
      </transition>
    </div>
    <textarea ref="text" v-model="content" @keyup="onKeyup" @click="showEmoji=false" maxlength="200"></textarea>
    <div class="sendMessage-button" @click="send">
      <span>发送(Ent)</span>
    </div>
    <transition name="appear">
      <div class="warn" v-show="warn">
        <div class="description">不能发送空白信息</div>
      </div>
    </transition>
  </div>
</template>

<script>
import {mapGetters, mapState} from 'vuex'
import axios from "axios";
import ScreenShot from "js-web-screen-shot";
import {upload} from "../../apis/oss.api";
import {base64toBlob} from "../../services/utils.js"

export default {
  data() {
    return {
      content: '',
      reply: '未找到',
      frequency: 0,
      warn: false,
      showEmoji: false,

    };
  },
  computed: {
    ...mapState([
      'selectId',
      'emojis'
    ]),
    ...mapGetters([
      'selectedChat',
    ])
  },
  methods: {
    // 按回车发送信息
    onKeyup(e) {
      if (e.keyCode === 13) {
        this.send()
      }
    },
    // 点击发送按钮发送信息
    send() {
      const timestamp = new Date().getTime()
      if (this.content.length <= 1) {
        this.warn = true
        this.content = ''
        setTimeout(() => {
          this.warn = false;
        }, 1000)
      } else {
        var msg = {
          content: this.content,
          remoteMediaUrl: '',
          chatMessageType: 0,
          timestamp: timestamp
        }
        this.$store.dispatch('sendMessage', msg)


        // if (this.selectedChat.user.name === '机器人') {
        //   axios.get(`/qingyunkeapi?key=free&appid=0&msg=${this.content}`).then(res => {
        //     this.reply = res.data.content
        //     console.log(this.reply)
        //     this.reply=this.reply.replaceAll("{br}","\n")
        //     console.log(this.reply)
        //     var msg = {
        //       reply: this.reply
        //     }
        //     this.$store.dispatch('robotSendMessage', msg)
        //     // this.content = ''
        //   })
        // }
        this.content = ''
      }
    },
    callBack(base64) {
      const timestamp = new Date().getTime();
      const file = base64toBlob(base64);
      const params = new FormData()
      params.append('file', file, "screen_shot.png")
      upload(params, 'chat-img').then((res) => {
        this.sendImg(res.data.data.src, timestamp)
        console.log('截图',)
      }).catch((error) => {
        this.$message.error(error)
      })
    },
    closeFn() {
      console.log('截图窗口已关闭')
    },
    beforeAvatarUpload(file) {

      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJpgOrPng) {
        this.$message.error('上传头像图片只能是 JPG 或者PNG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
      }
      return isJpgOrPng && isLt2M;
    },

    //通过自定义截屏发送图片
    screenShot() {
      new ScreenShot({enableWebRtc: true, completeCallback: this.callBack, closeCallback: this.closeFn});
    },
    uploadProfile(file) {
      const timestamp = new Date().getTime()
      const params = new FormData()
      params.append('file', file.file)
      upload(params, 'chat-img').then((res) => {
        this.sendImg(res.data.data.src, timestamp)
      }).catch((error) => {
        this.$message.error("由于网络原因发送失败,请检查网络连接或重新发送")
      })
    },

    //向对方发送图片
    sendImg(imgUrl, timestamp) {
      var msg = {
        content: '',
        remoteMediaUrl: imgUrl,
        chatMessageType: 1,
        timestamp: timestamp
      }
      this.$store.dispatch('sendMessage', msg)
    }

  },
  // 在进入的时候 聚焦输入框
  mounted() {
    this.$refs.text.focus()
  },
  watch: {
    // 在选择其它对话的时候 聚焦输入框
    selectId() {
      setTimeout(() => {
        this.$refs.text.focus()
      }, 0)
    },
    // 当输入框中的值为空时 弹出提示  并在一秒后消失
    content() {
      if (this.content === '') {
        if (this.frequency === 0) {
          this.warn = true;
          this.frequency++
          setTimeout(() => {
            this.warn = false;
          }, 1000)
        }
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.text
  position: relative
  height: 150px
  background: #fff

  .emoji
    position: relative
    width: 100%
    height: 40px
    line-height: 40px
    font-size: 12px
    padding: 0 30px
    box-sizing: border-box
    color: #7c7c7c

    .icon-look
      cursor: pointer
      float: left

      &:hover
        color: #1aad19

    .avatar-uploader
    .el-icon-folder, .el-icon-scissors
      cursor: pointer
      font-size: 18px
      margin-left: 8px
      float: left;

      &:hover
        color: #1aad19

    .emojiBox
      position: absolute
      display: flex
      flex-wrap: wrap
      top: -210px
      left: -100px
      width: 300px
      height: 200px
      padding: 5px
      background-color: #fff
      border: 1px solid #d1d1d1
      border-radius: 2px
      box-shadow: 0 1px 2px 1px #d1d1d1

      &.showbox-enter-active, &.showbox-leave-active
        transition: all .5s

      &.showbox-enter, &.showbox-leave-active
        opacity: 0

  textarea
    box-sizing: border-box
    padding: 0 30px
    height: 110px
    width: 100%
    border: none
    outline: none
    font-family: "Micrsofot Yahei"
    resize: none

  .sendMessage-button
    position: absolute
    bottom: 10px
    right: 30px
    width: 75px
    height: 28px
    line-height: 28px
    box-sizing: border-box
    text-align: center
    border: 1px solid #e5e5e5
    border-radius: 3px
    background: #f5f5f5
    font-size: 14px
    color: #7c7c7c

    &:hover
      background: rgb(18, 150, 17)
      color: #fff

  .warn
    position: absolute
    bottom: 50px
    right: 10px
    width: 110px
    height: 30px
    line-height: 30px
    font-size: 12px
    text-align: center
    border: 1px solid #bdbdbd
    border-radius: 4px
    box-shadow: 0 1px 5px 1px #bdbdbd

    &.appear-enter-active, &.appear-leave-active
      transition: all 1s

    &.appear-enter, &.appear-leave-active
      opacity: 0

    &:before
      content: " "
      position: absolute
      top: 100%
      right: 20px
      border: 7px solid transparent
      border-top-color: #fff
      filter: drop-shadow(1px 3px 2px #bdbdbd)
</style>
