// BookVerse — Avatar de usuário
//
// Mostra a foto de perfil (photoURL — hoje só populada por login Google,
// já que upload de avatar próprio ainda não foi construído) ou, na
// ausência dela, a inicial do nome sobre um círculo colorido.

export function Avatar({ name, photoURL, size = 40 }) {
  const initial = name?.charAt(0)?.toUpperCase() || '?'
  const style = { width: size, height: size, fontSize: size * 0.4 }

  if (photoURL) {
    return <img src={photoURL} alt="" className="bv-avatar" style={style} />
  }

  return (
    <span className="bv-avatar bv-avatar--placeholder" style={style} aria-hidden="true">
      {initial}
    </span>
  )
}
