import Vue from 'vue'
import Router from 'vue-router'
import storage from "../utils/storage";
import store from "../store";

Vue.use(Router)

export const pageRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: require('@/page/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: require('@/page/Register.vue')
  }
]
export const moduleRoutes = [
  {
    path: '/loginSetup',
    component: () => import('@/page/setup/LoginSetUp.vue'),
    name: 'LoginSetUp',
    // 某些页面规定必须登录后才能查看 ，可以在router中配置meta，将需要登录的requireAuth设为true，
    meta: {
      requireAuth: true,
    },
  },
  {
  path: '/',
  component: () => import('@/page/Home.vue'),
  name: 'home',
  // 某些页面规定必须登录后才能查看 ，可以在router中配置meta，将需要登录的requireAuth设为true，
  meta: {
    requireAuth: true,
  },
  children: [
    {
      path: '/chat',
      name: 'Chat',
      component: require('@/page/chat/chat.vue')
    },
    {
      path: '/friend',
      name: 'Friend',
      component: require('@/page/friend/friend.vue'),
      children: [
        {
          path: '/friendInfo',
          name: 'FriendInfo',
          component: require('@/page/info/FriendInfo.vue')
        },
        {
          path: '/groupInfo',
          name: 'GroupInfo',
          component: require('@/page/info/GroupInfo.vue')
        }
      ]
    },
    {
      path: '/my',
      name: 'My',
      component: require('@/page/resume/resume.vue')
    },
  ]
}]


const router = new Router({
  mode: 'hash',
  scrollBehavior: () => ({y: 0}),
  linkActiveClass: 'active',
  routes: pageRoutes.concat(moduleRoutes)
})

// 设置路由守卫，在进页面之前，判断有token，才进入页面，否则返回登录页面
if (storage.get("token")) {
  store.commit("setToken", storage.get("token"));
}
router.beforeEach((to, from, next) => {
  // 判断要去的路由有没有requiresAuth
  // to.matched.some(r => r.meta.requireAuth) or to.meta.requiresAuth

  if (to.matched.some(r => r.meta.requireAuth)) {

    if (store.state.token) {
      next(); //有token,进行request请求，后台还会验证token
    } else {
      next({
        path: "/login",
        // 将刚刚要去的路由path（却无权限）作为参数，方便登录成功后直接跳转到该路由，这要进一步在登陆页面判断
        query: {redirect: to.fullPath}
      });
    }
  } else {
    next(); //如果无需token,那么随它去吧
  }
});

export default router
