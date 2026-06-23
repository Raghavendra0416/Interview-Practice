import { useState, useRef, useEffect } from 'react';

const ALL_CARS = ['Volvo', 'Saab', 'Mercedes', 'Audi', 'BMW', 'Toyota', 'Honda', 'Ford', 'Tesla'];

export default function Rough() {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selected, setSelected] = useState([]);
    const containerRef = useRef(null);
    const searchRef = useRef(null);

    const filtered = ALL_CARS.filter(car =>
        car.toLowerCase().includes(searchTerm.toLowerCase())
    );

    function toggleItem(car) {
        setSelected(prev =>
            prev.includes(car) ? prev.filter(c => c !== car) : [...prev, car]
        );
    }

    function removeItem(car, e) {
        e.stopPropagation(); // don't open dropdown when removing a tag
        setSelected(prev => prev.filter(c => c !== car));
    }

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen) searchRef.current?.focus();
    }, [isOpen]);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} style={{ position: 'relative', width: '300px' }}>

            {/* Trigger box — shows selected tags + toggle arrow */}
            <div onClick={() => setIsOpen(prev => !prev)} style={{ cursor: 'pointer', border: '1px solid #ccc', padding: '6px', minHeight: '36px', display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                {selected.length === 0 && <span style={{ color: '#999' }}>Select cars...</span>}
                {selected.map(car => (
                    <span key={car} style={{ background: '#e0e0e0', padding: '2px 6px', borderRadius: '4px', fontSize: '13px' }}>
                        {car}
                        <button onMouseDown={e => removeItem(car, e)} style={{ marginLeft: '4px', cursor: 'pointer', border: 'none', background: 'none' }}>×</button>
                    </span>
                ))}
                <span style={{ marginLeft: 'auto' }}>{isOpen ? '▲' : '▼'}</span>
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, border: '1px solid #ccc', background: 'white', zIndex: 10 }}>

                    {/* Search input INSIDE the dropdown */}
                    <div style={{ padding: '6px' }}>
                        <input
                            ref={searchRef}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Type to search..."
                            style={{ width: '100%', boxSizing: 'border-box', padding: '4px' }}
                        />
                    </div>

                    {/* Options list with checkboxes */}
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxHeight: '200px', overflowY: 'auto' }}>
                        {filtered.length > 0 ? (
                            filtered.map(car => (
                                <li
                                    key={car}
                                    onMouseDown={() => toggleItem(car)}
                                    style={{ padding: '8px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', background: selected.includes(car) ? '#f0f0ff' : 'white' }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(car)}
                                        onChange={() => toggleItem(car)}
                                    />
                                    {car}
                                </li>
                            ))
                        ) : (
                            <li style={{ padding: '8px 10px', color: '#999' }}>No results</li>
                        )}
                    </ul>

                </div>
            )}

        </div>
    );
}