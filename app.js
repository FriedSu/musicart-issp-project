const fs = require('fs')
const SpotifyWebApi = require('spotify-web-api-node');
const token = "BQAS9lcBFiDu6W4iErQl6ZWFfIQbc-hPkAJ28mb_TlBBVUAdHp_Zks8EBD8HrwUsd7BC8Q5SQ4xXnkzVbq6bSkGO9OoCL1YbSeAa7ovVR7_r79KUqrxyhOUZjQEcd8tuTqd1RE3XcJLBCfALbo25RUQDyodoyPVfe741mCdRTzDZIWfW3C7817gjjZ7AS5McGPZqrUOmZTbRWPQWLbvmW94UCrjfevhwp6zWzEnLKeQNlWZ88KYi3tyVBTznxkih5l_rGY3tK4LiGWdPWGFR2bYio5ba0n1uF2g1CdJv8ku47beR6p3x";

const spotifyApi = new SpotifyWebApi();
spotifyApi.setAccessToken(token);

//GET MY PROFILE DATA
function getMyData() {
  (async () => {
    const me = await spotifyApi.getMe();
    // console.log(me.body);
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
    // console.log(tracks);

    const tracksJSON = { tracks }
    let data = JSON.stringify(tracksJSON);
    fs.writeFileSync(playlist.name+'.json', data);
  }
}

//GET SONGS FROM PLAYLIST
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

async function addtoPlaylist(playlistId, trackId){
  spotifyApi.addTracksToPlaylist(
    playlistId,
    [
      trackId
    ])
}



getMyData();
// searchTracks('love');
// 3SpBlxme9WbeQdI9kx7KAV
// addtoPlaylist('5ip8XW3DeB2ozaKDVxEmGN','spotify:track:1301WleyT98MSxVHPZCA6M')