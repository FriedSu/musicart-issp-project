const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const purchaseSchema = new Schema ({
    id: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    amount_received: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        required: true,
    },
    receipt_url: {
        type: String,
        required: true,
    }
});

const Purchase = mongoose.model('Purchase', purchaseSchema)

module.exports = {
    Purchase,
}