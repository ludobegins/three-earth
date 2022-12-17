// vertex shader: tunar os vertices das geometrias
// vertex and fragment shaders necessary for rendering

// see https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram
// for built-in uniforms and attributes
// boilerplate code for custom shader

varying vec2 vertexUV;
varying vec3 vertexNormal;

void main() {
    vertexUV = uv; // provided by 3js
    vertexNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}