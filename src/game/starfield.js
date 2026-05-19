import * as THREE from 'three'

export function createStarfield() {
    const N = 6000
    const pos = new Float32Array(N * 3)
    const col = new Float32Array(N * 3)
    const tint = new THREE.Color()

    for (let i = 0; i < N; i++) {
        pos[i * 3 + 0] = (Math.random() - 0.5) * 1200
        pos[i * 3 + 1] = (Math.random() - 0.5) * 1200
        pos[i * 3 + 2] = (Math.random() - 0.5) * 1200
        tint.setHSL(Math.random(), 0.4, 0.65 + Math.random() * 0.3)
        col[i * 3 + 0] = tint.r
        col[i * 3 + 1] = tint.g
        col[i * 3 + 2] = tint.b
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3))

    const mat = new THREE.PointsMaterial({
        size: 0.7,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
    })

    const stars = new THREE.Points(geo, mat)

    // dispose: libera GPU quando não precisar mais
    function dispose() {
        geo.dispose()
        mat.dispose()
    }

    return { stars, dispose }
}