import Vue from 'vue'
import VueRouter from 'vue-router'
import Anasayfa from '../pages/Anasayfa.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Anasayfa',
    component: Anasayfa
  },
  {
    path: '/GoogleOAuth',
    name: 'GoogleOAuth',
    // route level code-splitting
    // this generates a separate chunk (GoogleOAuth.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "GoogleOAuth" */ '../pages/GoogleOAuth.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
