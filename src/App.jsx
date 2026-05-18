import { useState, useCallback } from 'react'
import HUD from './components/HUD'
import GameCanvas from './components/GameCanvas'


const INITIAL_STATE = {
    score: 0,
    lives: 3,
    wave: 1,
    running: false,
    gameOver: false,
}

export default function App() {
    const [gameState, setGameState] = useState(INITIAL_STATE)

    const startGame = useCallback(() => {
        setGameState({
            ...INITIAL_STATE,
            running: true,
        })
    }, [])

    const updateScore = useCallback((points) => {
        setGameState(prev => ({ ...prev, score: prev.score + points }))
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
            />
            <HUD
                score={gameState.score}
                wave={gameState.wave}
                lives={gameState.lives}
            />
        </>
    )
}