"use client"

import { useReadContract } from 'wagmi';

const BASEPAINT_CONTRACT_ADDRESS = '0xBa5e05cb26b78eDa3A2f8e3b3814726305dcAc83';

export const BasePaint = () => {

    const { data: tokenId, isLoading } = useReadContract({
        abi: [{
            "inputs": [],
            "name": "today",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }],
        address: BASEPAINT_CONTRACT_ADDRESS as `0x${string}`,
        functionName: "today",

    });

    console.log("TOKEN ID", tokenId);


};
