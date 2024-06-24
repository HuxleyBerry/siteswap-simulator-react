'use client'
import { useState } from 'react';

export default function SiteswapSelector({clickHandler}) {

    const [input, setInput] = useState('')

    return <div className="flex flex-row items-center justify-content m-2">
            <input placeholder={"534"} className="w-full p-2 h-10 bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-md" onChange={(event) => setInput(event.target.value)}/>
            <button className='bg-blue-400 text-lg text-black w-full p-2 rounded-lg ml-5' onClick={() => clickHandler(input)}>Select Siteswap!</button>
        </div>
}