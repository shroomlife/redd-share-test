<template>
  <main role="main">
    <div class="row">
      <div class="col-12">
        <h1>Welcome</h1>
        <p>This is a little app to test share integration with PWA functions on mobile devices.</p>
      </div>
      <div class="col-12" v-if="currentShares.length">
        <h3>Recent Shares</h3>
        <div v-bind:key="share.created" v-for="share in currentShares">
          <div class="card p-3 mb-3">
            <div class="row">
              <div class="col-6">
                <img :src="getIcon(share.platform)" width="26" class="mr-2" />
                <span>{{capitalize(share.platform)}}</span>
              </div>
              <div class="col-6 text-right">
                <span class="badge badge-success amount-value">{{share.amount}} RDD</span>
              </div>
              <div class="col-12 share-link">
                <a :href="share.url" target="_blank">{{share.url}}</a>
              </div>
              <div class="col-12">{{getFromNow(share.created)}}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import moment from 'moment'
export default {
  name: 'Home',
  components: {},
  mounted: function () {},
  methods: {
    getIcon (platform) {
      return require(`../assets/social/${platform}.svg`)
    },
    capitalize (name) {
      return name.charAt(0).toUpperCase() + name.slice(1)
    },
    getFromNow (created) {
      return moment(created).fromNow()
    }
  },
  computed: {
    currentShares: function () {
      return this.$root.RunningApp.computedShares
    }
  }
}
</script>

<style scoped>
.share-link a {
  text-overflow: ellipsis;
  overflow: hidden;
  width: 100%;
  display: inline-block;
  white-space: nowrap;
}
.amount-value {
  font-size: 16px;
}
</style>
