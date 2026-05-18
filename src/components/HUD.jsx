export default function HUD({ score, wave, lives }) {
    const hearts = lives > 0
        ? '♥ '.repeat(lives).trim()
        : '—'

    return (
        <div style={{
            position: 'fixed',
            top: 18,
            left: 22,
            pointerEvents: 'none',
            fontSize: 16,
            letterSpacing: 1,
        }}>
            <div style={{ color: '#cfefff', textShadow: '0 0 10px #00f0ff', marginBottom: 4 }}>
                SCORE {String(score).padStart(5, '0')}
            </div>
            <div style={{ color: '#ffcc66', textShadow: '0 0 10px #ffaa33', marginBottom: 4 }}>
                WAVE {wave}
            </div>
            <div style={{ color: '#ff5577', textShadow: '0 0 10px #ff2255' }}>
                {hearts}
            </div>
        </div>
    )
}