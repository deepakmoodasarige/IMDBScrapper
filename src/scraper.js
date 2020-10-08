import R from 'ramda'
import S from 'sanctuary'
import Future from 'fluture'
import * as U from './utils/utils'
import * as C from './utils/loadDom'

const scrapeUrl = R.curry(
    (strategy, url) =>
        U.getHtml(url)
            .map(C.loadDom)
            .map(strategy)
            .chain(U.eitherToFuture)
            .mapRej((err) => `Error scraping url: ${url}. Some details: ${err}`) // Future Err a
)

const decodeMovie = (dom) => {
    const defaultImageUrl = 'default image here'

    const obj = {
        title: C.required(
            'No title present',
            '.title_block .title_wrapper h1'
        )(dom),
        summary: C.required(`No Summary present`, '.summary_text')(dom),
        year: S.Right(C.optional('', '.title_block #titleYear a')(dom)),
        director: S.Right(
            C.optional('', '.plot_summary span[itemprop=director]')(dom)
        ),
        imageUrl: R.compose(
            S.Right,
            S.fromMaybe(defaultImageUrl),
            R.chain(C.attr('src')),
            C.selectFirst('.minPosterWithPlotSummaryHeight .poster a img')
        )(dom),
    }
    return U.sequenceObject(S.of(S.Either), obj)
}

const decodeActorMovieUrls = (dom) => {
    const actorMoviesSelector =
        '#filmography #filmo-head-actor + .filmo-category-section .filmo-row b a'

    const arr = R.compose(
        R.sequence(S.of(S.Either)),
        R.map(S.maybeToEither(U.error('Invalid Url'))),
        R.map(R.map((x) => 'http://www.imdb.com' + x)),
        R.map(C.attr('href')),
        C.selectAll(actorMoviesSelector)
    )(dom)

    return arr
}

const logSuccesses = R.curry((start, data) => {
    const elapsedSec = (new Date() - start) / 1000.0
    console.log(data)
    console.log('Took ', elapsedSec, 's')
})

scrapeUrl(decodeActorMovieUrls, 'http://www.imdb.com/name/nm0000241')
    .map(R.take(5))
    .map(R.map(scrapeUrl(decodeMovie)))
    .chain(Future.parallel(10))
    .fork(console.error, logSuccesses(new Date()))
