<template>
  <div class="group-announcement">
    <!--群公告dialog-->
    <el-dialog
      :visible.sync="dialogGroupAnnouncement"
      width="350px"
      :title="selectedChat.remark!==null&&selectedChat!==''?'\''+selectedChat.remark+'\''+' 群公告':'\''+selectedGroup.groupName+'\''+' 群公告'"
      :modal="false"
      :close-on-press-escape="false"
      :before-close="handleClose"
      class="group-announcement-dialog"
      center>
      <div class="dialog-group-announcement-area">
        <div class="publisher-area" v-show="!setUpGroupAnnouncementFlag">
          <div class="list-left">
            <img class="avatar"
                 :src="selectedGroup.hasOwnProperty('announcement')&&selectedGroup.announcement.hasOwnProperty('profile')?selectedGroup.announcement.profile:'static/images/default_profile.png'">
          </div>
          <div class="list-right">
            <p class="name">
              {{
                selectedGroup.hasOwnProperty('announcement') && selectedGroup.announcement.hasOwnProperty('name') !== null ? selectedGroup.announcement.name : ''
              }}</p>
            <span
              class="time">{{
                selectedGroup.hasOwnProperty('announcement') && selectedGroup.announcement.hasOwnProperty('publishmentTime') !== null ? selectedGroup.announcement.publishmentTime : ''
              }}</span>
          </div>
        </div>
        <div class="announcement-area">
          <el-input type="textarea" placeholder="请输入文字" :maxlength="500" :rows="14" resize="none"
                    v-model="announcement" v-if="setUpGroupAnnouncementFlag"
                    @input="announcement===''?completeButtonDisabled=true:completeButtonDisabled=false"></el-input>
          <div class="group-announcement-content" v-else>{{ announcement }}</div>
        </div>
        <div slot="footer" v-if="showEditBtn" style="margin-left: 40%">
          <el-button size="mini" @click="editGroupAnnouncement" type="success">编 辑</el-button>
        </div>
        <div slot="footer" class="dialog-footer" v-else>
          <el-button type="success" size="mini" @click="dialogGroupAnnouncementPublishment=true"
                     :disabled="completeButtonDisabled">完 成
          </el-button>
          <el-button size="mini" @click="handleClose">取 消</el-button>
        </div>
      </div>
    </el-dialog>
    <!--群公告dialog-->
    <el-dialog
      :visible.sync="dialogGroupAnnouncementPublishment"
      width="230px"
      :show-close="false"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      :modal="false"
      class="group-announcement-publishment-dialog"
      center>
      <span style="margin-left: 4%">该公告会通知全部群成员</span>
      <span slot="footer" class="dialog-footer">
        <el-button type="success" size="mini" @click="publishGroupAnnouncement">发 布</el-button>
        <el-button size="mini" @click="dialogGroupAnnouncementPublishment=false">取 消</el-button>
      </span>
    </el-dialog>

    <!--退出群公告dialog-->
    <el-dialog
      :visible.sync="dialogExitAnnouncementPublishment"
      width="220px"
      :show-close="false"
      :close-on-press-escape="false"
      :close-on-click-modal="false"
      :modal="false"
      class="exit-group-announcement-dialog"
      center>
      <span style="margin-left: 21%">退出本次编辑？</span>
      <span slot="footer" class="dialog-footer">
        <el-button type="success" size="mini" @click="dialogExitAnnouncementPublishment=false">继续编辑</el-button>
        <el-button size="mini" @click="exitEdit">退 出</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {mapGetters, mapMutations, mapState} from "vuex";

import {Loading} from "element-ui";
import {dateFormat} from "../../services/utils";
import {addGroupAnnouncement} from "../../apis/group_announcement";

export default {
  name: "GroupAnnouncement",
  props: {
    dialogGroupAnnouncement: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapGetters([
      'selectedGroup',
      'getUser',
      'selectedChat'
    ]),
    ...mapState([
      'friendlist'
    ]),
  },


  data() {
    return {
      groupAnnouncementIcon: false,
      announcement: '',
      setUpGroupAnnouncementFlag: false, //控制是否显示群公告或输入框
      completeButtonDisabled: false, //设置群公告完成按钮禁用状态
      dialogGroupAnnouncementPublishment: false,
      setupGroupRemarkFlag: false,
      dialogExitAnnouncementPublishment: false,
      showEditBtn: false,
    }
  },
  methods: {
    ...mapMutations(
      [
        'setGroupAnnouncement',
        'setGroupAnnouncementNotificationBarShowed'
      ]
    ),
    publishGroupAnnouncement() {
      this.dialogGroupAnnouncementPublishment = false
      const options = {
        lock: true,       // 是否锁屏
        text: '发布中',
        spinner: 'el-icon-loading',
        target: '.dialog-group-announcement-area',                    // 需要遮罩的区域
      }
      let elLoadingComponent = Loading.service(options);


      const publishmentTime = dateFormat("YYYY-mm-dd HH:MM:SS", new Date());
      let data = {
        xiuxianGroupId: this.selectedGroup.xiuxianGroupId,
        xiuxianUserId: this.getUser.xiuxianUserId,
        content: this.announcement,
        publishmentTime: publishmentTime
      }

      addGroupAnnouncement(data).then(res => {
        this.$nextTick(() => {
          elLoadingComponent.close()
          this.$emit('update:dialogGroupAnnouncement', false)
          this.setGroupAnnouncement(data)
          const value={
            xiuxianGroupId: data.xiuxianGroupId,
            showed: true
          }
          this.setGroupAnnouncementNotificationBarShowed(value)

        })
      }).catch((error) => {
        this.$message.error(error)
        elLoadingComponent.close()
      })
    },
    exitEdit() {
      this.dialogExitAnnouncementPublishment = false
      this.$emit('update:dialogGroupAnnouncement', false)
      // this.dialogGroupAnnouncement=false
      this.dialogGroupAnnouncementPublishment = false
    },
    handleClose() {
      if (!this.completeButtonDisabled && this.setUpGroupAnnouncementFlag) {
        this.dialogExitAnnouncementPublishment = true

      } else {
        this.$emit('update:dialogGroupAnnouncement', false)
        // this.dialogGroupAnnouncement=false
      }
    },
    editGroupAnnouncement() {
      this.showEditBtn = false
      this.setUpGroupAnnouncementFlag = true
    },
  },
  watch: {
    dialogGroupAnnouncement(newVal) {
      if (newVal) {
        if (this.selectedGroup.hasOwnProperty('announcement')) {
          this.showEditBtn = true
          this.setUpGroupAnnouncementFlag = false
        } else {
          // this.dialogGroupAnnouncement = true
          this.setUpGroupAnnouncementFlag = true
          this.announcement = ''
          this.completeButtonDisabled = true
          return
        }

        const publisherId = this.selectedGroup.announcement.xiuxianUserId
        let friend = this.friendlist.find(friend => friend.friendXiuxianId === publisherId)
        if (friend !== undefined) {
          if (friend.remark !== null && friend.remark !== '') {
            this.selectedGroup.announcement.name = friend.remark
          } else {
            this.selectedGroup.announcement.name = friend.nickname
          }
          this.selectedGroup.announcement.profile = friend.profile
        } else {
          let member = this.selectedGroup.xiuxianUsers.find(member => member.xiuxianUserId === publisherId)
          this.selectedGroup.announcement.name = member.nickname
          this.selectedGroup.announcement.profile = member.profile
        }
        this.announcement = this.selectedGroup.announcement.content
        if (this.selectedGroup.announcement.publishmentTime.indexOf("年") === -1) {
          this.selectedGroup.announcement.publishmentTime = dateFormat("YYYY年mm月dd日 HH:MM", new Date(this.selectedGroup.announcement.publishmentTime))
        }
      }
    }
  }
}
</script>

<style lang="stylus">
.group-announcement
  .group-announcement-dialog
    .el-dialog__header
      text-align: left

    .el-dialog__title
      color: #8c939d
      font-size: 10px

    .dialog-group-announcement-area
      .publisher-area
        display: flex
        height: 32px

        .list-left
          .avatar
            width: 32px
            height: 32px
            border-radius: 5px

        .list-right
          margin-left: 8px
          height: 32px

          .name
            font-size: 12px
            color: black

          .time
            vertical-align: bottom
            font-size: 12px

      .announcement-area
        border-top: 1px solid #f2efee
        margin-top: 10px
        padding: 20px 0 20px 0

        .group-announcement-content
          font-size: 14px
          color: black
          white-space: break-spaces
          height: 274px

      .dialog-footer
        align-items: center
        margin-left: 28%

  .group-announcement-publishment-dialog
    .el-dialog__body
      font-size: 15px
      color: black

    .dialog-footer
      margin-left: 15%

  .exit-group-announcement-dialog
    .el-dialog__body

      font-size: 15px
      color: black

    .dialog-footer
      margin-left: 7%

</style>
