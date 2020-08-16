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
    console.log('Service worker has been registered.')
  },
  cached () {
    triggerPWAEvent('cached')
    console.log('Content has been cached for offline use.')
  },
  updatefound () {
    triggerPWAEvent('updatefound')
    console.log('New content is downloading.')
  },
  updated () {
    triggerPWAEvent('updated')
    console.log('New content is available; please refresh.')
  },
  offline () {
    console.log('No internet connection found. App is running in offline mode.')
  },
  error (error) {
    console.error('Error during service worker registration:', error)
  }
})
// }
