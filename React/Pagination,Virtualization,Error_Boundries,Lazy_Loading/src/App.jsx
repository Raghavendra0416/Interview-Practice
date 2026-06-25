import './App.css';
import Pagination from './Components/Pagination/Pagination';
import Virtualization from './Components/Virtualization/Virtualization.jsx';
import WithoutVirtualization from './Components/Virtualization/withoutVirtualization/WithoutVirtualization';
import TanStack from './Components/Virtualization/TanStack/TanStack.jsx';
import ErrorBoundries from './Components/ErrorBoundries/ErrorBoundries.jsx';


function App() {
  return (
    <>
      {/* Heading */}
      <div className="container">
        {/* <h1>Pagination</h1> */}
        {/* <h1>Virtualization</h1> */}
        <h1>Error Boundries</h1>
        <p>Practice For Interview</p>
      </div>
      <hr className="divider" />

      {/* ---------Pagination--------- */}
      {/* <Pagination /> */}

      {/* ---------Virtualization------- */}
      {/* <Virtualization />
      <WithoutVirtualization />
      <TanStack /> */}

      {/* --------ErrorBoundries--------- */}
      <ErrorBoundries />
    </>
  )
}

export default App
