const R = require('ramda')
const Either = require('data.either')

const fn_utils = require('@cr-ste-justine/functional-utils')
const either_utils = fn_utils.either

class ConfigUndefinedError extends Error {
    constructor(key) {
        super(`${key} configuration is undefined`)
        this.name = this.constructor.name
        this.key = key
        this.defaultMessage = `${key} configuration is undefined`
        Error.captureStackTrace(this, this.constructor)
    }
}

const generate_config_undefined_err = (key) => new ConfigUndefinedError(key)

class ConfigMalformatedError extends Error {
    constructor(key) {
        super(`${key} configuration is malformated`)
        this.name = this.constructor.name
        this.key = key
        this.defaultMessage = `${key} configuration is malformated`
        Error.captureStackTrace(this, this.constructor)
    }
}

/*
    Higher order function that will orchestrate 3 fonctions together:
    - A function to retrieve configuration
    - A function to transform configuration
    - A function to generate the fallback value if it is not defined
    Signature:
        configDict: {key: string, val: string}
        (
            (configKey) => configDict, 
            (configDict) => processedConfig, 
            () => processedConfig
        ) => (configKey) => processedConfig
*/
const load_config = R.curry((getConfigFn, tranformFn, fallbackFn) => R.compose(
    R.ifElse(
        R.compose(R.isNil, R.prop('val')),
        fallbackFn,
        tranformFn
    ),
    getConfigFn
))

/*
    Higher order function that, given a function to retrieve the configuration, will return 
    a function that will process string configurations and return an Either result.
    Signature:
        configDict: {key: string, val: string}
        ((key) => configDict) => ( (key) => Either(string | ConfigUndefinedError) )
*/
const load_mandatory_str_config = load_config(
    R.__,
    R.compose(Either.Right, R.prop('val')),
    R.compose(Either.Left, generate_config_undefined_err, R.prop('key')),
)

/*
    Higher order function that, given a function to retrieve the configuration and a function that
    returns the default value, will return the value of a configuration
    Signature:
        configDict: {key: string, val: string}
        ((key) => configDict, () => string) => ( (key) => string )
*/
const load_optional_str_config = load_config(
    R.__,
    R.prop('val'),
    R.__
)

/*
    Signature:
        (key, Either(dict | Err)) => Either(dict | ConfigMalformatedError)
*/
const handle_json_config = (key, result) => R.ifElse(
    R.prop('isRight'),
    R.identity,
    () => Either.Left(new ConfigMalformatedError(key))
)(result)

/*
    Higher order function that, given a function to retrieve the configuration, will return 
    a function that will process json configurations and return an Either result.
    Signature:
        configDict: {key: string, val: string}
        ((key) => configDict) => ( (key) => Either(json | ConfigUndefinedError | ConfigMalformatedError) )
*/
const load_mandatory_json_config = load_config(
    R.__,
    R.converge(
        handle_json_config,
        [
            R.prop('key'), 
            R.compose(either_utils.parse_json, R.prop('val'))
        ]
    ),
    R.compose(Either.Left, generate_config_undefined_err, R.prop('key'))
)

module.exports = {
    ConfigUndefinedError,
    ConfigMalformatedError,
    load_config,
    load_mandatory_str_config,
    load_optional_str_config,
    load_mandatory_json_config
}