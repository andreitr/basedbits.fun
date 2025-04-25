"use client"

import { useReadContract } from 'wagmi';

const BASEPAINT_CONTRACT_ADDRESS = '0xba5e05cb26b78eda3a2f8e3b3814726305dcac83';

/**
 * Hook to fetch the current day value from BasePaint contract
 */
export const useBasePaintDay = () => {
    const { data: today, isLoading, isError, error } = useReadContract({
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

    return {
        today,
        isLoading,
        isError,
        error
    };
};
