import { useState } from 'react'

export default function DropDownMultiSelectSearch() {
    const All_Cars = ['Tata', 'Maruti Suzuki', 'Mahindra', 'Tesla', 'Ford', 'Chevrolet'];
    const [isOpen, setIsOpen] = useState(false);
    const [userVal, setUserValue] = useState('');

    const filteredCars = All_Cars.filter(car =>
        car.toLowerCase().includes(userVal.toLowerCase())
    );
    console.log(filteredCars);
    console.log(userVal);

    return (
        <div style={{ border: '1px solid black', width: '150px', height: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                Cars
                {/* DropDown */}
                <span
                    onClick={() => setIsOpen(prev => !prev)}
                    style={{ marginLeft: 'auto', cursor: 'pointer' }}>{isOpen ? '▲' : '▼'}</span>
            </div>

            {isOpen && (
                //List of cars
                <div>
                    <ul style={{ listStyleType: 'none', padding: '0', margin: '0' }}>
                        <li>
                            <input
                                onChange={(e) => setUserValue(e.target.value)}
                                placeholder="Search" />
                        </li>
                        <li>Tata</li>
                    </ul>
                </div>
            )
            }

        </div>
    );
}

{/* List of cars */ }
{/* <div>
    <ul style={{ listStyleType: 'none', padding: '0', margin: '0' }}>
        <li>
            <input placeholder="Search" />
        </li>
        <li>Tata</li>
    </ul>
</div> */}