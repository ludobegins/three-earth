import * as THREE from 'three' // TO DO: optimize imports for bundle
import gsap from 'gsap' // animation library

import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'
import atmosphereVertexShader from './shaders/atmosphereVertex.glsl'
import atmosphereFragmentShader from './shaders/atmosphereFragment.glsl'


const canvasContainer = document.querySelector('#canvasContainer')

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera( 75, canvasContainer.offsetWidth / canvasContainer.offsetHeight, 0.1, 1000 )

const renderer = new THREE.WebGLRenderer({
  // sharpen rendering, smoother
  antialias: true,
  canvas: document.querySelector('canvas')
})

renderer.setSize(canvasContainer.offsetWidth, canvasContainer.offsetHeight)

// better resolution
renderer.setPixelRatio(window.devicePixelRatio)

// sphere

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(6, 50, 50),
  // new THREE.MeshBasicMaterial({
  //   map: new THREE.TextureLoader().load('img/earth_uv.jpg')
  // })
  new THREE.ShaderMaterial({
    vertexShader: vertexShader, // JS tip: could write only 'vertexShader'
    fragmentShader,
    uniforms: {
      globeTexture: {
        value: new THREE.TextureLoader().load('img/earth_uv.jpg')
      }
    }
  })
)

// atmosphere

const atmosphere = new THREE.Mesh(
  new THREE.SphereGeometry(6.6, 50, 50),
  new THREE.ShaderMaterial({
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
  })
)

scene.add(atmosphere)

// container for mouse rotation

const group = new THREE.Group()
group.add(sphere)
scene.add(group)

// stars

const starGeometry = new THREE.BufferGeometry()
const starMaterial = new THREE.PointsMaterial({color: 0xffffff})

const starVertices = []

for (let i = 0; i < 10000; i++){
  const x = (Math.random() - 0.5) * 2000
  const y = (Math.random() - 0.5) * 2000
  const z = - Math.random() * 2000
  starVertices.push(x, y, z)
}

starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3))

const stars = new THREE.Points(starGeometry, starMaterial)
scene.add(stars)

camera.position.z = 15

const mouse = {
  x: 0,
  y: 0
}

function animate() {
  requestAnimationFrame( animate )
  renderer.render(scene, camera)
  sphere.rotation.y += 0.002
  // gsap: smooth mouse movement
  gsap.to(group.rotation, {
    y: mouse.x * 0.5,
    x: - mouse.y * 0.5,
    duration: 2
  })
}

animate()


// get normalized mouse coordinates

addEventListener('mousemove', (e) => {
  mouse.x = ( e.clientX / innerWidth ) * 2 - 1
  mouse.y = - ( e.clientY / innerHeight ) * 2 + 1
})