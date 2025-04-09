const mongoose = require('mongoose');

const LobbySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    maxPlayerCount: {
        type: Number,
        default: 6,
        max: 6,
        min: 1
    },
    playerCount:
    {
        type: Number,
        default: 1
    },
    isPlaying: {
        type: Boolean,
        default: false
    },
    isPrivate: {
        type: Boolean,
        default: false
    },
    mapType: {
        type: Number,
        default: 0
    }
});

const Lobby = mongoose.model('Lobby', LobbySchema);

module.exports = Lobby; 