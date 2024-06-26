'use client'
import { useState} from 'react';
import { parseSiteswap} from '../utils/siteswap-validation'

export default function SiteswapSelector({clickHandler}) {

    const [input, setInput] = useState("")
    const [inputHighlighted, setInputHighlighted] = useState(false);
    const asyncExamples = ["534", "12345", "441", "3", "4", "5", "6", "7", "744", "633", "1357", "51", "17", "53", "423", "525", "50505", "5551", "7131", "561", "4453", "612", "73", "312", "531", "61616", "663", "5241", "5313", "5524", "7333", "7571", "45141", "52512", "56414"];
    const syncExamples = ["(2x,4x)", "(4,2x)(2x,4)", "(4,4)", "(4,4)(4x,0)(4,4)(0,4x)", "(4,6x)(2x,4)", "(4x,2x)", "(4x,2x)(4,2x)(2x,4x)(2x,4)", "(4x,4x)", "(4x,6)(6,4x)", "(6,4x)(4x,2)", "(6x,2x)", "(6x,2x)(2x,6x)", "(6x,4)(4,2x)(4,6x)(2x,4)", "(6x,4)(4,6x)", "(6x,4x)", "(6x,6x)(2x,2x)", "(2x,2x)", "(8,2x)(4,2x)(2x,8)(2x,4)"];
    const multiplexExamples = ["[54]24", "[43]1421", "4[43]1", "[32]", "[43]23", "[43][32]3", "[31]", "(2,4)([4x4],2x)", "(2,4x)([4x4],2)", "(2,6)([6x6],2x)(6x,2x)"];
    const examples = asyncExamples.concat(syncExamples, multiplexExamples);

    function getRandomSiteswap() {
        const randomSiteswap = examples[Math.floor(Math.random()*examples.length)];
        clickHandler(randomSiteswap);
        setInput("");
    }

    function submitInput() {
        clickHandler(input);
        if (parseSiteswap(input).length === 0) {
            setInputHighlighted(true);
        } else {
            setInput("");
        }
    }

    return <div className="flex flex-row items-center justify-content">
            <input value={input} placeholder={"Enter siteswap"} className={`w-full min-w-32 p-2 h-10 bg-gray-50 border ${inputHighlighted ? "outline outline-2 outline-offset-0 outline-red-400" : null} border-gray-300 ${inputHighlighted ? "text-red-400" : "text-gray-900"} text-md rounded-md`} onChange={(event) => setInput(event.target.value)} onClick={() => setInputHighlighted(false)}/>
            <button className='bg-blue-400 text-lg text-black px-4 py-2 rounded-lg mx-2' onClick={submitInput}>Go!</button>
            <button className='bg-zinc-300 text-lg text-black p-2 rounded-lg' onClick={getRandomSiteswap}>Random</button>
        </div>
}