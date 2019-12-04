const R = require('ramda');

const jwt_utils = require('../utils/jwt')
const monad_utils = require('../utils/monad')
const configs = require('./configs')

const get_current_time_in_seconds = () => Math.round( new Date().getTime() / 1000 )

