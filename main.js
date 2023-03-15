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
  antialias: true, // sharpen rendering, smoother
  canvas: document.querySelector('canvas')
})

renderer.setSize(canvasContainer.offsetWidth, canvasContainer.offsetHeight)
renderer.setPixelRatio(window.devicePixelRatio)

// sphere

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(EARTH_RADIUS, 50, 50),
  new THREE.ShaderMaterial({
    vertexShader,
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

const LOC_GEOMETRY = new THREE.SphereGeometry(0.08, 24, 24)
const LOC_MATERIAL = new THREE.MeshStandardMaterial({color: 0xFF0000})

let locationsList = new Array()
let locXYZList = new Array()

function addLocation(index){
  let loc = new THREE.Mesh( LOC_GEOMETRY, LOC_MATERIAL)
  loc.name = `${LOC_NAME}${index}`

  let lat = locations[index].lat
  let lon = locations[index].lon

  let locX, locY, locZ
  
  [locX, locY, locZ] = coordsToXYZ(lat, lon)
  locXYZList.push([locX, locY, locZ])
  
  loc.position.set(locX, locY, locZ)
  scene.add(loc)

  locationsList.push(loc)
}

function coordsToXYZ(lat, lon){
  lat = ( lat ) * Math.PI / 180
  lon = ( lon ) * Math.PI / 180 + Math.PI / 2
  
  const locX = Math.cos(lat) * Math.sin(lon) * EARTH_RADIUS
  const locY = Math.sin(lat) * EARTH_RADIUS
  const locZ = Math.cos(lat) * Math.cos(lon) * EARTH_RADIUS

  return [locX, locY, locZ]
}

for (let i = 0; i < locations.length; i++){
  addLocation(i)
}

function rotateLocation(loc, i){
  const locX = locXYZList[i][0]
  const locY = locXYZList[i][1]
  const locZ = locXYZList[i][2]

  loc.position.set(
    locX * Math.cos(sphere.rotation.y) + locZ * Math.sin(sphere.rotation.y),
    locY,
    - locX * Math.sin(sphere.rotation.y) + locZ * Math.cos(sphere.rotation.y)
  )
}


// ambient light

const light = new THREE.AmbientLight( 0x404040 )
scene.add( light );

camera.position.z = 15

const raycaster = new THREE.Raycaster()
const mouseVec = new THREE.Vector2()

const controls = new OrbitControls(camera, canvasContainer)

let selectedLoc = [];

// TO DO CODE CLEAN essa bagunça das locs

function selectLoc(index){
  if (selectedLoc.length >= 2) unselectLoc(2);
  earthRotation = 0;
  selectedLoc[selectedLoc.length - 1].geometry = new THREE.SphereGeometry(0.2, 24, 24)
  const overlay = document.querySelector('.location');
  overlay.classList.remove('hidden')

  overlay.querySelector('h1').innerHTML = locations[index].name
  overlay.querySelector('.img-wrapper').innerHTML = `<img src=${locations[index].imgPath}>`
  overlay.querySelector('.overlay-p').innerHTML = locations[index].description
}

function unselectLoc(unselectIndex = 1){
  earthRotation = EARTH_BASE_ROTATION
  const overlay = document.querySelector('.location');
  overlay.classList.add('hidden')
  selectedLoc[selectedLoc.length - unselectIndex].geometry = LOC_GEOMETRY
}

const close = document.getElementById( 'close' );
close.addEventListener( 'click', () => unselectLoc() );

function onClick(event){
  raycaster.setFromCamera(mouseVec, camera)
  let intersects = raycaster.intersectObjects(scene.children)

  if (intersects.length <= 0) return
  if (!intersects[0].object.name.includes(LOC_NAME)) return 

  if (selectedLoc.length >= 2) selectedLoc.shift()
  selectedLoc.push(intersects[0].object)
  let locIndex = selectedLoc[selectedLoc.length - 1].name.split(LOC_NAME)[1] * 1
  selectLoc(locIndex)
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

  for (let i = 0; i < locationsList.length; i++){
    rotateLocation(locationsList[i], i)
  }

  controls.update()
}

animate()