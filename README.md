# hiveapp-bitstamptrader

![Bitstamp orders](http://i.imgur.com/9OdrETf.png)

## Usage
```
cd ~ && git clone https://github.com/tgerring/hiveapp-bitstamptrader.git
cd ~/Library/Application\ Support/Hive/Applications/
ln -s ~/hiveapp-bitstamptrader/ bitstamptrader
```

This should get the latest repository and symlink it into Hive's app directory. From here, you'll need to access `Tools > Debugging Tools.. > Rebuild application list` from Hive's menubar. This will hopefully result in a new BitstampTrader icon in the apps dashboard.

## Issues
* Application needs thorough testing
* Account details collapse is not animating properly
* Account details caret does not properly reflect state
* Better i18n support needed

### Test plan
* Deposit 0.01BTC to account
** Observe the pending deposits reflects the transaction
** Observe that balance correctly reflects new values after confirmed
** Observe the transaction appears in the transaction history
* Set a few orders that are unlikely to execute
** Observe the amount is correctly reflected as pending
** Observe the orders are added to the open orders list
* Cancel the pending orders
** Observe that multiple orders can be canceled
** Observe that the orders are removed from the open orders list
* Sell 0.01BTC for USD
** Observe the order is removed from open orders when the order fills
** Observe the amount of USD is correctly reflected
* Buy as much BTC as USD held
** Observe the order is removed from open orders when the order fills
** Observe the amount of BTC is correctly reflected
* Withdrawal BTC to Hive Wallet
** Observe the withdrawals reflecting the transfer
** Observe the balance is correctly updated
** Observe the transaction appears in the transaction history

