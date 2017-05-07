var mongoose = require('mongoose');

var numras = new mongoose.Schema({
  number: {
    type: String,
    required: [true, 'You need a phone number to subscribe.'],
    minlength: 10,
    maxlength: 10,
    trim: true
  }
});

var PhoneNumber = mongoose.model('PhoneNumbers', numras);

module.exports = {
  PhoneNumber
}
