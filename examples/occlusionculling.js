
require({
    baseUrl : './',
    paths : {
        goo : '/js/goo'
    }
});
require(
	[
		'goo/entities/GooRunner',
		'goo/entities/EntityUtils',
		'goo/renderer/Material',
		'goo/renderer/Camera',
		'goo/entities/components/CameraComponent',
		'goo/entities/components/ScriptComponent',
		'goo/shapes/ShapeCreator',
		'goo/renderer/TextureCreator',
		'goo/scripts/MouseLookControlScript',
		'goo/scripts/WASDControlScript',
		'goo/math/Vector3',
		'goo/renderer/pass/Composer',
		'goo/renderer/pass/DepthPass',
		'goo/renderer/pass/BloomPass',
		'goo/renderer/pass/RenderPass',
		'goo/renderer/pass/HierarchicalZPass',
		'goo/renderer/pass/FullscreenPass',
		'goo/renderer/Util',
		'goo/renderer/pass/RenderTarget',
		'goo/renderer/scanline/SoftwareRenderer',
		'goo/renderer/shaders/ShaderLib'
	],
	function (
		GooRunner,
		EntityUtils,
		Material,
		Camera,
		CameraComponent,
		ScriptComponent,
		ShapeCreator,
		TextureCreator,
		MouseLookControlScript,
		WASDControlScript,
		Vector3,
		Composer,
		DepthPass,
		BloomPass,
		RenderPass,
		HierarchicalZPass,
		FullscreenPass,
		Util,
		RenderTarget,
		SoftwareRenderer,
		ShaderLib
	) {
		'use strict';

		//-------- GLOBAL VARIABLES --------
		
			var resourcePath = '../resources';

		//----------------------------------

		function init() {

			var goo = new GooRunner({
				showStats : true,
				canvas : document.getElementById('goo')
			});

			// Add camera
			var camera = new Camera(90, 1, 1, 100);
			
			var cameraEntity = goo.world.createEntity('CameraEntity');

			cameraEntity.setComponent(new CameraComponent(camera));
			cameraEntity.setComponent(new ScriptComponent([new MouseLookControlScript(), new WASDControlScript({'crawlSpeed' : 5.0, 'walkSpeed' : 18.0})]));
			cameraEntity.addToWorld();

			buildScene(goo);

			camera.translation.set(0,1.79,20);

			setupRenderer(goo, camera);

		}


		function setupRenderer(goo, cam) {

			// Disable normal rendering
			goo.world.getSystem('RenderSystem').doRender = false;

			var renderList = goo.world.getSystem('PartitioningSystem').renderList;

			// Different options for rendering depth values, using color texture, float texture or depth texture.
			// Data types link : http://opengl.czweb.org/ch03/031-034.html
		
			// The color and float texture formats still need to use a depthbuffer , Could be solved by rendering the occluders back-to-front?

			// Float-textures could not always work, https://developer.mozilla.org/en-US/docs/WebGL/WebGL_best_practices
			
			// Color texture for depth values needs to use the pack- and unPack functions for writing and storing the values.
			var colorTextureOptions = {
				minFilter : 'NearestNeighborNoMipMaps',
				magFilter : 'NearestNeighbor',
				type : 'UnsignedByte',
				format : 'RGBA',
				depthBuffer : true, 
				stencilBuffer : false
			};

			// The float luminance texture data is saved in the red color channel.
			var floatTextureOptions = {
				minFilter : 'NearestNeighborNoMipMaps',
				magFilter : 'NearestNeighbor',
				type : 'Float',
				format : 'Luminance',
				depthBuffer : true,
				stencilBuffer : false
			};

			var depthTextureOptions = {
				minFilter : 'NearestNeighborNoMipMaps',
				magFilter : 'NearestNeighbor',
				type : 'UnsignedShort',
				format : 'Depth',
				depthBuffer : false,
				stencilBuffer : false
			};

			console.log('Actual Rendering dimensions: width = ' + goo.renderer.domElement.width + ", height = " + goo.renderer.domElement.height);

			// Set up the scale of which the occluder data should be rendered in.
			var firstLodScale = 1;
			var depthWidth = goo.renderer.domElement.width * firstLodScale;
			var depthHeight = goo.renderer.domElement.height * firstLodScale;

			var depthTarget = new RenderTarget(depthWidth, depthHeight, colorTextureOptions);
			var composer = new Composer(depthTarget);

			var hiZ = new HierarchicalZPass(renderList);

			// Regular copy
			var shader = Util.clone(ShaderLib.copy);
			var outPass = new FullscreenPass(shader);
			outPass.renderToScreen = true;

			//composer.addPass(hiZ);

			var renderPass = new RenderPass(renderList);
			renderPass.renderToScreen = true;

			composer.addPass(renderPass);

			var gl = goo.renderer.context;

			var numOfPixels = depthWidth * depthHeight;

			var storage = new Uint8Array(4*numOfPixels);

			var readTime = new Array();

			var debugcanvas = document.getElementById('debugcanvas')
			var debugContext = debugcanvas.getContext('2d');
			var imagedata = debugContext.createImageData(debugcanvas.width, debugcanvas.height);
			var softRenderer = new SoftwareRenderer({"width" : debugcanvas.width, "height" : debugcanvas.height, "camera" : cam});

			goo.callbacks.push(function(tpf) {
				// composer.render(goo.renderer, tpf);
				// https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/HighResolutionTime/Overview.html
				// it reads from bottom up, width first.

				//console.time("renderTime");
				softRenderer.render(renderList);
				//console.timeEnd("renderTime");

				softRenderer.copyDepthToColor();

				//console.time("occlusionTime");
				softRenderer.performOcclusionCulling(renderList);
				//console.timeEnd("occlusionTime");

				composer.render(goo.renderer, tpf);


				imagedata.data.set(softRenderer.getColorData());
				debugContext.putImageData(imagedata,0,0);
				

				//gl.readPixels(0, 0, depthWidth, depthHeight, gl.RGBA, gl.UNSIGNED_BYTE, storage);
			});

		

			document.addEventListener('keydown', function(event) {
					//console.log(event.keyCode);
					switch (event.keyCode) {
						case 80: // 'P' 

							/*
							var values = "{ \n";
							for(var i = 0; i < storage.length; i++)
							{
								values += storage[i] + ', ';
								
								if ( (i+1) % 4 == 0)
								{
									values += '\n';
								}
							}

							values += "}"
							
							document.getElementById('debugarea').value = values;
							*/
							var debugcanvas = document.getElementById('debugcanvas')
							var debugContext = debugcanvas.getContext('2d');
							var imagedata = debugContext.createImageData(debugcanvas.width,debugcanvas.height);

							imagedata.data.set(storage);

							debugContext.putImageData(imagedata,0,0);

							var averageTimeToRead = 0.0;
							for(var i = 0; i < readTime.length; i++)
							{
								averageTimeToRead += readTime[i];
							}

							averageTimeToRead = averageTimeToRead/readTime.length;
							
							readTime = [];

							console.log("Average time to read : " + averageTimeToRead + " ms");
								
							break;
						
						case 32: // Space

							//console.time("renderTime");
							softRenderer.render(renderList);
							//console.timeEnd("renderTime");

							softRenderer.copyDepthToColor();

							//console.time("occlusionTime");
							softRenderer.performOcclusionCulling(renderList);
							//console.timeEnd("occlusionTime");
			
							var debugcanvas = document.getElementById('debugcanvas')
							var debugContext = debugcanvas.getContext('2d');
							var imagedata = debugContext.createImageData(debugcanvas.width,debugcanvas.height);
							imagedata.data.set(softRenderer.getColorData());
							debugContext.putImageData(imagedata,0,0);
						break;
					}
			});
		}

		function buildScene(goo) {
			

			var translation = new Vector3(0, 0, 0);
			translation.y = 0.5;
			var boxEntity = createBoxEntity(goo.world, translation);
			boxEntity.addToWorld();

			translation.x = 10;
			translation.y = 1;
			for (var i = 0; i < 10; i++) {

				var quad = createQuad(goo.world, translation, 2, 2);
				quad.addToWorld();
				translation.z -= 1.0;
			}

			translation.x = 0;
			translation.z = -15;
			translation.y = 5;
			var wallW = 50;
			var wallH = 10;
			var bigQuad = createQuad(goo.world, translation, wallW, wallH);
			bigQuad.addToWorld();

			translation.x = -wallW / 2 + 2;
			translation.y = 3;
			translation.z = -20;

			var numberOfBoxes = wallW / 2;

			for (var columns = 0; columns < numberOfBoxes; columns++) {
				createBoxEntity(goo.world, translation).addToWorld();
				translation.x += 2;
				translation.z += 0.3;
			}

			var floorEntity = createFloorEntity(goo.world);
			floorEntity.addToWorld();

			goo.callbacks.push(function(tpf) {
				
				boxEntity.transformComponent.transform.rotation.y += .5 * tpf;
				boxEntity.transformComponent.setUpdated();
			});
		}

		function createQuad(world, translation, width, height) {
			var meshData = ShapeCreator.createQuad(width, height);
			var entity = EntityUtils.createTypicalEntity(world, meshData);
			entity.transformComponent.transform.translation.x = translation.x;
			entity.transformComponent.transform.translation.y = translation.y;
			entity.transformComponent.transform.translation.z = translation.z;
			entity.name = 'Quad';
			var material = new Material.createMaterial(ShaderLib.simpleLit, 'SimpleMaterial');
			entity.meshRendererComponent.materials.push(material);
			material.wireframe = true;
			return entity;
		}

		function createFloorEntity(world)
		{
			var size = 100;
			var height = 0.5;
			var textureRepeats = Math.ceil(size * 0.2);
			var meshData = ShapeCreator.createBox(size, height, size, textureRepeats, textureRepeats);
			// var meshData = ShapeCreator.createQuad(size, size, textureRepeats, textureRepeats);
			var entity = EntityUtils.createTypicalEntity(world, meshData);
			entity.transformComponent.transform.translation.y = -height/2;
			entity.name = 'Floor';
			
			var material = new Material.createMaterial(ShaderLib.texturedLit, 'FloorMaterial');
			
			// http://photoshoptextures.com/floor-textures/floor-textures.htm
			var texture = new TextureCreator().loadTexture2D(resourcePath + '/checkerboard.png');
			material.textures.push(texture);
			entity.meshRendererComponent.materials.push(material);

			return entity;
		}

		function createBoxEntity(world, translation) {
			var meshData = ShapeCreator.createBox(1, 1, 1);
			var entity = EntityUtils.createTypicalEntity(world, meshData);
			entity.transformComponent.transform.translation.x = translation.x;
			entity.transformComponent.transform.translation.y = translation.y;
			entity.transformComponent.transform.translation.z = translation.z;
			entity.name = 'Box';
			
			var material = new Material.createMaterial(ShaderLib.texturedLit, 'GooBoxMaterial');
			var texture = new TextureCreator().loadTexture2D(resourcePath + '/goo.png');
			material.textures.push(texture);
			entity.meshRendererComponent.materials.push(material);

			return entity;
		}

		init();
	}
);
