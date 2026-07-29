import { useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import BookTypes from './components/BookTypes'
import ActionTextGenerator from './components/ActionTextGenerator'
import IllustrationGenerator from './components/IllustrationGenerator'
import PublishSteps from './components/PublishSteps'
import Footer from './components/Footer'
import type { BookTypeId } from './data/bookTypes'

function App() {
  const [selectedType, setSelectedType] = useState<BookTypeId>('comic')

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <BookTypes selected={selectedType} onSelect={setSelectedType} />
        <ActionTextGenerator selected={selectedType} onSelect={setSelectedType} />
        <IllustrationGenerator selected={selectedType} onSelect={setSelectedType} />
        <PublishSteps />
      </main>
      <Footer />
    </div>
  )
}

export default App
