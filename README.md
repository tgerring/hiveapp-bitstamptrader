# hiveapp-bitstamptrader

A Hive Wallet application for interacting with Bitstamp API
![Bitstamp orders](http://i.imgur.com/eZgtqJ5.png)

## Usage
```
cd ~ && git clone https://github.com/tgerring/hiveapp-bitstamptrader.git
cd ~/Library/Application\ Support/Hive/Applications/
ln -s ~/hiveapp-bitstamptrader/ bitstamptrader
```

This should get the latest repository and symlink it into Hive's app directory. From here, you'll need to access `Tools > Debugging Tools.. > Rebuild application list` from Hive's menubar. This will hopefully result in a new Bitstamp icon in the apps dashboard.

## Issues
* Application needs thorough testing
* Account details collapse is not animating properly
* Account details caret does not properly reflect state
* Better i18n support needed (https://github.com/eligrey/l10n.js/ ?)
