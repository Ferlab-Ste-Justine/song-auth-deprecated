const jwt = require('jsonwebtoken')
const R = require('ramda')
const Either = require('data.either')

const jwt_utils = require('./jwt')
const monad_utils = require('./monad')

test('Assert that decoding works on the happy path', () => {
    var token = jwt.sign({ foo: 'bar' }, 'test')
    expect(
        R.compose(
            monad_utils.chain(R.prop('foo')),
            jwt_utils.decode_token('test')
        )(token)
    ).toBe('bar')
})

test('Assert that decoding reports an error on null/undefined tokens', () => {
    expect(
        R.compose(
            monad_utils.get_value,
            jwt_utils.decode_token('test')
        )(null)
    ).toBeInstanceOf(jwt_utils.TokenDecodeError)
    expect(
        R.compose(
            monad_utils.get_value,
            jwt_utils.decode_token('test')
        )(undefined)
    ).toBeInstanceOf(jwt_utils.TokenDecodeError)
})

test('Assert that version checks works on the happy path', () => {
    let assert_version_at_1 = jwt_utils.check_token_version(R.prop('version'), 1)

    var token = jwt.sign({ foo: 'bar', version: 1 }, 'test')
    expect(
        R.compose(
            monad_utils.chain(R.prop('foo')),
            monad_utils.chain(assert_version_at_1),
            jwt_utils.decode_token('test')
        )(token)
    ).toBe('bar')

    var token2 = jwt.sign({ foo: 'bar' }, 'test')
    expect(
        R.compose(
            monad_utils.chain(R.prop('foo')),
            monad_utils.chain(assert_version_at_1),
            jwt_utils.decode_token('test')
        )(token2)
    ).toBe('bar')
})

test('Assert that version checks fail when version does not match', () => {
    let assert_version_at_1 = jwt_utils.check_token_version(R.prop('version'), 1)

    var token = jwt.sign({ foo: 'bar', version: 2 }, 'test')
    expect(
        R.compose(
            monad_utils.get_value,
            monad_utils.chain(assert_version_at_1),
            jwt_utils.decode_token('test')
        )(token)
    ).toBeInstanceOf(jwt_utils.TokenVersionError)
})

test('Assert that expiry checks work on the happy path', () => {
    let assert_not_expired_after_20s = jwt_utils.check_token_expiry(R.prop('expiry'), 20)

    var token = jwt.sign({ foo: 'bar', expiry: 30 }, 'test')
    expect(
        R.compose(
            monad_utils.chain(R.prop('foo')),
            monad_utils.chain(assert_not_expired_after_20s),
            jwt_utils.decode_token('test')
        )(token)
    ).toBe('bar')

    var token2 = jwt.sign({ foo: 'bar' }, 'test')
    expect(
        R.compose(
            monad_utils.chain(R.prop('foo')),
            monad_utils.chain(assert_not_expired_after_20s),
            jwt_utils.decode_token('test')
        )(token2)
    ).toBe('bar')
})

test('Assert that expiry check fails when token is expired', () => {
    let assert_not_expired_after_20s = jwt_utils.check_token_expiry(R.prop('expiry'), 20)

    var token = jwt.sign({ foo: 'bar', expiry: 10 }, 'test')
    expect(
        R.compose(
            monad_utils.get_value,
            monad_utils.chain(assert_not_expired_after_20s),
            jwt_utils.decode_token('test')
        )(token)
    ).toBeInstanceOf(jwt_utils.TokenExpiryError)
})

test('Assert that token processing behaves as expected on the happy path', () => {
    var token = jwt.sign({ foo: 'bar', expiry: 30, version: 1 }, 'test')
    var request = {
      'headers': {
        'Authorization': `Bearer ${token}`
      }
    }

    const get_token = R.compose(
      R.ifElse(
        R.isNil,
        () => Either.Left(new Error("Token undefined")),
        (header) => Either.Right(header.substr(7))
      ),
      R.path(['headers', 'Authorization'])
    )

    const process = jwt_utils.process_request_token(
      get_token,
      'test',
      jwt_utils.check_token_version(R.prop('version'), 1),
      jwt_utils.check_token_expiry(R.prop('expiry'), 20)
    )

    expect(
      R.compose(
        monad_utils.chain(R.prop('foo')),
        process
      )(request)
    ).toBe('bar')
})

