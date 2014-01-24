define([
	'goo/renderer/Material',
	'goo/renderer/Camera',
	'goo/math/Vector3',
	'goo/renderer/TextureCreator',
	'goo/renderer/Texture',
	'goo/renderer/MeshData',
	'goo/renderer/Shader',
	'goo/renderer/light/DirectionalLight',
	'goo/util/CanvasUtils',
	'goo/util/Ajax',
	'goo/noise/Noise',
	'goo/noise/ValueNoise',
	'goo/shapes/TerrainSurface',
	'goo/renderer/shaders/ShaderBuilder',
	'goo/renderer/shaders/ShaderFragment',
	'goo/addons/water/FlatWaterRenderer',
	'goo/entities/EntityUtils',
	'goo/renderer/shaders/ShaderLib'
],
/** @lends */
function (
	Material,
	Camera,
	Vector3,
	TextureCreator,
	Texture,
	MeshData,
	Shader,
	DirectionalLight,
	CanvasUtils,
	Ajax,
	Noise,
	ValueNoise,
	TerrainSurface,
	ShaderBuilder,
	ShaderFragment,
	FlatWaterRenderer,
	EntityUtils,
	ShaderLib
) {
	"use strict";

	function Vegetation(goo) {
	}

	return Vegetation;
});