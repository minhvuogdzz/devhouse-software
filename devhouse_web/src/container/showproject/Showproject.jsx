import './showproject.css'
import { projects } from '../../data/projects'
import { Card } from '../../components'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'

const Showproject = ({ searchTerm = '', searchTag = '' }) => {
  const location = useLocation();
  const path = location.pathname;

  const typeFilter = path.includes('games') ? 'Game'
                   : path.includes('websites') ? 'Website'
                   : null;

  let filteredProjects = projects;

  // Lọc theo type trên URL
  if (typeFilter) {
    filteredProjects = filteredProjects.filter(project => project.type === typeFilter);
  }

  // Lọc theo tag (ưu tiên tag nếu có)
  if (searchTag) {
    filteredProjects = filteredProjects.filter(project =>
      project.type.toLowerCase().includes(searchTag.toLowerCase())
    );
  }

  // Lọc theo từ khóa (nếu có và không có tag)
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredProjects = filteredProjects.filter(project =>
      project.title.toLowerCase().includes(term) ||
      project.tech.toLowerCase().includes(term) ||
      project.type.toLowerCase().includes(term) ||
      (project.description && project.description.toLowerCase().includes(term)) ||
      (project.description_sub && project.description_sub.toLowerCase().includes(term))
    );
  }

  const itemsPerPage = 9;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const currentProjects = filteredProjects.slice(start, start + itemsPerPage);

  // Reset page về 1 khi search/filter thay đổi
  // eslint-disable-next-line
  useState(() => { setCurrentPage(1); }, [searchTerm, searchTag, typeFilter]);

  return (
    <>
      <div className="dh__projects-cards">
        {currentProjects.map((project) => (
          <Card key={project.id} {...project} />
        ))}
      </div>

      <div className="dh__projects-pagination">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={currentPage === index + 1 ? "active" : ""}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </>
  )
}

export default Showproject
