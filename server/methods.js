import { Meteor } from 'meteor/meteor';
import { Wallets } from '/imports/api/wallets/wallets.js';
import { Transactions } from '/imports/api/transactions/transactions.js';
import bitcore from 'bitcore-lib';

Meteor.methods({
  'wallets.insert'(publicKey, privateKey, type){
    return Wallets.insert({
        publicKey,
        privateKey,
        type,
        owner: Meteor.userId(),
        username: Meteor.user().username,
        createdAt: new Date(),
    });
  },
  'transactions.insert'(walletId, publicKey, privateKey, type){

    var Insight = require("bitcore-explorers").Insight;
    var insight = new Insight("testnet");

    insight.getUnspentUtxos(publicKey, Meteor.bindEnvironment(function(error, utxos){
      if (error) {
        console.log(error);
      } else {

        var transaction = bitcore.Transaction()
          transaction.from(utxos);
          transaction.to('mgm4QFtuHpoxMza2E4v76r5MSnfYSRD2vd', 100000);
          transaction.change(publicKey);
          transaction.fee(667);
          transaction.sign(privateKey);

          transaction = transaction.serialize();

          insight.broadcast(transaction, Meteor.bindEnvironment(function(err, returnedTxId) {
            if (err) {
              throw new Meteor.Error(error)
            } else {
              return Transactions.insert({
                walletId,
                returnedTxId,
                type,
                owner: Meteor.userId(),
                username: Meteor.user().username,
                createdAt: new Date(),
              });
            }
          }));
      }
    }));
  },
});
