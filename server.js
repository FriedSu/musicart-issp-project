
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const mongoose = require('mongoose');
const port = process.env.port || 8080;

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
const profileRoute = require("./routes/profileRoute");
const adminRoute = require("./routes/adminRoute");
const helpRoute = require("./routes/helpRoute"); 
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
app.use("/help", helpRoute);


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
                addtoPlaylist('5ip8XW3DeB2ozaKDVxEmGN', music_item.track_uri)
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

  let _id = null
  let _name = null
  let _email = null
  let _amount_received = null
  let _receipt_url = null
  let _currency = null

  // Handle the event
  switch (event.type) {
    case 'charge.succeeded':
      let charge = event.data.object;

      const purchase = new Purchase({
        id: charge.id, 
        email: charge.billing_details.email,
        name: charge.billing_details.name,
        amount_received: charge.amount,
        currency: charge.currency,
        receipt_url: charge.receipt_url
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
// Load the AWS SDK
// var AWS = require('aws-sdk'),
//     region = "us-east-1",
//     secretName = "arn:aws:secretsmanager:us-east-1:905552511425:secret:DB2-f6fAr0",
//     secret,
//     decodedBinarySecret;

// // Create a Secrets Manager client
// var client = new AWS.SecretsManager({
//     region: region
// });

// // In this sample we only handle the specific exceptions for the 'GetSecretValue' API.
// // See https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
// // We rethrow the exception by default.

// client.getSecretValue({SecretId: secretName}, function(err, data) {
//     if (err) {
//         if (err.code === 'DecryptionFailureException')
//             // Secrets Manager can't decrypt the protected secret text using the provided KMS key.
//             // Deal with the exception here, and/or rethrow at your discretion.
//             throw err;
//         else if (err.code === 'InternalServiceErrorException')
//             // An error occurred on the server side.
//             // Deal with the exception here, and/or rethrow at your discretion.
//             throw err;
//         else if (err.code === 'InvalidParameterException')
//             // You provided an invalid value for a parameter.
//             // Deal with the exception here, and/or rethrow at your discretion.
//             throw err;
//         else if (err.code === 'InvalidRequestException')
//             // You provided a parameter value that is not valid for the current state of the resource.
//             // Deal with the exception here, and/or rethrow at your discretion.
//             throw err;
//         else if (err.code === 'ResourceNotFoundException')
//             // We can't find the resource that you asked for.
//             // Deal with the exception here, and/or rethrow at your discretion.
//             throw err;
//     }
//     else {
//         // Decrypts secret using the associated KMS CMK.
//         // Depending on whether the secret is a string or binary, one of these fields will be populated.
//         if ('SecretString' in data) {
//             secret = data.SecretString;
//         } else {
//             let buff = new Buffer(data.SecretBinary, 'base64');
//             decodedBinarySecret = buff.toString('ascii');
//         }
//     }
    
//     let db  = (JSON.parse(secret));
//     // connect to mongodb
//     mongoose.connect(db.secret, { useNewURLParser: true, useUnifiedTopology: true})
//     .then((result) => console.log('connected to db'))
//     .then(app.listen(port, () => {
//         console.log(`Server started on port ${port}`);
//     }))
//     .catch((err) => console.log(err));
// });
const databaseURL = 'mongodb+srv://Admin:111122!Aadmin@musicart.uumip.mongodb.net/MusicartDB?retryWrites=true&w=majority';
mongoose.connect(databaseURL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => console.log('connected to db'))
    .then(app.listen(port, () => {
        console.log(`Server started on port ${port}`);
    }))
    .catch((err) => console.log(err));


// Search
const fs = require('fs')
const SpotifyWebApi = require('spotify-web-api-node');

const token = "BQAR7ltXyWt1SPNaw8KbfHQUNRK2Z4AShpR2S71w2Ztcj7YZXaWboUKoCt7_2zsT3jQleZY_fzitLw8pYFqbrb3xCWtaIMHkuhQnBgRUaJTqBcJEq9npHS_VuTjjTDEpuVLz5AvSN0OfuWUOljoSIaICF36FVyFbe9WfG3dCn-NbPtjIn5jxXMV3wtd-QQ6YXE_7ORNhuaegZ1l5h4bPic6OAgy2HMpg2bNNS7BTFrn8AsaTgpi8YFICvFNfsRUHoRJs784rHUp9UgbsP6nQSY5kO9siffelaBN6yyE6mJMedoDAeQvR";

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
async function searchTracks(trackName, res){

  const data = await spotifyApi.searchTracks(trackName, {
    offset: 1,
    limit: 10,
    fields: 'items'
  })

  let results = data.body.tracks.items

  results.forEach(result => {
    if(result.name.toUpperCase().includes(trackName.toUpperCase())){
      let music = [result.id, {song_image: result.album.images[1].url,artist_name: result.artists[0].name, 
        song_name: result.name,song_type: result.album.album_type, release_date: result.album.release_date,
                   song_url: result.external_urls.spotify, track_uri: result.uri}]
      user_music_items.push(music)
      
    }
  });
  test_music_items = new Map(user_music_items)
  res.redirect('checkout')
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

  searchTracks(track_name, res)
  // .then(res.redirect('checkout'))
  // console.log(user_music_items)

  // if (user_music_items.length != 0) {
  //   res.redirect('checkout')
  // }
  // res.redirect('checkout')
})
