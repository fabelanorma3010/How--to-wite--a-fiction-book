'use client'

import Header from './components/Header'
import Hero from './components/Hero'
import JourneySteps from './components/JourneySteps'
import Footer from './components/Footer'
import FictionHelper from './components/FictionHelper'
import ScrollReveal from './components/ScrollReveal'

function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <ScrollReveal>
          <JourneySteps />
        </ScrollReveal>
      </main>
      <Footer />
      <FictionHelper selected="comic" />
    </div>
  )
}

export default App
