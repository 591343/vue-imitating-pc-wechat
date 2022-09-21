<!-- 好友列表 -->
<template>
  <div class="friendlist">
    <ul v-show="searchText!==''&&searchedFriendlist.length===0">
      <li class="frienditem">
        <div class="friend-info" :class="{ active:searchFriendActive}" @click="router_to_friend_info">
          <img class="avatar" width="36" height="36" :src="searchFriendImg">
          <div class="remark">网络查找好友</div>
        </div>
      </li>
    </ul>
    <ul v-show="searchText!==''&&searchedFriendlist.length===0">
      <li class="frienditem">
        <div class="friend-info" :class="{ active:searchGroupActive}" @click="router_to_group_info">
          <img class="avatar" width="36" height="36" :src="searchGroupImg">
          <div class="remark">网络查找群组</div>
        </div>
      </li>
    </ul>

    <ul>
      <li class="frienditem noborder" v-show="this.searchText==='新的朋友'||this.searchText===''">
        <div class="list_title" >新的朋友</div>
        <div class="friend-info" :class="{ active:newFriendActive}"
             @click="new_friend">
          <img class="avatar" width="36" height="36" :src="newFriend">
          <div class="remark">新的朋友</div>
        </div>
      </li>
      <li v-for="item in searchedFriendlist" class="frienditem" :class="{ noborder: !item.initial}">
        <div class="list_title" v-if="item.initial">{{ item.initial }}</div>
        <div class="friend-info" :class="{ active: item.friendXiuxianId === selectFriendId }"
             @click="router_to_friend_info1(item.friendXiuxianId,item.type)">
          <img v-if="item.type===0" class="avatar" width="36" height="36" :src="item.profile">
          <img v-else class="avatar" width="36" height="36" :src="item.groupProfile">
          <div v-if="item.type===0" class="remark">{{ item.remark===null?item.nickname:item.remark }}</div>
          <div v-else class="remark">{{ item.remark===null?item.groupName:item.remark }}</div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import {mapState, mapActions, mapGetters} from 'vuex'

export default {

  data() {
    return {
      searchFriendImg: 'static/images/addFriend.png',
      searchGroupImg: 'static/images/addGroup.png',
      newFriend:'static/images/newFriend.png',
      searchFriendActive: false,
      searchGroupActive: false,
      newFriendActive:false,
    }
  },
  computed: {
    ...mapState([
      'selectFriendId',
      'searchText'
    ]),
    ...mapGetters([
      'searchedFriendlist'
    ])
  },

  methods: {
    ...mapActions([
      'selectFriend',
    ]),

    router_to_friend_info() {
      this.$router.push("/friendInfo")
      this.selectFriend(-1)
      if (this.searchGroupActive) this.searchGroupActive = false
      this.searchFriendActive = !this.searchFriendActive

    },
    router_to_friend_info1(id, type) {

      this.selectFriend(id)
      if (type === 0) { //type 0:好友，1:群组

        this.$router.push("/friendInfo")
      } else {
        this.$router.push("/groupInfo")
      }

      this.newFriendActive=false
    },
    router_to_group_info() {
      this.$router.push("/groupInfo")
      this.selectFriend(-2)
      if (this.searchFriendActive) this.searchFriendActive = false
      this.searchGroupActive = !this.searchGroupActive
    },
    new_friend(){
      this.newFriendActive=true
      this.selectFriend(-1)
    }


  }
}
</script>

<style lang="stylus" scoped>
.friendlist
  height: 540px
  overflow-y: auto

  .frienditem
    border-top: 1px solid #dadada

    &:first-child, &.noborder
      border-top: none

    .list_title
      box-sizing: border-box
      width: 100%
      font-size: 12px
      padding: 15px 0 3px 12px
      color: #999

    .friend-info
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

      .remark
        font-size: 14px
        line-height: 36px


</style>
