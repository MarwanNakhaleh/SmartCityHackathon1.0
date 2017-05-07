var mongoose = require('mongoose');

var PhoneNumber = mongoose.model('PhoneNumber', {
  number: {
    type: Number,
    required: [true, 'You need a phone number to subscribe.'],
    minlength: 10,
    maxlength: 10,
    trim: true
  }
});

module.exports = {
  PhoneNumber
}
