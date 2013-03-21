precision mediump float;

uniform sampler2D diffuseMap;
uniform vec4 fogColor;
uniform float drawDistanceNear;
uniform float drawDistanceFar;

varying vec2 texCoord0;
varying float depth;

void main(void)
{
	gl_FragColor = texture2D(diffuseMap, texCoord0);
	gl_FragColor = mix(gl_FragColor, fogColor, clamp((depth + drawDistanceNear) / (drawDistanceNear - drawDistanceFar), 0.0, 1.0));
}
