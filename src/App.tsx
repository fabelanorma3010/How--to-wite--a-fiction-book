import { useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import BookQuiz from './components/BookQuiz'
import BookTypes from './components/BookTypes'
import ActionTextGenerator from './components/ActionTextGenerator'
import IllustrationGenerator from './components/IllustrationGenerator'
import StoryNotebook from './components/StoryNotebook'
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
        <BookQuiz onSelect={setSelectedType} />
        <BookTypes selected={selectedType} onSelect={setSelectedType} />
        <ActionTextGenerator selected={selectedType} onSelect={setSelectedType} />
        <IllustrationGenerator selected={selectedType} onSelect={setSelectedType} />
        <StoryNotebook />
        <PublishSteps />
      </main>
      <Footer />
    </div>
  )
}

export default App
