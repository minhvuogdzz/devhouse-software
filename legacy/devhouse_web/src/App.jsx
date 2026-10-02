import './App.css'
import { Home, Websites, Games, Services, AboutUs} from './pages'
import { Navbar, Foot, ScrollToTop} from './components'
import { Outlet } from "react-router-dom";


function App() {

  
  return (
    <>
      <Navbar />
      <ScrollToTop />
      <Outlet />
      <Foot />
      {/* <button className="floating-order-btn">
        Đặt PROJECT theo yêu cầu
      </button> */}
    </>
  )
}

export default App
