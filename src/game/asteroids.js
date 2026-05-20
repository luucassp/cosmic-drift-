import * as THREE from 'three'

export function createAsteroid(wave = 1) {
    const r = 0.7 + Math.random() * 1.6
    const geo = new THREE.IcosahedronGeometry(r, 0)

    // deforma os vértices para parecer rochoso
    const p = geo.attributes.position
    for (let i = 0; i < p.count; i++) {
        const f = 1 + (Math.random() - 0.5) * 0.45
        p.setXYZ(i, p.getX(i) * f, p.getY(i) * f, p.getZ(i) * f)
    }
    geo.computeVertexNormals()

    const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0.05 + Math.random() * 0.1, 0.4, 0.35),
        roughness: 0.9,
        metalness: 0.05,
        flatShading: true,
    })

    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set(
        (Math.random() - 0.5) * 22,
        (Math.random() - 0.5) * 12,
        -140,
    )

    // metadados — lembra do userData do original?
    mesh.userData.r    = r
    mesh.userData.spin = new THREE.Vector3(
        (Math.random() - 0.5) * 0.05,
        (Math.random() - 0.5) * 0.05,
        (Math.random() - 0.5) * 0.05,
    )
    mesh.userData.vel = new THREE.Vector3(
        (Math.random() - 0.5) * 0.04,
        (Math.random() - 0.5) * 0.04,
        0.32 + Math.random() * 0.18 + wave * 0.04,
    )

    function dispose() {
        geo.dispose()
        mat.dispose()
    }

    return { mesh, dispose }
}