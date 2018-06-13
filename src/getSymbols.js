const ccxt = require ('ccxt')

export let getSymbols = async (id) => {

    // instantiate the exchange by id
    let exchange = new ccxt[id] ({
        // 'proxy': 'https://cors-anywhere.herokuapp.com/',
        // 'proxy': 'https://crossorigin.me/',
    })

    // load all markets from the exchange
    let markets = await exchange.loadMarkets ()

    return Object.keys(markets)
}