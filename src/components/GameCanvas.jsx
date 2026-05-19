import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { createStarfield } from '../game/starfield'

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

        // ---- 5. starfield (APÓS a scene existir) ----
        const starfield = createStarfield()
        three.scene.add(starfield.stars)

        // ---- 6. loop ----
        let animId
        let last = performance.now()

        function loop() {
            animId = requestAnimationFrame(loop)
            const now = performance.now()
            const dt = Math.min((now - last) / 16.67, 3)
            last = now

            starfield.stars.rotation.y += 0.0002 * dt
            starfield.stars.rotation.x += 0.00007 * dt

            three.renderer.render(three.scene, three.camera)
        }

        loop()

        // ---- 7. resize ----
        function onResize() {
            three.camera.aspect = window.innerWidth / window.innerHeight
            three.camera.updateProjectionMatrix()
            three.renderer.setSize(window.innerWidth, window.innerHeight)
        }
        window.addEventListener('resize', onResize)

        // ---- 8. cleanup ----
        return () => {
            cancelAnimationFrame(animId)
            window.removeEventListener('resize', onResize)
            starfield.dispose()
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