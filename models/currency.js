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

/**
 * @param {Schema.Types.ObjectId} newCurrencyId // new currency id
 * @param {Schema.Types.ObjectId} oldCurrencyId // old currency id
 * @param {Schema.Types.ObjectId} price // course price
 * @returns {Promise<{convertedPrice: number, shortTitle: (shortTitle|{type, required})}>} // converted course price, new currency short title
 */
Currency.statics.convertPrice = async function (newCurrencyId, oldCurrencyId, price) {
    const newCurrency = await this.findById(newCurrencyId);
    const oldCurrency = await this.findById(oldCurrencyId);

    const convertedPrice = newCurrency.toUsd > oldCurrency.toUsd ? price / (newCurrency.toUsd / oldCurrency.toUsd) : price * (oldCurrency.toUsd / newCurrency.toUsd);
    return Promise.resolve({convertedPrice, shortTitle: newCurrency.shortTitle});
};


module.exports = model('currency', Currency);