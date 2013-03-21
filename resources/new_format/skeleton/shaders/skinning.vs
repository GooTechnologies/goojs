attribute vec3 vertexPosition;
attribute vec3 vertexNormal;
attribute vec2 vertexUV0;
attribute vec4 vertexWeights;
attribute vec4 vertexJointIDs;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 worldMatrix;
uniform mat4 jointPalette[JOINT_COUNT];
uniform vec3 cameraPosition;
uniform vec3 lightPosition;

varying vec3 normal;
varying vec3 lightDir;
varying vec3 eyeVec;
varying vec2 texCoord0;
varying float depth;

void main(void)
{
	mat4 mat = mat4(0.0);
	mat += jointPalette[int(vertexJointIDs.x)] * vertexWeights.x;
	mat += jointPalette[int(vertexJointIDs.y)] * vertexWeights.y;
	mat += jointPalette[int(vertexJointIDs.z)] * vertexWeights.z;
	mat += jointPalette[int(vertexJointIDs.w)] * vertexWeights.w;
	texCoord0 = vertexUV0;
	vec4 worldPos = worldMatrix * mat * vec4(vertexPosition, 1.0);
	vec4 viewPos = viewMatrix * worldPos;
	depth = viewPos.z;
	gl_Position = projectionMatrix * viewPos;
	normal = (worldMatrix * mat * vec4(vertexNormal, 0.0)).xyz;
	texCoord0 = vertexUV0;
	lightDir = lightPosition - worldPos.xyz;
	eyeVec = cameraPosition - worldPos.xyz;
}
