import './aboutus.css'
import aboutus_bg from '../../assets/aboutus/aboutus_bg.jpg'
import hai_img from '../../assets/aboutus/hai.jpg'
import vuong_img from '../../assets/aboutus/vuong.jpg'
import lam_img from '../../assets/aboutus/lam.jpg'
import long_img from '../../assets/aboutus/long.jpg'
import tronganh_img from '../../assets/aboutus/tronganh.jpg'
import viet_img from '../../assets/aboutus/viet.jpg'

const teamMembers = [
  {
    name: "Hai Luu Cong",
    role: "CIO & Co-Founder",
    image: hai_img,
    color: "blue",
    description: "Chuyên phát triển frontend & backend với React, Node.js và MongoDB.",
    socials: {
      facebook: "https://facebook.com/nguyenvana",
      twitter: "https://twitter.com/nguyenvana",
      linkedin: "https://linkedin.com/in/nguyenvana"
    }
  },
  {
    name: "Vuong Duong Minh",
    role: "CEO & Founder",
    image: vuong_img,
    color: "gray",
    description: "Chuyên phát triển frontend & backend với React, Node.js và MongoDB.",
    socials: {
      facebook: "https://facebook.com/tranthib",
      twitter: "https://twitter.com/tranthib",
      linkedin: "https://linkedin.com/in/tranthib"
    }
  },
  {
    name: "Lam Nguyen Thanh",
    role: "CTO & Co-Founder",
    image: lam_img,
    color: "orange",
    description: "Triển khai và tối ưu hệ thống trên nền tảng AWS, GCP, Azure.",
    socials: {
      facebook: "https://facebook.com/levanc",
      twitter: "https://twitter.com/levanc",
      linkedin: "https://linkedin.com/in/levanc"
    }
  },
  {
    name: "Long Duong Van",
    role: "CMO & CHRO",
    image: long_img,
    color: "green",
    description: "Editor và đảm bảo truyền thông cho công ty trên các nền tảng MXH",
    socials: {
      facebook: "https://facebook.com/phamthid",
      twitter: "https://twitter.com/phamthid",
      linkedin: "https://linkedin.com/in/phamthid"
    }
  },
  {
    name: "Trong Anh Nguyen",
    role: "CIO & Co-Founder",
    image: tronganh_img,
    color: "purple",
    description: "Game Unity Developer, chuyên phát triển game độ phức tạp cao",
    socials: {
      facebook: "https://facebook.com/dominhe",
      twitter: "https://twitter.com/dominhe",
      linkedin: "https://linkedin.com/in/dominhe"
    }
  },
  {
    name: "Viet Nguyen Duc",
    role: "CPO",
    image: viet_img,
    color: "pink",
    description: "Game Unity Developer, chuyên phát triển game độ phức tạp cao",
    socials: {
      facebook: "https://facebook.com/vuthif",
      twitter: "https://twitter.com/vuthif",
      linkedin: "https://linkedin.com/in/vuthif"
    }
  }
];


const AboutUs = () => {
  return (
    <div className='dh__aboutus section__padding'>
      <div className="dh__container">
        <section className="dh__aboutus--general">
          <div class="left-section">
                <div class="section-content">
                    <h2 class="dh__title gradient__text section-title">Về chúng tôi</h2>
                    <p class="dh__text" >Chúng tôi là đội ngũ cung cấp giải pháp công nghệ hàng đầu, chuyên triển khai và phát triển các trang web, trò chơi Unity, cũng như triển khai hạ tầng cloud chất lượng cao. Với tinh thần năng động và đổi mới, chúng tôi cam kết mang đến những giải pháp vượt trội giúp khách hàng đạt được thành công bền vững.</p>
                    <p class="dh__text" >Sự tận tâm với chất lượng và sự hài lòng của khách hàng đã giúp chúng tôi trở thành đối tác đáng tin cậy. Chúng tôi luôn đặt sự minh bạch, uy tín và hiệu quả làm nền tảng cho mọi mối quan hệ hợp tác lâu dài.</p>
                </div>

                <div class="section-content">
                    <h3 class="subsection-title">Tổng quan về công ty</h3>
                    <p class="dh__text" >Được thành lập với tầm nhìn đổi mới cách doanh nghiệp vận hành, chúng tôi tập trung cung cấp các giải pháp sáng tạo giúp đơn giản hóa quy trình và nâng cao hiệu suất làm việc. Cách tiếp cận đa lĩnh vực của chúng tôi đảm bảo mang đến sự hỗ trợ toàn diện trong mọi khía cạnh hoạt động của khách hàng.</p>
                </div>
            </div>

            <div class="right-section">
                <div class="profile-container">
                    <img src={aboutus_bg} alt="Company Representative"/>
                </div>
            </div>
        </section>
        <section className="dh__aboutus--team">
          <div className="dh__aboutus--team_title">
            <h2 className='dh__title gradient__text'>Đội ngũ của The Dev House</h2>
          </div>
          <div className="dh__aboutus--team_members">
            {teamMembers.map((member, index) => (
              <div className="profile-card" key={index}>
                <div className={`card-header ${member.color}`}>
                  <div className="name">{member.name}</div>
                  <div className="role">{member.role}</div>
                  <img src={member.image} alt={member.name} className="profile-image" />
                </div>
                <div className="card-body">
                  <p className="dh__text">
                    {member.description}
                  </p>
                  <div className="social-icons">
                    <a href={member.socials.facebook} target="_blank" rel="noopener noreferrer" className="social-icon facebook">f</a>
                    <a href={member.socials.twitter} target="_blank" rel="noopener noreferrer" className="social-icon twitter">t</a>
                    <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer" className="social-icon linkedin">in</a>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </section>
      </div>
    </div>
  )
}

export default AboutUs