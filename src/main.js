import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'
import Home from './views/Home.vue'
import { site } from './data.js'

const router = createRouter({
  // BASE_URL is "/" on a custom domain, "/<repo>/" on a project site.
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/writings/', name: 'writings', component: () => import('./views/Writings.vue'), meta: { title: 'Writings' } },
    { path: '/writings/:slug/', name: 'post', component: () => import('./views/Post.vue'), props: true },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('./views/NotFound.vue'), meta: { title: 'Not found' } },
  ],
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash, top: 24 }
    if (to.path !== from.path) return { top: 0 }
  },
})

// Post.vue sets its own title once the post is known.
router.afterEach((to) => {
  if (to.name !== 'post') document.title = to.meta.title ? `${to.meta.title} · ${site.title}` : site.title
})

createApp(App).use(router).mount('#app')
