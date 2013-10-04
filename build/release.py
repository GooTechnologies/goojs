#!/usr/bin/env python

import os
import sys
import shutil
import subprocess


def prepend(filename, to_prepend):
	"""Prepends a string to a file

	"""
	with open(filename, 'r') as stream:
		content = stream.read()
	with open(filename, 'w') as stream:
		stream.write(to_prepend)
		stream.write(content)


if len(sys.argv) != 2:
    print 'Usage: release.py version-number'
    sys.exit(1)

version = sys.argv[1]
name = 'goo-' + version

print 'Creating release', name

if os.name == 'nt':
    command = 'cake.cmd'
else:
    command = 'cake'
subprocess.check_call([command, 'minify'])
#subprocess.check_call([command, '-i', 'requireLib', 'minify'])
subprocess.check_call([command, 'jsdoc'])
subprocess.check_call([command, 'visualtoc'])

header = '// Version ' + version + '\n'
prepend('out/minified/goo.js', header)
#prepend('out/minified/goo-require.js', header)

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

shutil.copy('out/minified/goo.js', release_dir + '/lib/goo.js')
#shutil.copy('out/minified/goo-require.js', release_dir + '/lib/goo-require.js')
shutil.copy('COPYING', release_dir + '/COPYING')
shutil.copy('CHANGES', release_dir + '/CHANGES')
