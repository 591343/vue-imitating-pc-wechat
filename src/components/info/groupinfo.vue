<template>
  <div class="search-group-info" v-if="selectFriendId!==0">
    <div class="groupInfo">
      <div class="esInfo">
        <img class="avatar" width="80" height="80" :src="group.groupProfile">
      </div>
      <div class="detInfo">
        <div class="group-name"><span>群&nbsp&nbsp&nbsp名</span>{{ group.groupName }}</div>
        <div class="num"><span>人&nbsp&nbsp&nbsp数</span>{{ group.number }}人</div>
        <div class="wxid"><span>微信号</span>{{ group.friendXiuxianId }}</div>
      </div>
      <div class="send" v-if="selectFriendId===-2" @click="joinGroup">
        <span>申请加入群聊</span>
      </div>
      <div class="send" v-else @click="send">
        <span>发消息</span>
      </div>
    </div>
  </div>
</template>

<script>
import {searchGroupInfo} from '../../apis/search.api'
import {mapActions, mapGetters, mapState} from "vuex";

export default {
  name: "groupinfo",
  data() {
    return {
      group: {
        groupName: '',
        number: '',
        groupProfile: '',
        managerId: '',
        friendXiuxianId: '',
        remark: null
      }
    }
  },
  created() {
    this.group = {
      groupName: '',
      number: '',
      groupProfile: '',
      managerId: '',
      friendXiuxianId: '',
      remark: null
    }
    if (this.selectFriendId === -2) {
      this.getGroupInfo()
    } else {
      this.group = this.selectedFriend
    }

    console.log("group", this.group)

  },
  watch: {
    selectFriendId(newVal) {

      console.log("selectFriendId", newVal)
      if (newVal === -2) {
        this.getGroupInfo()
      }
    }
  },
  methods: {
    ...mapActions([
      'selectFriend',
    ]),
    getGroupInfo() {
      if (this.searchText !== '') {
        this.selectFriend(this.searchText)
        console.log(this.selectedFriend)
        if (this.selectedFriend.friendXiuxianId !== -1&&this.selectedFriend.type===1) {
          this.group=this.selectedFriend

          return;
        }else {
          this.selectFriend(0)
        }
        searchGroupInfo(this.searchText).then((res) => {

            // 0代表成功
            if (res.data.code === 0) {
              let data = res.data.data;
              if (data != null) {
                this.group.friendXiuxianId = data.xiuxianGroupId
                this.group.groupProfile = data.groupProfile
                this.group.groupName = data.groupName
                this.group.managerId = data.managerId
                this.group.number = data.number

                console.log(this.group)
                this.$forceUpdate()  //强制渲染
              } else {
                this.selectFriend(0)
                this.$alert('无法找到该群组,请检查你填写的账号是否正确', '', {
                  confirmButtonText: '确定',
                });
              }
            }
          }
        ).catch(error => {
          this.selectFriend(0)
          // 错误分为 status-请求错误 和 code-账号密码错误
          this.$message.error(error);
          console.log(error);
        })
      }
    },
    //申请加入群聊
    joinGroup() {

    },
    send() {
      this.$store.dispatch('send')
      this.$store.dispatch('search', '')
    },
  }
  ,
  computed: {
    ...
      mapState([
        'searchText',
        'selectFriendId',

      ]),
    ...
      mapGetters([
        'selectedFriend',
      ])

  }
  ,
}
</script>

<style lang="stylus" scoped>
.newfriend
  height: 60px
  padding: 28px 0 0 30px
  box-sizing: border-box
  border-bottom: 1px solid #e7e7e7

  .nickname
    font-size: 18px

.groupInfo
  padding: 0 90px

.esInfo
  display: flex
  align-items: center
  padding: 100px 0 45px 0
  justify-content: center

  .avatar
    border-radius: 3px


.detInfo
  padding: 40px 0
  border-top: 1px solid #e7e7e7
  border-bottom: 1px solid #e7e7e7

  .remark, .group-name, .num, .wxid
    font-size: 14px
    margin-top: 20px

    span
      font-size: 14px
      color: rgba(153, 153, 153, .8)
      margin-right: 40px

  .remark
    margin-top: 0


.send
  position: relative
  text-align: center
  width: 140px
  height: 36px
  left: 115px
  top: 50px
  line-height: 36px
  font-size: 14px
  color: #fff
  background-color: #1aad19
  cursor: pointer
  border-radius: 2px

  &:hover
    background: rgb(18, 150, 17)
</style>
