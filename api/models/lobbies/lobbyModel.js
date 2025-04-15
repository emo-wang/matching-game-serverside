const mongoose = require('mongoose');

const LobbySchema = new mongoose.Schema({
    roomName: {
        type: String,
        required: true,
    },
    roomOwnerId: {
        type: String, // player的uuid
        required: true
    },
    maxPlayerCount: {
        type: Number,
        default: 6,
        max: 6,
        min: 1
    },
    playerList:
    {
        type: Array,
        default: [] // 存放player的uuid
    },
    isPlaying: {
        type: Boolean,
        default: false
    },
    isPrivate: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        default: null
    },
    mapType: {
        type: Number,
        default: 0
    }
});

const Lobby = mongoose.model('Lobby', LobbySchema);

module.exports = Lobby; 