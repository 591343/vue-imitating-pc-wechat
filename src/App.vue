<template>
  <transition name="el-fade-in-linear">
    <router-view />
  </transition>
</template>

<style>

</style>
<script>

import storage from "./utils/storage";

export default {
  name:'App',
  created () {
    //在页面加载时读取sessionStorage里的状态信息

    if (storage.get("store") ) {
      this.$store.replaceState(Object.assign({}, this.$store.state,JSON.parse(storage.get("store"))))
    }
    //在页面刷新时将vuex里的信息保存到sessionStorage里
    window.addEventListener("beforeunload",()=>{
      storage.set("store",JSON.stringify(this.$store.state))
    })
  }

}
</script>
