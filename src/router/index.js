import Vue from "vue";
import VueRouter from "vue-router";
import routes from "vue-auto-routing";

Vue.use(VueRouter);

const router = new VueRouter({
  base: process.env.BASE_URL,
  routes: [{
    path: "/",
    redirect: "/SignIn"
  }, ...routes]
});

export default router;
