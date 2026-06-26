import ComponentA from "./ComponentA";
import DarkMode from "./Dark_Mode/DarkMode";
import ToggleSwitch from "./Toggle_Switch/ToggleSwitch";
import { useState } from 'react';


function HOC() {
    // 1. State is now managed in the parent
    const [isToggled, setIsToggled] = useState(false);

    // 2. The parent defines how to update the state
    const handleToggle = () => {
        setIsToggled(!isToggled);
    }

    //HOC is updated here
    const UpdatedHOC = DarkMode(ComponentA, isToggled);
    return <>
        <UpdatedHOC />
        {/* 3. The parent passes the state and the updater function as props */}
        <ToggleSwitch isToggled={isToggled} onToggle={handleToggle} />
        <span style={{ marginLeft: '20px' }}>Dark Mode Toggle</span>
    </>
}

export default HOC;