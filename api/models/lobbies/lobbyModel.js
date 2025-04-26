const mongoose = require('mongoose');

const LobbySchema = new mongoose.Schema({
    roomName: {
        type: String,
        required: true,
    },
    roomOwner: {
        type: Object,
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
        default: []
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