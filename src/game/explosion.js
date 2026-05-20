import * as THREE from 'three'

export function explodeAt(pos, scene, explosionObjects, color = 0xff8833, count = 90) {
    const positions = new Float32Array(count * 3)
    const velocities = []

    for (let i = 0; i < count; i++) {
        positions[i * 3 + 0] = pos.x
        positions[i * 3 + 1] = pos.y
        positions[i * 3 + 2] = pos.z

        const dir = new THREE.Vector3(
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5,
        ).normalize().multiplyScalar(0.2 + Math.random() * 0.6)

        velocities.push(dir)
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const mat = new THREE.PointsMaterial({
        color,
        size: 0.32,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 1,
        depthWrite: false,
    })

    const pts = new THREE.Points(geo, mat)
    pts.userData = { velocities, life: 1.0, mat }
    scene.add(pts)
    explosionObjects.push(pts)
}

export function updateExplosions(explosionObjects, scene, dt) {
    for (let i = explosionObjects.length - 1; i >= 0; i--) {
        const e = explosionObjects[i]
        const p = e.geometry.attributes.position

        for (let j = 0; j < p.count; j++) {
            const v = e.userData.velocities[j]
            p.setXYZ(j, p.getX(j) + v.x * dt, p.getY(j) + v.y * dt, p.getZ(j) + v.z * dt)
            v.multiplyScalar(0.96)
        }

        p.needsUpdate = true
        e.userData.life -= 0.018 * dt
        e.userData.mat.opacity = Math.max(e.userData.life, 0)

        if (e.userData.life <= 0) {
            scene.remove(e)
            e.geometry.dispose()
            e.userData.mat.dispose()
            explosionObjects.splice(i, 1)
        }
    }
}

export function disposeExplosions(explosionObjects, scene) {
    for (const e of explosionObjects) {
        scene.remove(e)
        e.geometry.dispose()
        e.userData.mat.dispose()
    }
    explosionObjects.length = 0
}