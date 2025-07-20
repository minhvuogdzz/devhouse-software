import './search.css';
import { FaSearch } from 'react-icons/fa';
import { useState } from 'react';

const TAGS = [
  { label: "Web Project", value: "Website" },
  { label: "Unity Game", value: "Game" },
  { label: "Cloud", value: "Cloud" },
];

const Search = ({ onSearch, onTag }) => {
  const [input, setInput] = useState('');

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(input);
  };

  const handleTagClick = (tag) => {
    setInput('');
    if (onTag) onTag(tag);
  };

  return (
    <div className="search-container">
      <form className="search-bar" onSubmit={handleSearch}>
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={input}
          onChange={handleInputChange}
        />
        <button className="search-button" type="submit">Tìm kiếm</button>
      </form>

      <div className="tags">
        {TAGS.map(tag => (
          <div
            className="tag"
            key={tag.value}
            onClick={() => handleTagClick(tag.value)}
          >
            {tag.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Search;
