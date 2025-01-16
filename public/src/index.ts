// public/src/index.ts
import './game.ts';

// Fetch user information from the backend
async function fetchUserInfo() {
    const response = await fetch('/api/user');
    const user = await response.json();
    console.log("user: ", user)
    if (user) {
        document.getElementById('score-board')!.textContent = `Score: 0 (Logged in as ${user.username})`;
    }
}
fetchUserInfo();

