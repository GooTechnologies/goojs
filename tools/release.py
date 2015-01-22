#!/usr/bin/env python

import os
import sys
import shutil
import subprocess


if len(sys.argv) != 2:
    print 'Usage: release.py version-number'
    sys.exit(1)

version = sys.argv[1]
name = 'goo-' + version

print 'Creating release', name
if os.path.isdir('out'):
    shutil.rmtree('out')

grunt_command = 'node_modules/grunt-cli/bin/grunt'
subprocess.check_call([grunt_command, 'minify', '--goo-version=' + version])

subprocess.check_call([grunt_command, 'jsdoc'])
subprocess.check_call([grunt_command, 'generate-toc'])

release_dir = os.getenv('RELEASE_DIR', 'out/release/' + name)
if os.path.isdir(release_dir):
	print 'Release directory already exists:', release_dir
else:
	print 'Creating directory for release:', release_dir
	os.makedirs(release_dir)

os.makedirs(release_dir + '/lib')
for directory in (
	'lib/p2',
	'lib/box2d',
	'lib/cannon',
	'lib/soundmanager2',
	'lib/crunch',
	'lib/hammerv2',
	('out-doc', 'docs'),
	'visual-test',
	'examples'
):
	if isinstance(directory, basestring):
		source = destination = directory
	else:
		source, destination = directory
	shutil.copytree(source, release_dir + '/' + destination)


shutil.copy('out/goo.js', release_dir + '/lib/goo.js')

# pack files must also be copied
for packName in (
	'fsm',
	'geometry',
	'quad',
	'script',
	'timeline',
	'debug',
	'p2',
	'box2d',
	'terrain',
	'ammo',
	'cannon',
	'water',
	'animation',
	'soundmanager2',
	'gamepad',
	'pass',
	'gizmo'
):
    shutil.copy('out/' + packName + 'pack.js', release_dir + '/lib/' + packName + 'pack.js')

shutil.copy('lib/require.js', release_dir + '/lib/require.js')
shutil.copy('lib/ammo.small.js', release_dir + '/lib/ammo.small.js')
shutil.copy('lib/polyk.js', release_dir + '/lib/polyk.js')
shutil.copy('COPYING', release_dir + '/COPYING')
shutil.copy('LICENSE', release_dir + '/LICENSE')
shutil.copy('CHANGES', release_dir + '/CHANGES')