import { useState } from 'react'
// import { useForm } from 'react-hook-form'
import './form-playground.css'
import PracticeForm from './PracticeForm';


function FormPlayground() {
    const [mode, setMode] = useState('onSubmit');

    return (
        <div className="fp-page">
            <h1>RHF Playground</h1>

            <div className="fp-mode-select">
                <label htmlFor="mode">Validation mode: </label>
                <select id="mode" value={mode} onChange={(e) => setMode(e.target.value)}>
                    <option value="onSubmit">onSubmit</option>
                    <option value="onBlur">onBlur</option>
                    <option value="onChange">onChange</option>
                    <option value="all">all</option>
                </select>
                <p className="fp-hint">Switching mode remounts the form (fresh state) so you can compare behavior.</p>
            </div>

            {/* key={mode} forces a remount so useForm re-initializes with the new mode */}
            <PracticeForm key={mode} mode={mode} />
        </div>
    );
}

export default FormPlayground;