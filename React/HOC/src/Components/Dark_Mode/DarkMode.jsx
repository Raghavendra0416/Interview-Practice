export default function DarkMode(Component, isToggled) {
    //Dark Mode
    const style = {
        background: 'black',
        color: 'white'
    }
    return (props) => {
        if (isToggled) {
            return <div style={style}><Component {...props} /></div>
        }
        return <div><Component {...props} /></div>
    }
} 