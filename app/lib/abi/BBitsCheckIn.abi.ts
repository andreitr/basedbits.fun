export const BBitsCheckInABI = [
    [{
        "inputs": [{
            "internalType": "address",
            "name": "_initialCollection",
            "type": "address"
        }, {"internalType": "address", "name": "_initialOwner", "type": "address"}],
        "stateMutability": "nonpayable",
        "type": "constructor"
    }, {"inputs": [], "name": "EnforcedPause", "type": "error"}, {
        "inputs": [],
        "name": "ExpectedPause",
        "type": "error"
    }, {
        "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
        "name": "OwnableInvalidOwner",
        "type": "error"
    }, {
        "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
    }, {
        "anonymous": false,
        "inputs": [{"indexed": true, "internalType": "address", "name": "sender", "type": "address"}, {
            "indexed": false,
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
        }, {"indexed": false, "internalType": "uint16", "name": "streak", "type": "uint16"}, {
            "indexed": false,
            "internalType": "uint16",
            "name": "totalCheckIns",
            "type": "uint16"
        }],
        "name": "CheckIn",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{"indexed": true, "internalType": "address", "name": "collectionAddress", "type": "address"}],
        "name": "CollectionAdded",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{"indexed": true, "internalType": "address", "name": "collectionAddress", "type": "address"}],
        "name": "CollectionRemoved",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
        }, {"indexed": true, "internalType": "address", "name": "newOwner", "type": "address"}],
        "name": "OwnershipTransferred",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{"indexed": false, "internalType": "address", "name": "account", "type": "address"}],
        "name": "Paused",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{"indexed": false, "internalType": "address", "name": "account", "type": "address"}],
        "name": "Unpaused",
        "type": "event"
    }, {
        "inputs": [{"internalType": "address", "name": "newCollection", "type": "address"}],
        "name": "addCollection",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "inputs": [{"internalType": "address", "name": "_address", "type": "address"}],
        "name": "ban",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "inputs": [{"internalType": "address", "name": "", "type": "address"}],
        "name": "banned",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [{"internalType": "address", "name": "_address", "type": "address"}],
        "name": "canCheckIn",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [],
        "name": "checkIn",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "inputs": [{"internalType": "address", "name": "", "type": "address"}],
        "name": "checkIns",
        "outputs": [{"internalType": "uint256", "name": "lastCheckIn", "type": "uint256"}, {
            "internalType": "uint16",
            "name": "streak",
            "type": "uint16"
        }, {"internalType": "uint16", "name": "count", "type": "uint16"}],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [{"internalType": "address", "name": "", "type": "address"}],
        "name": "collections",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [],
        "name": "getCollections",
        "outputs": [{"internalType": "address[]", "name": "", "type": "address[]"}],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [{"internalType": "address", "name": "_address", "type": "address"}],
        "name": "isBanned",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [{"internalType": "address", "name": "_address", "type": "address"}],
        "name": "isEligible",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [{"internalType": "address", "name": "oldContract", "type": "address"}, {
            "internalType": "address[]",
            "name": "users",
            "type": "address[]"
        }], "name": "migrateOldCheckIns", "outputs": [], "stateMutability": "nonpayable", "type": "function"
    }, {
        "inputs": [],
        "name": "owner",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [],
        "name": "pause",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "inputs": [],
        "name": "paused",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [{"internalType": "address", "name": "existingCollection", "type": "address"}],
        "name": "removeCollection",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "inputs": [{"internalType": "address", "name": "newOwner", "type": "address"}],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "inputs": [{"internalType": "address", "name": "_address", "type": "address"}],
        "name": "unban",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }, {"inputs": [], "name": "unpause", "outputs": [], "stateMutability": "nonpayable", "type": "function"}]
];
