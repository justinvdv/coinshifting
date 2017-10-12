import { Template } from 'meteor/templating';
import { Wallets } from '/imports/api/wallets/wallets.js';
import { Meteor } from 'meteor/meteor';
import bitcore from 'bitcore-lib';
import { ReactiveDict } from 'meteor/reactive-dict';

import './wallets.html';

Template.body.helpers({
  wallets() {
    return Wallets.find({owner: Meteor.userId()});
  },
});

Template.body.events({
  'click .create-btc'(event) {
    event.preventDefault();

    var privateKey = new bitcore.PrivateKey('testnet');
    var address = privateKey.toAddress();
    var addressString = address.toString();
    var privateKeyString = privateKey.toString();
    var type = 'Bitcoin';

    var script = bitcore.Script.buildPublicKeyHashOut(addressString);
    console.log(script.toString());

    if (bitcore.Address.isValid(address)){
      Meteor.call('wallets.insert', addressString, privateKeyString, type, (error) => {
        if (error) {
          alert(error)
        };
      });
    };
  },
});

Template.wallet.events({
  'click .create-transaction'(event) {
    event.preventDefault();

  var script = bitcore.Script.buildPublicKeyHashOut(this.publicKey);

    Meteor.call('transactions.insert', this._id, this.publicKey, this.privateKey, this.type, (error) => {
      if (error) {
        alert(error)
      };
    });

  },
})
