# Intensify! the browser extension

[![CircleCI](https://circleci.com/gh/jbellue/intensify-webext/tree/master.svg?style=shield)](https://circleci.com/gh/jbellue/intensify-webext/tree/master)

Right-click an image, and click intensify to open the intensifier in a new tab.
As far as I can tell, this extension should work both in Mozilla Firefox and Google Chrome

## Bugs

* Sometimes when changing the config from the options, the text doesn't appear in the next intensified image
* the chrome zip file doesn't unpack for an unknown reason
* Probably loads

## Needs done

* A prettier page
* Unittests (look into [webextensions-jsdom](https://www.npmjs.com/package/webextensions-jsdom))
* check minimum gecko version

## Would be nice to have

* an advanced options page, where the moving arrays could be defined

## Quite probably won't happen

* repack gifs. Too much work.