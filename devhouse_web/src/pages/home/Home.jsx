import './home.css'
import hero_bg from '../../assets/home/hero_bg.png'
import { Search } from '../../components'

const Home = () => {
  return (
    <div className='dh__home section__padding'>
      <div className="dh__container">
        <section className="dh__home--hero">
          <div className="dh__home--hero_content">
            <h1 className="dh-hero-title gradient__text">Chào mừng bạn đến với The Dev House</h1>
            <p className="dh-hero-subtitle">Cung cấp giải pháp công nghệ hàng đầu, triển khai phát triển trang web, Unity game, deploy hạ tầng cloud chất lượng cao </p>
            <Search />
          </div>
          <div className="dh__home--hero_img">
            <img src={hero_bg} alt="hero_bg" />
          </div>
        </section>
        <div className="dh__home--projects">
          projects
        </div>
      </div>
    </div>
  )
}

export default Home