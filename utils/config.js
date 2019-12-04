const R = require('ramda')
const Either = require('data.either')

const generic_utils = require('./generic')

class ConfigUndefinedError extends Error {
    constructor(key) {
        super(`${key} configuration is undefined`)
        this.name = this.constructor.name
        this.key = key
        Error.captureStackTrace(this, this.constructor)
    }
}

const get_env_variable = (key) => {
    return {'key': key, 'val': R.prop(key, process.env)}
}

const load_config = R.curry((getConfigFn, tranformerFn, FallbackFn) => {
    return R.compose(
        R.ifElse(
            R.isNil,
            tranformerFn,
            FallbackFn
        ),
        getConfigFn
    )
})

const load_mandatory_str_env_var = load_config(
    get_env_variable,
    R.compose(Either.Right, R.prop('val')),
    R.compose(Either.Left, ConfigUndefinedError, R.prop('key')),
)

module.exports = {
    ConfigUndefinedError,
    load_config,
    load_mandatory_str_env_var
}