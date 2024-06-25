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

  function setIdealCanvasWidth() {
    const width = parseFloat(window.innerWidth);
    const height = parseFloat(window.innerHeight);
    if (width < 616 || height < 680){
      setWidth(Math.min(width - 20, height - 80));
    } else {
      setWidth(600);
    }
  }
  
  useEffect(() => {
    setIdealCanvasWidth();
    window.onresize = setIdealCanvasWidth;
  }, [])

  return (
    <div className="flex flex-row items-center justify-center flex-wrap">
      <div className="mb-4 w-min">
        <p className="text-3xl my-5 text-center">Siteswap Simulator</p>
        <Juggler dimension={width} inputSiteswap={siteswap} LHoutsideThrows={settings.LHoutsideThrows} RHoutsideThrows={settings.RHoutsideThrows} showTwosAsHolds={settings.twoAsHolds} beatLength={settings.beatLength} gravity={settings.gravity}/>
        <div className="p-2">
          <SiteswapSelector clickHandler={input => setSiteswap(input)}/>
        </div>
        <p className="underline text-blue-600 text-center"><a href="https://www.jugglingedge.com/help/siteswapnotes.php" target="_blank">Notation Explanation</a></p>
      </div>
      <div className="mx-10">
        <Settings updateHandler={settingsInput => setSettings(settingsInput)} currentSettings={settings}/>
      </div>
      
    </div>
    
  );
}
