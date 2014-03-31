define([
	'goo/renderer/MeshData',
	'goo/renderer/light/PointLight',
	'goo/renderer/light/DirectionalLight',
	'goo/renderer/light/SpotLight',
	'goo/renderer/Texture',
	'goo/math/MathUtils',
	'goo/util/TangentGenerator'
],
/** @lends */
function(
	MeshData,
	PointLight,
	DirectionalLight,
	SpotLight,
	Texture,
	MathUtils,
	TangentGenerator
) {
	'use strict';

	/**
	 * @class Builds shaders
	 */
	function ShaderBuilder() {
	}

	var defaultLight = new DirectionalLight();
	defaultLight.translation.setd(10, 10, 10);
	defaultLight.direction.setd(1, 1, 1).normalize();
	ShaderBuilder.defaultLight = defaultLight;

	ShaderBuilder.SKYBOX = null;
	ShaderBuilder.SKYSPHERE = null;
	ShaderBuilder.ENVIRONMENT_TYPE = 0;
	ShaderBuilder.GLOBAL_AMBIENT = [0, 0, 0];
	ShaderBuilder.USE_FOG = false;
	ShaderBuilder.FOG_SETTINGS = [0, 10000];
	ShaderBuilder.FOG_COLOR = [1, 1, 1];

	ShaderBuilder.uber = {
		processor: function (shader, shaderInfo) {
			var attributeMap = shaderInfo.meshData.attributeMap;
			var material = shaderInfo.material;
			var textureMaps = material._textureMaps;

			shader.defines = shader.defines || {};

			if (ShaderBuilder.SKYBOX && (material.uniforms.reflectivity > 0 || material.uniforms.refractivity > 0)) {
				material.setTexture('ENVIRONMENT_CUBE', ShaderBuilder.SKYBOX);
			} else if (material.getTexture('ENVIRONMENT_CUBE')) {
				material.removeTexture('ENVIRONMENT_CUBE');
			}
			if (ShaderBuilder.SKYSPHERE && (material.uniforms.reflectivity > 0 || material.uniforms.refractivity > 0)) {
				material.setTexture('ENVIRONMENT_SPHERE', ShaderBuilder.SKYSPHERE);
				shader.defines.ENVIRONMENT_TYPE = ShaderBuilder.ENVIRONMENT_TYPE;
			} else if (material.getTexture('ENVIRONMENT_SPHERE')) {
				material.removeTexture('ENVIRONMENT_SPHERE');
			}

			var keys = Object.keys(attributeMap);
			for (var i = 0, l = keys.length; i < l; i++) {
				var attribute = keys[i];
				if (!shader.defines[attribute]) {
					shader.defines[attribute] = true;
				}
			}

			var keys = Object.keys(textureMaps);
			for (var i = 0, l = keys.length; i < l; i++) {
				var type = keys[i];
				if (textureMaps[type] === undefined || textureMaps[type] === null) {
					continue;
				}

				if (type === 'SHADOW_MAP') {
					continue;
				}

				if (!shader.defines[type]) {
					shader.defines[type] = true;
				}

				if (type === 'DIFFUSE_MAP') {
					var offset = textureMaps[type].offset;
					var repeat = textureMaps[type].repeat;
					shader.uniforms.offsetRepeat = shader.uniforms.offsetRepeat || [0, 0, 1, 1];
					shader.uniforms.offsetRepeat[0] = offset.x;
					shader.uniforms.offsetRepeat[1] = offset.y;
					shader.uniforms.offsetRepeat[2] = repeat.x;
					shader.uniforms.offsetRepeat[3] = repeat.y;

					shader.uniforms.lodOffset = textureMaps[type].lodOffset;
				}
			}

			// Exclude in a nicer way
			var keys = Object.keys(shader.defines);
			for (var i = 0, l = keys.length; i < l; i++) {
				var attribute = keys[i];
				if (attribute === 'MAX_POINT_LIGHTS' ||
					attribute === 'MAX_DIRECTIONAL_LIGHTS' ||
					attribute === 'MAX_SPOT_LIGHTS' ||
					attribute === 'SHADOW_TYPE' ||
					attribute === 'JOINT_COUNT' ||
					attribute === 'WEIGHTS' ||
					attribute === 'PHYSICALLY_BASED_SHADING' ||
					attribute === 'ENVIRONMENT_TYPE' ||
					attribute === 'WRAP_AROUND') {
					continue;
				}
				if (!attributeMap[attribute] && !textureMaps[attribute]) {
					delete shader.defines[attribute];
				}
			}

			// discard
			if (shaderInfo.material.uniforms.discardThreshold >= 0.0) {
				shader.defines.DISCARD = true;
			} else {
				delete shader.defines.DISCARD;
			}

			// fog
			if (ShaderBuilder.USE_FOG) {
				shader.defines.FOG = true;
				shader.uniforms.fogSettings = ShaderBuilder.FOG_SETTINGS;
				shader.uniforms.fogColor = ShaderBuilder.FOG_COLOR;
			} else {
				delete shader.defines.FOG;
			}

			shader.defines.SKIP_SPECULAR = true;

			//TODO: Hacky?
			if (shader.defines.NORMAL && shader.defines.NORMAL_MAP && !shaderInfo.meshData.getAttributeBuffer(MeshData.TANGENT)) {
				TangentGenerator.addTangentBuffer(shaderInfo.meshData);
			}
		}
	};

	ShaderBuilder.light = {
		processor: function (shader, shaderInfo) {
			shader.uniforms.materialAmbient = shader.uniforms.materialAmbient || 'AMBIENT';
			shader.uniforms.materialEmissive = shader.uniforms.materialEmissive || 'EMISSIVE';
			shader.uniforms.materialDiffuse = shader.uniforms.materialDiffuse || 'DIFFUSE';
			shader.uniforms.materialSpecular = shader.uniforms.materialSpecular || 'SPECULAR';
			shader.uniforms.materialSpecularPower = shader.uniforms.materialSpecularPower || 'SPECULAR_POWER';
			shader.uniforms.globalAmbient = ShaderBuilder.GLOBAL_AMBIENT;

			shader.defines = shader.defines || {};

			var lights = shaderInfo.lights;
			var lightDefines = [];
			for (var i = 0; i < lights.length; i++) {
				var light = lights[i];

				if (light instanceof PointLight) {
					shader.uniforms['pointLight'+i] = [light.translation.data[0], light.translation.data[1], light.translation.data[2], light.range];
					shader.uniforms['pointLightColor'+i] = [light.color.data[0] * light.intensity, light.color.data[1] * light.intensity, light.color.data[2] * light.intensity, light.specularIntensity];
					lightDefines.push('P');
				} else if (light instanceof DirectionalLight) {
					shader.uniforms['directionalLightDirection'+i] = [light.direction.data[0], light.direction.data[1], light.direction.data[2]];
					shader.uniforms['directionalLightColor'+i] = [light.color.data[0] * light.intensity, light.color.data[1] * light.intensity, light.color.data[2] * light.intensity, light.specularIntensity];
					lightDefines.push('D');
				} else if (light instanceof SpotLight) {
					shader.uniforms['spotLight'+i] = [light.translation.data[0], light.translation.data[1], light.translation.data[2], light.range];
					shader.uniforms['spotLightColor'+i] = [light.color.data[0] * light.intensity, light.color.data[1] * light.intensity, light.color.data[2] * light.intensity, light.specularIntensity];
					shader.uniforms['spotLightDirection'+i] = [light.direction.data[0], light.direction.data[1], light.direction.data[2]];

					shader.uniforms['spotLightAngle'+i] = Math.cos(light.angle * MathUtils.DEG_TO_RAD / 2);
					shader.uniforms['spotLightPenumbra'+i] = light.penumbra !== undefined ? Math.sin(light.penumbra * MathUtils.DEG_TO_RAD / 4) : 0;
					lightDefines.push('S');
				}

				var useLightCookie = light.lightCookie instanceof Texture;
				if ((useLightCookie || (light.shadowCaster && shaderInfo.renderable.meshRendererComponent &&
					shaderInfo.renderable.meshRendererComponent.receiveShadows)) && light.shadowSettings.shadowData) {
					var shadowData = light.shadowSettings.shadowData;

					if (light.shadowCaster) {
						shader.uniforms['shadowMaps'+i]	= 'SHADOW_MAP'+i;
						shaderInfo.material.setTexture('SHADOW_MAP'+i, shadowData.shadowResult);
					}
					if (useLightCookie) {
						shader.uniforms['lightCookie'+i] = 'LIGHT_COOKIE'+i;
						shaderInfo.material.setTexture('LIGHT_COOKIE'+i, light.lightCookie);
						lightDefines.push('C');
						shader.defines.COOKIE = true;
					} else {
						shader.defines.COOKIE = false;
					}

					var matrix = shadowData.lightCamera.getViewProjectionMatrix().data;
					var mat = shader.uniforms['shadowLightMatrices'+i] = shader.uniforms['shadowLightMatrices'+i] || [];
					for (var j = 0; j < 16; j++) {
						mat[j] = matrix[j];
					}

					if (light.shadowCaster) {
						var translationData = shadowData.lightCamera.translation.data;
						var pos = shader.uniforms['shadowLightPositions'+i] = shader.uniforms['shadowLightPositions'+i] || [];
						pos[0] = translationData[0];
						pos[1] = translationData[1];
						pos[2] = translationData[2];

						shader.uniforms['cameraScales'+i] = 1.0 / (shadowData.lightCamera.far - shadowData.lightCamera.near);
						shader.uniforms['shadowDarkness'+i] = light.shadowSettings.darkness;

						if (light.shadowSettings.shadowType === 'PCF') {
							var sizes = shader.uniforms['shadowMapSizes'+i] = shader.uniforms['shadowMapSizes'+i] || [];
							sizes[0] = light.shadowSettings.resolution[0];
							sizes[1] = light.shadowSettings.resolution[1];
						}

						lightDefines.push('H', light.shadowSettings.shadowType === 'PCF' ? 1 : light.shadowSettings.shadowType === 'VSM' ? 2 : 0);
					}
				}
			}

			shader.defines.LIGHT = lightDefines.join('');
		},
		builder: function (shader, shaderInfo) {
			var prevertex = [];
			var vertex = [];
			var prefragment = [];
			var fragment = [];

			prevertex.push(
				'const mat4 ScaleMatrix = mat4(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);'
			);

			prefragment.push(
				'uniform vec4 materialAmbient;',
				'uniform vec4 materialEmissive;',
				'uniform vec4 materialDiffuse;',
				'uniform vec4 materialSpecular;',
				'uniform float materialSpecularPower;',
				'uniform vec3 globalAmbient;',

				// 'float VsmFixLightBleed(in float pMax, in float amount) {',
					// 'return clamp((pMax - amount) / (1.0 - amount), 0.0, 1.0);',
				// '}',

				'float ChebychevInequality(in vec2 moments, in float t) {',
					'if ( t <= moments.x ) return 1.0;',
					'float variance = moments.y - (moments.x * moments.x);',
					'variance = max(variance, 0.02);',
					'float d = t - moments.x;',
					'return variance / (variance + d * d);',
				'}'
			);

			fragment.push(
				'#if defined(SPECULAR_MAP) && defined(TEXCOORD0)',
					'float specularStrength = texture2D(specularMap, texCoord0).x;',
				'#else',
					'float specularStrength = 1.0;',
				'#endif',

				'vec3 totalDiffuse = vec3(0.0);',
				'vec3 totalSpecular = vec3(0.0);'
			);

			var lights = shaderInfo.lights;
			for (var i = 0; i < lights.length; i++) {
				var light = lights[i];

				fragment.push(
					'{',
						'float shadow = 1.0;',
						'vec3 normalizedViewPosition = normalize(viewPosition);'
				);

				var useLightCookie = light.lightCookie instanceof Texture;
				if (light.shadowCaster || useLightCookie) {
					prevertex.push(
						'uniform mat4 shadowLightMatrices'+i+';',
						'varying vec4 shadowLightDepths'+i+';'
					);

					vertex.push(
						'shadowLightDepths'+i+' = ScaleMatrix * shadowLightMatrices'+i+' * worldPos;'
					);

					if (light.shadowCaster) {
						prefragment.push(
							'uniform sampler2D shadowMaps'+i+';',
							'uniform vec3 shadowLightPositions'+i+';',
							'uniform float cameraScales'+i+';',
							'uniform float shadowDarkness'+i+';'
						);
					}
					if (useLightCookie) {
						prefragment.push(
							'uniform sampler2D lightCookie'+i+';'
						);
					}
					//TODO!!!

					prefragment.push(
						'varying vec4 shadowLightDepths'+i+';'
					);

					if (light.shadowCaster && light.shadowSettings.shadowType === 'PCF') {
						prefragment.push(
							'uniform vec2 shadowMapSizes'+i+';'
						);
					}

					fragment.push(
						'vec3 depth = shadowLightDepths'+i+'.xyz / shadowLightDepths'+i+'.w;'
					);

					if (light.shadowCaster) {
						fragment.push(
							'depth.z = length(vWorldPos.xyz - shadowLightPositions'+i+') * cameraScales'+i+';',

							'if (depth.x >= 0.0 && depth.x <= 1.0 && depth.y >= 0.0 && depth.y <= 1.0 && shadowLightDepths'+i+'.z >= 0.0 && depth.z <= 1.0) {'
						);
								if (light.shadowSettings.shadowType === 'PCF') {
									fragment.push(
									'depth.z *= 0.96;',
									'float shadowPcf = 0.0;',
									'const float shadowDelta = 1.0 / 9.0;',
									'float xPixelOffset = 1.0 / shadowMapSizes'+i+'.x;',
									'float yPixelOffset = 1.0 / shadowMapSizes'+i+'.y;',

									'float dx0 = -1.25 * xPixelOffset;',
									'float dy0 = -1.25 * yPixelOffset;',
									'float dx1 = 1.25 * xPixelOffset;',
									'float dy1 = 1.25 * yPixelOffset;',

									'float fDepth = 0.0;',

									'fDepth = texture2D(shadowMaps'+i+', depth.xy + vec2(dx0, dy0)).r;',
									'if (fDepth < depth.z) shadowPcf += shadowDelta;',
									'fDepth = texture2D(shadowMaps'+i+', depth.xy + vec2(0.0, dy0)).r;',
									'if (fDepth < depth.z) shadowPcf += shadowDelta;',
									'fDepth = texture2D(shadowMaps'+i+', depth.xy + vec2(dx1, dy0)).r;',
									'if (fDepth < depth.z) shadowPcf += shadowDelta;',
									'fDepth = texture2D(shadowMaps'+i+', depth.xy + vec2(dx0, 0.0)).r;',
									'if (fDepth < depth.z) shadowPcf += shadowDelta;',
									'fDepth =  texture2D(shadowMaps'+i+', depth.xy).r;',
									'if (fDepth < depth.z) shadowPcf += shadowDelta;',
									'fDepth = texture2D(shadowMaps'+i+', depth.xy + vec2(dx1, 0.0)).r;',
									'if (fDepth < depth.z) shadowPcf += shadowDelta;',
									'fDepth = texture2D(shadowMaps'+i+', depth.xy + vec2(dx0, dy1)).r;',
									'if (fDepth < depth.z) shadowPcf += shadowDelta;',
									'fDepth = texture2D(shadowMaps'+i+', depth.xy + vec2(0.0, dy1)).r;',
									'if (fDepth < depth.z) shadowPcf += shadowDelta;',
									'fDepth = texture2D(shadowMaps'+i+', depth.xy + vec2(dx1, dy1)).r;',
									'if (fDepth < depth.z) shadowPcf += shadowDelta;',
									'shadow = mix(1.0, 1.0 - shadowPcf, shadowDarkness'+i+');'
									//'shadow = (1.0 - shadowPcf) * (1.0 - shadowDarkness'+i+') + shadowDarkness'+i+';'
									);
								} else if (light.shadowSettings.shadowType === 'VSM') {
									fragment.push(
									'vec4 texel = texture2D(shadowMaps'+i+', depth.xy);',
									'vec2 moments = vec2(texel.x, texel.y);',
									'shadow = ChebychevInequality(moments, depth.z);',
									// 'shadow = VsmFixLightBleed(shadow, 0.5);',
									'shadow = pow(shadow, shadowDarkness'+i+' * 8.0);'
									);
								} else {
									fragment.push(
									'depth.z *= 0.96;',
									'float shadowDepth = texture2D(shadowMaps'+i+', depth.xy).x;',
									'if ( depth.z > shadowDepth ) shadow = 1.0 - shadowDarkness'+i+';'
									);
								}
						fragment.push(
							'}',
							'shadow = clamp(shadow, 0.0, 1.0);'
						);
					}
				}

				if (light instanceof PointLight) {
					prefragment.push(
						'uniform vec4 pointLight'+i+';',
						'uniform vec4 pointLightColor'+i+';'
					);

					fragment.push(
						'vec3 lVector = normalize(pointLight'+i+'.xyz - vWorldPos.xyz);',
						'float lDistance = 1.0 - min((length(pointLight'+i+'.xyz - vWorldPos.xyz) / pointLight'+i+'.w), 1.0);',

						'float dotProduct = dot(N, lVector);',

						'#ifdef WRAP_AROUND',
							'float pointDiffuseWeightFull = max(dotProduct, 0.0);',
							'float pointDiffuseWeightHalf = max(0.5 * dotProduct + 0.5, 0.0);',

							'float wrapRGB = 1.0;',
							'vec3 pointDiffuseWeight = mix(vec3(pointDiffuseWeightFull), vec3(pointDiffuseWeightHalf), wrapRGB);',
						'#else',
							'float pointDiffuseWeight = max(dotProduct, 0.0);',
						'#endif',

						'totalDiffuse += materialDiffuse.rgb * pointLightColor'+i+'.rgb * pointDiffuseWeight * lDistance * shadow;',

						'vec3 pointHalfVector = normalize(lVector + normalizedViewPosition);',
						'float pointDotNormalHalf = max(dot(N, pointHalfVector), 0.0);',
						'float pointSpecularWeight = pointLightColor'+i+'.a * specularStrength * max(pow(pointDotNormalHalf, materialSpecularPower), 0.0);',

						'#ifdef PHYSICALLY_BASED_SHADING',
							'float specularNormalization = (materialSpecularPower + 2.0001 ) / 8.0;',
							'vec3 schlick = materialSpecular.rgb + vec3(1.0 - materialSpecular.rgb) * pow(1.0 - dot(lVector, pointHalfVector), 5.0);',
							'totalSpecular += schlick * pointLightColor'+i+'.rgb * pointSpecularWeight * pointDiffuseWeight * lDistance * specularNormalization * shadow;',
						'#else',
							'totalSpecular += materialSpecular.rgb * pointLightColor'+i+'.rgb * pointSpecularWeight * pointDiffuseWeight * lDistance * shadow;',
						'#endif'
					);
				} else if (light instanceof DirectionalLight) {
					prefragment.push(
						'uniform vec4 directionalLightColor'+i+';',
						'uniform vec3 directionalLightDirection'+i+';'
					);

					fragment.push(
						'vec3 dirVector = normalize(-directionalLightDirection'+i+');',
						'float dotProduct = dot(N, dirVector);',

						'#ifdef WRAP_AROUND',
							'float dirDiffuseWeightFull = max(dotProduct, 0.0);',
							'float dirDiffuseWeightHalf = max(0.5 * dotProduct + 0.5, 0.0);',

							'float wrapRGB = 1.0;',
							'vec3 dirDiffuseWeight = mix(vec3(dirDiffuseWeightFull), vec3(dirDiffuseWeightHalf), wrapRGB);',
						'#else',
							'float dirDiffuseWeight = max(dotProduct, 0.0);',
						'#endif',

						'vec3 cookie = vec3(1.0);'
					);
					if (useLightCookie) {
						fragment.push(
							'vec4 cookieTex = texture2D(lightCookie'+i+', depth.xy);',
							'cookie = cookieTex.rgb * cookieTex.a;'
						);
					}
					fragment.push(
						'totalDiffuse += materialDiffuse.rgb * directionalLightColor'+i+'.rgb * dirDiffuseWeight * shadow * cookie;',

						'vec3 dirHalfVector = normalize(dirVector + normalizedViewPosition);',
						'float dirDotNormalHalf = max(dot(N, dirHalfVector), 0.0);',
						'float dirSpecularWeight = directionalLightColor'+i+'.a * specularStrength * max(pow(dirDotNormalHalf, materialSpecularPower), 0.0);',

						'#ifdef PHYSICALLY_BASED_SHADING',
							'float specularNormalization = (materialSpecularPower + 2.0001) / 8.0;',
							'vec3 schlick = materialSpecular.rgb + vec3(1.0 - materialSpecular.rgb) * pow(1.0 - dot(dirVector, dirHalfVector), 5.0);',
							'totalSpecular += schlick * directionalLightColor'+i+'.rgb * dirSpecularWeight * dirDiffuseWeight * specularNormalization * shadow * cookie;',
						'#else',
							'totalSpecular += materialSpecular.rgb * directionalLightColor'+i+'.rgb * dirSpecularWeight * dirDiffuseWeight * shadow * cookie;',
						'#endif'
					);
				} else if (light instanceof SpotLight) {
					prefragment.push(
						'uniform vec4 spotLightColor'+i+';',
						'uniform vec4 spotLight'+i+';',
						'uniform vec3 spotLightDirection'+i+';',
						'uniform float spotLightAngle'+i+';',
						'uniform float spotLightPenumbra'+i+';'
					);

					fragment.push(
						'vec3 lVector = normalize(spotLight'+i+'.xyz - vWorldPos.xyz);',
						'float lDistance = 1.0 - min((length(spotLight'+i+'.xyz - vWorldPos.xyz) / spotLight'+i+'.w), 1.0);',

						'float spotEffect = dot(normalize(-spotLightDirection'+i+'), lVector);',

						'if (spotEffect > spotLightAngle'+i+') {',
							'if (spotLightPenumbra'+i+' > 0.0) {',
								'spotEffect = (spotEffect - spotLightAngle'+i+') / spotLightPenumbra'+i+';',
								'spotEffect = clamp(spotEffect, 0.0, 1.0);',
							'} else {',
								'spotEffect = 1.0;',
							'}',

							'float dotProduct = dot(N, lVector);',

							'#ifdef WRAP_AROUND',
								'float spotDiffuseWeightFull = max(dotProduct, 0.0);',
								'float spotDiffuseWeightHalf = max(0.5 * dotProduct + 0.5, 0.0);',

								'float wrapRGB = 1.0;',
								'vec3 spotDiffuseWeight = mix(vec3(spotDiffuseWeightFull), vec3(spotDiffuseWeightHalf), wrapRGB);',
							'#else',
								'float spotDiffuseWeight = max(dotProduct, 0.0);',
							'#endif',

							'vec3 cookie = vec3(1.0);'
					);
					if (useLightCookie) {
						fragment.push(
							'cookie = texture2D(lightCookie'+i+', depth.xy).rgb;'
						);
					}
					fragment.push(
							'totalDiffuse += materialDiffuse.rgb * spotLightColor'+i+'.rgb * spotDiffuseWeight * lDistance * spotEffect * shadow * cookie;',

							'vec3 spotHalfVector = normalize(lVector + normalizedViewPosition);',
							'float spotDotNormalHalf = max(dot(N, spotHalfVector), 0.0);',
							'float spotSpecularWeight = spotLightColor'+i+'.a * specularStrength * max(pow(spotDotNormalHalf, materialSpecularPower), 0.0);',

							'#ifdef PHYSICALLY_BASED_SHADING',
								'float specularNormalization = (materialSpecularPower + 2.0001) / 8.0;',
								'vec3 schlick = materialSpecular.rgb + vec3(1.0 - materialSpecular.rgb) * pow(1.0 - dot(lVector, spotHalfVector), 5.0);',
								'totalSpecular += schlick * spotLightColor'+i+'.rgb * spotSpecularWeight * spotDiffuseWeight * lDistance * specularNormalization * spotEffect * shadow * cookie;',
							'#else',
								'totalSpecular += materialSpecular.rgb * spotLightColor'+i+'.rgb * spotSpecularWeight * spotDiffuseWeight * lDistance * spotEffect * shadow * cookie;',
							'#endif',
						'}'
					);
				}

				fragment.push(
					'}'
				);
			}

			fragment.push(
				'#if defined(EMISSIVE_MAP) && defined(TEXCOORD0)',
					'vec3 emissive = vec3(0.0);',
				'#else',
					'vec3 emissive = materialEmissive.rgb;',
				'#endif',

				'#ifdef SKIP_SPECULAR',
					'final_color.xyz = final_color.xyz * (emissive + totalDiffuse + globalAmbient + materialAmbient.rgb);',
				'#else',
					'final_color.xyz = final_color.xyz * (emissive + totalDiffuse + globalAmbient + materialAmbient.rgb) + totalSpecular;',
				'#endif',

				'#if defined(EMISSIVE_MAP) && defined(TEXCOORD0)',
					'final_color.rgb += texture2D(emissiveMap, texCoord0).rgb * materialEmissive.rgb;',
				'#endif'
			);

			ShaderBuilder.light.prevertex = prevertex.join('\n');
			ShaderBuilder.light.vertex = vertex.join('\n');
			ShaderBuilder.light.prefragment = prefragment.join('\n');
			ShaderBuilder.light.fragment = fragment.join('\n');
		}
	};

	ShaderBuilder.animation = {
		processor: function(shader, shaderInfo) {
			var pose = shaderInfo.currentPose;
			shader.defines = shader.defines || {};
			if (pose) {
				if (!shader.uniforms.jointPalette) {
					shader.uniforms.jointPalette = ShaderBuilder.animation.jointPalette;
				}
				shader.defines.JOINT_COUNT = Math.max(shaderInfo.meshData.paletteMap.length * 3, 80);
			} else {
				delete shader.defines.JOINT_COUNT;
			}
		},
		jointPalette: function (shaderInfo) {
			var skMesh = shaderInfo.meshData;
			var pose = shaderInfo.currentPose;
			if (pose) {
				var palette = pose._matrixPalette;
				var store = skMesh.store;
				if (!store) {
					store = new Float32Array(skMesh.paletteMap.length*12);
					skMesh.store = store;
				}
				var refMat;
				for (var index = 0; index < skMesh.paletteMap.length; index++) {
					refMat = palette[skMesh.paletteMap[index]];
					for (var i = 0; i < 12; i++) {
						store[index * 12 + i] = refMat.data[ShaderBuilder.animation.order[i]];
					}
					/*
					for (var row = 0; row < 3; row++) {
						for (var col = 0; col < 4; col++) {
							// Transposed, so we can pad with translation
							store[index * 12 + row * 4 + col] = refMat.data[col * 4 + row];
						}
					}*/
				}
				return store;
			}
		},
		order: [
			0,4,8,12,
			1,5,9,13,
			2,6,10,14
		],
		prevertex: [
			'#ifdef JOINTIDS',
			'attribute vec4 vertexJointIDs;',
			'#endif',
			'#ifdef WEIGHTS',
			'attribute vec4 vertexWeights;',
			'#endif',
			'#ifdef JOINT_COUNT',
			'uniform vec4 jointPalette[JOINT_COUNT];',
			'#endif'
		].join('\n'),
		vertex: [
			'#if defined(JOINT_COUNT) && defined(WEIGHTS) && defined(JOINTIDS)',

			'int x = 3*int(vertexJointIDs.x);',
			'int y = 3*int(vertexJointIDs.y);',
			'int z = 3*int(vertexJointIDs.z);',
			'int w = 3*int(vertexJointIDs.w);',

			'mat4 mat = mat4(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0);',

			'mat += mat4(',
			'	jointPalette[x+0].x, jointPalette[x+1].x, jointPalette[x+2].x, 0,',
			'	jointPalette[x+0].y, jointPalette[x+1].y, jointPalette[x+2].y, 0,',
			'	jointPalette[x+0].z, jointPalette[x+1].z, jointPalette[x+2].z, 0,',
			'	jointPalette[x+0].w, jointPalette[x+1].w, jointPalette[x+2].w, 1',
			') * vertexWeights.x;',
			'mat += mat4(',
			'	jointPalette[y+0].x, jointPalette[y+1].x, jointPalette[y+2].x, 0,',
			'	jointPalette[y+0].y, jointPalette[y+1].y, jointPalette[y+2].y, 0,',
			'	jointPalette[y+0].z, jointPalette[y+1].z, jointPalette[y+2].z, 0,',
			'	jointPalette[y+0].w, jointPalette[y+1].w, jointPalette[y+2].w, 1',
			') * vertexWeights.y;',
			'mat += mat4(',
			'	jointPalette[z+0].x, jointPalette[z+1].x, jointPalette[z+2].x, 0,',
			'	jointPalette[z+0].y, jointPalette[z+1].y, jointPalette[z+2].y, 0,',
			'	jointPalette[z+0].z, jointPalette[z+1].z, jointPalette[z+2].z, 0,',
			'	jointPalette[z+0].w, jointPalette[z+1].w, jointPalette[z+2].w, 1',
			') * vertexWeights.z;',
			'mat += mat4(',
			'	jointPalette[w+0].x, jointPalette[w+1].x, jointPalette[w+2].x, 0,',
			'	jointPalette[w+0].y, jointPalette[w+1].y, jointPalette[w+2].y, 0,',
			'	jointPalette[w+0].z, jointPalette[w+1].z, jointPalette[w+2].z, 0,',
			'	jointPalette[w+0].w, jointPalette[w+1].w, jointPalette[w+2].w, 1',
			') * vertexWeights.w;',

			'wMatrix = wMatrix * mat / mat[3][3];',
			'#ifdef NORMAL',
				'nMatrix = nMatrix * mat / mat[3][3];',
			'#endif',
			'#endif'
		].join('\n')
	};
	return ShaderBuilder;
});