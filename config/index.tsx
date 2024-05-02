import {defaultWagmiConfig} from '@web3modal/wagmi/react/config'

import {cookieStorage, createStorage} from 'wagmi'
import {base} from 'wagmi/chains'

// Project id configured via https://cloud.walletconnect.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

if (!projectId) throw new Error('Project ID is not defined')

const metadata = {
    name: 'BasedBits',
    description: '8000 Based Bits causing byte-sized mischief on the BASE chain.',
    url: 'https://basedbits.fun',
    icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [base] as const;

export const config = defaultWagmiConfig({
    chains,
    projectId,
    metadata,
    ssr: true,
    storage: createStorage({
        storage: cookieStorage
    }),
})