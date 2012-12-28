#! /bin/bash

# Get script dir
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Check if virtualenv exists
if [ ! -f virtualenv.py ]; then
    echo "Installing virtualenv"
    # Download virtualenv.py
    wget https://raw.github.com/pypa/virtualenv/master/virtualenv.py
fi

# Check if virtualenv .env directory exists
if [ ! -d .env ]; then
    echo "Creating virtualenv"
    python virtualenv.py .env
fi

# Activate virtual env and install dependencies if needed
source .env/bin/activate
pip install pyvirtualdisplay
pip install selenium

echo "Starting browser test"
python ${DIR}/jenkins-selenium.py $1
