
const form = document.getElementById('login')
const socket = io();

form.addEventListener('submit', login);

async function login(event) {
    event.preventDefault()
    const username = document.getElementById('username').value
    const password = document.getElementById('password').value

    const result = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            password
        })
    }).then((res) => res.json())

    if (result.status !== 404) {
        // everythign went fine
        let result2 = result.data;
        result2.socketId = socket.id;
        console.log('Got the token: ', result2)
        window.localStorage.setItem('token', result2)
        console.log('Success')
    } else {
        console.log(result.error)
    }
}


