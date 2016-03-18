// Polyfills
import map from 'core-js/es6/map';
import set from 'core-js/es6/set';

import Bus from './src/goo/entities/Bus';
import CameraComponent from './src/goo/entities/components/CameraComponent';
import Component from './src/goo/entities/components/Component';
import CssTransformComponent from './src/goo/entities/components/CssTransformComponent';
import Dom3dComponent from './src/goo/entities/components/Dom3dComponent';
import HtmlComponent from './src/goo/entities/components/HtmlComponent';
import LightComponent from './src/goo/entities/components/LightComponent';
import MeshDataComponent from './src/goo/entities/components/MeshDataComponent';
import MeshRendererComponent from './src/goo/entities/components/MeshRendererComponent';
import MovementComponent from './src/goo/entities/components/MovementComponent';
import ParticleComponent from './src/goo/entities/components/ParticleComponent';
import PortalComponent from './src/goo/entities/components/PortalComponent';
import ScriptComponent from './src/goo/entities/components/ScriptComponent';
import SoundComponent from './src/goo/entities/components/SoundComponent';
import TextComponent from './src/goo/entities/components/TextComponent';
import TransformComponent from './src/goo/entities/components/TransformComponent';
import Entity from './src/goo/entities/Entity';
import EntitySelection from './src/goo/entities/EntitySelection';
import EntityUtils from './src/goo/entities/EntityUtils';
import GooRunner from './src/goo/entities/GooRunner';
import EntityManager from './src/goo/entities/managers/EntityManager';
import Manager from './src/goo/entities/managers/Manager';
import Selection from './src/goo/entities/Selection';
import SystemBus from './src/goo/entities/SystemBus';
import BoundingUpdateSystem from './src/goo/entities/systems/BoundingUpdateSystem';
import CameraSystem from './src/goo/entities/systems/CameraSystem';
import CssTransformSystem from './src/goo/entities/systems/CssTransformSystem';
import Dom3dSystem from './src/goo/entities/systems/Dom3dSystem';
import GridRenderSystem from './src/goo/entities/systems/GridRenderSystem';
import HtmlSystem from './src/goo/entities/systems/HtmlSystem';
import LightingSystem from './src/goo/entities/systems/LightingSystem';
import MovementSystem from './src/goo/entities/systems/MovementSystem';
import ParticlesSystem from './src/goo/entities/systems/ParticlesSystem';
import PickingSystem from './src/goo/entities/systems/PickingSystem';
import PortalSystem from './src/goo/entities/systems/PortalSystem';
import RenderSystem from './src/goo/entities/systems/RenderSystem';
import ScriptSystem from './src/goo/entities/systems/ScriptSystem';
import SoundSystem from './src/goo/entities/systems/SoundSystem';
import System from './src/goo/entities/systems/System';
import TextSystem from './src/goo/entities/systems/TextSystem';
import TransformSystem from './src/goo/entities/systems/TransformSystem';
import World from './src/goo/entities/World';
import CrunchLoader from './src/goo/loaders/crunch/CrunchLoader';
import DdsLoader from './src/goo/loaders/dds/DdsLoader';
import DdsUtils from './src/goo/loaders/dds/DdsUtils';
import DynamicLoader from './src/goo/loaders/DynamicLoader';
import CameraComponentHandler from './src/goo/loaders/handlers/CameraComponentHandler';
import ComponentHandler from './src/goo/loaders/handlers/ComponentHandler';
import ConfigHandler from './src/goo/loaders/handlers/ConfigHandler';
import Dom3dComponentHandler from './src/goo/loaders/handlers/Dom3dComponentHandler';
import EntityHandler from './src/goo/loaders/handlers/EntityHandler';
import EnvironmentHandler from './src/goo/loaders/handlers/EnvironmentHandler';
import HtmlComponentHandler from './src/goo/loaders/handlers/HtmlComponentHandler';
import LightComponentHandler from './src/goo/loaders/handlers/LightComponentHandler';
import MaterialHandler from './src/goo/loaders/handlers/MaterialHandler';
import MeshDataComponentHandler from './src/goo/loaders/handlers/MeshDataComponentHandler';
import MeshDataHandler from './src/goo/loaders/handlers/MeshDataHandler';
import MeshRendererComponentHandler from './src/goo/loaders/handlers/MeshRendererComponentHandler';
import ProjectHandler from './src/goo/loaders/handlers/ProjectHandler';
import SceneHandler from './src/goo/loaders/handlers/SceneHandler';
import ShaderHandler from './src/goo/loaders/handlers/ShaderHandler';
import SkyboxHandler from './src/goo/loaders/handlers/SkyboxHandler';
import SoundComponentHandler from './src/goo/loaders/handlers/SoundComponentHandler';
import SoundHandler from './src/goo/loaders/handlers/SoundHandler';
import TextureHandler from './src/goo/loaders/handlers/TextureHandler';
import TransformComponentHandler from './src/goo/loaders/handlers/TransformComponentHandler';
import TgaLoader from './src/goo/loaders/tga/TgaLoader';
import MathUtils from './src/goo/math/MathUtils';
import Matrix from './src/goo/math/Matrix';
import Matrix2 from './src/goo/math/Matrix2';
import Matrix2x2 from './src/goo/math/Matrix2x2';
import Matrix3 from './src/goo/math/Matrix3';
import Matrix3x3 from './src/goo/math/Matrix3x3';
import Matrix4 from './src/goo/math/Matrix4';
import Matrix4x4 from './src/goo/math/Matrix4x4';
import Plane from './src/goo/math/Plane';
import Quaternion from './src/goo/math/Quaternion';
import Ray from './src/goo/math/Ray';
import Spline from './src/goo/math/splines/Spline';
import SplineWalker from './src/goo/math/splines/SplineWalker';
import Transform from './src/goo/math/Transform';
import Vector from './src/goo/math/Vector';
import Vector2 from './src/goo/math/Vector2';
import Vector3 from './src/goo/math/Vector3';
import Vector4 from './src/goo/math/Vector4';
import Noise from './src/goo/noise/Noise';
import ValueNoise from './src/goo/noise/ValueNoise';
import Particle from './src/goo/particles/Particle';
import ParticleEmitter from './src/goo/particles/ParticleEmitter';
import ParticleInfluence from './src/goo/particles/ParticleInfluence';
import ParticleLib from './src/goo/particles/ParticleLib';
import ParticleUtils from './src/goo/particles/ParticleUtils';
import BoundingTree from './src/goo/picking/BoundingTree';
import PrimitivePickLogic from './src/goo/picking/PrimitivePickLogic';
import BoundingBox from './src/goo/renderer/bounds/BoundingBox';
import BoundingSphere from './src/goo/renderer/bounds/BoundingSphere';
import BoundingVolume from './src/goo/renderer/bounds/BoundingVolume';
import BufferData from './src/goo/renderer/BufferData';
import BufferUtils from './src/goo/renderer/BufferUtils';
import Camera from './src/goo/renderer/Camera';
import Capabilities from './src/goo/renderer/Capabilities';
import DirectionalLight from './src/goo/renderer/light/DirectionalLight';
import Light from './src/goo/renderer/light/Light';
import PointLight from './src/goo/renderer/light/PointLight';
import SpotLight from './src/goo/renderer/light/SpotLight';
import Material from './src/goo/renderer/Material';
import MeshData from './src/goo/renderer/MeshData';
import Composer from './src/goo/renderer/pass/Composer';
import FullscreenPass from './src/goo/renderer/pass/FullscreenPass';
import FullscreenUtil from './src/goo/renderer/pass/FullscreenUtil';
import FullscreenUtils from './src/goo/renderer/pass/FullscreenUtils';
import Pass from './src/goo/renderer/pass/Pass';
import RenderPass from './src/goo/renderer/pass/RenderPass';
import RenderTarget from './src/goo/renderer/pass/RenderTarget';
import ContextLost from './src/goo/renderer/Renderer+ContextLost';
import Renderer from './src/goo/renderer/Renderer';
import RendererRecord from './src/goo/renderer/RendererRecord';
import RendererUtils from './src/goo/renderer/RendererUtils';
import RenderInfo from './src/goo/renderer/RenderInfo';
import RenderQueue from './src/goo/renderer/RenderQueue';
import RenderStats from './src/goo/renderer/RenderStats';
import Shader from './src/goo/renderer/Shader';
import ShaderCall from './src/goo/renderer/ShaderCall';
import ShaderBuilder from './src/goo/renderer/shaders/ShaderBuilder';
import ShaderFragment from './src/goo/renderer/shaders/ShaderFragment';
import ShaderLib from './src/goo/renderer/shaders/ShaderLib';
import ShadowHandler from './src/goo/renderer/shadow/ShadowHandler';
import SimplePartitioner from './src/goo/renderer/SimplePartitioner';
import TaskScheduler from './src/goo/renderer/TaskScheduler';
import Texture from './src/goo/renderer/Texture';
import TextureCreator from './src/goo/renderer/TextureCreator';
import OrbitCamControlScript from './src/goo/scripts/OrbitCamControlScript';
import Scripts from './src/goo/scripts/Scripts';
import ScriptUtils from './src/goo/scripts/ScriptUtils';
import Box from './src/goo/shapes/Box';
import Cone from './src/goo/shapes/Cone';
import Cylinder from './src/goo/shapes/Cylinder';
import Disk from './src/goo/shapes/Disk';
import Grid from './src/goo/shapes/Grid';
import Quad from './src/goo/shapes/Quad';
import SimpleBox from './src/goo/shapes/SimpleBox';
import Sphere from './src/goo/shapes/Sphere';
import TextureGrid from './src/goo/shapes/TextureGrid';
import Torus from './src/goo/shapes/Torus';
import AudioContext from './src/goo/sound/AudioContext';
import OscillatorSound from './src/goo/sound/OscillatorSound';
import Sound from './src/goo/sound/Sound';
import Ajax from './src/goo/util/Ajax';
import ArrayUtil from './src/goo/util/ArrayUtil';
import ArrayUtils from './src/goo/util/ArrayUtils';
import CanvasUtils from './src/goo/util/CanvasUtils';
import AtlasNode from './src/goo/util/combine/AtlasNode';
import EntityCombiner from './src/goo/util/combine/EntityCombiner';
import Rectangle from './src/goo/util/combine/Rectangle';
import EventTarget from './src/goo/util/EventTarget';
import GameUtils from './src/goo/util/GameUtils';
import Logo from './src/goo/util/Logo';
import MeshBuilder from './src/goo/util/MeshBuilder';
import ObjectUtil from './src/goo/util/ObjectUtil';
import ObjectUtils from './src/goo/util/ObjectUtils';
import ParticleSystemUtils from './src/goo/util/ParticleSystemUtils';
import PromiseUtil from './src/goo/util/PromiseUtil';
import PromiseUtils from './src/goo/util/PromiseUtils';
import Rc4Random from './src/goo/util/Rc4Random';
import rsvp from './src/goo/util/rsvp';
import ShapeCreatorMemoized from './src/goo/util/ShapeCreatorMemoized';
import Skybox from './src/goo/util/Skybox';
import Snow from './src/goo/util/Snow';
import SoundCreator from './src/goo/util/SoundCreator';
import Stats from './src/goo/util/Stats';
import StringUtil from './src/goo/util/StringUtil';
import StringUtils from './src/goo/util/StringUtils';
import TangentGenerator from './src/goo/util/TangentGenerator';
import TWEEN from './src/goo/util/TWEEN';

window.goo = module.exports = {
	Bus,
	CameraComponent,
	Component,
	CssTransformComponent,
	Dom3dComponent,
	HtmlComponent,
	LightComponent,
	MeshDataComponent,
	MeshRendererComponent,
	MovementComponent,
	ParticleComponent,
	PortalComponent,
	ScriptComponent,
	SoundComponent,
	TextComponent,
	TransformComponent,
	Entity,
	EntitySelection,
	EntityUtils,
	GooRunner,
	EntityManager,
	Manager,
	Selection,
	SystemBus,
	BoundingUpdateSystem,
	CameraSystem,
	CssTransformSystem,
	Dom3dSystem,
	GridRenderSystem,
	HtmlSystem,
	LightingSystem,
	MovementSystem,
	ParticlesSystem,
	PickingSystem,
	PortalSystem,
	RenderSystem,
	ScriptSystem,
	SoundSystem,
	System,
	TextSystem,
	TransformSystem,
	World,
	CrunchLoader,
	DdsLoader,
	DdsUtils,
	DynamicLoader,
	CameraComponentHandler,
	ComponentHandler,
	ConfigHandler,
	Dom3dComponentHandler,
	EntityHandler,
	EnvironmentHandler,
	HtmlComponentHandler,
	LightComponentHandler,
	MaterialHandler,
	MeshDataComponentHandler,
	MeshDataHandler,
	MeshRendererComponentHandler,
	ProjectHandler,
	SceneHandler,
	ShaderHandler,
	SkyboxHandler,
	SoundComponentHandler,
	SoundHandler,
	TextureHandler,
	TransformComponentHandler,
	TgaLoader,
	MathUtils,
	Matrix,
	Matrix2,
	Matrix2x2,
	Matrix3,
	Matrix3x3,
	Matrix4,
	Matrix4x4,
	Plane,
	Quaternion,
	Ray,
	Spline,
	SplineWalker,
	Transform,
	Vector,
	Vector2,
	Vector3,
	Vector4,
	Noise,
	ValueNoise,
	Particle,
	ParticleEmitter,
	ParticleInfluence,
	ParticleLib,
	ParticleUtils,
	BoundingTree,
	PrimitivePickLogic,
	BoundingBox,
	BoundingSphere,
	BoundingVolume,
	BufferData,
	BufferUtils,
	Camera,
	Capabilities,
	DirectionalLight,
	Light,
	PointLight,
	SpotLight,
	Material,
	MeshData,
	Composer,
	FullscreenPass,
	FullscreenUtil,
	FullscreenUtils,
	Pass,
	RenderPass,
	RenderTarget,
	ContextLost,
	Renderer,
	RendererRecord,
	RendererUtils,
	RenderInfo,
	RenderQueue,
	RenderStats,
	Shader,
	ShaderCall,
	ShaderBuilder,
	ShaderFragment,
	ShaderLib,
	ShadowHandler,
	SimplePartitioner,
	TaskScheduler,
	Texture,
	TextureCreator,
	OrbitCamControlScript,
	Scripts,
	ScriptUtils,
	Box,
	Cone,
	Cylinder,
	Disk,
	Grid,
	Quad,
	SimpleBox,
	Sphere,
	TextureGrid,
	Torus,
	AudioContext,
	OscillatorSound,
	Sound,
	Ajax,
	ArrayUtil,
	ArrayUtils,
	CanvasUtils,
	AtlasNode,
	EntityCombiner,
	Rectangle,
	EventTarget,
	GameUtils,
	Logo,
	MeshBuilder,
	ObjectUtil,
	ObjectUtils,
	ParticleSystemUtils,
	PromiseUtil,
	PromiseUtils,
	Rc4Random,
	rsvp,
	ShapeCreatorMemoized,
	Skybox,
	Snow,
	SoundCreator,
	Stats,
	StringUtil,
	StringUtils,
	TangentGenerator,
	TWEEN
};