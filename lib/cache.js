/**
 * This is an abstraction layer over the storage device
 * used to cache objects.
 */

// dead simple local storage
var local = {}

// key to object hash mapping
var deps = {}

// object hash to key mapping
var objKeys = {}

const cacheAPI = {
    set: (key, value) => {
        local[key] = value
    },

    get: (key) => {
        return local[key]
    },

    clear: (key) => {
        delete local[key]

        return true
    },

    keyDependency: (key, objHash) => {
        if(deps[key] == null) {
            deps[key] = []
        }

        if(objKeys[objHash] == null) {
            objKeys[objHash] = []
        }

        deps[key].push(objHash)
        objKeys[objHash].push(key)
    },

    outdatedDepency: (objHash) => {
        const keys = objKeys[objHash]

        keys.forEach(key => {
            cacheAPI.clear(key)
        })
    }
}

module.exports = cacheAPI