"use client";

import Image from "next/image";
import {MyStreak} from "@/app/lib/components/MyStreak";
import {gql, GraphQLClient} from "graphql-request";
import {useQuery} from "@tanstack/react-query";


const graphQLClient = new GraphQLClient(process.env.NEXT_PUBLIC_RAILWAY!);


export const CheckIn = () => {

    const {data, isFetching} = useQuery({
        queryKey: ['checkins'],
        queryFn: async () => {
            return await graphQLClient.request(gql`query checkins {  checkIns(    orderBy: "timestamp"    orderDirection: "desc"  ) {    items {      address      timestamp    }  }}`);
        }
    });

    console.log(data?.checkIns.length);

    return (
        <div className="flex flex-col justify-evenly mt-8 sm:flex-row">
            <Image
                className="w-auto max-w-72 m-auto sm:m-0"
                src="/images/developer.png"
                alt="Are you here?"
                width={250}
                height={250}
                priority={true}
            />

            <div className="flex flex-col justify-center mt-8 sm:mt-0 sm:ml-4">
                <div className="text-5xl font-semibold text-[#363E36] mb-4">
                    Are you here?
                </div>
                <div className="text-[#677467]">
                    <p>Based Bits holder - check-in to the home base!</p>
                </div>

                <div className="mt-8">
                    <MyStreak/>
                </div>
            </div>
        </div>
    );
};
