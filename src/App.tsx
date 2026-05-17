import { Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { HomePage } from './pages/HomePage'
import { CompetitionsPage } from './pages/CompetitionsPage'
import { CompetitionDetailsPage } from './pages/CompetitionDetailsPage'
import { TrainingPage } from './pages/TrainingPage'
import { NewsPage } from './pages/NewsPage'
import { ProfilePage } from './pages/ProfilePage'

function App() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[var(--color-bg)] text-[var(--color-text)]">
      <Header />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/competitions" element={<CompetitionsPage />} />
          <Route path="/competitions/:contestId" element={<CompetitionDetailsPage />} />
          <Route path="/training" element={<TrainingPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default App
