const fs = require('fs')
const SpotifyWebApi = require('spotify-web-api-node');
const express = require('express');
const token = "BQAI7KLik9fB2NpBADUrFezU0UcDi0F5FNas_B48PLqquLC-SlBT21axe975FFCYoTkwIwu4HQvVXMLyjMyvzxME_IYF4LtofSKqW3EVrqGxFR-qAwLfCLiydFvZWMGiHldp2iHJV_QHECXZQq7b0DY6jVfMp2WnZPHtUsu_zMzH9Aq7a53cQkpL1BM_88UskbXJfYdIE5yt6KFDiiR6r4DBjYL0fiM4EwiGK6bhESv822sl1VkrST0GVvEEFIJYkwf4ak_5OAHYV8tYArfqfX1QiNMLPPTL_6aGMASswYylFCznfQ_x";
const bodyParser = require('body-parser')
const spotifyApi = new SpotifyWebApi();

var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}))
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

  // console.log('The playlist contains these tracks', data.body);
  // console.log('The playlist contains these tracks: ', data.body.items[0].track);
  // console.log("'" + playlistName + "'" + ' contains these tracks:');
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
  console.log('The playlist contains these tracks', data.body.tracks.items);
  
}

function addtoPlaylist(playlistId, trackId){
  spotifyApi.addTracksToPlaylist(
    playlistId,
    [
      trackId
    ])
}



// getMyData()
// searchTracks('love');
// 3SpBlxme9WbeQdI9kx7KAV
// addtoPlaylist('5ip8XW3DeB2ozaKDVxEmGN','spotify:track:1301WleyT98MSxVHPZCA6M')

app.get('/', function(req, res) {
  res.render('index');
  var track_name = req.query.search_track;
  
  console.log('text is ' + track_name);
  searchTracks(track_name)
});

// app.post('/', function(req, res) {
//   res.render('index');
//   console.log(req.body.searech_track);
// });



app.listen(8090);
console.log('Server is listening on port 8090');