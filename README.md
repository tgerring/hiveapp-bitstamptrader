# hiveapp-bitstamptrader

A Hive Wallet application for interacting with Bitstamp API. **WARNING! This application has not yet been thoroughly tested.**
![Bitstamp orders](http://i.imgur.com/JSaKdzJ.png)

## Features
* API access to Bitstamp
* Updating ticker prices, even without logging in
* Orders
 * Buy
 * Sell
 * List/cancel open orders
* Transfers
 * Deposit bitcoin directly from Hive
 * Withdrawal bitcoin directly to Hive
 * List pending transfers
* Account information
 * Transaction history
 * Account balance & fee

## Usage
```
cd ~ && git clone https://github.com/tgerring/hiveapp-bitstamptrader.git
cd ~/Library/Application\ Support/Hive/Applications/
ln -s ~/hiveapp-bitstamptrader/ bitstamptrader
```

This should get the latest repository and symlink it into Hive's app directory. From here, you'll need to access `Tools > Debugging Tools... > Rebuild application list` from Hive's menubar. This will hopefully result in a new Bitstamp icon in the apps dashboard.

If you would like to tweak the styling and submit a pull request (please do!), the main styles come form bootstrap-theme.min.css and styles.css.

## Issues
* Application needs thorough testing
* Account details collapse is not animating properly
* Account details caret does not properly reflect state
* Better i18n support needed (https://github.com/eligrey/l10n.js/ ?)
