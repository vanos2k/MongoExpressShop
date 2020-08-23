const {Schema, model} = require('mongoose');

const Currency = new Schema({
    title: {
        type: String,
        required: true
    },
    shortTitle: {
        type: String,
        required: true
    },
    toUsd: {
        type: Number,
        required: true
    },
});

// Currency.getCoeficient = function () {
//
// };

module.exports = model('currency', Currency);