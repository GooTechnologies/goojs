attribute vec3 vertexPosition;
attribute vec2 vertexUV0;

uniform mat4 worldMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform float moveX;
uniform float moveZ;
uniform float time;

varying vec2 texCoord0;
varying float depth;

void main(void)
{
	vec4 viewPosition = viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);

	texCoord0 = vertexUV0 + vec2(moveX * time, moveZ * time);
	depth = viewPosition.z;

	gl_Position = projectionMatrix * viewPosition;
}
