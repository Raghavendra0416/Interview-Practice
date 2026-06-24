import './App.css';
import Pagination from './Components/Pagination/Pagination';
import Virtualization from './Components/Virtualization/Virtualization.jsx';
import WithoutVirtualization from './Components/Virtualization/withoutVirtualization/WithoutVirtualization';
import TanStack from './Components/Virtualization/TanStack/TanStack.jsx';

function App() {
  return (
    <>
      {/* Pagination:
      <div className="container">
        <h1>Pagination</h1>
        <p>Practice For Interview</p>
      </div>
      <hr className="divider" />
      <Pagination /> */}

      {/* <Virtualization /> */}
      <div className="container">
        <h1>Virtualization</h1>
        <p>Practice For Interview</p>
      </div>
      <hr className="divider" />
      {/* <Virtualization /> */}
      {/* <WithoutVirtualization /> */}
      <TanStack />
    </>
  )
}

export default App
