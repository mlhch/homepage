A SPA for self-representation.
==============================

### Prerequisites:

	* Node
		* command `npm`
			* Ubuntu
				* $ sudo apt-get install npm, nodejs will be installed as dependency
				* $ sudo ln -s /usr/bin/nodejs /usr/bin/node, manually create `node` command
		* command `bower`
			* $ (sudo) npm install -g bower
		* command `grunt`
			* $ (sudo) sudo npm install -g grunt-cli
	* Ruby
		* gem `compass`
			* Ubuntu
				* $ sudo apt-get install ruby
				* $ sudo gem install compass

### Install/Run:

	* $ (sudo) npm install
		* If it fails to install grunt-mocha because of blocked connection to http://cdn.bitbucket.org/ariya/phantomjs/downloads/phantomjs-1.9.7-linux-x86_64.tar.bz2, please manually download it and extract the executable bin/phantomjs, then move it as /usr/bin/phantomjs. Try again `(sudo) npm install`
	* $ bower install
	* $ grunt serve/serve:dist/build

