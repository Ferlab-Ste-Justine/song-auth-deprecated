const R = require('ramda')

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