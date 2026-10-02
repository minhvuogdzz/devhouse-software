import './navbar.css'
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react"
import logo from "../../assets/logo.png"

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation() // 👈 Lấy route hiện tại

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Game", path: "/games" },
    { name: "Website", path: "/websites" },
    { name: "Service", path: "/services" },
    { name: "Post", path: "/post" },
    { name: "AboutUs", path: "/about" },
  ]

  return (
    <nav className="navbar section__padding">
      <div className="navbar-container dh__container">
        <div className="navbar-logo">
          <Link to="/" onClick={closeMobileMenu}>
            <img src={logo} alt="Devhouse logo" className="logo-icon" />
          </Link>
        </div>

        <ul className="navbar-menu">
          {navItems.map((item, index) => (
            <li key={index} className={`navbar-item ${location.pathname === item.path ? "active" : ""}`}>
              <Link to={item.path} className="navbar-link">
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        <button
          className={`navbar-toggle ${isMobileMenuOpen ? "active" : ""}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={closeMobileMenu}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <ul className="mobile-nav-list">
              {navItems.map((item, index) => (
                <li key={index} className={`mobile-nav-item ${location.pathname === item.path ? "active" : ""}`}>
                  <Link to={item.path} className="mobile-nav-link" onClick={closeMobileMenu}>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
