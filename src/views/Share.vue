<template>
  <div>
    <h1>You Shared!</h1>
    <p>The following data has been shared to the app:</p>
    <div v-if="currentShare.isReady"></div>

    <div>
      <div v-if="currentShare.twitter.isTweet">
        <Tweet :id="computedTweetID" v-if="computedTweetID"></Tweet>
      </div>

      <div v-if="currentShare.isDefault" class="mb-3">
        <b-card title="Shared URL">
          <span class="badge badge-warning">This URL is not tippable yet</span>
          <b-card-text>
            <a :href="currentShare.url" target="_blank">{{currentShare.url}}</a>
          </b-card-text>
        </b-card>
      </div>
    </div>
    <div class="row" v-if="currentShare.isTippable&&currentShare.isReady">
      <div class="col-12 text-center">
        <label>
          <h5>Your Tip:</h5>
        </label>
        <b-form-select v-model="tipping.selected" :options="tipping.defaults"></b-form-select>
        <b-form-input
          v-if="tipping.selected==='custom'"
          class="mt-2"
          v-model="tipping.amount"
          placeholder="Enter RDD Amount"
        ></b-form-input>
        <button
          class="btn btn-lg btn-block btn-primary mt-2"
          :disabled="!isReadyToTip"
          @click.prevent="tipAmount"
        >Tip Now</button>
      </div>
    </div>

    <div class="text-center">
      <b-button v-b-toggle.collapseDebugData variant="secondary" class="mt-4">Show Debug Data</b-button>
      <b-collapse id="collapseDebugData" class="mt-2">
        <div class="card text-left">
          <json-viewer :value="$route"></json-viewer>
        </div>
      </b-collapse>
    </div>
  </div>
</template>

<script>
import JsonViewer from 'vue-json-viewer'
import { Tweet } from 'vue-tweet-embed'

export default {
  name: 'Share',
  components: {
    JsonViewer,
    Tweet
  },
  data: function () {
    return {
      currentShare: {
        platform: null,
        isReady: false,
        url: null,
        twitter: {
          isTweet: false,
          isProfile: false,
          isList: false
        },
        isDefault: false,
        isTippable: true
      },
      tipping: {
        defaults: [
          { value: 25, text: '25 RDD' },
          { value: 50, text: '50 RDD' },
          { value: 100, text: '100 RDD' },
          { value: 'custom', text: 'Custom Amount' }
        ],
        selected: 25,
        amount: null
      }
    }
  },
  methods: {
    tipAmount () {
      const tipAmount = this.computedTipAmount
      this.$swal('Sent', `You have sent ${tipAmount} RDD successfully.`, 'success')
      this.$root.RunningApp.saveTip(this.currentShare.url, this.currentShare.platform, this.computedTipAmount)
      this.$root.Router.push('/')
    }
  },
  computed: {
    isReadyToTip () {
      if (this.tipping.selected === 'custom' && this.tipping.amount !== null && this.tipping.amount > 0) {
        return true
      } else {
        if (this.tipping.selected > 0) {
          return true
        }
      }
      return false
    },
    computedTipAmount () {
      if (this.tipping.selected === 'custom') {
        return this.tipping.amount
      } else {
        return this.tipping.selected
      }
    },
    twtitterStatusRegex () {
      return new RegExp(/https:\/\/twitter\.com\/.+\/status\/([0-9]+)/)
    },
    computedTweetID () {
      const url = this.currentShare.url
      if (!this.twtitterStatusRegex.test(url)) {
        return false
      }
      return this.twtitterStatusRegex.exec(this.currentShare.url)[1]
    }
  },
  mounted: function () {
    const url = (this.currentShare.url = this.$route.query.text)

    let isReady = false
    if (url.indexOf('https://twitter.com') !== -1) {
      if (this.twtitterStatusRegex.test(url)) {
        isReady = this.currentShare.twitter.isTweet = true
        this.currentShare.platform = 'twitter'
      }
    }

    if (isReady === false) {
      this.currentShare.isDefault = true
      this.currentShare.isTippable = false
      this.currentShare.platform = 'unknown'
    }

    this.currentShare.isReady = isReady
  }
}
</script>
