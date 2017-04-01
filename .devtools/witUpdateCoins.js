var fs = require('fs')

var coinResponse = JSON.parse(fs.readFileSync('Coins.json'))

if (coinResponse.success === true && coinResponse.result) {
  var coinList = coinResponse.result
  
  var witCoins = []
  
  coinList.forEach(function (coin) {
    var witCoin = {
      "value": coin.Currency,
      "expressions": [
        coin.Currency,
        coin.CurrencyLong
      ]
    }
    witCoins.push(witCoin)
  })

  var witCoinsEntity = {
    "doc": "These are the supported coins on Bittrex",
    "values": witCoins
  }

  fs.writeFileSync('WitCoinsEntity.json', JSON.stringify(witCoinsEntity))
}