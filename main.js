import * as THREE from 'three' // TO DO: optimize imports for bundle
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'
import atmosphereVertexShader from './shaders/atmosphereVertex.glsl'
import atmosphereFragmentShader from './shaders/atmosphereFragment.glsl'

import { locations } from './locations'

const canvasContainer = document.querySelector('#canvasContainer')

const EARTH_RADIUS = 6
const LOC_NAME = 'loc'
const EARTH_BASE_ROTATION = 0.001
let earthRotation = EARTH_BASE_ROTATION

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
sphere.name = 'earth'

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

const locGeometry = new THREE.SphereGeometry(0.08, 24, 24)
const locMaterial = new THREE.MeshStandardMaterial({color: 0xFF0000})

const loc = new THREE.Mesh( locGeometry, locMaterial)
loc.name = LOC_NAME

let lat = locations[0].lat
let lon = locations[0].lon

lat = ( lat ) * Math.PI / 180
lon = ( lon ) * Math.PI / 180 + Math.PI / 2

const locX = Math.cos(lat) * Math.sin(lon) * EARTH_RADIUS
const locY = Math.sin(lat) * EARTH_RADIUS
const locZ = Math.cos(lat) * Math.cos(lon) * EARTH_RADIUS


loc.position.set(locX, locY, locZ)
scene.add(loc)

// ambient light

const light = new THREE.AmbientLight( 0x404040 )
scene.add( light );

camera.position.z = 15

const raycaster = new THREE.Raycaster()
const mouseVec = new THREE.Vector2()

const controls = new OrbitControls(camera, canvasContainer)

let selectedLoc = null;

function selectLoc(){
  earthRotation = 0;
  selectedLoc.geometry = new THREE.SphereGeometry(0.2, 24, 24)
  const overlay = document.querySelector('.location');
  overlay.classList.remove('hidden')

  overlay.querySelector('h1').innerHTML = locations[0].name
  overlay.querySelector('.img-wrapper').innerHTML = `<img src=${locations[0].imgPath}>`
  overlay.querySelector('.overlay-p').innerHTML = locations[0].description
}

function unselectLoc(){
  earthRotation = EARTH_BASE_ROTATION
  selectedLoc.geometry = locGeometry
  const overlay = document.querySelector('.location');
  overlay.classList.add('hidden')
}

const close = document.getElementById( 'close' );
close.addEventListener( 'click', unselectLoc );

function onClick(event){
  raycaster.setFromCamera(mouseVec, camera)
  let intersects = raycaster.intersectObjects(scene.children)
  if (intersects.length > 0) {
    selectedLoc = intersects[0].object
    console.log(selectedLoc.name)
    console.log(selectedLoc.geometry)
    if (selectedLoc.name === LOC_NAME){
      selectLoc()
    }
  }
}

function onMouseMove ( event ) {

  mouseVec.x = ( event.clientX / canvasContainer.offsetWidth ) * 2 - 3
  mouseVec.y = - ( event.clientY / canvasContainer.offsetHeight ) * 2 + 1

}


canvasContainer.addEventListener('mousemove', onMouseMove, false)
canvasContainer.addEventListener('click', onClick)


function animate() {
  requestAnimationFrame( animate )
  renderer.render(scene, camera)

  sphere.rotation.y += earthRotation

  loc.position.set(
    locX * Math.cos(sphere.rotation.y) + locZ * Math.sin(sphere.rotation.y),
    locY,
    - locX * Math.sin(sphere.rotation.y) + locZ * Math.cos(sphere.rotation.y)
  )

  controls.update()
}

animate()