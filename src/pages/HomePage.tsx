import { HeroSection } from '../components/home/HeroSection'
import { MissionSection } from '../components/home/MissionSection'
import { TrainingTicker } from '../components/home/TrainingTicker'
import { UpcomingCompetitionsSection } from '../components/home/UpcomingCompetitionsSection'

export function HomePage() {
  return (
    <>
      <HeroSection />
      <TrainingTicker />
      <UpcomingCompetitionsSection />
      <MissionSection />
    </>
  )
}
