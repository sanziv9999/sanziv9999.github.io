import { useState } from 'react'
import { profile, TOP_REPO_COUNT, skills } from './data'
import { useTopRepos } from './hooks/useTopRepos'
import SecureEmailLink from './components/SecureEmailLink'
import { sanitizeExternalUrl } from './lib/security'

function PhotoFrame() {
  const [hasPhoto, setHasPhoto] = useState(false)

  return (
    <div className="photo-frame" aria-label="Profile photo">
      <div className={`photo-frame__inner ${hasPhoto ? 'photo-frame__inner--loaded' : ''}`}>
        <img
          src={profile.photo}
          alt={`${profile.name} portrait`}
          className="photo-frame__img"
          onLoad={() => setHasPhoto(true)}
          onError={() => setHasPhoto(false)}
        />
        {!hasPhoto && (
          <>
            <span className="photo-frame__label">Photo</span>
            <span className="photo-frame__hint">
              Add your image to
              <br />
              <code>public/image/pp.png</code>
            </span>
          </>
        )}
      </div>
      <div className="photo-frame__meta">
        <span>Based in Nepal</span>
        <span className="accent-line" aria-hidden="true" />
        <span>Open to collab</span>
      </div>
    </div>
  )
}

function Nav() {
  return (
    <header className="nav">
      <a href="#" className="nav__logo" aria-label="Home">
        SM<span className="accent-dot" aria-hidden="true" />
      </a>
      <nav className="nav__links" aria-label="Primary">
        <a href="#work">Work</a>
        <a href="#about">About</a>
        <a href="#stack">Stack</a>
        <a href="#contact">Contact</a>
      </nav>
      <a
        href={profile.github}
        target="_blank"
        rel="noopener noreferrer"
        className="nav__cta"
      >
        GitHub
      </a>
    </header>
  )
}

function Hero({ totalRepos }) {
  return (
    <section className="hero" id="top">
      <div className="hero__grid">
        <div className="hero__copy">
          <p className="eyebrow">Portfolio / 2026</p>
          <h1 className="hero__title">
            {profile.name.split(' ')[0]}
            <br />
            <span className="hero__title--dim">{profile.name.split(' ')[1]}</span>
          </h1>
          <p className="hero__role">{profile.title}</p>
          <p className="hero__tagline">{profile.tagline}</p>
          <div className="hero__actions">
            <a href="#work" className="btn btn--primary">
              View projects
            </a>
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--ghost"
            >
              @{profile.handle}
            </a>
          </div>
        </div>

        <div className="hero__visual">
          <PhotoFrame />
        </div>
      </div>

      <div className="hero__stats">
        <div className="stat">
          <span className="stat__num">{totalRepos ?? '—'}</span>
          <span className="stat__label">Repositories</span>
        </div>
        <div className="stat">
          <span className="stat__num">{TOP_REPO_COUNT}</span>
          <span className="stat__label">Top by commits</span>
        </div>
        <div className="stat">
          <span className="stat__num">FS</span>
          <span className="stat__label">Web development</span>
        </div>
        <div className="stat stat--accent">
          <span className="stat__num">→</span>
          <span className="stat__label">Available for work</span>
        </div>
      </div>
    </section>
  )
}

function ProjectCard({ project, index }) {
  return (
    <article className="project-card" style={{ '--i': index }}>
      <div className="project-card__top">
        <span className="project-card__index">
          {String(index + 1).padStart(2, '0')}
          <span className="project-card__commits">
            {project.commits} commit{project.commits === 1 ? '' : 's'}
          </span>
        </span>
              <a
                href={sanitizeExternalUrl(
                  project.url,
                  `https://github.com/${profile.handle}/${project.name}`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="project-card__link"
          aria-label={`Open ${project.name} on GitHub`}
        >
          ↗
        </a>
      </div>
      <h3 className="project-card__name">{project.name}</h3>
      <p className="project-card__desc">{project.description}</p>
      <ul className="project-card__tech">
        {project.tech.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </article>
  )
}

function ProjectSkeleton() {
  return (
    <article className="project-card project-card--skeleton" aria-hidden="true">
      <div className="skeleton skeleton--sm" />
      <div className="skeleton skeleton--lg" />
      <div className="skeleton skeleton--md" />
      <div className="skeleton skeleton--row" />
    </article>
  )
}

function Work({ projects, loading, error, usingFallback, onRetry }) {
  return (
    <section className="section" id="work">
      <div className="section__head">
        <h2 className="section__title">Repositories</h2>
        <p className="section__desc">
          Top {TOP_REPO_COUNT} by your commits — loaded live from{' '}
          <a href={profile.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          .
        </p>
      </div>

      {error && (
        <div
          className={`work-status ${usingFallback ? 'work-status--warn' : 'work-status--error'}`}
          role="alert"
        >
          <p>
            {usingFallback
              ? `Showing cached projects — live GitHub fetch failed: ${error}`
              : error}
          </p>
          <button type="button" className="btn btn--ghost" onClick={onRetry}>
            Retry
          </button>
        </div>
      )}

      <div className="project-grid">
        {loading
          ? Array.from({ length: TOP_REPO_COUNT }, (_, i) => (
              <ProjectSkeleton key={i} />
            ))
          : projects.map((project, i) => (
              <ProjectCard key={project.name} project={project} index={i} />
            ))}
      </div>
    </section>
  )
}

function About() {
  return (
    <section className="section section--border" id="about">
      <div className="about-grid">
        <div className="section__head section__head--sticky">
          <h2 className="section__title">About</h2>
          <p className="section__desc mono">sanjeev-magar / sanziv9999</p>
        </div>
        <div className="about__content">
          <p className="about__lead">
            Full stack developer working across backends, frontends, and
            everything in between.
          </p>
          <ul className="about__list">
            {profile.about.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function Stack() {
  return (
    <section className="section section--border" id="stack">
      <div className="section__head">
        <h2 className="section__title">Tech stack</h2>
        <p className="section__desc">Tools I reach for most often.</p>
      </div>
      <ul className="skill-grid">
        {skills.map((skill) => (
          <li key={skill} className="skill-chip">
            {skill}
          </li>
        ))}
      </ul>
    </section>
  )
}

function Contact() {
  return (
    <section className="section section--border" id="contact">
      <div className="contact-grid">
        <h2 className="contact__title">
          Let&apos;s build
          <br />
          something.
        </h2>
        <div className="contact__links">
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            className="contact__link"
          >
            <span className="contact__label">GitHub</span>
            <span>github.com/{profile.handle}</span>
          </a>
          {profile.linkedin && (
            <a
              href={sanitizeExternalUrl(profile.linkedin, profile.linkedin)}
              target="_blank"
              rel="noopener noreferrer"
              className="contact__link"
            >
              <span className="contact__label">LinkedIn</span>
              <span>linkedin.com/in/sanjeev-magar-5a198b27a</span>
            </a>
          )}
          {profile.emailParts && (
            <SecureEmailLink
              emailParts={profile.emailParts}
              className="contact__link"
              labelClassName="contact__label"
              valueClassName=""
            />
          )}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <span>© {new Date().getFullYear()} {profile.name}</span>
    </footer>
  )
}

export default function App() {
  const { projects, totalRepos, loading, error, usingFallback, retry } =
    useTopRepos(profile.handle, TOP_REPO_COUNT)

  return (
    <>
      <Nav />
      <main>
        <Hero totalRepos={totalRepos} />
        <Work
          projects={projects}
          loading={loading}
          error={error}
          usingFallback={usingFallback}
          onRetry={retry}
        />
        <About />
        <Stack />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
