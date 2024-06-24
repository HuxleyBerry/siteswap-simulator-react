export default function Settings({ updateHandler, currentSettings }) {
    //updateHandler(settingsInput);

    return <div className="border border-black rounded-md p-4 w-fit h-fit">
        <p className="text-lg text-center">Settings</p>
        <input type="checkbox" onChange={event => updateHandler({ ...currentSettings, twoAsHolds: event.target.checked})}/>
        <label> Show 2&apos;s as holds</label>
        <br />
        <input type="checkbox" onChange={event => updateHandler({ ...currentSettings, LHoutsideThrows: event.target.checked})}/>
        <label> LH outside throws</label>
        <br />
        <input type="checkbox" onChange={event => updateHandler({ ...currentSettings, RHoutsideThrows: event.target.checked})}/>
        <label> RH outside throws</label>
        <br />
        <label className="text-sm font-medium text-gray-900 dark:text-white">Gravity: {(currentSettings.gravity*10000).toFixed(2)}</label>
        <br />
        <input type="range" min="1" max="20" className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer dark:bg-gray-700" onChange={event => updateHandler({ ...currentSettings, gravity: event.target.value/12500})}/>
        <br />
        <label className="text-sm font-medium text-gray-900 dark:text-white">Beat length (milliseconds): {currentSettings.beatLength}</label>
        <br />
        <input type="range" min="1" max="20" className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer dark:bg-gray-700" onChange={event => updateHandler({ ...currentSettings, beatLength: event.target.value*30})}/>
    </div>
}