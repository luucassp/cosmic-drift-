import { useEffect, useRef } from 'react'
import { resumeAudio } from '../game/audio'

const RADIUS = 55   // raio do anel externo do joystick
const KNOB_R = 22   // raio do botão interno

export default function MobileControls({ mobileInput, running, onMenu }) {
    const baseRef    = useRef(null)
    const knobRef    = useRef(null)
    const fireRef    = useRef(null)
    const menuBtnRef = useRef(null)

    const joyTouch  = useRef(null)   // { id, cx, cy }
    const fireTouch = useRef(null)   // { id }

    // zera o input quando o jogo para
    useEffect(() => {
        if (!running) {
            mobileInput.current = { dx: 0, dy: 0, shooting: false }
            joyTouch.current    = null
            fireTouch.current   = null
        }
    }, [running, mobileInput])

    useEffect(() => {
        if (!running) return

        function onTouchStart(e) {
            resumeAudio()
            for (const t of e.changedTouches) {
                // ignora toque no botão MENU (ele usa onClick nativo)
                if (menuBtnRef.current) {
                    const r = menuBtnRef.current.getBoundingClientRect()
                    if (t.clientX >= r.left && t.clientX <= r.right &&
                        t.clientY >= r.top  && t.clientY <= r.bottom) continue
                }

                const isRight = t.clientX > window.innerWidth * 0.5

                if (!isRight && !joyTouch.current) {
                    // ancora o joystick onde o dedo pousou
                    joyTouch.current = { id: t.identifier, cx: t.clientX, cy: t.clientY }
                    baseRef.current.style.left    = (t.clientX - RADIUS) + 'px'
                    baseRef.current.style.top     = (t.clientY - RADIUS) + 'px'
                    baseRef.current.style.opacity = '1'
                } else if (isRight && !fireTouch.current) {
                    fireTouch.current               = { id: t.identifier }
                    mobileInput.current.shooting    = true
                    fireRef.current.style.opacity   = '1'
                    fireRef.current.style.transform = 'scale(0.88)'
                }
            }
        }

        function onTouchMove(e) {
            e.preventDefault()   // evita scroll/pan do browser
            for (const t of e.changedTouches) {
                if (!joyTouch.current || t.identifier !== joyTouch.current.id) continue

                const rawX  = t.clientX - joyTouch.current.cx
                const rawY  = t.clientY - joyTouch.current.cy
                const dist  = Math.sqrt(rawX * rawX + rawY * rawY)
                const clamp = Math.min(dist, RADIUS)
                const angle = Math.atan2(rawY, rawX)

                // dy invertido: touch Y cresce pra baixo, jogo Y cresce pra cima
                mobileInput.current.dx =  Math.cos(angle) * clamp / RADIUS
                mobileInput.current.dy = -Math.sin(angle) * clamp / RADIUS

                knobRef.current.style.transform =
                    `translate(${Math.cos(angle) * clamp}px, ${Math.sin(angle) * clamp}px)`
            }
        }

        function onTouchEnd(e) {
            for (const t of e.changedTouches) {
                if (joyTouch.current && t.identifier === joyTouch.current.id) {
                    joyTouch.current             = null
                    mobileInput.current.dx       = 0
                    mobileInput.current.dy       = 0
                    baseRef.current.style.opacity   = '0'
                    knobRef.current.style.transform = 'translate(0px, 0px)'
                }
                if (fireTouch.current && t.identifier === fireTouch.current.id) {
                    fireTouch.current               = null
                    mobileInput.current.shooting    = false
                    fireRef.current.style.opacity   = '0.55'
                    fireRef.current.style.transform = 'scale(1)'
                }
            }
        }

        window.addEventListener('touchstart',  onTouchStart, { passive: true  })
        window.addEventListener('touchmove',   onTouchMove,  { passive: false })
        window.addEventListener('touchend',    onTouchEnd,   { passive: true  })
        window.addEventListener('touchcancel', onTouchEnd,   { passive: true  })

        return () => {
            window.removeEventListener('touchstart',  onTouchStart)
            window.removeEventListener('touchmove',   onTouchMove)
            window.removeEventListener('touchend',    onTouchEnd)
            window.removeEventListener('touchcancel', onTouchEnd)
            mobileInput.current = { dx: 0, dy: 0, shooting: false }
        }
    }, [running, mobileInput])

    if (!running) return null

    return (
        <>
            {/* anel externo do joystick (aparece onde o dedo pousa) */}
            <div ref={baseRef} style={{
                position:       'fixed',
                width:          RADIUS * 2,
                height:         RADIUS * 2,
                borderRadius:   '50%',
                border:         '2px solid rgba(0,240,255,0.45)',
                background:     'rgba(0,240,255,0.07)',
                opacity:        0,
                pointerEvents:  'none',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                transition:     'opacity 0.12s',
            }}>
                <div ref={knobRef} style={{
                    width:         KNOB_R * 2,
                    height:        KNOB_R * 2,
                    borderRadius:  '50%',
                    background:    'rgba(0,240,255,0.55)',
                    border:        '2px solid #00f0ff',
                    boxShadow:     '0 0 12px #00f0ff88',
                    pointerEvents: 'none',
                }} />
            </div>

            {/* botão de tiro */}
            <div ref={fireRef} style={{
                position:       'fixed',
                bottom:         52,
                right:          52,
                width:          84,
                height:         84,
                borderRadius:   '50%',
                background:     'rgba(255,0,204,0.12)',
                border:         '2px solid rgba(255,0,204,0.65)',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                fontSize:       12,
                letterSpacing:  2,
                color:          '#ff00cc',
                textShadow:     '0 0 8px #ff00cc',
                opacity:        0.55,
                userSelect:     'none',
                pointerEvents:  'none',
                transition:     'opacity 0.1s, transform 0.08s',
            }}>
                FIRE
            </div>

            {/* botão de menu */}
            <div ref={menuBtnRef} onClick={onMenu} style={{
                position:      'fixed',
                top:           14,
                right:         14,
                padding:       '6px 14px',
                borderRadius:  6,
                background:    'rgba(255,255,255,0.07)',
                border:        '1px solid rgba(255,255,255,0.25)',
                fontSize:      12,
                letterSpacing: 1,
                color:         '#cfefff',
                userSelect:    'none',
                cursor:        'pointer',
            }}>
                MENU
            </div>
        </>
    )
}
