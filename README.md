#Candle

##About

Candle is a client/server package for remotely administering chrome clients. Use it to show
pictures of cats on your dashboard monitors or to close/make active different tabs.

##Installation

The only requirement is `node`/`npm`. Download them through your favorite package manager, or at [http://nodejs.org/](http://nodejs.org/)

If you've got `npm` installed, you can simply run this command from the top level directory:

	npm run install-all

… which will install bower (globally), and fetch the bower dependencies for the Chrome extension and Server.

You can install just the server:

	npm run install-server

And just the client:

	npm run install-client

##Running

###Server

After running the installation step above, you can run the server via:

	npm run server -- -p [port]

Or:

	node server/server.js -p [port]

Where [port] is a required argument, and a number.

Visiting 127.0.0.1:[port] with a client connected will present you the administration page.

###Client

In Chrome, visit the [extensions page](chrome://extensions/), hit the 'Load unpacked extension…' button, navigate to the chrome/ subdirectory and select it.

##License

MIT. 
