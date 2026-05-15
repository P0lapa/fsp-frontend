import { Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { HomePage } from './pages/HomePage'
import { CompetitionsPage } from './pages/CompetitionsPage'
import { CompetitionDetailsPage } from './pages/CompetitionDetailsPage'
import { TrainingPage } from './pages/TrainingPage'
import { NewsPage } from './pages/NewsPage'
import { ProfilePage } from './pages/ProfilePage'
// import { DevTokenPanel } from './auth/DevTokenPanel'

function App() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0a0a0a]">
      <Header />
      {/* <DevTokenPanel /> */}

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/competitions" element={<CompetitionsPage />} />
          <Route path="/competitions/:contestId" element={<CompetitionDetailsPage />} />
          <Route path="/training" element={<TrainingPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
