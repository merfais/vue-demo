import Vue from 'vue';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
import Codemirror from 'vue-codemirror';
import 'codemirror/lib/codemirror.css';
import App from './app.vue';
import router from './router';
import store from './store';

Vue.config.productionTip = false;

Vue.use(Antd);
Vue.use(Codemirror, /* {
  options: { theme: 'base16-dark', ... },
  events: ['scroll', ...]
} */);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
