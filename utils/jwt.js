const R = require('ramda');
const Either = require('data.either')
const jwt = require('jsonwebtoken')

const monad_utils = require('./monad')

class TokenDecodeError extends Error {
    constructor(message) {
      super(message)
      this.name = this.constructor.name
      Error.captureStackTrace(this, this.constructor)
    }
}

class TokenVersionError extends Error {
    constructor(message) {
      super(message)
      this.name = this.constructor.name
      Error.captureStackTrace(this, this.constructor)
    }
}

class TokenExpiryError extends Error {
    constructor(message) {
      super(message)
      this.name = this.constructor.name
      Error.captureStackTrace(this, this.constructor)
    }
}

/*
  Given the encrypted token, tries to decrypted it.
  It returns either the decrypted token (if successful) or an error (on failure)
  Either way, the result is wrapped in an Either monad
  Signature:
  (key, encrypted_token) => Either(decrypted_token | TokenDecodeErrorError)
*/
const decode_token = R.curry(R.compose(
    R.ifElse(
        R.isNil,
        (val) => Either.Left(new TokenDecodeError("Token is not decodable with secret")),
        Either.Right
    ),
    (key, token) => jwt.decode(token, key)
))

/*
  Given the decrypted token, check that the version of the token matches the expected version
  The check passes if the version is undefined (it assumes in that case that there are no version checks).
  The function returns the token if the check is successful, else it returns an error.
  The result is wrapped in an Either monad.
  Signature:
  (version_getter_fn, decrypted_token) => Either(decrypted_token | TokenVersionError)
*/
const check_token_version = R.curry((versionGetter, version, token) => {
    return R.ifElse(
        R.either(
            R.compose(R.equals(version), versionGetter),
            R.compose(R.isNil, versionGetter)
        ),
        Either.Right,
        (token) => Either.Left(new TokenVersionError("Token is not at the right version"))
    )(token)
})

/*
  Given the decrypted token, check that the token is not expired
  The check passes if the expiry is undefined (it assumes in that case that there are no expiry checks).
  The function returns the token if the check is successful, else it returns an error.
  The result is wrapped in an Either monad.
  Signature:
  (expiry_getter_fn, current_time_in_seconds, decrypted_token) => Either(decrypted_token | TokenExpiryError)
*/
const check_token_expiry = R.curry((expiryGetter, currentTimeInSeconds, token) => {
    return R.ifElse(
        R.either(
            R.compose(R.lt(currentTimeInSeconds), expiryGetter),
            R.compose(R.isNil, expiryGetter)
        ),
        Either.Right,
        (token) => Either.Left(new TokenExpiryError("Token is expired"))
    )(token);
})

const process_request_token = R.curry((
  request_token_getter,
  secret,
  versionCheckFn,
  ExpiryCheckFn
) => {
    return R.compose(
        monad_utils.chain(ExpiryCheckFn),
        monad_utils.chain(versionCheckFn),
        monad_utils.chain(decode_token(secret)),
        request_token_getter
    )
})


module.exports = {
    TokenDecodeError,
    TokenVersionError,
    TokenExpiryError,
    decode_token,
    check_token_version,
    check_token_expiry,
    process_request_token
}