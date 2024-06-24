'use client'
import "./globals.css";
import Juggler from '../components/juggler';
import SiteswapSelector from "../components/siteswap-selector";
import Settings from "@/components/settings";
import { useEffect, useState } from 'react';

export default function Home() {
  const [siteswap, setSiteswap] = useState("534");
  const [width, setWidth] = useState(100);
  const [settings, setSettings] = useState({twoAsHolds: false, LHoutsideThrows: false, RHoutsideThrows: false, gravity: 0.0008, beatLength: 300})

  useEffect(() => {
    const width = parseFloat(window.screen.width);
    if (width < 616){
      setWidth(width - 20);
    } else {
      setWidth(600);
    }
  }, [])

  return (
    <div className="flex flex-row items-center justify-center flex-wrap">
      <div className="mb-4 px-2">
        <p className="text-3xl my-5 text-center">Siteswap Simulator</p>
        <Juggler dimension={width} inputSiteswap={siteswap} LHoutsideThrows={settings.LHoutsideThrows} RHoutsideThrows={settings.RHoutsideThrows} showTwosAsHolds={settings.twoAsHolds} beatLength={settings.beatLength} gravity={settings.gravity}/>
        <SiteswapSelector clickHandler={input => setSiteswap(input)}/>
          <p className="underline text-blue-600 text-center"><a href="https://en.wikipedia.org/wiki/Siteswap" target="_blank">Explanation</a></p>
      </div>
      <Settings updateHandler={settingsInput => setSettings(settingsInput)} currentSettings={settings}/>
    </div>
    
  );
}
