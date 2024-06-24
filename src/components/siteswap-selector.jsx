'use client'
import { useState} from 'react';

export default function SiteswapSelector({clickHandler, getRandom}) {

    const [input, setInput] = useState("534")
    const asyncExamples = ["534", "12345", "441", "3", "4", "5", "6", "7", "744", "633", "1357", "51", "17", "53", "423", "525", "50505", "5551", "7131", "561", "4453", "612", "73", "312", "531", "61616", "663", "5241", "5313", "5524", "7333", "7571", "45141", "52512", "56414"];
    const syncExamples = ["(2x,4x)", "(4,2x)(2x,4)", "(4,4)", "(4,4)(4x,0)(4,4)(0,4x)", "(4,6x)(2x,4)", "(4x,2x)", "(4x,2x)(4,2x)(2x,4x)(2x,4)", "(4x,4x)", "(4x,6)(6,4x)", "(6,4x)(4x,2)", "(6x,2x)", "(6x,2x)(2x,6x)", "(6x,4)(4,2x)(4,6x)(2x,4)", "(6x,4)(4,6x)", "(6x,4x)", "(6x,6x)(2x,2x)", "(2x,2x)", "(8,2x)(4,2x)(2x,8)(2x,4)"];
    const multiplexExamples = ["[54]24", "[43]1421", "4[43]1", "[32]", "[43]23", "[43][32]3", "[31]", "(2,4)([4x4],2x)", "(2,4x)([4x4],2)", "(2,6)([6x6],2x)(6x,2x)"];
    const examples = asyncExamples.concat(syncExamples, multiplexExamples);

    function getRandomSiteswap() {
        const randomSiteswap = examples[Math.floor(Math.random()*examples.length)];
        setInput(randomSiteswap);
    }

    return <div className="flex flex-row items-center justify-content m-2">
            <input value={input} placeholder={"534"} className="w-full p-2 h-10 bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-md" onChange={(event) => setInput(event.target.value)}/>
            <button className='bg-blue-400 text-lg text-black w-full p-2 rounded-lg ml-5' onClick={() => clickHandler(input)}>Go!</button>
            <button className='bg-red-400 text-lg text-black w-full p-2 rounded-lg ml-5' onClick={getRandomSiteswap}>Random Siteswap</button>
        </div>
}