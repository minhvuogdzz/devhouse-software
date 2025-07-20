// import './detailproject.css';
// import { Search } from '../../components'
// import logo from '../../assets/logo.png'
// import review_star from '../../assets/review_star.png'
// import { Gallery } from '../../components';
// import { Showproject } from '../../container';

// const Detailproject = () => {
  
//   return (
//     <>
//         <div class="breadcrumb">
//         <div class="container">
//             <p>Trang chủ</p>
//             <p class="separator">⮕</p>
//             <p>Game</p>
//             <p class="separator">⮕</p>
//             <p class="current">Clash of Clans</p>
//         </div>
//         </div>

//         <div class="main">
//             <div class="container">
//                 <div class="content-grid">
//                     <div class="left-column">
//                         <Gallery />
                        
//                         <div class="author-card">
//                             <div class="author-info">
//                                 <div class="author-left">
//                                     <div class="author-avatar">
//                                         <img src={logo} alt="Author"/>
//                                     </div>
//                                     <div class="author-details">
//                                         <h3>Được phát triển bởi đội ngũ The Dev House</h3>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         <div class="tabs">
//                             <div class="tab-buttons">
//                                 <button class="tab-btn active" data-tab="description">Mô tả chi tiết</button>
//                             </div>
//                             <div class="tab-content">
//                                 <div class="tab-pane active" id="description">
//                                     <p>MVD SmartWorld là một template website hiện đại được xây dựng với HTML5, Bootstrap CSS và JavaScript. Thiết kế responsive, tối ưu cho mọi thiết bị và trình duyệt.</p>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     <div class="sidebar">
//                         <div class="project-card">
//                             <div class="project-badge">MÃ PROJECT 001</div>
//                             <h1 class="project-title">MVD SmartWorld Thế giới di động-HTML, Bootstrap CSS, Javascripts</h1>
//                             <div class="project-rating">
//                                 <span class="rating-count"><img src={review_star} alt="" width={100} height={20} /></span>
//                             </div>
//                             <p class="project-description">
//                                 MVD SmartWorld, được xây dựng với HTML, Bootstrap CSS & Javascript. Thiết kế tinh tế, hiệu năng cao, dễ dàng tùy biến để phù hợp với mọi cá nhân/doanh nghiệp. Tương thích mọi thiết bị, tối ưu SE
//                             </p>
                            
//                             <div class="project-details">
//                                 <div class="detail-row">
//                                     <span class="detail-label">Thể loại</span>
//                                     <span class="detail-value red">Website</span>
//                                 </div>
//                                 <div class="detail-row">
//                                     <span class="detail-label">Loại file</span>
//                                     <span class="detail-value">Full source code</span>
//                                 </div>
//                             </div>

//                             <div class="alerts">
//                                 <div class="alert-item">
//                                     <i class="fas fa-exclamation-triangle"></i>
//                                     <span>Gửi thông báo lỗi</span>
//                                 </div>
//                                 <div class="alert-item">
//                                     <i class="fas fa-exclamation-triangle"></i>
//                                     <span>Báo cáo vi phạm bản quyền</span>
//                                 </div>
//                             </div>

//                             <div class="commitment-box">
//                                 <div class="commitment-title">CAM KẾT TỪ CHÚNG TÔI</div>
//                                 <div class="commitment-item">
//                                     <i class="fas fa-check-circle"></i>
//                                     <span>Hỗ trợ cài đặt đầy đủ, nhiệt tình</span>
//                                 </div>
//                                 <div class="commitment-item">
//                                     <i class="fas fa-check-circle"></i>
//                                     <span>Cam kết code đầy đủ giống demo</span>
//                                 </div>
//                             </div>

//                             <div class="action-buttons">
//                                 <button class="btn btn-success">Đặt project ngay</button>
//                             </div>
//                         </div>

                        
//                     </div>
//                 </div>
//             </div>
//         </div>
//     </>
    
//   )
// }

// export default Detailproject



import './detailproject.css';
import logo from '../../assets/logo.png';
import review_star from '../../assets/review_star.png';
import { Gallery } from '../../components';
import { useParams } from 'react-router-dom';
import { projects } from '../../data/projects';
import { useState } from 'react';

const Detailproject = () => {
  const { id } = useParams();
  const project = projects.find(p => p.id === id);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState(0);

  if (!project) return <p className="dh__text">Không tìm thấy project.</p>;

  const handleDemoClick = () => {
    if (project.type === 'Game' && project.demoLinks && project.demoLinks.length > 0) {
      setShowDemoModal(true);
      setSelectedDemo(0);
    } else if (project.type === 'Website' && project.demoLinks && project.demoLinks.length > 0) {
      window.open(project.demoLinks[0], '_blank');
    }
  };

  return (
    <>
      <div className="breadcrumb">
        <div className="container">
          <p>Trang chủ</p>
          <p className="separator">⮕</p>
          <p>{project.type}</p>
          <p className="separator">⮕</p>
          <p className="current">{project.title}</p>
        </div>
      </div>

      <div className="main">
        <div className="container">
          <div className="content-grid">
            <div className="left-column">
              <Gallery images={project.gallery} />

              <div className="author-card">
                <div className="author-info">
                  <div className="author-left">
                    <div className="author-avatar">
                      <img src={logo} alt="Author" />
                    </div>
                    <div className="author-details">
                      <h3>Được phát triển bởi đội ngũ The Dev House</h3>
                    </div>
                  </div>
                </div>
              </div>

              <div className="tabs">
                <div className="tab-buttons">
                  <button className="tab-btn active">Mô tả chi tiết</button>
                </div>
                <div className="tab-content">
                  <div className="tab-pane active" id="description">
                    <p>{project.description}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="sidebar">
              <div className="project-card">
                <div className="project-badge">MÃ PROJECT {project.id}</div>
                <h1 className="project-title">{project.title}</h1>
                <div className="project-rating">
                  <span className="rating-count">
                    <img src={review_star} alt="star" width={100} height={20} />
                  </span>
                </div>
                <p className="project-description">{project.description_sub}</p>

                <div className="project-details">
                  <div className="detail-row">
                    <span className="detail-label">Thể loại</span>
                    <span className="detail-value red">{project.type}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Loại file</span>
                    <span className="detail-value">Full source code</span>
                  </div>
                </div>

                <div className="alerts">
                  <div className="alert-item">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>Gửi thông báo lỗi</span>
                  </div>
                  <div className="alert-item">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>Báo cáo vi phạm bản quyền</span>
                  </div>
                </div>

                <div className="commitment-box">
                  <div className="commitment-title">CAM KẾT TỪ CHÚNG TÔI</div>
                  <div className="commitment-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Hỗ trợ cài đặt đầy đủ, nhiệt tình</span>
                  </div>
                  <div className="commitment-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Cam kết code đầy đủ giống demo</span>
                  </div>
                </div>

                <div className="action-buttons">
                  <button className="btn btn-success">Đặt project ngay</button>
                  {project.demoLinks && project.demoLinks.length > 0 && (
                    <button
                      className="btn btn-demo"
                      style={{ marginLeft: 12 }}
                      onClick={handleDemoClick}
                    >
                      Xem demo Project
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal demo cho Game */}
      {showDemoModal && project.type === 'Game' && (
        <div className="dh__demo-modal-overlay" onClick={() => setShowDemoModal(false)}>
          <div className="dh__demo-modal dh__demo-modal-portrait" onClick={e => e.stopPropagation()}>
            <button className="dh__demo-modal-close" onClick={() => setShowDemoModal(false)}>×</button>
            <h3 style={{marginBottom: 12}}>Demo Game</h3>
            {project.demoLinks.length > 1 && (
              <div className="dh__demo-links">
                {project.demoLinks.map((link, idx) => (
                  <button
                    key={link}
                    className={`dh__demo-link-btn${selectedDemo === idx ? ' active' : ''}`}
                    onClick={() => setSelectedDemo(idx)}
                  >
                    Server {idx + 1}
                  </button>
                ))}
              </div>
            )}
            <div
              className={
                project.orientation === 'landscape'
                  ? 'dh__demo-iframe-wrap-landscape'
                  : 'dh__demo-iframe-wrap-portrait'
              }
            >
              <iframe
                src={project.demoLinks[selectedDemo]}
                title={`Demo ${project.title}`}
                frameBorder="0"
                allowFullScreen
                className={
                  project.orientation === 'landscape'
                    ? 'dh__demo-iframe-landscape'
                    : 'dh__demo-iframe-portrait'
                }
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Detailproject;
