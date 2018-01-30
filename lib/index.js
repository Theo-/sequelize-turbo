const cache = require('./cache.js')
const hashFn = require('object-hash').sha1
const debug = console.log

const objConstructor = {}.constructor
const arrConstructor = [].constructor

var hit = 0
var miss = 0

function Turbo(sequelizeObject) {
    const originalFind = sequelizeObject.find
    const originalCreate = sequelizeObject.create

    sequelizeObject.find = function() {
        const hash = hashFn(arguments[0])
        const key = `query:${hash}`

        const value = cache.get(key)

        cache.keyDependency(key, sequelizeObject.name)

        printStats()

        if(value != null) {
            hit = hit + 1
            debug('HIT: ' + key)
            return Promise.resolve(value)
        } else {
            miss = miss + 1
            debug('MISS: ' + key)
        }

        return originalFind.apply(sequelizeObject, arguments).then(_ => {
            if(_.constructor == objConstructor) {
                debug('WRAPING object')
                _ = wrapObject(_, key)
            }

            if(_.constructor == arrConstructor) {
                debug('WRAPING array')
                _ = _.map((o) => wrapObject(o, key))
            }

            cache.set(key, _)

            return Promise.resolve(_)
        })

    }

    sequelizeObject.create = function() {
        debug('CLEARNING CACHE for model ' + sequelizeObject.name + ', inserting object')
        cache.outdatedDepency(sequelizeObject.name)

        return originalCreate.apply(sequelizeObject, arguments)
    }

    return sequelizeObject
}

function wrapObject(dbObject, cacheKey) {
    const originalUpdate = dbObject.update
    const originalDelete = dbObject.delete
    const hash = hashFn[dbObject.dataValues]

    cache.keyDependency(cacheKey, hash)

    dbObject.update = function() {
        debug('OBJECT ' + hash + ' updated')
        cache.outdatedDepency(hash)

        return originalUpdate.apply(dbObject, arguments)
    }

    dbObject.destroy = function() {
        debug('OBJECT ' + hash + ' destroyed')

        cache.outdatedDepency(hash)

        return originalDelete.apply(dbObject, arguments)
    }
}

function printStats() {
    const total = hit + miss
    
    function format(n) { return Math.floor(n * 100) / 100; }

    debug('MISS: ' +  format(miss / total) + ' (' + miss + ')')
    debug('HIT: ' + format(hit / total) + ' (' + hit + ')')
}

// Scoping turbo
module.exports = function() {
    return Turbo
}()