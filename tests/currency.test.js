const Currency = require('../models/currency');
const {MONGO_URI} = require('../keys/configuration');
const mongoose = require('mongoose');

const testDataAUD = {title: 'TestCurrencyOne', shortTitle: 'AUD', toUsd: 0.72};
const testDataLEK = {title: 'TestCurrencyTwo', shortTitle: 'LEK', toUsd: 0.0095};

describe('Test the currency model', () => {

    //configuration
    beforeAll(async () => {
        await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true}, async (err) => {
            if (err) {
                process.exit(1);
            }
        });
    });

    afterEach(async () => {
        await Currency.deleteMany({$or: [{title: testDataAUD.title}, {title: testDataLEK.title}]});
    });

    afterAll((done) => {
        mongoose.disconnect(done);
    });


    //tests

    it('create & save currency successfully', async () => {
        const testAUD = new Currency(testDataAUD);
        await testAUD.save();

        expect(testAUD._id).toBeDefined();
        expect(testAUD.title).toBe(testDataAUD.title);
        expect(testAUD.shortTitle).toBe(testDataAUD.shortTitle);
        expect(testAUD.toUsd).toBe(testDataAUD.toUsd);
    });


    it('test convertPrice method', async () => {
        const testAUD = new Currency(testDataAUD);
        await testAUD.save();
        const testLEK = new Currency(testDataLEK);
        await testLEK.save();

        const convertedObjectTo = await Currency.convertPrice(testAUD._id, testLEK._id, 10000);
        const convertedObjectFrom = await Currency.convertPrice(testLEK._id, testAUD._id, convertedObjectTo.convertedPrice);

        expect(+convertedObjectTo.convertedPrice.toFixed(2)).toBe(131.94);
        expect(Math.ceil(+convertedObjectFrom.convertedPrice)).toBe(10000);
        expect(convertedObjectTo.shortTitle).toBe(testAUD.shortTitle);
        expect(convertedObjectFrom.shortTitle).toBe(testLEK.shortTitle);
    });

});