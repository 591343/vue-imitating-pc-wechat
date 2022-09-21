<template>
  <div class="registerbody">
    <div class="registerdata">
      <div class="registertext">
        <h2>欢迎注册 修仙-聊天</h2>
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
          <el-form-item prop="rePassword" label="确认密码">
            <el-input
              v-model="form.rePassword"
              clearable
              placeholder="请确认密码"
              show-password
            ></el-input>
          </el-form-item>
        </el-form>
      </div>

      <div class="butt">
        <el-button type="primary" @click.native.prevent="register('form')">注册</el-button>
        <el-button class="shou" @click="undo">取消</el-button>
      </div>
    </div>
  </div>
</template>

<script>

// import { login } from "@/apis/login";
// import { setToken } from "@/request/auth";
import {postRegister} from "../apis/login.api";

export default {
  name: "Register",
  data() {
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'));
      } else if (value !== this.form.password) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };
    return {

      form: {
        username: "",
        password: "",
        rePassword: "" //重新输入密码

      },
      checked: false,
      rules: {
        username: [
          {required: true, message: "请输入手机号", trigger: "blur"},
          {max: 11, message: "不能大于11个字符", trigger: "blur"},
        ],
        password: [
          {required: true, message: "请输入密码", trigger: "blur"},
          {max: 15, message: "不能大于15个字符", trigger: "blur"},
          {min: 8,message: "不能小于8个字符",trigger: "blur"}
        ],
        rePassword: [
          {required: true, message: "请再次输入密码", trigger: "blur"},
          {max: 15, message: "不能大于15个字符", trigger: "blur"},
          {min: 8,message: "不能小于8个字符",trigger: "blur"},
          {validator: validatePass, message: "2次密码不一致", trigger: 'blur'}
        ],
      },
    };
  },
  mounted() {
  },
  methods: {
    register(form) {

      this.$refs[form].validate((valid) => {
        if (valid) {
          postRegister(this.form).then((res) => {
            // 0代表成功
            if (res.data.code === 0) {
              this.$notify({
                title: "注册成功",
                type: "success",
                showClose: false,
                duration: 1000
              });
              setTimeout(() => {
                // 此时要判断/login后面的参数redirect，若无参数，进入主页；
                this.$router.push("/login");
                // 若有参数则参数为未有权限的那个路由，跳转到那个路由
                // this.$router.push(***); -- 具体要自己在这实现
              }, 1000);
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
    undo() {
      this.$router.push("/login")
    }
  },
};
</script>

<style scoped>
.registerbody {
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

.registertext {
  margin-bottom: 20px;
  line-height: 50px;
  text-align: center;
  font-size: 20px;
  font-weight: bolder;
  color: white;
  text-shadow: 2px 2px 4px #000000;
}

.registerdata {
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
