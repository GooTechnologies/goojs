attribute vec3 vertexPosition;
attribute vec2 vertexUV0;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 worldMatrix;
varying vec2 texCoord0;
void main(void)
{
 texCoord0 = vertexUV0;
 gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);
}