attribute vec3 vertexPosition;
attribute vec3 vertexNormal;
attribute vec2 vertexUV0;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 worldMatrix;
uniform vec3 cameraPosition;
uniform vec3 lightPosition;
varying vec3 normal;
varying vec3 lightDir;
varying vec3 eyeVec;
varying vec2 texCoord0;
void main(void) {
 vec4 worldPos = worldMatrix * vec4(vertexPosition, 1.0);
 gl_Position = projectionMatrix * viewMatrix * worldPos;
 normal = (worldMatrix * vec4(vertexNormal, 0.0)).xyz;
 texCoord0 = vertexUV0;
 lightDir = lightPosition - worldPos.xyz;
 eyeVec = cameraPosition - worldPos.xyz;
}