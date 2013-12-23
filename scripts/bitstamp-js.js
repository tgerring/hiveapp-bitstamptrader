/*

Depends:
* jssha256.js
* jquery.js

Usage:
var bitstamp = new Bitstamp('clientid', 'apikey', 'apisecret');
bitstamp.submitRequest(bitstamp.methods.ticker, function(data){console.log(data);} );
bitstamp.submitRequest(bitstamp.methods.cancelorder, function(data){console.log(data);}, {id: 1} );

*/
Bitstamp = function(client_id, api_key, api_secret) {
  this.auth = {client_id: client_id, api_key: api_key, api_secret: api_secret};
  this.host = 'https://www.bitstamp.net';
  this.methods = {
    ticker: {
        endpoint: '/api/ticker/',
        method: 'GET'
    },
    orderbook: {
        endpoint: '/api/order_book/',
        method: 'GET',
        params: ['group']
    },
    transactions: {
        endpoint: '/api/transactions/',
        method: 'GET',
        params: ['time']
    },
    eurusd: {
        endpoint: '/api/eur_usd/',
        method: 'GET'
    },
    balance: {
        endpoint: '/api/balance/',
        method: 'POST',
        params: ['key', 'signature', 'nonce']
    },
    usertransactions: {
        endpoint: '/api/user_transactions/',
        method: 'POST',
        params: ['key', 'signature', 'nonce', 'offset', 'limit', 'sort']
    },
    openorders: {
        endpoint: '/api/open_orders/',
        method: 'POST',
        params: ['key', 'signature', 'nonce']
    },
    cancelorder: {
        endpoint: '/api/cancel_order/',
        method: 'POST',
        params: ['key', 'signature', 'nonce', 'id']
    },
    orderbuy: {
        endpoint: '/api/buy/',
        method: 'POST',
        params: ['key', 'signature', 'nonce', 'price', 'amount']
    },
    ordersell: {
        endpoint: '/api/sell/',
        method: 'POST',
        params: ['key', 'signature', 'nonce', 'price', 'amount']
    },
    withdrawalrequests: {
        endpoint: '/api/withdrawal_requests/',
        method: 'POST',
        params: ['key', 'signature', 'nonce']
    },
    btcwithdrawal: {
        endpoint: '/api/bitcoin_withdrawal/',
        method: 'POST',
        params: ['key', 'signature', 'nonce', 'amount', 'address']
    },
    btcdepositaddress: {
        endpoint: '/api/bitcoin_deposit_address/',
        method: 'POST',
        params: ['key', 'signature', 'nonce']
    },
    unconfirmedbtc: {
        endpoint: '/api/unconfirmed_btc/',
        method: 'POST',
        params: ['key', 'signature', 'nonce']
    },
    ripplewithdrawal: {
        endpoint: '/api/ripple_withdrawal/',
        method: 'POST',
        params: ['key', 'signature', 'nonce', 'amount', 'address', 'currency']
    },
    rippledepositaddress: {
        endpoint: '/api/ripple_address/',
        method: 'POST',
        params: ['key', 'signature', 'nonce']
    }
  }
}

Bitstamp.prototype.submitRequest = function(bitstampmethod, callback, params) {
  if (!params) params = {};

  console.log('Submitting request to ' + (bitstampmethod.endpoint || '??????'));

  if ($.inArray('signature', bitstampmethod.params) > -1 && !('signature' in params) ) {
    console.log('Signature required but not in supplied params');

    unix_timestamp = Math.round(+new Date());
    message = unix_timestamp.toString() + this.auth.client_id + this.auth.api_key;

    var hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, this.auth.api_secret);
    hmac.update(message);
    var hash = hmac.finalize();
    signature = hash.toString().toUpperCase();

    params.key = this.auth.api_key;
    params.signature = signature;
    params.nonce = unix_timestamp;
  }

  for (var param in params) {
    if (typeof params[param] === 'undefined') {
      delete params[param];
    } else {
      params[param] = params[param].toString();
    }
  }

  console.log(JSON.stringify(params));

  var that = this;
  // Becasue Hive need to make requests from the application and not within the browser, we swap that function call here

  // $.ajax({
  //   type: bitstampmethod.method,
  //   url: this.host + bitstampmethod.endpoint,
  //   data: params,
  //   success: function(data, textStatus, jqXHR){that.parseResponse(data, callback);},
  //   error: function(jqXHR, textStatus, errorThrown){that.handleError(textStatus, errorThrown, callback);},
  //   timeout: 30000,
  //   dataType: 'json'
  // });

  // Hive-specific call
  bitcoin.makeRequest(this.host + bitstampmethod.endpoint, {
    type: bitstampmethod.method,
    data: params,
    success: function(data, textStatus, jqXHR){that.parseResponse(data, callback);},
    error: function(jqXHR, textStatus, errorThrown){that.handleError(textStatus, errorThrown, callback);},
    timeout: 30000,
    dataType: 'json'
  });

  return params;
}

Bitstamp.prototype.handleError = function(textStatus, errorThrown, callback) {
    var data = {};
    console.log('Error with request:');
    data.error = errorThrown;
    console.log(errorThrown);
    this.parseResponse(data, callback);
}

Bitstamp.prototype.parseResponse = function(response, callback) {
  console.log('Response returned:');
  console.log(response);

  var returnval = {};

  if (typeof response === 'object' && 'error' in response) {
    console.log('Error condition');
    var errorstring = '';
    if (typeof response.error === 'string') {
      errorstring = response.error;
    } else {
      for (var key in response.error) {
        errorstring += response.error[key] + "\n";
      }
    }
    returnval.error = errorstring;
  } else {
    returnval.data = response;
  }

  console.log('Response passed to callback:');
  console.log(returnval);
  callback(returnval);
}
