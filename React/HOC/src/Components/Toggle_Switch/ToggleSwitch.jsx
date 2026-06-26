import React from 'react';
import './ToggleSwitch.css';

//The below is called Lifting State Up
const ToggleSwitch = ({ isToggled, onToggle }) => {
    return (
        <label className="toggle-switch">
            <input
                type="checkbox"
                checked={isToggled}
                onChange={onToggle}
            />
            <span className="slider"></span>
        </label>
    );
};

export default ToggleSwitch;