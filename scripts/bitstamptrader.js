var bitstamp = new Bitstamp();
var refreshsecs = 15;



function bitcoinWithdrawl(amount) {
  var user_address;
  bitcoin.getUserInfo(function(info){
    user_address = info.address;
  });
  params = bitstamp.submitRequest(bitstamp.methods.btcwithdrawal, function(response){
    if ('data' in response) {
      refreshUserTransactions();
    } else {
      alert(response.error);
    }
  }, {'amount': amount, 'address': user_address});
}

function orderBuy(amount, price) {
  params = bitstamp.submitRequest(bitstamp.methods.orderbuy, completeTrade, {'amount': amount, 'price': price});
}

function orderSell(amount, price) {
  params = bitstamp.submitRequest(bitstamp.methods.ordersell, completeTrade, {'amount': amount, 'price': price});
}

function completeTrade(response) {
  if ('data' in response) {
    $('#trade_amount').val('');
    $('#trade_price').val('');
    refreshOpenOrders();
    refreshUserTransactions();
  } else {
    alert(response.error || 'Unknown error');
  }
}

function getBitcoinDepositAddress() {
  params = bitstamp.submitRequest(bitstamp.methods.btcdepositaddress, function(response){
    if ('data' in response) {
      bitcoin.sendMoney(response.data, $('#transferamount').val() * 1e8); // 1e8 converts satoshits to bitcoins
    } else {
      var errormsg = response.error || 'Unknown error';
      $('#btcdeposit').prop('disabled', 'disabled');
      $('#transfers_message').html('Deposit not enabled: ' + errormsg);
    }
  });
}

function refreshUserTransactions() {
  bitstamp.submitRequest(bitstamp.methods.usertransactions, function(response){
      // Clear transactions list
      $('#usertransactionlist option').each(function(index, option) {$(option).remove();});

      if ('data' in response) {
        // Build transactions
        typedesc = 'Other';
        $.each(response.data, function(index, value) {
          if (value.type == 0) {
            typedesc = 'Deposit';
          } else if (value.type == 1) {
            typedesc = 'Withdrawal';
          } else if (value.type == 2) {
            typedesc = 'Market trade';
          }
          msg = typedesc + ' at ' + value.datetime;
          $('#usertransactionlist').append('<option>' + msg + '</option>');
        });

        // Exception for empty transaction list
        if ($('#usertransactionlist option').size() < 1) {
          $('#usertransactionlist').append('<option value>No transactions</option>');
        }
      } else {
        errormsg = response.error || 'Unknown error';
        $('#usertransactionlist').append('<option value>Could not fetch transactions: ' + errormsg + '</option>');
      }
    },
    {} // Could be used for pagination in the future
  );
}

function doLogout() {
  // this should have the result of expiring all cookies
  storeLoginDetails(bitstamp, -1);
  bitstamp = null;
  location.reload(false);
}

function refreshOpenOrders() {
  params = bitstamp.submitRequest(bitstamp.methods.openorders, function(response){
    // Clear transactions list
    $('#user_openorders option').each(function(index, option) {$(option).remove();});

    if ('data' in response) {
      $('#btn_cancelorder').prop('disabled', false);
      // Build transactions
      typedesc = 'Other';
      $.each(response.data, function(index, value) {
        if (value.type == 0) {
          typedesc = 'Buy ';
        } else if (value.type == 1) {
          typedesc = 'Sell ';
        }
        msg = typedesc + value.amount.toString() + ' at ' + value.price.toString();
        $('#user_openorders').append('<option>' + msg + '</option>');
      });

      // Exception for empty transaction list
      if ($('#user_openorders option').size() < 1) {
        $('#user_openorders').append('<option value="">No open orders</option>');
        $('#btn_cancelorder').prop('disabled', true);
      }
    } else {
      errormsg = response.error || 'Unknown error';
      $('#user_openorders').append('<option value="">Could not fetch orders: ' + errormsg + '</option>');
      $('#btn_cancelorder').prop('disabled', true);
    }
  });
}

function cancelOrders() {
  $('#user_openorders option:selected').each(function(){
    if (int(this.value)) {
      console.log('Canceling order with id ' + this.value.toString());
      params = bitstamp.submitRequest(bitstamp.methods.cancelorder, function(response) {
        if ('data' in response) {
          // TODO reorder or just fetch new?
          //$("#user_openorders option[value='" +  + "']").remove();
          refreshOpenOrders();
        } else {
          alert(response.error || 'Unknown error');
        }
      }, {id: this.value});
    }
  });
}

function doLogin(clientid, apikey, apisecret) {
  bitstamp = new Bitstamp(clientid, apikey, apisecret);

  params = bitstamp.submitRequest(bitstamp.methods.balance, function(response) {
    if ('data' in response) {
      storeLoginDetails(bitstamp);
      
      $('#client_id').text(bitstamp.auth.client_id.toString());
      $('#user_fee').text(response.data.fee.toString());

      $('#balance_btc').text(response.data.btc_balance.toString());
      $('#available_btc').text(response.data.btc_available.toString());
      $('#reserved_btc').text(response.data.btc_reserved.toString());
      $('#balance_usd').text(response.data.usd_balance.toString());
      $('#available_usd').text(response.data.usd_available.toString());
      $('#reserved_usd').text(response.data.usd_reserved.toString());


      $('#panel_login').hide();
      $('#panel_trade').show();
      refreshOpenOrders();
      refreshUserTransactions();
    } else {
      alert(response.error || 'Unknown error');
      $('#panel_login').show();
      $('#panel_trade').hide();
    }
  });
}

function storeLoginDetails(bitstamp, years) {
  years = years || 1;

  var d = new Date();
  d.setFullYear(d.getFullYear() + years)
  document.cookie = 'clientid='+ bitstamp.auth.client_id + '; expires=' + d.toGMTString();;
  document.cookie = 'apikey='+ bitstamp.auth.api_key + '; expires=' + d.toGMTString();
  document.cookie = 'apisecret='+ bitstamp.auth.api_secret + '; expires=' + d.toGMTString();
}

function getCookieValue(keyname) {
    return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(keyname).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
}

function checkLogin() {
  clientid = getCookieValue('clientid');
  apikey = getCookieValue('apikey');
  apisecret = getCookieValue('apisecret');

  if (clientid && apikey && apisecret) {
    console.log('Found login details for ' + clientid);
    $('#loginmessage').text('Credentials found. Now logging in...');
    doLogin(clientid, apikey, apisecret);
  } else {
    console.log('Did not find login details in cookie');
  }
}

function getTicker(response) {
  params = bitstamp.submitRequest(bitstamp.methods.ticker, function(response){
    if ('data' in response) {
      $('#ticker_last').text(response.data.last.toString());
      $('#ticker_high').text(response.data.high.toString());
      $('#ticker_low').text(response.data.low.toString());
      $('#ticker_volume').text(response.data.volume.toString());
      $('#ticker_bid').text(response.data.bid.toString());
      $('#ticker_ask').text(response.data.ask.toString());
    } else {
      alert(response.error || 'Unknown error');
    }
  });
}