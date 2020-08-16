import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Share from '../views/Share.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/share',
    name: 'Share',
    component: Share
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
