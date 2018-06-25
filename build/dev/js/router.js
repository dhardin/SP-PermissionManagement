const router = new VueRouter({
  routes: [
    {
      path: '/',
    component: Home,
    name: 'Home'
    },
    {
      path: '/about',
    component: About,
    name: 'About'
    }
  ]
});
