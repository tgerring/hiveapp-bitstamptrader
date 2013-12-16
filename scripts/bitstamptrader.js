var bitstamp = new Bitstamp();
var refreshsecs = 15;
var systemInfo = {};


function format_number( number, format ){  
  //systemInfo.decimalSeparator = ',';

  value = numeral(number);
  result = value.format(format)

  // Zero is zero. Might be useful to detect currency/percentage and include them still
  //numeral.zeroFormat('0');

  /*if (systemInfo.decimalSeparator === ',') {
    result = result.replace('/[,]/g', ' ');
    result = result.replace('/[.]/g', ',');
  }*/

  return result;
}

function listUnconfirmedBitcoinTransactions() {
  params = bitstamp.submitRequest(bitstamp.methods.unconfirmedbtc, function(response){
    $('#pending_transfers option').each(function(index, option) {
      if ($(option).hasClass('pending_deposit')) {
        $(option).remove();
      }
    });

    if ('data' in response) {
      if (response.data.length > 0) {
        $.each(response.data, function(index, value) {
          msg = value.amount + ' BTC has ' + value.confirmations + ' confirmations';
          $('#pending_transfers').append('<option class="pending_deposit">' + msg + '</option>');
        });
      } else {
          $('#pending_transfers').append('<option class="pending_deposit">No pending deposits</option>');
        }
    } else {
      errormsg = response.error || 'Unknown error';
      console.log(errormsg);
      $('#pending_transfers').append('<option class="pending_deposit">Could not load deposits: ' + errormsg + '</option>');
    }
  });
}


function listPendingWithdrawalRequests() {
  params = bitstamp.submitRequest(bitstamp.methods.withdrawalrequests, function(response){
    $('#pending_transfers option').each(function(index, option) {
      if ($(option).hasClass('pending_withdrawal')) {
        $(option).remove();
      }
    });
    
    if ('data' in response) {
      if (response.data.length > 0) {
        $.each(response.data, function(index, value) {
          typedesc = 'Unknown';
          if (value.type == 0) {
            typedesc = 'SEPA';
          } else if (value.type == 1) {
            typedesc = 'bitcoin';
          } else if (value.type == 2) {
            typedesc = 'WIRE transfer';
          } else if (value.type == 3) {
            typedesc = 'bitstamp code';
          } else if (value.type == 4) {
            typedesc = 'bitstamp code';
          } else if (value.type == 5) {
            typedesc = 'Mt.Gox code';
          }

          statusdesc = 'unknown';
          if (value.type == 0) {
            statusdesc = 'open';
          } else if (value.type == 1) {
            statusdesc = 'in process';
          } else if (value.type == 2) {
            statusdesc = 'finished';
          } else if (value.type == 3) {
            statusdesc = 'canceled';
          } else if (value.type == 4) {
            statusdesc = 'failed';
          }

          msg = value.amount.toString() + ' via ' + typedesc + ' at ' + value.datetime + ' is ' + statusdesc;
          $('#pending_transfers').append('<option class="pending_withdrawal">' + msg + '</option>');
        });
        } else {
          $('#pending_transfers').append('<option class="pending_withdrawal">No pending withdrawals</option>');
        }
    } else {
      errormsg = response.error || 'Unknown error';
      console.log(errormsg);
      $('#pending_transfers').append('<option class="pending_withdrawal">Could not load withdrawals: ' + errormsg + '</option>');
    }
  });
}

function bitcoinWithdrawl(amount) {
  var user_address;
  bitcoin.getUserInfo(function(info){
    user_address = info.address;
  });
  params = bitstamp.submitRequest(bitstamp.methods.btcwithdrawal, function(response){
    if ('data' in response) {
      refreshUserTransactions();
      listPendingWithdrawalRequests();
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
      bitcoin.sendMoney(response.data, $('#transferamount').val() * 1e8, function(success, transactionId){
        if (success === true) {
          listUnconfirmedBitcoinTransactions(); // this is unlikely to show anything
        }
      });
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
        $.each(response.data, function(index, value) {
          typedesc = 'Other';
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
          $('#usertransactionlist').append('<option>No transactions</option>');
        }
      } else {
        errormsg = response.error || 'Unknown error';
        $('#usertransactionlist').append('<option>Could not load transactions: ' + errormsg + '</option>');
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
      $.each(response.data, function(index, value) {
        typedesc = 'Other';
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
      $('#user_openorders').append('<option value="">Could not load orders: ' + errormsg + '</option>');
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
      
      $('.data_client_id').text(bitstamp.auth.client_id.toString());
      $('.data_user_fee').text(format_number(response.data.fee / 100, '0.00%'));
      //$('#user_fee').text(response.data.fee.toString());

      $('.data_balance_btc').text(format_number(response.data.btc_balance, '0,0.0000'));
      $('.data_available_btc').text(format_number(response.data.btc_available, '0,0.0000'));
      $('.data_reserved_btc').text(format_number(response.data.btc_reserved, '0,0.0000'));
      $('.data_balance_usd').text(format_number(response.data.usd_balance, '0,0.00'));
      $('.data_available_usd').text(format_number(response.data.usd_available, '0,0.00'));
      $('.data_reserved_usd').text(format_number(response.data.usd_reserved, '0,0.00'));


      $('#panel_login').hide();
      $('#panel_trade').show();
      window.setTimeout(refreshOpenOrders, 600);
      window.setTimeout(refreshUserTransactions, 1000);
      window.setTimeout(listPendingWithdrawalRequests, 200);
      window.setTimeout(listUnconfirmedBitcoinTransactions, 400);
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
    $('#login_form').hide();
    $('#loginmessage').show();
    doLogin(clientid, apikey, apisecret);
  } else {
    console.log('Did not find login details in cookie');
  }
}

function getTicker(response) {
  params = bitstamp.submitRequest(bitstamp.methods.ticker, function(response){
    if ('data' in response) {
      $('.data_ticker_last').text(format_number(response.data.last, '$0,0.00'));
      $('.data_ticker_high').text(format_number(response.data.high, '$0,0.00'));
      $('.data_ticker_low').text(format_number(response.data.low, '$0,0.00'));
      $('.data_ticker_volume').text(format_number(response.data.volume, '0,0.000000'));
      $('.data_ticker_bid').text(format_number(response.data.bid, '$0,0.00'));
      $('.data_ticker_ask').text(format_number(response.data.ask, '$0,0.00'));
    } else {
      alert(response.error || 'Unknown error');
    }
  });
}