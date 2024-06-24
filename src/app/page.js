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
        <Juggler dimension={width} inputSiteswap={siteswap} LHoutsideThrows={settings.LHoutsideThrows} RHoutsideThrows={settings.RHoutsideThrows} showTwosAsHolds={settings.twoAsHolds} beatLength={settings.beatLength} gravity={settings.gravity}/>
      </div>
      <SiteswapSelector clickHandler={(input) => setSiteswap(input)}/>
      <Settings updateHandler={(settingsInput) => {setSettings(settingsInput); console.log("??")}} currentSettings={settings}/>
    </div>
    
  );
}
