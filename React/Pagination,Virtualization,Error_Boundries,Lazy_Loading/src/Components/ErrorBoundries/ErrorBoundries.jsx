import ErrorComponent from './ErrorComponent';
import ErrorBoundries_Main from './ErrorBoundries_Main';

//Remove the comments of data and put data=null in comments then the error will be gone
function ErrorBoundries() {
    // const data = {
    //     name: 'Raghavendra',
    //     age: 26,
    //     location: 'home',
    // }

    //If Null the page will be blank and we need to handle it using Error Boundries.
    const data = null;
    return <>
        <h1 style={{ margin: '2rem', textAlign: 'center' }}>Errors Handling</h1>
        <div style={{ display: 'flex', justifyContent: 'center', height: '100vh' }}>
            {/* We can provide component in fallback for better Error Displaying */}
            <ErrorBoundries_Main fallback="Error While Displaying Data">
                <ErrorComponent data={data} />
            </ErrorBoundries_Main>
        </div>
    </>
}

export default ErrorBoundries;