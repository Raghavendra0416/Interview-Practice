import style from './ErrorComponent.module.css';

export default function ErrorComponent({ data }) {
    if (!data) {
        throw new Error('something went Wrong')
    }
    return <div className={style.container}>
        <div className={style.textboxes}>
            <span>Name: {data.name}</span>
        </div>

        <div className={style.textboxes}>
            <span>Age: {data.age} years</span>
        </div>

        <div className={style.textboxes}>
            <span>Location: {data.location}</span>
        </div>
    </div>
}