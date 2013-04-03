#!/bin/sh
node build --path ../examples/ --name 50k_boxes.js --out 50k_boxes.min.js
node build --path ../examples/ --name anim2.js --out animation.min.js
node build --path ../examples/ --name cssrenderer.js --out animated_html.min.js
node build --path ../examples/ --name cubemap.js --out environment_mapping.min.js
node build --path ../examples/ --name flatwater.js --out ocean.min.js
node build --path ../examples/ --name iphone.js --out iphone_webcam.min.js
node build --path ../examples/ --name normalmap.js --out normal_mapping.min.js
node build --path ../examples/ --name parallaxmap.js --out parallax_mapping.min.js
node build --path ../examples/ --name particles4.js --out particle_emitters.min.js
node build --path ../examples/ --name points.js --out 500k_points.min.js
node build --path ../examples/ --name projectedgridwater.js --out turbulent_ocean.min.js
node build --path ../examples/ --name shadows.js --out shadow_mapping.min.js
node build --path ../examples/ --name skeletonarmy.js --out skeleton_army.min.js
