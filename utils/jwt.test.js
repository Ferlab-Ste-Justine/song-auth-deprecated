const jwt = require('jsonwebtoken')
const R = require('ramda')
const Either = require('data.either')

const jwt_utils = require('./jwt')
const monad_utils = require('./monad')
const generic_utils = require('./generic')

test('Assert that decoding works on the happy path', () => {
    const token = jwt.sign({ foo: 'bar' }, 'test')
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
    const assert_version_at_1 = jwt_utils.check_token_version(R.prop('version'), 1)

    const token = jwt.sign({ foo: 'bar', version: 1 }, 'test')
    expect(
        R.compose(
            monad_utils.chain(R.prop('foo')),
            monad_utils.chain(assert_version_at_1),
            jwt_utils.decode_token('test')
        )(token)
    ).toBe('bar')

    const token2 = jwt.sign({ foo: 'bar' }, 'test')
    expect(
        R.compose(
            monad_utils.chain(R.prop('foo')),
            monad_utils.chain(assert_version_at_1),
            jwt_utils.decode_token('test')
        )(token2)
    ).toBe('bar')
})

test('Assert that version checks fail when version does not match', () => {
    const assert_version_at_1 = jwt_utils.check_token_version(R.prop('version'), 1)

    const token = jwt.sign({ foo: 'bar', version: 2 }, 'test')
    expect(
        R.compose(
            monad_utils.get_value,
            monad_utils.chain(assert_version_at_1),
            jwt_utils.decode_token('test')
        )(token)
    ).toBeInstanceOf(jwt_utils.TokenVersionError)
})

test('Assert that expiry checks work on the happy path', () => {
    const assert_not_expired_after_20s = jwt_utils.check_token_expiry(R.prop('expiry'), () => 20)

    const token = jwt.sign({ foo: 'bar', expiry: 30 }, 'test')
    expect(
        R.compose(
            monad_utils.chain(R.prop('foo')),
            monad_utils.chain(assert_not_expired_after_20s),
            jwt_utils.decode_token('test')
        )(token)
    ).toBe('bar')

    const token2 = jwt.sign({ foo: 'bar' }, 'test')
    expect(
        R.compose(
            monad_utils.chain(R.prop('foo')),
            monad_utils.chain(assert_not_expired_after_20s),
            jwt_utils.decode_token('test')
        )(token2)
    ).toBe('bar')
})

test('Assert that expiry check fails when token is expired', () => {
    const assert_not_expired_after_20s = jwt_utils.check_token_expiry(R.prop('expiry'), () => 20)

    const token = jwt.sign({ foo: 'bar', expiry: 10 }, 'test')
    expect(
        R.compose(
            monad_utils.get_value,
            monad_utils.chain(assert_not_expired_after_20s),
            jwt_utils.decode_token('test')
        )(token)
    ).toBeInstanceOf(jwt_utils.TokenExpiryError)
})

test('Assert that getting token from the header works on the happy path', () => {
    const token = jwt.sign({ foo: 'bar', expiry: 30, version: 1 }, 'test')
    const request = {
        'headers': {
            'authorization': `Bearer ${token}`
        }
    }

    expect(
        R.compose(
            monad_utils.get_value,
            jwt_utils.get_token_from_header
        )(request)
    ).toBe(token)

    const request2 = {
        'headers': {
            'authorization': `${token}`
        }
    }

    expect(
        R.compose(
            monad_utils.get_value,
            jwt_utils.get_token_from_header
        )(request2)
    ).toBe(token)
})

test('Assert that getting token from header reports failure', () =>{
    const request = {
        'headers': {}
    }

    expect(
        R.compose(
            monad_utils.get_value,
            jwt_utils.get_token_from_header
        )(request)
    ).toBeInstanceOf(jwt_utils.TokenUndefinedError)
})

test('Assert that getting token from the cookie works on the happy path', () => {
    const token = jwt.sign({ foo: 'bar', expiry: 30, version: 1 }, 'test')
    const request = {
        'headers': {
            'cookie': `foo=bar; jwt=${token}`
        }
    }

    expect(
        R.compose(
            monad_utils.get_value,
            jwt_utils.get_token_from_cookie('jwt')
        )(request)
    ).toBe(token)
})

test('Assert that getting token from the cookie reports failure', () =>{
    const token = jwt.sign({ foo: 'bar', expiry: 30, version: 1 }, 'test')
    const request = {
        'headers': {
        }
    }

    expect(
        R.compose(
            monad_utils.get_value,
            jwt_utils.get_token_from_cookie('jwt')
        )(request)
    ).toBeInstanceOf(jwt_utils.TokenUndefinedError)

    const request2 = {
        'headers': {
            'cookie': `foo=bar`
        }
    }

    expect(
        R.compose(
            monad_utils.get_value,
            jwt_utils.get_token_from_cookie('jwt')
        )(request)
    ).toBeInstanceOf(jwt_utils.TokenUndefinedError)

})

test('Assert that getting token from anywhere works on the happy path', () => {
    const token = jwt.sign({ foo: 'bar', expiry: 30, version: 1 }, 'test')
    const request = {
        'headers': {
            'cookie': `foo=bar; jwt=${token}`
        }
    }

    expect(
        R.compose(
            monad_utils.get_value,
            jwt_utils.get_token_anywhere('jwt')
        )(request)
    ).toBe(token)

    const request2 = {
        'headers': {
            'authorization': `Bearer ${token}`
        }
    }

    expect(
        R.compose(
            monad_utils.get_value,
            jwt_utils.get_token_anywhere('jwt')
        )(request2)
    ).toBe(token)
})

test('Assert that getting token from anywhere works on failure', () => {
    const request = {
        'headers': {
        }
    }

    expect(
        R.compose(
            monad_utils.get_value,
            jwt_utils.get_token_anywhere('jwt')
        )(request)
    ).toBeInstanceOf(jwt_utils.TokenUndefinedError)

    const request2 = {
        'headers': {
            'cookie': `foo=bar`
        }
    }

    expect(
        R.compose(
            monad_utils.get_value,
            jwt_utils.get_token_anywhere('jwt')
        )(request)
    ).toBeInstanceOf(jwt_utils.TokenUndefinedError)
})

test('Assert that token processing behaves as expected on full featured the happy path', () => {
    var token = jwt.sign({ foo: 'bar', expiry: 30, version: 1 }, 'test')
    var request = {
        'headers': {
            'authorization': `Bearer ${token}`
        }
    }

    const process = jwt_utils.process_request_token(
        jwt_utils.get_token_from_header,
        'test',
        jwt_utils.check_token_version(R.prop('version'), 1),
        jwt_utils.check_token_expiry(R.prop('expiry'), () => 20)
    )

    expect(
        R.compose(
            monad_utils.chain(R.prop('foo')),
            process
        )(request)
    ).toBe('bar')
})

test('Assert that token processing behaves as expected with version check bypass on the happy path', () => {
    var token = jwt.sign({ foo: 'bar', expiry: 30 }, 'test')
    var request = {
        'headers': {
            'authorization': `Bearer ${token}`
        }
    }

    const process = jwt_utils.process_request_token(
        jwt_utils.get_token_from_header,
        'test',
        generic_utils.either_right_identity,
        jwt_utils.check_token_expiry(R.prop('expiry'), () => 20)
    )

    expect(
        R.compose(
            monad_utils.chain(R.prop('foo')),
            process
        )(request)
    ).toBe('bar')
})
