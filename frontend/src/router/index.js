import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../pages/Dashboard.vue';
import Create from '../pages/Create.vue';
import Setting from '../pages/Setting.vue';
import Chapter from '../pages/Chapter.vue';
import Schedule from '../pages/Schedule.vue';

const routes = [
  { path: '/', component: Dashboard },
  { path: '/create', component: Create },
  { path: '/setting', component: Setting },
  { path: '/chapter', component: Chapter },
  { path: '/schedule', component: Schedule },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
