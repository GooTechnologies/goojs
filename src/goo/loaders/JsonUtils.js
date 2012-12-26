/*jshint bitwise: false */
define(['goo/renderer/Util', 'goo/renderer/MeshData', 'goo/renderer/BufferUtils', 'goo/math/Transform', 'goo/math/Matrix3x3', 'goo/math/Vector3',
		'goo/animation/blendtree/ClipSource', 'goo/animation/layer/AnimationLayer', 'goo/animation/state/SteadyState',
		'goo/animation/state/FadeTransitionState', 'goo/animation/state/FrozenTransitionState', 'goo/animation/state/IgnoreTransitionState',
		'goo/animation/state/ImmediateTransitionState', 'goo/animation/state/SyncFadeTransitionState', 'goo/animation/state/StateBlendType',
		'goo/animation/blendtree/BinaryLERPSource', 'goo/animation/blendtree/ExclusiveClipSource', 'goo/animation/blendtree/FrozenClipSource',
		'goo/animation/blendtree/InclusiveClipSource', 'goo/animation/blendtree/ManagedTransformSource', 'goo/animation/layer/LayerLERPBlender'],
	function (Util, MeshData, BufferUtils, Transform, Matrix3x3, Vector3, ClipSource, AnimationLayer, SteadyState, FadeTransitionState,
		FrozenTransitionState, IgnoreTransitionState, ImmediateTransitionState, SyncFadeTransitionState, StateBlendType, BinaryLERPSource,
		ExclusiveClipSource, FrozenClipSource, InclusiveClipSource, ManagedTransformSource, LayerLERPBlender) {
		"use strict";

		/**
		 * @name JsonUtils
		 * @class Utilities for parsing json data
		 */
		function JsonUtils() {

		}

		JsonUtils.fillAttributeBufferFromCompressedString = function (attribs, meshData, attributeKey, scales, offsets) {
			var buffer = meshData.getAttributeBuffer(attributeKey);
			var stride = scales.length;
			var tuples = attribs.length / scales.length;
			var prev, word, outIndex, i, j;
			for (j = 0; j < stride; j++) {
				prev = 0;
				for (i = 0; i < tuples; i++) {
					word = attribs.charCodeAt(i + j * tuples);
					outIndex = i * stride + j;
					prev += JsonUtils.unzip(word);
					var val = (prev + offsets[j]) * scales[j];
					buffer[outIndex] = val;
				}
			}
		};

		JsonUtils.getIntBuffer = function (indices, vertexCount) {
			var indexBuffer = BufferUtils.createIntBuffer(indices.length, vertexCount);
			indexBuffer.set(indices);
			return indexBuffer;
		};

		JsonUtils.getIntBufferFromCompressedString = function (indices, vertexCount) {
			var prev = 0;
			var indexBuffer = BufferUtils.createIntBuffer(indices.length, vertexCount);
			for (var i = 0; i < indices.length; ++i) {
				var word = indices.charCodeAt(i);
				prev += JsonUtils.unzip(word);
				indexBuffer[i] = prev;
			}
			return indexBuffer;
		};

		JsonUtils.unzip = function (word) {
			if (word >= 0xE000) {
				word -= 0x0800;
			}
			word -= 0x23;
			// un-zigzag
			word = (word >> 1) ^ (-(word & 1));

			return word;
		};

		JsonUtils.parseTransform = function (object) {
			var transform = new Transform();

			transform.translation = JsonUtils.parseVector3(object.Translation);
			transform.scale = JsonUtils.parseVector3(object.Scale);
			transform.rotation = JsonUtils.parseMatrix3(object.Rotation);

			return transform;
		};

		JsonUtils.parseMatrix3 = function (array) {
			var matrix = new Matrix3x3();
			// data files are currently row major!
			matrix.e00 = array[0];
			matrix.e01 = array[1];
			matrix.e02 = array[2];
			matrix.e10 = array[3];
			matrix.e11 = array[4];
			matrix.e12 = array[5];
			matrix.e20 = array[6];
			matrix.e21 = array[7];
			matrix.e22 = array[8];
			return matrix;
		};

		JsonUtils.parseVector3 = function (array) {
			return new Vector3(array[0], array[1], array[2]);
		};

		JsonUtils.parseAnimationLayers = function (manager, completeCallback, inputStore, outputStore, root) {
			var layersObj = root.Layers;
			for (var key in layersObj) {
				var layer;
				if ("DEFAULT" === key) {
					layer = manager.getBaseAnimationLayer();
				} else {
					layer = new AnimationLayer(key);
					manager.addAnimationLayer(layer);
				}

				var layerObj = layersObj[key];
				JsonUtils.parseLayerProperties(manager, layer, layerObj);

				if (layerObj.States) {
					var statesArray = layerObj.States;
					for (var i = 0, max = statesArray.length; i < max; i++) {
						JsonUtils.parseSteadyState(statesArray[i], inputStore, outputStore, manager, layer);
					}
				}

				if (layerObj.Transitions) {
					var transitions = layerObj.Transitions;
					for (var transKey in transitions) {
						// parse and add transition layer
						layer._transitions[transKey] = JsonUtils.parseTransitionState(transitions[transKey], inputStore, outputStore, manager);
					}
				}
			}

			if (completeCallback !== null) {
				completeCallback.onSuccess(outputStore);
			}
		};

		JsonUtils.parseSteadyState = function (json, inputStore, outputStore, manager, layer) {
			var state = new SteadyState(json.Name ? json.Name : "unknown");

			if (json.Clip) {
				// check if we are simple and just have a clip
				var root = json.Clip;
				var clip = inputStore[root.Name];
				// create source
				var source = new ClipSource(clip, manager);
				state._sourceTree = source;
				outputStore._usedClipSources[source._clip._name] = source;
				JsonUtils.populateClipSource(source, clip, root, manager);
			} else if (json.Tree) {
				// else we should have a tree
				state._sourceTree = JsonUtils.parseTreeSource(json.Tree, inputStore, outputStore, manager);
			}

			if (json.EndTransition) {
				// parse end transition
				state._endTransition = JsonUtils.parseTransitionState(json.EndTransition, inputStore, outputStore, manager);
			}

			// look for a set of transitions
			if (json.Transitions) {
				var transitions = json.Transitions;
				for (var key in transitions) {
					// parse and add transition
					state._transitions[key] = JsonUtils.parseTransitionState(transitions[key], inputStore, outputStore, manager);
				}
			}

			if (json.Default) {
				layer.setCurrentState(state, true);
			}

			layer._steadyStates[state._name] = state;
		};

		JsonUtils.parseTransitionState = function (args, inputStore, outputStore, manager) {
			var type = args[2];
			var transition;

			// based on our "type", create our transition state...
			if ("fade" === type) {
				transition = new FadeTransitionState(args[3], args[4], StateBlendType[args[5]]);
			} else if ("syncfade" === type) {
				transition = new SyncFadeTransitionState(args[3], args[4], StateBlendType[args[5]]);
			} else if ("frozen" === type) {
				transition = new FrozenTransitionState(args[3], args[4], StateBlendType[args[5]]);
			} else if ("immediate" === type) {
				transition = new ImmediateTransitionState(args[3]);
			} else if ("ignore" === type) {
				transition = new IgnoreTransitionState();
			} else {
				return null;
			}

			// pull a start window, if set
			if (!isNaN(args[0])) {
				transition.setStartWindow(args[0]);
			}

			// pull an end window, if set
			if (!isNaN(args[1])) {
				transition.setEndWindow(args[1]);
			}

			return transition;
		};

		JsonUtils.parseTreeSource = function (json, inputStore, outputStore, manager) {
			// look for the source type
			if (json.Clip) {
				// ClipSource
				var root = json.Clip;
				var clip = inputStore[root.Name];
				// create source
				var source = new ClipSource(clip, manager);
				outputStore._usedClipSources[source._clip._name] = source;
				JsonUtils.populateClipSource(source, clip, root, manager);
				return source;
			} else if (json.InclusiveClip) {
				// InclusiveClipSource
				var root = json.InclusiveClip;
				var clip = inputStore[root.Name];
				// create source
				var source = new InclusiveClipSource(clip, manager);
				outputStore._usedClipSources[source._clip._name] = source;
				JsonUtils.populateClipSource(source, clip, root, manager);
				// add channels/joints
				if (root.Channels) {
					source.addEnabledChannels(root.Channels);
				}
				if (root.JointNames) {
					var sk = manager.getSkeletonPose(0).getSkeleton();
					var names = root.JointNames;
					for (var jname in names) {
						source.addEnabledJoints(sk.findJointByName(jname));
					}
				}
				if (root.Joints) {
					source.addEnabledJoints(root.Joints);
				}
				return source;
			} else if (json.ExclusiveClip) {
				// ExclusiveClipSource
				var root = json.ExclusiveClip;
				var clip = inputStore[root.Name];
				// create source
				var source = new ExclusiveClipSource(clip, manager);
				outputStore._usedClipSources[source._clip._name] = source;
				JsonUtils.populateClipSource(source, clip, root, manager);
				// add channels/joints
				if (root.Channels) {
					source.addDisabledChannels(root.Channels);
				}
				if (root.Joints) {
					source.addDisabledJoints(root.Joints);
				}
				return source;
			} else if (json.Lerp) {
				// BinaryLERPSource
				var root = json.Lerp;
				// get child source A
				var sourceA = JsonUtils.parseTreeSource(root.ChildA, inputStore, outputStore, manager);
				// get child source B
				var sourceB = JsonUtils.parseTreeSource(root.ChildB, inputStore, outputStore, manager);
				// create source
				var source = new BinaryLERPSource(sourceA, sourceB);
				// pull weight info
				if (root.BlendKey) {
					source._blendKey = root.BlendKey;
					manager._valuesStore[source._blendKey] = isNaN(root.BlendWeight) ? 0.0 : root.BlendWeight;
				}
				return source;
			} else if (json.Managed) {
				// ManagedTransformSource
				var root = json.Managed;
				// create source
				var source = new ManagedTransformSource();
				// if we are asked to, init joint positions from initial position of a clip
				if (root.InitFromClip) {
					var init = root.InitFromClip;
					// store name for future use.
					source._sourceName = init.Clip;

					// get clip
					var clip = inputStore[source._sourceName];
					if (init.JointNames) {
						source.initJointsByName(manager._applyToPoses[0], clip, init.JointNames);
					}
					if (init.JointIds) {
						source.initJointsById(clip, init.JointIds);
					}
				}
				return source;
			} else if (json.Frozen) {
				// FrozenTreeSource
				var root = json.Frozen;
				var childSource = JsonUtils.parseTreeSource(root.Child, inputStore, outputStore, manager);
				return new FrozenClipSource(childSource, isNaN(root.Time) ? 0.0 : root.Time);
			}

			// don't know the given type
			console.warn("no known source type found.");
			return null;
		};

		JsonUtils.populateClipSource = function (source, clip, root, manager) {
			// clip instance params...
			// add time scaling, if present
			if (root.TimeScale !== undefined) {
				manager.getClipInstance(clip)._timeScale = (isNaN(root.TimeScale) ? 1.0 : root.TimeScale);
			}
			// add loop count
			if (root.LoopCount !== undefined) {
				manager.getClipInstance(clip)._loopCount = (isNaN(root.LoopCount) ? 1 : root.LoopCount);
			}
			// add active flag
			if (root.Active !== undefined) {
				manager.getClipInstance(clip)._active = (root.Active === true);
			}
		};

		JsonUtils.parseLayerProperties = function (manager, layer, layerObj) {
			if (layerObj.BlendType) {
				var blender = null;
				if ("lerp" === layerObj.BlendType) {
					blender = new LayerLERPBlender();
					layer._layerBlender = blender;
				}
				if (blender !== null && layerObj.BlendKey) {
					blender._blendKey = layerObj.BlendKey;
					manager._valuesStore[blender._blendKey] = isNaN(layerObj.BlendWeight) ? 0.0 : layerObj.BlendWeight;
				}
			}
		};

		JsonUtils.parseChannelTimes = function (chanObj, useCompression) {
			var timesVal = chanObj.Times;
			if (timesVal) {
				if (useCompression) {
					var scaleOffset = chanObj.TimeOffsetScale;
					var offset = scaleOffset[0];
					var scale = scaleOffset[1];
					return JsonUtils.parseFloatArrayFromCompressedString(timesVal, [scale], [offset]);
				} else {
					return timesVal;
				}
			}
			return null;
		};

		JsonUtils.parseFloatLERPValues = function (chanObj, useCompression) {
			var valuesVal = chanObj.IFCValues;
			if (valuesVal) {
				if (useCompression) {
					var scaleOffset = chanObj.IFCOffsetScale;
					var offset = scaleOffset[0];
					var scale = scaleOffset[1];
					return JsonUtils.parseFloatArrayFromCompressedString(valuesVal, [scale], [offset]);
				} else {
					return valuesVal;
				}
			}
			return null;
		};

		JsonUtils.parseRotationSamples = function (chanObj, range, useCompression) {
			var transVal = chanObj.RotationSamples;
			if (transVal) {
				if (useCompression) {
					var offset = 1 - (range + 1 >> 1);
					var scale = 1 / -offset;

					return JsonUtils.parseFloatArrayFromCompressedString(transVal, [scale, scale, scale, scale], [offset, offset, offset, offset]);
				} else {
					return JsonUtils.parseQuaternionSamples(transVal);
				}
			}
			return null;
		};

		JsonUtils.parseTranslationSamples = function (chanObj, size, useCompression) {
			var uniform = chanObj.UniformTranslation;
			if (uniform) {
				var translation = uniform;
				if (uniform === undefined) {
					console.log('asdf');
				}
				var xScale = translation[0];
				var yScale = translation[1];
				var zScale = translation[2];
				var rVal = [];
				for (var i = 0; i < size; i++) {
					rVal[i * 3 + 0] = xScale;
					rVal[i * 3 + 1] = yScale;
					rVal[i * 3 + 2] = zScale;
				}
				return rVal;
			}

			var transVal = chanObj.TranslationSamples;
			if (transVal) {
				if (useCompression) {
					var scaleOffset = chanObj.TranslationOffsetScale;
					var xOffset = scaleOffset[0];
					var yOffset = scaleOffset[1];
					var zOffset = scaleOffset[2];
					var scale = scaleOffset[3];
					return JsonUtils.parseFloatArrayFromCompressedString(transVal, [scale, scale, scale], [xOffset, yOffset, zOffset]);
				} else {
					return JsonUtils.parseVector3Samples(transVal);
				}
			}
			return null;
		};

		JsonUtils.parseScaleSamples = function (chanObj, size, useCompression) {
			var uniform = chanObj.UniformScale;
			if (uniform) {
				var scale = uniform;
				var xScale = scale[0];
				var yScale = scale[1];
				var zScale = scale[2];
				var rVal = [];
				for (var i = 0; i < size; i++) {
					rVal[i * 3 + 0] = xScale;
					rVal[i * 3 + 1] = yScale;
					rVal[i * 3 + 2] = zScale;
				}
				return rVal;
			}

			var scalesVal = chanObj.ScaleSamples;
			if (scalesVal) {
				if (useCompression) {
					var scaleOffset = chanObj.ScaleOffsetScale;
					var xOffset = scaleOffset[0];
					var yOffset = scaleOffset[1];
					var zOffset = scaleOffset[2];
					var scale = scaleOffset[3];
					return JsonUtils.parseFloatArrayFromCompressedString(scalesVal, [scale, scale, scale], [xOffset, yOffset, zOffset]);
				} else {
					return JsonUtils.parseVector3Samples(scalesVal);
				}
			}
			return null;
		};

		JsonUtils.parseQuaternionSamples = function (quatsObj) {
			var values = quatsObj;
			if (!values) {
				return null;
			}

			var quats = [];
			var lastQuat = new Quaternion();
			for (var i = 0, max = values.length; i < max; i++) {
				var val = values[i];
				if (val) {
					if ("*" === val) {
						quats[i * 4 + 0] = lastQuat.x;
						quats[i * 4 + 1] = lastQuat.y;
						quats[i * 4 + 2] = lastQuat.z;
						quats[i * 4 + 3] = lastQuat.w;
					}
				} else {
					var valsArray = val;
					if (valsArray && valsArray.length === 4) {
						var x = valsArray[0];
						var y = valsArray[1];
						var z = valsArray[2];
						var w = valsArray[3];
						lastQuat.set(x, y, z, w);
						quats[i * 4 + 0] = lastQuat.x;
						quats[i * 4 + 1] = lastQuat.y;
						quats[i * 4 + 2] = lastQuat.z;
						quats[i * 4 + 3] = lastQuat.w;
					}
				}
			}
			return quats;
		};

		JsonUtils.parseVector3Samples = function (vecsObj) {
			var values = vecsObj;
			if (!values) {
				return null;
			}

			var rVal = [];
			var lastVec = new Vector3();
			for (var i = 0, max = values.length; i < max; i++) {
				var val = values[i];
				if (val) {
					if ("*" === val) {
						rVal[i * 3 + 0] = lastVec.x;
						rVal[i * 3 + 1] = lastVec.y;
						rVal[i * 3 + 2] = lastVec.z;
					}
				} else {
					var valsArray = val.isArray();
					if (valsArray && valsArray.length === 3) {
						var x = valsArray[0];
						var y = valsArray[1];
						var z = valsArray[2];
						lastVec.set(x, y, z);
						rVal[i * 3 + 0] = lastVec.x;
						rVal[i * 3 + 1] = lastVec.y;
						rVal[i * 3 + 2] = lastVec.z;
					}
				}
			}
			return rVal;
		};

		JsonUtils.parseFloatArrayFromCompressedString = function (attribBufferString, scales, offsets) {
			var attribs = attribBufferString;
			var rVal = [];
			var stride = scales.length;
			var tuples = attribs.length / scales.length;
			var prev, word, outIndex, i, j;
			for (j = 0; j < stride; j++) {
				prev = 0;
				for (i = 0; i < tuples; i++) {
					word = attribs.charCodeAt(i + j * tuples);
					outIndex = i * stride + j;
					prev += JsonUtils.unzip(word);
					var val = (prev + offsets[j]) * scales[j];
					rVal[outIndex] = val;
				}
			}
			return rVal;
		};

		return JsonUtils;
	});