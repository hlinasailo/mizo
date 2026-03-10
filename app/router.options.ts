import type { RouterConfig } from '@nuxt/schema'

export default <RouterConfig>{
  routes: (routes) => {
    return [
      ...routes,
      {
        name: 'dashboard',
        path: '/dashboard',
        component: () => import('./blog/userDashboard.vue')
      },
      {
        name: 'use-dashboard',
        path: '/userDashboard',
        component: () => import('./blog/userDashboard.vue')
      },
      {
        name: 'user-dashboard',
        path: '/user-dashboard',
        component: () => import('./blog/userDashboard.vue')
      },
      {
        name: 'create',
        path: '/create',
        component: () => import('./blog/create.vue')
      },
      {
        name: 'blog-create',
        path: '/blog/create',
        component: () => import('./blog/create.vue')
      }
    ]
  }
}
