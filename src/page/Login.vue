<template>
  <div class="loginbody">
    <div class="logindata">
      <div class="logintext">
        <h2>修仙-聊天</h2>
      </div>
      <div class="formdata">
        <el-form ref="form" :model="form" :rules="rules" label-width="80px">
          <el-form-item prop="username" label="手机号">
            <el-input
              v-model="form.username"
              clearable
              placeholder="请输入手机号"
            ></el-input>
          </el-form-item>
          <el-form-item prop="password" label="密码">
            <el-input
              v-model="form.password"
              clearable
              placeholder="请输入密码"
              show-password
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div class="tool">
        <div>
<!--          <el-checkbox v-model="checked" @change="remenber" style="color: gray"-->
<!--          >记住密码-->
<!--          </el-checkbox-->
<!--          >-->
        </div>
        <div>
          <span class="shou" @click="forgetpas" style="color: deepskyblue">忘记密码？</span>
        </div>
      </div>
      <div class="butt">
        <el-button type="primary" @click.native.prevent="login('form')"
        >登录
        </el-button
        >
        <el-button class="shou" @click="register">注册</el-button>
      </div>
    </div>
  </div>
</template>

<script>

// import { login } from "@/apis/login";
// import { setToken } from "@/request/auth";
import {postLogin} from "../apis/login.api";
import {searchXiuXianUser} from "../apis/search.api"
import {mapMutations} from "vuex";
import {disconnect} from "../apis/websocket";

export default {
  name: "Login",
  data() {
    return {
      form: {
        password: "",
        username: "",
      },
      checked: false,
      rules: {
        username: [
          {required: true, message: "请输入手机号", trigger: "blur"},
          {pattern: '^1(3\\d|4[5-9]|5[0-35-9]|6[567]|7[0-8]|8\\d|9[0-35-9])\\d{8}$', message: "请输入手机号", trigger: "blur"},
        ],
        password: [
          {required: true, message: "请输入密码", trigger: "blur"},
          {max: 15, message: "不能大于15个字符", trigger: "blur"},
          {min: 8,message: "不能小于8个字符",trigger: "blur"},
          {pattern:'^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]$',message: "密码必须是数字和字母的组合",trigger: "blur"}
        ],
      },
    };
  },
  mounted() {
    if (localStorage.getItem("news")) {
      this.form = JSON.parse(localStorage.getItem("news"))
      this.checked = true
    }
    disconnect()

  },
  methods: {
    ...mapMutations([
      'setUser'
    ]),
    login(form) {
      this.$refs[form].validate((valid) => {
        if (valid) {
          postLogin(this.form)
            .then((res) => {
              // 0代表成功
              if (res.data.data != null) {
                this.$store.commit("setToken", res.data.data.token);
                this.$store.commit("setUserInfo", this.form.username);

                searchXiuXianUser(this.form.username).then((res) => {
                  if (res.data.data == null) { //还没有设置修仙用户，跳转loginSetup页进行设置
                    this.$notify({
                      title: "登录成功",
                      type: "success",
                      showClose: false,
                      duration: 1000
                    });

                    setTimeout(() => {
                      // 此时要判断/login后面的参数redirect，若无参数，进入主页;
                      this.$router.push("/loginSetup");
                      // 若有参数则参数为未有权限的那个路由，跳转到那个路由
                      // this.$router.push(***); -- 具体要自己在这实现
                    }, 1000);
                  } else { //直接跳转主页
                    this.$notify({
                      title: "登录成功",
                      type: "success",
                      showClose: false,
                      duration: 1000
                    });
                    let data = res.data.data;
                    //设置用户
                    let user={
                      xiuxianUserId:data.xiuxianUserId,
                      profile:data.profile,
                      nickname:data.nickname
                    }

                    this.setUser(user)
                    setTimeout(() => {
                      // 此时要判断/login后面的参数redirect，若无参数，进入主页;

                      this.$router.push("/");
                      // 若有参数则参数为未有权限的那个路由，跳转到那个路由
                      // this.$router.push(***); -- 具体要自己在这实现
                    }, 1000);
                  }
                }).catch(error => {
                  this.$message.error('登陆失败,请重试');
                  console.log(error);
                })
              } else {
                this.$message.error('登陆失败,请重试');
              }
            }).catch(error => {
            // 错误分为 status-请求错误 和 code-账号密码错误
            this.$message.error(error);
            console.log(error);
          })
        } else {
          // 不符合前端校验
          this.$message.error('format error：' + "请检查手机号或密码是否正确");
          console.log('format error：', "请检查手机号或密码是否正确");
          return false;
        }
      })
    },
    remenber(data) {
      this.checked = data
      if (this.checked) {
        localStorage.setItem("news", JSON.stringify(this.form))
      } else {
        localStorage.removeItem("news")
      }
    },
    forgetpas() {
      // TODO forgetpas 短信验证码形式提醒密码
      this.$message({
        type: "info",
        message: "功能尚未开发额😥",
        showClose: true
      })
    },
    register() {
      this.$router.push("/register")
    },
  },
};
</script>

<style scoped>
.loginbody {
  width: 100%;
  height: 100%;
  min-width: 1000px;
  background-image: url("../assets/img/blur_background_pink_orange_light_73376_1366x768.jpg");

  background-position: center center;

  background-repeat: no-repeat;
  position: fixed;
  line-height: 100%;
  padding-top: 100px;
  overflow: hidden;

  background-size: cover;
}

.logintext {
  margin-bottom: 20px;
  line-height: 50px;
  text-align: center;
  font-size: 20px;
  font-weight: bolder;
  color: white;
  text-shadow: 2px 2px 4px #000000;
}

.logindata {
  width: 400px;
  height: 300px;
  transform: translate(-50%);
  margin-left: 50%;
}

.tool {
  display: flex;
  justify-content: space-between;
  color: #606266;
}

.butt {
  margin-top: 10px;
  text-align: center;
}

.shou {
  cursor: pointer;
  color: #606266;
  font-size: 14px;
}

/*ui*/
/* /deep/ .el-form-item__label {
  font-weight: bolder;
  font-size: 15px;
  text-align: left;
}

/deep/ .el-button {
  width: 100%;
  margin-bottom: 10px;

} */
</style>
