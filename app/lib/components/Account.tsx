"use client";
import {useAccount, useConnect, useDisconnect, useEnsAvatar, useEnsName} from 'wagmi'
import {injected} from "@wagmi/connectors";

export function Account() {

    const {address, isConnected, connector} = useAccount()
    const {connect, connectors} = useConnect()
    const {disconnect} = useDisconnect()
    const {data: ensName} = useEnsName({address})
    const {data: ensAvatar} = useEnsAvatar({name: ensName!})

    if (isConnected) {
        return <div>
            {ensAvatar && <img alt="ENS Avatar" src={ensAvatar}/>}
            {address && <div>{ensName ? `${ensName} (${address})` : address}</div>}
            <button onClick={() => disconnect()}>Disconnect</button>
        </div>
    }

    return <button onClick={() => connect({connector: injected()})}>Connect Wallet</button>
}
