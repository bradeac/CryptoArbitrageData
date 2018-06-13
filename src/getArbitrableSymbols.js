const ccxt      = require ('ccxt')
const log       = require ('ololog').configure ({ locate: false })

require ('ansicolor').nice;

let proxies = [
    '', // no proxy by default
    'https://crossorigin.me/',
    'https://cors-anywhere.herokuapp.com/',
]

export let getArbitrableSymbols = async (exchange1, exchange2) => {

    exchange1 = exchange1.map(symbol => symbol.replace('USDT', 'USD'))
    exchange1 = exchange1.map(symbol => symbol.replace('BCC', 'BCH'))

    exchange2 = exchange2.map(symbol => symbol.replace('USDT', 'USD'))
    exchange2 = exchange2.map(symbol => symbol.replace('BCC', 'BCH'))

    const intersection = exchange1.filter(element => exchange2.includes(element))

    return intersection
}

