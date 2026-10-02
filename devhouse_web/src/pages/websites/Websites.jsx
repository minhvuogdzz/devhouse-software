import './websites.css'
import { Detailproject, Search } from '../../components'
import { Showproject } from '../../container'
import { useParams } from 'react-router-dom'
import { projects } from '../../data/projects'

const Websites = () => {
  const { id } = useParams()

  const isWebsite = (project) => project.type === 'Website'

  const websiteProjects = projects.filter(isWebsite)
  const filteredProject = projects.find((p) => p.id === id && p.type === 'Website')

  return (
    <div className='dh__detailproject section__padding'>
      <div className="dh__container">
        <Search />

        {id && filteredProject ? (
          <>
            <Detailproject project={filteredProject} />
            <h2 className="dh__projects-title">Các website khác </h2>
            <p className="dh__text dh__projects-subtitle">Full Source code</p>
            <Showproject data={websiteProjects.filter(p => p.id !== id)} />
          </>
        ) : (
          <>
            <h2 className="dh__projects-title">Dự án Website</h2>
            <p className="dh__text dh__projects-subtitle">Full Source code Website chất lượng</p>
            <Showproject data={websiteProjects} />
          </>
        )}
      </div>
    </div>
  )
}

export default Websites

