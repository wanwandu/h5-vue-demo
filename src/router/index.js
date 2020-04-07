import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'

Vue.use(Router)
/* Layout */
// import Layout from '@/layout'

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/404',
      component: () => import('@/views/404'),
      hidden: true
    }
  ]
})
