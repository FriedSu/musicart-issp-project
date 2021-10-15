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

app.get("/checkout", (req, res) => {
    res.render("checkout", { data: {music_info: user_music_items}})
    });
app.get("/payment_success", (req, res) => res.render('payment_success'));
app.get("/payment_cancel", (req, res) => res.render('payment_cancel'));
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
            cancel_url: `${process.env.SERVER_URL}/payment_cancel`
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



// connect to mongodb

const databaseURL = 'mongodb+srv://Admin:111122!Aadmin@musicart.uumip.mongodb.net/MusicartDB?retryWrites=true&w=majority';
mongoose.connect(databaseURL, { useNewURLParser: true, useUnifiedTopology: true})
    .then((result) => console.log('connected to db'))
    .then(app.listen(port, () => {
        console.log(`Server started on port ${port}`);
    }))
    .catch((err) => console.log(err));


