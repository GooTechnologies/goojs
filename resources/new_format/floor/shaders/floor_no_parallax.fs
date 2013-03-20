precision mediump float;
uniform sampler2D diffuseMap;
uniform sampler2D normalMap;
uniform sampler2D displaceMap;
uniform samplerCube cubeMap;
uniform vec4 materialAmbient;
uniform vec4 materialDiffuse;

varying vec2 texCoord0;
varying vec3 eyeVec;
varying vec3 lightVec;
varying mat3 TBN;
varying mat3 TBNi;

void main(void)
{
 vec3 tangentSpaceToEye = TBNi * -eyeVec;
 vec2 newCoords = texCoord0;

 vec4 texColor = texture2D(diffuseMap, newCoords);
 vec3 bump = texture2D(normalMap, newCoords).rgb * 2.0 - 1.0;

 vec3 normal = TBN * bump;
 float NdotL = dot(normal, normalize(lightVec));

 float diffuse = max(NdotL, 0.0 );
 vec4 intensity = diffuse * materialDiffuse + materialAmbient;

 gl_FragColor = texColor * intensity;
}