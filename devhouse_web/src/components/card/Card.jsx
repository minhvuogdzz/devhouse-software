import './card.css'
import { Link } from 'react-router-dom';
const Card = ({ id, title, image, description_sub, tech, type }) => {
  return (
    <div className="dh__card">
      <img src={image} alt={title} />
      <div className="dh__card-content">
        <h3 className="dh__card-title">{title} <span>Thể loại: {type}</span> </h3>
        <p className='dh__card-tech'>{tech}</p>
        <p className="dh__card-description dh__text">{description_sub}</p>
        <Link to={`/${type.toLowerCase()}s/${id}`} className="dh__card-link">
          Chi tiết
        </Link>

      </div>
    </div>
  )
}

export default Card