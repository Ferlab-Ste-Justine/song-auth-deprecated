const R = require('ramda')

const config_utils = require('./utils/config')

const load_mandatory_str_config = (key) => {
    const result = config_utils.load_mandatory_str_env_var(key)
    if(result.isRight) {
        return result.value
    } else {
        console.log(`${result.key} configuration is undefined`)
        process.exit(1)
    }
}

module.exports = {
    jwtSecret: load_mandatory_str_config('JWT_SECRET'),
}