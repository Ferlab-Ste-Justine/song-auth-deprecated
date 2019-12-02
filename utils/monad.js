const R = require('ramda')

const chain = R.curry((fn, monad) => {
    return monad.chain(fn)
})

const get_value = R.prop('value')

module.exports = {
    chain,
    get_value
}