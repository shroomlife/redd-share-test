import '@babel/polyfill'
import 'mutationobserver-shim'
import Vue from 'vue'
import './plugins/bootstrap-vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import VueSweetalert2 from 'vue-sweetalert2'

import 'sweetalert2/dist/sweetalert2.min.css'
import 'vue-loading-overlay/dist/vue-loading.css'

Vue.use(VueSweetalert2)

Vue.config.productionTip = false

new Vue({
  router,
  computed: {
    RunningApp: function () {
      return this.$children[0]
    },
    Router: function () {
      return router
    }
  },
  render: h => h(App)
}).$mount('#app')
