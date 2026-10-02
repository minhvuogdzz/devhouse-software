import a1 from '../assets/games/a1.png'
import a2 from '../assets/games/a2.png'
import a3 from '../assets/games/a3.png'  
import a4 from '../assets/games/a4.png'
import a5 from '../assets/games/a5.png'
import a6 from '../assets/games/a6.png'
import a7 from '../assets/games/a7.png'
import a8 from '../assets/games/a8.png'
import a9 from '../assets/games/a9.png'
import a10 from '../assets/games/a10.png'
import a11 from '../assets/games/a11.png'
import a12 from '../assets/games/a12.png'
import a13 from '../assets/games/a13.png'
import a14 from '../assets/games/a14.png'
import a15 from '../assets/games/a15.png'

export const projects = [
  {
    id: "001",
    title: "League of Legends",
    tech: "React, SCSS",
    type: "Game",
    image: a1,
    description_sub: "Giao diện người dùng hiện đại sử dụng React kết hợp với SCSS cho hiệu ứng mượt mà.",
    description: "League of Legends là một trò chơi MOBA đỉnh cao, nơi người chơi phối hợp chiến thuật và kỹ năng cá nhân để đối đầu trong các trận chiến khốc liệt. Giao diện được phát triển bằng React giúp phản hồi nhanh, trong khi SCSS mang lại trải nghiệm thị giác mượt mà.",
    gallery: [a1, a1, a1, a1, a1, a1, a1, a1, a1, a1],
    demoLinks: [
      "https://thedevhouse.shop/g1-tripletile/",
      "https://thedevhouse.shop/g1-tripletile/"
    ],
    orientation: "portrait",
  },
  {
    id: "002",
    title: "Valorant",
    tech: "Vue, TypeScript",
    type: "Game",
    image: a2,
    description_sub: "Ứng dụng sử dụng Vue để điều khiển giao diện cùng TypeScript để đảm bảo tính ổn định.",
    description: "Valorant là trò chơi bắn súng chiến thuật với lối chơi nhịp độ nhanh, nơi mỗi nhân vật đều sở hữu kỹ năng riêng biệt. Giao diện được thiết kế với Vue và TypeScript giúp giữ hiệu suất cao và dễ bảo trì.",
    gallery: [a2, a2, a2, a2, a2, a2, a2, a2, a2, a2],
    demoLinks: [
      "https://demo-server1.valorantgame.com",
      "https://demo-server2.valorantgame.com"
    ],
    orientation: "landscape",
  },
  {
    id: "003",
    title: "Genshin Impact",
    tech: "HTML, CSS, Vanilla JS",
    type: "Game",
    image: a3,
    description_sub: "Thiết kế thuần túy với HTML, CSS và JavaScript giúp tối ưu hiệu năng và tính tương thích.",
    description: "Genshin Impact là một thế giới mở rộng lớn với đồ họa tuyệt đẹp và hệ thống nguyên tố độc đáo. Website trình bày nội dung một cách tối giản nhưng hiệu quả nhờ sử dụng HTML, CSS và JavaScript cơ bản.",
    gallery: [a3, a3, a3, a3, a3, a3, a3, a3, a3, a3],
    demoLinks: [
      "https://demo-server1.genshinimpact.com",
      "https://demo-server2.genshinimpact.com"
    ],
    orientation: "portrait",
  },
  {
    id: "004",
    title: "Call of Duty: Warzone",
    tech: "React, Tailwind CSS",
    type: "Game",
    image: a4,
    description_sub: "React giúp xây dựng UI động, Tailwind hỗ trợ thiết kế utility-first nhất quán.",
    description: "Warzone là tựa game bắn súng sinh tồn với bản đồ rộng lớn và lối chơi nhanh. Giao diện web sử dụng React để cập nhật thông tin tức thời, kết hợp Tailwind CSS giúp dễ dàng duy trì cấu trúc và phong cách thiết kế.",
    gallery: [a4, a4, a4, a4, a4, a4, a4, a4, a4, a4],
    demoLinks: [
      "https://demo-server1.codmw.com",
      "https://demo-server2.codmw.com"
    ],
    orientation: "landscape",
  },
  {
    id: "005",
    title: "Minecraft",
    tech: "Three.js, WebGL",
    type: "Game",
    image: a5,
    description_sub: "Hiển thị đồ họa 3D trong trình duyệt bằng Three.js và WebGL.",
    description: "Minecraft là trò chơi sandbox khuyến khích sự sáng tạo và khám phá. Website sử dụng Three.js kết hợp WebGL để trình diễn bản đồ và đối tượng 3D tương tác ngay trong trình duyệt.",
    gallery: [a5, a5, a5, a5, a5, a5, a5, a5, a5, a5],
    demoLinks: [
      "https://demo-server1.minecraft.net",
      "https://demo-server2.minecraft.net"
    ],
    orientation: "portrait",
  },
  {
    id: "006",
    title: "Fortnite",
    tech: "Next.js, Styled Components",
    type: "Game",
    image: a6,
    description_sub: "Tối ưu SEO với Next.js và viết CSS hiệu quả bằng Styled Components.",
    description: "Fortnite là một trò chơi battle royale nổi bật với phong cách hoạt hình và các sự kiện trực tuyến. Website sử dụng Next.js để tối ưu hiệu suất tải trang và Styled Components để xây dựng giao diện linh hoạt.",
    gallery: [a6, a6, a6, a6, a6, a6, a6, a6, a6, a6],
    demoLinks: [
      "https://demo-server1.fortnite.com",
      "https://demo-server2.fortnite.com"
    ],
    orientation: "landscape",
  },
  {
    id: "007",
    title: "Roblox",
    tech: "React, Firebase",
    type: "Game",
    image: a7,
    description_sub: "Realtime data với Firebase, UI bằng React giúp cập nhật nhanh chóng.",
    description: "Roblox là nền tảng trò chơi nơi người dùng có thể tạo và chia sẻ game. Giao diện web được đồng bộ dữ liệu thời gian thực với Firebase, và phần frontend sử dụng React để tối ưu trải nghiệm.",
    gallery: [a7, a7, a7, a7, a7, a7, a7, a7, a7, a7],
    demoLinks: [
      "https://demo-server1.roblox.com",
      "https://demo-server2.roblox.com"
    ],
    orientation: "portrait",
  },
  {
    id: "008",
    title: "PUBG",
    tech: "Angular, SCSS",
    type: "Game",
    image: a8,
    description_sub: "Angular cho SPA mạnh mẽ, SCSS giúp tổ chức code CSS tốt hơn.",
    description: "PUBG là tựa game bắn súng sinh tồn nổi tiếng với bản đồ rộng và gameplay chiến thuật. Website dùng Angular để tạo ứng dụng một trang (SPA) hiện đại, đồng thời tổ chức style bằng SCSS rõ ràng hơn.",
    gallery: [a8, a8, a8, a8, a8, a8, a8, a8, a8, a8],
    demoLinks: [
      "https://demo-server1.pubg.com",
      "https://demo-server2.pubg.com"
    ],
    orientation: "landscape",
  },
  {
    id: "009",
    title: "Elden Ring",
    tech: "React, Bootstrap",
    type: "Game",
    image: a9,
    description_sub: "Kết hợp Bootstrap và React tạo layout nhất quán và linh hoạt.",
    description: "Elden Ring là trò chơi nhập vai thế giới mở với cốt truyện sâu sắc và các trùm mạnh mẽ. Trang web sử dụng Bootstrap để tạo layout nhanh chóng, kết hợp React để xử lý trạng thái động.",
    gallery: [a9, a9, a9, a9, a9, a9, a9, a9, a9, a9],
    demoLinks: [
      "https://demo-server1.eldenring.com",
      "https://demo-server2.eldenring.com"
    ],
    orientation: "portrait",
  },
  {
    id: "010",
    title: "Apex Legends",
    tech: "Vue, Tailwind CSS",
    type: "Game",
    image: a10,
    description_sub: "Kết hợp Vue và Tailwind giúp xây dựng nhanh UI linh hoạt, nhẹ và responsive.",
    description: "Apex Legends là game bắn súng đồng đội với nhân vật đa dạng và di chuyển linh hoạt. Giao diện web được dựng với Vue để phản hồi nhanh, sử dụng Tailwind CSS để đảm bảo giao diện đồng nhất và tối ưu.",
    gallery: [a10, a10, a10, a10, a10, a10, a10, a10, a10, a10],
    demoLinks: [
      "https://demo-server1.apexlegends.com",
      "https://demo-server2.apexlegends.com"
    ],
    orientation: "landscape",
  },
  {
    id: "011",
    title: "Portfolio Developer",
    tech: "React, Sass",
    type: "Website",
    image: a11,
    description_sub: "Giao diện cá nhân dùng React và Sass để tạo hiệu ứng và quản lý style.",
    description: "Website Portfolio dành cho các lập trình viên cá nhân, cung cấp giao diện giới thiệu bản thân, kỹ năng, kinh nghiệm làm việc và các dự án. Thiết kế tối giản và hiện đại với khả năng responsive mượt mà trên mọi thiết bị.",
    gallery: [a11, a11, a11, a11, a11, a11, a11, a11, a11, a11],
    demoLinks: [
      "https://portfolio-demo.devhouse.com"
    ],
  },
  {
    id: "012",
    title: "Ecommerce Shop",
    tech: "Next.js, Tailwind CSS",
    type: "Website",
    image: a12,
    description_sub: "Xây dựng trang thương mại điện tử nhanh với Next.js và giao diện Tailwind.",
    description: "Website thương mại điện tử với chức năng giỏ hàng, tìm kiếm sản phẩm, lọc danh mục, và thanh toán. Hỗ trợ SEO tốt, tốc độ tải nhanh nhờ Next.js và giao diện chuẩn responsive bằng Tailwind.",
    gallery: [a12, a12, a12, a12, a12, a12, a12, a12, a12, a12],
    demoLinks: [
      "https://ecommerce-demo.devhouse.com"
    ],
  },
  {
    id: "013",
    title: "Landing Page Product",
    tech: "HTML, CSS, JS",
    type: "Website",
    image: a13,
    description_sub: "Trang giới thiệu sản phẩm nhẹ, không cần framework.",
    description: "Landing page dành cho một sản phẩm cụ thể với hiệu ứng chuyển động nhẹ nhàng, thiết kế đẹp mắt, cung cấp thông tin, giá cả và đánh giá. Dễ triển khai trên mọi nền tảng nhờ công nghệ thuần.",
    gallery: [a13, a13, a13, a13, a13, a13, a13, a13, a13, a13],
    demoLinks: [
      "https://landingpage-demo.devhouse.com"
    ],
  },
  {
    id: "014",
    title: "Blog Developer",
    tech: "Gatsby, Markdown",
    type: "Website",
    image: a14,
    description_sub: "Blog cá nhân dùng Gatsby tĩnh kết hợp file Markdown dễ viết bài.",
    description: "Blog dành cho developer chia sẻ kiến thức, cập nhật tin tức công nghệ. Gatsby giúp tạo trang nhanh, file Markdown giúp viết nội dung tiện lợi và thân thiện với SEO.",
    gallery: [a14, a14, a14, a14, a14, a14, a14, a14, a14, a14],
    demoLinks: [
      "https://blog-demo.devhouse.com"
    ],
  },
  {
    id: "015",
    title: "Admin Dashboard",
    tech: "React, Ant Design",
    type: "Website",
    image: a15,
    description_sub: "Bảng quản trị dữ liệu động sử dụng React và Ant Design UI.",
    description: "Giao diện quản trị giúp quản lý người dùng, sản phẩm, đơn hàng, báo cáo. Tối ưu hiệu suất với React, sử dụng Ant Design để đảm bảo tính thẩm mỹ và trải nghiệm người dùng tốt.",
    gallery: [a15, a15, a15, a15, a15, a15, a15, a15, a15, a15],
    demoLinks: [
      "https://admin-dashboard-demo.devhouse.com"
    ],
  },
  {
    id: "016",
    title: "Startup Homepage",
    tech: "Vue.js, Vuetify",
    type: "Website",
    image: a1,
    description_sub: "Trang chủ startup nhanh chóng với Vue và Vuetify material design.",
    description: "Website dành cho startup khởi nghiệp, hiển thị thông tin doanh nghiệp, tính năng sản phẩm, testimonial và call-to-action mạnh mẽ. Sử dụng Vue kết hợp Vuetify giúp đồng bộ và dễ phát triển.",
    gallery: [a1, a1, a1, a1, a1, a1, a1, a1, a1, a1],
    demoLinks: [
      "https://startup-homepage-demo.devhouse.com"
    ],
  },
  {
    id: "017",
    title: "Restaurant Menu",
    tech: "Angular, Bootstrap",
    type: "Website",
    image: a2,
    description_sub: "Trang thực đơn nhà hàng xây dựng với Angular và Bootstrap.",
    description: "Giao diện hiển thị thực đơn nhà hàng với danh mục món ăn, hình ảnh, giá cả và đánh giá khách hàng. Angular giúp cập nhật dữ liệu động, Bootstrap đảm bảo responsive hiệu quả.",
    gallery: [a2, a2, a2, a2, a2, a2, a2, a2, a2, a2],
    demoLinks: [
      "https://restaurant-menu-demo.devhouse.com"
    ],
  },
  {
    id: "018",
    title: "Real Estate Listing",
    tech: "Next.js, MongoDB",
    type: "Website",
    image: a3,
    description_sub: "Trang bất động sản với Next.js server-side và dữ liệu MongoDB.",
    description: "Website hiển thị danh sách nhà đất, cho thuê, mua bán. Hỗ trợ tìm kiếm, lọc khu vực, phân loại giá và chi tiết từng bất động sản. Next.js xử lý SSR giúp SEO tốt, MongoDB lưu trữ thông tin hiệu quả.",
    gallery: [a3, a3, a3, a3, a3, a3, a3, a3, a3, a3],
    demoLinks: [
      "https://realestate-listing-demo.devhouse.com"
    ],
  }
];