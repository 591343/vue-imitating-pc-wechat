<!-- 最左边的选择框 -->
<template>
  <div class="mycard">
    <header>
      <el-popover
        placement="right-end"
        width="200"
        trigger="click"
        :visible-arrow="false"
        >
        <delivery-info :user-info="user"></delivery-info>
        <img :src="user.profile" class="avatar" slot="reference">
      </el-popover>
    </header>
    <div class="navbar" @click="clearSearch">
      <router-link to="/chat" class="icon iconfont icon-msg" title="聊天"></router-link>
      <router-link to="/friend" class="icon iconfont icon-friend" title="通讯录"></router-link>
      <router-link to="/my" class="icon iconfont icon-collection" title="收藏"></router-link>
    </div>
    <footer>
      <el-popover
        popper-class="popoverBackB"
        placement="right-end"
        width="100"
        trigger="click"
        :visible-arrow=false>
        <el-button class="mycardSetup" type="text" @click="loginOut">退出登录</el-button>
        <br>
        <el-button class="mycardSetup" type="text">设置</el-button>
        <br>
        <el-button class="mycardSetup" type="text">意见与反馈</el-button>
        <br>
        <i slot="reference" class="icon iconfont icon-more"></i>
      </el-popover>

    </footer>
  </div>

</template>

<script>
import {mapMutations, mapState} from 'vuex'
import {searchUser} from '../../apis/search.api'
import {loginOut} from '../../apis/login.api'
import deliveryinfo from "../info/deliveryinfo";

export default {
  components: {
    "delivery-info":deliveryinfo
  },
  computed: {
    ...mapState([
      'user',
      'userName'
    ])
  },
  data() {
    return {
      visible: false,
      loginOutDialogVisible: false
    }
  },
  methods: {
    ...mapMutations([
      'delToken',
    ]),
    clearSearch() {
      this.$store.dispatch('search', '')
    },

    loginOut() {
      this.loginOutDialogVisible = false

      //设置token过期
      searchUser(this.userName).then((res)=>{
        let data = res.data.data;
        if(data!=null){
          let userId=data.id
          loginOut(userId).then((res)=>{
            this.$notify({
              title: "退登成功",
              type: "success",
              showClose: false,
              duration: 1000
            });
            //清空localstorage和vue中的token
            this.delToken()
            setTimeout(() => {
              // 此时要判断/login后面的参数redirect，若无参数，进入主页;

              this.$router.push("/login");
              // 若有参数则参数为未有权限的那个路由，跳转到那个路由
              // this.$router.push(***); -- 具体要自己在这实现
            }, 1000);
          })
        }
      })
    }
  }
}
</script>

<style lang="stylus">
@import '../../assets/fonts/iconfont.css'
.mycard
  position: relative
  width: 100%
  height: 100%

  .avatar
    width: 36px
    height: 36px
    margin: 20px 12px 0 12px
    border-radius: 2px
    cursor: pointer
  .navbar
    width: 100%
    text-align: center

  .icon
    display: inline-block
    font-size: 26px
    margin-top: 28px
    padding: 0 16px
    box-sizing: border-box
    color: rgb(173, 174, 175)
    opacity: 0.8
    cursor: pointer

    &.active
      color: rgb(0, 220, 65)

    &:hover
      opacity: 1;

  .icon-msg, .icon-more
    font-size: 22px

  .icon-msg
    padding: 0 19px

footer
  position: absolute
  bottom: 20px
  width: 100%
  text-align: center

.el-popover.popoverBackB {
  background-color: #2b2c2f;
  min-width :50px
}

.mycardSetup {
  font-size: 14px
  color: gray
}


</style>
