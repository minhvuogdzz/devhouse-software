import './services.css'
import service_bg from '../../assets/service/service_bg.png'

const Services = () => {
  return (
    <div className='dh__services section__padding'>
      <div className="dh__container">
        
        <section class="dh__service-content">
          <div class="dh__service-header">
            <h2 className='dh__title gradient__text'>Dịch vụ của chúng tôi</h2>
            <p class="dh__text">Chúng tôi cung cấp các giải pháp công nghệ toàn diện từ phát triển website, game đến triển khai hạ tầng máy chủ chuyên nghiệp.</p>
          </div>

          <div class="dh__service-items">
            <div class="dh__service-item">
              <div class="dh__service-icon">🌐</div>
              <h3>Phát triển ứng dụng web</h3>
              <ul class="dh__service-checklist dh__text">
                <li>Thiết kế UI/UX chuẩn responsive</li>
                <li>Phát triển API & backend (Node.js, Laravel)</li>
                <li>Tích hợp MongoDB, MySQL, PostgreSQL</li>
                <li>Tối ưu SEO, bảo mật</li>
                <li>Sử dụng: ReactJS, Next.js, Express, Vue.js</li>
              </ul>
            </div>

            <div class="dh__service-item">
              <div class="dh__service-icon">🎮</div>
              <h3>Phát triển game Unity</h3>
              <ul class="dh__service-checklist dh__text">
                <li>Xây dựng gameplay 2D/3D</li>
                <li>Tối ưu hiệu suất Unity</li>
                <li>Tích hợp quảng cáo, Firebase, IAP</li>
                <li>Build cho Android, iOS, PC, WebGL</li>
                <li>Xuất bản lên Google Play / App Store</li>
              </ul>
            </div>

            <div class="dh__service-item">
              <div class="dh__service-icon">☁️</div>
              <h3>Triển khai VPS / Cloud</h3>
              <ul class="dh__service-checklist dh__text">
                <li>Cài đặt Nginx, PM2, Docker</li>
                <li>Triển khai lên VPS, AWS, Vercel</li>
                <li>Cấu hình SSL, HTTPS</li>
                <li>Thiết lập CI/CD qua GitHub</li>
                <li>Giám sát, backup, bảo mật máy chủ</li>
              </ul>
            </div>
          </div>
        
        </section>
        <section class="dh__service-review">
          <div class="dh__review-header">
            <h2 class="dh__title gradient__text">Đánh giá từ khách hàng</h2>
            <p class="dh__text">Chúng tôi tự hào được đồng hành cùng hàng trăm khách hàng và nhận được nhiều phản hồi tích cực.</p>
          </div>

          <div class="dh__reviews">
            <div class="dh__review-card">
              <p class="dh__review-text dh__text">“Dịch vụ nhanh chóng, hỗ trợ tận tình. Website của tôi đã hoạt động ổn định chỉ sau 2 ngày triển khai!”</p>
              <p class="dh__review-author">— Nguyễn Văn A, Chủ shop thời trang</p>
            </div>
            <div class="dh__review-card">
              <p class="dh__review-text dh__text">“Game Unity được phát triển cực mượt, tối ưu hiệu suất tốt và đội ngũ hỗ trợ fix bug rất nhanh.”</p>
              <p class="dh__review-author">— Trần Thị B, Nhà phát hành game indie</p>
            </div>
            <div class="dh__review-card">
              <p class="dh__review-text dh__text">“Tôi không rành kỹ thuật, nhưng đội ngũ đã triển khai VPS và bảo trì định kỳ giúp tôi rất an tâm.”</p>
              <p class="dh__review-author">— Lê Minh C, Chủ doanh nghiệp nhỏ</p>
            </div>
            <div class="dh__review-card">
              <p class="dh__review-text dh__text">“Hệ thống CRM của công ty tôi giờ hoạt động ổn định, truy cập nhanh và có HTTPS đầy đủ.”</p>
              <p class="dh__review-author">— Phạm Hoàng D, CTO công ty bất động sản</p>
            </div>
          </div>
        </section>  
        <section class="dh__service-contact">
          <div class="dh__contact-form">
            <h2>Đăng ký nhận tư vấn ngay</h2>
            <p>Liên hệ đường dây nóng để được hỗ trợ sớm nhất</p>
            <a href="tel:1900636682" class="dh__hotline-btn">📞 0369017983</a>
            <hr />
            <p>Để lại thông tin liên lạc để nhân viên tư vấn có thể liên hệ lại với bạn</p>
            <form>
              <input type="text" placeholder="Họ và tên" required />
              <input type="tel" placeholder="Số điện thoại" required />
              <button type="submit" class="dh__submit-btn">📤 Gửi thông tin</button>
            </form>
          </div>

          <div class="dh__contact-image">
            <img src={service_bg} alt="Company Representative"/>
          </div>
        </section>
      
      </div>
    </div>
  )
}

export default Services