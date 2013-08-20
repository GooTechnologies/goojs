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
uniform vec4 jointPalette[JOINT_COUNT];
#endif
void main(void) {
vec4 pos = vec4(vertexPosition, 1.0);
mat4 newWorldMatrix = worldMatrix;
#ifdef JOINT_COUNT
#ifdef WEIGHTS
#ifdef JOINTIDS
int x = 3*int(vertexJointIDs.x);
int y = 3*int(vertexJointIDs.y);
int z = 3*int(vertexJointIDs.z);
int w = 3*int(vertexJointIDs.w);

mat4 mat = mat4(0.0);

mat += mat4(
	jointPalette[x+0].x, jointPalette[x+1].x, jointPalette[x+2].x, 0,
	jointPalette[x+0].y, jointPalette[x+1].y, jointPalette[x+2].y, 0,
	jointPalette[x+0].z, jointPalette[x+1].z, jointPalette[x+2].z, 0,
	jointPalette[x+0].w, jointPalette[x+1].w, jointPalette[x+2].w, 1
) * vertexWeights.x;
mat += mat4(
	jointPalette[y+0].x, jointPalette[y+1].x, jointPalette[y+2].x, 0,
	jointPalette[y+0].y, jointPalette[y+1].y, jointPalette[y+2].y, 0,
	jointPalette[y+0].z, jointPalette[y+1].z, jointPalette[y+2].z, 0,
	jointPalette[y+0].w, jointPalette[y+1].w, jointPalette[y+2].w, 1
) * vertexWeights.y;
mat += mat4(
	jointPalette[z+0].x, jointPalette[z+1].x, jointPalette[z+2].x, 0,
	jointPalette[z+0].y, jointPalette[z+1].y, jointPalette[z+2].y, 0,
	jointPalette[z+0].z, jointPalette[z+1].z, jointPalette[z+2].z, 0,
	jointPalette[z+0].w, jointPalette[z+1].w, jointPalette[z+2].w, 1
) * vertexWeights.z;
mat += mat4(
	jointPalette[w+0].x, jointPalette[w+1].x, jointPalette[w+2].x, 0,
	jointPalette[w+0].y, jointPalette[w+1].y, jointPalette[w+2].y, 0,
	jointPalette[w+0].z, jointPalette[w+1].z, jointPalette[w+2].z, 0,
	jointPalette[w+0].w, jointPalette[w+1].w, jointPalette[w+2].w, 1
) * vertexWeights.w;

newWorldMatrix = newWorldMatrix * mat;
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