import './home.css'
import hero_bg from '../../assets/home/hero_bg.png'
import new_img from '../../assets/new-icon.png'
import { Search } from '../../components'
import { Showproject } from '../../container'
import { useState } from 'react'


const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTag, setSearchTag] = useState('');
  const [showBanner, setShowBanner] = useState(true);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setSearchTag('');
  };

  const handleTag = (tag) => {
    setSearchTag(tag);
    setSearchTerm('');
  };

  const handleContact = () => {
    window.location.href = '#';
  };

  return (
    <div className='dh__home section__padding'>
      {showBanner && (
        <div className="dh__banner-overlay">
          <div className="dh__banner-square">
            <button className="dh__banner-close" onClick={() => setShowBanner(false)}>×</button>
            <img src={hero_bg} alt="Đặt project" className="dh__banner-img" />
            <div className="dh__banner-content">
              <span>The Dev House Shop</span>
              <button className="dh__banner-contact" onClick={handleContact}>Đặt Project theo yêu cầu</button>
            </div>
          </div>
        </div>
      )}
      <div className="dh__container" style={showBanner ? { filter: 'blur(2px)', pointerEvents: 'none', userSelect: 'none' } : {}}>
        <section className="dh__home--hero">
          <div className="dh__home--hero_content">
            <h1 className="dh-hero-title gradient__text">Chào mừng bạn đến với The Dev House</h1>
            <p className="dh-hero-subtitle">Cung cấp giải pháp công nghệ hàng đầu, triển khai phát triển trang web, Unity game, deploy hạ tầng cloud chất lượng cao </p>
            <Search onSearch={handleSearch} onTag={handleTag} />
          </div>
          <div className="dh__home--hero_img">
            <img src={hero_bg} alt="hero_bg" />
          </div>
        </section>
        <div className="dh__home--projects">
          <h2 className="dh__projects-title">Hot nhất <span className="dh__new" ><img src={new_img} alt="new" /></span></h2>
          <p className="dh__text dh__projects-subtitle">Full Source code</p>
          <Showproject searchTerm={searchTerm} searchTag={searchTag}/>
        </div>
      </div>
    </div>
  )
}

export default Home