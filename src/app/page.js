'use client'
import "./globals.css";
import Juggler from '../components/juggler';
import SiteswapSelector from "../components/siteswap-selector";
import { useState } from 'react';

export default function Home() {
  const [siteswap, setSiteswap] = useState("534");

  return (
    <div className="flex flex-col items-center">
      <Juggler dimension={600} inputSiteswap={siteswap} LHoutsideThrows={false} RHoutsideThrows={false} showTwosAsHolds={false} beatLength={300} gravity={0.0008}/>
      <SiteswapSelector clickHandler={(input) => setSiteswap(input)}/>
    </div>
    
  );
}
