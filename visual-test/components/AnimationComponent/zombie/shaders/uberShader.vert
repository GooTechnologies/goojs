attribute vec3 vertexPosition;
#ifdef NORMAL
attribute vec3 vertexNormal;
#endif
#ifdef TANGENT
attribute vec4 vertexTangent;
#endif
#ifdef COLOR
attribute vec4 vertexColor;
#endif
#ifdef TEXCOORD0
attribute vec2 vertexUV0;
varying vec2 texCoord0;
#endif
#ifdef TEXCOORD1
attribute vec2 vertexUV1;
varying vec2 texCoord1;
#endif
#ifdef JOINTIDS
attribute vec4 vertexJointIDs;
#endif
#ifdef WEIGHTS
attribute vec4 vertexWeights;
#endif
uniform mat4 viewProjectionMatrix;
uniform mat4 worldMatrix;
uniform vec3 cameraPosition;
varying vec3 vWorldPos;
varying vec3 viewPosition;
#ifdef NORMAL
varying vec3 normal;
#endif
#ifdef TANGENT
varying vec3 binormal;
varying vec3 tangent;
#endif
#ifdef COLOR
varying vec4 color;
#endif
#ifdef SHADOW_MAP
uniform mat4 lightViewMatrix;
uniform mat4 lightProjectionMatrix;
varying vec4 lPosition;
const mat4 ScaleMatrix = mat4(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);
#endif
#ifdef JOINT_COUNT
uniform mat4 jointPalette[JOINT_COUNT];
#endif
void main(void) {
vec4 pos = vec4(vertexPosition, 1.0);
mat4 newWorldMatrix = worldMatrix;
#ifdef JOINT_COUNT
#ifdef WEIGHTS
#ifdef JOINTIDS
mat4 mat = mat4(0.0);
mat += jointPalette[int(vertexJointIDs.x)] * vertexWeights.x;
mat += jointPalette[int(vertexJointIDs.y)] * vertexWeights.y;
mat += jointPalette[int(vertexJointIDs.z)] * vertexWeights.z;
mat += jointPalette[int(vertexJointIDs.w)] * vertexWeights.w;
	newWorldMatrix = mat * newWorldMatrix;
#endif
#endif
#endif
vec4 worldPos = newWorldMatrix * pos;
vWorldPos = worldPos.xyz;
gl_Position = viewProjectionMatrix * worldPos;
viewPosition = cameraPosition - worldPos.xyz;
#ifdef NORMAL
	normal = normalize((newWorldMatrix * vec4(vertexNormal, 0.0)).xyz);
#endif
#ifdef TANGENT
	tangent = normalize((newWorldMatrix * vec4(vertexTangent.xyz, 0.0)).xyz);
	binormal = cross(normal, tangent) * vec3(vertexTangent.w);
#endif
#ifdef COLOR
	color = vertexColor;
#endif
#ifdef TEXCOORD0
	texCoord0 = vertexUV0;
#endif
#ifdef TEXCOORD1
	texCoord1 = vertexUV1;
#endif
#ifdef SHADOW_MAP
lPosition = ScaleMatrix * lightProjectionMatrix * lightViewMatrix * worldPos;
#endif
}