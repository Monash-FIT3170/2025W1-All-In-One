Package["core-runtime"].queue("ddp-server",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var check = Package.check.check;
var Match = Package.check.Match;
var Random = Package.random.Random;
var EJSON = Package.ejson.EJSON;
var Retry = Package.retry.Retry;
var MongoID = Package['mongo-id'].MongoID;
var DiffSequence = Package['diff-sequence'].DiffSequence;
var ECMAScript = Package.ecmascript.ECMAScript;
var DDPCommon = Package['ddp-common'].DDPCommon;
var DDP = Package['ddp-client'].DDP;
var WebApp = Package.webapp.WebApp;
var WebAppInternals = Package.webapp.WebAppInternals;
var main = Package.webapp.main;
var RoutePolicy = Package.routepolicy.RoutePolicy;
var Hook = Package['callback-hook'].Hook;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var StreamServer, DDPServer, id, Server, value;

var require = meteorInstall({"node_modules":{"meteor":{"ddp-server":{"stream_server.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ddp-server/stream_server.js                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    let _objectSpread;
    module.link("@babel/runtime/helpers/objectSpread2", {
      default(v) {
        _objectSpread = v;
      }
    }, 0);
    let once;
    module.link("lodash.once", {
      default(v) {
        once = v;
      }
    }, 0);
    let zlib;
    module.link("node:zlib", {
      default(v) {
        zlib = v;
      }
    }, 1);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    // By default, we use the permessage-deflate extension with default
    // configuration. If $SERVER_WEBSOCKET_COMPRESSION is set, then it must be valid
    // JSON. If it represents a falsey value, then we do not use permessage-deflate
    // at all; otherwise, the JSON value is used as an argument to deflate's
    // configure method; see
    // https://github.com/faye/permessage-deflate-node/blob/master/README.md
    //
    // (We do this in an _.once instead of at startup, because we don't want to
    // crash the tool during isopacket load if your JSON doesn't parse. This is only
    // a problem because the tool has to load the DDP server code just in order to
    // be a DDP client; see https://github.com/meteor/meteor/issues/3452 .)
    var websocketExtensions = once(function () {
      var extensions = [];
      var websocketCompressionConfig = process.env.SERVER_WEBSOCKET_COMPRESSION ? JSON.parse(process.env.SERVER_WEBSOCKET_COMPRESSION) : {};
      if (websocketCompressionConfig) {
        extensions.push(Npm.require('permessage-deflate2').configure(_objectSpread({
          threshold: 1024,
          level: zlib.constants.Z_BEST_SPEED,
          memLevel: zlib.constants.Z_MIN_MEMLEVEL,
          noContextTakeover: true,
          maxWindowBits: zlib.constants.Z_MIN_WINDOWBITS
        }, websocketCompressionConfig || {})));
      }
      return extensions;
    });
    var pathPrefix = __meteor_runtime_config__.ROOT_URL_PATH_PREFIX || "";
    StreamServer = function () {
      var self = this;
      self.registration_callbacks = [];
      self.open_sockets = [];

      // Because we are installing directly onto WebApp.httpServer instead of using
      // WebApp.app, we have to process the path prefix ourselves.
      self.prefix = pathPrefix + '/sockjs';
      RoutePolicy.declare(self.prefix + '/', 'network');

      // set up sockjs
      var sockjs = Npm.require('sockjs');
      var serverOptions = {
        prefix: self.prefix,
        log: function () {},
        // this is the default, but we code it explicitly because we depend
        // on it in stream_client:HEARTBEAT_TIMEOUT
        heartbeat_delay: 45000,
        // The default disconnect_delay is 5 seconds, but if the server ends up CPU
        // bound for that much time, SockJS might not notice that the user has
        // reconnected because the timer (of disconnect_delay ms) can fire before
        // SockJS processes the new connection. Eventually we'll fix this by not
        // combining CPU-heavy processing with SockJS termination (eg a proxy which
        // converts to Unix sockets) but for now, raise the delay.
        disconnect_delay: 60 * 1000,
        // Allow disabling of CORS requests to address
        // https://github.com/meteor/meteor/issues/8317.
        disable_cors: !!process.env.DISABLE_SOCKJS_CORS,
        // Set the USE_JSESSIONID environment variable to enable setting the
        // JSESSIONID cookie. This is useful for setting up proxies with
        // session affinity.
        jsessionid: !!process.env.USE_JSESSIONID
      };

      // If you know your server environment (eg, proxies) will prevent websockets
      // from ever working, set $DISABLE_WEBSOCKETS and SockJS clients (ie,
      // browsers) will not waste time attempting to use them.
      // (Your server will still have a /websocket endpoint.)
      if (process.env.DISABLE_WEBSOCKETS) {
        serverOptions.websocket = false;
      } else {
        serverOptions.faye_server_options = {
          extensions: websocketExtensions()
        };
      }
      self.server = sockjs.createServer(serverOptions);

      // Install the sockjs handlers, but we want to keep around our own particular
      // request handler that adjusts idle timeouts while we have an outstanding
      // request.  This compensates for the fact that sockjs removes all listeners
      // for "request" to add its own.
      WebApp.httpServer.removeListener('request', WebApp._timeoutAdjustmentRequestCallback);
      self.server.installHandlers(WebApp.httpServer);
      WebApp.httpServer.addListener('request', WebApp._timeoutAdjustmentRequestCallback);

      // Support the /websocket endpoint
      self._redirectWebsocketEndpoint();
      self.server.on('connection', function (socket) {
        // sockjs sometimes passes us null instead of a socket object
        // so we need to guard against that. see:
        // https://github.com/sockjs/sockjs-node/issues/121
        // https://github.com/meteor/meteor/issues/10468
        if (!socket) return;

        // We want to make sure that if a client connects to us and does the initial
        // Websocket handshake but never gets to the DDP handshake, that we
        // eventually kill the socket.  Once the DDP handshake happens, DDP
        // heartbeating will work. And before the Websocket handshake, the timeouts
        // we set at the server level in webapp_server.js will work. But
        // faye-websocket calls setTimeout(0) on any socket it takes over, so there
        // is an "in between" state where this doesn't happen.  We work around this
        // by explicitly setting the socket timeout to a relatively large time here,
        // and setting it back to zero when we set up the heartbeat in
        // livedata_server.js.
        socket.setWebsocketTimeout = function (timeout) {
          if ((socket.protocol === 'websocket' || socket.protocol === 'websocket-raw') && socket._session.recv) {
            socket._session.recv.connection.setTimeout(timeout);
          }
        };
        socket.setWebsocketTimeout(45 * 1000);
        socket.send = function (data) {
          socket.write(data);
        };
        socket.on('close', function () {
          self.open_sockets = self.open_sockets.filter(function (value) {
            return value !== socket;
          });
        });
        self.open_sockets.push(socket);

        // only to send a message after connection on tests, useful for
        // socket-stream-client/server-tests.js
        if (process.env.TEST_METADATA && process.env.TEST_METADATA !== "{}") {
          socket.send(JSON.stringify({
            testMessageOnConnect: true
          }));
        }

        // call all our callbacks when we get a new socket. they will do the
        // work of setting up handlers and such for specific messages.
        self.registration_callbacks.forEach(function (callback) {
          callback(socket);
        });
      });
    };
    Object.assign(StreamServer.prototype, {
      // call my callback when a new socket connects.
      // also call it for all current connections.
      register: function (callback) {
        var self = this;
        self.registration_callbacks.push(callback);
        self.all_sockets().forEach(function (socket) {
          callback(socket);
        });
      },
      // get a list of all sockets
      all_sockets: function () {
        var self = this;
        return Object.values(self.open_sockets);
      },
      // Redirect /websocket to /sockjs/websocket in order to not expose
      // sockjs to clients that want to use raw websockets
      _redirectWebsocketEndpoint: function () {
        var self = this;
        // Unfortunately we can't use a connect middleware here since
        // sockjs installs itself prior to all existing listeners
        // (meaning prior to any connect middlewares) so we need to take
        // an approach similar to overshadowListeners in
        // https://github.com/sockjs/sockjs-node/blob/cf820c55af6a9953e16558555a31decea554f70e/src/utils.coffee
        ['request', 'upgrade'].forEach(event => {
          var httpServer = WebApp.httpServer;
          var oldHttpServerListeners = httpServer.listeners(event).slice(0);
          httpServer.removeAllListeners(event);

          // request and upgrade have different arguments passed but
          // we only care about the first one which is always request
          var newListener = function (request /*, moreArguments */) {
            // Store arguments for use within the closure below
            var args = arguments;

            // TODO replace with url package
            var url = Npm.require('url');

            // Rewrite /websocket and /websocket/ urls to /sockjs/websocket while
            // preserving query string.
            var parsedUrl = url.parse(request.url);
            if (parsedUrl.pathname === pathPrefix + '/websocket' || parsedUrl.pathname === pathPrefix + '/websocket/') {
              parsedUrl.pathname = self.prefix + '/websocket';
              request.url = url.format(parsedUrl);
            }
            oldHttpServerListeners.forEach(function (oldListener) {
              oldListener.apply(httpServer, args);
            });
          };
          httpServer.addListener(event, newListener);
        });
      }
    });
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"livedata_server.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ddp-server/livedata_server.js                                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    let _objectSpread;
    module.link("@babel/runtime/helpers/objectSpread2", {
      default(v) {
        _objectSpread = v;
      }
    }, 0);
    let isEmpty;
    module.link("lodash.isempty", {
      default(v) {
        isEmpty = v;
      }
    }, 0);
    let isObject;
    module.link("lodash.isobject", {
      default(v) {
        isObject = v;
      }
    }, 1);
    let isString;
    module.link("lodash.isstring", {
      default(v) {
        isString = v;
      }
    }, 2);
    let SessionCollectionView;
    module.link("./session_collection_view", {
      SessionCollectionView(v) {
        SessionCollectionView = v;
      }
    }, 3);
    let SessionDocumentView;
    module.link("./session_document_view", {
      SessionDocumentView(v) {
        SessionDocumentView = v;
      }
    }, 4);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    DDPServer = {};

    // Publication strategies define how we handle data from published cursors at the collection level
    // This allows someone to:
    // - Choose a trade-off between client-server bandwidth and server memory usage
    // - Implement special (non-mongo) collections like volatile message queues
    const publicationStrategies = {
      // SERVER_MERGE is the default strategy.
      // When using this strategy, the server maintains a copy of all data a connection is subscribed to.
      // This allows us to only send deltas over multiple publications.
      SERVER_MERGE: {
        useDummyDocumentView: false,
        useCollectionView: true,
        doAccountingForCollection: true
      },
      // The NO_MERGE_NO_HISTORY strategy results in the server sending all publication data
      // directly to the client. It does not remember what it has previously sent
      // to it will not trigger removed messages when a subscription is stopped.
      // This should only be chosen for special use cases like send-and-forget queues.
      NO_MERGE_NO_HISTORY: {
        useDummyDocumentView: false,
        useCollectionView: false,
        doAccountingForCollection: false
      },
      // NO_MERGE is similar to NO_MERGE_NO_HISTORY but the server will remember the IDs it has
      // sent to the client so it can remove them when a subscription is stopped.
      // This strategy can be used when a collection is only used in a single publication.
      NO_MERGE: {
        useDummyDocumentView: false,
        useCollectionView: false,
        doAccountingForCollection: true
      },
      // NO_MERGE_MULTI is similar to `NO_MERGE`, but it does track whether a document is
      // used by multiple publications. This has some memory overhead, but it still does not do
      // diffing so it's faster and slimmer than SERVER_MERGE.
      NO_MERGE_MULTI: {
        useDummyDocumentView: true,
        useCollectionView: true,
        doAccountingForCollection: true
      }
    };
    DDPServer.publicationStrategies = publicationStrategies;

    // This file contains classes:
    // * Session - The server's connection to a single DDP client
    // * Subscription - A single subscription for a single client
    // * Server - An entire server that may talk to > 1 client. A DDP endpoint.
    //
    // Session and Subscription are file scope. For now, until we freeze
    // the interface, Server is package scope (in the future it should be
    // exported).

    DDPServer._SessionDocumentView = SessionDocumentView;
    DDPServer._getCurrentFence = function () {
      let currentInvocation = this._CurrentWriteFence.get();
      if (currentInvocation) {
        return currentInvocation;
      }
      currentInvocation = DDP._CurrentMethodInvocation.get();
      return currentInvocation ? currentInvocation.fence : undefined;
    };
    DDPServer._SessionCollectionView = SessionCollectionView;

    /******************************************************************************/
    /* Session                                                                    */
    /******************************************************************************/

    var Session = function (server, version, socket, options) {
      var self = this;
      self.id = Random.id();
      self.server = server;
      self.version = version;
      self.initialized = false;
      self.socket = socket;

      // Set to null when the session is destroyed. Multiple places below
      // use this to determine if the session is alive or not.
      self.inQueue = new Meteor._DoubleEndedQueue();
      self.blocked = false;
      self.workerRunning = false;
      self.cachedUnblock = null;

      // Sub objects for active subscriptions
      self._namedSubs = new Map();
      self._universalSubs = [];
      self.userId = null;
      self.collectionViews = new Map();

      // Set this to false to not send messages when collectionViews are
      // modified. This is done when rerunning subs in _setUserId and those messages
      // are calculated via a diff instead.
      self._isSending = true;

      // If this is true, don't start a newly-created universal publisher on this
      // session. The session will take care of starting it when appropriate.
      self._dontStartNewUniversalSubs = false;

      // When we are rerunning subscriptions, any ready messages
      // we want to buffer up for when we are done rerunning subscriptions
      self._pendingReady = [];

      // List of callbacks to call when this connection is closed.
      self._closeCallbacks = [];

      // XXX HACK: If a sockjs connection, save off the URL. This is
      // temporary and will go away in the near future.
      self._socketUrl = socket.url;

      // Allow tests to disable responding to pings.
      self._respondToPings = options.respondToPings;

      // This object is the public interface to the session. In the public
      // API, it is called the `connection` object.  Internally we call it
      // a `connectionHandle` to avoid ambiguity.
      self.connectionHandle = {
        id: self.id,
        close: function () {
          self.close();
        },
        onClose: function (fn) {
          var cb = Meteor.bindEnvironment(fn, "connection onClose callback");
          if (self.inQueue) {
            self._closeCallbacks.push(cb);
          } else {
            // if we're already closed, call the callback.
            Meteor.defer(cb);
          }
        },
        clientAddress: self._clientAddress(),
        httpHeaders: self.socket.headers
      };
      self.send({
        msg: 'connected',
        session: self.id
      });

      // On initial connect, spin up all the universal publishers.
      self.startUniversalSubs();
      if (version !== 'pre1' && options.heartbeatInterval !== 0) {
        // We no longer need the low level timeout because we have heartbeats.
        socket.setWebsocketTimeout(0);
        self.heartbeat = new DDPCommon.Heartbeat({
          heartbeatInterval: options.heartbeatInterval,
          heartbeatTimeout: options.heartbeatTimeout,
          onTimeout: function () {
            self.close();
          },
          sendPing: function () {
            self.send({
              msg: 'ping'
            });
          }
        });
        self.heartbeat.start();
      }
      Package['facts-base'] && Package['facts-base'].Facts.incrementServerFact("livedata", "sessions", 1);
    };
    Object.assign(Session.prototype, {
      sendReady: function (subscriptionIds) {
        var self = this;
        if (self._isSending) {
          self.send({
            msg: "ready",
            subs: subscriptionIds
          });
        } else {
          subscriptionIds.forEach(function (subscriptionId) {
            self._pendingReady.push(subscriptionId);
          });
        }
      },
      _canSend(collectionName) {
        return this._isSending || !this.server.getPublicationStrategy(collectionName).useCollectionView;
      },
      sendAdded(collectionName, id, fields) {
        if (this._canSend(collectionName)) {
          this.send({
            msg: 'added',
            collection: collectionName,
            id,
            fields
          });
        }
      },
      sendChanged(collectionName, id, fields) {
        if (isEmpty(fields)) return;
        if (this._canSend(collectionName)) {
          this.send({
            msg: "changed",
            collection: collectionName,
            id,
            fields
          });
        }
      },
      sendRemoved(collectionName, id) {
        if (this._canSend(collectionName)) {
          this.send({
            msg: "removed",
            collection: collectionName,
            id
          });
        }
      },
      getSendCallbacks: function () {
        var self = this;
        return {
          added: self.sendAdded.bind(self),
          changed: self.sendChanged.bind(self),
          removed: self.sendRemoved.bind(self)
        };
      },
      getCollectionView: function (collectionName) {
        var self = this;
        var ret = self.collectionViews.get(collectionName);
        if (!ret) {
          ret = new SessionCollectionView(collectionName, self.getSendCallbacks());
          self.collectionViews.set(collectionName, ret);
        }
        return ret;
      },
      added(subscriptionHandle, collectionName, id, fields) {
        if (this.server.getPublicationStrategy(collectionName).useCollectionView) {
          const view = this.getCollectionView(collectionName);
          view.added(subscriptionHandle, id, fields);
        } else {
          this.sendAdded(collectionName, id, fields);
        }
      },
      removed(subscriptionHandle, collectionName, id) {
        if (this.server.getPublicationStrategy(collectionName).useCollectionView) {
          const view = this.getCollectionView(collectionName);
          view.removed(subscriptionHandle, id);
          if (view.isEmpty()) {
            this.collectionViews.delete(collectionName);
          }
        } else {
          this.sendRemoved(collectionName, id);
        }
      },
      changed(subscriptionHandle, collectionName, id, fields) {
        if (this.server.getPublicationStrategy(collectionName).useCollectionView) {
          const view = this.getCollectionView(collectionName);
          view.changed(subscriptionHandle, id, fields);
        } else {
          this.sendChanged(collectionName, id, fields);
        }
      },
      startUniversalSubs: function () {
        var self = this;
        // Make a shallow copy of the set of universal handlers and start them. If
        // additional universal publishers start while we're running them (due to
        // yielding), they will run separately as part of Server.publish.
        var handlers = [...self.server.universal_publish_handlers];
        handlers.forEach(function (handler) {
          self._startSubscription(handler);
        });
      },
      // Destroy this session and unregister it at the server.
      close: function () {
        var self = this;

        // Destroy this session, even if it's not registered at the
        // server. Stop all processing and tear everything down. If a socket
        // was attached, close it.

        // Already destroyed.
        if (!self.inQueue) return;

        // Drop the merge box data immediately.
        self.inQueue = null;
        self.collectionViews = new Map();
        if (self.heartbeat) {
          self.heartbeat.stop();
          self.heartbeat = null;
        }
        if (self.socket) {
          self.socket.close();
          self.socket._meteorSession = null;
        }
        Package['facts-base'] && Package['facts-base'].Facts.incrementServerFact("livedata", "sessions", -1);
        Meteor.defer(function () {
          // Stop callbacks can yield, so we defer this on close.
          // sub._isDeactivated() detects that we set inQueue to null and
          // treats it as semi-deactivated (it will ignore incoming callbacks, etc).
          self._deactivateAllSubscriptions();

          // Defer calling the close callbacks, so that the caller closing
          // the session isn't waiting for all the callbacks to complete.
          self._closeCallbacks.forEach(function (callback) {
            callback();
          });
        });

        // Unregister the session.
        self.server._removeSession(self);
      },
      // Send a message (doing nothing if no socket is connected right now).
      // It should be a JSON object (it will be stringified).
      send: function (msg) {
        const self = this;
        if (self.socket) {
          if (Meteor._printSentDDP) Meteor._debug("Sent DDP", DDPCommon.stringifyDDP(msg));
          self.socket.send(DDPCommon.stringifyDDP(msg));
        }
      },
      // Send a connection error.
      sendError: function (reason, offendingMessage) {
        var self = this;
        var msg = {
          msg: 'error',
          reason: reason
        };
        if (offendingMessage) msg.offendingMessage = offendingMessage;
        self.send(msg);
      },
      // Process 'msg' as an incoming message. As a guard against
      // race conditions during reconnection, ignore the message if
      // 'socket' is not the currently connected socket.
      //
      // We run the messages from the client one at a time, in the order
      // given by the client. The message handler is passed an idempotent
      // function 'unblock' which it may call to allow other messages to
      // begin running in parallel in another fiber (for example, a method
      // that wants to yield). Otherwise, it is automatically unblocked
      // when it returns.
      //
      // Actually, we don't have to 'totally order' the messages in this
      // way, but it's the easiest thing that's correct. (unsub needs to
      // be ordered against sub, methods need to be ordered against each
      // other).
      processMessage: function (msg_in) {
        var self = this;
        if (!self.inQueue)
          // we have been destroyed.
          return;

        // Respond to ping and pong messages immediately without queuing.
        // If the negotiated DDP version is "pre1" which didn't support
        // pings, preserve the "pre1" behavior of responding with a "bad
        // request" for the unknown messages.
        //
        // Fibers are needed because heartbeats use Meteor.setTimeout, which
        // needs a Fiber. We could actually use regular setTimeout and avoid
        // these new fibers, but it is easier to just make everything use
        // Meteor.setTimeout and not think too hard.
        //
        // Any message counts as receiving a pong, as it demonstrates that
        // the client is still alive.
        if (self.heartbeat) {
          self.heartbeat.messageReceived();
        }
        ;
        if (self.version !== 'pre1' && msg_in.msg === 'ping') {
          if (self._respondToPings) self.send({
            msg: "pong",
            id: msg_in.id
          });
          return;
        }
        if (self.version !== 'pre1' && msg_in.msg === 'pong') {
          // Since everything is a pong, there is nothing to do
          return;
        }
        self.inQueue.push(msg_in);
        if (self.workerRunning) return;
        self.workerRunning = true;
        var processNext = function () {
          var msg = self.inQueue && self.inQueue.shift();
          if (!msg) {
            self.workerRunning = false;
            return;
          }
          function runHandlers() {
            var blocked = true;
            var unblock = function () {
              if (!blocked) return; // idempotent
              blocked = false;
              setImmediate(processNext);
            };
            self.server.onMessageHook.each(function (callback) {
              callback(msg, self);
              return true;
            });
            if (msg.msg in self.protocol_handlers) {
              const result = self.protocol_handlers[msg.msg].call(self, msg, unblock);
              if (Meteor._isPromise(result)) {
                result.finally(() => unblock());
              } else {
                unblock();
              }
            } else {
              self.sendError('Bad request', msg);
              unblock(); // in case the handler didn't already do it
            }
          }
          runHandlers();
        };
        processNext();
      },
      protocol_handlers: {
        sub: async function (msg, unblock) {
          var self = this;

          // cacheUnblock temporarly, so we can capture it later
          // we will use unblock in current eventLoop, so this is safe
          self.cachedUnblock = unblock;

          // reject malformed messages
          if (typeof msg.id !== "string" || typeof msg.name !== "string" || 'params' in msg && !(msg.params instanceof Array)) {
            self.sendError("Malformed subscription", msg);
            return;
          }
          if (!self.server.publish_handlers[msg.name]) {
            self.send({
              msg: 'nosub',
              id: msg.id,
              error: new Meteor.Error(404, "Subscription '".concat(msg.name, "' not found"))
            });
            return;
          }
          if (self._namedSubs.has(msg.id))
            // subs are idempotent, or rather, they are ignored if a sub
            // with that id already exists. this is important during
            // reconnect.
            return;

          // XXX It'd be much better if we had generic hooks where any package can
          // hook into subscription handling, but in the mean while we special case
          // ddp-rate-limiter package. This is also done for weak requirements to
          // add the ddp-rate-limiter package in case we don't have Accounts. A
          // user trying to use the ddp-rate-limiter must explicitly require it.
          if (Package['ddp-rate-limiter']) {
            var DDPRateLimiter = Package['ddp-rate-limiter'].DDPRateLimiter;
            var rateLimiterInput = {
              userId: self.userId,
              clientAddress: self.connectionHandle.clientAddress,
              type: "subscription",
              name: msg.name,
              connectionId: self.id
            };
            DDPRateLimiter._increment(rateLimiterInput);
            var rateLimitResult = DDPRateLimiter._check(rateLimiterInput);
            if (!rateLimitResult.allowed) {
              self.send({
                msg: 'nosub',
                id: msg.id,
                error: new Meteor.Error('too-many-requests', DDPRateLimiter.getErrorMessage(rateLimitResult), {
                  timeToReset: rateLimitResult.timeToReset
                })
              });
              return;
            }
          }
          var handler = self.server.publish_handlers[msg.name];
          await self._startSubscription(handler, msg.id, msg.params, msg.name);

          // cleaning cached unblock
          self.cachedUnblock = null;
        },
        unsub: function (msg) {
          var self = this;
          self._stopSubscription(msg.id);
        },
        method: async function (msg, unblock) {
          var self = this;

          // Reject malformed messages.
          // For now, we silently ignore unknown attributes,
          // for forwards compatibility.
          if (typeof msg.id !== "string" || typeof msg.method !== "string" || 'params' in msg && !(msg.params instanceof Array) || 'randomSeed' in msg && typeof msg.randomSeed !== "string") {
            self.sendError("Malformed method invocation", msg);
            return;
          }
          var randomSeed = msg.randomSeed || null;

          // Set up to mark the method as satisfied once all observers
          // (and subscriptions) have reacted to any writes that were
          // done.
          var fence = new DDPServer._WriteFence();
          fence.onAllCommitted(function () {
            // Retire the fence so that future writes are allowed.
            // This means that callbacks like timers are free to use
            // the fence, and if they fire before it's armed (for
            // example, because the method waits for them) their
            // writes will be included in the fence.
            fence.retire();
            self.send({
              msg: 'updated',
              methods: [msg.id]
            });
          });

          // Find the handler
          var handler = self.server.method_handlers[msg.method];
          if (!handler) {
            self.send({
              msg: 'result',
              id: msg.id,
              error: new Meteor.Error(404, "Method '".concat(msg.method, "' not found"))
            });
            await fence.arm();
            return;
          }
          var invocation = new DDPCommon.MethodInvocation({
            name: msg.method,
            isSimulation: false,
            userId: self.userId,
            setUserId(userId) {
              return self._setUserId(userId);
            },
            unblock: unblock,
            connection: self.connectionHandle,
            randomSeed: randomSeed,
            fence
          });
          const promise = new Promise((resolve, reject) => {
            // XXX It'd be better if we could hook into method handlers better but
            // for now, we need to check if the ddp-rate-limiter exists since we
            // have a weak requirement for the ddp-rate-limiter package to be added
            // to our application.
            if (Package['ddp-rate-limiter']) {
              var DDPRateLimiter = Package['ddp-rate-limiter'].DDPRateLimiter;
              var rateLimiterInput = {
                userId: self.userId,
                clientAddress: self.connectionHandle.clientAddress,
                type: "method",
                name: msg.method,
                connectionId: self.id
              };
              DDPRateLimiter._increment(rateLimiterInput);
              var rateLimitResult = DDPRateLimiter._check(rateLimiterInput);
              if (!rateLimitResult.allowed) {
                reject(new Meteor.Error("too-many-requests", DDPRateLimiter.getErrorMessage(rateLimitResult), {
                  timeToReset: rateLimitResult.timeToReset
                }));
                return;
              }
            }
            resolve(DDPServer._CurrentWriteFence.withValue(fence, () => DDP._CurrentMethodInvocation.withValue(invocation, () => maybeAuditArgumentChecks(handler, invocation, msg.params, "call to '" + msg.method + "'"))));
          });
          async function finish() {
            await fence.arm();
            unblock();
          }
          const payload = {
            msg: "result",
            id: msg.id
          };
          return promise.then(async result => {
            await finish();
            if (result !== undefined) {
              payload.result = result;
            }
            self.send(payload);
          }, async exception => {
            await finish();
            payload.error = wrapInternalException(exception, "while invoking method '".concat(msg.method, "'"));
            self.send(payload);
          });
        }
      },
      _eachSub: function (f) {
        var self = this;
        self._namedSubs.forEach(f);
        self._universalSubs.forEach(f);
      },
      _diffCollectionViews: function (beforeCVs) {
        var self = this;
        DiffSequence.diffMaps(beforeCVs, self.collectionViews, {
          both: function (collectionName, leftValue, rightValue) {
            rightValue.diff(leftValue);
          },
          rightOnly: function (collectionName, rightValue) {
            rightValue.documents.forEach(function (docView, id) {
              self.sendAdded(collectionName, id, docView.getFields());
            });
          },
          leftOnly: function (collectionName, leftValue) {
            leftValue.documents.forEach(function (doc, id) {
              self.sendRemoved(collectionName, id);
            });
          }
        });
      },
      // Sets the current user id in all appropriate contexts and reruns
      // all subscriptions
      async _setUserId(userId) {
        var self = this;
        if (userId !== null && typeof userId !== "string") throw new Error("setUserId must be called on string or null, not " + typeof userId);

        // Prevent newly-created universal subscriptions from being added to our
        // session. They will be found below when we call startUniversalSubs.
        //
        // (We don't have to worry about named subscriptions, because we only add
        // them when we process a 'sub' message. We are currently processing a
        // 'method' message, and the method did not unblock, because it is illegal
        // to call setUserId after unblock. Thus we cannot be concurrently adding a
        // new named subscription).
        self._dontStartNewUniversalSubs = true;

        // Prevent current subs from updating our collectionViews and call their
        // stop callbacks. This may yield.
        self._eachSub(function (sub) {
          sub._deactivate();
        });

        // All subs should now be deactivated. Stop sending messages to the client,
        // save the state of the published collections, reset to an empty view, and
        // update the userId.
        self._isSending = false;
        var beforeCVs = self.collectionViews;
        self.collectionViews = new Map();
        self.userId = userId;

        // _setUserId is normally called from a Meteor method with
        // DDP._CurrentMethodInvocation set. But DDP._CurrentMethodInvocation is not
        // expected to be set inside a publish function, so we temporary unset it.
        // Inside a publish function DDP._CurrentPublicationInvocation is set.
        await DDP._CurrentMethodInvocation.withValue(undefined, async function () {
          // Save the old named subs, and reset to having no subscriptions.
          var oldNamedSubs = self._namedSubs;
          self._namedSubs = new Map();
          self._universalSubs = [];
          await Promise.all([...oldNamedSubs].map(async _ref => {
            let [subscriptionId, sub] = _ref;
            const newSub = sub._recreate();
            self._namedSubs.set(subscriptionId, newSub);
            // nb: if the handler throws or calls this.error(), it will in fact
            // immediately send its 'nosub'. This is OK, though.
            await newSub._runHandler();
          }));

          // Allow newly-created universal subs to be started on our connection in
          // parallel with the ones we're spinning up here, and spin up universal
          // subs.
          self._dontStartNewUniversalSubs = false;
          self.startUniversalSubs();
        }, {
          name: '_setUserId'
        });

        // Start sending messages again, beginning with the diff from the previous
        // state of the world to the current state. No yields are allowed during
        // this diff, so that other changes cannot interleave.
        Meteor._noYieldsAllowed(function () {
          self._isSending = true;
          self._diffCollectionViews(beforeCVs);
          if (!isEmpty(self._pendingReady)) {
            self.sendReady(self._pendingReady);
            self._pendingReady = [];
          }
        });
      },
      _startSubscription: function (handler, subId, params, name) {
        var self = this;
        var sub = new Subscription(self, handler, subId, params, name);
        let unblockHander = self.cachedUnblock;
        // _startSubscription may call from a lot places
        // so cachedUnblock might be null in somecases
        // assign the cachedUnblock
        sub.unblock = unblockHander || (() => {});
        if (subId) self._namedSubs.set(subId, sub);else self._universalSubs.push(sub);
        return sub._runHandler();
      },
      // Tear down specified subscription
      _stopSubscription: function (subId, error) {
        var self = this;
        var subName = null;
        if (subId) {
          var maybeSub = self._namedSubs.get(subId);
          if (maybeSub) {
            subName = maybeSub._name;
            maybeSub._removeAllDocuments();
            maybeSub._deactivate();
            self._namedSubs.delete(subId);
          }
        }
        var response = {
          msg: 'nosub',
          id: subId
        };
        if (error) {
          response.error = wrapInternalException(error, subName ? "from sub " + subName + " id " + subId : "from sub id " + subId);
        }
        self.send(response);
      },
      // Tear down all subscriptions. Note that this does NOT send removed or nosub
      // messages, since we assume the client is gone.
      _deactivateAllSubscriptions: function () {
        var self = this;
        self._namedSubs.forEach(function (sub, id) {
          sub._deactivate();
        });
        self._namedSubs = new Map();
        self._universalSubs.forEach(function (sub) {
          sub._deactivate();
        });
        self._universalSubs = [];
      },
      // Determine the remote client's IP address, based on the
      // HTTP_FORWARDED_COUNT environment variable representing how many
      // proxies the server is behind.
      _clientAddress: function () {
        var self = this;

        // For the reported client address for a connection to be correct,
        // the developer must set the HTTP_FORWARDED_COUNT environment
        // variable to an integer representing the number of hops they
        // expect in the `x-forwarded-for` header. E.g., set to "1" if the
        // server is behind one proxy.
        //
        // This could be computed once at startup instead of every time.
        var httpForwardedCount = parseInt(process.env['HTTP_FORWARDED_COUNT']) || 0;
        if (httpForwardedCount === 0) return self.socket.remoteAddress;
        var forwardedFor = self.socket.headers["x-forwarded-for"];
        if (!isString(forwardedFor)) return null;
        forwardedFor = forwardedFor.trim().split(/\s*,\s*/);

        // Typically the first value in the `x-forwarded-for` header is
        // the original IP address of the client connecting to the first
        // proxy.  However, the end user can easily spoof the header, in
        // which case the first value(s) will be the fake IP address from
        // the user pretending to be a proxy reporting the original IP
        // address value.  By counting HTTP_FORWARDED_COUNT back from the
        // end of the list, we ensure that we get the IP address being
        // reported by *our* first proxy.

        if (httpForwardedCount < 0 || httpForwardedCount > forwardedFor.length) return null;
        return forwardedFor[forwardedFor.length - httpForwardedCount];
      }
    });

    /******************************************************************************/
    /* Subscription                                                               */
    /******************************************************************************/

    // Ctor for a sub handle: the input to each publish function

    // Instance name is this because it's usually referred to as this inside a
    // publish
    /**
     * @summary The server's side of a subscription
     * @class Subscription
     * @instanceName this
     * @showInstanceName true
     */
    var Subscription = function (session, handler, subscriptionId, params, name) {
      var self = this;
      self._session = session; // type is Session

      /**
       * @summary Access inside the publish function. The incoming [connection](#meteor_onconnection) for this subscription.
       * @locus Server
       * @name  connection
       * @memberOf Subscription
       * @instance
       */
      self.connection = session.connectionHandle; // public API object

      self._handler = handler;

      // My subscription ID (generated by client, undefined for universal subs).
      self._subscriptionId = subscriptionId;
      // Undefined for universal subs
      self._name = name;
      self._params = params || [];

      // Only named subscriptions have IDs, but we need some sort of string
      // internally to keep track of all subscriptions inside
      // SessionDocumentViews. We use this subscriptionHandle for that.
      if (self._subscriptionId) {
        self._subscriptionHandle = 'N' + self._subscriptionId;
      } else {
        self._subscriptionHandle = 'U' + Random.id();
      }

      // Has _deactivate been called?
      self._deactivated = false;

      // Stop callbacks to g/c this sub.  called w/ zero arguments.
      self._stopCallbacks = [];

      // The set of (collection, documentid) that this subscription has
      // an opinion about.
      self._documents = new Map();

      // Remember if we are ready.
      self._ready = false;

      // Part of the public API: the user of this sub.

      /**
       * @summary Access inside the publish function. The id of the logged-in user, or `null` if no user is logged in.
       * @locus Server
       * @memberOf Subscription
       * @name  userId
       * @instance
       */
      self.userId = session.userId;

      // For now, the id filter is going to default to
      // the to/from DDP methods on MongoID, to
      // specifically deal with mongo/minimongo ObjectIds.

      // Later, you will be able to make this be "raw"
      // if you want to publish a collection that you know
      // just has strings for keys and no funny business, to
      // a DDP consumer that isn't minimongo.

      self._idFilter = {
        idStringify: MongoID.idStringify,
        idParse: MongoID.idParse
      };
      Package['facts-base'] && Package['facts-base'].Facts.incrementServerFact("livedata", "subscriptions", 1);
    };
    Object.assign(Subscription.prototype, {
      _runHandler: async function () {
        // XXX should we unblock() here? Either before running the publish
        // function, or before running _publishCursor.
        //
        // Right now, each publish function blocks all future publishes and
        // methods waiting on data from Mongo (or whatever else the function
        // blocks on). This probably slows page load in common cases.

        if (!this.unblock) {
          this.unblock = () => {};
        }
        const self = this;
        let resultOrThenable = null;
        try {
          resultOrThenable = DDP._CurrentPublicationInvocation.withValue(self, () => maybeAuditArgumentChecks(self._handler, self, EJSON.clone(self._params),
          // It's OK that this would look weird for universal subscriptions,
          // because they have no arguments so there can never be an
          // audit-argument-checks failure.
          "publisher '" + self._name + "'"), {
            name: self._name
          });
        } catch (e) {
          self.error(e);
          return;
        }

        // Did the handler call this.error or this.stop?
        if (self._isDeactivated()) return;

        // Both conventional and async publish handler functions are supported.
        // If an object is returned with a then() function, it is either a promise
        // or thenable and will be resolved asynchronously.
        const isThenable = resultOrThenable && typeof resultOrThenable.then === 'function';
        if (isThenable) {
          try {
            await self._publishHandlerResult(await resultOrThenable);
          } catch (e) {
            self.error(e);
          }
        } else {
          await self._publishHandlerResult(resultOrThenable);
        }
      },
      async _publishHandlerResult(res) {
        // SPECIAL CASE: Instead of writing their own callbacks that invoke
        // this.added/changed/ready/etc, the user can just return a collection
        // cursor or array of cursors from the publish function; we call their
        // _publishCursor method which starts observing the cursor and publishes the
        // results. Note that _publishCursor does NOT call ready().
        //
        // XXX This uses an undocumented interface which only the Mongo cursor
        // interface publishes. Should we make this interface public and encourage
        // users to implement it themselves? Arguably, it's unnecessary; users can
        // already write their own functions like
        //   var publishMyReactiveThingy = function (name, handler) {
        //     Meteor.publish(name, function () {
        //       var reactiveThingy = handler();
        //       reactiveThingy.publishMe();
        //     });
        //   };

        var self = this;
        var isCursor = function (c) {
          return c && c._publishCursor;
        };
        if (isCursor(res)) {
          try {
            await res._publishCursor(self);
          } catch (e) {
            self.error(e);
            return;
          }
          // _publishCursor only returns after the initial added callbacks have run.
          // mark subscription as ready.
          self.ready();
        } else if (Array.isArray(res)) {
          // Check all the elements are cursors
          if (!res.every(isCursor)) {
            self.error(new Error("Publish function returned an array of non-Cursors"));
            return;
          }
          // Find duplicate collection names
          // XXX we should support overlapping cursors, but that would require the
          // merge box to allow overlap within a subscription
          var collectionNames = {};
          for (var i = 0; i < res.length; ++i) {
            var collectionName = res[i]._getCollectionName();
            if (collectionNames[collectionName]) {
              self.error(new Error("Publish function returned multiple cursors for collection " + collectionName));
              return;
            }
            collectionNames[collectionName] = true;
          }
          try {
            await Promise.all(res.map(cur => cur._publishCursor(self)));
          } catch (e) {
            self.error(e);
            return;
          }
          self.ready();
        } else if (res) {
          // Truthy values other than cursors or arrays are probably a
          // user mistake (possible returning a Mongo document via, say,
          // `coll.findOne()`).
          self.error(new Error("Publish function can only return a Cursor or " + "an array of Cursors"));
        }
      },
      // This calls all stop callbacks and prevents the handler from updating any
      // SessionCollectionViews further. It's used when the user unsubscribes or
      // disconnects, as well as during setUserId re-runs. It does *NOT* send
      // removed messages for the published objects; if that is necessary, call
      // _removeAllDocuments first.
      _deactivate: function () {
        var self = this;
        if (self._deactivated) return;
        self._deactivated = true;
        self._callStopCallbacks();
        Package['facts-base'] && Package['facts-base'].Facts.incrementServerFact("livedata", "subscriptions", -1);
      },
      _callStopCallbacks: function () {
        var self = this;
        // Tell listeners, so they can clean up
        var callbacks = self._stopCallbacks;
        self._stopCallbacks = [];
        callbacks.forEach(function (callback) {
          callback();
        });
      },
      // Send remove messages for every document.
      _removeAllDocuments: function () {
        var self = this;
        Meteor._noYieldsAllowed(function () {
          self._documents.forEach(function (collectionDocs, collectionName) {
            collectionDocs.forEach(function (strId) {
              self.removed(collectionName, self._idFilter.idParse(strId));
            });
          });
        });
      },
      // Returns a new Subscription for the same session with the same
      // initial creation parameters. This isn't a clone: it doesn't have
      // the same _documents cache, stopped state or callbacks; may have a
      // different _subscriptionHandle, and gets its userId from the
      // session, not from this object.
      _recreate: function () {
        var self = this;
        return new Subscription(self._session, self._handler, self._subscriptionId, self._params, self._name);
      },
      /**
       * @summary Call inside the publish function.  Stops this client's subscription, triggering a call on the client to the `onStop` callback passed to [`Meteor.subscribe`](#meteor_subscribe), if any. If `error` is not a [`Meteor.Error`](#meteor_error), it will be [sanitized](#meteor_error).
       * @locus Server
       * @param {Error} error The error to pass to the client.
       * @instance
       * @memberOf Subscription
       */
      error: function (error) {
        var self = this;
        if (self._isDeactivated()) return;
        self._session._stopSubscription(self._subscriptionId, error);
      },
      // Note that while our DDP client will notice that you've called stop() on the
      // server (and clean up its _subscriptions table) we don't actually provide a
      // mechanism for an app to notice this (the subscribe onError callback only
      // triggers if there is an error).

      /**
       * @summary Call inside the publish function.  Stops this client's subscription and invokes the client's `onStop` callback with no error.
       * @locus Server
       * @instance
       * @memberOf Subscription
       */
      stop: function () {
        var self = this;
        if (self._isDeactivated()) return;
        self._session._stopSubscription(self._subscriptionId);
      },
      /**
       * @summary Call inside the publish function.  Registers a callback function to run when the subscription is stopped.
       * @locus Server
       * @memberOf Subscription
       * @instance
       * @param {Function} func The callback function
       */
      onStop: function (callback) {
        var self = this;
        callback = Meteor.bindEnvironment(callback, 'onStop callback', self);
        if (self._isDeactivated()) callback();else self._stopCallbacks.push(callback);
      },
      // This returns true if the sub has been deactivated, *OR* if the session was
      // destroyed but the deferred call to _deactivateAllSubscriptions hasn't
      // happened yet.
      _isDeactivated: function () {
        var self = this;
        return self._deactivated || self._session.inQueue === null;
      },
      /**
       * @summary Call inside the publish function.  Informs the subscriber that a document has been added to the record set.
       * @locus Server
       * @memberOf Subscription
       * @instance
       * @param {String} collection The name of the collection that contains the new document.
       * @param {String} id The new document's ID.
       * @param {Object} fields The fields in the new document.  If `_id` is present it is ignored.
       */
      added(collectionName, id, fields) {
        if (this._isDeactivated()) return;
        id = this._idFilter.idStringify(id);
        if (this._session.server.getPublicationStrategy(collectionName).doAccountingForCollection) {
          let ids = this._documents.get(collectionName);
          if (ids == null) {
            ids = new Set();
            this._documents.set(collectionName, ids);
          }
          ids.add(id);
        }
        this._session.added(this._subscriptionHandle, collectionName, id, fields);
      },
      /**
       * @summary Call inside the publish function.  Informs the subscriber that a document in the record set has been modified.
       * @locus Server
       * @memberOf Subscription
       * @instance
       * @param {String} collection The name of the collection that contains the changed document.
       * @param {String} id The changed document's ID.
       * @param {Object} fields The fields in the document that have changed, together with their new values.  If a field is not present in `fields` it was left unchanged; if it is present in `fields` and has a value of `undefined` it was removed from the document.  If `_id` is present it is ignored.
       */
      changed(collectionName, id, fields) {
        if (this._isDeactivated()) return;
        id = this._idFilter.idStringify(id);
        this._session.changed(this._subscriptionHandle, collectionName, id, fields);
      },
      /**
       * @summary Call inside the publish function.  Informs the subscriber that a document has been removed from the record set.
       * @locus Server
       * @memberOf Subscription
       * @instance
       * @param {String} collection The name of the collection that the document has been removed from.
       * @param {String} id The ID of the document that has been removed.
       */
      removed(collectionName, id) {
        if (this._isDeactivated()) return;
        id = this._idFilter.idStringify(id);
        if (this._session.server.getPublicationStrategy(collectionName).doAccountingForCollection) {
          // We don't bother to delete sets of things in a collection if the
          // collection is empty.  It could break _removeAllDocuments.
          this._documents.get(collectionName).delete(id);
        }
        this._session.removed(this._subscriptionHandle, collectionName, id);
      },
      /**
       * @summary Call inside the publish function.  Informs the subscriber that an initial, complete snapshot of the record set has been sent.  This will trigger a call on the client to the `onReady` callback passed to  [`Meteor.subscribe`](#meteor_subscribe), if any.
       * @locus Server
       * @memberOf Subscription
       * @instance
       */
      ready: function () {
        var self = this;
        if (self._isDeactivated()) return;
        if (!self._subscriptionId) return; // Unnecessary but ignored for universal sub
        if (!self._ready) {
          self._session.sendReady([self._subscriptionId]);
          self._ready = true;
        }
      }
    });

    /******************************************************************************/
    /* Server                                                                     */
    /******************************************************************************/

    Server = function () {
      let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var self = this;

      // The default heartbeat interval is 30 seconds on the server and 35
      // seconds on the client.  Since the client doesn't need to send a
      // ping as long as it is receiving pings, this means that pings
      // normally go from the server to the client.
      //
      // Note: Troposphere depends on the ability to mutate
      // Meteor.server.options.heartbeatTimeout! This is a hack, but it's life.
      self.options = _objectSpread({
        heartbeatInterval: 15000,
        heartbeatTimeout: 15000,
        // For testing, allow responding to pings to be disabled.
        respondToPings: true,
        defaultPublicationStrategy: publicationStrategies.SERVER_MERGE
      }, options);

      // Map of callbacks to call when a new connection comes in to the
      // server and completes DDP version negotiation. Use an object instead
      // of an array so we can safely remove one from the list while
      // iterating over it.
      self.onConnectionHook = new Hook({
        debugPrintExceptions: "onConnection callback"
      });

      // Map of callbacks to call when a new message comes in.
      self.onMessageHook = new Hook({
        debugPrintExceptions: "onMessage callback"
      });
      self.publish_handlers = {};
      self.universal_publish_handlers = [];
      self.method_handlers = {};
      self._publicationStrategies = {};
      self.sessions = new Map(); // map from id to session

      self.stream_server = new StreamServer();
      self.stream_server.register(function (socket) {
        // socket implements the SockJSConnection interface
        socket._meteorSession = null;
        var sendError = function (reason, offendingMessage) {
          var msg = {
            msg: 'error',
            reason: reason
          };
          if (offendingMessage) msg.offendingMessage = offendingMessage;
          socket.send(DDPCommon.stringifyDDP(msg));
        };
        socket.on('data', function (raw_msg) {
          if (Meteor._printReceivedDDP) {
            Meteor._debug("Received DDP", raw_msg);
          }
          try {
            try {
              var msg = DDPCommon.parseDDP(raw_msg);
            } catch (err) {
              sendError('Parse error');
              return;
            }
            if (msg === null || !msg.msg) {
              sendError('Bad request', msg);
              return;
            }
            if (msg.msg === 'connect') {
              if (socket._meteorSession) {
                sendError("Already connected", msg);
                return;
              }
              self._handleConnect(socket, msg);
              return;
            }
            if (!socket._meteorSession) {
              sendError('Must connect first', msg);
              return;
            }
            socket._meteorSession.processMessage(msg);
          } catch (e) {
            // XXX print stack nicely
            Meteor._debug("Internal exception while processing message", msg, e);
          }
        });
        socket.on('close', function () {
          if (socket._meteorSession) {
            socket._meteorSession.close();
          }
        });
      });
    };
    Object.assign(Server.prototype, {
      /**
       * @summary Register a callback to be called when a new DDP connection is made to the server.
       * @locus Server
       * @param {function} callback The function to call when a new DDP connection is established.
       * @memberOf Meteor
       * @importFromPackage meteor
       */
      onConnection: function (fn) {
        var self = this;
        return self.onConnectionHook.register(fn);
      },
      /**
       * @summary Set publication strategy for the given collection. Publications strategies are available from `DDPServer.publicationStrategies`. You call this method from `Meteor.server`, like `Meteor.server.setPublicationStrategy()`
       * @locus Server
       * @alias setPublicationStrategy
       * @param collectionName {String}
       * @param strategy {{useCollectionView: boolean, doAccountingForCollection: boolean}}
       * @memberOf Meteor.server
       * @importFromPackage meteor
       */
      setPublicationStrategy(collectionName, strategy) {
        if (!Object.values(publicationStrategies).includes(strategy)) {
          throw new Error("Invalid merge strategy: ".concat(strategy, " \n        for collection ").concat(collectionName));
        }
        this._publicationStrategies[collectionName] = strategy;
      },
      /**
       * @summary Gets the publication strategy for the requested collection. You call this method from `Meteor.server`, like `Meteor.server.getPublicationStrategy()`
       * @locus Server
       * @alias getPublicationStrategy
       * @param collectionName {String}
       * @memberOf Meteor.server
       * @importFromPackage meteor
       * @return {{useCollectionView: boolean, doAccountingForCollection: boolean}}
       */
      getPublicationStrategy(collectionName) {
        return this._publicationStrategies[collectionName] || this.options.defaultPublicationStrategy;
      },
      /**
       * @summary Register a callback to be called when a new DDP message is received.
       * @locus Server
       * @param {function} callback The function to call when a new DDP message is received.
       * @memberOf Meteor
       * @importFromPackage meteor
       */
      onMessage: function (fn) {
        var self = this;
        return self.onMessageHook.register(fn);
      },
      _handleConnect: function (socket, msg) {
        var self = this;

        // The connect message must specify a version and an array of supported
        // versions, and it must claim to support what it is proposing.
        if (!(typeof msg.version === 'string' && Array.isArray(msg.support) && msg.support.every(isString) && msg.support.includes(msg.version))) {
          socket.send(DDPCommon.stringifyDDP({
            msg: 'failed',
            version: DDPCommon.SUPPORTED_DDP_VERSIONS[0]
          }));
          socket.close();
          return;
        }

        // In the future, handle session resumption: something like:
        //  socket._meteorSession = self.sessions[msg.session]
        var version = calculateVersion(msg.support, DDPCommon.SUPPORTED_DDP_VERSIONS);
        if (msg.version !== version) {
          // The best version to use (according to the client's stated preferences)
          // is not the one the client is trying to use. Inform them about the best
          // version to use.
          socket.send(DDPCommon.stringifyDDP({
            msg: 'failed',
            version: version
          }));
          socket.close();
          return;
        }

        // Yay, version matches! Create a new session.
        // Note: Troposphere depends on the ability to mutate
        // Meteor.server.options.heartbeatTimeout! This is a hack, but it's life.
        socket._meteorSession = new Session(self, version, socket, self.options);
        self.sessions.set(socket._meteorSession.id, socket._meteorSession);
        self.onConnectionHook.each(function (callback) {
          if (socket._meteorSession) callback(socket._meteorSession.connectionHandle);
          return true;
        });
      },
      /**
       * Register a publish handler function.
       *
       * @param name {String} identifier for query
       * @param handler {Function} publish handler
       * @param options {Object}
       *
       * Server will call handler function on each new subscription,
       * either when receiving DDP sub message for a named subscription, or on
       * DDP connect for a universal subscription.
       *
       * If name is null, this will be a subscription that is
       * automatically established and permanently on for all connected
       * client, instead of a subscription that can be turned on and off
       * with subscribe().
       *
       * options to contain:
       *  - (mostly internal) is_auto: true if generated automatically
       *    from an autopublish hook. this is for cosmetic purposes only
       *    (it lets us determine whether to print a warning suggesting
       *    that you turn off autopublish).
       */

      /**
       * @summary Publish a record set.
       * @memberOf Meteor
       * @importFromPackage meteor
       * @locus Server
       * @param {String|Object} name If String, name of the record set.  If Object, publications Dictionary of publish functions by name.  If `null`, the set has no name, and the record set is automatically sent to all connected clients.
       * @param {Function} func Function called on the server each time a client subscribes.  Inside the function, `this` is the publish handler object, described below.  If the client passed arguments to `subscribe`, the function is called with the same arguments.
       */
      publish: function (name, handler, options) {
        var self = this;
        if (!isObject(name)) {
          options = options || {};
          if (name && name in self.publish_handlers) {
            Meteor._debug("Ignoring duplicate publish named '" + name + "'");
            return;
          }
          if (Package.autopublish && !options.is_auto) {
            // They have autopublish on, yet they're trying to manually
            // pick stuff to publish. They probably should turn off
            // autopublish. (This check isn't perfect -- if you create a
            // publish before you turn on autopublish, it won't catch
            // it, but this will definitely handle the simple case where
            // you've added the autopublish package to your app, and are
            // calling publish from your app code).
            if (!self.warned_about_autopublish) {
              self.warned_about_autopublish = true;
              Meteor._debug("** You've set up some data subscriptions with Meteor.publish(), but\n" + "** you still have autopublish turned on. Because autopublish is still\n" + "** on, your Meteor.publish() calls won't have much effect. All data\n" + "** will still be sent to all clients.\n" + "**\n" + "** Turn off autopublish by removing the autopublish package:\n" + "**\n" + "**   $ meteor remove autopublish\n" + "**\n" + "** .. and make sure you have Meteor.publish() and Meteor.subscribe() calls\n" + "** for each collection that you want clients to see.\n");
            }
          }
          if (name) self.publish_handlers[name] = handler;else {
            self.universal_publish_handlers.push(handler);
            // Spin up the new publisher on any existing session too. Run each
            // session's subscription in a new Fiber, so that there's no change for
            // self.sessions to change while we're running this loop.
            self.sessions.forEach(function (session) {
              if (!session._dontStartNewUniversalSubs) {
                session._startSubscription(handler);
              }
            });
          }
        } else {
          Object.entries(name).forEach(function (_ref2) {
            let [key, value] = _ref2;
            self.publish(key, value, {});
          });
        }
      },
      _removeSession: function (session) {
        var self = this;
        self.sessions.delete(session.id);
      },
      /**
       * @summary Tells if the method call came from a call or a callAsync.
       * @locus Anywhere
       * @memberOf Meteor
       * @importFromPackage meteor
       * @returns boolean
       */
      isAsyncCall: function () {
        return DDP._CurrentMethodInvocation._isCallAsyncMethodRunning();
      },
      /**
       * @summary Defines functions that can be invoked over the network by clients.
       * @locus Anywhere
       * @param {Object} methods Dictionary whose keys are method names and values are functions.
       * @memberOf Meteor
       * @importFromPackage meteor
       */
      methods: function (methods) {
        var self = this;
        Object.entries(methods).forEach(function (_ref3) {
          let [name, func] = _ref3;
          if (typeof func !== 'function') throw new Error("Method '" + name + "' must be a function");
          if (self.method_handlers[name]) throw new Error("A method named '" + name + "' is already defined");
          self.method_handlers[name] = func;
        });
      },
      call: function (name) {
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }
        if (args.length && typeof args[args.length - 1] === "function") {
          // If it's a function, the last argument is the result callback, not
          // a parameter to the remote method.
          var callback = args.pop();
        }
        return this.apply(name, args, callback);
      },
      // A version of the call method that always returns a Promise.
      callAsync: function (name) {
        var _args$;
        for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }
        const options = (_args$ = args[0]) !== null && _args$ !== void 0 && _args$.hasOwnProperty('returnStubValue') ? args.shift() : {};
        DDP._CurrentMethodInvocation._setCallAsyncMethodRunning(true);
        const promise = new Promise((resolve, reject) => {
          DDP._CurrentCallAsyncInvocation._set({
            name,
            hasCallAsyncParent: true
          });
          this.applyAsync(name, args, _objectSpread({
            isFromCallAsync: true
          }, options)).then(resolve).catch(reject).finally(() => {
            DDP._CurrentCallAsyncInvocation._set();
          });
        });
        return promise.finally(() => DDP._CurrentMethodInvocation._setCallAsyncMethodRunning(false));
      },
      apply: function (name, args, options, callback) {
        // We were passed 3 arguments. They may be either (name, args, options)
        // or (name, args, callback)
        if (!callback && typeof options === 'function') {
          callback = options;
          options = {};
        } else {
          options = options || {};
        }
        const promise = this.applyAsync(name, args, options);

        // Return the result in whichever way the caller asked for it. Note that we
        // do NOT block on the write fence in an analogous way to how the client
        // blocks on the relevant data being visible, so you are NOT guaranteed that
        // cursor observe callbacks have fired when your callback is invoked. (We
        // can change this if there's a real use case).
        if (callback) {
          promise.then(result => callback(undefined, result), exception => callback(exception));
        } else {
          return promise;
        }
      },
      // @param options {Optional Object}
      applyAsync: function (name, args, options) {
        // Run the handler
        var handler = this.method_handlers[name];
        if (!handler) {
          return Promise.reject(new Meteor.Error(404, "Method '".concat(name, "' not found")));
        }
        // If this is a method call from within another method or publish function,
        // get the user state from the outer method or publish function, otherwise
        // don't allow setUserId to be called
        var userId = null;
        let setUserId = () => {
          throw new Error("Can't call setUserId on a server initiated method call");
        };
        var connection = null;
        var currentMethodInvocation = DDP._CurrentMethodInvocation.get();
        var currentPublicationInvocation = DDP._CurrentPublicationInvocation.get();
        var randomSeed = null;
        if (currentMethodInvocation) {
          userId = currentMethodInvocation.userId;
          setUserId = userId => currentMethodInvocation.setUserId(userId);
          connection = currentMethodInvocation.connection;
          randomSeed = DDPCommon.makeRpcSeed(currentMethodInvocation, name);
        } else if (currentPublicationInvocation) {
          userId = currentPublicationInvocation.userId;
          setUserId = userId => currentPublicationInvocation._session._setUserId(userId);
          connection = currentPublicationInvocation.connection;
        }
        var invocation = new DDPCommon.MethodInvocation({
          isSimulation: false,
          userId,
          setUserId,
          connection,
          randomSeed
        });
        return new Promise((resolve, reject) => {
          let result;
          try {
            result = DDP._CurrentMethodInvocation.withValue(invocation, () => maybeAuditArgumentChecks(handler, invocation, EJSON.clone(args), "internal call to '" + name + "'"));
          } catch (e) {
            return reject(e);
          }
          if (!Meteor._isPromise(result)) {
            return resolve(result);
          }
          result.then(r => resolve(r)).catch(reject);
        }).then(EJSON.clone);
      },
      _urlForSession: function (sessionId) {
        var self = this;
        var session = self.sessions.get(sessionId);
        if (session) return session._socketUrl;else return null;
      }
    });
    var calculateVersion = function (clientSupportedVersions, serverSupportedVersions) {
      var correctVersion = clientSupportedVersions.find(function (version) {
        return serverSupportedVersions.includes(version);
      });
      if (!correctVersion) {
        correctVersion = serverSupportedVersions[0];
      }
      return correctVersion;
    };
    DDPServer._calculateVersion = calculateVersion;

    // "blind" exceptions other than those that were deliberately thrown to signal
    // errors to the client
    var wrapInternalException = function (exception, context) {
      if (!exception) return exception;

      // To allow packages to throw errors intended for the client but not have to
      // depend on the Meteor.Error class, `isClientSafe` can be set to true on any
      // error before it is thrown.
      if (exception.isClientSafe) {
        if (!(exception instanceof Meteor.Error)) {
          const originalMessage = exception.message;
          exception = new Meteor.Error(exception.error, exception.reason, exception.details);
          exception.message = originalMessage;
        }
        return exception;
      }

      // Tests can set the '_expectedByTest' flag on an exception so it won't go to
      // the server log.
      if (!exception._expectedByTest) {
        Meteor._debug("Exception " + context, exception.stack);
        if (exception.sanitizedError) {
          Meteor._debug("Sanitized and reported to the client as:", exception.sanitizedError);
          Meteor._debug();
        }
      }

      // Did the error contain more details that could have been useful if caught in
      // server code (or if thrown from non-client-originated code), but also
      // provided a "sanitized" version with more context than 500 Internal server error? Use that.
      if (exception.sanitizedError) {
        if (exception.sanitizedError.isClientSafe) return exception.sanitizedError;
        Meteor._debug("Exception " + context + " provides a sanitizedError that " + "does not have isClientSafe property set; ignoring");
      }
      return new Meteor.Error(500, "Internal server error");
    };

    // Audit argument checks, if the audit-argument-checks package exists (it is a
    // weak dependency of this package).
    var maybeAuditArgumentChecks = function (f, context, args, description) {
      args = args || [];
      if (Package['audit-argument-checks']) {
        return Match._failIfArgumentsAreNotAllChecked(f, context, args, description);
      }
      return f.apply(context, args);
    };
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"writefence.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ddp-server/writefence.js                                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
DDPServer._WriteFence = class {
  constructor() {
    this.armed = false;
    this.fired = false;
    this.retired = false;
    this.outstanding_writes = 0;
    this.before_fire_callbacks = [];
    this.completion_callbacks = [];
  }
  beginWrite() {
    if (this.retired) {
      return {
        committed: () => {}
      };
    }
    if (this.fired) {
      throw new Error("fence has already activated -- too late to add writes");
    }
    this.outstanding_writes++;
    let committed = false;
    return {
      committed: async () => {
        if (committed) {
          throw new Error("committed called twice on the same write");
        }
        committed = true;
        this.outstanding_writes--;
        await this._maybeFire();
      }
    };
  }
  arm() {
    if (this === DDPServer._getCurrentFence()) {
      throw Error("Can't arm the current fence");
    }
    this.armed = true;
    return this._maybeFire();
  }
  onBeforeFire(func) {
    if (this.fired) {
      throw new Error("fence has already activated -- too late to add a callback");
    }
    this.before_fire_callbacks.push(func);
  }
  onAllCommitted(func) {
    if (this.fired) {
      throw new Error("fence has already activated -- too late to add a callback");
    }
    this.completion_callbacks.push(func);
  }
  async _armAndWait() {
    let resolver;
    const returnValue = new Promise(r => resolver = r);
    this.onAllCommitted(resolver);
    await this.arm();
    return returnValue;
  }
  armAndWait() {
    return this._armAndWait();
  }
  async _maybeFire() {
    if (this.fired) {
      throw new Error("write fence already activated?");
    }
    if (!this.armed || this.outstanding_writes > 0) {
      return;
    }
    const invokeCallback = async func => {
      try {
        await func(this);
      } catch (err) {
        Meteor._debug("exception in write fence callback:", err);
      }
    };
    this.outstanding_writes++;

    // Process all before_fire callbacks in parallel
    const beforeCallbacks = [...this.before_fire_callbacks];
    this.before_fire_callbacks = [];
    await Promise.all(beforeCallbacks.map(cb => invokeCallback(cb)));
    this.outstanding_writes--;
    if (this.outstanding_writes === 0) {
      this.fired = true;
      // Process all completion callbacks in parallel
      const callbacks = [...this.completion_callbacks];
      this.completion_callbacks = [];
      await Promise.all(callbacks.map(cb => invokeCallback(cb)));
    }
  }
  retire() {
    if (!this.fired) {
      throw new Error("Can't retire a fence that hasn't fired.");
    }
    this.retired = true;
  }
};
DDPServer._CurrentWriteFence = new Meteor.EnvironmentVariable();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"crossbar.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ddp-server/crossbar.js                                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
// A "crossbar" is a class that provides structured notification registration.
// See _match for the definition of how a notification matches a trigger.
// All notifications and triggers must have a string key named 'collection'.

DDPServer._Crossbar = function (options) {
  var self = this;
  options = options || {};
  self.nextId = 1;
  // map from collection name (string) -> listener id -> object. each object has
  // keys 'trigger', 'callback'.  As a hack, the empty string means "no
  // collection".
  self.listenersByCollection = {};
  self.listenersByCollectionCount = {};
  self.factPackage = options.factPackage || "livedata";
  self.factName = options.factName || null;
};
Object.assign(DDPServer._Crossbar.prototype, {
  // msg is a trigger or a notification
  _collectionForMessage: function (msg) {
    var self = this;
    if (!('collection' in msg)) {
      return '';
    } else if (typeof msg.collection === 'string') {
      if (msg.collection === '') throw Error("Message has empty collection!");
      return msg.collection;
    } else {
      throw Error("Message has non-string collection!");
    }
  },
  // Listen for notification that match 'trigger'. A notification
  // matches if it has the key-value pairs in trigger as a
  // subset. When a notification matches, call 'callback', passing
  // the actual notification.
  //
  // Returns a listen handle, which is an object with a method
  // stop(). Call stop() to stop listening.
  //
  // XXX It should be legal to call fire() from inside a listen()
  // callback?
  listen: function (trigger, callback) {
    var self = this;
    var id = self.nextId++;
    var collection = self._collectionForMessage(trigger);
    var record = {
      trigger: EJSON.clone(trigger),
      callback: callback
    };
    if (!(collection in self.listenersByCollection)) {
      self.listenersByCollection[collection] = {};
      self.listenersByCollectionCount[collection] = 0;
    }
    self.listenersByCollection[collection][id] = record;
    self.listenersByCollectionCount[collection]++;
    if (self.factName && Package['facts-base']) {
      Package['facts-base'].Facts.incrementServerFact(self.factPackage, self.factName, 1);
    }
    return {
      stop: function () {
        if (self.factName && Package['facts-base']) {
          Package['facts-base'].Facts.incrementServerFact(self.factPackage, self.factName, -1);
        }
        delete self.listenersByCollection[collection][id];
        self.listenersByCollectionCount[collection]--;
        if (self.listenersByCollectionCount[collection] === 0) {
          delete self.listenersByCollection[collection];
          delete self.listenersByCollectionCount[collection];
        }
      }
    };
  },
  // Fire the provided 'notification' (an object whose attribute
  // values are all JSON-compatibile) -- inform all matching listeners
  // (registered with listen()).
  //
  // If fire() is called inside a write fence, then each of the
  // listener callbacks will be called inside the write fence as well.
  //
  // The listeners may be invoked in parallel, rather than serially.
  fire: async function (notification) {
    var self = this;
    var collection = self._collectionForMessage(notification);
    if (!(collection in self.listenersByCollection)) {
      return;
    }
    var listenersForCollection = self.listenersByCollection[collection];
    var callbackIds = [];
    Object.entries(listenersForCollection).forEach(function (_ref) {
      let [id, l] = _ref;
      if (self._matches(notification, l.trigger)) {
        callbackIds.push(id);
      }
    });

    // Listener callbacks can yield, so we need to first find all the ones that
    // match in a single iteration over self.listenersByCollection (which can't
    // be mutated during this iteration), and then invoke the matching
    // callbacks, checking before each call to ensure they haven't stopped.
    // Note that we don't have to check that
    // self.listenersByCollection[collection] still === listenersForCollection,
    // because the only way that stops being true is if listenersForCollection
    // first gets reduced down to the empty object (and then never gets
    // increased again).
    for (const id of callbackIds) {
      if (id in listenersForCollection) {
        await listenersForCollection[id].callback(notification);
      }
    }
  },
  // A notification matches a trigger if all keys that exist in both are equal.
  //
  // Examples:
  //  N:{collection: "C"} matches T:{collection: "C"}
  //    (a non-targeted write to a collection matches a
  //     non-targeted query)
  //  N:{collection: "C", id: "X"} matches T:{collection: "C"}
  //    (a targeted write to a collection matches a non-targeted query)
  //  N:{collection: "C"} matches T:{collection: "C", id: "X"}
  //    (a non-targeted write to a collection matches a
  //     targeted query)
  //  N:{collection: "C", id: "X"} matches T:{collection: "C", id: "X"}
  //    (a targeted write to a collection matches a targeted query targeted
  //     at the same document)
  //  N:{collection: "C", id: "X"} does not match T:{collection: "C", id: "Y"}
  //    (a targeted write to a collection does not match a targeted query
  //     targeted at a different document)
  _matches: function (notification, trigger) {
    // Most notifications that use the crossbar have a string `collection` and
    // maybe an `id` that is a string or ObjectID. We're already dividing up
    // triggers by collection, but let's fast-track "nope, different ID" (and
    // avoid the overly generic EJSON.equals). This makes a noticeable
    // performance difference; see https://github.com/meteor/meteor/pull/3697
    if (typeof notification.id === 'string' && typeof trigger.id === 'string' && notification.id !== trigger.id) {
      return false;
    }
    if (notification.id instanceof MongoID.ObjectID && trigger.id instanceof MongoID.ObjectID && !notification.id.equals(trigger.id)) {
      return false;
    }
    return Object.keys(trigger).every(function (key) {
      return !(key in notification) || EJSON.equals(trigger[key], notification[key]);
    });
  }
});

// The "invalidation crossbar" is a specific instance used by the DDP server to
// implement write fence notifications. Listener callbacks on this crossbar
// should call beginWrite on the current write fence before they return, if they
// want to delay the write fence from firing (ie, the DDP method-data-updated
// message from being sent).
DDPServer._InvalidationCrossbar = new DDPServer._Crossbar({
  factName: "invalidation-crossbar-listeners"
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"server_convenience.js":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ddp-server/server_convenience.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
if (process.env.DDP_DEFAULT_CONNECTION_URL) {
  __meteor_runtime_config__.DDP_DEFAULT_CONNECTION_URL = process.env.DDP_DEFAULT_CONNECTION_URL;
}
Meteor.server = new Server();
Meteor.refresh = async function (notification) {
  await DDPServer._InvalidationCrossbar.fire(notification);
};

// Proxy the public methods of Meteor.server so they can
// be called directly on Meteor.

['publish', 'isAsyncCall', 'methods', 'call', 'callAsync', 'apply', 'applyAsync', 'onConnection', 'onMessage'].forEach(function (name) {
  Meteor[name] = Meteor.server[name].bind(Meteor.server);
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"dummy_document_view.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ddp-server/dummy_document_view.ts                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  DummyDocumentView: () => DummyDocumentView
});
class DummyDocumentView {
  constructor() {
    this.existsIn = void 0;
    this.dataByKey = void 0;
    this.existsIn = new Set(); // set of subscriptionHandle
    this.dataByKey = new Map(); // key-> [ {subscriptionHandle, value} by precedence]
  }
  getFields() {
    return {};
  }
  clearField(subscriptionHandle, key, changeCollector) {
    changeCollector[key] = undefined;
  }
  changeField(subscriptionHandle, key, value, changeCollector, isAdd) {
    changeCollector[key] = value;
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"session_collection_view.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ddp-server/session_collection_view.ts                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      SessionCollectionView: () => SessionCollectionView
    });
    let DummyDocumentView;
    module.link("./dummy_document_view", {
      DummyDocumentView(v) {
        DummyDocumentView = v;
      }
    }, 0);
    let SessionDocumentView;
    module.link("./session_document_view", {
      SessionDocumentView(v) {
        SessionDocumentView = v;
      }
    }, 1);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    class SessionCollectionView {
      /**
       * Represents a client's view of a single collection
       * @param collectionName - Name of the collection it represents
       * @param sessionCallbacks - The callbacks for added, changed, removed
       */
      constructor(collectionName, sessionCallbacks) {
        this.collectionName = void 0;
        this.documents = void 0;
        this.callbacks = void 0;
        this.collectionName = collectionName;
        this.documents = new Map();
        this.callbacks = sessionCallbacks;
      }
      isEmpty() {
        return this.documents.size === 0;
      }
      diff(previous) {
        DiffSequence.diffMaps(previous.documents, this.documents, {
          both: this.diffDocument.bind(this),
          rightOnly: (id, nowDV) => {
            this.callbacks.added(this.collectionName, id, nowDV.getFields());
          },
          leftOnly: (id, prevDV) => {
            this.callbacks.removed(this.collectionName, id);
          }
        });
      }
      diffDocument(id, prevDV, nowDV) {
        const fields = {};
        DiffSequence.diffObjects(prevDV.getFields(), nowDV.getFields(), {
          both: (key, prev, now) => {
            if (!EJSON.equals(prev, now)) {
              fields[key] = now;
            }
          },
          rightOnly: (key, now) => {
            fields[key] = now;
          },
          leftOnly: (key, prev) => {
            fields[key] = undefined;
          }
        });
        this.callbacks.changed(this.collectionName, id, fields);
      }
      added(subscriptionHandle, id, fields) {
        let docView = this.documents.get(id);
        let added = false;
        if (!docView) {
          added = true;
          if (Meteor.server.getPublicationStrategy(this.collectionName).useDummyDocumentView) {
            docView = new DummyDocumentView();
          } else {
            docView = new SessionDocumentView();
          }
          this.documents.set(id, docView);
        }
        docView.existsIn.add(subscriptionHandle);
        const changeCollector = {};
        Object.entries(fields).forEach(_ref => {
          let [key, value] = _ref;
          docView.changeField(subscriptionHandle, key, value, changeCollector, true);
        });
        if (added) {
          this.callbacks.added(this.collectionName, id, changeCollector);
        } else {
          this.callbacks.changed(this.collectionName, id, changeCollector);
        }
      }
      changed(subscriptionHandle, id, changed) {
        const changedResult = {};
        const docView = this.documents.get(id);
        if (!docView) {
          throw new Error("Could not find element with id ".concat(id, " to change"));
        }
        Object.entries(changed).forEach(_ref2 => {
          let [key, value] = _ref2;
          if (value === undefined) {
            docView.clearField(subscriptionHandle, key, changedResult);
          } else {
            docView.changeField(subscriptionHandle, key, value, changedResult);
          }
        });
        this.callbacks.changed(this.collectionName, id, changedResult);
      }
      removed(subscriptionHandle, id) {
        const docView = this.documents.get(id);
        if (!docView) {
          throw new Error("Removed nonexistent document ".concat(id));
        }
        docView.existsIn.delete(subscriptionHandle);
        if (docView.existsIn.size === 0) {
          // it is gone from everyone
          this.callbacks.removed(this.collectionName, id);
          this.documents.delete(id);
        } else {
          const changed = {};
          // remove this subscription from every precedence list
          // and record the changes
          docView.dataByKey.forEach((precedenceList, key) => {
            docView.clearField(subscriptionHandle, key, changed);
          });
          this.callbacks.changed(this.collectionName, id, changed);
        }
      }
    }
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"session_document_view.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/ddp-server/session_document_view.ts                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  SessionDocumentView: () => SessionDocumentView
});
class SessionDocumentView {
  constructor() {
    this.existsIn = void 0;
    this.dataByKey = void 0;
    this.existsIn = new Set(); // set of subscriptionHandle
    // Memory Growth
    this.dataByKey = new Map(); // key-> [ {subscriptionHandle, value} by precedence]
  }
  getFields() {
    const ret = {};
    this.dataByKey.forEach((precedenceList, key) => {
      ret[key] = precedenceList[0].value;
    });
    return ret;
  }
  clearField(subscriptionHandle, key, changeCollector) {
    // Publish API ignores _id if present in fields
    if (key === "_id") return;
    const precedenceList = this.dataByKey.get(key);
    // It's okay to clear fields that didn't exist. No need to throw
    // an error.
    if (!precedenceList) return;
    let removedValue = undefined;
    for (let i = 0; i < precedenceList.length; i++) {
      const precedence = precedenceList[i];
      if (precedence.subscriptionHandle === subscriptionHandle) {
        // The view's value can only change if this subscription is the one that
        // used to have precedence.
        if (i === 0) removedValue = precedence.value;
        precedenceList.splice(i, 1);
        break;
      }
    }
    if (precedenceList.length === 0) {
      this.dataByKey.delete(key);
      changeCollector[key] = undefined;
    } else if (removedValue !== undefined && !EJSON.equals(removedValue, precedenceList[0].value)) {
      changeCollector[key] = precedenceList[0].value;
    }
  }
  changeField(subscriptionHandle, key, value, changeCollector) {
    let isAdd = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
    // Publish API ignores _id if present in fields
    if (key === "_id") return;
    // Don't share state with the data passed in by the user.
    value = EJSON.clone(value);
    if (!this.dataByKey.has(key)) {
      this.dataByKey.set(key, [{
        subscriptionHandle: subscriptionHandle,
        value: value
      }]);
      changeCollector[key] = value;
      return;
    }
    const precedenceList = this.dataByKey.get(key);
    let elt;
    if (!isAdd) {
      elt = precedenceList.find(precedence => precedence.subscriptionHandle === subscriptionHandle);
    }
    if (elt) {
      if (elt === precedenceList[0] && !EJSON.equals(value, elt.value)) {
        // this subscription is changing the value of this field.
        changeCollector[key] = value;
      }
      elt.value = value;
    } else {
      // this subscription is newly caring about this field
      precedenceList.push({
        subscriptionHandle: subscriptionHandle,
        value: value
      });
    }
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"node_modules":{"lodash.once":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/ddp-server/node_modules/lodash.once/package.json                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "lodash.once",
  "version": "4.1.1"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/ddp-server/node_modules/lodash.once/index.js                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"lodash.isempty":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/ddp-server/node_modules/lodash.isempty/package.json                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "lodash.isempty",
  "version": "4.4.0"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/ddp-server/node_modules/lodash.isempty/index.js                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"lodash.isobject":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/ddp-server/node_modules/lodash.isobject/package.json                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "lodash.isobject",
  "version": "3.0.2"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/ddp-server/node_modules/lodash.isobject/index.js                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"lodash.isstring":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/ddp-server/node_modules/lodash.isstring/package.json                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "lodash.isstring",
  "version": "4.0.1"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/ddp-server/node_modules/lodash.isstring/index.js                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}},{
  "extensions": [
    ".js",
    ".json",
    ".ts"
  ]
});


/* Exports */
return {
  export: function () { return {
      DDPServer: DDPServer
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/ddp-server/stream_server.js",
    "/node_modules/meteor/ddp-server/livedata_server.js",
    "/node_modules/meteor/ddp-server/writefence.js",
    "/node_modules/meteor/ddp-server/crossbar.js",
    "/node_modules/meteor/ddp-server/server_convenience.js"
  ]
}});

//# sourceURL=meteor://💻app/packages/ddp-server.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvZGRwLXNlcnZlci9zdHJlYW1fc2VydmVyLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9kZHAtc2VydmVyL2xpdmVkYXRhX3NlcnZlci5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvZGRwLXNlcnZlci93cml0ZWZlbmNlLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9kZHAtc2VydmVyL2Nyb3NzYmFyLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9kZHAtc2VydmVyL3NlcnZlcl9jb252ZW5pZW5jZS5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvZGRwLXNlcnZlci9kdW1teV9kb2N1bWVudF92aWV3LnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9kZHAtc2VydmVyL3Nlc3Npb25fY29sbGVjdGlvbl92aWV3LnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9kZHAtc2VydmVyL3Nlc3Npb25fZG9jdW1lbnRfdmlldy50cyJdLCJuYW1lcyI6WyJfb2JqZWN0U3ByZWFkIiwibW9kdWxlIiwibGluayIsImRlZmF1bHQiLCJ2Iiwib25jZSIsInpsaWIiLCJfX3JlaWZ5V2FpdEZvckRlcHNfXyIsIndlYnNvY2tldEV4dGVuc2lvbnMiLCJleHRlbnNpb25zIiwid2Vic29ja2V0Q29tcHJlc3Npb25Db25maWciLCJwcm9jZXNzIiwiZW52IiwiU0VSVkVSX1dFQlNPQ0tFVF9DT01QUkVTU0lPTiIsIkpTT04iLCJwYXJzZSIsInB1c2giLCJOcG0iLCJyZXF1aXJlIiwiY29uZmlndXJlIiwidGhyZXNob2xkIiwibGV2ZWwiLCJjb25zdGFudHMiLCJaX0JFU1RfU1BFRUQiLCJtZW1MZXZlbCIsIlpfTUlOX01FTUxFVkVMIiwibm9Db250ZXh0VGFrZW92ZXIiLCJtYXhXaW5kb3dCaXRzIiwiWl9NSU5fV0lORE9XQklUUyIsInBhdGhQcmVmaXgiLCJfX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fIiwiUk9PVF9VUkxfUEFUSF9QUkVGSVgiLCJTdHJlYW1TZXJ2ZXIiLCJzZWxmIiwicmVnaXN0cmF0aW9uX2NhbGxiYWNrcyIsIm9wZW5fc29ja2V0cyIsInByZWZpeCIsIlJvdXRlUG9saWN5IiwiZGVjbGFyZSIsInNvY2tqcyIsInNlcnZlck9wdGlvbnMiLCJsb2ciLCJoZWFydGJlYXRfZGVsYXkiLCJkaXNjb25uZWN0X2RlbGF5IiwiZGlzYWJsZV9jb3JzIiwiRElTQUJMRV9TT0NLSlNfQ09SUyIsImpzZXNzaW9uaWQiLCJVU0VfSlNFU1NJT05JRCIsIkRJU0FCTEVfV0VCU09DS0VUUyIsIndlYnNvY2tldCIsImZheWVfc2VydmVyX29wdGlvbnMiLCJzZXJ2ZXIiLCJjcmVhdGVTZXJ2ZXIiLCJXZWJBcHAiLCJodHRwU2VydmVyIiwicmVtb3ZlTGlzdGVuZXIiLCJfdGltZW91dEFkanVzdG1lbnRSZXF1ZXN0Q2FsbGJhY2siLCJpbnN0YWxsSGFuZGxlcnMiLCJhZGRMaXN0ZW5lciIsIl9yZWRpcmVjdFdlYnNvY2tldEVuZHBvaW50Iiwib24iLCJzb2NrZXQiLCJzZXRXZWJzb2NrZXRUaW1lb3V0IiwidGltZW91dCIsInByb3RvY29sIiwiX3Nlc3Npb24iLCJyZWN2IiwiY29ubmVjdGlvbiIsInNldFRpbWVvdXQiLCJzZW5kIiwiZGF0YSIsIndyaXRlIiwiZmlsdGVyIiwidmFsdWUiLCJURVNUX01FVEFEQVRBIiwic3RyaW5naWZ5IiwidGVzdE1lc3NhZ2VPbkNvbm5lY3QiLCJmb3JFYWNoIiwiY2FsbGJhY2siLCJPYmplY3QiLCJhc3NpZ24iLCJwcm90b3R5cGUiLCJyZWdpc3RlciIsImFsbF9zb2NrZXRzIiwidmFsdWVzIiwiZXZlbnQiLCJvbGRIdHRwU2VydmVyTGlzdGVuZXJzIiwibGlzdGVuZXJzIiwic2xpY2UiLCJyZW1vdmVBbGxMaXN0ZW5lcnMiLCJuZXdMaXN0ZW5lciIsInJlcXVlc3QiLCJhcmdzIiwiYXJndW1lbnRzIiwidXJsIiwicGFyc2VkVXJsIiwicGF0aG5hbWUiLCJmb3JtYXQiLCJvbGRMaXN0ZW5lciIsImFwcGx5IiwiX19yZWlmeV9hc3luY19yZXN1bHRfXyIsIl9yZWlmeUVycm9yIiwiYXN5bmMiLCJpc0VtcHR5IiwiaXNPYmplY3QiLCJpc1N0cmluZyIsIlNlc3Npb25Db2xsZWN0aW9uVmlldyIsIlNlc3Npb25Eb2N1bWVudFZpZXciLCJERFBTZXJ2ZXIiLCJwdWJsaWNhdGlvblN0cmF0ZWdpZXMiLCJTRVJWRVJfTUVSR0UiLCJ1c2VEdW1teURvY3VtZW50VmlldyIsInVzZUNvbGxlY3Rpb25WaWV3IiwiZG9BY2NvdW50aW5nRm9yQ29sbGVjdGlvbiIsIk5PX01FUkdFX05PX0hJU1RPUlkiLCJOT19NRVJHRSIsIk5PX01FUkdFX01VTFRJIiwiX1Nlc3Npb25Eb2N1bWVudFZpZXciLCJfZ2V0Q3VycmVudEZlbmNlIiwiY3VycmVudEludm9jYXRpb24iLCJfQ3VycmVudFdyaXRlRmVuY2UiLCJnZXQiLCJERFAiLCJfQ3VycmVudE1ldGhvZEludm9jYXRpb24iLCJmZW5jZSIsInVuZGVmaW5lZCIsIl9TZXNzaW9uQ29sbGVjdGlvblZpZXciLCJTZXNzaW9uIiwidmVyc2lvbiIsIm9wdGlvbnMiLCJpZCIsIlJhbmRvbSIsImluaXRpYWxpemVkIiwiaW5RdWV1ZSIsIk1ldGVvciIsIl9Eb3VibGVFbmRlZFF1ZXVlIiwiYmxvY2tlZCIsIndvcmtlclJ1bm5pbmciLCJjYWNoZWRVbmJsb2NrIiwiX25hbWVkU3VicyIsIk1hcCIsIl91bml2ZXJzYWxTdWJzIiwidXNlcklkIiwiY29sbGVjdGlvblZpZXdzIiwiX2lzU2VuZGluZyIsIl9kb250U3RhcnROZXdVbml2ZXJzYWxTdWJzIiwiX3BlbmRpbmdSZWFkeSIsIl9jbG9zZUNhbGxiYWNrcyIsIl9zb2NrZXRVcmwiLCJfcmVzcG9uZFRvUGluZ3MiLCJyZXNwb25kVG9QaW5ncyIsImNvbm5lY3Rpb25IYW5kbGUiLCJjbG9zZSIsIm9uQ2xvc2UiLCJmbiIsImNiIiwiYmluZEVudmlyb25tZW50IiwiZGVmZXIiLCJjbGllbnRBZGRyZXNzIiwiX2NsaWVudEFkZHJlc3MiLCJodHRwSGVhZGVycyIsImhlYWRlcnMiLCJtc2ciLCJzZXNzaW9uIiwic3RhcnRVbml2ZXJzYWxTdWJzIiwiaGVhcnRiZWF0SW50ZXJ2YWwiLCJoZWFydGJlYXQiLCJERFBDb21tb24iLCJIZWFydGJlYXQiLCJoZWFydGJlYXRUaW1lb3V0Iiwib25UaW1lb3V0Iiwic2VuZFBpbmciLCJzdGFydCIsIlBhY2thZ2UiLCJGYWN0cyIsImluY3JlbWVudFNlcnZlckZhY3QiLCJzZW5kUmVhZHkiLCJzdWJzY3JpcHRpb25JZHMiLCJzdWJzIiwic3Vic2NyaXB0aW9uSWQiLCJfY2FuU2VuZCIsImNvbGxlY3Rpb25OYW1lIiwiZ2V0UHVibGljYXRpb25TdHJhdGVneSIsInNlbmRBZGRlZCIsImZpZWxkcyIsImNvbGxlY3Rpb24iLCJzZW5kQ2hhbmdlZCIsInNlbmRSZW1vdmVkIiwiZ2V0U2VuZENhbGxiYWNrcyIsImFkZGVkIiwiYmluZCIsImNoYW5nZWQiLCJyZW1vdmVkIiwiZ2V0Q29sbGVjdGlvblZpZXciLCJyZXQiLCJzZXQiLCJzdWJzY3JpcHRpb25IYW5kbGUiLCJ2aWV3IiwiZGVsZXRlIiwiaGFuZGxlcnMiLCJ1bml2ZXJzYWxfcHVibGlzaF9oYW5kbGVycyIsImhhbmRsZXIiLCJfc3RhcnRTdWJzY3JpcHRpb24iLCJzdG9wIiwiX21ldGVvclNlc3Npb24iLCJfZGVhY3RpdmF0ZUFsbFN1YnNjcmlwdGlvbnMiLCJfcmVtb3ZlU2Vzc2lvbiIsIl9wcmludFNlbnRERFAiLCJfZGVidWciLCJzdHJpbmdpZnlERFAiLCJzZW5kRXJyb3IiLCJyZWFzb24iLCJvZmZlbmRpbmdNZXNzYWdlIiwicHJvY2Vzc01lc3NhZ2UiLCJtc2dfaW4iLCJtZXNzYWdlUmVjZWl2ZWQiLCJwcm9jZXNzTmV4dCIsInNoaWZ0IiwicnVuSGFuZGxlcnMiLCJ1bmJsb2NrIiwic2V0SW1tZWRpYXRlIiwib25NZXNzYWdlSG9vayIsImVhY2giLCJwcm90b2NvbF9oYW5kbGVycyIsInJlc3VsdCIsImNhbGwiLCJfaXNQcm9taXNlIiwiZmluYWxseSIsInN1YiIsIm5hbWUiLCJwYXJhbXMiLCJBcnJheSIsInB1Ymxpc2hfaGFuZGxlcnMiLCJlcnJvciIsIkVycm9yIiwiY29uY2F0IiwiaGFzIiwiRERQUmF0ZUxpbWl0ZXIiLCJyYXRlTGltaXRlcklucHV0IiwidHlwZSIsImNvbm5lY3Rpb25JZCIsIl9pbmNyZW1lbnQiLCJyYXRlTGltaXRSZXN1bHQiLCJfY2hlY2siLCJhbGxvd2VkIiwiZ2V0RXJyb3JNZXNzYWdlIiwidGltZVRvUmVzZXQiLCJ1bnN1YiIsIl9zdG9wU3Vic2NyaXB0aW9uIiwibWV0aG9kIiwicmFuZG9tU2VlZCIsIl9Xcml0ZUZlbmNlIiwib25BbGxDb21taXR0ZWQiLCJyZXRpcmUiLCJtZXRob2RzIiwibWV0aG9kX2hhbmRsZXJzIiwiYXJtIiwiaW52b2NhdGlvbiIsIk1ldGhvZEludm9jYXRpb24iLCJpc1NpbXVsYXRpb24iLCJzZXRVc2VySWQiLCJfc2V0VXNlcklkIiwicHJvbWlzZSIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0Iiwid2l0aFZhbHVlIiwibWF5YmVBdWRpdEFyZ3VtZW50Q2hlY2tzIiwiZmluaXNoIiwicGF5bG9hZCIsInRoZW4iLCJleGNlcHRpb24iLCJ3cmFwSW50ZXJuYWxFeGNlcHRpb24iLCJfZWFjaFN1YiIsImYiLCJfZGlmZkNvbGxlY3Rpb25WaWV3cyIsImJlZm9yZUNWcyIsIkRpZmZTZXF1ZW5jZSIsImRpZmZNYXBzIiwiYm90aCIsImxlZnRWYWx1ZSIsInJpZ2h0VmFsdWUiLCJkaWZmIiwicmlnaHRPbmx5IiwiZG9jdW1lbnRzIiwiZG9jVmlldyIsImdldEZpZWxkcyIsImxlZnRPbmx5IiwiZG9jIiwiX2RlYWN0aXZhdGUiLCJvbGROYW1lZFN1YnMiLCJhbGwiLCJtYXAiLCJfcmVmIiwibmV3U3ViIiwiX3JlY3JlYXRlIiwiX3J1bkhhbmRsZXIiLCJfbm9ZaWVsZHNBbGxvd2VkIiwic3ViSWQiLCJTdWJzY3JpcHRpb24iLCJ1bmJsb2NrSGFuZGVyIiwic3ViTmFtZSIsIm1heWJlU3ViIiwiX25hbWUiLCJfcmVtb3ZlQWxsRG9jdW1lbnRzIiwicmVzcG9uc2UiLCJodHRwRm9yd2FyZGVkQ291bnQiLCJwYXJzZUludCIsInJlbW90ZUFkZHJlc3MiLCJmb3J3YXJkZWRGb3IiLCJ0cmltIiwic3BsaXQiLCJsZW5ndGgiLCJfaGFuZGxlciIsIl9zdWJzY3JpcHRpb25JZCIsIl9wYXJhbXMiLCJfc3Vic2NyaXB0aW9uSGFuZGxlIiwiX2RlYWN0aXZhdGVkIiwiX3N0b3BDYWxsYmFja3MiLCJfZG9jdW1lbnRzIiwiX3JlYWR5IiwiX2lkRmlsdGVyIiwiaWRTdHJpbmdpZnkiLCJNb25nb0lEIiwiaWRQYXJzZSIsInJlc3VsdE9yVGhlbmFibGUiLCJfQ3VycmVudFB1YmxpY2F0aW9uSW52b2NhdGlvbiIsIkVKU09OIiwiY2xvbmUiLCJlIiwiX2lzRGVhY3RpdmF0ZWQiLCJpc1RoZW5hYmxlIiwiX3B1Ymxpc2hIYW5kbGVyUmVzdWx0IiwicmVzIiwiaXNDdXJzb3IiLCJjIiwiX3B1Ymxpc2hDdXJzb3IiLCJyZWFkeSIsImlzQXJyYXkiLCJldmVyeSIsImNvbGxlY3Rpb25OYW1lcyIsImkiLCJfZ2V0Q29sbGVjdGlvbk5hbWUiLCJjdXIiLCJfY2FsbFN0b3BDYWxsYmFja3MiLCJjYWxsYmFja3MiLCJjb2xsZWN0aW9uRG9jcyIsInN0cklkIiwib25TdG9wIiwiaWRzIiwiU2V0IiwiYWRkIiwiU2VydmVyIiwiZGVmYXVsdFB1YmxpY2F0aW9uU3RyYXRlZ3kiLCJvbkNvbm5lY3Rpb25Ib29rIiwiSG9vayIsImRlYnVnUHJpbnRFeGNlcHRpb25zIiwiX3B1YmxpY2F0aW9uU3RyYXRlZ2llcyIsInNlc3Npb25zIiwic3RyZWFtX3NlcnZlciIsInJhd19tc2ciLCJfcHJpbnRSZWNlaXZlZEREUCIsInBhcnNlRERQIiwiZXJyIiwiX2hhbmRsZUNvbm5lY3QiLCJvbkNvbm5lY3Rpb24iLCJzZXRQdWJsaWNhdGlvblN0cmF0ZWd5Iiwic3RyYXRlZ3kiLCJpbmNsdWRlcyIsIm9uTWVzc2FnZSIsInN1cHBvcnQiLCJTVVBQT1JURURfRERQX1ZFUlNJT05TIiwiY2FsY3VsYXRlVmVyc2lvbiIsInB1Ymxpc2giLCJhdXRvcHVibGlzaCIsImlzX2F1dG8iLCJ3YXJuZWRfYWJvdXRfYXV0b3B1Ymxpc2giLCJlbnRyaWVzIiwiX3JlZjIiLCJrZXkiLCJpc0FzeW5jQ2FsbCIsIl9pc0NhbGxBc3luY01ldGhvZFJ1bm5pbmciLCJfcmVmMyIsImZ1bmMiLCJfbGVuIiwiX2tleSIsInBvcCIsImNhbGxBc3luYyIsIl9hcmdzJCIsIl9sZW4yIiwiX2tleTIiLCJoYXNPd25Qcm9wZXJ0eSIsIl9zZXRDYWxsQXN5bmNNZXRob2RSdW5uaW5nIiwiX0N1cnJlbnRDYWxsQXN5bmNJbnZvY2F0aW9uIiwiX3NldCIsImhhc0NhbGxBc3luY1BhcmVudCIsImFwcGx5QXN5bmMiLCJpc0Zyb21DYWxsQXN5bmMiLCJjYXRjaCIsImN1cnJlbnRNZXRob2RJbnZvY2F0aW9uIiwiY3VycmVudFB1YmxpY2F0aW9uSW52b2NhdGlvbiIsIm1ha2VScGNTZWVkIiwiciIsIl91cmxGb3JTZXNzaW9uIiwic2Vzc2lvbklkIiwiY2xpZW50U3VwcG9ydGVkVmVyc2lvbnMiLCJzZXJ2ZXJTdXBwb3J0ZWRWZXJzaW9ucyIsImNvcnJlY3RWZXJzaW9uIiwiZmluZCIsIl9jYWxjdWxhdGVWZXJzaW9uIiwiY29udGV4dCIsImlzQ2xpZW50U2FmZSIsIm9yaWdpbmFsTWVzc2FnZSIsIm1lc3NhZ2UiLCJkZXRhaWxzIiwiX2V4cGVjdGVkQnlUZXN0Iiwic3RhY2siLCJzYW5pdGl6ZWRFcnJvciIsImRlc2NyaXB0aW9uIiwiTWF0Y2giLCJfZmFpbElmQXJndW1lbnRzQXJlTm90QWxsQ2hlY2tlZCIsImNvbnN0cnVjdG9yIiwiYXJtZWQiLCJmaXJlZCIsInJldGlyZWQiLCJvdXRzdGFuZGluZ193cml0ZXMiLCJiZWZvcmVfZmlyZV9jYWxsYmFja3MiLCJjb21wbGV0aW9uX2NhbGxiYWNrcyIsImJlZ2luV3JpdGUiLCJjb21taXR0ZWQiLCJfbWF5YmVGaXJlIiwib25CZWZvcmVGaXJlIiwiX2FybUFuZFdhaXQiLCJyZXNvbHZlciIsInJldHVyblZhbHVlIiwiYXJtQW5kV2FpdCIsImludm9rZUNhbGxiYWNrIiwiYmVmb3JlQ2FsbGJhY2tzIiwiRW52aXJvbm1lbnRWYXJpYWJsZSIsIl9Dcm9zc2JhciIsIm5leHRJZCIsImxpc3RlbmVyc0J5Q29sbGVjdGlvbiIsImxpc3RlbmVyc0J5Q29sbGVjdGlvbkNvdW50IiwiZmFjdFBhY2thZ2UiLCJmYWN0TmFtZSIsIl9jb2xsZWN0aW9uRm9yTWVzc2FnZSIsImxpc3RlbiIsInRyaWdnZXIiLCJyZWNvcmQiLCJmaXJlIiwibm90aWZpY2F0aW9uIiwibGlzdGVuZXJzRm9yQ29sbGVjdGlvbiIsImNhbGxiYWNrSWRzIiwibCIsIl9tYXRjaGVzIiwiT2JqZWN0SUQiLCJlcXVhbHMiLCJrZXlzIiwiX0ludmFsaWRhdGlvbkNyb3NzYmFyIiwiRERQX0RFRkFVTFRfQ09OTkVDVElPTl9VUkwiLCJyZWZyZXNoIiwiZXhwb3J0IiwiRHVtbXlEb2N1bWVudFZpZXciLCJleGlzdHNJbiIsImRhdGFCeUtleSIsImNsZWFyRmllbGQiLCJjaGFuZ2VDb2xsZWN0b3IiLCJjaGFuZ2VGaWVsZCIsImlzQWRkIiwic2Vzc2lvbkNhbGxiYWNrcyIsInNpemUiLCJwcmV2aW91cyIsImRpZmZEb2N1bWVudCIsIm5vd0RWIiwicHJldkRWIiwiZGlmZk9iamVjdHMiLCJwcmV2Iiwibm93IiwiY2hhbmdlZFJlc3VsdCIsInByZWNlZGVuY2VMaXN0IiwicmVtb3ZlZFZhbHVlIiwicHJlY2VkZW5jZSIsInNwbGljZSIsImVsdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUFBLElBQUlBLGFBQWE7SUFBQ0MsTUFBTSxDQUFDQyxJQUFJLENBQUMsc0NBQXNDLEVBQUM7TUFBQ0MsT0FBT0EsQ0FBQ0MsQ0FBQyxFQUFDO1FBQUNKLGFBQWEsR0FB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UyxDQUFDcE8sR0FBRyxDQUFDK0ksR0FBRyxDQUFDLEVBQUU7TUFDNUIsSUFBSSxDQUFDcUYsU0FBUyxDQUFDN1EsR0FBRyxDQUFDd0wsR0FBRyxFQUFFLENBQ3RCO1FBQUV2TCxrQkFBa0IsRUFBRUEsa0JBQWtCO1FBQUUzSCxLQUFLLEVBQUVBO01BQUssQ0FBRSxDQUN6RCxDQUFDO01BQ0Z5WSxlQUFlLENBQUN2RixHQUFHLENBQUMsR0FBR2xULEtBQUs7TUFDNUI7SUFDRjtJQUVBLE1BQU1zWixjQUFjLEdBQUcsSUFBSSxDQUFDZixTQUFTLENBQUN2VixHQUFHLENBQUNrUSxHQUFHLENBQUU7SUFDL0MsSUFBSXdHLEdBQStCO0lBRW5DLElBQUksQ0FBQ2YsS0FBSyxFQUFFO01BQ1ZlLEdBQUcsR0FBR0osY0FBYyxDQUFDdkUsSUFBSSxDQUN0QnlFLFVBQVUsSUFBS0EsVUFBVSxDQUFDN1Isa0JBQWtCLEtBQUtBLGtCQUFrQixDQUNyRTtJQUNIO0lBRUEsSUFBSStSLEdBQUcsRUFBRTtNQUNQLElBQUlBLEdBQUcsS0FBS0osY0FBYyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUN4SixLQUFLLENBQUNpSSxNQUFNLENBQUMvWCxLQUFLLEVBQUUwWixHQUFHLENBQUMxWixLQUFLLENBQUMsRUFBRTtRQUNoRTtRQUNBeVksZUFBZSxDQUFDdkYsR0FBRyxDQUFDLEdBQUdsVCxLQUFLO01BQzlCO01BQ0EwWixHQUFHLENBQUMxWixLQUFLLEdBQUdBLEtBQUs7SUFDbkIsQ0FBQyxNQUFNO01BQ0w7TUFDQXNaLGNBQWMsQ0FBQy9jLElBQUksQ0FBQztRQUFFb0wsa0JBQWtCLEVBQUVBLGtCQUFrQjtRQUFFM0gsS0FBSyxFQUFFQTtNQUFLLENBQUUsQ0FBQztJQUMvRTtFQUNGIiwiZmlsZSI6Ii9wYWNrYWdlcy9kZHAtc2VydmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG9uY2UgZnJvbSAnbG9kYXNoLm9uY2UnO1xuaW1wb3J0IHpsaWIgZnJvbSAnbm9kZTp6bGliJztcblxuLy8gQnkgZGVmYXVsdCwgd2UgdXNlIHRoZSBwZXJtZXNzYWdlLWRlZmxhdGUgZXh0ZW5zaW9uIHdpdGggZGVmYXVsdFxuLy8gY29uZmlndXJhdGlvbi4gSWYgJFNFUlZFUl9XRUJTT0NLRVRfQ09NUFJFU1NJT04gaXMgc2V0LCB0aGVuIGl0IG11c3QgYmUgdmFsaWRcbi8vIEpTT04uIElmIGl0IHJlcHJlc2VudHMgYSBmYWxzZXkgdmFsdWUsIHRoZW4gd2UgZG8gbm90IHVzZSBwZXJtZXNzYWdlLWRlZmxhdGVcbi8vIGF0IGFsbDsgb3RoZXJ3aXNlLCB0aGUgSlNPTiB2YWx1ZSBpcyB1c2VkIGFzIGFuIGFyZ3VtZW50IHRvIGRlZmxhdGUnc1xuLy8gY29uZmlndXJlIG1ldGhvZDsgc2VlXG4vLyBodHRwczovL2dpdGh1Yi5jb20vZmF5ZS9wZXJtZXNzYWdlLWRlZmxhdGUtbm9kZS9ibG9iL21hc3Rlci9SRUFETUUubWRcbi8vXG4vLyAoV2UgZG8gdGhpcyBpbiBhbiBfLm9uY2UgaW5zdGVhZCBvZiBhdCBzdGFydHVwLCBiZWNhdXNlIHdlIGRvbid0IHdhbnQgdG9cbi8vIGNyYXNoIHRoZSB0b29sIGR1cmluZyBpc29wYWNrZXQgbG9hZCBpZiB5b3VyIEpTT04gZG9lc24ndCBwYXJzZS4gVGhpcyBpcyBvbmx5XG4vLyBhIHByb2JsZW0gYmVjYXVzZSB0aGUgdG9vbCBoYXMgdG8gbG9hZCB0aGUgRERQIHNlcnZlciBjb2RlIGp1c3QgaW4gb3JkZXIgdG9cbi8vIGJlIGEgRERQIGNsaWVudDsgc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tZXRlb3IvbWV0ZW9yL2lzc3Vlcy8zNDUyIC4pXG52YXIgd2Vic29ja2V0RXh0ZW5zaW9ucyA9IG9uY2UoZnVuY3Rpb24gKCkge1xuICB2YXIgZXh0ZW5zaW9ucyA9IFtdO1xuXG4gIHZhciB3ZWJzb2NrZXRDb21wcmVzc2lvbkNvbmZpZyA9IHByb2Nlc3MuZW52LlNFUlZFUl9XRUJTT0NLRVRfQ09NUFJFU1NJT04gP1xuICAgIEpTT04ucGFyc2UocHJvY2Vzcy5lbnYuU0VSVkVSX1dFQlNPQ0tFVF9DT01QUkVTU0lPTikgOiB7fTtcblxuICBpZiAod2Vic29ja2V0Q29tcHJlc3Npb25Db25maWcpIHtcbiAgICBleHRlbnNpb25zLnB1c2goTnBtLnJlcXVpcmUoJ3Blcm1lc3NhZ2UtZGVmbGF0ZTInKS5jb25maWd1cmUoe1xuICAgICAgdGhyZXNob2xkOiAxMDI0LFxuICAgICAgbGV2ZWw6IHpsaWIuY29uc3RhbnRzLlpfQkVTVF9TUEVFRCxcbiAgICAgIG1lbUxldmVsOiB6bGliLmNvbnN0YW50cy5aX01JTl9NRU1MRVZFTCxcbiAgICAgIG5vQ29udGV4dFRha2VvdmVyOiB0cnVlLFxuICAgICAgbWF4V2luZG93Qml0czogemxpYi5jb25zdGFudHMuWl9NSU5fV0lORE9XQklUUyxcbiAgICAgIC4uLih3ZWJzb2NrZXRDb21wcmVzc2lvbkNvbmZpZyB8fCB7fSlcbiAgICB9KSk7XG4gIH1cblxuICByZXR1cm4gZXh0ZW5zaW9ucztcbn0pO1xuXG52YXIgcGF0aFByZWZpeCA9IF9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18uUk9PVF9VUkxfUEFUSF9QUkVGSVggfHwgIFwiXCI7XG5cblN0cmVhbVNlcnZlciA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBzZWxmLnJlZ2lzdHJhdGlvbl9jYWxsYmFja3MgPSBbXTtcbiAgc2VsZi5vcGVuX3NvY2tldHMgPSBbXTtcblxuICAvLyBCZWNhdXNlIHdlIGFyZSBpbnN0YWxsaW5nIGRpcmVjdGx5IG9udG8gV2ViQXBwLmh0dHBTZXJ2ZXIgaW5zdGVhZCBvZiB1c2luZ1xuICAvLyBXZWJBcHAuYXBwLCB3ZSBoYXZlIHRvIHByb2Nlc3MgdGhlIHBhdGggcHJlZml4IG91cnNlbHZlcy5cbiAgc2VsZi5wcmVmaXggPSBwYXRoUHJlZml4ICsgJy9zb2NranMnO1xuICBSb3V0ZVBvbGljeS5kZWNsYXJlKHNlbGYucHJlZml4ICsgJy8nLCAnbmV0d29yaycpO1xuXG4gIC8vIHNldCB1cCBzb2NranNcbiAgdmFyIHNvY2tqcyA9IE5wbS5yZXF1aXJlKCdzb2NranMnKTtcbiAgdmFyIHNlcnZlck9wdGlvbnMgPSB7XG4gICAgcHJlZml4OiBzZWxmLnByZWZpeCxcbiAgICBsb2c6IGZ1bmN0aW9uKCkge30sXG4gICAgLy8gdGhpcyBpcyB0aGUgZGVmYXVsdCwgYnV0IHdlIGNvZGUgaXQgZXhwbGljaXRseSBiZWNhdXNlIHdlIGRlcGVuZFxuICAgIC8vIG9uIGl0IGluIHN0cmVhbV9jbGllbnQ6SEVBUlRCRUFUX1RJTUVPVVRcbiAgICBoZWFydGJlYXRfZGVsYXk6IDQ1MDAwLFxuICAgIC8vIFRoZSBkZWZhdWx0IGRpc2Nvbm5lY3RfZGVsYXkgaXMgNSBzZWNvbmRzLCBidXQgaWYgdGhlIHNlcnZlciBlbmRzIHVwIENQVVxuICAgIC8vIGJvdW5kIGZvciB0aGF0IG11Y2ggdGltZSwgU29ja0pTIG1pZ2h0IG5vdCBub3RpY2UgdGhhdCB0aGUgdXNlciBoYXNcbiAgICAvLyByZWNvbm5lY3RlZCBiZWNhdXNlIHRoZSB0aW1lciAob2YgZGlzY29ubmVjdF9kZWxheSBtcykgY2FuIGZpcmUgYmVmb3JlXG4gICAgLy8gU29ja0pTIHByb2Nlc3NlcyB0aGUgbmV3IGNvbm5lY3Rpb24uIEV2ZW50dWFsbHkgd2UnbGwgZml4IHRoaXMgYnkgbm90XG4gICAgLy8gY29tYmluaW5nIENQVS1oZWF2eSBwcm9jZXNzaW5nIHdpdGggU29ja0pTIHRlcm1pbmF0aW9uIChlZyBhIHByb3h5IHdoaWNoXG4gICAgLy8gY29udmVydHMgdG8gVW5peCBzb2NrZXRzKSBidXQgZm9yIG5vdywgcmFpc2UgdGhlIGRlbGF5LlxuICAgIGRpc2Nvbm5lY3RfZGVsYXk6IDYwICogMTAwMCxcbiAgICAvLyBBbGxvdyBkaXNhYmxpbmcgb2YgQ09SUyByZXF1ZXN0cyB0byBhZGRyZXNzXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL21ldGVvci9tZXRlb3IvaXNzdWVzLzgzMTcuXG4gICAgZGlzYWJsZV9jb3JzOiAhIXByb2Nlc3MuZW52LkRJU0FCTEVfU09DS0pTX0NPUlMsXG4gICAgLy8gU2V0IHRoZSBVU0VfSlNFU1NJT05JRCBlbnZpcm9ubWVudCB2YXJpYWJsZSB0byBlbmFibGUgc2V0dGluZyB0aGVcbiAgICAvLyBKU0VTU0lPTklEIGNvb2tpZS4gVGhpcyBpcyB1c2VmdWwgZm9yIHNldHRpbmcgdXAgcHJveGllcyB3aXRoXG4gICAgLy8gc2Vzc2lvbiBhZmZpbml0eS5cbiAgICBqc2Vzc2lvbmlkOiAhIXByb2Nlc3MuZW52LlVTRV9KU0VTU0lPTklEXG4gIH07XG5cbiAgLy8gSWYgeW91IGtub3cgeW91ciBzZXJ2ZXIgZW52aXJvbm1lbnQgKGVnLCBwcm94aWVzKSB3aWxsIHByZXZlbnQgd2Vic29ja2V0c1xuICAvLyBmcm9tIGV2ZXIgd29ya2luZywgc2V0ICRESVNBQkxFX1dFQlNPQ0tFVFMgYW5kIFNvY2tKUyBjbGllbnRzIChpZSxcbiAgLy8gYnJvd3NlcnMpIHdpbGwgbm90IHdhc3RlIHRpbWUgYXR0ZW1wdGluZyB0byB1c2UgdGhlbS5cbiAgLy8gKFlvdXIgc2VydmVyIHdpbGwgc3RpbGwgaGF2ZSBhIC93ZWJzb2NrZXQgZW5kcG9pbnQuKVxuICBpZiAocHJvY2Vzcy5lbnYuRElTQUJMRV9XRUJTT0NLRVRTKSB7XG4gICAgc2VydmVyT3B0aW9ucy53ZWJzb2NrZXQgPSBmYWxzZTtcbiAgfSBlbHNlIHtcbiAgICBzZXJ2ZXJPcHRpb25zLmZheWVfc2VydmVyX29wdGlvbnMgPSB7XG4gICAgICBleHRlbnNpb25zOiB3ZWJzb2NrZXRFeHRlbnNpb25zKClcbiAgICB9O1xuICB9XG5cbiAgc2VsZi5zZXJ2ZXIgPSBzb2NranMuY3JlYXRlU2VydmVyKHNlcnZlck9wdGlvbnMpO1xuXG4gIC8vIEluc3RhbGwgdGhlIHNvY2tqcyBoYW5kbGVycywgYnV0IHdlIHdhbnQgdG8ga2VlcCBhcm91bmQgb3VyIG93biBwYXJ0aWN1bGFyXG4gIC8vIHJlcXVlc3QgaGFuZGxlciB0aGF0IGFkanVzdHMgaWRsZSB0aW1lb3V0cyB3aGlsZSB3ZSBoYXZlIGFuIG91dHN0YW5kaW5nXG4gIC8vIHJlcXVlc3QuICBUaGlzIGNvbXBlbnNhdGVzIGZvciB0aGUgZmFjdCB0aGF0IHNvY2tqcyByZW1vdmVzIGFsbCBsaXN0ZW5lcnNcbiAgLy8gZm9yIFwicmVxdWVzdFwiIHRvIGFkZCBpdHMgb3duLlxuICBXZWJBcHAuaHR0cFNlcnZlci5yZW1vdmVMaXN0ZW5lcihcbiAgICAncmVxdWVzdCcsIFdlYkFwcC5fdGltZW91dEFkanVzdG1lbnRSZXF1ZXN0Q2FsbGJhY2spO1xuICBzZWxmLnNlcnZlci5pbnN0YWxsSGFuZGxlcnMoV2ViQXBwLmh0dHBTZXJ2ZXIpO1xuICBXZWJBcHAuaHR0cFNlcnZlci5hZGRMaXN0ZW5lcihcbiAgICAncmVxdWVzdCcsIFdlYkFwcC5fdGltZW91dEFkanVzdG1lbnRSZXF1ZXN0Q2FsbGJhY2spO1xuXG4gIC8vIFN1cHBvcnQgdGhlIC93ZWJzb2NrZXQgZW5kcG9pbnRcbiAgc2VsZi5fcmVkaXJlY3RXZWJzb2NrZXRFbmRwb2ludCgpO1xuXG4gIHNlbGYuc2VydmVyLm9uKCdjb25uZWN0aW9uJywgZnVuY3Rpb24gKHNvY2tldCkge1xuICAgIC8vIHNvY2tqcyBzb21ldGltZXMgcGFzc2VzIHVzIG51bGwgaW5zdGVhZCBvZiBhIHNvY2tldCBvYmplY3RcbiAgICAvLyBzbyB3ZSBuZWVkIHRvIGd1YXJkIGFnYWluc3QgdGhhdC4gc2VlOlxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9zb2NranMvc29ja2pzLW5vZGUvaXNzdWVzLzEyMVxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tZXRlb3IvbWV0ZW9yL2lzc3Vlcy8xMDQ2OFxuICAgIGlmICghc29ja2V0KSByZXR1cm47XG5cbiAgICAvLyBXZSB3YW50IHRvIG1ha2Ugc3VyZSB0aGF0IGlmIGEgY2xpZW50IGNvbm5lY3RzIHRvIHVzIGFuZCBkb2VzIHRoZSBpbml0aWFsXG4gICAgLy8gV2Vic29ja2V0IGhhbmRzaGFrZSBidXQgbmV2ZXIgZ2V0cyB0byB0aGUgRERQIGhhbmRzaGFrZSwgdGhhdCB3ZVxuICAgIC8vIGV2ZW50dWFsbHkga2lsbCB0aGUgc29ja2V0LiAgT25jZSB0aGUgRERQIGhhbmRzaGFrZSBoYXBwZW5zLCBERFBcbiAgICAvLyBoZWFydGJlYXRpbmcgd2lsbCB3b3JrLiBBbmQgYmVmb3JlIHRoZSBXZWJzb2NrZXQgaGFuZHNoYWtlLCB0aGUgdGltZW91dHNcbiAgICAvLyB3ZSBzZXQgYXQgdGhlIHNlcnZlciBsZXZlbCBpbiB3ZWJhcHBfc2VydmVyLmpzIHdpbGwgd29yay4gQnV0XG4gICAgLy8gZmF5ZS13ZWJzb2NrZXQgY2FsbHMgc2V0VGltZW91dCgwKSBvbiBhbnkgc29ja2V0IGl0IHRha2VzIG92ZXIsIHNvIHRoZXJlXG4gICAgLy8gaXMgYW4gXCJpbiBiZXR3ZWVuXCIgc3RhdGUgd2hlcmUgdGhpcyBkb2Vzbid0IGhhcHBlbi4gIFdlIHdvcmsgYXJvdW5kIHRoaXNcbiAgICAvLyBieSBleHBsaWNpdGx5IHNldHRpbmcgdGhlIHNvY2tldCB0aW1lb3V0IHRvIGEgcmVsYXRpdmVseSBsYXJnZSB0aW1lIGhlcmUsXG4gICAgLy8gYW5kIHNldHRpbmcgaXQgYmFjayB0byB6ZXJvIHdoZW4gd2Ugc2V0IHVwIHRoZSBoZWFydGJlYXQgaW5cbiAgICAvLyBsaXZlZGF0YV9zZXJ2ZXIuanMuXG4gICAgc29ja2V0LnNldFdlYnNvY2tldFRpbWVvdXQgPSBmdW5jdGlvbiAodGltZW91dCkge1xuICAgICAgaWYgKChzb2NrZXQucHJvdG9jb2wgPT09ICd3ZWJzb2NrZXQnIHx8XG4gICAgICAgICAgIHNvY2tldC5wcm90b2NvbCA9PT0gJ3dlYnNvY2tldC1yYXcnKVxuICAgICAgICAgICYmIHNvY2tldC5fc2Vzc2lvbi5yZWN2KSB7XG4gICAgICAgIHNvY2tldC5fc2Vzc2lvbi5yZWN2LmNvbm5lY3Rpb24uc2V0VGltZW91dCh0aW1lb3V0KTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHNvY2tldC5zZXRXZWJzb2NrZXRUaW1lb3V0KDQ1ICogMTAwMCk7XG5cbiAgICBzb2NrZXQuc2VuZCA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICBzb2NrZXQud3JpdGUoZGF0YSk7XG4gICAgfTtcbiAgICBzb2NrZXQub24oJ2Nsb3NlJywgZnVuY3Rpb24gKCkge1xuICAgICAgc2VsZi5vcGVuX3NvY2tldHMgPSBzZWxmLm9wZW5fc29ja2V0cy5maWx0ZXIoZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlICE9PSBzb2NrZXQ7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBzZWxmLm9wZW5fc29ja2V0cy5wdXNoKHNvY2tldCk7XG5cbiAgICAvLyBvbmx5IHRvIHNlbmQgYSBtZXNzYWdlIGFmdGVyIGNvbm5lY3Rpb24gb24gdGVzdHMsIHVzZWZ1bCBmb3JcbiAgICAvLyBzb2NrZXQtc3RyZWFtLWNsaWVudC9zZXJ2ZXItdGVzdHMuanNcbiAgICBpZiAocHJvY2Vzcy5lbnYuVEVTVF9NRVRBREFUQSAmJiBwcm9jZXNzLmVudi5URVNUX01FVEFEQVRBICE9PSBcInt9XCIpIHtcbiAgICAgIHNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KHsgdGVzdE1lc3NhZ2VPbkNvbm5lY3Q6IHRydWUgfSkpO1xuICAgIH1cblxuICAgIC8vIGNhbGwgYWxsIG91ciBjYWxsYmFja3Mgd2hlbiB3ZSBnZXQgYSBuZXcgc29ja2V0LiB0aGV5IHdpbGwgZG8gdGhlXG4gICAgLy8gd29yayBvZiBzZXR0aW5nIHVwIGhhbmRsZXJzIGFuZCBzdWNoIGZvciBzcGVjaWZpYyBtZXNzYWdlcy5cbiAgICBzZWxmLnJlZ2lzdHJhdGlvbl9jYWxsYmFja3MuZm9yRWFjaChmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgIGNhbGxiYWNrKHNvY2tldCk7XG4gICAgfSk7XG4gIH0pO1xuXG59O1xuXG5PYmplY3QuYXNzaWduKFN0cmVhbVNlcnZlci5wcm90b3R5cGUsIHtcbiAgLy8gY2FsbCBteSBjYWxsYmFjayB3aGVuIGEgbmV3IHNvY2tldCBjb25uZWN0cy5cbiAgLy8gYWxzbyBjYWxsIGl0IGZvciBhbGwgY3VycmVudCBjb25uZWN0aW9ucy5cbiAgcmVnaXN0ZXI6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzZWxmLnJlZ2lzdHJhdGlvbl9jYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gICAgc2VsZi5hbGxfc29ja2V0cygpLmZvckVhY2goZnVuY3Rpb24gKHNvY2tldCkge1xuICAgICAgY2FsbGJhY2soc29ja2V0KTtcbiAgICB9KTtcbiAgfSxcblxuICAvLyBnZXQgYSBsaXN0IG9mIGFsbCBzb2NrZXRzXG4gIGFsbF9zb2NrZXRzOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBPYmplY3QudmFsdWVzKHNlbGYub3Blbl9zb2NrZXRzKTtcbiAgfSxcblxuICAvLyBSZWRpcmVjdCAvd2Vic29ja2V0IHRvIC9zb2NranMvd2Vic29ja2V0IGluIG9yZGVyIHRvIG5vdCBleHBvc2VcbiAgLy8gc29ja2pzIHRvIGNsaWVudHMgdGhhdCB3YW50IHRvIHVzZSByYXcgd2Vic29ja2V0c1xuICBfcmVkaXJlY3RXZWJzb2NrZXRFbmRwb2ludDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIC8vIFVuZm9ydHVuYXRlbHkgd2UgY2FuJ3QgdXNlIGEgY29ubmVjdCBtaWRkbGV3YXJlIGhlcmUgc2luY2VcbiAgICAvLyBzb2NranMgaW5zdGFsbHMgaXRzZWxmIHByaW9yIHRvIGFsbCBleGlzdGluZyBsaXN0ZW5lcnNcbiAgICAvLyAobWVhbmluZyBwcmlvciB0byBhbnkgY29ubmVjdCBtaWRkbGV3YXJlcykgc28gd2UgbmVlZCB0byB0YWtlXG4gICAgLy8gYW4gYXBwcm9hY2ggc2ltaWxhciB0byBvdmVyc2hhZG93TGlzdGVuZXJzIGluXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3NvY2tqcy9zb2NranMtbm9kZS9ibG9iL2NmODIwYzU1YWY2YTk5NTNlMTY1NTg1NTVhMzFkZWNlYTU1NGY3MGUvc3JjL3V0aWxzLmNvZmZlZVxuICAgIFsncmVxdWVzdCcsICd1cGdyYWRlJ10uZm9yRWFjaCgoZXZlbnQpID0+IHtcbiAgICAgIHZhciBodHRwU2VydmVyID0gV2ViQXBwLmh0dHBTZXJ2ZXI7XG4gICAgICB2YXIgb2xkSHR0cFNlcnZlckxpc3RlbmVycyA9IGh0dHBTZXJ2ZXIubGlzdGVuZXJzKGV2ZW50KS5zbGljZSgwKTtcbiAgICAgIGh0dHBTZXJ2ZXIucmVtb3ZlQWxsTGlzdGVuZXJzKGV2ZW50KTtcblxuICAgICAgLy8gcmVxdWVzdCBhbmQgdXBncmFkZSBoYXZlIGRpZmZlcmVudCBhcmd1bWVudHMgcGFzc2VkIGJ1dFxuICAgICAgLy8gd2Ugb25seSBjYXJlIGFib3V0IHRoZSBmaXJzdCBvbmUgd2hpY2ggaXMgYWx3YXlzIHJlcXVlc3RcbiAgICAgIHZhciBuZXdMaXN0ZW5lciA9IGZ1bmN0aW9uKHJlcXVlc3QgLyosIG1vcmVBcmd1bWVudHMgKi8pIHtcbiAgICAgICAgLy8gU3RvcmUgYXJndW1lbnRzIGZvciB1c2Ugd2l0aGluIHRoZSBjbG9zdXJlIGJlbG93XG4gICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuXG4gICAgICAgIC8vIFRPRE8gcmVwbGFjZSB3aXRoIHVybCBwYWNrYWdlXG4gICAgICAgIHZhciB1cmwgPSBOcG0ucmVxdWlyZSgndXJsJyk7XG5cbiAgICAgICAgLy8gUmV3cml0ZSAvd2Vic29ja2V0IGFuZCAvd2Vic29ja2V0LyB1cmxzIHRvIC9zb2NranMvd2Vic29ja2V0IHdoaWxlXG4gICAgICAgIC8vIHByZXNlcnZpbmcgcXVlcnkgc3RyaW5nLlxuICAgICAgICB2YXIgcGFyc2VkVXJsID0gdXJsLnBhcnNlKHJlcXVlc3QudXJsKTtcbiAgICAgICAgaWYgKHBhcnNlZFVybC5wYXRobmFtZSA9PT0gcGF0aFByZWZpeCArICcvd2Vic29ja2V0JyB8fFxuICAgICAgICAgICAgcGFyc2VkVXJsLnBhdGhuYW1lID09PSBwYXRoUHJlZml4ICsgJy93ZWJzb2NrZXQvJykge1xuICAgICAgICAgIHBhcnNlZFVybC5wYXRobmFtZSA9IHNlbGYucHJlZml4ICsgJy93ZWJzb2NrZXQnO1xuICAgICAgICAgIHJlcXVlc3QudXJsID0gdXJsLmZvcm1hdChwYXJzZWRVcmwpO1xuICAgICAgICB9XG4gICAgICAgIG9sZEh0dHBTZXJ2ZXJMaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbihvbGRMaXN0ZW5lcikge1xuICAgICAgICAgIG9sZExpc3RlbmVyLmFwcGx5KGh0dHBTZXJ2ZXIsIGFyZ3MpO1xuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgICBodHRwU2VydmVyLmFkZExpc3RlbmVyKGV2ZW50LCBuZXdMaXN0ZW5lcik7XG4gICAgfSk7XG4gIH1cbn0pOyIsImltcG9ydCBpc0VtcHR5IGZyb20gJ2xvZGFzaC5pc2VtcHR5JztcbmltcG9ydCBpc09iamVjdCBmcm9tICdsb2Rhc2guaXNvYmplY3QnO1xuaW1wb3J0IGlzU3RyaW5nIGZyb20gJ2xvZGFzaC5pc3N0cmluZyc7XG5pbXBvcnQgeyBTZXNzaW9uQ29sbGVjdGlvblZpZXcgfSBmcm9tICcuL3Nlc3Npb25fY29sbGVjdGlvbl92aWV3JztcbmltcG9ydCB7IFNlc3Npb25Eb2N1bWVudFZpZXcgfSBmcm9tICcuL3Nlc3Npb25fZG9jdW1lbnRfdmlldyc7XG5cbkREUFNlcnZlciA9IHt9O1xuXG5cbi8vIFB1YmxpY2F0aW9uIHN0cmF0ZWdpZXMgZGVmaW5lIGhvdyB3ZSBoYW5kbGUgZGF0YSBmcm9tIHB1Ymxpc2hlZCBjdXJzb3JzIGF0IHRoZSBjb2xsZWN0aW9uIGxldmVsXG4vLyBUaGlzIGFsbG93cyBzb21lb25lIHRvOlxuLy8gLSBDaG9vc2UgYSB0cmFkZS1vZmYgYmV0d2VlbiBjbGllbnQtc2VydmVyIGJhbmR3aWR0aCBhbmQgc2VydmVyIG1lbW9yeSB1c2FnZVxuLy8gLSBJbXBsZW1lbnQgc3BlY2lhbCAobm9uLW1vbmdvKSBjb2xsZWN0aW9ucyBsaWtlIHZvbGF0aWxlIG1lc3NhZ2UgcXVldWVzXG5jb25zdCBwdWJsaWNhdGlvblN0cmF0ZWdpZXMgPSB7XG4gIC8vIFNFUlZFUl9NRVJHRSBpcyB0aGUgZGVmYXVsdCBzdHJhdGVneS5cbiAgLy8gV2hlbiB1c2luZyB0aGlzIHN0cmF0ZWd5LCB0aGUgc2VydmVyIG1haW50YWlucyBhIGNvcHkgb2YgYWxsIGRhdGEgYSBjb25uZWN0aW9uIGlzIHN1YnNjcmliZWQgdG8uXG4gIC8vIFRoaXMgYWxsb3dzIHVzIHRvIG9ubHkgc2VuZCBkZWx0YXMgb3ZlciBtdWx0aXBsZSBwdWJsaWNhdGlvbnMuXG4gIFNFUlZFUl9NRVJHRToge1xuICAgIHVzZUR1bW15RG9jdW1lbnRWaWV3OiBmYWxzZSxcbiAgICB1c2VDb2xsZWN0aW9uVmlldzogdHJ1ZSxcbiAgICBkb0FjY291bnRpbmdGb3JDb2xsZWN0aW9uOiB0cnVlLFxuICB9LFxuICAvLyBUaGUgTk9fTUVSR0VfTk9fSElTVE9SWSBzdHJhdGVneSByZXN1bHRzIGluIHRoZSBzZXJ2ZXIgc2VuZGluZyBhbGwgcHVibGljYXRpb24gZGF0YVxuICAvLyBkaXJlY3RseSB0byB0aGUgY2xpZW50LiBJdCBkb2VzIG5vdCByZW1lbWJlciB3aGF0IGl0IGhhcyBwcmV2aW91c2x5IHNlbnRcbiAgLy8gdG8gaXQgd2lsbCBub3QgdHJpZ2dlciByZW1vdmVkIG1lc3NhZ2VzIHdoZW4gYSBzdWJzY3JpcHRpb24gaXMgc3RvcHBlZC5cbiAgLy8gVGhpcyBzaG91bGQgb25seSBiZSBjaG9zZW4gZm9yIHNwZWNpYWwgdXNlIGNhc2VzIGxpa2Ugc2VuZC1hbmQtZm9yZ2V0IHF1ZXVlcy5cbiAgTk9fTUVSR0VfTk9fSElTVE9SWToge1xuICAgIHVzZUR1bW15RG9jdW1lbnRWaWV3OiBmYWxzZSxcbiAgICB1c2VDb2xsZWN0aW9uVmlldzogZmFsc2UsXG4gICAgZG9BY2NvdW50aW5nRm9yQ29sbGVjdGlvbjogZmFsc2UsXG4gIH0sXG4gIC8vIE5PX01FUkdFIGlzIHNpbWlsYXIgdG8gTk9fTUVSR0VfTk9fSElTVE9SWSBidXQgdGhlIHNlcnZlciB3aWxsIHJlbWVtYmVyIHRoZSBJRHMgaXQgaGFzXG4gIC8vIHNlbnQgdG8gdGhlIGNsaWVudCBzbyBpdCBjYW4gcmVtb3ZlIHRoZW0gd2hlbiBhIHN1YnNjcmlwdGlvbiBpcyBzdG9wcGVkLlxuICAvLyBUaGlzIHN0cmF0ZWd5IGNhbiBiZSB1c2VkIHdoZW4gYSBjb2xsZWN0aW9uIGlzIG9ubHkgdXNlZCBpbiBhIHNpbmdsZSBwdWJsaWNhdGlvbi5cbiAgTk9fTUVSR0U6IHtcbiAgICB1c2VEdW1teURvY3VtZW50VmlldzogZmFsc2UsXG4gICAgdXNlQ29sbGVjdGlvblZpZXc6IGZhbHNlLFxuICAgIGRvQWNjb3VudGluZ0ZvckNvbGxlY3Rpb246IHRydWUsXG4gIH0sXG4gIC8vIE5PX01FUkdFX01VTFRJIGlzIHNpbWlsYXIgdG8gYE5PX01FUkdFYCwgYnV0IGl0IGRvZXMgdHJhY2sgd2hldGhlciBhIGRvY3VtZW50IGlzXG4gIC8vIHVzZWQgYnkgbXVsdGlwbGUgcHVibGljYXRpb25zLiBUaGlzIGhhcyBzb21lIG1lbW9yeSBvdmVyaGVhZCwgYnV0IGl0IHN0aWxsIGRvZXMgbm90IGRvXG4gIC8vIGRpZmZpbmcgc28gaXQncyBmYXN0ZXIgYW5kIHNsaW1tZXIgdGhhbiBTRVJWRVJfTUVSR0UuXG4gIE5PX01FUkdFX01VTFRJOiB7XG4gICAgdXNlRHVtbXlEb2N1bWVudFZpZXc6IHRydWUsXG4gICAgdXNlQ29sbGVjdGlvblZpZXc6IHRydWUsXG4gICAgZG9BY2NvdW50aW5nRm9yQ29sbGVjdGlvbjogdHJ1ZVxuICB9XG59O1xuXG5ERFBTZXJ2ZXIucHVibGljYXRpb25TdHJhdGVnaWVzID0gcHVibGljYXRpb25TdHJhdGVnaWVzO1xuXG4vLyBUaGlzIGZpbGUgY29udGFpbnMgY2xhc3Nlczpcbi8vICogU2Vzc2lvbiAtIFRoZSBzZXJ2ZXIncyBjb25uZWN0aW9uIHRvIGEgc2luZ2xlIEREUCBjbGllbnRcbi8vICogU3Vic2NyaXB0aW9uIC0gQSBzaW5nbGUgc3Vic2NyaXB0aW9uIGZvciBhIHNpbmdsZSBjbGllbnRcbi8vICogU2VydmVyIC0gQW4gZW50aXJlIHNlcnZlciB0aGF0IG1heSB0YWxrIHRvID4gMSBjbGllbnQuIEEgRERQIGVuZHBvaW50LlxuLy9cbi8vIFNlc3Npb24gYW5kIFN1YnNjcmlwdGlvbiBhcmUgZmlsZSBzY29wZS4gRm9yIG5vdywgdW50aWwgd2UgZnJlZXplXG4vLyB0aGUgaW50ZXJmYWNlLCBTZXJ2ZXIgaXMgcGFja2FnZSBzY29wZSAoaW4gdGhlIGZ1dHVyZSBpdCBzaG91bGQgYmVcbi8vIGV4cG9ydGVkKS5cblxuXG5ERFBTZXJ2ZXIuX1Nlc3Npb25Eb2N1bWVudFZpZXcgPSBTZXNzaW9uRG9jdW1lbnRWaWV3O1xuXG5ERFBTZXJ2ZXIuX2dldEN1cnJlbnRGZW5jZSA9IGZ1bmN0aW9uICgpIHtcbiAgbGV0IGN1cnJlbnRJbnZvY2F0aW9uID0gdGhpcy5fQ3VycmVudFdyaXRlRmVuY2UuZ2V0KCk7XG4gIGlmIChjdXJyZW50SW52b2NhdGlvbikge1xuICAgIHJldHVybiBjdXJyZW50SW52b2NhdGlvbjtcbiAgfVxuICBjdXJyZW50SW52b2NhdGlvbiA9IEREUC5fQ3VycmVudE1ldGhvZEludm9jYXRpb24uZ2V0KCk7XG4gIHJldHVybiBjdXJyZW50SW52b2NhdGlvbiA/IGN1cnJlbnRJbnZvY2F0aW9uLmZlbmNlIDogdW5kZWZpbmVkO1xufTtcblxuXG5ERFBTZXJ2ZXIuX1Nlc3Npb25Db2xsZWN0aW9uVmlldyA9IFNlc3Npb25Db2xsZWN0aW9uVmlldztcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qIFNlc3Npb24gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG52YXIgU2Vzc2lvbiA9IGZ1bmN0aW9uIChzZXJ2ZXIsIHZlcnNpb24sIHNvY2tldCwgb3B0aW9ucykge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHNlbGYuaWQgPSBSYW5kb20uaWQoKTtcblxuICBzZWxmLnNlcnZlciA9IHNlcnZlcjtcbiAgc2VsZi52ZXJzaW9uID0gdmVyc2lvbjtcblxuICBzZWxmLmluaXRpYWxpemVkID0gZmFsc2U7XG4gIHNlbGYuc29ja2V0ID0gc29ja2V0O1xuXG4gIC8vIFNldCB0byBudWxsIHdoZW4gdGhlIHNlc3Npb24gaXMgZGVzdHJveWVkLiBNdWx0aXBsZSBwbGFjZXMgYmVsb3dcbiAgLy8gdXNlIHRoaXMgdG8gZGV0ZXJtaW5lIGlmIHRoZSBzZXNzaW9uIGlzIGFsaXZlIG9yIG5vdC5cbiAgc2VsZi5pblF1ZXVlID0gbmV3IE1ldGVvci5fRG91YmxlRW5kZWRRdWV1ZSgpO1xuXG4gIHNlbGYuYmxvY2tlZCA9IGZhbHNlO1xuICBzZWxmLndvcmtlclJ1bm5pbmcgPSBmYWxzZTtcblxuICBzZWxmLmNhY2hlZFVuYmxvY2sgPSBudWxsO1xuXG4gIC8vIFN1YiBvYmplY3RzIGZvciBhY3RpdmUgc3Vic2NyaXB0aW9uc1xuICBzZWxmLl9uYW1lZFN1YnMgPSBuZXcgTWFwKCk7XG4gIHNlbGYuX3VuaXZlcnNhbFN1YnMgPSBbXTtcblxuICBzZWxmLnVzZXJJZCA9IG51bGw7XG5cbiAgc2VsZi5jb2xsZWN0aW9uVmlld3MgPSBuZXcgTWFwKCk7XG5cbiAgLy8gU2V0IHRoaXMgdG8gZmFsc2UgdG8gbm90IHNlbmQgbWVzc2FnZXMgd2hlbiBjb2xsZWN0aW9uVmlld3MgYXJlXG4gIC8vIG1vZGlmaWVkLiBUaGlzIGlzIGRvbmUgd2hlbiByZXJ1bm5pbmcgc3VicyBpbiBfc2V0VXNlcklkIGFuZCB0aG9zZSBtZXNzYWdlc1xuICAvLyBhcmUgY2FsY3VsYXRlZCB2aWEgYSBkaWZmIGluc3RlYWQuXG4gIHNlbGYuX2lzU2VuZGluZyA9IHRydWU7XG5cbiAgLy8gSWYgdGhpcyBpcyB0cnVlLCBkb24ndCBzdGFydCBhIG5ld2x5LWNyZWF0ZWQgdW5pdmVyc2FsIHB1Ymxpc2hlciBvbiB0aGlzXG4gIC8vIHNlc3Npb24uIFRoZSBzZXNzaW9uIHdpbGwgdGFrZSBjYXJlIG9mIHN0YXJ0aW5nIGl0IHdoZW4gYXBwcm9wcmlhdGUuXG4gIHNlbGYuX2RvbnRTdGFydE5ld1VuaXZlcnNhbFN1YnMgPSBmYWxzZTtcblxuICAvLyBXaGVuIHdlIGFyZSByZXJ1bm5pbmcgc3Vic2NyaXB0aW9ucywgYW55IHJlYWR5IG1lc3NhZ2VzXG4gIC8vIHdlIHdhbnQgdG8gYnVmZmVyIHVwIGZvciB3aGVuIHdlIGFyZSBkb25lIHJlcnVubmluZyBzdWJzY3JpcHRpb25zXG4gIHNlbGYuX3BlbmRpbmdSZWFkeSA9IFtdO1xuXG4gIC8vIExpc3Qgb2YgY2FsbGJhY2tzIHRvIGNhbGwgd2hlbiB0aGlzIGNvbm5lY3Rpb24gaXMgY2xvc2VkLlxuICBzZWxmLl9jbG9zZUNhbGxiYWNrcyA9IFtdO1xuXG5cbiAgLy8gWFhYIEhBQ0s6IElmIGEgc29ja2pzIGNvbm5lY3Rpb24sIHNhdmUgb2ZmIHRoZSBVUkwuIFRoaXMgaXNcbiAgLy8gdGVtcG9yYXJ5IGFuZCB3aWxsIGdvIGF3YXkgaW4gdGhlIG5lYXIgZnV0dXJlLlxuICBzZWxmLl9zb2NrZXRVcmwgPSBzb2NrZXQudXJsO1xuXG4gIC8vIEFsbG93IHRlc3RzIHRvIGRpc2FibGUgcmVzcG9uZGluZyB0byBwaW5ncy5cbiAgc2VsZi5fcmVzcG9uZFRvUGluZ3MgPSBvcHRpb25zLnJlc3BvbmRUb1BpbmdzO1xuXG4gIC8vIFRoaXMgb2JqZWN0IGlzIHRoZSBwdWJsaWMgaW50ZXJmYWNlIHRvIHRoZSBzZXNzaW9uLiBJbiB0aGUgcHVibGljXG4gIC8vIEFQSSwgaXQgaXMgY2FsbGVkIHRoZSBgY29ubmVjdGlvbmAgb2JqZWN0LiAgSW50ZXJuYWxseSB3ZSBjYWxsIGl0XG4gIC8vIGEgYGNvbm5lY3Rpb25IYW5kbGVgIHRvIGF2b2lkIGFtYmlndWl0eS5cbiAgc2VsZi5jb25uZWN0aW9uSGFuZGxlID0ge1xuICAgIGlkOiBzZWxmLmlkLFxuICAgIGNsb3NlOiBmdW5jdGlvbiAoKSB7XG4gICAgICBzZWxmLmNsb3NlKCk7XG4gICAgfSxcbiAgICBvbkNsb3NlOiBmdW5jdGlvbiAoZm4pIHtcbiAgICAgIHZhciBjYiA9IE1ldGVvci5iaW5kRW52aXJvbm1lbnQoZm4sIFwiY29ubmVjdGlvbiBvbkNsb3NlIGNhbGxiYWNrXCIpO1xuICAgICAgaWYgKHNlbGYuaW5RdWV1ZSkge1xuICAgICAgICBzZWxmLl9jbG9zZUNhbGxiYWNrcy5wdXNoKGNiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGlmIHdlJ3JlIGFscmVhZHkgY2xvc2VkLCBjYWxsIHRoZSBjYWxsYmFjay5cbiAgICAgICAgTWV0ZW9yLmRlZmVyKGNiKTtcbiAgICAgIH1cbiAgICB9LFxuICAgIGNsaWVudEFkZHJlc3M6IHNlbGYuX2NsaWVudEFkZHJlc3MoKSxcbiAgICBodHRwSGVhZGVyczogc2VsZi5zb2NrZXQuaGVhZGVyc1xuICB9O1xuXG4gIHNlbGYuc2VuZCh7IG1zZzogJ2Nvbm5lY3RlZCcsIHNlc3Npb246IHNlbGYuaWQgfSk7XG5cbiAgLy8gT24gaW5pdGlhbCBjb25uZWN0LCBzcGluIHVwIGFsbCB0aGUgdW5pdmVyc2FsIHB1Ymxpc2hlcnMuXG4gIHNlbGYuc3RhcnRVbml2ZXJzYWxTdWJzKCk7XG5cbiAgaWYgKHZlcnNpb24gIT09ICdwcmUxJyAmJiBvcHRpb25zLmhlYXJ0YmVhdEludGVydmFsICE9PSAwKSB7XG4gICAgLy8gV2Ugbm8gbG9uZ2VyIG5lZWQgdGhlIGxvdyBsZXZlbCB0aW1lb3V0IGJlY2F1c2Ugd2UgaGF2ZSBoZWFydGJlYXRzLlxuICAgIHNvY2tldC5zZXRXZWJzb2NrZXRUaW1lb3V0KDApO1xuXG4gICAgc2VsZi5oZWFydGJlYXQgPSBuZXcgRERQQ29tbW9uLkhlYXJ0YmVhdCh7XG4gICAgICBoZWFydGJlYXRJbnRlcnZhbDogb3B0aW9ucy5oZWFydGJlYXRJbnRlcnZhbCxcbiAgICAgIGhlYXJ0YmVhdFRpbWVvdXQ6IG9wdGlvbnMuaGVhcnRiZWF0VGltZW91dCxcbiAgICAgIG9uVGltZW91dDogZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLmNsb3NlKCk7XG4gICAgICB9LFxuICAgICAgc2VuZFBpbmc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2VsZi5zZW5kKHttc2c6ICdwaW5nJ30pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHNlbGYuaGVhcnRiZWF0LnN0YXJ0KCk7XG4gIH1cblxuICBQYWNrYWdlWydmYWN0cy1iYXNlJ10gJiYgUGFja2FnZVsnZmFjdHMtYmFzZSddLkZhY3RzLmluY3JlbWVudFNlcnZlckZhY3QoXG4gICAgXCJsaXZlZGF0YVwiLCBcInNlc3Npb25zXCIsIDEpO1xufTtcblxuT2JqZWN0LmFzc2lnbihTZXNzaW9uLnByb3RvdHlwZSwge1xuICBzZW5kUmVhZHk6IGZ1bmN0aW9uIChzdWJzY3JpcHRpb25JZHMpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKHNlbGYuX2lzU2VuZGluZykge1xuICAgICAgc2VsZi5zZW5kKHttc2c6IFwicmVhZHlcIiwgc3Viczogc3Vic2NyaXB0aW9uSWRzfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN1YnNjcmlwdGlvbklkcy5mb3JFYWNoKGZ1bmN0aW9uIChzdWJzY3JpcHRpb25JZCkge1xuICAgICAgICBzZWxmLl9wZW5kaW5nUmVhZHkucHVzaChzdWJzY3JpcHRpb25JZCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgX2NhblNlbmQoY29sbGVjdGlvbk5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5faXNTZW5kaW5nIHx8ICF0aGlzLnNlcnZlci5nZXRQdWJsaWNhdGlvblN0cmF0ZWd5KGNvbGxlY3Rpb25OYW1lKS51c2VDb2xsZWN0aW9uVmlldztcbiAgfSxcblxuXG4gIHNlbmRBZGRlZChjb2xsZWN0aW9uTmFtZSwgaWQsIGZpZWxkcykge1xuICAgIGlmICh0aGlzLl9jYW5TZW5kKGNvbGxlY3Rpb25OYW1lKSkge1xuICAgICAgdGhpcy5zZW5kKHsgbXNnOiAnYWRkZWQnLCBjb2xsZWN0aW9uOiBjb2xsZWN0aW9uTmFtZSwgaWQsIGZpZWxkcyB9KTtcbiAgICB9XG4gIH0sXG5cbiAgc2VuZENoYW5nZWQoY29sbGVjdGlvbk5hbWUsIGlkLCBmaWVsZHMpIHtcbiAgICBpZiAoaXNFbXB0eShmaWVsZHMpKVxuICAgICAgcmV0dXJuO1xuXG4gICAgaWYgKHRoaXMuX2NhblNlbmQoY29sbGVjdGlvbk5hbWUpKSB7XG4gICAgICB0aGlzLnNlbmQoe1xuICAgICAgICBtc2c6IFwiY2hhbmdlZFwiLFxuICAgICAgICBjb2xsZWN0aW9uOiBjb2xsZWN0aW9uTmFtZSxcbiAgICAgICAgaWQsXG4gICAgICAgIGZpZWxkc1xuICAgICAgfSk7XG4gICAgfVxuICB9LFxuXG4gIHNlbmRSZW1vdmVkKGNvbGxlY3Rpb25OYW1lLCBpZCkge1xuICAgIGlmICh0aGlzLl9jYW5TZW5kKGNvbGxlY3Rpb25OYW1lKSkge1xuICAgICAgdGhpcy5zZW5kKHttc2c6IFwicmVtb3ZlZFwiLCBjb2xsZWN0aW9uOiBjb2xsZWN0aW9uTmFtZSwgaWR9KTtcbiAgICB9XG4gIH0sXG5cbiAgZ2V0U2VuZENhbGxiYWNrczogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4ge1xuICAgICAgYWRkZWQ6IHNlbGYuc2VuZEFkZGVkLmJpbmQoc2VsZiksXG4gICAgICBjaGFuZ2VkOiBzZWxmLnNlbmRDaGFuZ2VkLmJpbmQoc2VsZiksXG4gICAgICByZW1vdmVkOiBzZWxmLnNlbmRSZW1vdmVkLmJpbmQoc2VsZilcbiAgICB9O1xuICB9LFxuXG4gIGdldENvbGxlY3Rpb25WaWV3OiBmdW5jdGlvbiAoY29sbGVjdGlvbk5hbWUpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIHJldCA9IHNlbGYuY29sbGVjdGlvblZpZXdzLmdldChjb2xsZWN0aW9uTmFtZSk7XG4gICAgaWYgKCFyZXQpIHtcbiAgICAgIHJldCA9IG5ldyBTZXNzaW9uQ29sbGVjdGlvblZpZXcoY29sbGVjdGlvbk5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5nZXRTZW5kQ2FsbGJhY2tzKCkpO1xuICAgICAgc2VsZi5jb2xsZWN0aW9uVmlld3Muc2V0KGNvbGxlY3Rpb25OYW1lLCByZXQpO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9LFxuXG4gIGFkZGVkKHN1YnNjcmlwdGlvbkhhbmRsZSwgY29sbGVjdGlvbk5hbWUsIGlkLCBmaWVsZHMpIHtcbiAgICBpZiAodGhpcy5zZXJ2ZXIuZ2V0UHVibGljYXRpb25TdHJhdGVneShjb2xsZWN0aW9uTmFtZSkudXNlQ29sbGVjdGlvblZpZXcpIHtcbiAgICAgIGNvbnN0IHZpZXcgPSB0aGlzLmdldENvbGxlY3Rpb25WaWV3KGNvbGxlY3Rpb25OYW1lKTtcbiAgICAgIHZpZXcuYWRkZWQoc3Vic2NyaXB0aW9uSGFuZGxlLCBpZCwgZmllbGRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZW5kQWRkZWQoY29sbGVjdGlvbk5hbWUsIGlkLCBmaWVsZHMpO1xuICAgIH1cbiAgfSxcblxuICByZW1vdmVkKHN1YnNjcmlwdGlvbkhhbmRsZSwgY29sbGVjdGlvbk5hbWUsIGlkKSB7XG4gICAgaWYgKHRoaXMuc2VydmVyLmdldFB1YmxpY2F0aW9uU3RyYXRlZ3koY29sbGVjdGlvbk5hbWUpLnVzZUNvbGxlY3Rpb25WaWV3KSB7XG4gICAgICBjb25zdCB2aWV3ID0gdGhpcy5nZXRDb2xsZWN0aW9uVmlldyhjb2xsZWN0aW9uTmFtZSk7XG4gICAgICB2aWV3LnJlbW92ZWQoc3Vic2NyaXB0aW9uSGFuZGxlLCBpZCk7XG4gICAgICBpZiAodmlldy5pc0VtcHR5KCkpIHtcbiAgICAgICAgIHRoaXMuY29sbGVjdGlvblZpZXdzLmRlbGV0ZShjb2xsZWN0aW9uTmFtZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2VuZFJlbW92ZWQoY29sbGVjdGlvbk5hbWUsIGlkKTtcbiAgICB9XG4gIH0sXG5cbiAgY2hhbmdlZChzdWJzY3JpcHRpb25IYW5kbGUsIGNvbGxlY3Rpb25OYW1lLCBpZCwgZmllbGRzKSB7XG4gICAgaWYgKHRoaXMuc2VydmVyLmdldFB1YmxpY2F0aW9uU3RyYXRlZ3koY29sbGVjdGlvbk5hbWUpLnVzZUNvbGxlY3Rpb25WaWV3KSB7XG4gICAgICBjb25zdCB2aWV3ID0gdGhpcy5nZXRDb2xsZWN0aW9uVmlldyhjb2xsZWN0aW9uTmFtZSk7XG4gICAgICB2aWV3LmNoYW5nZWQoc3Vic2NyaXB0aW9uSGFuZGxlLCBpZCwgZmllbGRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZW5kQ2hhbmdlZChjb2xsZWN0aW9uTmFtZSwgaWQsIGZpZWxkcyk7XG4gICAgfVxuICB9LFxuXG4gIHN0YXJ0VW5pdmVyc2FsU3ViczogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAvLyBNYWtlIGEgc2hhbGxvdyBjb3B5IG9mIHRoZSBzZXQgb2YgdW5pdmVyc2FsIGhhbmRsZXJzIGFuZCBzdGFydCB0aGVtLiBJZlxuICAgIC8vIGFkZGl0aW9uYWwgdW5pdmVyc2FsIHB1Ymxpc2hlcnMgc3RhcnQgd2hpbGUgd2UncmUgcnVubmluZyB0aGVtIChkdWUgdG9cbiAgICAvLyB5aWVsZGluZyksIHRoZXkgd2lsbCBydW4gc2VwYXJhdGVseSBhcyBwYXJ0IG9mIFNlcnZlci5wdWJsaXNoLlxuICAgIHZhciBoYW5kbGVycyA9IFsuLi5zZWxmLnNlcnZlci51bml2ZXJzYWxfcHVibGlzaF9oYW5kbGVyc107XG4gICAgaGFuZGxlcnMuZm9yRWFjaChmdW5jdGlvbiAoaGFuZGxlcikge1xuICAgICAgc2VsZi5fc3RhcnRTdWJzY3JpcHRpb24oaGFuZGxlcik7XG4gICAgfSk7XG4gIH0sXG5cbiAgLy8gRGVzdHJveSB0aGlzIHNlc3Npb24gYW5kIHVucmVnaXN0ZXIgaXQgYXQgdGhlIHNlcnZlci5cbiAgY2xvc2U6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAvLyBEZXN0cm95IHRoaXMgc2Vzc2lvbiwgZXZlbiBpZiBpdCdzIG5vdCByZWdpc3RlcmVkIGF0IHRoZVxuICAgIC8vIHNlcnZlci4gU3RvcCBhbGwgcHJvY2Vzc2luZyBhbmQgdGVhciBldmVyeXRoaW5nIGRvd24uIElmIGEgc29ja2V0XG4gICAgLy8gd2FzIGF0dGFjaGVkLCBjbG9zZSBpdC5cblxuICAgIC8vIEFscmVhZHkgZGVzdHJveWVkLlxuICAgIGlmICghIHNlbGYuaW5RdWV1ZSlcbiAgICAgIHJldHVybjtcblxuICAgIC8vIERyb3AgdGhlIG1lcmdlIGJveCBkYXRhIGltbWVkaWF0ZWx5LlxuICAgIHNlbGYuaW5RdWV1ZSA9IG51bGw7XG4gICAgc2VsZi5jb2xsZWN0aW9uVmlld3MgPSBuZXcgTWFwKCk7XG5cbiAgICBpZiAoc2VsZi5oZWFydGJlYXQpIHtcbiAgICAgIHNlbGYuaGVhcnRiZWF0LnN0b3AoKTtcbiAgICAgIHNlbGYuaGVhcnRiZWF0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoc2VsZi5zb2NrZXQpIHtcbiAgICAgIHNlbGYuc29ja2V0LmNsb3NlKCk7XG4gICAgICBzZWxmLnNvY2tldC5fbWV0ZW9yU2Vzc2lvbiA9IG51bGw7XG4gICAgfVxuXG4gICAgUGFja2FnZVsnZmFjdHMtYmFzZSddICYmIFBhY2thZ2VbJ2ZhY3RzLWJhc2UnXS5GYWN0cy5pbmNyZW1lbnRTZXJ2ZXJGYWN0KFxuICAgICAgXCJsaXZlZGF0YVwiLCBcInNlc3Npb25zXCIsIC0xKTtcblxuICAgIE1ldGVvci5kZWZlcihmdW5jdGlvbiAoKSB7XG4gICAgICAvLyBTdG9wIGNhbGxiYWNrcyBjYW4geWllbGQsIHNvIHdlIGRlZmVyIHRoaXMgb24gY2xvc2UuXG4gICAgICAvLyBzdWIuX2lzRGVhY3RpdmF0ZWQoKSBkZXRlY3RzIHRoYXQgd2Ugc2V0IGluUXVldWUgdG8gbnVsbCBhbmRcbiAgICAgIC8vIHRyZWF0cyBpdCBhcyBzZW1pLWRlYWN0aXZhdGVkIChpdCB3aWxsIGlnbm9yZSBpbmNvbWluZyBjYWxsYmFja3MsIGV0YykuXG4gICAgICBzZWxmLl9kZWFjdGl2YXRlQWxsU3Vic2NyaXB0aW9ucygpO1xuXG4gICAgICAvLyBEZWZlciBjYWxsaW5nIHRoZSBjbG9zZSBjYWxsYmFja3MsIHNvIHRoYXQgdGhlIGNhbGxlciBjbG9zaW5nXG4gICAgICAvLyB0aGUgc2Vzc2lvbiBpc24ndCB3YWl0aW5nIGZvciBhbGwgdGhlIGNhbGxiYWNrcyB0byBjb21wbGV0ZS5cbiAgICAgIHNlbGYuX2Nsb3NlQ2FsbGJhY2tzLmZvckVhY2goZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIFVucmVnaXN0ZXIgdGhlIHNlc3Npb24uXG4gICAgc2VsZi5zZXJ2ZXIuX3JlbW92ZVNlc3Npb24oc2VsZik7XG4gIH0sXG5cbiAgLy8gU2VuZCBhIG1lc3NhZ2UgKGRvaW5nIG5vdGhpbmcgaWYgbm8gc29ja2V0IGlzIGNvbm5lY3RlZCByaWdodCBub3cpLlxuICAvLyBJdCBzaG91bGQgYmUgYSBKU09OIG9iamVjdCAoaXQgd2lsbCBiZSBzdHJpbmdpZmllZCkuXG4gIHNlbmQ6IGZ1bmN0aW9uIChtc2cpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBpZiAoc2VsZi5zb2NrZXQpIHtcbiAgICAgIGlmIChNZXRlb3IuX3ByaW50U2VudEREUClcbiAgICAgICAgTWV0ZW9yLl9kZWJ1ZyhcIlNlbnQgRERQXCIsIEREUENvbW1vbi5zdHJpbmdpZnlERFAobXNnKSk7XG4gICAgICBzZWxmLnNvY2tldC5zZW5kKEREUENvbW1vbi5zdHJpbmdpZnlERFAobXNnKSk7XG4gICAgfVxuICB9LFxuXG4gIC8vIFNlbmQgYSBjb25uZWN0aW9uIGVycm9yLlxuICBzZW5kRXJyb3I6IGZ1bmN0aW9uIChyZWFzb24sIG9mZmVuZGluZ01lc3NhZ2UpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIG1zZyA9IHttc2c6ICdlcnJvcicsIHJlYXNvbjogcmVhc29ufTtcbiAgICBpZiAob2ZmZW5kaW5nTWVzc2FnZSlcbiAgICAgIG1zZy5vZmZlbmRpbmdNZXNzYWdlID0gb2ZmZW5kaW5nTWVzc2FnZTtcbiAgICBzZWxmLnNlbmQobXNnKTtcbiAgfSxcblxuICAvLyBQcm9jZXNzICdtc2cnIGFzIGFuIGluY29taW5nIG1lc3NhZ2UuIEFzIGEgZ3VhcmQgYWdhaW5zdFxuICAvLyByYWNlIGNvbmRpdGlvbnMgZHVyaW5nIHJlY29ubmVjdGlvbiwgaWdub3JlIHRoZSBtZXNzYWdlIGlmXG4gIC8vICdzb2NrZXQnIGlzIG5vdCB0aGUgY3VycmVudGx5IGNvbm5lY3RlZCBzb2NrZXQuXG4gIC8vXG4gIC8vIFdlIHJ1biB0aGUgbWVzc2FnZXMgZnJvbSB0aGUgY2xpZW50IG9uZSBhdCBhIHRpbWUsIGluIHRoZSBvcmRlclxuICAvLyBnaXZlbiBieSB0aGUgY2xpZW50LiBUaGUgbWVzc2FnZSBoYW5kbGVyIGlzIHBhc3NlZCBhbiBpZGVtcG90ZW50XG4gIC8vIGZ1bmN0aW9uICd1bmJsb2NrJyB3aGljaCBpdCBtYXkgY2FsbCB0byBhbGxvdyBvdGhlciBtZXNzYWdlcyB0b1xuICAvLyBiZWdpbiBydW5uaW5nIGluIHBhcmFsbGVsIGluIGFub3RoZXIgZmliZXIgKGZvciBleGFtcGxlLCBhIG1ldGhvZFxuICAvLyB0aGF0IHdhbnRzIHRvIHlpZWxkKS4gT3RoZXJ3aXNlLCBpdCBpcyBhdXRvbWF0aWNhbGx5IHVuYmxvY2tlZFxuICAvLyB3aGVuIGl0IHJldHVybnMuXG4gIC8vXG4gIC8vIEFjdHVhbGx5LCB3ZSBkb24ndCBoYXZlIHRvICd0b3RhbGx5IG9yZGVyJyB0aGUgbWVzc2FnZXMgaW4gdGhpc1xuICAvLyB3YXksIGJ1dCBpdCdzIHRoZSBlYXNpZXN0IHRoaW5nIHRoYXQncyBjb3JyZWN0LiAodW5zdWIgbmVlZHMgdG9cbiAgLy8gYmUgb3JkZXJlZCBhZ2FpbnN0IHN1YiwgbWV0aG9kcyBuZWVkIHRvIGJlIG9yZGVyZWQgYWdhaW5zdCBlYWNoXG4gIC8vIG90aGVyKS5cbiAgcHJvY2Vzc01lc3NhZ2U6IGZ1bmN0aW9uIChtc2dfaW4pIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKCFzZWxmLmluUXVldWUpIC8vIHdlIGhhdmUgYmVlbiBkZXN0cm95ZWQuXG4gICAgICByZXR1cm47XG5cbiAgICAvLyBSZXNwb25kIHRvIHBpbmcgYW5kIHBvbmcgbWVzc2FnZXMgaW1tZWRpYXRlbHkgd2l0aG91dCBxdWV1aW5nLlxuICAgIC8vIElmIHRoZSBuZWdvdGlhdGVkIEREUCB2ZXJzaW9uIGlzIFwicHJlMVwiIHdoaWNoIGRpZG4ndCBzdXBwb3J0XG4gICAgLy8gcGluZ3MsIHByZXNlcnZlIHRoZSBcInByZTFcIiBiZWhhdmlvciBvZiByZXNwb25kaW5nIHdpdGggYSBcImJhZFxuICAgIC8vIHJlcXVlc3RcIiBmb3IgdGhlIHVua25vd24gbWVzc2FnZXMuXG4gICAgLy9cbiAgICAvLyBGaWJlcnMgYXJlIG5lZWRlZCBiZWNhdXNlIGhlYXJ0YmVhdHMgdXNlIE1ldGVvci5zZXRUaW1lb3V0LCB3aGljaFxuICAgIC8vIG5lZWRzIGEgRmliZXIuIFdlIGNvdWxkIGFjdHVhbGx5IHVzZSByZWd1bGFyIHNldFRpbWVvdXQgYW5kIGF2b2lkXG4gICAgLy8gdGhlc2UgbmV3IGZpYmVycywgYnV0IGl0IGlzIGVhc2llciB0byBqdXN0IG1ha2UgZXZlcnl0aGluZyB1c2VcbiAgICAvLyBNZXRlb3Iuc2V0VGltZW91dCBhbmQgbm90IHRoaW5rIHRvbyBoYXJkLlxuICAgIC8vXG4gICAgLy8gQW55IG1lc3NhZ2UgY291bnRzIGFzIHJlY2VpdmluZyBhIHBvbmcsIGFzIGl0IGRlbW9uc3RyYXRlcyB0aGF0XG4gICAgLy8gdGhlIGNsaWVudCBpcyBzdGlsbCBhbGl2ZS5cbiAgICBpZiAoc2VsZi5oZWFydGJlYXQpIHtcbiAgICAgIHNlbGYuaGVhcnRiZWF0Lm1lc3NhZ2VSZWNlaXZlZCgpO1xuICAgIH07XG5cbiAgICBpZiAoc2VsZi52ZXJzaW9uICE9PSAncHJlMScgJiYgbXNnX2luLm1zZyA9PT0gJ3BpbmcnKSB7XG4gICAgICBpZiAoc2VsZi5fcmVzcG9uZFRvUGluZ3MpXG4gICAgICAgIHNlbGYuc2VuZCh7bXNnOiBcInBvbmdcIiwgaWQ6IG1zZ19pbi5pZH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoc2VsZi52ZXJzaW9uICE9PSAncHJlMScgJiYgbXNnX2luLm1zZyA9PT0gJ3BvbmcnKSB7XG4gICAgICAvLyBTaW5jZSBldmVyeXRoaW5nIGlzIGEgcG9uZywgdGhlcmUgaXMgbm90aGluZyB0byBkb1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHNlbGYuaW5RdWV1ZS5wdXNoKG1zZ19pbik7XG4gICAgaWYgKHNlbGYud29ya2VyUnVubmluZylcbiAgICAgIHJldHVybjtcbiAgICBzZWxmLndvcmtlclJ1bm5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIHByb2Nlc3NOZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIG1zZyA9IHNlbGYuaW5RdWV1ZSAmJiBzZWxmLmluUXVldWUuc2hpZnQoKTtcblxuICAgICAgaWYgKCFtc2cpIHtcbiAgICAgICAgc2VsZi53b3JrZXJSdW5uaW5nID0gZmFsc2U7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gcnVuSGFuZGxlcnMoKSB7XG4gICAgICAgIHZhciBibG9ja2VkID0gdHJ1ZTtcblxuICAgICAgICB2YXIgdW5ibG9jayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBpZiAoIWJsb2NrZWQpXG4gICAgICAgICAgICByZXR1cm47IC8vIGlkZW1wb3RlbnRcbiAgICAgICAgICBibG9ja2VkID0gZmFsc2U7XG4gICAgICAgICAgc2V0SW1tZWRpYXRlKHByb2Nlc3NOZXh0KTtcbiAgICAgICAgfTtcblxuICAgICAgICBzZWxmLnNlcnZlci5vbk1lc3NhZ2VIb29rLmVhY2goZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgICAgY2FsbGJhY2sobXNnLCBzZWxmKTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKG1zZy5tc2cgaW4gc2VsZi5wcm90b2NvbF9oYW5kbGVycykge1xuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHNlbGYucHJvdG9jb2xfaGFuZGxlcnNbbXNnLm1zZ10uY2FsbChcbiAgICAgICAgICAgIHNlbGYsXG4gICAgICAgICAgICBtc2csXG4gICAgICAgICAgICB1bmJsb2NrXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIGlmIChNZXRlb3IuX2lzUHJvbWlzZShyZXN1bHQpKSB7XG4gICAgICAgICAgICByZXN1bHQuZmluYWxseSgoKSA9PiB1bmJsb2NrKCkpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB1bmJsb2NrKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlbGYuc2VuZEVycm9yKCdCYWQgcmVxdWVzdCcsIG1zZyk7XG4gICAgICAgICAgdW5ibG9jaygpOyAvLyBpbiBjYXNlIHRoZSBoYW5kbGVyIGRpZG4ndCBhbHJlYWR5IGRvIGl0XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcnVuSGFuZGxlcnMoKTtcbiAgICB9O1xuXG4gICAgcHJvY2Vzc05leHQoKTtcbiAgfSxcblxuICBwcm90b2NvbF9oYW5kbGVyczoge1xuICAgIHN1YjogYXN5bmMgZnVuY3Rpb24gKG1zZywgdW5ibG9jaykge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAvLyBjYWNoZVVuYmxvY2sgdGVtcG9yYXJseSwgc28gd2UgY2FuIGNhcHR1cmUgaXQgbGF0ZXJcbiAgICAgIC8vIHdlIHdpbGwgdXNlIHVuYmxvY2sgaW4gY3VycmVudCBldmVudExvb3AsIHNvIHRoaXMgaXMgc2FmZVxuICAgICAgc2VsZi5jYWNoZWRVbmJsb2NrID0gdW5ibG9jaztcblxuICAgICAgLy8gcmVqZWN0IG1hbGZvcm1lZCBtZXNzYWdlc1xuICAgICAgaWYgKHR5cGVvZiAobXNnLmlkKSAhPT0gXCJzdHJpbmdcIiB8fFxuICAgICAgICAgIHR5cGVvZiAobXNnLm5hbWUpICE9PSBcInN0cmluZ1wiIHx8XG4gICAgICAgICAgKCdwYXJhbXMnIGluIG1zZyAmJiAhKG1zZy5wYXJhbXMgaW5zdGFuY2VvZiBBcnJheSkpKSB7XG4gICAgICAgIHNlbGYuc2VuZEVycm9yKFwiTWFsZm9ybWVkIHN1YnNjcmlwdGlvblwiLCBtc2cpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICghc2VsZi5zZXJ2ZXIucHVibGlzaF9oYW5kbGVyc1ttc2cubmFtZV0pIHtcbiAgICAgICAgc2VsZi5zZW5kKHtcbiAgICAgICAgICBtc2c6ICdub3N1YicsIGlkOiBtc2cuaWQsXG4gICAgICAgICAgZXJyb3I6IG5ldyBNZXRlb3IuRXJyb3IoNDA0LCBgU3Vic2NyaXB0aW9uICcke21zZy5uYW1lfScgbm90IGZvdW5kYCl9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2VsZi5fbmFtZWRTdWJzLmhhcyhtc2cuaWQpKVxuICAgICAgICAvLyBzdWJzIGFyZSBpZGVtcG90ZW50LCBvciByYXRoZXIsIHRoZXkgYXJlIGlnbm9yZWQgaWYgYSBzdWJcbiAgICAgICAgLy8gd2l0aCB0aGF0IGlkIGFscmVhZHkgZXhpc3RzLiB0aGlzIGlzIGltcG9ydGFudCBkdXJpbmdcbiAgICAgICAgLy8gcmVjb25uZWN0LlxuICAgICAgICByZXR1cm47XG5cbiAgICAgIC8vIFhYWCBJdCdkIGJlIG11Y2ggYmV0dGVyIGlmIHdlIGhhZCBnZW5lcmljIGhvb2tzIHdoZXJlIGFueSBwYWNrYWdlIGNhblxuICAgICAgLy8gaG9vayBpbnRvIHN1YnNjcmlwdGlvbiBoYW5kbGluZywgYnV0IGluIHRoZSBtZWFuIHdoaWxlIHdlIHNwZWNpYWwgY2FzZVxuICAgICAgLy8gZGRwLXJhdGUtbGltaXRlciBwYWNrYWdlLiBUaGlzIGlzIGFsc28gZG9uZSBmb3Igd2VhayByZXF1aXJlbWVudHMgdG9cbiAgICAgIC8vIGFkZCB0aGUgZGRwLXJhdGUtbGltaXRlciBwYWNrYWdlIGluIGNhc2Ugd2UgZG9uJ3QgaGF2ZSBBY2NvdW50cy4gQVxuICAgICAgLy8gdXNlciB0cnlpbmcgdG8gdXNlIHRoZSBkZHAtcmF0ZS1saW1pdGVyIG11c3QgZXhwbGljaXRseSByZXF1aXJlIGl0LlxuICAgICAgaWYgKFBhY2thZ2VbJ2RkcC1yYXRlLWxpbWl0ZXInXSkge1xuICAgICAgICB2YXIgRERQUmF0ZUxpbWl0ZXIgPSBQYWNrYWdlWydkZHAtcmF0ZS1saW1pdGVyJ10uRERQUmF0ZUxpbWl0ZXI7XG4gICAgICAgIHZhciByYXRlTGltaXRlcklucHV0ID0ge1xuICAgICAgICAgIHVzZXJJZDogc2VsZi51c2VySWQsXG4gICAgICAgICAgY2xpZW50QWRkcmVzczogc2VsZi5jb25uZWN0aW9uSGFuZGxlLmNsaWVudEFkZHJlc3MsXG4gICAgICAgICAgdHlwZTogXCJzdWJzY3JpcHRpb25cIixcbiAgICAgICAgICBuYW1lOiBtc2cubmFtZSxcbiAgICAgICAgICBjb25uZWN0aW9uSWQ6IHNlbGYuaWRcbiAgICAgICAgfTtcblxuICAgICAgICBERFBSYXRlTGltaXRlci5faW5jcmVtZW50KHJhdGVMaW1pdGVySW5wdXQpO1xuICAgICAgICB2YXIgcmF0ZUxpbWl0UmVzdWx0ID0gRERQUmF0ZUxpbWl0ZXIuX2NoZWNrKHJhdGVMaW1pdGVySW5wdXQpO1xuICAgICAgICBpZiAoIXJhdGVMaW1pdFJlc3VsdC5hbGxvd2VkKSB7XG4gICAgICAgICAgc2VsZi5zZW5kKHtcbiAgICAgICAgICAgIG1zZzogJ25vc3ViJywgaWQ6IG1zZy5pZCxcbiAgICAgICAgICAgIGVycm9yOiBuZXcgTWV0ZW9yLkVycm9yKFxuICAgICAgICAgICAgICAndG9vLW1hbnktcmVxdWVzdHMnLFxuICAgICAgICAgICAgICBERFBSYXRlTGltaXRlci5nZXRFcnJvck1lc3NhZ2UocmF0ZUxpbWl0UmVzdWx0KSxcbiAgICAgICAgICAgICAge3RpbWVUb1Jlc2V0OiByYXRlTGltaXRSZXN1bHQudGltZVRvUmVzZXR9KVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgaGFuZGxlciA9IHNlbGYuc2VydmVyLnB1Ymxpc2hfaGFuZGxlcnNbbXNnLm5hbWVdO1xuXG4gICAgICBhd2FpdCBzZWxmLl9zdGFydFN1YnNjcmlwdGlvbihoYW5kbGVyLCBtc2cuaWQsIG1zZy5wYXJhbXMsIG1zZy5uYW1lKTtcblxuICAgICAgLy8gY2xlYW5pbmcgY2FjaGVkIHVuYmxvY2tcbiAgICAgIHNlbGYuY2FjaGVkVW5ibG9jayA9IG51bGw7XG4gICAgfSxcblxuICAgIHVuc3ViOiBmdW5jdGlvbiAobXNnKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHNlbGYuX3N0b3BTdWJzY3JpcHRpb24obXNnLmlkKTtcbiAgICB9LFxuXG4gICAgbWV0aG9kOiBhc3luYyBmdW5jdGlvbiAobXNnLCB1bmJsb2NrKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIC8vIFJlamVjdCBtYWxmb3JtZWQgbWVzc2FnZXMuXG4gICAgICAvLyBGb3Igbm93LCB3ZSBzaWxlbnRseSBpZ25vcmUgdW5rbm93biBhdHRyaWJ1dGVzLFxuICAgICAgLy8gZm9yIGZvcndhcmRzIGNvbXBhdGliaWxpdHkuXG4gICAgICBpZiAodHlwZW9mIChtc2cuaWQpICE9PSBcInN0cmluZ1wiIHx8XG4gICAgICAgICAgdHlwZW9mIChtc2cubWV0aG9kKSAhPT0gXCJzdHJpbmdcIiB8fFxuICAgICAgICAgICgncGFyYW1zJyBpbiBtc2cgJiYgIShtc2cucGFyYW1zIGluc3RhbmNlb2YgQXJyYXkpKSB8fFxuICAgICAgICAgICgoJ3JhbmRvbVNlZWQnIGluIG1zZykgJiYgKHR5cGVvZiBtc2cucmFuZG9tU2VlZCAhPT0gXCJzdHJpbmdcIikpKSB7XG4gICAgICAgIHNlbGYuc2VuZEVycm9yKFwiTWFsZm9ybWVkIG1ldGhvZCBpbnZvY2F0aW9uXCIsIG1zZyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIHJhbmRvbVNlZWQgPSBtc2cucmFuZG9tU2VlZCB8fCBudWxsO1xuXG4gICAgICAvLyBTZXQgdXAgdG8gbWFyayB0aGUgbWV0aG9kIGFzIHNhdGlzZmllZCBvbmNlIGFsbCBvYnNlcnZlcnNcbiAgICAgIC8vIChhbmQgc3Vic2NyaXB0aW9ucykgaGF2ZSByZWFjdGVkIHRvIGFueSB3cml0ZXMgdGhhdCB3ZXJlXG4gICAgICAvLyBkb25lLlxuICAgICAgdmFyIGZlbmNlID0gbmV3IEREUFNlcnZlci5fV3JpdGVGZW5jZTtcbiAgICAgIGZlbmNlLm9uQWxsQ29tbWl0dGVkKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gUmV0aXJlIHRoZSBmZW5jZSBzbyB0aGF0IGZ1dHVyZSB3cml0ZXMgYXJlIGFsbG93ZWQuXG4gICAgICAgIC8vIFRoaXMgbWVhbnMgdGhhdCBjYWxsYmFja3MgbGlrZSB0aW1lcnMgYXJlIGZyZWUgdG8gdXNlXG4gICAgICAgIC8vIHRoZSBmZW5jZSwgYW5kIGlmIHRoZXkgZmlyZSBiZWZvcmUgaXQncyBhcm1lZCAoZm9yXG4gICAgICAgIC8vIGV4YW1wbGUsIGJlY2F1c2UgdGhlIG1ldGhvZCB3YWl0cyBmb3IgdGhlbSkgdGhlaXJcbiAgICAgICAgLy8gd3JpdGVzIHdpbGwgYmUgaW5jbHVkZWQgaW4gdGhlIGZlbmNlLlxuICAgICAgICBmZW5jZS5yZXRpcmUoKTtcbiAgICAgICAgc2VsZi5zZW5kKHttc2c6ICd1cGRhdGVkJywgbWV0aG9kczogW21zZy5pZF19KTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBGaW5kIHRoZSBoYW5kbGVyXG4gICAgICB2YXIgaGFuZGxlciA9IHNlbGYuc2VydmVyLm1ldGhvZF9oYW5kbGVyc1ttc2cubWV0aG9kXTtcbiAgICAgIGlmICghaGFuZGxlcikge1xuICAgICAgICBzZWxmLnNlbmQoe1xuICAgICAgICAgIG1zZzogJ3Jlc3VsdCcsIGlkOiBtc2cuaWQsXG4gICAgICAgICAgZXJyb3I6IG5ldyBNZXRlb3IuRXJyb3IoNDA0LCBgTWV0aG9kICcke21zZy5tZXRob2R9JyBub3QgZm91bmRgKX0pO1xuICAgICAgICBhd2FpdCBmZW5jZS5hcm0oKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgaW52b2NhdGlvbiA9IG5ldyBERFBDb21tb24uTWV0aG9kSW52b2NhdGlvbih7XG4gICAgICAgIG5hbWU6IG1zZy5tZXRob2QsXG4gICAgICAgIGlzU2ltdWxhdGlvbjogZmFsc2UsXG4gICAgICAgIHVzZXJJZDogc2VsZi51c2VySWQsXG4gICAgICAgIHNldFVzZXJJZCh1c2VySWQpIHtcbiAgICAgICAgICByZXR1cm4gc2VsZi5fc2V0VXNlcklkKHVzZXJJZCk7XG4gICAgICAgIH0sXG4gICAgICAgIHVuYmxvY2s6IHVuYmxvY2ssXG4gICAgICAgIGNvbm5lY3Rpb246IHNlbGYuY29ubmVjdGlvbkhhbmRsZSxcbiAgICAgICAgcmFuZG9tU2VlZDogcmFuZG9tU2VlZCxcbiAgICAgICAgZmVuY2UsXG4gICAgICB9KTtcblxuICAgICAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgLy8gWFhYIEl0J2QgYmUgYmV0dGVyIGlmIHdlIGNvdWxkIGhvb2sgaW50byBtZXRob2QgaGFuZGxlcnMgYmV0dGVyIGJ1dFxuICAgICAgICAvLyBmb3Igbm93LCB3ZSBuZWVkIHRvIGNoZWNrIGlmIHRoZSBkZHAtcmF0ZS1saW1pdGVyIGV4aXN0cyBzaW5jZSB3ZVxuICAgICAgICAvLyBoYXZlIGEgd2VhayByZXF1aXJlbWVudCBmb3IgdGhlIGRkcC1yYXRlLWxpbWl0ZXIgcGFja2FnZSB0byBiZSBhZGRlZFxuICAgICAgICAvLyB0byBvdXIgYXBwbGljYXRpb24uXG4gICAgICAgIGlmIChQYWNrYWdlWydkZHAtcmF0ZS1saW1pdGVyJ10pIHtcbiAgICAgICAgICB2YXIgRERQUmF0ZUxpbWl0ZXIgPSBQYWNrYWdlWydkZHAtcmF0ZS1saW1pdGVyJ10uRERQUmF0ZUxpbWl0ZXI7XG4gICAgICAgICAgdmFyIHJhdGVMaW1pdGVySW5wdXQgPSB7XG4gICAgICAgICAgICB1c2VySWQ6IHNlbGYudXNlcklkLFxuICAgICAgICAgICAgY2xpZW50QWRkcmVzczogc2VsZi5jb25uZWN0aW9uSGFuZGxlLmNsaWVudEFkZHJlc3MsXG4gICAgICAgICAgICB0eXBlOiBcIm1ldGhvZFwiLFxuICAgICAgICAgICAgbmFtZTogbXNnLm1ldGhvZCxcbiAgICAgICAgICAgIGNvbm5lY3Rpb25JZDogc2VsZi5pZFxuICAgICAgICAgIH07XG4gICAgICAgICAgRERQUmF0ZUxpbWl0ZXIuX2luY3JlbWVudChyYXRlTGltaXRlcklucHV0KTtcbiAgICAgICAgICB2YXIgcmF0ZUxpbWl0UmVzdWx0ID0gRERQUmF0ZUxpbWl0ZXIuX2NoZWNrKHJhdGVMaW1pdGVySW5wdXQpXG4gICAgICAgICAgaWYgKCFyYXRlTGltaXRSZXN1bHQuYWxsb3dlZCkge1xuICAgICAgICAgICAgcmVqZWN0KG5ldyBNZXRlb3IuRXJyb3IoXG4gICAgICAgICAgICAgIFwidG9vLW1hbnktcmVxdWVzdHNcIixcbiAgICAgICAgICAgICAgRERQUmF0ZUxpbWl0ZXIuZ2V0RXJyb3JNZXNzYWdlKHJhdGVMaW1pdFJlc3VsdCksXG4gICAgICAgICAgICAgIHt0aW1lVG9SZXNldDogcmF0ZUxpbWl0UmVzdWx0LnRpbWVUb1Jlc2V0fVxuICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmVzb2x2ZShERFBTZXJ2ZXIuX0N1cnJlbnRXcml0ZUZlbmNlLndpdGhWYWx1ZShcbiAgICAgICAgICBmZW5jZSxcbiAgICAgICAgICAoKSA9PiBERFAuX0N1cnJlbnRNZXRob2RJbnZvY2F0aW9uLndpdGhWYWx1ZShcbiAgICAgICAgICAgIGludm9jYXRpb24sXG4gICAgICAgICAgICAoKSA9PiBtYXliZUF1ZGl0QXJndW1lbnRDaGVja3MoXG4gICAgICAgICAgICAgIGhhbmRsZXIsIGludm9jYXRpb24sIG1zZy5wYXJhbXMsXG4gICAgICAgICAgICAgIFwiY2FsbCB0byAnXCIgKyBtc2cubWV0aG9kICsgXCInXCJcbiAgICAgICAgICAgIClcbiAgICAgICAgICApXG4gICAgICAgICkpO1xuICAgICAgfSk7XG5cbiAgICAgIGFzeW5jIGZ1bmN0aW9uIGZpbmlzaCgpIHtcbiAgICAgICAgYXdhaXQgZmVuY2UuYXJtKCk7XG4gICAgICAgIHVuYmxvY2soKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcGF5bG9hZCA9IHtcbiAgICAgICAgbXNnOiBcInJlc3VsdFwiLFxuICAgICAgICBpZDogbXNnLmlkXG4gICAgICB9O1xuICAgICAgcmV0dXJuIHByb21pc2UudGhlbihhc3luYyByZXN1bHQgPT4ge1xuICAgICAgICBhd2FpdCBmaW5pc2goKTtcbiAgICAgICAgaWYgKHJlc3VsdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgcGF5bG9hZC5yZXN1bHQgPSByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgc2VsZi5zZW5kKHBheWxvYWQpO1xuICAgICAgfSwgYXN5bmMgKGV4Y2VwdGlvbikgPT4ge1xuICAgICAgICBhd2FpdCBmaW5pc2goKTtcbiAgICAgICAgcGF5bG9hZC5lcnJvciA9IHdyYXBJbnRlcm5hbEV4Y2VwdGlvbihcbiAgICAgICAgICBleGNlcHRpb24sXG4gICAgICAgICAgYHdoaWxlIGludm9raW5nIG1ldGhvZCAnJHttc2cubWV0aG9kfSdgXG4gICAgICAgICk7XG4gICAgICAgIHNlbGYuc2VuZChwYXlsb2FkKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcblxuICBfZWFjaFN1YjogZnVuY3Rpb24gKGYpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5fbmFtZWRTdWJzLmZvckVhY2goZik7XG4gICAgc2VsZi5fdW5pdmVyc2FsU3Vicy5mb3JFYWNoKGYpO1xuICB9LFxuXG4gIF9kaWZmQ29sbGVjdGlvblZpZXdzOiBmdW5jdGlvbiAoYmVmb3JlQ1ZzKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIERpZmZTZXF1ZW5jZS5kaWZmTWFwcyhiZWZvcmVDVnMsIHNlbGYuY29sbGVjdGlvblZpZXdzLCB7XG4gICAgICBib3RoOiBmdW5jdGlvbiAoY29sbGVjdGlvbk5hbWUsIGxlZnRWYWx1ZSwgcmlnaHRWYWx1ZSkge1xuICAgICAgICByaWdodFZhbHVlLmRpZmYobGVmdFZhbHVlKTtcbiAgICAgIH0sXG4gICAgICByaWdodE9ubHk6IGZ1bmN0aW9uIChjb2xsZWN0aW9uTmFtZSwgcmlnaHRWYWx1ZSkge1xuICAgICAgICByaWdodFZhbHVlLmRvY3VtZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChkb2NWaWV3LCBpZCkge1xuICAgICAgICAgIHNlbGYuc2VuZEFkZGVkKGNvbGxlY3Rpb25OYW1lLCBpZCwgZG9jVmlldy5nZXRGaWVsZHMoKSk7XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGxlZnRPbmx5OiBmdW5jdGlvbiAoY29sbGVjdGlvbk5hbWUsIGxlZnRWYWx1ZSkge1xuICAgICAgICBsZWZ0VmFsdWUuZG9jdW1lbnRzLmZvckVhY2goZnVuY3Rpb24gKGRvYywgaWQpIHtcbiAgICAgICAgICBzZWxmLnNlbmRSZW1vdmVkKGNvbGxlY3Rpb25OYW1lLCBpZCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuXG4gIC8vIFNldHMgdGhlIGN1cnJlbnQgdXNlciBpZCBpbiBhbGwgYXBwcm9wcmlhdGUgY29udGV4dHMgYW5kIHJlcnVuc1xuICAvLyBhbGwgc3Vic2NyaXB0aW9uc1xuICBhc3luYyBfc2V0VXNlcklkKHVzZXJJZCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmICh1c2VySWQgIT09IG51bGwgJiYgdHlwZW9mIHVzZXJJZCAhPT0gXCJzdHJpbmdcIilcbiAgICAgIHRocm93IG5ldyBFcnJvcihcInNldFVzZXJJZCBtdXN0IGJlIGNhbGxlZCBvbiBzdHJpbmcgb3IgbnVsbCwgbm90IFwiICtcbiAgICAgICAgICAgICAgICAgICAgICB0eXBlb2YgdXNlcklkKTtcblxuICAgIC8vIFByZXZlbnQgbmV3bHktY3JlYXRlZCB1bml2ZXJzYWwgc3Vic2NyaXB0aW9ucyBmcm9tIGJlaW5nIGFkZGVkIHRvIG91clxuICAgIC8vIHNlc3Npb24uIFRoZXkgd2lsbCBiZSBmb3VuZCBiZWxvdyB3aGVuIHdlIGNhbGwgc3RhcnRVbml2ZXJzYWxTdWJzLlxuICAgIC8vXG4gICAgLy8gKFdlIGRvbid0IGhhdmUgdG8gd29ycnkgYWJvdXQgbmFtZWQgc3Vic2NyaXB0aW9ucywgYmVjYXVzZSB3ZSBvbmx5IGFkZFxuICAgIC8vIHRoZW0gd2hlbiB3ZSBwcm9jZXNzIGEgJ3N1YicgbWVzc2FnZS4gV2UgYXJlIGN1cnJlbnRseSBwcm9jZXNzaW5nIGFcbiAgICAvLyAnbWV0aG9kJyBtZXNzYWdlLCBhbmQgdGhlIG1ldGhvZCBkaWQgbm90IHVuYmxvY2ssIGJlY2F1c2UgaXQgaXMgaWxsZWdhbFxuICAgIC8vIHRvIGNhbGwgc2V0VXNlcklkIGFmdGVyIHVuYmxvY2suIFRodXMgd2UgY2Fubm90IGJlIGNvbmN1cnJlbnRseSBhZGRpbmcgYVxuICAgIC8vIG5ldyBuYW1lZCBzdWJzY3JpcHRpb24pLlxuICAgIHNlbGYuX2RvbnRTdGFydE5ld1VuaXZlcnNhbFN1YnMgPSB0cnVlO1xuXG4gICAgLy8gUHJldmVudCBjdXJyZW50IHN1YnMgZnJvbSB1cGRhdGluZyBvdXIgY29sbGVjdGlvblZpZXdzIGFuZCBjYWxsIHRoZWlyXG4gICAgLy8gc3RvcCBjYWxsYmFja3MuIFRoaXMgbWF5IHlpZWxkLlxuICAgIHNlbGYuX2VhY2hTdWIoZnVuY3Rpb24gKHN1Yikge1xuICAgICAgc3ViLl9kZWFjdGl2YXRlKCk7XG4gICAgfSk7XG5cbiAgICAvLyBBbGwgc3VicyBzaG91bGQgbm93IGJlIGRlYWN0aXZhdGVkLiBTdG9wIHNlbmRpbmcgbWVzc2FnZXMgdG8gdGhlIGNsaWVudCxcbiAgICAvLyBzYXZlIHRoZSBzdGF0ZSBvZiB0aGUgcHVibGlzaGVkIGNvbGxlY3Rpb25zLCByZXNldCB0byBhbiBlbXB0eSB2aWV3LCBhbmRcbiAgICAvLyB1cGRhdGUgdGhlIHVzZXJJZC5cbiAgICBzZWxmLl9pc1NlbmRpbmcgPSBmYWxzZTtcbiAgICB2YXIgYmVmb3JlQ1ZzID0gc2VsZi5jb2xsZWN0aW9uVmlld3M7XG4gICAgc2VsZi5jb2xsZWN0aW9uVmlld3MgPSBuZXcgTWFwKCk7XG4gICAgc2VsZi51c2VySWQgPSB1c2VySWQ7XG5cbiAgICAvLyBfc2V0VXNlcklkIGlzIG5vcm1hbGx5IGNhbGxlZCBmcm9tIGEgTWV0ZW9yIG1ldGhvZCB3aXRoXG4gICAgLy8gRERQLl9DdXJyZW50TWV0aG9kSW52b2NhdGlvbiBzZXQuIEJ1dCBERFAuX0N1cnJlbnRNZXRob2RJbnZvY2F0aW9uIGlzIG5vdFxuICAgIC8vIGV4cGVjdGVkIHRvIGJlIHNldCBpbnNpZGUgYSBwdWJsaXNoIGZ1bmN0aW9uLCBzbyB3ZSB0ZW1wb3JhcnkgdW5zZXQgaXQuXG4gICAgLy8gSW5zaWRlIGEgcHVibGlzaCBmdW5jdGlvbiBERFAuX0N1cnJlbnRQdWJsaWNhdGlvbkludm9jYXRpb24gaXMgc2V0LlxuICAgIGF3YWl0IEREUC5fQ3VycmVudE1ldGhvZEludm9jYXRpb24ud2l0aFZhbHVlKHVuZGVmaW5lZCwgYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgICAgLy8gU2F2ZSB0aGUgb2xkIG5hbWVkIHN1YnMsIGFuZCByZXNldCB0byBoYXZpbmcgbm8gc3Vic2NyaXB0aW9ucy5cbiAgICAgIHZhciBvbGROYW1lZFN1YnMgPSBzZWxmLl9uYW1lZFN1YnM7XG4gICAgICBzZWxmLl9uYW1lZFN1YnMgPSBuZXcgTWFwKCk7XG4gICAgICBzZWxmLl91bml2ZXJzYWxTdWJzID0gW107XG5cblxuXG4gICAgICBhd2FpdCBQcm9taXNlLmFsbChbLi4ub2xkTmFtZWRTdWJzXS5tYXAoYXN5bmMgKFtzdWJzY3JpcHRpb25JZCwgc3ViXSkgPT4ge1xuICAgICAgICBjb25zdCBuZXdTdWIgPSBzdWIuX3JlY3JlYXRlKCk7XG4gICAgICAgIHNlbGYuX25hbWVkU3Vicy5zZXQoc3Vic2NyaXB0aW9uSWQsIG5ld1N1Yik7XG4gICAgICAgIC8vIG5iOiBpZiB0aGUgaGFuZGxlciB0aHJvd3Mgb3IgY2FsbHMgdGhpcy5lcnJvcigpLCBpdCB3aWxsIGluIGZhY3RcbiAgICAgICAgLy8gaW1tZWRpYXRlbHkgc2VuZCBpdHMgJ25vc3ViJy4gVGhpcyBpcyBPSywgdGhvdWdoLlxuICAgICAgICBhd2FpdCBuZXdTdWIuX3J1bkhhbmRsZXIoKTtcbiAgICAgIH0pKTtcblxuICAgICAgLy8gQWxsb3cgbmV3bHktY3JlYXRlZCB1bml2ZXJzYWwgc3VicyB0byBiZSBzdGFydGVkIG9uIG91ciBjb25uZWN0aW9uIGluXG4gICAgICAvLyBwYXJhbGxlbCB3aXRoIHRoZSBvbmVzIHdlJ3JlIHNwaW5uaW5nIHVwIGhlcmUsIGFuZCBzcGluIHVwIHVuaXZlcnNhbFxuICAgICAgLy8gc3Vicy5cbiAgICAgIHNlbGYuX2RvbnRTdGFydE5ld1VuaXZlcnNhbFN1YnMgPSBmYWxzZTtcbiAgICAgIHNlbGYuc3RhcnRVbml2ZXJzYWxTdWJzKCk7XG4gICAgfSwgeyBuYW1lOiAnX3NldFVzZXJJZCcgfSk7XG5cbiAgICAvLyBTdGFydCBzZW5kaW5nIG1lc3NhZ2VzIGFnYWluLCBiZWdpbm5pbmcgd2l0aCB0aGUgZGlmZiBmcm9tIHRoZSBwcmV2aW91c1xuICAgIC8vIHN0YXRlIG9mIHRoZSB3b3JsZCB0byB0aGUgY3VycmVudCBzdGF0ZS4gTm8geWllbGRzIGFyZSBhbGxvd2VkIGR1cmluZ1xuICAgIC8vIHRoaXMgZGlmZiwgc28gdGhhdCBvdGhlciBjaGFuZ2VzIGNhbm5vdCBpbnRlcmxlYXZlLlxuICAgIE1ldGVvci5fbm9ZaWVsZHNBbGxvd2VkKGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYuX2lzU2VuZGluZyA9IHRydWU7XG4gICAgICBzZWxmLl9kaWZmQ29sbGVjdGlvblZpZXdzKGJlZm9yZUNWcyk7XG4gICAgICBpZiAoIWlzRW1wdHkoc2VsZi5fcGVuZGluZ1JlYWR5KSkge1xuICAgICAgICBzZWxmLnNlbmRSZWFkeShzZWxmLl9wZW5kaW5nUmVhZHkpO1xuICAgICAgICBzZWxmLl9wZW5kaW5nUmVhZHkgPSBbXTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcblxuICBfc3RhcnRTdWJzY3JpcHRpb246IGZ1bmN0aW9uIChoYW5kbGVyLCBzdWJJZCwgcGFyYW1zLCBuYW1lKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIHN1YiA9IG5ldyBTdWJzY3JpcHRpb24oXG4gICAgICBzZWxmLCBoYW5kbGVyLCBzdWJJZCwgcGFyYW1zLCBuYW1lKTtcblxuICAgIGxldCB1bmJsb2NrSGFuZGVyID0gc2VsZi5jYWNoZWRVbmJsb2NrO1xuICAgIC8vIF9zdGFydFN1YnNjcmlwdGlvbiBtYXkgY2FsbCBmcm9tIGEgbG90IHBsYWNlc1xuICAgIC8vIHNvIGNhY2hlZFVuYmxvY2sgbWlnaHQgYmUgbnVsbCBpbiBzb21lY2FzZXNcbiAgICAvLyBhc3NpZ24gdGhlIGNhY2hlZFVuYmxvY2tcbiAgICBzdWIudW5ibG9jayA9IHVuYmxvY2tIYW5kZXIgfHwgKCgpID0+IHt9KTtcblxuICAgIGlmIChzdWJJZClcbiAgICAgIHNlbGYuX25hbWVkU3Vicy5zZXQoc3ViSWQsIHN1Yik7XG4gICAgZWxzZVxuICAgICAgc2VsZi5fdW5pdmVyc2FsU3Vicy5wdXNoKHN1Yik7XG5cbiAgICByZXR1cm4gc3ViLl9ydW5IYW5kbGVyKCk7XG4gIH0sXG5cbiAgLy8gVGVhciBkb3duIHNwZWNpZmllZCBzdWJzY3JpcHRpb25cbiAgX3N0b3BTdWJzY3JpcHRpb246IGZ1bmN0aW9uIChzdWJJZCwgZXJyb3IpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB2YXIgc3ViTmFtZSA9IG51bGw7XG4gICAgaWYgKHN1YklkKSB7XG4gICAgICB2YXIgbWF5YmVTdWIgPSBzZWxmLl9uYW1lZFN1YnMuZ2V0KHN1YklkKTtcbiAgICAgIGlmIChtYXliZVN1Yikge1xuICAgICAgICBzdWJOYW1lID0gbWF5YmVTdWIuX25hbWU7XG4gICAgICAgIG1heWJlU3ViLl9yZW1vdmVBbGxEb2N1bWVudHMoKTtcbiAgICAgICAgbWF5YmVTdWIuX2RlYWN0aXZhdGUoKTtcbiAgICAgICAgc2VsZi5fbmFtZWRTdWJzLmRlbGV0ZShzdWJJZCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHJlc3BvbnNlID0ge21zZzogJ25vc3ViJywgaWQ6IHN1YklkfTtcblxuICAgIGlmIChlcnJvcikge1xuICAgICAgcmVzcG9uc2UuZXJyb3IgPSB3cmFwSW50ZXJuYWxFeGNlcHRpb24oXG4gICAgICAgIGVycm9yLFxuICAgICAgICBzdWJOYW1lID8gKFwiZnJvbSBzdWIgXCIgKyBzdWJOYW1lICsgXCIgaWQgXCIgKyBzdWJJZClcbiAgICAgICAgICA6IChcImZyb20gc3ViIGlkIFwiICsgc3ViSWQpKTtcbiAgICB9XG5cbiAgICBzZWxmLnNlbmQocmVzcG9uc2UpO1xuICB9LFxuXG4gIC8vIFRlYXIgZG93biBhbGwgc3Vic2NyaXB0aW9ucy4gTm90ZSB0aGF0IHRoaXMgZG9lcyBOT1Qgc2VuZCByZW1vdmVkIG9yIG5vc3ViXG4gIC8vIG1lc3NhZ2VzLCBzaW5jZSB3ZSBhc3N1bWUgdGhlIGNsaWVudCBpcyBnb25lLlxuICBfZGVhY3RpdmF0ZUFsbFN1YnNjcmlwdGlvbnM6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBzZWxmLl9uYW1lZFN1YnMuZm9yRWFjaChmdW5jdGlvbiAoc3ViLCBpZCkge1xuICAgICAgc3ViLl9kZWFjdGl2YXRlKCk7XG4gICAgfSk7XG4gICAgc2VsZi5fbmFtZWRTdWJzID0gbmV3IE1hcCgpO1xuXG4gICAgc2VsZi5fdW5pdmVyc2FsU3Vicy5mb3JFYWNoKGZ1bmN0aW9uIChzdWIpIHtcbiAgICAgIHN1Yi5fZGVhY3RpdmF0ZSgpO1xuICAgIH0pO1xuICAgIHNlbGYuX3VuaXZlcnNhbFN1YnMgPSBbXTtcbiAgfSxcblxuICAvLyBEZXRlcm1pbmUgdGhlIHJlbW90ZSBjbGllbnQncyBJUCBhZGRyZXNzLCBiYXNlZCBvbiB0aGVcbiAgLy8gSFRUUF9GT1JXQVJERURfQ09VTlQgZW52aXJvbm1lbnQgdmFyaWFibGUgcmVwcmVzZW50aW5nIGhvdyBtYW55XG4gIC8vIHByb3hpZXMgdGhlIHNlcnZlciBpcyBiZWhpbmQuXG4gIF9jbGllbnRBZGRyZXNzOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgLy8gRm9yIHRoZSByZXBvcnRlZCBjbGllbnQgYWRkcmVzcyBmb3IgYSBjb25uZWN0aW9uIHRvIGJlIGNvcnJlY3QsXG4gICAgLy8gdGhlIGRldmVsb3BlciBtdXN0IHNldCB0aGUgSFRUUF9GT1JXQVJERURfQ09VTlQgZW52aXJvbm1lbnRcbiAgICAvLyB2YXJpYWJsZSB0byBhbiBpbnRlZ2VyIHJlcHJlc2VudGluZyB0aGUgbnVtYmVyIG9mIGhvcHMgdGhleVxuICAgIC8vIGV4cGVjdCBpbiB0aGUgYHgtZm9yd2FyZGVkLWZvcmAgaGVhZGVyLiBFLmcuLCBzZXQgdG8gXCIxXCIgaWYgdGhlXG4gICAgLy8gc2VydmVyIGlzIGJlaGluZCBvbmUgcHJveHkuXG4gICAgLy9cbiAgICAvLyBUaGlzIGNvdWxkIGJlIGNvbXB1dGVkIG9uY2UgYXQgc3RhcnR1cCBpbnN0ZWFkIG9mIGV2ZXJ5IHRpbWUuXG4gICAgdmFyIGh0dHBGb3J3YXJkZWRDb3VudCA9IHBhcnNlSW50KHByb2Nlc3MuZW52WydIVFRQX0ZPUldBUkRFRF9DT1VOVCddKSB8fCAwO1xuXG4gICAgaWYgKGh0dHBGb3J3YXJkZWRDb3VudCA9PT0gMClcbiAgICAgIHJldHVybiBzZWxmLnNvY2tldC5yZW1vdGVBZGRyZXNzO1xuXG4gICAgdmFyIGZvcndhcmRlZEZvciA9IHNlbGYuc29ja2V0LmhlYWRlcnNbXCJ4LWZvcndhcmRlZC1mb3JcIl07XG4gICAgaWYgKCFpc1N0cmluZyhmb3J3YXJkZWRGb3IpKVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgZm9yd2FyZGVkRm9yID0gZm9yd2FyZGVkRm9yLnRyaW0oKS5zcGxpdCgvXFxzKixcXHMqLyk7XG5cbiAgICAvLyBUeXBpY2FsbHkgdGhlIGZpcnN0IHZhbHVlIGluIHRoZSBgeC1mb3J3YXJkZWQtZm9yYCBoZWFkZXIgaXNcbiAgICAvLyB0aGUgb3JpZ2luYWwgSVAgYWRkcmVzcyBvZiB0aGUgY2xpZW50IGNvbm5lY3RpbmcgdG8gdGhlIGZpcnN0XG4gICAgLy8gcHJveHkuICBIb3dldmVyLCB0aGUgZW5kIHVzZXIgY2FuIGVhc2lseSBzcG9vZiB0aGUgaGVhZGVyLCBpblxuICAgIC8vIHdoaWNoIGNhc2UgdGhlIGZpcnN0IHZhbHVlKHMpIHdpbGwgYmUgdGhlIGZha2UgSVAgYWRkcmVzcyBmcm9tXG4gICAgLy8gdGhlIHVzZXIgcHJldGVuZGluZyB0byBiZSBhIHByb3h5IHJlcG9ydGluZyB0aGUgb3JpZ2luYWwgSVBcbiAgICAvLyBhZGRyZXNzIHZhbHVlLiAgQnkgY291bnRpbmcgSFRUUF9GT1JXQVJERURfQ09VTlQgYmFjayBmcm9tIHRoZVxuICAgIC8vIGVuZCBvZiB0aGUgbGlzdCwgd2UgZW5zdXJlIHRoYXQgd2UgZ2V0IHRoZSBJUCBhZGRyZXNzIGJlaW5nXG4gICAgLy8gcmVwb3J0ZWQgYnkgKm91ciogZmlyc3QgcHJveHkuXG5cbiAgICBpZiAoaHR0cEZvcndhcmRlZENvdW50IDwgMCB8fCBodHRwRm9yd2FyZGVkQ291bnQgPiBmb3J3YXJkZWRGb3IubGVuZ3RoKVxuICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICByZXR1cm4gZm9yd2FyZGVkRm9yW2ZvcndhcmRlZEZvci5sZW5ndGggLSBodHRwRm9yd2FyZGVkQ291bnRdO1xuICB9XG59KTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qIFN1YnNjcmlwdGlvbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4vLyBDdG9yIGZvciBhIHN1YiBoYW5kbGU6IHRoZSBpbnB1dCB0byBlYWNoIHB1Ymxpc2ggZnVuY3Rpb25cblxuLy8gSW5zdGFuY2UgbmFtZSBpcyB0aGlzIGJlY2F1c2UgaXQncyB1c3VhbGx5IHJlZmVycmVkIHRvIGFzIHRoaXMgaW5zaWRlIGFcbi8vIHB1Ymxpc2hcbi8qKlxuICogQHN1bW1hcnkgVGhlIHNlcnZlcidzIHNpZGUgb2YgYSBzdWJzY3JpcHRpb25cbiAqIEBjbGFzcyBTdWJzY3JpcHRpb25cbiAqIEBpbnN0YW5jZU5hbWUgdGhpc1xuICogQHNob3dJbnN0YW5jZU5hbWUgdHJ1ZVxuICovXG52YXIgU3Vic2NyaXB0aW9uID0gZnVuY3Rpb24gKFxuICAgIHNlc3Npb24sIGhhbmRsZXIsIHN1YnNjcmlwdGlvbklkLCBwYXJhbXMsIG5hbWUpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBzZWxmLl9zZXNzaW9uID0gc2Vzc2lvbjsgLy8gdHlwZSBpcyBTZXNzaW9uXG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IEFjY2VzcyBpbnNpZGUgdGhlIHB1Ymxpc2ggZnVuY3Rpb24uIFRoZSBpbmNvbWluZyBbY29ubmVjdGlvbl0oI21ldGVvcl9vbmNvbm5lY3Rpb24pIGZvciB0aGlzIHN1YnNjcmlwdGlvbi5cbiAgICogQGxvY3VzIFNlcnZlclxuICAgKiBAbmFtZSAgY29ubmVjdGlvblxuICAgKiBAbWVtYmVyT2YgU3Vic2NyaXB0aW9uXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgc2VsZi5jb25uZWN0aW9uID0gc2Vzc2lvbi5jb25uZWN0aW9uSGFuZGxlOyAvLyBwdWJsaWMgQVBJIG9iamVjdFxuXG4gIHNlbGYuX2hhbmRsZXIgPSBoYW5kbGVyO1xuXG4gIC8vIE15IHN1YnNjcmlwdGlvbiBJRCAoZ2VuZXJhdGVkIGJ5IGNsaWVudCwgdW5kZWZpbmVkIGZvciB1bml2ZXJzYWwgc3VicykuXG4gIHNlbGYuX3N1YnNjcmlwdGlvbklkID0gc3Vic2NyaXB0aW9uSWQ7XG4gIC8vIFVuZGVmaW5lZCBmb3IgdW5pdmVyc2FsIHN1YnNcbiAgc2VsZi5fbmFtZSA9IG5hbWU7XG5cbiAgc2VsZi5fcGFyYW1zID0gcGFyYW1zIHx8IFtdO1xuXG4gIC8vIE9ubHkgbmFtZWQgc3Vic2NyaXB0aW9ucyBoYXZlIElEcywgYnV0IHdlIG5lZWQgc29tZSBzb3J0IG9mIHN0cmluZ1xuICAvLyBpbnRlcm5hbGx5IHRvIGtlZXAgdHJhY2sgb2YgYWxsIHN1YnNjcmlwdGlvbnMgaW5zaWRlXG4gIC8vIFNlc3Npb25Eb2N1bWVudFZpZXdzLiBXZSB1c2UgdGhpcyBzdWJzY3JpcHRpb25IYW5kbGUgZm9yIHRoYXQuXG4gIGlmIChzZWxmLl9zdWJzY3JpcHRpb25JZCkge1xuICAgIHNlbGYuX3N1YnNjcmlwdGlvbkhhbmRsZSA9ICdOJyArIHNlbGYuX3N1YnNjcmlwdGlvbklkO1xuICB9IGVsc2Uge1xuICAgIHNlbGYuX3N1YnNjcmlwdGlvbkhhbmRsZSA9ICdVJyArIFJhbmRvbS5pZCgpO1xuICB9XG5cbiAgLy8gSGFzIF9kZWFjdGl2YXRlIGJlZW4gY2FsbGVkP1xuICBzZWxmLl9kZWFjdGl2YXRlZCA9IGZhbHNlO1xuXG4gIC8vIFN0b3AgY2FsbGJhY2tzIHRvIGcvYyB0aGlzIHN1Yi4gIGNhbGxlZCB3LyB6ZXJvIGFyZ3VtZW50cy5cbiAgc2VsZi5fc3RvcENhbGxiYWNrcyA9IFtdO1xuXG4gIC8vIFRoZSBzZXQgb2YgKGNvbGxlY3Rpb24sIGRvY3VtZW50aWQpIHRoYXQgdGhpcyBzdWJzY3JpcHRpb24gaGFzXG4gIC8vIGFuIG9waW5pb24gYWJvdXQuXG4gIHNlbGYuX2RvY3VtZW50cyA9IG5ldyBNYXAoKTtcblxuICAvLyBSZW1lbWJlciBpZiB3ZSBhcmUgcmVhZHkuXG4gIHNlbGYuX3JlYWR5ID0gZmFsc2U7XG5cbiAgLy8gUGFydCBvZiB0aGUgcHVibGljIEFQSTogdGhlIHVzZXIgb2YgdGhpcyBzdWIuXG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IEFjY2VzcyBpbnNpZGUgdGhlIHB1Ymxpc2ggZnVuY3Rpb24uIFRoZSBpZCBvZiB0aGUgbG9nZ2VkLWluIHVzZXIsIG9yIGBudWxsYCBpZiBubyB1c2VyIGlzIGxvZ2dlZCBpbi5cbiAgICogQGxvY3VzIFNlcnZlclxuICAgKiBAbWVtYmVyT2YgU3Vic2NyaXB0aW9uXG4gICAqIEBuYW1lICB1c2VySWRcbiAgICogQGluc3RhbmNlXG4gICAqL1xuICBzZWxmLnVzZXJJZCA9IHNlc3Npb24udXNlcklkO1xuXG4gIC8vIEZvciBub3csIHRoZSBpZCBmaWx0ZXIgaXMgZ29pbmcgdG8gZGVmYXVsdCB0b1xuICAvLyB0aGUgdG8vZnJvbSBERFAgbWV0aG9kcyBvbiBNb25nb0lELCB0b1xuICAvLyBzcGVjaWZpY2FsbHkgZGVhbCB3aXRoIG1vbmdvL21pbmltb25nbyBPYmplY3RJZHMuXG5cbiAgLy8gTGF0ZXIsIHlvdSB3aWxsIGJlIGFibGUgdG8gbWFrZSB0aGlzIGJlIFwicmF3XCJcbiAgLy8gaWYgeW91IHdhbnQgdG8gcHVibGlzaCBhIGNvbGxlY3Rpb24gdGhhdCB5b3Uga25vd1xuICAvLyBqdXN0IGhhcyBzdHJpbmdzIGZvciBrZXlzIGFuZCBubyBmdW5ueSBidXNpbmVzcywgdG9cbiAgLy8gYSBERFAgY29uc3VtZXIgdGhhdCBpc24ndCBtaW5pbW9uZ28uXG5cbiAgc2VsZi5faWRGaWx0ZXIgPSB7XG4gICAgaWRTdHJpbmdpZnk6IE1vbmdvSUQuaWRTdHJpbmdpZnksXG4gICAgaWRQYXJzZTogTW9uZ29JRC5pZFBhcnNlXG4gIH07XG5cbiAgUGFja2FnZVsnZmFjdHMtYmFzZSddICYmIFBhY2thZ2VbJ2ZhY3RzLWJhc2UnXS5GYWN0cy5pbmNyZW1lbnRTZXJ2ZXJGYWN0KFxuICAgIFwibGl2ZWRhdGFcIiwgXCJzdWJzY3JpcHRpb25zXCIsIDEpO1xufTtcblxuT2JqZWN0LmFzc2lnbihTdWJzY3JpcHRpb24ucHJvdG90eXBlLCB7XG4gIF9ydW5IYW5kbGVyOiBhc3luYyBmdW5jdGlvbigpIHtcbiAgICAvLyBYWFggc2hvdWxkIHdlIHVuYmxvY2soKSBoZXJlPyBFaXRoZXIgYmVmb3JlIHJ1bm5pbmcgdGhlIHB1Ymxpc2hcbiAgICAvLyBmdW5jdGlvbiwgb3IgYmVmb3JlIHJ1bm5pbmcgX3B1Ymxpc2hDdXJzb3IuXG4gICAgLy9cbiAgICAvLyBSaWdodCBub3csIGVhY2ggcHVibGlzaCBmdW5jdGlvbiBibG9ja3MgYWxsIGZ1dHVyZSBwdWJsaXNoZXMgYW5kXG4gICAgLy8gbWV0aG9kcyB3YWl0aW5nIG9uIGRhdGEgZnJvbSBNb25nbyAob3Igd2hhdGV2ZXIgZWxzZSB0aGUgZnVuY3Rpb25cbiAgICAvLyBibG9ja3Mgb24pLiBUaGlzIHByb2JhYmx5IHNsb3dzIHBhZ2UgbG9hZCBpbiBjb21tb24gY2FzZXMuXG5cbiAgICBpZiAoIXRoaXMudW5ibG9jaykge1xuICAgICAgdGhpcy51bmJsb2NrID0gKCkgPT4ge307XG4gICAgfVxuXG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgbGV0IHJlc3VsdE9yVGhlbmFibGUgPSBudWxsO1xuICAgIHRyeSB7XG4gICAgICByZXN1bHRPclRoZW5hYmxlID0gRERQLl9DdXJyZW50UHVibGljYXRpb25JbnZvY2F0aW9uLndpdGhWYWx1ZShcbiAgICAgICAgc2VsZixcbiAgICAgICAgKCkgPT5cbiAgICAgICAgICBtYXliZUF1ZGl0QXJndW1lbnRDaGVja3MoXG4gICAgICAgICAgICBzZWxmLl9oYW5kbGVyLFxuICAgICAgICAgICAgc2VsZixcbiAgICAgICAgICAgIEVKU09OLmNsb25lKHNlbGYuX3BhcmFtcyksXG4gICAgICAgICAgICAvLyBJdCdzIE9LIHRoYXQgdGhpcyB3b3VsZCBsb29rIHdlaXJkIGZvciB1bml2ZXJzYWwgc3Vic2NyaXB0aW9ucyxcbiAgICAgICAgICAgIC8vIGJlY2F1c2UgdGhleSBoYXZlIG5vIGFyZ3VtZW50cyBzbyB0aGVyZSBjYW4gbmV2ZXIgYmUgYW5cbiAgICAgICAgICAgIC8vIGF1ZGl0LWFyZ3VtZW50LWNoZWNrcyBmYWlsdXJlLlxuICAgICAgICAgICAgXCJwdWJsaXNoZXIgJ1wiICsgc2VsZi5fbmFtZSArIFwiJ1wiXG4gICAgICAgICAgKSxcbiAgICAgICAgeyBuYW1lOiBzZWxmLl9uYW1lIH1cbiAgICAgICk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgc2VsZi5lcnJvcihlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBEaWQgdGhlIGhhbmRsZXIgY2FsbCB0aGlzLmVycm9yIG9yIHRoaXMuc3RvcD9cbiAgICBpZiAoc2VsZi5faXNEZWFjdGl2YXRlZCgpKSByZXR1cm47XG5cbiAgICAvLyBCb3RoIGNvbnZlbnRpb25hbCBhbmQgYXN5bmMgcHVibGlzaCBoYW5kbGVyIGZ1bmN0aW9ucyBhcmUgc3VwcG9ydGVkLlxuICAgIC8vIElmIGFuIG9iamVjdCBpcyByZXR1cm5lZCB3aXRoIGEgdGhlbigpIGZ1bmN0aW9uLCBpdCBpcyBlaXRoZXIgYSBwcm9taXNlXG4gICAgLy8gb3IgdGhlbmFibGUgYW5kIHdpbGwgYmUgcmVzb2x2ZWQgYXN5bmNocm9ub3VzbHkuXG4gICAgY29uc3QgaXNUaGVuYWJsZSA9XG4gICAgICByZXN1bHRPclRoZW5hYmxlICYmIHR5cGVvZiByZXN1bHRPclRoZW5hYmxlLnRoZW4gPT09ICdmdW5jdGlvbic7XG4gICAgaWYgKGlzVGhlbmFibGUpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IHNlbGYuX3B1Ymxpc2hIYW5kbGVyUmVzdWx0KGF3YWl0IHJlc3VsdE9yVGhlbmFibGUpO1xuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHNlbGYuZXJyb3IoZSlcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgYXdhaXQgc2VsZi5fcHVibGlzaEhhbmRsZXJSZXN1bHQocmVzdWx0T3JUaGVuYWJsZSk7XG4gICAgfVxuICB9LFxuXG4gIGFzeW5jIF9wdWJsaXNoSGFuZGxlclJlc3VsdCAocmVzKSB7XG4gICAgLy8gU1BFQ0lBTCBDQVNFOiBJbnN0ZWFkIG9mIHdyaXRpbmcgdGhlaXIgb3duIGNhbGxiYWNrcyB0aGF0IGludm9rZVxuICAgIC8vIHRoaXMuYWRkZWQvY2hhbmdlZC9yZWFkeS9ldGMsIHRoZSB1c2VyIGNhbiBqdXN0IHJldHVybiBhIGNvbGxlY3Rpb25cbiAgICAvLyBjdXJzb3Igb3IgYXJyYXkgb2YgY3Vyc29ycyBmcm9tIHRoZSBwdWJsaXNoIGZ1bmN0aW9uOyB3ZSBjYWxsIHRoZWlyXG4gICAgLy8gX3B1Ymxpc2hDdXJzb3IgbWV0aG9kIHdoaWNoIHN0YXJ0cyBvYnNlcnZpbmcgdGhlIGN1cnNvciBhbmQgcHVibGlzaGVzIHRoZVxuICAgIC8vIHJlc3VsdHMuIE5vdGUgdGhhdCBfcHVibGlzaEN1cnNvciBkb2VzIE5PVCBjYWxsIHJlYWR5KCkuXG4gICAgLy9cbiAgICAvLyBYWFggVGhpcyB1c2VzIGFuIHVuZG9jdW1lbnRlZCBpbnRlcmZhY2Ugd2hpY2ggb25seSB0aGUgTW9uZ28gY3Vyc29yXG4gICAgLy8gaW50ZXJmYWNlIHB1Ymxpc2hlcy4gU2hvdWxkIHdlIG1ha2UgdGhpcyBpbnRlcmZhY2UgcHVibGljIGFuZCBlbmNvdXJhZ2VcbiAgICAvLyB1c2VycyB0byBpbXBsZW1lbnQgaXQgdGhlbXNlbHZlcz8gQXJndWFibHksIGl0J3MgdW5uZWNlc3Nhcnk7IHVzZXJzIGNhblxuICAgIC8vIGFscmVhZHkgd3JpdGUgdGhlaXIgb3duIGZ1bmN0aW9ucyBsaWtlXG4gICAgLy8gICB2YXIgcHVibGlzaE15UmVhY3RpdmVUaGluZ3kgPSBmdW5jdGlvbiAobmFtZSwgaGFuZGxlcikge1xuICAgIC8vICAgICBNZXRlb3IucHVibGlzaChuYW1lLCBmdW5jdGlvbiAoKSB7XG4gICAgLy8gICAgICAgdmFyIHJlYWN0aXZlVGhpbmd5ID0gaGFuZGxlcigpO1xuICAgIC8vICAgICAgIHJlYWN0aXZlVGhpbmd5LnB1Ymxpc2hNZSgpO1xuICAgIC8vICAgICB9KTtcbiAgICAvLyAgIH07XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGlzQ3Vyc29yID0gZnVuY3Rpb24gKGMpIHtcbiAgICAgIHJldHVybiBjICYmIGMuX3B1Ymxpc2hDdXJzb3I7XG4gICAgfTtcbiAgICBpZiAoaXNDdXJzb3IocmVzKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgcmVzLl9wdWJsaXNoQ3Vyc29yKHNlbGYpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBzZWxmLmVycm9yKGUpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBfcHVibGlzaEN1cnNvciBvbmx5IHJldHVybnMgYWZ0ZXIgdGhlIGluaXRpYWwgYWRkZWQgY2FsbGJhY2tzIGhhdmUgcnVuLlxuICAgICAgLy8gbWFyayBzdWJzY3JpcHRpb24gYXMgcmVhZHkuXG4gICAgICBzZWxmLnJlYWR5KCk7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHJlcykpIHtcbiAgICAgIC8vIENoZWNrIGFsbCB0aGUgZWxlbWVudHMgYXJlIGN1cnNvcnNcbiAgICAgIGlmICghIHJlcy5ldmVyeShpc0N1cnNvcikpIHtcbiAgICAgICAgc2VsZi5lcnJvcihuZXcgRXJyb3IoXCJQdWJsaXNoIGZ1bmN0aW9uIHJldHVybmVkIGFuIGFycmF5IG9mIG5vbi1DdXJzb3JzXCIpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gRmluZCBkdXBsaWNhdGUgY29sbGVjdGlvbiBuYW1lc1xuICAgICAgLy8gWFhYIHdlIHNob3VsZCBzdXBwb3J0IG92ZXJsYXBwaW5nIGN1cnNvcnMsIGJ1dCB0aGF0IHdvdWxkIHJlcXVpcmUgdGhlXG4gICAgICAvLyBtZXJnZSBib3ggdG8gYWxsb3cgb3ZlcmxhcCB3aXRoaW4gYSBzdWJzY3JpcHRpb25cbiAgICAgIHZhciBjb2xsZWN0aW9uTmFtZXMgPSB7fTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgdmFyIGNvbGxlY3Rpb25OYW1lID0gcmVzW2ldLl9nZXRDb2xsZWN0aW9uTmFtZSgpO1xuICAgICAgICBpZiAoY29sbGVjdGlvbk5hbWVzW2NvbGxlY3Rpb25OYW1lXSkge1xuICAgICAgICAgIHNlbGYuZXJyb3IobmV3IEVycm9yKFxuICAgICAgICAgICAgXCJQdWJsaXNoIGZ1bmN0aW9uIHJldHVybmVkIG11bHRpcGxlIGN1cnNvcnMgZm9yIGNvbGxlY3Rpb24gXCIgK1xuICAgICAgICAgICAgICBjb2xsZWN0aW9uTmFtZSkpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb2xsZWN0aW9uTmFtZXNbY29sbGVjdGlvbk5hbWVdID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgUHJvbWlzZS5hbGwocmVzLm1hcChjdXIgPT4gY3VyLl9wdWJsaXNoQ3Vyc29yKHNlbGYpKSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHNlbGYuZXJyb3IoZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHNlbGYucmVhZHkoKTtcbiAgICB9IGVsc2UgaWYgKHJlcykge1xuICAgICAgLy8gVHJ1dGh5IHZhbHVlcyBvdGhlciB0aGFuIGN1cnNvcnMgb3IgYXJyYXlzIGFyZSBwcm9iYWJseSBhXG4gICAgICAvLyB1c2VyIG1pc3Rha2UgKHBvc3NpYmxlIHJldHVybmluZyBhIE1vbmdvIGRvY3VtZW50IHZpYSwgc2F5LFxuICAgICAgLy8gYGNvbGwuZmluZE9uZSgpYCkuXG4gICAgICBzZWxmLmVycm9yKG5ldyBFcnJvcihcIlB1Ymxpc2ggZnVuY3Rpb24gY2FuIG9ubHkgcmV0dXJuIGEgQ3Vyc29yIG9yIFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICArIFwiYW4gYXJyYXkgb2YgQ3Vyc29yc1wiKSk7XG4gICAgfVxuICB9LFxuXG4gIC8vIFRoaXMgY2FsbHMgYWxsIHN0b3AgY2FsbGJhY2tzIGFuZCBwcmV2ZW50cyB0aGUgaGFuZGxlciBmcm9tIHVwZGF0aW5nIGFueVxuICAvLyBTZXNzaW9uQ29sbGVjdGlvblZpZXdzIGZ1cnRoZXIuIEl0J3MgdXNlZCB3aGVuIHRoZSB1c2VyIHVuc3Vic2NyaWJlcyBvclxuICAvLyBkaXNjb25uZWN0cywgYXMgd2VsbCBhcyBkdXJpbmcgc2V0VXNlcklkIHJlLXJ1bnMuIEl0IGRvZXMgKk5PVCogc2VuZFxuICAvLyByZW1vdmVkIG1lc3NhZ2VzIGZvciB0aGUgcHVibGlzaGVkIG9iamVjdHM7IGlmIHRoYXQgaXMgbmVjZXNzYXJ5LCBjYWxsXG4gIC8vIF9yZW1vdmVBbGxEb2N1bWVudHMgZmlyc3QuXG4gIF9kZWFjdGl2YXRlOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKHNlbGYuX2RlYWN0aXZhdGVkKVxuICAgICAgcmV0dXJuO1xuICAgIHNlbGYuX2RlYWN0aXZhdGVkID0gdHJ1ZTtcbiAgICBzZWxmLl9jYWxsU3RvcENhbGxiYWNrcygpO1xuICAgIFBhY2thZ2VbJ2ZhY3RzLWJhc2UnXSAmJiBQYWNrYWdlWydmYWN0cy1iYXNlJ10uRmFjdHMuaW5jcmVtZW50U2VydmVyRmFjdChcbiAgICAgIFwibGl2ZWRhdGFcIiwgXCJzdWJzY3JpcHRpb25zXCIsIC0xKTtcbiAgfSxcblxuICBfY2FsbFN0b3BDYWxsYmFja3M6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgLy8gVGVsbCBsaXN0ZW5lcnMsIHNvIHRoZXkgY2FuIGNsZWFuIHVwXG4gICAgdmFyIGNhbGxiYWNrcyA9IHNlbGYuX3N0b3BDYWxsYmFja3M7XG4gICAgc2VsZi5fc3RvcENhbGxiYWNrcyA9IFtdO1xuICAgIGNhbGxiYWNrcy5mb3JFYWNoKGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgY2FsbGJhY2soKTtcbiAgICB9KTtcbiAgfSxcblxuICAvLyBTZW5kIHJlbW92ZSBtZXNzYWdlcyBmb3IgZXZlcnkgZG9jdW1lbnQuXG4gIF9yZW1vdmVBbGxEb2N1bWVudHM6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgTWV0ZW9yLl9ub1lpZWxkc0FsbG93ZWQoZnVuY3Rpb24gKCkge1xuICAgICAgc2VsZi5fZG9jdW1lbnRzLmZvckVhY2goZnVuY3Rpb24gKGNvbGxlY3Rpb25Eb2NzLCBjb2xsZWN0aW9uTmFtZSkge1xuICAgICAgICBjb2xsZWN0aW9uRG9jcy5mb3JFYWNoKGZ1bmN0aW9uIChzdHJJZCkge1xuICAgICAgICAgIHNlbGYucmVtb3ZlZChjb2xsZWN0aW9uTmFtZSwgc2VsZi5faWRGaWx0ZXIuaWRQYXJzZShzdHJJZCkpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9LFxuXG4gIC8vIFJldHVybnMgYSBuZXcgU3Vic2NyaXB0aW9uIGZvciB0aGUgc2FtZSBzZXNzaW9uIHdpdGggdGhlIHNhbWVcbiAgLy8gaW5pdGlhbCBjcmVhdGlvbiBwYXJhbWV0ZXJzLiBUaGlzIGlzbid0IGEgY2xvbmU6IGl0IGRvZXNuJ3QgaGF2ZVxuICAvLyB0aGUgc2FtZSBfZG9jdW1lbnRzIGNhY2hlLCBzdG9wcGVkIHN0YXRlIG9yIGNhbGxiYWNrczsgbWF5IGhhdmUgYVxuICAvLyBkaWZmZXJlbnQgX3N1YnNjcmlwdGlvbkhhbmRsZSwgYW5kIGdldHMgaXRzIHVzZXJJZCBmcm9tIHRoZVxuICAvLyBzZXNzaW9uLCBub3QgZnJvbSB0aGlzIG9iamVjdC5cbiAgX3JlY3JlYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgU3Vic2NyaXB0aW9uKFxuICAgICAgc2VsZi5fc2Vzc2lvbiwgc2VsZi5faGFuZGxlciwgc2VsZi5fc3Vic2NyaXB0aW9uSWQsIHNlbGYuX3BhcmFtcyxcbiAgICAgIHNlbGYuX25hbWUpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBDYWxsIGluc2lkZSB0aGUgcHVibGlzaCBmdW5jdGlvbi4gIFN0b3BzIHRoaXMgY2xpZW50J3Mgc3Vic2NyaXB0aW9uLCB0cmlnZ2VyaW5nIGEgY2FsbCBvbiB0aGUgY2xpZW50IHRvIHRoZSBgb25TdG9wYCBjYWxsYmFjayBwYXNzZWQgdG8gW2BNZXRlb3Iuc3Vic2NyaWJlYF0oI21ldGVvcl9zdWJzY3JpYmUpLCBpZiBhbnkuIElmIGBlcnJvcmAgaXMgbm90IGEgW2BNZXRlb3IuRXJyb3JgXSgjbWV0ZW9yX2Vycm9yKSwgaXQgd2lsbCBiZSBbc2FuaXRpemVkXSgjbWV0ZW9yX2Vycm9yKS5cbiAgICogQGxvY3VzIFNlcnZlclxuICAgKiBAcGFyYW0ge0Vycm9yfSBlcnJvciBUaGUgZXJyb3IgdG8gcGFzcyB0byB0aGUgY2xpZW50LlxuICAgKiBAaW5zdGFuY2VcbiAgICogQG1lbWJlck9mIFN1YnNjcmlwdGlvblxuICAgKi9cbiAgZXJyb3I6IGZ1bmN0aW9uIChlcnJvcikge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoc2VsZi5faXNEZWFjdGl2YXRlZCgpKVxuICAgICAgcmV0dXJuO1xuICAgIHNlbGYuX3Nlc3Npb24uX3N0b3BTdWJzY3JpcHRpb24oc2VsZi5fc3Vic2NyaXB0aW9uSWQsIGVycm9yKTtcbiAgfSxcblxuICAvLyBOb3RlIHRoYXQgd2hpbGUgb3VyIEREUCBjbGllbnQgd2lsbCBub3RpY2UgdGhhdCB5b3UndmUgY2FsbGVkIHN0b3AoKSBvbiB0aGVcbiAgLy8gc2VydmVyIChhbmQgY2xlYW4gdXAgaXRzIF9zdWJzY3JpcHRpb25zIHRhYmxlKSB3ZSBkb24ndCBhY3R1YWxseSBwcm92aWRlIGFcbiAgLy8gbWVjaGFuaXNtIGZvciBhbiBhcHAgdG8gbm90aWNlIHRoaXMgKHRoZSBzdWJzY3JpYmUgb25FcnJvciBjYWxsYmFjayBvbmx5XG4gIC8vIHRyaWdnZXJzIGlmIHRoZXJlIGlzIGFuIGVycm9yKS5cblxuICAvKipcbiAgICogQHN1bW1hcnkgQ2FsbCBpbnNpZGUgdGhlIHB1Ymxpc2ggZnVuY3Rpb24uICBTdG9wcyB0aGlzIGNsaWVudCdzIHN1YnNjcmlwdGlvbiBhbmQgaW52b2tlcyB0aGUgY2xpZW50J3MgYG9uU3RvcGAgY2FsbGJhY2sgd2l0aCBubyBlcnJvci5cbiAgICogQGxvY3VzIFNlcnZlclxuICAgKiBAaW5zdGFuY2VcbiAgICogQG1lbWJlck9mIFN1YnNjcmlwdGlvblxuICAgKi9cbiAgc3RvcDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoc2VsZi5faXNEZWFjdGl2YXRlZCgpKVxuICAgICAgcmV0dXJuO1xuICAgIHNlbGYuX3Nlc3Npb24uX3N0b3BTdWJzY3JpcHRpb24oc2VsZi5fc3Vic2NyaXB0aW9uSWQpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBDYWxsIGluc2lkZSB0aGUgcHVibGlzaCBmdW5jdGlvbi4gIFJlZ2lzdGVycyBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIHJ1biB3aGVuIHRoZSBzdWJzY3JpcHRpb24gaXMgc3RvcHBlZC5cbiAgICogQGxvY3VzIFNlcnZlclxuICAgKiBAbWVtYmVyT2YgU3Vic2NyaXB0aW9uXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBjYWxsYmFjayBmdW5jdGlvblxuICAgKi9cbiAgb25TdG9wOiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgY2FsbGJhY2sgPSBNZXRlb3IuYmluZEVudmlyb25tZW50KGNhbGxiYWNrLCAnb25TdG9wIGNhbGxiYWNrJywgc2VsZik7XG4gICAgaWYgKHNlbGYuX2lzRGVhY3RpdmF0ZWQoKSlcbiAgICAgIGNhbGxiYWNrKCk7XG4gICAgZWxzZVxuICAgICAgc2VsZi5fc3RvcENhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgfSxcblxuICAvLyBUaGlzIHJldHVybnMgdHJ1ZSBpZiB0aGUgc3ViIGhhcyBiZWVuIGRlYWN0aXZhdGVkLCAqT1IqIGlmIHRoZSBzZXNzaW9uIHdhc1xuICAvLyBkZXN0cm95ZWQgYnV0IHRoZSBkZWZlcnJlZCBjYWxsIHRvIF9kZWFjdGl2YXRlQWxsU3Vic2NyaXB0aW9ucyBoYXNuJ3RcbiAgLy8gaGFwcGVuZWQgeWV0LlxuICBfaXNEZWFjdGl2YXRlZDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gc2VsZi5fZGVhY3RpdmF0ZWQgfHwgc2VsZi5fc2Vzc2lvbi5pblF1ZXVlID09PSBudWxsO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBDYWxsIGluc2lkZSB0aGUgcHVibGlzaCBmdW5jdGlvbi4gIEluZm9ybXMgdGhlIHN1YnNjcmliZXIgdGhhdCBhIGRvY3VtZW50IGhhcyBiZWVuIGFkZGVkIHRvIHRoZSByZWNvcmQgc2V0LlxuICAgKiBAbG9jdXMgU2VydmVyXG4gICAqIEBtZW1iZXJPZiBTdWJzY3JpcHRpb25cbiAgICogQGluc3RhbmNlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBuYW1lIG9mIHRoZSBjb2xsZWN0aW9uIHRoYXQgY29udGFpbnMgdGhlIG5ldyBkb2N1bWVudC5cbiAgICogQHBhcmFtIHtTdHJpbmd9IGlkIFRoZSBuZXcgZG9jdW1lbnQncyBJRC5cbiAgICogQHBhcmFtIHtPYmplY3R9IGZpZWxkcyBUaGUgZmllbGRzIGluIHRoZSBuZXcgZG9jdW1lbnQuICBJZiBgX2lkYCBpcyBwcmVzZW50IGl0IGlzIGlnbm9yZWQuXG4gICAqL1xuICBhZGRlZCAoY29sbGVjdGlvbk5hbWUsIGlkLCBmaWVsZHMpIHtcbiAgICBpZiAodGhpcy5faXNEZWFjdGl2YXRlZCgpKVxuICAgICAgcmV0dXJuO1xuICAgIGlkID0gdGhpcy5faWRGaWx0ZXIuaWRTdHJpbmdpZnkoaWQpO1xuXG4gICAgaWYgKHRoaXMuX3Nlc3Npb24uc2VydmVyLmdldFB1YmxpY2F0aW9uU3RyYXRlZ3koY29sbGVjdGlvbk5hbWUpLmRvQWNjb3VudGluZ0ZvckNvbGxlY3Rpb24pIHtcbiAgICAgIGxldCBpZHMgPSB0aGlzLl9kb2N1bWVudHMuZ2V0KGNvbGxlY3Rpb25OYW1lKTtcbiAgICAgIGlmIChpZHMgPT0gbnVsbCkge1xuICAgICAgICBpZHMgPSBuZXcgU2V0KCk7XG4gICAgICAgIHRoaXMuX2RvY3VtZW50cy5zZXQoY29sbGVjdGlvbk5hbWUsIGlkcyk7XG4gICAgICB9XG4gICAgICBpZHMuYWRkKGlkKTtcbiAgICB9XG5cbiAgICB0aGlzLl9zZXNzaW9uLmFkZGVkKHRoaXMuX3N1YnNjcmlwdGlvbkhhbmRsZSwgY29sbGVjdGlvbk5hbWUsIGlkLCBmaWVsZHMpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBDYWxsIGluc2lkZSB0aGUgcHVibGlzaCBmdW5jdGlvbi4gIEluZm9ybXMgdGhlIHN1YnNjcmliZXIgdGhhdCBhIGRvY3VtZW50IGluIHRoZSByZWNvcmQgc2V0IGhhcyBiZWVuIG1vZGlmaWVkLlxuICAgKiBAbG9jdXMgU2VydmVyXG4gICAqIEBtZW1iZXJPZiBTdWJzY3JpcHRpb25cbiAgICogQGluc3RhbmNlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBjb2xsZWN0aW9uIFRoZSBuYW1lIG9mIHRoZSBjb2xsZWN0aW9uIHRoYXQgY29udGFpbnMgdGhlIGNoYW5nZWQgZG9jdW1lbnQuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBpZCBUaGUgY2hhbmdlZCBkb2N1bWVudCdzIElELlxuICAgKiBAcGFyYW0ge09iamVjdH0gZmllbGRzIFRoZSBmaWVsZHMgaW4gdGhlIGRvY3VtZW50IHRoYXQgaGF2ZSBjaGFuZ2VkLCB0b2dldGhlciB3aXRoIHRoZWlyIG5ldyB2YWx1ZXMuICBJZiBhIGZpZWxkIGlzIG5vdCBwcmVzZW50IGluIGBmaWVsZHNgIGl0IHdhcyBsZWZ0IHVuY2hhbmdlZDsgaWYgaXQgaXMgcHJlc2VudCBpbiBgZmllbGRzYCBhbmQgaGFzIGEgdmFsdWUgb2YgYHVuZGVmaW5lZGAgaXQgd2FzIHJlbW92ZWQgZnJvbSB0aGUgZG9jdW1lbnQuICBJZiBgX2lkYCBpcyBwcmVzZW50IGl0IGlzIGlnbm9yZWQuXG4gICAqL1xuICBjaGFuZ2VkIChjb2xsZWN0aW9uTmFtZSwgaWQsIGZpZWxkcykge1xuICAgIGlmICh0aGlzLl9pc0RlYWN0aXZhdGVkKCkpXG4gICAgICByZXR1cm47XG4gICAgaWQgPSB0aGlzLl9pZEZpbHRlci5pZFN0cmluZ2lmeShpZCk7XG4gICAgdGhpcy5fc2Vzc2lvbi5jaGFuZ2VkKHRoaXMuX3N1YnNjcmlwdGlvbkhhbmRsZSwgY29sbGVjdGlvbk5hbWUsIGlkLCBmaWVsZHMpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBDYWxsIGluc2lkZSB0aGUgcHVibGlzaCBmdW5jdGlvbi4gIEluZm9ybXMgdGhlIHN1YnNjcmliZXIgdGhhdCBhIGRvY3VtZW50IGhhcyBiZWVuIHJlbW92ZWQgZnJvbSB0aGUgcmVjb3JkIHNldC5cbiAgICogQGxvY3VzIFNlcnZlclxuICAgKiBAbWVtYmVyT2YgU3Vic2NyaXB0aW9uXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gY29sbGVjdGlvbiBUaGUgbmFtZSBvZiB0aGUgY29sbGVjdGlvbiB0aGF0IHRoZSBkb2N1bWVudCBoYXMgYmVlbiByZW1vdmVkIGZyb20uXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBpZCBUaGUgSUQgb2YgdGhlIGRvY3VtZW50IHRoYXQgaGFzIGJlZW4gcmVtb3ZlZC5cbiAgICovXG4gIHJlbW92ZWQgKGNvbGxlY3Rpb25OYW1lLCBpZCkge1xuICAgIGlmICh0aGlzLl9pc0RlYWN0aXZhdGVkKCkpXG4gICAgICByZXR1cm47XG4gICAgaWQgPSB0aGlzLl9pZEZpbHRlci5pZFN0cmluZ2lmeShpZCk7XG5cbiAgICBpZiAodGhpcy5fc2Vzc2lvbi5zZXJ2ZXIuZ2V0UHVibGljYXRpb25TdHJhdGVneShjb2xsZWN0aW9uTmFtZSkuZG9BY2NvdW50aW5nRm9yQ29sbGVjdGlvbikge1xuICAgICAgLy8gV2UgZG9uJ3QgYm90aGVyIHRvIGRlbGV0ZSBzZXRzIG9mIHRoaW5ncyBpbiBhIGNvbGxlY3Rpb24gaWYgdGhlXG4gICAgICAvLyBjb2xsZWN0aW9uIGlzIGVtcHR5LiAgSXQgY291bGQgYnJlYWsgX3JlbW92ZUFsbERvY3VtZW50cy5cbiAgICAgIHRoaXMuX2RvY3VtZW50cy5nZXQoY29sbGVjdGlvbk5hbWUpLmRlbGV0ZShpZCk7XG4gICAgfVxuXG4gICAgdGhpcy5fc2Vzc2lvbi5yZW1vdmVkKHRoaXMuX3N1YnNjcmlwdGlvbkhhbmRsZSwgY29sbGVjdGlvbk5hbWUsIGlkKTtcbiAgfSxcblxuICAvKipcbiAgICogQHN1bW1hcnkgQ2FsbCBpbnNpZGUgdGhlIHB1Ymxpc2ggZnVuY3Rpb24uICBJbmZvcm1zIHRoZSBzdWJzY3JpYmVyIHRoYXQgYW4gaW5pdGlhbCwgY29tcGxldGUgc25hcHNob3Qgb2YgdGhlIHJlY29yZCBzZXQgaGFzIGJlZW4gc2VudC4gIFRoaXMgd2lsbCB0cmlnZ2VyIGEgY2FsbCBvbiB0aGUgY2xpZW50IHRvIHRoZSBgb25SZWFkeWAgY2FsbGJhY2sgcGFzc2VkIHRvICBbYE1ldGVvci5zdWJzY3JpYmVgXSgjbWV0ZW9yX3N1YnNjcmliZSksIGlmIGFueS5cbiAgICogQGxvY3VzIFNlcnZlclxuICAgKiBAbWVtYmVyT2YgU3Vic2NyaXB0aW9uXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgcmVhZHk6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKHNlbGYuX2lzRGVhY3RpdmF0ZWQoKSlcbiAgICAgIHJldHVybjtcbiAgICBpZiAoIXNlbGYuX3N1YnNjcmlwdGlvbklkKVxuICAgICAgcmV0dXJuOyAgLy8gVW5uZWNlc3NhcnkgYnV0IGlnbm9yZWQgZm9yIHVuaXZlcnNhbCBzdWJcbiAgICBpZiAoIXNlbGYuX3JlYWR5KSB7XG4gICAgICBzZWxmLl9zZXNzaW9uLnNlbmRSZWFkeShbc2VsZi5fc3Vic2NyaXB0aW9uSWRdKTtcbiAgICAgIHNlbGYuX3JlYWR5ID0gdHJ1ZTtcbiAgICB9XG4gIH1cbn0pO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyogU2VydmVyICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKi9cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblNlcnZlciA9IGZ1bmN0aW9uIChvcHRpb25zID0ge30pIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIC8vIFRoZSBkZWZhdWx0IGhlYXJ0YmVhdCBpbnRlcnZhbCBpcyAzMCBzZWNvbmRzIG9uIHRoZSBzZXJ2ZXIgYW5kIDM1XG4gIC8vIHNlY29uZHMgb24gdGhlIGNsaWVudC4gIFNpbmNlIHRoZSBjbGllbnQgZG9lc24ndCBuZWVkIHRvIHNlbmQgYVxuICAvLyBwaW5nIGFzIGxvbmcgYXMgaXQgaXMgcmVjZWl2aW5nIHBpbmdzLCB0aGlzIG1lYW5zIHRoYXQgcGluZ3NcbiAgLy8gbm9ybWFsbHkgZ28gZnJvbSB0aGUgc2VydmVyIHRvIHRoZSBjbGllbnQuXG4gIC8vXG4gIC8vIE5vdGU6IFRyb3Bvc3BoZXJlIGRlcGVuZHMgb24gdGhlIGFiaWxpdHkgdG8gbXV0YXRlXG4gIC8vIE1ldGVvci5zZXJ2ZXIub3B0aW9ucy5oZWFydGJlYXRUaW1lb3V0ISBUaGlzIGlzIGEgaGFjaywgYnV0IGl0J3MgbGlmZS5cbiAgc2VsZi5vcHRpb25zID0ge1xuICAgIGhlYXJ0YmVhdEludGVydmFsOiAxNTAwMCxcbiAgICBoZWFydGJlYXRUaW1lb3V0OiAxNTAwMCxcbiAgICAvLyBGb3IgdGVzdGluZywgYWxsb3cgcmVzcG9uZGluZyB0byBwaW5ncyB0byBiZSBkaXNhYmxlZC5cbiAgICByZXNwb25kVG9QaW5nczogdHJ1ZSxcbiAgICBkZWZhdWx0UHVibGljYXRpb25TdHJhdGVneTogcHVibGljYXRpb25TdHJhdGVnaWVzLlNFUlZFUl9NRVJHRSxcbiAgICAuLi5vcHRpb25zLFxuICB9O1xuXG4gIC8vIE1hcCBvZiBjYWxsYmFja3MgdG8gY2FsbCB3aGVuIGEgbmV3IGNvbm5lY3Rpb24gY29tZXMgaW4gdG8gdGhlXG4gIC8vIHNlcnZlciBhbmQgY29tcGxldGVzIEREUCB2ZXJzaW9uIG5lZ290aWF0aW9uLiBVc2UgYW4gb2JqZWN0IGluc3RlYWRcbiAgLy8gb2YgYW4gYXJyYXkgc28gd2UgY2FuIHNhZmVseSByZW1vdmUgb25lIGZyb20gdGhlIGxpc3Qgd2hpbGVcbiAgLy8gaXRlcmF0aW5nIG92ZXIgaXQuXG4gIHNlbGYub25Db25uZWN0aW9uSG9vayA9IG5ldyBIb29rKHtcbiAgICBkZWJ1Z1ByaW50RXhjZXB0aW9uczogXCJvbkNvbm5lY3Rpb24gY2FsbGJhY2tcIlxuICB9KTtcblxuICAvLyBNYXAgb2YgY2FsbGJhY2tzIHRvIGNhbGwgd2hlbiBhIG5ldyBtZXNzYWdlIGNvbWVzIGluLlxuICBzZWxmLm9uTWVzc2FnZUhvb2sgPSBuZXcgSG9vayh7XG4gICAgZGVidWdQcmludEV4Y2VwdGlvbnM6IFwib25NZXNzYWdlIGNhbGxiYWNrXCJcbiAgfSk7XG5cbiAgc2VsZi5wdWJsaXNoX2hhbmRsZXJzID0ge307XG4gIHNlbGYudW5pdmVyc2FsX3B1Ymxpc2hfaGFuZGxlcnMgPSBbXTtcblxuICBzZWxmLm1ldGhvZF9oYW5kbGVycyA9IHt9O1xuXG4gIHNlbGYuX3B1YmxpY2F0aW9uU3RyYXRlZ2llcyA9IHt9O1xuXG4gIHNlbGYuc2Vzc2lvbnMgPSBuZXcgTWFwKCk7IC8vIG1hcCBmcm9tIGlkIHRvIHNlc3Npb25cblxuICBzZWxmLnN0cmVhbV9zZXJ2ZXIgPSBuZXcgU3RyZWFtU2VydmVyKCk7XG5cbiAgc2VsZi5zdHJlYW1fc2VydmVyLnJlZ2lzdGVyKGZ1bmN0aW9uIChzb2NrZXQpIHtcbiAgICAvLyBzb2NrZXQgaW1wbGVtZW50cyB0aGUgU29ja0pTQ29ubmVjdGlvbiBpbnRlcmZhY2VcbiAgICBzb2NrZXQuX21ldGVvclNlc3Npb24gPSBudWxsO1xuXG4gICAgdmFyIHNlbmRFcnJvciA9IGZ1bmN0aW9uIChyZWFzb24sIG9mZmVuZGluZ01lc3NhZ2UpIHtcbiAgICAgIHZhciBtc2cgPSB7bXNnOiAnZXJyb3InLCByZWFzb246IHJlYXNvbn07XG4gICAgICBpZiAob2ZmZW5kaW5nTWVzc2FnZSlcbiAgICAgICAgbXNnLm9mZmVuZGluZ01lc3NhZ2UgPSBvZmZlbmRpbmdNZXNzYWdlO1xuICAgICAgc29ja2V0LnNlbmQoRERQQ29tbW9uLnN0cmluZ2lmeUREUChtc2cpKTtcbiAgICB9O1xuXG4gICAgc29ja2V0Lm9uKCdkYXRhJywgZnVuY3Rpb24gKHJhd19tc2cpIHtcbiAgICAgIGlmIChNZXRlb3IuX3ByaW50UmVjZWl2ZWRERFApIHtcbiAgICAgICAgTWV0ZW9yLl9kZWJ1ZyhcIlJlY2VpdmVkIEREUFwiLCByYXdfbXNnKTtcbiAgICAgIH1cbiAgICAgIHRyeSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdmFyIG1zZyA9IEREUENvbW1vbi5wYXJzZUREUChyYXdfbXNnKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgc2VuZEVycm9yKCdQYXJzZSBlcnJvcicpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAobXNnID09PSBudWxsIHx8ICFtc2cubXNnKSB7XG4gICAgICAgICAgc2VuZEVycm9yKCdCYWQgcmVxdWVzdCcsIG1zZyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1zZy5tc2cgPT09ICdjb25uZWN0Jykge1xuICAgICAgICAgIGlmIChzb2NrZXQuX21ldGVvclNlc3Npb24pIHtcbiAgICAgICAgICAgIHNlbmRFcnJvcihcIkFscmVhZHkgY29ubmVjdGVkXCIsIG1zZyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2VsZi5faGFuZGxlQ29ubmVjdChzb2NrZXQsIG1zZyk7XG5cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXNvY2tldC5fbWV0ZW9yU2Vzc2lvbikge1xuICAgICAgICAgIHNlbmRFcnJvcignTXVzdCBjb25uZWN0IGZpcnN0JywgbXNnKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc29ja2V0Ll9tZXRlb3JTZXNzaW9uLnByb2Nlc3NNZXNzYWdlKG1zZyk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIFhYWCBwcmludCBzdGFjayBuaWNlbHlcbiAgICAgICAgTWV0ZW9yLl9kZWJ1ZyhcIkludGVybmFsIGV4Y2VwdGlvbiB3aGlsZSBwcm9jZXNzaW5nIG1lc3NhZ2VcIiwgbXNnLCBlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHNvY2tldC5vbignY2xvc2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoc29ja2V0Ll9tZXRlb3JTZXNzaW9uKSB7XG4gICAgICAgIHNvY2tldC5fbWV0ZW9yU2Vzc2lvbi5jbG9zZSgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn07XG5cbk9iamVjdC5hc3NpZ24oU2VydmVyLnByb3RvdHlwZSwge1xuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBSZWdpc3RlciBhIGNhbGxiYWNrIHRvIGJlIGNhbGxlZCB3aGVuIGEgbmV3IEREUCBjb25uZWN0aW9uIGlzIG1hZGUgdG8gdGhlIHNlcnZlci5cbiAgICogQGxvY3VzIFNlcnZlclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdG8gY2FsbCB3aGVuIGEgbmV3IEREUCBjb25uZWN0aW9uIGlzIGVzdGFibGlzaGVkLlxuICAgKiBAbWVtYmVyT2YgTWV0ZW9yXG4gICAqIEBpbXBvcnRGcm9tUGFja2FnZSBtZXRlb3JcbiAgICovXG4gIG9uQ29ubmVjdGlvbjogZnVuY3Rpb24gKGZuKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBzZWxmLm9uQ29ubmVjdGlvbkhvb2sucmVnaXN0ZXIoZm4pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBTZXQgcHVibGljYXRpb24gc3RyYXRlZ3kgZm9yIHRoZSBnaXZlbiBjb2xsZWN0aW9uLiBQdWJsaWNhdGlvbnMgc3RyYXRlZ2llcyBhcmUgYXZhaWxhYmxlIGZyb20gYEREUFNlcnZlci5wdWJsaWNhdGlvblN0cmF0ZWdpZXNgLiBZb3UgY2FsbCB0aGlzIG1ldGhvZCBmcm9tIGBNZXRlb3Iuc2VydmVyYCwgbGlrZSBgTWV0ZW9yLnNlcnZlci5zZXRQdWJsaWNhdGlvblN0cmF0ZWd5KClgXG4gICAqIEBsb2N1cyBTZXJ2ZXJcbiAgICogQGFsaWFzIHNldFB1YmxpY2F0aW9uU3RyYXRlZ3lcbiAgICogQHBhcmFtIGNvbGxlY3Rpb25OYW1lIHtTdHJpbmd9XG4gICAqIEBwYXJhbSBzdHJhdGVneSB7e3VzZUNvbGxlY3Rpb25WaWV3OiBib29sZWFuLCBkb0FjY291bnRpbmdGb3JDb2xsZWN0aW9uOiBib29sZWFufX1cbiAgICogQG1lbWJlck9mIE1ldGVvci5zZXJ2ZXJcbiAgICogQGltcG9ydEZyb21QYWNrYWdlIG1ldGVvclxuICAgKi9cbiAgc2V0UHVibGljYXRpb25TdHJhdGVneShjb2xsZWN0aW9uTmFtZSwgc3RyYXRlZ3kpIHtcbiAgICBpZiAoIU9iamVjdC52YWx1ZXMocHVibGljYXRpb25TdHJhdGVnaWVzKS5pbmNsdWRlcyhzdHJhdGVneSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBtZXJnZSBzdHJhdGVneTogJHtzdHJhdGVneX0gXG4gICAgICAgIGZvciBjb2xsZWN0aW9uICR7Y29sbGVjdGlvbk5hbWV9YCk7XG4gICAgfVxuICAgIHRoaXMuX3B1YmxpY2F0aW9uU3RyYXRlZ2llc1tjb2xsZWN0aW9uTmFtZV0gPSBzdHJhdGVneTtcbiAgfSxcblxuICAvKipcbiAgICogQHN1bW1hcnkgR2V0cyB0aGUgcHVibGljYXRpb24gc3RyYXRlZ3kgZm9yIHRoZSByZXF1ZXN0ZWQgY29sbGVjdGlvbi4gWW91IGNhbGwgdGhpcyBtZXRob2QgZnJvbSBgTWV0ZW9yLnNlcnZlcmAsIGxpa2UgYE1ldGVvci5zZXJ2ZXIuZ2V0UHVibGljYXRpb25TdHJhdGVneSgpYFxuICAgKiBAbG9jdXMgU2VydmVyXG4gICAqIEBhbGlhcyBnZXRQdWJsaWNhdGlvblN0cmF0ZWd5XG4gICAqIEBwYXJhbSBjb2xsZWN0aW9uTmFtZSB7U3RyaW5nfVxuICAgKiBAbWVtYmVyT2YgTWV0ZW9yLnNlcnZlclxuICAgKiBAaW1wb3J0RnJvbVBhY2thZ2UgbWV0ZW9yXG4gICAqIEByZXR1cm4ge3t1c2VDb2xsZWN0aW9uVmlldzogYm9vbGVhbiwgZG9BY2NvdW50aW5nRm9yQ29sbGVjdGlvbjogYm9vbGVhbn19XG4gICAqL1xuICBnZXRQdWJsaWNhdGlvblN0cmF0ZWd5KGNvbGxlY3Rpb25OYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuX3B1YmxpY2F0aW9uU3RyYXRlZ2llc1tjb2xsZWN0aW9uTmFtZV1cbiAgICAgIHx8IHRoaXMub3B0aW9ucy5kZWZhdWx0UHVibGljYXRpb25TdHJhdGVneTtcbiAgfSxcblxuICAvKipcbiAgICogQHN1bW1hcnkgUmVnaXN0ZXIgYSBjYWxsYmFjayB0byBiZSBjYWxsZWQgd2hlbiBhIG5ldyBERFAgbWVzc2FnZSBpcyByZWNlaXZlZC5cbiAgICogQGxvY3VzIFNlcnZlclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayBUaGUgZnVuY3Rpb24gdG8gY2FsbCB3aGVuIGEgbmV3IEREUCBtZXNzYWdlIGlzIHJlY2VpdmVkLlxuICAgKiBAbWVtYmVyT2YgTWV0ZW9yXG4gICAqIEBpbXBvcnRGcm9tUGFja2FnZSBtZXRlb3JcbiAgICovXG4gIG9uTWVzc2FnZTogZnVuY3Rpb24gKGZuKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBzZWxmLm9uTWVzc2FnZUhvb2sucmVnaXN0ZXIoZm4pO1xuICB9LFxuXG4gIF9oYW5kbGVDb25uZWN0OiBmdW5jdGlvbiAoc29ja2V0LCBtc2cpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAvLyBUaGUgY29ubmVjdCBtZXNzYWdlIG11c3Qgc3BlY2lmeSBhIHZlcnNpb24gYW5kIGFuIGFycmF5IG9mIHN1cHBvcnRlZFxuICAgIC8vIHZlcnNpb25zLCBhbmQgaXQgbXVzdCBjbGFpbSB0byBzdXBwb3J0IHdoYXQgaXQgaXMgcHJvcG9zaW5nLlxuICAgIGlmICghKHR5cGVvZiAobXNnLnZlcnNpb24pID09PSAnc3RyaW5nJyAmJlxuICAgICAgICAgIEFycmF5LmlzQXJyYXkobXNnLnN1cHBvcnQpICYmXG4gICAgICAgICAgbXNnLnN1cHBvcnQuZXZlcnkoaXNTdHJpbmcpICYmXG4gICAgICAgICAgbXNnLnN1cHBvcnQuaW5jbHVkZXMobXNnLnZlcnNpb24pKSkge1xuICAgICAgc29ja2V0LnNlbmQoRERQQ29tbW9uLnN0cmluZ2lmeUREUCh7bXNnOiAnZmFpbGVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmVyc2lvbjogRERQQ29tbW9uLlNVUFBPUlRFRF9ERFBfVkVSU0lPTlNbMF19KSk7XG4gICAgICBzb2NrZXQuY2xvc2UoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBJbiB0aGUgZnV0dXJlLCBoYW5kbGUgc2Vzc2lvbiByZXN1bXB0aW9uOiBzb21ldGhpbmcgbGlrZTpcbiAgICAvLyAgc29ja2V0Ll9tZXRlb3JTZXNzaW9uID0gc2VsZi5zZXNzaW9uc1ttc2cuc2Vzc2lvbl1cbiAgICB2YXIgdmVyc2lvbiA9IGNhbGN1bGF0ZVZlcnNpb24obXNnLnN1cHBvcnQsIEREUENvbW1vbi5TVVBQT1JURURfRERQX1ZFUlNJT05TKTtcblxuICAgIGlmIChtc2cudmVyc2lvbiAhPT0gdmVyc2lvbikge1xuICAgICAgLy8gVGhlIGJlc3QgdmVyc2lvbiB0byB1c2UgKGFjY29yZGluZyB0byB0aGUgY2xpZW50J3Mgc3RhdGVkIHByZWZlcmVuY2VzKVxuICAgICAgLy8gaXMgbm90IHRoZSBvbmUgdGhlIGNsaWVudCBpcyB0cnlpbmcgdG8gdXNlLiBJbmZvcm0gdGhlbSBhYm91dCB0aGUgYmVzdFxuICAgICAgLy8gdmVyc2lvbiB0byB1c2UuXG4gICAgICBzb2NrZXQuc2VuZChERFBDb21tb24uc3RyaW5naWZ5RERQKHttc2c6ICdmYWlsZWQnLCB2ZXJzaW9uOiB2ZXJzaW9ufSkpO1xuICAgICAgc29ja2V0LmNsb3NlKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gWWF5LCB2ZXJzaW9uIG1hdGNoZXMhIENyZWF0ZSBhIG5ldyBzZXNzaW9uLlxuICAgIC8vIE5vdGU6IFRyb3Bvc3BoZXJlIGRlcGVuZHMgb24gdGhlIGFiaWxpdHkgdG8gbXV0YXRlXG4gICAgLy8gTWV0ZW9yLnNlcnZlci5vcHRpb25zLmhlYXJ0YmVhdFRpbWVvdXQhIFRoaXMgaXMgYSBoYWNrLCBidXQgaXQncyBsaWZlLlxuICAgIHNvY2tldC5fbWV0ZW9yU2Vzc2lvbiA9IG5ldyBTZXNzaW9uKHNlbGYsIHZlcnNpb24sIHNvY2tldCwgc2VsZi5vcHRpb25zKTtcbiAgICBzZWxmLnNlc3Npb25zLnNldChzb2NrZXQuX21ldGVvclNlc3Npb24uaWQsIHNvY2tldC5fbWV0ZW9yU2Vzc2lvbik7XG4gICAgc2VsZi5vbkNvbm5lY3Rpb25Ib29rLmVhY2goZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICBpZiAoc29ja2V0Ll9tZXRlb3JTZXNzaW9uKVxuICAgICAgICBjYWxsYmFjayhzb2NrZXQuX21ldGVvclNlc3Npb24uY29ubmVjdGlvbkhhbmRsZSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9KTtcbiAgfSxcbiAgLyoqXG4gICAqIFJlZ2lzdGVyIGEgcHVibGlzaCBoYW5kbGVyIGZ1bmN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gbmFtZSB7U3RyaW5nfSBpZGVudGlmaWVyIGZvciBxdWVyeVxuICAgKiBAcGFyYW0gaGFuZGxlciB7RnVuY3Rpb259IHB1Ymxpc2ggaGFuZGxlclxuICAgKiBAcGFyYW0gb3B0aW9ucyB7T2JqZWN0fVxuICAgKlxuICAgKiBTZXJ2ZXIgd2lsbCBjYWxsIGhhbmRsZXIgZnVuY3Rpb24gb24gZWFjaCBuZXcgc3Vic2NyaXB0aW9uLFxuICAgKiBlaXRoZXIgd2hlbiByZWNlaXZpbmcgRERQIHN1YiBtZXNzYWdlIGZvciBhIG5hbWVkIHN1YnNjcmlwdGlvbiwgb3Igb25cbiAgICogRERQIGNvbm5lY3QgZm9yIGEgdW5pdmVyc2FsIHN1YnNjcmlwdGlvbi5cbiAgICpcbiAgICogSWYgbmFtZSBpcyBudWxsLCB0aGlzIHdpbGwgYmUgYSBzdWJzY3JpcHRpb24gdGhhdCBpc1xuICAgKiBhdXRvbWF0aWNhbGx5IGVzdGFibGlzaGVkIGFuZCBwZXJtYW5lbnRseSBvbiBmb3IgYWxsIGNvbm5lY3RlZFxuICAgKiBjbGllbnQsIGluc3RlYWQgb2YgYSBzdWJzY3JpcHRpb24gdGhhdCBjYW4gYmUgdHVybmVkIG9uIGFuZCBvZmZcbiAgICogd2l0aCBzdWJzY3JpYmUoKS5cbiAgICpcbiAgICogb3B0aW9ucyB0byBjb250YWluOlxuICAgKiAgLSAobW9zdGx5IGludGVybmFsKSBpc19hdXRvOiB0cnVlIGlmIGdlbmVyYXRlZCBhdXRvbWF0aWNhbGx5XG4gICAqICAgIGZyb20gYW4gYXV0b3B1Ymxpc2ggaG9vay4gdGhpcyBpcyBmb3IgY29zbWV0aWMgcHVycG9zZXMgb25seVxuICAgKiAgICAoaXQgbGV0cyB1cyBkZXRlcm1pbmUgd2hldGhlciB0byBwcmludCBhIHdhcm5pbmcgc3VnZ2VzdGluZ1xuICAgKiAgICB0aGF0IHlvdSB0dXJuIG9mZiBhdXRvcHVibGlzaCkuXG4gICAqL1xuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBQdWJsaXNoIGEgcmVjb3JkIHNldC5cbiAgICogQG1lbWJlck9mIE1ldGVvclxuICAgKiBAaW1wb3J0RnJvbVBhY2thZ2UgbWV0ZW9yXG4gICAqIEBsb2N1cyBTZXJ2ZXJcbiAgICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBuYW1lIElmIFN0cmluZywgbmFtZSBvZiB0aGUgcmVjb3JkIHNldC4gIElmIE9iamVjdCwgcHVibGljYXRpb25zIERpY3Rpb25hcnkgb2YgcHVibGlzaCBmdW5jdGlvbnMgYnkgbmFtZS4gIElmIGBudWxsYCwgdGhlIHNldCBoYXMgbm8gbmFtZSwgYW5kIHRoZSByZWNvcmQgc2V0IGlzIGF1dG9tYXRpY2FsbHkgc2VudCB0byBhbGwgY29ubmVjdGVkIGNsaWVudHMuXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgRnVuY3Rpb24gY2FsbGVkIG9uIHRoZSBzZXJ2ZXIgZWFjaCB0aW1lIGEgY2xpZW50IHN1YnNjcmliZXMuICBJbnNpZGUgdGhlIGZ1bmN0aW9uLCBgdGhpc2AgaXMgdGhlIHB1Ymxpc2ggaGFuZGxlciBvYmplY3QsIGRlc2NyaWJlZCBiZWxvdy4gIElmIHRoZSBjbGllbnQgcGFzc2VkIGFyZ3VtZW50cyB0byBgc3Vic2NyaWJlYCwgdGhlIGZ1bmN0aW9uIGlzIGNhbGxlZCB3aXRoIHRoZSBzYW1lIGFyZ3VtZW50cy5cbiAgICovXG4gIHB1Ymxpc2g6IGZ1bmN0aW9uIChuYW1lLCBoYW5kbGVyLCBvcHRpb25zKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKCFpc09iamVjdChuYW1lKSkge1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICAgIGlmIChuYW1lICYmIG5hbWUgaW4gc2VsZi5wdWJsaXNoX2hhbmRsZXJzKSB7XG4gICAgICAgIE1ldGVvci5fZGVidWcoXCJJZ25vcmluZyBkdXBsaWNhdGUgcHVibGlzaCBuYW1lZCAnXCIgKyBuYW1lICsgXCInXCIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChQYWNrYWdlLmF1dG9wdWJsaXNoICYmICFvcHRpb25zLmlzX2F1dG8pIHtcbiAgICAgICAgLy8gVGhleSBoYXZlIGF1dG9wdWJsaXNoIG9uLCB5ZXQgdGhleSdyZSB0cnlpbmcgdG8gbWFudWFsbHlcbiAgICAgICAgLy8gcGljayBzdHVmZiB0byBwdWJsaXNoLiBUaGV5IHByb2JhYmx5IHNob3VsZCB0dXJuIG9mZlxuICAgICAgICAvLyBhdXRvcHVibGlzaC4gKFRoaXMgY2hlY2sgaXNuJ3QgcGVyZmVjdCAtLSBpZiB5b3UgY3JlYXRlIGFcbiAgICAgICAgLy8gcHVibGlzaCBiZWZvcmUgeW91IHR1cm4gb24gYXV0b3B1Ymxpc2gsIGl0IHdvbid0IGNhdGNoXG4gICAgICAgIC8vIGl0LCBidXQgdGhpcyB3aWxsIGRlZmluaXRlbHkgaGFuZGxlIHRoZSBzaW1wbGUgY2FzZSB3aGVyZVxuICAgICAgICAvLyB5b3UndmUgYWRkZWQgdGhlIGF1dG9wdWJsaXNoIHBhY2thZ2UgdG8geW91ciBhcHAsIGFuZCBhcmVcbiAgICAgICAgLy8gY2FsbGluZyBwdWJsaXNoIGZyb20geW91ciBhcHAgY29kZSkuXG4gICAgICAgIGlmICghc2VsZi53YXJuZWRfYWJvdXRfYXV0b3B1Ymxpc2gpIHtcbiAgICAgICAgICBzZWxmLndhcm5lZF9hYm91dF9hdXRvcHVibGlzaCA9IHRydWU7XG4gICAgICAgICAgTWV0ZW9yLl9kZWJ1ZyhcbiAgICBcIioqIFlvdSd2ZSBzZXQgdXAgc29tZSBkYXRhIHN1YnNjcmlwdGlvbnMgd2l0aCBNZXRlb3IucHVibGlzaCgpLCBidXRcXG5cIiArXG4gICAgXCIqKiB5b3Ugc3RpbGwgaGF2ZSBhdXRvcHVibGlzaCB0dXJuZWQgb24uIEJlY2F1c2UgYXV0b3B1Ymxpc2ggaXMgc3RpbGxcXG5cIiArXG4gICAgXCIqKiBvbiwgeW91ciBNZXRlb3IucHVibGlzaCgpIGNhbGxzIHdvbid0IGhhdmUgbXVjaCBlZmZlY3QuIEFsbCBkYXRhXFxuXCIgK1xuICAgIFwiKiogd2lsbCBzdGlsbCBiZSBzZW50IHRvIGFsbCBjbGllbnRzLlxcblwiICtcbiAgICBcIioqXFxuXCIgK1xuICAgIFwiKiogVHVybiBvZmYgYXV0b3B1Ymxpc2ggYnkgcmVtb3ZpbmcgdGhlIGF1dG9wdWJsaXNoIHBhY2thZ2U6XFxuXCIgK1xuICAgIFwiKipcXG5cIiArXG4gICAgXCIqKiAgICQgbWV0ZW9yIHJlbW92ZSBhdXRvcHVibGlzaFxcblwiICtcbiAgICBcIioqXFxuXCIgK1xuICAgIFwiKiogLi4gYW5kIG1ha2Ugc3VyZSB5b3UgaGF2ZSBNZXRlb3IucHVibGlzaCgpIGFuZCBNZXRlb3Iuc3Vic2NyaWJlKCkgY2FsbHNcXG5cIiArXG4gICAgXCIqKiBmb3IgZWFjaCBjb2xsZWN0aW9uIHRoYXQgeW91IHdhbnQgY2xpZW50cyB0byBzZWUuXFxuXCIpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChuYW1lKVxuICAgICAgICBzZWxmLnB1Ymxpc2hfaGFuZGxlcnNbbmFtZV0gPSBoYW5kbGVyO1xuICAgICAgZWxzZSB7XG4gICAgICAgIHNlbGYudW5pdmVyc2FsX3B1Ymxpc2hfaGFuZGxlcnMucHVzaChoYW5kbGVyKTtcbiAgICAgICAgLy8gU3BpbiB1cCB0aGUgbmV3IHB1Ymxpc2hlciBvbiBhbnkgZXhpc3Rpbmcgc2Vzc2lvbiB0b28uIFJ1biBlYWNoXG4gICAgICAgIC8vIHNlc3Npb24ncyBzdWJzY3JpcHRpb24gaW4gYSBuZXcgRmliZXIsIHNvIHRoYXQgdGhlcmUncyBubyBjaGFuZ2UgZm9yXG4gICAgICAgIC8vIHNlbGYuc2Vzc2lvbnMgdG8gY2hhbmdlIHdoaWxlIHdlJ3JlIHJ1bm5pbmcgdGhpcyBsb29wLlxuICAgICAgICBzZWxmLnNlc3Npb25zLmZvckVhY2goZnVuY3Rpb24gKHNlc3Npb24pIHtcbiAgICAgICAgICBpZiAoIXNlc3Npb24uX2RvbnRTdGFydE5ld1VuaXZlcnNhbFN1YnMpIHtcbiAgICAgICAgICAgIHNlc3Npb24uX3N0YXJ0U3Vic2NyaXB0aW9uKGhhbmRsZXIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2V7XG4gICAgICBPYmplY3QuZW50cmllcyhuYW1lKS5mb3JFYWNoKGZ1bmN0aW9uKFtrZXksIHZhbHVlXSkge1xuICAgICAgICBzZWxmLnB1Ymxpc2goa2V5LCB2YWx1ZSwge30pO1xuICAgICAgfSk7XG4gICAgfVxuICB9LFxuXG4gIF9yZW1vdmVTZXNzaW9uOiBmdW5jdGlvbiAoc2Vzc2lvbikge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBzZWxmLnNlc3Npb25zLmRlbGV0ZShzZXNzaW9uLmlkKTtcbiAgfSxcblxuICAvKipcbiAgICogQHN1bW1hcnkgVGVsbHMgaWYgdGhlIG1ldGhvZCBjYWxsIGNhbWUgZnJvbSBhIGNhbGwgb3IgYSBjYWxsQXN5bmMuXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWVtYmVyT2YgTWV0ZW9yXG4gICAqIEBpbXBvcnRGcm9tUGFja2FnZSBtZXRlb3JcbiAgICogQHJldHVybnMgYm9vbGVhblxuICAgKi9cbiAgaXNBc3luY0NhbGw6IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIEREUC5fQ3VycmVudE1ldGhvZEludm9jYXRpb24uX2lzQ2FsbEFzeW5jTWV0aG9kUnVubmluZygpXG4gIH0sXG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IERlZmluZXMgZnVuY3Rpb25zIHRoYXQgY2FuIGJlIGludm9rZWQgb3ZlciB0aGUgbmV0d29yayBieSBjbGllbnRzLlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQHBhcmFtIHtPYmplY3R9IG1ldGhvZHMgRGljdGlvbmFyeSB3aG9zZSBrZXlzIGFyZSBtZXRob2QgbmFtZXMgYW5kIHZhbHVlcyBhcmUgZnVuY3Rpb25zLlxuICAgKiBAbWVtYmVyT2YgTWV0ZW9yXG4gICAqIEBpbXBvcnRGcm9tUGFja2FnZSBtZXRlb3JcbiAgICovXG4gIG1ldGhvZHM6IGZ1bmN0aW9uIChtZXRob2RzKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIE9iamVjdC5lbnRyaWVzKG1ldGhvZHMpLmZvckVhY2goZnVuY3Rpb24gKFtuYW1lLCBmdW5jXSkge1xuICAgICAgaWYgKHR5cGVvZiBmdW5jICE9PSAnZnVuY3Rpb24nKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2QgJ1wiICsgbmFtZSArIFwiJyBtdXN0IGJlIGEgZnVuY3Rpb25cIik7XG4gICAgICBpZiAoc2VsZi5tZXRob2RfaGFuZGxlcnNbbmFtZV0pXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkEgbWV0aG9kIG5hbWVkICdcIiArIG5hbWUgKyBcIicgaXMgYWxyZWFkeSBkZWZpbmVkXCIpO1xuICAgICAgc2VsZi5tZXRob2RfaGFuZGxlcnNbbmFtZV0gPSBmdW5jO1xuICAgIH0pO1xuICB9LFxuXG4gIGNhbGw6IGZ1bmN0aW9uIChuYW1lLCAuLi5hcmdzKSB7XG4gICAgaWYgKGFyZ3MubGVuZ3RoICYmIHR5cGVvZiBhcmdzW2FyZ3MubGVuZ3RoIC0gMV0gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgLy8gSWYgaXQncyBhIGZ1bmN0aW9uLCB0aGUgbGFzdCBhcmd1bWVudCBpcyB0aGUgcmVzdWx0IGNhbGxiYWNrLCBub3RcbiAgICAgIC8vIGEgcGFyYW1ldGVyIHRvIHRoZSByZW1vdGUgbWV0aG9kLlxuICAgICAgdmFyIGNhbGxiYWNrID0gYXJncy5wb3AoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5hcHBseShuYW1lLCBhcmdzLCBjYWxsYmFjayk7XG4gIH0sXG5cbiAgLy8gQSB2ZXJzaW9uIG9mIHRoZSBjYWxsIG1ldGhvZCB0aGF0IGFsd2F5cyByZXR1cm5zIGEgUHJvbWlzZS5cbiAgY2FsbEFzeW5jOiBmdW5jdGlvbiAobmFtZSwgLi4uYXJncykge1xuICAgIGNvbnN0IG9wdGlvbnMgPSBhcmdzWzBdPy5oYXNPd25Qcm9wZXJ0eSgncmV0dXJuU3R1YlZhbHVlJylcbiAgICAgID8gYXJncy5zaGlmdCgpXG4gICAgICA6IHt9O1xuICAgIEREUC5fQ3VycmVudE1ldGhvZEludm9jYXRpb24uX3NldENhbGxBc3luY01ldGhvZFJ1bm5pbmcodHJ1ZSk7XG4gICAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIEREUC5fQ3VycmVudENhbGxBc3luY0ludm9jYXRpb24uX3NldCh7IG5hbWUsIGhhc0NhbGxBc3luY1BhcmVudDogdHJ1ZSB9KTtcbiAgICAgIHRoaXMuYXBwbHlBc3luYyhuYW1lLCBhcmdzLCB7IGlzRnJvbUNhbGxBc3luYzogdHJ1ZSwgLi4ub3B0aW9ucyB9KVxuICAgICAgICAudGhlbihyZXNvbHZlKVxuICAgICAgICAuY2F0Y2gocmVqZWN0KVxuICAgICAgICAuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgRERQLl9DdXJyZW50Q2FsbEFzeW5jSW52b2NhdGlvbi5fc2V0KCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBwcm9taXNlLmZpbmFsbHkoKCkgPT5cbiAgICAgIEREUC5fQ3VycmVudE1ldGhvZEludm9jYXRpb24uX3NldENhbGxBc3luY01ldGhvZFJ1bm5pbmcoZmFsc2UpXG4gICAgKTtcbiAgfSxcblxuICBhcHBseTogZnVuY3Rpb24gKG5hbWUsIGFyZ3MsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgLy8gV2Ugd2VyZSBwYXNzZWQgMyBhcmd1bWVudHMuIFRoZXkgbWF5IGJlIGVpdGhlciAobmFtZSwgYXJncywgb3B0aW9ucylcbiAgICAvLyBvciAobmFtZSwgYXJncywgY2FsbGJhY2spXG4gICAgaWYgKCEgY2FsbGJhY2sgJiYgdHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNhbGxiYWNrID0gb3B0aW9ucztcbiAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgfVxuICAgIGNvbnN0IHByb21pc2UgPSB0aGlzLmFwcGx5QXN5bmMobmFtZSwgYXJncywgb3B0aW9ucyk7XG5cbiAgICAvLyBSZXR1cm4gdGhlIHJlc3VsdCBpbiB3aGljaGV2ZXIgd2F5IHRoZSBjYWxsZXIgYXNrZWQgZm9yIGl0LiBOb3RlIHRoYXQgd2VcbiAgICAvLyBkbyBOT1QgYmxvY2sgb24gdGhlIHdyaXRlIGZlbmNlIGluIGFuIGFuYWxvZ291cyB3YXkgdG8gaG93IHRoZSBjbGllbnRcbiAgICAvLyBibG9ja3Mgb24gdGhlIHJlbGV2YW50IGRhdGEgYmVpbmcgdmlzaWJsZSwgc28geW91IGFyZSBOT1QgZ3VhcmFudGVlZCB0aGF0XG4gICAgLy8gY3Vyc29yIG9ic2VydmUgY2FsbGJhY2tzIGhhdmUgZmlyZWQgd2hlbiB5b3VyIGNhbGxiYWNrIGlzIGludm9rZWQuIChXZVxuICAgIC8vIGNhbiBjaGFuZ2UgdGhpcyBpZiB0aGVyZSdzIGEgcmVhbCB1c2UgY2FzZSkuXG4gICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICBwcm9taXNlLnRoZW4oXG4gICAgICAgIHJlc3VsdCA9PiBjYWxsYmFjayh1bmRlZmluZWQsIHJlc3VsdCksXG4gICAgICAgIGV4Y2VwdGlvbiA9PiBjYWxsYmFjayhleGNlcHRpb24pXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG4gIH0sXG5cbiAgLy8gQHBhcmFtIG9wdGlvbnMge09wdGlvbmFsIE9iamVjdH1cbiAgYXBwbHlBc3luYzogZnVuY3Rpb24gKG5hbWUsIGFyZ3MsIG9wdGlvbnMpIHtcbiAgICAvLyBSdW4gdGhlIGhhbmRsZXJcbiAgICB2YXIgaGFuZGxlciA9IHRoaXMubWV0aG9kX2hhbmRsZXJzW25hbWVdO1xuXG4gICAgaWYgKCEgaGFuZGxlcikge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KFxuICAgICAgICBuZXcgTWV0ZW9yLkVycm9yKDQwNCwgYE1ldGhvZCAnJHtuYW1lfScgbm90IGZvdW5kYClcbiAgICAgICk7XG4gICAgfVxuICAgIC8vIElmIHRoaXMgaXMgYSBtZXRob2QgY2FsbCBmcm9tIHdpdGhpbiBhbm90aGVyIG1ldGhvZCBvciBwdWJsaXNoIGZ1bmN0aW9uLFxuICAgIC8vIGdldCB0aGUgdXNlciBzdGF0ZSBmcm9tIHRoZSBvdXRlciBtZXRob2Qgb3IgcHVibGlzaCBmdW5jdGlvbiwgb3RoZXJ3aXNlXG4gICAgLy8gZG9uJ3QgYWxsb3cgc2V0VXNlcklkIHRvIGJlIGNhbGxlZFxuICAgIHZhciB1c2VySWQgPSBudWxsO1xuICAgIGxldCBzZXRVc2VySWQgPSAoKSA9PiB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBjYWxsIHNldFVzZXJJZCBvbiBhIHNlcnZlciBpbml0aWF0ZWQgbWV0aG9kIGNhbGxcIik7XG4gICAgfTtcbiAgICB2YXIgY29ubmVjdGlvbiA9IG51bGw7XG4gICAgdmFyIGN1cnJlbnRNZXRob2RJbnZvY2F0aW9uID0gRERQLl9DdXJyZW50TWV0aG9kSW52b2NhdGlvbi5nZXQoKTtcbiAgICB2YXIgY3VycmVudFB1YmxpY2F0aW9uSW52b2NhdGlvbiA9IEREUC5fQ3VycmVudFB1YmxpY2F0aW9uSW52b2NhdGlvbi5nZXQoKTtcbiAgICB2YXIgcmFuZG9tU2VlZCA9IG51bGw7XG5cbiAgICBpZiAoY3VycmVudE1ldGhvZEludm9jYXRpb24pIHtcbiAgICAgIHVzZXJJZCA9IGN1cnJlbnRNZXRob2RJbnZvY2F0aW9uLnVzZXJJZDtcbiAgICAgIHNldFVzZXJJZCA9ICh1c2VySWQpID0+IGN1cnJlbnRNZXRob2RJbnZvY2F0aW9uLnNldFVzZXJJZCh1c2VySWQpO1xuICAgICAgY29ubmVjdGlvbiA9IGN1cnJlbnRNZXRob2RJbnZvY2F0aW9uLmNvbm5lY3Rpb247XG4gICAgICByYW5kb21TZWVkID0gRERQQ29tbW9uLm1ha2VScGNTZWVkKGN1cnJlbnRNZXRob2RJbnZvY2F0aW9uLCBuYW1lKTtcbiAgICB9IGVsc2UgaWYgKGN1cnJlbnRQdWJsaWNhdGlvbkludm9jYXRpb24pIHtcbiAgICAgIHVzZXJJZCA9IGN1cnJlbnRQdWJsaWNhdGlvbkludm9jYXRpb24udXNlcklkO1xuICAgICAgc2V0VXNlcklkID0gKHVzZXJJZCkgPT4gY3VycmVudFB1YmxpY2F0aW9uSW52b2NhdGlvbi5fc2Vzc2lvbi5fc2V0VXNlcklkKHVzZXJJZCk7XG4gICAgICBjb25uZWN0aW9uID0gY3VycmVudFB1YmxpY2F0aW9uSW52b2NhdGlvbi5jb25uZWN0aW9uO1xuICAgIH1cblxuICAgIHZhciBpbnZvY2F0aW9uID0gbmV3IEREUENvbW1vbi5NZXRob2RJbnZvY2F0aW9uKHtcbiAgICAgIGlzU2ltdWxhdGlvbjogZmFsc2UsXG4gICAgICB1c2VySWQsXG4gICAgICBzZXRVc2VySWQsXG4gICAgICBjb25uZWN0aW9uLFxuICAgICAgcmFuZG9tU2VlZFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGxldCByZXN1bHQ7XG4gICAgICB0cnkge1xuICAgICAgICByZXN1bHQgPSBERFAuX0N1cnJlbnRNZXRob2RJbnZvY2F0aW9uLndpdGhWYWx1ZShpbnZvY2F0aW9uLCAoKSA9PlxuICAgICAgICAgIG1heWJlQXVkaXRBcmd1bWVudENoZWNrcyhcbiAgICAgICAgICAgIGhhbmRsZXIsXG4gICAgICAgICAgICBpbnZvY2F0aW9uLFxuICAgICAgICAgICAgRUpTT04uY2xvbmUoYXJncyksXG4gICAgICAgICAgICBcImludGVybmFsIGNhbGwgdG8gJ1wiICsgbmFtZSArIFwiJ1wiXG4gICAgICAgICAgKVxuICAgICAgICApO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gcmVqZWN0KGUpO1xuICAgICAgfVxuICAgICAgaWYgKCFNZXRlb3IuX2lzUHJvbWlzZShyZXN1bHQpKSB7XG4gICAgICAgIHJldHVybiByZXNvbHZlKHJlc3VsdCk7XG4gICAgICB9XG4gICAgICByZXN1bHQudGhlbihyID0+IHJlc29sdmUocikpLmNhdGNoKHJlamVjdCk7XG4gICAgfSkudGhlbihFSlNPTi5jbG9uZSk7XG4gIH0sXG5cbiAgX3VybEZvclNlc3Npb246IGZ1bmN0aW9uIChzZXNzaW9uSWQpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIHNlc3Npb24gPSBzZWxmLnNlc3Npb25zLmdldChzZXNzaW9uSWQpO1xuICAgIGlmIChzZXNzaW9uKVxuICAgICAgcmV0dXJuIHNlc3Npb24uX3NvY2tldFVybDtcbiAgICBlbHNlXG4gICAgICByZXR1cm4gbnVsbDtcbiAgfVxufSk7XG5cbnZhciBjYWxjdWxhdGVWZXJzaW9uID0gZnVuY3Rpb24gKGNsaWVudFN1cHBvcnRlZFZlcnNpb25zLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VydmVyU3VwcG9ydGVkVmVyc2lvbnMpIHtcbiAgdmFyIGNvcnJlY3RWZXJzaW9uID0gY2xpZW50U3VwcG9ydGVkVmVyc2lvbnMuZmluZChmdW5jdGlvbiAodmVyc2lvbikge1xuICAgIHJldHVybiBzZXJ2ZXJTdXBwb3J0ZWRWZXJzaW9ucy5pbmNsdWRlcyh2ZXJzaW9uKTtcbiAgfSk7XG4gIGlmICghY29ycmVjdFZlcnNpb24pIHtcbiAgICBjb3JyZWN0VmVyc2lvbiA9IHNlcnZlclN1cHBvcnRlZFZlcnNpb25zWzBdO1xuICB9XG4gIHJldHVybiBjb3JyZWN0VmVyc2lvbjtcbn07XG5cbkREUFNlcnZlci5fY2FsY3VsYXRlVmVyc2lvbiA9IGNhbGN1bGF0ZVZlcnNpb247XG5cblxuLy8gXCJibGluZFwiIGV4Y2VwdGlvbnMgb3RoZXIgdGhhbiB0aG9zZSB0aGF0IHdlcmUgZGVsaWJlcmF0ZWx5IHRocm93biB0byBzaWduYWxcbi8vIGVycm9ycyB0byB0aGUgY2xpZW50XG52YXIgd3JhcEludGVybmFsRXhjZXB0aW9uID0gZnVuY3Rpb24gKGV4Y2VwdGlvbiwgY29udGV4dCkge1xuICBpZiAoIWV4Y2VwdGlvbikgcmV0dXJuIGV4Y2VwdGlvbjtcblxuICAvLyBUbyBhbGxvdyBwYWNrYWdlcyB0byB0aHJvdyBlcnJvcnMgaW50ZW5kZWQgZm9yIHRoZSBjbGllbnQgYnV0IG5vdCBoYXZlIHRvXG4gIC8vIGRlcGVuZCBvbiB0aGUgTWV0ZW9yLkVycm9yIGNsYXNzLCBgaXNDbGllbnRTYWZlYCBjYW4gYmUgc2V0IHRvIHRydWUgb24gYW55XG4gIC8vIGVycm9yIGJlZm9yZSBpdCBpcyB0aHJvd24uXG4gIGlmIChleGNlcHRpb24uaXNDbGllbnRTYWZlKSB7XG4gICAgaWYgKCEoZXhjZXB0aW9uIGluc3RhbmNlb2YgTWV0ZW9yLkVycm9yKSkge1xuICAgICAgY29uc3Qgb3JpZ2luYWxNZXNzYWdlID0gZXhjZXB0aW9uLm1lc3NhZ2U7XG4gICAgICBleGNlcHRpb24gPSBuZXcgTWV0ZW9yLkVycm9yKGV4Y2VwdGlvbi5lcnJvciwgZXhjZXB0aW9uLnJlYXNvbiwgZXhjZXB0aW9uLmRldGFpbHMpO1xuICAgICAgZXhjZXB0aW9uLm1lc3NhZ2UgPSBvcmlnaW5hbE1lc3NhZ2U7XG4gICAgfVxuICAgIHJldHVybiBleGNlcHRpb247XG4gIH1cblxuICAvLyBUZXN0cyBjYW4gc2V0IHRoZSAnX2V4cGVjdGVkQnlUZXN0JyBmbGFnIG9uIGFuIGV4Y2VwdGlvbiBzbyBpdCB3b24ndCBnbyB0b1xuICAvLyB0aGUgc2VydmVyIGxvZy5cbiAgaWYgKCFleGNlcHRpb24uX2V4cGVjdGVkQnlUZXN0KSB7XG4gICAgTWV0ZW9yLl9kZWJ1ZyhcIkV4Y2VwdGlvbiBcIiArIGNvbnRleHQsIGV4Y2VwdGlvbi5zdGFjayk7XG4gICAgaWYgKGV4Y2VwdGlvbi5zYW5pdGl6ZWRFcnJvcikge1xuICAgICAgTWV0ZW9yLl9kZWJ1ZyhcIlNhbml0aXplZCBhbmQgcmVwb3J0ZWQgdG8gdGhlIGNsaWVudCBhczpcIiwgZXhjZXB0aW9uLnNhbml0aXplZEVycm9yKTtcbiAgICAgIE1ldGVvci5fZGVidWcoKTtcbiAgICB9XG4gIH1cblxuICAvLyBEaWQgdGhlIGVycm9yIGNvbnRhaW4gbW9yZSBkZXRhaWxzIHRoYXQgY291bGQgaGF2ZSBiZWVuIHVzZWZ1bCBpZiBjYXVnaHQgaW5cbiAgLy8gc2VydmVyIGNvZGUgKG9yIGlmIHRocm93biBmcm9tIG5vbi1jbGllbnQtb3JpZ2luYXRlZCBjb2RlKSwgYnV0IGFsc29cbiAgLy8gcHJvdmlkZWQgYSBcInNhbml0aXplZFwiIHZlcnNpb24gd2l0aCBtb3JlIGNvbnRleHQgdGhhbiA1MDAgSW50ZXJuYWwgc2VydmVyIGVycm9yPyBVc2UgdGhhdC5cbiAgaWYgKGV4Y2VwdGlvbi5zYW5pdGl6ZWRFcnJvcikge1xuICAgIGlmIChleGNlcHRpb24uc2FuaXRpemVkRXJyb3IuaXNDbGllbnRTYWZlKVxuICAgICAgcmV0dXJuIGV4Y2VwdGlvbi5zYW5pdGl6ZWRFcnJvcjtcbiAgICBNZXRlb3IuX2RlYnVnKFwiRXhjZXB0aW9uIFwiICsgY29udGV4dCArIFwiIHByb3ZpZGVzIGEgc2FuaXRpemVkRXJyb3IgdGhhdCBcIiArXG4gICAgICAgICAgICAgICAgICBcImRvZXMgbm90IGhhdmUgaXNDbGllbnRTYWZlIHByb3BlcnR5IHNldDsgaWdub3JpbmdcIik7XG4gIH1cblxuICByZXR1cm4gbmV3IE1ldGVvci5FcnJvcig1MDAsIFwiSW50ZXJuYWwgc2VydmVyIGVycm9yXCIpO1xufTtcblxuXG4vLyBBdWRpdCBhcmd1bWVudCBjaGVja3MsIGlmIHRoZSBhdWRpdC1hcmd1bWVudC1jaGVja3MgcGFja2FnZSBleGlzdHMgKGl0IGlzIGFcbi8vIHdlYWsgZGVwZW5kZW5jeSBvZiB0aGlzIHBhY2thZ2UpLlxudmFyIG1heWJlQXVkaXRBcmd1bWVudENoZWNrcyA9IGZ1bmN0aW9uIChmLCBjb250ZXh0LCBhcmdzLCBkZXNjcmlwdGlvbikge1xuICBhcmdzID0gYXJncyB8fCBbXTtcbiAgaWYgKFBhY2thZ2VbJ2F1ZGl0LWFyZ3VtZW50LWNoZWNrcyddKSB7XG4gICAgcmV0dXJuIE1hdGNoLl9mYWlsSWZBcmd1bWVudHNBcmVOb3RBbGxDaGVja2VkKFxuICAgICAgZiwgY29udGV4dCwgYXJncywgZGVzY3JpcHRpb24pO1xuICB9XG4gIHJldHVybiBmLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xufTsiLCJERFBTZXJ2ZXIuX1dyaXRlRmVuY2UgPSBjbGFzcyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuYXJtZWQgPSBmYWxzZTtcbiAgICB0aGlzLmZpcmVkID0gZmFsc2U7XG4gICAgdGhpcy5yZXRpcmVkID0gZmFsc2U7XG4gICAgdGhpcy5vdXRzdGFuZGluZ193cml0ZXMgPSAwO1xuICAgIHRoaXMuYmVmb3JlX2ZpcmVfY2FsbGJhY2tzID0gW107XG4gICAgdGhpcy5jb21wbGV0aW9uX2NhbGxiYWNrcyA9IFtdO1xuICB9XG5cbiAgYmVnaW5Xcml0ZSgpIHtcbiAgICBpZiAodGhpcy5yZXRpcmVkKSB7XG4gICAgICByZXR1cm4geyBjb21taXR0ZWQ6ICgpID0+IHt9IH07XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZmlyZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcImZlbmNlIGhhcyBhbHJlYWR5IGFjdGl2YXRlZCAtLSB0b28gbGF0ZSB0byBhZGQgd3JpdGVzXCIpO1xuICAgIH1cblxuICAgIHRoaXMub3V0c3RhbmRpbmdfd3JpdGVzKys7XG4gICAgbGV0IGNvbW1pdHRlZCA9IGZhbHNlO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGNvbW1pdHRlZDogYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoY29tbWl0dGVkKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiY29tbWl0dGVkIGNhbGxlZCB0d2ljZSBvbiB0aGUgc2FtZSB3cml0ZVwiKTtcbiAgICAgICAgfVxuICAgICAgICBjb21taXR0ZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLm91dHN0YW5kaW5nX3dyaXRlcy0tO1xuICAgICAgICBhd2FpdCB0aGlzLl9tYXliZUZpcmUoKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgYXJtKCkge1xuICAgIGlmICh0aGlzID09PSBERFBTZXJ2ZXIuX2dldEN1cnJlbnRGZW5jZSgpKSB7XG4gICAgICB0aHJvdyBFcnJvcihcIkNhbid0IGFybSB0aGUgY3VycmVudCBmZW5jZVwiKTtcbiAgICB9XG4gICAgdGhpcy5hcm1lZCA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXMuX21heWJlRmlyZSgpO1xuICB9XG5cbiAgb25CZWZvcmVGaXJlKGZ1bmMpIHtcbiAgICBpZiAodGhpcy5maXJlZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiZmVuY2UgaGFzIGFscmVhZHkgYWN0aXZhdGVkIC0tIHRvbyBsYXRlIHRvIGFkZCBhIGNhbGxiYWNrXCIpO1xuICAgIH1cbiAgICB0aGlzLmJlZm9yZV9maXJlX2NhbGxiYWNrcy5wdXNoKGZ1bmMpO1xuICB9XG5cbiAgb25BbGxDb21taXR0ZWQoZnVuYykge1xuICAgIGlmICh0aGlzLmZpcmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJmZW5jZSBoYXMgYWxyZWFkeSBhY3RpdmF0ZWQgLS0gdG9vIGxhdGUgdG8gYWRkIGEgY2FsbGJhY2tcIik7XG4gICAgfVxuICAgIHRoaXMuY29tcGxldGlvbl9jYWxsYmFja3MucHVzaChmdW5jKTtcbiAgfVxuXG4gIGFzeW5jIF9hcm1BbmRXYWl0KCkge1xuICAgIGxldCByZXNvbHZlcjtcbiAgICBjb25zdCByZXR1cm5WYWx1ZSA9IG5ldyBQcm9taXNlKHIgPT4gcmVzb2x2ZXIgPSByKTtcbiAgICB0aGlzLm9uQWxsQ29tbWl0dGVkKHJlc29sdmVyKTtcbiAgICBhd2FpdCB0aGlzLmFybSgpO1xuICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbiAgfVxuXG4gIGFybUFuZFdhaXQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FybUFuZFdhaXQoKTtcbiAgfVxuXG4gIGFzeW5jIF9tYXliZUZpcmUoKSB7XG4gICAgaWYgKHRoaXMuZmlyZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIndyaXRlIGZlbmNlIGFscmVhZHkgYWN0aXZhdGVkP1wiKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuYXJtZWQgfHwgdGhpcy5vdXRzdGFuZGluZ193cml0ZXMgPiAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgaW52b2tlQ2FsbGJhY2sgPSBhc3luYyAoZnVuYykgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgZnVuYyh0aGlzKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBNZXRlb3IuX2RlYnVnKFwiZXhjZXB0aW9uIGluIHdyaXRlIGZlbmNlIGNhbGxiYWNrOlwiLCBlcnIpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLm91dHN0YW5kaW5nX3dyaXRlcysrO1xuXG4gICAgLy8gUHJvY2VzcyBhbGwgYmVmb3JlX2ZpcmUgY2FsbGJhY2tzIGluIHBhcmFsbGVsXG4gICAgY29uc3QgYmVmb3JlQ2FsbGJhY2tzID0gWy4uLnRoaXMuYmVmb3JlX2ZpcmVfY2FsbGJhY2tzXTtcbiAgICB0aGlzLmJlZm9yZV9maXJlX2NhbGxiYWNrcyA9IFtdO1xuICAgIGF3YWl0IFByb21pc2UuYWxsKGJlZm9yZUNhbGxiYWNrcy5tYXAoY2IgPT4gaW52b2tlQ2FsbGJhY2soY2IpKSk7XG5cbiAgICB0aGlzLm91dHN0YW5kaW5nX3dyaXRlcy0tO1xuXG4gICAgaWYgKHRoaXMub3V0c3RhbmRpbmdfd3JpdGVzID09PSAwKSB7XG4gICAgICB0aGlzLmZpcmVkID0gdHJ1ZTtcbiAgICAgIC8vIFByb2Nlc3MgYWxsIGNvbXBsZXRpb24gY2FsbGJhY2tzIGluIHBhcmFsbGVsXG4gICAgICBjb25zdCBjYWxsYmFja3MgPSBbLi4udGhpcy5jb21wbGV0aW9uX2NhbGxiYWNrc107XG4gICAgICB0aGlzLmNvbXBsZXRpb25fY2FsbGJhY2tzID0gW107XG4gICAgICBhd2FpdCBQcm9taXNlLmFsbChjYWxsYmFja3MubWFwKGNiID0+IGludm9rZUNhbGxiYWNrKGNiKSkpO1xuICAgIH1cbiAgfVxuXG4gIHJldGlyZSgpIHtcbiAgICBpZiAoIXRoaXMuZmlyZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IHJldGlyZSBhIGZlbmNlIHRoYXQgaGFzbid0IGZpcmVkLlwiKTtcbiAgICB9XG4gICAgdGhpcy5yZXRpcmVkID0gdHJ1ZTtcbiAgfVxufTtcblxuRERQU2VydmVyLl9DdXJyZW50V3JpdGVGZW5jZSA9IG5ldyBNZXRlb3IuRW52aXJvbm1lbnRWYXJpYWJsZTsiLCIvLyBBIFwiY3Jvc3NiYXJcIiBpcyBhIGNsYXNzIHRoYXQgcHJvdmlkZXMgc3RydWN0dXJlZCBub3RpZmljYXRpb24gcmVnaXN0cmF0aW9uLlxuLy8gU2VlIF9tYXRjaCBmb3IgdGhlIGRlZmluaXRpb24gb2YgaG93IGEgbm90aWZpY2F0aW9uIG1hdGNoZXMgYSB0cmlnZ2VyLlxuLy8gQWxsIG5vdGlmaWNhdGlvbnMgYW5kIHRyaWdnZXJzIG11c3QgaGF2ZSBhIHN0cmluZyBrZXkgbmFtZWQgJ2NvbGxlY3Rpb24nLlxuXG5ERFBTZXJ2ZXIuX0Nyb3NzYmFyID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICBzZWxmLm5leHRJZCA9IDE7XG4gIC8vIG1hcCBmcm9tIGNvbGxlY3Rpb24gbmFtZSAoc3RyaW5nKSAtPiBsaXN0ZW5lciBpZCAtPiBvYmplY3QuIGVhY2ggb2JqZWN0IGhhc1xuICAvLyBrZXlzICd0cmlnZ2VyJywgJ2NhbGxiYWNrJy4gIEFzIGEgaGFjaywgdGhlIGVtcHR5IHN0cmluZyBtZWFucyBcIm5vXG4gIC8vIGNvbGxlY3Rpb25cIi5cbiAgc2VsZi5saXN0ZW5lcnNCeUNvbGxlY3Rpb24gPSB7fTtcbiAgc2VsZi5saXN0ZW5lcnNCeUNvbGxlY3Rpb25Db3VudCA9IHt9O1xuICBzZWxmLmZhY3RQYWNrYWdlID0gb3B0aW9ucy5mYWN0UGFja2FnZSB8fCBcImxpdmVkYXRhXCI7XG4gIHNlbGYuZmFjdE5hbWUgPSBvcHRpb25zLmZhY3ROYW1lIHx8IG51bGw7XG59O1xuXG5PYmplY3QuYXNzaWduKEREUFNlcnZlci5fQ3Jvc3NiYXIucHJvdG90eXBlLCB7XG4gIC8vIG1zZyBpcyBhIHRyaWdnZXIgb3IgYSBub3RpZmljYXRpb25cbiAgX2NvbGxlY3Rpb25Gb3JNZXNzYWdlOiBmdW5jdGlvbiAobXNnKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmICghKCdjb2xsZWN0aW9uJyBpbiBtc2cpKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YobXNnLmNvbGxlY3Rpb24pID09PSAnc3RyaW5nJykge1xuICAgICAgaWYgKG1zZy5jb2xsZWN0aW9uID09PSAnJylcbiAgICAgICAgdGhyb3cgRXJyb3IoXCJNZXNzYWdlIGhhcyBlbXB0eSBjb2xsZWN0aW9uIVwiKTtcbiAgICAgIHJldHVybiBtc2cuY29sbGVjdGlvbjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgRXJyb3IoXCJNZXNzYWdlIGhhcyBub24tc3RyaW5nIGNvbGxlY3Rpb24hXCIpO1xuICAgIH1cbiAgfSxcblxuICAvLyBMaXN0ZW4gZm9yIG5vdGlmaWNhdGlvbiB0aGF0IG1hdGNoICd0cmlnZ2VyJy4gQSBub3RpZmljYXRpb25cbiAgLy8gbWF0Y2hlcyBpZiBpdCBoYXMgdGhlIGtleS12YWx1ZSBwYWlycyBpbiB0cmlnZ2VyIGFzIGFcbiAgLy8gc3Vic2V0LiBXaGVuIGEgbm90aWZpY2F0aW9uIG1hdGNoZXMsIGNhbGwgJ2NhbGxiYWNrJywgcGFzc2luZ1xuICAvLyB0aGUgYWN0dWFsIG5vdGlmaWNhdGlvbi5cbiAgLy9cbiAgLy8gUmV0dXJucyBhIGxpc3RlbiBoYW5kbGUsIHdoaWNoIGlzIGFuIG9iamVjdCB3aXRoIGEgbWV0aG9kXG4gIC8vIHN0b3AoKS4gQ2FsbCBzdG9wKCkgdG8gc3RvcCBsaXN0ZW5pbmcuXG4gIC8vXG4gIC8vIFhYWCBJdCBzaG91bGQgYmUgbGVnYWwgdG8gY2FsbCBmaXJlKCkgZnJvbSBpbnNpZGUgYSBsaXN0ZW4oKVxuICAvLyBjYWxsYmFjaz9cbiAgbGlzdGVuOiBmdW5jdGlvbiAodHJpZ2dlciwgY2FsbGJhY2spIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGlkID0gc2VsZi5uZXh0SWQrKztcblxuICAgIHZhciBjb2xsZWN0aW9uID0gc2VsZi5fY29sbGVjdGlvbkZvck1lc3NhZ2UodHJpZ2dlcik7XG4gICAgdmFyIHJlY29yZCA9IHt0cmlnZ2VyOiBFSlNPTi5jbG9uZSh0cmlnZ2VyKSwgY2FsbGJhY2s6IGNhbGxiYWNrfTtcbiAgICBpZiAoISAoY29sbGVjdGlvbiBpbiBzZWxmLmxpc3RlbmVyc0J5Q29sbGVjdGlvbikpIHtcbiAgICAgIHNlbGYubGlzdGVuZXJzQnlDb2xsZWN0aW9uW2NvbGxlY3Rpb25dID0ge307XG4gICAgICBzZWxmLmxpc3RlbmVyc0J5Q29sbGVjdGlvbkNvdW50W2NvbGxlY3Rpb25dID0gMDtcbiAgICB9XG4gICAgc2VsZi5saXN0ZW5lcnNCeUNvbGxlY3Rpb25bY29sbGVjdGlvbl1baWRdID0gcmVjb3JkO1xuICAgIHNlbGYubGlzdGVuZXJzQnlDb2xsZWN0aW9uQ291bnRbY29sbGVjdGlvbl0rKztcblxuICAgIGlmIChzZWxmLmZhY3ROYW1lICYmIFBhY2thZ2VbJ2ZhY3RzLWJhc2UnXSkge1xuICAgICAgUGFja2FnZVsnZmFjdHMtYmFzZSddLkZhY3RzLmluY3JlbWVudFNlcnZlckZhY3QoXG4gICAgICAgIHNlbGYuZmFjdFBhY2thZ2UsIHNlbGYuZmFjdE5hbWUsIDEpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBzdG9wOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChzZWxmLmZhY3ROYW1lICYmIFBhY2thZ2VbJ2ZhY3RzLWJhc2UnXSkge1xuICAgICAgICAgIFBhY2thZ2VbJ2ZhY3RzLWJhc2UnXS5GYWN0cy5pbmNyZW1lbnRTZXJ2ZXJGYWN0KFxuICAgICAgICAgICAgc2VsZi5mYWN0UGFja2FnZSwgc2VsZi5mYWN0TmFtZSwgLTEpO1xuICAgICAgICB9XG4gICAgICAgIGRlbGV0ZSBzZWxmLmxpc3RlbmVyc0J5Q29sbGVjdGlvbltjb2xsZWN0aW9uXVtpZF07XG4gICAgICAgIHNlbGYubGlzdGVuZXJzQnlDb2xsZWN0aW9uQ291bnRbY29sbGVjdGlvbl0tLTtcbiAgICAgICAgaWYgKHNlbGYubGlzdGVuZXJzQnlDb2xsZWN0aW9uQ291bnRbY29sbGVjdGlvbl0gPT09IDApIHtcbiAgICAgICAgICBkZWxldGUgc2VsZi5saXN0ZW5lcnNCeUNvbGxlY3Rpb25bY29sbGVjdGlvbl07XG4gICAgICAgICAgZGVsZXRlIHNlbGYubGlzdGVuZXJzQnlDb2xsZWN0aW9uQ291bnRbY29sbGVjdGlvbl07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9LFxuXG4gIC8vIEZpcmUgdGhlIHByb3ZpZGVkICdub3RpZmljYXRpb24nIChhbiBvYmplY3Qgd2hvc2UgYXR0cmlidXRlXG4gIC8vIHZhbHVlcyBhcmUgYWxsIEpTT04tY29tcGF0aWJpbGUpIC0tIGluZm9ybSBhbGwgbWF0Y2hpbmcgbGlzdGVuZXJzXG4gIC8vIChyZWdpc3RlcmVkIHdpdGggbGlzdGVuKCkpLlxuICAvL1xuICAvLyBJZiBmaXJlKCkgaXMgY2FsbGVkIGluc2lkZSBhIHdyaXRlIGZlbmNlLCB0aGVuIGVhY2ggb2YgdGhlXG4gIC8vIGxpc3RlbmVyIGNhbGxiYWNrcyB3aWxsIGJlIGNhbGxlZCBpbnNpZGUgdGhlIHdyaXRlIGZlbmNlIGFzIHdlbGwuXG4gIC8vXG4gIC8vIFRoZSBsaXN0ZW5lcnMgbWF5IGJlIGludm9rZWQgaW4gcGFyYWxsZWwsIHJhdGhlciB0aGFuIHNlcmlhbGx5LlxuICBmaXJlOiBhc3luYyBmdW5jdGlvbiAobm90aWZpY2F0aW9uKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgdmFyIGNvbGxlY3Rpb24gPSBzZWxmLl9jb2xsZWN0aW9uRm9yTWVzc2FnZShub3RpZmljYXRpb24pO1xuXG4gICAgaWYgKCEoY29sbGVjdGlvbiBpbiBzZWxmLmxpc3RlbmVyc0J5Q29sbGVjdGlvbikpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgbGlzdGVuZXJzRm9yQ29sbGVjdGlvbiA9IHNlbGYubGlzdGVuZXJzQnlDb2xsZWN0aW9uW2NvbGxlY3Rpb25dO1xuICAgIHZhciBjYWxsYmFja0lkcyA9IFtdO1xuICAgIE9iamVjdC5lbnRyaWVzKGxpc3RlbmVyc0ZvckNvbGxlY3Rpb24pLmZvckVhY2goZnVuY3Rpb24gKFtpZCwgbF0pIHtcbiAgICAgIGlmIChzZWxmLl9tYXRjaGVzKG5vdGlmaWNhdGlvbiwgbC50cmlnZ2VyKSkge1xuICAgICAgICBjYWxsYmFja0lkcy5wdXNoKGlkKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIExpc3RlbmVyIGNhbGxiYWNrcyBjYW4geWllbGQsIHNvIHdlIG5lZWQgdG8gZmlyc3QgZmluZCBhbGwgdGhlIG9uZXMgdGhhdFxuICAgIC8vIG1hdGNoIGluIGEgc2luZ2xlIGl0ZXJhdGlvbiBvdmVyIHNlbGYubGlzdGVuZXJzQnlDb2xsZWN0aW9uICh3aGljaCBjYW4ndFxuICAgIC8vIGJlIG11dGF0ZWQgZHVyaW5nIHRoaXMgaXRlcmF0aW9uKSwgYW5kIHRoZW4gaW52b2tlIHRoZSBtYXRjaGluZ1xuICAgIC8vIGNhbGxiYWNrcywgY2hlY2tpbmcgYmVmb3JlIGVhY2ggY2FsbCB0byBlbnN1cmUgdGhleSBoYXZlbid0IHN0b3BwZWQuXG4gICAgLy8gTm90ZSB0aGF0IHdlIGRvbid0IGhhdmUgdG8gY2hlY2sgdGhhdFxuICAgIC8vIHNlbGYubGlzdGVuZXJzQnlDb2xsZWN0aW9uW2NvbGxlY3Rpb25dIHN0aWxsID09PSBsaXN0ZW5lcnNGb3JDb2xsZWN0aW9uLFxuICAgIC8vIGJlY2F1c2UgdGhlIG9ubHkgd2F5IHRoYXQgc3RvcHMgYmVpbmcgdHJ1ZSBpcyBpZiBsaXN0ZW5lcnNGb3JDb2xsZWN0aW9uXG4gICAgLy8gZmlyc3QgZ2V0cyByZWR1Y2VkIGRvd24gdG8gdGhlIGVtcHR5IG9iamVjdCAoYW5kIHRoZW4gbmV2ZXIgZ2V0c1xuICAgIC8vIGluY3JlYXNlZCBhZ2FpbikuXG4gICAgZm9yIChjb25zdCBpZCBvZiBjYWxsYmFja0lkcykge1xuICAgICAgaWYgKGlkIGluIGxpc3RlbmVyc0ZvckNvbGxlY3Rpb24pIHtcbiAgICAgICAgYXdhaXQgbGlzdGVuZXJzRm9yQ29sbGVjdGlvbltpZF0uY2FsbGJhY2sobm90aWZpY2F0aW9uKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLy8gQSBub3RpZmljYXRpb24gbWF0Y2hlcyBhIHRyaWdnZXIgaWYgYWxsIGtleXMgdGhhdCBleGlzdCBpbiBib3RoIGFyZSBlcXVhbC5cbiAgLy9cbiAgLy8gRXhhbXBsZXM6XG4gIC8vICBOOntjb2xsZWN0aW9uOiBcIkNcIn0gbWF0Y2hlcyBUOntjb2xsZWN0aW9uOiBcIkNcIn1cbiAgLy8gICAgKGEgbm9uLXRhcmdldGVkIHdyaXRlIHRvIGEgY29sbGVjdGlvbiBtYXRjaGVzIGFcbiAgLy8gICAgIG5vbi10YXJnZXRlZCBxdWVyeSlcbiAgLy8gIE46e2NvbGxlY3Rpb246IFwiQ1wiLCBpZDogXCJYXCJ9IG1hdGNoZXMgVDp7Y29sbGVjdGlvbjogXCJDXCJ9XG4gIC8vICAgIChhIHRhcmdldGVkIHdyaXRlIHRvIGEgY29sbGVjdGlvbiBtYXRjaGVzIGEgbm9uLXRhcmdldGVkIHF1ZXJ5KVxuICAvLyAgTjp7Y29sbGVjdGlvbjogXCJDXCJ9IG1hdGNoZXMgVDp7Y29sbGVjdGlvbjogXCJDXCIsIGlkOiBcIlhcIn1cbiAgLy8gICAgKGEgbm9uLXRhcmdldGVkIHdyaXRlIHRvIGEgY29sbGVjdGlvbiBtYXRjaGVzIGFcbiAgLy8gICAgIHRhcmdldGVkIHF1ZXJ5KVxuICAvLyAgTjp7Y29sbGVjdGlvbjogXCJDXCIsIGlkOiBcIlhcIn0gbWF0Y2hlcyBUOntjb2xsZWN0aW9uOiBcIkNcIiwgaWQ6IFwiWFwifVxuICAvLyAgICAoYSB0YXJnZXRlZCB3cml0ZSB0byBhIGNvbGxlY3Rpb24gbWF0Y2hlcyBhIHRhcmdldGVkIHF1ZXJ5IHRhcmdldGVkXG4gIC8vICAgICBhdCB0aGUgc2FtZSBkb2N1bWVudClcbiAgLy8gIE46e2NvbGxlY3Rpb246IFwiQ1wiLCBpZDogXCJYXCJ9IGRvZXMgbm90IG1hdGNoIFQ6e2NvbGxlY3Rpb246IFwiQ1wiLCBpZDogXCJZXCJ9XG4gIC8vICAgIChhIHRhcmdldGVkIHdyaXRlIHRvIGEgY29sbGVjdGlvbiBkb2VzIG5vdCBtYXRjaCBhIHRhcmdldGVkIHF1ZXJ5XG4gIC8vICAgICB0YXJnZXRlZCBhdCBhIGRpZmZlcmVudCBkb2N1bWVudClcbiAgX21hdGNoZXM6IGZ1bmN0aW9uIChub3RpZmljYXRpb24sIHRyaWdnZXIpIHtcbiAgICAvLyBNb3N0IG5vdGlmaWNhdGlvbnMgdGhhdCB1c2UgdGhlIGNyb3NzYmFyIGhhdmUgYSBzdHJpbmcgYGNvbGxlY3Rpb25gIGFuZFxuICAgIC8vIG1heWJlIGFuIGBpZGAgdGhhdCBpcyBhIHN0cmluZyBvciBPYmplY3RJRC4gV2UncmUgYWxyZWFkeSBkaXZpZGluZyB1cFxuICAgIC8vIHRyaWdnZXJzIGJ5IGNvbGxlY3Rpb24sIGJ1dCBsZXQncyBmYXN0LXRyYWNrIFwibm9wZSwgZGlmZmVyZW50IElEXCIgKGFuZFxuICAgIC8vIGF2b2lkIHRoZSBvdmVybHkgZ2VuZXJpYyBFSlNPTi5lcXVhbHMpLiBUaGlzIG1ha2VzIGEgbm90aWNlYWJsZVxuICAgIC8vIHBlcmZvcm1hbmNlIGRpZmZlcmVuY2U7IHNlZSBodHRwczovL2dpdGh1Yi5jb20vbWV0ZW9yL21ldGVvci9wdWxsLzM2OTdcbiAgICBpZiAodHlwZW9mKG5vdGlmaWNhdGlvbi5pZCkgPT09ICdzdHJpbmcnICYmXG4gICAgICAgIHR5cGVvZih0cmlnZ2VyLmlkKSA9PT0gJ3N0cmluZycgJiZcbiAgICAgICAgbm90aWZpY2F0aW9uLmlkICE9PSB0cmlnZ2VyLmlkKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmIChub3RpZmljYXRpb24uaWQgaW5zdGFuY2VvZiBNb25nb0lELk9iamVjdElEICYmXG4gICAgICAgIHRyaWdnZXIuaWQgaW5zdGFuY2VvZiBNb25nb0lELk9iamVjdElEICYmXG4gICAgICAgICEgbm90aWZpY2F0aW9uLmlkLmVxdWFscyh0cmlnZ2VyLmlkKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiBPYmplY3Qua2V5cyh0cmlnZ2VyKS5ldmVyeShmdW5jdGlvbiAoa2V5KSB7XG4gICAgICByZXR1cm4gIShrZXkgaW4gbm90aWZpY2F0aW9uKSB8fCBFSlNPTi5lcXVhbHModHJpZ2dlcltrZXldLCBub3RpZmljYXRpb25ba2V5XSk7XG4gICAgIH0pO1xuICB9XG59KTtcblxuLy8gVGhlIFwiaW52YWxpZGF0aW9uIGNyb3NzYmFyXCIgaXMgYSBzcGVjaWZpYyBpbnN0YW5jZSB1c2VkIGJ5IHRoZSBERFAgc2VydmVyIHRvXG4vLyBpbXBsZW1lbnQgd3JpdGUgZmVuY2Ugbm90aWZpY2F0aW9ucy4gTGlzdGVuZXIgY2FsbGJhY2tzIG9uIHRoaXMgY3Jvc3NiYXJcbi8vIHNob3VsZCBjYWxsIGJlZ2luV3JpdGUgb24gdGhlIGN1cnJlbnQgd3JpdGUgZmVuY2UgYmVmb3JlIHRoZXkgcmV0dXJuLCBpZiB0aGV5XG4vLyB3YW50IHRvIGRlbGF5IHRoZSB3cml0ZSBmZW5jZSBmcm9tIGZpcmluZyAoaWUsIHRoZSBERFAgbWV0aG9kLWRhdGEtdXBkYXRlZFxuLy8gbWVzc2FnZSBmcm9tIGJlaW5nIHNlbnQpLlxuRERQU2VydmVyLl9JbnZhbGlkYXRpb25Dcm9zc2JhciA9IG5ldyBERFBTZXJ2ZXIuX0Nyb3NzYmFyKHtcbiAgZmFjdE5hbWU6IFwiaW52YWxpZGF0aW9uLWNyb3NzYmFyLWxpc3RlbmVyc1wiXG59KTsiLCJpZiAocHJvY2Vzcy5lbnYuRERQX0RFRkFVTFRfQ09OTkVDVElPTl9VUkwpIHtcbiAgX19tZXRlb3JfcnVudGltZV9jb25maWdfXy5ERFBfREVGQVVMVF9DT05ORUNUSU9OX1VSTCA9XG4gICAgcHJvY2Vzcy5lbnYuRERQX0RFRkFVTFRfQ09OTkVDVElPTl9VUkw7XG59XG5cbk1ldGVvci5zZXJ2ZXIgPSBuZXcgU2VydmVyKCk7XG5cbk1ldGVvci5yZWZyZXNoID0gYXN5bmMgZnVuY3Rpb24gKG5vdGlmaWNhdGlvbikge1xuICBhd2FpdCBERFBTZXJ2ZXIuX0ludmFsaWRhdGlvbkNyb3NzYmFyLmZpcmUobm90aWZpY2F0aW9uKTtcbn07XG5cbi8vIFByb3h5IHRoZSBwdWJsaWMgbWV0aG9kcyBvZiBNZXRlb3Iuc2VydmVyIHNvIHRoZXkgY2FuXG4vLyBiZSBjYWxsZWQgZGlyZWN0bHkgb24gTWV0ZW9yLlxuXG4gIFtcbiAgICAncHVibGlzaCcsXG4gICAgJ2lzQXN5bmNDYWxsJyxcbiAgICAnbWV0aG9kcycsXG4gICAgJ2NhbGwnLFxuICAgICdjYWxsQXN5bmMnLFxuICAgICdhcHBseScsXG4gICAgJ2FwcGx5QXN5bmMnLFxuICAgICdvbkNvbm5lY3Rpb24nLFxuICAgICdvbk1lc3NhZ2UnLFxuICBdLmZvckVhY2goXG4gIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBNZXRlb3JbbmFtZV0gPSBNZXRlb3Iuc2VydmVyW25hbWVdLmJpbmQoTWV0ZW9yLnNlcnZlcik7XG4gIH1cbik7XG4iLCJpbnRlcmZhY2UgQ2hhbmdlQ29sbGVjdG9yIHtcbiAgW2tleTogc3RyaW5nXTogYW55O1xufVxuXG5pbnRlcmZhY2UgRGF0YUVudHJ5IHtcbiAgc3Vic2NyaXB0aW9uSGFuZGxlOiBzdHJpbmc7XG4gIHZhbHVlOiBhbnk7XG59XG5cbmV4cG9ydCBjbGFzcyBEdW1teURvY3VtZW50VmlldyB7XG4gIHByaXZhdGUgZXhpc3RzSW46IFNldDxzdHJpbmc+O1xuICBwcml2YXRlIGRhdGFCeUtleTogTWFwPHN0cmluZywgRGF0YUVudHJ5W10+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZXhpc3RzSW4gPSBuZXcgU2V0PHN0cmluZz4oKTsgLy8gc2V0IG9mIHN1YnNjcmlwdGlvbkhhbmRsZVxuICAgIHRoaXMuZGF0YUJ5S2V5ID0gbmV3IE1hcDxzdHJpbmcsIERhdGFFbnRyeVtdPigpOyAvLyBrZXktPiBbIHtzdWJzY3JpcHRpb25IYW5kbGUsIHZhbHVlfSBieSBwcmVjZWRlbmNlXVxuICB9XG5cbiAgZ2V0RmllbGRzKCk6IFJlY29yZDxzdHJpbmcsIG5ldmVyPiB7XG4gICAgcmV0dXJuIHt9O1xuICB9XG5cbiAgY2xlYXJGaWVsZChcbiAgICBzdWJzY3JpcHRpb25IYW5kbGU6IHN0cmluZywgXG4gICAga2V5OiBzdHJpbmcsIFxuICAgIGNoYW5nZUNvbGxlY3RvcjogQ2hhbmdlQ29sbGVjdG9yXG4gICk6IHZvaWQge1xuICAgIGNoYW5nZUNvbGxlY3RvcltrZXldID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgY2hhbmdlRmllbGQoXG4gICAgc3Vic2NyaXB0aW9uSGFuZGxlOiBzdHJpbmcsXG4gICAga2V5OiBzdHJpbmcsXG4gICAgdmFsdWU6IGFueSxcbiAgICBjaGFuZ2VDb2xsZWN0b3I6IENoYW5nZUNvbGxlY3RvcixcbiAgICBpc0FkZD86IGJvb2xlYW5cbiAgKTogdm9pZCB7XG4gICAgY2hhbmdlQ29sbGVjdG9yW2tleV0gPSB2YWx1ZTtcbiAgfVxufSIsImltcG9ydCB7IER1bW15RG9jdW1lbnRWaWV3IH0gZnJvbSBcIi4vZHVtbXlfZG9jdW1lbnRfdmlld1wiO1xuaW1wb3J0IHsgU2Vzc2lvbkRvY3VtZW50VmlldyB9IGZyb20gXCIuL3Nlc3Npb25fZG9jdW1lbnRfdmlld1wiO1xuXG5pbnRlcmZhY2UgU2Vzc2lvbkNhbGxiYWNrcyB7XG4gIGFkZGVkOiAoY29sbGVjdGlvbk5hbWU6IHN0cmluZywgaWQ6IHN0cmluZywgZmllbGRzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KSA9PiB2b2lkO1xuICBjaGFuZ2VkOiAoY29sbGVjdGlvbk5hbWU6IHN0cmluZywgaWQ6IHN0cmluZywgZmllbGRzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KSA9PiB2b2lkO1xuICByZW1vdmVkOiAoY29sbGVjdGlvbk5hbWU6IHN0cmluZywgaWQ6IHN0cmluZykgPT4gdm9pZDtcbn1cblxudHlwZSBEb2N1bWVudFZpZXcgPSBTZXNzaW9uRG9jdW1lbnRWaWV3IHwgRHVtbXlEb2N1bWVudFZpZXc7XG5cbmV4cG9ydCBjbGFzcyBTZXNzaW9uQ29sbGVjdGlvblZpZXcge1xuICBwcml2YXRlIHJlYWRvbmx5IGNvbGxlY3Rpb25OYW1lOiBzdHJpbmc7XG4gIHByaXZhdGUgcmVhZG9ubHkgZG9jdW1lbnRzOiBNYXA8c3RyaW5nLCBEb2N1bWVudFZpZXc+O1xuICBwcml2YXRlIHJlYWRvbmx5IGNhbGxiYWNrczogU2Vzc2lvbkNhbGxiYWNrcztcblxuICAvKipcbiAgICogUmVwcmVzZW50cyBhIGNsaWVudCdzIHZpZXcgb2YgYSBzaW5nbGUgY29sbGVjdGlvblxuICAgKiBAcGFyYW0gY29sbGVjdGlvbk5hbWUgLSBOYW1lIG9mIHRoZSBjb2xsZWN0aW9uIGl0IHJlcHJlc2VudHNcbiAgICogQHBhcmFtIHNlc3Npb25DYWxsYmFja3MgLSBUaGUgY2FsbGJhY2tzIGZvciBhZGRlZCwgY2hhbmdlZCwgcmVtb3ZlZFxuICAgKi9cbiAgY29uc3RydWN0b3IoY29sbGVjdGlvbk5hbWU6IHN0cmluZywgc2Vzc2lvbkNhbGxiYWNrczogU2Vzc2lvbkNhbGxiYWNrcykge1xuICAgIHRoaXMuY29sbGVjdGlvbk5hbWUgPSBjb2xsZWN0aW9uTmFtZTtcbiAgICB0aGlzLmRvY3VtZW50cyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLmNhbGxiYWNrcyA9IHNlc3Npb25DYWxsYmFja3M7XG4gIH1cblxuICBwdWJsaWMgaXNFbXB0eSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5kb2N1bWVudHMuc2l6ZSA9PT0gMDtcbiAgfVxuXG4gIHB1YmxpYyBkaWZmKHByZXZpb3VzOiBTZXNzaW9uQ29sbGVjdGlvblZpZXcpOiB2b2lkIHtcbiAgICBEaWZmU2VxdWVuY2UuZGlmZk1hcHMocHJldmlvdXMuZG9jdW1lbnRzLCB0aGlzLmRvY3VtZW50cywge1xuICAgICAgYm90aDogdGhpcy5kaWZmRG9jdW1lbnQuYmluZCh0aGlzKSxcbiAgICAgIHJpZ2h0T25seTogKGlkOiBzdHJpbmcsIG5vd0RWOiBEb2N1bWVudFZpZXcpID0+IHtcbiAgICAgICAgdGhpcy5jYWxsYmFja3MuYWRkZWQodGhpcy5jb2xsZWN0aW9uTmFtZSwgaWQsIG5vd0RWLmdldEZpZWxkcygpKTtcbiAgICAgIH0sXG4gICAgICBsZWZ0T25seTogKGlkOiBzdHJpbmcsIHByZXZEVjogRG9jdW1lbnRWaWV3KSA9PiB7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tzLnJlbW92ZWQodGhpcy5jb2xsZWN0aW9uTmFtZSwgaWQpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBkaWZmRG9jdW1lbnQoaWQ6IHN0cmluZywgcHJldkRWOiBEb2N1bWVudFZpZXcsIG5vd0RWOiBEb2N1bWVudFZpZXcpOiB2b2lkIHtcbiAgICBjb25zdCBmaWVsZHM6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fTtcbiAgICBcbiAgICBEaWZmU2VxdWVuY2UuZGlmZk9iamVjdHMocHJldkRWLmdldEZpZWxkcygpLCBub3dEVi5nZXRGaWVsZHMoKSwge1xuICAgICAgYm90aDogKGtleTogc3RyaW5nLCBwcmV2OiBhbnksIG5vdzogYW55KSA9PiB7XG4gICAgICAgIGlmICghRUpTT04uZXF1YWxzKHByZXYsIG5vdykpIHtcbiAgICAgICAgICBmaWVsZHNba2V5XSA9IG5vdztcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHJpZ2h0T25seTogKGtleTogc3RyaW5nLCBub3c6IGFueSkgPT4ge1xuICAgICAgICBmaWVsZHNba2V5XSA9IG5vdztcbiAgICAgIH0sXG4gICAgICBsZWZ0T25seTogKGtleTogc3RyaW5nLCBwcmV2OiBhbnkpID0+IHtcbiAgICAgICAgZmllbGRzW2tleV0gPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfSk7XG4gICAgXG4gICAgdGhpcy5jYWxsYmFja3MuY2hhbmdlZCh0aGlzLmNvbGxlY3Rpb25OYW1lLCBpZCwgZmllbGRzKTtcbiAgfVxuXG4gIHB1YmxpYyBhZGRlZChzdWJzY3JpcHRpb25IYW5kbGU6IHN0cmluZywgaWQ6IHN0cmluZywgZmllbGRzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+KTogdm9pZCB7XG4gICAgbGV0IGRvY1ZpZXc6IERvY3VtZW50VmlldyB8IHVuZGVmaW5lZCA9IHRoaXMuZG9jdW1lbnRzLmdldChpZCk7XG4gICAgbGV0IGFkZGVkID0gZmFsc2U7XG5cbiAgICBpZiAoIWRvY1ZpZXcpIHtcbiAgICAgIGFkZGVkID0gdHJ1ZTtcbiAgICAgIGlmIChNZXRlb3Iuc2VydmVyLmdldFB1YmxpY2F0aW9uU3RyYXRlZ3kodGhpcy5jb2xsZWN0aW9uTmFtZSkudXNlRHVtbXlEb2N1bWVudFZpZXcpIHtcbiAgICAgICAgZG9jVmlldyA9IG5ldyBEdW1teURvY3VtZW50VmlldygpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZG9jVmlldyA9IG5ldyBTZXNzaW9uRG9jdW1lbnRWaWV3KCk7XG4gICAgICB9XG4gICAgICB0aGlzLmRvY3VtZW50cy5zZXQoaWQsIGRvY1ZpZXcpO1xuICAgIH1cblxuICAgIGRvY1ZpZXcuZXhpc3RzSW4uYWRkKHN1YnNjcmlwdGlvbkhhbmRsZSk7XG4gICAgY29uc3QgY2hhbmdlQ29sbGVjdG9yOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge307XG5cbiAgICBPYmplY3QuZW50cmllcyhmaWVsZHMpLmZvckVhY2goKFtrZXksIHZhbHVlXSkgPT4ge1xuICAgICAgZG9jVmlldyEuY2hhbmdlRmllbGQoXG4gICAgICAgIHN1YnNjcmlwdGlvbkhhbmRsZSxcbiAgICAgICAga2V5LFxuICAgICAgICB2YWx1ZSxcbiAgICAgICAgY2hhbmdlQ29sbGVjdG9yLFxuICAgICAgICB0cnVlXG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgaWYgKGFkZGVkKSB7XG4gICAgICB0aGlzLmNhbGxiYWNrcy5hZGRlZCh0aGlzLmNvbGxlY3Rpb25OYW1lLCBpZCwgY2hhbmdlQ29sbGVjdG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jYWxsYmFja3MuY2hhbmdlZCh0aGlzLmNvbGxlY3Rpb25OYW1lLCBpZCwgY2hhbmdlQ29sbGVjdG9yKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgY2hhbmdlZChzdWJzY3JpcHRpb25IYW5kbGU6IHN0cmluZywgaWQ6IHN0cmluZywgY2hhbmdlZDogUmVjb3JkPHN0cmluZywgYW55Pik6IHZvaWQge1xuICAgIGNvbnN0IGNoYW5nZWRSZXN1bHQ6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fTtcbiAgICBjb25zdCBkb2NWaWV3ID0gdGhpcy5kb2N1bWVudHMuZ2V0KGlkKTtcblxuICAgIGlmICghZG9jVmlldykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3QgZmluZCBlbGVtZW50IHdpdGggaWQgJHtpZH0gdG8gY2hhbmdlYCk7XG4gICAgfVxuXG4gICAgT2JqZWN0LmVudHJpZXMoY2hhbmdlZCkuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBkb2NWaWV3LmNsZWFyRmllbGQoc3Vic2NyaXB0aW9uSGFuZGxlLCBrZXksIGNoYW5nZWRSZXN1bHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZG9jVmlldy5jaGFuZ2VGaWVsZChzdWJzY3JpcHRpb25IYW5kbGUsIGtleSwgdmFsdWUsIGNoYW5nZWRSZXN1bHQpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5jYWxsYmFja3MuY2hhbmdlZCh0aGlzLmNvbGxlY3Rpb25OYW1lLCBpZCwgY2hhbmdlZFJlc3VsdCk7XG4gIH1cblxuICBwdWJsaWMgcmVtb3ZlZChzdWJzY3JpcHRpb25IYW5kbGU6IHN0cmluZywgaWQ6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGRvY1ZpZXcgPSB0aGlzLmRvY3VtZW50cy5nZXQoaWQpO1xuXG4gICAgaWYgKCFkb2NWaWV3KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFJlbW92ZWQgbm9uZXhpc3RlbnQgZG9jdW1lbnQgJHtpZH1gKTtcbiAgICB9XG5cbiAgICBkb2NWaWV3LmV4aXN0c0luLmRlbGV0ZShzdWJzY3JpcHRpb25IYW5kbGUpO1xuXG4gICAgaWYgKGRvY1ZpZXcuZXhpc3RzSW4uc2l6ZSA9PT0gMCkge1xuICAgICAgLy8gaXQgaXMgZ29uZSBmcm9tIGV2ZXJ5b25lXG4gICAgICB0aGlzLmNhbGxiYWNrcy5yZW1vdmVkKHRoaXMuY29sbGVjdGlvbk5hbWUsIGlkKTtcbiAgICAgIHRoaXMuZG9jdW1lbnRzLmRlbGV0ZShpZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGNoYW5nZWQ6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fTtcbiAgICAgIC8vIHJlbW92ZSB0aGlzIHN1YnNjcmlwdGlvbiBmcm9tIGV2ZXJ5IHByZWNlZGVuY2UgbGlzdFxuICAgICAgLy8gYW5kIHJlY29yZCB0aGUgY2hhbmdlc1xuICAgICAgZG9jVmlldy5kYXRhQnlLZXkuZm9yRWFjaCgocHJlY2VkZW5jZUxpc3QsIGtleSkgPT4ge1xuICAgICAgICBkb2NWaWV3LmNsZWFyRmllbGQoc3Vic2NyaXB0aW9uSGFuZGxlLCBrZXksIGNoYW5nZWQpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLmNhbGxiYWNrcy5jaGFuZ2VkKHRoaXMuY29sbGVjdGlvbk5hbWUsIGlkLCBjaGFuZ2VkKTtcbiAgICB9XG4gIH1cbn0iLCJpbnRlcmZhY2UgUHJlY2VkZW5jZUl0ZW0ge1xuICBzdWJzY3JpcHRpb25IYW5kbGU6IHN0cmluZztcbiAgdmFsdWU6IGFueTtcbn1cblxuaW50ZXJmYWNlIENoYW5nZUNvbGxlY3RvciB7XG4gIFtrZXk6IHN0cmluZ106IGFueTtcbn1cblxuZXhwb3J0IGNsYXNzIFNlc3Npb25Eb2N1bWVudFZpZXcge1xuICBwcml2YXRlIGV4aXN0c0luOiBTZXQ8c3RyaW5nPjtcbiAgcHJpdmF0ZSBkYXRhQnlLZXk6IE1hcDxzdHJpbmcsIFByZWNlZGVuY2VJdGVtW10+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZXhpc3RzSW4gPSBuZXcgU2V0KCk7IC8vIHNldCBvZiBzdWJzY3JpcHRpb25IYW5kbGVcbiAgICAvLyBNZW1vcnkgR3Jvd3RoXG4gICAgdGhpcy5kYXRhQnlLZXkgPSBuZXcgTWFwKCk7IC8vIGtleS0+IFsge3N1YnNjcmlwdGlvbkhhbmRsZSwgdmFsdWV9IGJ5IHByZWNlZGVuY2VdXG4gIH1cblxuICBnZXRGaWVsZHMoKTogUmVjb3JkPHN0cmluZywgYW55PiB7XG4gICAgY29uc3QgcmV0OiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge307XG4gICAgdGhpcy5kYXRhQnlLZXkuZm9yRWFjaCgocHJlY2VkZW5jZUxpc3QsIGtleSkgPT4ge1xuICAgICAgcmV0W2tleV0gPSBwcmVjZWRlbmNlTGlzdFswXS52YWx1ZTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgY2xlYXJGaWVsZChcbiAgICBzdWJzY3JpcHRpb25IYW5kbGU6IHN0cmluZyxcbiAgICBrZXk6IHN0cmluZyxcbiAgICBjaGFuZ2VDb2xsZWN0b3I6IENoYW5nZUNvbGxlY3RvclxuICApOiB2b2lkIHtcbiAgICAvLyBQdWJsaXNoIEFQSSBpZ25vcmVzIF9pZCBpZiBwcmVzZW50IGluIGZpZWxkc1xuICAgIGlmIChrZXkgPT09IFwiX2lkXCIpIHJldHVybjtcblxuICAgIGNvbnN0IHByZWNlZGVuY2VMaXN0ID0gdGhpcy5kYXRhQnlLZXkuZ2V0KGtleSk7XG4gICAgLy8gSXQncyBva2F5IHRvIGNsZWFyIGZpZWxkcyB0aGF0IGRpZG4ndCBleGlzdC4gTm8gbmVlZCB0byB0aHJvd1xuICAgIC8vIGFuIGVycm9yLlxuICAgIGlmICghcHJlY2VkZW5jZUxpc3QpIHJldHVybjtcblxuICAgIGxldCByZW1vdmVkVmFsdWU6IGFueSA9IHVuZGVmaW5lZDtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJlY2VkZW5jZUxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHByZWNlZGVuY2UgPSBwcmVjZWRlbmNlTGlzdFtpXTtcbiAgICAgIGlmIChwcmVjZWRlbmNlLnN1YnNjcmlwdGlvbkhhbmRsZSA9PT0gc3Vic2NyaXB0aW9uSGFuZGxlKSB7XG4gICAgICAgIC8vIFRoZSB2aWV3J3MgdmFsdWUgY2FuIG9ubHkgY2hhbmdlIGlmIHRoaXMgc3Vic2NyaXB0aW9uIGlzIHRoZSBvbmUgdGhhdFxuICAgICAgICAvLyB1c2VkIHRvIGhhdmUgcHJlY2VkZW5jZS5cbiAgICAgICAgaWYgKGkgPT09IDApIHJlbW92ZWRWYWx1ZSA9IHByZWNlZGVuY2UudmFsdWU7XG4gICAgICAgIHByZWNlZGVuY2VMaXN0LnNwbGljZShpLCAxKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHByZWNlZGVuY2VMaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5kYXRhQnlLZXkuZGVsZXRlKGtleSk7XG4gICAgICBjaGFuZ2VDb2xsZWN0b3Jba2V5XSA9IHVuZGVmaW5lZDtcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgcmVtb3ZlZFZhbHVlICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICFFSlNPTi5lcXVhbHMocmVtb3ZlZFZhbHVlLCBwcmVjZWRlbmNlTGlzdFswXS52YWx1ZSlcbiAgICApIHtcbiAgICAgIGNoYW5nZUNvbGxlY3RvcltrZXldID0gcHJlY2VkZW5jZUxpc3RbMF0udmFsdWU7XG4gICAgfVxuICB9XG5cbiAgY2hhbmdlRmllbGQoXG4gICAgc3Vic2NyaXB0aW9uSGFuZGxlOiBzdHJpbmcsXG4gICAga2V5OiBzdHJpbmcsXG4gICAgdmFsdWU6IGFueSxcbiAgICBjaGFuZ2VDb2xsZWN0b3I6IENoYW5nZUNvbGxlY3RvcixcbiAgICBpc0FkZDogYm9vbGVhbiA9IGZhbHNlXG4gICk6IHZvaWQge1xuICAgIC8vIFB1Ymxpc2ggQVBJIGlnbm9yZXMgX2lkIGlmIHByZXNlbnQgaW4gZmllbGRzXG4gICAgaWYgKGtleSA9PT0gXCJfaWRcIikgcmV0dXJuO1xuXG4gICAgLy8gRG9uJ3Qgc2hhcmUgc3RhdGUgd2l0aCB0aGUgZGF0YSBwYXNzZWQgaW4gYnkgdGhlIHVzZXIuXG4gICAgdmFsdWUgPSBFSlNPTi5jbG9uZSh2YWx1ZSk7XG5cbiAgICBpZiAoIXRoaXMuZGF0YUJ5S2V5LmhhcyhrZXkpKSB7XG4gICAgICB0aGlzLmRhdGFCeUtleS5zZXQoa2V5LCBbXG4gICAgICAgIHsgc3Vic2NyaXB0aW9uSGFuZGxlOiBzdWJzY3JpcHRpb25IYW5kbGUsIHZhbHVlOiB2YWx1ZSB9LFxuICAgICAgXSk7XG4gICAgICBjaGFuZ2VDb2xsZWN0b3Jba2V5XSA9IHZhbHVlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHByZWNlZGVuY2VMaXN0ID0gdGhpcy5kYXRhQnlLZXkuZ2V0KGtleSkhO1xuICAgIGxldCBlbHQ6IFByZWNlZGVuY2VJdGVtIHwgdW5kZWZpbmVkO1xuXG4gICAgaWYgKCFpc0FkZCkge1xuICAgICAgZWx0ID0gcHJlY2VkZW5jZUxpc3QuZmluZChcbiAgICAgICAgKHByZWNlZGVuY2UpID0+IHByZWNlZGVuY2Uuc3Vic2NyaXB0aW9uSGFuZGxlID09PSBzdWJzY3JpcHRpb25IYW5kbGVcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKGVsdCkge1xuICAgICAgaWYgKGVsdCA9PT0gcHJlY2VkZW5jZUxpc3RbMF0gJiYgIUVKU09OLmVxdWFscyh2YWx1ZSwgZWx0LnZhbHVlKSkge1xuICAgICAgICAvLyB0aGlzIHN1YnNjcmlwdGlvbiBpcyBjaGFuZ2luZyB0aGUgdmFsdWUgb2YgdGhpcyBmaWVsZC5cbiAgICAgICAgY2hhbmdlQ29sbGVjdG9yW2tleV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICAgIGVsdC52YWx1ZSA9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyB0aGlzIHN1YnNjcmlwdGlvbiBpcyBuZXdseSBjYXJpbmcgYWJvdXQgdGhpcyBmaWVsZFxuICAgICAgcHJlY2VkZW5jZUxpc3QucHVzaCh7IHN1YnNjcmlwdGlvbkhhbmRsZTogc3Vic2NyaXB0aW9uSGFuZGxlLCB2YWx1ZTogdmFsdWUgfSk7XG4gICAgfVxuICB9XG59Il19
