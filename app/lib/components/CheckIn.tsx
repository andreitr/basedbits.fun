import {useWriteContract} from "wagmi";
import {abi} from "@/app/lib/abi/basedbits.abi";

export const CheckInButton = () => {

    const {data: hash, isPending, writeContract} = useWriteContract()

    const checkIn = () => {
        writeContract({
            abi: abi,
            address: '0x7822465cD6F5A553F464F82ADA1b2ea33bCB2634',
            functionName: 'checkIn'
        })
    }


    return <div>
        <button onClick={checkIn}
                disabled={isPending}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            {isPending ? "Check In" : "Checking In..."}
        </button>
    </div>
}