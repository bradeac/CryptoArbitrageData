import dotenv from 'dotenv';
import cron from 'node-cron';
import sleep from 'system-sleep';
import moment, { max } from 'moment';
import _ from 'lodash';
import PushBullet from 'pushbullet';

import { getAllPrices } from './getAllPrices';
import { getSymbols } from './getSymbols';
import { bitfinex } from 'ccxt';
import { getArbitrableSymbols } from './getArbitrableSymbols';
import { getPrices } from './getPrices';

dotenv.config()

const mongo = require('mongodb').MongoClient;
const url = process.env.DB_URL;

const pusher = new PushBullet(process.env.PUSHBULLET_URL);

//bitfinex -> exmo
//bitfinex -> gatecoin
//bitfinex -> yobit
//bitfinex -> btcc
//bitfinex -> poloniex

//yobit - 6489 symbols ?????

let bitfinexPrices = {}
let bitfinexSymbols = []
let symbols = {}
let prices = {}
let exchanges = ['bitfinex', 'poloniex', 'exmo', 'bittrex', 'kucoin', 'kraken', 'liqui', 'coinexchange', 'cobinhood', 'hitbtc', 'quoinex', 'cryptopia']
let arbitrableSymbols = {}
let finalPrices = []
let maxs = []
let mins = []
let identifiers = []
let avoidAnnoyingNotification = ''
let start = ''
let end = ''
 
const getSymbolsFromAllExchanges = async (array) => {
    for (const item of array) {
        await getSymbolsFromExchanges(item)
    }
}

const getPricesFromAllExchanges = async (array) => {
    for (const item of array) {
        let result = await getAllPrices(item)
        let array = []

        while (result.length < 1) 
            result = await getAllPrices(item)

        Object.entries(result).forEach(([key, val]) => {
            try {
                if (val.ask != 0 && val.bid != 0)
                array.push(
                    { 
                        symbol: key, 
                        ask: !val.ask.toString().includes('e') ? val.ask : val.ask.toFixed(10), 
                        bid: !val.bid.toString().includes('e') ? val.bid : val.bid.toFixed(10)
                    }
                )
            } catch (error) {
                // console.log(error)
                // console.log(key)
                // console.log(val)
            }
        })

        prices[item] = array
    }
}

const getSymbolsFromExchanges = async (exchange) => {
    let pairs = await getSymbols(exchange)
    symbols[exchange] = pairs

    while (pairs.length < 1) {
        let pairs = await getSymbols(exchange)
        symbols[exchange] = pairs
    }

}

const getCommonSymbols = async (pairs1, pairs2) => await getArbitrableSymbols(pairs1, pairs2)

const main = async () => {
    await getSymbolsFromAllExchanges(exchanges)

    let pairs = await getCommonSymbols(symbols['bitfinex'], symbols['poloniex'])
    arbitrableSymbols['bitfinex-poloniex'] = pairs

    pairs = await getCommonSymbols(symbols['bitfinex'], symbols['exmo'])
    arbitrableSymbols['bitfinex-exmo'] = pairs

    pairs = await getCommonSymbols(symbols['bitfinex'], symbols['kucoin'])
    arbitrableSymbols['bitfinex-kucoin'] = pairs

    pairs = await getCommonSymbols(symbols['bitfinex'], symbols['kraken'])
    arbitrableSymbols['bitfinex-kraken'] = pairs

    pairs = await getCommonSymbols(symbols['bitfinex'], symbols['liqui'])
    arbitrableSymbols['bitfinex-liqui'] = pairs

    pairs = await getCommonSymbols(symbols['bitfinex'], symbols['coinexchange'])
    arbitrableSymbols['bitfinex-coinexchange'] = pairs

    pairs = await getCommonSymbols(symbols['bitfinex'], symbols['cobinhood'])
    arbitrableSymbols['bitfinex-cobinhood'] = pairs

    pairs = await getCommonSymbols(symbols['bitfinex'], symbols['hitbtc'])
    arbitrableSymbols['bitfinex-hitbtc'] = pairs

    pairs = await getCommonSymbols(symbols['bitfinex'], symbols['quoinex'])
    arbitrableSymbols['bitfinex-quoinex'] = pairs

    pairs = await getCommonSymbols(symbols['bitfinex'], symbols['cryptopia'])
    arbitrableSymbols['bitfinex-cryptopia'] = pairs

    pairs = await getCommonSymbols(symbols['kucoin'], symbols['exmo'])
    arbitrableSymbols['kucoin-exmo'] = pairs
    
    pairs = await getCommonSymbols(symbols['kucoin'], symbols['kraken'])
    arbitrableSymbols['kucoin-kraken'] = pairs
    
    pairs = await getCommonSymbols(symbols['kraken'], symbols['exmo'])
    arbitrableSymbols['kraken-exmo'] = pairs

    pairs = await getCommonSymbols(symbols['cobinhood'], symbols['exmo'])
    arbitrableSymbols['cobinhood-exmo'] = pairs
    
    pairs = await getCommonSymbols(symbols['cobinhood'], symbols['kraken'])
    arbitrableSymbols['cobinhood-kraken'] = pairs
    
    pairs = await getCommonSymbols(symbols['cobinhood'], symbols['kucoin'])
    arbitrableSymbols['cobinhood-kucoin'] = pairs

    pairs = await getCommonSymbols(symbols['cobinhood'], symbols['quoinex'])
    arbitrableSymbols['cobinhood-quoinex'] = pairs

    pairs = await getCommonSymbols(symbols['kucoin'], symbols['quoinex'])
    arbitrableSymbols['kucoin-quoinex'] = pairs
    
    pairs = await getCommonSymbols(symbols['quoinex'], symbols['kraken'])
    arbitrableSymbols['quoinex-kraken'] = pairs
    
    pairs = await getCommonSymbols(symbols['quoinex'], symbols['exmo'])
    arbitrableSymbols['quoinex-exmo'] = pairs

    pairs = await getCommonSymbols(symbols['hitbtc'], symbols['quoinex'])
    arbitrableSymbols['hitbtc-quoinex'] = pairs
    
    pairs = await getCommonSymbols(symbols['hitbtc'], symbols['kraken'])
    arbitrableSymbols['hitbtc-kraken'] = pairs
    
    pairs = await getCommonSymbols(symbols['hitbtc'], symbols['exmo'])
    arbitrableSymbols['hitbtc-exmo'] = pairs

    pairs = await getCommonSymbols(symbols['hitbtc'], symbols['kucoin'])
    arbitrableSymbols['hitbtc-kucoin'] = pairs

    pairs = await getCommonSymbols(symbols['coinexchange'], symbols['quoinex'])
    arbitrableSymbols['coinexchange-quoinex'] = pairs
    
    pairs = await getCommonSymbols(symbols['coinexchange'], symbols['kraken'])
    arbitrableSymbols['coinexchange-kraken'] = pairs
    
    pairs = await getCommonSymbols(symbols['coinexchange'], symbols['exmo'])
    arbitrableSymbols['coinexchange-exmo'] = pairs

    pairs = await getCommonSymbols(symbols['coinexchange'], symbols['kucoin'])
    arbitrableSymbols['coinexchange-kucoin'] = pairs


    // pairs = await getCommonSymbols(symbols['kucoin'], symbols['quoinex'])
    // arbitrableSymbols['kucoin-quoinex'] = pairs
    
    // pairs = await getCommonSymbols(symbols['quoinex'], symbols['kraken'])
    // arbitrableSymbols['quoinex-kraken'] = pairs
    
    // pairs = await getCommonSymbols(symbols['quoinex'], symbols['exmo'])
    // arbitrableSymbols['quoinex-exmo'] = pairs

    // pairs = await getCommonSymbols(symbols['cobinhood'], symbols['kucoin'])
    // arbitrableSymbols['cobinhood-kucoin'] = pairs
    

    //console.log(arbitrableSymbols)

    cron.schedule('*/1 * * * *', async () => { 
        await getPricesFromAllExchanges(exchanges)

        console.log('Got new prices ...')

        Object.entries(arbitrableSymbols).forEach(([arbitrableExchanges, arbitrableValue]) => {
            //console.log(arbitrableExchanges)
            //console.log(prices[arbitrableExchanges.split('-')[0]])
            for (const price1 of prices[arbitrableExchanges.split('-')[0]]) {
                for (const price2 of prices[arbitrableExchanges.split('-')[1]]) {
                    if (arbitrableValue.includes(price1.symbol) 
                        && arbitrableValue.includes(price2.symbol) 
                        && price1.symbol === price2.symbol) {
                        // console.log('price1', price1)
                        // console.log('price2', price2)

                        let identifier = `${price1.symbol}${arbitrableExchanges.split('-')[0]}${arbitrableExchanges.split('-')[1]}`

                        let obj = {
                            identifier,
                            time: moment().format('HH:mm:ss MM/DD/YYYY'),
                            symbol: price1.symbol,
                            exchange1: arbitrableExchanges.split('-')[0],
                            exchange2: arbitrableExchanges.split('-')[1],
                            exchange1ask: price1.ask,
                            exchange1bid: price1.bid,
                            exchange2ask: price2.ask,
                            exchange2bid: price2.bid,
                            difference1: ((price2.bid - price1.ask) * 100) / price2.bid,
                            difference2: ((price1.bid - price2.ask) * 100) / price1.bid
                        }

                        if (avoidAnnoyingNotification !== `${price1.symbol} on ${obj.exchange1} and ${obj.exchange2}` && 
                                (obj.difference1 >= 10 || obj.difference2 >= 10)) {

                            avoidAnnoyingNotification = `${price1.symbol} on ${obj.exchange1} and ${obj.exchange2}`
                            
                            //DISABLING NOTIFICATION FOR NOW

                            // pusher.note(
                            //     process.env.PUSHBULLET_DEVICE_ID, 
                            //     `${price1.symbol} on ${obj.exchange1} and ${obj.exchange2}`, 
                            //     `${obj.difference1} ||| ${obj.difference2}`, 
                            //     (error, response) => {
                            //         console.log('/////////////////////////////////////////////////////////')
                            //         console.log(`Sent notification on ${moment().format('HH:mm:ss MM/DD/YYYY')}`)
                            //         console.log(response.title)
                            //         console.log(response.body)
                            //         console.log('////////////////////////////////////////////////////////')
                            //     });
                        }

                        finalPrices.push(obj)
                    }
                }
            }
        })

        finalPrices = finalPrices.filter(item => item.difference1 > 1 || item.difference2 > 1)
    })

    cron.schedule('0 0 * * * *', async () => {   
    
        identifiers = finalPrices.map(item => item.identifier)
        identifiers = _.uniq(identifiers)
    
        //console.log('lenf', finalPrices.length)
        //console.log('leni', identifiers)
    
        //console.log('f', finalPrices)

        if (identifiers.length > 0) {
            console.log('How many pairs are we going to put in the DB: ', identifiers.length)

            for (let identifier of identifiers) {
                let allIdentifierPrices = finalPrices.filter(item => item.identifier === identifier)
                let sortedDiff = []

                if (allIdentifierPrices.length > 0) {
                    //console.log('lena', allIdentifierPrices.length)
                    console.log('Number of prices (must coincide with ^ ?', allIdentifierPrices.length)
            
                    if (allIdentifierPrices[allIdentifierPrices.length - 1].difference1 < 0) 
                        sortedDiff = _.sortBy(allIdentifierPrices, 'difference2', 'asc')
            
                    if (allIdentifierPrices[allIdentifierPrices.length - 1].difference2 < 0) 
                        sortedDiff = _.sortBy(allIdentifierPrices, 'difference1', 'asc')

                    //console.log('lens', sortedDiff.length)

                    console.log('Pushing this to DB (min): ', sortedDiff[0])
                    console.log('Pushing this to DB (max): ', sortedDiff[sortedDiff.length - 1])

                    end = moment().format('HH:mm:ss MM/DD/YYYY')
            
                    // console.log('d mic', sortedDiff[0])
                    // console.log('d mare', sortedDiff[sortedDiff.length - 1])

                    mongo.connect(url, (err, client) => {
                        const db = client.db('arbitrage');
                        const collection = db.collection('_1h');

                        console.log('connected')
            
                        collection.insert(
                            {
                                '_id': `${sortedDiff[0].identifier}-${start}-${end}`,
                                'min': sortedDiff[0],
                                'max': sortedDiff[sortedDiff.length - 1]
                            }
                        )

                        console.log('Inserted some data at: ', moment().format('HH:mm:ss MM/DD/YYYY'))

                        client.close();

                        finalPrices = []
                        start = moment().format('HH:mm:ss MM/DD/YYYY')
                    })
                }
            }
        }
        console.log('__________________________________________________________')
    })
}

main()