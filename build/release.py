#!/usr/bin/env python

import os
import sys
import shutil
import subprocess
from zipfile import ZipFile


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
work_dir = 'minified'
name = 'goo-' + version

# Root directory inside zip file
zip_root = name + '/'

print 'Creating release', name
if os.path.isdir(work_dir):
    shutil.rmtree(work_dir)

if os.name == 'nt':
    command = 'cake.cmd'
else:
    command = 'cake'
subprocess.check_call([command, 'minify'])

zipfile = ZipFile(name + '.zip', 'w')
zipfile.write('COPYING', zip_root + 'COPYING')
goo_root = work_dir + '/goo'

prepend(goo_root + '/goo.js',
	'/*\n' +
	' * Goo Engine ' + version + '\n' +
	' * Copyright 2013 Goo Technologies AB\n' +
	' */\n'
)

for root, dirs, files in os.walk(goo_root):
    for f in files:
        filename = root[len(goo_root) + 1:] + '/' + f
        zipfile.write(root + '/' + f, zip_root + filename)

zipfile.close()