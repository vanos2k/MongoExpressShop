const {Router} = require('express');
const Currency = require('../models/currency');
const router = Router();

router.post('/', async (req, res) => {
    const {newCurrencyId, oldCurrencyId, coursePrice} = req.query;
    const {convertedPrice, shortTitle} = await Currency.convertPrice(newCurrencyId, oldCurrencyId, coursePrice);

    res.json({
        convertedPrice,
        newCurrencyId,
        shortTitle
    });
});

module.exports = router;