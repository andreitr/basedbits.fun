export const BBitsRaffleABI = [
    {
        "inputs": [{"internalType": "address", "name": "_owner", "type": "address"}, {
            "internalType": "contract IERC721",
            "name": "_collection",
            "type": "address"
        }, {"internalType": "contract IBBitsCheckIn", "name": "_checkIn", "type": "address"}],
        "stateMutability": "nonpayable",
        "type": "constructor"
    }, {"inputs": [], "name": "AlreadyEnteredRaffle", "type": "error"}, {
        "inputs": [],
        "name": "DepositZero",
        "type": "error"
    }, {"inputs": [], "name": "EnforcedPause", "type": "error"}, {
        "inputs": [],
        "name": "ExpectedPause",
        "type": "error"
    }, {"inputs": [], "name": "IndexOutOfBounds", "type": "error"}, {
        "inputs": [],
        "name": "MustPayAntiBotFee",
        "type": "error"
    }, {"inputs": [], "name": "NoBasedBitsToRaffle", "type": "error"}, {
        "inputs": [],
        "name": "NotEligibleForFreeEntry",
        "type": "error"
    }, {
        "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
        "name": "OwnableInvalidOwner",
        "type": "error"
    }, {
        "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
        "name": "OwnableUnauthorizedAccount",
        "type": "error"
    }, {"inputs": [], "name": "RaffleExpired", "type": "error"}, {
        "inputs": [],
        "name": "RaffleOnGoing",
        "type": "error"
    }, {"inputs": [], "name": "ReentrancyGuardReentrantCall", "type": "error"}, {
        "inputs": [],
        "name": "SeedMustBeReset",
        "type": "error"
    }, {"inputs": [], "name": "TransferFailed", "type": "error"}, {
        "inputs": [],
        "name": "WrongStatus",
        "type": "error"
    }, {
        "anonymous": false,
        "inputs": [{
            "indexed": false,
            "internalType": "address",
            "name": "_sponsor",
            "type": "address"
        }, {"indexed": false, "internalType": "uint256", "name": "_tokenId", "type": "uint256"}],
        "name": "BasedBitsDeposited",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{"indexed": false, "internalType": "uint256", "name": "_raffleId", "type": "uint256"}],
        "name": "NewRaffleStarted",
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
        "inputs": [{
            "indexed": false,
            "internalType": "uint256",
            "name": "_raffleId",
            "type": "uint256"
        }, {"indexed": false, "internalType": "address", "name": "_user", "type": "address"}],
        "name": "RaffleEntered",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{
            "indexed": false,
            "internalType": "uint256",
            "name": "_raffleId",
            "type": "uint256"
        }, {"indexed": false, "internalType": "address", "name": "_winner", "type": "address"}, {
            "indexed": false,
            "internalType": "uint256",
            "name": "_tokenId",
            "type": "uint256"
        }],
        "name": "RaffleSettled",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{
            "indexed": false,
            "internalType": "uint256",
            "name": "_raffleId",
            "type": "uint256"
        }, {"indexed": false, "internalType": "uint256", "name": "_seed", "type": "uint256"}],
        "name": "RandomSeedSet",
        "type": "event"
    }, {
        "anonymous": false,
        "inputs": [{"indexed": false, "internalType": "address", "name": "account", "type": "address"}],
        "name": "Unpaused",
        "type": "event"
    }, {
        "inputs": [],
        "name": "antiBotFee",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [],
        "name": "checkIn",
        "outputs": [{"internalType": "contract IBBitsCheckIn", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [],
        "name": "collection",
        "outputs": [{"internalType": "contract IERC721", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [],
        "name": "count",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [{"internalType": "uint256[]", "name": "_tokenIds", "type": "uint256[]"}],
        "name": "depositBasedBits",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "inputs": [],
        "name": "duration",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [],
        "name": "getCurrentRaffleId",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [{"internalType": "uint256", "name": "_raffleId", "type": "uint256"}, {
            "internalType": "uint256",
            "name": "_index",
            "type": "uint256"
        }],
        "name": "getRaffleEntryByIndex",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [{"internalType": "uint256", "name": "_raffleId", "type": "uint256"}],
        "name": "getRaffleEntryNumber",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}, {
            "internalType": "address",
            "name": "",
            "type": "address"
        }],
        "name": "hasEnteredRaffle",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "name": "idToRaffle",
        "outputs": [{"internalType": "uint256", "name": "startedAt", "type": "uint256"}, {
            "internalType": "uint256",
            "name": "settledAt",
            "type": "uint256"
        }, {"internalType": "address", "name": "winner", "type": "address"}, {
            "components": [{
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }, {"internalType": "address", "name": "sponsor", "type": "address"}],
            "internalType": "struct IBBitsRaffle.SponsoredPrize",
            "name": "sponsoredPrize",
            "type": "tuple"
        }],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
        "name": "isEligibleForFreeEntry",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [],
        "name": "newFreeEntry",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "inputs": [],
        "name": "newPaidEntry",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    }, {
        "inputs": [],
        "name": "owner",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [],
        "name": "paused",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "name": "prizes",
        "outputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}, {
            "internalType": "address",
            "name": "sponsor",
            "type": "address"
        }],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "name": "raffleFreeEntryCount",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "inputs": [],
        "name": "returnDeposits",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "inputs": [{"internalType": "uint256", "name": "_newFee", "type": "uint256"}],
        "name": "setAntiBotFee",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "inputs": [{"internalType": "uint256", "name": "_newDuration", "type": "uint256"}],
        "name": "setDuration",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "inputs": [{"internalType": "bool", "name": "_setPaused", "type": "bool"}],
        "name": "setPaused",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "inputs": [],
        "name": "setRandomSeed",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    }, {
        "inputs": [],
        "name": "settleRaffle",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "inputs": [],
        "name": "startNextRaffle",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }, {
        "inputs": [],
        "name": "status",
        "outputs": [{"internalType": "enum IBBitsRaffle.RaffleStatus", "name": "", "type": "uint8"}],
        "stateMutability": "view",
        "type": "function"
    }, {
        "inputs": [{"internalType": "address", "name": "newOwner", "type": "address"}],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }, {"stateMutability": "payable", "type": "receive"}
]