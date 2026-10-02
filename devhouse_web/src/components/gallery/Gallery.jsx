// import './Gallery.css';
// import React, { useState } from 'react';
// import { Swiper, SwiperSlide } from 'swiper/react';
// import { FreeMode, Navigation, Thumbs } from 'swiper/modules';
// import 'swiper/css';
// import 'swiper/css/free-mode';
// import 'swiper/css/navigation';
// import 'swiper/css/thumbs';

// // Ảnh demo
// import a1 from '../../assets/games/a1.png';
// import a2 from '../../assets/games/a2.png';
// import a3 from '../../assets/games/a3.png';
// import a4 from '../../assets/games/a4.png';
// import a5 from '../../assets/games/a5.png';

// const images = [a1, a2, a3, a4, a5, a1, a2, a3, a4, a5];

// const Gallery = () => {
//   const [thumbsSwiper, setThumbsSwiper] = useState(null);

//   return (
//     <div className="gallery-wrapper">
//       {/* Slider lớn */}
//       <Swiper
//         loop={true}
//         spaceBetween={10}
//         navigation={true}
//         thumbs={{ swiper: thumbsSwiper }}
//         modules={[FreeMode, Navigation, Thumbs]}
//         className="main-swiper"
//         centeredSlides={true}
//         slidesPerView={1} // để thấy cả 2 bên
//         slideToClickedSlide={true}
//       >
//         {images.map((img, i) => (
//           <SwiperSlide key={i}>
//             <img src={img} alt={`Slide ${i}`} />
//           </SwiperSlide>
//         ))}
//       </Swiper>

//       {/* Thumbnail bên dưới */}
//       <Swiper
//         onSwiper={setThumbsSwiper}
//         spaceBetween={10}
//         slidesPerView={10}
//         freeMode={true}
//         watchSlidesProgress={true}
//         modules={[FreeMode, Navigation, Thumbs]}
//         className="thumbs-swiper"
//       >
//         {images.map((img, i) => (
//           <SwiperSlide key={i}>
//             <img src={img} alt={`Thumb ${i}`} />
//           </SwiperSlide>
//         ))}
//       </Swiper>
//     </div>
//   );
// };

// export default Gallery;


// src/components/Gallery.jsx
import './gallery.css';
import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

const Gallery = ({ images }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  if (!images || images.length === 0) return null;

  return (
    <div className="gallery-wrapper">
      {/* Slider lớn */}
      <Swiper
        loop={true}
        spaceBetween={10}
        navigation={true}
        thumbs={{ swiper: thumbsSwiper }}
        modules={[FreeMode, Navigation, Thumbs]}
        className="main-swiper"
        centeredSlides={true}
        slidesPerView={1}
        slideToClickedSlide={true}
      >
        {images.map((img, i) => (
          <SwiperSlide key={i}>
            <img src={img} alt={`Slide ${i}`} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Thumbnails */}
      <Swiper
        onSwiper={setThumbsSwiper}
        spaceBetween={10}
        slidesPerView={10}
        freeMode={true}
        watchSlidesProgress={true}
        modules={[FreeMode, Navigation, Thumbs]}
        className="thumbs-swiper"
      >
        {images.map((img, i) => (
          <SwiperSlide key={i}>
            <img src={img} alt={`Thumb ${i}`} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Gallery;
