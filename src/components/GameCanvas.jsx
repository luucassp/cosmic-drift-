import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function GameCanvas({ gameState, onScore, onLoseLife, onGameOver }) {
    const mountRef = useRef(null)      // referência ao div que vai conter o canvas
    const threeRef = useRef({})        // guarda tudo do Three.js sem causar re-render

    useEffect(() => {
        const mount = mountRef.current
        const three = threeRef.current

        // ---- setup ----
        three.renderer = new THREE.WebGLRenderer({ antialias: true })
        three.renderer.setSize(window.innerWidth, window.innerHeight)
        three.renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
        mount.appendChild(three.renderer.domElement)

        three.scene = new THREE.Scene()
        three.scene.fog = new THREE.FogExp2(0x05010f, 0.0055)

        three.camera = new THREE.PerspectiveCamera(
            72,
            window.innerWidth / window.innerHeight,
            0.1,
            2000
        )
        three.camera.position.set(0, 4, 14)
        three.camera.lookAt(0, 0, 0)

        // ---- luz ----
        three.scene.add(new THREE.AmbientLight(0x404080, 0.45))
        const sun = new THREE.DirectionalLight(0xffeacc, 1.4)
        sun.position.set(15, 25, 12)
        three.scene.add(sun)

        // ---- loop básico ----
        let animId
        let last = performance.now()

        function loop() {
            animId = requestAnimationFrame(loop)
            const now = performance.now()
            const dt = Math.min((now - last) / 16.67, 3)
            last = now

            three.renderer.render(three.scene, three.camera)
        }

        loop()

        // ---- resize ----
        function onResize() {
            three.camera.aspect = window.innerWidth / window.innerHeight
            three.camera.updateProjectionMatrix()
            three.renderer.setSize(window.innerWidth, window.innerHeight)
        }
        window.addEventListener('resize', onResize)

        // ---- cleanup (lembra do que aprendemos?) ----
        return () => {
            cancelAnimationFrame(animId)        // para o loop
            window.removeEventListener('resize', onResize)
            three.renderer.dispose()            // libera GPU
            mount.removeChild(three.renderer.domElement)
        }

    }, []) // [] = roda uma vez

    return (
        <div
            ref={mountRef}
            style={{ position: 'fixed', inset: 0 }}
        />
    )
}