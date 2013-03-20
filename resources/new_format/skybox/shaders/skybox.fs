precision mediump float;
uniform sampler2D diffuseMap;
varying vec2 texCoord0;
void main(void)
{
 gl_FragColor = texture2D(diffuseMap, texCoord0);
}