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

    return <button onClick={checkIn}
                   disabled={isPending}
                   className="bg-[#303730] hover:bg-[#677467] text-white py-2 px-4 rounded">
        {isPending ? "Checking In..." : "Check In"}
    </button>

}