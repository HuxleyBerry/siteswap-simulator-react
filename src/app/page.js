'use client'
import "./globals.css";
import Juggler from '../components/juggler';
import SiteswapSelector from "../components/siteswap-selector";
import { useEffect, useState } from 'react';

export default function Home() {
  const [siteswap, setSiteswap] = useState("534");
  const [width, setWidth] = useState(100);

  useEffect(() => {
    const width = parseFloat(window.screen.width);
    if (width < 610){
      setWidth(width - 10);
    } else {
      setWidth(600);
    }
  }, [])

  return (
    <div className="flex flex-col items-center">
      <p className="text-3xl my-5">Siteswap Simulator</p>
      <div className="pt-0">
        <Juggler dimension={width} inputSiteswap={siteswap} LHoutsideThrows={false} RHoutsideThrows={false} showTwosAsHolds={false} beatLength={300} gravity={0.0008}/>
      </div>
      <SiteswapSelector clickHandler={(input) => setSiteswap(input)}/>
    </div>
    
  );
}
