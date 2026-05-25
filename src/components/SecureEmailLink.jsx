import { useCallback, useState } from 'react'
import { buildMailto, obfuscatedEmailLabel } from '../lib/security'

export default function SecureEmailLink({ emailParts, className, labelClassName, valueClassName }) {
  const [revealed, setRevealed] = useState(false)
  const mailto = buildMailto(emailParts)
  const label = obfuscatedEmailLabel(emailParts)

  const handleClick = useCallback(
    (e) => {
      if (!mailto) {
        e.preventDefault()
        return
      }
      if (!revealed) {
        e.preventDefault()
        setRevealed(true)
        window.location.href = mailto
      }
    },
    [mailto, revealed],
  )

  if (!mailto) return null

  return (
    <a
      href={revealed ? mailto : '#contact'}
      className={className}
      onClick={handleClick}
      rel={revealed ? 'nofollow' : undefined}
    >
      <span className={labelClassName}>Email</span>
      <span className={valueClassName}>{label}</span>
    </a>
  )
}
