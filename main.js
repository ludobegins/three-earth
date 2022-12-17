import { SphereGeometry } from 'three'
import './style.css'

import * as THREE from 'three'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'

import atmosphereVertexShader from './shaders/atmosphereVertex.glsl'
import atmosphereFragmentShader from './shaders/atmosphereFragment.glsl'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera( 75, innerWidth / innerHeight, 0.1, 1000 )

const renderer = new THREE.WebGLRenderer({
  // sharpen rendering, smoother
  antialias: true
})
renderer.setSize(innerWidth, innerHeight)

// better resolution
renderer.setPixelRatio(window.devicePixelRatio)

document.body.appendChild( renderer.domElement )

// sphere

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(5, 50, 50),
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

scene.add(sphere)

// atmosphere

const atmosphere = new THREE.Mesh(
  new THREE.SphereGeometry(5.5, 50, 50),
  new THREE.ShaderMaterial({
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
  })
)

scene.add(atmosphere)

camera.position.z = 15

function animate() {
  requestAnimationFrame( animate )
  renderer.render(scene, camera)
}

animate()
