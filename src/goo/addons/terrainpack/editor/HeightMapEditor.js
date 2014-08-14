define([
	'goo/math/Vector3'
],
	function(
		Vector3
		) {
		'use strict';

		function HeightMapEditor(goo, terrainEditorApi) {
			this.goo = goo;
			this.terrainEditorApi = terrainEditorApi;
			this.hidden = false;
			this.store = new Vector3();
			this.settings = null;
			this.pick = true;
			this.draw = false;
			this.eventX = 0;
			this.eventY = 0;
		}

		HeightMapEditor.prototype.isEditing = function () {
			return !this.hidden;
		};

		var LMB = false;
		var altKey = false;

		var mousedown = function (e) {
			if (e.button === 0) {
				this.eventX = e.clientX;
				this.eventY = e.clientY;

				LMB = true;
				altKey = e.altKey;

				this.pick = true;
				this.draw = true;
				console.log('mousedown');
				this.terrainEditorApi.triggerEdits();
			}
		};

		var mouseup = function (e) {
			if (e.button === 0) {
				LMB = false;
				this.draw = false;
				console.log('mouseup');
				this.terrainEditorApi.processEdits();
			}
		};

		var mousemove = function (e) {
			this.eventX = e.clientX;
			this.eventY = e.clientY;

			this.pick = true;

			if (LMB) {
				altKey = e.altKey;
				this.draw = true;
			}
		};

		HeightMapEditor.prototype.toggleEditMode = function () {
			this.terrainHandler = this.terrainEditorApi.terrainApi.configurations[0].terrainHandler;
			this.terrainHandler.terrain.toggleMarker();


			this.hidden = !this.hidden;

			console.log(this.goo)

			if (this.hidden) {
				this.goo.renderer.domElement.addEventListener("mousedown", mousedown.bind(this), false);
				this.goo.renderer.domElement.addEventListener("mouseup", mouseup.bind(this), false);
				this.goo.renderer.domElement.addEventListener("mouseout", mouseup.bind(this), false);
				this.goo.renderer.domElement.addEventListener("mousemove", mousemove.bind(this), false);

			} else {
				this.goo.renderer.domElement.removeEventListener("mousedown", mousedown);
				this.goo.renderer.domElement.removeEventListener("mouseup", mouseup);
				this.goo.renderer.domElement.removeEventListener("mouseout", mouseup);
				this.goo.renderer.domElement.removeEventListener("mousemove", mousemove);
				this.terrainInfo = this.terrainHandler.terrain.getTerrainData();
				this.draw = false;
				LMB = false;
			}
		};

		HeightMapEditor.prototype.heightsEdited = function () {
			this.terrainHandler.terrainQuery.updateTerrainInfo();
		};

		HeightMapEditor.prototype.update = function(cameraEntity) {
			if (!this.terrainHandler) return;
			var settings = this.terrainEditorApi.terrainEditSettings;

			if (this.hidden && this.pick) {
				this.terrainHandler.terrain.pick(cameraEntity.cameraComponent.camera, this.eventX, this.eventY, this.store);
				this.terrainHandler.terrain.setMarker('add', settings.size, this.store.x, this.store.z, settings.power, settings.brushTexture);
				this.pick = false;
			}

			if (this.hidden && this.draw) {
				var type = 'add';
				if (altKey) {
					type = 'sub';
				}

				var rgba = [0, 0, 0, 0];
				if (settings.rgba === 'ground2') {
					rgba = [1, 0, 0, 0];
				} else if (settings.rgba === 'ground3') {
					rgba = [0, 1, 0, 0];
				} else if (settings.rgba === 'ground4') {
					rgba = [0, 0, 1, 0];
				} else if (settings.rgba === 'ground5') {
					rgba = [0, 0, 0, 1];
				}

				this.terrainHandler.terrain.draw(settings.mode, type, settings.size, this.store.x, this.store.y, this.store.z,
					settings.power * this.goo.world.tpf * 60 / 100, settings.brushTexture, rgba);
				this.terrainHandler.terrain.updateTextures();
			}

		};

		return HeightMapEditor;
	});