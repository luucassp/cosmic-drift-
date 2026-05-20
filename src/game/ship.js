import * as THREE from 'three'

export function createShip() {
    const g = new THREE.Group()

    const hull = new THREE.MeshStandardMaterial({
        color: 0x1a2e5c,
        metalness: 0.7,
        roughness: 0.35,
    })
    const accent = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        emissive: 0x00d8ff,
        emissiveIntensity: 2.2,
    })
    const engine = new THREE.MeshStandardMaterial({
        color: 0xff66ff,
        emissive: 0xff33ff,
        emissiveIntensity: 3.0,
    })

    // corpo
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.7, 2.6, 12), hull)
    body.rotation.x = -Math.PI / 2
    g.add(body)

    // asas
    const wingGeo = new THREE.BoxGeometry(2.1, 0.18, 1.0)
    const wingL = new THREE.Mesh(wingGeo, hull)
    wingL.position.set(-1.05, -0.05, 0.4)
    g.add(wingL)
    const wingR = wingL.clone()
    wingR.position.x = 1.05
    g.add(wingR)

    // pontas das asas
    const tipGeo = new THREE.BoxGeometry(0.18, 0.18, 0.6)
    const wingTipL = new THREE.Mesh(tipGeo, accent)
    wingTipL.position.set(-2.05, -0.05, 0.4)
    g.add(wingTipL)
    const wingTipR = wingTipL.clone()
    wingTipR.position.x = 2.05
    g.add(wingTipR)

    // cockpit
    const cockpit = new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2),
        accent
    )
    cockpit.position.set(0, 0.22, -0.1)
    g.add(cockpit)

    // motores
    const engineGeo = new THREE.SphereGeometry(0.22, 10, 8)
    const eL = new THREE.Mesh(engineGeo, engine)
    eL.position.set(-0.55, 0, 1.15)
    g.add(eL)
    const eR = eL.clone()
    eR.position.x = 0.55
    g.add(eR)

    // luz dos motores
    const pl = new THREE.PointLight(0xff44ff, 1.2, 8)
    pl.position.set(0, 0, 1.4)
    g.add(pl)

    // dispose de todos os materiais e geometrias
    function dispose() {
        hull.dispose()
        accent.dispose()
        engine.dispose()
        body.geometry.dispose()
        wingGeo.dispose()
        tipGeo.dispose()
        cockpit.geometry.dispose()
        engineGeo.dispose()
    }

    return { ship: g, engines: [eL, eR], dispose }
}