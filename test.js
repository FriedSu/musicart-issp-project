//   /* Load the HTTP library */
//   var http = require("http");
//   var client_id = '475065ad09b14f60a13da67ff08de3f0'; // Your client id
//   var client_secret = 'c86ce757d0094f08883821a2d57444bd'; // Your secret
//   var redirect_uri = 'REDIRECT_URI'; // Your redirect uri
//   /* Create an HTTP server to handle responses */

//   http.createServer(function(request, response) {
//     response.writeHead(200, {"Content-Type": "text/plain"});
//     response.write("Hello World");
//     response.end();
//   }).listen(8888);

// var request = require("request");
// var user_id = "	314samoukuqlmib3so7ohvosta4y"
// var token = "Bearer"
// var playlists_url = "https://api.spotify.com/v1/users/"+user_id+"/playlists"


function search_bar() {
    // Declare variables
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById('myInput');
    filter = input.value.toUpperCase();
    ul = document.getElementById("myUL");
    li = ul.getElementsByTagName('li');
  
    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < li.length; i++) {
      a = li[i].getElementsByTagName("a")[0];
      txtValue = a.textContent || a.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = "";
      } else {
        li[i].style.display = "none";
      }
    }
  }