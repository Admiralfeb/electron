'use strict'

const Event = require('@electron/internal/renderer/extensions/event')

class WebNavigation {
  constructor (ipcRendererInternal) {
    this.onBeforeNavigate = new Event()
    this.onCompleted = new Event()

    ipcRendererInternal.on('CHROME_WEBNAVIGATION_ONBEFORENAVIGATE', (event, details) => {
      this.onBeforeNavigate.emit(details)
    })

    ipcRendererInternal.on('CHROME_WEBNAVIGATION_ONCOMPLETED', (event, details) => {
      this.onCompleted.emit(details)
    })
  }
}

exports.setup = (ipcRendererInternal) => {
  return new WebNavigation(ipcRendererInternal)
}
