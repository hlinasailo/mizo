import type { RouterConfig } from '@nuxt/schema'

export default <RouterConfig>{
  routes: (routes) => {
    routes.push(
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
    )

    return routes
  }
}
