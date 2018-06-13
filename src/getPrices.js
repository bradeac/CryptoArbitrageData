//show realtime prices for a pair on multiple exchanges

const ccxt = require ('ccxt');
const cloudscraper = require ('cloudscraper')

export let getPrices = async (exchange1, exchange2, symbol) => {

    const exchanges = [
        exchange1,
        exchange2
    ];
    symbol = symbol.toUpperCase()

    const tickers = {}
    let difference = 0
    let price1 = 0
    let price2 = 0

    const result = await Promise.all (exchanges.map (async id => {

        const exchange = new ccxt[id] ({ 'enableRateLimit': true })
        let ticker = {}

        try {
            ticker = await exchange.fetchTicker (symbol)
        }
        catch(e) {
            if (symbol.includes('BCC')) {
                try {
                    ticker = await exchange.fetchTicker (symbol.replace('BCC', 'BCH'))
                }
                catch(e) {
                    if (symbol.includes('USD')) {
                        let tempSymbol = symbol.replace('BCC', 'BCH')
                        tempSymbol = tempSymbol.replace('USD', 'USDT')

                        ticker = await exchange.fetchTicker (tempSymbol)
                    }
                }
            }
            else if (symbol.includes('USD')) {
                ticker = await exchange.fetchTicker (symbol.replace('USD', 'USDT'))
            }
        }

        return exchange.extend ({ 'exchange': id }, ticker.info)

    }))

    return [
        { 
            exchange: result[0].exchange, 
            ask: result[0].ask 
        }, 
        { 
            exchange: result[1].exchange, 
            bid: result[1].bid 
        }
    ]
}

const timer = (ms) => {
    return new Promise(r => setTimeout(r, ms));
}

const scrapeCloudflareHttpHeaderCookie = (url) =>

	(new Promise ((resolve, reject) =>

		(cloudscraper.get (url, function (error, response, body) {

			if (error) {

				reject (error)

			} else {

				resolve (response.request.headers)
			}
		}))
    ))