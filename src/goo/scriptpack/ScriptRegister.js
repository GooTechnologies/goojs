import Scripts from '../scripts/Scripts';
import OrbitCamControlScript from '../scripts/OrbitCamControlScript';
import OrbitNPanControlScript from './OrbitNPanControlScript';
import FlyControlScript from './FlyControlScript';
import AxisAlignedCamControlScript from './AxisAlignedCamControlScript';
import PanCamScript from './PanCamScript';
import MouseLookControlScript from './MouseLookControlScript';
import WasdControlScript from './WasdControlScript';
import ButtonScript from './ButtonScript';
import PickAndRotateScript from './PickAndRotateScript';
import LensFlareScript from './LensFlareScript';

var scripts = {
	OrbitCamControlScript: OrbitCamControlScript,
	OrbitNPanControlScript: OrbitNPanControlScript,
	FlyControlScript: FlyControlScript,
	AxisAlignedCamControlScript: AxisAlignedCamControlScript,
	PanCamScript: PanCamScript,
	MouseLookControlScript: MouseLookControlScript,
	WasdControlScript: WasdControlScript,
	ButtonScript: ButtonScript,
	PickAndRotateScript: PickAndRotateScript,
	LensFlareScript: LensFlareScript
};

for (var key in scripts) {
	Scripts.register(scripts[key]);
}
