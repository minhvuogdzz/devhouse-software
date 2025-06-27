import './search.css';
import { FaSearch } from 'react-icons/fa';

const Search = () => {
  return (
    <div className="search-container">
      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input type="text" placeholder="Tìm kiếm..." />
        <button className="search-button">Tìm kiếm</button>
      </div>

      <div className="tags">
        <div className="tag">Web Project</div>
        <div className="tag">Unity Game</div>
        <div className="tag">Cloud</div>
      </div>
    </div>
  );
};

export default Search;
