const R = require('ramda')

const chain = R.curry((fn, monad) => {
    return monad.chain(fn)
})

const map = R.curry((fn, monad) => {
    return monad.map(fn)
})

const get_value = R.prop('value')

module.exports = {
    chain,
    map,
    get_value
}