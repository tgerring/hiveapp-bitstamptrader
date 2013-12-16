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
* jssha256.js library is returning invalid data occasionally and needs to be swapped for Google JS Crypto
* Currency separator characters need to be handled properly
* Application needs thorough testing
* Account details toggle is very slow