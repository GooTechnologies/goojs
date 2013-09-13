#!/usr/bin/env python

import sys
import subprocess

if len(sys.argv) != 2:
    print 'Usage: release.py version-number'
    sys.exit(1)

version = sys.argv[1]

subprocess.check_call('cake minify')
subprocess.check_call('cake jsdoc')
subprocess.check_call(['build/release-to-git', version])
