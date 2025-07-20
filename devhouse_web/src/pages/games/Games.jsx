import './games.css'
import { Detailproject } from '../../components'
import { Search } from '../../components'
import { Showproject } from '../../container'
import { useParams } from 'react-router-dom'
import { projects } from '../../data/projects'

const Games = () => {
  const { id } = useParams();

  const isGame = (project) => project.type === 'Game';

  const gameProjects = projects.filter(isGame);
  const filteredProject = projects.find((p) => p.id === id && p.type === 'Game');

  return (
    <div className='dh__detailproject section__padding'>
      <div className="dh__container">
        <Search />

        {id && filteredProject ? (
          <>
            <Detailproject />
            <h2 className="dh__projects-title">Các games khác </h2>
            <p className="dh__text dh__projects-subtitle">Full Source code</p>
            <Showproject data={gameProjects.filter(p => p.id !== id)} />
          </>
        ) : (
          <>
            <h2 className="dh__projects-title">Dự án Game</h2>
            <p className="dh__text dh__projects-subtitle">Full Source code Game chất lượng</p>
            <Showproject data={gameProjects} />
          </>
        )}
      </div>
    </div>
  )
}

export default Games;
