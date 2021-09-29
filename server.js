const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const mongoose = require('mongoose');
const port = process.env.port || 8000;

const { ensureAuthenticated } = require("./middleware/check_auth");

require("dotenv").config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)


const test_music_items = new Map([
    [1,{ artist_name: "Ryan", song_name: "Hello world", price_in_cents: 100 }],
    [2,{ artist_name: "Sydney", song_name: "Hello again", price_in_cents: 100 }],
    [3,{ artist_name: "Adrian", song_name: "Hello hello", price_in_cents: 100 }]
])


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
app.get("/checkout", ensureAuthenticated, (req, res) => res.render("checkout"))
app.get("/payment_success", (req, res) => res.render('payment_success'))
app.get("/payment_cancel", (req, res) => res.render('payment_cancel'))

app.post('/create-checkout-session', async (req, res) => {
    try {
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
                        unit_amount: music_item.price_in_cents
                    },
                    quantity: item.quantity
                }
            }),
            success_url: `${process.env.SERVER_URL}/payment_success`,
            cancel_url: `${process.env.SERVER_URL}/payment_cancel`
        })
        res.json({ url: session.url})
    } catch (e) {
        res.status(500).json({ error: e.message })
    }
})

// connect to mongodb

const databaseURL = 'mongodb+srv://Admin:111122!Aadmin@musicart.uumip.mongodb.net/MusicartDB?retryWrites=true&w=majority';
mongoose.connect(databaseURL, { useNewURLParser: true, useUnifiedTopology: true})
    .then((result) => console.log('connected to db'))
    .then(app.listen(port, () => {
        console.log(`Server started on port ${port}`);
    }))
    .catch((err) => console.log(err));


