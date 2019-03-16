'use strict'

exports.setup = function (extensionId, ipcRendererUtils) {
  const getStorage = (storageType, callback) => {
    if (typeof callback !== 'function') throw new TypeError('No callback provided')

    ipcRendererUtils.invoke('CHROME_STORAGE_READ', storageType, extensionId)
      .then(data => {
        if (data !== null) {
          callback(JSON.parse(data))
        } else {
          // Disabled due to false positive in StandardJS
          // eslint-disable-next-line standard/no-callback-literal
          callback({})
        }
      })
  }

  const setStorage = (storageType, storage, callback) => {
    const json = JSON.stringify(storage)
    ipcRendererUtils.invoke('CHROME_STORAGE_WRITE', storageType, extensionId, json)
      .then(() => {
        if (callback) callback()
      })
  }

  const getStorageManager = (storageType) => {
    return {
      get (keys, callback) {
        getStorage(storageType, extensionId, storage => {
          if (keys == null) return callback(storage)

          let defaults = {}
          switch (typeof keys) {
            case 'string':
              keys = [keys]
              break
            case 'object':
              if (!Array.isArray(keys)) {
                defaults = keys
                keys = Object.keys(keys)
              }
              break
          }

          // Disabled due to false positive in StandardJS
          // eslint-disable-next-line standard/no-callback-literal
          if (keys.length === 0) return callback({})

          const items = {}
          keys.forEach(function (key) {
            let value = storage[key]
            if (value == null) value = defaults[key]
            items[key] = value
          })
          callback(items)
        })
      },

      set (items, callback) {
        getStorage(storageType, extensionId, storage => {
          Object.keys(items).forEach(function (name) {
            storage[name] = items[name]
          })

          setStorage(storageType, extensionId, storage, callback)
        })
      },

      remove (keys, callback) {
        getStorage(storageType, extensionId, storage => {
          if (!Array.isArray(keys)) {
            keys = [keys]
          }
          keys.forEach(function (key) {
            delete storage[key]
          })

          setStorage(storageType, extensionId, storage, callback)
        })
      },

      clear (callback) {
        setStorage(storageType, extensionId, {}, callback)
      }
    }
  }

  return {
    sync: getStorageManager('sync'),
    local: getStorageManager('local')
  }
}
