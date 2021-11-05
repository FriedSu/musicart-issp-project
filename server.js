const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const mongoose = require('mongoose');
const port = process.env.port || 8000;

const { ensureAuthenticated } = require("./middleware/check_auth");

require("dotenv").config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const Purchase = require("./models/PurchaseModel").Purchase;

let user_music_items = []

// let test_music_items = new Map(user_music_items)
let test_music_items = null

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
    user_music_items = []
    });
app.get("/payment_success", (req, res) => res.render('payment_success'));
app.get("/payment_cancel", (req, res) => res.render('payment_cancel', {data:{music_info:user_music_items}}))
app.get('/checkout-session', async (req, res) => {
    const session = await stripe.checkout.sessions.retrieve(req.query.id, {expand:['line_items']});
        res.json({session});
    });


// Stripe checkout session
app.post('/create-checkout-session', async (req, res) => {
    try {
      const taxRates = await stripe.taxRates.create({
        display_name: 'Sales Tax',
        inclusive: false,
        percentage: 23,
        country: 'PL',
      });
      // console.log(taxRates)
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
                    quantity: 1,
                    tax_rates: [taxRates.id]
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


// Save purchase data into MonogDB
// INSTRUCTION: 
//    - type "stripe listen --forward-to localhost:8000/webhook" IN DIFFERENT TERMINAL
app.post('/webhook', express.json({type: 'application/json'}), (request, response) => {
  const event = request.body;
  let time = Date.now()

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      const purchase = new Purchase({
        id: paymentIntent.id, 
        email: paymentIntent.receipt_email,
        amount_received: paymentIntent.amount_received,
        currency: paymentIntent.currency,
        timestamp: time 
        });
      purchase.save()

      break;
    default:
      console.log(`Unhandled event type ${event.type}.`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});

// connect to mongodb

const databaseURL = 'mongodb+srv://Admin:111122!Aadmin@musicart.uumip.mongodb.net/MusicartDB?retryWrites=true&w=majority';
mongoose.connect(databaseURL, { useNewURLParser: true, useUnifiedTopology: true})
    .then((result) => console.log('connected to db'))
    .then(app.listen(port, () => {
        console.log(`Server started on port ${port}`);
    }))
    .catch((err) => console.log(err));


// Search
const fs = require('fs')
const SpotifyWebApi = require('spotify-web-api-node');
const token = "BQCf4vXzt-IYBCAYh4Cl7tnkBN00XT42Xdr5RKcETjPr8HOx4xOKsioRCFe5caP4DAWQ1En6jxtfhM1DD5VnUWuAoH9hDYnMvL6I0WzdEpOcWNBFwZfjfmEIus9lJiDN_7go_FXdObvcTtN6JD9FrnHpHNWfXcKjGc-2XyDiOKzhx6N6TJxsgOfozfHp1IU40MZPRoh-iXZ_HQzGzYSvsO5sLUQPBEsNJUDVsvN7lYRvecounS7YCaVKeC5Mw7JWj9uoS-qw3Th1UJUk5ToCxEGKOfw";
const bodyParser = require('body-parser')
const spotifyApi = new SpotifyWebApi();

spotifyApi.setAccessToken(token);

//GET MY PROFILE DATA
function getMyData() {
  (async () => {
    const me = await spotifyApi.getMe();
    console.log(me.body);
    getUserPlaylists(me.body.id);
  })().catch(e => {
    console.error(e);
  });
}

//GET MY PLAYLISTS
async function getUserPlaylists(userName) {
  const data = await spotifyApi.getUserPlaylists(userName)

  console.log("---------------+++++++++++++++++++++++++")
  let playlists = []

  for (let playlist of data.body.items) {
    console.log(playlist.name + " " + playlist.id)
    
    let tracks = await getPlaylistTracks(playlist.id, playlist.name);
    console.log(tracks);

    const tracksJSON = { tracks }
    let data = JSON.stringify(tracksJSON);
    fs.writeFileSync(playlist.name+'.json', data);
  }
}

async function getPlaylistTracks(playlistId, playlistName) {

  const data = await spotifyApi.getPlaylistTracks(playlistId, {
    offset: 1,
    limit: 100,
    fields: 'items'
  })

  let tracks = [];

  for (let track_obj of data.body.items) {
    const track = track_obj.track
    tracks.push(track);
    console.log(track.name + " : " + track.artists[0].name)
  }
  
  console.log("---------------+++++++++++++++++++++++++")
  return tracks;
}

async function searchTracks(trackName){

  const data = await spotifyApi.searchTracks(trackName, {
    offset: 1,
    limit: 10,
    fields: 'items'
  })

  let results = data.body.tracks.items

  results.forEach(result => {
    if(result.name.toUpperCase().includes(trackName.toUpperCase())){
      let music = [result.id, {artist_name: result.artists[0].name, song_name: result.name}]
      user_music_items.push(music)
      test_music_items = new Map(user_music_items)
    }
  });
  // console.log(results)
}

function addtoPlaylist(playlistId, trackId){
  spotifyApi.addTracksToPlaylist(
    playlistId,
    [
      trackId
    ])
}

app.get('/search', function(req, res) {
  res.render('search');
  // let track_name = req.query.search_track;
  
  // // console.log('text is ' + track_name);
  // searchTracks(track_name)
  // res.json(process.env.SERVER_URL)
});

// app.get('/search_result', (req, res) => {
//     let track_name = req.query.search_track;
//     console.log(track_name)
//     searchTracks(track_name) 
// })

app.get('/search_result', (req, res) => {
  let track_name = req.query.search_track
  // console.log(track_name)
  searchTracks(track_name)
  // redirect = `${process.env.SERVER_URL}/checkout`
  // res.json({url: redirect})
  res.redirect('checkout')
})
