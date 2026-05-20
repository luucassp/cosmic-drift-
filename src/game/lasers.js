import * as THREE from 'three'

// geometria e material compartilhados — criados uma vez
const laserMat = new THREE.MeshBasicMaterial({ color: 0x00ffff })
const laserGeo = new THREE.CylinderGeometry(0.07, 0.07, 1.6, 6)

let lastShot = 0

// retorna true se atirou, false se ainda em cooldown
// o chamador usa o retorno para decidir se toca o som do laser
export function tryShoot(shipPosition, now, scene, laserObjects) {
    if (now - lastShot < 130) return false

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

    return true
}

export function disposeLasers(laserObjects, scene) {
    for (const l of laserObjects) {
        scene.remove(l)
        // não damos dispose no geo/mat — são compartilhados
        // só damos dispose quando o jogo encerrar de vez
    }
    laserObjects.length = 0
}

// chamado uma única vez no cleanup final (quando o componente desmonta)
export function disposeLaserResources() {
    laserGeo.dispose()
    laserMat.dispose()
}

// reseta o cooldown entre partidas
// necessário porque lastShot é variável de MÓDULO — sobrevive entre sessões de jogo
// sem isso, o jogador começa o novo jogo ainda em cooldown se morreu logo após atirar
export function resetLaserCooldown() {
    lastShot = 0
}