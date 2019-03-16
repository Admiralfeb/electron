'use strict'

/* global nodeProcess, isolatedWorld, worldId */

const { EventEmitter } = require('events')

process.atomBinding = require('@electron/internal/common/atom-binding-setup').atomBindingSetup(nodeProcess.binding, 'renderer')

const v8Util = process.atomBinding('v8_util')

const isolatedWorldArgs = v8Util.getHiddenValue(isolatedWorld, 'isolated-world-args')

if (isolatedWorldArgs) {
  const { ipcRendererInternal, guestInstanceId, isHiddenPage, openerId, usesNativeWindowOpen } = isolatedWorldArgs
  const { windowSetup } = require('@electron/internal/renderer/window-setup')
  windowSetup(ipcRendererInternal, guestInstanceId, openerId, isHiddenPage, usesNativeWindowOpen)
}

const extension = v8Util.getHiddenValue(isolatedWorld, `extension-${worldId}`)

if (extension) {
  const { extensionId, ipcRendererUtils } = extension
  const chromeAPI = require('@electron/internal/renderer/chrome-api')
  chromeAPI.injectTo(extensionId, window, ipcRendererUtils)
}
