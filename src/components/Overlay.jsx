export default function Overlay({ gameState, onStart }) {
    if (gameState.running) return null

    const isGameOver = gameState.gameOver
    const title = isGameOver ? 'GAME OVER' : 'COSMIC DRIFT'

    const lines = isGameOver
        ? [`SCORE FINAL: ${String(gameState.score).padStart(5, '0')}`, `WAVE: ${gameState.wave}`]
        : ['WASD / SETAS PRA MOVER', 'ESPAÇO PRA ATIRAR']

    const hint = isGameOver ? 'clique pra reiniciar' : 'clique pra começar'

    return (
        <div onClick={onStart} style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            background: 'radial-gradient(ellipse at center, rgba(20,0,40,0.45), rgba(0,0,0,0.85))',
            cursor: 'pointer',
            userSelect: 'none',
            fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
        }}>
            <h1 style={{
                margin: 0,
                fontSize: 84,
                letterSpacing: 6,
                background: 'linear-gradient(90deg, #00f0ff, #ff00cc)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
            }}>
                {title}
            </h1>

            {lines.map((l, i) => (
                <p key={i} style={{ margin: 0, opacity: 0.85, fontSize: 16, color: '#cfefff' }}>
                    {l}
                </p>
            ))}

            <p style={{ margin: '18px 0 0', opacity: 0.6, fontSize: 14, color: '#cfefff' }}>
                {hint}
            </p>
        </div>
    )
}