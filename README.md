Candle v0.0.1
======

Candle exists to make one thing in our lives easier: show pictures of cats on monitors running
Google Chrome around the office.

If your flow is anything like this:
1. open a VNC connection (slow)
2. focus on window
3. go to URL bar, type/paste URL that you would like people to see
4. hit enter
5. close VNC
6. go to step 1 when you get bored of URL.

Then Candle intends to fix it like this:
1. open a (local!) browser tab
2. go to Candle administration page for monitor
3. select tab you would like shown. Or enter a new URL, or rotate the current set of tabs, or select a bookmark, or…

You get the idea.

This is very much a work in progress. Candle is just at the point at which the chrome extension
reports the current tabstate on any tab changes. The server is kept aware of tabstate changes, and as such, is
capable of reporting the current tabstatus at any time at this URI: ```127.0.0.1:8090/client/guid-of-client-here```,
where 'guid-of-client-here' is the 'id' reported by the client on websocket connection/reconnection. You can get this
information from the server process's information output as soon as a client connects.
