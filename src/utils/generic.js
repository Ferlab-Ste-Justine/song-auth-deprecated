const R = require('ramda')
const Either = require('data.either')

/*
  Make a function that throws exceptions return an Either monad instead.
  Signature:
  ((...args) => result) => ( (...args) => Either(result | errType1 | errType2 | ...) )
*/
const eitherify = (throwingFN) => {
    return (...args) => {
        try
        {
            return Either.Right(throwingFN(...args))
        } catch (e) {
            return Either.Left(e)
        }
    }
    
}

/*
    If the value is null/undefined, return an Either.Left monad wrapping the result of the errprFn
    function. Otherwise, return an Either.Right monad wrapping the result of calling processingFn on
    the value.
    This is a higher order function. It takes the processing functions as arguments and return 
    the function that will do the processing.
    Signature:
    (fn1, fn2) => ( (val) => Either(fn2(val) | fn1()) )
*/
const process_if_defined = (errorFn, processingFn) => {
    return R.ifElse(
        R.isNil,
        R.compose(Either.Left, errorFn),
        R.compose(Either.Right, processingFn)
    )
}

/*
    Function that parses json and returns an Either monad instead of throwing an exception.
    Signature:
    (encodedJSON) => Either(dict | Err)
*/
const parse_json = eitherify(JSON.parse)

/*
    Function that wraps a value in a Right Either monad.
    Signature:
    (val) => Either(val)
*/
const either_right_identity = R.compose(Either.Right, R.identity)

module.exports = {
    eitherify,
    process_if_defined,
    parse_json,
    either_right_identity
}