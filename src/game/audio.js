// Web Audio API — síntese de som procedural, sem arquivos de áudio
// Todos os sons são gerados matematicamente em tempo real

let ctx = null

// Cria ou retoma o AudioContext
// DEVE ser chamado dentro de um evento do usuário (keydown, click)
// Browsers bloqueiam áudio que não foi iniciado por gesto humano
export function resumeAudio() {
    if (!ctx) {
        ctx = new (window.AudioContext || window.webkitAudioContext)()
    } else if (ctx.state === 'suspended') {
        ctx.resume()
    }
}

// som do laser: onda quadrada que cai rapidamente de agudo para médio
// onda quadrada tem timbre mais "eletrônico" que senoide pura
export function playLaser() {
    if (!ctx) return

    const t = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = 'square'
    // frequência desce de 1200Hz → 400Hz em 80ms = efeito "pew"
    osc.frequency.setValueAtTime(1200, t)
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.08)

    gain.gain.setValueAtTime(0.12, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08)

    osc.start(t)
    osc.stop(t + 0.09)  // limpa o nó automaticamente após tocar
}

// som de explosão de asteroide: ruído branco filtrado
// ruído branco = buffer com valores aleatórios — soa como "estática"
// filtro passa-baixa vai fechando = som fica mais abafado e some
// radius afeta duração e volume — explosão maior = boom mais longo
export function playExplosion(radius = 1) {
    if (!ctx) return

    const t = ctx.currentTime
    const duration = 0.18 + radius * 0.07

    // cria buffer de ruído branco
    const bufLen = Math.ceil(ctx.sampleRate * duration)
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1

    const src = ctx.createBufferSource()
    src.buffer = buf

    // filtro passa-baixa fecha rapidamente = som de impacto abafando
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(2200 * radius, t)
    filter.frequency.exponentialRampToValueAtTime(80, t + duration)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(Math.min(radius * 0.35, 0.85), t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration)

    src.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    src.start(t)
    src.stop(t + duration)
}

// impacto na nave: senoide grave que cai bastante (150Hz → 30Hz)
// frequências baixas = sensação de impacto pesado / batida no peito
export function playShipHit() {
    if (!ctx) return

    const t = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = 'sine'
    osc.frequency.setValueAtTime(150, t)
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.45)

    gain.gain.setValueAtTime(0.55, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45)

    osc.start(t)
    osc.stop(t + 0.46)
}

// avanço de wave: arpejo ascendente C-E-G-C (acorde de dó maior)
// cada nota começa 120ms depois da anterior
export function playWaveUp() {
    if (!ctx) return

    // C5, E5, G5, C6 — escala musical de dó maior
    const notes = [523, 659, 784, 1047]

    notes.forEach((freq, i) => {
        const t = ctx.currentTime + i * 0.12

        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.type = 'sine'
        osc.frequency.value = freq

        gain.gain.setValueAtTime(0.18, t)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14)

        osc.start(t)
        osc.stop(t + 0.15)
    })
}

// game over: arpejo descendente A-F-D-A (tom de derrota)
export function playGameOver() {
    if (!ctx) return

    const notes = [440, 349, 294, 220]

    notes.forEach((freq, i) => {
        const t = ctx.currentTime + i * 0.22

        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, t)

        gain.gain.setValueAtTime(0.22, t)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28)

        osc.start(t)
        osc.stop(t + 0.3)
    })
}

// fecha o contexto de áudio no cleanup do componente
export function disposeAudio() {
    if (ctx) {
        ctx.close()
        ctx = null
    }
}
