#!/usr/bin/env python

import sys
from pyvirtualdisplay import Display
from selenium import webdriver
from selenium.webdriver.common.by import By
from time import sleep

def getFirefox():
    fp = webdriver.FirefoxProfile()
    fp.set_preference("webgl.osmesalib","/usr/lib/libOSMesa.so.6")
    browser = webdriver.Firefox(firefox_profile=fp)
    return browser

def getChrome():
    chromeOptions = webdriver.ChromeOptions()
    chromeOptions.add_argument('--user-data-dir=.tmp')
    chromeOptions.add_argument("--user-data-dir=.tmp")
    chromeOptions.add_argument("--no-default-browser-check")
    chromeOptions.add_argument("--no-first-run")
    chromeOptions.add_argument("--disable-default-apps")
    chromeOptions.add_argument("--use-gl=osmesa")
    chromeOptions.add_argument("--no-sandbox");
    browser = webdriver.Chrome(chrome_options=chromeOptions)
    return browser


if len(sys.argv) < 2:
    sys.exit('Usage: %s <url>' % sys.argv[0])

url = sys.argv[1]

display = Display(visible=0, size=(800, 600))
display.start()

# we can now start the browser and it will run inside the virtual display
browser = getFirefox()
browser.implicitly_wait(60)

browser.get(url)
#browser.find_elements_by_xpath("//li[contains(@class, 'executing')]")
#browser.find_elements_by_xpath("//li[contains(@class, 'idle')]")

browser.find_element(By.CSS_SELECTOR, 'li.executing')
browser.find_element(By.CSS_SELECTOR, 'li.idle')

# Example of capturig screen shots
#sleep(10)
#browser.save_screenshot('screenie.png')

#tidy-up
browser.quit()
display.stop() # ignore any output from this.
