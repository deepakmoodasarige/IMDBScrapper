import Future from 'fluture'
import request from 'request'
import R from 'ramda'
import S from 'sanctuary'

export const peek = R.curry((prefix, a) => {
    console.log(prefix, ':', a)
    return a
})

export const getHtml = (url) =>
    Future((rej, res) => {
        const opts = { method: 'GET', uri: url }
        request(opts, (error, response, body) => {
            if (error) {
                rej(error)
            } else {
                res(body)
            }
        })
    })

export const eitherToFuture = (either) => {
    if (S.isLeft(either)) {
        return Future.reject(either.value)
    } else {
        return Future.of(either.value)
    }
}
export const maybeToFuture = R.curry((err, maybe) =>
    R.compose(eitherToFuture, S.maybeToEither(err))(maybe)
)
export const sequenceObject = R.curry((appl, obj) => {
    const keys = R.keys(obj)
    const wrappedValues = R.values(obj)
    const unwrappedValues = R.sequence(appl, wrappedValues)
    return R.map(R.zipObj(keys))(unwrappedValues)
})

export const error = (msg) => {
    msg
}
