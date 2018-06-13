# CryptoArbitrageData
Gets the prices of all arbitrable symbols from the exchanges of your choice, calculates the differences between prices and pushes the data to a Mongo DB instance

The tool runs continuously and reads the prices for each arbitrable symbol each minute. Then, once an hour, it pushes the min and max price differences between exchanges to the DB
