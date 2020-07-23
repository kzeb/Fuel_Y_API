const mongoose = require('mongoose')

const refuelingSchema = mongoose.Schema({
    userId: {
        type: String
    },
    amount: {
        type: String,
        required: true
    },
    distance: {
        type: String,
        required: true
    },
    avg: {
        type: String
    }
})

const Refueling = mongoose.model('Refueling', refuelingSchema)

module.exports = Refueling