import React, { useState, useEffect } from 'react';
import { getLabProjects } from './services/labService';
import type { LabProject } from './types/lab';

function App() {
  const [projects, setProjects] = useState<LabProject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const data = await getLabProjects();
        setProjects(data);
      } catch (err) {
        console.error(err);
        setError('Failed to retrieve experimental projects database. Please check connection.');
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  // Derive unique categories dynamically from projects
  const categories = React.useMemo(() => {
    const unique = Array.from(new Set(projects.map((p) => p.category)));
    return ['All', ...unique];
  }, [projects]);

  // Determine the featured project dynamically based on rule:
  // 1. First project with featured: true
  // 2. Fallback to newest project based on publishedAt date
  const featuredProject = React.useMemo(() => {
    if (projects.length === 0) return null;
    const explicitlyFeatured = projects.find((p) => p.featured);
    if (explicitlyFeatured) return explicitlyFeatured;

    // Fallback: copy and sort by publishedAt descending
    return [...projects].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )[0];
  }, [projects]);

  // Filter projects based on active category
  const filteredProjects = React.useMemo(() => {
    if (activeCategory === 'All') return projects;
    return projects.filter((p) => p.category === activeCategory);
  }, [projects, activeCategory]);

  // In the project grid, if filtering by 'All' and we have a featured project,
  // exclude the featured project from the grid to avoid duplicate cards.
  // Otherwise (if filtering by a specific tag), show all projects in that tag.
  const gridProjects = React.useMemo(() => {
    if (activeCategory === 'All' && featuredProject) {
      return filteredProjects.filter((p) => p.id !== featuredProject.id);
    }
    return filteredProjects;
  }, [filteredProjects, activeCategory, featuredProject]);

  const getCategoryCount = (category: string) => {
    if (category === 'All') return projects.length;
    return projects.filter((p) => p.category === category).length;
  };

  const getStatusDotClass = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'live') return 'status-dot pulsing'; // pulsing green/success
    if (s === 'active') return 'status-dot active'; // solid amber/active
    return 'status-dot prototype'; // warning/rust/prototype
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleScrollToProjects = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('projects-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-badge-container">
          <div className="status-indicator">
            <span className="status-dot pulsing"></span>
            <span>Live experimental workspace</span>
          </div>
        </div>
        <h1 className="hero-title">Jherson Labs</h1>
        <p className="hero-subtitle">
          Experimental software projects, AI tools, backend systems, forecasting models, and
          developer utilities built through continuous engineering practice.
        </p>
        <div className="hero-cta">
          <a href="#projects-section" onClick={handleScrollToProjects} className="btn btn-primary">
            <svg
              className="btn-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
            Explore Projects
          </a>
          <a
            href="https://jhersonaguto.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            <svg
              className="btn-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
              />
            </svg>
            View Main Portfolio
          </a>
        </div>
      </header>

      {/* Featured Lab Section */}
      {loading ? (
        <section className="featured-section">
          <div className="section-label">
            <span>Loading Workspace...</span>
          </div>
          <div className="featured-card" style={{ borderStyle: 'dashed' }}>
            <div className="featured-visual skeleton"></div>
            <div className="featured-content">
              <div className="skeleton skeleton-title"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text" style={{ width: '40%' }}></div>
            </div>
          </div>
        </section>
      ) : error ? (
        <div className="empty-state" style={{ borderColor: 'var(--danger)' }}>
          <svg
            className="empty-icon"
            style={{ stroke: 'var(--danger)' }}
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          <h3 className="empty-title">Database Error</h3>
          <p className="empty-desc">{error}</p>
        </div>
      ) : (
        featuredProject && (
          <section className="featured-section">
            <h2 className="section-label">Featured Lab</h2>
            <div className="featured-card">
              <div className="featured-visual">
                {featuredProject.imageUrl ? (
                  <img
                    src={featuredProject.imageUrl}
                    alt={featuredProject.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      // fallback if image fails to load
                      (e.target as HTMLElement).style.display = 'none';
                      const parent = (e.target as HTMLElement).parentElement;
                      if (parent) {
                        const placeholder = parent.querySelector('.tech-placeholder');
                        if (placeholder) {
                          (placeholder as HTMLElement).style.display = 'flex';
                        }
                      }
                    }}
                  />
                ) : null}
                <div
                  className="tech-placeholder"
                  style={{ display: featuredProject.imageUrl ? 'none' : 'flex' }}
                >
                  <div className="placeholder-grid"></div>
                  <div className="placeholder-shape"></div>
                </div>
              </div>
              <div className="featured-content">
                <div className="featured-header">
                  <span className="category-tag">{featuredProject.category}</span>
                  <div className="status-indicator">
                    <span className={getStatusDotClass(featuredProject.status)}></span>
                    <span>{featuredProject.status}</span>
                  </div>
                </div>
                <h3 className="featured-title">{featuredProject.name}</h3>
                <p className="featured-desc">{featuredProject.description}</p>

                <div className="tech-stack-container">
                  {featuredProject.stack.map((tech) => (
                    <span key={tech} className="stack-tag">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="featured-actions">
                  {featuredProject.liveUrl && (
                    <a
                      href={featuredProject.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                    >
                      <svg
                        className="btn-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                        />
                      </svg>
                      {featuredProject.category === 'Backend' ? 'API Endpoint' : 'Launch Lab'}
                    </a>
                  )}
                  {featuredProject.githubUrl && (
                    <a
                      href={featuredProject.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                    >
                      <svg
                        className="btn-icon"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                        />
                      </svg>
                      GitHub Repository
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>
        )
      )}

      {/* Filter and Grid Section */}
      <section id="projects-section" className="filter-container">
        <h2 className="section-label">Experimental Registry</h2>

        {!loading && !error && projects.length > 0 && (
          <div className="filter-scroll">
            {categories.map((category) => (
              <button
                key={category}
                className={`filter-btn ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
                <span className="filter-count">{getCategoryCount(category)}</span>
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="project-grid">
            {[1, 2, 3].map((n) => (
              <div key={n} className="skeleton-card">
                <div className="skeleton line-title"></div>
                <div className="skeleton line"></div>
                <div className="skeleton line"></div>
                <div className="skeleton line line-short"></div>
              </div>
            ))}
          </div>
        ) : error ? null : gridProjects.length === 0 ? (
          <div className="empty-state">
            <svg
              className="empty-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {activeCategory === 'All' && featuredProject ? (
              <>
                <h3 className="empty-title">More projects coming soon</h3>
                <p className="empty-desc">
                  Check out the featured project above. Additional experiments will be listed here as they are registered.
                </p>
              </>
            ) : (
              <>
                <h3 className="empty-title">No lab projects found</h3>
                <p className="empty-desc">
                  No builds match the "{activeCategory}" category filter. Select another filter to view
                  other experiments.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="project-grid">
            {gridProjects.map((project) => (
              <article key={project.id} className="project-card">
                <div className="project-card-header">
                  <span className="category-tag">{project.category}</span>
                  <div className="status-indicator">
                    <span className={getStatusDotClass(project.status)}></span>
                    <span>{project.status}</span>
                  </div>
                </div>

                <div className="project-card-body">
                  <h3 className="project-card-title">{project.name}</h3>
                  <p className="project-card-desc">{project.description}</p>
                  <div className="tech-stack-container">
                    {project.stack.map((tech) => (
                      <span key={tech} className="stack-tag">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="project-card-footer">
                  <div className="project-card-meta">
                    <span>Deployed: {formatDate(project.publishedAt)}</span>
                  </div>
                  <div className="project-card-actions">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                      >
                        <svg
                          className="btn-icon"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                          />
                        </svg>
                        {project.category === 'Backend' ? 'API Endpoint' : 'Launch'}
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                      >
                        <svg
                          className="btn-icon"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                          />
                        </svg>
                        Code
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Lab Philosophy Section */}
      <section className="philosophy-section">
        <h2 className="philosophy-title">Philosophy & Approach</h2>
        <p className="philosophy-text">
          Labs is where I publish experimental builds, prototypes, and technical explorations before they
          become polished portfolio projects. Each project focuses on practical implementation, rapid
          prototyping, and technical learning.
        </p>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-brand">
          <span>JHERSON LABS</span>
          <span className="status-dot pulsing"></span>
        </div>
        <div className="footer-copy">
          <span>&copy; {new Date().getFullYear()} Jherson Aguto</span>
          <a
            href="https://jhersonaguto.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Main Portfolio
          </a>
        </div>
      </footer>
    </>
  );
}

export default App;
