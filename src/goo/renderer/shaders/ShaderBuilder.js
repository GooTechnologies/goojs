var Capabilities = require('../../renderer/Capabilities');
var MeshData = require('../../renderer/MeshData');
var PointLight = require('../../renderer/light/PointLight');
var DirectionalLight = require('../../renderer/light/DirectionalLight');
var SpotLight = require('../../renderer/light/SpotLight');
var Texture = require('../../renderer/Texture');
var MathUtils = require('../../math/MathUtils');
var TangentGenerator = require('../../util/TangentGenerator');
var ShaderFragment = require('../../renderer/shaders/ShaderFragment');



	/**
	 * Builds shaders
	 */
	function ShaderBuilder() {}

	var defaultLight = new DirectionalLight();
	defaultLight.translation.setDirect(10, 10, 10);
	defaultLight.direction.setDirect(1, 1, 1).normalize();
	ShaderBuilder.defaultLight = defaultLight;

	ShaderBuilder.SKYBOX = null;
	ShaderBuilder.SKYSPHERE = null;
	ShaderBuilder.ENVIRONMENT_TYPE = 0;
	ShaderBuilder.GLOBAL_AMBIENT = [0, 0, 0];
	ShaderBuilder.CLEAR_COLOR = [0.3, 0.3, 0.3, 1];
	ShaderBuilder.USE_FOG = false;
	ShaderBuilder.FOG_SETTINGS = [0, 10000];
	ShaderBuilder.FOG_COLOR = [1, 1, 1];

	ShaderBuilder.uber = {
		defines: function (shader, attributeMap) {
			var keys = Object.keys(attributeMap);
			for (var i = 0, l = keys.length; i < l; i++) {
				shader.setDefine(keys[i], true);
			}
		},

		txMaps: function (shader, textureMaps) {
			var keys = Object.keys(textureMaps);
			for (var i = 0, l = keys.length; i < l; i++) {
				var type = keys[i];
				if (textureMaps[type] === undefined || textureMaps[type] === null) {
					continue;
				}

				if (type === 'SHADOW_MAP') {
					continue;
				}

				shader.setDefine(type, true);
			}
		},

		reflectivity: function (shader, material) {
			if (material.uniforms.reflectivity || material.uniforms.refractivity) {
				shader.setDefine('REFLECTIVE', true);
			} else {
				shader.removeDefine('REFLECTIVE');
			}
			shader.setDefine('REFLECTION_TYPE', material.uniforms.reflectionType !== undefined ? material.uniforms.reflectionType : 0);
		},

		sky: function (shader, material) {
			if (material.getTexture('LOCAL_ENVIRONMENT')) {
				material.setTexture('ENVIRONMENT_SPHERE', material.getTexture('LOCAL_ENVIRONMENT'));
				shader.setDefine('ENVIRONMENT_TYPE', 0);
				if (material.getTexture('ENVIRONMENT_CUBE')) {
					material.removeTexture('ENVIRONMENT_CUBE');
				}
			} else {
				if (ShaderBuilder.SKYBOX && (material.uniforms.reflectivity || material.uniforms.refractivity)) {
					material.setTexture('ENVIRONMENT_CUBE', ShaderBuilder.SKYBOX);
				} else if (material.getTexture('ENVIRONMENT_CUBE')) {
					material.removeTexture('ENVIRONMENT_CUBE');
				}
				if (ShaderBuilder.SKYSPHERE && (material.uniforms.reflectivity || material.uniforms.refractivity)) {
					material.setTexture('ENVIRONMENT_SPHERE', ShaderBuilder.SKYSPHERE);
					shader.setDefine('ENVIRONMENT_TYPE', ShaderBuilder.ENVIRONMENT_TYPE);
				} else if (material.getTexture('ENVIRONMENT_SPHERE')) {
					material.removeTexture('ENVIRONMENT_SPHERE');
				}
			}
		},

		uniforms: function (shader, textureMaps) {
			if (textureMaps.DIFFUSE_MAP) {
				var offset = textureMaps.DIFFUSE_MAP.offset;
				var repeat = textureMaps.DIFFUSE_MAP.repeat;
				shader.uniforms.offsetRepeat[0] = offset.x;
				shader.uniforms.offsetRepeat[1] = offset.y;
				shader.uniforms.offsetRepeat[2] = repeat.x;
				shader.uniforms.offsetRepeat[3] = repeat.y;
				shader.uniforms.lodBias = textureMaps.DIFFUSE_MAP.lodBias;
			} else {
				shader.uniforms.offsetRepeat[0] = 0;
				shader.uniforms.offsetRepeat[1] = 0;
				shader.uniforms.offsetRepeat[2] = 1;
				shader.uniforms.offsetRepeat[3] = 1;
				shader.uniforms.lodBias = 0;
			}
		},

		attributes: function (shader, attributeMap, textureMaps) {
			// Exclude in a nicer way
			var keys = Object.keys(shader.defines);
			for (var i = 0, l = keys.length; i < l; i++) {
				var attribute = keys[i];
				if (attribute === 'SHADOW_TYPE' ||
					attribute === 'JOINT_COUNT' ||
					attribute === 'WEIGHTS' ||
					attribute === 'PHYSICALLY_BASED_SHADING' ||
					attribute === 'ENVIRONMENT_TYPE' ||
					attribute === 'REFLECTIVE' ||
					attribute === 'DISCARD' ||
					attribute === 'OPACITY' ||
					attribute === 'FOG' ||
					attribute === 'REFLECTION_TYPE' ||
					attribute === 'SKIP_SPECULAR' ||
					attribute === 'LIGHT' ||
					attribute === 'COOKIE' ||
					attribute === 'TRANSPARENCY_BW' ||
					attribute === 'WRAP_AROUND') {
					continue;
				}
				if (!attributeMap[attribute] && !textureMaps[attribute]) {
					shader.removeDefine(attribute);
				}
			}
		},

		discard: function (shader, material) {
			// discard
			if (material.uniforms.discardThreshold >= 0.0) {
				shader.setDefine('DISCARD', true);
			} else {
				shader.removeDefine('DISCARD');
			}
		},

		opacity: function (shader, material) {
			// opacity
			var opacity = material.uniforms.opacity;
			if (opacity !== undefined && opacity < 1.0) {
				shader.setDefine('OPACITY', true);
			} else {
				shader.removeDefine('OPACITY');
			}

			// Alpha or "Black and white" transparency
			if (material.uniforms.useBWTransparency === true) {
				shader.setDefine('TRANSPARENCY_BW', true);
			} else {
				shader.removeDefine('TRANSPARENCY_BW');
			}
		},

		fog: function (shader) {
			// fog
			if (ShaderBuilder.USE_FOG) {
				shader.setDefine('FOG', true);
				shader.uniforms.fogSettings = ShaderBuilder.FOG_SETTINGS;
				shader.uniforms.fogColor = ShaderBuilder.FOG_COLOR;
			} else {
				shader.removeDefine('FOG');
			}
		},

		normalTangents: function (shader, shaderInfo) {
			//TODO: Hacky?
			if (shader.hasDefine('NORMAL') && shader.hasDefine('NORMAL_MAP') && !shaderInfo.meshData.getAttributeBuffer(MeshData.TANGENT)) {
				TangentGenerator.addTangentBuffer(shaderInfo.meshData);
			}
		},

		processor: function (shader, shaderInfo) {
			var attributeMap = shaderInfo.meshData.attributeMap;
			var material = shaderInfo.material;
			var textureMaps = material._textureMaps;

			shader.uniforms.clearColor = ShaderBuilder.CLEAR_COLOR;

			ShaderBuilder.uber.reflectivity(shader, material);
			ShaderBuilder.uber.sky(shader, material);


			ShaderBuilder.uber.defines(shader, attributeMap);
			ShaderBuilder.uber.txMaps(shader, textureMaps);


			ShaderBuilder.uber.uniforms(shader, textureMaps);
			ShaderBuilder.uber.attributes(shader, attributeMap, textureMaps);

			ShaderBuilder.uber.discard(shader, material);
			ShaderBuilder.uber.opacity(shader, material);

			ShaderBuilder.uber.fog(shader);

			shader.setDefine('SKIP_SPECULAR', true);
			ShaderBuilder.uber.normalTangents(shader, shaderInfo);
		}
	};

	var lightDefines = [];

	ShaderBuilder.light = {
		pointLight: function (light, uniforms, pointIndex) {
			var uniform = uniforms.pointLights = uniforms.pointLights || [];

			var ind = pointIndex * 8; // 2 vec4 = 8 floats

			var translation = light.translation;
			uniform[ind + 0] = translation.x;
			uniform[ind + 1] = translation.y;
			uniform[ind + 2] = translation.z;
			uniform[ind + 3] = light.range;

			var color = light.color;
			uniform[ind + 4] = color.x * light.intensity;
			uniform[ind + 5] = color.y * light.intensity;
			uniform[ind + 6] = color.z * light.intensity;
			uniform[ind + 7] = light.specularIntensity;

			lightDefines.push('P');
		},
		directionalLight: function (light, uniforms, directionalIndex) {
			var uniform = uniforms.directionalLights = uniforms.directionalLights || [];

			var ind = directionalIndex * 8; // 2 vec4 = 8 floats

			var direction = light.direction;
			uniform[ind + 0] = direction.x;
			uniform[ind + 1] = direction.y;
			uniform[ind + 2] = direction.z;
			uniform[ind + 3] = 0; // padding

			var color = light.color;
			uniform[ind + 4] = color.x * light.intensity;
			uniform[ind + 5] = color.y * light.intensity;
			uniform[ind + 6] = color.z * light.intensity;
			uniform[ind + 7] = light.specularIntensity;

			lightDefines.push('D');
		},
		spotLight: function (light, uniforms, spotIndex) {
			var uniform = uniforms.spotLights = uniforms.spotLights || [];

			var ind = spotIndex * 16; // 4 vec4 = 16 floats
			uniform[ind + 0] = light.translation.x;
			uniform[ind + 1] = light.translation.y;
			uniform[ind + 2] = light.translation.z;
			uniform[ind + 3] = light.range;

			uniform[ind + 4] = light.color.x * light.intensity;
			uniform[ind + 5] = light.color.y * light.intensity;
			uniform[ind + 6] = light.color.z * light.intensity;
			uniform[ind + 7] = light.specularIntensity;

			uniform[ind + 8] = light.direction.x;
			uniform[ind + 9] = light.direction.y;
			uniform[ind + 10] = light.direction.z;
			uniform[ind + 11] = 0; // padding

			uniform[ind + 12] = Math.cos(light.angle * MathUtils.DEG_TO_RAD / 2);
			uniform[ind + 13] = light.penumbra !== undefined ? Math.sin(light.penumbra * MathUtils.DEG_TO_RAD / 4) : 0;
			uniform[ind + 14] = 0; // padding
			uniform[ind + 15] = 0; // padding

			lightDefines.push('S');
		},
		shadows: function (light, uniforms, i, shader, shaderInfo, shadowIndex) {
			var useLightCookie = light.lightCookie instanceof Texture;

			if ((useLightCookie || light.shadowCaster) && light.shadowSettings.shadowData) {
				var shadowData = light.shadowSettings.shadowData;

				if (light.shadowCaster) {
					uniforms['shadowMaps' + i] = 'SHADOW_MAP' + i;
					shaderInfo.material.setTexture('SHADOW_MAP' + i, shadowData.shadowResult);

					var uniform = uniforms.shadowData = uniforms.shadowData || [];

					var ind = shadowIndex * 8;

					var translationData = shadowData.lightCamera.translation;
					uniform[ind + 0] = translationData.x;
					uniform[ind + 1] = translationData.y;
					uniform[ind + 2] = translationData.z;
					uniform[ind + 3] = light.shadowSettings.shadowOffset;

					uniform[ind + 4] = shadowData.cameraScale;
					uniform[ind + 5] = light.shadowSettings.darkness;
					if (light.shadowSettings.shadowType === 'PCF') {
						uniform[ind + 6] = light.shadowSettings.resolution[0];
						uniform[ind + 7] = light.shadowSettings.resolution[1];
					} else {
						uniform[ind + 6] = 0;
						uniform[ind + 7] = 0;
					}

					shadowIndex++;

					lightDefines.push('H', light.shadowSettings.shadowType === 'PCF' ? 1 : light.shadowSettings.shadowType === 'VSM' ? 2 : 0);
				}

				if (useLightCookie) {
					uniforms['lightCookie' + i] = 'LIGHT_COOKIE' + i;
					shaderInfo.material.setTexture('LIGHT_COOKIE' + i, light.lightCookie);
					lightDefines.push('C');
					shader.setDefine('COOKIE', true);
				} else {
					shader.removeDefine('COOKIE');
				}

				uniforms['shadowLightMatrices' + i] = shadowData.vpm;
			}

			return shadowIndex;
		},
		processor: function (shader, shaderInfo) {
			var uniforms = shader.uniforms;
			uniforms.totalAmbient = uniforms.totalAmbient || [0.1, 0.1, 0.1];
			shaderInfo.material.uniforms.totalAmbient = shaderInfo.material.uniforms.totalAmbient || [0.1, 0.1, 0.1];
			var materialAmbient = shaderInfo.material.uniforms.materialAmbient || uniforms.materialAmbient || [0.1, 0.1, 0.1, 1.0];
			var totalAmbient = shaderInfo.material.uniforms.totalAmbient;
			if (shaderInfo.material.multiplyAmbient) {
				totalAmbient[0] = materialAmbient[0] * ShaderBuilder.GLOBAL_AMBIENT[0];
				totalAmbient[1] = materialAmbient[1] * ShaderBuilder.GLOBAL_AMBIENT[1];
				totalAmbient[2] = materialAmbient[2] * ShaderBuilder.GLOBAL_AMBIENT[2];
			} else {
				totalAmbient[0] = materialAmbient[0] + ShaderBuilder.GLOBAL_AMBIENT[0];
				totalAmbient[1] = materialAmbient[1] + ShaderBuilder.GLOBAL_AMBIENT[1];
				totalAmbient[2] = materialAmbient[2] + ShaderBuilder.GLOBAL_AMBIENT[2];
			}

			var receiveShadows = shaderInfo.renderable &&
				shaderInfo.renderable.meshRendererComponent &&
				shaderInfo.renderable.meshRendererComponent.receiveShadows;
			if (receiveShadows) {
				shader.setDefine('RECEIVE_SHADOW', true);
			} else {
				shader.removeDefine('RECEIVE_SHADOW');
			}

			if (!shader.frameStart) {
				var lights = shaderInfo.lights;
				for (var i = 0; i < lights.length; i++) {
					var light = lights[i];
					var useLightCookie = light.lightCookie instanceof Texture;

					if ((useLightCookie || light.shadowCaster) && light.shadowSettings.shadowData) {
						var shadowData = light.shadowSettings.shadowData;

						if (light.shadowCaster) {
							shaderInfo.material.setTexture('SHADOW_MAP' + i, shadowData.shadowResult);
						}
						if (useLightCookie) {
							shaderInfo.material.setTexture('LIGHT_COOKIE' + i, light.lightCookie);
						}
					} else {
						shaderInfo.material.removeTexture('SHADOW_MAP' + i);
						shaderInfo.material.removeTexture('LIGHT_COOKIE' + i);
					}
				}

				return;
			}

			// code below only has to be once per frame
			uniforms.materialEmissive = uniforms.materialEmissive || 'EMISSIVE';
			uniforms.materialDiffuse = uniforms.materialDiffuse || 'DIFFUSE';
			uniforms.materialSpecular = uniforms.materialSpecular || 'SPECULAR';

			var pointIndex = 0;
			var directionalIndex = 0;
			var spotIndex = 0;
			var shadowIndex = 0;

			var lights = shaderInfo.lights;
			if (lights.length > 0) {
				for (var i = 0; i < lights.length; i++) {
					var light = lights[i];

					if (light instanceof PointLight) {
						ShaderBuilder.light.pointLight(light, uniforms, pointIndex);
						pointIndex++;
					} else if (light instanceof DirectionalLight) {
						ShaderBuilder.light.directionalLight(light, uniforms, directionalIndex);
						directionalIndex++;
					} else if (light instanceof SpotLight) {
						ShaderBuilder.light.spotLight(light, uniforms, spotIndex);
						spotIndex++;
					}

					shadowIndex = ShaderBuilder.light.shadows(light, uniforms, i, shader, shaderInfo, shadowIndex);
				}

				var lightStr = lightDefines.join('');
				shader.setDefine('LIGHT', lightStr);
				lightDefines.length = 0;
			} else {
				shader.removeDefine('LIGHT');
			}
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
				'uniform vec3 totalAmbient;',

				'uniform vec4 materialEmissive;',
				'uniform vec4 materialDiffuse;',
				'uniform vec4 materialSpecular;',
				'uniform vec2 wrapSettings;',

				// 'float VsmFixLightBleed(in float pMax, in float amount) {',
				// 	'return clamp((pMax - amount) / (1.0 - amount), 0.0, 1.0);',
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
			if (lights.length > 0) {
				fragment.push(
					'vec3 normalizedViewPosition = normalize(viewPosition);'
				);

				var pointIndex = 0;
				var directionalIndex = 0;
				var spotIndex = 0;
				var shadowIndex = 0;

				for (var i = 0; i < lights.length; i++) {
					var light = lights[i];
					if (light instanceof PointLight) {
						pointIndex++;
					} else if (light instanceof DirectionalLight) {
						directionalIndex++;
					} else if (light instanceof SpotLight) {
						spotIndex++;
					}

					if (light.lightCookie instanceof Texture || light.shadowCaster) {
						shadowIndex++;
					}
				}
				if (pointIndex > 0) {
					prefragment.push(
						'uniform vec4 pointLights[' + (pointIndex * 2) + '];'
					);
				}
				if (directionalIndex > 0) {
					prefragment.push(
						'uniform vec4 directionalLights[' + (directionalIndex * 2) + '];'
					);
				}
				if (spotIndex > 0) {
					prefragment.push(
						'uniform vec4 spotLights[' + (spotIndex * 4) + '];'
					);
				}
				if (shadowIndex > 0) {
					prefragment.push(
						ShaderFragment.methods.unpackDepth,
						'uniform vec4 shadowData[' + (shadowIndex * 2) + '];',
						'float texture2DCompare(sampler2D depths, vec2 uv, float compare) {',
							'return step(unpackDepth(texture2D(depths, uv)), compare);',
						'}'
					);
				}

				pointIndex = 0;
				directionalIndex = 0;
				spotIndex = 0;
				shadowIndex = 0;

				for (var i = 0; i < lights.length; i++) {
					var light = lights[i];

					fragment.push(
						'{',
							'float shadow = 1.0;'
					);

					var useLightCookie = light.lightCookie instanceof Texture;
					if (light.shadowCaster || useLightCookie) {
						prevertex.push(
							'uniform mat4 shadowLightMatrices' + i + ';',
							'varying vec4 shadowLightDepths' + i + ';'
						);

						vertex.push(
							'shadowLightDepths' + i + ' = ScaleMatrix * shadowLightMatrices' + i + ' * worldPos;'
						);

						if (light.shadowCaster) {
							prefragment.push(
								'uniform sampler2D shadowMaps' + i + ';'
							);
							fragment.push(
								'float shadowOffset' + i + ' = shadowData[' + (shadowIndex * 2 + 0) + '].w;',
								'float shadowDarkness' + i + ' = shadowData[' + (shadowIndex * 2 + 1) + '].y;'
							);
							if (light.shadowSettings.shadowType === 'PCF') {
								fragment.push(
									'vec2 shadowMapSizes' + i + ' = shadowData[' + (shadowIndex * 2 + 1) + '].zw;'
								);
							} else if (light.shadowSettings.shadowType === 'VSM') {
								fragment.push(
									'vec3 shadowLightPositions' + i + ' = shadowData[' + (shadowIndex * 2 + 0) + '].xyz;',
									'float cameraScales' + i + ' = shadowData[' + (shadowIndex * 2 + 1) + '].x;'
								);
							}
						}
						if (useLightCookie) {
							prefragment.push(
								'uniform sampler2D lightCookie' + i + ';'
							);
						}

						prefragment.push(
							'varying vec4 shadowLightDepths' + i + ';'
						);

						fragment.push(
							'vec3 depth = shadowLightDepths' + i + '.xyz / shadowLightDepths' + i + '.w;'
						);

						if (light.shadowCaster) {
							shadowIndex++;
							fragment.push(
								'#ifdef RECEIVE_SHADOW',
								'depth.z += shadowOffset' + i + ';',
								'if (depth.x >= 0.0 && depth.x <= 1.0 && depth.y >= 0.0 && depth.y <= 1.0 && shadowLightDepths' + i + '.z >= 0.0 && depth.z <= 1.0) {'
							);
							if (light.shadowSettings.shadowType === 'PCF') {
								fragment.push(
									'float xPixelOffset = 1.0 / shadowMapSizes' + i + '.x;',
									'float yPixelOffset = 1.0 / shadowMapSizes' + i + '.y;',
									'float shadowRadius = 1.25;',

									'float dx0 = -shadowRadius * xPixelOffset;',
									'float dy0 = -shadowRadius * yPixelOffset;',
									'float dx1 = shadowRadius * xPixelOffset;',
									'float dy1 = shadowRadius * yPixelOffset;',

									'shadow = 1.0 - (',
										'texture2DCompare(shadowMaps' + i + ', depth.xy + vec2(dx0, dy0), depth.z) +',
										'texture2DCompare(shadowMaps' + i + ', depth.xy + vec2(0.0, dy0), depth.z) +',
										'texture2DCompare(shadowMaps' + i + ', depth.xy + vec2(dx1, dy0), depth.z) +',
										'texture2DCompare(shadowMaps' + i + ', depth.xy + vec2(dx0, 0.0), depth.z) +',
										'texture2DCompare(shadowMaps' + i + ', depth.xy, depth.z) +',
										'texture2DCompare(shadowMaps' + i + ', depth.xy + vec2(dx1, 0.0), depth.z) +',
										'texture2DCompare(shadowMaps' + i + ', depth.xy + vec2(dx0, dy1), depth.z) +',
										'texture2DCompare(shadowMaps' + i + ', depth.xy + vec2(0.0, dy1), depth.z) +',
										'texture2DCompare(shadowMaps' + i + ', depth.xy + vec2(dx1, dy1), depth.z)',
									') * (shadowDarkness' + i + ' / 9.0);'
								);
							} else if (light.shadowSettings.shadowType === 'VSM') {
								fragment.push(
									'depth.z = length(vWorldPos.xyz - shadowLightPositions' + i + ') * cameraScales' + i + ';',
									'vec4 texel = texture2D(shadowMaps' + i + ', depth.xy);',
									'vec2 moments = vec2(texel.x, texel.y);',
									'shadow = ChebychevInequality(moments, depth.z);',
									// 'shadow = VsmFixLightBleed(shadow, 0.5);'
									'shadow = pow(shadow, shadowDarkness' + i + ' * 8.0);'
								);
							} else {
								fragment.push(
									'shadow = 1.0 - texture2DCompare(shadowMaps' + i + ', depth.xy, depth.z) * shadowDarkness' + i + ';'
								);
							}
							fragment.push(
								'} else {',
									'shadow = 1.0;',
								'}',
								'shadow = clamp(shadow, 0.0, 1.0);',
								'#endif'
							);
						}
					}

					if (light instanceof PointLight) {
						fragment.push(
							'vec4 pointLight' + i + ' = pointLights[' + (pointIndex * 2 + 0) + '];',
							'vec4 pointLightColor' + i + ' = pointLights[' + (pointIndex * 2 + 1) + '];'
						);

						fragment.push(
							'vec3 lVector = normalize(pointLight' + i + '.xyz - vWorldPos.xyz);',
							'float lDistance = 1.0 - min((length(pointLight' + i + '.xyz - vWorldPos.xyz) / pointLight' + i + '.w), 1.0);',

							'float dotProduct = dot(N, lVector);',

							'float pointDiffuseWeightFull = max(dotProduct, 0.0);',
							'float pointDiffuseWeightHalf = max(mix(dotProduct, 1.0, wrapSettings.x), 0.0);',
							'vec3 pointDiffuseWeight = mix(vec3(pointDiffuseWeightFull), vec3(pointDiffuseWeightHalf), wrapSettings.y);',

							'totalDiffuse += materialDiffuse.rgb * pointLightColor' + i + '.rgb * pointDiffuseWeight * lDistance * shadow;',

							'vec3 pointHalfVector = normalize(lVector + normalizedViewPosition);',
							'float pointDotNormalHalf = max(dot(N, pointHalfVector), 0.0);',
							'float pointSpecularWeight = pointLightColor' + i + '.a * specularStrength * max(pow(pointDotNormalHalf, materialSpecular.a), 0.0);',

							'#ifdef PHYSICALLY_BASED_SHADING',
								'float specularNormalization = (materialSpecular.a + 2.0001 ) / 8.0;',
								'vec3 schlick = materialSpecular.rgb + vec3(1.0 - materialSpecular.rgb) * pow(1.0 - dot(lVector, pointHalfVector), 5.0);',
								'totalSpecular += schlick * pointLightColor' + i + '.rgb * pointSpecularWeight * pointDiffuseWeight * lDistance * specularNormalization * shadow;',
							'#else',
								'totalSpecular += materialSpecular.rgb * pointLightColor' + i + '.rgb * pointSpecularWeight * pointDiffuseWeight * lDistance * shadow;',
							'#endif'
						);

						pointIndex++;
					} else if (light instanceof DirectionalLight) {
						fragment.push(
							'vec3 directionalLightDirection' + i + ' = directionalLights[' + (directionalIndex * 2 + 0) + '].xyz;',
							'vec4 directionalLightColor' + i + ' = directionalLights[' + (directionalIndex * 2 + 1) + '];'
						);

						fragment.push(
							'vec3 dirVector = normalize(-directionalLightDirection' + i + ');',
							'float dotProduct = dot(N, dirVector);',

							'float dirDiffuseWeightFull = max(dotProduct, 0.0);',
							'float dirDiffuseWeightHalf = max(mix(dotProduct, 1.0, wrapSettings.x), 0.0);',
							'vec3 dirDiffuseWeight = mix(vec3(dirDiffuseWeightFull), vec3(dirDiffuseWeightHalf), wrapSettings.y);',

							'vec3 cookie = vec3(1.0);'
						);
						if (useLightCookie) {
							fragment.push(
								'vec4 cookieTex = texture2D(lightCookie' + i + ', depth.xy);',
								'cookie = cookieTex.rgb * cookieTex.a;'
							);
						}
						fragment.push(
							'totalDiffuse += materialDiffuse.rgb * directionalLightColor' + i + '.rgb * dirDiffuseWeight * shadow * cookie;',

							'vec3 dirHalfVector = normalize(dirVector + normalizedViewPosition);',
							'float dirDotNormalHalf = max(dot(N, dirHalfVector), 0.0);',
							'float dirSpecularWeight = directionalLightColor' + i + '.a * specularStrength * max(pow(dirDotNormalHalf, materialSpecular.a), 0.0);',

							'#ifdef PHYSICALLY_BASED_SHADING',
								'float specularNormalization = (materialSpecular.a + 2.0001) / 8.0;',
								'vec3 schlick = materialSpecular.rgb + vec3(1.0 - materialSpecular.rgb) * pow(1.0 - dot(dirVector, dirHalfVector), 5.0);',
								'totalSpecular += schlick * directionalLightColor' + i + '.rgb * dirSpecularWeight * dirDiffuseWeight * specularNormalization * shadow * cookie;',
							'#else',
								'totalSpecular += materialSpecular.rgb * directionalLightColor' + i + '.rgb * dirSpecularWeight * dirDiffuseWeight * shadow * cookie;',
							'#endif'
						);

						directionalIndex++;
					} else if (light instanceof SpotLight) {
						fragment.push(
							'vec4 spotLight' + i + ' = spotLights[' + (spotIndex * 4 + 0) + '];',
							'vec4 spotLightColor' + i + ' = spotLights[' + (spotIndex * 4 + 1) + '];',
							'vec3 spotLightDirection' + i + ' = spotLights[' + (spotIndex * 4 + 2) + '].xyz;',
							'float spotLightAngle' + i + ' = spotLights[' + (spotIndex * 4 + 3) + '].x;',
							'float spotLightPenumbra' + i + ' = spotLights[' + (spotIndex * 4 + 3) + '].y;'
						);

						fragment.push(
							'vec3 lVector = normalize(spotLight' + i + '.xyz - vWorldPos.xyz);',
							'float lDistance = 1.0 - min((length(spotLight' + i + '.xyz - vWorldPos.xyz) / spotLight' + i + '.w), 1.0);',

							'float spotEffect = dot(normalize(-spotLightDirection' + i + '), lVector);',

							'if (spotEffect > spotLightAngle' + i + ') {',
								'if (spotLightPenumbra' + i + ' > 0.0) {',
									'spotEffect = (spotEffect - spotLightAngle' + i + ') / spotLightPenumbra' + i + ';',
									'spotEffect = clamp(spotEffect, 0.0, 1.0);',
								'} else {',
									'spotEffect = 1.0;',
								'}',

								'float dotProduct = dot(N, lVector);',

								'float spotDiffuseWeightFull = max(dotProduct, 0.0);',
								'float spotDiffuseWeightHalf = max(mix(dotProduct, 1.0, wrapSettings.x), 0.0);',
								'vec3 spotDiffuseWeight = mix(vec3(spotDiffuseWeightFull), vec3(spotDiffuseWeightHalf), wrapSettings.y);',

								'vec3 cookie = vec3(1.0);'
						);
						if (useLightCookie) {
							fragment.push(
								'vec4 cookieTex = texture2D(lightCookie' + i + ', depth.xy);',
								'cookie = cookieTex.rgb * cookieTex.a;'
							);
						}
						fragment.push(
								'totalDiffuse += materialDiffuse.rgb * spotLightColor' + i + '.rgb * spotDiffuseWeight * lDistance * spotEffect * shadow * cookie;',

								'vec3 spotHalfVector = normalize(lVector + normalizedViewPosition);',
								'float spotDotNormalHalf = max(dot(N, spotHalfVector), 0.0);',
								'float spotSpecularWeight = spotLightColor' + i + '.a * specularStrength * max(pow(spotDotNormalHalf, materialSpecular.a), 0.0);',

								'#ifdef PHYSICALLY_BASED_SHADING',
									'float specularNormalization = (materialSpecular.a + 2.0001) / 8.0;',
									'vec3 schlick = materialSpecular.rgb + vec3(1.0 - materialSpecular.rgb) * pow(1.0 - dot(lVector, spotHalfVector), 5.0);',
									'totalSpecular += schlick * spotLightColor' + i + '.rgb * spotSpecularWeight * spotDiffuseWeight * lDistance * specularNormalization * spotEffect * shadow * cookie;',
								'#else',
									'totalSpecular += materialSpecular.rgb * spotLightColor' + i + '.rgb * spotSpecularWeight * spotDiffuseWeight * lDistance * spotEffect * shadow * cookie;',
								'#endif',
							'}'
						);

						spotIndex++;
					}

					fragment.push(
						'}'
					);
				}
			}

			fragment.push(
				'#if defined(EMISSIVE_MAP) && defined(TEXCOORD0)',
					'vec3 emissive = vec3(0.0);',
				'#else',
					'vec3 emissive = materialEmissive.rgb;',
				'#endif',

				// '#if defined(MULTIPLY_AMBIENT)',
				// 	'vec3 ambient = globalAmbient * materialAmbient.rgb;',
				// '#else',
				// 	'vec3 ambient = globalAmbient + materialAmbient.rgb;',
				// '#endif',

				'#ifdef SKIP_SPECULAR',
					'final_color.xyz = final_color.xyz * (emissive + totalDiffuse + totalAmbient);',
				'#else',
					'final_color.xyz = final_color.xyz * (emissive + totalDiffuse + totalAmbient) + totalSpecular;',
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
		processor: function (shader, shaderInfo) {
			var pose = shaderInfo.currentPose;
			if (pose) {
				if (!shader.uniforms.jointPalette) {
					shader.uniforms.jointPalette = ShaderBuilder.animation.jointPalette;
				}
				// var maxUniforms = Math.floor(Math.max(Capabilities.maxVertexUniformVectors - 10, 0)); // Just estimate available
				// shader.setDefine('JOINT_COUNT', Math.min(shaderInfo.meshData.paletteMap.length * 3, maxUniforms));
				shader.setDefine('JOINT_COUNT', shaderInfo.meshData.paletteMap.length * 3);
			} else {
				shader.removeDefine('JOINT_COUNT');
			}
		},
		jointPalette: function (shaderInfo) {
			var skMesh = shaderInfo.meshData;
			var pose = shaderInfo.currentPose;
			if (pose) {
				var palette = pose._matrixPalette;
				var store = skMesh.store;
				if (!store) {
					store = new Float32Array(skMesh.paletteMap.length * 12);
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
			0, 4, 8, 12,
			1, 5, 9, 13,
			2, 6, 10, 14
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
				'nMatrix = nMatrix * mat3(mat) / mat[3][3];',
			'#endif',
			'#endif'
		].join('\n')
	};
	module.exports = ShaderBuilder;