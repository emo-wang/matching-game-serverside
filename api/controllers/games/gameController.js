var roomService = require('../../services/games/gameService');
var redisManager = require('../../../public/javascripts/redisManager')

async function enterRoom(req, res) {
    try {
        res.status(201).send();
    } catch (error) {
        res.status(400).send(error);
    }
};

async function exitRoom(req, res) {
    try {
        res.status(200).send();
    } catch (error) {
        res.status(500).send(error);
    }
};

async function startGame(req, res) {
    try {
        res.status(200).send();
    } catch (error) {
        res.status(500).send(error);
    }
};


module.exports = {
    enterRoom,
    exitRoom,
    startGame,
}
