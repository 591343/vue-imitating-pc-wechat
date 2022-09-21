<template>
  <div class="content">
    <div class="friend-wrapper">
      <search></search>
      <friendlist></friendlist>
    </div>
    <div class="friendinfo" v-if="selectFriendId!==0">
      <router-view></router-view>
    </div>
    <div class="empty-box" style="align-items: center;vertical-align: center" v-else>
      <el-image :src="backgroundImage" style="width: 100px; height:100px;"></el-image>
    </div>
  </div>
</template>

<script>
import search from '../../components/search/search'
import friendlist from '../../components/friendlist/friendlist'
import {mapState} from "vuex";

export default {
  components: {
    search,
    friendlist,

  },
  computed: {
    ...
      mapState([
        'selectFriendId',
      ]),
  },
  data() {
    return {
      backgroundImage: 'static/images/empty_box_bg.png'
    }
  },


}
</script>

<style lang="stylus" scoped>
.content
  display: flex
  width: 800px

  .friend-wrapper
    width: 250px
    background: rgb(230, 230, 230)

  .friendinfo
    flex: 1

  .empty-box
    display: flex
    justify-content: center
    align-items: center
    margin: 0 auto
</style>
