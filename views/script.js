const input = document.querySelectorAll("input")
const button = document.querySelector("button")
const songsById = []

button.addEventListener("click", () => {
    for (let i = 0; i < input.length; i++) {
        if (input[i].checked) {
            let songId = input[i].name
            songsById.push({ id: parseInt(songId) })
        }
    }
})

button.addEventListener("click", () => {
fetch('/create-checkout-session', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        items: songsById
    })
}).then(res => {
    if (res.ok) return res.json()
    return res.json().then(json => Promise.reject(json))
}).then(({ url }) => {
    // console.log(url)
    window.location = url
}).catch(e => {
    console.error(e.error)
})
})

