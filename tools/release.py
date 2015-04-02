#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
GooJS build release script,
used via the CI script on the
BuildBot.
"""

import os
import shutil
import subprocess

from argparse import ArgumentParser

TMP_OUT = 'out'

GRUNT_BIN = 'node_modules/grunt-cli/bin/grunt'


def build_engine(version, grunt_build_task, tmp_relase_dir):

	print 'Building engine with grunt task: "%s" with version: "%s"' % \
		  (grunt_build_task, version)

	subprocess.check_call([GRUNT_BIN,
						   grunt_build_task,
						   '--goo-version=' + version])

	# Move only files into the tmp relase dir.
	files = [os.path.join(TMP_OUT, f) for f in os.listdir(TMP_OUT)
			 if os.path.isfile(os.path.join(TMP_OUT, f))]
	for f in files:
		shutil.move(f, tmp_relase_dir)

	print 'Moved build into %s' % tmp_relase_dir


def copy_to_release_dir(release_dir, engine_folders):

	if os.path.isdir(release_dir):
		print 'Release directory already exists:', release_dir
	else:
		print 'Creating directory for release:', release_dir
		os.makedirs(release_dir)

	release_lib_folder = os.path.join(release_dir, 'lib')
	os.makedirs(release_lib_folder)

	for directory in (
		'lib/p2',
		'lib/box2d',
		'lib/cannon',
		'lib/soundmanager2',
		'lib/crunch',
		'lib/hammerv2',
		('out-doc', 'docs'),
		'visual-test',
		'examples'):
		if isinstance(directory, basestring):
			source = destination = directory
		else:
			source, destination = directory
		dest_path = os.path.join(release_dir, destination)
		shutil.copytree(source, dest_path)
		print 'Copying "%s" into "%s"' % (source, dest_path)

	shutil.copy('lib/require.js', release_lib_folder)
	shutil.copy('lib/ammo.small.js', release_lib_folder)
	shutil.copy('lib/polyk.js', release_lib_folder)
	shutil.copy('COPYING', release_dir)
	shutil.copy('LICENSE', release_dir)
	shutil.copy('CHANGES', release_dir)

	"""
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
		'linerender',
		'animation',
		'soundmanager2',
		'gamepad',
		'pass',
		'gizmo',
		'physics'
	):
		shutil.copy('out/' + packName + 'pack.js', release_dir + '/lib/' + packName + 'pack.js')

	"""


def setup_tmp_build_dirs(sub_releases):
	if os.path.isdir(TMP_OUT):
		shutil.rmtree(TMP_OUT)
		print 'Cleared out %s' % os.path.abspath(TMP_OUT)
	os.mkdir(TMP_OUT)

	releases_dir = os.path.join(TMP_OUT, 'releases')
	os.makedirs(releases_dir)

	rel_tmp_dirs = list()

	for release_folder in sub_releases:
		rel_abs_path = os.path.join(releases_dir, release_folder)
		rel_tmp_dirs.append(rel_abs_path)
		os.makedirs(rel_abs_path)

	return rel_tmp_dirs


if __name__ == '__main__':

	script_description = """
		Will build two versions of the engine (with packs), one mangled
		and one unmangled. The folder {out_dir} will be (re)created upon building,
		and the relevant build output will then be copied over to the
		specified release_dir.

		The engine's documentation and visual tests are built as well.
	""".format(out_dir=TMP_OUT)

	parser = ArgumentParser(description=script_description)

	parser.add_argument('release_dir',
						help='Root directory to copy the built engine into')

	parser.add_argument('version',
						help='Version number which will be added into the build comment.')

	args = parser.parse_args()

	builds_to_run = [
		'minify',
		'minify-no-mangle'
	]

	# Grunt task names double time as folder names in the tmp out directory.
	rel_dirs = setup_tmp_build_dirs(builds_to_run)

	for i in range(len(builds_to_run)):
		build_engine(args.version, builds_to_run[i], rel_dirs[i])

	"""
	# Build documentation
	subprocess.check_call([GRUNT_BIN, 'jsdoc'])
	# Build visual tests
	subprocess.check_call([GRUNT_BIN, 'generate-toc'])
	"""

	# Copy the build result into the release directory
	copy_to_release_dir(args.release_dir, rel_dirs)

