# 🚀 Cosmic Drift

> Um jogo de nave espacial 3D construído do zero com React + Three.js — sem engines, sem atalhos.

![Cosmic Drift](https://img.shields.io/badge/status-em%20desenvolvimento-00f0ff?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react)
![Three.js](https://img.shields.io/badge/Three.js-r160-white?style=for-the-badge&logo=threedotjs)
![Vite](https://img.shields.io/badge/Vite-5-646cff?style=for-the-badge&logo=vite)

---

## 🎮 Demo

**[▶ Jogar agora](#)** ← *(deploy em breve)*

```
WASD ou ← ↑ ↓ →   mover a nave
ESPAÇO             atirar
```

---

## 📸 Screenshots

> nave se movendo entre asteroides com bloom e starfield ao fundo

---

## 💡 Sobre o projeto

Cosmic Drift começou como um único arquivo HTML de 400 linhas misturando Three.js, física, áudio e UI num script só. O desafio foi **refatorar esse código para uma arquitetura React modular e profissional** — mantendo o jogo funcionando a cada passo.

O projeto foi desenvolvido com foco em três princípios:

- **Separação de responsabilidades** — lógica de jogo isolada em `game/`, UI em `components/`, estado em `App`
- **Memory management correto** — dispose de geometrias e materiais na GPU a cada objeto removido
- **React + imperative code** — integração limpa entre o modelo declarativo do React e o loop imperativo do Three.js

---

## 🏗️ Arquitetura

```
src/
├── App.jsx                  # estado global (score, lives, wave)
├── components/
│   ├── GameCanvas.jsx       # Three.js, game loop, física, colisão
│   ├── HUD.jsx              # score, wave, vidas — UI pura
│   └── Overlay.jsx          # menu início e game over
└── game/                    # lógica pura — sem dependência de React
    ├── starfield.js         # campo de 6000 estrelas procedurais
    ├── ship.js              # geometria e materiais da nave
    ├── asteroids.js         # spawn e física dos asteroides
    ├── lasers.js            # tiros com cooldown e object pooling
    └── explosion.js         # sistema de partículas
```

### Por que essa separação?

A pasta `game/` não sabe que React existe. Se amanhã o projeto migrar para Vue ou Svelte, zero código de lógica precisa mudar. Cada módulo expõe uma interface consistente:

```js
const { mesh, dispose } = createAsteroid(wave)
// dispose() libera geometria e material da GPU quando o objeto é removido
```

---

## ⚙️ Decisões técnicas

### Game loop com delta time normalizado

```js
const dt = Math.min((now - last) / 16.67, 3)
// garante velocidade consistente em qualquer hardware
// o cap em 3 evita tunneling ao trocar de aba
```

### React + Three.js sem conflito

React controla a UI. Three.js controla o canvas. Os dois nunca disputam o mesmo elemento.

```jsx
// useRef guarda o estado do Three.js sem causar re-render
const threeRef = useRef({})

// gameStateRef resolve stale closure no loop
const gameStateRef = useRef(gameState)
useEffect(() => { gameStateRef.current = gameState }, [gameState])
```

### Object pooling de materiais

```js
// geometria e material criados uma vez, compartilhados por todos os lasers
const laserMat = new THREE.MeshBasicMaterial({ color: 0x00ffff })
const laserGeo = new THREE.CylinderGeometry(0.07, 0.07, 1.6, 6)
```

### Memory management

Todo objeto removido da cena libera seus recursos da GPU:

```js
function dispose() {
    geo.dispose()   // libera da VRAM
    mat.dispose()   // libera da VRAM
}
```

---

## 🧠 O que foi implementado

| Feature | Status |
|---|---|
| Starfield procedural (6000 estrelas) | ✅ |
| Nave 3D com geometria customizada | ✅ |
| Movimento com banking e pitch | ✅ |
| Pulso dos motores animado | ✅ |
| Sistema de tiro com cooldown | ✅ |
| Asteroides com física e rotação | ✅ |
| Colisão laser × asteroide | ✅ |
| Colisão asteroide × nave | ✅ |
| Explosões de partículas | ✅ |
| Camera shake ao levar dano | ✅ |
| HUD (score, wave, vidas) | ✅ |
| Overlay de início e game over | ✅ |
| Wave progression | ✅ |
| Áudio Web Audio API | 🔜 |
| Bloom pós-processamento | 🔜 |
| Deploy | 🔜 |

---

## 🚀 Rodando localmente

```bash
# clone o repositório
git clone https://github.com/luucassp/cosmic-drift-.git
cd cosmic-drift-

# instale as dependências
npm install

# rode em modo desenvolvimento
npm run dev
```

Acesse `http://localhost:5173`

---

## 📚 O que aprendi

Este projeto foi um exercício deliberado nos seguintes conceitos:

- **Game loop** com `requestAnimationFrame` e delta time
- **Stale closure** em React e como resolver com `useRef`
- **Memory leak em WebGL** — dispose de geometrias, materiais e texturas
- **Object pooling** — compartilhamento de recursos na GPU
- **Detecção de colisão O(n²)** e seus limites de escala
- **Tunneling** — por que objetos rápidos atravessam colisões
- **Single source of truth** — App como único dono do estado
- **Integração imperative/declarative** — Three.js dentro do modelo React

---

## 🛠️ Tech stack

| Tecnologia | Uso |
|---|---|
| React 18 | UI, estado, ciclo de vida |
| Three.js r160 | Renderização 3D, WebGL |
| Vite 5 | Build e dev server |
| Web Audio API | Síntese de áudio (em breve) |

---

## 📁 Estrutura de commits

```
feat: estrutura base React + Vite
feat: HUD com score, wave e lives
feat: starfield procedural + game canvas
feat: nave com movimento e banking
feat: asteroides com spawn e dispose
feat: lasers + colisão + score
feat: overlay + colisão nave + explosões + game over
fix: cleanup order + memory management
```

---

## 👨‍💻 Autor

**SERGIO LUCAS PEREIRA** — desenvolvedor em formação, construindo projetos reais para aprender conceitos reais.

[![GitHub](https://img.shields.io/badge/GitHub-luucassp-181717?style=flat&logo=github)](https://github.com/luucassp)

---

*Projeto desenvolvido como exercício de arquitetura front-end, integração React + WebGL e boas práticas de engenharia de software.*
