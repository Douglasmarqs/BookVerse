// BookVerse — Onboarding
//
// Apresenta os pilares do produto (Documento 01 — Visão Geral, seção 4)
// de forma resumida, em 3 passos. Marca a flag local de onboarding
// concluído ao final.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'

const ONBOARDING_KEY = 'bookverse_onboarded'

const SLIDES = [
  {
    title: 'Construa o hábito de ler',
    text: 'Sequências, metas diárias e um mapa visual da sua leitura — sem culpa, só constância.',
  },
  {
    title: 'Leia perto de quem você gosta',
    text: 'Clubes do livro, leitura em conjunto e um ranking só entre amigos.',
  },
  {
    title: 'Conheça a Lumi',
    text: 'Sua assistente de leitura. Ela aprende seu ritmo e recomenda o próximo capítulo certo, na hora certa.',
  },
]

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()
  const isLast = step === SLIDES.length - 1

  function handleNext() {
    if (isLast) {
      localStorage.setItem(ONBOARDING_KEY, 'true')
      navigate('/cadastro', { replace: true })
      return
    }
    setStep((s) => s + 1)
  }

  function handleSkip() {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    navigate('/cadastro', { replace: true })
  }

  const slide = SLIDES[step]

  return (
    <div className="bv-screen bv-screen--ink">
      <div className="bv-center">
        <div className="bv-container">
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 32 }}>
            {SLIDES.map((_, i) => (
              <span
                key={i}
                style={{
                  width: i === step ? 22 : 8,
                  height: 8,
                  borderRadius: 999,
                  background: i === step ? 'var(--color-lamp)' : 'var(--color-border-on-ink)',
                  transition: 'all 220ms ease',
                }}
              />
            ))}
          </div>

          <h1 className="bv-display">{slide.title}</h1>
          <p className="bv-text-muted" style={{ marginTop: 16, marginBottom: 40, fontSize: '1rem' }}>
            {slide.text}
          </p>

          <Button onClick={handleNext}>{isLast ? 'Criar minha conta' : 'Continuar'}</Button>

          {!isLast && (
            <button
              onClick={handleSkip}
              className="bv-text-muted"
              style={{ background: 'none', border: 'none', marginTop: 16, cursor: 'pointer' }}
            >
              Pular introdução
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
