import * as THREE from 'three'

// geometria e material compartilhados — criados uma vez
const laserMat = new THREE.MeshBasicMaterial({ color: 0x00ffff })
const laserGeo = new THREE.CylinderGeometry(0.07, 0.07, 1.6, 6)

let lastShot = 0

export function tryShoot(shipPosition, now, scene, laserObjects) {
    if (now - lastShot < 130) return  // cooldown — máx 1 tiro a cada 130ms

    lastShot = now

    for (const off of [-0.55, 0.55]) {
        const mesh = new THREE.Mesh(laserGeo, laserMat)
        mesh.rotation.x = Math.PI / 2
        mesh.position.set(
            shipPosition.x + off,
            shipPosition.y,
            shipPosition.z - 1,
        )
        scene.add(mesh)
        laserObjects.push(mesh)
    }
}

export function disposeLasers(laserObjects, scene) {
    for (const l of laserObjects) {
        scene.remove(l)
        // não damos dispose no geo/mat — são compartilhados
        // só damos dispose quando o jogo encerrar de vez
    }
    laserObjects.length = 0
}

// chamado uma única vez no cleanup final
export function disposeLaserResources() {
    laserGeo.dispose()
    laserMat.dispose()
}