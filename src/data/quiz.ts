import type { BookTypeId } from './bookTypes'

export interface QuizOption {
  label: string
  emoji: string
  typeId: BookTypeId
}

export interface QuizQuestion {
  question: string
  options: QuizOption[]
}

export const quizQuestions: QuizQuestion[] = [
  {
    question: 'Your favorite kind of ending is...',
    options: [
      { label: 'A dramatic showdown that changes everything', emoji: '💥', typeId: 'comic' },
      { label: 'A gut-punch emotional twist that lingers', emoji: '🌸', typeId: 'manga' },
      { label: 'A ridiculous twist that earns a real laugh', emoji: '🎈', typeId: 'cartoon' },
      { label: 'A cozy resolution that feels warm and safe', emoji: '🧸', typeId: 'childrens' },
    ],
  },
  {
    question: 'Pick a page layout:',
    options: [
      { label: 'One giant, jaw-dropping splash panel', emoji: '💥', typeId: 'comic' },
      { label: 'Speed lines and dramatic close-ups', emoji: '🌸', typeId: 'manga' },
      { label: 'A wacky sequence of exaggerated poses', emoji: '🎈', typeId: 'cartoon' },
      { label: 'One big warm illustration, a few rhyming words', emoji: '🧸', typeId: 'childrens' },
    ],
  },
  {
    question: 'Your dream cast is...',
    options: [
      { label: 'Superheroes and scheming villains', emoji: '💥', typeId: 'comic' },
      { label: 'Students hiding powers and messier feelings', emoji: '🌸', typeId: 'manga' },
      { label: 'Goofy best friends who bicker and bounce back', emoji: '🎈', typeId: 'cartoon' },
      { label: 'A brave little critter meeting new friends', emoji: '🧸', typeId: 'childrens' },
    ],
  },
  {
    question: 'Pick a sound effect:',
    options: [
      { label: 'BOOM! CRASH!', emoji: '💥', typeId: 'comic' },
      { label: 'GOGOGO... / SHIIN (dead silence)', emoji: '🌸', typeId: 'manga' },
      { label: 'BOING! HONK!', emoji: '🎈', typeId: 'cartoon' },
      { label: 'Giggle giggle', emoji: '🧸', typeId: 'childrens' },
    ],
  },
  {
    question: 'Your ideal reader is...',
    options: [
      { label: 'Teens and adults who love big action', emoji: '💥', typeId: 'comic' },
      { label: 'Fans of emotional arcs and serialized volumes', emoji: '🌸', typeId: 'manga' },
      { label: 'Anyone who wants a laugh-out-loud escape', emoji: '🎈', typeId: 'cartoon' },
      { label: 'Little kids (and the grown-ups reading aloud)', emoji: '🧸', typeId: 'childrens' },
    ],
  },
  {
    question: 'Your art style leans toward...',
    options: [
      { label: 'Bold inked linework and dynamic shadows', emoji: '💥', typeId: 'comic' },
      { label: 'Expressive eyes and screentone shading', emoji: '🌸', typeId: 'manga' },
      { label: 'Rubbery, bouncy, squash-and-stretch shapes', emoji: '🎈', typeId: 'cartoon' },
      { label: 'Soft, warm, simple shapes', emoji: '🧸', typeId: 'childrens' },
    ],
  },
]
