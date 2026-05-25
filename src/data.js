export const profile = {
  name: 'Sanjeev Magar',
  handle: 'sanziv9999',
  github: 'https://github.com/sanziv9999',
  title: 'Full Stack Developer',
  tagline:
    'Building web products across Python, Java, and React from Django APIs to Spring Boot backends.',
  about: [
    'Currently focused on full stack web development, shipping real products, not just tutorials.',
    'Open to collaborating on open source Python or React projects.',
    'Deepening skills in advanced backend architecture, AI, and machine learning.',
    'Ask me about Python, Java, or IoT, I will debug a single line for hours and still enjoy it.',
  ],
  photo: '/image/pp.png',
  /** Split to avoid plain-text scraping in source */
  emailParts: ['sanzivmagat80', 'gmail.com'],
  linkedin: 'https://www.linkedin.com/in/sanjeev-magar-5a198b27a',
}

export const TOP_REPO_COUNT = 6

/** Custom copy & tech — applied on top of live GitHub data (and cache) */
export const PROJECT_OVERRIDES = {
  'mood-tunes-reactjs': {
    description:
      'React app that detects facial mood with face-api.js and curates Spotify playlists.',
    tech: ['React', 'JavaScript', 'Spotify API'],
  },
  'online-meat-shop': {
    description: 'E-commerce meat shop application built with Java.',
    tech: ['Java'],
  },
  'motorcycle-service-booking': {
    description: 'Booking flow for motorcycle service appointments.',
    tech: ['JavaScript', 'React'],
  },
}

/** Used when GitHub API is unavailable (rate limit, no proxy on host, offline) */
export const FALLBACK_PROJECTS = [
  {
    name: 'GharkoSwad',
    description:
      'A niche food delivery platform in Nepal focused on homecooked meals and interactive food feeds.',
    tech: ['JavaScript', 'React'],
    url: 'https://github.com/sanziv9999/GharkoSwad',
    commits: 50,
  },
  {
    name: 'type-script-basics',
    description: 'TypeScript fundamentals — types, interfaces, and practical exercises.',
    tech: ['TypeScript'],
    url: 'https://github.com/sanziv9999/type-script-basics',
    commits: 44,
  },
  {
    name: 'staff-management-system-react-js',
    description: 'Staff management dashboard built with React.',
    tech: ['React', 'JavaScript'],
    url: 'https://github.com/sanziv9999/staff-management-system-react-js',
    commits: 16,
  },
  {
    name: 'laravel-api-learning',
    description: 'Hands-on Laravel API patterns and backend experiments.',
    tech: ['Laravel', 'PHP'],
    url: 'https://github.com/sanziv9999/laravel-api-learning',
    commits: 13,
  },
  {
    name: 'mood-tunes-reactjs',
    description: 'React app that detects facial mood and curates Spotify playlists.',
    tech: ['React', 'JavaScript'],
    url: 'https://github.com/sanziv9999/mood-tunes-reactjs',
    commits: 12,
  },
  {
    name: 'esewa-payment-in-react-js',
    description: 'eSewa payment flow integration in a React frontend.',
    tech: ['React', 'JavaScript'],
    url: 'https://github.com/sanziv9999/esewa-payment-in-react-js',
    commits: 6,
  },
]

export const skills = [
  'Python',
  'Java',
  'JavaScript',
  'React',
  'Django',
  'FastAPI',
  'Flask',
  'Spring Boot',
  'Node.js',
  'PostgreSQL',
  'MySQL',
  'Docker',
  'TensorFlow',
  'PyTorch',
  'Tailwind CSS',
  'Vite',
  'Git',
]
