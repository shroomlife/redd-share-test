<template>
  <div>
    <div class="row" v-if="currentShare.isTippable&&currentShare.isReady">
      <div class="col-12 text-center">
        <label>
          <h5>Choose Your Tip Amount</h5>
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
      <hr />
    </div>

    <div v-if="currentShare.isReady">
      <div>
        <div v-if="currentShare.isTwitter">
          <div v-if="currentShare.twitter.isTweet">
            <b-card title="Tweet">
              <b-card-text>
                <Tweet :id="computedTweetID" v-if="computedTweetID" align="center"></Tweet>
              </b-card-text>
            </b-card>
          </div>
          <div v-if="currentShare.twitter.isProfile">
            <b-card title="Twitter Profile">
              <b-card-text>
                <Timeline :id="computedTwitterProfileName" sourceType="profile" />
              </b-card-text>
            </b-card>
          </div>
        </div>

        <div v-if="currentShare.isFacebook" class="text-center mt-3">
          <b-card title="Facebook Post" v-if="currentShare.facebook.isPost">
            <b-card-text>
              <iframe
                :src="`https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(currentShare.url)}&width=640&height=420`"
                width="640"
                height="520"
                style="border:none;overflow:hidden"
                scrolling="no"
                frameborder="0"
                allowtransparency="true"
                allow="encrypted-media"
              ></iframe>
            </b-card-text>
          </b-card>
          <b-card title="Facebook Profile" v-if="currentShare.facebook.isProfile">
            <b-card-text>
              <iframe
                :src="`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(currentShare.url)}&tabs=timeline&width=500&height=420&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId`"
                width="500"
                height="420"
                style="border:none;overflow:hidden"
                scrolling="no"
                frameborder="0"
                allowtransparency="true"
                allow="encrypted-media"
              ></iframe>
            </b-card-text>
          </b-card>
          <b-card title="Facebook Comment" v-if="currentShare.facebook.isComment">
            <b-card-text>
              <a class="share-link" :href="currentShare.url" target="_blank">{{currentShare.url}}</a>
            </b-card-text>
          </b-card>
          <b-card title="Facebook Group" v-if="currentShare.facebook.isGroup">
            <b-card-text>
              <a class="share-link" :href="currentShare.url" target="_blank">{{currentShare.url}}</a>
            </b-card-text>
          </b-card>
        </div>

        <div v-if="currentShare.isInstagram" class="text-center mt-3">
          <b-card title="Instagram Post" v-if="currentShare.instagram.isPost">
            <b-card-text>
              <iframe class="instagram-media instagram-media-rendered" id="instagram-embed-1" :src="rewriteInstagramSource(currentShare.url)" width="640" height="960" allowtransparency="true" allowfullscreen="true" frameborder="0" data-instgrm-payload-id="instagram-media-payload-1" scrolling="no"></iframe>
            </b-card-text>
          </b-card>
        </div>

        <div v-if="currentShare.isDefault" class="mb-3">
          <b-card title="Shared URL">
            <b-card-text>
              <a :href="currentShare.url" target="_blank">{{currentShare.url}}</a>
            </b-card-text>
            <span class="badge badge-warning">This URL is not tippable yet</span>
          </b-card>
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
  </div>
</template>

<script>
import JsonViewer from 'vue-json-viewer'
import { Tweet, Timeline } from 'vue-tweet-embed'

export default {
  name: 'Share',
  components: {
    JsonViewer,
    Tweet,
    Timeline
  },
  data: function () {
    return {
      currentShare: {
        platform: null,
        isReady: false,
        url: null,
        isTwitter: false,
        twitter: {
          isTweet: false,
          isProfile: false,
          isList: false
        },
        isFacebook: false,
        facebook: {
          isPost: false,
          isProfile: false,
          isGroup: false,
          isComment: false
        },
        isInstagram: false,
        instagram: {
          isPost: false,
          isProfile: false
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
    rewriteInstagramSource () {
      const postID = this.instagramPostRegex.exec(this.currentShare.url)[1]
      return `https://instagram.com/p/${postID}/embed/`
    },
    tipAmount () {
      this.$root.RunningApp.startLoader()
      new Promise((resolve, reject) => {
        setTimeout(resolve, 1000)
      }).then(() => {
        const tipAmount = this.computedTipAmount
        this.$swal(
          'Sent',
          `You have sent ${tipAmount} RDD successfully.`,
          'success'
        )
        this.$root.RunningApp.saveTip(
          this.currentShare.url,
          this.currentShare.platform,
          this.computedTipAmount
        )
        this.$root.RunningApp.stopLoader()
        this.$root.Router.push('/')
      })
    },
    loadShare () {
      this.$root.RunningApp.startLoader()

      if (typeof this.$route.query.text === 'undefined') {
        this.$swal('Error', 'No tippable Share could be found.', 'error')
        this.$root.RunningApp.stopLoader()
        return this.$root.Router.push('/')
      }

      const url = (this.currentShare.url = this.$route.query.text)

      let isReady = false
      if (url.indexOf('twitter.com') !== -1) {
        this.currentShare.isTwitter = true
        this.currentShare.platform = 'twitter'
        if (this.twtitterStatusRegex.test(url)) {
          isReady = this.currentShare.twitter.isTweet = true
        }

        if (isReady === false) {
          if (this.twtitterProfileRegex.test(url)) {
            isReady = this.currentShare.twitter.isProfile = true
          }
        }
      }

      if (isReady === false) {
        if (url.indexOf('facebook.com') !== -1) {
          this.currentShare.isFacebook = true
          this.currentShare.platform = 'facebook'
          if (url.indexOf('/posts/') !== -1 || url.indexOf('/permalink/')) {
            isReady = this.currentShare.facebook.isPost = true
          }

          if (isReady === false) {
            if (url.indexOf('comment_id=') !== -1) {
              isReady = this.currentShare.facebook.isComment = true
            }
          }

          if (isReady === false) {
            if (url.indexOf('/groups/') !== -1) {
              isReady = this.currentShare.facebook.isGroup = true
            }
          }

          if (isReady === false) {
            if (this.facebookProfileRegex.test(url)) {
              isReady = this.currentShare.facebook.isProfile = true
            }
          }
        }
      }

      if (isReady === false) {
        if (url.indexOf('instagram.com') !== -1) {
          this.currentShare.isInstagram = true
          this.currentShare.platform = 'instagram'

          if (this.instagramPostRegex.test(url)) {
            isReady = this.currentShare.instagram.isPost = true
          }
        }
      }

      if (isReady === false) {
        this.currentShare.isDefault = true
        this.currentShare.isTippable = false
        this.currentShare.platform = 'unknown'
        isReady = true
      }

      this.currentShare.isReady = isReady

      setTimeout(() => {
        this.$root.RunningApp.stopLoader()
      }, 500)
    }
  },
  computed: {
    isReadyToTip () {
      if (
        this.tipping.selected === 'custom' &&
        this.tipping.amount !== null &&
        this.tipping.amount > 0
      ) {
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
    instagramPostRegex () {
      return new RegExp(/https:\/\/w?w?w?\.?instagram\.com\/p\/(.+?)/)
    },
    twtitterProfileRegex () {
      return new RegExp(/https:\/\/twitter\.com\/(.+)\/?$/)
    },
    facebookProfileRegex () {
      return new RegExp(/https:\/\/www\.facebook\.com\/(.+)\/?$/)
    },
    computedTweetID () {
      const url = this.currentShare.url
      if (!this.twtitterStatusRegex.test(url)) {
        return false
      }
      return this.twtitterStatusRegex.exec(this.currentShare.url)[1]
    },
    computedTwitterProfileName () {
      const url = this.currentShare.url
      if (!this.twtitterProfileRegex.test(url)) {
        return false
      }
      return this.twtitterProfileRegex.exec(this.currentShare.url)[1]
    },
    currentShareType () {
      if (this.currentShare.platform === 'twitter') {
        if (this.currentShare.twitter.isTweet) return 'Tweet'
        if (this.currentShare.twitter.isProfile) return 'Twitter Profile'
      }
      return 'Unknown'
    }
  },
  mounted: function () {
    this.loadShare()
  }
}
</script>

<style scoped>
a.share-link {
  text-overflow: ellipsis;
  overflow: hidden;
  width: 100%;
  max-width: 640px;
  display: inline-block;
  white-space: nowrap;
}
iframe {
  max-width: 100%;
}
</style>
