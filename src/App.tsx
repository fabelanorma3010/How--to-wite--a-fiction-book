'use client'

import { useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import BookQuiz from './components/BookQuiz'
import BookTypes from './components/BookTypes'
import ActionTextGenerator from './components/ActionTextGenerator'
import IllustrationGenerator from './components/IllustrationGenerator'
import StoryNotebook from './components/StoryNotebook'
import PublishSteps from './components/PublishSteps'
import ContactForm from './components/ContactForm'
import Footer from './components/Footer'
import FictionHelper from './components/FictionHelper'
import ScrollReveal from './components/ScrollReveal'
import type { BookTypeId } from './data/bookTypes'

function App() {
  const [selectedType, setSelectedType] = useState<BookTypeId>('comic')

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <ScrollReveal>
          <BookQuiz onSelect={setSelectedType} />
        </ScrollReveal>
        <ScrollReveal>
          <BookTypes selected={selectedType} onSelect={setSelectedType} />
        </ScrollReveal>
        <ScrollReveal>
          <ActionTextGenerator selected={selectedType} onSelect={setSelectedType} />
        </ScrollReveal>
        <ScrollReveal>
          <IllustrationGenerator selected={selectedType} onSelect={setSelectedType} />
        </ScrollReveal>
        <ScrollReveal>
          <StoryNotebook />
        </ScrollReveal>
        <ScrollReveal>
          <PublishSteps />
        </ScrollReveal>
        <ScrollReveal>
          <ContactForm />
        </ScrollReveal>
      </main>
      <Footer />
      <FictionHelper selected={selectedType} />
    </div>
  )
}

export default App
