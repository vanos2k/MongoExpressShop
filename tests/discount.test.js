const Discount = require('../models/discount');
const Course = require('../models/course');
const {MONGO_URI} = require('../keys/configuration');
const mongoose = require('mongoose');
const User = require('../models/user');

const dataDiscount = {percent: 15, type: 0};
const dayDataDiscountOne = {percent: 5, type: 1, day: 3};
const dayDataDiscountTwo = {percent: 5, type: 1, day: 4};
const timeDataDiscountOne = {percent: 10, type: 2, hoursFrom: '00:00', hoursTo: '12:00'};
const timeDataDiscountTwo = {percent: 10, type: 2, hoursFrom: '12:01', hoursTo: '24:00'};


describe('discount model tests', () => {
    let course;
    let user;
    //configuration
    beforeAll(async () => {
        await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true}, async (err) => {
            if (err) {
                process.exit(1);
            }

            // creating course for testing discount and associating test discounts to course
            user = new User({email: 'testtest@mail.comasedq', name: 'testName', password: '123'});
            await user.save();
            course = new Course({title: 'TestCourse', price: 10000, img: 'https:/random/se', userId: user._id});
            await course.save();
            Object.assign(dataDiscount, {courseId: course._id});
            Object.assign(timeDataDiscountOne, {courseId: course._id});
            Object.assign(timeDataDiscountTwo, {courseId: course._id});
            Object.assign(dayDataDiscountOne, {courseId: course._id});
            Object.assign(dayDataDiscountTwo, {courseId: course._id});
        });
    });

    afterEach(async () => {
        await Discount.deleteMany({courseId: course._id});
    });

    afterAll(async (done) => {
        await Course.deleteOne({id: course._id});
        mongoose.disconnect(done);
    });

    //tests
    it('create & save discount', async () => {
        const discount = new Discount(dataDiscount);
        await discount.save();

        expect(discount.courseId).toBe(dataDiscount.courseId);
        expect(discount.percent).toBe(dataDiscount.percent);
        expect(discount.type).toBe(dataDiscount.type);
        expect(discount.day).toBeUndefined();
        expect(discount.hoursFrom).toBeUndefined();
        expect(discount.hoursTo).toBeUndefined();

    });

    it('create & save day discount', async () => {
        const discount = new Discount(dayDataDiscountOne);
        await discount.save();

        expect(discount.courseId).toBe(dayDataDiscountOne.courseId);
        expect(discount.percent).toBe(dayDataDiscountOne.percent);
        expect(discount.type).toBe(dayDataDiscountOne.type);
        expect(discount.day).toBe(dayDataDiscountOne.day);
        expect(discount.hoursFrom).toBeUndefined();
        expect(discount.hoursTo).toBeUndefined();
    });


    it('create & save time discount', async () => {
        const discount = new Discount(timeDataDiscountOne);
        await discount.save();

        expect(discount.courseId).toBe(timeDataDiscountOne.courseId);
        expect(discount.percent).toBe(timeDataDiscountOne.percent);
        expect(discount.type).toBe(timeDataDiscountOne.type);
        expect(discount.day).toBeUndefined();
        expect(discount.hoursFrom).toBe(timeDataDiscountOne.hoursFrom);
        expect(discount.hoursTo).toBe(timeDataDiscountOne.hoursTo);
    });

    it('discountCounter function all', async () => {
        // creating discounts
        const dateNow = new Date(Date.now());
        const currentTime = `${dateNow.getHours()}:${dateNow.getMinutes()}`;
        let testCourse = {...course._doc};

        const discount = new Discount(dataDiscount);
        await discount.save();

        const dayDiscountOne = new Discount(dayDataDiscountOne); // Wednesday
        await dayDiscountOne.save();
        // const dayDiscountTwo = new Discount(dayDataDiscountTwo); // thursday
        // await dayDiscountTwo.save();
        const timeDiscountOne = new Discount(timeDataDiscountOne); // 00:00 - 12:00
        await timeDiscountOne.save();
        // const timeDiscountTwo = new Discount(timeDataDiscountTwo); // 12:01 - 24:00
        // await timeDiscountTwo.save();


        testCourse = await Discount.discountCounter(testCourse);

        // work only in wednesday
        if (dayDiscountOne.day === dateNow.getDay() && (currentTime >= timeDiscountOne.hoursFrom && currentTime <= timeDiscountOne.hoursTo)) {
            expect(testCourse.price).toBe(7267.5);
        } else if (currentTime >= timeDiscountOne.hoursFrom && currentTime <= timeDiscountOne.hoursTo) {
            expect(testCourse.price.toBe(7650));
        } else if (dayDiscountOne.day === dateNow.getDay()) {
            expect(testCourse.price).toBe(8075);
        }
        else {
            expect(testCourse.price).toBe(8500);
        }
    })

});