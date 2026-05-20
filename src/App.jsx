import { useState, useCallback } from 'react'
import HUD from './components/HUD'
import GameCanvas from './components/GameCanvas'
import Overlay from './components/Overlay'

const INITIAL_STATE = {
    score: 0,
    lives: 3,
    wave: 1,
    running: false,
    gameOver: false,
    // session é um contador que sobe a cada nova partida
    // o loop usa ele para detectar "nova partida" mesmo se running já era true
    session: 0,
}

export default function App() {
    const [gameState, setGameState] = useState(INITIAL_STATE)

    // incrementa session para que o loop detecte o reinício mesmo mid-game
    const startGame = useCallback(() => {
        setGameState(prev => ({ ...INITIAL_STATE, running: true, session: prev.session + 1 }))
    }, [])

    // volta ao menu sem incrementar session — o loop limpa na próxima partida
    const goToMenu = useCallback(() => {
        setGameState(prev => ({ ...INITIAL_STATE, session: prev.session }))
    }, [])

    const updateScore = useCallback((points) => {
        setGameState(prev => ({ ...prev, score: prev.score + points }))
    }, [])

    const updateWave = useCallback((wave) => {
        setGameState(prev => ({ ...prev, wave }))
    }, [])

    const loseLife = useCallback(() => {
        setGameState(prev => {
            const lives = prev.lives - 1
            return {
                ...prev,
                lives,
                gameOver: lives <= 0,
                running: lives > 0,
            }
        })
    }, [])

    return (
        <>
            <GameCanvas
                gameState={gameState}
                onScore={updateScore}
                onLoseLife={loseLife}
                onWaveChange={updateWave}
                onMenu={goToMenu}
                onRestart={startGame}
            />
            <HUD
                score={gameState.score}
                wave={gameState.wave}
                lives={gameState.lives}
            />
            <Overlay
                gameState={gameState}
                onStart={startGame}
            />
        </>
    )
}
