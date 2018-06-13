//show prices for all pair on one exchange

const ccxt = require ('ccxt')

export let getAllPrices = async (id) => {

    // check if the exchange is supported by ccxt
    let exchangeFound = ccxt.exchanges.indexOf (id) > -1

    if (exchangeFound) {

        // instantiate the exchange by id
        let exchange = new ccxt[id] ({ enableRateLimit: true })

        // load all markets from the exchange
        let markets = await exchange.loadMarkets ()

        const tickers = await exchange.fetchTickers ()

        return tickers
    }
}