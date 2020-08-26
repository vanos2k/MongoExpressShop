const {Schema, model} = require('mongoose');

const Discount = Schema({
    courseId: {
        type: Schema.Types.ObjectId,
    },
    percent: {
        type: Number,
        required: true
    },
    type: {
        type: Number,
        required: true
    },
    day: {
        type: Number
    },
    hoursFrom: {
        type: String
    },
    hoursTo: {
        type: String
    }
});

// class Discount {
//     constructor (percent, courseId) {
//         this.percent = percent;
//         this.courseId = courseId;
//     }
// }
//
// class DayDiscount extends Discount {
//     constructor (percent, courseId, day) {
//         super(percent, courseId);
//         this.day = day;
//     }
// }
//
// class HourDiscount extends Discount {
//     constructor (percent, courseId, hoursFrom, hoursTo) {
//         super(percent, courseId);
//         this.hourseFrom = hoursFrom;
//         this.hourseTo = hoursTo;
//     }
// }

// type [0=course discount, 1=discount by day]


Discount.statics.discountCounter = async function (course) {
    const courseDiscounts = await this.find({courseId: course._id});
    // Object.assign(course, {priceWithDiscount: course.price});
    courseDiscounts.forEach(discount => {
        switch (discount.type) {
            case 0:
                course = discount.applyDiscount(course);
                break;
            case 1:
                course = discount.dayDiscount(course);
                break;
            case 2:
                course = discount.HourDiscount(course);
                break;
        }
    });
    return course;
};


Discount.methods.dayDiscount = function (course) {
    const currentDate = new Date(Date.now());
    const currentWeekDay = currentDate.getDay();

    if (+currentWeekDay === +this.day) {
        return this.applyDiscount(course);
    }
    return course;
};

Discount.methods.HourDiscount = function (course) {
    const currentDate = new Date(Date.now());
    const currentTime = `${currentDate.getHours()}:${currentDate.getMinutes()}`;

    if (currentTime >= this.hoursFrom && currentTime <= this.hoursTo) {
        return this.applyDiscount(course);
    }
    return course;
};

/**
 * @param course // course mongoose model
 * @returns {*} // updated course price by discount
 */
Discount.methods.applyDiscount = function (course) {
    course.price = course.price - (course.price * this.percent / 100);
    return course;
};

module.exports = model('discount', Discount);