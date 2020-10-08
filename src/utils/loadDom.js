import cheerio from 'cheerio'
import R from 'ramda'
import S from 'sanctuary'

export const loadDom = cheerio.load.bind(cheerio)

export const selectAll = R.curry((sel, dom) => {
    const res = dom(sel)
    return R.map(cheerio, res.toArray())
})

export const selectFirst = R.curry((sel, dom) =>
    R.compose(S.toMaybe, R.head, selectAll(sel))(dom)
)

export const html = (dom) => dom.html()

export const text = (dom) => R.trim(dom.text())

export const innerText = (dom) => {
    return R.trim(dom.contents().filter(filterText).text())

    function filterText() {
        return this.type == 'text'
    }
}

export const attr = R.curry((attrName, dom) =>
    R.compose(R.map(R.trim), S.toMaybe, dom.attr.bind(dom))(attrName)
)

export const required = R.curry((err, selector) =>
    R.compose(S.maybeToEither(err), R.map(innerText), selectFirst(selector))
)

export const optional = R.curry((defaultValue, selector) =>
    R.compose(S.fromMaybe(defaultValue), R.map(text), selectFirst(selector))
)
