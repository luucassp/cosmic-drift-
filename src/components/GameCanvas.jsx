import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { createStarfield } from '../game/starfield'
import { createShip } from '../game/ship'
import { createAsteroid } from '../game/asteroids'

export default function GameCanvas({ gameState, onScore, onLoseLife, onGameOver }) {
    const mountRef = useRef(null)
    const threeRef = useRef({})

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
            72,
            window.innerWidth / window.innerHeight,
            0.1,
            2000
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

        // ---- 7. asteroides ----
        const asteroidObjects = []
        let spawnTimer = 0
        let wave = 1
        let kills = 0
        let goal = 6

        // ---- 8. input ----
        three.keys = Object.create(null)

        function onKeyDown(e) {
            three.keys[e.code] = true
            if (e.code === 'Space') e.preventDefault()
        }
        function onKeyUp(e) {
            three.keys[e.code] = false
        }
        window.addEventListener('keydown', onKeyDown)
        window.addEventListener('keyup', onKeyUp)

        // ---- 9. loop ----
        let animId
        let last = performance.now()

        function loop() {
            animId = requestAnimationFrame(loop)
            const now = performance.now()
            const dt = Math.min((now - last) / 16.67, 3)
            last = now

            // estrelas
            starfield.stars.rotation.y += 0.0002 * dt
            starfield.stars.rotation.x += 0.00007 * dt

            // bob idle
            ship.position.y = Math.sin(now * 0.0025) * 0.08 * 0.2

            // movimento
            const speed = 0.32 * dt
            if (three.keys.ArrowLeft  || three.keys.KeyA) ship.position.x -= speed
            if (three.keys.ArrowRight || three.keys.KeyD) ship.position.x += speed
            if (three.keys.ArrowUp    || three.keys.KeyW) ship.position.y += speed
            if (three.keys.ArrowDown  || three.keys.KeyS) ship.position.y -= speed

            // limites
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

            // spawn
            spawnTimer -= dt
            if (spawnTimer <= 0) {
                const a = createAsteroid(wave)
                three.scene.add(a.mesh)
                asteroidObjects.push(a)
                spawnTimer = Math.max(8, 38 - wave * 3)
            }

            // atualiza asteroides
            for (let i = asteroidObjects.length - 1; i >= 0; i--) {
                const a = asteroidObjects[i]
                a.mesh.position.x += a.mesh.userData.vel.x * dt
                a.mesh.position.y += a.mesh.userData.vel.y * dt
                a.mesh.position.z += a.mesh.userData.vel.z * dt
                a.mesh.rotation.x += a.mesh.userData.spin.x * dt
                a.mesh.rotation.y += a.mesh.userData.spin.y * dt
                a.mesh.rotation.z += a.mesh.userData.spin.z * dt

                if (a.mesh.position.z > 24) {
                    three.scene.remove(a.mesh)
                    a.dispose()
                    asteroidObjects.splice(i, 1)
                }
            }

            // renderiza por último
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

        // ---- 11. cleanup (ordem inversa da criação) ----
        return () => {
            cancelAnimationFrame(animId)
            window.removeEventListener('resize', onResize)
            window.removeEventListener('keydown', onKeyDown)
            window.removeEventListener('keyup', onKeyUp)
            for (const a of asteroidObjects) {
                three.scene.remove(a.mesh)
                a.dispose()
            }
            starfield.dispose()
            disposeShip()
            three.renderer.dispose()
            mount.removeChild(three.renderer.domElement)
        }

    }, [])

    return (
        <div
            ref={mountRef}
            style={{ position: 'fixed', inset: 0 }}
        />
    )
}