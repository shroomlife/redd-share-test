/* eslint-disable no-console */

import { register } from 'register-service-worker'

const triggerPWAEvent = (name, data = {}) => {
  document.dispatchEvent(
    new CustomEvent('customServiceWorkerEvent', {
      detail: {
        name: name,
        data: data
      }
    })
  )
}

// if (process.env.NODE_ENV === 'production') {
register(`${process.env.BASE_URL}service-worker.js`, {
  ready () {
    console.log(
      'App is being served from cache by a service worker.\n' +
        'For more details, visit https://goo.gl/AFskqB'
    )
  },
  registered () {
    triggerPWAEvent('registered')
  },
  cached () {
    triggerPWAEvent('cached')
  },
  updatefound () {
    triggerPWAEvent('updatefound')
  },
  updated () {
    triggerPWAEvent('updated')
  },
  offline () {
    triggerPWAEvent('offline')
  },
  error (error) {
    console.error('Error during service worker registration:', error)
  }
})
// }
