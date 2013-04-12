precision mediump float;
uniform sampler2D diffuseMap;
uniform vec4 materialAmbient;
uniform vec4 materialDiffuse;
uniform vec4 materialSpecular;
uniform float materialSpecularPower;
varying vec3 normal;
varying vec3 lightDir;
varying vec3 eyeVec;
varying vec2 texCoord0;
void main(void)
{
 vec4 texCol = texture2D(diffuseMap, texCoord0);
 vec4 final_color = materialAmbient;
 vec3 N = normalize(normal);
 vec3 L = normalize(lightDir);
 float lambertTerm = dot(N,L)*0.75+0.25;
 if(lambertTerm > 0.0)
 {
  final_color += materialDiffuse * // gl_LightSource[0].diffuse * 
   lambertTerm;
  vec3 E = normalize(eyeVec);
  vec3 R = reflect(-L, N);
  float specular = pow( clamp(dot(R, E), 0.0, 1.0), materialSpecularPower);
  final_color += materialSpecular * // gl_LightSource[0].specular * 
   specular;
 }
 gl_FragColor = vec4(texCol.rgb * final_color.rgb, texCol.a);
}