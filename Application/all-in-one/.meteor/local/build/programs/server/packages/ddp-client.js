Package["core-runtime"].queue("ddp-client",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var check = Package.check.check;
var Match = Package.check.Match;
var Random = Package.random.Random;
var EJSON = Package.ejson.EJSON;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var Retry = Package.retry.Retry;
var IdMap = Package['id-map'].IdMap;
var ECMAScript = Package.ecmascript.ECMAScript;
var Hook = Package['callback-hook'].Hook;
var DDPCommon = Package['ddp-common'].DDPCommon;
var DiffSequence = Package['diff-sequence'].DiffSequence;
var MongoID = Package['mongo-id'].MongoID;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var options, callback, args, DDP;

var require = meteorInstall({"node_modules":{"meteor":{"ddp-client":{"server":{"server.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/ddp-client/server/server.js                                                                           //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.link("../common/namespace.js", {
      DDP: "DDP"
    }, 0);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"common":{"connection_stream_handlers.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/ddp-client/common/connection_stream_handlers.js                                                       //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      ConnectionStreamHandlers: () => ConnectionStreamHandlers
    });
    let DDPCommon;
    module.link("meteor/ddp-common", {
      DDPCommon(v) {
        DDPCommon = v;
      }
    }, 0);
    let Meteor;
    module.link("meteor/meteor", {
      Meteor(v) {
        Meteor = v;
      }
    }, 1);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    class ConnectionStreamHandlers {
      constructor(connection) {
        this._connection = connection;
      }

      /**
       * Handles incoming raw messages from the DDP stream
       * @param {String} raw_msg The raw message received from the stream
       */
      async onMessage(raw_msg) {
        let msg;
        try {
          msg = DDPCommon.parseDDP(raw_msg);
        } catch (e) {
          Meteor._debug('Exception while parsing DDP', e);
          return;
        }

        // Any message counts as receiving a pong, as it demonstrates that
        // the server is still alive.
        if (this._connection._heartbeat) {
          this._connection._heartbeat.messageReceived();
        }
        if (msg === null || !msg.msg) {
          if (!msg || !msg.testMessageOnConnect) {
            if (Object.keys(msg).length === 1 && msg.server_id) return;
            Meteor._debug('discarding invalid livedata message', msg);
          }
          return;
        }

        // Important: This was missing from previous version
        // We need to set the current version before routing the message
        if (msg.msg === 'connected') {
          this._connection._version = this._connection._versionSuggestion;
        }
        await this._routeMessage(msg);
      }

      /**
       * Routes messages to their appropriate handlers based on message type
       * @private
       * @param {Object} msg The parsed DDP message
       */
      async _routeMessage(msg) {
        switch (msg.msg) {
          case 'connected':
            await this._connection._livedata_connected(msg);
            this._connection.options.onConnected();
            break;
          case 'failed':
            await this._handleFailedMessage(msg);
            break;
          case 'ping':
            if (this._connection.options.respondToPings) {
              this._connection._send({
                msg: 'pong',
                id: msg.id
              });
            }
            break;
          case 'pong':
            // noop, as we assume everything's a pong
            break;
          case 'added':
          case 'changed':
          case 'removed':
          case 'ready':
          case 'updated':
            await this._connection._livedata_data(msg);
            break;
          case 'nosub':
            await this._connection._livedata_nosub(msg);
            break;
          case 'result':
            await this._connection._livedata_result(msg);
            break;
          case 'error':
            this._connection._livedata_error(msg);
            break;
          default:
            Meteor._debug('discarding unknown livedata message type', msg);
        }
      }

      /**
       * Handles failed connection messages
       * @private
       * @param {Object} msg The failed message object
       */
      _handleFailedMessage(msg) {
        if (this._connection._supportedDDPVersions.indexOf(msg.version) >= 0) {
          this._connection._versionSuggestion = msg.version;
          this._connection._stream.reconnect({
            _force: true
          });
        } else {
          const description = 'DDP version negotiation failed; server requested version ' + msg.version;
          this._connection._stream.disconnect({
            _permanent: true,
            _error: description
          });
          this._connection.options.onDDPVersionNegotiationFailure(description);
        }
      }

      /**
       * Handles connection reset events
       */
      onReset() {
        // Reset is called even on the first connection, so this is
        // the only place we send this message.
        const msg = this._buildConnectMessage();
        this._connection._send(msg);

        // Mark non-retry calls as failed and handle outstanding methods
        this._handleOutstandingMethodsOnReset();

        // Now, to minimize setup latency, go ahead and blast out all of
        // our pending methods ands subscriptions before we've even taken
        // the necessary RTT to know if we successfully reconnected.
        this._connection._callOnReconnectAndSendAppropriateOutstandingMethods();
        this._resendSubscriptions();
      }

      /**
       * Builds the initial connect message
       * @private
       * @returns {Object} The connect message object
       */
      _buildConnectMessage() {
        const msg = {
          msg: 'connect'
        };
        if (this._connection._lastSessionId) {
          msg.session = this._connection._lastSessionId;
        }
        msg.version = this._connection._versionSuggestion || this._connection._supportedDDPVersions[0];
        this._connection._versionSuggestion = msg.version;
        msg.support = this._connection._supportedDDPVersions;
        return msg;
      }

      /**
       * Handles outstanding methods during a reset
       * @private
       */
      _handleOutstandingMethodsOnReset() {
        const blocks = this._connection._outstandingMethodBlocks;
        if (blocks.length === 0) return;
        const currentMethodBlock = blocks[0].methods;
        blocks[0].methods = currentMethodBlock.filter(methodInvoker => {
          // Methods with 'noRetry' option set are not allowed to re-send after
          // recovering dropped connection.
          if (methodInvoker.sentMessage && methodInvoker.noRetry) {
            methodInvoker.receiveResult(new Meteor.Error('invocation-failed', 'Method invocation might have failed due to dropped connection. ' + 'Failing because `noRetry` option was passed to Meteor.apply.'));
          }

          // Only keep a method if it wasn't sent or it's allowed to retry.
          return !(methodInvoker.sentMessage && methodInvoker.noRetry);
        });

        // Clear empty blocks
        if (blocks.length > 0 && blocks[0].methods.length === 0) {
          blocks.shift();
        }

        // Reset all method invokers as unsent
        Object.values(this._connection._methodInvokers).forEach(invoker => {
          invoker.sentMessage = false;
        });
      }

      /**
       * Resends all active subscriptions
       * @private
       */
      _resendSubscriptions() {
        Object.entries(this._connection._subscriptions).forEach(_ref => {
          let [id, sub] = _ref;
          this._connection._sendQueued({
            msg: 'sub',
            id: id,
            name: sub.name,
            params: sub.params
          });
        });
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
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"document_processors.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/ddp-client/common/document_processors.js                                                              //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      DocumentProcessors: () => DocumentProcessors
    });
    let MongoID;
    module.link("meteor/mongo-id", {
      MongoID(v) {
        MongoID = v;
      }
    }, 0);
    let DiffSequence;
    module.link("meteor/diff-sequence", {
      DiffSequence(v) {
        DiffSequence = v;
      }
    }, 1);
    let hasOwn;
    module.link("meteor/ddp-common/utils", {
      hasOwn(v) {
        hasOwn = v;
      }
    }, 2);
    let isEmpty;
    module.link("meteor/ddp-common/utils", {
      isEmpty(v) {
        isEmpty = v;
      }
    }, 3);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    class DocumentProcessors {
      constructor(connection) {
        this._connection = connection;
      }

      /**
       * @summary Process an 'added' message from the server
       * @param {Object} msg The added message
       * @param {Object} updates The updates accumulator
       */
      async _process_added(msg, updates) {
        const self = this._connection;
        const id = MongoID.idParse(msg.id);
        const serverDoc = self._getServerDoc(msg.collection, id);
        if (serverDoc) {
          // Some outstanding stub wrote here.
          const isExisting = serverDoc.document !== undefined;
          serverDoc.document = msg.fields || Object.create(null);
          serverDoc.document._id = id;
          if (self._resetStores) {
            // During reconnect the server is sending adds for existing ids.
            // Always push an update so that document stays in the store after
            // reset. Use current version of the document for this update, so
            // that stub-written values are preserved.
            const currentDoc = await self._stores[msg.collection].getDoc(msg.id);
            if (currentDoc !== undefined) msg.fields = currentDoc;
            self._pushUpdate(updates, msg.collection, msg);
          } else if (isExisting) {
            throw new Error('Server sent add for existing id: ' + msg.id);
          }
        } else {
          self._pushUpdate(updates, msg.collection, msg);
        }
      }

      /**
       * @summary Process a 'changed' message from the server
       * @param {Object} msg The changed message
       * @param {Object} updates The updates accumulator
       */
      _process_changed(msg, updates) {
        const self = this._connection;
        const serverDoc = self._getServerDoc(msg.collection, MongoID.idParse(msg.id));
        if (serverDoc) {
          if (serverDoc.document === undefined) {
            throw new Error('Server sent changed for nonexisting id: ' + msg.id);
          }
          DiffSequence.applyChanges(serverDoc.document, msg.fields);
        } else {
          self._pushUpdate(updates, msg.collection, msg);
        }
      }

      /**
       * @summary Process a 'removed' message from the server
       * @param {Object} msg The removed message
       * @param {Object} updates The updates accumulator
       */
      _process_removed(msg, updates) {
        const self = this._connection;
        const serverDoc = self._getServerDoc(msg.collection, MongoID.idParse(msg.id));
        if (serverDoc) {
          // Some outstanding stub wrote here.
          if (serverDoc.document === undefined) {
            throw new Error('Server sent removed for nonexisting id:' + msg.id);
          }
          serverDoc.document = undefined;
        } else {
          self._pushUpdate(updates, msg.collection, {
            msg: 'removed',
            collection: msg.collection,
            id: msg.id
          });
        }
      }

      /**
       * @summary Process a 'ready' message from the server
       * @param {Object} msg The ready message
       * @param {Object} updates The updates accumulator
       */
      _process_ready(msg, updates) {
        const self = this._connection;

        // Process "sub ready" messages. "sub ready" messages don't take effect
        // until all current server documents have been flushed to the local
        // database. We can use a write fence to implement this.
        msg.subs.forEach(subId => {
          self._runWhenAllServerDocsAreFlushed(() => {
            const subRecord = self._subscriptions[subId];
            // Did we already unsubscribe?
            if (!subRecord) return;
            // Did we already receive a ready message? (Oops!)
            if (subRecord.ready) return;
            subRecord.ready = true;
            subRecord.readyCallback && subRecord.readyCallback();
            subRecord.readyDeps.changed();
          });
        });
      }

      /**
       * @summary Process an 'updated' message from the server
       * @param {Object} msg The updated message
       * @param {Object} updates The updates accumulator
       */
      _process_updated(msg, updates) {
        const self = this._connection;
        // Process "method done" messages.
        msg.methods.forEach(methodId => {
          const docs = self._documentsWrittenByStub[methodId] || {};
          Object.values(docs).forEach(written => {
            const serverDoc = self._getServerDoc(written.collection, written.id);
            if (!serverDoc) {
              throw new Error('Lost serverDoc for ' + JSON.stringify(written));
            }
            if (!serverDoc.writtenByStubs[methodId]) {
              throw new Error('Doc ' + JSON.stringify(written) + ' not written by method ' + methodId);
            }
            delete serverDoc.writtenByStubs[methodId];
            if (isEmpty(serverDoc.writtenByStubs)) {
              // All methods whose stubs wrote this method have completed! We can
              // now copy the saved document to the database (reverting the stub's
              // change if the server did not write to this object, or applying the
              // server's writes if it did).

              // This is a fake ddp 'replace' message.  It's just for talking
              // between livedata connections and minimongo.  (We have to stringify
              // the ID because it's supposed to look like a wire message.)
              self._pushUpdate(updates, written.collection, {
                msg: 'replace',
                id: MongoID.idStringify(written.id),
                replace: serverDoc.document
              });
              // Call all flush callbacks.
              serverDoc.flushCallbacks.forEach(c => {
                c();
              });

              // Delete this completed serverDocument. Don't bother to GC empty
              // IdMaps inside self._serverDocuments, since there probably aren't
              // many collections and they'll be written repeatedly.
              self._serverDocuments[written.collection].remove(written.id);
            }
          });
          delete self._documentsWrittenByStub[methodId];

          // We want to call the data-written callback, but we can't do so until all
          // currently buffered messages are flushed.
          const callbackInvoker = self._methodInvokers[methodId];
          if (!callbackInvoker) {
            throw new Error('No callback invoker for method ' + methodId);
          }
          self._runWhenAllServerDocsAreFlushed(function () {
            return callbackInvoker.dataVisible(...arguments);
          });
        });
      }

      /**
       * @summary Push an update to the buffer
       * @private
       * @param {Object} updates The updates accumulator
       * @param {String} collection The collection name
       * @param {Object} msg The update message
       */
      _pushUpdate(updates, collection, msg) {
        if (!hasOwn.call(updates, collection)) {
          updates[collection] = [];
        }
        updates[collection].push(msg);
      }

      /**
       * @summary Get a server document by collection and id
       * @private
       * @param {String} collection The collection name
       * @param {String} id The document id
       * @returns {Object|null} The server document or null
       */
      _getServerDoc(collection, id) {
        const self = this._connection;
        if (!hasOwn.call(self._serverDocuments, collection)) {
          return null;
        }
        const serverDocsForCollection = self._serverDocuments[collection];
        return serverDocsForCollection.get(id) || null;
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
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"livedata_connection.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/ddp-client/common/livedata_connection.js                                                              //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    let _objectWithoutProperties;
    module.link("@babel/runtime/helpers/objectWithoutProperties", {
      default(v) {
        _objectWithoutProperties = v;
      }
    }, 0);
    let _objectSpread;
    module.link("@babel/runtime/helpers/objectSpread2", {
      default(v) {
        _objectSpread = v;
      }
    }, 1);
    const _excluded = ["stubInvocation", "invocation"],
      _excluded2 = ["stubInvocation", "invocation"];
    module.export({
      Connection: () => Connection
    });
    let Meteor;
    module.link("meteor/meteor", {
      Meteor(v) {
        Meteor = v;
      }
    }, 0);
    let DDPCommon;
    module.link("meteor/ddp-common", {
      DDPCommon(v) {
        DDPCommon = v;
      }
    }, 1);
    let Tracker;
    module.link("meteor/tracker", {
      Tracker(v) {
        Tracker = v;
      }
    }, 2);
    let EJSON;
    module.link("meteor/ejson", {
      EJSON(v) {
        EJSON = v;
      }
    }, 3);
    let Random;
    module.link("meteor/random", {
      Random(v) {
        Random = v;
      }
    }, 4);
    let MongoID;
    module.link("meteor/mongo-id", {
      MongoID(v) {
        MongoID = v;
      }
    }, 5);
    let DDP;
    module.link("./namespace.js", {
      DDP(v) {
        DDP = v;
      }
    }, 6);
    let MethodInvoker;
    module.link("./method_invoker", {
      MethodInvoker(v) {
        MethodInvoker = v;
      }
    }, 7);
    let hasOwn, slice, keys, isEmpty, last;
    module.link("meteor/ddp-common/utils", {
      hasOwn(v) {
        hasOwn = v;
      },
      slice(v) {
        slice = v;
      },
      keys(v) {
        keys = v;
      },
      isEmpty(v) {
        isEmpty = v;
      },
      last(v) {
        last = v;
      }
    }, 8);
    let ConnectionStreamHandlers;
    module.link("./connection_stream_handlers", {
      ConnectionStreamHandlers(v) {
        ConnectionStreamHandlers = v;
      }
    }, 9);
    let MongoIDMap;
    module.link("./mongo_id_map", {
      MongoIDMap(v) {
        MongoIDMap = v;
      }
    }, 10);
    let MessageProcessors;
    module.link("./message_processors", {
      MessageProcessors(v) {
        MessageProcessors = v;
      }
    }, 11);
    let DocumentProcessors;
    module.link("./document_processors", {
      DocumentProcessors(v) {
        DocumentProcessors = v;
      }
    }, 12);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    class Connection {
      constructor(url, options) {
        const self = this;
        this.options = options = _objectSpread({
          onConnected() {},
          onDDPVersionNegotiationFailure(description) {
            Meteor._debug(description);
          },
          heartbeatInterval: 17500,
          heartbeatTimeout: 15000,
          npmFayeOptions: Object.create(null),
          // These options are only for testing.
          reloadWithOutstanding: false,
          supportedDDPVersions: DDPCommon.SUPPORTED_DDP_VERSIONS,
          retry: true,
          respondToPings: true,
          // When updates are coming within this ms interval, batch them together.
          bufferedWritesInterval: 5,
          // Flush buffers immediately if writes are happening continuously for more than this many ms.
          bufferedWritesMaxAge: 500
        }, options);

        // If set, called when we reconnect, queuing method calls _before_ the
        // existing outstanding ones.
        // NOTE: This feature has been preserved for backwards compatibility. The
        // preferred method of setting a callback on reconnect is to use
        // DDP.onReconnect.
        self.onReconnect = null;

        // as a test hook, allow passing a stream instead of a url.
        if (typeof url === 'object') {
          self._stream = url;
        } else {
          let ClientStream;
          module.link("meteor/socket-stream-client", {
            ClientStream(v) {
              ClientStream = v;
            }
          }, 13);
          self._stream = new ClientStream(url, {
            retry: options.retry,
            ConnectionError: DDP.ConnectionError,
            headers: options.headers,
            _sockjsOptions: options._sockjsOptions,
            // Used to keep some tests quiet, or for other cases in which
            // the right thing to do with connection errors is to silently
            // fail (e.g. sending package usage stats). At some point we
            // should have a real API for handling client-stream-level
            // errors.
            _dontPrintErrors: options._dontPrintErrors,
            connectTimeoutMs: options.connectTimeoutMs,
            npmFayeOptions: options.npmFayeOptions
          });
        }
        self._lastSessionId = null;
        self._versionSuggestion = null; // The last proposed DDP version.
        self._version = null; // The DDP version agreed on by client and server.
        self._stores = Object.create(null); // name -> object with methods
        self._methodHandlers = Object.create(null); // name -> func
        self._nextMethodId = 1;
        self._supportedDDPVersions = options.supportedDDPVersions;
        self._heartbeatInterval = options.heartbeatInterval;
        self._heartbeatTimeout = options.heartbeatTimeout;

        // Tracks methods which the user has tried to call but which have not yet
        // called their user callback (ie, they are waiting on their result or for all
        // of their writes to be written to the local cache). Map from method ID to
        // MethodInvoker object.
        self._methodInvokers = Object.create(null);

        // Tracks methods which the user has called but whose result messages have not
        // arrived yet.
        //
        // _outstandingMethodBlocks is an array of blocks of methods. Each block
        // represents a set of methods that can run at the same time. The first block
        // represents the methods which are currently in flight; subsequent blocks
        // must wait for previous blocks to be fully finished before they can be sent
        // to the server.
        //
        // Each block is an object with the following fields:
        // - methods: a list of MethodInvoker objects
        // - wait: a boolean; if true, this block had a single method invoked with
        //         the "wait" option
        //
        // There will never be adjacent blocks with wait=false, because the only thing
        // that makes methods need to be serialized is a wait method.
        //
        // Methods are removed from the first block when their "result" is
        // received. The entire first block is only removed when all of the in-flight
        // methods have received their results (so the "methods" list is empty) *AND*
        // all of the data written by those methods are visible in the local cache. So
        // it is possible for the first block's methods list to be empty, if we are
        // still waiting for some objects to quiesce.
        //
        // Example:
        //  _outstandingMethodBlocks = [
        //    {wait: false, methods: []},
        //    {wait: true, methods: [<MethodInvoker for 'login'>]},
        //    {wait: false, methods: [<MethodInvoker for 'foo'>,
        //                            <MethodInvoker for 'bar'>]}]
        // This means that there were some methods which were sent to the server and
        // which have returned their results, but some of the data written by
        // the methods may not be visible in the local cache. Once all that data is
        // visible, we will send a 'login' method. Once the login method has returned
        // and all the data is visible (including re-running subs if userId changes),
        // we will send the 'foo' and 'bar' methods in parallel.
        self._outstandingMethodBlocks = [];

        // method ID -> array of objects with keys 'collection' and 'id', listing
        // documents written by a given method's stub. keys are associated with
        // methods whose stub wrote at least one document, and whose data-done message
        // has not yet been received.
        self._documentsWrittenByStub = {};
        // collection -> IdMap of "server document" object. A "server document" has:
        // - "document": the version of the document according the
        //   server (ie, the snapshot before a stub wrote it, amended by any changes
        //   received from the server)
        //   It is undefined if we think the document does not exist
        // - "writtenByStubs": a set of method IDs whose stubs wrote to the document
        //   whose "data done" messages have not yet been processed
        self._serverDocuments = {};

        // Array of callbacks to be called after the next update of the local
        // cache. Used for:
        //  - Calling methodInvoker.dataVisible and sub ready callbacks after
        //    the relevant data is flushed.
        //  - Invoking the callbacks of "half-finished" methods after reconnect
        //    quiescence. Specifically, methods whose result was received over the old
        //    connection (so we don't re-send it) but whose data had not been made
        //    visible.
        self._afterUpdateCallbacks = [];

        // In two contexts, we buffer all incoming data messages and then process them
        // all at once in a single update:
        //   - During reconnect, we buffer all data messages until all subs that had
        //     been ready before reconnect are ready again, and all methods that are
        //     active have returned their "data done message"; then
        //   - During the execution of a "wait" method, we buffer all data messages
        //     until the wait method gets its "data done" message. (If the wait method
        //     occurs during reconnect, it doesn't get any special handling.)
        // all data messages are processed in one update.
        //
        // The following fields are used for this "quiescence" process.

        // This buffers the messages that aren't being processed yet.
        self._messagesBufferedUntilQuiescence = [];
        // Map from method ID -> true. Methods are removed from this when their
        // "data done" message is received, and we will not quiesce until it is
        // empty.
        self._methodsBlockingQuiescence = {};
        // map from sub ID -> true for subs that were ready (ie, called the sub
        // ready callback) before reconnect but haven't become ready again yet
        self._subsBeingRevived = {}; // map from sub._id -> true
        // if true, the next data update should reset all stores. (set during
        // reconnect.)
        self._resetStores = false;

        // name -> array of updates for (yet to be created) collections
        self._updatesForUnknownStores = {};
        // if we're blocking a migration, the retry func
        self._retryMigrate = null;
        // Collection name -> array of messages.
        self._bufferedWrites = {};
        // When current buffer of updates must be flushed at, in ms timestamp.
        self._bufferedWritesFlushAt = null;
        // Timeout handle for the next processing of all pending writes
        self._bufferedWritesFlushHandle = null;
        self._bufferedWritesInterval = options.bufferedWritesInterval;
        self._bufferedWritesMaxAge = options.bufferedWritesMaxAge;

        // metadata for subscriptions.  Map from sub ID to object with keys:
        //   - id
        //   - name
        //   - params
        //   - inactive (if true, will be cleaned up if not reused in re-run)
        //   - ready (has the 'ready' message been received?)
        //   - readyCallback (an optional callback to call when ready)
        //   - errorCallback (an optional callback to call if the sub terminates with
        //                    an error, XXX COMPAT WITH 1.0.3.1)
        //   - stopCallback (an optional callback to call when the sub terminates
        //     for any reason, with an error argument if an error triggered the stop)
        self._subscriptions = {};

        // Reactive userId.
        self._userId = null;
        self._userIdDeps = new Tracker.Dependency();

        // Block auto-reload while we're waiting for method responses.
        if (Meteor.isClient && Package.reload && !options.reloadWithOutstanding) {
          Package.reload.Reload._onMigrate(retry => {
            if (!self._readyToMigrate()) {
              self._retryMigrate = retry;
              return [false];
            } else {
              return [true];
            }
          });
        }
        this._streamHandlers = new ConnectionStreamHandlers(this);
        const onDisconnect = () => {
          if (this._heartbeat) {
            this._heartbeat.stop();
            this._heartbeat = null;
          }
        };
        if (Meteor.isServer) {
          this._stream.on('message', Meteor.bindEnvironment(msg => this._streamHandlers.onMessage(msg), 'handling DDP message'));
          this._stream.on('reset', Meteor.bindEnvironment(() => this._streamHandlers.onReset(), 'handling DDP reset'));
          this._stream.on('disconnect', Meteor.bindEnvironment(onDisconnect, 'handling DDP disconnect'));
        } else {
          this._stream.on('message', msg => this._streamHandlers.onMessage(msg));
          this._stream.on('reset', () => this._streamHandlers.onReset());
          this._stream.on('disconnect', onDisconnect);
        }
        this._messageProcessors = new MessageProcessors(this);

        // Expose message processor methods to maintain backward compatibility
        this._livedata_connected = msg => this._messageProcessors._livedata_connected(msg);
        this._livedata_data = msg => this._messageProcessors._livedata_data(msg);
        this._livedata_nosub = msg => this._messageProcessors._livedata_nosub(msg);
        this._livedata_result = msg => this._messageProcessors._livedata_result(msg);
        this._livedata_error = msg => this._messageProcessors._livedata_error(msg);
        this._documentProcessors = new DocumentProcessors(this);

        // Expose document processor methods to maintain backward compatibility
        this._process_added = (msg, updates) => this._documentProcessors._process_added(msg, updates);
        this._process_changed = (msg, updates) => this._documentProcessors._process_changed(msg, updates);
        this._process_removed = (msg, updates) => this._documentProcessors._process_removed(msg, updates);
        this._process_ready = (msg, updates) => this._documentProcessors._process_ready(msg, updates);
        this._process_updated = (msg, updates) => this._documentProcessors._process_updated(msg, updates);

        // Also expose utility methods used by other parts of the system
        this._pushUpdate = (updates, collection, msg) => this._documentProcessors._pushUpdate(updates, collection, msg);
        this._getServerDoc = (collection, id) => this._documentProcessors._getServerDoc(collection, id);
      }

      // 'name' is the name of the data on the wire that should go in the
      // store. 'wrappedStore' should be an object with methods beginUpdate, update,
      // endUpdate, saveOriginals, retrieveOriginals. see Collection for an example.
      createStoreMethods(name, wrappedStore) {
        const self = this;
        if (name in self._stores) return false;

        // Wrap the input object in an object which makes any store method not
        // implemented by 'store' into a no-op.
        const store = Object.create(null);
        const keysOfStore = ['update', 'beginUpdate', 'endUpdate', 'saveOriginals', 'retrieveOriginals', 'getDoc', '_getCollection'];
        keysOfStore.forEach(method => {
          store[method] = function () {
            if (wrappedStore[method]) {
              return wrappedStore[method](...arguments);
            }
          };
        });
        self._stores[name] = store;
        return store;
      }
      registerStoreClient(name, wrappedStore) {
        const self = this;
        const store = self.createStoreMethods(name, wrappedStore);
        const queued = self._updatesForUnknownStores[name];
        if (Array.isArray(queued)) {
          store.beginUpdate(queued.length, false);
          queued.forEach(msg => {
            store.update(msg);
          });
          store.endUpdate();
          delete self._updatesForUnknownStores[name];
        }
        return true;
      }
      async registerStoreServer(name, wrappedStore) {
        const self = this;
        const store = self.createStoreMethods(name, wrappedStore);
        const queued = self._updatesForUnknownStores[name];
        if (Array.isArray(queued)) {
          await store.beginUpdate(queued.length, false);
          for (const msg of queued) {
            await store.update(msg);
          }
          await store.endUpdate();
          delete self._updatesForUnknownStores[name];
        }
        return true;
      }

      /**
       * @memberOf Meteor
       * @importFromPackage meteor
       * @alias Meteor.subscribe
       * @summary Subscribe to a record set.  Returns a handle that provides
       * `stop()` and `ready()` methods.
       * @locus Client
       * @param {String} name Name of the subscription.  Matches the name of the
       * server's `publish()` call.
       * @param {EJSONable} [arg1,arg2...] Optional arguments passed to publisher
       * function on server.
       * @param {Function|Object} [callbacks] Optional. May include `onStop`
       * and `onReady` callbacks. If there is an error, it is passed as an
       * argument to `onStop`. If a function is passed instead of an object, it
       * is interpreted as an `onReady` callback.
       */
      subscribe(name /* .. [arguments] .. (callback|callbacks) */) {
        const self = this;
        const params = slice.call(arguments, 1);
        let callbacks = Object.create(null);
        if (params.length) {
          const lastParam = params[params.length - 1];
          if (typeof lastParam === 'function') {
            callbacks.onReady = params.pop();
          } else if (lastParam && [lastParam.onReady,
          // XXX COMPAT WITH 1.0.3.1 onError used to exist, but now we use
          // onStop with an error callback instead.
          lastParam.onError, lastParam.onStop].some(f => typeof f === "function")) {
            callbacks = params.pop();
          }
        }

        // Is there an existing sub with the same name and param, run in an
        // invalidated Computation? This will happen if we are rerunning an
        // existing computation.
        //
        // For example, consider a rerun of:
        //
        //     Tracker.autorun(function () {
        //       Meteor.subscribe("foo", Session.get("foo"));
        //       Meteor.subscribe("bar", Session.get("bar"));
        //     });
        //
        // If "foo" has changed but "bar" has not, we will match the "bar"
        // subcribe to an existing inactive subscription in order to not
        // unsub and resub the subscription unnecessarily.
        //
        // We only look for one such sub; if there are N apparently-identical subs
        // being invalidated, we will require N matching subscribe calls to keep
        // them all active.
        const existing = Object.values(self._subscriptions).find(sub => sub.inactive && sub.name === name && EJSON.equals(sub.params, params));
        let id;
        if (existing) {
          id = existing.id;
          existing.inactive = false; // reactivate

          if (callbacks.onReady) {
            // If the sub is not already ready, replace any ready callback with the
            // one provided now. (It's not really clear what users would expect for
            // an onReady callback inside an autorun; the semantics we provide is
            // that at the time the sub first becomes ready, we call the last
            // onReady callback provided, if any.)
            // If the sub is already ready, run the ready callback right away.
            // It seems that users would expect an onReady callback inside an
            // autorun to trigger once the sub first becomes ready and also
            // when re-subs happens.
            if (existing.ready) {
              callbacks.onReady();
            } else {
              existing.readyCallback = callbacks.onReady;
            }
          }

          // XXX COMPAT WITH 1.0.3.1 we used to have onError but now we call
          // onStop with an optional error argument
          if (callbacks.onError) {
            // Replace existing callback if any, so that errors aren't
            // double-reported.
            existing.errorCallback = callbacks.onError;
          }
          if (callbacks.onStop) {
            existing.stopCallback = callbacks.onStop;
          }
        } else {
          // New sub! Generate an id, save it locally, and send message.
          id = Random.id();
          self._subscriptions[id] = {
            id: id,
            name: name,
            params: EJSON.clone(params),
            inactive: false,
            ready: false,
            readyDeps: new Tracker.Dependency(),
            readyCallback: callbacks.onReady,
            // XXX COMPAT WITH 1.0.3.1 #errorCallback
            errorCallback: callbacks.onError,
            stopCallback: callbacks.onStop,
            connection: self,
            remove() {
              delete this.connection._subscriptions[this.id];
              this.ready && this.readyDeps.changed();
            },
            stop() {
              this.connection._sendQueued({
                msg: 'unsub',
                id: id
              });
              this.remove();
              if (callbacks.onStop) {
                callbacks.onStop();
              }
            }
          };
          self._send({
            msg: 'sub',
            id: id,
            name: name,
            params: params
          });
        }

        // return a handle to the application.
        const handle = {
          stop() {
            if (!hasOwn.call(self._subscriptions, id)) {
              return;
            }
            self._subscriptions[id].stop();
          },
          ready() {
            // return false if we've unsubscribed.
            if (!hasOwn.call(self._subscriptions, id)) {
              return false;
            }
            const record = self._subscriptions[id];
            record.readyDeps.depend();
            return record.ready;
          },
          subscriptionId: id
        };
        if (Tracker.active) {
          // We're in a reactive computation, so we'd like to unsubscribe when the
          // computation is invalidated... but not if the rerun just re-subscribes
          // to the same subscription!  When a rerun happens, we use onInvalidate
          // as a change to mark the subscription "inactive" so that it can
          // be reused from the rerun.  If it isn't reused, it's killed from
          // an afterFlush.
          Tracker.onInvalidate(c => {
            if (hasOwn.call(self._subscriptions, id)) {
              self._subscriptions[id].inactive = true;
            }
            Tracker.afterFlush(() => {
              if (hasOwn.call(self._subscriptions, id) && self._subscriptions[id].inactive) {
                handle.stop();
              }
            });
          });
        }
        return handle;
      }

      /**
       * @summary Tells if the method call came from a call or a callAsync.
       * @alias Meteor.isAsyncCall
       * @locus Anywhere
       * @memberOf Meteor
       * @importFromPackage meteor
       * @returns boolean
       */
      isAsyncCall() {
        return DDP._CurrentMethodInvocation._isCallAsyncMethodRunning();
      }
      methods(methods) {
        Object.entries(methods).forEach(_ref => {
          let [name, func] = _ref;
          if (typeof func !== 'function') {
            throw new Error("Method '" + name + "' must be a function");
          }
          if (this._methodHandlers[name]) {
            throw new Error("A method named '" + name + "' is already defined");
          }
          this._methodHandlers[name] = func;
        });
      }
      _getIsSimulation(_ref2) {
        let {
          isFromCallAsync,
          alreadyInSimulation
        } = _ref2;
        if (!isFromCallAsync) {
          return alreadyInSimulation;
        }
        return alreadyInSimulation && DDP._CurrentMethodInvocation._isCallAsyncMethodRunning();
      }

      /**
       * @memberOf Meteor
       * @importFromPackage meteor
       * @alias Meteor.call
       * @summary Invokes a method with a sync stub, passing any number of arguments.
       * @locus Anywhere
       * @param {String} name Name of method to invoke
       * @param {EJSONable} [arg1,arg2...] Optional method arguments
       * @param {Function} [asyncCallback] Optional callback, which is called asynchronously with the error or result after the method is complete. If not provided, the method runs synchronously if possible (see below).
       */
      call(name /* .. [arguments] .. callback */) {
        // if it's a function, the last argument is the result callback,
        // not a parameter to the remote method.
        const args = slice.call(arguments, 1);
        let callback;
        if (args.length && typeof args[args.length - 1] === 'function') {
          callback = args.pop();
        }
        return this.apply(name, args, callback);
      }
      /**
       * @memberOf Meteor
       * @importFromPackage meteor
       * @alias Meteor.callAsync
       * @summary Invokes a method with an async stub, passing any number of arguments.
       * @locus Anywhere
       * @param {String} name Name of method to invoke
       * @param {EJSONable} [arg1,arg2...] Optional method arguments
       * @returns {Promise}
       */
      callAsync(name /* .. [arguments] .. */) {
        const args = slice.call(arguments, 1);
        if (args.length && typeof args[args.length - 1] === 'function') {
          throw new Error("Meteor.callAsync() does not accept a callback. You should 'await' the result, or use .then().");
        }
        return this.applyAsync(name, args, {
          returnServerResultPromise: true
        });
      }

      /**
       * @memberOf Meteor
       * @importFromPackage meteor
       * @alias Meteor.apply
       * @summary Invoke a method passing an array of arguments.
       * @locus Anywhere
       * @param {String} name Name of method to invoke
       * @param {EJSONable[]} args Method arguments
       * @param {Object} [options]
       * @param {Boolean} options.wait (Client only) If true, don't send this method until all previous method calls have completed, and don't send any subsequent method calls until this one is completed.
       * @param {Function} options.onResultReceived (Client only) This callback is invoked with the error or result of the method (just like `asyncCallback`) as soon as the error or result is available. The local cache may not yet reflect the writes performed by the method.
       * @param {Boolean} options.noRetry (Client only) if true, don't send this method again on reload, simply call the callback an error with the error code 'invocation-failed'.
       * @param {Boolean} options.throwStubExceptions (Client only) If true, exceptions thrown by method stubs will be thrown instead of logged, and the method will not be invoked on the server.
       * @param {Boolean} options.returnStubValue (Client only) If true then in cases where we would have otherwise discarded the stub's return value and returned undefined, instead we go ahead and return it. Specifically, this is any time other than when (a) we are already inside a stub or (b) we are in Node and no callback was provided. Currently we require this flag to be explicitly passed to reduce the likelihood that stub return values will be confused with server return values; we may improve this in future.
       * @param {Function} [asyncCallback] Optional callback; same semantics as in [`Meteor.call`](#meteor_call).
       */
      apply(name, args, options, callback) {
        const _this$_stubCall = this._stubCall(name, EJSON.clone(args)),
          {
            stubInvocation,
            invocation
          } = _this$_stubCall,
          stubOptions = _objectWithoutProperties(_this$_stubCall, _excluded);
        if (stubOptions.hasStub) {
          if (!this._getIsSimulation({
            alreadyInSimulation: stubOptions.alreadyInSimulation,
            isFromCallAsync: stubOptions.isFromCallAsync
          })) {
            this._saveOriginals();
          }
          try {
            stubOptions.stubReturnValue = DDP._CurrentMethodInvocation.withValue(invocation, stubInvocation);
            if (Meteor._isPromise(stubOptions.stubReturnValue)) {
              Meteor._debug("Method ".concat(name, ": Calling a method that has an async method stub with call/apply can lead to unexpected behaviors. Use callAsync/applyAsync instead."));
            }
          } catch (e) {
            stubOptions.exception = e;
          }
        }
        return this._apply(name, stubOptions, args, options, callback);
      }

      /**
       * @memberOf Meteor
       * @importFromPackage meteor
       * @alias Meteor.applyAsync
       * @summary Invoke a method passing an array of arguments.
       * @locus Anywhere
       * @param {String} name Name of method to invoke
       * @param {EJSONable[]} args Method arguments
       * @param {Object} [options]
       * @param {Boolean} options.wait (Client only) If true, don't send this method until all previous method calls have completed, and don't send any subsequent method calls until this one is completed.
       * @param {Function} options.onResultReceived (Client only) This callback is invoked with the error or result of the method (just like `asyncCallback`) as soon as the error or result is available. The local cache may not yet reflect the writes performed by the method.
       * @param {Boolean} options.noRetry (Client only) if true, don't send this method again on reload, simply call the callback an error with the error code 'invocation-failed'.
       * @param {Boolean} options.throwStubExceptions (Client only) If true, exceptions thrown by method stubs will be thrown instead of logged, and the method will not be invoked on the server.
       * @param {Boolean} options.returnStubValue (Client only) If true then in cases where we would have otherwise discarded the stub's return value and returned undefined, instead we go ahead and return it. Specifically, this is any time other than when (a) we are already inside a stub or (b) we are in Node and no callback was provided. Currently we require this flag to be explicitly passed to reduce the likelihood that stub return values will be confused with server return values; we may improve this in future.
       * @param {Boolean} options.returnServerResultPromise (Client only) If true, the promise returned by applyAsync will resolve to the server's return value, rather than the stub's return value. This is useful when you want to ensure that the server's return value is used, even if the stub returns a promise. The same behavior as `callAsync`.
       */
      applyAsync(name, args, options) {
        let callback = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
        const stubPromise = this._applyAsyncStubInvocation(name, args, options);
        const promise = this._applyAsync({
          name,
          args,
          options,
          callback,
          stubPromise
        });
        if (Meteor.isClient) {
          // only return the stubReturnValue
          promise.stubPromise = stubPromise.then(o => {
            if (o.exception) {
              throw o.exception;
            }
            return o.stubReturnValue;
          });
          // this avoids attribute recursion
          promise.serverPromise = new Promise((resolve, reject) => promise.then(resolve).catch(reject));
        }
        return promise;
      }
      async _applyAsyncStubInvocation(name, args, options) {
        const _this$_stubCall2 = this._stubCall(name, EJSON.clone(args), options),
          {
            stubInvocation,
            invocation
          } = _this$_stubCall2,
          stubOptions = _objectWithoutProperties(_this$_stubCall2, _excluded2);
        if (stubOptions.hasStub) {
          if (!this._getIsSimulation({
            alreadyInSimulation: stubOptions.alreadyInSimulation,
            isFromCallAsync: stubOptions.isFromCallAsync
          })) {
            this._saveOriginals();
          }
          try {
            /*
             * The code below follows the same logic as the function withValues().
             *
             * But as the Meteor package is not compiled by ecmascript, it is unable to use newer syntax in the browser,
             * such as, the async/await.
             *
             * So, to keep supporting old browsers, like IE 11, we're creating the logic one level above.
             */
            const currentContext = DDP._CurrentMethodInvocation._setNewContextAndGetCurrent(invocation);
            try {
              stubOptions.stubReturnValue = await stubInvocation();
            } catch (e) {
              stubOptions.exception = e;
            } finally {
              DDP._CurrentMethodInvocation._set(currentContext);
            }
          } catch (e) {
            stubOptions.exception = e;
          }
        }
        return stubOptions;
      }
      async _applyAsync(_ref3) {
        let {
          name,
          args,
          options,
          callback,
          stubPromise
        } = _ref3;
        const stubOptions = await stubPromise;
        return this._apply(name, stubOptions, args, options, callback);
      }
      _apply(name, stubCallValue, args, options, callback) {
        const self = this;

        // We were passed 3 arguments. They may be either (name, args, options)
        // or (name, args, callback)
        if (!callback && typeof options === 'function') {
          callback = options;
          options = Object.create(null);
        }
        options = options || Object.create(null);
        if (callback) {
          // XXX would it be better form to do the binding in stream.on,
          // or caller, instead of here?
          // XXX improve error message (and how we report it)
          callback = Meteor.bindEnvironment(callback, "delivering result of invoking '" + name + "'");
        }
        const {
          hasStub,
          exception,
          stubReturnValue,
          alreadyInSimulation,
          randomSeed
        } = stubCallValue;

        // Keep our args safe from mutation (eg if we don't send the message for a
        // while because of a wait method).
        args = EJSON.clone(args);
        // If we're in a simulation, stop and return the result we have,
        // rather than going on to do an RPC. If there was no stub,
        // we'll end up returning undefined.
        if (this._getIsSimulation({
          alreadyInSimulation,
          isFromCallAsync: stubCallValue.isFromCallAsync
        })) {
          let result;
          if (callback) {
            callback(exception, stubReturnValue);
          } else {
            if (exception) throw exception;
            result = stubReturnValue;
          }
          return options._returnMethodInvoker ? {
            result
          } : result;
        }

        // We only create the methodId here because we don't actually need one if
        // we're already in a simulation
        const methodId = '' + self._nextMethodId++;
        if (hasStub) {
          self._retrieveAndStoreOriginals(methodId);
        }

        // Generate the DDP message for the method call. Note that on the client,
        // it is important that the stub have finished before we send the RPC, so
        // that we know we have a complete list of which local documents the stub
        // wrote.
        const message = {
          msg: 'method',
          id: methodId,
          method: name,
          params: args
        };

        // If an exception occurred in a stub, and we're ignoring it
        // because we're doing an RPC and want to use what the server
        // returns instead, log it so the developer knows
        // (unless they explicitly ask to see the error).
        //
        // Tests can set the '_expectedByTest' flag on an exception so it won't
        // go to log.
        if (exception) {
          if (options.throwStubExceptions) {
            throw exception;
          } else if (!exception._expectedByTest) {
            Meteor._debug("Exception while simulating the effect of invoking '" + name + "'", exception);
          }
        }

        // At this point we're definitely doing an RPC, and we're going to
        // return the value of the RPC to the caller.

        // If the caller didn't give a callback, decide what to do.
        let promise;
        if (!callback) {
          if (Meteor.isClient && !options.returnServerResultPromise && (!options.isFromCallAsync || options.returnStubValue)) {
            callback = err => {
              err && Meteor._debug("Error invoking Method '" + name + "'", err);
            };
          } else {
            promise = new Promise((resolve, reject) => {
              callback = function () {
                for (var _len = arguments.length, allArgs = new Array(_len), _key = 0; _key < _len; _key++) {
                  allArgs[_key] = arguments[_key];
                }
                let args = Array.from(allArgs);
                let err = args.shift();
                if (err) {
                  reject(err);
                  return;
                }
                resolve(...args);
              };
            });
          }
        }

        // Send the randomSeed only if we used it
        if (randomSeed.value !== null) {
          message.randomSeed = randomSeed.value;
        }
        const methodInvoker = new MethodInvoker({
          methodId,
          callback: callback,
          connection: self,
          onResultReceived: options.onResultReceived,
          wait: !!options.wait,
          message: message,
          noRetry: !!options.noRetry
        });
        let result;
        if (promise) {
          result = options.returnStubValue ? promise.then(() => stubReturnValue) : promise;
        } else {
          result = options.returnStubValue ? stubReturnValue : undefined;
        }
        if (options._returnMethodInvoker) {
          return {
            methodInvoker,
            result
          };
        }
        self._addOutstandingMethod(methodInvoker, options);
        return result;
      }
      _stubCall(name, args, options) {
        // Run the stub, if we have one. The stub is supposed to make some
        // temporary writes to the database to give the user a smooth experience
        // until the actual result of executing the method comes back from the
        // server (whereupon the temporary writes to the database will be reversed
        // during the beginUpdate/endUpdate process.)
        //
        // Normally, we ignore the return value of the stub (even if it is an
        // exception), in favor of the real return value from the server. The
        // exception is if the *caller* is a stub. In that case, we're not going
        // to do a RPC, so we use the return value of the stub as our return
        // value.
        const self = this;
        const enclosing = DDP._CurrentMethodInvocation.get();
        const stub = self._methodHandlers[name];
        const alreadyInSimulation = enclosing === null || enclosing === void 0 ? void 0 : enclosing.isSimulation;
        const isFromCallAsync = enclosing === null || enclosing === void 0 ? void 0 : enclosing._isFromCallAsync;
        const randomSeed = {
          value: null
        };
        const defaultReturn = {
          alreadyInSimulation,
          randomSeed,
          isFromCallAsync
        };
        if (!stub) {
          return _objectSpread(_objectSpread({}, defaultReturn), {}, {
            hasStub: false
          });
        }

        // Lazily generate a randomSeed, only if it is requested by the stub.
        // The random streams only have utility if they're used on both the client
        // and the server; if the client doesn't generate any 'random' values
        // then we don't expect the server to generate any either.
        // Less commonly, the server may perform different actions from the client,
        // and may in fact generate values where the client did not, but we don't
        // have any client-side values to match, so even here we may as well just
        // use a random seed on the server.  In that case, we don't pass the
        // randomSeed to save bandwidth, and we don't even generate it to save a
        // bit of CPU and to avoid consuming entropy.

        const randomSeedGenerator = () => {
          if (randomSeed.value === null) {
            randomSeed.value = DDPCommon.makeRpcSeed(enclosing, name);
          }
          return randomSeed.value;
        };
        const setUserId = userId => {
          self.setUserId(userId);
        };
        const invocation = new DDPCommon.MethodInvocation({
          name,
          isSimulation: true,
          userId: self.userId(),
          isFromCallAsync: options === null || options === void 0 ? void 0 : options.isFromCallAsync,
          setUserId: setUserId,
          randomSeed() {
            return randomSeedGenerator();
          }
        });

        // Note that unlike in the corresponding server code, we never audit
        // that stubs check() their arguments.
        const stubInvocation = () => {
          if (Meteor.isServer) {
            // Because saveOriginals and retrieveOriginals aren't reentrant,
            // don't allow stubs to yield.
            return Meteor._noYieldsAllowed(() => {
              // re-clone, so that the stub can't affect our caller's values
              return stub.apply(invocation, EJSON.clone(args));
            });
          } else {
            return stub.apply(invocation, EJSON.clone(args));
          }
        };
        return _objectSpread(_objectSpread({}, defaultReturn), {}, {
          hasStub: true,
          stubInvocation,
          invocation
        });
      }

      // Before calling a method stub, prepare all stores to track changes and allow
      // _retrieveAndStoreOriginals to get the original versions of changed
      // documents.
      _saveOriginals() {
        if (!this._waitingForQuiescence()) {
          this._flushBufferedWrites();
        }
        Object.values(this._stores).forEach(store => {
          store.saveOriginals();
        });
      }

      // Retrieves the original versions of all documents modified by the stub for
      // method 'methodId' from all stores and saves them to _serverDocuments (keyed
      // by document) and _documentsWrittenByStub (keyed by method ID).
      _retrieveAndStoreOriginals(methodId) {
        const self = this;
        if (self._documentsWrittenByStub[methodId]) throw new Error('Duplicate methodId in _retrieveAndStoreOriginals');
        const docsWritten = [];
        Object.entries(self._stores).forEach(_ref4 => {
          let [collection, store] = _ref4;
          const originals = store.retrieveOriginals();
          // not all stores define retrieveOriginals
          if (!originals) return;
          originals.forEach((doc, id) => {
            docsWritten.push({
              collection,
              id
            });
            if (!hasOwn.call(self._serverDocuments, collection)) {
              self._serverDocuments[collection] = new MongoIDMap();
            }
            const serverDoc = self._serverDocuments[collection].setDefault(id, Object.create(null));
            if (serverDoc.writtenByStubs) {
              // We're not the first stub to write this doc. Just add our method ID
              // to the record.
              serverDoc.writtenByStubs[methodId] = true;
            } else {
              // First stub! Save the original value and our method ID.
              serverDoc.document = doc;
              serverDoc.flushCallbacks = [];
              serverDoc.writtenByStubs = Object.create(null);
              serverDoc.writtenByStubs[methodId] = true;
            }
          });
        });
        if (!isEmpty(docsWritten)) {
          self._documentsWrittenByStub[methodId] = docsWritten;
        }
      }

      // This is very much a private function we use to make the tests
      // take up fewer server resources after they complete.
      _unsubscribeAll() {
        Object.values(this._subscriptions).forEach(sub => {
          // Avoid killing the autoupdate subscription so that developers
          // still get hot code pushes when writing tests.
          //
          // XXX it's a hack to encode knowledge about autoupdate here,
          // but it doesn't seem worth it yet to have a special API for
          // subscriptions to preserve after unit tests.
          if (sub.name !== 'meteor_autoupdate_clientVersions') {
            sub.stop();
          }
        });
      }

      // Sends the DDP stringification of the given message object
      _send(obj) {
        this._stream.send(DDPCommon.stringifyDDP(obj));
      }

      // Always queues the call before sending the message
      // Used, for example, on subscription.[id].stop() to make sure a "sub" message is always called before an "unsub" message
      // https://github.com/meteor/meteor/issues/13212
      //
      // This is part of the actual fix for the rest check:
      // https://github.com/meteor/meteor/pull/13236
      _sendQueued(obj) {
        this._send(obj, true);
      }

      // We detected via DDP-level heartbeats that we've lost the
      // connection.  Unlike `disconnect` or `close`, a lost connection
      // will be automatically retried.
      _lostConnection(error) {
        this._stream._lostConnection(error);
      }

      /**
       * @memberOf Meteor
       * @importFromPackage meteor
       * @alias Meteor.status
       * @summary Get the current connection status. A reactive data source.
       * @locus Client
       */
      status() {
        return this._stream.status(...arguments);
      }

      /**
       * @summary Force an immediate reconnection attempt if the client is not connected to the server.
       This method does nothing if the client is already connected.
       * @memberOf Meteor
       * @importFromPackage meteor
       * @alias Meteor.reconnect
       * @locus Client
       */
      reconnect() {
        return this._stream.reconnect(...arguments);
      }

      /**
       * @memberOf Meteor
       * @importFromPackage meteor
       * @alias Meteor.disconnect
       * @summary Disconnect the client from the server.
       * @locus Client
       */
      disconnect() {
        return this._stream.disconnect(...arguments);
      }
      close() {
        return this._stream.disconnect({
          _permanent: true
        });
      }

      ///
      /// Reactive user system
      ///
      userId() {
        if (this._userIdDeps) this._userIdDeps.depend();
        return this._userId;
      }
      setUserId(userId) {
        // Avoid invalidating dependents if setUserId is called with current value.
        if (this._userId === userId) return;
        this._userId = userId;
        if (this._userIdDeps) this._userIdDeps.changed();
      }

      // Returns true if we are in a state after reconnect of waiting for subs to be
      // revived or early methods to finish their data, or we are waiting for a
      // "wait" method to finish.
      _waitingForQuiescence() {
        return !isEmpty(this._subsBeingRevived) || !isEmpty(this._methodsBlockingQuiescence);
      }

      // Returns true if any method whose message has been sent to the server has
      // not yet invoked its user callback.
      _anyMethodsAreOutstanding() {
        const invokers = this._methodInvokers;
        return Object.values(invokers).some(invoker => !!invoker.sentMessage);
      }
      async _processOneDataMessage(msg, updates) {
        const messageType = msg.msg;

        // msg is one of ['added', 'changed', 'removed', 'ready', 'updated']
        if (messageType === 'added') {
          await this._process_added(msg, updates);
        } else if (messageType === 'changed') {
          this._process_changed(msg, updates);
        } else if (messageType === 'removed') {
          this._process_removed(msg, updates);
        } else if (messageType === 'ready') {
          this._process_ready(msg, updates);
        } else if (messageType === 'updated') {
          this._process_updated(msg, updates);
        } else if (messageType === 'nosub') {
          // ignore this
        } else {
          Meteor._debug('discarding unknown livedata data message type', msg);
        }
      }
      _prepareBuffersToFlush() {
        const self = this;
        if (self._bufferedWritesFlushHandle) {
          clearTimeout(self._bufferedWritesFlushHandle);
          self._bufferedWritesFlushHandle = null;
        }
        self._bufferedWritesFlushAt = null;
        // We need to clear the buffer before passing it to
        //  performWrites. As there's no guarantee that it
        //  will exit cleanly.
        const writes = self._bufferedWrites;
        self._bufferedWrites = Object.create(null);
        return writes;
      }

      /**
       * Server-side store updates handled asynchronously
       * @private
       */
      async _performWritesServer(updates) {
        const self = this;
        if (self._resetStores || !isEmpty(updates)) {
          // Start all store updates - keeping original loop structure
          for (const store of Object.values(self._stores)) {
            var _updates$store$_name;
            await store.beginUpdate(((_updates$store$_name = updates[store._name]) === null || _updates$store$_name === void 0 ? void 0 : _updates$store$_name.length) || 0, self._resetStores);
          }
          self._resetStores = false;

          // Process each store's updates sequentially as before
          for (const [storeName, messages] of Object.entries(updates)) {
            const store = self._stores[storeName];
            if (store) {
              // Batch each store's messages in modest chunks to prevent event loop blocking
              // while maintaining operation order
              const CHUNK_SIZE = 100;
              for (let i = 0; i < messages.length; i += CHUNK_SIZE) {
                const chunk = messages.slice(i, Math.min(i + CHUNK_SIZE, messages.length));
                for (const msg of chunk) {
                  await store.update(msg);
                }
                await new Promise(resolve => process.nextTick(resolve));
              }
            } else {
              // Queue updates for uninitialized stores
              self._updatesForUnknownStores[storeName] = self._updatesForUnknownStores[storeName] || [];
              self._updatesForUnknownStores[storeName].push(...messages);
            }
          }

          // Complete all updates
          for (const store of Object.values(self._stores)) {
            await store.endUpdate();
          }
        }
        self._runAfterUpdateCallbacks();
      }

      /**
       * Client-side store updates handled synchronously for optimistic UI
       * @private
       */
      _performWritesClient(updates) {
        const self = this;
        if (self._resetStores || !isEmpty(updates)) {
          // Synchronous store updates for client
          Object.values(self._stores).forEach(store => {
            var _updates$store$_name2;
            store.beginUpdate(((_updates$store$_name2 = updates[store._name]) === null || _updates$store$_name2 === void 0 ? void 0 : _updates$store$_name2.length) || 0, self._resetStores);
          });
          self._resetStores = false;
          Object.entries(updates).forEach(_ref5 => {
            let [storeName, messages] = _ref5;
            const store = self._stores[storeName];
            if (store) {
              messages.forEach(msg => store.update(msg));
            } else {
              self._updatesForUnknownStores[storeName] = self._updatesForUnknownStores[storeName] || [];
              self._updatesForUnknownStores[storeName].push(...messages);
            }
          });
          Object.values(self._stores).forEach(store => store.endUpdate());
        }
        self._runAfterUpdateCallbacks();
      }

      /**
       * Executes buffered writes either synchronously (client) or async (server)
       * @private
       */
      async _flushBufferedWrites() {
        const self = this;
        const writes = self._prepareBuffersToFlush();
        return Meteor.isClient ? self._performWritesClient(writes) : self._performWritesServer(writes);
      }

      // Call any callbacks deferred with _runWhenAllServerDocsAreFlushed whose
      // relevant docs have been flushed, as well as dataVisible callbacks at
      // reconnect-quiescence time.
      _runAfterUpdateCallbacks() {
        const self = this;
        const callbacks = self._afterUpdateCallbacks;
        self._afterUpdateCallbacks = [];
        callbacks.forEach(c => {
          c();
        });
      }

      // Ensures that "f" will be called after all documents currently in
      // _serverDocuments have been written to the local cache. f will not be called
      // if the connection is lost before then!
      _runWhenAllServerDocsAreFlushed(f) {
        const self = this;
        const runFAfterUpdates = () => {
          self._afterUpdateCallbacks.push(f);
        };
        let unflushedServerDocCount = 0;
        const onServerDocFlush = () => {
          --unflushedServerDocCount;
          if (unflushedServerDocCount === 0) {
            // This was the last doc to flush! Arrange to run f after the updates
            // have been applied.
            runFAfterUpdates();
          }
        };
        Object.values(self._serverDocuments).forEach(serverDocuments => {
          serverDocuments.forEach(serverDoc => {
            const writtenByStubForAMethodWithSentMessage = keys(serverDoc.writtenByStubs).some(methodId => {
              const invoker = self._methodInvokers[methodId];
              return invoker && invoker.sentMessage;
            });
            if (writtenByStubForAMethodWithSentMessage) {
              ++unflushedServerDocCount;
              serverDoc.flushCallbacks.push(onServerDocFlush);
            }
          });
        });
        if (unflushedServerDocCount === 0) {
          // There aren't any buffered docs --- we can call f as soon as the current
          // round of updates is applied!
          runFAfterUpdates();
        }
      }
      _addOutstandingMethod(methodInvoker, options) {
        if (options !== null && options !== void 0 && options.wait) {
          // It's a wait method! Wait methods go in their own block.
          this._outstandingMethodBlocks.push({
            wait: true,
            methods: [methodInvoker]
          });
        } else {
          // Not a wait method. Start a new block if the previous block was a wait
          // block, and add it to the last block of methods.
          if (isEmpty(this._outstandingMethodBlocks) || last(this._outstandingMethodBlocks).wait) {
            this._outstandingMethodBlocks.push({
              wait: false,
              methods: []
            });
          }
          last(this._outstandingMethodBlocks).methods.push(methodInvoker);
        }

        // If we added it to the first block, send it out now.
        if (this._outstandingMethodBlocks.length === 1) {
          methodInvoker.sendMessage();
        }
      }

      // Called by MethodInvoker after a method's callback is invoked.  If this was
      // the last outstanding method in the current block, runs the next block. If
      // there are no more methods, consider accepting a hot code push.
      _outstandingMethodFinished() {
        const self = this;
        if (self._anyMethodsAreOutstanding()) return;

        // No methods are outstanding. This should mean that the first block of
        // methods is empty. (Or it might not exist, if this was a method that
        // half-finished before disconnect/reconnect.)
        if (!isEmpty(self._outstandingMethodBlocks)) {
          const firstBlock = self._outstandingMethodBlocks.shift();
          if (!isEmpty(firstBlock.methods)) throw new Error('No methods outstanding but nonempty block: ' + JSON.stringify(firstBlock));

          // Send the outstanding methods now in the first block.
          if (!isEmpty(self._outstandingMethodBlocks)) self._sendOutstandingMethods();
        }

        // Maybe accept a hot code push.
        self._maybeMigrate();
      }

      // Sends messages for all the methods in the first block in
      // _outstandingMethodBlocks.
      _sendOutstandingMethods() {
        const self = this;
        if (isEmpty(self._outstandingMethodBlocks)) {
          return;
        }
        self._outstandingMethodBlocks[0].methods.forEach(m => {
          m.sendMessage();
        });
      }
      _sendOutstandingMethodBlocksMessages(oldOutstandingMethodBlocks) {
        const self = this;
        if (isEmpty(oldOutstandingMethodBlocks)) return;

        // We have at least one block worth of old outstanding methods to try
        // again. First: did onReconnect actually send anything? If not, we just
        // restore all outstanding methods and run the first block.
        if (isEmpty(self._outstandingMethodBlocks)) {
          self._outstandingMethodBlocks = oldOutstandingMethodBlocks;
          self._sendOutstandingMethods();
          return;
        }

        // OK, there are blocks on both sides. Special case: merge the last block of
        // the reconnect methods with the first block of the original methods, if
        // neither of them are "wait" blocks.
        if (!last(self._outstandingMethodBlocks).wait && !oldOutstandingMethodBlocks[0].wait) {
          oldOutstandingMethodBlocks[0].methods.forEach(m => {
            last(self._outstandingMethodBlocks).methods.push(m);

            // If this "last block" is also the first block, send the message.
            if (self._outstandingMethodBlocks.length === 1) {
              m.sendMessage();
            }
          });
          oldOutstandingMethodBlocks.shift();
        }

        // Now add the rest of the original blocks on.
        self._outstandingMethodBlocks.push(...oldOutstandingMethodBlocks);
      }
      _callOnReconnectAndSendAppropriateOutstandingMethods() {
        const self = this;
        const oldOutstandingMethodBlocks = self._outstandingMethodBlocks;
        self._outstandingMethodBlocks = [];
        self.onReconnect && self.onReconnect();
        DDP._reconnectHook.each(callback => {
          callback(self);
          return true;
        });
        self._sendOutstandingMethodBlocksMessages(oldOutstandingMethodBlocks);
      }

      // We can accept a hot code push if there are no methods in flight.
      _readyToMigrate() {
        return isEmpty(this._methodInvokers);
      }

      // If we were blocking a migration, see if it's now possible to continue.
      // Call whenever the set of outstanding/blocked methods shrinks.
      _maybeMigrate() {
        const self = this;
        if (self._retryMigrate && self._readyToMigrate()) {
          self._retryMigrate();
          self._retryMigrate = null;
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
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"message_processors.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/ddp-client/common/message_processors.js                                                               //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      MessageProcessors: () => MessageProcessors
    });
    let DDPCommon;
    module.link("meteor/ddp-common", {
      DDPCommon(v) {
        DDPCommon = v;
      }
    }, 0);
    let Meteor;
    module.link("meteor/meteor", {
      Meteor(v) {
        Meteor = v;
      }
    }, 1);
    let DDP;
    module.link("./namespace.js", {
      DDP(v) {
        DDP = v;
      }
    }, 2);
    let EJSON;
    module.link("meteor/ejson", {
      EJSON(v) {
        EJSON = v;
      }
    }, 3);
    let isEmpty, hasOwn;
    module.link("meteor/ddp-common/utils", {
      isEmpty(v) {
        isEmpty = v;
      },
      hasOwn(v) {
        hasOwn = v;
      }
    }, 4);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    class MessageProcessors {
      constructor(connection) {
        this._connection = connection;
      }

      /**
       * @summary Process the connection message and set up the session
       * @param {Object} msg The connection message
       */
      async _livedata_connected(msg) {
        const self = this._connection;
        if (self._version !== 'pre1' && self._heartbeatInterval !== 0) {
          self._heartbeat = new DDPCommon.Heartbeat({
            heartbeatInterval: self._heartbeatInterval,
            heartbeatTimeout: self._heartbeatTimeout,
            onTimeout() {
              self._lostConnection(new DDP.ConnectionError('DDP heartbeat timed out'));
            },
            sendPing() {
              self._send({
                msg: 'ping'
              });
            }
          });
          self._heartbeat.start();
        }

        // If this is a reconnect, we'll have to reset all stores.
        if (self._lastSessionId) self._resetStores = true;
        let reconnectedToPreviousSession;
        if (typeof msg.session === 'string') {
          reconnectedToPreviousSession = self._lastSessionId === msg.session;
          self._lastSessionId = msg.session;
        }
        if (reconnectedToPreviousSession) {
          // Successful reconnection -- pick up where we left off.
          return;
        }

        // Server doesn't have our data anymore. Re-sync a new session.

        // Forget about messages we were buffering for unknown collections. They'll
        // be resent if still relevant.
        self._updatesForUnknownStores = Object.create(null);
        if (self._resetStores) {
          // Forget about the effects of stubs. We'll be resetting all collections
          // anyway.
          self._documentsWrittenByStub = Object.create(null);
          self._serverDocuments = Object.create(null);
        }

        // Clear _afterUpdateCallbacks.
        self._afterUpdateCallbacks = [];

        // Mark all named subscriptions which are ready as needing to be revived.
        self._subsBeingRevived = Object.create(null);
        Object.entries(self._subscriptions).forEach(_ref => {
          let [id, sub] = _ref;
          if (sub.ready) {
            self._subsBeingRevived[id] = true;
          }
        });

        // Arrange for "half-finished" methods to have their callbacks run, and
        // track methods that were sent on this connection so that we don't
        // quiesce until they are all done.
        //
        // Start by clearing _methodsBlockingQuiescence: methods sent before
        // reconnect don't matter, and any "wait" methods sent on the new connection
        // that we drop here will be restored by the loop below.
        self._methodsBlockingQuiescence = Object.create(null);
        if (self._resetStores) {
          const invokers = self._methodInvokers;
          Object.keys(invokers).forEach(id => {
            const invoker = invokers[id];
            if (invoker.gotResult()) {
              // This method already got its result, but it didn't call its callback
              // because its data didn't become visible. We did not resend the
              // method RPC. We'll call its callback when we get a full quiesce,
              // since that's as close as we'll get to "data must be visible".
              self._afterUpdateCallbacks.push(function () {
                return invoker.dataVisible(...arguments);
              });
            } else if (invoker.sentMessage) {
              // This method has been sent on this connection (maybe as a resend
              // from the last connection, maybe from onReconnect, maybe just very
              // quickly before processing the connected message).
              //
              // We don't need to do anything special to ensure its callbacks get
              // called, but we'll count it as a method which is preventing
              // reconnect quiescence. (eg, it might be a login method that was run
              // from onReconnect, and we don't want to see flicker by seeing a
              // logged-out state.)
              self._methodsBlockingQuiescence[invoker.methodId] = true;
            }
          });
        }
        self._messagesBufferedUntilQuiescence = [];

        // If we're not waiting on any methods or subs, we can reset the stores and
        // call the callbacks immediately.
        if (!self._waitingForQuiescence()) {
          if (self._resetStores) {
            for (const store of Object.values(self._stores)) {
              await store.beginUpdate(0, true);
              await store.endUpdate();
            }
            self._resetStores = false;
          }
          self._runAfterUpdateCallbacks();
        }
      }

      /**
       * @summary Process various data messages from the server
       * @param {Object} msg The data message
       */
      async _livedata_data(msg) {
        const self = this._connection;
        if (self._waitingForQuiescence()) {
          self._messagesBufferedUntilQuiescence.push(msg);
          if (msg.msg === 'nosub') {
            delete self._subsBeingRevived[msg.id];
          }
          if (msg.subs) {
            msg.subs.forEach(subId => {
              delete self._subsBeingRevived[subId];
            });
          }
          if (msg.methods) {
            msg.methods.forEach(methodId => {
              delete self._methodsBlockingQuiescence[methodId];
            });
          }
          if (self._waitingForQuiescence()) {
            return;
          }

          // No methods or subs are blocking quiescence!
          // We'll now process and all of our buffered messages, reset all stores,
          // and apply them all at once.
          const bufferedMessages = self._messagesBufferedUntilQuiescence;
          for (const bufferedMessage of Object.values(bufferedMessages)) {
            await this._processOneDataMessage(bufferedMessage, self._bufferedWrites);
          }
          self._messagesBufferedUntilQuiescence = [];
        } else {
          await this._processOneDataMessage(msg, self._bufferedWrites);
        }

        // Immediately flush writes when:
        //  1. Buffering is disabled. Or;
        //  2. any non-(added/changed/removed) message arrives.
        const standardWrite = msg.msg === "added" || msg.msg === "changed" || msg.msg === "removed";
        if (self._bufferedWritesInterval === 0 || !standardWrite) {
          await self._flushBufferedWrites();
          return;
        }
        if (self._bufferedWritesFlushAt === null) {
          self._bufferedWritesFlushAt = new Date().valueOf() + self._bufferedWritesMaxAge;
        } else if (self._bufferedWritesFlushAt < new Date().valueOf()) {
          await self._flushBufferedWrites();
          return;
        }
        if (self._bufferedWritesFlushHandle) {
          clearTimeout(self._bufferedWritesFlushHandle);
        }
        self._bufferedWritesFlushHandle = setTimeout(() => {
          self._liveDataWritesPromise = self._flushBufferedWrites();
          if (Meteor._isPromise(self._liveDataWritesPromise)) {
            self._liveDataWritesPromise.finally(() => self._liveDataWritesPromise = undefined);
          }
        }, self._bufferedWritesInterval);
      }

      /**
       * @summary Process individual data messages by type
       * @private
       */
      async _processOneDataMessage(msg, updates) {
        const messageType = msg.msg;
        switch (messageType) {
          case 'added':
            await this._connection._process_added(msg, updates);
            break;
          case 'changed':
            this._connection._process_changed(msg, updates);
            break;
          case 'removed':
            this._connection._process_removed(msg, updates);
            break;
          case 'ready':
            this._connection._process_ready(msg, updates);
            break;
          case 'updated':
            this._connection._process_updated(msg, updates);
            break;
          case 'nosub':
            // ignore this
            break;
          default:
            Meteor._debug('discarding unknown livedata data message type', msg);
        }
      }

      /**
       * @summary Handle method results arriving from the server
       * @param {Object} msg The method result message
       */
      async _livedata_result(msg) {
        const self = this._connection;

        // Lets make sure there are no buffered writes before returning result.
        if (!isEmpty(self._bufferedWrites)) {
          await self._flushBufferedWrites();
        }

        // find the outstanding request
        // should be O(1) in nearly all realistic use cases
        if (isEmpty(self._outstandingMethodBlocks)) {
          Meteor._debug('Received method result but no methods outstanding');
          return;
        }
        const currentMethodBlock = self._outstandingMethodBlocks[0].methods;
        let i;
        const m = currentMethodBlock.find((method, idx) => {
          const found = method.methodId === msg.id;
          if (found) i = idx;
          return found;
        });
        if (!m) {
          Meteor._debug("Can't match method response to original method call", msg);
          return;
        }

        // Remove from current method block. This may leave the block empty, but we
        // don't move on to the next block until the callback has been delivered, in
        // _outstandingMethodFinished.
        currentMethodBlock.splice(i, 1);
        if (hasOwn.call(msg, 'error')) {
          m.receiveResult(new Meteor.Error(msg.error.error, msg.error.reason, msg.error.details));
        } else {
          // msg.result may be undefined if the method didn't return a value
          m.receiveResult(undefined, msg.result);
        }
      }

      /**
       * @summary Handle "nosub" messages arriving from the server
       * @param {Object} msg The nosub message
       */
      async _livedata_nosub(msg) {
        const self = this._connection;

        // First pass it through _livedata_data, which only uses it to help get
        // towards quiescence.
        await this._livedata_data(msg);

        // Do the rest of our processing immediately, with no
        // buffering-until-quiescence.

        // we weren't subbed anyway, or we initiated the unsub.
        if (!hasOwn.call(self._subscriptions, msg.id)) {
          return;
        }

        // XXX COMPAT WITH 1.0.3.1 #errorCallback
        const errorCallback = self._subscriptions[msg.id].errorCallback;
        const stopCallback = self._subscriptions[msg.id].stopCallback;
        self._subscriptions[msg.id].remove();
        const meteorErrorFromMsg = msgArg => {
          return msgArg && msgArg.error && new Meteor.Error(msgArg.error.error, msgArg.error.reason, msgArg.error.details);
        };

        // XXX COMPAT WITH 1.0.3.1 #errorCallback
        if (errorCallback && msg.error) {
          errorCallback(meteorErrorFromMsg(msg));
        }
        if (stopCallback) {
          stopCallback(meteorErrorFromMsg(msg));
        }
      }

      /**
       * @summary Handle errors from the server
       * @param {Object} msg The error message
       */
      _livedata_error(msg) {
        Meteor._debug('Received error from server: ', msg.reason);
        if (msg.offendingMessage) Meteor._debug('For: ', msg.offendingMessage);
      }

      // Document change message processors will be defined in a separate class
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
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"method_invoker.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/ddp-client/common/method_invoker.js                                                                   //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
module.export({
  MethodInvoker: () => MethodInvoker
});
class MethodInvoker {
  constructor(options) {
    // Public (within this file) fields.
    this.methodId = options.methodId;
    this.sentMessage = false;
    this._callback = options.callback;
    this._connection = options.connection;
    this._message = options.message;
    this._onResultReceived = options.onResultReceived || (() => {});
    this._wait = options.wait;
    this.noRetry = options.noRetry;
    this._methodResult = null;
    this._dataVisible = false;

    // Register with the connection.
    this._connection._methodInvokers[this.methodId] = this;
  }
  // Sends the method message to the server. May be called additional times if
  // we lose the connection and reconnect before receiving a result.
  sendMessage() {
    // This function is called before sending a method (including resending on
    // reconnect). We should only (re)send methods where we don't already have a
    // result!
    if (this.gotResult()) throw new Error('sendingMethod is called on method with result');

    // If we're re-sending it, it doesn't matter if data was written the first
    // time.
    this._dataVisible = false;
    this.sentMessage = true;

    // If this is a wait method, make all data messages be buffered until it is
    // done.
    if (this._wait) this._connection._methodsBlockingQuiescence[this.methodId] = true;

    // Actually send the message.
    this._connection._send(this._message);
  }
  // Invoke the callback, if we have both a result and know that all data has
  // been written to the local cache.
  _maybeInvokeCallback() {
    if (this._methodResult && this._dataVisible) {
      // Call the callback. (This won't throw: the callback was wrapped with
      // bindEnvironment.)
      this._callback(this._methodResult[0], this._methodResult[1]);

      // Forget about this method.
      delete this._connection._methodInvokers[this.methodId];

      // Let the connection know that this method is finished, so it can try to
      // move on to the next block of methods.
      this._connection._outstandingMethodFinished();
    }
  }
  // Call with the result of the method from the server. Only may be called
  // once; once it is called, you should not call sendMessage again.
  // If the user provided an onResultReceived callback, call it immediately.
  // Then invoke the main callback if data is also visible.
  receiveResult(err, result) {
    if (this.gotResult()) throw new Error('Methods should only receive results once');
    this._methodResult = [err, result];
    this._onResultReceived(err, result);
    this._maybeInvokeCallback();
  }
  // Call this when all data written by the method is visible. This means that
  // the method has returns its "data is done" message *AND* all server
  // documents that are buffered at that time have been written to the local
  // cache. Invokes the main callback if the result has been received.
  dataVisible() {
    this._dataVisible = true;
    this._maybeInvokeCallback();
  }
  // True if receiveResult has been called.
  gotResult() {
    return !!this._methodResult;
  }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"mongo_id_map.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/ddp-client/common/mongo_id_map.js                                                                     //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      MongoIDMap: () => MongoIDMap
    });
    let MongoID;
    module.link("meteor/mongo-id", {
      MongoID(v) {
        MongoID = v;
      }
    }, 0);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    class MongoIDMap extends IdMap {
      constructor() {
        super(MongoID.idStringify, MongoID.idParse);
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
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"namespace.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/ddp-client/common/namespace.js                                                                        //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      DDP: () => DDP
    });
    let DDPCommon;
    module.link("meteor/ddp-common", {
      DDPCommon(v) {
        DDPCommon = v;
      }
    }, 0);
    let Meteor;
    module.link("meteor/meteor", {
      Meteor(v) {
        Meteor = v;
      }
    }, 1);
    let Connection;
    module.link("./livedata_connection.js", {
      Connection(v) {
        Connection = v;
      }
    }, 2);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    // This array allows the `_allSubscriptionsReady` method below, which
    // is used by the `spiderable` package, to keep track of whether all
    // data is ready.
    const allConnections = [];

    /**
     * @namespace DDP
     * @summary Namespace for DDP-related methods/classes.
     */
    const DDP = {};
    // This is private but it's used in a few places. accounts-base uses
    // it to get the current user. Meteor.setTimeout and friends clear
    // it. We can probably find a better way to factor this.
    DDP._CurrentMethodInvocation = new Meteor.EnvironmentVariable();
    DDP._CurrentPublicationInvocation = new Meteor.EnvironmentVariable();

    // XXX: Keep DDP._CurrentInvocation for backwards-compatibility.
    DDP._CurrentInvocation = DDP._CurrentMethodInvocation;
    DDP._CurrentCallAsyncInvocation = new Meteor.EnvironmentVariable();

    // This is passed into a weird `makeErrorType` function that expects its thing
    // to be a constructor
    function connectionErrorConstructor(message) {
      this.message = message;
    }
    DDP.ConnectionError = Meteor.makeErrorType('DDP.ConnectionError', connectionErrorConstructor);
    DDP.ForcedReconnectError = Meteor.makeErrorType('DDP.ForcedReconnectError', () => {});

    // Returns the named sequence of pseudo-random values.
    // The scope will be DDP._CurrentMethodInvocation.get(), so the stream will produce
    // consistent values for method calls on the client and server.
    DDP.randomStream = name => {
      const scope = DDP._CurrentMethodInvocation.get();
      return DDPCommon.RandomStream.get(scope, name);
    };

    // @param url {String} URL to Meteor app,
    //     e.g.:
    //     "subdomain.meteor.com",
    //     "http://subdomain.meteor.com",
    //     "/",
    //     "ddp+sockjs://ddp--****-foo.meteor.com/sockjs"

    /**
     * @summary Connect to the server of a different Meteor application to subscribe to its document sets and invoke its remote methods.
     * @locus Anywhere
     * @param {String} url The URL of another Meteor application.
     * @param {Object} [options]
     * @param {Boolean} options.reloadWithOutstanding is it OK to reload if there are outstanding methods?
     * @param {Object} options.headers extra headers to send on the websockets connection, for server-to-server DDP only
     * @param {Object} options._sockjsOptions Specifies options to pass through to the sockjs client
     * @param {Function} options.onDDPNegotiationVersionFailure callback when version negotiation fails.
     */
    DDP.connect = (url, options) => {
      const ret = new Connection(url, options);
      allConnections.push(ret); // hack. see below.
      return ret;
    };
    DDP._reconnectHook = new Hook({
      bindEnvironment: false
    });

    /**
     * @summary Register a function to call as the first step of
     * reconnecting. This function can call methods which will be executed before
     * any other outstanding methods. For example, this can be used to re-establish
     * the appropriate authentication context on the connection.
     * @locus Anywhere
     * @param {Function} callback The function to call. It will be called with a
     * single argument, the [connection object](#ddp_connect) that is reconnecting.
     */
    DDP.onReconnect = callback => DDP._reconnectHook.register(callback);

    // Hack for `spiderable` package: a way to see if the page is done
    // loading all the data it needs.
    //
    DDP._allSubscriptionsReady = () => allConnections.every(conn => Object.values(conn._subscriptions).every(sub => sub.ready));
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      DDP: DDP
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/ddp-client/server/server.js"
  ],
  mainModulePath: "/node_modules/meteor/ddp-client/server/server.js"
}});

//# sourceURL=meteor://💻app/packages/ddp-client.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvZGRwLWNsaWVudC9zZXJ2ZXIvc2VydmVyLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9kZHAtY2xpZW50L2NvbW1vbi9jb25uZWN0aW9uX3N0cmVhbV9oYW5kbGVycy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvZGRwLWNsaWVudC9jb21tb24vZG9jdW1lbnRfcHJvY2Vzc29ycy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvZGRwLWNsaWVudC9jb21tb24vbGl2ZWRhdGFfY29ubmVjdGlvbi5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvZGRwLWNsaWVudC9jb21tb24vbWVzc2FnZV9wcm9jZXNzb3JzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9kZHAtY2xpZW50L2NvbW1vbi9tZXRob2RfaW52b2tlci5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvZGRwLWNsaWVudC9jb21tb24vbW9uZ29faWRfbWFwLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9kZHAtY2xpZW50L2NvbW1vbi9uYW1lc3BhY2UuanMiXSwibmFtZXMiOlsibW9kdWxlIiwibGluayIsIkREUCIsIl9fcmVpZnlXYWl0Rm9yRGVwc19fIiwiX19yZWlmeV9hc3luY19yZXN1bHRfXyIsIl9yZWlmeUVycm9yIiwic2VsZiIsImFzeW5jIiwiZXhwb3J0IiwiQ29ubmVjdGlvblN0cmVhbUhhbmRsZXJzIiwiRERQQ29tbW9uIiwidiIsIk1ldGVvciIsImNvbnN0cnVjdG9yIiwiY29ubmVjdGlvbiIsIl9jb25uZWN0aW9uIiwib25NZXNzYWdlIiwicmF3X21zZyIsIm1zZyIsInBhcnNlRERQIiwiZSIsIl9kZWJ1ZyIsIl9oZWFydGJlYXQiLCJtZXNzYWdlUmVjZWl2ZWQiLCJ0ZXN0TWVzc2FnZU9uQ29ubmVjdCIsIk9iamVjdCIsImtleXMiLCJsZW5ndGgiLCJzZXJ2ZXJfaWQiLCJfdmVyc2lvbiIsIl92ZXJzaW9uU3VnZ2VzdGlvbiIsIl9yb3V0ZU1lc3NhZ2UiLCJfbGl2ZWRhdGFfY29ubmVjdGVkIiwib3B0aW9ucyIsIm9uQ29ubmVjdGVkIiwiX2hhbmRsZUZhaWxlZE1lc3NhZ2UiLCJyZXNwb25kVG9QaW5ncyIsIl9zZW5kIiwiaWQiLCJfbGl2ZWRhdGFfZGF0YSIsIl9saXZlZGF0YV9ub3N1YiIsIl9saXZlZGF0YV9yZXN1bHQiLCJfbGl2ZWRhdGFfZXJyb3IiLCJfc3VwcG9ydGVkRERQVmVyc2lvbnMiLCJpbmRleE9mIiwidmVyc2lvbiIsIl9zdHJlYW0iLCJyZWNvbm5lY3QiLCJfZm9yY2UiLCJkZXNjcmlwdGlvbiIsImRpc2Nvbm5lY3QiLCJfcGVybWFuZW50IiwiX2Vycm9yIiwib25ERFBWZXJzaW9uTmVnb3RpYXRpb25GYWlsdXJlIiwib25SZXNldCIsIl9idWlsZENvbm5lY3RNZXNzYWdlIiwiX2hhbmRsZU91dHN0YW5kaW5nTWV0aG9kc09uUmVzZXQiLCJfY2FsbE9uUmVjb25uZWN0QW5kU2VuZEFwcHJvcHJpYXRlT3V0c3RhbmRpbmdNZXRob2RzIiwiX3Jlc2VuZFN1YnNjcmlwdGlvbnMiLCJfbGFzdFNlc3Npb25JZCIsInNlc3Npb24iLCJzdXBwb3J0IiwiYmxvY2tzIiwiX291dHN0YW5kaW5nTWV0aG9kQmxvY2tzIiwiY3VycmVudE1ldGhvZEJsb2NrIiwibWV0aG9kcyIsImZpbHRlciIsIm1ldGhvZEludm9rZXIiLCJzZW50TWVzc2FnZSIsIm5vUmV0cnkiLCJyZWNlaXZlUmVzdWx0IiwiRXJyb3IiLCJzaGlmdCIsInZhbHVlcyIsIl9tZXRob2RJbnZva2VycyIsImZvckVhY2giLCJpbnZva2VyIiwiZW50cmllcyIsIl9zdWJzY3JpcHRpb25zIiwiX3JlZiIsInN1YiIsIl9zZW5kUXVldWVkIiwibmFtZSIsInBhcmFtcyIsIkRvY3VtZW50UHJvY2Vzc29ycyIsIk1vbmdvSUQiLCJEaWZmU2VxdWVuY2UiLCJoYXNPd24iLCJpc0VtcHR5IiwiX3Byb2Nlc3NfYWRkZWQiLCJ1cGRhdGVzIiwiaWRQYXJzZSIsInNlcnZlckRvYyIsIl9nZXRTZXJ2ZXJEb2MiLCJjb2xsZWN0aW9uIiwiaXNFeGlzdGluZyIsImRvY3VtZW50IiwidW5kZWZpbmVkIiwiZmllbGRzIiwiY3JlYXRlIiwiX2lkIiwiX3Jlc2V0U3RvcmVzIiwiY3VycmVudERvYyIsIl9zdG9yZXMiLCJnZXREb2MiLCJfcHVzaFVwZGF0ZSIsIl9wcm9jZXNzX2NoYW5nZWQiLCJhcHBseUNoYW5nZXMiLCJfcHJvY2Vzc19yZW1vdmVkIiwiX3Byb2Nlc3NfcmVhZHkiLCJzdWJzIiwic3ViSWQiLCJfcnVuV2hlbkFsbFNlcnZlckRvY3NBcmVGbHVzaGVkIiwic3ViUmVjb3JkIiwicmVhZHkiLCJyZWFkeUNhbGxiYWNrIiwicmVhZHlEZXBzIiwiY2hhbmdlZCIsIl9wcm9jZXNzX3VwZGF0ZWQiLCJtZXRob2RJZCIsImRvY3MiLCJfZG9jdW1lbnRzV3JpdHRlbkJ5U3R1YiIsIndyaXR0ZW4iLCJKU09OIiwic3RyaW5naWZ5Iiwid3JpdHRlbkJ5U3R1YnMiLCJpZFN0cmluZ2lmeSIsInJlcGxhY2UiLCJmbHVzaENhbGxiYWNrcyIsImMiLCJfc2VydmVyRG9jdW1lbnRzIiwicmVtb3ZlIiwiY2FsbGJhY2tJbnZva2VyIiwiZGF0YVZpc2libGUiLCJhcmd1bWVudHMiLCJjYWxsIiwicHVzaCIsInNlcnZlckRvY3NGb3JDb2xsZWN0aW9uIiwiZ2V0IiwiX29iamVjdFdpdGhvdXRQcm9wZXJ0aWVzIiwiZGVmYXVsdCIsIl9vYmplY3RTcHJlYWQiLCJfZXhjbHVkZWQiLCJfZXhjbHVkZWQyIiwiQ29ubmVjdGlvbiIsIlRyYWNrZXIiLCJFSlNPTiIsIlJhbmRvbSIsIk1ldGhvZEludm9rZXIiLCJzbGljZSIsImxhc3QiLCJNb25nb0lETWFwIiwiTWVzc2FnZVByb2Nlc3NvcnMiLCJ1cmwiLCJoZWFydGJlYXRJbnRlcnZhbCIsImhlYXJ0YmVhdFRpbWVvdXQiLCJucG1GYXllT3B0aW9ucyIsInJlbG9hZFdpdGhPdXRzdGFuZGluZyIsInN1cHBvcnRlZEREUFZlcnNpb25zIiwiU1VQUE9SVEVEX0REUF9WRVJTSU9OUyIsInJldHJ5IiwiYnVmZmVyZWRXcml0ZXNJbnRlcnZhbCIsImJ1ZmZlcmVkV3JpdGVzTWF4QWdlIiwib25SZWNvbm5lY3QiLCJDbGllbnRTdHJlYW0iLCJDb25uZWN0aW9uRXJyb3IiLCJoZWFkZXJzIiwiX3NvY2tqc09wdGlvbnMiLCJfZG9udFByaW50RXJyb3JzIiwiY29ubmVjdFRpbWVvdXRNcyIsIl9tZXRob2RIYW5kbGVycyIsIl9uZXh0TWV0aG9kSWQiLCJfaGVhcnRiZWF0SW50ZXJ2YWwiLCJfaGVhcnRiZWF0VGltZW91dCIsIl9hZnRlclVwZGF0ZUNhbGxiYWNrcyIsIl9tZXNzYWdlc0J1ZmZlcmVkVW50aWxRdWllc2NlbmNlIiwiX21ldGhvZHNCbG9ja2luZ1F1aWVzY2VuY2UiLCJfc3Vic0JlaW5nUmV2aXZlZCIsIl91cGRhdGVzRm9yVW5rbm93blN0b3JlcyIsIl9yZXRyeU1pZ3JhdGUiLCJfYnVmZmVyZWRXcml0ZXMiLCJfYnVmZmVyZWRXcml0ZXNGbHVzaEF0IiwiX2J1ZmZlcmVkV3JpdGVzRmx1c2hIYW5kbGUiLCJfYnVmZmVyZWRXcml0ZXNJbnRlcnZhbCIsIl9idWZmZXJlZFdyaXRlc01heEFnZSIsIl91c2VySWQiLCJfdXNlcklkRGVwcyIsIkRlcGVuZGVuY3kiLCJpc0NsaWVudCIsIlBhY2thZ2UiLCJyZWxvYWQiLCJSZWxvYWQiLCJfb25NaWdyYXRlIiwiX3JlYWR5VG9NaWdyYXRlIiwiX3N0cmVhbUhhbmRsZXJzIiwib25EaXNjb25uZWN0Iiwic3RvcCIsImlzU2VydmVyIiwib24iLCJiaW5kRW52aXJvbm1lbnQiLCJfbWVzc2FnZVByb2Nlc3NvcnMiLCJfZG9jdW1lbnRQcm9jZXNzb3JzIiwiY3JlYXRlU3RvcmVNZXRob2RzIiwid3JhcHBlZFN0b3JlIiwic3RvcmUiLCJrZXlzT2ZTdG9yZSIsIm1ldGhvZCIsInJlZ2lzdGVyU3RvcmVDbGllbnQiLCJxdWV1ZWQiLCJBcnJheSIsImlzQXJyYXkiLCJiZWdpblVwZGF0ZSIsInVwZGF0ZSIsImVuZFVwZGF0ZSIsInJlZ2lzdGVyU3RvcmVTZXJ2ZXIiLCJzdWJzY3JpYmUiLCJjYWxsYmFja3MiLCJsYXN0UGFyYW0iLCJvblJlYWR5IiwicG9wIiwib25FcnJvciIsIm9uU3RvcCIsInNvbWUiLCJmIiwiZXhpc3RpbmciLCJmaW5kIiwiaW5hY3RpdmUiLCJlcXVhbHMiLCJlcnJvckNhbGxiYWNrIiwic3RvcENhbGxiYWNrIiwiY2xvbmUiLCJoYW5kbGUiLCJyZWNvcmQiLCJkZXBlbmQiLCJzdWJzY3JpcHRpb25JZCIsImFjdGl2ZSIsIm9uSW52YWxpZGF0ZSIsImFmdGVyRmx1c2giLCJpc0FzeW5jQ2FsbCIsIl9DdXJyZW50TWV0aG9kSW52b2NhdGlvbiIsIl9pc0NhbGxBc3luY01ldGhvZFJ1bm5pbmciLCJmdW5jIiwiX2dldElzU2ltdWxhdGlvbiIsIl9yZWYyIiwiaXNGcm9tQ2FsbEFzeW5jIiwiYWxyZWFkeUluU2ltdWxhdGlvbiIsImFyZ3MiLCJjYWxsYmFjayIsImFwcGx5IiwiY2FsbEFzeW5jIiwiYXBwbHlBc3luYyIsInJldHVyblNlcnZlclJlc3VsdFByb21pc2UiLCJfdGhpcyRfc3R1YkNhbGwiLCJfc3R1YkNhbGwiLCJzdHViSW52b2NhdGlvbiIsImludm9jYXRpb24iLCJzdHViT3B0aW9ucyIsImhhc1N0dWIiLCJfc2F2ZU9yaWdpbmFscyIsInN0dWJSZXR1cm5WYWx1ZSIsIndpdGhWYWx1ZSIsIl9pc1Byb21pc2UiLCJjb25jYXQiLCJleGNlcHRpb24iLCJfYXBwbHkiLCJzdHViUHJvbWlzZSIsIl9hcHBseUFzeW5jU3R1Ykludm9jYXRpb24iLCJwcm9taXNlIiwiX2FwcGx5QXN5bmMiLCJ0aGVuIiwibyIsInNlcnZlclByb21pc2UiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImNhdGNoIiwiX3RoaXMkX3N0dWJDYWxsMiIsImN1cnJlbnRDb250ZXh0IiwiX3NldE5ld0NvbnRleHRBbmRHZXRDdXJyZW50IiwiX3NldCIsIl9yZWYzIiwic3R1YkNhbGxWYWx1ZSIsInJhbmRvbVNlZWQiLCJyZXN1bHQiLCJfcmV0dXJuTWV0aG9kSW52b2tlciIsIl9yZXRyaWV2ZUFuZFN0b3JlT3JpZ2luYWxzIiwibWVzc2FnZSIsInRocm93U3R1YkV4Y2VwdGlvbnMiLCJfZXhwZWN0ZWRCeVRlc3QiLCJyZXR1cm5TdHViVmFsdWUiLCJlcnIiLCJfbGVuIiwiYWxsQXJncyIsIl9rZXkiLCJmcm9tIiwidmFsdWUiLCJvblJlc3VsdFJlY2VpdmVkIiwid2FpdCIsIl9hZGRPdXRzdGFuZGluZ01ldGhvZCIsImVuY2xvc2luZyIsInN0dWIiLCJpc1NpbXVsYXRpb24iLCJfaXNGcm9tQ2FsbEFzeW5jIiwiZGVmYXVsdFJldHVybiIsInJhbmRvbVNlZWRHZW5lcmF0b3IiLCJtYWtlUnBjU2VlZCIsInNldFVzZXJJZCIsInVzZXJJZCIsIk1ldGhvZEludm9jYXRpb24iLCJfbm9ZaWVsZHNBbGxvd2VkIiwiX3dhaXRpbmdGb3JRdWllc2NlbmNlIiwiX2ZsdXNoQnVmZmVyZWRXcml0ZXMiLCJzYXZlT3JpZ2luYWxzIiwiZG9jc1dyaXR0ZW4iLCJfcmVmNCIsIm9yaWdpbmFscyIsInJldHJpZXZlT3JpZ2luYWxzIiwiZG9jIiwic2V0RGVmYXVsdCIsIl91bnN1YnNjcmliZUFsbCIsIm9iaiIsInNlbmQiLCJzdHJpbmdpZnlERFAiLCJfbG9zdENvbm5lY3Rpb24iLCJlcnJvciIsInN0YXR1cyIsImNsb3NlIiwiX2FueU1ldGhvZHNBcmVPdXRzdGFuZGluZyIsImludm9rZXJzIiwiX3Byb2Nlc3NPbmVEYXRhTWVzc2FnZSIsIm1lc3NhZ2VUeXBlIiwiX3ByZXBhcmVCdWZmZXJzVG9GbHVzaCIsImNsZWFyVGltZW91dCIsIndyaXRlcyIsIl9wZXJmb3JtV3JpdGVzU2VydmVyIiwiX3VwZGF0ZXMkc3RvcmUkX25hbWUiLCJfbmFtZSIsInN0b3JlTmFtZSIsIm1lc3NhZ2VzIiwiQ0hVTktfU0laRSIsImkiLCJjaHVuayIsIk1hdGgiLCJtaW4iLCJwcm9jZXNzIiwibmV4dFRpY2siLCJfcnVuQWZ0ZXJVcGRhdGVDYWxsYmFja3MiLCJfcGVyZm9ybVdyaXRlc0NsaWVudCIsIl91cGRhdGVzJHN0b3JlJF9uYW1lMiIsIl9yZWY1IiwicnVuRkFmdGVyVXBkYXRlcyIsInVuZmx1c2hlZFNlcnZlckRvY0NvdW50Iiwib25TZXJ2ZXJEb2NGbHVzaCIsInNlcnZlckRvY3VtZW50cyIsIndyaXR0ZW5CeVN0dWJGb3JBTWV0aG9kV2l0aFNlbnRNZXNzYWdlIiwic2VuZE1lc3NhZ2UiLCJfb3V0c3RhbmRpbmdNZXRob2RGaW5pc2hlZCIsImZpcnN0QmxvY2siLCJfc2VuZE91dHN0YW5kaW5nTWV0aG9kcyIsIl9tYXliZU1pZ3JhdGUiLCJtIiwiX3NlbmRPdXRzdGFuZGluZ01ldGhvZEJsb2Nrc01lc3NhZ2VzIiwib2xkT3V0c3RhbmRpbmdNZXRob2RCbG9ja3MiLCJfcmVjb25uZWN0SG9vayIsImVhY2giLCJIZWFydGJlYXQiLCJvblRpbWVvdXQiLCJzZW5kUGluZyIsInN0YXJ0IiwicmVjb25uZWN0ZWRUb1ByZXZpb3VzU2Vzc2lvbiIsImdvdFJlc3VsdCIsImJ1ZmZlcmVkTWVzc2FnZXMiLCJidWZmZXJlZE1lc3NhZ2UiLCJzdGFuZGFyZFdyaXRlIiwiRGF0ZSIsInZhbHVlT2YiLCJzZXRUaW1lb3V0IiwiX2xpdmVEYXRhV3JpdGVzUHJvbWlzZSIsImZpbmFsbHkiLCJpZHgiLCJmb3VuZCIsInNwbGljZSIsInJlYXNvbiIsImRldGFpbHMiLCJtZXRlb3JFcnJvckZyb21Nc2ciLCJtc2dBcmciLCJvZmZlbmRpbmdNZXNzYWdlIiwiX2NhbGxiYWNrIiwiX21lc3NhZ2UiLCJfb25SZXN1bHRSZWNlaXZlZCIsIl93YWl0IiwiX21ldGhvZFJlc3VsdCIsIl9kYXRhVmlzaWJsZSIsIl9tYXliZUludm9rZUNhbGxiYWNrIiwiSWRNYXAiLCJhbGxDb25uZWN0aW9ucyIsIkVudmlyb25tZW50VmFyaWFibGUiLCJfQ3VycmVudFB1YmxpY2F0aW9uSW52b2NhdGlvbiIsIl9DdXJyZW50SW52b2NhdGlvbiIsIl9DdXJyZW50Q2FsbEFzeW5jSW52b2NhdGlvbiIsImNvbm5lY3Rpb25FcnJvckNvbnN0cnVjdG9yIiwibWFrZUVycm9yVHlwZSIsIkZvcmNlZFJlY29ubmVjdEVycm9yIiwicmFuZG9tU3RyZWFtIiwic2NvcGUiLCJSYW5kb21TdHJlYW0iLCJjb25uZWN0IiwicmV0IiwiSG9vayIsInJlZ2lzdGVyIiwiX2FsbFN1YnNjcmlwdGlvbnNSZWFkeSIsImV2ZXJ5IiwiY29ubiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQUEsTUFBTSxDQUFDQyxJQUFJLENBQUMsd0JBQXdCLEVBQUM7TUFBQ0MsR0FBRyxFQUFDO0lBQUssQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUFDLElBQUlDLG9CQUFvQixDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU1BLG9CQUFvQixDQUFDLENBQUMsRUFBRSxDQUFDO0lBQUNDLHNCQUFBO0VBQUEsU0FBQUMsV0FBQTtJQUFBLE9BQUFELHNCQUFBLENBQUFDLFdBQUE7RUFBQTtFQUFBRCxzQkFBQTtBQUFBO0VBQUFFLElBQUE7RUFBQUMsS0FBQTtBQUFBLEc7Ozs7Ozs7Ozs7Ozs7O0lDQWpIUCxNQUFNLENBQUNRLE1BQU0sQ0FBQztNQUFDQyx3QkFBd0IsRUFBQ0EsQ0FBQSxLQUFJQTtJQUF3QixDQUFDLENBQUM7SUFBQyxJQUFJQyxTQUFTO0lBQUNWLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDLG1CQUFtQixFQUFDO01BQUNTLFNBQVNBLENBQUNDLENBQUMsRUFBQztRQUFDRCxTQUFTLEdBQUNDLENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJQyxNQUFNO0lBQUNaLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDLGVBQWUsRUFBQztNQUFDVyxNQUFNQSxDQUFDRCxDQUFDLEVBQUM7UUFBQ0MsTUFBTSxHQUFDRCxDQUFDO01BQUE7SUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQUMsSUFBSVIs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QUN4QzBXLGNBQWMsQ0FBQ25RLElBQUksQ0FBQytRLEdBQUcsQ0FBQyxDQUFDLENBQUM7TUFDMUIsT0FBT0EsR0FBRztJQUNaLENBQUM7SUFFRHJaLEdBQUcsQ0FBQ3lXLGNBQWMsR0FBRyxJQUFJNkMsSUFBSSxDQUFDO01BQUVqTixlQUFlLEVBQUU7SUFBTSxDQUFDLENBQUM7O0lBRXpEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNBck0sR0FBRyxDQUFDaUssV0FBVyxHQUFHb0YsUUFBUSxJQUFJclAsR0FBRyxDQUFDeVcsY0FBYyxDQUFDOEMsUUFBUSxDQUFDbEssUUFBUSxDQUFDOztJQUVuRTtJQUNBO0lBQ0E7SUFDQXJQLEdBQUcsQ0FBQ3daLHNCQUFzQixHQUFHLE1BQU1mLGNBQWMsQ0FBQ2dCLEtBQUssQ0FDckRDLElBQUksSUFBSW5ZLE1BQU0sQ0FBQ2dELE1BQU0sQ0FBQ21WLElBQUksQ0FBQzlVLGNBQWMsQ0FBQyxDQUFDNlUsS0FBSyxDQUFDM1UsR0FBRyxJQUFJQSxHQUFHLENBQUNrQyxLQUFLLENBQ25FLENBQUM7SUFBQzlHLHNCQUFBO0VBQUEsU0FBQUMsV0FBQTtJQUFBLE9BQUFELHNCQUFBLENBQUFDLFdBQUE7RUFBQTtFQUFBRCxzQkFBQTtBQUFBO0VBQUFFLElBQUE7RUFBQUMsS0FBQTtBQUFBLEciLCJmaWxlIjoiL3BhY2thZ2VzL2RkcC1jbGllbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgeyBERFAgfSBmcm9tICcuLi9jb21tb24vbmFtZXNwYWNlLmpzJztcbiIsImltcG9ydCB7IEREUENvbW1vbiB9IGZyb20gJ21ldGVvci9kZHAtY29tbW9uJztcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuXG5leHBvcnQgY2xhc3MgQ29ubmVjdGlvblN0cmVhbUhhbmRsZXJzIHtcbiAgY29uc3RydWN0b3IoY29ubmVjdGlvbikge1xuICAgIHRoaXMuX2Nvbm5lY3Rpb24gPSBjb25uZWN0aW9uO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgaW5jb21pbmcgcmF3IG1lc3NhZ2VzIGZyb20gdGhlIEREUCBzdHJlYW1cbiAgICogQHBhcmFtIHtTdHJpbmd9IHJhd19tc2cgVGhlIHJhdyBtZXNzYWdlIHJlY2VpdmVkIGZyb20gdGhlIHN0cmVhbVxuICAgKi9cbiAgYXN5bmMgb25NZXNzYWdlKHJhd19tc2cpIHtcbiAgICBsZXQgbXNnO1xuICAgIHRyeSB7XG4gICAgICBtc2cgPSBERFBDb21tb24ucGFyc2VERFAocmF3X21zZyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgTWV0ZW9yLl9kZWJ1ZygnRXhjZXB0aW9uIHdoaWxlIHBhcnNpbmcgRERQJywgZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gQW55IG1lc3NhZ2UgY291bnRzIGFzIHJlY2VpdmluZyBhIHBvbmcsIGFzIGl0IGRlbW9uc3RyYXRlcyB0aGF0XG4gICAgLy8gdGhlIHNlcnZlciBpcyBzdGlsbCBhbGl2ZS5cbiAgICBpZiAodGhpcy5fY29ubmVjdGlvbi5faGVhcnRiZWF0KSB7XG4gICAgICB0aGlzLl9jb25uZWN0aW9uLl9oZWFydGJlYXQubWVzc2FnZVJlY2VpdmVkKCk7XG4gICAgfVxuXG4gICAgaWYgKG1zZyA9PT0gbnVsbCB8fCAhbXNnLm1zZykge1xuICAgICAgaWYoIW1zZyB8fCAhbXNnLnRlc3RNZXNzYWdlT25Db25uZWN0KSB7XG4gICAgICAgIGlmIChPYmplY3Qua2V5cyhtc2cpLmxlbmd0aCA9PT0gMSAmJiBtc2cuc2VydmVyX2lkKSByZXR1cm47XG4gICAgICAgIE1ldGVvci5fZGVidWcoJ2Rpc2NhcmRpbmcgaW52YWxpZCBsaXZlZGF0YSBtZXNzYWdlJywgbXNnKTtcbiAgICAgIH1cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBJbXBvcnRhbnQ6IFRoaXMgd2FzIG1pc3NpbmcgZnJvbSBwcmV2aW91cyB2ZXJzaW9uXG4gICAgLy8gV2UgbmVlZCB0byBzZXQgdGhlIGN1cnJlbnQgdmVyc2lvbiBiZWZvcmUgcm91dGluZyB0aGUgbWVzc2FnZVxuICAgIGlmIChtc2cubXNnID09PSAnY29ubmVjdGVkJykge1xuICAgICAgdGhpcy5fY29ubmVjdGlvbi5fdmVyc2lvbiA9IHRoaXMuX2Nvbm5lY3Rpb24uX3ZlcnNpb25TdWdnZXN0aW9uO1xuICAgIH1cblxuICAgIGF3YWl0IHRoaXMuX3JvdXRlTWVzc2FnZShtc2cpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJvdXRlcyBtZXNzYWdlcyB0byB0aGVpciBhcHByb3ByaWF0ZSBoYW5kbGVycyBiYXNlZCBvbiBtZXNzYWdlIHR5cGVcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtPYmplY3R9IG1zZyBUaGUgcGFyc2VkIEREUCBtZXNzYWdlXG4gICAqL1xuICBhc3luYyBfcm91dGVNZXNzYWdlKG1zZykge1xuICAgIHN3aXRjaCAobXNnLm1zZykge1xuICAgICAgY2FzZSAnY29ubmVjdGVkJzpcbiAgICAgICAgYXdhaXQgdGhpcy5fY29ubmVjdGlvbi5fbGl2ZWRhdGFfY29ubmVjdGVkKG1zZyk7XG4gICAgICAgIHRoaXMuX2Nvbm5lY3Rpb24ub3B0aW9ucy5vbkNvbm5lY3RlZCgpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnZmFpbGVkJzpcbiAgICAgICAgYXdhaXQgdGhpcy5faGFuZGxlRmFpbGVkTWVzc2FnZShtc2cpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAncGluZyc6XG4gICAgICAgIGlmICh0aGlzLl9jb25uZWN0aW9uLm9wdGlvbnMucmVzcG9uZFRvUGluZ3MpIHtcbiAgICAgICAgICB0aGlzLl9jb25uZWN0aW9uLl9zZW5kKHsgbXNnOiAncG9uZycsIGlkOiBtc2cuaWQgfSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ3BvbmcnOlxuICAgICAgICAvLyBub29wLCBhcyB3ZSBhc3N1bWUgZXZlcnl0aGluZydzIGEgcG9uZ1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnYWRkZWQnOlxuICAgICAgY2FzZSAnY2hhbmdlZCc6XG4gICAgICBjYXNlICdyZW1vdmVkJzpcbiAgICAgIGNhc2UgJ3JlYWR5JzpcbiAgICAgIGNhc2UgJ3VwZGF0ZWQnOlxuICAgICAgICBhd2FpdCB0aGlzLl9jb25uZWN0aW9uLl9saXZlZGF0YV9kYXRhKG1zZyk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdub3N1Yic6XG4gICAgICAgIGF3YWl0IHRoaXMuX2Nvbm5lY3Rpb24uX2xpdmVkYXRhX25vc3ViKG1zZyk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdyZXN1bHQnOlxuICAgICAgICBhd2FpdCB0aGlzLl9jb25uZWN0aW9uLl9saXZlZGF0YV9yZXN1bHQobXNnKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2Vycm9yJzpcbiAgICAgICAgdGhpcy5fY29ubmVjdGlvbi5fbGl2ZWRhdGFfZXJyb3IobXNnKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIE1ldGVvci5fZGVidWcoJ2Rpc2NhcmRpbmcgdW5rbm93biBsaXZlZGF0YSBtZXNzYWdlIHR5cGUnLCBtc2cpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGZhaWxlZCBjb25uZWN0aW9uIG1lc3NhZ2VzXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBtc2cgVGhlIGZhaWxlZCBtZXNzYWdlIG9iamVjdFxuICAgKi9cbiAgX2hhbmRsZUZhaWxlZE1lc3NhZ2UobXNnKSB7XG4gICAgaWYgKHRoaXMuX2Nvbm5lY3Rpb24uX3N1cHBvcnRlZEREUFZlcnNpb25zLmluZGV4T2YobXNnLnZlcnNpb24pID49IDApIHtcbiAgICAgIHRoaXMuX2Nvbm5lY3Rpb24uX3ZlcnNpb25TdWdnZXN0aW9uID0gbXNnLnZlcnNpb247XG4gICAgICB0aGlzLl9jb25uZWN0aW9uLl9zdHJlYW0ucmVjb25uZWN0KHsgX2ZvcmNlOiB0cnVlIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBkZXNjcmlwdGlvbiA9XG4gICAgICAgICdERFAgdmVyc2lvbiBuZWdvdGlhdGlvbiBmYWlsZWQ7IHNlcnZlciByZXF1ZXN0ZWQgdmVyc2lvbiAnICtcbiAgICAgICAgbXNnLnZlcnNpb247XG4gICAgICB0aGlzLl9jb25uZWN0aW9uLl9zdHJlYW0uZGlzY29ubmVjdCh7IF9wZXJtYW5lbnQ6IHRydWUsIF9lcnJvcjogZGVzY3JpcHRpb24gfSk7XG4gICAgICB0aGlzLl9jb25uZWN0aW9uLm9wdGlvbnMub25ERFBWZXJzaW9uTmVnb3RpYXRpb25GYWlsdXJlKGRlc2NyaXB0aW9uKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBjb25uZWN0aW9uIHJlc2V0IGV2ZW50c1xuICAgKi9cbiAgb25SZXNldCgpIHtcbiAgICAvLyBSZXNldCBpcyBjYWxsZWQgZXZlbiBvbiB0aGUgZmlyc3QgY29ubmVjdGlvbiwgc28gdGhpcyBpc1xuICAgIC8vIHRoZSBvbmx5IHBsYWNlIHdlIHNlbmQgdGhpcyBtZXNzYWdlLlxuICAgIGNvbnN0IG1zZyA9IHRoaXMuX2J1aWxkQ29ubmVjdE1lc3NhZ2UoKTtcbiAgICB0aGlzLl9jb25uZWN0aW9uLl9zZW5kKG1zZyk7XG5cbiAgICAvLyBNYXJrIG5vbi1yZXRyeSBjYWxscyBhcyBmYWlsZWQgYW5kIGhhbmRsZSBvdXRzdGFuZGluZyBtZXRob2RzXG4gICAgdGhpcy5faGFuZGxlT3V0c3RhbmRpbmdNZXRob2RzT25SZXNldCgpO1xuXG4gICAgLy8gTm93LCB0byBtaW5pbWl6ZSBzZXR1cCBsYXRlbmN5LCBnbyBhaGVhZCBhbmQgYmxhc3Qgb3V0IGFsbCBvZlxuICAgIC8vIG91ciBwZW5kaW5nIG1ldGhvZHMgYW5kcyBzdWJzY3JpcHRpb25zIGJlZm9yZSB3ZSd2ZSBldmVuIHRha2VuXG4gICAgLy8gdGhlIG5lY2Vzc2FyeSBSVFQgdG8ga25vdyBpZiB3ZSBzdWNjZXNzZnVsbHkgcmVjb25uZWN0ZWQuXG4gICAgdGhpcy5fY29ubmVjdGlvbi5fY2FsbE9uUmVjb25uZWN0QW5kU2VuZEFwcHJvcHJpYXRlT3V0c3RhbmRpbmdNZXRob2RzKCk7XG4gICAgdGhpcy5fcmVzZW5kU3Vic2NyaXB0aW9ucygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEJ1aWxkcyB0aGUgaW5pdGlhbCBjb25uZWN0IG1lc3NhZ2VcbiAgICogQHByaXZhdGVcbiAgICogQHJldHVybnMge09iamVjdH0gVGhlIGNvbm5lY3QgbWVzc2FnZSBvYmplY3RcbiAgICovXG4gIF9idWlsZENvbm5lY3RNZXNzYWdlKCkge1xuICAgIGNvbnN0IG1zZyA9IHsgbXNnOiAnY29ubmVjdCcgfTtcbiAgICBpZiAodGhpcy5fY29ubmVjdGlvbi5fbGFzdFNlc3Npb25JZCkge1xuICAgICAgbXNnLnNlc3Npb24gPSB0aGlzLl9jb25uZWN0aW9uLl9sYXN0U2Vzc2lvbklkO1xuICAgIH1cbiAgICBtc2cudmVyc2lvbiA9IHRoaXMuX2Nvbm5lY3Rpb24uX3ZlcnNpb25TdWdnZXN0aW9uIHx8IHRoaXMuX2Nvbm5lY3Rpb24uX3N1cHBvcnRlZEREUFZlcnNpb25zWzBdO1xuICAgIHRoaXMuX2Nvbm5lY3Rpb24uX3ZlcnNpb25TdWdnZXN0aW9uID0gbXNnLnZlcnNpb247XG4gICAgbXNnLnN1cHBvcnQgPSB0aGlzLl9jb25uZWN0aW9uLl9zdXBwb3J0ZWRERFBWZXJzaW9ucztcbiAgICByZXR1cm4gbXNnO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgb3V0c3RhbmRpbmcgbWV0aG9kcyBkdXJpbmcgYSByZXNldFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2hhbmRsZU91dHN0YW5kaW5nTWV0aG9kc09uUmVzZXQoKSB7XG4gICAgY29uc3QgYmxvY2tzID0gdGhpcy5fY29ubmVjdGlvbi5fb3V0c3RhbmRpbmdNZXRob2RCbG9ja3M7XG4gICAgaWYgKGJsb2Nrcy5sZW5ndGggPT09IDApIHJldHVybjtcblxuICAgIGNvbnN0IGN1cnJlbnRNZXRob2RCbG9jayA9IGJsb2Nrc1swXS5tZXRob2RzO1xuICAgIGJsb2Nrc1swXS5tZXRob2RzID0gY3VycmVudE1ldGhvZEJsb2NrLmZpbHRlcihcbiAgICAgIG1ldGhvZEludm9rZXIgPT4ge1xuICAgICAgICAvLyBNZXRob2RzIHdpdGggJ25vUmV0cnknIG9wdGlvbiBzZXQgYXJlIG5vdCBhbGxvd2VkIHRvIHJlLXNlbmQgYWZ0ZXJcbiAgICAgICAgLy8gcmVjb3ZlcmluZyBkcm9wcGVkIGNvbm5lY3Rpb24uXG4gICAgICAgIGlmIChtZXRob2RJbnZva2VyLnNlbnRNZXNzYWdlICYmIG1ldGhvZEludm9rZXIubm9SZXRyeSkge1xuICAgICAgICAgIG1ldGhvZEludm9rZXIucmVjZWl2ZVJlc3VsdChcbiAgICAgICAgICAgIG5ldyBNZXRlb3IuRXJyb3IoXG4gICAgICAgICAgICAgICdpbnZvY2F0aW9uLWZhaWxlZCcsXG4gICAgICAgICAgICAgICdNZXRob2QgaW52b2NhdGlvbiBtaWdodCBoYXZlIGZhaWxlZCBkdWUgdG8gZHJvcHBlZCBjb25uZWN0aW9uLiAnICtcbiAgICAgICAgICAgICAgJ0ZhaWxpbmcgYmVjYXVzZSBgbm9SZXRyeWAgb3B0aW9uIHdhcyBwYXNzZWQgdG8gTWV0ZW9yLmFwcGx5LidcbiAgICAgICAgICAgIClcbiAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gT25seSBrZWVwIGEgbWV0aG9kIGlmIGl0IHdhc24ndCBzZW50IG9yIGl0J3MgYWxsb3dlZCB0byByZXRyeS5cbiAgICAgICAgcmV0dXJuICEobWV0aG9kSW52b2tlci5zZW50TWVzc2FnZSAmJiBtZXRob2RJbnZva2VyLm5vUmV0cnkpO1xuICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBDbGVhciBlbXB0eSBibG9ja3NcbiAgICBpZiAoYmxvY2tzLmxlbmd0aCA+IDAgJiYgYmxvY2tzWzBdLm1ldGhvZHMubGVuZ3RoID09PSAwKSB7XG4gICAgICBibG9ja3Muc2hpZnQoKTtcbiAgICB9XG5cbiAgICAvLyBSZXNldCBhbGwgbWV0aG9kIGludm9rZXJzIGFzIHVuc2VudFxuICAgIE9iamVjdC52YWx1ZXModGhpcy5fY29ubmVjdGlvbi5fbWV0aG9kSW52b2tlcnMpLmZvckVhY2goaW52b2tlciA9PiB7XG4gICAgICBpbnZva2VyLnNlbnRNZXNzYWdlID0gZmFsc2U7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmVzZW5kcyBhbGwgYWN0aXZlIHN1YnNjcmlwdGlvbnNcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9yZXNlbmRTdWJzY3JpcHRpb25zKCkge1xuICAgIE9iamVjdC5lbnRyaWVzKHRoaXMuX2Nvbm5lY3Rpb24uX3N1YnNjcmlwdGlvbnMpLmZvckVhY2goKFtpZCwgc3ViXSkgPT4ge1xuICAgICAgdGhpcy5fY29ubmVjdGlvbi5fc2VuZFF1ZXVlZCh7XG4gICAgICAgIG1zZzogJ3N1YicsXG4gICAgICAgIGlkOiBpZCxcbiAgICAgICAgbmFtZTogc3ViLm5hbWUsXG4gICAgICAgIHBhcmFtczogc3ViLnBhcmFtc1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbn0iLCJpbXBvcnQgeyBNb25nb0lEIH0gZnJvbSAnbWV0ZW9yL21vbmdvLWlkJztcbmltcG9ydCB7IERpZmZTZXF1ZW5jZSB9IGZyb20gJ21ldGVvci9kaWZmLXNlcXVlbmNlJztcbmltcG9ydCB7IGhhc093biB9IGZyb20gXCJtZXRlb3IvZGRwLWNvbW1vbi91dGlsc1wiO1xuaW1wb3J0IHsgaXNFbXB0eSB9IGZyb20gXCJtZXRlb3IvZGRwLWNvbW1vbi91dGlsc1wiO1xuXG5leHBvcnQgY2xhc3MgRG9jdW1lbnRQcm9jZXNzb3JzIHtcbiAgY29uc3RydWN0b3IoY29ubmVjdGlvbikge1xuICAgIHRoaXMuX2Nvbm5lY3Rpb24gPSBjb25uZWN0aW9uO1xuICB9XG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IFByb2Nlc3MgYW4gJ2FkZGVkJyBtZXNzYWdlIGZyb20gdGhlIHNlcnZlclxuICAgKiBAcGFyYW0ge09iamVjdH0gbXNnIFRoZSBhZGRlZCBtZXNzYWdlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSB1cGRhdGVzIFRoZSB1cGRhdGVzIGFjY3VtdWxhdG9yXG4gICAqL1xuICBhc3luYyBfcHJvY2Vzc19hZGRlZChtc2csIHVwZGF0ZXMpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcy5fY29ubmVjdGlvbjtcbiAgICBjb25zdCBpZCA9IE1vbmdvSUQuaWRQYXJzZShtc2cuaWQpO1xuICAgIGNvbnN0IHNlcnZlckRvYyA9IHNlbGYuX2dldFNlcnZlckRvYyhtc2cuY29sbGVjdGlvbiwgaWQpO1xuXG4gICAgaWYgKHNlcnZlckRvYykge1xuICAgICAgLy8gU29tZSBvdXRzdGFuZGluZyBzdHViIHdyb3RlIGhlcmUuXG4gICAgICBjb25zdCBpc0V4aXN0aW5nID0gc2VydmVyRG9jLmRvY3VtZW50ICE9PSB1bmRlZmluZWQ7XG5cbiAgICAgIHNlcnZlckRvYy5kb2N1bWVudCA9IG1zZy5maWVsZHMgfHwgT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgIHNlcnZlckRvYy5kb2N1bWVudC5faWQgPSBpZDtcblxuICAgICAgaWYgKHNlbGYuX3Jlc2V0U3RvcmVzKSB7XG4gICAgICAgIC8vIER1cmluZyByZWNvbm5lY3QgdGhlIHNlcnZlciBpcyBzZW5kaW5nIGFkZHMgZm9yIGV4aXN0aW5nIGlkcy5cbiAgICAgICAgLy8gQWx3YXlzIHB1c2ggYW4gdXBkYXRlIHNvIHRoYXQgZG9jdW1lbnQgc3RheXMgaW4gdGhlIHN0b3JlIGFmdGVyXG4gICAgICAgIC8vIHJlc2V0LiBVc2UgY3VycmVudCB2ZXJzaW9uIG9mIHRoZSBkb2N1bWVudCBmb3IgdGhpcyB1cGRhdGUsIHNvXG4gICAgICAgIC8vIHRoYXQgc3R1Yi13cml0dGVuIHZhbHVlcyBhcmUgcHJlc2VydmVkLlxuICAgICAgICBjb25zdCBjdXJyZW50RG9jID0gYXdhaXQgc2VsZi5fc3RvcmVzW21zZy5jb2xsZWN0aW9uXS5nZXREb2MobXNnLmlkKTtcbiAgICAgICAgaWYgKGN1cnJlbnREb2MgIT09IHVuZGVmaW5lZCkgbXNnLmZpZWxkcyA9IGN1cnJlbnREb2M7XG5cbiAgICAgICAgc2VsZi5fcHVzaFVwZGF0ZSh1cGRhdGVzLCBtc2cuY29sbGVjdGlvbiwgbXNnKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNFeGlzdGluZykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlcnZlciBzZW50IGFkZCBmb3IgZXhpc3RpbmcgaWQ6ICcgKyBtc2cuaWQpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzZWxmLl9wdXNoVXBkYXRlKHVwZGF0ZXMsIG1zZy5jb2xsZWN0aW9uLCBtc2cpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBQcm9jZXNzIGEgJ2NoYW5nZWQnIG1lc3NhZ2UgZnJvbSB0aGUgc2VydmVyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBtc2cgVGhlIGNoYW5nZWQgbWVzc2FnZVxuICAgKiBAcGFyYW0ge09iamVjdH0gdXBkYXRlcyBUaGUgdXBkYXRlcyBhY2N1bXVsYXRvclxuICAgKi9cbiAgX3Byb2Nlc3NfY2hhbmdlZChtc2csIHVwZGF0ZXMpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcy5fY29ubmVjdGlvbjtcbiAgICBjb25zdCBzZXJ2ZXJEb2MgPSBzZWxmLl9nZXRTZXJ2ZXJEb2MobXNnLmNvbGxlY3Rpb24sIE1vbmdvSUQuaWRQYXJzZShtc2cuaWQpKTtcblxuICAgIGlmIChzZXJ2ZXJEb2MpIHtcbiAgICAgIGlmIChzZXJ2ZXJEb2MuZG9jdW1lbnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlcnZlciBzZW50IGNoYW5nZWQgZm9yIG5vbmV4aXN0aW5nIGlkOiAnICsgbXNnLmlkKTtcbiAgICAgIH1cbiAgICAgIERpZmZTZXF1ZW5jZS5hcHBseUNoYW5nZXMoc2VydmVyRG9jLmRvY3VtZW50LCBtc2cuZmllbGRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZi5fcHVzaFVwZGF0ZSh1cGRhdGVzLCBtc2cuY29sbGVjdGlvbiwgbXNnKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHN1bW1hcnkgUHJvY2VzcyBhICdyZW1vdmVkJyBtZXNzYWdlIGZyb20gdGhlIHNlcnZlclxuICAgKiBAcGFyYW0ge09iamVjdH0gbXNnIFRoZSByZW1vdmVkIG1lc3NhZ2VcbiAgICogQHBhcmFtIHtPYmplY3R9IHVwZGF0ZXMgVGhlIHVwZGF0ZXMgYWNjdW11bGF0b3JcbiAgICovXG4gIF9wcm9jZXNzX3JlbW92ZWQobXNnLCB1cGRhdGVzKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXMuX2Nvbm5lY3Rpb247XG4gICAgY29uc3Qgc2VydmVyRG9jID0gc2VsZi5fZ2V0U2VydmVyRG9jKG1zZy5jb2xsZWN0aW9uLCBNb25nb0lELmlkUGFyc2UobXNnLmlkKSk7XG5cbiAgICBpZiAoc2VydmVyRG9jKSB7XG4gICAgICAvLyBTb21lIG91dHN0YW5kaW5nIHN0dWIgd3JvdGUgaGVyZS5cbiAgICAgIGlmIChzZXJ2ZXJEb2MuZG9jdW1lbnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NlcnZlciBzZW50IHJlbW92ZWQgZm9yIG5vbmV4aXN0aW5nIGlkOicgKyBtc2cuaWQpO1xuICAgICAgfVxuICAgICAgc2VydmVyRG9jLmRvY3VtZW50ID0gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZWxmLl9wdXNoVXBkYXRlKHVwZGF0ZXMsIG1zZy5jb2xsZWN0aW9uLCB7XG4gICAgICAgIG1zZzogJ3JlbW92ZWQnLFxuICAgICAgICBjb2xsZWN0aW9uOiBtc2cuY29sbGVjdGlvbixcbiAgICAgICAgaWQ6IG1zZy5pZFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IFByb2Nlc3MgYSAncmVhZHknIG1lc3NhZ2UgZnJvbSB0aGUgc2VydmVyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBtc2cgVGhlIHJlYWR5IG1lc3NhZ2VcbiAgICogQHBhcmFtIHtPYmplY3R9IHVwZGF0ZXMgVGhlIHVwZGF0ZXMgYWNjdW11bGF0b3JcbiAgICovXG4gIF9wcm9jZXNzX3JlYWR5KG1zZywgdXBkYXRlcykge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzLl9jb25uZWN0aW9uO1xuXG4gICAgLy8gUHJvY2VzcyBcInN1YiByZWFkeVwiIG1lc3NhZ2VzLiBcInN1YiByZWFkeVwiIG1lc3NhZ2VzIGRvbid0IHRha2UgZWZmZWN0XG4gICAgLy8gdW50aWwgYWxsIGN1cnJlbnQgc2VydmVyIGRvY3VtZW50cyBoYXZlIGJlZW4gZmx1c2hlZCB0byB0aGUgbG9jYWxcbiAgICAvLyBkYXRhYmFzZS4gV2UgY2FuIHVzZSBhIHdyaXRlIGZlbmNlIHRvIGltcGxlbWVudCB0aGlzLlxuICAgIG1zZy5zdWJzLmZvckVhY2goKHN1YklkKSA9PiB7XG4gICAgICBzZWxmLl9ydW5XaGVuQWxsU2VydmVyRG9jc0FyZUZsdXNoZWQoKCkgPT4ge1xuICAgICAgICBjb25zdCBzdWJSZWNvcmQgPSBzZWxmLl9zdWJzY3JpcHRpb25zW3N1YklkXTtcbiAgICAgICAgLy8gRGlkIHdlIGFscmVhZHkgdW5zdWJzY3JpYmU/XG4gICAgICAgIGlmICghc3ViUmVjb3JkKSByZXR1cm47XG4gICAgICAgIC8vIERpZCB3ZSBhbHJlYWR5IHJlY2VpdmUgYSByZWFkeSBtZXNzYWdlPyAoT29wcyEpXG4gICAgICAgIGlmIChzdWJSZWNvcmQucmVhZHkpIHJldHVybjtcbiAgICAgICAgc3ViUmVjb3JkLnJlYWR5ID0gdHJ1ZTtcbiAgICAgICAgc3ViUmVjb3JkLnJlYWR5Q2FsbGJhY2sgJiYgc3ViUmVjb3JkLnJlYWR5Q2FsbGJhY2soKTtcbiAgICAgICAgc3ViUmVjb3JkLnJlYWR5RGVwcy5jaGFuZ2VkKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBQcm9jZXNzIGFuICd1cGRhdGVkJyBtZXNzYWdlIGZyb20gdGhlIHNlcnZlclxuICAgKiBAcGFyYW0ge09iamVjdH0gbXNnIFRoZSB1cGRhdGVkIG1lc3NhZ2VcbiAgICogQHBhcmFtIHtPYmplY3R9IHVwZGF0ZXMgVGhlIHVwZGF0ZXMgYWNjdW11bGF0b3JcbiAgICovXG4gIF9wcm9jZXNzX3VwZGF0ZWQobXNnLCB1cGRhdGVzKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXMuX2Nvbm5lY3Rpb247XG4gICAgLy8gUHJvY2VzcyBcIm1ldGhvZCBkb25lXCIgbWVzc2FnZXMuXG4gICAgbXNnLm1ldGhvZHMuZm9yRWFjaCgobWV0aG9kSWQpID0+IHtcbiAgICAgIGNvbnN0IGRvY3MgPSBzZWxmLl9kb2N1bWVudHNXcml0dGVuQnlTdHViW21ldGhvZElkXSB8fCB7fTtcbiAgICAgIE9iamVjdC52YWx1ZXMoZG9jcykuZm9yRWFjaCgod3JpdHRlbikgPT4ge1xuICAgICAgICBjb25zdCBzZXJ2ZXJEb2MgPSBzZWxmLl9nZXRTZXJ2ZXJEb2Mod3JpdHRlbi5jb2xsZWN0aW9uLCB3cml0dGVuLmlkKTtcbiAgICAgICAgaWYgKCFzZXJ2ZXJEb2MpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0xvc3Qgc2VydmVyRG9jIGZvciAnICsgSlNPTi5zdHJpbmdpZnkod3JpdHRlbikpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghc2VydmVyRG9jLndyaXR0ZW5CeVN0dWJzW21ldGhvZElkXSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICdEb2MgJyArXG4gICAgICAgICAgICBKU09OLnN0cmluZ2lmeSh3cml0dGVuKSArXG4gICAgICAgICAgICAnIG5vdCB3cml0dGVuIGJ5IG1ldGhvZCAnICtcbiAgICAgICAgICAgIG1ldGhvZElkXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBkZWxldGUgc2VydmVyRG9jLndyaXR0ZW5CeVN0dWJzW21ldGhvZElkXTtcbiAgICAgICAgaWYgKGlzRW1wdHkoc2VydmVyRG9jLndyaXR0ZW5CeVN0dWJzKSkge1xuICAgICAgICAgIC8vIEFsbCBtZXRob2RzIHdob3NlIHN0dWJzIHdyb3RlIHRoaXMgbWV0aG9kIGhhdmUgY29tcGxldGVkISBXZSBjYW5cbiAgICAgICAgICAvLyBub3cgY29weSB0aGUgc2F2ZWQgZG9jdW1lbnQgdG8gdGhlIGRhdGFiYXNlIChyZXZlcnRpbmcgdGhlIHN0dWInc1xuICAgICAgICAgIC8vIGNoYW5nZSBpZiB0aGUgc2VydmVyIGRpZCBub3Qgd3JpdGUgdG8gdGhpcyBvYmplY3QsIG9yIGFwcGx5aW5nIHRoZVxuICAgICAgICAgIC8vIHNlcnZlcidzIHdyaXRlcyBpZiBpdCBkaWQpLlxuXG4gICAgICAgICAgLy8gVGhpcyBpcyBhIGZha2UgZGRwICdyZXBsYWNlJyBtZXNzYWdlLiAgSXQncyBqdXN0IGZvciB0YWxraW5nXG4gICAgICAgICAgLy8gYmV0d2VlbiBsaXZlZGF0YSBjb25uZWN0aW9ucyBhbmQgbWluaW1vbmdvLiAgKFdlIGhhdmUgdG8gc3RyaW5naWZ5XG4gICAgICAgICAgLy8gdGhlIElEIGJlY2F1c2UgaXQncyBzdXBwb3NlZCB0byBsb29rIGxpa2UgYSB3aXJlIG1lc3NhZ2UuKVxuICAgICAgICAgIHNlbGYuX3B1c2hVcGRhdGUodXBkYXRlcywgd3JpdHRlbi5jb2xsZWN0aW9uLCB7XG4gICAgICAgICAgICBtc2c6ICdyZXBsYWNlJyxcbiAgICAgICAgICAgIGlkOiBNb25nb0lELmlkU3RyaW5naWZ5KHdyaXR0ZW4uaWQpLFxuICAgICAgICAgICAgcmVwbGFjZTogc2VydmVyRG9jLmRvY3VtZW50XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgLy8gQ2FsbCBhbGwgZmx1c2ggY2FsbGJhY2tzLlxuICAgICAgICAgIHNlcnZlckRvYy5mbHVzaENhbGxiYWNrcy5mb3JFYWNoKChjKSA9PiB7XG4gICAgICAgICAgICBjKCk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyBEZWxldGUgdGhpcyBjb21wbGV0ZWQgc2VydmVyRG9jdW1lbnQuIERvbid0IGJvdGhlciB0byBHQyBlbXB0eVxuICAgICAgICAgIC8vIElkTWFwcyBpbnNpZGUgc2VsZi5fc2VydmVyRG9jdW1lbnRzLCBzaW5jZSB0aGVyZSBwcm9iYWJseSBhcmVuJ3RcbiAgICAgICAgICAvLyBtYW55IGNvbGxlY3Rpb25zIGFuZCB0aGV5J2xsIGJlIHdyaXR0ZW4gcmVwZWF0ZWRseS5cbiAgICAgICAgICBzZWxmLl9zZXJ2ZXJEb2N1bWVudHNbd3JpdHRlbi5jb2xsZWN0aW9uXS5yZW1vdmUod3JpdHRlbi5pZCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgZGVsZXRlIHNlbGYuX2RvY3VtZW50c1dyaXR0ZW5CeVN0dWJbbWV0aG9kSWRdO1xuXG4gICAgICAvLyBXZSB3YW50IHRvIGNhbGwgdGhlIGRhdGEtd3JpdHRlbiBjYWxsYmFjaywgYnV0IHdlIGNhbid0IGRvIHNvIHVudGlsIGFsbFxuICAgICAgLy8gY3VycmVudGx5IGJ1ZmZlcmVkIG1lc3NhZ2VzIGFyZSBmbHVzaGVkLlxuICAgICAgY29uc3QgY2FsbGJhY2tJbnZva2VyID0gc2VsZi5fbWV0aG9kSW52b2tlcnNbbWV0aG9kSWRdO1xuICAgICAgaWYgKCFjYWxsYmFja0ludm9rZXIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBjYWxsYmFjayBpbnZva2VyIGZvciBtZXRob2QgJyArIG1ldGhvZElkKTtcbiAgICAgIH1cblxuICAgICAgc2VsZi5fcnVuV2hlbkFsbFNlcnZlckRvY3NBcmVGbHVzaGVkKFxuICAgICAgICAoLi4uYXJncykgPT4gY2FsbGJhY2tJbnZva2VyLmRhdGFWaXNpYmxlKC4uLmFyZ3MpXG4gICAgICApO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IFB1c2ggYW4gdXBkYXRlIHRvIHRoZSBidWZmZXJcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtPYmplY3R9IHVwZGF0ZXMgVGhlIHVwZGF0ZXMgYWNjdW11bGF0b3JcbiAgICogQHBhcmFtIHtTdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gbmFtZVxuICAgKiBAcGFyYW0ge09iamVjdH0gbXNnIFRoZSB1cGRhdGUgbWVzc2FnZVxuICAgKi9cbiAgX3B1c2hVcGRhdGUodXBkYXRlcywgY29sbGVjdGlvbiwgbXNnKSB7XG4gICAgaWYgKCFoYXNPd24uY2FsbCh1cGRhdGVzLCBjb2xsZWN0aW9uKSkge1xuICAgICAgdXBkYXRlc1tjb2xsZWN0aW9uXSA9IFtdO1xuICAgIH1cbiAgICB1cGRhdGVzW2NvbGxlY3Rpb25dLnB1c2gobXNnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBHZXQgYSBzZXJ2ZXIgZG9jdW1lbnQgYnkgY29sbGVjdGlvbiBhbmQgaWRcbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtTdHJpbmd9IGNvbGxlY3Rpb24gVGhlIGNvbGxlY3Rpb24gbmFtZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gaWQgVGhlIGRvY3VtZW50IGlkXG4gICAqIEByZXR1cm5zIHtPYmplY3R8bnVsbH0gVGhlIHNlcnZlciBkb2N1bWVudCBvciBudWxsXG4gICAqL1xuICBfZ2V0U2VydmVyRG9jKGNvbGxlY3Rpb24sIGlkKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXMuX2Nvbm5lY3Rpb247XG4gICAgaWYgKCFoYXNPd24uY2FsbChzZWxmLl9zZXJ2ZXJEb2N1bWVudHMsIGNvbGxlY3Rpb24pKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3Qgc2VydmVyRG9jc0ZvckNvbGxlY3Rpb24gPSBzZWxmLl9zZXJ2ZXJEb2N1bWVudHNbY29sbGVjdGlvbl07XG4gICAgcmV0dXJuIHNlcnZlckRvY3NGb3JDb2xsZWN0aW9uLmdldChpZCkgfHwgbnVsbDtcbiAgfVxufSIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgRERQQ29tbW9uIH0gZnJvbSAnbWV0ZW9yL2RkcC1jb21tb24nO1xuaW1wb3J0IHsgVHJhY2tlciB9IGZyb20gJ21ldGVvci90cmFja2VyJztcbmltcG9ydCB7IEVKU09OIH0gZnJvbSAnbWV0ZW9yL2Vqc29uJztcbmltcG9ydCB7IFJhbmRvbSB9IGZyb20gJ21ldGVvci9yYW5kb20nO1xuaW1wb3J0IHsgTW9uZ29JRCB9IGZyb20gJ21ldGVvci9tb25nby1pZCc7XG5pbXBvcnQgeyBERFAgfSBmcm9tICcuL25hbWVzcGFjZS5qcyc7XG5pbXBvcnQgeyBNZXRob2RJbnZva2VyIH0gZnJvbSAnLi9tZXRob2RfaW52b2tlcic7XG5pbXBvcnQge1xuICBoYXNPd24sXG4gIHNsaWNlLFxuICBrZXlzLFxuICBpc0VtcHR5LFxuICBsYXN0LFxufSBmcm9tIFwibWV0ZW9yL2RkcC1jb21tb24vdXRpbHNcIjtcbmltcG9ydCB7IENvbm5lY3Rpb25TdHJlYW1IYW5kbGVycyB9IGZyb20gJy4vY29ubmVjdGlvbl9zdHJlYW1faGFuZGxlcnMnO1xuaW1wb3J0IHsgTW9uZ29JRE1hcCB9IGZyb20gJy4vbW9uZ29faWRfbWFwJztcbmltcG9ydCB7IE1lc3NhZ2VQcm9jZXNzb3JzIH0gZnJvbSAnLi9tZXNzYWdlX3Byb2Nlc3NvcnMnO1xuaW1wb3J0IHsgRG9jdW1lbnRQcm9jZXNzb3JzIH0gZnJvbSAnLi9kb2N1bWVudF9wcm9jZXNzb3JzJztcblxuLy8gQHBhcmFtIHVybCB7U3RyaW5nfE9iamVjdH0gVVJMIHRvIE1ldGVvciBhcHAsXG4vLyAgIG9yIGFuIG9iamVjdCBhcyBhIHRlc3QgaG9vayAoc2VlIGNvZGUpXG4vLyBPcHRpb25zOlxuLy8gICByZWxvYWRXaXRoT3V0c3RhbmRpbmc6IGlzIGl0IE9LIHRvIHJlbG9hZCBpZiB0aGVyZSBhcmUgb3V0c3RhbmRpbmcgbWV0aG9kcz9cbi8vICAgaGVhZGVyczogZXh0cmEgaGVhZGVycyB0byBzZW5kIG9uIHRoZSB3ZWJzb2NrZXRzIGNvbm5lY3Rpb24sIGZvclxuLy8gICAgIHNlcnZlci10by1zZXJ2ZXIgRERQIG9ubHlcbi8vICAgX3NvY2tqc09wdGlvbnM6IFNwZWNpZmllcyBvcHRpb25zIHRvIHBhc3MgdGhyb3VnaCB0byB0aGUgc29ja2pzIGNsaWVudFxuLy8gICBvbkREUE5lZ290aWF0aW9uVmVyc2lvbkZhaWx1cmU6IGNhbGxiYWNrIHdoZW4gdmVyc2lvbiBuZWdvdGlhdGlvbiBmYWlscy5cbi8vXG4vLyBYWFggVGhlcmUgc2hvdWxkIGJlIGEgd2F5IHRvIGRlc3Ryb3kgYSBERFAgY29ubmVjdGlvbiwgY2F1c2luZyBhbGxcbi8vIG91dHN0YW5kaW5nIG1ldGhvZCBjYWxscyB0byBmYWlsLlxuLy9cbi8vIFhYWCBPdXIgY3VycmVudCB3YXkgb2YgaGFuZGxpbmcgZmFpbHVyZSBhbmQgcmVjb25uZWN0aW9uIGlzIGdyZWF0XG4vLyBmb3IgYW4gYXBwICh3aGVyZSB3ZSB3YW50IHRvIHRvbGVyYXRlIGJlaW5nIGRpc2Nvbm5lY3RlZCBhcyBhblxuLy8gZXhwZWN0IHN0YXRlLCBhbmQga2VlcCB0cnlpbmcgZm9yZXZlciB0byByZWNvbm5lY3QpIGJ1dCBjdW1iZXJzb21lXG4vLyBmb3Igc29tZXRoaW5nIGxpa2UgYSBjb21tYW5kIGxpbmUgdG9vbCB0aGF0IHdhbnRzIHRvIG1ha2UgYVxuLy8gY29ubmVjdGlvbiwgY2FsbCBhIG1ldGhvZCwgYW5kIHByaW50IGFuIGVycm9yIGlmIGNvbm5lY3Rpb25cbi8vIGZhaWxzLiBXZSBzaG91bGQgaGF2ZSBiZXR0ZXIgdXNhYmlsaXR5IGluIHRoZSBsYXR0ZXIgY2FzZSAod2hpbGVcbi8vIHN0aWxsIHRyYW5zcGFyZW50bHkgcmVjb25uZWN0aW5nIGlmIGl0J3MganVzdCBhIHRyYW5zaWVudCBmYWlsdXJlXG4vLyBvciB0aGUgc2VydmVyIG1pZ3JhdGluZyB1cykuXG5leHBvcnQgY2xhc3MgQ29ubmVjdGlvbiB7XG4gIGNvbnN0cnVjdG9yKHVybCwgb3B0aW9ucykge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyA9IHtcbiAgICAgIG9uQ29ubmVjdGVkKCkge30sXG4gICAgICBvbkREUFZlcnNpb25OZWdvdGlhdGlvbkZhaWx1cmUoZGVzY3JpcHRpb24pIHtcbiAgICAgICAgTWV0ZW9yLl9kZWJ1ZyhkZXNjcmlwdGlvbik7XG4gICAgICB9LFxuICAgICAgaGVhcnRiZWF0SW50ZXJ2YWw6IDE3NTAwLFxuICAgICAgaGVhcnRiZWF0VGltZW91dDogMTUwMDAsXG4gICAgICBucG1GYXllT3B0aW9uczogT2JqZWN0LmNyZWF0ZShudWxsKSxcbiAgICAgIC8vIFRoZXNlIG9wdGlvbnMgYXJlIG9ubHkgZm9yIHRlc3RpbmcuXG4gICAgICByZWxvYWRXaXRoT3V0c3RhbmRpbmc6IGZhbHNlLFxuICAgICAgc3VwcG9ydGVkRERQVmVyc2lvbnM6IEREUENvbW1vbi5TVVBQT1JURURfRERQX1ZFUlNJT05TLFxuICAgICAgcmV0cnk6IHRydWUsXG4gICAgICByZXNwb25kVG9QaW5nczogdHJ1ZSxcbiAgICAgIC8vIFdoZW4gdXBkYXRlcyBhcmUgY29taW5nIHdpdGhpbiB0aGlzIG1zIGludGVydmFsLCBiYXRjaCB0aGVtIHRvZ2V0aGVyLlxuICAgICAgYnVmZmVyZWRXcml0ZXNJbnRlcnZhbDogNSxcbiAgICAgIC8vIEZsdXNoIGJ1ZmZlcnMgaW1tZWRpYXRlbHkgaWYgd3JpdGVzIGFyZSBoYXBwZW5pbmcgY29udGludW91c2x5IGZvciBtb3JlIHRoYW4gdGhpcyBtYW55IG1zLlxuICAgICAgYnVmZmVyZWRXcml0ZXNNYXhBZ2U6IDUwMCxcblxuICAgICAgLi4ub3B0aW9uc1xuICAgIH07XG5cbiAgICAvLyBJZiBzZXQsIGNhbGxlZCB3aGVuIHdlIHJlY29ubmVjdCwgcXVldWluZyBtZXRob2QgY2FsbHMgX2JlZm9yZV8gdGhlXG4gICAgLy8gZXhpc3Rpbmcgb3V0c3RhbmRpbmcgb25lcy5cbiAgICAvLyBOT1RFOiBUaGlzIGZlYXR1cmUgaGFzIGJlZW4gcHJlc2VydmVkIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eS4gVGhlXG4gICAgLy8gcHJlZmVycmVkIG1ldGhvZCBvZiBzZXR0aW5nIGEgY2FsbGJhY2sgb24gcmVjb25uZWN0IGlzIHRvIHVzZVxuICAgIC8vIEREUC5vblJlY29ubmVjdC5cbiAgICBzZWxmLm9uUmVjb25uZWN0ID0gbnVsbDtcblxuICAgIC8vIGFzIGEgdGVzdCBob29rLCBhbGxvdyBwYXNzaW5nIGEgc3RyZWFtIGluc3RlYWQgb2YgYSB1cmwuXG4gICAgaWYgKHR5cGVvZiB1cmwgPT09ICdvYmplY3QnKSB7XG4gICAgICBzZWxmLl9zdHJlYW0gPSB1cmw7XG4gICAgfSBlbHNlIHtcbiAgICAgIGltcG9ydCB7IENsaWVudFN0cmVhbSB9IGZyb20gXCJtZXRlb3Ivc29ja2V0LXN0cmVhbS1jbGllbnRcIjtcblxuICAgICAgc2VsZi5fc3RyZWFtID0gbmV3IENsaWVudFN0cmVhbSh1cmwsIHtcbiAgICAgICAgcmV0cnk6IG9wdGlvbnMucmV0cnksXG4gICAgICAgIENvbm5lY3Rpb25FcnJvcjogRERQLkNvbm5lY3Rpb25FcnJvcixcbiAgICAgICAgaGVhZGVyczogb3B0aW9ucy5oZWFkZXJzLFxuICAgICAgICBfc29ja2pzT3B0aW9uczogb3B0aW9ucy5fc29ja2pzT3B0aW9ucyxcbiAgICAgICAgLy8gVXNlZCB0byBrZWVwIHNvbWUgdGVzdHMgcXVpZXQsIG9yIGZvciBvdGhlciBjYXNlcyBpbiB3aGljaFxuICAgICAgICAvLyB0aGUgcmlnaHQgdGhpbmcgdG8gZG8gd2l0aCBjb25uZWN0aW9uIGVycm9ycyBpcyB0byBzaWxlbnRseVxuICAgICAgICAvLyBmYWlsIChlLmcuIHNlbmRpbmcgcGFja2FnZSB1c2FnZSBzdGF0cykuIEF0IHNvbWUgcG9pbnQgd2VcbiAgICAgICAgLy8gc2hvdWxkIGhhdmUgYSByZWFsIEFQSSBmb3IgaGFuZGxpbmcgY2xpZW50LXN0cmVhbS1sZXZlbFxuICAgICAgICAvLyBlcnJvcnMuXG4gICAgICAgIF9kb250UHJpbnRFcnJvcnM6IG9wdGlvbnMuX2RvbnRQcmludEVycm9ycyxcbiAgICAgICAgY29ubmVjdFRpbWVvdXRNczogb3B0aW9ucy5jb25uZWN0VGltZW91dE1zLFxuICAgICAgICBucG1GYXllT3B0aW9uczogb3B0aW9ucy5ucG1GYXllT3B0aW9uc1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2VsZi5fbGFzdFNlc3Npb25JZCA9IG51bGw7XG4gICAgc2VsZi5fdmVyc2lvblN1Z2dlc3Rpb24gPSBudWxsOyAvLyBUaGUgbGFzdCBwcm9wb3NlZCBERFAgdmVyc2lvbi5cbiAgICBzZWxmLl92ZXJzaW9uID0gbnVsbDsgLy8gVGhlIEREUCB2ZXJzaW9uIGFncmVlZCBvbiBieSBjbGllbnQgYW5kIHNlcnZlci5cbiAgICBzZWxmLl9zdG9yZXMgPSBPYmplY3QuY3JlYXRlKG51bGwpOyAvLyBuYW1lIC0+IG9iamVjdCB3aXRoIG1ldGhvZHNcbiAgICBzZWxmLl9tZXRob2RIYW5kbGVycyA9IE9iamVjdC5jcmVhdGUobnVsbCk7IC8vIG5hbWUgLT4gZnVuY1xuICAgIHNlbGYuX25leHRNZXRob2RJZCA9IDE7XG4gICAgc2VsZi5fc3VwcG9ydGVkRERQVmVyc2lvbnMgPSBvcHRpb25zLnN1cHBvcnRlZEREUFZlcnNpb25zO1xuXG4gICAgc2VsZi5faGVhcnRiZWF0SW50ZXJ2YWwgPSBvcHRpb25zLmhlYXJ0YmVhdEludGVydmFsO1xuICAgIHNlbGYuX2hlYXJ0YmVhdFRpbWVvdXQgPSBvcHRpb25zLmhlYXJ0YmVhdFRpbWVvdXQ7XG5cbiAgICAvLyBUcmFja3MgbWV0aG9kcyB3aGljaCB0aGUgdXNlciBoYXMgdHJpZWQgdG8gY2FsbCBidXQgd2hpY2ggaGF2ZSBub3QgeWV0XG4gICAgLy8gY2FsbGVkIHRoZWlyIHVzZXIgY2FsbGJhY2sgKGllLCB0aGV5IGFyZSB3YWl0aW5nIG9uIHRoZWlyIHJlc3VsdCBvciBmb3IgYWxsXG4gICAgLy8gb2YgdGhlaXIgd3JpdGVzIHRvIGJlIHdyaXR0ZW4gdG8gdGhlIGxvY2FsIGNhY2hlKS4gTWFwIGZyb20gbWV0aG9kIElEIHRvXG4gICAgLy8gTWV0aG9kSW52b2tlciBvYmplY3QuXG4gICAgc2VsZi5fbWV0aG9kSW52b2tlcnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gICAgLy8gVHJhY2tzIG1ldGhvZHMgd2hpY2ggdGhlIHVzZXIgaGFzIGNhbGxlZCBidXQgd2hvc2UgcmVzdWx0IG1lc3NhZ2VzIGhhdmUgbm90XG4gICAgLy8gYXJyaXZlZCB5ZXQuXG4gICAgLy9cbiAgICAvLyBfb3V0c3RhbmRpbmdNZXRob2RCbG9ja3MgaXMgYW4gYXJyYXkgb2YgYmxvY2tzIG9mIG1ldGhvZHMuIEVhY2ggYmxvY2tcbiAgICAvLyByZXByZXNlbnRzIGEgc2V0IG9mIG1ldGhvZHMgdGhhdCBjYW4gcnVuIGF0IHRoZSBzYW1lIHRpbWUuIFRoZSBmaXJzdCBibG9ja1xuICAgIC8vIHJlcHJlc2VudHMgdGhlIG1ldGhvZHMgd2hpY2ggYXJlIGN1cnJlbnRseSBpbiBmbGlnaHQ7IHN1YnNlcXVlbnQgYmxvY2tzXG4gICAgLy8gbXVzdCB3YWl0IGZvciBwcmV2aW91cyBibG9ja3MgdG8gYmUgZnVsbHkgZmluaXNoZWQgYmVmb3JlIHRoZXkgY2FuIGJlIHNlbnRcbiAgICAvLyB0byB0aGUgc2VydmVyLlxuICAgIC8vXG4gICAgLy8gRWFjaCBibG9jayBpcyBhbiBvYmplY3Qgd2l0aCB0aGUgZm9sbG93aW5nIGZpZWxkczpcbiAgICAvLyAtIG1ldGhvZHM6IGEgbGlzdCBvZiBNZXRob2RJbnZva2VyIG9iamVjdHNcbiAgICAvLyAtIHdhaXQ6IGEgYm9vbGVhbjsgaWYgdHJ1ZSwgdGhpcyBibG9jayBoYWQgYSBzaW5nbGUgbWV0aG9kIGludm9rZWQgd2l0aFxuICAgIC8vICAgICAgICAgdGhlIFwid2FpdFwiIG9wdGlvblxuICAgIC8vXG4gICAgLy8gVGhlcmUgd2lsbCBuZXZlciBiZSBhZGphY2VudCBibG9ja3Mgd2l0aCB3YWl0PWZhbHNlLCBiZWNhdXNlIHRoZSBvbmx5IHRoaW5nXG4gICAgLy8gdGhhdCBtYWtlcyBtZXRob2RzIG5lZWQgdG8gYmUgc2VyaWFsaXplZCBpcyBhIHdhaXQgbWV0aG9kLlxuICAgIC8vXG4gICAgLy8gTWV0aG9kcyBhcmUgcmVtb3ZlZCBmcm9tIHRoZSBmaXJzdCBibG9jayB3aGVuIHRoZWlyIFwicmVzdWx0XCIgaXNcbiAgICAvLyByZWNlaXZlZC4gVGhlIGVudGlyZSBmaXJzdCBibG9jayBpcyBvbmx5IHJlbW92ZWQgd2hlbiBhbGwgb2YgdGhlIGluLWZsaWdodFxuICAgIC8vIG1ldGhvZHMgaGF2ZSByZWNlaXZlZCB0aGVpciByZXN1bHRzIChzbyB0aGUgXCJtZXRob2RzXCIgbGlzdCBpcyBlbXB0eSkgKkFORCpcbiAgICAvLyBhbGwgb2YgdGhlIGRhdGEgd3JpdHRlbiBieSB0aG9zZSBtZXRob2RzIGFyZSB2aXNpYmxlIGluIHRoZSBsb2NhbCBjYWNoZS4gU29cbiAgICAvLyBpdCBpcyBwb3NzaWJsZSBmb3IgdGhlIGZpcnN0IGJsb2NrJ3MgbWV0aG9kcyBsaXN0IHRvIGJlIGVtcHR5LCBpZiB3ZSBhcmVcbiAgICAvLyBzdGlsbCB3YWl0aW5nIGZvciBzb21lIG9iamVjdHMgdG8gcXVpZXNjZS5cbiAgICAvL1xuICAgIC8vIEV4YW1wbGU6XG4gICAgLy8gIF9vdXRzdGFuZGluZ01ldGhvZEJsb2NrcyA9IFtcbiAgICAvLyAgICB7d2FpdDogZmFsc2UsIG1ldGhvZHM6IFtdfSxcbiAgICAvLyAgICB7d2FpdDogdHJ1ZSwgbWV0aG9kczogWzxNZXRob2RJbnZva2VyIGZvciAnbG9naW4nPl19LFxuICAgIC8vICAgIHt3YWl0OiBmYWxzZSwgbWV0aG9kczogWzxNZXRob2RJbnZva2VyIGZvciAnZm9vJz4sXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgPE1ldGhvZEludm9rZXIgZm9yICdiYXInPl19XVxuICAgIC8vIFRoaXMgbWVhbnMgdGhhdCB0aGVyZSB3ZXJlIHNvbWUgbWV0aG9kcyB3aGljaCB3ZXJlIHNlbnQgdG8gdGhlIHNlcnZlciBhbmRcbiAgICAvLyB3aGljaCBoYXZlIHJldHVybmVkIHRoZWlyIHJlc3VsdHMsIGJ1dCBzb21lIG9mIHRoZSBkYXRhIHdyaXR0ZW4gYnlcbiAgICAvLyB0aGUgbWV0aG9kcyBtYXkgbm90IGJlIHZpc2libGUgaW4gdGhlIGxvY2FsIGNhY2hlLiBPbmNlIGFsbCB0aGF0IGRhdGEgaXNcbiAgICAvLyB2aXNpYmxlLCB3ZSB3aWxsIHNlbmQgYSAnbG9naW4nIG1ldGhvZC4gT25jZSB0aGUgbG9naW4gbWV0aG9kIGhhcyByZXR1cm5lZFxuICAgIC8vIGFuZCBhbGwgdGhlIGRhdGEgaXMgdmlzaWJsZSAoaW5jbHVkaW5nIHJlLXJ1bm5pbmcgc3VicyBpZiB1c2VySWQgY2hhbmdlcyksXG4gICAgLy8gd2Ugd2lsbCBzZW5kIHRoZSAnZm9vJyBhbmQgJ2JhcicgbWV0aG9kcyBpbiBwYXJhbGxlbC5cbiAgICBzZWxmLl9vdXRzdGFuZGluZ01ldGhvZEJsb2NrcyA9IFtdO1xuXG4gICAgLy8gbWV0aG9kIElEIC0+IGFycmF5IG9mIG9iamVjdHMgd2l0aCBrZXlzICdjb2xsZWN0aW9uJyBhbmQgJ2lkJywgbGlzdGluZ1xuICAgIC8vIGRvY3VtZW50cyB3cml0dGVuIGJ5IGEgZ2l2ZW4gbWV0aG9kJ3Mgc3R1Yi4ga2V5cyBhcmUgYXNzb2NpYXRlZCB3aXRoXG4gICAgLy8gbWV0aG9kcyB3aG9zZSBzdHViIHdyb3RlIGF0IGxlYXN0IG9uZSBkb2N1bWVudCwgYW5kIHdob3NlIGRhdGEtZG9uZSBtZXNzYWdlXG4gICAgLy8gaGFzIG5vdCB5ZXQgYmVlbiByZWNlaXZlZC5cbiAgICBzZWxmLl9kb2N1bWVudHNXcml0dGVuQnlTdHViID0ge307XG4gICAgLy8gY29sbGVjdGlvbiAtPiBJZE1hcCBvZiBcInNlcnZlciBkb2N1bWVudFwiIG9iamVjdC4gQSBcInNlcnZlciBkb2N1bWVudFwiIGhhczpcbiAgICAvLyAtIFwiZG9jdW1lbnRcIjogdGhlIHZlcnNpb24gb2YgdGhlIGRvY3VtZW50IGFjY29yZGluZyB0aGVcbiAgICAvLyAgIHNlcnZlciAoaWUsIHRoZSBzbmFwc2hvdCBiZWZvcmUgYSBzdHViIHdyb3RlIGl0LCBhbWVuZGVkIGJ5IGFueSBjaGFuZ2VzXG4gICAgLy8gICByZWNlaXZlZCBmcm9tIHRoZSBzZXJ2ZXIpXG4gICAgLy8gICBJdCBpcyB1bmRlZmluZWQgaWYgd2UgdGhpbmsgdGhlIGRvY3VtZW50IGRvZXMgbm90IGV4aXN0XG4gICAgLy8gLSBcIndyaXR0ZW5CeVN0dWJzXCI6IGEgc2V0IG9mIG1ldGhvZCBJRHMgd2hvc2Ugc3R1YnMgd3JvdGUgdG8gdGhlIGRvY3VtZW50XG4gICAgLy8gICB3aG9zZSBcImRhdGEgZG9uZVwiIG1lc3NhZ2VzIGhhdmUgbm90IHlldCBiZWVuIHByb2Nlc3NlZFxuICAgIHNlbGYuX3NlcnZlckRvY3VtZW50cyA9IHt9O1xuXG4gICAgLy8gQXJyYXkgb2YgY2FsbGJhY2tzIHRvIGJlIGNhbGxlZCBhZnRlciB0aGUgbmV4dCB1cGRhdGUgb2YgdGhlIGxvY2FsXG4gICAgLy8gY2FjaGUuIFVzZWQgZm9yOlxuICAgIC8vICAtIENhbGxpbmcgbWV0aG9kSW52b2tlci5kYXRhVmlzaWJsZSBhbmQgc3ViIHJlYWR5IGNhbGxiYWNrcyBhZnRlclxuICAgIC8vICAgIHRoZSByZWxldmFudCBkYXRhIGlzIGZsdXNoZWQuXG4gICAgLy8gIC0gSW52b2tpbmcgdGhlIGNhbGxiYWNrcyBvZiBcImhhbGYtZmluaXNoZWRcIiBtZXRob2RzIGFmdGVyIHJlY29ubmVjdFxuICAgIC8vICAgIHF1aWVzY2VuY2UuIFNwZWNpZmljYWxseSwgbWV0aG9kcyB3aG9zZSByZXN1bHQgd2FzIHJlY2VpdmVkIG92ZXIgdGhlIG9sZFxuICAgIC8vICAgIGNvbm5lY3Rpb24gKHNvIHdlIGRvbid0IHJlLXNlbmQgaXQpIGJ1dCB3aG9zZSBkYXRhIGhhZCBub3QgYmVlbiBtYWRlXG4gICAgLy8gICAgdmlzaWJsZS5cbiAgICBzZWxmLl9hZnRlclVwZGF0ZUNhbGxiYWNrcyA9IFtdO1xuXG4gICAgLy8gSW4gdHdvIGNvbnRleHRzLCB3ZSBidWZmZXIgYWxsIGluY29taW5nIGRhdGEgbWVzc2FnZXMgYW5kIHRoZW4gcHJvY2VzcyB0aGVtXG4gICAgLy8gYWxsIGF0IG9uY2UgaW4gYSBzaW5nbGUgdXBkYXRlOlxuICAgIC8vICAgLSBEdXJpbmcgcmVjb25uZWN0LCB3ZSBidWZmZXIgYWxsIGRhdGEgbWVzc2FnZXMgdW50aWwgYWxsIHN1YnMgdGhhdCBoYWRcbiAgICAvLyAgICAgYmVlbiByZWFkeSBiZWZvcmUgcmVjb25uZWN0IGFyZSByZWFkeSBhZ2FpbiwgYW5kIGFsbCBtZXRob2RzIHRoYXQgYXJlXG4gICAgLy8gICAgIGFjdGl2ZSBoYXZlIHJldHVybmVkIHRoZWlyIFwiZGF0YSBkb25lIG1lc3NhZ2VcIjsgdGhlblxuICAgIC8vICAgLSBEdXJpbmcgdGhlIGV4ZWN1dGlvbiBvZiBhIFwid2FpdFwiIG1ldGhvZCwgd2UgYnVmZmVyIGFsbCBkYXRhIG1lc3NhZ2VzXG4gICAgLy8gICAgIHVudGlsIHRoZSB3YWl0IG1ldGhvZCBnZXRzIGl0cyBcImRhdGEgZG9uZVwiIG1lc3NhZ2UuIChJZiB0aGUgd2FpdCBtZXRob2RcbiAgICAvLyAgICAgb2NjdXJzIGR1cmluZyByZWNvbm5lY3QsIGl0IGRvZXNuJ3QgZ2V0IGFueSBzcGVjaWFsIGhhbmRsaW5nLilcbiAgICAvLyBhbGwgZGF0YSBtZXNzYWdlcyBhcmUgcHJvY2Vzc2VkIGluIG9uZSB1cGRhdGUuXG4gICAgLy9cbiAgICAvLyBUaGUgZm9sbG93aW5nIGZpZWxkcyBhcmUgdXNlZCBmb3IgdGhpcyBcInF1aWVzY2VuY2VcIiBwcm9jZXNzLlxuXG4gICAgLy8gVGhpcyBidWZmZXJzIHRoZSBtZXNzYWdlcyB0aGF0IGFyZW4ndCBiZWluZyBwcm9jZXNzZWQgeWV0LlxuICAgIHNlbGYuX21lc3NhZ2VzQnVmZmVyZWRVbnRpbFF1aWVzY2VuY2UgPSBbXTtcbiAgICAvLyBNYXAgZnJvbSBtZXRob2QgSUQgLT4gdHJ1ZS4gTWV0aG9kcyBhcmUgcmVtb3ZlZCBmcm9tIHRoaXMgd2hlbiB0aGVpclxuICAgIC8vIFwiZGF0YSBkb25lXCIgbWVzc2FnZSBpcyByZWNlaXZlZCwgYW5kIHdlIHdpbGwgbm90IHF1aWVzY2UgdW50aWwgaXQgaXNcbiAgICAvLyBlbXB0eS5cbiAgICBzZWxmLl9tZXRob2RzQmxvY2tpbmdRdWllc2NlbmNlID0ge307XG4gICAgLy8gbWFwIGZyb20gc3ViIElEIC0+IHRydWUgZm9yIHN1YnMgdGhhdCB3ZXJlIHJlYWR5IChpZSwgY2FsbGVkIHRoZSBzdWJcbiAgICAvLyByZWFkeSBjYWxsYmFjaykgYmVmb3JlIHJlY29ubmVjdCBidXQgaGF2ZW4ndCBiZWNvbWUgcmVhZHkgYWdhaW4geWV0XG4gICAgc2VsZi5fc3Vic0JlaW5nUmV2aXZlZCA9IHt9OyAvLyBtYXAgZnJvbSBzdWIuX2lkIC0+IHRydWVcbiAgICAvLyBpZiB0cnVlLCB0aGUgbmV4dCBkYXRhIHVwZGF0ZSBzaG91bGQgcmVzZXQgYWxsIHN0b3Jlcy4gKHNldCBkdXJpbmdcbiAgICAvLyByZWNvbm5lY3QuKVxuICAgIHNlbGYuX3Jlc2V0U3RvcmVzID0gZmFsc2U7XG5cbiAgICAvLyBuYW1lIC0+IGFycmF5IG9mIHVwZGF0ZXMgZm9yICh5ZXQgdG8gYmUgY3JlYXRlZCkgY29sbGVjdGlvbnNcbiAgICBzZWxmLl91cGRhdGVzRm9yVW5rbm93blN0b3JlcyA9IHt9O1xuICAgIC8vIGlmIHdlJ3JlIGJsb2NraW5nIGEgbWlncmF0aW9uLCB0aGUgcmV0cnkgZnVuY1xuICAgIHNlbGYuX3JldHJ5TWlncmF0ZSA9IG51bGw7XG4gICAgLy8gQ29sbGVjdGlvbiBuYW1lIC0+IGFycmF5IG9mIG1lc3NhZ2VzLlxuICAgIHNlbGYuX2J1ZmZlcmVkV3JpdGVzID0ge307XG4gICAgLy8gV2hlbiBjdXJyZW50IGJ1ZmZlciBvZiB1cGRhdGVzIG11c3QgYmUgZmx1c2hlZCBhdCwgaW4gbXMgdGltZXN0YW1wLlxuICAgIHNlbGYuX2J1ZmZlcmVkV3JpdGVzRmx1c2hBdCA9IG51bGw7XG4gICAgLy8gVGltZW91dCBoYW5kbGUgZm9yIHRoZSBuZXh0IHByb2Nlc3Npbmcgb2YgYWxsIHBlbmRpbmcgd3JpdGVzXG4gICAgc2VsZi5fYnVmZmVyZWRXcml0ZXNGbHVzaEhhbmRsZSA9IG51bGw7XG5cbiAgICBzZWxmLl9idWZmZXJlZFdyaXRlc0ludGVydmFsID0gb3B0aW9ucy5idWZmZXJlZFdyaXRlc0ludGVydmFsO1xuICAgIHNlbGYuX2J1ZmZlcmVkV3JpdGVzTWF4QWdlID0gb3B0aW9ucy5idWZmZXJlZFdyaXRlc01heEFnZTtcblxuICAgIC8vIG1ldGFkYXRhIGZvciBzdWJzY3JpcHRpb25zLiAgTWFwIGZyb20gc3ViIElEIHRvIG9iamVjdCB3aXRoIGtleXM6XG4gICAgLy8gICAtIGlkXG4gICAgLy8gICAtIG5hbWVcbiAgICAvLyAgIC0gcGFyYW1zXG4gICAgLy8gICAtIGluYWN0aXZlIChpZiB0cnVlLCB3aWxsIGJlIGNsZWFuZWQgdXAgaWYgbm90IHJldXNlZCBpbiByZS1ydW4pXG4gICAgLy8gICAtIHJlYWR5IChoYXMgdGhlICdyZWFkeScgbWVzc2FnZSBiZWVuIHJlY2VpdmVkPylcbiAgICAvLyAgIC0gcmVhZHlDYWxsYmFjayAoYW4gb3B0aW9uYWwgY2FsbGJhY2sgdG8gY2FsbCB3aGVuIHJlYWR5KVxuICAgIC8vICAgLSBlcnJvckNhbGxiYWNrIChhbiBvcHRpb25hbCBjYWxsYmFjayB0byBjYWxsIGlmIHRoZSBzdWIgdGVybWluYXRlcyB3aXRoXG4gICAgLy8gICAgICAgICAgICAgICAgICAgIGFuIGVycm9yLCBYWFggQ09NUEFUIFdJVEggMS4wLjMuMSlcbiAgICAvLyAgIC0gc3RvcENhbGxiYWNrIChhbiBvcHRpb25hbCBjYWxsYmFjayB0byBjYWxsIHdoZW4gdGhlIHN1YiB0ZXJtaW5hdGVzXG4gICAgLy8gICAgIGZvciBhbnkgcmVhc29uLCB3aXRoIGFuIGVycm9yIGFyZ3VtZW50IGlmIGFuIGVycm9yIHRyaWdnZXJlZCB0aGUgc3RvcClcbiAgICBzZWxmLl9zdWJzY3JpcHRpb25zID0ge307XG5cbiAgICAvLyBSZWFjdGl2ZSB1c2VySWQuXG4gICAgc2VsZi5fdXNlcklkID0gbnVsbDtcbiAgICBzZWxmLl91c2VySWREZXBzID0gbmV3IFRyYWNrZXIuRGVwZW5kZW5jeSgpO1xuXG4gICAgLy8gQmxvY2sgYXV0by1yZWxvYWQgd2hpbGUgd2UncmUgd2FpdGluZyBmb3IgbWV0aG9kIHJlc3BvbnNlcy5cbiAgICBpZiAoTWV0ZW9yLmlzQ2xpZW50ICYmXG4gICAgICBQYWNrYWdlLnJlbG9hZCAmJlxuICAgICAgISBvcHRpb25zLnJlbG9hZFdpdGhPdXRzdGFuZGluZykge1xuICAgICAgUGFja2FnZS5yZWxvYWQuUmVsb2FkLl9vbk1pZ3JhdGUocmV0cnkgPT4ge1xuICAgICAgICBpZiAoISBzZWxmLl9yZWFkeVRvTWlncmF0ZSgpKSB7XG4gICAgICAgICAgc2VsZi5fcmV0cnlNaWdyYXRlID0gcmV0cnk7XG4gICAgICAgICAgcmV0dXJuIFtmYWxzZV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFt0cnVlXTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5fc3RyZWFtSGFuZGxlcnMgPSBuZXcgQ29ubmVjdGlvblN0cmVhbUhhbmRsZXJzKHRoaXMpO1xuXG4gICAgY29uc3Qgb25EaXNjb25uZWN0ID0gKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuX2hlYXJ0YmVhdCkge1xuICAgICAgICB0aGlzLl9oZWFydGJlYXQuc3RvcCgpO1xuICAgICAgICB0aGlzLl9oZWFydGJlYXQgPSBudWxsO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAoTWV0ZW9yLmlzU2VydmVyKSB7XG4gICAgICB0aGlzLl9zdHJlYW0ub24oXG4gICAgICAgICdtZXNzYWdlJyxcbiAgICAgICAgTWV0ZW9yLmJpbmRFbnZpcm9ubWVudChcbiAgICAgICAgICBtc2cgPT4gdGhpcy5fc3RyZWFtSGFuZGxlcnMub25NZXNzYWdlKG1zZyksXG4gICAgICAgICAgJ2hhbmRsaW5nIEREUCBtZXNzYWdlJ1xuICAgICAgICApXG4gICAgICApO1xuICAgICAgdGhpcy5fc3RyZWFtLm9uKFxuICAgICAgICAncmVzZXQnLFxuICAgICAgICBNZXRlb3IuYmluZEVudmlyb25tZW50KFxuICAgICAgICAgICgpID0+IHRoaXMuX3N0cmVhbUhhbmRsZXJzLm9uUmVzZXQoKSxcbiAgICAgICAgICAnaGFuZGxpbmcgRERQIHJlc2V0J1xuICAgICAgICApXG4gICAgICApO1xuICAgICAgdGhpcy5fc3RyZWFtLm9uKFxuICAgICAgICAnZGlzY29ubmVjdCcsXG4gICAgICAgIE1ldGVvci5iaW5kRW52aXJvbm1lbnQob25EaXNjb25uZWN0LCAnaGFuZGxpbmcgRERQIGRpc2Nvbm5lY3QnKVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fc3RyZWFtLm9uKCdtZXNzYWdlJywgbXNnID0+IHRoaXMuX3N0cmVhbUhhbmRsZXJzLm9uTWVzc2FnZShtc2cpKTtcbiAgICAgIHRoaXMuX3N0cmVhbS5vbigncmVzZXQnLCAoKSA9PiB0aGlzLl9zdHJlYW1IYW5kbGVycy5vblJlc2V0KCkpO1xuICAgICAgdGhpcy5fc3RyZWFtLm9uKCdkaXNjb25uZWN0Jywgb25EaXNjb25uZWN0KTtcbiAgICB9XG5cbiAgICB0aGlzLl9tZXNzYWdlUHJvY2Vzc29ycyA9IG5ldyBNZXNzYWdlUHJvY2Vzc29ycyh0aGlzKTtcblxuICAgIC8vIEV4cG9zZSBtZXNzYWdlIHByb2Nlc3NvciBtZXRob2RzIHRvIG1haW50YWluIGJhY2t3YXJkIGNvbXBhdGliaWxpdHlcbiAgICB0aGlzLl9saXZlZGF0YV9jb25uZWN0ZWQgPSAobXNnKSA9PiB0aGlzLl9tZXNzYWdlUHJvY2Vzc29ycy5fbGl2ZWRhdGFfY29ubmVjdGVkKG1zZyk7XG4gICAgdGhpcy5fbGl2ZWRhdGFfZGF0YSA9IChtc2cpID0+IHRoaXMuX21lc3NhZ2VQcm9jZXNzb3JzLl9saXZlZGF0YV9kYXRhKG1zZyk7XG4gICAgdGhpcy5fbGl2ZWRhdGFfbm9zdWIgPSAobXNnKSA9PiB0aGlzLl9tZXNzYWdlUHJvY2Vzc29ycy5fbGl2ZWRhdGFfbm9zdWIobXNnKTtcbiAgICB0aGlzLl9saXZlZGF0YV9yZXN1bHQgPSAobXNnKSA9PiB0aGlzLl9tZXNzYWdlUHJvY2Vzc29ycy5fbGl2ZWRhdGFfcmVzdWx0KG1zZyk7XG4gICAgdGhpcy5fbGl2ZWRhdGFfZXJyb3IgPSAobXNnKSA9PiB0aGlzLl9tZXNzYWdlUHJvY2Vzc29ycy5fbGl2ZWRhdGFfZXJyb3IobXNnKTtcblxuICAgIHRoaXMuX2RvY3VtZW50UHJvY2Vzc29ycyA9IG5ldyBEb2N1bWVudFByb2Nlc3NvcnModGhpcyk7XG5cbiAgICAvLyBFeHBvc2UgZG9jdW1lbnQgcHJvY2Vzc29yIG1ldGhvZHMgdG8gbWFpbnRhaW4gYmFja3dhcmQgY29tcGF0aWJpbGl0eVxuICAgIHRoaXMuX3Byb2Nlc3NfYWRkZWQgPSAobXNnLCB1cGRhdGVzKSA9PiB0aGlzLl9kb2N1bWVudFByb2Nlc3NvcnMuX3Byb2Nlc3NfYWRkZWQobXNnLCB1cGRhdGVzKTtcbiAgICB0aGlzLl9wcm9jZXNzX2NoYW5nZWQgPSAobXNnLCB1cGRhdGVzKSA9PiB0aGlzLl9kb2N1bWVudFByb2Nlc3NvcnMuX3Byb2Nlc3NfY2hhbmdlZChtc2csIHVwZGF0ZXMpO1xuICAgIHRoaXMuX3Byb2Nlc3NfcmVtb3ZlZCA9IChtc2csIHVwZGF0ZXMpID0+IHRoaXMuX2RvY3VtZW50UHJvY2Vzc29ycy5fcHJvY2Vzc19yZW1vdmVkKG1zZywgdXBkYXRlcyk7XG4gICAgdGhpcy5fcHJvY2Vzc19yZWFkeSA9IChtc2csIHVwZGF0ZXMpID0+IHRoaXMuX2RvY3VtZW50UHJvY2Vzc29ycy5fcHJvY2Vzc19yZWFkeShtc2csIHVwZGF0ZXMpO1xuICAgIHRoaXMuX3Byb2Nlc3NfdXBkYXRlZCA9IChtc2csIHVwZGF0ZXMpID0+IHRoaXMuX2RvY3VtZW50UHJvY2Vzc29ycy5fcHJvY2Vzc191cGRhdGVkKG1zZywgdXBkYXRlcyk7XG5cbiAgICAvLyBBbHNvIGV4cG9zZSB1dGlsaXR5IG1ldGhvZHMgdXNlZCBieSBvdGhlciBwYXJ0cyBvZiB0aGUgc3lzdGVtXG4gICAgdGhpcy5fcHVzaFVwZGF0ZSA9ICh1cGRhdGVzLCBjb2xsZWN0aW9uLCBtc2cpID0+XG4gICAgICB0aGlzLl9kb2N1bWVudFByb2Nlc3NvcnMuX3B1c2hVcGRhdGUodXBkYXRlcywgY29sbGVjdGlvbiwgbXNnKTtcbiAgICB0aGlzLl9nZXRTZXJ2ZXJEb2MgPSAoY29sbGVjdGlvbiwgaWQpID0+XG4gICAgICB0aGlzLl9kb2N1bWVudFByb2Nlc3NvcnMuX2dldFNlcnZlckRvYyhjb2xsZWN0aW9uLCBpZCk7XG4gIH1cblxuICAvLyAnbmFtZScgaXMgdGhlIG5hbWUgb2YgdGhlIGRhdGEgb24gdGhlIHdpcmUgdGhhdCBzaG91bGQgZ28gaW4gdGhlXG4gIC8vIHN0b3JlLiAnd3JhcHBlZFN0b3JlJyBzaG91bGQgYmUgYW4gb2JqZWN0IHdpdGggbWV0aG9kcyBiZWdpblVwZGF0ZSwgdXBkYXRlLFxuICAvLyBlbmRVcGRhdGUsIHNhdmVPcmlnaW5hbHMsIHJldHJpZXZlT3JpZ2luYWxzLiBzZWUgQ29sbGVjdGlvbiBmb3IgYW4gZXhhbXBsZS5cbiAgY3JlYXRlU3RvcmVNZXRob2RzKG5hbWUsIHdyYXBwZWRTdG9yZSkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKG5hbWUgaW4gc2VsZi5fc3RvcmVzKSByZXR1cm4gZmFsc2U7XG5cbiAgICAvLyBXcmFwIHRoZSBpbnB1dCBvYmplY3QgaW4gYW4gb2JqZWN0IHdoaWNoIG1ha2VzIGFueSBzdG9yZSBtZXRob2Qgbm90XG4gICAgLy8gaW1wbGVtZW50ZWQgYnkgJ3N0b3JlJyBpbnRvIGEgbm8tb3AuXG4gICAgY29uc3Qgc3RvcmUgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIGNvbnN0IGtleXNPZlN0b3JlID0gW1xuICAgICAgJ3VwZGF0ZScsXG4gICAgICAnYmVnaW5VcGRhdGUnLFxuICAgICAgJ2VuZFVwZGF0ZScsXG4gICAgICAnc2F2ZU9yaWdpbmFscycsXG4gICAgICAncmV0cmlldmVPcmlnaW5hbHMnLFxuICAgICAgJ2dldERvYycsXG4gICAgICAnX2dldENvbGxlY3Rpb24nXG4gICAgXTtcbiAgICBrZXlzT2ZTdG9yZS5mb3JFYWNoKChtZXRob2QpID0+IHtcbiAgICAgIHN0b3JlW21ldGhvZF0gPSAoLi4uYXJncykgPT4ge1xuICAgICAgICBpZiAod3JhcHBlZFN0b3JlW21ldGhvZF0pIHtcbiAgICAgICAgICByZXR1cm4gd3JhcHBlZFN0b3JlW21ldGhvZF0oLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSk7XG4gICAgc2VsZi5fc3RvcmVzW25hbWVdID0gc3RvcmU7XG4gICAgcmV0dXJuIHN0b3JlO1xuICB9XG5cbiAgcmVnaXN0ZXJTdG9yZUNsaWVudChuYW1lLCB3cmFwcGVkU3RvcmUpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGNvbnN0IHN0b3JlID0gc2VsZi5jcmVhdGVTdG9yZU1ldGhvZHMobmFtZSwgd3JhcHBlZFN0b3JlKTtcblxuICAgIGNvbnN0IHF1ZXVlZCA9IHNlbGYuX3VwZGF0ZXNGb3JVbmtub3duU3RvcmVzW25hbWVdO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHF1ZXVlZCkpIHtcbiAgICAgIHN0b3JlLmJlZ2luVXBkYXRlKHF1ZXVlZC5sZW5ndGgsIGZhbHNlKTtcbiAgICAgIHF1ZXVlZC5mb3JFYWNoKG1zZyA9PiB7XG4gICAgICAgIHN0b3JlLnVwZGF0ZShtc2cpO1xuICAgICAgfSk7XG4gICAgICBzdG9yZS5lbmRVcGRhdGUoKTtcbiAgICAgIGRlbGV0ZSBzZWxmLl91cGRhdGVzRm9yVW5rbm93blN0b3Jlc1tuYW1lXTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBhc3luYyByZWdpc3RlclN0b3JlU2VydmVyKG5hbWUsIHdyYXBwZWRTdG9yZSkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgY29uc3Qgc3RvcmUgPSBzZWxmLmNyZWF0ZVN0b3JlTWV0aG9kcyhuYW1lLCB3cmFwcGVkU3RvcmUpO1xuXG4gICAgY29uc3QgcXVldWVkID0gc2VsZi5fdXBkYXRlc0ZvclVua25vd25TdG9yZXNbbmFtZV07XG4gICAgaWYgKEFycmF5LmlzQXJyYXkocXVldWVkKSkge1xuICAgICAgYXdhaXQgc3RvcmUuYmVnaW5VcGRhdGUocXVldWVkLmxlbmd0aCwgZmFsc2UpO1xuICAgICAgZm9yIChjb25zdCBtc2cgb2YgcXVldWVkKSB7XG4gICAgICAgIGF3YWl0IHN0b3JlLnVwZGF0ZShtc2cpO1xuICAgICAgfVxuICAgICAgYXdhaXQgc3RvcmUuZW5kVXBkYXRlKCk7XG4gICAgICBkZWxldGUgc2VsZi5fdXBkYXRlc0ZvclVua25vd25TdG9yZXNbbmFtZV07XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlck9mIE1ldGVvclxuICAgKiBAaW1wb3J0RnJvbVBhY2thZ2UgbWV0ZW9yXG4gICAqIEBhbGlhcyBNZXRlb3Iuc3Vic2NyaWJlXG4gICAqIEBzdW1tYXJ5IFN1YnNjcmliZSB0byBhIHJlY29yZCBzZXQuICBSZXR1cm5zIGEgaGFuZGxlIHRoYXQgcHJvdmlkZXNcbiAgICogYHN0b3AoKWAgYW5kIGByZWFkeSgpYCBtZXRob2RzLlxuICAgKiBAbG9jdXMgQ2xpZW50XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIE5hbWUgb2YgdGhlIHN1YnNjcmlwdGlvbi4gIE1hdGNoZXMgdGhlIG5hbWUgb2YgdGhlXG4gICAqIHNlcnZlcidzIGBwdWJsaXNoKClgIGNhbGwuXG4gICAqIEBwYXJhbSB7RUpTT05hYmxlfSBbYXJnMSxhcmcyLi4uXSBPcHRpb25hbCBhcmd1bWVudHMgcGFzc2VkIHRvIHB1Ymxpc2hlclxuICAgKiBmdW5jdGlvbiBvbiBzZXJ2ZXIuXG4gICAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fSBbY2FsbGJhY2tzXSBPcHRpb25hbC4gTWF5IGluY2x1ZGUgYG9uU3RvcGBcbiAgICogYW5kIGBvblJlYWR5YCBjYWxsYmFja3MuIElmIHRoZXJlIGlzIGFuIGVycm9yLCBpdCBpcyBwYXNzZWQgYXMgYW5cbiAgICogYXJndW1lbnQgdG8gYG9uU3RvcGAuIElmIGEgZnVuY3Rpb24gaXMgcGFzc2VkIGluc3RlYWQgb2YgYW4gb2JqZWN0LCBpdFxuICAgKiBpcyBpbnRlcnByZXRlZCBhcyBhbiBgb25SZWFkeWAgY2FsbGJhY2suXG4gICAqL1xuICBzdWJzY3JpYmUobmFtZSAvKiAuLiBbYXJndW1lbnRzXSAuLiAoY2FsbGJhY2t8Y2FsbGJhY2tzKSAqLykge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgY29uc3QgcGFyYW1zID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIGxldCBjYWxsYmFja3MgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIGlmIChwYXJhbXMubGVuZ3RoKSB7XG4gICAgICBjb25zdCBsYXN0UGFyYW0gPSBwYXJhbXNbcGFyYW1zLmxlbmd0aCAtIDFdO1xuICAgICAgaWYgKHR5cGVvZiBsYXN0UGFyYW0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY2FsbGJhY2tzLm9uUmVhZHkgPSBwYXJhbXMucG9wKCk7XG4gICAgICB9IGVsc2UgaWYgKGxhc3RQYXJhbSAmJiBbXG4gICAgICAgIGxhc3RQYXJhbS5vblJlYWR5LFxuICAgICAgICAvLyBYWFggQ09NUEFUIFdJVEggMS4wLjMuMSBvbkVycm9yIHVzZWQgdG8gZXhpc3QsIGJ1dCBub3cgd2UgdXNlXG4gICAgICAgIC8vIG9uU3RvcCB3aXRoIGFuIGVycm9yIGNhbGxiYWNrIGluc3RlYWQuXG4gICAgICAgIGxhc3RQYXJhbS5vbkVycm9yLFxuICAgICAgICBsYXN0UGFyYW0ub25TdG9wXG4gICAgICBdLnNvbWUoZiA9PiB0eXBlb2YgZiA9PT0gXCJmdW5jdGlvblwiKSkge1xuICAgICAgICBjYWxsYmFja3MgPSBwYXJhbXMucG9wKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSXMgdGhlcmUgYW4gZXhpc3Rpbmcgc3ViIHdpdGggdGhlIHNhbWUgbmFtZSBhbmQgcGFyYW0sIHJ1biBpbiBhblxuICAgIC8vIGludmFsaWRhdGVkIENvbXB1dGF0aW9uPyBUaGlzIHdpbGwgaGFwcGVuIGlmIHdlIGFyZSByZXJ1bm5pbmcgYW5cbiAgICAvLyBleGlzdGluZyBjb21wdXRhdGlvbi5cbiAgICAvL1xuICAgIC8vIEZvciBleGFtcGxlLCBjb25zaWRlciBhIHJlcnVuIG9mOlxuICAgIC8vXG4gICAgLy8gICAgIFRyYWNrZXIuYXV0b3J1bihmdW5jdGlvbiAoKSB7XG4gICAgLy8gICAgICAgTWV0ZW9yLnN1YnNjcmliZShcImZvb1wiLCBTZXNzaW9uLmdldChcImZvb1wiKSk7XG4gICAgLy8gICAgICAgTWV0ZW9yLnN1YnNjcmliZShcImJhclwiLCBTZXNzaW9uLmdldChcImJhclwiKSk7XG4gICAgLy8gICAgIH0pO1xuICAgIC8vXG4gICAgLy8gSWYgXCJmb29cIiBoYXMgY2hhbmdlZCBidXQgXCJiYXJcIiBoYXMgbm90LCB3ZSB3aWxsIG1hdGNoIHRoZSBcImJhclwiXG4gICAgLy8gc3ViY3JpYmUgdG8gYW4gZXhpc3RpbmcgaW5hY3RpdmUgc3Vic2NyaXB0aW9uIGluIG9yZGVyIHRvIG5vdFxuICAgIC8vIHVuc3ViIGFuZCByZXN1YiB0aGUgc3Vic2NyaXB0aW9uIHVubmVjZXNzYXJpbHkuXG4gICAgLy9cbiAgICAvLyBXZSBvbmx5IGxvb2sgZm9yIG9uZSBzdWNoIHN1YjsgaWYgdGhlcmUgYXJlIE4gYXBwYXJlbnRseS1pZGVudGljYWwgc3Vic1xuICAgIC8vIGJlaW5nIGludmFsaWRhdGVkLCB3ZSB3aWxsIHJlcXVpcmUgTiBtYXRjaGluZyBzdWJzY3JpYmUgY2FsbHMgdG8ga2VlcFxuICAgIC8vIHRoZW0gYWxsIGFjdGl2ZS5cbiAgICBjb25zdCBleGlzdGluZyA9IE9iamVjdC52YWx1ZXMoc2VsZi5fc3Vic2NyaXB0aW9ucykuZmluZChcbiAgICAgIHN1YiA9PiAoc3ViLmluYWN0aXZlICYmIHN1Yi5uYW1lID09PSBuYW1lICYmIEVKU09OLmVxdWFscyhzdWIucGFyYW1zLCBwYXJhbXMpKVxuICAgICk7XG5cbiAgICBsZXQgaWQ7XG4gICAgaWYgKGV4aXN0aW5nKSB7XG4gICAgICBpZCA9IGV4aXN0aW5nLmlkO1xuICAgICAgZXhpc3RpbmcuaW5hY3RpdmUgPSBmYWxzZTsgLy8gcmVhY3RpdmF0ZVxuXG4gICAgICBpZiAoY2FsbGJhY2tzLm9uUmVhZHkpIHtcbiAgICAgICAgLy8gSWYgdGhlIHN1YiBpcyBub3QgYWxyZWFkeSByZWFkeSwgcmVwbGFjZSBhbnkgcmVhZHkgY2FsbGJhY2sgd2l0aCB0aGVcbiAgICAgICAgLy8gb25lIHByb3ZpZGVkIG5vdy4gKEl0J3Mgbm90IHJlYWxseSBjbGVhciB3aGF0IHVzZXJzIHdvdWxkIGV4cGVjdCBmb3JcbiAgICAgICAgLy8gYW4gb25SZWFkeSBjYWxsYmFjayBpbnNpZGUgYW4gYXV0b3J1bjsgdGhlIHNlbWFudGljcyB3ZSBwcm92aWRlIGlzXG4gICAgICAgIC8vIHRoYXQgYXQgdGhlIHRpbWUgdGhlIHN1YiBmaXJzdCBiZWNvbWVzIHJlYWR5LCB3ZSBjYWxsIHRoZSBsYXN0XG4gICAgICAgIC8vIG9uUmVhZHkgY2FsbGJhY2sgcHJvdmlkZWQsIGlmIGFueS4pXG4gICAgICAgIC8vIElmIHRoZSBzdWIgaXMgYWxyZWFkeSByZWFkeSwgcnVuIHRoZSByZWFkeSBjYWxsYmFjayByaWdodCBhd2F5LlxuICAgICAgICAvLyBJdCBzZWVtcyB0aGF0IHVzZXJzIHdvdWxkIGV4cGVjdCBhbiBvblJlYWR5IGNhbGxiYWNrIGluc2lkZSBhblxuICAgICAgICAvLyBhdXRvcnVuIHRvIHRyaWdnZXIgb25jZSB0aGUgc3ViIGZpcnN0IGJlY29tZXMgcmVhZHkgYW5kIGFsc29cbiAgICAgICAgLy8gd2hlbiByZS1zdWJzIGhhcHBlbnMuXG4gICAgICAgIGlmIChleGlzdGluZy5yZWFkeSkge1xuICAgICAgICAgIGNhbGxiYWNrcy5vblJlYWR5KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZXhpc3RpbmcucmVhZHlDYWxsYmFjayA9IGNhbGxiYWNrcy5vblJlYWR5O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFhYWCBDT01QQVQgV0lUSCAxLjAuMy4xIHdlIHVzZWQgdG8gaGF2ZSBvbkVycm9yIGJ1dCBub3cgd2UgY2FsbFxuICAgICAgLy8gb25TdG9wIHdpdGggYW4gb3B0aW9uYWwgZXJyb3IgYXJndW1lbnRcbiAgICAgIGlmIChjYWxsYmFja3Mub25FcnJvcikge1xuICAgICAgICAvLyBSZXBsYWNlIGV4aXN0aW5nIGNhbGxiYWNrIGlmIGFueSwgc28gdGhhdCBlcnJvcnMgYXJlbid0XG4gICAgICAgIC8vIGRvdWJsZS1yZXBvcnRlZC5cbiAgICAgICAgZXhpc3RpbmcuZXJyb3JDYWxsYmFjayA9IGNhbGxiYWNrcy5vbkVycm9yO1xuICAgICAgfVxuXG4gICAgICBpZiAoY2FsbGJhY2tzLm9uU3RvcCkge1xuICAgICAgICBleGlzdGluZy5zdG9wQ2FsbGJhY2sgPSBjYWxsYmFja3Mub25TdG9wO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBOZXcgc3ViISBHZW5lcmF0ZSBhbiBpZCwgc2F2ZSBpdCBsb2NhbGx5LCBhbmQgc2VuZCBtZXNzYWdlLlxuICAgICAgaWQgPSBSYW5kb20uaWQoKTtcbiAgICAgIHNlbGYuX3N1YnNjcmlwdGlvbnNbaWRdID0ge1xuICAgICAgICBpZDogaWQsXG4gICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgIHBhcmFtczogRUpTT04uY2xvbmUocGFyYW1zKSxcbiAgICAgICAgaW5hY3RpdmU6IGZhbHNlLFxuICAgICAgICByZWFkeTogZmFsc2UsXG4gICAgICAgIHJlYWR5RGVwczogbmV3IFRyYWNrZXIuRGVwZW5kZW5jeSgpLFxuICAgICAgICByZWFkeUNhbGxiYWNrOiBjYWxsYmFja3Mub25SZWFkeSxcbiAgICAgICAgLy8gWFhYIENPTVBBVCBXSVRIIDEuMC4zLjEgI2Vycm9yQ2FsbGJhY2tcbiAgICAgICAgZXJyb3JDYWxsYmFjazogY2FsbGJhY2tzLm9uRXJyb3IsXG4gICAgICAgIHN0b3BDYWxsYmFjazogY2FsbGJhY2tzLm9uU3RvcCxcbiAgICAgICAgY29ubmVjdGlvbjogc2VsZixcbiAgICAgICAgcmVtb3ZlKCkge1xuICAgICAgICAgIGRlbGV0ZSB0aGlzLmNvbm5lY3Rpb24uX3N1YnNjcmlwdGlvbnNbdGhpcy5pZF07XG4gICAgICAgICAgdGhpcy5yZWFkeSAmJiB0aGlzLnJlYWR5RGVwcy5jaGFuZ2VkKCk7XG4gICAgICAgIH0sXG4gICAgICAgIHN0b3AoKSB7XG4gICAgICAgICAgdGhpcy5jb25uZWN0aW9uLl9zZW5kUXVldWVkKHsgbXNnOiAndW5zdWInLCBpZDogaWQgfSk7XG4gICAgICAgICAgdGhpcy5yZW1vdmUoKTtcblxuICAgICAgICAgIGlmIChjYWxsYmFja3Mub25TdG9wKSB7XG4gICAgICAgICAgICBjYWxsYmFja3Mub25TdG9wKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgc2VsZi5fc2VuZCh7IG1zZzogJ3N1YicsIGlkOiBpZCwgbmFtZTogbmFtZSwgcGFyYW1zOiBwYXJhbXMgfSk7XG4gICAgfVxuXG4gICAgLy8gcmV0dXJuIGEgaGFuZGxlIHRvIHRoZSBhcHBsaWNhdGlvbi5cbiAgICBjb25zdCBoYW5kbGUgPSB7XG4gICAgICBzdG9wKCkge1xuICAgICAgICBpZiAoISBoYXNPd24uY2FsbChzZWxmLl9zdWJzY3JpcHRpb25zLCBpZCkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc2VsZi5fc3Vic2NyaXB0aW9uc1tpZF0uc3RvcCgpO1xuICAgICAgfSxcbiAgICAgIHJlYWR5KCkge1xuICAgICAgICAvLyByZXR1cm4gZmFsc2UgaWYgd2UndmUgdW5zdWJzY3JpYmVkLlxuICAgICAgICBpZiAoIWhhc093bi5jYWxsKHNlbGYuX3N1YnNjcmlwdGlvbnMsIGlkKSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZWNvcmQgPSBzZWxmLl9zdWJzY3JpcHRpb25zW2lkXTtcbiAgICAgICAgcmVjb3JkLnJlYWR5RGVwcy5kZXBlbmQoKTtcbiAgICAgICAgcmV0dXJuIHJlY29yZC5yZWFkeTtcbiAgICAgIH0sXG4gICAgICBzdWJzY3JpcHRpb25JZDogaWRcbiAgICB9O1xuXG4gICAgaWYgKFRyYWNrZXIuYWN0aXZlKSB7XG4gICAgICAvLyBXZSdyZSBpbiBhIHJlYWN0aXZlIGNvbXB1dGF0aW9uLCBzbyB3ZSdkIGxpa2UgdG8gdW5zdWJzY3JpYmUgd2hlbiB0aGVcbiAgICAgIC8vIGNvbXB1dGF0aW9uIGlzIGludmFsaWRhdGVkLi4uIGJ1dCBub3QgaWYgdGhlIHJlcnVuIGp1c3QgcmUtc3Vic2NyaWJlc1xuICAgICAgLy8gdG8gdGhlIHNhbWUgc3Vic2NyaXB0aW9uISAgV2hlbiBhIHJlcnVuIGhhcHBlbnMsIHdlIHVzZSBvbkludmFsaWRhdGVcbiAgICAgIC8vIGFzIGEgY2hhbmdlIHRvIG1hcmsgdGhlIHN1YnNjcmlwdGlvbiBcImluYWN0aXZlXCIgc28gdGhhdCBpdCBjYW5cbiAgICAgIC8vIGJlIHJldXNlZCBmcm9tIHRoZSByZXJ1bi4gIElmIGl0IGlzbid0IHJldXNlZCwgaXQncyBraWxsZWQgZnJvbVxuICAgICAgLy8gYW4gYWZ0ZXJGbHVzaC5cbiAgICAgIFRyYWNrZXIub25JbnZhbGlkYXRlKChjKSA9PiB7XG4gICAgICAgIGlmIChoYXNPd24uY2FsbChzZWxmLl9zdWJzY3JpcHRpb25zLCBpZCkpIHtcbiAgICAgICAgICBzZWxmLl9zdWJzY3JpcHRpb25zW2lkXS5pbmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBUcmFja2VyLmFmdGVyRmx1c2goKCkgPT4ge1xuICAgICAgICAgIGlmIChoYXNPd24uY2FsbChzZWxmLl9zdWJzY3JpcHRpb25zLCBpZCkgJiZcbiAgICAgICAgICAgICAgc2VsZi5fc3Vic2NyaXB0aW9uc1tpZF0uaW5hY3RpdmUpIHtcbiAgICAgICAgICAgIGhhbmRsZS5zdG9wKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBoYW5kbGU7XG4gIH1cblxuICAvKipcbiAgICogQHN1bW1hcnkgVGVsbHMgaWYgdGhlIG1ldGhvZCBjYWxsIGNhbWUgZnJvbSBhIGNhbGwgb3IgYSBjYWxsQXN5bmMuXG4gICAqIEBhbGlhcyBNZXRlb3IuaXNBc3luY0NhbGxcbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZW1iZXJPZiBNZXRlb3JcbiAgICogQGltcG9ydEZyb21QYWNrYWdlIG1ldGVvclxuICAgKiBAcmV0dXJucyBib29sZWFuXG4gICAqL1xuICBpc0FzeW5jQ2FsbCgpe1xuICAgIHJldHVybiBERFAuX0N1cnJlbnRNZXRob2RJbnZvY2F0aW9uLl9pc0NhbGxBc3luY01ldGhvZFJ1bm5pbmcoKVxuICB9XG4gIG1ldGhvZHMobWV0aG9kcykge1xuICAgIE9iamVjdC5lbnRyaWVzKG1ldGhvZHMpLmZvckVhY2goKFtuYW1lLCBmdW5jXSkgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBmdW5jICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk1ldGhvZCAnXCIgKyBuYW1lICsgXCInIG11c3QgYmUgYSBmdW5jdGlvblwiKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLl9tZXRob2RIYW5kbGVyc1tuYW1lXSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBIG1ldGhvZCBuYW1lZCAnXCIgKyBuYW1lICsgXCInIGlzIGFscmVhZHkgZGVmaW5lZFwiKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX21ldGhvZEhhbmRsZXJzW25hbWVdID0gZnVuYztcbiAgICB9KTtcbiAgfVxuXG4gIF9nZXRJc1NpbXVsYXRpb24oe2lzRnJvbUNhbGxBc3luYywgYWxyZWFkeUluU2ltdWxhdGlvbn0pIHtcbiAgICBpZiAoIWlzRnJvbUNhbGxBc3luYykge1xuICAgICAgcmV0dXJuIGFscmVhZHlJblNpbXVsYXRpb247XG4gICAgfVxuICAgIHJldHVybiBhbHJlYWR5SW5TaW11bGF0aW9uICYmIEREUC5fQ3VycmVudE1ldGhvZEludm9jYXRpb24uX2lzQ2FsbEFzeW5jTWV0aG9kUnVubmluZygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXJPZiBNZXRlb3JcbiAgICogQGltcG9ydEZyb21QYWNrYWdlIG1ldGVvclxuICAgKiBAYWxpYXMgTWV0ZW9yLmNhbGxcbiAgICogQHN1bW1hcnkgSW52b2tlcyBhIG1ldGhvZCB3aXRoIGEgc3luYyBzdHViLCBwYXNzaW5nIGFueSBudW1iZXIgb2YgYXJndW1lbnRzLlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgTmFtZSBvZiBtZXRob2QgdG8gaW52b2tlXG4gICAqIEBwYXJhbSB7RUpTT05hYmxlfSBbYXJnMSxhcmcyLi4uXSBPcHRpb25hbCBtZXRob2QgYXJndW1lbnRzXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IFthc3luY0NhbGxiYWNrXSBPcHRpb25hbCBjYWxsYmFjaywgd2hpY2ggaXMgY2FsbGVkIGFzeW5jaHJvbm91c2x5IHdpdGggdGhlIGVycm9yIG9yIHJlc3VsdCBhZnRlciB0aGUgbWV0aG9kIGlzIGNvbXBsZXRlLiBJZiBub3QgcHJvdmlkZWQsIHRoZSBtZXRob2QgcnVucyBzeW5jaHJvbm91c2x5IGlmIHBvc3NpYmxlIChzZWUgYmVsb3cpLlxuICAgKi9cbiAgY2FsbChuYW1lIC8qIC4uIFthcmd1bWVudHNdIC4uIGNhbGxiYWNrICovKSB7XG4gICAgLy8gaWYgaXQncyBhIGZ1bmN0aW9uLCB0aGUgbGFzdCBhcmd1bWVudCBpcyB0aGUgcmVzdWx0IGNhbGxiYWNrLFxuICAgIC8vIG5vdCBhIHBhcmFtZXRlciB0byB0aGUgcmVtb3RlIG1ldGhvZC5cbiAgICBjb25zdCBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIGxldCBjYWxsYmFjaztcbiAgICBpZiAoYXJncy5sZW5ndGggJiYgdHlwZW9mIGFyZ3NbYXJncy5sZW5ndGggLSAxXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY2FsbGJhY2sgPSBhcmdzLnBvcCgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5hcHBseShuYW1lLCBhcmdzLCBjYWxsYmFjayk7XG4gIH1cbiAgLyoqXG4gICAqIEBtZW1iZXJPZiBNZXRlb3JcbiAgICogQGltcG9ydEZyb21QYWNrYWdlIG1ldGVvclxuICAgKiBAYWxpYXMgTWV0ZW9yLmNhbGxBc3luY1xuICAgKiBAc3VtbWFyeSBJbnZva2VzIGEgbWV0aG9kIHdpdGggYW4gYXN5bmMgc3R1YiwgcGFzc2luZyBhbnkgbnVtYmVyIG9mIGFyZ3VtZW50cy5cbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIE5hbWUgb2YgbWV0aG9kIHRvIGludm9rZVxuICAgKiBAcGFyYW0ge0VKU09OYWJsZX0gW2FyZzEsYXJnMi4uLl0gT3B0aW9uYWwgbWV0aG9kIGFyZ3VtZW50c1xuICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICovXG4gIGNhbGxBc3luYyhuYW1lIC8qIC4uIFthcmd1bWVudHNdIC4uICovKSB7XG4gICAgY29uc3QgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICBpZiAoYXJncy5sZW5ndGggJiYgdHlwZW9mIGFyZ3NbYXJncy5sZW5ndGggLSAxXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBcIk1ldGVvci5jYWxsQXN5bmMoKSBkb2VzIG5vdCBhY2NlcHQgYSBjYWxsYmFjay4gWW91IHNob3VsZCAnYXdhaXQnIHRoZSByZXN1bHQsIG9yIHVzZSAudGhlbigpLlwiXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmFwcGx5QXN5bmMobmFtZSwgYXJncywgeyByZXR1cm5TZXJ2ZXJSZXN1bHRQcm9taXNlOiB0cnVlIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEBtZW1iZXJPZiBNZXRlb3JcbiAgICogQGltcG9ydEZyb21QYWNrYWdlIG1ldGVvclxuICAgKiBAYWxpYXMgTWV0ZW9yLmFwcGx5XG4gICAqIEBzdW1tYXJ5IEludm9rZSBhIG1ldGhvZCBwYXNzaW5nIGFuIGFycmF5IG9mIGFyZ3VtZW50cy5cbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIE5hbWUgb2YgbWV0aG9kIHRvIGludm9rZVxuICAgKiBAcGFyYW0ge0VKU09OYWJsZVtdfSBhcmdzIE1ldGhvZCBhcmd1bWVudHNcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMud2FpdCAoQ2xpZW50IG9ubHkpIElmIHRydWUsIGRvbid0IHNlbmQgdGhpcyBtZXRob2QgdW50aWwgYWxsIHByZXZpb3VzIG1ldGhvZCBjYWxscyBoYXZlIGNvbXBsZXRlZCwgYW5kIGRvbid0IHNlbmQgYW55IHN1YnNlcXVlbnQgbWV0aG9kIGNhbGxzIHVudGlsIHRoaXMgb25lIGlzIGNvbXBsZXRlZC5cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gb3B0aW9ucy5vblJlc3VsdFJlY2VpdmVkIChDbGllbnQgb25seSkgVGhpcyBjYWxsYmFjayBpcyBpbnZva2VkIHdpdGggdGhlIGVycm9yIG9yIHJlc3VsdCBvZiB0aGUgbWV0aG9kIChqdXN0IGxpa2UgYGFzeW5jQ2FsbGJhY2tgKSBhcyBzb29uIGFzIHRoZSBlcnJvciBvciByZXN1bHQgaXMgYXZhaWxhYmxlLiBUaGUgbG9jYWwgY2FjaGUgbWF5IG5vdCB5ZXQgcmVmbGVjdCB0aGUgd3JpdGVzIHBlcmZvcm1lZCBieSB0aGUgbWV0aG9kLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMubm9SZXRyeSAoQ2xpZW50IG9ubHkpIGlmIHRydWUsIGRvbid0IHNlbmQgdGhpcyBtZXRob2QgYWdhaW4gb24gcmVsb2FkLCBzaW1wbHkgY2FsbCB0aGUgY2FsbGJhY2sgYW4gZXJyb3Igd2l0aCB0aGUgZXJyb3IgY29kZSAnaW52b2NhdGlvbi1mYWlsZWQnLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMudGhyb3dTdHViRXhjZXB0aW9ucyAoQ2xpZW50IG9ubHkpIElmIHRydWUsIGV4Y2VwdGlvbnMgdGhyb3duIGJ5IG1ldGhvZCBzdHVicyB3aWxsIGJlIHRocm93biBpbnN0ZWFkIG9mIGxvZ2dlZCwgYW5kIHRoZSBtZXRob2Qgd2lsbCBub3QgYmUgaW52b2tlZCBvbiB0aGUgc2VydmVyLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMucmV0dXJuU3R1YlZhbHVlIChDbGllbnQgb25seSkgSWYgdHJ1ZSB0aGVuIGluIGNhc2VzIHdoZXJlIHdlIHdvdWxkIGhhdmUgb3RoZXJ3aXNlIGRpc2NhcmRlZCB0aGUgc3R1YidzIHJldHVybiB2YWx1ZSBhbmQgcmV0dXJuZWQgdW5kZWZpbmVkLCBpbnN0ZWFkIHdlIGdvIGFoZWFkIGFuZCByZXR1cm4gaXQuIFNwZWNpZmljYWxseSwgdGhpcyBpcyBhbnkgdGltZSBvdGhlciB0aGFuIHdoZW4gKGEpIHdlIGFyZSBhbHJlYWR5IGluc2lkZSBhIHN0dWIgb3IgKGIpIHdlIGFyZSBpbiBOb2RlIGFuZCBubyBjYWxsYmFjayB3YXMgcHJvdmlkZWQuIEN1cnJlbnRseSB3ZSByZXF1aXJlIHRoaXMgZmxhZyB0byBiZSBleHBsaWNpdGx5IHBhc3NlZCB0byByZWR1Y2UgdGhlIGxpa2VsaWhvb2QgdGhhdCBzdHViIHJldHVybiB2YWx1ZXMgd2lsbCBiZSBjb25mdXNlZCB3aXRoIHNlcnZlciByZXR1cm4gdmFsdWVzOyB3ZSBtYXkgaW1wcm92ZSB0aGlzIGluIGZ1dHVyZS5cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2FzeW5jQ2FsbGJhY2tdIE9wdGlvbmFsIGNhbGxiYWNrOyBzYW1lIHNlbWFudGljcyBhcyBpbiBbYE1ldGVvci5jYWxsYF0oI21ldGVvcl9jYWxsKS5cbiAgICovXG4gIGFwcGx5KG5hbWUsIGFyZ3MsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgY29uc3QgeyBzdHViSW52b2NhdGlvbiwgaW52b2NhdGlvbiwgLi4uc3R1Yk9wdGlvbnMgfSA9IHRoaXMuX3N0dWJDYWxsKG5hbWUsIEVKU09OLmNsb25lKGFyZ3MpKTtcblxuICAgIGlmIChzdHViT3B0aW9ucy5oYXNTdHViKSB7XG4gICAgICBpZiAoXG4gICAgICAgICF0aGlzLl9nZXRJc1NpbXVsYXRpb24oe1xuICAgICAgICAgIGFscmVhZHlJblNpbXVsYXRpb246IHN0dWJPcHRpb25zLmFscmVhZHlJblNpbXVsYXRpb24sXG4gICAgICAgICAgaXNGcm9tQ2FsbEFzeW5jOiBzdHViT3B0aW9ucy5pc0Zyb21DYWxsQXN5bmMsXG4gICAgICAgIH0pXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5fc2F2ZU9yaWdpbmFscygpO1xuICAgICAgfVxuICAgICAgdHJ5IHtcbiAgICAgICAgc3R1Yk9wdGlvbnMuc3R1YlJldHVyblZhbHVlID0gRERQLl9DdXJyZW50TWV0aG9kSW52b2NhdGlvblxuICAgICAgICAgIC53aXRoVmFsdWUoaW52b2NhdGlvbiwgc3R1Ykludm9jYXRpb24pO1xuICAgICAgICBpZiAoTWV0ZW9yLl9pc1Byb21pc2Uoc3R1Yk9wdGlvbnMuc3R1YlJldHVyblZhbHVlKSkge1xuICAgICAgICAgIE1ldGVvci5fZGVidWcoXG4gICAgICAgICAgICBgTWV0aG9kICR7bmFtZX06IENhbGxpbmcgYSBtZXRob2QgdGhhdCBoYXMgYW4gYXN5bmMgbWV0aG9kIHN0dWIgd2l0aCBjYWxsL2FwcGx5IGNhbiBsZWFkIHRvIHVuZXhwZWN0ZWQgYmVoYXZpb3JzLiBVc2UgY2FsbEFzeW5jL2FwcGx5QXN5bmMgaW5zdGVhZC5gXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBzdHViT3B0aW9ucy5leGNlcHRpb24gPSBlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fYXBwbHkobmFtZSwgc3R1Yk9wdGlvbnMsIGFyZ3MsIG9wdGlvbnMsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyT2YgTWV0ZW9yXG4gICAqIEBpbXBvcnRGcm9tUGFja2FnZSBtZXRlb3JcbiAgICogQGFsaWFzIE1ldGVvci5hcHBseUFzeW5jXG4gICAqIEBzdW1tYXJ5IEludm9rZSBhIG1ldGhvZCBwYXNzaW5nIGFuIGFycmF5IG9mIGFyZ3VtZW50cy5cbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIE5hbWUgb2YgbWV0aG9kIHRvIGludm9rZVxuICAgKiBAcGFyYW0ge0VKU09OYWJsZVtdfSBhcmdzIE1ldGhvZCBhcmd1bWVudHNcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMud2FpdCAoQ2xpZW50IG9ubHkpIElmIHRydWUsIGRvbid0IHNlbmQgdGhpcyBtZXRob2QgdW50aWwgYWxsIHByZXZpb3VzIG1ldGhvZCBjYWxscyBoYXZlIGNvbXBsZXRlZCwgYW5kIGRvbid0IHNlbmQgYW55IHN1YnNlcXVlbnQgbWV0aG9kIGNhbGxzIHVudGlsIHRoaXMgb25lIGlzIGNvbXBsZXRlZC5cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gb3B0aW9ucy5vblJlc3VsdFJlY2VpdmVkIChDbGllbnQgb25seSkgVGhpcyBjYWxsYmFjayBpcyBpbnZva2VkIHdpdGggdGhlIGVycm9yIG9yIHJlc3VsdCBvZiB0aGUgbWV0aG9kIChqdXN0IGxpa2UgYGFzeW5jQ2FsbGJhY2tgKSBhcyBzb29uIGFzIHRoZSBlcnJvciBvciByZXN1bHQgaXMgYXZhaWxhYmxlLiBUaGUgbG9jYWwgY2FjaGUgbWF5IG5vdCB5ZXQgcmVmbGVjdCB0aGUgd3JpdGVzIHBlcmZvcm1lZCBieSB0aGUgbWV0aG9kLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMubm9SZXRyeSAoQ2xpZW50IG9ubHkpIGlmIHRydWUsIGRvbid0IHNlbmQgdGhpcyBtZXRob2QgYWdhaW4gb24gcmVsb2FkLCBzaW1wbHkgY2FsbCB0aGUgY2FsbGJhY2sgYW4gZXJyb3Igd2l0aCB0aGUgZXJyb3IgY29kZSAnaW52b2NhdGlvbi1mYWlsZWQnLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMudGhyb3dTdHViRXhjZXB0aW9ucyAoQ2xpZW50IG9ubHkpIElmIHRydWUsIGV4Y2VwdGlvbnMgdGhyb3duIGJ5IG1ldGhvZCBzdHVicyB3aWxsIGJlIHRocm93biBpbnN0ZWFkIG9mIGxvZ2dlZCwgYW5kIHRoZSBtZXRob2Qgd2lsbCBub3QgYmUgaW52b2tlZCBvbiB0aGUgc2VydmVyLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMucmV0dXJuU3R1YlZhbHVlIChDbGllbnQgb25seSkgSWYgdHJ1ZSB0aGVuIGluIGNhc2VzIHdoZXJlIHdlIHdvdWxkIGhhdmUgb3RoZXJ3aXNlIGRpc2NhcmRlZCB0aGUgc3R1YidzIHJldHVybiB2YWx1ZSBhbmQgcmV0dXJuZWQgdW5kZWZpbmVkLCBpbnN0ZWFkIHdlIGdvIGFoZWFkIGFuZCByZXR1cm4gaXQuIFNwZWNpZmljYWxseSwgdGhpcyBpcyBhbnkgdGltZSBvdGhlciB0aGFuIHdoZW4gKGEpIHdlIGFyZSBhbHJlYWR5IGluc2lkZSBhIHN0dWIgb3IgKGIpIHdlIGFyZSBpbiBOb2RlIGFuZCBubyBjYWxsYmFjayB3YXMgcHJvdmlkZWQuIEN1cnJlbnRseSB3ZSByZXF1aXJlIHRoaXMgZmxhZyB0byBiZSBleHBsaWNpdGx5IHBhc3NlZCB0byByZWR1Y2UgdGhlIGxpa2VsaWhvb2QgdGhhdCBzdHViIHJldHVybiB2YWx1ZXMgd2lsbCBiZSBjb25mdXNlZCB3aXRoIHNlcnZlciByZXR1cm4gdmFsdWVzOyB3ZSBtYXkgaW1wcm92ZSB0aGlzIGluIGZ1dHVyZS5cbiAgICogQHBhcmFtIHtCb29sZWFufSBvcHRpb25zLnJldHVyblNlcnZlclJlc3VsdFByb21pc2UgKENsaWVudCBvbmx5KSBJZiB0cnVlLCB0aGUgcHJvbWlzZSByZXR1cm5lZCBieSBhcHBseUFzeW5jIHdpbGwgcmVzb2x2ZSB0byB0aGUgc2VydmVyJ3MgcmV0dXJuIHZhbHVlLCByYXRoZXIgdGhhbiB0aGUgc3R1YidzIHJldHVybiB2YWx1ZS4gVGhpcyBpcyB1c2VmdWwgd2hlbiB5b3Ugd2FudCB0byBlbnN1cmUgdGhhdCB0aGUgc2VydmVyJ3MgcmV0dXJuIHZhbHVlIGlzIHVzZWQsIGV2ZW4gaWYgdGhlIHN0dWIgcmV0dXJucyBhIHByb21pc2UuIFRoZSBzYW1lIGJlaGF2aW9yIGFzIGBjYWxsQXN5bmNgLlxuICAgKi9cbiAgYXBwbHlBc3luYyhuYW1lLCBhcmdzLCBvcHRpb25zLCBjYWxsYmFjayA9IG51bGwpIHtcbiAgICBjb25zdCBzdHViUHJvbWlzZSA9IHRoaXMuX2FwcGx5QXN5bmNTdHViSW52b2NhdGlvbihuYW1lLCBhcmdzLCBvcHRpb25zKTtcblxuICAgIGNvbnN0IHByb21pc2UgPSB0aGlzLl9hcHBseUFzeW5jKHtcbiAgICAgIG5hbWUsXG4gICAgICBhcmdzLFxuICAgICAgb3B0aW9ucyxcbiAgICAgIGNhbGxiYWNrLFxuICAgICAgc3R1YlByb21pc2UsXG4gICAgfSk7XG4gICAgaWYgKE1ldGVvci5pc0NsaWVudCkge1xuICAgICAgLy8gb25seSByZXR1cm4gdGhlIHN0dWJSZXR1cm5WYWx1ZVxuICAgICAgcHJvbWlzZS5zdHViUHJvbWlzZSA9IHN0dWJQcm9taXNlLnRoZW4obyA9PiB7XG4gICAgICAgIGlmIChvLmV4Y2VwdGlvbikge1xuICAgICAgICAgIHRocm93IG8uZXhjZXB0aW9uO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvLnN0dWJSZXR1cm5WYWx1ZTtcbiAgICAgIH0pO1xuICAgICAgLy8gdGhpcyBhdm9pZHMgYXR0cmlidXRlIHJlY3Vyc2lvblxuICAgICAgcHJvbWlzZS5zZXJ2ZXJQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgICAgcHJvbWlzZS50aGVuKHJlc29sdmUpLmNhdGNoKHJlamVjdCksXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuICBhc3luYyBfYXBwbHlBc3luY1N0dWJJbnZvY2F0aW9uKG5hbWUsIGFyZ3MsIG9wdGlvbnMpIHtcbiAgICBjb25zdCB7IHN0dWJJbnZvY2F0aW9uLCBpbnZvY2F0aW9uLCAuLi5zdHViT3B0aW9ucyB9ID0gdGhpcy5fc3R1YkNhbGwobmFtZSwgRUpTT04uY2xvbmUoYXJncyksIG9wdGlvbnMpO1xuICAgIGlmIChzdHViT3B0aW9ucy5oYXNTdHViKSB7XG4gICAgICBpZiAoXG4gICAgICAgICF0aGlzLl9nZXRJc1NpbXVsYXRpb24oe1xuICAgICAgICAgIGFscmVhZHlJblNpbXVsYXRpb246IHN0dWJPcHRpb25zLmFscmVhZHlJblNpbXVsYXRpb24sXG4gICAgICAgICAgaXNGcm9tQ2FsbEFzeW5jOiBzdHViT3B0aW9ucy5pc0Zyb21DYWxsQXN5bmMsXG4gICAgICAgIH0pXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5fc2F2ZU9yaWdpbmFscygpO1xuICAgICAgfVxuICAgICAgdHJ5IHtcbiAgICAgICAgLypcbiAgICAgICAgICogVGhlIGNvZGUgYmVsb3cgZm9sbG93cyB0aGUgc2FtZSBsb2dpYyBhcyB0aGUgZnVuY3Rpb24gd2l0aFZhbHVlcygpLlxuICAgICAgICAgKlxuICAgICAgICAgKiBCdXQgYXMgdGhlIE1ldGVvciBwYWNrYWdlIGlzIG5vdCBjb21waWxlZCBieSBlY21hc2NyaXB0LCBpdCBpcyB1bmFibGUgdG8gdXNlIG5ld2VyIHN5bnRheCBpbiB0aGUgYnJvd3NlcixcbiAgICAgICAgICogc3VjaCBhcywgdGhlIGFzeW5jL2F3YWl0LlxuICAgICAgICAgKlxuICAgICAgICAgKiBTbywgdG8ga2VlcCBzdXBwb3J0aW5nIG9sZCBicm93c2VycywgbGlrZSBJRSAxMSwgd2UncmUgY3JlYXRpbmcgdGhlIGxvZ2ljIG9uZSBsZXZlbCBhYm92ZS5cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN0IGN1cnJlbnRDb250ZXh0ID0gRERQLl9DdXJyZW50TWV0aG9kSW52b2NhdGlvbi5fc2V0TmV3Q29udGV4dEFuZEdldEN1cnJlbnQoXG4gICAgICAgICAgaW52b2NhdGlvblxuICAgICAgICApO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHN0dWJPcHRpb25zLnN0dWJSZXR1cm5WYWx1ZSA9IGF3YWl0IHN0dWJJbnZvY2F0aW9uKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBzdHViT3B0aW9ucy5leGNlcHRpb24gPSBlO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIEREUC5fQ3VycmVudE1ldGhvZEludm9jYXRpb24uX3NldChjdXJyZW50Q29udGV4dCk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc3R1Yk9wdGlvbnMuZXhjZXB0aW9uID0gZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHN0dWJPcHRpb25zO1xuICB9XG4gIGFzeW5jIF9hcHBseUFzeW5jKHsgbmFtZSwgYXJncywgb3B0aW9ucywgY2FsbGJhY2ssIHN0dWJQcm9taXNlIH0pIHtcbiAgICBjb25zdCBzdHViT3B0aW9ucyA9IGF3YWl0IHN0dWJQcm9taXNlO1xuICAgIHJldHVybiB0aGlzLl9hcHBseShuYW1lLCBzdHViT3B0aW9ucywgYXJncywgb3B0aW9ucywgY2FsbGJhY2spO1xuICB9XG5cbiAgX2FwcGx5KG5hbWUsIHN0dWJDYWxsVmFsdWUsIGFyZ3MsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICAvLyBXZSB3ZXJlIHBhc3NlZCAzIGFyZ3VtZW50cy4gVGhleSBtYXkgYmUgZWl0aGVyIChuYW1lLCBhcmdzLCBvcHRpb25zKVxuICAgIC8vIG9yIChuYW1lLCBhcmdzLCBjYWxsYmFjaylcbiAgICBpZiAoIWNhbGxiYWNrICYmIHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjYWxsYmFjayA9IG9wdGlvbnM7XG4gICAgICBvcHRpb25zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICB9XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwgT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgLy8gWFhYIHdvdWxkIGl0IGJlIGJldHRlciBmb3JtIHRvIGRvIHRoZSBiaW5kaW5nIGluIHN0cmVhbS5vbixcbiAgICAgIC8vIG9yIGNhbGxlciwgaW5zdGVhZCBvZiBoZXJlP1xuICAgICAgLy8gWFhYIGltcHJvdmUgZXJyb3IgbWVzc2FnZSAoYW5kIGhvdyB3ZSByZXBvcnQgaXQpXG4gICAgICBjYWxsYmFjayA9IE1ldGVvci5iaW5kRW52aXJvbm1lbnQoXG4gICAgICAgIGNhbGxiYWNrLFxuICAgICAgICBcImRlbGl2ZXJpbmcgcmVzdWx0IG9mIGludm9raW5nICdcIiArIG5hbWUgKyBcIidcIlxuICAgICAgKTtcbiAgICB9XG4gICAgY29uc3Qge1xuICAgICAgaGFzU3R1YixcbiAgICAgIGV4Y2VwdGlvbixcbiAgICAgIHN0dWJSZXR1cm5WYWx1ZSxcbiAgICAgIGFscmVhZHlJblNpbXVsYXRpb24sXG4gICAgICByYW5kb21TZWVkLFxuICAgIH0gPSBzdHViQ2FsbFZhbHVlO1xuXG4gICAgLy8gS2VlcCBvdXIgYXJncyBzYWZlIGZyb20gbXV0YXRpb24gKGVnIGlmIHdlIGRvbid0IHNlbmQgdGhlIG1lc3NhZ2UgZm9yIGFcbiAgICAvLyB3aGlsZSBiZWNhdXNlIG9mIGEgd2FpdCBtZXRob2QpLlxuICAgIGFyZ3MgPSBFSlNPTi5jbG9uZShhcmdzKTtcbiAgICAvLyBJZiB3ZSdyZSBpbiBhIHNpbXVsYXRpb24sIHN0b3AgYW5kIHJldHVybiB0aGUgcmVzdWx0IHdlIGhhdmUsXG4gICAgLy8gcmF0aGVyIHRoYW4gZ29pbmcgb24gdG8gZG8gYW4gUlBDLiBJZiB0aGVyZSB3YXMgbm8gc3R1YixcbiAgICAvLyB3ZSdsbCBlbmQgdXAgcmV0dXJuaW5nIHVuZGVmaW5lZC5cbiAgICBpZiAoXG4gICAgICB0aGlzLl9nZXRJc1NpbXVsYXRpb24oe1xuICAgICAgICBhbHJlYWR5SW5TaW11bGF0aW9uLFxuICAgICAgICBpc0Zyb21DYWxsQXN5bmM6IHN0dWJDYWxsVmFsdWUuaXNGcm9tQ2FsbEFzeW5jLFxuICAgICAgfSlcbiAgICApIHtcbiAgICAgIGxldCByZXN1bHQ7XG5cbiAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayhleGNlcHRpb24sIHN0dWJSZXR1cm5WYWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoZXhjZXB0aW9uKSB0aHJvdyBleGNlcHRpb247XG4gICAgICAgIHJlc3VsdCA9IHN0dWJSZXR1cm5WYWx1ZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG9wdGlvbnMuX3JldHVybk1ldGhvZEludm9rZXIgPyB7IHJlc3VsdCB9IDogcmVzdWx0O1xuICAgIH1cblxuICAgIC8vIFdlIG9ubHkgY3JlYXRlIHRoZSBtZXRob2RJZCBoZXJlIGJlY2F1c2Ugd2UgZG9uJ3QgYWN0dWFsbHkgbmVlZCBvbmUgaWZcbiAgICAvLyB3ZSdyZSBhbHJlYWR5IGluIGEgc2ltdWxhdGlvblxuICAgIGNvbnN0IG1ldGhvZElkID0gJycgKyBzZWxmLl9uZXh0TWV0aG9kSWQrKztcbiAgICBpZiAoaGFzU3R1Yikge1xuICAgICAgc2VsZi5fcmV0cmlldmVBbmRTdG9yZU9yaWdpbmFscyhtZXRob2RJZCk7XG4gICAgfVxuXG4gICAgLy8gR2VuZXJhdGUgdGhlIEREUCBtZXNzYWdlIGZvciB0aGUgbWV0aG9kIGNhbGwuIE5vdGUgdGhhdCBvbiB0aGUgY2xpZW50LFxuICAgIC8vIGl0IGlzIGltcG9ydGFudCB0aGF0IHRoZSBzdHViIGhhdmUgZmluaXNoZWQgYmVmb3JlIHdlIHNlbmQgdGhlIFJQQywgc29cbiAgICAvLyB0aGF0IHdlIGtub3cgd2UgaGF2ZSBhIGNvbXBsZXRlIGxpc3Qgb2Ygd2hpY2ggbG9jYWwgZG9jdW1lbnRzIHRoZSBzdHViXG4gICAgLy8gd3JvdGUuXG4gICAgY29uc3QgbWVzc2FnZSA9IHtcbiAgICAgIG1zZzogJ21ldGhvZCcsXG4gICAgICBpZDogbWV0aG9kSWQsXG4gICAgICBtZXRob2Q6IG5hbWUsXG4gICAgICBwYXJhbXM6IGFyZ3NcbiAgICB9O1xuXG4gICAgLy8gSWYgYW4gZXhjZXB0aW9uIG9jY3VycmVkIGluIGEgc3R1YiwgYW5kIHdlJ3JlIGlnbm9yaW5nIGl0XG4gICAgLy8gYmVjYXVzZSB3ZSdyZSBkb2luZyBhbiBSUEMgYW5kIHdhbnQgdG8gdXNlIHdoYXQgdGhlIHNlcnZlclxuICAgIC8vIHJldHVybnMgaW5zdGVhZCwgbG9nIGl0IHNvIHRoZSBkZXZlbG9wZXIga25vd3NcbiAgICAvLyAodW5sZXNzIHRoZXkgZXhwbGljaXRseSBhc2sgdG8gc2VlIHRoZSBlcnJvcikuXG4gICAgLy9cbiAgICAvLyBUZXN0cyBjYW4gc2V0IHRoZSAnX2V4cGVjdGVkQnlUZXN0JyBmbGFnIG9uIGFuIGV4Y2VwdGlvbiBzbyBpdCB3b24ndFxuICAgIC8vIGdvIHRvIGxvZy5cbiAgICBpZiAoZXhjZXB0aW9uKSB7XG4gICAgICBpZiAob3B0aW9ucy50aHJvd1N0dWJFeGNlcHRpb25zKSB7XG4gICAgICAgIHRocm93IGV4Y2VwdGlvbjtcbiAgICAgIH0gZWxzZSBpZiAoIWV4Y2VwdGlvbi5fZXhwZWN0ZWRCeVRlc3QpIHtcbiAgICAgICAgTWV0ZW9yLl9kZWJ1ZyhcbiAgICAgICAgICBcIkV4Y2VwdGlvbiB3aGlsZSBzaW11bGF0aW5nIHRoZSBlZmZlY3Qgb2YgaW52b2tpbmcgJ1wiICsgbmFtZSArIFwiJ1wiLFxuICAgICAgICAgIGV4Y2VwdGlvblxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEF0IHRoaXMgcG9pbnQgd2UncmUgZGVmaW5pdGVseSBkb2luZyBhbiBSUEMsIGFuZCB3ZSdyZSBnb2luZyB0b1xuICAgIC8vIHJldHVybiB0aGUgdmFsdWUgb2YgdGhlIFJQQyB0byB0aGUgY2FsbGVyLlxuXG4gICAgLy8gSWYgdGhlIGNhbGxlciBkaWRuJ3QgZ2l2ZSBhIGNhbGxiYWNrLCBkZWNpZGUgd2hhdCB0byBkby5cbiAgICBsZXQgcHJvbWlzZTtcbiAgICBpZiAoIWNhbGxiYWNrKSB7XG4gICAgICBpZiAoXG4gICAgICAgIE1ldGVvci5pc0NsaWVudCAmJlxuICAgICAgICAhb3B0aW9ucy5yZXR1cm5TZXJ2ZXJSZXN1bHRQcm9taXNlICYmXG4gICAgICAgICghb3B0aW9ucy5pc0Zyb21DYWxsQXN5bmMgfHwgb3B0aW9ucy5yZXR1cm5TdHViVmFsdWUpXG4gICAgICApIHtcbiAgICAgICAgY2FsbGJhY2sgPSAoZXJyKSA9PiB7XG4gICAgICAgICAgZXJyICYmIE1ldGVvci5fZGVidWcoXCJFcnJvciBpbnZva2luZyBNZXRob2QgJ1wiICsgbmFtZSArIFwiJ1wiLCBlcnIpO1xuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBjYWxsYmFjayA9ICguLi5hbGxBcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgYXJncyA9IEFycmF5LmZyb20oYWxsQXJncyk7XG4gICAgICAgICAgICBsZXQgZXJyID0gYXJncy5zaGlmdCgpO1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzb2x2ZSguLi5hcmdzKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTZW5kIHRoZSByYW5kb21TZWVkIG9ubHkgaWYgd2UgdXNlZCBpdFxuICAgIGlmIChyYW5kb21TZWVkLnZhbHVlICE9PSBudWxsKSB7XG4gICAgICBtZXNzYWdlLnJhbmRvbVNlZWQgPSByYW5kb21TZWVkLnZhbHVlO1xuICAgIH1cblxuICAgIGNvbnN0IG1ldGhvZEludm9rZXIgPSBuZXcgTWV0aG9kSW52b2tlcih7XG4gICAgICBtZXRob2RJZCxcbiAgICAgIGNhbGxiYWNrOiBjYWxsYmFjayxcbiAgICAgIGNvbm5lY3Rpb246IHNlbGYsXG4gICAgICBvblJlc3VsdFJlY2VpdmVkOiBvcHRpb25zLm9uUmVzdWx0UmVjZWl2ZWQsXG4gICAgICB3YWl0OiAhIW9wdGlvbnMud2FpdCxcbiAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgICBub1JldHJ5OiAhIW9wdGlvbnMubm9SZXRyeVxuICAgIH0pO1xuXG4gICAgbGV0IHJlc3VsdDtcblxuICAgIGlmIChwcm9taXNlKSB7XG4gICAgICByZXN1bHQgPSBvcHRpb25zLnJldHVyblN0dWJWYWx1ZSA/IHByb21pc2UudGhlbigoKSA9PiBzdHViUmV0dXJuVmFsdWUpIDogcHJvbWlzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0ID0gb3B0aW9ucy5yZXR1cm5TdHViVmFsdWUgPyBzdHViUmV0dXJuVmFsdWUgOiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMuX3JldHVybk1ldGhvZEludm9rZXIpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG1ldGhvZEludm9rZXIsXG4gICAgICAgIHJlc3VsdCxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgc2VsZi5fYWRkT3V0c3RhbmRpbmdNZXRob2QobWV0aG9kSW52b2tlciwgb3B0aW9ucyk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIF9zdHViQ2FsbChuYW1lLCBhcmdzLCBvcHRpb25zKSB7XG4gICAgLy8gUnVuIHRoZSBzdHViLCBpZiB3ZSBoYXZlIG9uZS4gVGhlIHN0dWIgaXMgc3VwcG9zZWQgdG8gbWFrZSBzb21lXG4gICAgLy8gdGVtcG9yYXJ5IHdyaXRlcyB0byB0aGUgZGF0YWJhc2UgdG8gZ2l2ZSB0aGUgdXNlciBhIHNtb290aCBleHBlcmllbmNlXG4gICAgLy8gdW50aWwgdGhlIGFjdHVhbCByZXN1bHQgb2YgZXhlY3V0aW5nIHRoZSBtZXRob2QgY29tZXMgYmFjayBmcm9tIHRoZVxuICAgIC8vIHNlcnZlciAod2hlcmV1cG9uIHRoZSB0ZW1wb3Jhcnkgd3JpdGVzIHRvIHRoZSBkYXRhYmFzZSB3aWxsIGJlIHJldmVyc2VkXG4gICAgLy8gZHVyaW5nIHRoZSBiZWdpblVwZGF0ZS9lbmRVcGRhdGUgcHJvY2Vzcy4pXG4gICAgLy9cbiAgICAvLyBOb3JtYWxseSwgd2UgaWdub3JlIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIHN0dWIgKGV2ZW4gaWYgaXQgaXMgYW5cbiAgICAvLyBleGNlcHRpb24pLCBpbiBmYXZvciBvZiB0aGUgcmVhbCByZXR1cm4gdmFsdWUgZnJvbSB0aGUgc2VydmVyLiBUaGVcbiAgICAvLyBleGNlcHRpb24gaXMgaWYgdGhlICpjYWxsZXIqIGlzIGEgc3R1Yi4gSW4gdGhhdCBjYXNlLCB3ZSdyZSBub3QgZ29pbmdcbiAgICAvLyB0byBkbyBhIFJQQywgc28gd2UgdXNlIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIHN0dWIgYXMgb3VyIHJldHVyblxuICAgIC8vIHZhbHVlLlxuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIGNvbnN0IGVuY2xvc2luZyA9IEREUC5fQ3VycmVudE1ldGhvZEludm9jYXRpb24uZ2V0KCk7XG4gICAgY29uc3Qgc3R1YiA9IHNlbGYuX21ldGhvZEhhbmRsZXJzW25hbWVdO1xuICAgIGNvbnN0IGFscmVhZHlJblNpbXVsYXRpb24gPSBlbmNsb3Npbmc/LmlzU2ltdWxhdGlvbjtcbiAgICBjb25zdCBpc0Zyb21DYWxsQXN5bmMgPSBlbmNsb3Npbmc/Ll9pc0Zyb21DYWxsQXN5bmM7XG4gICAgY29uc3QgcmFuZG9tU2VlZCA9IHsgdmFsdWU6IG51bGx9O1xuXG4gICAgY29uc3QgZGVmYXVsdFJldHVybiA9IHtcbiAgICAgIGFscmVhZHlJblNpbXVsYXRpb24sXG4gICAgICByYW5kb21TZWVkLFxuICAgICAgaXNGcm9tQ2FsbEFzeW5jLFxuICAgIH07XG4gICAgaWYgKCFzdHViKSB7XG4gICAgICByZXR1cm4geyAuLi5kZWZhdWx0UmV0dXJuLCBoYXNTdHViOiBmYWxzZSB9O1xuICAgIH1cblxuICAgIC8vIExhemlseSBnZW5lcmF0ZSBhIHJhbmRvbVNlZWQsIG9ubHkgaWYgaXQgaXMgcmVxdWVzdGVkIGJ5IHRoZSBzdHViLlxuICAgIC8vIFRoZSByYW5kb20gc3RyZWFtcyBvbmx5IGhhdmUgdXRpbGl0eSBpZiB0aGV5J3JlIHVzZWQgb24gYm90aCB0aGUgY2xpZW50XG4gICAgLy8gYW5kIHRoZSBzZXJ2ZXI7IGlmIHRoZSBjbGllbnQgZG9lc24ndCBnZW5lcmF0ZSBhbnkgJ3JhbmRvbScgdmFsdWVzXG4gICAgLy8gdGhlbiB3ZSBkb24ndCBleHBlY3QgdGhlIHNlcnZlciB0byBnZW5lcmF0ZSBhbnkgZWl0aGVyLlxuICAgIC8vIExlc3MgY29tbW9ubHksIHRoZSBzZXJ2ZXIgbWF5IHBlcmZvcm0gZGlmZmVyZW50IGFjdGlvbnMgZnJvbSB0aGUgY2xpZW50LFxuICAgIC8vIGFuZCBtYXkgaW4gZmFjdCBnZW5lcmF0ZSB2YWx1ZXMgd2hlcmUgdGhlIGNsaWVudCBkaWQgbm90LCBidXQgd2UgZG9uJ3RcbiAgICAvLyBoYXZlIGFueSBjbGllbnQtc2lkZSB2YWx1ZXMgdG8gbWF0Y2gsIHNvIGV2ZW4gaGVyZSB3ZSBtYXkgYXMgd2VsbCBqdXN0XG4gICAgLy8gdXNlIGEgcmFuZG9tIHNlZWQgb24gdGhlIHNlcnZlci4gIEluIHRoYXQgY2FzZSwgd2UgZG9uJ3QgcGFzcyB0aGVcbiAgICAvLyByYW5kb21TZWVkIHRvIHNhdmUgYmFuZHdpZHRoLCBhbmQgd2UgZG9uJ3QgZXZlbiBnZW5lcmF0ZSBpdCB0byBzYXZlIGFcbiAgICAvLyBiaXQgb2YgQ1BVIGFuZCB0byBhdm9pZCBjb25zdW1pbmcgZW50cm9weS5cblxuICAgIGNvbnN0IHJhbmRvbVNlZWRHZW5lcmF0b3IgPSAoKSA9PiB7XG4gICAgICBpZiAocmFuZG9tU2VlZC52YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICByYW5kb21TZWVkLnZhbHVlID0gRERQQ29tbW9uLm1ha2VScGNTZWVkKGVuY2xvc2luZywgbmFtZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmFuZG9tU2VlZC52YWx1ZTtcbiAgICB9O1xuXG4gICAgY29uc3Qgc2V0VXNlcklkID0gdXNlcklkID0+IHtcbiAgICAgIHNlbGYuc2V0VXNlcklkKHVzZXJJZCk7XG4gICAgfTtcblxuICAgIGNvbnN0IGludm9jYXRpb24gPSBuZXcgRERQQ29tbW9uLk1ldGhvZEludm9jYXRpb24oe1xuICAgICAgbmFtZSxcbiAgICAgIGlzU2ltdWxhdGlvbjogdHJ1ZSxcbiAgICAgIHVzZXJJZDogc2VsZi51c2VySWQoKSxcbiAgICAgIGlzRnJvbUNhbGxBc3luYzogb3B0aW9ucz8uaXNGcm9tQ2FsbEFzeW5jLFxuICAgICAgc2V0VXNlcklkOiBzZXRVc2VySWQsXG4gICAgICByYW5kb21TZWVkKCkge1xuICAgICAgICByZXR1cm4gcmFuZG9tU2VlZEdlbmVyYXRvcigpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gTm90ZSB0aGF0IHVubGlrZSBpbiB0aGUgY29ycmVzcG9uZGluZyBzZXJ2ZXIgY29kZSwgd2UgbmV2ZXIgYXVkaXRcbiAgICAvLyB0aGF0IHN0dWJzIGNoZWNrKCkgdGhlaXIgYXJndW1lbnRzLlxuICAgIGNvbnN0IHN0dWJJbnZvY2F0aW9uID0gKCkgPT4ge1xuICAgICAgICBpZiAoTWV0ZW9yLmlzU2VydmVyKSB7XG4gICAgICAgICAgLy8gQmVjYXVzZSBzYXZlT3JpZ2luYWxzIGFuZCByZXRyaWV2ZU9yaWdpbmFscyBhcmVuJ3QgcmVlbnRyYW50LFxuICAgICAgICAgIC8vIGRvbid0IGFsbG93IHN0dWJzIHRvIHlpZWxkLlxuICAgICAgICAgIHJldHVybiBNZXRlb3IuX25vWWllbGRzQWxsb3dlZCgoKSA9PiB7XG4gICAgICAgICAgICAvLyByZS1jbG9uZSwgc28gdGhhdCB0aGUgc3R1YiBjYW4ndCBhZmZlY3Qgb3VyIGNhbGxlcidzIHZhbHVlc1xuICAgICAgICAgICAgcmV0dXJuIHN0dWIuYXBwbHkoaW52b2NhdGlvbiwgRUpTT04uY2xvbmUoYXJncykpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBzdHViLmFwcGx5KGludm9jYXRpb24sIEVKU09OLmNsb25lKGFyZ3MpKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIHsgLi4uZGVmYXVsdFJldHVybiwgaGFzU3R1YjogdHJ1ZSwgc3R1Ykludm9jYXRpb24sIGludm9jYXRpb24gfTtcbiAgfVxuXG4gIC8vIEJlZm9yZSBjYWxsaW5nIGEgbWV0aG9kIHN0dWIsIHByZXBhcmUgYWxsIHN0b3JlcyB0byB0cmFjayBjaGFuZ2VzIGFuZCBhbGxvd1xuICAvLyBfcmV0cmlldmVBbmRTdG9yZU9yaWdpbmFscyB0byBnZXQgdGhlIG9yaWdpbmFsIHZlcnNpb25zIG9mIGNoYW5nZWRcbiAgLy8gZG9jdW1lbnRzLlxuICBfc2F2ZU9yaWdpbmFscygpIHtcbiAgICBpZiAoISB0aGlzLl93YWl0aW5nRm9yUXVpZXNjZW5jZSgpKSB7XG4gICAgICB0aGlzLl9mbHVzaEJ1ZmZlcmVkV3JpdGVzKCk7XG4gICAgfVxuXG4gICAgT2JqZWN0LnZhbHVlcyh0aGlzLl9zdG9yZXMpLmZvckVhY2goKHN0b3JlKSA9PiB7XG4gICAgICBzdG9yZS5zYXZlT3JpZ2luYWxzKCk7XG4gICAgfSk7XG4gIH1cblxuICAvLyBSZXRyaWV2ZXMgdGhlIG9yaWdpbmFsIHZlcnNpb25zIG9mIGFsbCBkb2N1bWVudHMgbW9kaWZpZWQgYnkgdGhlIHN0dWIgZm9yXG4gIC8vIG1ldGhvZCAnbWV0aG9kSWQnIGZyb20gYWxsIHN0b3JlcyBhbmQgc2F2ZXMgdGhlbSB0byBfc2VydmVyRG9jdW1lbnRzIChrZXllZFxuICAvLyBieSBkb2N1bWVudCkgYW5kIF9kb2N1bWVudHNXcml0dGVuQnlTdHViIChrZXllZCBieSBtZXRob2QgSUQpLlxuICBfcmV0cmlldmVBbmRTdG9yZU9yaWdpbmFscyhtZXRob2RJZCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIGlmIChzZWxmLl9kb2N1bWVudHNXcml0dGVuQnlTdHViW21ldGhvZElkXSlcbiAgICAgIHRocm93IG5ldyBFcnJvcignRHVwbGljYXRlIG1ldGhvZElkIGluIF9yZXRyaWV2ZUFuZFN0b3JlT3JpZ2luYWxzJyk7XG5cbiAgICBjb25zdCBkb2NzV3JpdHRlbiA9IFtdO1xuXG4gICAgT2JqZWN0LmVudHJpZXMoc2VsZi5fc3RvcmVzKS5mb3JFYWNoKChbY29sbGVjdGlvbiwgc3RvcmVdKSA9PiB7XG4gICAgICBjb25zdCBvcmlnaW5hbHMgPSBzdG9yZS5yZXRyaWV2ZU9yaWdpbmFscygpO1xuICAgICAgLy8gbm90IGFsbCBzdG9yZXMgZGVmaW5lIHJldHJpZXZlT3JpZ2luYWxzXG4gICAgICBpZiAoISBvcmlnaW5hbHMpIHJldHVybjtcbiAgICAgIG9yaWdpbmFscy5mb3JFYWNoKChkb2MsIGlkKSA9PiB7XG4gICAgICAgIGRvY3NXcml0dGVuLnB1c2goeyBjb2xsZWN0aW9uLCBpZCB9KTtcbiAgICAgICAgaWYgKCEgaGFzT3duLmNhbGwoc2VsZi5fc2VydmVyRG9jdW1lbnRzLCBjb2xsZWN0aW9uKSkge1xuICAgICAgICAgIHNlbGYuX3NlcnZlckRvY3VtZW50c1tjb2xsZWN0aW9uXSA9IG5ldyBNb25nb0lETWFwKCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc2VydmVyRG9jID0gc2VsZi5fc2VydmVyRG9jdW1lbnRzW2NvbGxlY3Rpb25dLnNldERlZmF1bHQoXG4gICAgICAgICAgaWQsXG4gICAgICAgICAgT2JqZWN0LmNyZWF0ZShudWxsKVxuICAgICAgICApO1xuICAgICAgICBpZiAoc2VydmVyRG9jLndyaXR0ZW5CeVN0dWJzKSB7XG4gICAgICAgICAgLy8gV2UncmUgbm90IHRoZSBmaXJzdCBzdHViIHRvIHdyaXRlIHRoaXMgZG9jLiBKdXN0IGFkZCBvdXIgbWV0aG9kIElEXG4gICAgICAgICAgLy8gdG8gdGhlIHJlY29yZC5cbiAgICAgICAgICBzZXJ2ZXJEb2Mud3JpdHRlbkJ5U3R1YnNbbWV0aG9kSWRdID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBGaXJzdCBzdHViISBTYXZlIHRoZSBvcmlnaW5hbCB2YWx1ZSBhbmQgb3VyIG1ldGhvZCBJRC5cbiAgICAgICAgICBzZXJ2ZXJEb2MuZG9jdW1lbnQgPSBkb2M7XG4gICAgICAgICAgc2VydmVyRG9jLmZsdXNoQ2FsbGJhY2tzID0gW107XG4gICAgICAgICAgc2VydmVyRG9jLndyaXR0ZW5CeVN0dWJzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgICBzZXJ2ZXJEb2Mud3JpdHRlbkJ5U3R1YnNbbWV0aG9kSWRdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gICAgaWYgKCEgaXNFbXB0eShkb2NzV3JpdHRlbikpIHtcbiAgICAgIHNlbGYuX2RvY3VtZW50c1dyaXR0ZW5CeVN0dWJbbWV0aG9kSWRdID0gZG9jc1dyaXR0ZW47XG4gICAgfVxuICB9XG5cbiAgLy8gVGhpcyBpcyB2ZXJ5IG11Y2ggYSBwcml2YXRlIGZ1bmN0aW9uIHdlIHVzZSB0byBtYWtlIHRoZSB0ZXN0c1xuICAvLyB0YWtlIHVwIGZld2VyIHNlcnZlciByZXNvdXJjZXMgYWZ0ZXIgdGhleSBjb21wbGV0ZS5cbiAgX3Vuc3Vic2NyaWJlQWxsKCkge1xuICAgIE9iamVjdC52YWx1ZXModGhpcy5fc3Vic2NyaXB0aW9ucykuZm9yRWFjaCgoc3ViKSA9PiB7XG4gICAgICAvLyBBdm9pZCBraWxsaW5nIHRoZSBhdXRvdXBkYXRlIHN1YnNjcmlwdGlvbiBzbyB0aGF0IGRldmVsb3BlcnNcbiAgICAgIC8vIHN0aWxsIGdldCBob3QgY29kZSBwdXNoZXMgd2hlbiB3cml0aW5nIHRlc3RzLlxuICAgICAgLy9cbiAgICAgIC8vIFhYWCBpdCdzIGEgaGFjayB0byBlbmNvZGUga25vd2xlZGdlIGFib3V0IGF1dG91cGRhdGUgaGVyZSxcbiAgICAgIC8vIGJ1dCBpdCBkb2Vzbid0IHNlZW0gd29ydGggaXQgeWV0IHRvIGhhdmUgYSBzcGVjaWFsIEFQSSBmb3JcbiAgICAgIC8vIHN1YnNjcmlwdGlvbnMgdG8gcHJlc2VydmUgYWZ0ZXIgdW5pdCB0ZXN0cy5cbiAgICAgIGlmIChzdWIubmFtZSAhPT0gJ21ldGVvcl9hdXRvdXBkYXRlX2NsaWVudFZlcnNpb25zJykge1xuICAgICAgICBzdWIuc3RvcCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLy8gU2VuZHMgdGhlIEREUCBzdHJpbmdpZmljYXRpb24gb2YgdGhlIGdpdmVuIG1lc3NhZ2Ugb2JqZWN0XG4gIF9zZW5kKG9iaikge1xuICAgIHRoaXMuX3N0cmVhbS5zZW5kKEREUENvbW1vbi5zdHJpbmdpZnlERFAob2JqKSk7XG4gIH1cblxuICAvLyBBbHdheXMgcXVldWVzIHRoZSBjYWxsIGJlZm9yZSBzZW5kaW5nIHRoZSBtZXNzYWdlXG4gIC8vIFVzZWQsIGZvciBleGFtcGxlLCBvbiBzdWJzY3JpcHRpb24uW2lkXS5zdG9wKCkgdG8gbWFrZSBzdXJlIGEgXCJzdWJcIiBtZXNzYWdlIGlzIGFsd2F5cyBjYWxsZWQgYmVmb3JlIGFuIFwidW5zdWJcIiBtZXNzYWdlXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tZXRlb3IvbWV0ZW9yL2lzc3Vlcy8xMzIxMlxuICAvL1xuICAvLyBUaGlzIGlzIHBhcnQgb2YgdGhlIGFjdHVhbCBmaXggZm9yIHRoZSByZXN0IGNoZWNrOlxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vbWV0ZW9yL21ldGVvci9wdWxsLzEzMjM2XG4gIF9zZW5kUXVldWVkKG9iaikge1xuICAgIHRoaXMuX3NlbmQob2JqLCB0cnVlKTtcbiAgfVxuXG4gIC8vIFdlIGRldGVjdGVkIHZpYSBERFAtbGV2ZWwgaGVhcnRiZWF0cyB0aGF0IHdlJ3ZlIGxvc3QgdGhlXG4gIC8vIGNvbm5lY3Rpb24uICBVbmxpa2UgYGRpc2Nvbm5lY3RgIG9yIGBjbG9zZWAsIGEgbG9zdCBjb25uZWN0aW9uXG4gIC8vIHdpbGwgYmUgYXV0b21hdGljYWxseSByZXRyaWVkLlxuICBfbG9zdENvbm5lY3Rpb24oZXJyb3IpIHtcbiAgICB0aGlzLl9zdHJlYW0uX2xvc3RDb25uZWN0aW9uKGVycm9yKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAbWVtYmVyT2YgTWV0ZW9yXG4gICAqIEBpbXBvcnRGcm9tUGFja2FnZSBtZXRlb3JcbiAgICogQGFsaWFzIE1ldGVvci5zdGF0dXNcbiAgICogQHN1bW1hcnkgR2V0IHRoZSBjdXJyZW50IGNvbm5lY3Rpb24gc3RhdHVzLiBBIHJlYWN0aXZlIGRhdGEgc291cmNlLlxuICAgKiBAbG9jdXMgQ2xpZW50XG4gICAqL1xuICBzdGF0dXMoLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLl9zdHJlYW0uc3RhdHVzKC4uLmFyZ3MpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IEZvcmNlIGFuIGltbWVkaWF0ZSByZWNvbm5lY3Rpb24gYXR0ZW1wdCBpZiB0aGUgY2xpZW50IGlzIG5vdCBjb25uZWN0ZWQgdG8gdGhlIHNlcnZlci5cblxuICBUaGlzIG1ldGhvZCBkb2VzIG5vdGhpbmcgaWYgdGhlIGNsaWVudCBpcyBhbHJlYWR5IGNvbm5lY3RlZC5cbiAgICogQG1lbWJlck9mIE1ldGVvclxuICAgKiBAaW1wb3J0RnJvbVBhY2thZ2UgbWV0ZW9yXG4gICAqIEBhbGlhcyBNZXRlb3IucmVjb25uZWN0XG4gICAqIEBsb2N1cyBDbGllbnRcbiAgICovXG4gIHJlY29ubmVjdCguLi5hcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMuX3N0cmVhbS5yZWNvbm5lY3QoLi4uYXJncyk7XG4gIH1cblxuICAvKipcbiAgICogQG1lbWJlck9mIE1ldGVvclxuICAgKiBAaW1wb3J0RnJvbVBhY2thZ2UgbWV0ZW9yXG4gICAqIEBhbGlhcyBNZXRlb3IuZGlzY29ubmVjdFxuICAgKiBAc3VtbWFyeSBEaXNjb25uZWN0IHRoZSBjbGllbnQgZnJvbSB0aGUgc2VydmVyLlxuICAgKiBAbG9jdXMgQ2xpZW50XG4gICAqL1xuICBkaXNjb25uZWN0KC4uLmFyZ3MpIHtcbiAgICByZXR1cm4gdGhpcy5fc3RyZWFtLmRpc2Nvbm5lY3QoLi4uYXJncyk7XG4gIH1cblxuICBjbG9zZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fc3RyZWFtLmRpc2Nvbm5lY3QoeyBfcGVybWFuZW50OiB0cnVlIH0pO1xuICB9XG5cbiAgLy8vXG4gIC8vLyBSZWFjdGl2ZSB1c2VyIHN5c3RlbVxuICAvLy9cbiAgdXNlcklkKCkge1xuICAgIGlmICh0aGlzLl91c2VySWREZXBzKSB0aGlzLl91c2VySWREZXBzLmRlcGVuZCgpO1xuICAgIHJldHVybiB0aGlzLl91c2VySWQ7XG4gIH1cblxuICBzZXRVc2VySWQodXNlcklkKSB7XG4gICAgLy8gQXZvaWQgaW52YWxpZGF0aW5nIGRlcGVuZGVudHMgaWYgc2V0VXNlcklkIGlzIGNhbGxlZCB3aXRoIGN1cnJlbnQgdmFsdWUuXG4gICAgaWYgKHRoaXMuX3VzZXJJZCA9PT0gdXNlcklkKSByZXR1cm47XG4gICAgdGhpcy5fdXNlcklkID0gdXNlcklkO1xuICAgIGlmICh0aGlzLl91c2VySWREZXBzKSB0aGlzLl91c2VySWREZXBzLmNoYW5nZWQoKTtcbiAgfVxuXG4gIC8vIFJldHVybnMgdHJ1ZSBpZiB3ZSBhcmUgaW4gYSBzdGF0ZSBhZnRlciByZWNvbm5lY3Qgb2Ygd2FpdGluZyBmb3Igc3VicyB0byBiZVxuICAvLyByZXZpdmVkIG9yIGVhcmx5IG1ldGhvZHMgdG8gZmluaXNoIHRoZWlyIGRhdGEsIG9yIHdlIGFyZSB3YWl0aW5nIGZvciBhXG4gIC8vIFwid2FpdFwiIG1ldGhvZCB0byBmaW5pc2guXG4gIF93YWl0aW5nRm9yUXVpZXNjZW5jZSgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgISBpc0VtcHR5KHRoaXMuX3N1YnNCZWluZ1Jldml2ZWQpIHx8XG4gICAgICAhIGlzRW1wdHkodGhpcy5fbWV0aG9kc0Jsb2NraW5nUXVpZXNjZW5jZSlcbiAgICApO1xuICB9XG5cbiAgLy8gUmV0dXJucyB0cnVlIGlmIGFueSBtZXRob2Qgd2hvc2UgbWVzc2FnZSBoYXMgYmVlbiBzZW50IHRvIHRoZSBzZXJ2ZXIgaGFzXG4gIC8vIG5vdCB5ZXQgaW52b2tlZCBpdHMgdXNlciBjYWxsYmFjay5cbiAgX2FueU1ldGhvZHNBcmVPdXRzdGFuZGluZygpIHtcbiAgICBjb25zdCBpbnZva2VycyA9IHRoaXMuX21ldGhvZEludm9rZXJzO1xuICAgIHJldHVybiBPYmplY3QudmFsdWVzKGludm9rZXJzKS5zb21lKChpbnZva2VyKSA9PiAhIWludm9rZXIuc2VudE1lc3NhZ2UpO1xuICB9XG5cbiAgYXN5bmMgX3Byb2Nlc3NPbmVEYXRhTWVzc2FnZShtc2csIHVwZGF0ZXMpIHtcbiAgICBjb25zdCBtZXNzYWdlVHlwZSA9IG1zZy5tc2c7XG5cbiAgICAvLyBtc2cgaXMgb25lIG9mIFsnYWRkZWQnLCAnY2hhbmdlZCcsICdyZW1vdmVkJywgJ3JlYWR5JywgJ3VwZGF0ZWQnXVxuICAgIGlmIChtZXNzYWdlVHlwZSA9PT0gJ2FkZGVkJykge1xuICAgICAgYXdhaXQgdGhpcy5fcHJvY2Vzc19hZGRlZChtc2csIHVwZGF0ZXMpO1xuICAgIH0gZWxzZSBpZiAobWVzc2FnZVR5cGUgPT09ICdjaGFuZ2VkJykge1xuICAgICAgdGhpcy5fcHJvY2Vzc19jaGFuZ2VkKG1zZywgdXBkYXRlcyk7XG4gICAgfSBlbHNlIGlmIChtZXNzYWdlVHlwZSA9PT0gJ3JlbW92ZWQnKSB7XG4gICAgICB0aGlzLl9wcm9jZXNzX3JlbW92ZWQobXNnLCB1cGRhdGVzKTtcbiAgICB9IGVsc2UgaWYgKG1lc3NhZ2VUeXBlID09PSAncmVhZHknKSB7XG4gICAgICB0aGlzLl9wcm9jZXNzX3JlYWR5KG1zZywgdXBkYXRlcyk7XG4gICAgfSBlbHNlIGlmIChtZXNzYWdlVHlwZSA9PT0gJ3VwZGF0ZWQnKSB7XG4gICAgICB0aGlzLl9wcm9jZXNzX3VwZGF0ZWQobXNnLCB1cGRhdGVzKTtcbiAgICB9IGVsc2UgaWYgKG1lc3NhZ2VUeXBlID09PSAnbm9zdWInKSB7XG4gICAgICAvLyBpZ25vcmUgdGhpc1xuICAgIH0gZWxzZSB7XG4gICAgICBNZXRlb3IuX2RlYnVnKCdkaXNjYXJkaW5nIHVua25vd24gbGl2ZWRhdGEgZGF0YSBtZXNzYWdlIHR5cGUnLCBtc2cpO1xuICAgIH1cbiAgfVxuXG4gIF9wcmVwYXJlQnVmZmVyc1RvRmx1c2goKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgaWYgKHNlbGYuX2J1ZmZlcmVkV3JpdGVzRmx1c2hIYW5kbGUpIHtcbiAgICAgIGNsZWFyVGltZW91dChzZWxmLl9idWZmZXJlZFdyaXRlc0ZsdXNoSGFuZGxlKTtcbiAgICAgIHNlbGYuX2J1ZmZlcmVkV3JpdGVzRmx1c2hIYW5kbGUgPSBudWxsO1xuICAgIH1cblxuICAgIHNlbGYuX2J1ZmZlcmVkV3JpdGVzRmx1c2hBdCA9IG51bGw7XG4gICAgLy8gV2UgbmVlZCB0byBjbGVhciB0aGUgYnVmZmVyIGJlZm9yZSBwYXNzaW5nIGl0IHRvXG4gICAgLy8gIHBlcmZvcm1Xcml0ZXMuIEFzIHRoZXJlJ3Mgbm8gZ3VhcmFudGVlIHRoYXQgaXRcbiAgICAvLyAgd2lsbCBleGl0IGNsZWFubHkuXG4gICAgY29uc3Qgd3JpdGVzID0gc2VsZi5fYnVmZmVyZWRXcml0ZXM7XG4gICAgc2VsZi5fYnVmZmVyZWRXcml0ZXMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIHJldHVybiB3cml0ZXM7XG4gIH1cblxuICAvKipcbiAgICogU2VydmVyLXNpZGUgc3RvcmUgdXBkYXRlcyBoYW5kbGVkIGFzeW5jaHJvbm91c2x5XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBhc3luYyBfcGVyZm9ybVdyaXRlc1NlcnZlcih1cGRhdGVzKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICBpZiAoc2VsZi5fcmVzZXRTdG9yZXMgfHwgIWlzRW1wdHkodXBkYXRlcykpIHtcbiAgICAgIC8vIFN0YXJ0IGFsbCBzdG9yZSB1cGRhdGVzIC0ga2VlcGluZyBvcmlnaW5hbCBsb29wIHN0cnVjdHVyZVxuICAgICAgZm9yIChjb25zdCBzdG9yZSBvZiBPYmplY3QudmFsdWVzKHNlbGYuX3N0b3JlcykpIHtcbiAgICAgICAgYXdhaXQgc3RvcmUuYmVnaW5VcGRhdGUoXG4gICAgICAgICAgdXBkYXRlc1tzdG9yZS5fbmFtZV0/Lmxlbmd0aCB8fCAwLFxuICAgICAgICAgIHNlbGYuX3Jlc2V0U3RvcmVzXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHNlbGYuX3Jlc2V0U3RvcmVzID0gZmFsc2U7XG5cbiAgICAgIC8vIFByb2Nlc3MgZWFjaCBzdG9yZSdzIHVwZGF0ZXMgc2VxdWVudGlhbGx5IGFzIGJlZm9yZVxuICAgICAgZm9yIChjb25zdCBbc3RvcmVOYW1lLCBtZXNzYWdlc10gb2YgT2JqZWN0LmVudHJpZXModXBkYXRlcykpIHtcbiAgICAgICAgY29uc3Qgc3RvcmUgPSBzZWxmLl9zdG9yZXNbc3RvcmVOYW1lXTtcbiAgICAgICAgaWYgKHN0b3JlKSB7XG4gICAgICAgICAgLy8gQmF0Y2ggZWFjaCBzdG9yZSdzIG1lc3NhZ2VzIGluIG1vZGVzdCBjaHVua3MgdG8gcHJldmVudCBldmVudCBsb29wIGJsb2NraW5nXG4gICAgICAgICAgLy8gd2hpbGUgbWFpbnRhaW5pbmcgb3BlcmF0aW9uIG9yZGVyXG4gICAgICAgICAgY29uc3QgQ0hVTktfU0laRSA9IDEwMDtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1lc3NhZ2VzLmxlbmd0aDsgaSArPSBDSFVOS19TSVpFKSB7XG4gICAgICAgICAgICBjb25zdCBjaHVuayA9IG1lc3NhZ2VzLnNsaWNlKGksIE1hdGgubWluKGkgKyBDSFVOS19TSVpFLCBtZXNzYWdlcy5sZW5ndGgpKTtcblxuICAgICAgICAgICAgZm9yIChjb25zdCBtc2cgb2YgY2h1bmspIHtcbiAgICAgICAgICAgICAgYXdhaXQgc3RvcmUudXBkYXRlKG1zZyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gcHJvY2Vzcy5uZXh0VGljayhyZXNvbHZlKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFF1ZXVlIHVwZGF0ZXMgZm9yIHVuaW5pdGlhbGl6ZWQgc3RvcmVzXG4gICAgICAgICAgc2VsZi5fdXBkYXRlc0ZvclVua25vd25TdG9yZXNbc3RvcmVOYW1lXSA9XG4gICAgICAgICAgICBzZWxmLl91cGRhdGVzRm9yVW5rbm93blN0b3Jlc1tzdG9yZU5hbWVdIHx8IFtdO1xuICAgICAgICAgIHNlbGYuX3VwZGF0ZXNGb3JVbmtub3duU3RvcmVzW3N0b3JlTmFtZV0ucHVzaCguLi5tZXNzYWdlcyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gQ29tcGxldGUgYWxsIHVwZGF0ZXNcbiAgICAgIGZvciAoY29uc3Qgc3RvcmUgb2YgT2JqZWN0LnZhbHVlcyhzZWxmLl9zdG9yZXMpKSB7XG4gICAgICAgIGF3YWl0IHN0b3JlLmVuZFVwZGF0ZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHNlbGYuX3J1bkFmdGVyVXBkYXRlQ2FsbGJhY2tzKCk7XG4gIH1cblxuICAvKipcbiAgICogQ2xpZW50LXNpZGUgc3RvcmUgdXBkYXRlcyBoYW5kbGVkIHN5bmNocm9ub3VzbHkgZm9yIG9wdGltaXN0aWMgVUlcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9wZXJmb3JtV3JpdGVzQ2xpZW50KHVwZGF0ZXMpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGlmIChzZWxmLl9yZXNldFN0b3JlcyB8fCAhaXNFbXB0eSh1cGRhdGVzKSkge1xuICAgICAgLy8gU3luY2hyb25vdXMgc3RvcmUgdXBkYXRlcyBmb3IgY2xpZW50XG4gICAgICBPYmplY3QudmFsdWVzKHNlbGYuX3N0b3JlcykuZm9yRWFjaChzdG9yZSA9PiB7XG4gICAgICAgIHN0b3JlLmJlZ2luVXBkYXRlKFxuICAgICAgICAgIHVwZGF0ZXNbc3RvcmUuX25hbWVdPy5sZW5ndGggfHwgMCxcbiAgICAgICAgICBzZWxmLl9yZXNldFN0b3Jlc1xuICAgICAgICApO1xuICAgICAgfSk7XG5cbiAgICAgIHNlbGYuX3Jlc2V0U3RvcmVzID0gZmFsc2U7XG5cbiAgICAgIE9iamVjdC5lbnRyaWVzKHVwZGF0ZXMpLmZvckVhY2goKFtzdG9yZU5hbWUsIG1lc3NhZ2VzXSkgPT4ge1xuICAgICAgICBjb25zdCBzdG9yZSA9IHNlbGYuX3N0b3Jlc1tzdG9yZU5hbWVdO1xuICAgICAgICBpZiAoc3RvcmUpIHtcbiAgICAgICAgICBtZXNzYWdlcy5mb3JFYWNoKG1zZyA9PiBzdG9yZS51cGRhdGUobXNnKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VsZi5fdXBkYXRlc0ZvclVua25vd25TdG9yZXNbc3RvcmVOYW1lXSA9XG4gICAgICAgICAgICBzZWxmLl91cGRhdGVzRm9yVW5rbm93blN0b3Jlc1tzdG9yZU5hbWVdIHx8IFtdO1xuICAgICAgICAgIHNlbGYuX3VwZGF0ZXNGb3JVbmtub3duU3RvcmVzW3N0b3JlTmFtZV0ucHVzaCguLi5tZXNzYWdlcyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBPYmplY3QudmFsdWVzKHNlbGYuX3N0b3JlcykuZm9yRWFjaChzdG9yZSA9PiBzdG9yZS5lbmRVcGRhdGUoKSk7XG4gICAgfVxuXG4gICAgc2VsZi5fcnVuQWZ0ZXJVcGRhdGVDYWxsYmFja3MoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlcyBidWZmZXJlZCB3cml0ZXMgZWl0aGVyIHN5bmNocm9ub3VzbHkgKGNsaWVudCkgb3IgYXN5bmMgKHNlcnZlcilcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGFzeW5jIF9mbHVzaEJ1ZmZlcmVkV3JpdGVzKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIGNvbnN0IHdyaXRlcyA9IHNlbGYuX3ByZXBhcmVCdWZmZXJzVG9GbHVzaCgpO1xuXG4gICAgcmV0dXJuIE1ldGVvci5pc0NsaWVudFxuICAgICAgPyBzZWxmLl9wZXJmb3JtV3JpdGVzQ2xpZW50KHdyaXRlcylcbiAgICAgIDogc2VsZi5fcGVyZm9ybVdyaXRlc1NlcnZlcih3cml0ZXMpO1xuICB9XG5cbiAgLy8gQ2FsbCBhbnkgY2FsbGJhY2tzIGRlZmVycmVkIHdpdGggX3J1bldoZW5BbGxTZXJ2ZXJEb2NzQXJlRmx1c2hlZCB3aG9zZVxuICAvLyByZWxldmFudCBkb2NzIGhhdmUgYmVlbiBmbHVzaGVkLCBhcyB3ZWxsIGFzIGRhdGFWaXNpYmxlIGNhbGxiYWNrcyBhdFxuICAvLyByZWNvbm5lY3QtcXVpZXNjZW5jZSB0aW1lLlxuICBfcnVuQWZ0ZXJVcGRhdGVDYWxsYmFja3MoKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgY29uc3QgY2FsbGJhY2tzID0gc2VsZi5fYWZ0ZXJVcGRhdGVDYWxsYmFja3M7XG4gICAgc2VsZi5fYWZ0ZXJVcGRhdGVDYWxsYmFja3MgPSBbXTtcbiAgICBjYWxsYmFja3MuZm9yRWFjaCgoYykgPT4ge1xuICAgICAgYygpO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gRW5zdXJlcyB0aGF0IFwiZlwiIHdpbGwgYmUgY2FsbGVkIGFmdGVyIGFsbCBkb2N1bWVudHMgY3VycmVudGx5IGluXG4gIC8vIF9zZXJ2ZXJEb2N1bWVudHMgaGF2ZSBiZWVuIHdyaXR0ZW4gdG8gdGhlIGxvY2FsIGNhY2hlLiBmIHdpbGwgbm90IGJlIGNhbGxlZFxuICAvLyBpZiB0aGUgY29ubmVjdGlvbiBpcyBsb3N0IGJlZm9yZSB0aGVuIVxuICBfcnVuV2hlbkFsbFNlcnZlckRvY3NBcmVGbHVzaGVkKGYpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBjb25zdCBydW5GQWZ0ZXJVcGRhdGVzID0gKCkgPT4ge1xuICAgICAgc2VsZi5fYWZ0ZXJVcGRhdGVDYWxsYmFja3MucHVzaChmKTtcbiAgICB9O1xuICAgIGxldCB1bmZsdXNoZWRTZXJ2ZXJEb2NDb3VudCA9IDA7XG4gICAgY29uc3Qgb25TZXJ2ZXJEb2NGbHVzaCA9ICgpID0+IHtcbiAgICAgIC0tdW5mbHVzaGVkU2VydmVyRG9jQ291bnQ7XG4gICAgICBpZiAodW5mbHVzaGVkU2VydmVyRG9jQ291bnQgPT09IDApIHtcbiAgICAgICAgLy8gVGhpcyB3YXMgdGhlIGxhc3QgZG9jIHRvIGZsdXNoISBBcnJhbmdlIHRvIHJ1biBmIGFmdGVyIHRoZSB1cGRhdGVzXG4gICAgICAgIC8vIGhhdmUgYmVlbiBhcHBsaWVkLlxuICAgICAgICBydW5GQWZ0ZXJVcGRhdGVzKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIE9iamVjdC52YWx1ZXMoc2VsZi5fc2VydmVyRG9jdW1lbnRzKS5mb3JFYWNoKChzZXJ2ZXJEb2N1bWVudHMpID0+IHtcbiAgICAgIHNlcnZlckRvY3VtZW50cy5mb3JFYWNoKChzZXJ2ZXJEb2MpID0+IHtcbiAgICAgICAgY29uc3Qgd3JpdHRlbkJ5U3R1YkZvckFNZXRob2RXaXRoU2VudE1lc3NhZ2UgPVxuICAgICAgICAgIGtleXMoc2VydmVyRG9jLndyaXR0ZW5CeVN0dWJzKS5zb21lKG1ldGhvZElkID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGludm9rZXIgPSBzZWxmLl9tZXRob2RJbnZva2Vyc1ttZXRob2RJZF07XG4gICAgICAgICAgICByZXR1cm4gaW52b2tlciAmJiBpbnZva2VyLnNlbnRNZXNzYWdlO1xuICAgICAgICAgIH0pO1xuXG4gICAgICAgIGlmICh3cml0dGVuQnlTdHViRm9yQU1ldGhvZFdpdGhTZW50TWVzc2FnZSkge1xuICAgICAgICAgICsrdW5mbHVzaGVkU2VydmVyRG9jQ291bnQ7XG4gICAgICAgICAgc2VydmVyRG9jLmZsdXNoQ2FsbGJhY2tzLnB1c2gob25TZXJ2ZXJEb2NGbHVzaCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIGlmICh1bmZsdXNoZWRTZXJ2ZXJEb2NDb3VudCA9PT0gMCkge1xuICAgICAgLy8gVGhlcmUgYXJlbid0IGFueSBidWZmZXJlZCBkb2NzIC0tLSB3ZSBjYW4gY2FsbCBmIGFzIHNvb24gYXMgdGhlIGN1cnJlbnRcbiAgICAgIC8vIHJvdW5kIG9mIHVwZGF0ZXMgaXMgYXBwbGllZCFcbiAgICAgIHJ1bkZBZnRlclVwZGF0ZXMoKTtcbiAgICB9XG4gIH1cblxuICBfYWRkT3V0c3RhbmRpbmdNZXRob2QobWV0aG9kSW52b2tlciwgb3B0aW9ucykge1xuICAgIGlmIChvcHRpb25zPy53YWl0KSB7XG4gICAgICAvLyBJdCdzIGEgd2FpdCBtZXRob2QhIFdhaXQgbWV0aG9kcyBnbyBpbiB0aGVpciBvd24gYmxvY2suXG4gICAgICB0aGlzLl9vdXRzdGFuZGluZ01ldGhvZEJsb2Nrcy5wdXNoKHtcbiAgICAgICAgd2FpdDogdHJ1ZSxcbiAgICAgICAgbWV0aG9kczogW21ldGhvZEludm9rZXJdXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gTm90IGEgd2FpdCBtZXRob2QuIFN0YXJ0IGEgbmV3IGJsb2NrIGlmIHRoZSBwcmV2aW91cyBibG9jayB3YXMgYSB3YWl0XG4gICAgICAvLyBibG9jaywgYW5kIGFkZCBpdCB0byB0aGUgbGFzdCBibG9jayBvZiBtZXRob2RzLlxuICAgICAgaWYgKGlzRW1wdHkodGhpcy5fb3V0c3RhbmRpbmdNZXRob2RCbG9ja3MpIHx8XG4gICAgICAgICAgbGFzdCh0aGlzLl9vdXRzdGFuZGluZ01ldGhvZEJsb2Nrcykud2FpdCkge1xuICAgICAgICB0aGlzLl9vdXRzdGFuZGluZ01ldGhvZEJsb2Nrcy5wdXNoKHtcbiAgICAgICAgICB3YWl0OiBmYWxzZSxcbiAgICAgICAgICBtZXRob2RzOiBbXSxcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGxhc3QodGhpcy5fb3V0c3RhbmRpbmdNZXRob2RCbG9ja3MpLm1ldGhvZHMucHVzaChtZXRob2RJbnZva2VyKTtcbiAgICB9XG5cbiAgICAvLyBJZiB3ZSBhZGRlZCBpdCB0byB0aGUgZmlyc3QgYmxvY2ssIHNlbmQgaXQgb3V0IG5vdy5cbiAgICBpZiAodGhpcy5fb3V0c3RhbmRpbmdNZXRob2RCbG9ja3MubGVuZ3RoID09PSAxKSB7XG4gICAgICBtZXRob2RJbnZva2VyLnNlbmRNZXNzYWdlKCk7XG4gICAgfVxuICB9XG5cbiAgLy8gQ2FsbGVkIGJ5IE1ldGhvZEludm9rZXIgYWZ0ZXIgYSBtZXRob2QncyBjYWxsYmFjayBpcyBpbnZva2VkLiAgSWYgdGhpcyB3YXNcbiAgLy8gdGhlIGxhc3Qgb3V0c3RhbmRpbmcgbWV0aG9kIGluIHRoZSBjdXJyZW50IGJsb2NrLCBydW5zIHRoZSBuZXh0IGJsb2NrLiBJZlxuICAvLyB0aGVyZSBhcmUgbm8gbW9yZSBtZXRob2RzLCBjb25zaWRlciBhY2NlcHRpbmcgYSBob3QgY29kZSBwdXNoLlxuICBfb3V0c3RhbmRpbmdNZXRob2RGaW5pc2hlZCgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBpZiAoc2VsZi5fYW55TWV0aG9kc0FyZU91dHN0YW5kaW5nKCkpIHJldHVybjtcblxuICAgIC8vIE5vIG1ldGhvZHMgYXJlIG91dHN0YW5kaW5nLiBUaGlzIHNob3VsZCBtZWFuIHRoYXQgdGhlIGZpcnN0IGJsb2NrIG9mXG4gICAgLy8gbWV0aG9kcyBpcyBlbXB0eS4gKE9yIGl0IG1pZ2h0IG5vdCBleGlzdCwgaWYgdGhpcyB3YXMgYSBtZXRob2QgdGhhdFxuICAgIC8vIGhhbGYtZmluaXNoZWQgYmVmb3JlIGRpc2Nvbm5lY3QvcmVjb25uZWN0LilcbiAgICBpZiAoISBpc0VtcHR5KHNlbGYuX291dHN0YW5kaW5nTWV0aG9kQmxvY2tzKSkge1xuICAgICAgY29uc3QgZmlyc3RCbG9jayA9IHNlbGYuX291dHN0YW5kaW5nTWV0aG9kQmxvY2tzLnNoaWZ0KCk7XG4gICAgICBpZiAoISBpc0VtcHR5KGZpcnN0QmxvY2subWV0aG9kcykpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAnTm8gbWV0aG9kcyBvdXRzdGFuZGluZyBidXQgbm9uZW1wdHkgYmxvY2s6ICcgK1xuICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoZmlyc3RCbG9jaylcbiAgICAgICAgKTtcblxuICAgICAgLy8gU2VuZCB0aGUgb3V0c3RhbmRpbmcgbWV0aG9kcyBub3cgaW4gdGhlIGZpcnN0IGJsb2NrLlxuICAgICAgaWYgKCEgaXNFbXB0eShzZWxmLl9vdXRzdGFuZGluZ01ldGhvZEJsb2NrcykpXG4gICAgICAgIHNlbGYuX3NlbmRPdXRzdGFuZGluZ01ldGhvZHMoKTtcbiAgICB9XG5cbiAgICAvLyBNYXliZSBhY2NlcHQgYSBob3QgY29kZSBwdXNoLlxuICAgIHNlbGYuX21heWJlTWlncmF0ZSgpO1xuICB9XG5cbiAgLy8gU2VuZHMgbWVzc2FnZXMgZm9yIGFsbCB0aGUgbWV0aG9kcyBpbiB0aGUgZmlyc3QgYmxvY2sgaW5cbiAgLy8gX291dHN0YW5kaW5nTWV0aG9kQmxvY2tzLlxuICBfc2VuZE91dHN0YW5kaW5nTWV0aG9kcygpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIGlmIChpc0VtcHR5KHNlbGYuX291dHN0YW5kaW5nTWV0aG9kQmxvY2tzKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHNlbGYuX291dHN0YW5kaW5nTWV0aG9kQmxvY2tzWzBdLm1ldGhvZHMuZm9yRWFjaChtID0+IHtcbiAgICAgIG0uc2VuZE1lc3NhZ2UoKTtcbiAgICB9KTtcbiAgfVxuXG4gIF9zZW5kT3V0c3RhbmRpbmdNZXRob2RCbG9ja3NNZXNzYWdlcyhvbGRPdXRzdGFuZGluZ01ldGhvZEJsb2Nrcykge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIGlmIChpc0VtcHR5KG9sZE91dHN0YW5kaW5nTWV0aG9kQmxvY2tzKSkgcmV0dXJuO1xuXG4gICAgLy8gV2UgaGF2ZSBhdCBsZWFzdCBvbmUgYmxvY2sgd29ydGggb2Ygb2xkIG91dHN0YW5kaW5nIG1ldGhvZHMgdG8gdHJ5XG4gICAgLy8gYWdhaW4uIEZpcnN0OiBkaWQgb25SZWNvbm5lY3QgYWN0dWFsbHkgc2VuZCBhbnl0aGluZz8gSWYgbm90LCB3ZSBqdXN0XG4gICAgLy8gcmVzdG9yZSBhbGwgb3V0c3RhbmRpbmcgbWV0aG9kcyBhbmQgcnVuIHRoZSBmaXJzdCBibG9jay5cbiAgICBpZiAoaXNFbXB0eShzZWxmLl9vdXRzdGFuZGluZ01ldGhvZEJsb2NrcykpIHtcbiAgICAgIHNlbGYuX291dHN0YW5kaW5nTWV0aG9kQmxvY2tzID0gb2xkT3V0c3RhbmRpbmdNZXRob2RCbG9ja3M7XG4gICAgICBzZWxmLl9zZW5kT3V0c3RhbmRpbmdNZXRob2RzKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gT0ssIHRoZXJlIGFyZSBibG9ja3Mgb24gYm90aCBzaWRlcy4gU3BlY2lhbCBjYXNlOiBtZXJnZSB0aGUgbGFzdCBibG9jayBvZlxuICAgIC8vIHRoZSByZWNvbm5lY3QgbWV0aG9kcyB3aXRoIHRoZSBmaXJzdCBibG9jayBvZiB0aGUgb3JpZ2luYWwgbWV0aG9kcywgaWZcbiAgICAvLyBuZWl0aGVyIG9mIHRoZW0gYXJlIFwid2FpdFwiIGJsb2Nrcy5cbiAgICBpZiAoXG4gICAgICAhbGFzdChzZWxmLl9vdXRzdGFuZGluZ01ldGhvZEJsb2Nrcykud2FpdCAmJlxuICAgICAgIW9sZE91dHN0YW5kaW5nTWV0aG9kQmxvY2tzWzBdLndhaXRcbiAgICApIHtcbiAgICAgIG9sZE91dHN0YW5kaW5nTWV0aG9kQmxvY2tzWzBdLm1ldGhvZHMuZm9yRWFjaCgobSkgPT4ge1xuICAgICAgICBsYXN0KHNlbGYuX291dHN0YW5kaW5nTWV0aG9kQmxvY2tzKS5tZXRob2RzLnB1c2gobSk7XG5cbiAgICAgICAgLy8gSWYgdGhpcyBcImxhc3QgYmxvY2tcIiBpcyBhbHNvIHRoZSBmaXJzdCBibG9jaywgc2VuZCB0aGUgbWVzc2FnZS5cbiAgICAgICAgaWYgKHNlbGYuX291dHN0YW5kaW5nTWV0aG9kQmxvY2tzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgIG0uc2VuZE1lc3NhZ2UoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIG9sZE91dHN0YW5kaW5nTWV0aG9kQmxvY2tzLnNoaWZ0KCk7XG4gICAgfVxuXG4gICAgLy8gTm93IGFkZCB0aGUgcmVzdCBvZiB0aGUgb3JpZ2luYWwgYmxvY2tzIG9uLlxuICAgIHNlbGYuX291dHN0YW5kaW5nTWV0aG9kQmxvY2tzLnB1c2goLi4ub2xkT3V0c3RhbmRpbmdNZXRob2RCbG9ja3MpO1xuICB9XG5cbiAgX2NhbGxPblJlY29ubmVjdEFuZFNlbmRBcHByb3ByaWF0ZU91dHN0YW5kaW5nTWV0aG9kcygpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBjb25zdCBvbGRPdXRzdGFuZGluZ01ldGhvZEJsb2NrcyA9IHNlbGYuX291dHN0YW5kaW5nTWV0aG9kQmxvY2tzO1xuICAgIHNlbGYuX291dHN0YW5kaW5nTWV0aG9kQmxvY2tzID0gW107XG5cbiAgICBzZWxmLm9uUmVjb25uZWN0ICYmIHNlbGYub25SZWNvbm5lY3QoKTtcbiAgICBERFAuX3JlY29ubmVjdEhvb2suZWFjaCgoY2FsbGJhY2spID0+IHtcbiAgICAgIGNhbGxiYWNrKHNlbGYpO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG5cbiAgICBzZWxmLl9zZW5kT3V0c3RhbmRpbmdNZXRob2RCbG9ja3NNZXNzYWdlcyhvbGRPdXRzdGFuZGluZ01ldGhvZEJsb2Nrcyk7XG4gIH1cblxuICAvLyBXZSBjYW4gYWNjZXB0IGEgaG90IGNvZGUgcHVzaCBpZiB0aGVyZSBhcmUgbm8gbWV0aG9kcyBpbiBmbGlnaHQuXG4gIF9yZWFkeVRvTWlncmF0ZSgpIHtcbiAgICByZXR1cm4gaXNFbXB0eSh0aGlzLl9tZXRob2RJbnZva2Vycyk7XG4gIH1cblxuICAvLyBJZiB3ZSB3ZXJlIGJsb2NraW5nIGEgbWlncmF0aW9uLCBzZWUgaWYgaXQncyBub3cgcG9zc2libGUgdG8gY29udGludWUuXG4gIC8vIENhbGwgd2hlbmV2ZXIgdGhlIHNldCBvZiBvdXRzdGFuZGluZy9ibG9ja2VkIG1ldGhvZHMgc2hyaW5rcy5cbiAgX21heWJlTWlncmF0ZSgpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICBpZiAoc2VsZi5fcmV0cnlNaWdyYXRlICYmIHNlbGYuX3JlYWR5VG9NaWdyYXRlKCkpIHtcbiAgICAgIHNlbGYuX3JldHJ5TWlncmF0ZSgpO1xuICAgICAgc2VsZi5fcmV0cnlNaWdyYXRlID0gbnVsbDtcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCB7IEREUENvbW1vbiB9IGZyb20gJ21ldGVvci9kZHAtY29tbW9uJztcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgRERQIH0gZnJvbSAnLi9uYW1lc3BhY2UuanMnO1xuaW1wb3J0IHsgRUpTT04gfSBmcm9tICdtZXRlb3IvZWpzb24nO1xuaW1wb3J0IHsgaXNFbXB0eSwgaGFzT3duIH0gZnJvbSBcIm1ldGVvci9kZHAtY29tbW9uL3V0aWxzXCI7XG5cbmV4cG9ydCBjbGFzcyBNZXNzYWdlUHJvY2Vzc29ycyB7XG4gIGNvbnN0cnVjdG9yKGNvbm5lY3Rpb24pIHtcbiAgICB0aGlzLl9jb25uZWN0aW9uID0gY29ubmVjdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBQcm9jZXNzIHRoZSBjb25uZWN0aW9uIG1lc3NhZ2UgYW5kIHNldCB1cCB0aGUgc2Vzc2lvblxuICAgKiBAcGFyYW0ge09iamVjdH0gbXNnIFRoZSBjb25uZWN0aW9uIG1lc3NhZ2VcbiAgICovXG4gIGFzeW5jIF9saXZlZGF0YV9jb25uZWN0ZWQobXNnKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXMuX2Nvbm5lY3Rpb247XG5cbiAgICBpZiAoc2VsZi5fdmVyc2lvbiAhPT0gJ3ByZTEnICYmIHNlbGYuX2hlYXJ0YmVhdEludGVydmFsICE9PSAwKSB7XG4gICAgICBzZWxmLl9oZWFydGJlYXQgPSBuZXcgRERQQ29tbW9uLkhlYXJ0YmVhdCh7XG4gICAgICAgIGhlYXJ0YmVhdEludGVydmFsOiBzZWxmLl9oZWFydGJlYXRJbnRlcnZhbCxcbiAgICAgICAgaGVhcnRiZWF0VGltZW91dDogc2VsZi5faGVhcnRiZWF0VGltZW91dCxcbiAgICAgICAgb25UaW1lb3V0KCkge1xuICAgICAgICAgIHNlbGYuX2xvc3RDb25uZWN0aW9uKFxuICAgICAgICAgICAgbmV3IEREUC5Db25uZWN0aW9uRXJyb3IoJ0REUCBoZWFydGJlYXQgdGltZWQgb3V0JylcbiAgICAgICAgICApO1xuICAgICAgICB9LFxuICAgICAgICBzZW5kUGluZygpIHtcbiAgICAgICAgICBzZWxmLl9zZW5kKHsgbXNnOiAncGluZycgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgc2VsZi5faGVhcnRiZWF0LnN0YXJ0KCk7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhpcyBpcyBhIHJlY29ubmVjdCwgd2UnbGwgaGF2ZSB0byByZXNldCBhbGwgc3RvcmVzLlxuICAgIGlmIChzZWxmLl9sYXN0U2Vzc2lvbklkKSBzZWxmLl9yZXNldFN0b3JlcyA9IHRydWU7XG5cbiAgICBsZXQgcmVjb25uZWN0ZWRUb1ByZXZpb3VzU2Vzc2lvbjtcbiAgICBpZiAodHlwZW9mIG1zZy5zZXNzaW9uID09PSAnc3RyaW5nJykge1xuICAgICAgcmVjb25uZWN0ZWRUb1ByZXZpb3VzU2Vzc2lvbiA9IHNlbGYuX2xhc3RTZXNzaW9uSWQgPT09IG1zZy5zZXNzaW9uO1xuICAgICAgc2VsZi5fbGFzdFNlc3Npb25JZCA9IG1zZy5zZXNzaW9uO1xuICAgIH1cblxuICAgIGlmIChyZWNvbm5lY3RlZFRvUHJldmlvdXNTZXNzaW9uKSB7XG4gICAgICAvLyBTdWNjZXNzZnVsIHJlY29ubmVjdGlvbiAtLSBwaWNrIHVwIHdoZXJlIHdlIGxlZnQgb2ZmLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFNlcnZlciBkb2Vzbid0IGhhdmUgb3VyIGRhdGEgYW55bW9yZS4gUmUtc3luYyBhIG5ldyBzZXNzaW9uLlxuXG4gICAgLy8gRm9yZ2V0IGFib3V0IG1lc3NhZ2VzIHdlIHdlcmUgYnVmZmVyaW5nIGZvciB1bmtub3duIGNvbGxlY3Rpb25zLiBUaGV5J2xsXG4gICAgLy8gYmUgcmVzZW50IGlmIHN0aWxsIHJlbGV2YW50LlxuICAgIHNlbGYuX3VwZGF0ZXNGb3JVbmtub3duU3RvcmVzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblxuICAgIGlmIChzZWxmLl9yZXNldFN0b3Jlcykge1xuICAgICAgLy8gRm9yZ2V0IGFib3V0IHRoZSBlZmZlY3RzIG9mIHN0dWJzLiBXZSdsbCBiZSByZXNldHRpbmcgYWxsIGNvbGxlY3Rpb25zXG4gICAgICAvLyBhbnl3YXkuXG4gICAgICBzZWxmLl9kb2N1bWVudHNXcml0dGVuQnlTdHViID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgIHNlbGYuX3NlcnZlckRvY3VtZW50cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgfVxuXG4gICAgLy8gQ2xlYXIgX2FmdGVyVXBkYXRlQ2FsbGJhY2tzLlxuICAgIHNlbGYuX2FmdGVyVXBkYXRlQ2FsbGJhY2tzID0gW107XG5cbiAgICAvLyBNYXJrIGFsbCBuYW1lZCBzdWJzY3JpcHRpb25zIHdoaWNoIGFyZSByZWFkeSBhcyBuZWVkaW5nIHRvIGJlIHJldml2ZWQuXG4gICAgc2VsZi5fc3Vic0JlaW5nUmV2aXZlZCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgT2JqZWN0LmVudHJpZXMoc2VsZi5fc3Vic2NyaXB0aW9ucykuZm9yRWFjaCgoW2lkLCBzdWJdKSA9PiB7XG4gICAgICBpZiAoc3ViLnJlYWR5KSB7XG4gICAgICAgIHNlbGYuX3N1YnNCZWluZ1Jldml2ZWRbaWRdID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIEFycmFuZ2UgZm9yIFwiaGFsZi1maW5pc2hlZFwiIG1ldGhvZHMgdG8gaGF2ZSB0aGVpciBjYWxsYmFja3MgcnVuLCBhbmRcbiAgICAvLyB0cmFjayBtZXRob2RzIHRoYXQgd2VyZSBzZW50IG9uIHRoaXMgY29ubmVjdGlvbiBzbyB0aGF0IHdlIGRvbid0XG4gICAgLy8gcXVpZXNjZSB1bnRpbCB0aGV5IGFyZSBhbGwgZG9uZS5cbiAgICAvL1xuICAgIC8vIFN0YXJ0IGJ5IGNsZWFyaW5nIF9tZXRob2RzQmxvY2tpbmdRdWllc2NlbmNlOiBtZXRob2RzIHNlbnQgYmVmb3JlXG4gICAgLy8gcmVjb25uZWN0IGRvbid0IG1hdHRlciwgYW5kIGFueSBcIndhaXRcIiBtZXRob2RzIHNlbnQgb24gdGhlIG5ldyBjb25uZWN0aW9uXG4gICAgLy8gdGhhdCB3ZSBkcm9wIGhlcmUgd2lsbCBiZSByZXN0b3JlZCBieSB0aGUgbG9vcCBiZWxvdy5cbiAgICBzZWxmLl9tZXRob2RzQmxvY2tpbmdRdWllc2NlbmNlID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICBpZiAoc2VsZi5fcmVzZXRTdG9yZXMpIHtcbiAgICAgIGNvbnN0IGludm9rZXJzID0gc2VsZi5fbWV0aG9kSW52b2tlcnM7XG4gICAgICBPYmplY3Qua2V5cyhpbnZva2VycykuZm9yRWFjaChpZCA9PiB7XG4gICAgICAgIGNvbnN0IGludm9rZXIgPSBpbnZva2Vyc1tpZF07XG4gICAgICAgIGlmIChpbnZva2VyLmdvdFJlc3VsdCgpKSB7XG4gICAgICAgICAgLy8gVGhpcyBtZXRob2QgYWxyZWFkeSBnb3QgaXRzIHJlc3VsdCwgYnV0IGl0IGRpZG4ndCBjYWxsIGl0cyBjYWxsYmFja1xuICAgICAgICAgIC8vIGJlY2F1c2UgaXRzIGRhdGEgZGlkbid0IGJlY29tZSB2aXNpYmxlLiBXZSBkaWQgbm90IHJlc2VuZCB0aGVcbiAgICAgICAgICAvLyBtZXRob2QgUlBDLiBXZSdsbCBjYWxsIGl0cyBjYWxsYmFjayB3aGVuIHdlIGdldCBhIGZ1bGwgcXVpZXNjZSxcbiAgICAgICAgICAvLyBzaW5jZSB0aGF0J3MgYXMgY2xvc2UgYXMgd2UnbGwgZ2V0IHRvIFwiZGF0YSBtdXN0IGJlIHZpc2libGVcIi5cbiAgICAgICAgICBzZWxmLl9hZnRlclVwZGF0ZUNhbGxiYWNrcy5wdXNoKFxuICAgICAgICAgICAgKC4uLmFyZ3MpID0+IGludm9rZXIuZGF0YVZpc2libGUoLi4uYXJncylcbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKGludm9rZXIuc2VudE1lc3NhZ2UpIHtcbiAgICAgICAgICAvLyBUaGlzIG1ldGhvZCBoYXMgYmVlbiBzZW50IG9uIHRoaXMgY29ubmVjdGlvbiAobWF5YmUgYXMgYSByZXNlbmRcbiAgICAgICAgICAvLyBmcm9tIHRoZSBsYXN0IGNvbm5lY3Rpb24sIG1heWJlIGZyb20gb25SZWNvbm5lY3QsIG1heWJlIGp1c3QgdmVyeVxuICAgICAgICAgIC8vIHF1aWNrbHkgYmVmb3JlIHByb2Nlc3NpbmcgdGhlIGNvbm5lY3RlZCBtZXNzYWdlKS5cbiAgICAgICAgICAvL1xuICAgICAgICAgIC8vIFdlIGRvbid0IG5lZWQgdG8gZG8gYW55dGhpbmcgc3BlY2lhbCB0byBlbnN1cmUgaXRzIGNhbGxiYWNrcyBnZXRcbiAgICAgICAgICAvLyBjYWxsZWQsIGJ1dCB3ZSdsbCBjb3VudCBpdCBhcyBhIG1ldGhvZCB3aGljaCBpcyBwcmV2ZW50aW5nXG4gICAgICAgICAgLy8gcmVjb25uZWN0IHF1aWVzY2VuY2UuIChlZywgaXQgbWlnaHQgYmUgYSBsb2dpbiBtZXRob2QgdGhhdCB3YXMgcnVuXG4gICAgICAgICAgLy8gZnJvbSBvblJlY29ubmVjdCwgYW5kIHdlIGRvbid0IHdhbnQgdG8gc2VlIGZsaWNrZXIgYnkgc2VlaW5nIGFcbiAgICAgICAgICAvLyBsb2dnZWQtb3V0IHN0YXRlLilcbiAgICAgICAgICBzZWxmLl9tZXRob2RzQmxvY2tpbmdRdWllc2NlbmNlW2ludm9rZXIubWV0aG9kSWRdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgc2VsZi5fbWVzc2FnZXNCdWZmZXJlZFVudGlsUXVpZXNjZW5jZSA9IFtdO1xuXG4gICAgLy8gSWYgd2UncmUgbm90IHdhaXRpbmcgb24gYW55IG1ldGhvZHMgb3Igc3Vicywgd2UgY2FuIHJlc2V0IHRoZSBzdG9yZXMgYW5kXG4gICAgLy8gY2FsbCB0aGUgY2FsbGJhY2tzIGltbWVkaWF0ZWx5LlxuICAgIGlmICghc2VsZi5fd2FpdGluZ0ZvclF1aWVzY2VuY2UoKSkge1xuICAgICAgaWYgKHNlbGYuX3Jlc2V0U3RvcmVzKSB7XG4gICAgICAgIGZvciAoY29uc3Qgc3RvcmUgb2YgT2JqZWN0LnZhbHVlcyhzZWxmLl9zdG9yZXMpKSB7XG4gICAgICAgICAgYXdhaXQgc3RvcmUuYmVnaW5VcGRhdGUoMCwgdHJ1ZSk7XG4gICAgICAgICAgYXdhaXQgc3RvcmUuZW5kVXBkYXRlKCk7XG4gICAgICAgIH1cbiAgICAgICAgc2VsZi5fcmVzZXRTdG9yZXMgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHNlbGYuX3J1bkFmdGVyVXBkYXRlQ2FsbGJhY2tzKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IFByb2Nlc3MgdmFyaW91cyBkYXRhIG1lc3NhZ2VzIGZyb20gdGhlIHNlcnZlclxuICAgKiBAcGFyYW0ge09iamVjdH0gbXNnIFRoZSBkYXRhIG1lc3NhZ2VcbiAgICovXG4gIGFzeW5jIF9saXZlZGF0YV9kYXRhKG1zZykge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzLl9jb25uZWN0aW9uO1xuXG4gICAgaWYgKHNlbGYuX3dhaXRpbmdGb3JRdWllc2NlbmNlKCkpIHtcbiAgICAgIHNlbGYuX21lc3NhZ2VzQnVmZmVyZWRVbnRpbFF1aWVzY2VuY2UucHVzaChtc2cpO1xuXG4gICAgICBpZiAobXNnLm1zZyA9PT0gJ25vc3ViJykge1xuICAgICAgICBkZWxldGUgc2VsZi5fc3Vic0JlaW5nUmV2aXZlZFttc2cuaWRdO1xuICAgICAgfVxuXG4gICAgICBpZiAobXNnLnN1YnMpIHtcbiAgICAgICAgbXNnLnN1YnMuZm9yRWFjaChzdWJJZCA9PiB7XG4gICAgICAgICAgZGVsZXRlIHNlbGYuX3N1YnNCZWluZ1Jldml2ZWRbc3ViSWRdO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgaWYgKG1zZy5tZXRob2RzKSB7XG4gICAgICAgIG1zZy5tZXRob2RzLmZvckVhY2gobWV0aG9kSWQgPT4ge1xuICAgICAgICAgIGRlbGV0ZSBzZWxmLl9tZXRob2RzQmxvY2tpbmdRdWllc2NlbmNlW21ldGhvZElkXTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChzZWxmLl93YWl0aW5nRm9yUXVpZXNjZW5jZSgpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gTm8gbWV0aG9kcyBvciBzdWJzIGFyZSBibG9ja2luZyBxdWllc2NlbmNlIVxuICAgICAgLy8gV2UnbGwgbm93IHByb2Nlc3MgYW5kIGFsbCBvZiBvdXIgYnVmZmVyZWQgbWVzc2FnZXMsIHJlc2V0IGFsbCBzdG9yZXMsXG4gICAgICAvLyBhbmQgYXBwbHkgdGhlbSBhbGwgYXQgb25jZS5cbiAgICAgIGNvbnN0IGJ1ZmZlcmVkTWVzc2FnZXMgPSBzZWxmLl9tZXNzYWdlc0J1ZmZlcmVkVW50aWxRdWllc2NlbmNlO1xuICAgICAgZm9yIChjb25zdCBidWZmZXJlZE1lc3NhZ2Ugb2YgT2JqZWN0LnZhbHVlcyhidWZmZXJlZE1lc3NhZ2VzKSkge1xuICAgICAgICBhd2FpdCB0aGlzLl9wcm9jZXNzT25lRGF0YU1lc3NhZ2UoXG4gICAgICAgICAgYnVmZmVyZWRNZXNzYWdlLFxuICAgICAgICAgIHNlbGYuX2J1ZmZlcmVkV3JpdGVzXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBzZWxmLl9tZXNzYWdlc0J1ZmZlcmVkVW50aWxRdWllc2NlbmNlID0gW107XG4gICAgfSBlbHNlIHtcbiAgICAgIGF3YWl0IHRoaXMuX3Byb2Nlc3NPbmVEYXRhTWVzc2FnZShtc2csIHNlbGYuX2J1ZmZlcmVkV3JpdGVzKTtcbiAgICB9XG5cbiAgICAvLyBJbW1lZGlhdGVseSBmbHVzaCB3cml0ZXMgd2hlbjpcbiAgICAvLyAgMS4gQnVmZmVyaW5nIGlzIGRpc2FibGVkLiBPcjtcbiAgICAvLyAgMi4gYW55IG5vbi0oYWRkZWQvY2hhbmdlZC9yZW1vdmVkKSBtZXNzYWdlIGFycml2ZXMuXG4gICAgY29uc3Qgc3RhbmRhcmRXcml0ZSA9XG4gICAgICBtc2cubXNnID09PSBcImFkZGVkXCIgfHxcbiAgICAgIG1zZy5tc2cgPT09IFwiY2hhbmdlZFwiIHx8XG4gICAgICBtc2cubXNnID09PSBcInJlbW92ZWRcIjtcblxuICAgIGlmIChzZWxmLl9idWZmZXJlZFdyaXRlc0ludGVydmFsID09PSAwIHx8ICFzdGFuZGFyZFdyaXRlKSB7XG4gICAgICBhd2FpdCBzZWxmLl9mbHVzaEJ1ZmZlcmVkV3JpdGVzKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHNlbGYuX2J1ZmZlcmVkV3JpdGVzRmx1c2hBdCA9PT0gbnVsbCkge1xuICAgICAgc2VsZi5fYnVmZmVyZWRXcml0ZXNGbHVzaEF0ID1cbiAgICAgICAgbmV3IERhdGUoKS52YWx1ZU9mKCkgKyBzZWxmLl9idWZmZXJlZFdyaXRlc01heEFnZTtcbiAgICB9IGVsc2UgaWYgKHNlbGYuX2J1ZmZlcmVkV3JpdGVzRmx1c2hBdCA8IG5ldyBEYXRlKCkudmFsdWVPZigpKSB7XG4gICAgICBhd2FpdCBzZWxmLl9mbHVzaEJ1ZmZlcmVkV3JpdGVzKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHNlbGYuX2J1ZmZlcmVkV3JpdGVzRmx1c2hIYW5kbGUpIHtcbiAgICAgIGNsZWFyVGltZW91dChzZWxmLl9idWZmZXJlZFdyaXRlc0ZsdXNoSGFuZGxlKTtcbiAgICB9XG4gICAgc2VsZi5fYnVmZmVyZWRXcml0ZXNGbHVzaEhhbmRsZSA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgc2VsZi5fbGl2ZURhdGFXcml0ZXNQcm9taXNlID0gc2VsZi5fZmx1c2hCdWZmZXJlZFdyaXRlcygpO1xuICAgICAgaWYgKE1ldGVvci5faXNQcm9taXNlKHNlbGYuX2xpdmVEYXRhV3JpdGVzUHJvbWlzZSkpIHtcbiAgICAgICAgc2VsZi5fbGl2ZURhdGFXcml0ZXNQcm9taXNlLmZpbmFsbHkoXG4gICAgICAgICAgKCkgPT4gKHNlbGYuX2xpdmVEYXRhV3JpdGVzUHJvbWlzZSA9IHVuZGVmaW5lZClcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9LCBzZWxmLl9idWZmZXJlZFdyaXRlc0ludGVydmFsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBQcm9jZXNzIGluZGl2aWR1YWwgZGF0YSBtZXNzYWdlcyBieSB0eXBlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBhc3luYyBfcHJvY2Vzc09uZURhdGFNZXNzYWdlKG1zZywgdXBkYXRlcykge1xuICAgIGNvbnN0IG1lc3NhZ2VUeXBlID0gbXNnLm1zZztcblxuICAgIHN3aXRjaCAobWVzc2FnZVR5cGUpIHtcbiAgICAgIGNhc2UgJ2FkZGVkJzpcbiAgICAgICAgYXdhaXQgdGhpcy5fY29ubmVjdGlvbi5fcHJvY2Vzc19hZGRlZChtc2csIHVwZGF0ZXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2NoYW5nZWQnOlxuICAgICAgICB0aGlzLl9jb25uZWN0aW9uLl9wcm9jZXNzX2NoYW5nZWQobXNnLCB1cGRhdGVzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdyZW1vdmVkJzpcbiAgICAgICAgdGhpcy5fY29ubmVjdGlvbi5fcHJvY2Vzc19yZW1vdmVkKG1zZywgdXBkYXRlcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncmVhZHknOlxuICAgICAgICB0aGlzLl9jb25uZWN0aW9uLl9wcm9jZXNzX3JlYWR5KG1zZywgdXBkYXRlcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAndXBkYXRlZCc6XG4gICAgICAgIHRoaXMuX2Nvbm5lY3Rpb24uX3Byb2Nlc3NfdXBkYXRlZChtc2csIHVwZGF0ZXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ25vc3ViJzpcbiAgICAgICAgLy8gaWdub3JlIHRoaXNcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBNZXRlb3IuX2RlYnVnKCdkaXNjYXJkaW5nIHVua25vd24gbGl2ZWRhdGEgZGF0YSBtZXNzYWdlIHR5cGUnLCBtc2cpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBIYW5kbGUgbWV0aG9kIHJlc3VsdHMgYXJyaXZpbmcgZnJvbSB0aGUgc2VydmVyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBtc2cgVGhlIG1ldGhvZCByZXN1bHQgbWVzc2FnZVxuICAgKi9cbiAgYXN5bmMgX2xpdmVkYXRhX3Jlc3VsdChtc2cpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcy5fY29ubmVjdGlvbjtcblxuICAgIC8vIExldHMgbWFrZSBzdXJlIHRoZXJlIGFyZSBubyBidWZmZXJlZCB3cml0ZXMgYmVmb3JlIHJldHVybmluZyByZXN1bHQuXG4gICAgaWYgKCFpc0VtcHR5KHNlbGYuX2J1ZmZlcmVkV3JpdGVzKSkge1xuICAgICAgYXdhaXQgc2VsZi5fZmx1c2hCdWZmZXJlZFdyaXRlcygpO1xuICAgIH1cblxuICAgIC8vIGZpbmQgdGhlIG91dHN0YW5kaW5nIHJlcXVlc3RcbiAgICAvLyBzaG91bGQgYmUgTygxKSBpbiBuZWFybHkgYWxsIHJlYWxpc3RpYyB1c2UgY2FzZXNcbiAgICBpZiAoaXNFbXB0eShzZWxmLl9vdXRzdGFuZGluZ01ldGhvZEJsb2NrcykpIHtcbiAgICAgIE1ldGVvci5fZGVidWcoJ1JlY2VpdmVkIG1ldGhvZCByZXN1bHQgYnV0IG5vIG1ldGhvZHMgb3V0c3RhbmRpbmcnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgY3VycmVudE1ldGhvZEJsb2NrID0gc2VsZi5fb3V0c3RhbmRpbmdNZXRob2RCbG9ja3NbMF0ubWV0aG9kcztcbiAgICBsZXQgaTtcbiAgICBjb25zdCBtID0gY3VycmVudE1ldGhvZEJsb2NrLmZpbmQoKG1ldGhvZCwgaWR4KSA9PiB7XG4gICAgICBjb25zdCBmb3VuZCA9IG1ldGhvZC5tZXRob2RJZCA9PT0gbXNnLmlkO1xuICAgICAgaWYgKGZvdW5kKSBpID0gaWR4O1xuICAgICAgcmV0dXJuIGZvdW5kO1xuICAgIH0pO1xuICAgIGlmICghbSkge1xuICAgICAgTWV0ZW9yLl9kZWJ1ZyhcIkNhbid0IG1hdGNoIG1ldGhvZCByZXNwb25zZSB0byBvcmlnaW5hbCBtZXRob2QgY2FsbFwiLCBtc2cpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZSBmcm9tIGN1cnJlbnQgbWV0aG9kIGJsb2NrLiBUaGlzIG1heSBsZWF2ZSB0aGUgYmxvY2sgZW1wdHksIGJ1dCB3ZVxuICAgIC8vIGRvbid0IG1vdmUgb24gdG8gdGhlIG5leHQgYmxvY2sgdW50aWwgdGhlIGNhbGxiYWNrIGhhcyBiZWVuIGRlbGl2ZXJlZCwgaW5cbiAgICAvLyBfb3V0c3RhbmRpbmdNZXRob2RGaW5pc2hlZC5cbiAgICBjdXJyZW50TWV0aG9kQmxvY2suc3BsaWNlKGksIDEpO1xuXG4gICAgaWYgKGhhc093bi5jYWxsKG1zZywgJ2Vycm9yJykpIHtcbiAgICAgIG0ucmVjZWl2ZVJlc3VsdChcbiAgICAgICAgbmV3IE1ldGVvci5FcnJvcihtc2cuZXJyb3IuZXJyb3IsIG1zZy5lcnJvci5yZWFzb24sIG1zZy5lcnJvci5kZXRhaWxzKVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gbXNnLnJlc3VsdCBtYXkgYmUgdW5kZWZpbmVkIGlmIHRoZSBtZXRob2QgZGlkbid0IHJldHVybiBhIHZhbHVlXG4gICAgICBtLnJlY2VpdmVSZXN1bHQodW5kZWZpbmVkLCBtc2cucmVzdWx0KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHN1bW1hcnkgSGFuZGxlIFwibm9zdWJcIiBtZXNzYWdlcyBhcnJpdmluZyBmcm9tIHRoZSBzZXJ2ZXJcbiAgICogQHBhcmFtIHtPYmplY3R9IG1zZyBUaGUgbm9zdWIgbWVzc2FnZVxuICAgKi9cbiAgYXN5bmMgX2xpdmVkYXRhX25vc3ViKG1zZykge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzLl9jb25uZWN0aW9uO1xuXG4gICAgLy8gRmlyc3QgcGFzcyBpdCB0aHJvdWdoIF9saXZlZGF0YV9kYXRhLCB3aGljaCBvbmx5IHVzZXMgaXQgdG8gaGVscCBnZXRcbiAgICAvLyB0b3dhcmRzIHF1aWVzY2VuY2UuXG4gICAgYXdhaXQgdGhpcy5fbGl2ZWRhdGFfZGF0YShtc2cpO1xuXG4gICAgLy8gRG8gdGhlIHJlc3Qgb2Ygb3VyIHByb2Nlc3NpbmcgaW1tZWRpYXRlbHksIHdpdGggbm9cbiAgICAvLyBidWZmZXJpbmctdW50aWwtcXVpZXNjZW5jZS5cblxuICAgIC8vIHdlIHdlcmVuJ3Qgc3ViYmVkIGFueXdheSwgb3Igd2UgaW5pdGlhdGVkIHRoZSB1bnN1Yi5cbiAgICBpZiAoIWhhc093bi5jYWxsKHNlbGYuX3N1YnNjcmlwdGlvbnMsIG1zZy5pZCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBYWFggQ09NUEFUIFdJVEggMS4wLjMuMSAjZXJyb3JDYWxsYmFja1xuICAgIGNvbnN0IGVycm9yQ2FsbGJhY2sgPSBzZWxmLl9zdWJzY3JpcHRpb25zW21zZy5pZF0uZXJyb3JDYWxsYmFjaztcbiAgICBjb25zdCBzdG9wQ2FsbGJhY2sgPSBzZWxmLl9zdWJzY3JpcHRpb25zW21zZy5pZF0uc3RvcENhbGxiYWNrO1xuXG4gICAgc2VsZi5fc3Vic2NyaXB0aW9uc1ttc2cuaWRdLnJlbW92ZSgpO1xuXG4gICAgY29uc3QgbWV0ZW9yRXJyb3JGcm9tTXNnID0gbXNnQXJnID0+IHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIG1zZ0FyZyAmJlxuICAgICAgICBtc2dBcmcuZXJyb3IgJiZcbiAgICAgICAgbmV3IE1ldGVvci5FcnJvcihcbiAgICAgICAgICBtc2dBcmcuZXJyb3IuZXJyb3IsXG4gICAgICAgICAgbXNnQXJnLmVycm9yLnJlYXNvbixcbiAgICAgICAgICBtc2dBcmcuZXJyb3IuZGV0YWlsc1xuICAgICAgICApXG4gICAgICApO1xuICAgIH07XG5cbiAgICAvLyBYWFggQ09NUEFUIFdJVEggMS4wLjMuMSAjZXJyb3JDYWxsYmFja1xuICAgIGlmIChlcnJvckNhbGxiYWNrICYmIG1zZy5lcnJvcikge1xuICAgICAgZXJyb3JDYWxsYmFjayhtZXRlb3JFcnJvckZyb21Nc2cobXNnKSk7XG4gICAgfVxuXG4gICAgaWYgKHN0b3BDYWxsYmFjaykge1xuICAgICAgc3RvcENhbGxiYWNrKG1ldGVvckVycm9yRnJvbU1zZyhtc2cpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHN1bW1hcnkgSGFuZGxlIGVycm9ycyBmcm9tIHRoZSBzZXJ2ZXJcbiAgICogQHBhcmFtIHtPYmplY3R9IG1zZyBUaGUgZXJyb3IgbWVzc2FnZVxuICAgKi9cbiAgX2xpdmVkYXRhX2Vycm9yKG1zZykge1xuICAgIE1ldGVvci5fZGVidWcoJ1JlY2VpdmVkIGVycm9yIGZyb20gc2VydmVyOiAnLCBtc2cucmVhc29uKTtcbiAgICBpZiAobXNnLm9mZmVuZGluZ01lc3NhZ2UpIE1ldGVvci5fZGVidWcoJ0ZvcjogJywgbXNnLm9mZmVuZGluZ01lc3NhZ2UpO1xuICB9XG5cbiAgLy8gRG9jdW1lbnQgY2hhbmdlIG1lc3NhZ2UgcHJvY2Vzc29ycyB3aWxsIGJlIGRlZmluZWQgaW4gYSBzZXBhcmF0ZSBjbGFzc1xufSIsIi8vIEEgTWV0aG9kSW52b2tlciBtYW5hZ2VzIHNlbmRpbmcgYSBtZXRob2QgdG8gdGhlIHNlcnZlciBhbmQgY2FsbGluZyB0aGUgdXNlcidzXG4vLyBjYWxsYmFja3MuIE9uIGNvbnN0cnVjdGlvbiwgaXQgcmVnaXN0ZXJzIGl0c2VsZiBpbiB0aGUgY29ubmVjdGlvbidzXG4vLyBfbWV0aG9kSW52b2tlcnMgbWFwOyBpdCByZW1vdmVzIGl0c2VsZiBvbmNlIHRoZSBtZXRob2QgaXMgZnVsbHkgZmluaXNoZWQgYW5kXG4vLyB0aGUgY2FsbGJhY2sgaXMgaW52b2tlZC4gVGhpcyBvY2N1cnMgd2hlbiBpdCBoYXMgYm90aCByZWNlaXZlZCBhIHJlc3VsdCxcbi8vIGFuZCB0aGUgZGF0YSB3cml0dGVuIGJ5IGl0IGlzIGZ1bGx5IHZpc2libGUuXG5leHBvcnQgY2xhc3MgTWV0aG9kSW52b2tlciB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICAvLyBQdWJsaWMgKHdpdGhpbiB0aGlzIGZpbGUpIGZpZWxkcy5cbiAgICB0aGlzLm1ldGhvZElkID0gb3B0aW9ucy5tZXRob2RJZDtcbiAgICB0aGlzLnNlbnRNZXNzYWdlID0gZmFsc2U7XG5cbiAgICB0aGlzLl9jYWxsYmFjayA9IG9wdGlvbnMuY2FsbGJhY2s7XG4gICAgdGhpcy5fY29ubmVjdGlvbiA9IG9wdGlvbnMuY29ubmVjdGlvbjtcbiAgICB0aGlzLl9tZXNzYWdlID0gb3B0aW9ucy5tZXNzYWdlO1xuICAgIHRoaXMuX29uUmVzdWx0UmVjZWl2ZWQgPSBvcHRpb25zLm9uUmVzdWx0UmVjZWl2ZWQgfHwgKCgpID0+IHt9KTtcbiAgICB0aGlzLl93YWl0ID0gb3B0aW9ucy53YWl0O1xuICAgIHRoaXMubm9SZXRyeSA9IG9wdGlvbnMubm9SZXRyeTtcbiAgICB0aGlzLl9tZXRob2RSZXN1bHQgPSBudWxsO1xuICAgIHRoaXMuX2RhdGFWaXNpYmxlID0gZmFsc2U7XG5cbiAgICAvLyBSZWdpc3RlciB3aXRoIHRoZSBjb25uZWN0aW9uLlxuICAgIHRoaXMuX2Nvbm5lY3Rpb24uX21ldGhvZEludm9rZXJzW3RoaXMubWV0aG9kSWRdID0gdGhpcztcbiAgfVxuICAvLyBTZW5kcyB0aGUgbWV0aG9kIG1lc3NhZ2UgdG8gdGhlIHNlcnZlci4gTWF5IGJlIGNhbGxlZCBhZGRpdGlvbmFsIHRpbWVzIGlmXG4gIC8vIHdlIGxvc2UgdGhlIGNvbm5lY3Rpb24gYW5kIHJlY29ubmVjdCBiZWZvcmUgcmVjZWl2aW5nIGEgcmVzdWx0LlxuICBzZW5kTWVzc2FnZSgpIHtcbiAgICAvLyBUaGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCBiZWZvcmUgc2VuZGluZyBhIG1ldGhvZCAoaW5jbHVkaW5nIHJlc2VuZGluZyBvblxuICAgIC8vIHJlY29ubmVjdCkuIFdlIHNob3VsZCBvbmx5IChyZSlzZW5kIG1ldGhvZHMgd2hlcmUgd2UgZG9uJ3QgYWxyZWFkeSBoYXZlIGFcbiAgICAvLyByZXN1bHQhXG4gICAgaWYgKHRoaXMuZ290UmVzdWx0KCkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlbmRpbmdNZXRob2QgaXMgY2FsbGVkIG9uIG1ldGhvZCB3aXRoIHJlc3VsdCcpO1xuXG4gICAgLy8gSWYgd2UncmUgcmUtc2VuZGluZyBpdCwgaXQgZG9lc24ndCBtYXR0ZXIgaWYgZGF0YSB3YXMgd3JpdHRlbiB0aGUgZmlyc3RcbiAgICAvLyB0aW1lLlxuICAgIHRoaXMuX2RhdGFWaXNpYmxlID0gZmFsc2U7XG4gICAgdGhpcy5zZW50TWVzc2FnZSA9IHRydWU7XG5cbiAgICAvLyBJZiB0aGlzIGlzIGEgd2FpdCBtZXRob2QsIG1ha2UgYWxsIGRhdGEgbWVzc2FnZXMgYmUgYnVmZmVyZWQgdW50aWwgaXQgaXNcbiAgICAvLyBkb25lLlxuICAgIGlmICh0aGlzLl93YWl0KVxuICAgICAgdGhpcy5fY29ubmVjdGlvbi5fbWV0aG9kc0Jsb2NraW5nUXVpZXNjZW5jZVt0aGlzLm1ldGhvZElkXSA9IHRydWU7XG5cbiAgICAvLyBBY3R1YWxseSBzZW5kIHRoZSBtZXNzYWdlLlxuICAgIHRoaXMuX2Nvbm5lY3Rpb24uX3NlbmQodGhpcy5fbWVzc2FnZSk7XG4gIH1cbiAgLy8gSW52b2tlIHRoZSBjYWxsYmFjaywgaWYgd2UgaGF2ZSBib3RoIGEgcmVzdWx0IGFuZCBrbm93IHRoYXQgYWxsIGRhdGEgaGFzXG4gIC8vIGJlZW4gd3JpdHRlbiB0byB0aGUgbG9jYWwgY2FjaGUuXG4gIF9tYXliZUludm9rZUNhbGxiYWNrKCkge1xuICAgIGlmICh0aGlzLl9tZXRob2RSZXN1bHQgJiYgdGhpcy5fZGF0YVZpc2libGUpIHtcbiAgICAgIC8vIENhbGwgdGhlIGNhbGxiYWNrLiAoVGhpcyB3b24ndCB0aHJvdzogdGhlIGNhbGxiYWNrIHdhcyB3cmFwcGVkIHdpdGhcbiAgICAgIC8vIGJpbmRFbnZpcm9ubWVudC4pXG4gICAgICB0aGlzLl9jYWxsYmFjayh0aGlzLl9tZXRob2RSZXN1bHRbMF0sIHRoaXMuX21ldGhvZFJlc3VsdFsxXSk7XG5cbiAgICAgIC8vIEZvcmdldCBhYm91dCB0aGlzIG1ldGhvZC5cbiAgICAgIGRlbGV0ZSB0aGlzLl9jb25uZWN0aW9uLl9tZXRob2RJbnZva2Vyc1t0aGlzLm1ldGhvZElkXTtcblxuICAgICAgLy8gTGV0IHRoZSBjb25uZWN0aW9uIGtub3cgdGhhdCB0aGlzIG1ldGhvZCBpcyBmaW5pc2hlZCwgc28gaXQgY2FuIHRyeSB0b1xuICAgICAgLy8gbW92ZSBvbiB0byB0aGUgbmV4dCBibG9jayBvZiBtZXRob2RzLlxuICAgICAgdGhpcy5fY29ubmVjdGlvbi5fb3V0c3RhbmRpbmdNZXRob2RGaW5pc2hlZCgpO1xuICAgIH1cbiAgfVxuICAvLyBDYWxsIHdpdGggdGhlIHJlc3VsdCBvZiB0aGUgbWV0aG9kIGZyb20gdGhlIHNlcnZlci4gT25seSBtYXkgYmUgY2FsbGVkXG4gIC8vIG9uY2U7IG9uY2UgaXQgaXMgY2FsbGVkLCB5b3Ugc2hvdWxkIG5vdCBjYWxsIHNlbmRNZXNzYWdlIGFnYWluLlxuICAvLyBJZiB0aGUgdXNlciBwcm92aWRlZCBhbiBvblJlc3VsdFJlY2VpdmVkIGNhbGxiYWNrLCBjYWxsIGl0IGltbWVkaWF0ZWx5LlxuICAvLyBUaGVuIGludm9rZSB0aGUgbWFpbiBjYWxsYmFjayBpZiBkYXRhIGlzIGFsc28gdmlzaWJsZS5cbiAgcmVjZWl2ZVJlc3VsdChlcnIsIHJlc3VsdCkge1xuICAgIGlmICh0aGlzLmdvdFJlc3VsdCgpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNZXRob2RzIHNob3VsZCBvbmx5IHJlY2VpdmUgcmVzdWx0cyBvbmNlJyk7XG4gICAgdGhpcy5fbWV0aG9kUmVzdWx0ID0gW2VyciwgcmVzdWx0XTtcbiAgICB0aGlzLl9vblJlc3VsdFJlY2VpdmVkKGVyciwgcmVzdWx0KTtcbiAgICB0aGlzLl9tYXliZUludm9rZUNhbGxiYWNrKCk7XG4gIH1cbiAgLy8gQ2FsbCB0aGlzIHdoZW4gYWxsIGRhdGEgd3JpdHRlbiBieSB0aGUgbWV0aG9kIGlzIHZpc2libGUuIFRoaXMgbWVhbnMgdGhhdFxuICAvLyB0aGUgbWV0aG9kIGhhcyByZXR1cm5zIGl0cyBcImRhdGEgaXMgZG9uZVwiIG1lc3NhZ2UgKkFORCogYWxsIHNlcnZlclxuICAvLyBkb2N1bWVudHMgdGhhdCBhcmUgYnVmZmVyZWQgYXQgdGhhdCB0aW1lIGhhdmUgYmVlbiB3cml0dGVuIHRvIHRoZSBsb2NhbFxuICAvLyBjYWNoZS4gSW52b2tlcyB0aGUgbWFpbiBjYWxsYmFjayBpZiB0aGUgcmVzdWx0IGhhcyBiZWVuIHJlY2VpdmVkLlxuICBkYXRhVmlzaWJsZSgpIHtcbiAgICB0aGlzLl9kYXRhVmlzaWJsZSA9IHRydWU7XG4gICAgdGhpcy5fbWF5YmVJbnZva2VDYWxsYmFjaygpO1xuICB9XG4gIC8vIFRydWUgaWYgcmVjZWl2ZVJlc3VsdCBoYXMgYmVlbiBjYWxsZWQuXG4gIGdvdFJlc3VsdCgpIHtcbiAgICByZXR1cm4gISF0aGlzLl9tZXRob2RSZXN1bHQ7XG4gIH1cbn1cbiIsImltcG9ydCB7IE1vbmdvSUQgfSBmcm9tICdtZXRlb3IvbW9uZ28taWQnO1xuXG5leHBvcnQgY2xhc3MgTW9uZ29JRE1hcCBleHRlbmRzIElkTWFwIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoTW9uZ29JRC5pZFN0cmluZ2lmeSwgTW9uZ29JRC5pZFBhcnNlKTtcbiAgfVxufSIsImltcG9ydCB7IEREUENvbW1vbiB9IGZyb20gJ21ldGVvci9kZHAtY29tbW9uJztcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuXG5pbXBvcnQgeyBDb25uZWN0aW9uIH0gZnJvbSAnLi9saXZlZGF0YV9jb25uZWN0aW9uLmpzJztcblxuLy8gVGhpcyBhcnJheSBhbGxvd3MgdGhlIGBfYWxsU3Vic2NyaXB0aW9uc1JlYWR5YCBtZXRob2QgYmVsb3csIHdoaWNoXG4vLyBpcyB1c2VkIGJ5IHRoZSBgc3BpZGVyYWJsZWAgcGFja2FnZSwgdG8ga2VlcCB0cmFjayBvZiB3aGV0aGVyIGFsbFxuLy8gZGF0YSBpcyByZWFkeS5cbmNvbnN0IGFsbENvbm5lY3Rpb25zID0gW107XG5cbi8qKlxuICogQG5hbWVzcGFjZSBERFBcbiAqIEBzdW1tYXJ5IE5hbWVzcGFjZSBmb3IgRERQLXJlbGF0ZWQgbWV0aG9kcy9jbGFzc2VzLlxuICovXG5leHBvcnQgY29uc3QgRERQID0ge307XG5cbi8vIFRoaXMgaXMgcHJpdmF0ZSBidXQgaXQncyB1c2VkIGluIGEgZmV3IHBsYWNlcy4gYWNjb3VudHMtYmFzZSB1c2VzXG4vLyBpdCB0byBnZXQgdGhlIGN1cnJlbnQgdXNlci4gTWV0ZW9yLnNldFRpbWVvdXQgYW5kIGZyaWVuZHMgY2xlYXJcbi8vIGl0LiBXZSBjYW4gcHJvYmFibHkgZmluZCBhIGJldHRlciB3YXkgdG8gZmFjdG9yIHRoaXMuXG5ERFAuX0N1cnJlbnRNZXRob2RJbnZvY2F0aW9uID0gbmV3IE1ldGVvci5FbnZpcm9ubWVudFZhcmlhYmxlKCk7XG5ERFAuX0N1cnJlbnRQdWJsaWNhdGlvbkludm9jYXRpb24gPSBuZXcgTWV0ZW9yLkVudmlyb25tZW50VmFyaWFibGUoKTtcblxuLy8gWFhYOiBLZWVwIEREUC5fQ3VycmVudEludm9jYXRpb24gZm9yIGJhY2t3YXJkcy1jb21wYXRpYmlsaXR5LlxuRERQLl9DdXJyZW50SW52b2NhdGlvbiA9IEREUC5fQ3VycmVudE1ldGhvZEludm9jYXRpb247XG5cbkREUC5fQ3VycmVudENhbGxBc3luY0ludm9jYXRpb24gPSBuZXcgTWV0ZW9yLkVudmlyb25tZW50VmFyaWFibGUoKTtcblxuLy8gVGhpcyBpcyBwYXNzZWQgaW50byBhIHdlaXJkIGBtYWtlRXJyb3JUeXBlYCBmdW5jdGlvbiB0aGF0IGV4cGVjdHMgaXRzIHRoaW5nXG4vLyB0byBiZSBhIGNvbnN0cnVjdG9yXG5mdW5jdGlvbiBjb25uZWN0aW9uRXJyb3JDb25zdHJ1Y3RvcihtZXNzYWdlKSB7XG4gIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG59XG5cbkREUC5Db25uZWN0aW9uRXJyb3IgPSBNZXRlb3IubWFrZUVycm9yVHlwZShcbiAgJ0REUC5Db25uZWN0aW9uRXJyb3InLFxuICBjb25uZWN0aW9uRXJyb3JDb25zdHJ1Y3RvclxuKTtcblxuRERQLkZvcmNlZFJlY29ubmVjdEVycm9yID0gTWV0ZW9yLm1ha2VFcnJvclR5cGUoXG4gICdERFAuRm9yY2VkUmVjb25uZWN0RXJyb3InLFxuICAoKSA9PiB7fVxuKTtcblxuLy8gUmV0dXJucyB0aGUgbmFtZWQgc2VxdWVuY2Ugb2YgcHNldWRvLXJhbmRvbSB2YWx1ZXMuXG4vLyBUaGUgc2NvcGUgd2lsbCBiZSBERFAuX0N1cnJlbnRNZXRob2RJbnZvY2F0aW9uLmdldCgpLCBzbyB0aGUgc3RyZWFtIHdpbGwgcHJvZHVjZVxuLy8gY29uc2lzdGVudCB2YWx1ZXMgZm9yIG1ldGhvZCBjYWxscyBvbiB0aGUgY2xpZW50IGFuZCBzZXJ2ZXIuXG5ERFAucmFuZG9tU3RyZWFtID0gbmFtZSA9PiB7XG4gIGNvbnN0IHNjb3BlID0gRERQLl9DdXJyZW50TWV0aG9kSW52b2NhdGlvbi5nZXQoKTtcbiAgcmV0dXJuIEREUENvbW1vbi5SYW5kb21TdHJlYW0uZ2V0KHNjb3BlLCBuYW1lKTtcbn07XG5cbi8vIEBwYXJhbSB1cmwge1N0cmluZ30gVVJMIHRvIE1ldGVvciBhcHAsXG4vLyAgICAgZS5nLjpcbi8vICAgICBcInN1YmRvbWFpbi5tZXRlb3IuY29tXCIsXG4vLyAgICAgXCJodHRwOi8vc3ViZG9tYWluLm1ldGVvci5jb21cIixcbi8vICAgICBcIi9cIixcbi8vICAgICBcImRkcCtzb2NranM6Ly9kZHAtLSoqKiotZm9vLm1ldGVvci5jb20vc29ja2pzXCJcblxuLyoqXG4gKiBAc3VtbWFyeSBDb25uZWN0IHRvIHRoZSBzZXJ2ZXIgb2YgYSBkaWZmZXJlbnQgTWV0ZW9yIGFwcGxpY2F0aW9uIHRvIHN1YnNjcmliZSB0byBpdHMgZG9jdW1lbnQgc2V0cyBhbmQgaW52b2tlIGl0cyByZW1vdGUgbWV0aG9kcy5cbiAqIEBsb2N1cyBBbnl3aGVyZVxuICogQHBhcmFtIHtTdHJpbmd9IHVybCBUaGUgVVJMIG9mIGFub3RoZXIgTWV0ZW9yIGFwcGxpY2F0aW9uLlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICogQHBhcmFtIHtCb29sZWFufSBvcHRpb25zLnJlbG9hZFdpdGhPdXRzdGFuZGluZyBpcyBpdCBPSyB0byByZWxvYWQgaWYgdGhlcmUgYXJlIG91dHN0YW5kaW5nIG1ldGhvZHM/XG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucy5oZWFkZXJzIGV4dHJhIGhlYWRlcnMgdG8gc2VuZCBvbiB0aGUgd2Vic29ja2V0cyBjb25uZWN0aW9uLCBmb3Igc2VydmVyLXRvLXNlcnZlciBERFAgb25seVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMuX3NvY2tqc09wdGlvbnMgU3BlY2lmaWVzIG9wdGlvbnMgdG8gcGFzcyB0aHJvdWdoIHRvIHRoZSBzb2NranMgY2xpZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBvcHRpb25zLm9uRERQTmVnb3RpYXRpb25WZXJzaW9uRmFpbHVyZSBjYWxsYmFjayB3aGVuIHZlcnNpb24gbmVnb3RpYXRpb24gZmFpbHMuXG4gKi9cbkREUC5jb25uZWN0ID0gKHVybCwgb3B0aW9ucykgPT4ge1xuICBjb25zdCByZXQgPSBuZXcgQ29ubmVjdGlvbih1cmwsIG9wdGlvbnMpO1xuICBhbGxDb25uZWN0aW9ucy5wdXNoKHJldCk7IC8vIGhhY2suIHNlZSBiZWxvdy5cbiAgcmV0dXJuIHJldDtcbn07XG5cbkREUC5fcmVjb25uZWN0SG9vayA9IG5ldyBIb29rKHsgYmluZEVudmlyb25tZW50OiBmYWxzZSB9KTtcblxuLyoqXG4gKiBAc3VtbWFyeSBSZWdpc3RlciBhIGZ1bmN0aW9uIHRvIGNhbGwgYXMgdGhlIGZpcnN0IHN0ZXAgb2ZcbiAqIHJlY29ubmVjdGluZy4gVGhpcyBmdW5jdGlvbiBjYW4gY2FsbCBtZXRob2RzIHdoaWNoIHdpbGwgYmUgZXhlY3V0ZWQgYmVmb3JlXG4gKiBhbnkgb3RoZXIgb3V0c3RhbmRpbmcgbWV0aG9kcy4gRm9yIGV4YW1wbGUsIHRoaXMgY2FuIGJlIHVzZWQgdG8gcmUtZXN0YWJsaXNoXG4gKiB0aGUgYXBwcm9wcmlhdGUgYXV0aGVudGljYXRpb24gY29udGV4dCBvbiB0aGUgY29ubmVjdGlvbi5cbiAqIEBsb2N1cyBBbnl3aGVyZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRvIGNhbGwuIEl0IHdpbGwgYmUgY2FsbGVkIHdpdGggYVxuICogc2luZ2xlIGFyZ3VtZW50LCB0aGUgW2Nvbm5lY3Rpb24gb2JqZWN0XSgjZGRwX2Nvbm5lY3QpIHRoYXQgaXMgcmVjb25uZWN0aW5nLlxuICovXG5ERFAub25SZWNvbm5lY3QgPSBjYWxsYmFjayA9PiBERFAuX3JlY29ubmVjdEhvb2sucmVnaXN0ZXIoY2FsbGJhY2spO1xuXG4vLyBIYWNrIGZvciBgc3BpZGVyYWJsZWAgcGFja2FnZTogYSB3YXkgdG8gc2VlIGlmIHRoZSBwYWdlIGlzIGRvbmVcbi8vIGxvYWRpbmcgYWxsIHRoZSBkYXRhIGl0IG5lZWRzLlxuLy9cbkREUC5fYWxsU3Vic2NyaXB0aW9uc1JlYWR5ID0gKCkgPT4gYWxsQ29ubmVjdGlvbnMuZXZlcnkoXG4gIGNvbm4gPT4gT2JqZWN0LnZhbHVlcyhjb25uLl9zdWJzY3JpcHRpb25zKS5ldmVyeShzdWIgPT4gc3ViLnJlYWR5KVxuKTtcbiJdfQ==
