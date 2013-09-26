#ifdef DIFFUSE_MAP
uniform sampler2D diffuseMap;
uniform vec2 diffuseRepeat;
#endif
#ifdef NORMAL_MAP
uniform sampler2D normalMap;
#endif
#ifdef SPECULAR_MAP
uniform sampler2D specularMap;
#endif
#ifdef EMISSIVE_MAP
uniform sampler2D emissiveMap;
#endif
#ifdef AO_MAP
uniform sampler2D aoMap;
#endif
#ifdef LIGHT_MAP
uniform sampler2D lightMap;
#endif

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
#ifdef TEXCOORD0
varying vec2 texCoord0;
#endif
#ifdef TEXCOORD1
varying vec2 texCoord1; //Use for lightmap
#endif
uniform vec4 materialAmbient;
uniform vec4 materialEmissive;
uniform vec4 materialDiffuse;
uniform vec4 materialSpecular;
uniform float materialSpecularPower;
#ifndef MAX_DIRECTIONAL_LIGHTS
#define MAX_DIRECTIONAL_LIGHTS 0
#endif
#ifndef MAX_POINT_LIGHTS
#define MAX_POINT_LIGHTS 0
#endif
#ifndef MAX_SPOT_LIGHTS
#define MAX_SPOT_LIGHTS 0
#endif
#if MAX_DIRECTIONAL_LIGHTS > 0
uniform vec4 directionalLightColor[MAX_DIRECTIONAL_LIGHTS];
uniform vec3 directionalLightDirection[MAX_DIRECTIONAL_LIGHTS];
#endif
#if MAX_POINT_LIGHTS > 0
uniform vec4 pointLight[MAX_POINT_LIGHTS];
uniform vec4 pointLightColor[MAX_POINT_LIGHTS];
#endif
#if MAX_SPOT_LIGHTS > 0
uniform vec4 spotLightColor[MAX_SPOT_LIGHTS];
uniform vec4 spotLight[MAX_SPOT_LIGHTS];
uniform vec3 spotLightDirection[MAX_SPOT_LIGHTS];
uniform float spotLightAngle[MAX_SPOT_LIGHTS];
uniform float spotLightExponent[MAX_SPOT_LIGHTS];
#endif
#ifdef SHADOW_MAP
#ifndef SHADOW_TYPE
#define SHADOW_TYPE 0
#endif
uniform vec3 lightPos;
uniform float cameraScale;
varying vec4 lPosition;
uniform sampler2D shadowMap;
float ChebychevInequality(in vec2 moments, in float t) {
if ( t <= moments.x ) return 1.0;
float variance = moments.y - (moments.x * moments.x);
variance = max(variance, 0.02);
float d = t - moments.x;
return variance / (variance + d * d);
}
float VsmFixLightBleed(in float pMax, in float amount) {
return clamp((pMax - amount) / (1.0 - amount), 0.0, 1.0);
}
#endif
void main(void)
{
vec4 final_color = vec4(1.0);
#ifdef DIFFUSE_MAP
final_color *= texture2D(diffuseMap, texCoord0 * diffuseRepeat);
#endif

#ifdef COLOR
final_color *= color;
#endif

#ifdef AO_MAP
#ifdef TEXCOORD1
final_color *= texture2D(aoMap, texCoord1);
#else
final_color *= texture2D(aoMap, texCoord0);
#endif
#endif
#ifdef LIGHT_MAP
#ifdef TEXCOORD1
final_color *= texture2D(lightMap, texCoord1);// * 2.0 - 0.5;
#else
final_color *= texture2D(lightMap, texCoord0);// * 2.0 - 0.5;
#endif
#else

#if defined(TANGENT) && defined(NORMAL_MAP)
mat3 tangentToWorld = mat3(tangent, binormal, normal);
vec3 tangentNormal = texture2D(normalMap, texCoord0).xyz * vec3(2.0) - vec3(1.0);
vec3 worldNormal = (tangentToWorld * tangentNormal);
vec3 N = normalize(worldNormal);
#elif defined(NORMAL)
vec3 N = normalize(normal);
#else
vec3 N = vec3(0.0, 1.0, 0.0);
#endif
#ifdef SPECULAR_MAP
float specularStrength = texture2D(specularMap, texCoord0).x;
#else
float specularStrength = 1.0;
#endif
#if MAX_POINT_LIGHTS > 0
vec3 pointDiffuse  = vec3(0.0);
vec3 pointSpecular = vec3(0.0);
for (int i = 0; i < MAX_POINT_LIGHTS; i++) {
vec3 lVector = normalize(pointLight[i].xyz - vWorldPos.xyz);
float lDistance = 1.0 - min((length(pointLight[i].xyz - vWorldPos.xyz) / pointLight[i].w), 1.0);
float dotProduct = dot(N, lVector);
#ifdef WRAP_AROUND
float pointDiffuseWeightFull = max(dotProduct, 0.0);
float pointDiffuseWeightHalf = max(0.5 * dotProduct + 0.5, 0.0);
vec3 pointDiffuseWeight = mix(vec3(pointDiffuseWeightFull), vec3(pointDiffuseWeightHalf), wrapRGB);
#else
float pointDiffuseWeight = max(dotProduct, 0.0);
#endif
pointDiffuse += materialDiffuse.rgb * pointLightColor[i].rgb * pointDiffuseWeight * lDistance;
vec3 pointHalfVector = normalize(lVector + normalize(viewPosition));
float pointDotNormalHalf = max(dot(N, pointHalfVector), 0.0);
float pointSpecularWeight = pointLightColor[i].a * specularStrength * max(pow(pointDotNormalHalf, materialSpecularPower), 0.0);
#ifdef PHYSICALLY_BASED_SHADING
float specularNormalization = (materialSpecularPower + 2.0001 ) / 8.0;
vec3 schlick = materialSpecular.rgb + vec3(1.0 - materialSpecular.rgb) * pow(1.0 - dot(lVector, pointHalfVector), 5.0);
pointSpecular += schlick * pointLightColor[i].rgb * pointSpecularWeight * pointDiffuseWeight * lDistance * specularNormalization;
#else
pointSpecular += materialSpecular.rgb * pointLightColor[i].rgb * pointSpecularWeight * pointDiffuseWeight * lDistance;
#endif
}
#endif
#if MAX_SPOT_LIGHTS > 0
vec3 spotDiffuse  = vec3(0.0);
vec3 spotSpecular = vec3(0.0);
for (int i = 0; i < MAX_SPOT_LIGHTS; i++) {
vec3 lVector = normalize(spotLight[i].xyz - vWorldPos.xyz);
float lDistance = 1.0 - min((length(spotLight[i].xyz - vWorldPos.xyz) / spotLight[i].w), 1.0);
float spotEffect = dot(normalize(-spotLightDirection[i]), lVector);
if (spotEffect > spotLightAngle[i]) {
spotEffect = max(pow(spotEffect, spotLightExponent[i]), 0.0);
float dotProduct = dot(N, lVector);
#ifdef WRAP_AROUND
float spotDiffuseWeightFull = max(dotProduct, 0.0);
float spotDiffuseWeightHalf = max(0.5 * dotProduct + 0.5, 0.0);
vec3 spotDiffuseWeight = mix(vec3(spotDiffuseWeightFull), vec3(spotDiffuseWeightHalf), wrapRGB);
#else
float spotDiffuseWeight = max(dotProduct, 0.0);
#endif
spotDiffuse += materialDiffuse.rgb * spotLightColor[i].rgb * spotDiffuseWeight * lDistance * spotEffect;
vec3 spotHalfVector = normalize(lVector + normalize(viewPosition));
float spotDotNormalHalf = max( dot(N, spotHalfVector), 0.0);
float spotSpecularWeight = spotLightColor[i].a * specularStrength * max(pow(spotDotNormalHalf, materialSpecularPower), 0.0);
#ifdef PHYSICALLY_BASED_SHADING
float specularNormalization = (materialSpecularPower + 2.0001) / 8.0;
vec3 schlick = materialSpecular.rgb + vec3(1.0 - materialSpecular.rgb) * pow(1.0 - dot(lVector, spotHalfVector), 5.0);
spotSpecular += schlick * spotLightColor[i].rgb * spotSpecularWeight * spotDiffuseWeight * lDistance * specularNormalization * spotEffect;
#else
spotSpecular += materialSpecular.rgb * spotLightColor[i].rgb * spotSpecularWeight * spotDiffuseWeight * lDistance * spotEffect;
#endif
}
}
#endif
#if MAX_DIRECTIONAL_LIGHTS > 0
vec3 dirDiffuse  = vec3(0.0);
vec3 dirSpecular = vec3(0.0);
for(int i = 0; i < MAX_DIRECTIONAL_LIGHTS; i++) {
vec4 lDirection = vec4(-directionalLightDirection[i], 0.0);
vec3 dirVector = normalize(lDirection.xyz);
float dotProduct = dot(N, dirVector);
#ifdef WRAP_AROUND
float dirDiffuseWeightFull = max(dotProduct, 0.0);
float dirDiffuseWeightHalf = max(0.5 * dotProduct + 0.5, 0.0);
vec3 dirDiffuseWeight = mix(vec3(dirDiffuseWeightFull), vec3(dirDiffuseWeightHalf), wrapRGB);
#else
float dirDiffuseWeight = max(dotProduct, 0.0);
#endif
dirDiffuse += materialDiffuse.rgb * directionalLightColor[i].rgb * dirDiffuseWeight;
vec3 dirHalfVector = normalize(dirVector + normalize(viewPosition));
float dirDotNormalHalf = max(dot(N, dirHalfVector), 0.0);
float dirSpecularWeight = directionalLightColor[i].a * specularStrength * max(pow(dirDotNormalHalf, materialSpecularPower), 0.0);
#ifdef PHYSICALLY_BASED_SHADING
float specularNormalization = (materialSpecularPower + 2.0001) / 8.0;
vec3 schlick = materialSpecular.rgb + vec3(1.0 - materialSpecular.rgb) * pow(1.0 - dot(dirVector, dirHalfVector), 5.0);
dirSpecular += schlick * directionalLightColor[i].rgb * dirSpecularWeight * dirDiffuseWeight * specularNormalization;
#else
dirSpecular += materialSpecular.rgb * directionalLightColor[i].rgb * dirSpecularWeight * dirDiffuseWeight;
#endif
}
#endif
vec3 totalDiffuse = vec3(0.0);
vec3 totalSpecular = vec3(0.0);
#if MAX_DIRECTIONAL_LIGHTS > 0
totalDiffuse += dirDiffuse;
totalSpecular += dirSpecular;
#endif
#if MAX_POINT_LIGHTS > 0
totalDiffuse += pointDiffuse;
totalSpecular += pointSpecular;
#endif
#if MAX_SPOT_LIGHTS > 0
totalDiffuse += spotDiffuse;
totalSpecular += spotSpecular;
#endif
float shadow = 1.0;
#ifdef SHADOW_MAP
vec3 depth = lPosition.xyz / lPosition.w;
depth.z = length(vWorldPos - lightPos) * cameraScale;
if (depth.x >= 0.0 && depth.x <= 1.0 && depth.y >= 0.0 && depth.y <= 1.0 && depth.z >= 0.0 && depth.z <= 1.0) {
#if SHADOW_TYPE == 0
depth.z *= 0.96;
float shadowDepth = texture2D(shadowMap, depth.xy).x;
if ( depth.z > shadowDepth ) shadow = 0.5;
#elif SHADOW_TYPE == 1
vec4 texel = texture2D(shadowMap, depth.xy);
vec2 moments = vec2(texel.x, texel.y);
shadow = ChebychevInequality(moments, depth.z);
#endif
shadow = clamp(shadow, 0.0, 1.0);
}
#endif
vec3 ambientLightColor = vec3(1.0, 1.0, 1.0);
#ifdef METAL
final_color.xyz = final_color.xyz * (materialEmissive.rgb + totalDiffuse * shadow + ambientLightColor * materialAmbient.rgb + totalSpecular * shadow);
#else
final_color.xyz = final_color.xyz * (materialEmissive.rgb + totalDiffuse * shadow + ambientLightColor * materialAmbient.rgb) + totalSpecular * shadow;
#endif
#endif

#ifdef EMISSIVE_MAP
vec3 emissive = texture2D(emissiveMap, texCoord0).rgb;
final_color.xyz += final_color.xyz * emissive;
#endif
gl_FragColor = final_color;
}