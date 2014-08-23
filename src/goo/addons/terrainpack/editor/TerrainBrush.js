define([
	'goo/math/MathUtils',
	'goo/renderer/Shader',
	'goo/renderer/pass/FullscreenUtil',
	'goo/renderer/light/DirectionalLight'
],
	/** @lends */
		function(
		MathUtils,
		Shader,
		FullscreenUtil,
		DirectionalLight
		) {
		'use strict';

		var Ammo = window.Ammo; // make jslint happy

		/**
		 * @class A terrain
		 */
		function TerrainBrush(goo) {
			this.world = goo.world;
			this.renderer = goo.renderer;

			// edit marker
			var light = new DirectionalLight();
			light.shadowSettings.size = 10;
			var lightEntity = this.lightEntity = this.world.createEntity(light);
			lightEntity.setTranslation(200, 200, 200);
			lightEntity.setRotation(-Math.PI*0.5, 0, 0);
			lightEntity.addToWorld();
			this.lightEntity.lightComponent.hidden = true;

		}



		TerrainBrush.prototype.toggleMarker = function (terrain) {
			console.log("Toggle Marker: ", terrain);
			this.size = terrain.size;
			this.terrain = terrain;
			this.renderable = this.terrain.renderable;
			this.lightEntity.lightComponent.hidden = !this.lightEntity.lightComponent.hidden;
		};

		TerrainBrush.prototype.setMarker = function (type, size, x, y, power, brushTexture) {
			this.lightEntity.lightComponent.light.shadowSettings.size = size * 0.5;
			brushTexture.wrapS = 'EdgeClamp';
			brushTexture.wrapT = 'EdgeClamp';
			this.lightEntity.lightComponent.light.lightCookie = brushTexture;
			this.lightEntity.setTranslation(x, 200, y);
		};

		TerrainBrush.prototype.draw = function (mode, type, size, x, y, z, power, brushTexture, rgba) {
		//	console.log("Draw: ", mode, type, size, x, y, z, power, brushTexture, rgba);
			power = MathUtils.clamp(power, 0, 1);

			x = (x - this.size/2) * 2;
			z = (z - this.size/2) * 2;

			if (mode === 'paint') {
				this.renderable.materials[0] = this.terrain.drawMaterial2;
				this.renderable.materials[0].uniforms.opacity = power;

				if (type === 'add') {
					this.renderable.materials[0].blendState.blendEquationColor = 'AddEquation';
					this.renderable.materials[0].blendState.blendEquationAlpha = 'AddEquation';
				} else if (type === 'sub') {
					this.renderable.materials[0].blendState.blendEquationColor = 'ReverseSubtractEquation';
					this.renderable.materials[0].blendState.blendEquationAlpha = 'ReverseSubtractEquation';
				}

				if (brushTexture) {
					this.renderable.materials[0].setTexture(Shader.DIFFUSE_MAP, brushTexture);
				} else {
					this.renderable.materials[0].setTexture(Shader.DIFFUSE_MAP, this.defaultBrushTexture);
				}

				this.renderable.transform.translation.setd(x/this.size, z/this.size, 0);
				this.renderable.transform.scale.setd(-size, size, size);
				this.renderable.transform.update();

				this.terrain.copyPass.render(this.renderer, this.terrain.splatCopy, this.terrain.splat);

				this.renderable.materials[0].uniforms.rgba = rgba || [1,1,1,1];
				this.terrain.renderer.render(this.renderable, FullscreenUtil.camera, [], this.terrain.splat, false);
			} else if (mode === 'smooth') {
				this.renderable.materials[0] = this.terrain.drawMaterial3;
				this.renderable.materials[0].uniforms.opacity = power;

				if (brushTexture) {
					this.renderable.materials[0].setTexture(Shader.DIFFUSE_MAP, brushTexture);
				} else {
					this.renderable.materials[0].setTexture(Shader.DIFFUSE_MAP, this.defaultBrushTexture);
				}

				this.renderable.transform.translation.setd(x/this.size, z/this.size, 0);
				this.renderable.transform.scale.setd(-size, size, size);
				this.renderable.transform.update();

				this.terrain.copyPass.render(this.terrain.renderer, this.terrain.texturesBounce[0], this.terrain.textures[0]);

				this.terrain.renderer.render(this.renderable, FullscreenUtil.camera, [], this.terrain.textures[0], false);
			} else if (mode === 'flatten') {
				this.renderable.materials[0] = this.terrain.drawMaterial4;
				this.renderable.materials[0].uniforms.opacity = power;
				this.renderable.materials[0].uniforms.height = y;

				if (brushTexture) {
					this.renderable.materials[0].setTexture(Shader.DIFFUSE_MAP, brushTexture);
				} else {
					this.renderable.materials[0].setTexture(Shader.DIFFUSE_MAP, this.terrain.defaultBrushTexture);
				}

				this.renderable.transform.translation.setd(x/this.size, z/this.size, 0);
				this.renderable.transform.scale.setd(-size, size, size);
				this.renderable.transform.update();

				this.terrain.copyPass.render(this.terrain.renderer, this.terrain.texturesBounce[0], this.terrain.textures[0]);

				this.terrain.renderer.render(this.renderable, FullscreenUtil.camera, [], this.terrain.textures[0], false);
			} else {
				this.renderable.materials[0] = this.terrain.drawMaterial1;
				this.renderable.materials[0].uniforms.opacity = power;

				if (type === 'add') {
					this.renderable.materials[0].blendState.blending = 'AdditiveBlending';
				} else if (type === 'sub') {
					this.renderable.materials[0].blendState.blending = 'SubtractiveBlending';
				} else if (type === 'mul') {
					this.renderable.materials[0].blendState.blending = 'MultiplyBlending';
				}

				if (brushTexture) {
					this.renderable.materials[0].setTexture(Shader.DIFFUSE_MAP, brushTexture);
				} else {
					this.renderable.materials[0].setTexture(Shader.DIFFUSE_MAP, this.defaultBrushTexture);
				}

				this.renderable.transform.translation.setd(x/this.size, z/this.size, 0);
				this.renderable.transform.scale.setd(-size, size, size);
				this.renderable.transform.update();

				this.terrain.renderer.render(this.renderable, FullscreenUtil.camera, [], this.terrain.textures[0], false);
			}
		};


		return TerrainBrush;
	});