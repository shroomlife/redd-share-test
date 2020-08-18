<template>
  <div id="app">
    <loading :active.sync="isLoading" :is-full-page="true"></loading>

    <b-navbar toggleable="lg" type="dark" variant="light">
      <div class="container">
        <b-navbar-brand href="/">
          <img src="./assets/logo32.png" height="32" />
        </b-navbar-brand>
      </div>
    </b-navbar>

    <div class="container pt-3">
      <router-view />
    </div>

    <footer class="footer" type="dark" variant="light">
      <div class="container">
        <div class="row">
          <div class="col-4">
            <span class="text-muted">Version: {{pkg.version}}</span>
          </div>
          <div class="col-8" v-if="isUpdateAvailable">
            <div class="row">
              <div class="col-7">
                <strong>Update available!</strong>
              </div>
              <div class="col-5 text-right">
                <button class="btn btn-primary" @click.prevent="doUpdate">Apply</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>

    <!-- /.container -->

    <!--
    <div id="nav">
      <router-link to="/">Home</router-link>|
      <router-link to="/about">About</router-link>
    </div>
    <router-view />
    -->

    <div id="fb-root"></div>
  </div>
</template>

<script>
import pkg from '../package.json'
import moment from 'moment'
import Loading from 'vue-loading-overlay'
export default {
  name: 'App',
  components: {
    Loading
  },
  data: function () {
    return {
      shares: [],
      pwa: {
        updatefound: false,
        cached: false
      },
      isLoading: false
    }
  },
  computed: {
    pkg: () => {
      return pkg
    },
    computedShares () {
      const shares = this.shares.slice(0)
      return shares.reverse()
    },
    isUpdateAvailable () {
      return this.pwa.updatefound && !this.pwa.cached
    }
  },
  created: function () {
    document.addEventListener('customServiceWorkerEvent', (event) => {
      if (event.detail && event.detail.name === 'updatefound') {
        this.pwa.updatefound = true
      }
      if (event.detail && event.detail.name === 'cached') {
        this.pwa.cached = true
      }
    })
  },
  mounted: function () {
    this.loadShares()
  },
  methods: {
    loadShares () {
      const loadedStorage = this.getStorage()
      if (typeof loadedStorage.shares !== 'undefined') {
        this.shares = loadedStorage.shares
      }
    },
    getStorage () {
      const storageContent = localStorage.getItem('REDD_SHARE_STORAGE')
      if (storageContent === null) {
        localStorage.setItem(
          'REDD_SHARE_STORAGE',
          JSON.stringify({
            shares: this.shares
          })
        )
      }
      return JSON.parse(localStorage.getItem('REDD_SHARE_STORAGE')) || {}
    },
    saveStorage () {
      localStorage.setItem(
        'REDD_SHARE_STORAGE',
        JSON.stringify({
          shares: this.shares
        })
      )
    },
    saveTip (url, platform, amount) {
      this.shares.push({
        url: url,
        platform: platform,
        amount: amount,
        created: moment().toISOString()
      })
      this.saveStorage()
    },
    doUpdate () {
      this.startLoader()
      const cacheOperations = []
      caches.keys().then(function (names) {
        for (const name of names) {
          cacheOperations.push(caches.delete(name))
        }
      })
      Promise.all(cacheOperations).then(() => {
        window.location.reload()
      })
    },
    startLoader () {
      this.isLoading = true
    },
    stopLoader () {
      this.isLoading = false
    }
  }
}
</script>

<style>
#app {
  font-family: "Roboto", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  padding-bottom: 65px;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
footer {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 60px;
  line-height: 60px;
  background-color: #f5f5f5;
}
</style>
