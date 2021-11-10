const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const mongoose = require('mongoose');
const port = process.env.port || 8000;

const { ensureAuthenticated } = require("./middleware/check_auth");

require("dotenv").config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

//change this after spotify api is done
const user_music_items = [
    [0,{ artist_name: "Ryan", song_name: "Hello world" }],
    [1,{ artist_name: "Sydney", song_name: "Hello again" }],
    [2,{ artist_name: "Adrian", song_name: "Hello hello" }],
    [3,{ artist_name: "Peter", song_name: "Hello Hi" }],
    [4,{ artist_name: "Joshua", song_name: "Hell yea" }],
    [5,{ artist_name: "Oliver", song_name: "Hello there" }],
    [6,{ artist_name: "Gautam", song_name: "Hell" }],
    [7,{ artist_name: "William", song_name: "Hello 12345" }],
]

const test_music_items = new Map(user_music_items)

exports.handler = async (event) => {
    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
exports.handler = async (event) => {
    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};
// Use this code snippet in your app.
// If you need more information about configurations or implementing the sample code, visit the AWS docs:
// https://aws.amazon.com/developers/getting-started/nodejs/

// Load the AWS SDK
var AWS = require('aws-sdk'),
    region = "us-east-1",
    secretName = "DB2",
    secret,
    decodedBinarySecret;

// Create a Secrets Manager client
var client = new AWS.SecretsManager({
    region: region
});

// In this sample we only handle the specific exceptions for the 'GetSecretValue' API.
// See https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
// We rethrow the exception by default.

client.getSecretValue({SecretId: secretName}, function(err, data) {
    if (err) {
        if (err.code === 'DecryptionFailureException')
            // Secrets Manager can't decrypt the protected secret text using the provided KMS key.
            // Deal with the exception here, and/or rethrow at your discretion.
            throw err;
        else if (err.code === 'InternalServiceErrorException')
            // An error occurred on the server side.
            // Deal with the exception here, and/or rethrow at your discretion.
            throw err;
        else if (err.code === 'InvalidParameterException')
            // You provided an invalid value for a parameter.
            // Deal with the exception here, and/or rethrow at your discretion.
            throw err;
        else if (err.code === 'InvalidRequestException')
            // You provided a parameter value that is not valid for the current state of the resource.
            // Deal with the exception here, and/or rethrow at your discretion.
            throw err;
        else if (err.code === 'ResourceNotFoundException')
            // We can't find the resource that you asked for.
            // Deal with the exception here, and/or rethrow at your discretion.
            throw err;
    }
    else {
        // Decrypts secret using the associated KMS CMK.
        // Depending on whether the secret is a string or binary, one of these fields will be populated.
        if ('SecretString' in data) {
            secret = data.SecretString;
        } else {
            let buff = new Buffer(data.SecretBinary, 'base64');
            decodedBinarySecret = buff.toString('ascii');
        }
    }
    
    let db  = (JSON.parse(secret));
    // connect to mongodb
    mongoose.connect(db.secret, { useNewURLParser: true, useUnifiedTopology: true})
    .then((result) => console.log('connected to db'))
    .then(app.listen(port, () => {
        console.log(`Server started on port ${port}`);
    }))
    .catch((err) => console.log(err));
});


const app = express();
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

//possible need to reconfigure session details
app.use(
    session({
        secret: "secret", // rename  secret to secure password
        reverse: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
            maxAge: 24 * 60 * 60 * 1000,
        },
    })
);

const authRoute = require("./routes/authRoute");
const indexRoute = require("./routes/indexRoute");
const checkoutRoute = require("./routes/checkoutRoute");
const profileRoute = require("./routes/profileRoute");
const adminRoute = require("./routes/adminRoute"); 
const { SecretsManager } = require('aws-sdk');

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    console.log(req.session.passport);
    next();
});

app.use("/", indexRoute);
app.use("/auth", authRoute);
app.use("/edit-profile", profileRoute);
app.use("/admin", adminRoute);


app.get("/checkout", (req, res) => {
    res.render("checkout", { data: {music_info: user_music_items}})
    });
app.get("/payment_success", (req, res) => res.render('payment_success'));
app.get("/payment_cancel", (req, res) => res.render('payment_cancel', {data:{music_info:user_music_items}}))
app.get('/checkout-session', async (req, res) => {
    const session = await stripe.checkout.sessions.retrieve(req.query.id)
        res.json({session});
    });

app.post('/create-checkout-session', async (req, res) => {
    try {
        // console.log(req.body.items2)
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: req.body.items.map(item => {
                const music_item = test_music_items.get(item.id)
                return {
                    price_data: {
                        currency: 'cad',
                        product_data: {
                            name: `${music_item.artist_name}: ${music_item.song_name}`
                        },
                        unit_amount: process.env.PRICE
                    },
                    quantity: 1
                }
            }),
            success_url: `${process.env.SERVER_URL}/payment_success?id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.SERVER_URL}/payment_cancel?id={CHECKOUT_SESSION_ID}`
        })
        res.json({ url: session.url,
                    id : session.id })
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
});



// testing,,, ignore this

// app.post('/testing', (req, res) => {
//     console.log(req.body.userID)
// })






