# Sequelize Turbo

Turbo is a caching layer that is eventually consitant for FAUW (Frequent access, unfrequent writes) objects.

## How to install

### 1. Add the package

```
npm install sequelize-turbo --save
```

```
yarn add --save
```


### 2. Wrap objects

Whenever you create Sequelize objects in your code, wrap them as follow:

```js
const Turbo = require('sequelize-turbo')

const User = Turbo(
    sequelize.define('User', {
        ...config
    })
)

export default User
```

That's it! Turbo uses RAM to cache objects. However, is a distributed envrionment, using Redis is much more efficient.

## How does it work

Turbo adds decoratos on top of the usual sequelize functions `find`, `update`, `destroy` and `insert`. Using a dependency cache, Turbo can figure out when to
invalidate objects and when to cache them.

Turbo guarantees freshness of the objects, you will never get outdated objects.

## Debug

Set the following environment variable to debug Turbo: `DEBUG=turbo:*`