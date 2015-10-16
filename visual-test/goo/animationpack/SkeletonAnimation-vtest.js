require([
	'lib/V',
	'goo/renderer/Material',
	'goo/renderer/shaders/ShaderLib',
	'goo/shapes/Box',
	'goo/math/Vector3',
	'goo/math/Quaternion',
	'goo/math/MathUtils',
	'goo/renderer/MeshData',
	'goo/geometrypack/Surface',
	'goo/renderer/Camera',
	'goo/entities/components/MeshDataComponent',
	'goo/entities/components/MeshRendererComponent',
	'goo/renderer/TextureCreator',


	'goo/animationpack/components/AnimationComponent',
	'goo/animationpack/SkeletonPose',
	'goo/animationpack/Skeleton',
	'goo/animationpack/Joint',
	'goo/animationpack/state/SteadyState',
	'goo/animationpack/blendtree/ClipSource',
	'goo/animationpack/clip/AnimationClip',
	'goo/animationpack/clip/JointChannel',
	'goo/animationpack/clip/AbstractAnimationChannel',
	'goo/animationpack/systems/AnimationSystem',

	'goo/geometrypack/PolyLine'

], function (
	V,
	Material,
	ShaderLib,
	Box,
	Vector3,
	Quaternion,
	MathUtils,
	MeshData,
	Surface,
	Camera,
	MeshDataComponent,
	MeshRendererComponent,
	TextureCreator,

	AnimationComponent,
	SkeletonPose,
	Skeleton,
	Joint,
	SteadyState,
	ClipSource,
	AnimationClip,
	JointChannel,
	AbstractAnimationChannel,
	AnimationSystem,

	PolyLine
) {
	'use strict';

	V.describe('Skeleton Animation Test. Use shift + number keys to toggle different rendering modes. Use mouse click and drag or touch drag on the X-axis, to take manual control over the animation.');

	/**
	* Adds needed attributes to the meshdata , in order to have skeleton animation
	*/
	function addSkeltonAttributeData(meshData, joints) {

		var skeletonMaps = MeshData.defaultMap([MeshData.JOINTIDS, MeshData.WEIGHTS]);
		meshData.attributeMap[MeshData.JOINTIDS] = skeletonMaps[MeshData.JOINTIDS];
		meshData.attributeMap[MeshData.WEIGHTS] = skeletonMaps[MeshData.WEIGHTS];
		// rebuildData generates dataviews on the new attributes.
		meshData.rebuildData(meshData.vertexCount, meshData.indexCount, true);
		// These are probably used somewhere.
		meshData.weightsPerVertex = 4; // Default weights count
		meshData.type = MeshData.SKINMESH;

		// Just map 1to1,
		meshData.paletteMap = [];
		for (var i =0; i < joints.length; i++) {
			meshData.paletteMap[i] = i;
		}
		

	}

	/**
	* Recurse through the joints' parents to get the complete inverse translation
	*/
	function getInvT(joint, joints, tArray) {
		
		if (joint._parentIndex != Joint.NO_PARENT) {
			var parentJoint = joints[joint._parentIndex];
			var invT = parentJoint._inverseBindPose.translation;
			tArray.x -= invT.x;
			tArray.y -= invT.y;
			tArray.z -= invT.z;
			getInvT(parentJoint, joints, tArray);
		}

		return tArray;
	}

	/**
	* Creates a new JointChannel, computing the needed inverse transformations.
	*/
	function createJointChannel(joint, joints, times, t, r, s, blendType, channels) {

		// The channel's transform keyframes needs to be cobined with the joint's 
		// inverse bind pose, it uses the offset from it to create the resulting transform

		// TODO : Rotation and scale.
		var invT = joint._inverseBindPose.translation;
		getInvT(joint, joints, invT);

		var translation = [];

		for (var i = 0; i < t.length; i+=3) {
			translation[i] = -invT.x + t[i];
			translation[i+1] = -invT.y + t[i+1];
			translation[i+2] = -invT.z + t[i+2];
		}

		var channel = new JointChannel(
			joint._index,
			joint._name,
			times,
			r,
			translation,
			s,
			blendType
		);

		channels.push(channel);

		return channel;
	}


	/**
	* Sets the joints bindpose with the T (translation) and R (rotation)
	*/
	function setJointBindPose(joint, T, R) {
		
		var trans = joint._inverseBindPose;
		trans.setIdentity();
		
		if (T) {
			trans.translation.setDirect(T[0], T[1], T[2]);	
		}
		
		if (R) {
			trans.setRotationXYZ(R[0], R[1], R[2]);
		}

		var it = trans.invert();
		it.update();
		joint._inverseBindPose = it;
	}

	function createNewJoint(jointName, jointIndex, parentJoint, joints, bindPosition) {
		
		var joint = new Joint(jointName);
		joint._index = jointIndex;
		if (parentJoint) {
			joint._parentIndex = parentJoint._index;
		} else {
			joint._parentIndex = Joint.NO_PARENT;
		}

		if (bindPosition) {
			setJointBindPose(joint, bindPosition);
		}

		joints.push(joint);

		return joint;
	}

	/**
	* Smooth out the weight affection on the first and second joint indices, 
	* based on the distance and the bleed distance.
	*/
	function smoothWeights(d, bleedDistance, weightData, quadIndex) {
		var weight = MathUtils.clamp(d / bleedDistance, 0, 1);
		weight = MathUtils.scurve5(weight);
		weightData[quadIndex] = weight;
		weightData[quadIndex + 1] = 1 - weight;
	}


	/**
	* Sets the Joint Data to have the first index point to the given joint, second to the joint's parent.
	*/
	function loopSetJoints(joint, vertIndexArray, jointData) {
		var quadIndex; 
		for (var i = 0; i < vertIndexArray.length; i++) {
			quadIndex = vertIndexArray[i] * 4; 
			jointData[quadIndex] = joint._index;
			jointData[quadIndex + 1] = joint._parentIndex;
		}
	}

	function createBottleMeshData() {

		var subdiv = 20;
		var radius = 0.5;
		var height = 1;
		var thickness = 0.1 * radius;

		var verts = [
			//Outer shell
			0, 0, 0,
			radius, 0, 0,
			radius, height * 0.5, 0,
			radius * 0.5, height * 0.7, 0,
			// Bottle lip
			radius * 0.25, height, 0,
			radius * 0.2 - thickness, height, 0,
			//Inner shell
			radius * 0.5 - thickness, height * 0.7, 0,
			radius - thickness, height * 0.5, 0,
			radius - thickness, height * 0.1, 0,
			0, height * 0.1, 0,
		];

		var section = PolyLine.fromQuadraticSpline(verts, subdiv);

		var latheDivs = 48;
		var meshData = section.lathe(latheDivs);

		return meshData;
	}


	function addSkeletonAnimation(entity, meshData, diffuse, loopCount, timeScale) {

		if (entity.getComponent('AnimationComponent') || entity.getComponent('MeshDataComponent') || entity.getComponent('MeshRendererComponent')) {
			throw Error('The entity cannot have any prior animation- or meshdata/renderer- components');
		}

		var joints = [];

		// Create skeleton joint hierarchy
		var rootJoint = createNewJoint('RootJoint', 0, null, joints, [0, 0, 0]);

		var midJoint = createNewJoint('mid', 1, rootJoint, joints, [0, 0.5, 0]);

		var topJoint = createNewJoint('top', 2, midJoint, joints, [0, 1.0, 0]);

		var skeleton = new Skeleton('PaperSkeleton', joints);
		var skeletonPose = new SkeletonPose(skeleton);
		var animComp = new AnimationComponent(skeletonPose);
		
		var times = [0, 0.5, 1.2];
		var rots = [];
		var q1 = new Quaternion();
		var q2 = new Quaternion();
		//q1.fromAngleNormalAxis(MathUtils.HALF_PI * 0.95, Vector3.UNIT_X);
		Array.prototype.push.apply(rots, [q1.x, q1.y, q1.z, q1.w]);
		Array.prototype.push.apply(rots, [q1.x, q1.y, q1.z, q1.w]);
		Array.prototype.push.apply(rots, [q1.x, q1.y, q1.z, q1.w]);

		var trans = [
			0,0,0,
			0,0,0,
			0,0,0,
		];

		var scales = [
			1,1,1,
			1,1,1,
			1,1,1,
		];

		var animChannels = [];

		var rootChannel = createJointChannel(
			rootJoint, 
			joints, 
			times, 
			trans, 
			rots, 
			scales, 
			AbstractAnimationChannel.BLENDTYPES.QUINTIC,
			animChannels
		);


		var rots = [];
		q2.fromAngleNormalAxis(MathUtils.HALF_PI * 0.5, new Vector3(1, 1, 0).normalize());
		Array.prototype.push.apply(rots, [q1.x, q1.y, q1.z, q1.w]);
		Array.prototype.push.apply(rots, [q2.x, q2.y, q2.z, q2.w]);
		q2.fromAngleNormalAxis(-MathUtils.HALF_PI * 0.5, new Vector3(1, 1, 0).normalize());
		Array.prototype.push.apply(rots, [q2.x, q2.y, q2.z, q2.w]);
		var trans = [
			0,0,0,
			0,0.25,0,
			0,0.1,0.1,
		];
		var scales = [
			0.5,0.5,0.5,
			1,1,1,
			1,1,1,
		];
		var midChannel = createJointChannel(
			midJoint, 
			joints, 
			times, 
			trans, 
			rots, 
			scales, 
			AbstractAnimationChannel.BLENDTYPES.QUADRATIC,
			animChannels
		);

		var rots = [];
		q2.fromAngleNormalAxis(MathUtils.HALF_PI, Vector3.UNIT_Y);
		Array.prototype.push.apply(rots, [q1.x, q1.y, q1.z, q1.w]);
		Array.prototype.push.apply(rots, [q1.x, q1.y, q1.z, q1.w]);
		Array.prototype.push.apply(rots, [q2.x, q2.y, q2.z, q2.w]);
		var scales = [
			2,2,2,
			1,1,1,
			0.5,0.5,0.5,
		];
		var trans = [
			0,-0.25,0,
			0,0,0,
			0,0.25,0,
		];
		var topChannel = createJointChannel(
			topJoint, 
			joints, 
			times, 
			trans, 
			rots, 
			scales, 
			AbstractAnimationChannel.BLENDTYPES.QUINTIC,
			animChannels
		);

		var clip = new AnimationClip('My animation Clip', animChannels);
		var clipSource = new ClipSource(clip);
		clipSource._clipInstance._loopCount = loopCount;
		clipSource.setTimeScale(timeScale);
		var animState = new SteadyState('My animation state');
		animState.setClipSource(clipSource);
		var animLayer = animComp.layers[0];  // Default animation layer
		animLayer.setState('RootRotateState', animState);
		animLayer.setCurrentState(animState, true);
		
		addSkeltonAttributeData(meshData, joints);

		var weightData = meshData.dataViews.WEIGHTS;
		for (var i = 0; i < weightData.length; i+=4) {
			weightData[i] = 1;
			weightData[i+1] = 0;
			weightData[i+2] = 0;
			weightData[i+3] = 0;
		}

		var midVerts = [];
		var topVerts = [];
		var positions = meshData.dataViews.POSITION;
		var posLen = positions.length;

		var bleedDistance = 0.3;
		var topCut = 0.7;
		var midCut = 0.1;

		for (var i = 0; i < posLen; i+=3) {
			var y = positions[i+1];

			var vertIndex = i/3;
			var quadIndex = vertIndex * 4;

			if (y > topCut) {
				topVerts.push(vertIndex);
				smoothWeights(y - topCut, bleedDistance, weightData, quadIndex);
			} else if (y > midCut) {
				midVerts.push(vertIndex);
				smoothWeights(y - midCut, bleedDistance, weightData, quadIndex);
			}
		}

		var jointData = meshData.dataViews.JOINTIDS;
		
		loopSetJoints(midJoint, midVerts, jointData);
		loopSetJoints(topJoint, topVerts, jointData);
		
		var material = new Material(ShaderLib.uber);
		material.uniforms.materialDiffuse = diffuse;
		material.cullState.enabled = true;
		new TextureCreator().loadTexture2D('../../resources/check.png').then(function (texture) {
			material.setTexture('DIFFUSE_MAP', texture);
		});
		
		entity.setComponent(new MeshDataComponent(meshData));
		entity.setComponent(new MeshRendererComponent(material));
		
		entity.setComponent(animComp);
		entity.meshDataComponent.currentPose = entity.animationComponent._skeletonPose;
		return entity;
	}
	
	var entity;
	var goo;

	function init() {

		goo = V.initGoo();
		goo._addDebugKeys();
		var world = goo.world;

		// The animationsystem calls the animation components, updating 
		// the animation data every frame.
		var animSystem = new AnimationSystem();
		world.setSystem(animSystem);

		entity = world.createEntity().addToWorld();
		var color = [1, 1, 1, 1];
		var loopCount = -1;
		var timeScale = 0.25;

		var meshData = createBottleMeshData();
		addSkeletonAnimation(entity, meshData, color, loopCount, timeScale);
		var scale = 1;
		entity.transformComponent.setScale(scale, scale, scale);

		addInputListeners();

		V.addLights();

		world.createEntity(new Camera(), [0, 1, 4]).addToWorld();
		V.process();
	}

	var mouseDown = false;
	var lastX = 0;
	var animationTime = 0;
	var sensitivity = 2.5;
	var domElement;
	var resumeAnimationTimeout;
	
	function addInputListeners() {
		
		domElement = goo.renderer.domElement;

		window.addEventListener('mousedown', function(event) {
			mouseDown = true;
			lastX = event.clientX;
			entity.animationComponent.stop();
		});

		window.addEventListener('mouseup', function(event) {
			mouseDown = false;
			
		});

		window.addEventListener('mousemove', function(event) {
			if (mouseDown === true) {
				updateAnimationTime(event.clientX);
				updateEntityAnimation();
				toggleResumeTimeout();
			}
		});

		window.addEventListener('touchstart', function(event) {
			lastX = event.touches[0].clientX;
			entity.animationComponent.stop();
		});

		window.addEventListener('touchmove', function(event) {
			updateAnimationTime(event.touches[0].clientX);
			updateEntityAnimation();
			toggleResumeTimeout();
		});
	}

	function toggleResumeTimeout() {
		window.clearTimeout(resumeAnimationTimeout);	
		resumeAnimationTimeout = window.setTimeout(resumeAnimation, 5000);
	}

	function resumeAnimation() {
		entity.animationComponent.resume();
		entity.animationComponent.resetClips(0);
	}

	function updateEntityAnimation() {
		var animationComponent = entity.animationComponent;
		var layer = animationComponent.layers[0];
		// Pick the animationState wanted
		var animState = layer.getStateById('RootRotateState');
		var clipSource = animState._sourceTree;
		layer.setCurrentState(animState); // Set currentstate 
		clipSource._clipInstance._active = true;

		var maxTime = clipSource._clip._maxTime;
		var timeScale = clipSource._clipInstance._timeScale;
		var t = (animationTime * maxTime) / timeScale;
		clipSource.setTime(t);
		animationComponent.apply(entity.transformComponent);
	}

	
	function updateAnimationTime(x) {
		var width = domElement.width;
		var t = (lastX - x) / width;
		lastX = x;
		var ratio = window.devicePixelRatio || 1;
		t *= sensitivity * ratio;
		animationTime -= t;
		// Animation loops to start at max time, clamping to 0.99
		animationTime = MathUtils.clamp(animationTime, 0, 0.99);
	};

	init();
});
