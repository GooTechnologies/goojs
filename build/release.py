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

if os.name == 'nt':
    command = 'cake.cmd'
else:
    command = 'cake'
grunt_command = 'node_modules/grunt-cli/bin/grunt'
subprocess.check_call([grunt_command, 'minify', '--goo-version=' + version])
subprocess.check_call([grunt_command, 'minify', '--goo-version=' + version, '--bundle-require'])
subprocess.check_call([command, 'jsdoc'])
subprocess.check_call([command, 'visualtoc'])

release_dir = os.getenv('RELEASE_DIR', 'out/release/' + name)
print 'Creating release in', release_dir
if not os.path.isdir(release_dir):
	os.makedirs(release_dir)

os.makedirs(release_dir + '/lib')
for directory in (
	'lib/box2d',
	'lib/cannon',
	'lib/soundmanager2',
	'lib/howler',
	'lib/crunch',
	'lib/hammerv2',
	('goojs-jsdoc', 'docs'),
	'visual-test'
):
	if isinstance(directory, basestring):
		source = destination = directory
	else:
		source, destination = directory
	shutil.copytree(source, release_dir + '/' + destination)

shutil.copy('out/goo.js', release_dir + '/lib/goo.js')
shutil.copy('out/goo-require.js', release_dir + '/lib/goo-require.js')
shutil.copy('lib/require.js', release_dir + '/lib/require.js')
shutil.copy('COPYING', release_dir + '/COPYING')
shutil.copy('LICENSE', release_dir + '/LICENSE')
shutil.copy('CHANGES', release_dir + '/CHANGES')
