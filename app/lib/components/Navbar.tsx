import {Account} from "@/app/lib/components/Account";

export const Navbar = () => {
    return <div className="flex flex-row justify-between py-5">
        <div>basedbits.fun</div>
        <Account/>
    </div>
}