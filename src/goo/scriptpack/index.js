import AxisAlignedCamControlScript from './AxisAlignedCamControlScript';
import BasicControlScript from './BasicControlScript';
import ButtonScript from './ButtonScript';
import CannonPickScript from './CannonPickScript';
import FlyControlScript from './FlyControlScript';
import GroundBoundMovementScript from './GroundBoundMovementScript';
import HeightMapBoundingScript from './HeightMapBoundingScript';
import LensFlareScript from './LensFlareScript';
import MouseLookControlScript from './MouseLookControlScript';
import OrbitNPanControlScript from './OrbitNPanControlScript';
import PanCamScript from './PanCamScript';
import PickAndRotateScript from './PickAndRotateScript';
import PolyBoundingScript from './PolyBoundingScript';
import RotationScript from './RotationScript';
import ScriptComponentHandler from './ScriptComponentHandler';
import ScriptHandler from './ScriptHandler';
import ScriptHandlers from './ScriptHandlers';
import ScriptRegister from './ScriptRegister';
import SparseHeightMapBoundingScript from './SparseHeightMapBoundingScript';
import WasdControlScript from './WasdControlScript';
import WorldFittedTerrainScript from './WorldFittedTerrainScript';

module.exports = {
	AxisAlignedCamControlScript,
	BasicControlScript,
	ButtonScript,
	CannonPickScript,
	FlyControlScript,
	GroundBoundMovementScript,
	HeightMapBoundingScript,
	LensFlareScript,
	MouseLookControlScript,
	OrbitNPanControlScript,
	PanCamScript,
	PickAndRotateScript,
	PolyBoundingScript,
	RotationScript,
	ScriptComponentHandler,
	ScriptHandler,
	ScriptHandlers,
	ScriptRegister,
	SparseHeightMapBoundingScript,
	WasdControlScript,
	WorldFittedTerrainScript
};

require('./ScriptRegister');

import ObjectUtils from './../util/ObjectUtils';

if (typeof(window) !== 'undefined') {
	ObjectUtils.extend(window.goo, module.exports);
}