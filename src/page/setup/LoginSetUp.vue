<template>
  <div class="loginSetupBody">
    <div class="loginSetupData">
      <div class="loginSetupText">
        <h2>修仙聊天-初始化设置</h2>
      </div>
      <div class="formdata">
        <el-form ref="form" :model="form" :rules="rules" label-width="80px" size="small">
          <el-form-item class="login-setup-item" prop="profile" label="头像">
            <el-upload
              class="avatar-uploader"
              action="string"
              :http-request="uploadProfile"
              :show-file-list="false"

              :before-upload="beforeAvatarUpload">
              <img v-if="form.profile" :src="form.profile" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
          </el-form-item>
          <el-form-item class="login-setup-item" prop="xiuxianUserId" label="修仙号">
            <el-input
              v-model="form.xiuxianUserId"
              clearable
              placeholder="请输入修仙号"
            ></el-input>
          </el-form-item>
          <el-form-item class="login-setup-item" prop="nickname" label="昵称">
            <el-input
              v-model="form.nickname"
              clearable
              placeholder="请输入昵称"
            ></el-input>
          </el-form-item>
          <el-form-item class="login-setup-item" prop="signature" label="个性签名">

            <el-input
              v-model="form.signature"
              clearable
              placeholder="请输入个性签名"
            ></el-input>
          </el-form-item>

          <el-form-item class="login-setup-item" prop="sex" label="性别">
            <el-radio v-model="form.sex" label="0" style="color: black">女</el-radio>
            <el-radio v-model="form.sex" label="1" style="color: black">男</el-radio>
          </el-form-item>
          <el-form-item class="login-setup-item" prop="area" label="地区">
            <el-cascader
              v-model="form.area"
              :options="options"
              separator=" "
            >
            </el-cascader>
          </el-form-item>
        </el-form>
      </div>
      <div class="butt">
        <el-button type="primary" style="margin-left: 80px" @click.native.prevent="submit('form')">确定</el-button>
        <el-button class="shou" style="margin-left: 175px" @click.naitve.prevent="cancel">取消</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import {regionData, CodeToText} from 'element-china-area-data'
import {mapState,mapMutations} from "vuex";
import {upload} from "../../apis/oss.api";
import {addXiuxianUserInfo} from '../../apis/xiuxian_user.api'
import {isXiuxianUserExist} from "../../apis/search.api";

export default {
  name: "LoginSetUp",
  data() {
    const validateUnique = (rule, value, callback) => {
      isXiuxianUserExist(value).then((res) => {
        if (res.data.data.exist === 1) {
          return callback(new Error('该修仙号已存在'));
        }
        callback();
      })
    };

    return {

      form: {
        profile: '',
        xiuxianUserId: '',
        signature: '',
        nickname: '',
        mobile: '',
        sex: '',
        area: '',
      },
      areaCode: '',
      options: regionData,
      rules: {
        profile:[
          {required: true, message: "请选择头像", trigger: "change"},
        ],
        xiuxianUserId: [
          {required: true, message: "请输入修仙号", trigger: "blur"},
          {
            pattern: '^[a-zA-Z][a-zA-Z0-9]*$',
            message: "只能输入英文字母大小写和数字,必须以英文字母开头",
            trigger: "blur"
          },
          {max: 20, message: "不能大于20个字符", trigger: "blur"},
          {min: 6,message: "不能小于8个字符",trigger: "blur"},
          {validator: validateUnique, trigger: 'blur'}
        ],
        nickname: [
          {required: true, message: "请输入昵称", trigger: "blur"},
          {
            pattern: '^[a-zA-Z0-9_\\u4e00-\\u9fa5]+$',
            message: "只能输入汉字、数字、字母、下划线",
            trigger: "blur"
          },
        ],
        signature: [
          {required: true, message: "请输入个性签名", trigger: "blur"},
          {
            pattern: '^[a-zA-Z0-9_\\u4e00-\\u9fa5]+$',
            message: "只能输入汉字、数字、字母、下划线.",
            trigger: "blur"
          },
        ],
        sex: [
          {required: true, message: "请选择性别", trigger: "change"},
        ],
        area: [
          {required: true, message: "请选择地区", trigger: "blur"},
        ],
      },
    }
  },
  methods: {
    ...mapMutations([
      'setUser'
    ]),
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg';
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!');
      }
      return isJPG && isLt2M;
    },
    submit(form) {
      this.$refs[form].validate((valid) => {
        if(valid){
          let areaCodes=""
          for(let i=0;i<this.form.area.length;i++){
            areaCodes+=CodeToText[this.form.area[i]]
            if(i!==this.form.area.length-1){
              areaCodes+=" "
            }
          }
          this.form.mobile=this.userName
          this.form.area=areaCodes
          addXiuxianUserInfo(this.form).then((res)=>{
            //设置用户信息
            let user={
              xiuxianUserId:this.form.xiuxianUserId,
              profile:this.form.profile,
              nickname:this.form.nickname
            }
            this.setUser(user)
            setTimeout(() => {
              // 此时要判断/login后面的参数redirect，若无参数，进入主页;

              this.$router.push("/");
              // 若有参数则参数为未有权限的那个路由，跳转到那个路由
              // this.$router.push(***); -- 具体要自己在这实现
            }, 1000);
          }).catch((error)=>{
            this.$message.error(error);
          })
        }else {
          // 不符合前端校验
          this.$message.error("请检查填写的数据是否符合规范");
          return false;
        }
      })
    },
    uploadProfile(file){
      const params = new FormData()
      params.append('file', file.file)
      upload(params,'userprofile').then((res) => {
        this.$message.success('上传头像成功')
        this.form.profile=res.data.data.src
      }).catch((error) => {
        this.$message.error(error)
      })
    },
    cancel(){
      setTimeout(() => {
        // 此时要判断/login后面的参数redirect，若无参数，进入主页;

        this.$router.push("/login");
        // 若有参数则参数为未有权限的那个路由，跳转到那个路由
        // this.$router.push(***); -- 具体要自己在这实现
      }, 1000);
    }
  },
  computed: {
    ...mapState([
      'userName',
    ]),
  }
}
</script>

<style scoped>
.loginSetupBody {
  width: 100%;
  height: 100%;
  min-width: 1000px;


  background-position: center center;

  background-repeat: no-repeat;
  position: fixed;
  line-height: 100%;
  padding-top: 30px;
  overflow: hidden;

  background-size: cover;
}

.loginSetupText {
  margin-bottom: 20px;
  line-height: 50px;
  text-align: center;
  font-size: 20px;
  font-weight: bolder;
  color: white;
  text-shadow: 2px 2px 4px #000000;
}

.loginSetupData {
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

}

.shou {
  cursor: pointer;
  color: #606266;
  font-size: 14px;
}


.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 80px;
  height: 80px;
  line-height: 80px;
  text-align: center;
}

.avatar {
  width: 80px;
  height: 80px;
  display: block;
}

.login-setup-item .el-form-item__label {
  color: black;

}

</style>
