
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema ({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'User',
    },
    profilePicture: {
        type: String,
        default: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Logo_musicart_group_logo_cmyk.png/1200px-Logo_musicart_group_logo_cmyk.png',
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema)

module.exports = {
    User,
}
