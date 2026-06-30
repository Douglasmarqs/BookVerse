// BookVerse — Lumi (avatar)
//
// Documento 14 — Mascote Inteligente. A Lumi nasce visualmente do mesmo
// elemento de marca já usado no logo (a fita de marcador de página),
// personificada com um rosto simples — mantém a identidade visual
// consistente em vez de introduzir um personagem desconexo do resto do
// app.
//
// "mood" já existe como prop para o futuro (Documento 14 prevê expressões
// diferentes conforme o contexto: feliz, comemorando, sonolenta). Por
// ora só o estado 'happy' tem uma expressão própria; os demais caem no
// mesmo desenho — evita prometer animação que ainda não existe.

const EXPRESSIONS = {
  happy: { eyeOffset: 0, mouthPath: 'M 86 150 Q 100 162 114 150' },
  default: { eyeOffset: 0, mouthPath: 'M 88 150 Q 100 158 112 150' },
}

export function LumiAvatar({ size = 64, mood = 'default' }) {
  const expression = EXPRESSIONS[mood] || EXPRESSIONS.default

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Lumi"
    >
      {/* Corpo: a fita de marcador, igual ao elemento de marca do BookVerse */}
      <path
        d="M 56 24 L 144 24 L 144 146 L 100 184 L 56 146 Z"
        fill="var(--color-lamp, #E8A33D)"
      />
      {/* Olhos */}
      <circle cx={80 + expression.eyeOffset} cy="100" r="7" fill="var(--color-ink, #14182B)" />
      <circle cx={120 + expression.eyeOffset} cy="100" r="7" fill="var(--color-ink, #14182B)" />
      {/* Boca */}
      <path
        d={expression.mouthPath}
        stroke="var(--color-ink, #14182B)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
