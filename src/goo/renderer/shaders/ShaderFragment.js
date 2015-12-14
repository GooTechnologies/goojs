define(

function () {
	'use strict';

	/**
	 * Collection of useful shader fragments
	 */
	function ShaderFragment() {
	}

	ShaderFragment.noisecommon = [
		'vec4 mod289(vec4 x) {',
			'return x - floor(x * (1.0 / 289.0)) * 289.0;',
		'}',

		'vec3 mod289(vec3 x) {',
			'return x - floor(x * (1.0 / 289.0)) * 289.0;',
		'}',

		'vec2 mod289(vec2 x) {',
			'return x - floor(x * (1.0 / 289.0)) * 289.0;',
		'}',

		'vec3 permute(vec3 x) {',
			'return mod289(((x*34.0)+1.0)*x);',
		'}',

		'vec4 permute(vec4 x) {',
			'return mod289(((x*34.0)+1.0)*x);',
		'}'
	].join('\n');

	ShaderFragment.noise2d = [
		ShaderFragment.noisecommon,
		'float snoise(vec2 v) {',
			'const vec4 C = vec4(0.211324865405187, // (3.0-sqrt(3.0))/6.0',
				'0.366025403784439, // 0.5*(sqrt(3.0)-1.0)',
				'-0.577350269189626, // -1.0 + 2.0 * C.x',
				'0.024390243902439); // 1.0 / 41.0',
			'vec2 i  = floor(v + dot(v, C.yy) );',
			'vec2 x0 = v - i + dot(i, C.xx);',
			'vec2 i1;',
			'//i1.x = step( x0.y, x0.x ); x0.x > x0.y ? 1.0 : 0.0',
			'//i1.y = 1.0 - i1.x;',
			'i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);',
			'// x0 = x0 - 0.0 + 0.0 * C.xx ;',
			'// x1 = x0 - i1 + 1.0 * C.xx ;',
			'// x2 = x0 - 1.0 + 2.0 * C.xx ;',
			'vec4 x12 = x0.xyxy + C.xxzz;',
			'x12.xy -= i1;',
			'i = mod289(i); // Avoid truncation effects in permutation',
			'vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))',
				'+ i.x + vec3(0.0, i1.x, 1.0 ));',
			'vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);',
			'm = m*m ;',
			'm = m*m ;',
			'vec3 x = 2.0 * fract(p * C.www) - 1.0;',
			'vec3 h = abs(x) - 0.5;',
			'vec3 ox = floor(x + 0.5);',
			'vec3 a0 = x - ox;',
			'm *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );',
			'vec3 g;',
			'g.x  = a0.x  * x0.x  + h.x  * x0.y;',
			'g.yz = a0.yz * x12.xz + h.yz * x12.yw;',
			'return 130.0 * dot(m, g);',
		'}'
	].join('\n');

	ShaderFragment.noise3d = [
		ShaderFragment.noisecommon,
		'vec4 taylorInvSqrt(vec4 r) {',
			'return 1.79284291400159 - 0.85373472095314 * r;',
		'}',

		'float snoise(vec3 v) {',
			'const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;',
			'const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);',
			'vec3 i  = floor(v + dot(v, C.yyy) );',
			'vec3 x0 = v - i + dot(i, C.xxx);',
			'vec3 g = step(x0.yzx, x0.xyz);',
			'vec3 l = 1.0 - g;',
			'vec3 i1 = min( g.xyz, l.zxy );',
			'vec3 i2 = max( g.xyz, l.zxy );',
			'vec3 x1 = x0 - i1 + C.xxx;',
			'vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y',
			'vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y',
			'i = mod289(i); ',
			'vec4 p = permute( permute( permute( ',
				'i.z + vec4(0.0, i1.z, i2.z, 1.0 ))',
				'+ i.y + vec4(0.0, i1.y, i2.y, 1.0 )) ',
				'+ i.x + vec4(0.0, i1.x, i2.x, 1.0 ));',
			'float n_ = 0.142857142857; // 1.0/7.0',
			'vec3 ns = n_ * D.wyz - D.xzx;',
			'vec4 j = p - 49.0 * floor(p * ns.z * ns.z); // mod(p,7*7)',
			'vec4 x_ = floor(j * ns.z);',
			'vec4 y_ = floor(j - 7.0 * x_ ); // mod(j,N)',
			'vec4 x = x_ *ns.x + ns.yyyy;',
			'vec4 y = y_ *ns.x + ns.yyyy;',
			'vec4 h = 1.0 - abs(x) - abs(y);',
			'vec4 b0 = vec4( x.xy, y.xy );',
			'vec4 b1 = vec4( x.zw, y.zw );',
			'vec4 s0 = floor(b0)*2.0 + 1.0;',
			'vec4 s1 = floor(b1)*2.0 + 1.0;',
			'vec4 sh = -step(h, vec4(0.0));',
			'vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;',
			'vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;',
			'vec3 p0 = vec3(a0.xy,h.x);',
			'vec3 p1 = vec3(a0.zw,h.y);',
			'vec3 p2 = vec3(a1.xy,h.z);',
			'vec3 p3 = vec3(a1.zw,h.w);',
			'vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));',
			'p0 *= norm.x;',
			'p1 *= norm.y;',
			'p2 *= norm.z;',
			'p3 *= norm.w;',
			'vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);',
			'm = m * m;',
			'return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );',
		'}'
	].join('\n');

	var packCommon = [
		'float shift_right (float v, float amt) {',
			'v = floor(v) + 0.5;',
			'return floor(v / exp2(amt));',
		'}',
		'float shift_left (float v, float amt) {',
			'return floor(v * exp2(amt) + 0.5);',
		'}',
		'float mask_last (float v, float bits) {',
			'return mod(v, shift_left(1.0, bits));',
		'}',
		'float extract_bits (float num, float from, float to) {',
			'from = floor(from + 0.5); to = floor(to + 0.5);',
			'return mask_last(shift_right(num, from), to - from);',
		'}'
	].join('\n');

	ShaderFragment.methods = {
		packDepth: [
			'vec4 packDepth( const in float depth ) {',
				'const vec4 bit_shift = vec4( 256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0 );',
				'const vec4 bit_mask  = vec4( 0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0 );',
				'vec4 res = fract( depth * bit_shift );',
				'res -= res.xxyz * bit_mask;',
				'return res;',
			'}'
		].join('\n'),
		unpackDepth: [
			'float unpackDepth( const in vec4 rgba_depth ) {',
				'const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );',
				'float depth = dot( rgba_depth, bit_shift );',
				'return depth;',
			'}'
		].join('\n'),
		packFloat: [
			packCommon,
			'vec4 packFloat (float val) {',
				'if (val == 0.0) return vec4(0, 0, 0, 0);',
				'float sign = val > 0.0 ? 0.0 : 1.0;',
				'val = abs(val);',
				'float exponent = floor(log2(val));',
				'float biased_exponent = exponent + 127.0;',
				'float fraction = ((val / exp2(exponent)) - 1.0) * 8388608.0;',
				'float t = biased_exponent / 2.0;',
				'float last_bit_of_biased_exponent = fract(t) * 2.0;',
				'float remaining_bits_of_biased_exponent = floor(t);',
				'float byte4 = extract_bits(fraction, 0.0, 8.0) / 255.0;',
				'float byte3 = extract_bits(fraction, 8.0, 16.0) / 255.0;',
				'float byte2 = (last_bit_of_biased_exponent * 128.0 + extract_bits(fraction, 16.0, 23.0)) / 255.0;',
				'float byte1 = (sign * 128.0 + remaining_bits_of_biased_exponent) / 255.0;',
				'return vec4(byte4, byte3, byte2, byte1);',
			'}'
		].join('\n'),
		unpackFloat: [
			packCommon,
			'float unpackFloat (vec4 val) {',
				// 'if (val == vec4(0.0)) return 0.0;',
				'val = val * vec4(255.0);',
				'float sign = - shift_right(val.w, 7.0) * 2.0 + 1.0;',

				'float mantissa = ',
					'val.x +',
					'shift_left(val.y, 8.0) +',
					'shift_left(extract_bits(val.z, 0.0, 7.0), 16.0);',
				' mantissa = mantissa / 8388608.0 + 1.0;',

				'float exponent = ',
					'shift_left(extract_bits(val.w, 0.0, 7.0), 1.0) +',
					'shift_right(val.z, 7.0) - 127.0;',

				'return sign * mantissa * exp2(exponent);',
			'}'
		].join('\n'),
		packDepth16: [
			'vec2 packDepth16( const in float depth ) {',
				'const vec2 bias = vec2(1.0 / 255.0, 0.0);',
				'vec2 res = vec2(depth, fract(depth * 255.0));',
				'return res - (res.yy * bias);',
			'}'
		].join('\n'),
		unpackDepth16: [
			'float unpackDepth16( const in vec2 rg_depth ) {',
				'return rg_depth.x + (rg_depth.y / 255.0);',
			'}'
		].join('\n'),
		hsv: [
			'vec3 rgb2hsv(vec3 c) {',
				'vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);',
				'vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));',
				'vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));',
				'float d = q.x - min(q.w, q.y);',
				'float e = 1.0e-10;',
				'return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);',
			'}',
			'vec3 hsv2rgb(vec3 c) {',
				'vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);',
				'vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);',
				'return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);',
			'}'
		].join('\n')
	};

	ShaderFragment.blendmodes = [
		'#define BlendLinearDodgef				BlendAddf',
		'#define BlendLinearBurnf				BlendSubstractf',
		'#define BlendAddf(base, blend)			min(base + blend, 1.0)',
		'#define BlendSubstractf(base, blend)	max(base + blend - 1.0, 0.0)',
		'#define BlendLightenf(base, blend)		max(blend, base)',
		'#define BlendDarkenf(base, blend)		min(blend, base)',
		'#define BlendLinearLightf(base, blend)	(blend < 0.5 ? BlendLinearBurnf(base, (2.0 * blend)) : BlendLinearDodgef(base, (2.0 * (blend - 0.5))))',
		'#define BlendScreenf(base, blend)		(1.0 - ((1.0 - base) * (1.0 - blend)))',
		'#define BlendOverlayf(base, blend)		(base < 0.5 ? (2.0 * base * blend) : (1.0 - 2.0 * (1.0 - base) * (1.0 - blend)))',
		'#define BlendSoftLightf(base, blend)	((blend < 0.5) ? (2.0 * base * blend + base * base * (1.0 - 2.0 * blend)) : (sqrt(base) * (2.0 * blend - 1.0) + 2.0 * base * (1.0 - blend)))',
		'#define BlendColorDodgef(base, blend)	((blend == 1.0) ? blend : min(base / (1.0 - blend), 1.0))',
		'#define BlendColorBurnf(base, blend)	((blend == 0.0) ? blend : max((1.0 - ((1.0 - base) / blend)), 0.0))',
		'#define BlendVividLightf(base, blend)	((blend < 0.5) ? BlendColorBurnf(base, (2.0 * blend)) : BlendColorDodgef(base, (2.0 * (blend - 0.5))))',
		'#define BlendPinLightf(base, blend)	((blend < 0.5) ? BlendDarkenf(base, (2.0 * blend)) : BlendLightenf(base, (2.0 *(blend - 0.5))))',
		'#define BlendHardMixf(base, blend)		((BlendVividLightf(base, blend) < 0.5) ? 0.0 : 1.0)',
		'#define BlendReflectf(base, blend)		((blend == 1.0) ? blend : min(base * base / (1.0 - blend), 1.0))',
		'#define Blend(base, blend, funcf)		vec3(funcf(base.r, blend.r), funcf(base.g, blend.g), funcf(base.b, blend.b))',
		'#define BlendNormal(base, blend)		(blend)',
		'#define BlendLighten					BlendLightenf',
		'#define BlendDarken					BlendDarkenf',
		'#define BlendMultiply(base, blend)		(base * blend)',
		'#define BlendAverage(base, blend)		((base + blend) / 2.0)',
		'#define BlendAdd(base, blend)			min(base + blend, vec3(1.0))',
		'#define BlendSubstract(base, blend)	max(base + blend - vec3(1.0), vec3(0.0))',
		'#define BlendDifference(base, blend)	abs(base - blend)',
		'#define BlendNegation(base, blend)		(vec3(1.0) - abs(vec3(1.0) - base - blend))',
		'#define BlendExclusion(base, blend)	(base + blend - 2.0 * base * blend)',
		'#define BlendScreen(base, blend)		Blend(base, blend, BlendScreenf)',
		'#define BlendOverlay(base, blend)		Blend(base, blend, BlendOverlayf)',
		'#define BlendSoftLight(base, blend)	Blend(base, blend, BlendSoftLightf)',
		'#define BlendHardLight(base, blend)	BlendOverlay(blend, base)',
		'#define BlendColorDodge(base, blend)	Blend(base, blend, BlendColorDodgef)',
		'#define BlendColorBurn(base, blend)	Blend(base, blend, BlendColorBurnf)',
		'#define BlendLinearDodge				BlendAdd',
		'#define BlendLinearBurn				BlendSubstract',
		'#define BlendLinearLight(base, blend)	Blend(base, blend, BlendLinearLightf)',
		'#define BlendVividLight(base, blend)	Blend(base, blend, BlendVividLightf)',
		'#define BlendPinLight(base, blend)		Blend(base, blend, BlendPinLightf)',
		'#define BlendHardMix(base, blend)		Blend(base, blend, BlendHardMixf)',
		'#define BlendReflect(base, blend)		Blend(base, blend, BlendReflectf)',
		'#define BlendGlow(base, blend)			BlendReflect(blend, base)',
		'#define BlendPhoenix(base, blend)		(min(base, blend) - max(base, blend) + vec3(1.0))',
		'#define GammaCorrection(color, gamma)											pow(color, vec3(1.0 / gamma))',
		'#define LevelsControlInputRange(color, minInput, maxInput)						min(max(color - vec3(minInput), vec3(0.0)) / (vec3(maxInput) - vec3(minInput)), vec3(1.0))',
		'#define LevelsControlInput(color, minInput, gamma, maxInput)					GammaCorrection(LevelsControlInputRange(color, minInput, maxInput), gamma)',
		'#define LevelsControlOutputRange(color, minOutput, maxOutput)					mix(vec3(minOutput), vec3(maxOutput), color)',
		'#define LevelsControl(color, minInput, gamma, maxInput, minOutput, maxOutput)	LevelsControlOutputRange(LevelsControlInput(color, minInput, gamma, maxInput), minOutput, maxOutput)'
	].join('\n');

	return ShaderFragment;
});