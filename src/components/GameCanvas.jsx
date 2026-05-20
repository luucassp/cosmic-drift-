import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { createStarfield } from '../game/starfield'
import { createShip } from '../game/ship'
import { createAsteroid } from '../game/asteroids'
import { tryShoot, disposeLasers, disposeLaserResources, resetLaserCooldown } from '../game/lasers'
import { explodeAt, updateExplosions, disposeExplosions } from '../game/explosion'
import {
    resumeAudio, playLaser, playExplosion, playShipHit,
    playWaveUp, playGameOver, disposeAudio,
} from '../game/audio'

export default function GameCanvas({ gameState, onScore, onLoseLife, onWaveChange, onMenu, onRestart }) {
    const mountRef = useRef(null)
    const threeRef = useRef({})
    const gameStateRef = useRef(gameState)

    // mantém gameStateRef sempre atualizado sem recriar o loop
    useEffect(() => {
        gameStateRef.current = gameState
    }, [gameState])

    useEffect(() => {
        const mount = mountRef.current
        const three = threeRef.current

        // ---- 1. renderer ----
        three.renderer = new THREE.WebGLRenderer({ antialias: true })
        three.renderer.setSize(window.innerWidth, window.innerHeight)
        three.renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
        mount.appendChild(three.renderer.domElement)

        // ---- 2. scene ----
        three.scene = new THREE.Scene()
        three.scene.fog = new THREE.FogExp2(0x05010f, 0.0055)

        // ---- 3. camera ----
        three.camera = new THREE.PerspectiveCamera(
            72, window.innerWidth / window.innerHeight, 0.1, 2000
        )
        three.camera.position.set(0, 4, 14)
        three.camera.lookAt(0, 0, 0)

        // ---- 4. luz ----
        three.scene.add(new THREE.AmbientLight(0x404080, 0.45))
        const sun = new THREE.DirectionalLight(0xffeacc, 1.4)
        sun.position.set(15, 25, 12)
        three.scene.add(sun)

        // ---- 5. starfield ----
        const starfield = createStarfield()
        three.scene.add(starfield.stars)

        // ---- 6. nave ----
        const { ship, engines, dispose: disposeShip } = createShip()
        three.scene.add(ship)

        // ---- 7. entidades ----
        const asteroidObjects = []
        const laserObjects = []
        const explosionObjects = []
        let spawnTimer = 0
        let wave = 1
        let kills = 0
        let goal = 6
        let shake = 0

        // ---- 8. input ----
        three.keys = Object.create(null)
        function onKeyDown(e) {
            three.keys[e.code] = true
            if (e.code === 'Space') e.preventDefault()
            // cria/retoma o AudioContext — browser exige gesto do usuário
            resumeAudio()
            // Escape durante o jogo → volta ao menu
            if (e.code === 'Escape' && gameStateRef.current.running) onMenu()
            // R reinicia direto sem passar pelo menu
            if (e.code === 'KeyR' && gameStateRef.current.running) onRestart()
        }
        function onKeyUp(e) { three.keys[e.code] = false }
        window.addEventListener('keydown', onKeyDown)
        window.addEventListener('keyup', onKeyUp)

        // ---- 9. loop ----
        let animId
        let last = performance.now()

        // guarda a sessão atual para detectar quando uma nova partida começa
        // usar session em vez de prevRunning permite resetar mesmo com running já true
        // (ex: jogador pressiona R para reiniciar sem passar pelo menu)
        let currentSession = gameStateRef.current.session
        let wasGameOver = false  // detecta transição para game over e toca o som uma vez

        // reseta tudo que carrega estado entre partidas
        // chamado no início de cada nova sessão (início + reinício)
        function resetGame() {
            // remove e libera todos os asteroides ainda na cena
            for (const a of asteroidObjects) {
                three.scene.remove(a.mesh)
                a.dispose()            // libera geo + mat da GPU
            }
            asteroidObjects.length = 0 // esvazia o array sem realocar

            // remove lasers (geo/mat são compartilhados, só removemos da cena)
            disposeLasers(laserObjects, three.scene)

            // remove partículas de explosão ainda animando
            disposeExplosions(explosionObjects, three.scene)

            // reseta variáveis de progressão do loop
            wave = 1
            kills = 0
            goal = 6
            spawnTimer = 0
            shake = 0

            // volta a nave para o centro da tela
            ship.position.set(0, 0, 0)
            ship.rotation.set(0, 0, 0)

            // volta câmera para posição inicial (pode estar deslocada pelo shake)
            three.camera.position.set(0, 4, 14)

            // reseta cooldown do laser — lastShot vive no módulo lasers.js,
            // por isso precisamos de uma função exportada para acessá-lo
            resetLaserCooldown()

            // atualiza last para agora, evitando um dt gigante no primeiro frame
            // (o jogador pode ter ficado minutos no menu antes de reiniciar)
            last = performance.now()
        }

        function loop() {
            animId = requestAnimationFrame(loop)
            const now = performance.now()
            const dt = Math.min((now - last) / 16.67, 3)
            last = now

            const { running, session, gameOver } = gameStateRef.current

            // session diferente = nova partida (funciona de menu E mid-game com R)
            // este bloco roda UMA vez por partida, no primeiro frame após o clique
            if (running && session !== currentSession) {
                currentSession = session
                wasGameOver = false
                resetGame()
            }

            // detecta transição para game over e toca o som uma única vez
            if (gameOver && !wasGameOver) {
                wasGameOver = true
                playGameOver()
            }

            // estrelas (sempre)
            starfield.stars.rotation.y += 0.0002 * dt
            starfield.stars.rotation.x += 0.00007 * dt

            // bob idle
            if (!running) {
                ship.position.y = Math.sin(now * 0.0025) * 0.08 * 0.2
            }

            if (running) {
                // movimento
                const speed = 0.32 * dt
                if (three.keys.ArrowLeft  || three.keys.KeyA) ship.position.x -= speed
                if (three.keys.ArrowRight || three.keys.KeyD) ship.position.x += speed
                if (three.keys.ArrowUp    || three.keys.KeyW) ship.position.y += speed
                if (three.keys.ArrowDown  || three.keys.KeyS) ship.position.y -= speed

                ship.position.x = Math.max(-12, Math.min(12, ship.position.x))
                ship.position.y = Math.max(-7,   Math.min(7,  ship.position.y))

                // banking
                const rollTarget  = (three.keys.KeyA || three.keys.ArrowLeft  ? 0.5 : 0)
                                  - (three.keys.KeyD || three.keys.ArrowRight  ? 0.5 : 0)
                const pitchTarget = (three.keys.KeyW || three.keys.ArrowUp    ? -0.18 : 0)
                                  + (three.keys.KeyS || three.keys.ArrowDown   ?  0.18 : 0)
                ship.rotation.z += (rollTarget  - ship.rotation.z) * 0.12 * dt
                ship.rotation.x += (pitchTarget - ship.rotation.x) * 0.12 * dt

                // pulso motores
                const pulse = 2.4 + Math.sin(now * 0.02) * 0.6
                for (const e of engines) e.material.emissiveIntensity = pulse

                // tiro — tryShoot retorna true só se o cooldown já passou
                if (three.keys.Space && tryShoot(ship.position, now, three.scene, laserObjects)) {
                    playLaser()
                }

                // spawn
                spawnTimer -= dt
                if (spawnTimer <= 0) {
                    const a = createAsteroid(wave)
                    three.scene.add(a.mesh)
                    asteroidObjects.push(a)
                    spawnTimer = Math.max(8, 38 - wave * 3)
                }

                // lasers
                for (let i = laserObjects.length - 1; i >= 0; i--) {
                    const l = laserObjects[i]
                    l.position.z -= 1.6 * dt
                    let consumed = false

                    for (let j = asteroidObjects.length - 1; j >= 0; j--) {
                        const a = asteroidObjects[j]
                        if (l.position.distanceTo(a.mesh.position) < a.mesh.userData.r + 0.45) {
                            explodeAt(a.mesh.position, three.scene, explosionObjects, 0xffcc44, 70)
                            playExplosion(a.mesh.userData.r)  // tamanho do asteroide afeta o boom
                            three.scene.remove(a.mesh)
                            a.dispose()
                            asteroidObjects.splice(j, 1)

                            kills++
                            onScore(Math.round(10 * a.mesh.userData.r))

                            if (kills >= goal) {
                                wave++
                                kills = 0
                                goal = 6 + wave * 2
                                onWaveChange(wave)
                                playWaveUp()
                            }

                            consumed = true
                            break
                        }
                    }

                    if (consumed || l.position.z < -160) {
                        three.scene.remove(l)
                        laserObjects.splice(i, 1)
                    }
                }

                // asteroides × nave
                for (let i = asteroidObjects.length - 1; i >= 0; i--) {
                    const a = asteroidObjects[i]
                    a.mesh.position.x += a.mesh.userData.vel.x * dt
                    a.mesh.position.y += a.mesh.userData.vel.y * dt
                    a.mesh.position.z += a.mesh.userData.vel.z * dt
                    a.mesh.rotation.x += a.mesh.userData.spin.x * dt
                    a.mesh.rotation.y += a.mesh.userData.spin.y * dt
                    a.mesh.rotation.z += a.mesh.userData.spin.z * dt

                    // colisão com nave
                    if (a.mesh.position.distanceTo(ship.position) < a.mesh.userData.r + 0.95) {
                        explodeAt(a.mesh.position, three.scene, explosionObjects, 0xff3322, 110)
                        playShipHit()    // impacto grave
                        playExplosion(a.mesh.userData.r)  // explosão do asteroide junto
                        three.scene.remove(a.mesh)
                        a.dispose()
                        asteroidObjects.splice(i, 1)
                        shake = 22
                        onLoseLife()
                        continue
                    }

                    if (a.mesh.position.z > 24) {
                        three.scene.remove(a.mesh)
                        a.dispose()
                        asteroidObjects.splice(i, 1)
                    }
                }

                // camera shake
                if (shake > 0) {
                    shake -= dt
                    three.camera.position.x = (Math.random() - 0.5) * 0.45
                    three.camera.position.y = 4 + (Math.random() - 0.5) * 0.45
                } else {
                    three.camera.position.x += (0 - three.camera.position.x) * 0.1 * dt
                    three.camera.position.y += (4 - three.camera.position.y) * 0.1 * dt
                }
            }

            // explosões (sempre, mesmo pausado)
            updateExplosions(explosionObjects, three.scene, dt)

            three.renderer.render(three.scene, three.camera)
        }

        loop()

        // ---- 10. resize ----
        function onResize() {
            three.camera.aspect = window.innerWidth / window.innerHeight
            three.camera.updateProjectionMatrix()
            three.renderer.setSize(window.innerWidth, window.innerHeight)
        }
        window.addEventListener('resize', onResize)

        // ---- 11. cleanup ----
        return () => {
            cancelAnimationFrame(animId)
            window.removeEventListener('resize', onResize)
            window.removeEventListener('keydown', onKeyDown)
            window.removeEventListener('keyup', onKeyUp)
            disposeExplosions(explosionObjects, three.scene)
            disposeLasers(laserObjects, three.scene)
            disposeLaserResources()
            for (const a of asteroidObjects) {
                three.scene.remove(a.mesh)
                a.dispose()
            }
            starfield.dispose()
            disposeShip()
            disposeAudio()
            three.renderer.dispose()
            mount.removeChild(three.renderer.domElement)
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div ref={mountRef} style={{ position: 'fixed', inset: 0 }} />
    )
}