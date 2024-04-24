import {createConfig, http} from '@wagmi/core'
import {base, mainnet} from '@wagmi/core/chains'
import {walletConnect} from '@wagmi/connectors'

export const wagmiConfig = createConfig({
    chains: [mainnet, base],
    connectors: [
        walletConnect({
            projectId: '3fcc6bba6f1de962d911bb5b5c3dba68',
        }),
    ],
    transports: {
        [mainnet.id]: http(),
        [base.id]: http(),
    },
})