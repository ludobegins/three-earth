import * as THREE from 'three' // TO DO: optimize imports for bundle
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'
import atmosphereVertexShader from './shaders/atmosphereVertex.glsl'
import atmosphereFragmentShader from './shaders/atmosphereFragment.glsl'


const canvasContainer = document.querySelector('#canvasContainer')

const EARTH_RADIUS = 6
const EARTH_ROTATION = 0.002

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
  new THREE.SphereGeometry(EARTH_RADIUS, 50, 50),
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
  new THREE.SphereGeometry(EARTH_RADIUS * 1.1, 50, 50),
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
  const z = (Math.random() - 0.5) * 2000
  starVertices.push(x, y, z)
}

starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3))

const stars = new THREE.Points(starGeometry, starMaterial)
scene.add(stars)

// locations

const locGeometry = new THREE.SphereBufferGeometry(0.08, 24, 24)
const locMaterial = new THREE.MeshStandardMaterial({color: 0xFF0000})

const loc = new THREE.Mesh( locGeometry, locMaterial )

let lat = 18
let lon = -2

lat = ( lat ) * Math.PI / 180
lon = ( lon ) * Math.PI / 180 + Math.PI / 2

const locX = Math.cos(lat) * Math.sin(lon) * EARTH_RADIUS
const locY = Math.sin(lat) * EARTH_RADIUS
const locZ = Math.cos(lat) * Math.cos(lon) * EARTH_RADIUS

console.log('x,y,z:', locX, locY, locZ)

loc.position.set(locX, locY, locZ)
scene.add(loc)

// ambient light

const light = new THREE.AmbientLight( 0x404040 );
scene.add( light );

camera.position.z = 15

const mouse = {
  x: 0,
  y: 0
}

const controls = new OrbitControls(camera, canvasContainer)

function animate() {
  requestAnimationFrame( animate )
  renderer.render(scene, camera)

  sphere.rotation.y += EARTH_ROTATION

  loc.position.set(
    locX * Math.cos(sphere.rotation.y) + locZ * Math.sin(sphere.rotation.y),
    locY,
    - locX * Math.sin(sphere.rotation.y) + locZ * Math.cos(sphere.rotation.y)
  )

  controls.update()
}

animate()