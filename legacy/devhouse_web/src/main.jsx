import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home, Websites, Games, Services, Post, AboutUs} from './pages'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="games" element={<Games />} />
          <Route path="games/:id" element={<Games />} />
          <Route path="websites" element={<Websites />} />
          <Route path="websites/:id" element={<Websites />} />
          <Route path="services" element={<Services />} />
          <Route path="post" element={<Post />} />
          <Route path="about" element={<AboutUs />} />
        </Route>
      </Routes>

    </BrowserRouter>
  </StrictMode>,
)
                                                       
      // <Routes>
      //   <Route path="/" element={<App />}>
      //     <Route index element={<Home />} />
      //     <Route path="games" element={<Games />} />
      //     <Route path="websites" element={<Websites />} />
      //     <Route path="services" element={<Services />} />
      //     <Route path="post" element={<Post />} />
      //     <Route path="about" element={<AboutUs />} />
      //   </Route>
      // </Routes>