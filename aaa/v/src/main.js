import Vue from 'vue'
import 'element-ui/lib/theme-chalk/index.css';
import ElementUI from 'element-ui';
import App from './App.vue'

// import { Button, Select } from 'element-ui';
// Vue.use(Button)
// Vue.use(Select)
Vue.use(ElementUI);
Vue.config.productionTip = false

// Vue.use(ElementUI);

new Vue({
  render: h => h(App),
}).$mount('#app')
