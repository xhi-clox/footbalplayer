
let players = JSON.parse(localStorage.getItem('players')) || [];
let isAdmin = false;
const ADMIN_PASSWORD = "admin123";
let currentPositionFilter = 'all';
let currentSearchQuery = '';
let editingPlayerId = null;

function savePlayers() {
    localStorage.setItem('players', JSON.stringify(players));
    renderPlayers();
}

function renderPlayers() {
    const filteredPlayers = players.filter(player => {
        const matchesPosition = currentPositionFilter === 'all' ||
            player.position.toLowerCase() === currentPositionFilter;
        const matchesSearch = player.name.toLowerCase().includes(currentSearchQuery);
        return matchesPosition && matchesSearch;
    });

    const grid = document.getElementById('playersGrid');
    grid.innerHTML = filteredPlayers.map(player => `
                <div class="player-card" onclick="showPlayer(${player.id})">
                    ${isAdmin ? `<span class="delete-icon" onclick="deletePlayer(${player.id})">🗑️</span>` : ''}
                    <img src="${player.photo}" class="player-image" alt="${player.name}" 
                         onerror="this.src='https://via.placeholder.com/280x250/2d2d42/ffffff?text=No+Image'">
                    <h2 class="player-name">${player.name}</h2>
                </div>
            `).join('');
}

function setupPositionFilters() {
    const positions = ['All', 'Forward', 'Midfielder', 'Defender', 'Goalkeeper', 'Winger'];
    const filtersDiv = document.getElementById('positionFilters');
    filtersDiv.innerHTML = positions.map(pos => `
                <button class="filter-btn" onclick="filterByPosition('${pos.toLowerCase()}')">
                    ${pos}
                </button>
            `).join('');
}

function filterByPosition(position) {
    currentPositionFilter = position;
    renderPlayers();
}

function adminLogin() {
    const password = prompt('Enter admin password:');
    if (password === ADMIN_PASSWORD) {
        isAdmin = true;
        document.getElementById('adminControls').style.display = 'block';
        renderPlayers();
        alert('Admin mode activated!');
    } else {
        alert('Incorrect password!');
    }
}

function deletePlayer(id) {
    if (!isAdmin) return;
    if (confirm('Are you sure you want to delete this player?')) {
        players = players.filter(player => player.id !== id);
        savePlayers();
    }
}

function showPlayer(id) {
    const player = players.find(p => p.id === id);
    const content = `
                <h2 class="player-name-header">${player.name}</h2>
                <div class="player-details">
                    <div>
                        <img src="${player.photo}" style="width:100%; border-radius:10px; margin-bottom:1.5rem;" 
                             alt="${player.name}">
                        <div class="detail-item">
                            <h3>Position</h3>
                            <p>${player.position}</p>
                        </div>
                    </div>
                    <div>
                        ${isAdmin ? `
                        <button class="add-btn" onclick="editPlayer(${player.id})">Edit Player</button>
                        ` : ''}
                        <div class="detail-item">
                            <h3>Age</h3>
                            <p>${player.age} years</p>
                        </div>
                        <div class="detail-item">
                            <h3>Club</h3>
                            <p>${player.club}</p>
                        </div>
                        <div class="detail-item">
                            <h3>Statistics</h3>
                            <p>${player.stats.replace(/,/g, '<br>')}</p>
                        </div>
                        ${isAdmin ? `<button class="delete-btn" onclick="deletePlayer(${player.id})">Delete Player</button>` : ''}
                    </div>
                </div>
            `;
    document.getElementById('modalContent').innerHTML = content;
    document.getElementById('playerModal').style.display = 'flex';
}

function toggleForm() {
    const form = document.getElementById('addForm');
    form.style.display = form.style.display === 'block' ? 'none' : 'block';
    if (form.style.display === 'block' && editingPlayerId === null) {
        clearForm();
    }
}

function editPlayer(id) {
    const player = players.find(p => p.id === id);
    editingPlayerId = id;

    document.getElementById('name').value = player.name;
    document.getElementById('position').value = player.position;
    document.getElementById('age').value = player.age;
    document.getElementById('club').value = player.club;
    document.getElementById('stats').value = player.stats;
    document.getElementById('formTitle').textContent = '✏️ Edit Footballer';
    document.getElementById('saveButton').textContent = 'Update Player';

    toggleForm();
}

function saveOrUpdatePlayer() {
    if (editingPlayerId !== null) {
        updatePlayer();
    } else {
        addPlayer();
    }
}

function addPlayer() {
    const fileInput = document.getElementById('photo');
    const reader = new FileReader();

    reader.onload = function (e) {
        const newPlayer = {
            id: Date.now(),
            name: document.getElementById('name').value,
            photo: e.target.result,
            position: document.getElementById('position').value,
            age: document.getElementById('age').value,
            club: document.getElementById('club').value,
            stats: document.getElementById('stats').value
        };

        if (!newPlayer.name || !newPlayer.position) {
            alert('Please fill required fields!');
            return;
        }

        players.push(newPlayer);
        savePlayers();
        toggleForm();
        clearForm();
    };

    if (fileInput.files[0]) {
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        alert('Please select a player photo!');
    }
}

function updatePlayer() {
    const playerIndex = players.findIndex(p => p.id === editingPlayerId);
    const fileInput = document.getElementById('photo');
    const reader = new FileReader();

    reader.onload = function (e) {
        players[playerIndex] = {
            ...players[playerIndex],
            name: document.getElementById('name').value,
            photo: fileInput.files[0] ? e.target.result : players[playerIndex].photo,
            position: document.getElementById('position').value,
            age: document.getElementById('age').value,
            club: document.getElementById('club').value,
            stats: document.getElementById('stats').value
        };

        savePlayers();
        toggleForm();
        clearForm();
        editingPlayerId = null;
    };

    if (fileInput.files[0]) {
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        players[playerIndex] = {
            ...players[playerIndex],
            name: document.getElementById('name').value,
            position: document.getElementById('position').value,
            age: document.getElementById('age').value,
            club: document.getElementById('club').value,
            stats: document.getElementById('stats').value
        };

        savePlayers();
        toggleForm();
        clearForm();
        editingPlayerId = null;
    }
}

function clearForm() {
    document.getElementById('addForm').reset();
    document.getElementById('photo').value = '';
    document.getElementById('formTitle').textContent = '➕ Add New Footballer';
    document.getElementById('saveButton').textContent = 'Save Player';
    editingPlayerId = null;
}

function closeModal() {
    document.getElementById('playerModal').style.display = 'none';
}

document.getElementById('searchInput').addEventListener('input', (e) => {
    currentSearchQuery = e.target.value.toLowerCase();
    renderPlayers();
});

window.onclick = function (event) {
    if (event.target === document.getElementById('playerModal')) closeModal();
    if (event.target === document.getElementById('addForm')) toggleForm();
}

setupPositionFilters();
renderPlayers();
