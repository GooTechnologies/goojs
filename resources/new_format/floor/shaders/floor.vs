attribute vec3 vertexPosition;
attribute vec2 vertexUV0;
attribute vec3 vertexNormal;
attribute vec4 vertexTangent;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 worldMatrix;
uniform vec3 cameraPosition;
uniform vec3 lightPosition;
uniform float moveX;
uniform float moveZ;
uniform float time;

varying vec2 texCoord0;
varying vec3 eyeVec;
varying vec3 lightVec;
varying mat3 TBN;
varying mat3 TBNi;

void main(void) {
 texCoord0 = vertexUV0 + vec2(moveX*time,moveZ*time);

 vec3 worldPos = (worldMatrix * vec4(vertexPosition, 1.0)).xyz;

 mat3 normalMatrix = mat3(viewMatrix * worldMatrix);

 vec3 n = vertexNormal;
 vec3 t = vertexTangent.xyz;
 vec3 b = cross(n, t) * vertexTangent.w;
 TBN = normalMatrix * mat3(t, b, n);

 TBNi = mat3(TBN[0][0], TBN[1][0], TBN[2][0],
  TBN[0][1], TBN[1][1], TBN[2][1],
  TBN[0][2], TBN[1][2], TBN[2][2]);

 vec3 eyeDir = normalize(worldPos - cameraPosition);
 eyeVec = normalMatrix * eyeDir;
 vec3 lightDir = normalize(lightPosition - worldPos);
 lightVec = normalMatrix * lightDir;

 gl_Position = projectionMatrix * viewMatrix * worldMatrix * vec4(vertexPosition, 1.0);
}