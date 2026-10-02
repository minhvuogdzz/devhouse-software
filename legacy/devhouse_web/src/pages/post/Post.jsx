import './post.css'; // Đảm bảo bạn đã tạo file CSS phù hợp

const PostItem = ({ avatar, author, date, title, tags, excerpt, views, comments, likes, score }) => (
  <article className="post-item">
    <img src={avatar} alt={author} className="post-avatar" />
    <div className="post-content">
      <div className="post-meta">
        <strong>{author}</strong> • {date}
      </div>
      <a href="#" className="post-title">{title}</a>
      <div className="post-tags">
        {tags.map((tag, i) => (
          <a href="#" className="tag" key={i}>{tag}</a>
        ))}
      </div>
      <div className="post-excerpt" dangerouslySetInnerHTML={{ __html: excerpt }} />
      <div className="post-stats">
        <span className="stat-item"><i className="fas fa-eye"></i> {views}</span>
        <span className="stat-item"><i className="fas fa-comment"></i> {comments}</span>
        <span className="stat-item"><i className="fas fa-heart"></i> {likes}</span>
        <span className="stat-item post-score"><i className="fas fa-arrow-up"></i> {score}</span>
      </div>
    </div>
  </article>
);

const Post = () => {
  const posts = [
    {
      avatar: 'https://scontent.fhan14-2.fna.fbcdn.net/v/t39.30808-6/482082931_658458463207916_6320238276736592048_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=M-vdMJDfGw8Q7kNvwEN9Pjc&_nc_oc=AdlAITZ2Y7dHmVTSVmFcleUm7qeCOX-78_6J_1eYmt1Pxp6pFy7nZqylwNr-494xAwY&_nc_zt=23&_nc_ht=scontent.fhan14-2.fna&_nc_gid=XXy2szzbGliIBxGYfFMJdA&oh=00_AfMu745R3njDMfhwVC-0Tq57iA9omo3NKbwahf9ZRAjxdg&oe=686A91A5',
      author: 'Son Dao Thai',
      date: 'thg 5 30, 2021 10:58 CH',
      title: 'Tại sao trong tương lai Kubernetes lại không sử dụng Docker nữa ?',
      tags: ['Ruby', 'Docker', 'Kubernetes', 'PHP'],
      excerpt: 'chỉ cần sử dụng tới 1 thành phần duy nhất là Container Runtime trong Docker... ',
      views: '5.2K',
      comments: 13,
      likes: 7,
      score: 36
    },
    {
      avatar: 'https://scontent.fhan14-2.fna.fbcdn.net/v/t39.30808-6/482082931_658458463207916_6320238276736592048_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=M-vdMJDfGw8Q7kNvwEN9Pjc&_nc_oc=AdlAITZ2Y7dHmVTSVmFcleUm7qeCOX-78_6J_1eYmt1Pxp6pFy7nZqylwNr-494xAwY&_nc_zt=23&_nc_ht=scontent.fhan14-2.fna&_nc_gid=XXy2szzbGliIBxGYfFMJdA&oh=00_AfMu745R3njDMfhwVC-0Tq57iA9omo3NKbwahf9ZRAjxdg&oe=686A91A5',
      author: 'Kien Le',
      date: 'thg 5 28, 2021 11:02 CH',
      title: '[Kubernetes] - Hướng dẫn cài đặt Private Docker Registry trên Kubernetes (Dev House)',
      tags: ['Dev House', 'Docker Registry', 'Kubernetes', 'Private Docker Registry'],
      excerpt: 'Triển khai dưới dạng nodeport service tạo thêm yaml file với nội dung sau... ',
      views: '2.6K',
      comments: 3,
      likes: 0,
      score: 5
    },
    {
      avatar: 'https://scontent.fhan14-2.fna.fbcdn.net/v/t39.30808-6/482082931_658458463207916_6320238276736592048_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=M-vdMJDfGw8Q7kNvwEN9Pjc&_nc_oc=AdlAITZ2Y7dHmVTSVmFcleUm7qeCOX-78_6J_1eYmt1Pxp6pFy7nZqylwNr-494xAwY&_nc_zt=23&_nc_ht=scontent.fhan14-2.fna&_nc_gid=XXy2szzbGliIBxGYfFMJdA&oh=00_AfMu745R3njDMfhwVC-0Tq57iA9omo3NKbwahf9ZRAjxdg&oe=686A91A5',
      author: 'Mai Trung Duc',
      date: 'thg 10 2, 2022 5:28 CH',
      title: 'Kubernetes gửi lời chào 👋 ContentCreator',
      tags: ['Dev House', 'Kubernetes'],
      excerpt: 'Copy Right <strong>Dev House</strong><br>Cập nhật gần nhất: 26/10/2024',
      views: '4.2K',
      comments: 17,
      likes: 11,
      score: 59
    }
  ];

  return (
    <div>
      {/* <header className="header">
        <div className="header-content">
          <a href="#" className="logo">VIBLO</a>
          <nav>
            <ul className="nav-menu">
              <li><a href="#" className="active">Bài Viết</a></li>
              <li><a href="#">Hỏi Đáp <span className="red-dot"></span></a></li>
              <li><a href="#">Thảo Luận</a></li>
            </ul>
          </nav>
          <div className="search-container">
            <input type="text" className="search-input" placeholder="Tìm kiếm..." defaultValue="Dev House" />
            <button className="search-btn"><i className="fas fa-search"></i></button>
          </div>
          <div className="user-actions">
            <div className="notification-icon"><i className="fas fa-bell"></i><span className="notification-badge">1</span></div>
            <div className="notification-icon"><i className="fas fa-edit"></i></div>
            <div className="notification-icon"><i className="fas fa-fire" style={{ color: '#ff6b35' }}></i></div>
            <span style={{ color: '#dc3545', fontWeight: 'bold' }}>VI</span>
            <div className="notification-icon"><i className="fas fa-th"></i></div>
            <img src="/placeholder.svg?height=32&width=32" alt="User Avatar" className="user-avatar" />
          </div>
        </div>
      </header> */}

      <div className="main-container">
        <main className="content-area">
          <div className="search-header">
            <div className="search-info">
              <span className="search-term">Dev House</span>
              <button className="search-button"><i className="fas fa-search"></i> Tìm kiếm</button>
            </div>
            <div className="filter-tabs">
              <a href="#" className="filter-tab active">Bài viết</a>
              <a href="#" className="filter-tab">Câu hỏi</a>
              <a href="#" className="filter-tab">Tác giả</a>
            </div>
          </div>

          <div className="sort-info">
            <span>Sắp xếp theo: <strong>Phù hợp nhất</strong> <i className="fas fa-chevron-down"></i></span>
            <span><strong>297</strong> kết quả</span>
          </div>

          <div className="posts-list">
            {posts.map((post, index) => (
              <PostItem key={index} {...post} />
            ))}
          </div>
        </main>

        <aside className="sidebar">
          <h3 className="sidebar-title">CÚ PHÁP TÌM KIẾM</h3>
          <div className="search-help">
            {[
              ['title:Git', 'Bao gồm "Git" trong tiêu đề'],
              ['body:Ruby', 'Bao gồm "Ruby" trong nội dung'],
              ['code:function', 'Bao gồm "function" trong code'],
              ['tag:Rails', 'Có chứa thẻ "Rails"'],
              ['user:name', 'Được tạo bởi người dùng "name"']
            ].map(([term, desc], i) => (
              <div className="search-help-item" key={i}>
                <span className="search-help-term">{term}</span><br />
                {desc}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Post;