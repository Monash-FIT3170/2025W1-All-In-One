Package["core-runtime"].queue("mongo",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var NpmModuleMongodb = Package['npm-mongo'].NpmModuleMongodb;
var NpmModuleMongodbVersion = Package['npm-mongo'].NpmModuleMongodbVersion;
var AllowDeny = Package['allow-deny'].AllowDeny;
var Random = Package.random.Random;
var EJSON = Package.ejson.EJSON;
var LocalCollection = Package.minimongo.LocalCollection;
var Minimongo = Package.minimongo.Minimongo;
var DDP = Package['ddp-client'].DDP;
var DDPServer = Package['ddp-server'].DDPServer;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var DiffSequence = Package['diff-sequence'].DiffSequence;
var MongoID = Package['mongo-id'].MongoID;
var check = Package.check.check;
var Match = Package.check.Match;
var ECMAScript = Package.ecmascript.ECMAScript;
var Log = Package.logging.Log;
var Decimal = Package['mongo-decimal'].Decimal;
var MaxHeap = Package['binary-heap'].MaxHeap;
var MinHeap = Package['binary-heap'].MinHeap;
var MinMaxHeap = Package['binary-heap'].MinMaxHeap;
var Hook = Package['callback-hook'].Hook;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var MongoInternals, callback, options, Mongo, selector, doc, ObserveMultiplexer;

var require = meteorInstall({"node_modules":{"meteor":{"mongo":{"mongo_driver.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/mongo_driver.js                                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module1, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module1.export({
      listenAll: () => listenAll,
      forEachTrigger: () => forEachTrigger
    });
    let OplogHandle;
    module1.link("./oplog_tailing", {
      OplogHandle(v) {
        OplogHandle = v;
      }
    }, 0);
    let MongoConnection;
    module1.link("./mongo_connection", {
      MongoConnection(v) {
        MongoConnection = v;
      }
    }, 1);
    let OplogObserveDriver;
    module1.link("./oplog_observe_driver", {
      OplogObserveDriver(v) {
        OplogObserveDriver = v;
      }
    }, 2);
    let MongoDB;
    module1.link("./mongo_common", {
      MongoDB(v) {
        MongoDB = v;
      }
    }, 3);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    MongoInternals = global.MongoInternals = {};
    MongoInternals.__packageName = 'mongo';
    MongoInternals.NpmModules = {
      mongodb: {
        version: NpmModuleMongodbVersion,
        module: MongoDB
      }
    };

    // Older version of what is now available via
    // MongoInternals.NpmModules.mongodb.module.  It was never documented, but
    // people do use it.
    // XXX COMPAT WITH 1.0.3.2
    MongoInternals.NpmModule = new Proxy(MongoDB, {
      get(target, propertyKey, receiver) {
        if (propertyKey === 'ObjectID') {
          Meteor.deprecate("Accessing 'MongoInternals.NpmModule.ObjectID' directly is deprecated. " + "Use 'MongoInternals.NpmModule.ObjectId' instead.");
        }
        return Reflect.get(target, propertyKey, receiver);
      }
    });
    MongoInternals.OplogHandle = OplogHandle;
    MongoInternals.Connection = MongoConnection;
    MongoInternals.OplogObserveDriver = OplogObserveDriver;

    // This is used to add or remove EJSON from the beginning of everything nested
    // inside an EJSON custom type. It should only be called on pure JSON!

    // Ensure that EJSON.clone keeps a Timestamp as a Timestamp (instead of just
    // doing a structural clone).
    // XXX how ok is this? what if there are multiple copies of MongoDB loaded?
    MongoDB.Timestamp.prototype.clone = function () {
      // Timestamps should be immutable.
      return this;
    };

    // Listen for the invalidation messages that will trigger us to poll the
    // database for changes. If this selector specifies specific IDs, specify them
    // here, so that updates to different specific IDs don't cause us to poll.
    // listenCallback is the same kind of (notification, complete) callback passed
    // to InvalidationCrossbar.listen.

    const listenAll = async function (cursorDescription, listenCallback) {
      const listeners = [];
      await forEachTrigger(cursorDescription, function (trigger) {
        listeners.push(DDPServer._InvalidationCrossbar.listen(trigger, listenCallback));
      });
      return {
        stop: function () {
          listeners.forEach(function (listener) {
            listener.stop();
          });
        }
      };
    };
    const forEachTrigger = async function (cursorDescription, triggerCallback) {
      const key = {
        collection: cursorDescription.collectionName
      };
      const specificIds = LocalCollection._idsMatchedBySelector(cursorDescription.selector);
      if (specificIds) {
        for (const id of specificIds) {
          await triggerCallback(Object.assign({
            id: id
          }, key));
        }
        await triggerCallback(Object.assign({
          dropCollection: true,
          id: null
        }, key));
      } else {
        await triggerCallback(key);
      }
      // Everyone cares about the database being dropped.
      await triggerCallback({
        dropDatabase: true
      });
    };
    // XXX We probably need to find a better way to expose this. Right now
    // it's only used by tests, but in fact you need it in normal
    // operation to interact with capped collections.
    MongoInternals.MongoTimestamp = MongoDB.Timestamp;
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

},"oplog_tailing.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/oplog_tailing.ts                                                                                     //
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
    module.export({
      OPLOG_COLLECTION: () => OPLOG_COLLECTION,
      OplogHandle: () => OplogHandle,
      idForOp: () => idForOp
    });
    let isEmpty;
    module.link("lodash.isempty", {
      default(v) {
        isEmpty = v;
      }
    }, 0);
    let Meteor;
    module.link("meteor/meteor", {
      Meteor(v) {
        Meteor = v;
      }
    }, 1);
    let CursorDescription;
    module.link("./cursor_description", {
      CursorDescription(v) {
        CursorDescription = v;
      }
    }, 2);
    let MongoConnection;
    module.link("./mongo_connection", {
      MongoConnection(v) {
        MongoConnection = v;
      }
    }, 3);
    let NpmModuleMongodb;
    module.link("meteor/npm-mongo", {
      NpmModuleMongodb(v) {
        NpmModuleMongodb = v;
      }
    }, 4);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    const {
      Long
    } = NpmModuleMongodb;
    const OPLOG_COLLECTION = 'oplog.rs';
    let TOO_FAR_BEHIND = +(process.env.METEOR_OPLOG_TOO_FAR_BEHIND || 2000);
    const TAIL_TIMEOUT = +(process.env.METEOR_OPLOG_TAIL_TIMEOUT || 30000);
    class OplogHandle {
      constructor(oplogUrl, dbName) {
        this._oplogUrl = void 0;
        this._dbName = void 0;
        this._oplogLastEntryConnection = void 0;
        this._oplogTailConnection = void 0;
        this._oplogOptions = void 0;
        this._stopped = void 0;
        this._tailHandle = void 0;
        this._readyPromiseResolver = void 0;
        this._readyPromise = void 0;
        this._crossbar = void 0;
        this._baseOplogSelector = void 0;
        this._catchingUpResolvers = void 0;
        this._lastProcessedTS = void 0;
        this._onSkippedEntriesHook = void 0;
        this._startTrailingPromise = void 0;
        this._resolveTimeout = void 0;
        this._entryQueue = new Meteor._DoubleEndedQueue();
        this._workerActive = false;
        this._workerPromise = null;
        this._oplogUrl = oplogUrl;
        this._dbName = dbName;
        this._resolveTimeout = null;
        this._oplogLastEntryConnection = null;
        this._oplogTailConnection = null;
        this._oplogOptions = null;
        this._stopped = false;
        this._tailHandle = null;
        this._readyPromiseResolver = null;
        this._readyPromise = new Promise(r => this._readyPromiseResolver = r);
        this._crossbar = new DDPServer._Crossbar({
          factPackage: "mongo-livedata",
          factName: "oplog-watchers"
        });
        this._baseOplogSelector = {
          ns: new RegExp("^(?:" + [
          // @ts-ignore
          Meteor._escapeRegExp(this._dbName + "."),
          // @ts-ignore
          Meteor._escapeRegExp("admin.$cmd")].join("|") + ")"),
          $or: [{
            op: {
              $in: ['i', 'u', 'd']
            }
          }, {
            op: 'c',
            'o.drop': {
              $exists: true
            }
          }, {
            op: 'c',
            'o.dropDatabase': 1
          }, {
            op: 'c',
            'o.applyOps': {
              $exists: true
            }
          }]
        };
        this._catchingUpResolvers = [];
        this._lastProcessedTS = null;
        this._onSkippedEntriesHook = new Hook({
          debugPrintExceptions: "onSkippedEntries callback"
        });
        this._startTrailingPromise = this._startTailing();
      }
      async stop() {
        if (this._stopped) return;
        this._stopped = true;
        if (this._tailHandle) {
          await this._tailHandle.stop();
        }
      }
      async _onOplogEntry(trigger, callback) {
        if (this._stopped) {
          throw new Error("Called onOplogEntry on stopped handle!");
        }
        await this._readyPromise;
        const originalCallback = callback;
        /**
         * This depends on AsynchronousQueue tasks being wrapped in `bindEnvironment` too.
         *
         * @todo Check after we simplify the `bindEnvironment` implementation if we can remove the second wrap.
         */
        callback = Meteor.bindEnvironment(function (notification) {
          originalCallback(notification);
        },
        // @ts-ignore
        function (err) {
          Meteor._debug("Error in oplog callback", err);
        });
        const listenHandle = this._crossbar.listen(trigger, callback);
        return {
          stop: async function () {
            await listenHandle.stop();
          }
        };
      }
      onOplogEntry(trigger, callback) {
        return this._onOplogEntry(trigger, callback);
      }
      onSkippedEntries(callback) {
        if (this._stopped) {
          throw new Error("Called onSkippedEntries on stopped handle!");
        }
        return this._onSkippedEntriesHook.register(callback);
      }
      async _waitUntilCaughtUp() {
        if (this._stopped) {
          throw new Error("Called waitUntilCaughtUp on stopped handle!");
        }
        await this._readyPromise;
        let lastEntry = null;
        while (!this._stopped) {
          try {
            lastEntry = await this._oplogLastEntryConnection.findOneAsync(OPLOG_COLLECTION, this._baseOplogSelector, {
              projection: {
                ts: 1
              },
              sort: {
                $natural: -1
              }
            });
            break;
          } catch (e) {
            Meteor._debug("Got exception while reading last entry", e);
            // @ts-ignore
            await Meteor.sleep(100);
          }
        }
        if (this._stopped) return;
        if (!lastEntry) return;
        const ts = lastEntry.ts;
        if (!ts) {
          throw Error("oplog entry without ts: " + JSON.stringify(lastEntry));
        }
        if (this._lastProcessedTS && ts.lessThanOrEqual(this._lastProcessedTS)) {
          return;
        }
        let insertAfter = this._catchingUpResolvers.length;
        while (insertAfter - 1 > 0 && this._catchingUpResolvers[insertAfter - 1].ts.greaterThan(ts)) {
          insertAfter--;
        }
        let promiseResolver = null;
        const promiseToAwait = new Promise(r => promiseResolver = r);
        clearTimeout(this._resolveTimeout);
        this._resolveTimeout = setTimeout(() => {
          console.error("Meteor: oplog catching up took too long", {
            ts
          });
        }, 10000);
        this._catchingUpResolvers.splice(insertAfter, 0, {
          ts,
          resolver: promiseResolver
        });
        await promiseToAwait;
        clearTimeout(this._resolveTimeout);
      }
      async waitUntilCaughtUp() {
        return this._waitUntilCaughtUp();
      }
      async _startTailing() {
        const mongodbUri = require('mongodb-uri');
        if (mongodbUri.parse(this._oplogUrl).database !== 'local') {
          throw new Error("$MONGO_OPLOG_URL must be set to the 'local' database of a Mongo replica set");
        }
        this._oplogTailConnection = new MongoConnection(this._oplogUrl, {
          maxPoolSize: 1,
          minPoolSize: 1
        });
        this._oplogLastEntryConnection = new MongoConnection(this._oplogUrl, {
          maxPoolSize: 1,
          minPoolSize: 1
        });
        try {
          var _Meteor$settings, _Meteor$settings$pack, _Meteor$settings$pack2, _Meteor$settings2, _Meteor$settings2$pac, _Meteor$settings2$pac2;
          const isMasterDoc = await this._oplogLastEntryConnection.db.admin().command({
            ismaster: 1
          });
          if (!(isMasterDoc && isMasterDoc.setName)) {
            throw new Error("$MONGO_OPLOG_URL must be set to the 'local' database of a Mongo replica set");
          }
          const lastOplogEntry = await this._oplogLastEntryConnection.findOneAsync(OPLOG_COLLECTION, {}, {
            sort: {
              $natural: -1
            },
            projection: {
              ts: 1
            }
          });
          let oplogSelector = _objectSpread({}, this._baseOplogSelector);
          if (lastOplogEntry) {
            oplogSelector.ts = {
              $gt: lastOplogEntry.ts
            };
            this._lastProcessedTS = lastOplogEntry.ts;
          }
          const includeCollections = (_Meteor$settings = Meteor.settings) === null || _Meteor$settings === void 0 ? void 0 : (_Meteor$settings$pack = _Meteor$settings.packages) === null || _Meteor$settings$pack === void 0 ? void 0 : (_Meteor$settings$pack2 = _Meteor$settings$pack.mongo) === null || _Meteor$settings$pack2 === void 0 ? void 0 : _Meteor$settings$pack2.oplogIncludeCollections;
          const excludeCollections = (_Meteor$settings2 = Meteor.settings) === null || _Meteor$settings2 === void 0 ? void 0 : (_Meteor$settings2$pac = _Meteor$settings2.packages) === null || _Meteor$settings2$pac === void 0 ? void 0 : (_Meteor$settings2$pac2 = _Meteor$settings2$pac.mongo) === null || _Meteor$settings2$pac2 === void 0 ? void 0 : _Meteor$settings2$pac2.oplogExcludeCollections;
          if (includeCollections !== null && includeCollections !== void 0 && includeCollections.length && excludeCollections !== null && excludeCollections !== void 0 && excludeCollections.length) {
            throw new Error("Can't use both mongo oplog settings oplogIncludeCollections and oplogExcludeCollections at the same time.");
          }
          if (excludeCollections !== null && excludeCollections !== void 0 && excludeCollections.length) {
            oplogSelector.ns = {
              $regex: oplogSelector.ns,
              $nin: excludeCollections.map(collName => "".concat(this._dbName, ".").concat(collName))
            };
            this._oplogOptions = {
              excludeCollections
            };
          } else if (includeCollections !== null && includeCollections !== void 0 && includeCollections.length) {
            oplogSelector = {
              $and: [{
                $or: [{
                  ns: /^admin\.\$cmd/
                }, {
                  ns: {
                    $in: includeCollections.map(collName => "".concat(this._dbName, ".").concat(collName))
                  }
                }]
              }, {
                $or: oplogSelector.$or
              }, {
                ts: oplogSelector.ts
              }]
            };
            this._oplogOptions = {
              includeCollections
            };
          }
          const cursorDescription = new CursorDescription(OPLOG_COLLECTION, oplogSelector, {
            tailable: true
          });
          this._tailHandle = this._oplogTailConnection.tail(cursorDescription, doc => {
            this._entryQueue.push(doc);
            this._maybeStartWorker();
          }, TAIL_TIMEOUT);
          this._readyPromiseResolver();
        } catch (error) {
          console.error('Error in _startTailing:', error);
          throw error;
        }
      }
      _maybeStartWorker() {
        if (this._workerPromise) return;
        this._workerActive = true;
        // Convert to a proper promise-based queue processor
        this._workerPromise = (async () => {
          try {
            while (!this._stopped && !this._entryQueue.isEmpty()) {
              // Are we too far behind? Just tell our observers that they need to
              // repoll, and drop our queue.
              if (this._entryQueue.length > TOO_FAR_BEHIND) {
                const lastEntry = this._entryQueue.pop();
                this._entryQueue.clear();
                this._onSkippedEntriesHook.each(callback => {
                  callback();
                  return true;
                });
                // Free any waitUntilCaughtUp() calls that were waiting for us to
                // pass something that we just skipped.
                this._setLastProcessedTS(lastEntry.ts);
                continue;
              }
              // Process next batch from the queue
              const doc = this._entryQueue.shift();
              try {
                await handleDoc(this, doc);
                // Process any waiting fence callbacks
                if (doc.ts) {
                  this._setLastProcessedTS(doc.ts);
                }
              } catch (e) {
                // Keep processing queue even if one entry fails
                console.error('Error processing oplog entry:', e);
              }
            }
          } finally {
            this._workerPromise = null;
            this._workerActive = false;
          }
        })();
      }
      _setLastProcessedTS(ts) {
        this._lastProcessedTS = ts;
        while (!isEmpty(this._catchingUpResolvers) && this._catchingUpResolvers[0].ts.lessThanOrEqual(this._lastProcessedTS)) {
          const sequencer = this._catchingUpResolvers.shift();
          sequencer.resolver();
        }
      }
      _defineTooFarBehind(value) {
        TOO_FAR_BEHIND = value;
      }
      _resetTooFarBehind() {
        TOO_FAR_BEHIND = +(process.env.METEOR_OPLOG_TOO_FAR_BEHIND || 2000);
      }
    }
    function idForOp(op) {
      if (op.op === 'd' || op.op === 'i') {
        return op.o._id;
      } else if (op.op === 'u') {
        return op.o2._id;
      } else if (op.op === 'c') {
        throw Error("Operator 'c' doesn't supply an object with id: " + JSON.stringify(op));
      } else {
        throw Error("Unknown op: " + JSON.stringify(op));
      }
    }
    async function handleDoc(handle, doc) {
      if (doc.ns === "admin.$cmd") {
        if (doc.o.applyOps) {
          // This was a successful transaction, so we need to apply the
          // operations that were involved.
          let nextTimestamp = doc.ts;
          for (const op of doc.o.applyOps) {
            // See https://github.com/meteor/meteor/issues/10420.
            if (!op.ts) {
              op.ts = nextTimestamp;
              nextTimestamp = nextTimestamp.add(Long.ONE);
            }
            await handleDoc(handle, op);
          }
          return;
        }
        throw new Error("Unknown command " + JSON.stringify(doc));
      }
      const trigger = {
        dropCollection: false,
        dropDatabase: false,
        op: doc
      };
      if (typeof doc.ns === "string" && doc.ns.startsWith(handle._dbName + ".")) {
        trigger.collection = doc.ns.slice(handle._dbName.length + 1);
      }
      // Is it a special command and the collection name is hidden
      // somewhere in operator?
      if (trigger.collection === "$cmd") {
        if (doc.o.dropDatabase) {
          delete trigger.collection;
          trigger.dropDatabase = true;
        } else if ("drop" in doc.o) {
          trigger.collection = doc.o.drop;
          trigger.dropCollection = true;
          trigger.id = null;
        } else if ("create" in doc.o && "idIndex" in doc.o) {
          // A collection got implicitly created within a transaction. There's
          // no need to do anything about it.
        } else {
          throw Error("Unknown command " + JSON.stringify(doc));
        }
      } else {
        // All other ops have an id.
        trigger.id = idForOp(doc);
      }
      await handle._crossbar.fire(trigger);
      await new Promise(resolve => setImmediate(resolve));
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

},"observe_multiplex.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/observe_multiplex.ts                                                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
    const _excluded = ["_id"];
    module.export({
      ObserveMultiplexer: () => ObserveMultiplexer
    });
    let isEmpty;
    module.link("lodash.isempty", {
      default(v) {
        isEmpty = v;
      }
    }, 0);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    class ObserveMultiplexer {
      constructor(_ref) {
        var _this = this;
        let {
          ordered,
          onStop = () => {}
        } = _ref;
        this._ordered = void 0;
        this._onStop = void 0;
        this._queue = void 0;
        this._handles = void 0;
        this._resolver = void 0;
        this._readyPromise = void 0;
        this._isReady = void 0;
        this._cache = void 0;
        this._addHandleTasksScheduledButNotPerformed = void 0;
        if (ordered === undefined) throw Error("must specify ordered");
        // @ts-ignore
        Package['facts-base'] && Package['facts-base'].Facts.incrementServerFact("mongo-livedata", "observe-multiplexers", 1);
        this._ordered = ordered;
        this._onStop = onStop;
        this._queue = new Meteor._AsynchronousQueue();
        this._handles = {};
        this._resolver = null;
        this._isReady = false;
        this._readyPromise = new Promise(r => this._resolver = r).then(() => this._isReady = true);
        // @ts-ignore
        this._cache = new LocalCollection._CachingChangeObserver({
          ordered
        });
        this._addHandleTasksScheduledButNotPerformed = 0;
        this.callbackNames().forEach(callbackName => {
          this[callbackName] = function () {
            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }
            _this._applyCallback(callbackName, args);
          };
        });
      }
      addHandleAndSendInitialAdds(handle) {
        return this._addHandleAndSendInitialAdds(handle);
      }
      async _addHandleAndSendInitialAdds(handle) {
        ++this._addHandleTasksScheduledButNotPerformed;
        // @ts-ignore
        Package['facts-base'] && Package['facts-base'].Facts.incrementServerFact("mongo-livedata", "observe-handles", 1);
        await this._queue.runTask(async () => {
          this._handles[handle._id] = handle;
          await this._sendAdds(handle);
          --this._addHandleTasksScheduledButNotPerformed;
        });
        await this._readyPromise;
      }
      async removeHandle(id) {
        if (!this._ready()) throw new Error("Can't remove handles until the multiplex is ready");
        delete this._handles[id];
        // @ts-ignore
        Package['facts-base'] && Package['facts-base'].Facts.incrementServerFact("mongo-livedata", "observe-handles", -1);
        if (isEmpty(this._handles) && this._addHandleTasksScheduledButNotPerformed === 0) {
          await this._stop();
        }
      }
      async _stop() {
        let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        if (!this._ready() && !options.fromQueryError) throw Error("surprising _stop: not ready");
        await this._onStop();
        // @ts-ignore
        Package['facts-base'] && Package['facts-base'].Facts.incrementServerFact("mongo-livedata", "observe-multiplexers", -1);
        this._handles = null;
      }
      async ready() {
        await this._queue.queueTask(() => {
          if (this._ready()) throw Error("can't make ObserveMultiplex ready twice!");
          if (!this._resolver) {
            throw new Error("Missing resolver");
          }
          this._resolver();
          this._isReady = true;
        });
      }
      async queryError(err) {
        await this._queue.runTask(() => {
          if (this._ready()) throw Error("can't claim query has an error after it worked!");
          this._stop({
            fromQueryError: true
          });
          throw err;
        });
      }
      async onFlush(cb) {
        await this._queue.queueTask(async () => {
          if (!this._ready()) throw Error("only call onFlush on a multiplexer that will be ready");
          await cb();
        });
      }
      callbackNames() {
        return this._ordered ? ["addedBefore", "changed", "movedBefore", "removed"] : ["added", "changed", "removed"];
      }
      _ready() {
        return !!this._isReady;
      }
      _applyCallback(callbackName, args) {
        this._queue.queueTask(async () => {
          if (!this._handles) return;
          await this._cache.applyChange[callbackName].apply(null, args);
          if (!this._ready() && callbackName !== 'added' && callbackName !== 'addedBefore') {
            throw new Error("Got ".concat(callbackName, " during initial adds"));
          }
          for (const handleId of Object.keys(this._handles)) {
            const handle = this._handles && this._handles[handleId];
            if (!handle) return;
            const callback = handle["_".concat(callbackName)];
            if (!callback) continue;
            handle.initialAddsSent.then(callback.apply(null, handle.nonMutatingCallbacks ? args : EJSON.clone(args)));
          }
        });
      }
      async _sendAdds(handle) {
        const add = this._ordered ? handle._addedBefore : handle._added;
        if (!add) return;
        const addPromises = [];
        this._cache.docs.forEach((doc, id) => {
          if (!(handle._id in this._handles)) {
            throw Error("handle got removed before sending initial adds!");
          }
          const _ref2 = handle.nonMutatingCallbacks ? doc : EJSON.clone(doc),
            {
              _id
            } = _ref2,
            fields = _objectWithoutProperties(_ref2, _excluded);
          const promise = this._ordered ? add(id, fields, null) : add(id, fields);
          addPromises.push(promise);
        });
        await Promise.all(addPromises);
        handle.initialAddsSentResolver();
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

},"doc_fetcher.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/doc_fetcher.js                                                                                       //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  DocFetcher: () => DocFetcher
});
class DocFetcher {
  constructor(mongoConnection) {
    this._mongoConnection = mongoConnection;
    // Map from op -> [callback]
    this._callbacksForOp = new Map();
  }

  // Fetches document "id" from collectionName, returning it or null if not
  // found.
  //
  // If you make multiple calls to fetch() with the same op reference,
  // DocFetcher may assume that they all return the same document. (It does
  // not check to see if collectionName/id match.)
  //
  // You may assume that callback is never called synchronously (and in fact
  // OplogObserveDriver does so).
  async fetch(collectionName, id, op, callback) {
    const self = this;
    check(collectionName, String);
    check(op, Object);

    // If there's already an in-progress fetch for this cache key, yield until
    // it's done and return whatever it returns.
    if (self._callbacksForOp.has(op)) {
      self._callbacksForOp.get(op).push(callback);
      return;
    }
    const callbacks = [callback];
    self._callbacksForOp.set(op, callbacks);
    try {
      var doc = (await self._mongoConnection.findOneAsync(collectionName, {
        _id: id
      })) || null;
      // Return doc to all relevant callbacks. Note that this array can
      // continue to grow during callback excecution.
      while (callbacks.length > 0) {
        // Clone the document so that the various calls to fetch don't return
        // objects that are intertwingled with each other. Clone before
        // popping the future, so that if clone throws, the error gets passed
        // to the next callback.
        callbacks.pop()(null, EJSON.clone(doc));
      }
    } catch (e) {
      while (callbacks.length > 0) {
        callbacks.pop()(e);
      }
    } finally {
      // XXX consider keeping the doc around for a period of time before
      // removing from the cache
      self._callbacksForOp.delete(op);
    }
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"polling_observe_driver.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/polling_observe_driver.ts                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      PollingObserveDriver: () => PollingObserveDriver
    });
    let throttle;
    module.link("lodash.throttle", {
      default(v) {
        throttle = v;
      }
    }, 0);
    let listenAll;
    module.link("./mongo_driver", {
      listenAll(v) {
        listenAll = v;
      }
    }, 1);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    const POLLING_THROTTLE_MS = +(process.env.METEOR_POLLING_THROTTLE_MS || '') || 50;
    const POLLING_INTERVAL_MS = +(process.env.METEOR_POLLING_INTERVAL_MS || '') || 10 * 1000;
    /**
     * @class PollingObserveDriver
     *
     * One of two observe driver implementations.
     *
     * Characteristics:
     * - Caches the results of a query
     * - Reruns the query when necessary
     * - Suitable for cases where oplog tailing is not available or practical
     */
    class PollingObserveDriver {
      constructor(options) {
        this._options = void 0;
        this._cursorDescription = void 0;
        this._mongoHandle = void 0;
        this._ordered = void 0;
        this._multiplexer = void 0;
        this._stopCallbacks = void 0;
        this._stopped = void 0;
        this._cursor = void 0;
        this._results = void 0;
        this._pollsScheduledButNotStarted = void 0;
        this._pendingWrites = void 0;
        this._ensurePollIsScheduled = void 0;
        this._taskQueue = void 0;
        this._testOnlyPollCallback = void 0;
        this._options = options;
        this._cursorDescription = options.cursorDescription;
        this._mongoHandle = options.mongoHandle;
        this._ordered = options.ordered;
        this._multiplexer = options.multiplexer;
        this._stopCallbacks = [];
        this._stopped = false;
        this._cursor = this._mongoHandle._createAsynchronousCursor(this._cursorDescription);
        this._results = null;
        this._pollsScheduledButNotStarted = 0;
        this._pendingWrites = [];
        this._ensurePollIsScheduled = throttle(this._unthrottledEnsurePollIsScheduled.bind(this), this._cursorDescription.options.pollingThrottleMs || POLLING_THROTTLE_MS);
        this._taskQueue = new Meteor._AsynchronousQueue();
      }
      async _init() {
        var _Package$factsBase;
        const options = this._options;
        const listenersHandle = await listenAll(this._cursorDescription, notification => {
          const fence = DDPServer._getCurrentFence();
          if (fence) {
            this._pendingWrites.push(fence.beginWrite());
          }
          if (this._pollsScheduledButNotStarted === 0) {
            this._ensurePollIsScheduled();
          }
        });
        this._stopCallbacks.push(async () => {
          await listenersHandle.stop();
        });
        if (options._testOnlyPollCallback) {
          this._testOnlyPollCallback = options._testOnlyPollCallback;
        } else {
          const pollingInterval = this._cursorDescription.options.pollingIntervalMs || this._cursorDescription.options._pollingInterval || POLLING_INTERVAL_MS;
          const intervalHandle = Meteor.setInterval(this._ensurePollIsScheduled.bind(this), pollingInterval);
          this._stopCallbacks.push(() => {
            Meteor.clearInterval(intervalHandle);
          });
        }
        await this._unthrottledEnsurePollIsScheduled();
        (_Package$factsBase = Package['facts-base']) === null || _Package$factsBase === void 0 ? void 0 : _Package$factsBase.Facts.incrementServerFact("mongo-livedata", "observe-drivers-polling", 1);
      }
      async _unthrottledEnsurePollIsScheduled() {
        if (this._pollsScheduledButNotStarted > 0) return;
        ++this._pollsScheduledButNotStarted;
        await this._taskQueue.runTask(async () => {
          await this._pollMongo();
        });
      }
      _suspendPolling() {
        ++this._pollsScheduledButNotStarted;
        this._taskQueue.runTask(() => {});
        if (this._pollsScheduledButNotStarted !== 1) {
          throw new Error("_pollsScheduledButNotStarted is ".concat(this._pollsScheduledButNotStarted));
        }
      }
      async _resumePolling() {
        if (this._pollsScheduledButNotStarted !== 1) {
          throw new Error("_pollsScheduledButNotStarted is ".concat(this._pollsScheduledButNotStarted));
        }
        await this._taskQueue.runTask(async () => {
          await this._pollMongo();
        });
      }
      async _pollMongo() {
        var _this$_testOnlyPollCa;
        --this._pollsScheduledButNotStarted;
        if (this._stopped) return;
        let first = false;
        let newResults;
        let oldResults = this._results;
        if (!oldResults) {
          first = true;
          oldResults = this._ordered ? [] : new LocalCollection._IdMap();
        }
        (_this$_testOnlyPollCa = this._testOnlyPollCallback) === null || _this$_testOnlyPollCa === void 0 ? void 0 : _this$_testOnlyPollCa.call(this);
        const writesForCycle = this._pendingWrites;
        this._pendingWrites = [];
        try {
          newResults = await this._cursor.getRawObjects(this._ordered);
        } catch (e) {
          if (first && typeof e.code === 'number') {
            await this._multiplexer.queryError(new Error("Exception while polling query ".concat(JSON.stringify(this._cursorDescription), ": ").concat(e.message)));
          }
          Array.prototype.push.apply(this._pendingWrites, writesForCycle);
          Meteor._debug("Exception while polling query ".concat(JSON.stringify(this._cursorDescription)), e);
          return;
        }
        if (!this._stopped) {
          LocalCollection._diffQueryChanges(this._ordered, oldResults, newResults, this._multiplexer);
        }
        if (first) this._multiplexer.ready();
        this._results = newResults;
        await this._multiplexer.onFlush(async () => {
          for (const w of writesForCycle) {
            await w.committed();
          }
        });
      }
      async stop() {
        var _Package$factsBase2;
        this._stopped = true;
        for (const callback of this._stopCallbacks) {
          await callback();
        }
        for (const w of this._pendingWrites) {
          await w.committed();
        }
        (_Package$factsBase2 = Package['facts-base']) === null || _Package$factsBase2 === void 0 ? void 0 : _Package$factsBase2.Facts.incrementServerFact("mongo-livedata", "observe-drivers-polling", -1);
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

},"oplog_observe_driver.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/oplog_observe_driver.js                                                                              //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    let _asyncIterator;
    module.link("@babel/runtime/helpers/asyncIterator", {
      default(v) {
        _asyncIterator = v;
      }
    }, 0);
    module.export({
      OplogObserveDriver: () => OplogObserveDriver
    });
    let has;
    module.link("lodash.has", {
      default(v) {
        has = v;
      }
    }, 0);
    let isEmpty;
    module.link("lodash.isempty", {
      default(v) {
        isEmpty = v;
      }
    }, 1);
    let oplogV2V1Converter;
    module.link("./oplog_v2_converter", {
      oplogV2V1Converter(v) {
        oplogV2V1Converter = v;
      }
    }, 2);
    let check, Match;
    module.link("meteor/check", {
      check(v) {
        check = v;
      },
      Match(v) {
        Match = v;
      }
    }, 3);
    let CursorDescription;
    module.link("./cursor_description", {
      CursorDescription(v) {
        CursorDescription = v;
      }
    }, 4);
    let forEachTrigger, listenAll;
    module.link("./mongo_driver", {
      forEachTrigger(v) {
        forEachTrigger = v;
      },
      listenAll(v) {
        listenAll = v;
      }
    }, 5);
    let Cursor;
    module.link("./cursor", {
      Cursor(v) {
        Cursor = v;
      }
    }, 6);
    let LocalCollection;
    module.link("meteor/minimongo/local_collection", {
      default(v) {
        LocalCollection = v;
      }
    }, 7);
    let idForOp;
    module.link("./oplog_tailing", {
      idForOp(v) {
        idForOp = v;
      }
    }, 8);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    var PHASE = {
      QUERYING: "QUERYING",
      FETCHING: "FETCHING",
      STEADY: "STEADY"
    };

    // Exception thrown by _needToPollQuery which unrolls the stack up to the
    // enclosing call to finishIfNeedToPollQuery.
    var SwitchedToQuery = function () {};
    var finishIfNeedToPollQuery = function (f) {
      return function () {
        try {
          f.apply(this, arguments);
        } catch (e) {
          if (!(e instanceof SwitchedToQuery)) throw e;
        }
      };
    };
    var currentId = 0;

    /**
     * @class OplogObserveDriver
     * An alternative to PollingObserveDriver which follows the MongoDB operation log
     * instead of re-polling the query.
     *
     * Characteristics:
     * - Follows the MongoDB operation log
     * - Directly observes database changes
     * - More efficient than polling for most use cases
     * - Requires access to MongoDB oplog
     *
     * Interface:
     * - Construction initiates observeChanges callbacks and ready() invocation to the ObserveMultiplexer
     * - Observation can be terminated via the stop() method
     */
    const OplogObserveDriver = function (options) {
      const self = this;
      self._usesOplog = true; // tests look at this

      self._id = currentId;
      currentId++;
      self._cursorDescription = options.cursorDescription;
      self._mongoHandle = options.mongoHandle;
      self._multiplexer = options.multiplexer;
      if (options.ordered) {
        throw Error("OplogObserveDriver only supports unordered observeChanges");
      }
      const sorter = options.sorter;
      // We don't support $near and other geo-queries so it's OK to initialize the
      // comparator only once in the constructor.
      const comparator = sorter && sorter.getComparator();
      if (options.cursorDescription.options.limit) {
        // There are several properties ordered driver implements:
        // - _limit is a positive number
        // - _comparator is a function-comparator by which the query is ordered
        // - _unpublishedBuffer is non-null Min/Max Heap,
        //                      the empty buffer in STEADY phase implies that the
        //                      everything that matches the queries selector fits
        //                      into published set.
        // - _published - Max Heap (also implements IdMap methods)

        const heapOptions = {
          IdMap: LocalCollection._IdMap
        };
        self._limit = self._cursorDescription.options.limit;
        self._comparator = comparator;
        self._sorter = sorter;
        self._unpublishedBuffer = new MinMaxHeap(comparator, heapOptions);
        // We need something that can find Max value in addition to IdMap interface
        self._published = new MaxHeap(comparator, heapOptions);
      } else {
        self._limit = 0;
        self._comparator = null;
        self._sorter = null;
        self._unpublishedBuffer = null;
        // Memory Growth
        self._published = new LocalCollection._IdMap();
      }

      // Indicates if it is safe to insert a new document at the end of the buffer
      // for this query. i.e. it is known that there are no documents matching the
      // selector those are not in published or buffer.
      self._safeAppendToBuffer = false;
      self._stopped = false;
      self._stopHandles = [];
      self._addStopHandles = function (newStopHandles) {
        const expectedPattern = Match.ObjectIncluding({
          stop: Function
        });
        // Single item or array
        check(newStopHandles, Match.OneOf([expectedPattern], expectedPattern));
        self._stopHandles.push(newStopHandles);
      };
      Package['facts-base'] && Package['facts-base'].Facts.incrementServerFact("mongo-livedata", "observe-drivers-oplog", 1);
      self._registerPhaseChange(PHASE.QUERYING);
      self._matcher = options.matcher;
      // we are now using projection, not fields in the cursor description even if you pass {fields}
      // in the cursor construction
      const projection = self._cursorDescription.options.fields || self._cursorDescription.options.projection || {};
      self._projectionFn = LocalCollection._compileProjection(projection);
      // Projection function, result of combining important fields for selector and
      // existing fields projection
      self._sharedProjection = self._matcher.combineIntoProjection(projection);
      if (sorter) self._sharedProjection = sorter.combineIntoProjection(self._sharedProjection);
      self._sharedProjectionFn = LocalCollection._compileProjection(self._sharedProjection);
      self._needToFetch = new LocalCollection._IdMap();
      self._currentlyFetching = null;
      self._fetchGeneration = 0;
      self._requeryWhenDoneThisQuery = false;
      self._writesToCommitWhenWeReachSteady = [];
    };
    Object.assign(OplogObserveDriver.prototype, {
      _init: async function () {
        const self = this;

        // If the oplog handle tells us that it skipped some entries (because it got
        // behind, say), re-poll.
        self._addStopHandles(self._mongoHandle._oplogHandle.onSkippedEntries(finishIfNeedToPollQuery(function () {
          return self._needToPollQuery();
        })));
        await forEachTrigger(self._cursorDescription, async function (trigger) {
          self._addStopHandles(await self._mongoHandle._oplogHandle.onOplogEntry(trigger, function (notification) {
            finishIfNeedToPollQuery(function () {
              const op = notification.op;
              if (notification.dropCollection || notification.dropDatabase) {
                // Note: this call is not allowed to block on anything (especially
                // on waiting for oplog entries to catch up) because that will block
                // onOplogEntry!
                return self._needToPollQuery();
              } else {
                // All other operators should be handled depending on phase
                if (self._phase === PHASE.QUERYING) {
                  return self._handleOplogEntryQuerying(op);
                } else {
                  return self._handleOplogEntrySteadyOrFetching(op);
                }
              }
            })();
          }));
        });

        // XXX ordering w.r.t. everything else?
        self._addStopHandles(await listenAll(self._cursorDescription, function () {
          // If we're not in a pre-fire write fence, we don't have to do anything.
          const fence = DDPServer._getCurrentFence();
          if (!fence || fence.fired) return;
          if (fence._oplogObserveDrivers) {
            fence._oplogObserveDrivers[self._id] = self;
            return;
          }
          fence._oplogObserveDrivers = {};
          fence._oplogObserveDrivers[self._id] = self;
          fence.onBeforeFire(async function () {
            const drivers = fence._oplogObserveDrivers;
            delete fence._oplogObserveDrivers;

            // This fence cannot fire until we've caught up to "this point" in the
            // oplog, and all observers made it back to the steady state.
            await self._mongoHandle._oplogHandle.waitUntilCaughtUp();
            for (const driver of Object.values(drivers)) {
              if (driver._stopped) continue;
              const write = await fence.beginWrite();
              if (driver._phase === PHASE.STEADY) {
                // Make sure that all of the callbacks have made it through the
                // multiplexer and been delivered to ObserveHandles before committing
                // writes.
                await driver._multiplexer.onFlush(write.committed);
              } else {
                driver._writesToCommitWhenWeReachSteady.push(write);
              }
            }
          });
        }));

        // When Mongo fails over, we need to repoll the query, in case we processed an
        // oplog entry that got rolled back.
        self._addStopHandles(self._mongoHandle._onFailover(finishIfNeedToPollQuery(function () {
          return self._needToPollQuery();
        })));

        // Give _observeChanges a chance to add the new ObserveHandle to our
        // multiplexer, so that the added calls get streamed.
        return self._runInitialQuery();
      },
      _addPublished: function (id, doc) {
        var self = this;
        Meteor._noYieldsAllowed(function () {
          var fields = Object.assign({}, doc);
          delete fields._id;
          self._published.set(id, self._sharedProjectionFn(doc));
          self._multiplexer.added(id, self._projectionFn(fields));

          // After adding this document, the published set might be overflowed
          // (exceeding capacity specified by limit). If so, push the maximum
          // element to the buffer, we might want to save it in memory to reduce the
          // amount of Mongo lookups in the future.
          if (self._limit && self._published.size() > self._limit) {
            // XXX in theory the size of published is no more than limit+1
            if (self._published.size() !== self._limit + 1) {
              throw new Error("After adding to published, " + (self._published.size() - self._limit) + " documents are overflowing the set");
            }
            var overflowingDocId = self._published.maxElementId();
            var overflowingDoc = self._published.get(overflowingDocId);
            if (EJSON.equals(overflowingDocId, id)) {
              throw new Error("The document just added is overflowing the published set");
            }
            self._published.remove(overflowingDocId);
            self._multiplexer.removed(overflowingDocId);
            self._addBuffered(overflowingDocId, overflowingDoc);
          }
        });
      },
      _removePublished: function (id) {
        var self = this;
        Meteor._noYieldsAllowed(function () {
          self._published.remove(id);
          self._multiplexer.removed(id);
          if (!self._limit || self._published.size() === self._limit) return;
          if (self._published.size() > self._limit) throw Error("self._published got too big");

          // OK, we are publishing less than the limit. Maybe we should look in the
          // buffer to find the next element past what we were publishing before.

          if (!self._unpublishedBuffer.empty()) {
            // There's something in the buffer; move the first thing in it to
            // _published.
            var newDocId = self._unpublishedBuffer.minElementId();
            var newDoc = self._unpublishedBuffer.get(newDocId);
            self._removeBuffered(newDocId);
            self._addPublished(newDocId, newDoc);
            return;
          }

          // There's nothing in the buffer.  This could mean one of a few things.

          // (a) We could be in the middle of re-running the query (specifically, we
          // could be in _publishNewResults). In that case, _unpublishedBuffer is
          // empty because we clear it at the beginning of _publishNewResults. In
          // this case, our caller already knows the entire answer to the query and
          // we don't need to do anything fancy here.  Just return.
          if (self._phase === PHASE.QUERYING) return;

          // (b) We're pretty confident that the union of _published and
          // _unpublishedBuffer contain all documents that match selector. Because
          // _unpublishedBuffer is empty, that means we're confident that _published
          // contains all documents that match selector. So we have nothing to do.
          if (self._safeAppendToBuffer) return;

          // (c) Maybe there are other documents out there that should be in our
          // buffer. But in that case, when we emptied _unpublishedBuffer in
          // _removeBuffered, we should have called _needToPollQuery, which will
          // either put something in _unpublishedBuffer or set _safeAppendToBuffer
          // (or both), and it will put us in QUERYING for that whole time. So in
          // fact, we shouldn't be able to get here.

          throw new Error("Buffer inexplicably empty");
        });
      },
      _changePublished: function (id, oldDoc, newDoc) {
        var self = this;
        Meteor._noYieldsAllowed(function () {
          self._published.set(id, self._sharedProjectionFn(newDoc));
          var projectedNew = self._projectionFn(newDoc);
          var projectedOld = self._projectionFn(oldDoc);
          var changed = DiffSequence.makeChangedFields(projectedNew, projectedOld);
          if (!isEmpty(changed)) self._multiplexer.changed(id, changed);
        });
      },
      _addBuffered: function (id, doc) {
        var self = this;
        Meteor._noYieldsAllowed(function () {
          self._unpublishedBuffer.set(id, self._sharedProjectionFn(doc));

          // If something is overflowing the buffer, we just remove it from cache
          if (self._unpublishedBuffer.size() > self._limit) {
            var maxBufferedId = self._unpublishedBuffer.maxElementId();
            self._unpublishedBuffer.remove(maxBufferedId);

            // Since something matching is removed from cache (both published set and
            // buffer), set flag to false
            self._safeAppendToBuffer = false;
          }
        });
      },
      // Is called either to remove the doc completely from matching set or to move
      // it to the published set later.
      _removeBuffered: function (id) {
        var self = this;
        Meteor._noYieldsAllowed(function () {
          self._unpublishedBuffer.remove(id);
          // To keep the contract "buffer is never empty in STEADY phase unless the
          // everything matching fits into published" true, we poll everything as
          // soon as we see the buffer becoming empty.
          if (!self._unpublishedBuffer.size() && !self._safeAppendToBuffer) self._needToPollQuery();
        });
      },
      // Called when a document has joined the "Matching" results set.
      // Takes responsibility of keeping _unpublishedBuffer in sync with _published
      // and the effect of limit enforced.
      _addMatching: function (doc) {
        var self = this;
        Meteor._noYieldsAllowed(function () {
          var id = doc._id;
          if (self._published.has(id)) throw Error("tried to add something already published " + id);
          if (self._limit && self._unpublishedBuffer.has(id)) throw Error("tried to add something already existed in buffer " + id);
          var limit = self._limit;
          var comparator = self._comparator;
          var maxPublished = limit && self._published.size() > 0 ? self._published.get(self._published.maxElementId()) : null;
          var maxBuffered = limit && self._unpublishedBuffer.size() > 0 ? self._unpublishedBuffer.get(self._unpublishedBuffer.maxElementId()) : null;
          // The query is unlimited or didn't publish enough documents yet or the
          // new document would fit into published set pushing the maximum element
          // out, then we need to publish the doc.
          var toPublish = !limit || self._published.size() < limit || comparator(doc, maxPublished) < 0;

          // Otherwise we might need to buffer it (only in case of limited query).
          // Buffering is allowed if the buffer is not filled up yet and all
          // matching docs are either in the published set or in the buffer.
          var canAppendToBuffer = !toPublish && self._safeAppendToBuffer && self._unpublishedBuffer.size() < limit;

          // Or if it is small enough to be safely inserted to the middle or the
          // beginning of the buffer.
          var canInsertIntoBuffer = !toPublish && maxBuffered && comparator(doc, maxBuffered) <= 0;
          var toBuffer = canAppendToBuffer || canInsertIntoBuffer;
          if (toPublish) {
            self._addPublished(id, doc);
          } else if (toBuffer) {
            self._addBuffered(id, doc);
          } else {
            // dropping it and not saving to the cache
            self._safeAppendToBuffer = false;
          }
        });
      },
      // Called when a document leaves the "Matching" results set.
      // Takes responsibility of keeping _unpublishedBuffer in sync with _published
      // and the effect of limit enforced.
      _removeMatching: function (id) {
        var self = this;
        Meteor._noYieldsAllowed(function () {
          if (!self._published.has(id) && !self._limit) throw Error("tried to remove something matching but not cached " + id);
          if (self._published.has(id)) {
            self._removePublished(id);
          } else if (self._unpublishedBuffer.has(id)) {
            self._removeBuffered(id);
          }
        });
      },
      _handleDoc: function (id, newDoc) {
        var self = this;
        Meteor._noYieldsAllowed(function () {
          var matchesNow = newDoc && self._matcher.documentMatches(newDoc).result;
          var publishedBefore = self._published.has(id);
          var bufferedBefore = self._limit && self._unpublishedBuffer.has(id);
          var cachedBefore = publishedBefore || bufferedBefore;
          if (matchesNow && !cachedBefore) {
            self._addMatching(newDoc);
          } else if (cachedBefore && !matchesNow) {
            self._removeMatching(id);
          } else if (cachedBefore && matchesNow) {
            var oldDoc = self._published.get(id);
            var comparator = self._comparator;
            var minBuffered = self._limit && self._unpublishedBuffer.size() && self._unpublishedBuffer.get(self._unpublishedBuffer.minElementId());
            var maxBuffered;
            if (publishedBefore) {
              // Unlimited case where the document stays in published once it
              // matches or the case when we don't have enough matching docs to
              // publish or the changed but matching doc will stay in published
              // anyways.
              //
              // XXX: We rely on the emptiness of buffer. Be sure to maintain the
              // fact that buffer can't be empty if there are matching documents not
              // published. Notably, we don't want to schedule repoll and continue
              // relying on this property.
              var staysInPublished = !self._limit || self._unpublishedBuffer.size() === 0 || comparator(newDoc, minBuffered) <= 0;
              if (staysInPublished) {
                self._changePublished(id, oldDoc, newDoc);
              } else {
                // after the change doc doesn't stay in the published, remove it
                self._removePublished(id);
                // but it can move into buffered now, check it
                maxBuffered = self._unpublishedBuffer.get(self._unpublishedBuffer.maxElementId());
                var toBuffer = self._safeAppendToBuffer || maxBuffered && comparator(newDoc, maxBuffered) <= 0;
                if (toBuffer) {
                  self._addBuffered(id, newDoc);
                } else {
                  // Throw away from both published set and buffer
                  self._safeAppendToBuffer = false;
                }
              }
            } else if (bufferedBefore) {
              oldDoc = self._unpublishedBuffer.get(id);
              // remove the old version manually instead of using _removeBuffered so
              // we don't trigger the querying immediately.  if we end this block
              // with the buffer empty, we will need to trigger the query poll
              // manually too.
              self._unpublishedBuffer.remove(id);
              var maxPublished = self._published.get(self._published.maxElementId());
              maxBuffered = self._unpublishedBuffer.size() && self._unpublishedBuffer.get(self._unpublishedBuffer.maxElementId());

              // the buffered doc was updated, it could move to published
              var toPublish = comparator(newDoc, maxPublished) < 0;

              // or stays in buffer even after the change
              var staysInBuffer = !toPublish && self._safeAppendToBuffer || !toPublish && maxBuffered && comparator(newDoc, maxBuffered) <= 0;
              if (toPublish) {
                self._addPublished(id, newDoc);
              } else if (staysInBuffer) {
                // stays in buffer but changes
                self._unpublishedBuffer.set(id, newDoc);
              } else {
                // Throw away from both published set and buffer
                self._safeAppendToBuffer = false;
                // Normally this check would have been done in _removeBuffered but
                // we didn't use it, so we need to do it ourself now.
                if (!self._unpublishedBuffer.size()) {
                  self._needToPollQuery();
                }
              }
            } else {
              throw new Error("cachedBefore implies either of publishedBefore or bufferedBefore is true.");
            }
          }
        });
      },
      _fetchModifiedDocuments: function () {
        var self = this;
        self._registerPhaseChange(PHASE.FETCHING);
        // Defer, because nothing called from the oplog entry handler may yield,
        // but fetch() yields.
        Meteor.defer(finishIfNeedToPollQuery(async function () {
          while (!self._stopped && !self._needToFetch.empty()) {
            if (self._phase === PHASE.QUERYING) {
              // While fetching, we decided to go into QUERYING mode, and then we
              // saw another oplog entry, so _needToFetch is not empty. But we
              // shouldn't fetch these documents until AFTER the query is done.
              break;
            }

            // Being in steady phase here would be surprising.
            if (self._phase !== PHASE.FETCHING) throw new Error("phase in fetchModifiedDocuments: " + self._phase);
            self._currentlyFetching = self._needToFetch;
            var thisGeneration = ++self._fetchGeneration;
            self._needToFetch = new LocalCollection._IdMap();

            // Create an array of promises for all the fetch operations
            const fetchPromises = [];
            self._currentlyFetching.forEach(function (op, id) {
              const fetchPromise = new Promise((resolve, reject) => {
                self._mongoHandle._docFetcher.fetch(self._cursorDescription.collectionName, id, op, finishIfNeedToPollQuery(function (err, doc) {
                  if (err) {
                    Meteor._debug('Got exception while fetching documents', err);
                    // If we get an error from the fetcher (eg, trouble
                    // connecting to Mongo), let's just abandon the fetch phase
                    // altogether and fall back to polling. It's not like we're
                    // getting live updates anyway.
                    if (self._phase !== PHASE.QUERYING) {
                      self._needToPollQuery();
                    }
                    resolve();
                    return;
                  }
                  if (!self._stopped && self._phase === PHASE.FETCHING && self._fetchGeneration === thisGeneration) {
                    // We re-check the generation in case we've had an explicit
                    // _pollQuery call (eg, in another fiber) which should
                    // effectively cancel this round of fetches.  (_pollQuery
                    // increments the generation.)
                    try {
                      self._handleDoc(id, doc);
                      resolve();
                    } catch (err) {
                      reject(err);
                    }
                  } else {
                    resolve();
                  }
                }));
              });
              fetchPromises.push(fetchPromise);
            });
            // Wait for all fetch operations to complete
            try {
              const results = await Promise.allSettled(fetchPromises);
              const errors = results.filter(result => result.status === 'rejected').map(result => result.reason);
              if (errors.length > 0) {
                Meteor._debug('Some fetch queries failed:', errors);
              }
            } catch (err) {
              Meteor._debug('Got an exception in a fetch query', err);
            }
            // Exit now if we've had a _pollQuery call (here or in another fiber).
            if (self._phase === PHASE.QUERYING) return;
            self._currentlyFetching = null;
          }
          // We're done fetching, so we can be steady, unless we've had a
          // _pollQuery call (here or in another fiber).
          if (self._phase !== PHASE.QUERYING) await self._beSteady();
        }));
      },
      _beSteady: async function () {
        var self = this;
        self._registerPhaseChange(PHASE.STEADY);
        var writes = self._writesToCommitWhenWeReachSteady || [];
        self._writesToCommitWhenWeReachSteady = [];
        await self._multiplexer.onFlush(async function () {
          try {
            for (const w of writes) {
              await w.committed();
            }
          } catch (e) {
            console.error("_beSteady error", {
              writes
            }, e);
          }
        });
      },
      _handleOplogEntryQuerying: function (op) {
        var self = this;
        Meteor._noYieldsAllowed(function () {
          self._needToFetch.set(idForOp(op), op);
        });
      },
      _handleOplogEntrySteadyOrFetching: function (op) {
        var self = this;
        Meteor._noYieldsAllowed(function () {
          var id = idForOp(op);
          // If we're already fetching this one, or about to, we can't optimize;
          // make sure that we fetch it again if necessary.

          if (self._phase === PHASE.FETCHING && (self._currentlyFetching && self._currentlyFetching.has(id) || self._needToFetch.has(id))) {
            self._needToFetch.set(id, op);
            return;
          }
          if (op.op === 'd') {
            if (self._published.has(id) || self._limit && self._unpublishedBuffer.has(id)) self._removeMatching(id);
          } else if (op.op === 'i') {
            if (self._published.has(id)) throw new Error("insert found for already-existing ID in published");
            if (self._unpublishedBuffer && self._unpublishedBuffer.has(id)) throw new Error("insert found for already-existing ID in buffer");

            // XXX what if selector yields?  for now it can't but later it could
            // have $where
            if (self._matcher.documentMatches(op.o).result) self._addMatching(op.o);
          } else if (op.op === 'u') {
            // we are mapping the new oplog format on mongo 5
            // to what we know better, $set
            op.o = oplogV2V1Converter(op.o);
            // Is this a modifier ($set/$unset, which may require us to poll the
            // database to figure out if the whole document matches the selector) or
            // a replacement (in which case we can just directly re-evaluate the
            // selector)?
            // oplog format has changed on mongodb 5, we have to support both now
            // diff is the format in Mongo 5+ (oplog v2)
            var isReplace = !has(op.o, '$set') && !has(op.o, 'diff') && !has(op.o, '$unset');
            // If this modifier modifies something inside an EJSON custom type (ie,
            // anything with EJSON$), then we can't try to use
            // LocalCollection._modify, since that just mutates the EJSON encoding,
            // not the actual object.
            var canDirectlyModifyDoc = !isReplace && modifierCanBeDirectlyApplied(op.o);
            var publishedBefore = self._published.has(id);
            var bufferedBefore = self._limit && self._unpublishedBuffer.has(id);
            if (isReplace) {
              self._handleDoc(id, Object.assign({
                _id: id
              }, op.o));
            } else if ((publishedBefore || bufferedBefore) && canDirectlyModifyDoc) {
              // Oh great, we actually know what the document is, so we can apply
              // this directly.
              var newDoc = self._published.has(id) ? self._published.get(id) : self._unpublishedBuffer.get(id);
              newDoc = EJSON.clone(newDoc);
              newDoc._id = id;
              try {
                LocalCollection._modify(newDoc, op.o);
              } catch (e) {
                if (e.name !== "MinimongoError") throw e;
                // We didn't understand the modifier.  Re-fetch.
                self._needToFetch.set(id, op);
                if (self._phase === PHASE.STEADY) {
                  self._fetchModifiedDocuments();
                }
                return;
              }
              self._handleDoc(id, self._sharedProjectionFn(newDoc));
            } else if (!canDirectlyModifyDoc || self._matcher.canBecomeTrueByModifier(op.o) || self._sorter && self._sorter.affectedByModifier(op.o)) {
              self._needToFetch.set(id, op);
              if (self._phase === PHASE.STEADY) self._fetchModifiedDocuments();
            }
          } else {
            throw Error("XXX SURPRISING OPERATION: " + op);
          }
        });
      },
      async _runInitialQueryAsync() {
        var self = this;
        if (self._stopped) throw new Error("oplog stopped surprisingly early");
        await self._runQuery({
          initial: true
        }); // yields

        if (self._stopped) return; // can happen on queryError

        // Allow observeChanges calls to return. (After this, it's possible for
        // stop() to be called.)
        await self._multiplexer.ready();
        await self._doneQuerying(); // yields
      },
      // Yields!
      _runInitialQuery: function () {
        return this._runInitialQueryAsync();
      },
      // In various circumstances, we may just want to stop processing the oplog and
      // re-run the initial query, just as if we were a PollingObserveDriver.
      //
      // This function may not block, because it is called from an oplog entry
      // handler.
      //
      // XXX We should call this when we detect that we've been in FETCHING for "too
      // long".
      //
      // XXX We should call this when we detect Mongo failover (since that might
      // mean that some of the oplog entries we have processed have been rolled
      // back). The Node Mongo driver is in the middle of a bunch of huge
      // refactorings, including the way that it notifies you when primary
      // changes. Will put off implementing this until driver 1.4 is out.
      _pollQuery: function () {
        var self = this;
        Meteor._noYieldsAllowed(function () {
          if (self._stopped) return;

          // Yay, we get to forget about all the things we thought we had to fetch.
          self._needToFetch = new LocalCollection._IdMap();
          self._currentlyFetching = null;
          ++self._fetchGeneration; // ignore any in-flight fetches
          self._registerPhaseChange(PHASE.QUERYING);

          // Defer so that we don't yield.  We don't need finishIfNeedToPollQuery
          // here because SwitchedToQuery is not thrown in QUERYING mode.
          Meteor.defer(async function () {
            await self._runQuery();
            await self._doneQuerying();
          });
        });
      },
      // Yields!
      async _runQueryAsync(options) {
        var self = this;
        options = options || {};
        var newResults, newBuffer;

        // This while loop is just to retry failures.
        while (true) {
          // If we've been stopped, we don't have to run anything any more.
          if (self._stopped) return;
          newResults = new LocalCollection._IdMap();
          newBuffer = new LocalCollection._IdMap();

          // Query 2x documents as the half excluded from the original query will go
          // into unpublished buffer to reduce additional Mongo lookups in cases
          // when documents are removed from the published set and need a
          // replacement.
          // XXX needs more thought on non-zero skip
          // XXX 2 is a "magic number" meaning there is an extra chunk of docs for
          // buffer if such is needed.
          var cursor = self._cursorForQuery({
            limit: self._limit * 2
          });
          try {
            await cursor.forEach(function (doc, i) {
              // yields
              if (!self._limit || i < self._limit) {
                newResults.set(doc._id, doc);
              } else {
                newBuffer.set(doc._id, doc);
              }
            });
            break;
          } catch (e) {
            if (options.initial && typeof e.code === 'number') {
              // This is an error document sent to us by mongod, not a connection
              // error generated by the client. And we've never seen this query work
              // successfully. Probably it's a bad selector or something, so we
              // should NOT retry. Instead, we should halt the observe (which ends
              // up calling `stop` on us).
              await self._multiplexer.queryError(e);
              return;
            }

            // During failover (eg) if we get an exception we should log and retry
            // instead of crashing.
            Meteor._debug("Got exception while polling query", e);
            await Meteor._sleepForMs(100);
          }
        }
        if (self._stopped) return;
        self._publishNewResults(newResults, newBuffer);
      },
      // Yields!
      _runQuery: function (options) {
        return this._runQueryAsync(options);
      },
      // Transitions to QUERYING and runs another query, or (if already in QUERYING)
      // ensures that we will query again later.
      //
      // This function may not block, because it is called from an oplog entry
      // handler. However, if we were not already in the QUERYING phase, it throws
      // an exception that is caught by the closest surrounding
      // finishIfNeedToPollQuery call; this ensures that we don't continue running
      // close that was designed for another phase inside PHASE.QUERYING.
      //
      // (It's also necessary whenever logic in this file yields to check that other
      // phases haven't put us into QUERYING mode, though; eg,
      // _fetchModifiedDocuments does this.)
      _needToPollQuery: function () {
        var self = this;
        Meteor._noYieldsAllowed(function () {
          if (self._stopped) return;

          // If we're not already in the middle of a query, we can query now
          // (possibly pausing FETCHING).
          if (self._phase !== PHASE.QUERYING) {
            self._pollQuery();
            throw new SwitchedToQuery();
          }

          // We're currently in QUERYING. Set a flag to ensure that we run another
          // query when we're done.
          self._requeryWhenDoneThisQuery = true;
        });
      },
      // Yields!
      _doneQuerying: async function () {
        var self = this;
        if (self._stopped) return;
        await self._mongoHandle._oplogHandle.waitUntilCaughtUp();
        if (self._stopped) return;
        if (self._phase !== PHASE.QUERYING) throw Error("Phase unexpectedly " + self._phase);
        if (self._requeryWhenDoneThisQuery) {
          self._requeryWhenDoneThisQuery = false;
          self._pollQuery();
        } else if (self._needToFetch.empty()) {
          await self._beSteady();
        } else {
          self._fetchModifiedDocuments();
        }
      },
      _cursorForQuery: function (optionsOverwrite) {
        var self = this;
        return Meteor._noYieldsAllowed(function () {
          // The query we run is almost the same as the cursor we are observing,
          // with a few changes. We need to read all the fields that are relevant to
          // the selector, not just the fields we are going to publish (that's the
          // "shared" projection). And we don't want to apply any transform in the
          // cursor, because observeChanges shouldn't use the transform.
          var options = Object.assign({}, self._cursorDescription.options);

          // Allow the caller to modify the options. Useful to specify different
          // skip and limit values.
          Object.assign(options, optionsOverwrite);
          options.fields = self._sharedProjection;
          delete options.transform;
          // We are NOT deep cloning fields or selector here, which should be OK.
          var description = new CursorDescription(self._cursorDescription.collectionName, self._cursorDescription.selector, options);
          return new Cursor(self._mongoHandle, description);
        });
      },
      // Replace self._published with newResults (both are IdMaps), invoking observe
      // callbacks on the multiplexer.
      // Replace self._unpublishedBuffer with newBuffer.
      //
      // XXX This is very similar to LocalCollection._diffQueryUnorderedChanges. We
      // should really: (a) Unify IdMap and OrderedDict into Unordered/OrderedDict
      // (b) Rewrite diff.js to use these classes instead of arrays and objects.
      _publishNewResults: function (newResults, newBuffer) {
        var self = this;
        Meteor._noYieldsAllowed(function () {
          // If the query is limited and there is a buffer, shut down so it doesn't
          // stay in a way.
          if (self._limit) {
            self._unpublishedBuffer.clear();
          }

          // First remove anything that's gone. Be careful not to modify
          // self._published while iterating over it.
          var idsToRemove = [];
          self._published.forEach(function (doc, id) {
            if (!newResults.has(id)) idsToRemove.push(id);
          });
          idsToRemove.forEach(function (id) {
            self._removePublished(id);
          });

          // Now do adds and changes.
          // If self has a buffer and limit, the new fetched result will be
          // limited correctly as the query has sort specifier.
          newResults.forEach(function (doc, id) {
            self._handleDoc(id, doc);
          });

          // Sanity-check that everything we tried to put into _published ended up
          // there.
          // XXX if this is slow, remove it later
          if (self._published.size() !== newResults.size()) {
            Meteor._debug('The Mongo server and the Meteor query disagree on how ' + 'many documents match your query. Cursor description: ', self._cursorDescription);
          }
          self._published.forEach(function (doc, id) {
            if (!newResults.has(id)) throw Error("_published has a doc that newResults doesn't; " + id);
          });

          // Finally, replace the buffer
          newBuffer.forEach(function (doc, id) {
            self._addBuffered(id, doc);
          });
          self._safeAppendToBuffer = newBuffer.size() < self._limit;
        });
      },
      // This stop function is invoked from the onStop of the ObserveMultiplexer, so
      // it shouldn't actually be possible to call it until the multiplexer is
      // ready.
      //
      // It's important to check self._stopped after every call in this file that
      // can yield!
      _stop: async function () {
        var self = this;
        if (self._stopped) return;
        self._stopped = true;

        // Note: we *don't* use multiplexer.onFlush here because this stop
        // callback is actually invoked by the multiplexer itself when it has
        // determined that there are no handles left. So nothing is actually going
        // to get flushed (and it's probably not valid to call methods on the
        // dying multiplexer).
        for (const w of self._writesToCommitWhenWeReachSteady) {
          await w.committed();
        }
        self._writesToCommitWhenWeReachSteady = null;

        // Proactively drop references to potentially big things.
        self._published = null;
        self._unpublishedBuffer = null;
        self._needToFetch = null;
        self._currentlyFetching = null;
        self._oplogEntryHandle = null;
        self._listenersHandle = null;
        Package['facts-base'] && Package['facts-base'].Facts.incrementServerFact("mongo-livedata", "observe-drivers-oplog", -1);
        var _iteratorAbruptCompletion = false;
        var _didIteratorError = false;
        var _iteratorError;
        try {
          for (var _iterator = _asyncIterator(self._stopHandles), _step; _iteratorAbruptCompletion = !(_step = await _iterator.next()).done; _iteratorAbruptCompletion = false) {
            const handle = _step.value;
            {
              await handle.stop();
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (_iteratorAbruptCompletion && _iterator.return != null) {
              await _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      },
      stop: async function () {
        const self = this;
        return await self._stop();
      },
      _registerPhaseChange: function (phase) {
        var self = this;
        Meteor._noYieldsAllowed(function () {
          var now = new Date();
          if (self._phase) {
            var timeDiff = now - self._phaseStartTime;
            Package['facts-base'] && Package['facts-base'].Facts.incrementServerFact("mongo-livedata", "time-spent-in-" + self._phase + "-phase", timeDiff);
          }
          self._phase = phase;
          self._phaseStartTime = now;
        });
      }
    });

    // Does our oplog tailing code support this cursor? For now, we are being very
    // conservative and allowing only simple queries with simple options.
    // (This is a "static method".)
    OplogObserveDriver.cursorSupported = function (cursorDescription, matcher) {
      // First, check the options.
      var options = cursorDescription.options;

      // Did the user say no explicitly?
      // underscored version of the option is COMPAT with 1.2
      if (options.disableOplog || options._disableOplog) return false;

      // skip is not supported: to support it we would need to keep track of all
      // "skipped" documents or at least their ids.
      // limit w/o a sort specifier is not supported: current implementation needs a
      // deterministic way to order documents.
      if (options.skip || options.limit && !options.sort) return false;

      // If a fields projection option is given check if it is supported by
      // minimongo (some operators are not supported).
      const fields = options.fields || options.projection;
      if (fields) {
        try {
          LocalCollection._checkSupportedProjection(fields);
        } catch (e) {
          if (e.name === "MinimongoError") {
            return false;
          } else {
            throw e;
          }
        }
      }

      // We don't allow the following selectors:
      //   - $where (not confident that we provide the same JS environment
      //             as Mongo, and can yield!)
      //   - $near (has "interesting" properties in MongoDB, like the possibility
      //            of returning an ID multiple times, though even polling maybe
      //            have a bug there)
      //           XXX: once we support it, we would need to think more on how we
      //           initialize the comparators when we create the driver.
      return !matcher.hasWhere() && !matcher.hasGeoQuery();
    };
    var modifierCanBeDirectlyApplied = function (modifier) {
      return Object.entries(modifier).every(function (_ref) {
        let [operation, fields] = _ref;
        return Object.entries(fields).every(function (_ref2) {
          let [field, value] = _ref2;
          return !/EJSON\$/.test(field);
        });
      });
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

},"oplog_v2_converter.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/oplog_v2_converter.ts                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module1, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module1.export({
      oplogV2V1Converter: () => oplogV2V1Converter
    });
    let EJSON;
    module1.link("meteor/ejson", {
      EJSON(v) {
        EJSON = v;
      }
    }, 0);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    const arrayOperatorKeyRegex = /^(a|[su]\d+)$/;
    /**
     * Checks if a field is an array operator key of form 'a' or 's1' or 'u1' etc
     */
    function isArrayOperatorKey(field) {
      return arrayOperatorKeyRegex.test(field);
    }
    /**
     * Type guard to check if an operator is a valid array operator.
     * Array operators have 'a: true' and keys that match the arrayOperatorKeyRegex
     */
    function isArrayOperator(operator) {
      return operator !== null && typeof operator === 'object' && 'a' in operator && operator.a === true && Object.keys(operator).every(isArrayOperatorKey);
    }
    /**
     * Joins two parts of a field path with a dot.
     * Returns the key itself if prefix is empty.
     */
    function join(prefix, key) {
      return prefix ? "".concat(prefix, ".").concat(key) : key;
    }
    /**
     * Recursively flattens an object into a target object with dot notation paths.
     * Handles special cases:
     * - Arrays are assigned directly
     * - Custom EJSON types are preserved
     * - Mongo.ObjectIDs are preserved
     * - Plain objects are recursively flattened
     * - Empty objects are assigned directly
     */
    function flattenObjectInto(target, source, prefix) {
      if (Array.isArray(source) || typeof source !== 'object' || source === null || source instanceof Mongo.ObjectID || EJSON._isCustomType(source)) {
        target[prefix] = source;
        return;
      }
      const entries = Object.entries(source);
      if (entries.length) {
        entries.forEach(_ref => {
          let [key, value] = _ref;
          flattenObjectInto(target, value, join(prefix, key));
        });
      } else {
        target[prefix] = source;
      }
    }
    /**
     * Converts an oplog diff to a series of $set and $unset operations.
     * Handles several types of operations:
     * - Direct unsets via 'd' field
     * - Nested sets via 'i' field
     * - Top-level sets via 'u' field
     * - Array operations and nested objects via 's' prefixed fields
     *
     * Preserves the structure of EJSON custom types and ObjectIDs while
     * flattening paths into dot notation for MongoDB updates.
     */
    function convertOplogDiff(oplogEntry, diff) {
      let prefix = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
      Object.entries(diff).forEach(_ref2 => {
        let [diffKey, value] = _ref2;
        if (diffKey === 'd') {
          var _oplogEntry$$unset;
          // Handle `$unset`s
          (_oplogEntry$$unset = oplogEntry.$unset) !== null && _oplogEntry$$unset !== void 0 ? _oplogEntry$$unset : oplogEntry.$unset = {};
          Object.keys(value).forEach(key => {
            oplogEntry.$unset[join(prefix, key)] = true;
          });
        } else if (diffKey === 'i') {
          var _oplogEntry$$set;
          // Handle (potentially) nested `$set`s
          (_oplogEntry$$set = oplogEntry.$set) !== null && _oplogEntry$$set !== void 0 ? _oplogEntry$$set : oplogEntry.$set = {};
          flattenObjectInto(oplogEntry.$set, value, prefix);
        } else if (diffKey === 'u') {
          var _oplogEntry$$set2;
          // Handle flat `$set`s
          (_oplogEntry$$set2 = oplogEntry.$set) !== null && _oplogEntry$$set2 !== void 0 ? _oplogEntry$$set2 : oplogEntry.$set = {};
          Object.entries(value).forEach(_ref3 => {
            let [key, fieldValue] = _ref3;
            oplogEntry.$set[join(prefix, key)] = fieldValue;
          });
        } else if (diffKey.startsWith('s')) {
          // Handle s-fields (array operations and nested objects)
          const key = diffKey.slice(1);
          if (isArrayOperator(value)) {
            // Array operator
            Object.entries(value).forEach(_ref4 => {
              let [position, fieldValue] = _ref4;
              if (position === 'a') return;
              const positionKey = join(prefix, "".concat(key, ".").concat(position.slice(1)));
              if (position[0] === 's') {
                convertOplogDiff(oplogEntry, fieldValue, positionKey);
              } else if (fieldValue === null) {
                var _oplogEntry$$unset2;
                (_oplogEntry$$unset2 = oplogEntry.$unset) !== null && _oplogEntry$$unset2 !== void 0 ? _oplogEntry$$unset2 : oplogEntry.$unset = {};
                oplogEntry.$unset[positionKey] = true;
              } else {
                var _oplogEntry$$set3;
                (_oplogEntry$$set3 = oplogEntry.$set) !== null && _oplogEntry$$set3 !== void 0 ? _oplogEntry$$set3 : oplogEntry.$set = {};
                oplogEntry.$set[positionKey] = fieldValue;
              }
            });
          } else if (key) {
            // Nested object
            convertOplogDiff(oplogEntry, value, join(prefix, key));
          }
        }
      });
    }
    /**
     * Converts a MongoDB v2 oplog entry to v1 format.
     * Returns the original entry unchanged if it's not a v2 oplog entry
     * or doesn't contain a diff field.
     *
     * The converted entry will contain $set and $unset operations that are
     * equivalent to the v2 diff format, with paths flattened to dot notation
     * and special handling for EJSON custom types and ObjectIDs.
     */
    function oplogV2V1Converter(oplogEntry) {
      if (oplogEntry.$v !== 2 || !oplogEntry.diff) {
        return oplogEntry;
      }
      const convertedOplogEntry = {
        $v: 2
      };
      convertOplogDiff(convertedOplogEntry, oplogEntry.diff);
      return convertedOplogEntry;
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

},"cursor_description.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/cursor_description.ts                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  CursorDescription: () => CursorDescription
});
class CursorDescription {
  constructor(collectionName, selector, options) {
    this.collectionName = void 0;
    this.selector = void 0;
    this.options = void 0;
    this.collectionName = collectionName;
    // @ts-ignore
    this.selector = Mongo.Collection._rewriteSelector(selector);
    this.options = options || {};
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"mongo_connection.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/mongo_connection.js                                                                                  //
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
    module.export({
      MongoConnection: () => MongoConnection
    });
    let Meteor;
    module.link("meteor/meteor", {
      Meteor(v) {
        Meteor = v;
      }
    }, 0);
    let CLIENT_ONLY_METHODS, getAsyncMethodName;
    module.link("meteor/minimongo/constants", {
      CLIENT_ONLY_METHODS(v) {
        CLIENT_ONLY_METHODS = v;
      },
      getAsyncMethodName(v) {
        getAsyncMethodName = v;
      }
    }, 1);
    let path;
    module.link("path", {
      default(v) {
        path = v;
      }
    }, 2);
    let AsynchronousCursor;
    module.link("./asynchronous_cursor", {
      AsynchronousCursor(v) {
        AsynchronousCursor = v;
      }
    }, 3);
    let Cursor;
    module.link("./cursor", {
      Cursor(v) {
        Cursor = v;
      }
    }, 4);
    let CursorDescription;
    module.link("./cursor_description", {
      CursorDescription(v) {
        CursorDescription = v;
      }
    }, 5);
    let DocFetcher;
    module.link("./doc_fetcher", {
      DocFetcher(v) {
        DocFetcher = v;
      }
    }, 6);
    let MongoDB, replaceMeteorAtomWithMongo, replaceTypes, transformResult;
    module.link("./mongo_common", {
      MongoDB(v) {
        MongoDB = v;
      },
      replaceMeteorAtomWithMongo(v) {
        replaceMeteorAtomWithMongo = v;
      },
      replaceTypes(v) {
        replaceTypes = v;
      },
      transformResult(v) {
        transformResult = v;
      }
    }, 7);
    let ObserveHandle;
    module.link("./observe_handle", {
      ObserveHandle(v) {
        ObserveHandle = v;
      }
    }, 8);
    let ObserveMultiplexer;
    module.link("./observe_multiplex", {
      ObserveMultiplexer(v) {
        ObserveMultiplexer = v;
      }
    }, 9);
    let OplogObserveDriver;
    module.link("./oplog_observe_driver", {
      OplogObserveDriver(v) {
        OplogObserveDriver = v;
      }
    }, 10);
    let OPLOG_COLLECTION, OplogHandle;
    module.link("./oplog_tailing", {
      OPLOG_COLLECTION(v) {
        OPLOG_COLLECTION = v;
      },
      OplogHandle(v) {
        OplogHandle = v;
      }
    }, 11);
    let PollingObserveDriver;
    module.link("./polling_observe_driver", {
      PollingObserveDriver(v) {
        PollingObserveDriver = v;
      }
    }, 12);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    const FILE_ASSET_SUFFIX = 'Asset';
    const ASSETS_FOLDER = 'assets';
    const APP_FOLDER = 'app';
    const oplogCollectionWarnings = [];
    const MongoConnection = function (url, options) {
      var _Meteor$settings, _Meteor$settings$pack, _Meteor$settings$pack2;
      var self = this;
      options = options || {};
      self._observeMultiplexers = {};
      self._onFailoverHook = new Hook();
      const userOptions = _objectSpread(_objectSpread({}, Mongo._connectionOptions || {}), ((_Meteor$settings = Meteor.settings) === null || _Meteor$settings === void 0 ? void 0 : (_Meteor$settings$pack = _Meteor$settings.packages) === null || _Meteor$settings$pack === void 0 ? void 0 : (_Meteor$settings$pack2 = _Meteor$settings$pack.mongo) === null || _Meteor$settings$pack2 === void 0 ? void 0 : _Meteor$settings$pack2.options) || {});
      var mongoOptions = Object.assign({
        ignoreUndefined: true
      }, userOptions);

      // Internally the oplog connections specify their own maxPoolSize
      // which we don't want to overwrite with any user defined value
      if ('maxPoolSize' in options) {
        // If we just set this for "server", replSet will override it. If we just
        // set it for replSet, it will be ignored if we're not using a replSet.
        mongoOptions.maxPoolSize = options.maxPoolSize;
      }
      if ('minPoolSize' in options) {
        mongoOptions.minPoolSize = options.minPoolSize;
      }

      // Transform options like "tlsCAFileAsset": "filename.pem" into
      // "tlsCAFile": "/<fullpath>/filename.pem"
      Object.entries(mongoOptions || {}).filter(_ref => {
        let [key] = _ref;
        return key && key.endsWith(FILE_ASSET_SUFFIX);
      }).forEach(_ref2 => {
        let [key, value] = _ref2;
        const optionName = key.replace(FILE_ASSET_SUFFIX, '');
        mongoOptions[optionName] = path.join(Assets.getServerDir(), ASSETS_FOLDER, APP_FOLDER, value);
        delete mongoOptions[key];
      });
      self.db = null;
      self._oplogHandle = null;
      self._docFetcher = null;
      mongoOptions.driverInfo = {
        name: 'Meteor',
        version: Meteor.release
      };
      self.client = new MongoDB.MongoClient(url, mongoOptions);
      self.db = self.client.db();
      self.client.on('serverDescriptionChanged', Meteor.bindEnvironment(event => {
        // When the connection is no longer against the primary node, execute all
        // failover hooks. This is important for the driver as it has to re-pool the
        // query when it happens.
        if (event.previousDescription.type !== 'RSPrimary' && event.newDescription.type === 'RSPrimary') {
          self._onFailoverHook.each(callback => {
            callback();
            return true;
          });
        }
      }));
      if (options.oplogUrl && !Package['disable-oplog']) {
        self._oplogHandle = new OplogHandle(options.oplogUrl, self.db.databaseName);
        self._docFetcher = new DocFetcher(self);
      }
    };
    MongoConnection.prototype._close = async function () {
      var self = this;
      if (!self.db) throw Error("close called before Connection created?");

      // XXX probably untested
      var oplogHandle = self._oplogHandle;
      self._oplogHandle = null;
      if (oplogHandle) await oplogHandle.stop();

      // Use Future.wrap so that errors get thrown. This happens to
      // work even outside a fiber since the 'close' method is not
      // actually asynchronous.
      await self.client.close();
    };
    MongoConnection.prototype.close = function () {
      return this._close();
    };
    MongoConnection.prototype._setOplogHandle = function (oplogHandle) {
      this._oplogHandle = oplogHandle;
      return this;
    };

    // Returns the Mongo Collection object; may yield.
    MongoConnection.prototype.rawCollection = function (collectionName) {
      var self = this;
      if (!self.db) throw Error("rawCollection called before Connection created?");
      return self.db.collection(collectionName);
    };
    MongoConnection.prototype.createCappedCollectionAsync = async function (collectionName, byteSize, maxDocuments) {
      var self = this;
      if (!self.db) throw Error("createCappedCollectionAsync called before Connection created?");
      await self.db.createCollection(collectionName, {
        capped: true,
        size: byteSize,
        max: maxDocuments
      });
    };

    // This should be called synchronously with a write, to create a
    // transaction on the current write fence, if any. After we can read
    // the write, and after observers have been notified (or at least,
    // after the observer notifiers have added themselves to the write
    // fence), you should call 'committed()' on the object returned.
    MongoConnection.prototype._maybeBeginWrite = function () {
      const fence = DDPServer._getCurrentFence();
      if (fence) {
        return fence.beginWrite();
      } else {
        return {
          committed: function () {}
        };
      }
    };

    // Internal interface: adds a callback which is called when the Mongo primary
    // changes. Returns a stop handle.
    MongoConnection.prototype._onFailover = function (callback) {
      return this._onFailoverHook.register(callback);
    };
    MongoConnection.prototype.insertAsync = async function (collection_name, document) {
      const self = this;
      if (collection_name === "___meteor_failure_test_collection") {
        const e = new Error("Failure test");
        e._expectedByTest = true;
        throw e;
      }
      if (!(LocalCollection._isPlainObject(document) && !EJSON._isCustomType(document))) {
        throw new Error("Only plain objects may be inserted into MongoDB");
      }
      var write = self._maybeBeginWrite();
      var refresh = async function () {
        await Meteor.refresh({
          collection: collection_name,
          id: document._id
        });
      };
      return self.rawCollection(collection_name).insertOne(replaceTypes(document, replaceMeteorAtomWithMongo), {
        safe: true
      }).then(async _ref3 => {
        let {
          insertedId
        } = _ref3;
        await refresh();
        await write.committed();
        return insertedId;
      }).catch(async e => {
        await write.committed();
        throw e;
      });
    };

    // Cause queries that may be affected by the selector to poll in this write
    // fence.
    MongoConnection.prototype._refresh = async function (collectionName, selector) {
      var refreshKey = {
        collection: collectionName
      };
      // If we know which documents we're removing, don't poll queries that are
      // specific to other documents. (Note that multiple notifications here should
      // not cause multiple polls, since all our listener is doing is enqueueing a
      // poll.)
      var specificIds = LocalCollection._idsMatchedBySelector(selector);
      if (specificIds) {
        for (const id of specificIds) {
          await Meteor.refresh(Object.assign({
            id: id
          }, refreshKey));
        }
        ;
      } else {
        await Meteor.refresh(refreshKey);
      }
    };
    MongoConnection.prototype.removeAsync = async function (collection_name, selector) {
      var self = this;
      if (collection_name === "___meteor_failure_test_collection") {
        var e = new Error("Failure test");
        e._expectedByTest = true;
        throw e;
      }
      var write = self._maybeBeginWrite();
      var refresh = async function () {
        await self._refresh(collection_name, selector);
      };
      return self.rawCollection(collection_name).deleteMany(replaceTypes(selector, replaceMeteorAtomWithMongo), {
        safe: true
      }).then(async _ref4 => {
        let {
          deletedCount
        } = _ref4;
        await refresh();
        await write.committed();
        return transformResult({
          result: {
            modifiedCount: deletedCount
          }
        }).numberAffected;
      }).catch(async err => {
        await write.committed();
        throw err;
      });
    };
    MongoConnection.prototype.dropCollectionAsync = async function (collectionName) {
      var self = this;
      var write = self._maybeBeginWrite();
      var refresh = function () {
        return Meteor.refresh({
          collection: collectionName,
          id: null,
          dropCollection: true
        });
      };
      return self.rawCollection(collectionName).drop().then(async result => {
        await refresh();
        await write.committed();
        return result;
      }).catch(async e => {
        await write.committed();
        throw e;
      });
    };

    // For testing only.  Slightly better than `c.rawDatabase().dropDatabase()`
    // because it lets the test's fence wait for it to be complete.
    MongoConnection.prototype.dropDatabaseAsync = async function () {
      var self = this;
      var write = self._maybeBeginWrite();
      var refresh = async function () {
        await Meteor.refresh({
          dropDatabase: true
        });
      };
      try {
        await self.db._dropDatabase();
        await refresh();
        await write.committed();
      } catch (e) {
        await write.committed();
        throw e;
      }
    };
    MongoConnection.prototype.updateAsync = async function (collection_name, selector, mod, options) {
      var self = this;
      if (collection_name === "___meteor_failure_test_collection") {
        var e = new Error("Failure test");
        e._expectedByTest = true;
        throw e;
      }

      // explicit safety check. null and undefined can crash the mongo
      // driver. Although the node driver and minimongo do 'support'
      // non-object modifier in that they don't crash, they are not
      // meaningful operations and do not do anything. Defensively throw an
      // error here.
      if (!mod || typeof mod !== 'object') {
        const error = new Error("Invalid modifier. Modifier must be an object.");
        throw error;
      }
      if (!(LocalCollection._isPlainObject(mod) && !EJSON._isCustomType(mod))) {
        const error = new Error("Only plain objects may be used as replacement" + " documents in MongoDB");
        throw error;
      }
      if (!options) options = {};
      var write = self._maybeBeginWrite();
      var refresh = async function () {
        await self._refresh(collection_name, selector);
      };
      var collection = self.rawCollection(collection_name);
      var mongoOpts = {
        safe: true
      };
      // Add support for filtered positional operator
      if (options.arrayFilters !== undefined) mongoOpts.arrayFilters = options.arrayFilters;
      // explictly enumerate options that minimongo supports
      if (options.upsert) mongoOpts.upsert = true;
      if (options.multi) mongoOpts.multi = true;
      // Lets you get a more more full result from MongoDB. Use with caution:
      // might not work with C.upsert (as opposed to C.update({upsert:true}) or
      // with simulated upsert.
      if (options.fullResult) mongoOpts.fullResult = true;
      var mongoSelector = replaceTypes(selector, replaceMeteorAtomWithMongo);
      var mongoMod = replaceTypes(mod, replaceMeteorAtomWithMongo);
      var isModify = LocalCollection._isModificationMod(mongoMod);
      if (options._forbidReplace && !isModify) {
        var err = new Error("Invalid modifier. Replacements are forbidden.");
        throw err;
      }

      // We've already run replaceTypes/replaceMeteorAtomWithMongo on
      // selector and mod.  We assume it doesn't matter, as far as
      // the behavior of modifiers is concerned, whether `_modify`
      // is run on EJSON or on mongo-converted EJSON.

      // Run this code up front so that it fails fast if someone uses
      // a Mongo update operator we don't support.
      let knownId;
      if (options.upsert) {
        try {
          let newDoc = LocalCollection._createUpsertDocument(selector, mod);
          knownId = newDoc._id;
        } catch (err) {
          throw err;
        }
      }
      if (options.upsert && !isModify && !knownId && options.insertedId && !(options.insertedId instanceof Mongo.ObjectID && options.generatedId)) {
        // In case of an upsert with a replacement, where there is no _id defined
        // in either the query or the replacement doc, mongo will generate an id itself.
        // Therefore we need this special strategy if we want to control the id ourselves.

        // We don't need to do this when:
        // - This is not a replacement, so we can add an _id to $setOnInsert
        // - The id is defined by query or mod we can just add it to the replacement doc
        // - The user did not specify any id preference and the id is a Mongo ObjectId,
        //     then we can just let Mongo generate the id
        return await simulateUpsertWithInsertedId(collection, mongoSelector, mongoMod, options).then(async result => {
          await refresh();
          await write.committed();
          if (result && !options._returnObject) {
            return result.numberAffected;
          } else {
            return result;
          }
        });
      } else {
        if (options.upsert && !knownId && options.insertedId && isModify) {
          if (!mongoMod.hasOwnProperty('$setOnInsert')) {
            mongoMod.$setOnInsert = {};
          }
          knownId = options.insertedId;
          Object.assign(mongoMod.$setOnInsert, replaceTypes({
            _id: options.insertedId
          }, replaceMeteorAtomWithMongo));
        }
        const strings = Object.keys(mongoMod).filter(key => !key.startsWith("$"));
        let updateMethod = strings.length > 0 ? 'replaceOne' : 'updateMany';
        updateMethod = updateMethod === 'updateMany' && !mongoOpts.multi ? 'updateOne' : updateMethod;
        return collection[updateMethod].bind(collection)(mongoSelector, mongoMod, mongoOpts).then(async result => {
          var meteorResult = transformResult({
            result
          });
          if (meteorResult && options._returnObject) {
            // If this was an upsertAsync() call, and we ended up
            // inserting a new doc and we know its id, then
            // return that id as well.
            if (options.upsert && meteorResult.insertedId) {
              if (knownId) {
                meteorResult.insertedId = knownId;
              } else if (meteorResult.insertedId instanceof MongoDB.ObjectId) {
                meteorResult.insertedId = new Mongo.ObjectID(meteorResult.insertedId.toHexString());
              }
            }
            await refresh();
            await write.committed();
            return meteorResult;
          } else {
            await refresh();
            await write.committed();
            return meteorResult.numberAffected;
          }
        }).catch(async err => {
          await write.committed();
          throw err;
        });
      }
    };

    // exposed for testing
    MongoConnection._isCannotChangeIdError = function (err) {
      // Mongo 3.2.* returns error as next Object:
      // {name: String, code: Number, errmsg: String}
      // Older Mongo returns:
      // {name: String, code: Number, err: String}
      var error = err.errmsg || err.err;

      // We don't use the error code here
      // because the error code we observed it producing (16837) appears to be
      // a far more generic error code based on examining the source.
      if (error.indexOf('The _id field cannot be changed') === 0 || error.indexOf("the (immutable) field '_id' was found to have been altered to _id") !== -1) {
        return true;
      }
      return false;
    };

    // XXX MongoConnection.upsertAsync() does not return the id of the inserted document
    // unless you set it explicitly in the selector or modifier (as a replacement
    // doc).
    MongoConnection.prototype.upsertAsync = async function (collectionName, selector, mod, options) {
      var self = this;
      if (typeof options === "function" && !callback) {
        callback = options;
        options = {};
      }
      return self.updateAsync(collectionName, selector, mod, Object.assign({}, options, {
        upsert: true,
        _returnObject: true
      }));
    };
    MongoConnection.prototype.find = function (collectionName, selector, options) {
      var self = this;
      if (arguments.length === 1) selector = {};
      return new Cursor(self, new CursorDescription(collectionName, selector, options));
    };
    MongoConnection.prototype.findOneAsync = async function (collection_name, selector, options) {
      var self = this;
      if (arguments.length === 1) {
        selector = {};
      }
      options = options || {};
      options.limit = 1;
      const results = await self.find(collection_name, selector, options).fetch();
      return results[0];
    };

    // We'll actually design an index API later. For now, we just pass through to
    // Mongo's, but make it synchronous.
    MongoConnection.prototype.createIndexAsync = async function (collectionName, index, options) {
      var self = this;

      // We expect this function to be called at startup, not from within a method,
      // so we don't interact with the write fence.
      var collection = self.rawCollection(collectionName);
      await collection.createIndex(index, options);
    };

    // just to be consistent with the other methods
    MongoConnection.prototype.createIndex = MongoConnection.prototype.createIndexAsync;
    MongoConnection.prototype.countDocuments = function (collectionName) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      args = args.map(arg => replaceTypes(arg, replaceMeteorAtomWithMongo));
      const collection = this.rawCollection(collectionName);
      return collection.countDocuments(...args);
    };
    MongoConnection.prototype.estimatedDocumentCount = function (collectionName) {
      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }
      args = args.map(arg => replaceTypes(arg, replaceMeteorAtomWithMongo));
      const collection = this.rawCollection(collectionName);
      return collection.estimatedDocumentCount(...args);
    };
    MongoConnection.prototype.ensureIndexAsync = MongoConnection.prototype.createIndexAsync;
    MongoConnection.prototype.dropIndexAsync = async function (collectionName, index) {
      var self = this;

      // This function is only used by test code, not within a method, so we don't
      // interact with the write fence.
      var collection = self.rawCollection(collectionName);
      var indexName = await collection.dropIndex(index);
    };
    CLIENT_ONLY_METHODS.forEach(function (m) {
      MongoConnection.prototype[m] = function () {
        throw new Error("".concat(m, " +  is not available on the server. Please use ").concat(getAsyncMethodName(m), "() instead."));
      };
    });
    var NUM_OPTIMISTIC_TRIES = 3;
    var simulateUpsertWithInsertedId = async function (collection, selector, mod, options) {
      // STRATEGY: First try doing an upsert with a generated ID.
      // If this throws an error about changing the ID on an existing document
      // then without affecting the database, we know we should probably try
      // an update without the generated ID. If it affected 0 documents,
      // then without affecting the database, we the document that first
      // gave the error is probably removed and we need to try an insert again
      // We go back to step one and repeat.
      // Like all "optimistic write" schemes, we rely on the fact that it's
      // unlikely our writes will continue to be interfered with under normal
      // circumstances (though sufficiently heavy contention with writers
      // disagreeing on the existence of an object will cause writes to fail
      // in theory).

      var insertedId = options.insertedId; // must exist
      var mongoOptsForUpdate = {
        safe: true,
        multi: options.multi
      };
      var mongoOptsForInsert = {
        safe: true,
        upsert: true
      };
      var replacementWithId = Object.assign(replaceTypes({
        _id: insertedId
      }, replaceMeteorAtomWithMongo), mod);
      var tries = NUM_OPTIMISTIC_TRIES;
      var doUpdate = async function () {
        tries--;
        if (!tries) {
          throw new Error("Upsert failed after " + NUM_OPTIMISTIC_TRIES + " tries.");
        } else {
          let method = collection.updateMany;
          if (!Object.keys(mod).some(key => key.startsWith("$"))) {
            method = collection.replaceOne.bind(collection);
          }
          return method(selector, mod, mongoOptsForUpdate).then(result => {
            if (result && (result.modifiedCount || result.upsertedCount)) {
              return {
                numberAffected: result.modifiedCount || result.upsertedCount,
                insertedId: result.upsertedId || undefined
              };
            } else {
              return doConditionalInsert();
            }
          });
        }
      };
      var doConditionalInsert = function () {
        return collection.replaceOne(selector, replacementWithId, mongoOptsForInsert).then(result => ({
          numberAffected: result.upsertedCount,
          insertedId: result.upsertedId
        })).catch(err => {
          if (MongoConnection._isCannotChangeIdError(err)) {
            return doUpdate();
          } else {
            throw err;
          }
        });
      };
      return doUpdate();
    };

    // observeChanges for tailable cursors on capped collections.
    //
    // Some differences from normal cursors:
    //   - Will never produce anything other than 'added' or 'addedBefore'. If you
    //     do update a document that has already been produced, this will not notice
    //     it.
    //   - If you disconnect and reconnect from Mongo, it will essentially restart
    //     the query, which will lead to duplicate results. This is pretty bad,
    //     but if you include a field called 'ts' which is inserted as
    //     new MongoInternals.MongoTimestamp(0, 0) (which is initialized to the
    //     current Mongo-style timestamp), we'll be able to find the place to
    //     restart properly. (This field is specifically understood by Mongo with an
    //     optimization which allows it to find the right place to start without
    //     an index on ts. It's how the oplog works.)
    //   - No callbacks are triggered synchronously with the call (there's no
    //     differentiation between "initial data" and "later changes"; everything
    //     that matches the query gets sent asynchronously).
    //   - De-duplication is not implemented.
    //   - Does not yet interact with the write fence. Probably, this should work by
    //     ignoring removes (which don't work on capped collections) and updates
    //     (which don't affect tailable cursors), and just keeping track of the ID
    //     of the inserted object, and closing the write fence once you get to that
    //     ID (or timestamp?).  This doesn't work well if the document doesn't match
    //     the query, though.  On the other hand, the write fence can close
    //     immediately if it does not match the query. So if we trust minimongo
    //     enough to accurately evaluate the query against the write fence, we
    //     should be able to do this...  Of course, minimongo doesn't even support
    //     Mongo Timestamps yet.
    MongoConnection.prototype._observeChangesTailable = function (cursorDescription, ordered, callbacks) {
      var self = this;

      // Tailable cursors only ever call added/addedBefore callbacks, so it's an
      // error if you didn't provide them.
      if (ordered && !callbacks.addedBefore || !ordered && !callbacks.added) {
        throw new Error("Can't observe an " + (ordered ? "ordered" : "unordered") + " tailable cursor without a " + (ordered ? "addedBefore" : "added") + " callback");
      }
      return self.tail(cursorDescription, function (doc) {
        var id = doc._id;
        delete doc._id;
        // The ts is an implementation detail. Hide it.
        delete doc.ts;
        if (ordered) {
          callbacks.addedBefore(id, doc, null);
        } else {
          callbacks.added(id, doc);
        }
      });
    };
    MongoConnection.prototype._createAsynchronousCursor = function (cursorDescription) {
      let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var self = this;
      const {
        selfForIteration,
        useTransform
      } = options;
      options = {
        selfForIteration,
        useTransform
      };
      var collection = self.rawCollection(cursorDescription.collectionName);
      var cursorOptions = cursorDescription.options;
      var mongoOptions = {
        sort: cursorOptions.sort,
        limit: cursorOptions.limit,
        skip: cursorOptions.skip,
        projection: cursorOptions.fields || cursorOptions.projection,
        readPreference: cursorOptions.readPreference
      };

      // Do we want a tailable cursor (which only works on capped collections)?
      if (cursorOptions.tailable) {
        mongoOptions.numberOfRetries = -1;
      }
      var dbCursor = collection.find(replaceTypes(cursorDescription.selector, replaceMeteorAtomWithMongo), mongoOptions);

      // Do we want a tailable cursor (which only works on capped collections)?
      if (cursorOptions.tailable) {
        // We want a tailable cursor...
        dbCursor.addCursorFlag("tailable", true);
        // ... and for the server to wait a bit if any getMore has no data (rather
        // than making us put the relevant sleeps in the client)...
        dbCursor.addCursorFlag("awaitData", true);

        // And if this is on the oplog collection and the cursor specifies a 'ts',
        // then set the undocumented oplog replay flag, which does a special scan to
        // find the first document (instead of creating an index on ts). This is a
        // very hard-coded Mongo flag which only works on the oplog collection and
        // only works with the ts field.
        if (cursorDescription.collectionName === OPLOG_COLLECTION && cursorDescription.selector.ts) {
          dbCursor.addCursorFlag("oplogReplay", true);
        }
      }
      if (typeof cursorOptions.maxTimeMs !== 'undefined') {
        dbCursor = dbCursor.maxTimeMS(cursorOptions.maxTimeMs);
      }
      if (typeof cursorOptions.hint !== 'undefined') {
        dbCursor = dbCursor.hint(cursorOptions.hint);
      }
      return new AsynchronousCursor(dbCursor, cursorDescription, options, collection);
    };

    // Tails the cursor described by cursorDescription, most likely on the
    // oplog. Calls docCallback with each document found. Ignores errors and just
    // restarts the tail on error.
    //
    // If timeoutMS is set, then if we don't get a new document every timeoutMS,
    // kill and restart the cursor. This is primarily a workaround for #8598.
    MongoConnection.prototype.tail = function (cursorDescription, docCallback, timeoutMS) {
      var self = this;
      if (!cursorDescription.options.tailable) throw new Error("Can only tail a tailable cursor");
      var cursor = self._createAsynchronousCursor(cursorDescription);
      var stopped = false;
      var lastTS;
      Meteor.defer(async function loop() {
        var doc = null;
        while (true) {
          if (stopped) return;
          try {
            doc = await cursor._nextObjectPromiseWithTimeout(timeoutMS);
          } catch (err) {
            // We should not ignore errors here unless we want to spend a lot of time debugging
            console.error(err);
            // There's no good way to figure out if this was actually an error from
            // Mongo, or just client-side (including our own timeout error). Ah
            // well. But either way, we need to retry the cursor (unless the failure
            // was because the observe got stopped).
            doc = null;
          }
          // Since we awaited a promise above, we need to check again to see if
          // we've been stopped before calling the callback.
          if (stopped) return;
          if (doc) {
            // If a tailable cursor contains a "ts" field, use it to recreate the
            // cursor on error. ("ts" is a standard that Mongo uses internally for
            // the oplog, and there's a special flag that lets you do binary search
            // on it instead of needing to use an index.)
            lastTS = doc.ts;
            docCallback(doc);
          } else {
            var newSelector = Object.assign({}, cursorDescription.selector);
            if (lastTS) {
              newSelector.ts = {
                $gt: lastTS
              };
            }
            cursor = self._createAsynchronousCursor(new CursorDescription(cursorDescription.collectionName, newSelector, cursorDescription.options));
            // Mongo failover takes many seconds.  Retry in a bit.  (Without this
            // setTimeout, we peg the CPU at 100% and never notice the actual
            // failover.
            setTimeout(loop, 100);
            break;
          }
        }
      });
      return {
        stop: function () {
          stopped = true;
          cursor.close();
        }
      };
    };
    Object.assign(MongoConnection.prototype, {
      _observeChanges: async function (cursorDescription, ordered, callbacks, nonMutatingCallbacks) {
        var _self$_oplogHandle;
        var self = this;
        const collectionName = cursorDescription.collectionName;
        if (cursorDescription.options.tailable) {
          return self._observeChangesTailable(cursorDescription, ordered, callbacks);
        }

        // You may not filter out _id when observing changes, because the id is a core
        // part of the observeChanges API.
        const fieldsOptions = cursorDescription.options.projection || cursorDescription.options.fields;
        if (fieldsOptions && (fieldsOptions._id === 0 || fieldsOptions._id === false)) {
          throw Error("You may not observe a cursor with {fields: {_id: 0}}");
        }
        var observeKey = EJSON.stringify(Object.assign({
          ordered: ordered
        }, cursorDescription));
        var multiplexer, observeDriver;
        var firstHandle = false;

        // Find a matching ObserveMultiplexer, or create a new one. This next block is
        // guaranteed to not yield (and it doesn't call anything that can observe a
        // new query), so no other calls to this function can interleave with it.
        if (observeKey in self._observeMultiplexers) {
          multiplexer = self._observeMultiplexers[observeKey];
        } else {
          firstHandle = true;
          // Create a new ObserveMultiplexer.
          multiplexer = new ObserveMultiplexer({
            ordered: ordered,
            onStop: function () {
              delete self._observeMultiplexers[observeKey];
              return observeDriver.stop();
            }
          });
        }
        var observeHandle = new ObserveHandle(multiplexer, callbacks, nonMutatingCallbacks);
        const oplogOptions = (self === null || self === void 0 ? void 0 : (_self$_oplogHandle = self._oplogHandle) === null || _self$_oplogHandle === void 0 ? void 0 : _self$_oplogHandle._oplogOptions) || {};
        const {
          includeCollections,
          excludeCollections
        } = oplogOptions;
        if (firstHandle) {
          var matcher, sorter;
          var canUseOplog = [function () {
            // At a bare minimum, using the oplog requires us to have an oplog, to
            // want unordered callbacks, and to not want a callback on the polls
            // that won't happen.
            return self._oplogHandle && !ordered && !callbacks._testOnlyPollCallback;
          }, function () {
            // We also need to check, if the collection of this Cursor is actually being "watched" by the Oplog handle
            // if not, we have to fallback to long polling
            if (excludeCollections !== null && excludeCollections !== void 0 && excludeCollections.length && excludeCollections.includes(collectionName)) {
              if (!oplogCollectionWarnings.includes(collectionName)) {
                console.warn("Meteor.settings.packages.mongo.oplogExcludeCollections includes the collection ".concat(collectionName, " - your subscriptions will only use long polling!"));
                oplogCollectionWarnings.push(collectionName); // we only want to show the warnings once per collection!
              }
              return false;
            }
            if (includeCollections !== null && includeCollections !== void 0 && includeCollections.length && !includeCollections.includes(collectionName)) {
              if (!oplogCollectionWarnings.includes(collectionName)) {
                console.warn("Meteor.settings.packages.mongo.oplogIncludeCollections does not include the collection ".concat(collectionName, " - your subscriptions will only use long polling!"));
                oplogCollectionWarnings.push(collectionName); // we only want to show the warnings once per collection!
              }
              return false;
            }
            return true;
          }, function () {
            // We need to be able to compile the selector. Fall back to polling for
            // some newfangled $selector that minimongo doesn't support yet.
            try {
              matcher = new Minimongo.Matcher(cursorDescription.selector);
              return true;
            } catch (e) {
              // XXX make all compilation errors MinimongoError or something
              //     so that this doesn't ignore unrelated exceptions
              return false;
            }
          }, function () {
            // ... and the selector itself needs to support oplog.
            return OplogObserveDriver.cursorSupported(cursorDescription, matcher);
          }, function () {
            // And we need to be able to compile the sort, if any.  eg, can't be
            // {$natural: 1}.
            if (!cursorDescription.options.sort) return true;
            try {
              sorter = new Minimongo.Sorter(cursorDescription.options.sort);
              return true;
            } catch (e) {
              // XXX make all compilation errors MinimongoError or something
              //     so that this doesn't ignore unrelated exceptions
              return false;
            }
          }].every(f => f()); // invoke each function and check if all return true

          var driverClass = canUseOplog ? OplogObserveDriver : PollingObserveDriver;
          observeDriver = new driverClass({
            cursorDescription: cursorDescription,
            mongoHandle: self,
            multiplexer: multiplexer,
            ordered: ordered,
            matcher: matcher,
            // ignored by polling
            sorter: sorter,
            // ignored by polling
            _testOnlyPollCallback: callbacks._testOnlyPollCallback
          });
          if (observeDriver._init) {
            await observeDriver._init();
          }

          // This field is only set for use in tests.
          multiplexer._observeDriver = observeDriver;
        }
        self._observeMultiplexers[observeKey] = multiplexer;
        // Blocks until the initial adds have been sent.
        await multiplexer.addHandleAndSendInitialAdds(observeHandle);
        return observeHandle;
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

},"mongo_common.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/mongo_common.js                                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      MongoDB: () => MongoDB,
      writeCallback: () => writeCallback,
      transformResult: () => transformResult,
      replaceMeteorAtomWithMongo: () => replaceMeteorAtomWithMongo,
      replaceTypes: () => replaceTypes,
      replaceMongoAtomWithMeteor: () => replaceMongoAtomWithMeteor,
      replaceNames: () => replaceNames
    });
    let clone;
    module.link("lodash.clone", {
      default(v) {
        clone = v;
      }
    }, 0);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    const MongoDB = Object.assign(NpmModuleMongodb, {
      ObjectID: NpmModuleMongodb.ObjectId
    });
    const writeCallback = function (write, refresh, callback) {
      return function (err, result) {
        if (!err) {
          // XXX We don't have to run this on error, right?
          try {
            refresh();
          } catch (refreshErr) {
            if (callback) {
              callback(refreshErr);
              return;
            } else {
              throw refreshErr;
            }
          }
        }
        write.committed();
        if (callback) {
          callback(err, result);
        } else if (err) {
          throw err;
        }
      };
    };
    const transformResult = function (driverResult) {
      var meteorResult = {
        numberAffected: 0
      };
      if (driverResult) {
        var mongoResult = driverResult.result;
        // On updates with upsert:true, the inserted values come as a list of
        // upserted values -- even with options.multi, when the upsert does insert,
        // it only inserts one element.
        if (mongoResult.upsertedCount) {
          meteorResult.numberAffected = mongoResult.upsertedCount;
          if (mongoResult.upsertedId) {
            meteorResult.insertedId = mongoResult.upsertedId;
          }
        } else {
          // n was used before Mongo 5.0, in Mongo 5.0 we are not receiving this n
          // field and so we are using modifiedCount instead
          meteorResult.numberAffected = mongoResult.n || mongoResult.matchedCount || mongoResult.modifiedCount;
        }
      }
      return meteorResult;
    };
    const replaceMeteorAtomWithMongo = function (document) {
      if (EJSON.isBinary(document)) {
        // This does more copies than we'd like, but is necessary because
        // MongoDB.BSON only looks like it takes a Uint8Array (and doesn't actually
        // serialize it correctly).
        return new MongoDB.Binary(Buffer.from(document));
      }
      if (document instanceof MongoDB.Binary) {
        return document;
      }
      if (document instanceof Mongo.ObjectID) {
        return new MongoDB.ObjectId(document.toHexString());
      }
      if (document instanceof MongoDB.ObjectId) {
        return new MongoDB.ObjectId(document.toHexString());
      }
      if (document instanceof MongoDB.Timestamp) {
        // For now, the Meteor representation of a Mongo timestamp type (not a date!
        // this is a weird internal thing used in the oplog!) is the same as the
        // Mongo representation. We need to do this explicitly or else we would do a
        // structural clone and lose the prototype.
        return document;
      }
      if (document instanceof Decimal) {
        return MongoDB.Decimal128.fromString(document.toString());
      }
      if (EJSON._isCustomType(document)) {
        return replaceNames(makeMongoLegal, EJSON.toJSONValue(document));
      }
      // It is not ordinarily possible to stick dollar-sign keys into mongo
      // so we don't bother checking for things that need escaping at this time.
      return undefined;
    };
    const replaceTypes = function (document, atomTransformer) {
      if (typeof document !== 'object' || document === null) return document;
      var replacedTopLevelAtom = atomTransformer(document);
      if (replacedTopLevelAtom !== undefined) return replacedTopLevelAtom;
      var ret = document;
      Object.entries(document).forEach(function (_ref) {
        let [key, val] = _ref;
        var valReplaced = replaceTypes(val, atomTransformer);
        if (val !== valReplaced) {
          // Lazy clone. Shallow copy.
          if (ret === document) ret = clone(document);
          ret[key] = valReplaced;
        }
      });
      return ret;
    };
    const replaceMongoAtomWithMeteor = function (document) {
      if (document instanceof MongoDB.Binary) {
        // for backwards compatibility
        if (document.sub_type !== 0) {
          return document;
        }
        var buffer = document.value(true);
        return new Uint8Array(buffer);
      }
      if (document instanceof MongoDB.ObjectId) {
        return new Mongo.ObjectID(document.toHexString());
      }
      if (document instanceof MongoDB.Decimal128) {
        return Decimal(document.toString());
      }
      if (document["EJSON$type"] && document["EJSON$value"] && Object.keys(document).length === 2) {
        return EJSON.fromJSONValue(replaceNames(unmakeMongoLegal, document));
      }
      if (document instanceof MongoDB.Timestamp) {
        // For now, the Meteor representation of a Mongo timestamp type (not a date!
        // this is a weird internal thing used in the oplog!) is the same as the
        // Mongo representation. We need to do this explicitly or else we would do a
        // structural clone and lose the prototype.
        return document;
      }
      return undefined;
    };
    const makeMongoLegal = name => "EJSON" + name;
    const unmakeMongoLegal = name => name.substr(5);
    function replaceNames(filter, thing) {
      if (typeof thing === "object" && thing !== null) {
        if (Array.isArray(thing)) {
          return thing.map(replaceNames.bind(null, filter));
        }
        var ret = {};
        Object.entries(thing).forEach(function (_ref2) {
          let [key, value] = _ref2;
          ret[filter(key)] = replaceNames(filter, value);
        });
        return ret;
      }
      return thing;
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

},"asynchronous_cursor.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/asynchronous_cursor.js                                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      AsynchronousCursor: () => AsynchronousCursor
    });
    let LocalCollection;
    module.link("meteor/minimongo/local_collection", {
      default(v) {
        LocalCollection = v;
      }
    }, 0);
    let replaceMongoAtomWithMeteor, replaceTypes;
    module.link("./mongo_common", {
      replaceMongoAtomWithMeteor(v) {
        replaceMongoAtomWithMeteor = v;
      },
      replaceTypes(v) {
        replaceTypes = v;
      }
    }, 1);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    class AsynchronousCursor {
      constructor(dbCursor, cursorDescription, options) {
        this._dbCursor = dbCursor;
        this._cursorDescription = cursorDescription;
        this._selfForIteration = options.selfForIteration || this;
        if (options.useTransform && cursorDescription.options.transform) {
          this._transform = LocalCollection.wrapTransform(cursorDescription.options.transform);
        } else {
          this._transform = null;
        }
        this._visitedIds = new LocalCollection._IdMap();
      }
      [Symbol.asyncIterator]() {
        var cursor = this;
        return {
          async next() {
            const value = await cursor._nextObjectPromise();
            return {
              done: !value,
              value
            };
          }
        };
      }

      // Returns a Promise for the next object from the underlying cursor (before
      // the Mongo->Meteor type replacement).
      async _rawNextObjectPromise() {
        try {
          return this._dbCursor.next();
        } catch (e) {
          console.error(e);
        }
      }

      // Returns a Promise for the next object from the cursor, skipping those whose
      // IDs we've already seen and replacing Mongo atoms with Meteor atoms.
      async _nextObjectPromise() {
        while (true) {
          var doc = await this._rawNextObjectPromise();
          if (!doc) return null;
          doc = replaceTypes(doc, replaceMongoAtomWithMeteor);
          if (!this._cursorDescription.options.tailable && '_id' in doc) {
            // Did Mongo give us duplicate documents in the same cursor? If so,
            // ignore this one. (Do this before the transform, since transform might
            // return some unrelated value.) We don't do this for tailable cursors,
            // because we want to maintain O(1) memory usage. And if there isn't _id
            // for some reason (maybe it's the oplog), then we don't do this either.
            // (Be careful to do this for falsey but existing _id, though.)
            if (this._visitedIds.has(doc._id)) continue;
            this._visitedIds.set(doc._id, true);
          }
          if (this._transform) doc = this._transform(doc);
          return doc;
        }
      }

      // Returns a promise which is resolved with the next object (like with
      // _nextObjectPromise) or rejected if the cursor doesn't return within
      // timeoutMS ms.
      _nextObjectPromiseWithTimeout(timeoutMS) {
        if (!timeoutMS) {
          return this._nextObjectPromise();
        }
        const nextObjectPromise = this._nextObjectPromise();
        const timeoutErr = new Error('Client-side timeout waiting for next object');
        const timeoutPromise = new Promise((resolve, reject) => {
          setTimeout(() => {
            reject(timeoutErr);
          }, timeoutMS);
        });
        return Promise.race([nextObjectPromise, timeoutPromise]).catch(err => {
          if (err === timeoutErr) {
            this.close();
            return;
          }
          throw err;
        });
      }
      async forEach(callback, thisArg) {
        // Get back to the beginning.
        this._rewind();
        let idx = 0;
        while (true) {
          const doc = await this._nextObjectPromise();
          if (!doc) return;
          await callback.call(thisArg, doc, idx++, this._selfForIteration);
        }
      }
      async map(callback, thisArg) {
        const results = [];
        await this.forEach(async (doc, index) => {
          results.push(await callback.call(thisArg, doc, index, this._selfForIteration));
        });
        return results;
      }
      _rewind() {
        // known to be synchronous
        this._dbCursor.rewind();
        this._visitedIds = new LocalCollection._IdMap();
      }

      // Mostly usable for tailable cursors.
      close() {
        this._dbCursor.close();
      }
      fetch() {
        return this.map(doc => doc);
      }

      /**
       * FIXME: (node:34680) [MONGODB DRIVER] Warning: cursor.count is deprecated and will be
       *  removed in the next major version, please use `collection.estimatedDocumentCount` or
       *  `collection.countDocuments` instead.
       */
      count() {
        return this._dbCursor.count();
      }

      // This method is NOT wrapped in Cursor.
      async getRawObjects(ordered) {
        var self = this;
        if (ordered) {
          return self.fetch();
        } else {
          var results = new LocalCollection._IdMap();
          await self.forEach(function (doc) {
            results.set(doc._id, doc);
          });
          return results;
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

},"cursor.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/cursor.ts                                                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      Cursor: () => Cursor
    });
    let ASYNC_CURSOR_METHODS, getAsyncMethodName;
    module.link("meteor/minimongo/constants", {
      ASYNC_CURSOR_METHODS(v) {
        ASYNC_CURSOR_METHODS = v;
      },
      getAsyncMethodName(v) {
        getAsyncMethodName = v;
      }
    }, 0);
    let replaceMeteorAtomWithMongo, replaceTypes;
    module.link("./mongo_common", {
      replaceMeteorAtomWithMongo(v) {
        replaceMeteorAtomWithMongo = v;
      },
      replaceTypes(v) {
        replaceTypes = v;
      }
    }, 1);
    let LocalCollection;
    module.link("meteor/minimongo/local_collection", {
      default(v) {
        LocalCollection = v;
      }
    }, 2);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    class Cursor {
      constructor(mongo, cursorDescription) {
        this._mongo = void 0;
        this._cursorDescription = void 0;
        this._synchronousCursor = void 0;
        this._mongo = mongo;
        this._cursorDescription = cursorDescription;
        this._synchronousCursor = null;
      }
      async countAsync() {
        const collection = this._mongo.rawCollection(this._cursorDescription.collectionName);
        return await collection.countDocuments(replaceTypes(this._cursorDescription.selector, replaceMeteorAtomWithMongo), replaceTypes(this._cursorDescription.options, replaceMeteorAtomWithMongo));
      }
      count() {
        throw new Error("count() is not available on the server. Please use countAsync() instead.");
      }
      getTransform() {
        return this._cursorDescription.options.transform;
      }
      _publishCursor(sub) {
        const collection = this._cursorDescription.collectionName;
        return Mongo.Collection._publishCursor(this, sub, collection);
      }
      _getCollectionName() {
        return this._cursorDescription.collectionName;
      }
      observe(callbacks) {
        return LocalCollection._observeFromObserveChanges(this, callbacks);
      }
      async observeAsync(callbacks) {
        return new Promise(resolve => resolve(this.observe(callbacks)));
      }
      observeChanges(callbacks) {
        let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        const ordered = LocalCollection._observeChangesCallbacksAreOrdered(callbacks);
        return this._mongo._observeChanges(this._cursorDescription, ordered, callbacks, options.nonMutatingCallbacks);
      }
      async observeChangesAsync(callbacks) {
        let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        return this.observeChanges(callbacks, options);
      }
    }
    // Add cursor methods dynamically
    [...ASYNC_CURSOR_METHODS, Symbol.iterator, Symbol.asyncIterator].forEach(methodName => {
      if (methodName === 'count') return;
      Cursor.prototype[methodName] = function () {
        const cursor = setupAsynchronousCursor(this, methodName);
        return cursor[methodName](...arguments);
      };
      if (methodName === Symbol.iterator || methodName === Symbol.asyncIterator) return;
      const methodNameAsync = getAsyncMethodName(methodName);
      Cursor.prototype[methodNameAsync] = function () {
        return this[methodName](...arguments);
      };
    });
    function setupAsynchronousCursor(cursor, method) {
      if (cursor._cursorDescription.options.tailable) {
        throw new Error("Cannot call ".concat(String(method), " on a tailable cursor"));
      }
      if (!cursor._synchronousCursor) {
        cursor._synchronousCursor = cursor._mongo._createAsynchronousCursor(cursor._cursorDescription, {
          selfForIteration: cursor,
          useTransform: true
        });
      }
      return cursor._synchronousCursor;
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

},"local_collection_driver.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/local_collection_driver.js                                                                           //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  LocalCollectionDriver: () => LocalCollectionDriver
});
const LocalCollectionDriver = new class LocalCollectionDriver {
  constructor() {
    this.noConnCollections = Object.create(null);
  }
  open(name, conn) {
    if (!name) {
      return new LocalCollection();
    }
    if (!conn) {
      return ensureCollection(name, this.noConnCollections);
    }
    if (!conn._mongo_livedata_collections) {
      conn._mongo_livedata_collections = Object.create(null);
    }

    // XXX is there a way to keep track of a connection's collections without
    // dangling it off the connection object?
    return ensureCollection(name, conn._mongo_livedata_collections);
  }
}();
function ensureCollection(name, collections) {
  return name in collections ? collections[name] : collections[name] = new LocalCollection(name);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"remote_collection_driver.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/remote_collection_driver.ts                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      RemoteCollectionDriver: () => RemoteCollectionDriver
    });
    let once;
    module.link("lodash.once", {
      default(v) {
        once = v;
      }
    }, 0);
    let ASYNC_COLLECTION_METHODS, getAsyncMethodName, CLIENT_ONLY_METHODS;
    module.link("meteor/minimongo/constants", {
      ASYNC_COLLECTION_METHODS(v) {
        ASYNC_COLLECTION_METHODS = v;
      },
      getAsyncMethodName(v) {
        getAsyncMethodName = v;
      },
      CLIENT_ONLY_METHODS(v) {
        CLIENT_ONLY_METHODS = v;
      }
    }, 1);
    let MongoConnection;
    module.link("./mongo_connection", {
      MongoConnection(v) {
        MongoConnection = v;
      }
    }, 2);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    class RemoteCollectionDriver {
      constructor(mongoUrl, options) {
        this.mongo = void 0;
        this.mongo = new MongoConnection(mongoUrl, options);
      }
      open(name) {
        const ret = {};
        // Handle remote collection methods
        RemoteCollectionDriver.REMOTE_COLLECTION_METHODS.forEach(method => {
          // Type assertion needed because we know these methods exist on MongoConnection
          const mongoMethod = this.mongo[method];
          ret[method] = mongoMethod.bind(this.mongo, name);
          if (!ASYNC_COLLECTION_METHODS.includes(method)) return;
          const asyncMethodName = getAsyncMethodName(method);
          ret[asyncMethodName] = function () {
            return ret[method](...arguments);
          };
        });
        // Handle client-only methods
        CLIENT_ONLY_METHODS.forEach(method => {
          ret[method] = function () {
            throw new Error("".concat(method, " is not available on the server. Please use ").concat(getAsyncMethodName(method), "() instead."));
          };
        });
        return ret;
      }
    }
    // Assign the class to MongoInternals
    RemoteCollectionDriver.REMOTE_COLLECTION_METHODS = ['createCappedCollectionAsync', 'dropIndexAsync', 'ensureIndexAsync', 'createIndexAsync', 'countDocuments', 'dropCollectionAsync', 'estimatedDocumentCount', 'find', 'findOneAsync', 'insertAsync', 'rawCollection', 'removeAsync', 'updateAsync', 'upsertAsync'];
    MongoInternals.RemoteCollectionDriver = RemoteCollectionDriver;
    // Create the singleton RemoteCollectionDriver only on demand
    MongoInternals.defaultRemoteCollectionDriver = once(() => {
      const connectionOptions = {};
      const mongoUrl = process.env.MONGO_URL;
      if (!mongoUrl) {
        throw new Error("MONGO_URL must be set in environment");
      }
      if (process.env.MONGO_OPLOG_URL) {
        connectionOptions.oplogUrl = process.env.MONGO_OPLOG_URL;
      }
      const driver = new RemoteCollectionDriver(mongoUrl, connectionOptions);
      // Initialize database connection on startup
      Meteor.startup(async () => {
        await driver.mongo.client.connect();
      });
      return driver;
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

},"collection":{"collection.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/collection/collection.js                                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module1, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    let _objectSpread;
    module1.link("@babel/runtime/helpers/objectSpread2", {
      default(v) {
        _objectSpread = v;
      }
    }, 0);
    let normalizeProjection;
    module1.link("../mongo_utils", {
      normalizeProjection(v) {
        normalizeProjection = v;
      }
    }, 0);
    let AsyncMethods;
    module1.link("./methods_async", {
      AsyncMethods(v) {
        AsyncMethods = v;
      }
    }, 1);
    let SyncMethods;
    module1.link("./methods_sync", {
      SyncMethods(v) {
        SyncMethods = v;
      }
    }, 2);
    let IndexMethods;
    module1.link("./methods_index", {
      IndexMethods(v) {
        IndexMethods = v;
      }
    }, 3);
    let ID_GENERATORS, normalizeOptions, setupAutopublish, setupConnection, setupDriver, setupMutationMethods, validateCollectionName;
    module1.link("./collection_utils", {
      ID_GENERATORS(v) {
        ID_GENERATORS = v;
      },
      normalizeOptions(v) {
        normalizeOptions = v;
      },
      setupAutopublish(v) {
        setupAutopublish = v;
      },
      setupConnection(v) {
        setupConnection = v;
      },
      setupDriver(v) {
        setupDriver = v;
      },
      setupMutationMethods(v) {
        setupMutationMethods = v;
      },
      validateCollectionName(v) {
        validateCollectionName = v;
      }
    }, 4);
    let ReplicationMethods;
    module1.link("./methods_replication", {
      ReplicationMethods(v) {
        ReplicationMethods = v;
      }
    }, 5);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    /**
     * @summary Namespace for MongoDB-related items
     * @namespace
     */
    Mongo = {};

    /**
     * @summary Constructor for a Collection
     * @locus Anywhere
     * @instancename collection
     * @class
     * @param {String} name The name of the collection.  If null, creates an unmanaged (unsynchronized) local collection.
     * @param {Object} [options]
     * @param {Object} options.connection The server connection that will manage this collection. Uses the default connection if not specified.  Pass the return value of calling [`DDP.connect`](#DDP-connect) to specify a different server. Pass `null` to specify no connection. Unmanaged (`name` is null) collections cannot specify a connection.
     * @param {String} options.idGeneration The method of generating the `_id` fields of new documents in this collection.  Possible values:
    
     - **`'STRING'`**: random strings
     - **`'MONGO'`**:  random [`Mongo.ObjectID`](#mongo_object_id) values
    
    The default id generation technique is `'STRING'`.
     * @param {Function} options.transform An optional transformation function. Documents will be passed through this function before being returned from `fetch` or `findOneAsync`, and before being passed to callbacks of `observe`, `map`, `forEach`, `allow`, and `deny`. Transforms are *not* applied for the callbacks of `observeChanges` or to cursors returned from publish functions.
     * @param {Boolean} options.defineMutationMethods Set to `false` to skip setting up the mutation methods that enable insert/update/remove from client code. Default `true`.
     */
    // Main Collection constructor
    Mongo.Collection = function Collection(name, options) {
      var _ID_GENERATORS$option, _ID_GENERATORS;
      name = validateCollectionName(name);
      options = normalizeOptions(options);
      this._makeNewID = (_ID_GENERATORS$option = (_ID_GENERATORS = ID_GENERATORS)[options.idGeneration]) === null || _ID_GENERATORS$option === void 0 ? void 0 : _ID_GENERATORS$option.call(_ID_GENERATORS, name);
      this._transform = LocalCollection.wrapTransform(options.transform);
      this.resolverType = options.resolverType;
      this._connection = setupConnection(name, options);
      const driver = setupDriver(name, this._connection, options);
      this._driver = driver;
      this._collection = driver.open(name, this._connection);
      this._name = name;
      this._settingUpReplicationPromise = this._maybeSetUpReplication(name, options);
      setupMutationMethods(this, name, options);
      setupAutopublish(this, name, options);
      Mongo._collections.set(name, this);
    };
    Object.assign(Mongo.Collection.prototype, {
      _getFindSelector(args) {
        if (args.length == 0) return {};else return args[0];
      },
      _getFindOptions(args) {
        const [, options] = args || [];
        const newOptions = normalizeProjection(options);
        var self = this;
        if (args.length < 2) {
          return {
            transform: self._transform
          };
        } else {
          check(newOptions, Match.Optional(Match.ObjectIncluding({
            projection: Match.Optional(Match.OneOf(Object, undefined)),
            sort: Match.Optional(Match.OneOf(Object, Array, Function, undefined)),
            limit: Match.Optional(Match.OneOf(Number, undefined)),
            skip: Match.Optional(Match.OneOf(Number, undefined))
          })));
          return _objectSpread({
            transform: self._transform
          }, newOptions);
        }
      }
    });
    Object.assign(Mongo.Collection, {
      async _publishCursor(cursor, sub, collection) {
        var observeHandle = await cursor.observeChanges({
          added: function (id, fields) {
            sub.added(collection, id, fields);
          },
          changed: function (id, fields) {
            sub.changed(collection, id, fields);
          },
          removed: function (id) {
            sub.removed(collection, id);
          }
        },
        // Publications don't mutate the documents
        // This is tested by the `livedata - publish callbacks clone` test
        {
          nonMutatingCallbacks: true
        });

        // We don't call sub.ready() here: it gets called in livedata_server, after
        // possibly calling _publishCursor on multiple returned cursors.

        // register stop callback (expects lambda w/ no args).
        sub.onStop(async function () {
          return await observeHandle.stop();
        });

        // return the observeHandle in case it needs to be stopped early
        return observeHandle;
      },
      // protect against dangerous selectors.  falsey and {_id: falsey} are both
      // likely programmer error, and not what you want, particularly for destructive
      // operations. If a falsey _id is sent in, a new string _id will be
      // generated and returned; if a fallbackId is provided, it will be returned
      // instead.
      _rewriteSelector(selector) {
        let {
          fallbackId
        } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        // shorthand -- scalars match _id
        if (LocalCollection._selectorIsId(selector)) selector = {
          _id: selector
        };
        if (Array.isArray(selector)) {
          // This is consistent with the Mongo console itself; if we don't do this
          // check passing an empty array ends up selecting all items
          throw new Error("Mongo selector can't be an array.");
        }
        if (!selector || '_id' in selector && !selector._id) {
          // can't match anything
          return {
            _id: fallbackId || Random.id()
          };
        }
        return selector;
      }
    });
    Object.assign(Mongo.Collection.prototype, ReplicationMethods, SyncMethods, AsyncMethods, IndexMethods);
    Object.assign(Mongo.Collection.prototype, {
      // Determine if this collection is simply a minimongo representation of a real
      // database on another server
      _isRemoteCollection() {
        // XXX see #MeteorServerNull
        return this._connection && this._connection !== Meteor.server;
      },
      async dropCollectionAsync() {
        var self = this;
        if (!self._collection.dropCollectionAsync) throw new Error('Can only call dropCollectionAsync on server collections');
        await self._collection.dropCollectionAsync();
      },
      async createCappedCollectionAsync(byteSize, maxDocuments) {
        var self = this;
        if (!(await self._collection.createCappedCollectionAsync)) throw new Error('Can only call createCappedCollectionAsync on server collections');
        await self._collection.createCappedCollectionAsync(byteSize, maxDocuments);
      },
      /**
       * @summary Returns the [`Collection`](http://mongodb.github.io/node-mongodb-native/3.0/api/Collection.html) object corresponding to this collection from the [npm `mongodb` driver module](https://www.npmjs.com/package/mongodb) which is wrapped by `Mongo.Collection`.
       * @locus Server
       * @memberof Mongo.Collection
       * @instance
       */
      rawCollection() {
        var self = this;
        if (!self._collection.rawCollection) {
          throw new Error('Can only call rawCollection on server collections');
        }
        return self._collection.rawCollection();
      },
      /**
       * @summary Returns the [`Db`](http://mongodb.github.io/node-mongodb-native/3.0/api/Db.html) object corresponding to this collection's database connection from the [npm `mongodb` driver module](https://www.npmjs.com/package/mongodb) which is wrapped by `Mongo.Collection`.
       * @locus Server
       * @memberof Mongo.Collection
       * @instance
       */
      rawDatabase() {
        var self = this;
        if (!(self._driver.mongo && self._driver.mongo.db)) {
          throw new Error('Can only call rawDatabase on server collections');
        }
        return self._driver.mongo.db;
      }
    });
    Object.assign(Mongo, {
      /**
       * @summary Retrieve a Meteor collection instance by name. Only collections defined with [`new Mongo.Collection(...)`](#collections) are available with this method. For plain MongoDB collections, you'll want to look at [`rawDatabase()`](#Mongo-Collection-rawDatabase).
       * @locus Anywhere
       * @memberof Mongo
       * @static
       * @param {string} name Name of your collection as it was defined with `new Mongo.Collection()`.
       * @returns {Mongo.Collection | undefined}
       */
      getCollection(name) {
        return this._collections.get(name);
      },
      /**
       * @summary A record of all defined Mongo.Collection instances, indexed by collection name.
       * @type {Map<string, Mongo.Collection>}
       * @memberof Mongo
       * @protected
       */
      _collections: new Map()
    });

    /**
     * @summary Create a Mongo-style `ObjectID`.  If you don't specify a `hexString`, the `ObjectID` will be generated randomly (not using MongoDB's ID construction rules).
     * @locus Anywhere
     * @class
     * @param {String} [hexString] Optional.  The 24-character hexadecimal contents of the ObjectID to create
     */
    Mongo.ObjectID = MongoID.ObjectID;

    /**
     * @summary To create a cursor, use find. To access the documents in a cursor, use forEach, map, or fetch.
     * @class
     * @instanceName cursor
     */
    Mongo.Cursor = LocalCollection.Cursor;

    /**
     * @deprecated in 0.9.1
     */
    Mongo.Collection.Cursor = Mongo.Cursor;

    /**
     * @deprecated in 0.9.1
     */
    Mongo.Collection.ObjectID = Mongo.ObjectID;

    /**
     * @deprecated in 0.9.1
     */
    Meteor.Collection = Mongo.Collection;

    // Allow deny stuff is now in the allow-deny package
    Object.assign(Mongo.Collection.prototype, AllowDeny.CollectionPrototype);
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

},"collection_utils.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/collection/collection_utils.js                                                                       //
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
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    module.export({
      ID_GENERATORS: () => ID_GENERATORS,
      setupConnection: () => setupConnection,
      setupDriver: () => setupDriver,
      setupAutopublish: () => setupAutopublish,
      setupMutationMethods: () => setupMutationMethods,
      validateCollectionName: () => validateCollectionName,
      normalizeOptions: () => normalizeOptions
    });
    const ID_GENERATORS = {
      MONGO(name) {
        return function () {
          const src = name ? DDP.randomStream('/collection/' + name) : Random.insecure;
          return new Mongo.ObjectID(src.hexString(24));
        };
      },
      STRING(name) {
        return function () {
          const src = name ? DDP.randomStream('/collection/' + name) : Random.insecure;
          return src.id();
        };
      }
    };
    function setupConnection(name, options) {
      if (!name || options.connection === null) return null;
      if (options.connection) return options.connection;
      return Meteor.isClient ? Meteor.connection : Meteor.server;
    }
    function setupDriver(name, connection, options) {
      if (options._driver) return options._driver;
      if (name && connection === Meteor.server && typeof MongoInternals !== 'undefined' && MongoInternals.defaultRemoteCollectionDriver) {
        return MongoInternals.defaultRemoteCollectionDriver();
      }
      const {
        LocalCollectionDriver
      } = require('../local_collection_driver.js');
      return LocalCollectionDriver;
    }
    function setupAutopublish(collection, name, options) {
      if (Package.autopublish && !options._preventAutopublish && collection._connection && collection._connection.publish) {
        collection._connection.publish(null, () => collection.find(), {
          is_auto: true
        });
      }
    }
    function setupMutationMethods(collection, name, options) {
      if (options.defineMutationMethods === false) return;
      try {
        collection._defineMutationMethods({
          useExisting: options._suppressSameNameError === true
        });
      } catch (error) {
        if (error.message === "A method named '/".concat(name, "/insertAsync' is already defined")) {
          throw new Error("There is already a collection named \"".concat(name, "\""));
        }
        throw error;
      }
    }
    function validateCollectionName(name) {
      if (!name && name !== null) {
        Meteor._debug('Warning: creating anonymous collection. It will not be ' + 'saved or synchronized over the network. (Pass null for ' + 'the collection name to turn off this warning.)');
        name = null;
      }
      if (name !== null && typeof name !== 'string') {
        throw new Error('First argument to new Mongo.Collection must be a string or null');
      }
      return name;
    }
    function normalizeOptions(options) {
      if (options && options.methods) {
        // Backwards compatibility hack with original signature
        options = {
          connection: options
        };
      }
      // Backwards compatibility: "connection" used to be called "manager".
      if (options && options.manager && !options.connection) {
        options.connection = options.manager;
      }
      return _objectSpread({
        connection: undefined,
        idGeneration: 'STRING',
        transform: null,
        _driver: undefined,
        _preventAutopublish: false
      }, options);
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

},"methods_async.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/collection/methods_async.js                                                                          //
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
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    module.export({
      AsyncMethods: () => AsyncMethods
    });
    const AsyncMethods = {
      /**
       * @summary Finds the first document that matches the selector, as ordered by sort and skip options. Returns `undefined` if no matching document is found.
       * @locus Anywhere
       * @method findOneAsync
       * @memberof Mongo.Collection
       * @instance
       * @param {MongoSelector} [selector] A query describing the documents to find
       * @param {Object} [options]
       * @param {MongoSortSpecifier} options.sort Sort order (default: natural order)
       * @param {Number} options.skip Number of results to skip at the beginning
       * @param {MongoFieldSpecifier} options.fields Dictionary of fields to return or exclude.
       * @param {Boolean} options.reactive (Client only) Default true; pass false to disable reactivity
       * @param {Function} options.transform Overrides `transform` on the [`Collection`](#collections) for this cursor.  Pass `null` to disable transformation.
       * @param {String} options.readPreference (Server only) Specifies a custom MongoDB [`readPreference`](https://docs.mongodb.com/manual/core/read-preference) for fetching the document. Possible values are `primary`, `primaryPreferred`, `secondary`, `secondaryPreferred` and `nearest`.
       * @returns {Object}
       */
      findOneAsync() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        return this._collection.findOneAsync(this._getFindSelector(args), this._getFindOptions(args));
      },
      _insertAsync(doc) {
        let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        // Make sure we were passed a document to insert
        if (!doc) {
          throw new Error('insert requires an argument');
        }

        // Make a shallow clone of the document, preserving its prototype.
        doc = Object.create(Object.getPrototypeOf(doc), Object.getOwnPropertyDescriptors(doc));
        if ('_id' in doc) {
          if (!doc._id || !(typeof doc._id === 'string' || doc._id instanceof Mongo.ObjectID)) {
            throw new Error('Meteor requires document _id fields to be non-empty strings or ObjectIDs');
          }
        } else {
          let generateId = true;

          // Don't generate the id if we're the client and the 'outermost' call
          // This optimization saves us passing both the randomSeed and the id
          // Passing both is redundant.
          if (this._isRemoteCollection()) {
            const enclosing = DDP._CurrentMethodInvocation.get();
            if (!enclosing) {
              generateId = false;
            }
          }
          if (generateId) {
            doc._id = this._makeNewID();
          }
        }

        // On inserts, always return the id that we generated; on all other
        // operations, just return the result from the collection.
        var chooseReturnValueFromCollectionResult = function (result) {
          if (Meteor._isPromise(result)) return result;
          if (doc._id) {
            return doc._id;
          }

          // XXX what is this for??
          // It's some iteraction between the callback to _callMutatorMethod and
          // the return value conversion
          doc._id = result;
          return result;
        };
        if (this._isRemoteCollection()) {
          const promise = this._callMutatorMethodAsync('insertAsync', [doc], options);
          promise.then(chooseReturnValueFromCollectionResult);
          promise.stubPromise = promise.stubPromise.then(chooseReturnValueFromCollectionResult);
          promise.serverPromise = promise.serverPromise.then(chooseReturnValueFromCollectionResult);
          return promise;
        }

        // it's my collection.  descend into the collection object
        // and propagate any exception.
        return this._collection.insertAsync(doc).then(chooseReturnValueFromCollectionResult);
      },
      /**
       * @summary Insert a document in the collection.  Returns a promise that will return the document's unique _id when solved.
       * @locus Anywhere
       * @method  insert
       * @memberof Mongo.Collection
       * @instance
       * @param {Object} doc The document to insert. May not yet have an _id attribute, in which case Meteor will generate one for you.
       */
      insertAsync(doc, options) {
        return this._insertAsync(doc, options);
      },
      /**
       * @summary Modify one or more documents in the collection. Returns the number of matched documents.
       * @locus Anywhere
       * @method update
       * @memberof Mongo.Collection
       * @instance
       * @param {MongoSelector} selector Specifies which documents to modify
       * @param {MongoModifier} modifier Specifies how to modify the documents
       * @param {Object} [options]
       * @param {Boolean} options.multi True to modify all matching documents; false to only modify one of the matching documents (the default).
       * @param {Boolean} options.upsert True to insert a document if no matching documents are found.
       * @param {Array} options.arrayFilters Optional. Used in combination with MongoDB [filtered positional operator](https://docs.mongodb.com/manual/reference/operator/update/positional-filtered/) to specify which elements to modify in an array field.
       */
      updateAsync(selector, modifier) {
        // We've already popped off the callback, so we are left with an array
        // of one or zero items
        const options = _objectSpread({}, (arguments.length <= 2 ? undefined : arguments[2]) || null);
        let insertedId;
        if (options && options.upsert) {
          // set `insertedId` if absent.  `insertedId` is a Meteor extension.
          if (options.insertedId) {
            if (!(typeof options.insertedId === 'string' || options.insertedId instanceof Mongo.ObjectID)) throw new Error('insertedId must be string or ObjectID');
            insertedId = options.insertedId;
          } else if (!selector || !selector._id) {
            insertedId = this._makeNewID();
            options.generatedId = true;
            options.insertedId = insertedId;
          }
        }
        selector = Mongo.Collection._rewriteSelector(selector, {
          fallbackId: insertedId
        });
        if (this._isRemoteCollection()) {
          const args = [selector, modifier, options];
          return this._callMutatorMethodAsync('updateAsync', args, options);
        }

        // it's my collection.  descend into the collection object
        // and propagate any exception.
        // If the user provided a callback and the collection implements this
        // operation asynchronously, then queryRet will be undefined, and the
        // result will be returned through the callback instead.

        return this._collection.updateAsync(selector, modifier, options);
      },
      /**
       * @summary Asynchronously removes documents from the collection.
       * @locus Anywhere
       * @method remove
       * @memberof Mongo.Collection
       * @instance
       * @param {MongoSelector} selector Specifies which documents to remove
       */
      removeAsync(selector) {
        let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        selector = Mongo.Collection._rewriteSelector(selector);
        if (this._isRemoteCollection()) {
          return this._callMutatorMethodAsync('removeAsync', [selector], options);
        }

        // it's my collection.  descend into the collection1 object
        // and propagate any exception.
        return this._collection.removeAsync(selector);
      },
      /**
       * @summary Asynchronously modifies one or more documents in the collection, or insert one if no matching documents were found. Returns an object with keys `numberAffected` (the number of documents modified)  and `insertedId` (the unique _id of the document that was inserted, if any).
       * @locus Anywhere
       * @method upsert
       * @memberof Mongo.Collection
       * @instance
       * @param {MongoSelector} selector Specifies which documents to modify
       * @param {MongoModifier} modifier Specifies how to modify the documents
       * @param {Object} [options]
       * @param {Boolean} options.multi True to modify all matching documents; false to only modify one of the matching documents (the default).
       */
      async upsertAsync(selector, modifier, options) {
        return this.updateAsync(selector, modifier, _objectSpread(_objectSpread({}, options), {}, {
          _returnObject: true,
          upsert: true
        }));
      },
      /**
       * @summary Gets the number of documents matching the filter. For a fast count of the total documents in a collection see `estimatedDocumentCount`.
       * @locus Anywhere
       * @method countDocuments
       * @memberof Mongo.Collection
       * @instance
       * @param {MongoSelector} [selector] A query describing the documents to count
       * @param {Object} [options] All options are listed in [MongoDB documentation](https://mongodb.github.io/node-mongodb-native/4.11/interfaces/CountDocumentsOptions.html). Please note that not all of them are available on the client.
       * @returns {Promise<number>}
       */
      countDocuments() {
        return this._collection.countDocuments(...arguments);
      },
      /**
       * @summary Gets an estimate of the count of documents in a collection using collection metadata. For an exact count of the documents in a collection see `countDocuments`.
       * @locus Anywhere
       * @method estimatedDocumentCount
       * @memberof Mongo.Collection
       * @instance
       * @param {Object} [options] All options are listed in [MongoDB documentation](https://mongodb.github.io/node-mongodb-native/4.11/interfaces/EstimatedDocumentCountOptions.html). Please note that not all of them are available on the client.
       * @returns {Promise<number>}
       */
      estimatedDocumentCount() {
        return this._collection.estimatedDocumentCount(...arguments);
      }
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

},"methods_index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/collection/methods_index.js                                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  IndexMethods: () => IndexMethods
});
const IndexMethods = {
  // We'll actually design an index API later. For now, we just pass through to
  // Mongo's, but make it synchronous.
  /**
   * @summary Asynchronously creates the specified index on the collection.
   * @locus server
   * @method ensureIndexAsync
   * @deprecated in 3.0
   * @memberof Mongo.Collection
   * @instance
   * @param {Object} index A document that contains the field and value pairs where the field is the index key and the value describes the type of index for that field. For an ascending index on a field, specify a value of `1`; for descending index, specify a value of `-1`. Use `text` for text indexes.
   * @param {Object} [options] All options are listed in [MongoDB documentation](https://docs.mongodb.com/manual/reference/method/db.collection.createIndex/#options)
   * @param {String} options.name Name of the index
   * @param {Boolean} options.unique Define that the index values must be unique, more at [MongoDB documentation](https://docs.mongodb.com/manual/core/index-unique/)
   * @param {Boolean} options.sparse Define that the index is sparse, more at [MongoDB documentation](https://docs.mongodb.com/manual/core/index-sparse/)
   */
  async ensureIndexAsync(index, options) {
    var self = this;
    if (!self._collection.ensureIndexAsync || !self._collection.createIndexAsync) throw new Error('Can only call createIndexAsync on server collections');
    if (self._collection.createIndexAsync) {
      await self._collection.createIndexAsync(index, options);
    } else {
      let Log;
      module.link("meteor/logging", {
        Log(v) {
          Log = v;
        }
      }, 0);
      Log.debug("ensureIndexAsync has been deprecated, please use the new 'createIndexAsync' instead".concat(options !== null && options !== void 0 && options.name ? ", index name: ".concat(options.name) : ", index: ".concat(JSON.stringify(index))));
      await self._collection.ensureIndexAsync(index, options);
    }
  },
  /**
   * @summary Asynchronously creates the specified index on the collection.
   * @locus server
   * @method createIndexAsync
   * @memberof Mongo.Collection
   * @instance
   * @param {Object} index A document that contains the field and value pairs where the field is the index key and the value describes the type of index for that field. For an ascending index on a field, specify a value of `1`; for descending index, specify a value of `-1`. Use `text` for text indexes.
   * @param {Object} [options] All options are listed in [MongoDB documentation](https://docs.mongodb.com/manual/reference/method/db.collection.createIndex/#options)
   * @param {String} options.name Name of the index
   * @param {Boolean} options.unique Define that the index values must be unique, more at [MongoDB documentation](https://docs.mongodb.com/manual/core/index-unique/)
   * @param {Boolean} options.sparse Define that the index is sparse, more at [MongoDB documentation](https://docs.mongodb.com/manual/core/index-sparse/)
   */
  async createIndexAsync(index, options) {
    var self = this;
    if (!self._collection.createIndexAsync) throw new Error('Can only call createIndexAsync on server collections');
    try {
      await self._collection.createIndexAsync(index, options);
    } catch (e) {
      var _Meteor$settings, _Meteor$settings$pack, _Meteor$settings$pack2;
      if (e.message.includes('An equivalent index already exists with the same name but different options.') && (_Meteor$settings = Meteor.settings) !== null && _Meteor$settings !== void 0 && (_Meteor$settings$pack = _Meteor$settings.packages) !== null && _Meteor$settings$pack !== void 0 && (_Meteor$settings$pack2 = _Meteor$settings$pack.mongo) !== null && _Meteor$settings$pack2 !== void 0 && _Meteor$settings$pack2.reCreateIndexOnOptionMismatch) {
        let Log;
        module.link("meteor/logging", {
          Log(v) {
            Log = v;
          }
        }, 1);
        Log.info("Re-creating index ".concat(index, " for ").concat(self._name, " due to options mismatch."));
        await self._collection.dropIndexAsync(index);
        await self._collection.createIndexAsync(index, options);
      } else {
        console.error(e);
        throw new Meteor.Error("An error occurred when creating an index for collection \"".concat(self._name, ": ").concat(e.message));
      }
    }
  },
  /**
   * @summary Asynchronously creates the specified index on the collection.
   * @locus server
   * @method createIndex
   * @memberof Mongo.Collection
   * @instance
   * @param {Object} index A document that contains the field and value pairs where the field is the index key and the value describes the type of index for that field. For an ascending index on a field, specify a value of `1`; for descending index, specify a value of `-1`. Use `text` for text indexes.
   * @param {Object} [options] All options are listed in [MongoDB documentation](https://docs.mongodb.com/manual/reference/method/db.collection.createIndex/#options)
   * @param {String} options.name Name of the index
   * @param {Boolean} options.unique Define that the index values must be unique, more at [MongoDB documentation](https://docs.mongodb.com/manual/core/index-unique/)
   * @param {Boolean} options.sparse Define that the index is sparse, more at [MongoDB documentation](https://docs.mongodb.com/manual/core/index-sparse/)
   */
  createIndex(index, options) {
    return this.createIndexAsync(index, options);
  },
  async dropIndexAsync(index) {
    var self = this;
    if (!self._collection.dropIndexAsync) throw new Error('Can only call dropIndexAsync on server collections');
    await self._collection.dropIndexAsync(index);
  }
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"methods_replication.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/collection/methods_replication.js                                                                    //
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
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    module.export({
      ReplicationMethods: () => ReplicationMethods
    });
    const ReplicationMethods = {
      async _maybeSetUpReplication(name) {
        var _registerStoreResult, _registerStoreResult$;
        const self = this;
        if (!(self._connection && self._connection.registerStoreClient && self._connection.registerStoreServer)) {
          return;
        }
        const wrappedStoreCommon = {
          // Called around method stub invocations to capture the original versions
          // of modified documents.
          saveOriginals() {
            self._collection.saveOriginals();
          },
          retrieveOriginals() {
            return self._collection.retrieveOriginals();
          },
          // To be able to get back to the collection from the store.
          _getCollection() {
            return self;
          }
        };
        const wrappedStoreClient = _objectSpread({
          // Called at the beginning of a batch of updates. batchSize is the number
          // of update calls to expect.
          //
          // XXX This interface is pretty janky. reset probably ought to go back to
          // being its own function, and callers shouldn't have to calculate
          // batchSize. The optimization of not calling pause/remove should be
          // delayed until later: the first call to update() should buffer its
          // message, and then we can either directly apply it at endUpdate time if
          // it was the only update, or do pauseObservers/apply/apply at the next
          // update() if there's another one.
          async beginUpdate(batchSize, reset) {
            // pause observers so users don't see flicker when updating several
            // objects at once (including the post-reconnect reset-and-reapply
            // stage), and so that a re-sorting of a query can take advantage of the
            // full _diffQuery moved calculation instead of applying change one at a
            // time.
            if (batchSize > 1 || reset) self._collection.pauseObservers();
            if (reset) await self._collection.remove({});
          },
          // Apply an update.
          // XXX better specify this interface (not in terms of a wire message)?
          update(msg) {
            var mongoId = MongoID.idParse(msg.id);
            var doc = self._collection._docs.get(mongoId);

            //When the server's mergebox is disabled for a collection, the client must gracefully handle it when:
            // *We receive an added message for a document that is already there. Instead, it will be changed
            // *We reeive a change message for a document that is not there. Instead, it will be added
            // *We receive a removed messsage for a document that is not there. Instead, noting wil happen.

            //Code is derived from client-side code originally in peerlibrary:control-mergebox
            //https://github.com/peerlibrary/meteor-control-mergebox/blob/master/client.coffee

            //For more information, refer to discussion "Initial support for publication strategies in livedata server":
            //https://github.com/meteor/meteor/pull/11151
            if (Meteor.isClient) {
              if (msg.msg === 'added' && doc) {
                msg.msg = 'changed';
              } else if (msg.msg === 'removed' && !doc) {
                return;
              } else if (msg.msg === 'changed' && !doc) {
                msg.msg = 'added';
                const _ref = msg.fields;
                for (let field in _ref) {
                  const value = _ref[field];
                  if (value === void 0) {
                    delete msg.fields[field];
                  }
                }
              }
            }
            // Is this a "replace the whole doc" message coming from the quiescence
            // of method writes to an object? (Note that 'undefined' is a valid
            // value meaning "remove it".)
            if (msg.msg === 'replace') {
              var replace = msg.replace;
              if (!replace) {
                if (doc) self._collection.remove(mongoId);
              } else if (!doc) {
                self._collection.insert(replace);
              } else {
                // XXX check that replace has no $ ops
                self._collection.update(mongoId, replace);
              }
              return;
            } else if (msg.msg === 'added') {
              if (doc) {
                throw new Error('Expected not to find a document already present for an add');
              }
              self._collection.insert(_objectSpread({
                _id: mongoId
              }, msg.fields));
            } else if (msg.msg === 'removed') {
              if (!doc) throw new Error('Expected to find a document already present for removed');
              self._collection.remove(mongoId);
            } else if (msg.msg === 'changed') {
              if (!doc) throw new Error('Expected to find a document to change');
              const keys = Object.keys(msg.fields);
              if (keys.length > 0) {
                var modifier = {};
                keys.forEach(key => {
                  const value = msg.fields[key];
                  if (EJSON.equals(doc[key], value)) {
                    return;
                  }
                  if (typeof value === 'undefined') {
                    if (!modifier.$unset) {
                      modifier.$unset = {};
                    }
                    modifier.$unset[key] = 1;
                  } else {
                    if (!modifier.$set) {
                      modifier.$set = {};
                    }
                    modifier.$set[key] = value;
                  }
                });
                if (Object.keys(modifier).length > 0) {
                  self._collection.update(mongoId, modifier);
                }
              }
            } else {
              throw new Error("I don't know how to deal with this message");
            }
          },
          // Called at the end of a batch of updates.livedata_connection.js:1287
          endUpdate() {
            self._collection.resumeObserversClient();
          },
          // Used to preserve current versions of documents across a store reset.
          getDoc(id) {
            return self.findOne(id);
          }
        }, wrappedStoreCommon);
        const wrappedStoreServer = _objectSpread({
          async beginUpdate(batchSize, reset) {
            if (batchSize > 1 || reset) self._collection.pauseObservers();
            if (reset) await self._collection.removeAsync({});
          },
          async update(msg) {
            var mongoId = MongoID.idParse(msg.id);
            var doc = self._collection._docs.get(mongoId);

            // Is this a "replace the whole doc" message coming from the quiescence
            // of method writes to an object? (Note that 'undefined' is a valid
            // value meaning "remove it".)
            if (msg.msg === 'replace') {
              var replace = msg.replace;
              if (!replace) {
                if (doc) await self._collection.removeAsync(mongoId);
              } else if (!doc) {
                await self._collection.insertAsync(replace);
              } else {
                // XXX check that replace has no $ ops
                await self._collection.updateAsync(mongoId, replace);
              }
              return;
            } else if (msg.msg === 'added') {
              if (doc) {
                throw new Error('Expected not to find a document already present for an add');
              }
              await self._collection.insertAsync(_objectSpread({
                _id: mongoId
              }, msg.fields));
            } else if (msg.msg === 'removed') {
              if (!doc) throw new Error('Expected to find a document already present for removed');
              await self._collection.removeAsync(mongoId);
            } else if (msg.msg === 'changed') {
              if (!doc) throw new Error('Expected to find a document to change');
              const keys = Object.keys(msg.fields);
              if (keys.length > 0) {
                var modifier = {};
                keys.forEach(key => {
                  const value = msg.fields[key];
                  if (EJSON.equals(doc[key], value)) {
                    return;
                  }
                  if (typeof value === 'undefined') {
                    if (!modifier.$unset) {
                      modifier.$unset = {};
                    }
                    modifier.$unset[key] = 1;
                  } else {
                    if (!modifier.$set) {
                      modifier.$set = {};
                    }
                    modifier.$set[key] = value;
                  }
                });
                if (Object.keys(modifier).length > 0) {
                  await self._collection.updateAsync(mongoId, modifier);
                }
              }
            } else {
              throw new Error("I don't know how to deal with this message");
            }
          },
          // Called at the end of a batch of updates.
          async endUpdate() {
            await self._collection.resumeObserversServer();
          },
          // Used to preserve current versions of documents across a store reset.
          async getDoc(id) {
            return self.findOneAsync(id);
          }
        }, wrappedStoreCommon);

        // OK, we're going to be a slave, replicating some remote
        // database, except possibly with some temporary divergence while
        // we have unacknowledged RPC's.
        let registerStoreResult;
        if (Meteor.isClient) {
          registerStoreResult = self._connection.registerStoreClient(name, wrappedStoreClient);
        } else {
          registerStoreResult = self._connection.registerStoreServer(name, wrappedStoreServer);
        }
        const message = "There is already a collection named \"".concat(name, "\"");
        const logWarn = () => {
          console.warn ? console.warn(message) : console.log(message);
        };
        if (!registerStoreResult) {
          return logWarn();
        }
        return (_registerStoreResult = registerStoreResult) === null || _registerStoreResult === void 0 ? void 0 : (_registerStoreResult$ = _registerStoreResult.then) === null || _registerStoreResult$ === void 0 ? void 0 : _registerStoreResult$.call(_registerStoreResult, ok => {
          if (!ok) {
            logWarn();
          }
        });
      }
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

},"methods_sync.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/collection/methods_sync.js                                                                           //
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
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    module.export({
      SyncMethods: () => SyncMethods
    });
    const SyncMethods = {
      /**
       * @summary Find the documents in a collection that match the selector.
       * @locus Anywhere
       * @method find
       * @memberof Mongo.Collection
       * @instance
       * @param {MongoSelector} [selector] A query describing the documents to find
       * @param {Object} [options]
       * @param {MongoSortSpecifier} options.sort Sort order (default: natural order)
       * @param {Number} options.skip Number of results to skip at the beginning
       * @param {Number} options.limit Maximum number of results to return
       * @param {MongoFieldSpecifier} options.fields Dictionary of fields to return or exclude.
       * @param {Boolean} options.reactive (Client only) Default `true`; pass `false` to disable reactivity
       * @param {Function} options.transform Overrides `transform` on the  [`Collection`](#collections) for this cursor.  Pass `null` to disable transformation.
       * @param {Boolean} options.disableOplog (Server only) Pass true to disable oplog-tailing on this query. This affects the way server processes calls to `observe` on this query. Disabling the oplog can be useful when working with data that updates in large batches.
       * @param {Number} options.pollingIntervalMs (Server only) When oplog is disabled (through the use of `disableOplog` or when otherwise not available), the frequency (in milliseconds) of how often to poll this query when observing on the server. Defaults to 10000ms (10 seconds).
       * @param {Number} options.pollingThrottleMs (Server only) When oplog is disabled (through the use of `disableOplog` or when otherwise not available), the minimum time (in milliseconds) to allow between re-polling when observing on the server. Increasing this will save CPU and mongo load at the expense of slower updates to users. Decreasing this is not recommended. Defaults to 50ms.
       * @param {Number} options.maxTimeMs (Server only) If set, instructs MongoDB to set a time limit for this cursor's operations. If the operation reaches the specified time limit (in milliseconds) without the having been completed, an exception will be thrown. Useful to prevent an (accidental or malicious) unoptimized query from causing a full collection scan that would disrupt other database users, at the expense of needing to handle the resulting error.
       * @param {String|Object} options.hint (Server only) Overrides MongoDB's default index selection and query optimization process. Specify an index to force its use, either by its name or index specification. You can also specify `{ $natural : 1 }` to force a forwards collection scan, or `{ $natural : -1 }` for a reverse collection scan. Setting this is only recommended for advanced users.
       * @param {String} options.readPreference (Server only) Specifies a custom MongoDB [`readPreference`](https://docs.mongodb.com/manual/core/read-preference) for this particular cursor. Possible values are `primary`, `primaryPreferred`, `secondary`, `secondaryPreferred` and `nearest`.
       * @returns {Mongo.Cursor}
       */
      find() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        // Collection.find() (return all docs) behaves differently
        // from Collection.find(undefined) (return 0 docs).  so be
        // careful about the length of arguments.
        return this._collection.find(this._getFindSelector(args), this._getFindOptions(args));
      },
      /**
       * @summary Finds the first document that matches the selector, as ordered by sort and skip options. Returns `undefined` if no matching document is found.
       * @locus Anywhere
       * @method findOne
       * @memberof Mongo.Collection
       * @instance
       * @param {MongoSelector} [selector] A query describing the documents to find
       * @param {Object} [options]
       * @param {MongoSortSpecifier} options.sort Sort order (default: natural order)
       * @param {Number} options.skip Number of results to skip at the beginning
       * @param {MongoFieldSpecifier} options.fields Dictionary of fields to return or exclude.
       * @param {Boolean} options.reactive (Client only) Default true; pass false to disable reactivity
       * @param {Function} options.transform Overrides `transform` on the [`Collection`](#collections) for this cursor.  Pass `null` to disable transformation.
       * @param {String} options.readPreference (Server only) Specifies a custom MongoDB [`readPreference`](https://docs.mongodb.com/manual/core/read-preference) for fetching the document. Possible values are `primary`, `primaryPreferred`, `secondary`, `secondaryPreferred` and `nearest`.
       * @returns {Object}
       */
      findOne() {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }
        return this._collection.findOne(this._getFindSelector(args), this._getFindOptions(args));
      },
      // 'insert' immediately returns the inserted document's new _id.
      // The others return values immediately if you are in a stub, an in-memory
      // unmanaged collection, or a mongo-backed collection and you don't pass a
      // callback. 'update' and 'remove' return the number of affected
      // documents. 'upsert' returns an object with keys 'numberAffected' and, if an
      // insert happened, 'insertedId'.
      //
      // Otherwise, the semantics are exactly like other methods: they take
      // a callback as an optional last argument; if no callback is
      // provided, they block until the operation is complete, and throw an
      // exception if it fails; if a callback is provided, then they don't
      // necessarily block, and they call the callback when they finish with error and
      // result arguments.  (The insert method provides the document ID as its result;
      // update and remove provide the number of affected docs as the result; upsert
      // provides an object with numberAffected and maybe insertedId.)
      //
      // On the client, blocking is impossible, so if a callback
      // isn't provided, they just return immediately and any error
      // information is lost.
      //
      // There's one more tweak. On the client, if you don't provide a
      // callback, then if there is an error, a message will be logged with
      // Meteor._debug.
      //
      // The intent (though this is actually determined by the underlying
      // drivers) is that the operations should be done synchronously, not
      // generating their result until the database has acknowledged
      // them. In the future maybe we should provide a flag to turn this
      // off.

      _insert(doc, callback) {
        // Make sure we were passed a document to insert
        if (!doc) {
          throw new Error('insert requires an argument');
        }

        // Make a shallow clone of the document, preserving its prototype.
        doc = Object.create(Object.getPrototypeOf(doc), Object.getOwnPropertyDescriptors(doc));
        if ('_id' in doc) {
          if (!doc._id || !(typeof doc._id === 'string' || doc._id instanceof Mongo.ObjectID)) {
            throw new Error('Meteor requires document _id fields to be non-empty strings or ObjectIDs');
          }
        } else {
          let generateId = true;

          // Don't generate the id if we're the client and the 'outermost' call
          // This optimization saves us passing both the randomSeed and the id
          // Passing both is redundant.
          if (this._isRemoteCollection()) {
            const enclosing = DDP._CurrentMethodInvocation.get();
            if (!enclosing) {
              generateId = false;
            }
          }
          if (generateId) {
            doc._id = this._makeNewID();
          }
        }

        // On inserts, always return the id that we generated; on all other
        // operations, just return the result from the collection.
        var chooseReturnValueFromCollectionResult = function (result) {
          if (Meteor._isPromise(result)) return result;
          if (doc._id) {
            return doc._id;
          }

          // XXX what is this for??
          // It's some iteraction between the callback to _callMutatorMethod and
          // the return value conversion
          doc._id = result;
          return result;
        };
        const wrappedCallback = wrapCallback(callback, chooseReturnValueFromCollectionResult);
        if (this._isRemoteCollection()) {
          const result = this._callMutatorMethod('insert', [doc], wrappedCallback);
          return chooseReturnValueFromCollectionResult(result);
        }

        // it's my collection.  descend into the collection object
        // and propagate any exception.
        try {
          // If the user provided a callback and the collection implements this
          // operation asynchronously, then queryRet will be undefined, and the
          // result will be returned through the callback instead.
          let result;
          if (!!wrappedCallback) {
            this._collection.insert(doc, wrappedCallback);
          } else {
            // If we don't have the callback, we assume the user is using the promise.
            // We can't just pass this._collection.insert to the promisify because it would lose the context.
            result = this._collection.insert(doc);
          }
          return chooseReturnValueFromCollectionResult(result);
        } catch (e) {
          if (callback) {
            callback(e);
            return null;
          }
          throw e;
        }
      },
      /**
       * @summary Insert a document in the collection.  Returns its unique _id.
       * @locus Anywhere
       * @method  insert
       * @memberof Mongo.Collection
       * @instance
       * @param {Object} doc The document to insert. May not yet have an _id attribute, in which case Meteor will generate one for you.
       * @param {Function} [callback] Optional.  If present, called with an error object as the first argument and, if no error, the _id as the second.
       */
      insert(doc, callback) {
        return this._insert(doc, callback);
      },
      /**
       * @summary Asynchronously modifies one or more documents in the collection. Returns the number of matched documents.
       * @locus Anywhere
       * @method update
       * @memberof Mongo.Collection
       * @instance
       * @param {MongoSelector} selector Specifies which documents to modify
       * @param {MongoModifier} modifier Specifies how to modify the documents
       * @param {Object} [options]
       * @param {Boolean} options.multi True to modify all matching documents; false to only modify one of the matching documents (the default).
       * @param {Boolean} options.upsert True to insert a document if no matching documents are found.
       * @param {Array} options.arrayFilters Optional. Used in combination with MongoDB [filtered positional operator](https://docs.mongodb.com/manual/reference/operator/update/positional-filtered/) to specify which elements to modify in an array field.
       * @param {Function} [callback] Optional.  If present, called with an error object as the first argument and, if no error, the number of affected documents as the second.
       */
      update(selector, modifier) {
        for (var _len3 = arguments.length, optionsAndCallback = new Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
          optionsAndCallback[_key3 - 2] = arguments[_key3];
        }
        const callback = popCallbackFromArgs(optionsAndCallback);

        // We've already popped off the callback, so we are left with an array
        // of one or zero items
        const options = _objectSpread({}, optionsAndCallback[0] || null);
        let insertedId;
        if (options && options.upsert) {
          // set `insertedId` if absent.  `insertedId` is a Meteor extension.
          if (options.insertedId) {
            if (!(typeof options.insertedId === 'string' || options.insertedId instanceof Mongo.ObjectID)) throw new Error('insertedId must be string or ObjectID');
            insertedId = options.insertedId;
          } else if (!selector || !selector._id) {
            insertedId = this._makeNewID();
            options.generatedId = true;
            options.insertedId = insertedId;
          }
        }
        selector = Mongo.Collection._rewriteSelector(selector, {
          fallbackId: insertedId
        });
        const wrappedCallback = wrapCallback(callback);
        if (this._isRemoteCollection()) {
          const args = [selector, modifier, options];
          return this._callMutatorMethod('update', args, callback);
        }

        // it's my collection.  descend into the collection object
        // and propagate any exception.
        // If the user provided a callback and the collection implements this
        // operation asynchronously, then queryRet will be undefined, and the
        // result will be returned through the callback instead.
        //console.log({callback, options, selector, modifier, coll: this._collection});
        try {
          // If the user provided a callback and the collection implements this
          // operation asynchronously, then queryRet will be undefined, and the
          // result will be returned through the callback instead.
          return this._collection.update(selector, modifier, options, wrappedCallback);
        } catch (e) {
          if (callback) {
            callback(e);
            return null;
          }
          throw e;
        }
      },
      /**
       * @summary Remove documents from the collection
       * @locus Anywhere
       * @method remove
       * @memberof Mongo.Collection
       * @instance
       * @param {MongoSelector} selector Specifies which documents to remove
       * @param {Function} [callback] Optional.  If present, called with an error object as the first argument and, if no error, the number of affected documents as the second.
       */
      remove(selector, callback) {
        selector = Mongo.Collection._rewriteSelector(selector);
        if (this._isRemoteCollection()) {
          return this._callMutatorMethod('remove', [selector], callback);
        }

        // it's my collection.  descend into the collection1 object
        // and propagate any exception.
        return this._collection.remove(selector);
      },
      /**
       * @summary Asynchronously modifies one or more documents in the collection, or insert one if no matching documents were found. Returns an object with keys `numberAffected` (the number of documents modified)  and `insertedId` (the unique _id of the document that was inserted, if any).
       * @locus Anywhere
       * @method upsert
       * @memberof Mongo.Collection
       * @instance
       * @param {MongoSelector} selector Specifies which documents to modify
       * @param {MongoModifier} modifier Specifies how to modify the documents
       * @param {Object} [options]
       * @param {Boolean} options.multi True to modify all matching documents; false to only modify one of the matching documents (the default).
       * @param {Function} [callback] Optional.  If present, called with an error object as the first argument and, if no error, the number of affected documents as the second.
       */
      upsert(selector, modifier, options, callback) {
        if (!callback && typeof options === 'function') {
          callback = options;
          options = {};
        }
        return this.update(selector, modifier, _objectSpread(_objectSpread({}, options), {}, {
          _returnObject: true,
          upsert: true
        }));
      }
    };
    // Convert the callback to not return a result if there is an error
    function wrapCallback(callback, convertResult) {
      return callback && function (error, result) {
        if (error) {
          callback(error);
        } else if (typeof convertResult === 'function') {
          callback(error, convertResult(result));
        } else {
          callback(error, result);
        }
      };
    }
    function popCallbackFromArgs(args) {
      // Pull off any callback (or perhaps a 'callback' variable that was passed
      // in undefined, like how 'upsert' does it).
      if (args.length && (args[args.length - 1] === undefined || args[args.length - 1] instanceof Function)) {
        return args.pop();
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

}},"connection_options.ts":function module(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/connection_options.ts                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/**
 * @summary Allows for user specified connection options
 * @example http://mongodb.github.io/node-mongodb-native/3.0/reference/connecting/connection-settings/
 * @locus Server
 * @param {Object} options User specified Mongo connection options
 */
Mongo.setConnectionOptions = function setConnectionOptions(options) {
  check(options, Object);
  Mongo._connectionOptions = options;
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"mongo_utils.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/mongo_utils.js                                                                                       //
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
    let _objectWithoutProperties;
    module.link("@babel/runtime/helpers/objectWithoutProperties", {
      default(v) {
        _objectWithoutProperties = v;
      }
    }, 1);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    const _excluded = ["fields", "projection"];
    module.export({
      normalizeProjection: () => normalizeProjection
    });
    const normalizeProjection = options => {
      // transform fields key in projection
      const _ref = options || {},
        {
          fields,
          projection
        } = _ref,
        otherOptions = _objectWithoutProperties(_ref, _excluded);
      // TODO: enable this comment when deprecating the fields option
      // Log.debug(`fields option has been deprecated, please use the new 'projection' instead`)

      return _objectSpread(_objectSpread({}, otherOptions), projection || fields ? {
        projection: fields || projection
      } : {});
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

},"observe_handle.ts":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mongo/observe_handle.ts                                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.export({
  ObserveHandle: () => ObserveHandle
});
let nextObserveHandleId = 1;
/**
 * The "observe handle" returned from observeChanges.
 * Contains a reference to an ObserveMultiplexer.
 * Used to stop observation and clean up resources.
 */
class ObserveHandle {
  constructor(multiplexer, callbacks, nonMutatingCallbacks) {
    this._id = void 0;
    this._multiplexer = void 0;
    this.nonMutatingCallbacks = void 0;
    this._stopped = void 0;
    this.initialAddsSentResolver = () => {};
    this.initialAddsSent = void 0;
    this._added = void 0;
    this._addedBefore = void 0;
    this._changed = void 0;
    this._movedBefore = void 0;
    this._removed = void 0;
    /**
     * Using property syntax and arrow function syntax to avoid binding the wrong context on callbacks.
     */
    this.stop = async () => {
      if (this._stopped) return;
      this._stopped = true;
      await this._multiplexer.removeHandle(this._id);
    };
    this._multiplexer = multiplexer;
    multiplexer.callbackNames().forEach(name => {
      if (callbacks[name]) {
        this["_".concat(name)] = callbacks[name];
        return;
      }
      if (name === "addedBefore" && callbacks.added) {
        this._addedBefore = async function (id, fields, before) {
          await callbacks.added(id, fields);
        };
      }
    });
    this._stopped = false;
    this._id = nextObserveHandleId++;
    this.nonMutatingCallbacks = nonMutatingCallbacks;
    this.initialAddsSent = new Promise(resolve => {
      const ready = () => {
        resolve();
        this.initialAddsSent = Promise.resolve();
      };
      const timeout = setTimeout(ready, 30000);
      this.initialAddsSentResolver = () => {
        ready();
        clearTimeout(timeout);
      };
    });
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"node_modules":{"lodash.isempty":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/mongo/node_modules/lodash.isempty/package.json                                                  //
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
// node_modules/meteor/mongo/node_modules/lodash.isempty/index.js                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"lodash.clone":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/mongo/node_modules/lodash.clone/package.json                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "lodash.clone",
  "version": "4.5.0"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/mongo/node_modules/lodash.clone/index.js                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"lodash.has":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/mongo/node_modules/lodash.has/package.json                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "lodash.has",
  "version": "4.5.2"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/mongo/node_modules/lodash.has/index.js                                                          //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"lodash.throttle":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/mongo/node_modules/lodash.throttle/package.json                                                 //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "lodash.throttle",
  "version": "4.1.1"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/mongo/node_modules/lodash.throttle/index.js                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"mongodb-uri":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/mongo/node_modules/mongodb-uri/package.json                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.exports = {
  "name": "mongodb-uri",
  "version": "0.9.7",
  "main": "mongodb-uri"
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"mongodb-uri.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/mongo/node_modules/mongodb-uri/mongodb-uri.js                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
module.useNode();
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"lodash.once":{"package.json":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// node_modules/meteor/mongo/node_modules/lodash.once/package.json                                                     //
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
// node_modules/meteor/mongo/node_modules/lodash.once/index.js                                                         //
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
      MongoInternals: MongoInternals,
      Mongo: Mongo,
      ObserveMultiplexer: ObserveMultiplexer
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/mongo/mongo_driver.js",
    "/node_modules/meteor/mongo/oplog_tailing.ts",
    "/node_modules/meteor/mongo/observe_multiplex.ts",
    "/node_modules/meteor/mongo/doc_fetcher.js",
    "/node_modules/meteor/mongo/polling_observe_driver.ts",
    "/node_modules/meteor/mongo/oplog_observe_driver.js",
    "/node_modules/meteor/mongo/oplog_v2_converter.ts",
    "/node_modules/meteor/mongo/cursor_description.ts",
    "/node_modules/meteor/mongo/mongo_connection.js",
    "/node_modules/meteor/mongo/mongo_common.js",
    "/node_modules/meteor/mongo/asynchronous_cursor.js",
    "/node_modules/meteor/mongo/cursor.ts",
    "/node_modules/meteor/mongo/local_collection_driver.js",
    "/node_modules/meteor/mongo/remote_collection_driver.ts",
    "/node_modules/meteor/mongo/collection/collection.js",
    "/node_modules/meteor/mongo/connection_options.ts"
  ]
}});

//# sourceURL=meteor://💻app/packages/mongo.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9uZ28vbW9uZ29fZHJpdmVyLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb25nby9vcGxvZ190YWlsaW5nLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb25nby9vYnNlcnZlX211bHRpcGxleC50cyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9uZ28vZG9jX2ZldGNoZXIuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbmdvL3BvbGxpbmdfb2JzZXJ2ZV9kcml2ZXIudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbmdvL29wbG9nX29ic2VydmVfZHJpdmVyLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb25nby9vcGxvZ192Ml9jb252ZXJ0ZXIudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbmdvL2N1cnNvcl9kZXNjcmlwdGlvbi50cyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9uZ28vbW9uZ29fY29ubmVjdGlvbi5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9uZ28vbW9uZ29fY29tbW9uLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb25nby9hc3luY2hyb25vdXNfY3Vyc29yLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb25nby9jdXJzb3IudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbmdvL2xvY2FsX2NvbGxlY3Rpb25fZHJpdmVyLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb25nby9yZW1vdGVfY29sbGVjdGlvbl9kcml2ZXIudHMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbmdvL2NvbGxlY3Rpb24vY29sbGVjdGlvbi5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9uZ28vY29sbGVjdGlvbi9jb2xsZWN0aW9uX3V0aWxzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb25nby9jb2xsZWN0aW9uL21ldGhvZHNfYXN5bmMuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL21vbmdvL2NvbGxlY3Rpb24vbWV0aG9kc19pbmRleC5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9uZ28vY29sbGVjdGlvbi9tZXRob2RzX3JlcGxpY2F0aW9uLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb25nby9jb2xsZWN0aW9uL21ldGhvZHNfc3luYy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9uZ28vY29ubmVjdGlvbl9vcHRpb25zLnRzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9tb25nby9tb25nb191dGlscy5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbW9uZ28vb2JzZXJ2ZV9oYW5kbGUudHMiXSwibmFtZXMiOlsibW9kdWxlMSIsImV4cG9ydCIsImxpc3RlbkFsbCIsImZvckVhY2hUcmlnZ2VyIiwiT3Bsb2dIYW5kbGUiLCJsaW5rIiwidiIsIk1vbmdvQ29ubmVjdGlvbiIsIk9wbG9nT2JzZXJ2ZURyaXZlciIsIk1vbmdvREIiLCJfX3JlaWZ5V2FpdEZvckRlcHNfXyIsIk1vbmdvSW50ZXJuYWxzIiwiZ2xvYmFsIiwiX19wYWNrYWdlTmFtZSIsIk5wbU1vZHVsZXMiLCJtb25nb2RiIiwidmVyc2lvbiIsIk5wbU1vZHVsZU1vbmdvZGJWZXJzaW9uIiwibW9kdWxlIiwiTnBtTW9kdWxlIiwiUHJveHkiLCJnZXQiLCJ0YXJnZXQiLCJwcm9wZXJ0eUtleSIsInJlY2VpdmVyIiwiTWV0ZW9yIiwiZGVwcmVjYXRlIiwiUmVmbGVjdCIsIkNvbm5lY3Rpb24iLCJUaW1lc3RhbXAiLCJwcm90b3R5cGUiLCJjbG9uZSIsImN1cnNvckRlc2NyaXB0aW9uIiwibGlzdGVuQ2FsbGJhY2siLCJsaXN0ZW5lcnMiLCJ0cmlnZ2VyIiwicHVzaCIsIkREUFNlcnZlciIsIl9JbnZhbGlkYXRpb25Dcm9zc2JhciIsImxpc3RlbiIsInN0b3AiLCJmb3JFYWNoIiwibGlzdGVuZXIiLCJ0cmlnZ2VyQ2FsbGJhY2siLCJrZXkiLCJjb2xsZWN0aW9uIiwiY29sbGVjdGlvbk5hbWUiLCJzcGVjaWZpY0lkcyIsIkxvY2FsQ29sbGVjdGlvbiIsIl9pZHNNYXRjaGVkQnlTZWxlY3RvciIsInNlbGVjdG9yIiwiaWQiLCJPYmplY3QiLCJhc3NpZ24iLCJkcm9wQ29sbGVjdGlvbiIsImRyb3BEYXRhYmFzZSIsIk1vbmdvVGltZXN0YW1wIiwiX19yZWlmeV9hc3luY19yZXN1bHRfXyIsIl9yZWlmeUVycm9yIiwic2VsZiIsImFzeW5jIiwiX29iamVjdFNwcmVhZCIsImRlZmF1bHQiLCJPUExPR19DT0xMRUNUSU9OIiwiaWRGb3JPcCIsImlzRW1wdHkiLCJDdXJzb3JEZXNjcmlwdGlvbiIsIk5wbU1vZHVsZU1vbmdvZGIiLCJMb25nIiwiVE9PX0ZBUl9CRUhJTkQiLCJwcm9jZXNzIiwiZW52IiwiTUVURU9SX09QTE9HX1RPT19GQVJfQkVISU5EIiwiVEFJTF9USU1FT1VUIiwiTUVURU9SX09QTE9HX1RBSUxfVElNRU9VVCIsImNvbnN0cnVjdG9yIiwib3Bsb2dVcmwiLCJkYk5hbWUiLCJfb3Bsb2dVcmwiLCJfZGJOYW1lIiwiX29wbG9nTGFzdEVudHJ5Q29ubmVjdGlvbiIsIl9vcGxvZ1RhaWxDb25uZWN0aW9uIiwiX29wbG9nT3B0aW9ucyIsIl9zdG9wcGVkIiwiX3RhaWxIYW5kbGUiLCJfcmVhZHlQcm9taXNlUmVzb2x2ZXIiLCJfcmVhZHlQcm9taXNlIiwiX2Nyb3NzYmFyIiwiX2Jhc2VPcGxvZ1NlbGVjdG9yIiwiX2NhdGNoaW5nVXBSZXNvbHZlcnMiLCJfbGFzdFByb2Nlc3NlZFRTIiwiX29uU2tpcHBlZEVudHJpZXNIb29rIiwiX3N0YXJ0VHJhaWxpbmdQcm9taXNlIiwiX3Jlc29sdmVUaW1lb3V0IiwiX2VudHJ5UXVldWUiLCJfRG91YmxlRW5kZWRRdWV1ZSIsIl93b3JrZXJBY3RpdmUiLCJfd29ya2VyUHJvbWlzZSIsIlByb21pc2UiLCJyIiwiX0Nyb3NzYmFyIiwiZmFjdFBhY2thZ2UiLCJmYWN0TmFtZSIsIm5zIiwiUmVnRXhwIiwiX2VzY2FwZVJlZ0V4cCIsImpvaW4iLCIkb3IiLCJvcCIsIiRpbiIsIiRleGlzdHMiLCJIb29rIiwiZGVidWdQcmludEV4Y2VwdGlvbnMiLCJfc3RhcnRUYWlsaW5nIiwiX29uT3Bsb2dFbnRyeSIsImNhbGxiYWNrIiwiRXJyb3IiLCJvcmlnaW5hbENhbGxiYWNrIiwiYmluZEVudmlyb25tZW50Iiwibm90aWZpY2F0aW9uIiwiZXJyIiwiX2RlYnVnIiwibGlzdGVuSGFuZGxlIiwib25PcGxvZ0VudHJ5Iiwib25Ta2lwcGVkRW50cmllcyIsInJlZ2lzdGVyIiwiX3dhaXRVbnRpbENhdWdodFVwIiwibGFzdEVudHJ5IiwiZmluZE9uZUFzeW5jIiwicHJvamVjdGlvbiIsInRzIiwic29ydCIsIiRuYXR1cmFsIiwiZSIsInNsZWVwIiwiSlNPTiIsInN0cmluZ2lmeSIsImxlc3NUaGFuT3JFcXVhbCIsImluc2VydEFmdGVyIiwibGVuZ3RoIiwiZ3JlYXRlclRoYW4iLCJwcm9taXNlUmVzb2x2ZXIiLCJwcm9taXNlVG9Bd2FpdCIsImNsZWFyVGltZW91dCIsInNldFRpbWVvdXQiLCJjb25zb2xlIiwiZXJyb3IiLCJzcGxpY2UiLCJyZXNvbHZlciIsIndhaXRVbnRpbENhdWdodFVwIiwibW9uZ29kYlVyaSIsInJlcXVpcmUiLCJwYXJzZSIsImRhdGFiYXNlIiwibWF4UG9vbFNpemUiLCJtaW5Qb29sU2l6ZSIsIl9NZXRlb3Ikc2V0dGluZ3MiLCJfTWV0ZW9yJHNldHRpbmdzJHBhY2siLCJfTWV0ZW9yJHNldHRpbmdzJHBhY2syIiwiX01ldGVvciRzZXR0aW5nczIiLCJfTWV0ZW9yJHNldHRpbmdzMiRwYWMiLCJfTWV0ZW9yJHNldHRpbmdzMiRwYWMyIiwiaXNNYXN0ZXJEb2MiLCJkYiIsImFkbWluIiwiY29tbWFuZCIsImlzbWFzdGVyIiwic2V0TmFtZSIsImxhc3RPcGxvZ0VudHJ5Iiwib3Bsb2dTZWxlY3RvciIsIiRndCIsImluY2x1ZGVDb2xsZWN0aW9ucyIsInNldHRpbmdzIiwicGFja2FnZXMiLCJtb25nbyIsIm9wbG9nSW5jbHVkZUNvbGxlY3Rpb25zIiwiZXhjbHVkZUNvbGxlY3Rpb25zIiwib3Bsb2dFeGNsdWRlQ29sbGVjdGlvbnMiLCIkcmVnZXgiLCIkbmluIiwibWFwIiwiY29sbE5hbWUiLCJjb25jYXQiLCIkYW5kIiwidGFpbGFibGUiLCJ0YWlsIiwiZG9jIiwiX21heWJlU3RhcnRXb3JrZXIiLCJwb3AiLCJjbGVhciIsImVhY2giLCJfc2V0TGFzdFByb2Nlc3NlZFRTIiwic2hpZnQiLCJoYW5kbGVEb2MiLCJzZXF1ZW5jZXIiLCJfZGVmaW5lVG9vRmFyQmVoaW5kIiwidmFsdWUiLCJfcmVzZXRUb29GYXJCZWhpbmQiLCJvIiwiX2lkIiwibzIiLCJoYW5kbGUiLCJhcHBseU9wcyIsIm5leHRUaW1lc3RhbXAiLCJhZGQiLCJPTkUiLCJzdGFydHNXaXRoIiwic2xpY2UiLCJkcm9wIiwiZmlyZSIsInJlc29sdmUiLCJzZXRJbW1lZGlhdGUiLCJfb2JqZWN0V2l0aG91dFByb3BlcnRpZXMiLCJfZXhjbHVkZWQiLCJPYnNlcnZlTXVsdGlwbGV4ZXIiLCJfcmVmIiwiX3RoaXMiLCJvcmRlcmVkIiwib25TdG9wIiwiX29yZGVyZWQiLCJfb25TdG9wIiwiX3F1ZXVlIiwiX2hhbmRsZXMiLCJfcmVzb2x2ZXIiLCJfaXNSZWFkeSIsIl9jYWNoZSIsIl9hZGRIYW5kbGVUYXNrc1NjaGVkdWxlZEJ1dE5vdFBlcmZvcm1lZCIsInVuZGVmaW5lZCIsIlBhY2thZ2UiLCJGYWN0cyIsImluY3JlbWVudFNlcnZlckZhY3QiLCJfQXN5bmNocm9ub3VzUXVldWUiLCJ0aGVuIiwiX0NhY2hpbmdDaGFuZ2VPYnNlcnZlciIsImNhbGxiYWNrTmFtZXMiLCJjYWxsYmFja05hbWUiLCJfbGVuIiwiYXJndW1lbnRzIiwiYXJncyIsIkFycmF5IiwiX2tleSIsIl9hcHBseUNhbGxiYWNrIiwiYWRkSGFuZGxlQW5kU2VuZEluaXRpYWxBZGRzIiwiX2FkZEhhbmRsZUFuZFNlbmRJbml0aWFsQWRkcyIsInJ1blRhc2siLCJfc2VuZEFkZHMiLCJyZW1vdmVIYW5kbGUiLCJfcmVhZHkiLCJfc3RvcCIsIm9wdGlvbnMiLCJmcm9tUXVlcnlFcnJvciIsInJlYWR5IiwicXVldWVUYXNrIiwicXVlcnlFcnJvciIsIm9uRmx1c2giLCJjYiIsImFwcGx5Q2hhbmdlIiwiYXBwbHkiLCJoYW5kbGVJZCIsImtleXMiLCJpbml0aWFsQWRkc1NlbnQiLCJub25NdXRhdGluZ0NhbGxiYWNrcyIsIkVKU09OIiwiX2FkZGVkQmVmb3JlIiwiX2FkZGVkIiwiYWRkUHJvbWlzZXMiLCJkb2NzIiwiX3JlZjIiLCJmaWVsZHMiLCJwcm9taXNlIiwiYWxsIiwiaW5pdGlhbEFkZHNTZW50UmVzb2x2ZXIiLCJEb2NGZXRjaGVyIiwibW9uZ29Db25uZWN0aW9uIiwiX21vbmdvQ29ubmVjdGlvbiIsIl9jYWxsYmFja3NGb3JPcCIsIk1hcCIsImZldGNoIiwiY2hlY2siLCJTdHJpbmciLCJoYXMiLCJjYWxsYmFja3MiLCJzZXQiLCJkZWxldGUiLCJQb2xsaW5nT2JzZXJ2ZURyaXZlciIsInRocm90dGxlIiwiUE9MTElOR19USFJPVFRMRV9NUyIsIk1FVEVPUl9QT0xMSU5HX1RIUk9UVExFX01TIiwiUE9MTElOR19JTlRFUlZBTF9NUyIsIk1FVEVPUl9QT0xMSU5HX0lOVEVSVkFMX01TIiwiX29wdGlvbnMiLCJfY3Vyc29yRGVzY3JpcHRpb24iLCJfbW9uZ29IYW5kbGUiLCJfbXVsdGlwbGV4ZXIiLCJfc3RvcENhbGxiYWNrcyIsIl9jdXJzb3IiLCJfcmVzdWx0cyIsIl9wb2xsc1NjaGVkdWxlZEJ1dE5vdFN0YXJ0ZWQiLCJfcGVuZGluZ1dyaXRlcyIsIl9lbnN1cmVQb2xsSXNTY2hlZHVsZWQiLCJfdGFza1F1ZXVlIiwiX3Rlc3RPbmx5UG9sbENhbGxiYWNrIiwibW9uZ29IYW5kbGUiLCJtdWx0aXBsZXhlciIsIl9jcmVhdGVBc3luY2hyb25vdXNDdXJzb3IiLCJfdW50aHJvdHRsZWRFbnN1cmVQb2xsSXNTY2hlZHVsZWQiLCJiaW5kIiwicG9sbGluZ1Rocm90dGxlTXMiLCJfaW5pdCIsIl9QYWNrYWdlJGZhY3RzQmFzZSIsImxpc3RlbmVyc0hhbmRsZSIsImZlbmNlIiwiX2dldEN1cnJlbnRGZW5jZSIsImJlZ2luV3JpdGUiLCJwb2xsaW5nSW50ZXJ2YWwiLCJwb2xsaW5nSW50ZXJ2YWxNcyIsIl9wb2xsaW5nSW50ZXJ2YWwiLCJpbnRlcnZhbEhhbmRsZSIsInNldEludGVydmFsIiwiY2xlYXJJbnRlcnZhbCIsIl9wb2xsTW9uZ28iLCJfc3VzcGVuZFBvbGxpbmciLCJfcmVzdW1lUG9sbGluZyIsIl90aGlzJF90ZXN0T25seVBvbGxDYSIsImZpcnN0IiwibmV3UmVzdWx0cyIsIm9sZFJlc3VsdHMiLCJfSWRNYXAiLCJjYWxsIiwid3JpdGVzRm9yQ3ljbGUiLCJnZXRSYXdPYmplY3RzIiwiY29kZSIsIm1lc3NhZ2UiLCJfZGlmZlF1ZXJ5Q2hhbmdlcyIsInciLCJjb21taXR0ZWQiLCJfUGFja2FnZSRmYWN0c0Jhc2UyIiwiX2FzeW5jSXRlcmF0b3IiLCJvcGxvZ1YyVjFDb252ZXJ0ZXIiLCJNYXRjaCIsIkN1cnNvciIsIlBIQVNFIiwiUVVFUllJTkciLCJGRVRDSElORyIsIlNURUFEWSIsIlN3aXRjaGVkVG9RdWVyeSIsImZpbmlzaElmTmVlZFRvUG9sbFF1ZXJ5IiwiZiIsImN1cnJlbnRJZCIsIl91c2VzT3Bsb2ciLCJzb3J0ZXIiLCJjb21wYXJhdG9yIiwiZ2V0Q29tcGFyYXRvciIsImxpbWl0IiwiaGVhcE9wdGlvbnMiLCJJZE1hcCIsIl9saW1pdCIsIl9jb21wYXJhdG9yIiwiX3NvcnRlciIsIl91bnB1Ymxpc2hlZEJ1ZmZlciIsIk1pbk1heEhlYXAiLCJfcHVibGlzaGVkIiwiTWF4SGVhcCIsIl9zYWZlQXBwZW5kVG9CdWZmZXIiLCJfc3RvcEhhbmRsZXMiLCJfYWRkU3RvcEhhbmRsZXMiLCJuZXdTdG9wSGFuZGxlcyIsImV4cGVjdGVkUGF0dGVybiIsIk9iamVjdEluY2x1ZGluZyIsIkZ1bmN0aW9uIiwiT25lT2YiLCJfcmVnaXN0ZXJQaGFzZUNoYW5nZSIsIl9tYXRjaGVyIiwibWF0Y2hlciIsIl9wcm9qZWN0aW9uRm4iLCJfY29tcGlsZVByb2plY3Rpb24iLCJfc2hhcmVkUHJvamVjdGlvbiIsImNvbWJpbmVJbnRvUHJvamVjdGlvbiIsIl9zaGFyZWRQcm9qZWN0aW9uRm4iLCJfbmVlZFRvRmV0Y2giLCJfY3VycmVudGx5RmV0Y2hpbmciLCJfZmV0Y2hHZW5lcmF0aW9uIiwiX3JlcXVlcnlXaGVuRG9uZVRoaXNRdWVyeSIsIl93cml0ZXNUb0NvbW1pdFdoZW5XZVJlYWNoU3RlYWR5IiwiX29wbG9nSGFuZGxlIiwiX25lZWRUb1BvbGxRdWVyeSIsIl9waGFzZSIsIl9oYW5kbGVPcGxvZ0VudHJ5UXVlcnlpbmciLCJfaGFuZGxlT3Bsb2dFbnRyeVN0ZWFkeU9yRmV0Y2hpbmciLCJmaXJlZCIsIl9vcGxvZ09ic2VydmVEcml2ZXJzIiwib25CZWZvcmVGaXJlIiwiZHJpdmVycyIsImRyaXZlciIsInZhbHVlcyIsIndyaXRlIiwiX29uRmFpbG92ZXIiLCJfcnVuSW5pdGlhbFF1ZXJ5IiwiX2FkZFB1Ymxpc2hlZCIsIl9ub1lpZWxkc0FsbG93ZWQiLCJhZGRlZCIsInNpemUiLCJvdmVyZmxvd2luZ0RvY0lkIiwibWF4RWxlbWVudElkIiwib3ZlcmZsb3dpbmdEb2MiLCJlcXVhbHMiLCJyZW1vdmUiLCJyZW1vdmVkIiwiX2FkZEJ1ZmZlcmVkIiwiX3JlbW92ZVB1Ymxpc2hlZCIsImVtcHR5IiwibmV3RG9jSWQiLCJtaW5FbGVtZW50SWQiLCJuZXdEb2MiLCJfcmVtb3ZlQnVmZmVyZWQiLCJfY2hhbmdlUHVibGlzaGVkIiwib2xkRG9jIiwicHJvamVjdGVkTmV3IiwicHJvamVjdGVkT2xkIiwiY2hhbmdlZCIsIkRpZmZTZXF1ZW5jZSIsIm1ha2VDaGFuZ2VkRmllbGRzIiwibWF4QnVmZmVyZWRJZCIsIl9hZGRNYXRjaGluZyIsIm1heFB1Ymxpc2hlZCIsIm1heEJ1ZmZlcmVkIiwidG9QdWJsaXNoIiwiY2FuQXBwZW5kVG9CdWZmZXIiLCJjYW5JbnNlcnRJbnRvQnVmZmVyIiwidG9CdWZmZXIiLCJfcmVtb3ZlTWF0Y2hpbmciLCJfaGFuZGxlRG9jIiwibWF0Y2hlc05vdyIsImRvY3VtZW50TWF0Y2hlcyIsInJlc3VsdCIsInB1Ymxpc2hlZEJlZm9yZSIsImJ1ZmZlcmVkQmVmb3JlIiwiY2FjaGVkQmVmb3JlIiwibWluQnVmZmVyZWQiLCJzdGF5c0luUHVibGlzaGVkIiwic3RheXNJbkJ1ZmZlciIsIl9mZXRjaE1vZGlmaWVkRG9jdW1lbnRzIiwiZGVmZXIiLCJ0aGlzR2VuZXJhdGlvbiIsImZldGNoUHJvbWlzZXMiLCJmZXRjaFByb21pc2UiLCJyZWplY3QiLCJfZG9jRmV0Y2hlciIsInJlc3VsdHMiLCJhbGxTZXR0bGVkIiwiZXJyb3JzIiwiZmlsdGVyIiwic3RhdHVzIiwicmVhc29uIiwiX2JlU3RlYWR5Iiwid3JpdGVzIiwiaXNSZXBsYWNlIiwiY2FuRGlyZWN0bHlNb2RpZnlEb2MiLCJtb2RpZmllckNhbkJlRGlyZWN0bHlBcHBsaWVkIiwiX21vZGlmeSIsIm5hbWUiLCJjYW5CZWNvbWVUcnVlQnlNb2RpZmllciIsImFmZmVjdGVkQnlNb2RpZmllciIsIl9ydW5Jbml0aWFsUXVlcnlBc3luYyIsIl9ydW5RdWVyeSIsImluaXRpYWwiLCJfZG9uZVF1ZXJ5aW5nIiwiX3BvbGxRdWVyeSIsIl9ydW5RdWVyeUFzeW5jIiwibmV3QnVmZmVyIiwiY3Vyc29yIiwiX2N1cnNvckZvclF1ZXJ5IiwiaSIsIl9zbGVlcEZvck1zIiwiX3B1Ymxpc2hOZXdSZXN1bHRzIiwib3B0aW9uc092ZXJ3cml0ZSIsInRyYW5zZm9ybSIsImRlc2NyaXB0aW9uIiwiaWRzVG9SZW1vdmUiLCJfb3Bsb2dFbnRyeUhhbmRsZSIsIl9saXN0ZW5lcnNIYW5kbGUiLCJfaXRlcmF0b3JBYnJ1cHRDb21wbGV0aW9uIiwiX2RpZEl0ZXJhdG9yRXJyb3IiLCJfaXRlcmF0b3JFcnJvciIsIl9pdGVyYXRvciIsIl9zdGVwIiwibmV4dCIsImRvbmUiLCJyZXR1cm4iLCJwaGFzZSIsIm5vdyIsIkRhdGUiLCJ0aW1lRGlmZiIsIl9waGFzZVN0YXJ0VGltZSIsImN1cnNvclN1cHBvcnRlZCIsImRpc2FibGVPcGxvZyIsIl9kaXNhYmxlT3Bsb2ciLCJza2lwIiwiX2NoZWNrU3VwcG9ydGVkUHJvamVjdGlvbiIsImhhc1doZXJlIiwiaGFzR2VvUXVlcnkiLCJtb2RpZmllciIsImVudHJpZXMiLCJldmVyeSIsIm9wZXJhdGlvbiIsImZpZWxkIiwidGVzdCIsImFycmF5T3BlcmF0b3JLZXlSZWdleCIsImlzQXJyYXlPcGVyYXRvcktleSIsImlzQXJyYXlPcGVyYXRvciIsIm9wZXJhdG9yIiwiYSIsInByZWZpeCIsImZsYXR0ZW5PYmplY3RJbnRvIiwic291cmNlIiwiaXNBcnJheSIsIk1vbmdvIiwiT2JqZWN0SUQiLCJfaXNDdXN0b21UeXBlIiwiY29udmVydE9wbG9nRGlmZiIsIm9wbG9nRW50cnkiLCJkaWZmIiwiZGlmZktleSIsIl9vcGxvZ0VudHJ5JCR1bnNldCIsIiR1bnNldCIsIl9vcGxvZ0VudHJ5JCRzZXQiLCIkc2V0IiwiX29wbG9nRW50cnkkJHNldDIiLCJfcmVmMyIsImZpZWxkVmFsdWUiLCJfcmVmNCIsInBvc2l0aW9uIiwicG9zaXRpb25LZXkiLCJfb3Bsb2dFbnRyeSQkdW5zZXQyIiwiX29wbG9nRW50cnkkJHNldDMiLCIkdiIsImNvbnZlcnRlZE9wbG9nRW50cnkiLCJDb2xsZWN0aW9uIiwiX3Jld3JpdGVTZWxlY3RvciIsIkNMSUVOVF9PTkxZX01FVEhPRFMiLCJnZXRBc3luY01ldGhvZE5hbWUiLCJwYXRoIiwiQXN5bmNocm9ub3VzQ3Vyc29yIiwicmVwbGFjZU1ldGVvckF0b21XaXRoTW9uZ28iLCJyZXBsYWNlVHlwZXMiLCJ0cmFuc2Zvcm1SZXN1bHQiLCJPYnNlcnZlSGFuZGxlIiwiRklMRV9BU1NFVF9TVUZGSVgiLCJBU1NFVFNfRk9MREVSIiwiQVBQX0ZPTERFUiIsIm9wbG9nQ29sbGVjdGlvbldhcm5pbmdzIiwidXJsIiwiX29ic2VydmVNdWx0aXBsZXhlcnMiLCJfb25GYWlsb3Zlckhvb2siLCJ1c2VyT3B0aW9ucyIsIl9jb25uZWN0aW9uT3B0aW9ucyIsIm1vbmdvT3B0aW9ucyIsImlnbm9yZVVuZGVmaW5lZCIsImVuZHNXaXRoIiwib3B0aW9uTmFtZSIsInJlcGxhY2UiLCJBc3NldHMiLCJnZXRTZXJ2ZXJEaXIiLCJkcml2ZXJJbmZvIiwicmVsZWFzZSIsImNsaWVudCIsIk1vbmdvQ2xpZW50Iiwib24iLCJldmVudCIsInByZXZpb3VzRGVzY3JpcHRpb24iLCJ0eXBlIiwibmV3RGVzY3JpcHRpb24iLCJkYXRhYmFzZU5hbWUiLCJfY2xvc2UiLCJvcGxvZ0hhbmRsZSIsImNsb3NlIiwiX3NldE9wbG9nSGFuZGxlIiwicmF3Q29sbGVjdGlvbiIsImNyZWF0ZUNhcHBlZENvbGxlY3Rpb25Bc3luYyIsImJ5dGVTaXplIiwibWF4RG9jdW1lbnRzIiwiY3JlYXRlQ29sbGVjdGlvbiIsImNhcHBlZCIsIm1heCIsIl9tYXliZUJlZ2luV3JpdGUiLCJpbnNlcnRBc3luYyIsImNvbGxlY3Rpb25fbmFtZSIsImRvY3VtZW50IiwiX2V4cGVjdGVkQnlUZXN0IiwiX2lzUGxhaW5PYmplY3QiLCJyZWZyZXNoIiwiaW5zZXJ0T25lIiwic2FmZSIsImluc2VydGVkSWQiLCJjYXRjaCIsIl9yZWZyZXNoIiwicmVmcmVzaEtleSIsInJlbW92ZUFzeW5jIiwiZGVsZXRlTWFueSIsImRlbGV0ZWRDb3VudCIsIm1vZGlmaWVkQ291bnQiLCJudW1iZXJBZmZlY3RlZCIsImRyb3BDb2xsZWN0aW9uQXN5bmMiLCJkcm9wRGF0YWJhc2VBc3luYyIsIl9kcm9wRGF0YWJhc2UiLCJ1cGRhdGVBc3luYyIsIm1vZCIsIm1vbmdvT3B0cyIsImFycmF5RmlsdGVycyIsInVwc2VydCIsIm11bHRpIiwiZnVsbFJlc3VsdCIsIm1vbmdvU2VsZWN0b3IiLCJtb25nb01vZCIsImlzTW9kaWZ5IiwiX2lzTW9kaWZpY2F0aW9uTW9kIiwiX2ZvcmJpZFJlcGxhY2UiLCJrbm93bklkIiwiX2NyZWF0ZVVwc2VydERvY3VtZW50IiwiZ2VuZXJhdGVkSWQiLCJzaW11bGF0ZVVwc2VydFdpdGhJbnNlcnRlZElkIiwiX3JldHVybk9iamVjdCIsImhhc093blByb3BlcnR5IiwiJHNldE9uSW5zZXJ0Iiwic3RyaW5ncyIsInVwZGF0ZU1ldGhvZCIsIm1ldGVvclJlc3VsdCIsIk9iamVjdElkIiwidG9IZXhTdHJpbmciLCJfaXNDYW5ub3RDaGFuZ2VJZEVycm9yIiwiZXJybXNnIiwiaW5kZXhPZiIsInVwc2VydEFzeW5jIiwiZmluZCIsImNyZWF0ZUluZGV4QXN5bmMiLCJpbmRleCIsImNyZWF0ZUluZGV4IiwiY291bnREb2N1bWVudHMiLCJhcmciLCJlc3RpbWF0ZWREb2N1bWVudENvdW50IiwiX2xlbjIiLCJfa2V5MiIsImVuc3VyZUluZGV4QXN5bmMiLCJkcm9wSW5kZXhBc3luYyIsImluZGV4TmFtZSIsImRyb3BJbmRleCIsIm0iLCJOVU1fT1BUSU1JU1RJQ19UUklFUyIsIm1vbmdvT3B0c0ZvclVwZGF0ZSIsIm1vbmdvT3B0c0Zvckluc2VydCIsInJlcGxhY2VtZW50V2l0aElkIiwidHJpZXMiLCJkb1VwZGF0ZSIsIm1ldGhvZCIsInVwZGF0ZU1hbnkiLCJzb21lIiwicmVwbGFjZU9uZSIsInVwc2VydGVkQ291bnQiLCJ1cHNlcnRlZElkIiwiZG9Db25kaXRpb25hbEluc2VydCIsIl9vYnNlcnZlQ2hhbmdlc1RhaWxhYmxlIiwiYWRkZWRCZWZvcmUiLCJzZWxmRm9ySXRlcmF0aW9uIiwidXNlVHJhbnNmb3JtIiwiY3Vyc29yT3B0aW9ucyIsInJlYWRQcmVmZXJlbmNlIiwibnVtYmVyT2ZSZXRyaWVzIiwiZGJDdXJzb3IiLCJhZGRDdXJzb3JGbGFnIiwibWF4VGltZU1zIiwibWF4VGltZU1TIiwiaGludCIsImRvY0NhbGxiYWNrIiwidGltZW91dE1TIiwic3RvcHBlZCIsImxhc3RUUyIsImxvb3AiLCJfbmV4dE9iamVjdFByb21pc2VXaXRoVGltZW91dCIsIm5ld1NlbGVjdG9yIiwiX29ic2VydmVDaGFuZ2VzIiwiX3NlbGYkX29wbG9nSGFuZGxlIiwiZmllbGRzT3B0aW9ucyIsIm9ic2VydmVLZXkiLCJvYnNlcnZlRHJpdmVyIiwiZmlyc3RIYW5kbGUiLCJvYnNlcnZlSGFuZGxlIiwib3Bsb2dPcHRpb25zIiwiY2FuVXNlT3Bsb2ciLCJpbmNsdWRlcyIsIndhcm4iLCJNaW5pbW9uZ28iLCJNYXRjaGVyIiwiU29ydGVyIiwiZHJpdmVyQ2xhc3MiLCJfb2JzZXJ2ZURyaXZlciIsIndyaXRlQ2FsbGJhY2siLCJyZXBsYWNlTW9uZ29BdG9tV2l0aE1ldGVvciIsInJlcGxhY2VOYW1lcyIsInJlZnJlc2hFcnIiLCJkcml2ZXJSZXN1bHQiLCJtb25nb1Jlc3VsdCIsIm4iLCJtYXRjaGVkQ291bnQiLCJpc0JpbmFyeSIsIkJpbmFyeSIsIkJ1ZmZlciIsImZyb20iLCJEZWNpbWFsIiwiRGVjaW1hbDEyOCIsImZyb21TdHJpbmciLCJ0b1N0cmluZyIsIm1ha2VNb25nb0xlZ2FsIiwidG9KU09OVmFsdWUiLCJhdG9tVHJhbnNmb3JtZXIiLCJyZXBsYWNlZFRvcExldmVsQXRvbSIsInJldCIsInZhbCIsInZhbFJlcGxhY2VkIiwic3ViX3R5cGUiLCJidWZmZXIiLCJVaW50OEFycmF5IiwiZnJvbUpTT05WYWx1ZSIsInVubWFrZU1vbmdvTGVnYWwiLCJzdWJzdHIiLCJ0aGluZyIsIl9kYkN1cnNvciIsIl9zZWxmRm9ySXRlcmF0aW9uIiwiX3RyYW5zZm9ybSIsIndyYXBUcmFuc2Zvcm0iLCJfdmlzaXRlZElkcyIsIlN5bWJvbCIsImFzeW5jSXRlcmF0b3IiLCJfbmV4dE9iamVjdFByb21pc2UiLCJfcmF3TmV4dE9iamVjdFByb21pc2UiLCJuZXh0T2JqZWN0UHJvbWlzZSIsInRpbWVvdXRFcnIiLCJ0aW1lb3V0UHJvbWlzZSIsInJhY2UiLCJ0aGlzQXJnIiwiX3Jld2luZCIsImlkeCIsInJld2luZCIsImNvdW50IiwiQVNZTkNfQ1VSU09SX01FVEhPRFMiLCJfbW9uZ28iLCJfc3luY2hyb25vdXNDdXJzb3IiLCJjb3VudEFzeW5jIiwiZ2V0VHJhbnNmb3JtIiwiX3B1Ymxpc2hDdXJzb3IiLCJzdWIiLCJfZ2V0Q29sbGVjdGlvbk5hbWUiLCJvYnNlcnZlIiwiX29ic2VydmVGcm9tT2JzZXJ2ZUNoYW5nZXMiLCJvYnNlcnZlQXN5bmMiLCJvYnNlcnZlQ2hhbmdlcyIsIl9vYnNlcnZlQ2hhbmdlc0NhbGxiYWNrc0FyZU9yZGVyZWQiLCJvYnNlcnZlQ2hhbmdlc0FzeW5jIiwiaXRlcmF0b3IiLCJtZXRob2ROYW1lIiwic2V0dXBBc3luY2hyb25vdXNDdXJzb3IiLCJtZXRob2ROYW1lQXN5bmMiLCJMb2NhbENvbGxlY3Rpb25Ecml2ZXIiLCJub0Nvbm5Db2xsZWN0aW9ucyIsImNyZWF0ZSIsIm9wZW4iLCJjb25uIiwiZW5zdXJlQ29sbGVjdGlvbiIsIl9tb25nb19saXZlZGF0YV9jb2xsZWN0aW9ucyIsImNvbGxlY3Rpb25zIiwiUmVtb3RlQ29sbGVjdGlvbkRyaXZlciIsIm9uY2UiLCJBU1lOQ19DT0xMRUNUSU9OX01FVEhPRFMiLCJtb25nb1VybCIsIlJFTU9URV9DT0xMRUNUSU9OX01FVEhPRFMiLCJtb25nb01ldGhvZCIsImFzeW5jTWV0aG9kTmFtZSIsImRlZmF1bHRSZW1vdGVDb2xsZWN0aW9uRHJpdmVyIiwiY29ubmVjdGlvbk9wdGlvbnMiLCJNT05HT19VUkwiLCJNT05HT19PUExPR19VUkwiLCJzdGFydHVwIiwiY29ubmVjdCIsIm5vcm1hbGl6ZVByb2plY3Rpb24iLCJBc3luY01ldGhvZHMiLCJTeW5jTWV0aG9kcyIsIkluZGV4TWV0aG9kcyIsIklEX0dFTkVSQVRPUlMiLCJub3JtYWxpemVPcHRpb25zIiwic2V0dXBBdXRvcHVibGlzaCIsInNldHVwQ29ubmVjdGlvbiIsInNldHVwRHJpdmVyIiwic2V0dXBNdXRhdGlvbk1ldGhvZHMiLCJ2YWxpZGF0ZUNvbGxlY3Rpb25OYW1lIiwiUmVwbGljYXRpb25NZXRob2RzIiwiX0lEX0dFTkVSQVRPUlMkb3B0aW9uIiwiX0lEX0dFTkVSQVRPUlMiLCJfbWFrZU5ld0lEIiwiaWRHZW5lcmF0aW9uIiwicmVzb2x2ZXJUeXBlIiwiX2Nvbm5lY3Rpb24iLCJfZHJpdmVyIiwiX2NvbGxlY3Rpb24iLCJfbmFtZSIsIl9zZXR0aW5nVXBSZXBsaWNhdGlvblByb21pc2UiLCJfbWF5YmVTZXRVcFJlcGxpY2F0aW9uIiwiX2NvbGxlY3Rpb25zIiwiX2dldEZpbmRTZWxlY3RvciIsIl9nZXRGaW5kT3B0aW9ucyIsIm5ld09wdGlvbnMiLCJPcHRpb25hbCIsIk51bWJlciIsImZhbGxiYWNrSWQiLCJfc2VsZWN0b3JJc0lkIiwiUmFuZG9tIiwiX2lzUmVtb3RlQ29sbGVjdGlvbiIsInNlcnZlciIsInJhd0RhdGFiYXNlIiwiZ2V0Q29sbGVjdGlvbiIsIk1vbmdvSUQiLCJBbGxvd0RlbnkiLCJDb2xsZWN0aW9uUHJvdG90eXBlIiwiTU9OR08iLCJzcmMiLCJERFAiLCJyYW5kb21TdHJlYW0iLCJpbnNlY3VyZSIsImhleFN0cmluZyIsIlNUUklORyIsImNvbm5lY3Rpb24iLCJpc0NsaWVudCIsImF1dG9wdWJsaXNoIiwiX3ByZXZlbnRBdXRvcHVibGlzaCIsInB1Ymxpc2giLCJpc19hdXRvIiwiZGVmaW5lTXV0YXRpb25NZXRob2RzIiwiX2RlZmluZU11dGF0aW9uTWV0aG9kcyIsInVzZUV4aXN0aW5nIiwiX3N1cHByZXNzU2FtZU5hbWVFcnJvciIsIm1ldGhvZHMiLCJtYW5hZ2VyIiwiX2luc2VydEFzeW5jIiwiZ2V0UHJvdG90eXBlT2YiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzIiwiZ2VuZXJhdGVJZCIsImVuY2xvc2luZyIsIl9DdXJyZW50TWV0aG9kSW52b2NhdGlvbiIsImNob29zZVJldHVyblZhbHVlRnJvbUNvbGxlY3Rpb25SZXN1bHQiLCJfaXNQcm9taXNlIiwiX2NhbGxNdXRhdG9yTWV0aG9kQXN5bmMiLCJzdHViUHJvbWlzZSIsInNlcnZlclByb21pc2UiLCJMb2ciLCJkZWJ1ZyIsInJlQ3JlYXRlSW5kZXhPbk9wdGlvbk1pc21hdGNoIiwiaW5mbyIsIl9yZWdpc3RlclN0b3JlUmVzdWx0IiwiX3JlZ2lzdGVyU3RvcmVSZXN1bHQkIiwicmVnaXN0ZXJTdG9yZUNsaWVudCIsInJlZ2lzdGVyU3RvcmVTZXJ2ZXIiLCJ3cmFwcGVkU3RvcmVDb21tb24iLCJzYXZlT3JpZ2luYWxzIiwicmV0cmlldmVPcmlnaW5hbHMiLCJfZ2V0Q29sbGVjdGlvbiIsIndyYXBwZWRTdG9yZUNsaWVudCIsImJlZ2luVXBkYXRlIiwiYmF0Y2hTaXplIiwicmVzZXQiLCJwYXVzZU9ic2VydmVycyIsInVwZGF0ZSIsIm1zZyIsIm1vbmdvSWQiLCJpZFBhcnNlIiwiX2RvY3MiLCJpbnNlcnQiLCJlbmRVcGRhdGUiLCJyZXN1bWVPYnNlcnZlcnNDbGllbnQiLCJnZXREb2MiLCJmaW5kT25lIiwid3JhcHBlZFN0b3JlU2VydmVyIiwicmVzdW1lT2JzZXJ2ZXJzU2VydmVyIiwicmVnaXN0ZXJTdG9yZVJlc3VsdCIsImxvZ1dhcm4iLCJsb2ciLCJvayIsIl9pbnNlcnQiLCJ3cmFwcGVkQ2FsbGJhY2siLCJ3cmFwQ2FsbGJhY2siLCJfY2FsbE11dGF0b3JNZXRob2QiLCJfbGVuMyIsIm9wdGlvbnNBbmRDYWxsYmFjayIsIl9rZXkzIiwicG9wQ2FsbGJhY2tGcm9tQXJncyIsImNvbnZlcnRSZXN1bHQiLCJzZXRDb25uZWN0aW9uT3B0aW9ucyIsIm90aGVyT3B0aW9ucyIsIm5leHRPYnNlcnZlSGFuZGxlSWQiLCJfY2hhbmdlZCIsIl9tb3ZlZEJlZm9yZSIsIl9yZW1vdmVkIiwiYmVmb3JlIiwidGltZW91dCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQUEsT0FBTyxDQUFDQyxNQUFNLENBQUM7TUFBQ0MsU0FBUyxFQUFDQSxDQUFBLEtBQUlBLFNBQVM7TUFBQ0MsY0FBYyxFQUFDQSxDQUFBLEtBQUlBO0lBQWMsQ0FBQyxDQUFDO0lBQUMsSUFBSUMsV0FBVztJQUFDSixPQUFPLENBQUNLLElBQUksQ0FBQyxpQkFBaUIsRUFBQztNQUFDRCxXQUFXQSxDQUFDRSxDQUFDLEVBQUM7UUFBQ0YsV0FBVyxHQUFDRSxDQUFDO01BQUE7SUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQUMsSUFBSUMsZUFBZTtJQUFDUCxPQUFPLENBQUNLLElBQUksQ0FBQyxvQkFBb0IsRUFBQztNQUFDRSxlQUFlQSxDQUFDRCxDQUFDLEVBQUM7UUFBQ0MsZUFBZSxHQUFDRCxDQUFDO01BQUE7SUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQUMsSUFBSUUsa0JBQWtCO0lBQUNSLE9BQU8sQ0FBQ0ssSUFBSSxDQUFDLHdCQUF3QixFQUFDO01BQUNHLGtCQUFrQkEsQ0FBQ0YsQ0FBQyxFQUFDO1FBQUNFLGtCQUFrQixHQUFDRixDQUFDO01BQUE7SUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQUMsSUFBSUcsT0FBTztJQUFDVCxPQUFPLENBQUNLLElBQUksQ0FBQyxnQkFBZ0IsRUFBQztNQUFDSSxPQUFPQSxDQUFDSCxDQUFDLEVBQUM7UUFBQ0csT0FBTyxHQUFDSCxDQUFDO01BQUE7SUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQUMsSUFBSUksb0JBQW9CLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTUEsb0JBQW9CLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFLOWVDLGNBQWMsR0FBR0MsTUFBTSxDQUFDRCxjQUFjLEdBQUcsQ0FBQyxDQUFDO0lBRTNDQSxjQUFjLENBQUNFLGFBQWEsR0FBRyxPQUFPO0lBRXRDRixjQUFjLENBQUNHLFVBQVUsR0FBRztNQUMxQkMsT0FBTyxFQUFFO1FBQ1BDLE9BQU8sRUFBRUMsdUJBQXVCO1FBQ2hDQyxNQUFNLEVBQUVUO01BQ1Y7SUFDRixDQUFDOztJQUVEO0lBQ0E7SUFDQTtJQUNBO0lBQ0FFLGNBQWMsQ0FBQ1EsU0FBUyxHQUFHLElBQUlDLEtBQUssQ0FBQ1gsT0FBTyxFQUFFO01BQzVDWSxHQUFHQSxDQUFDQyxNQUFNLEVBQUVDLFdBQVcsRUFBRUMsUUFBUSxFQUFFO1FBQ2pDLElBQUlELFdBQVcsS0FBSyxVQUFVLEVBQUU7VUFDOUJFLE1BQU0sQ0FBQ0MsU0FBUyxDQUNkLDZIQUVGLENBQUM7UUFDSDtRQUNBLE9BQU9DLE9BQU8sQ0FBQ04sR0FBRyxDQUFDQyxNQUFNLEVBQUVDLFdBQVcsRUFBRUMsUUFBUSxDQUFDO01BQ25EO0lBQ0YsQ0FBQyxDQUFDO0lBRUZiLGNBQWMsQ0FBQ1AsV0FBVyxHQUFHQSxXQUFXO0lBRXhDTyxjQUFjLENBQUNpQixVQUFVLEdBQUdyQixlQUFlO0lBRTNDSSxjQUFjLENBQUNILGtCQUFrQixHQUFHQSxrQkFBa0I7O0lBRXREO0lBQ0E7O0lBR0E7SUFDQTtJQUNBO0lBQ0FDLE9BQU8sQ0FBQ29CLFNBQVMsQ0FBQ0MsU0FBUyxDQUFDQyxLQUFLLEdBQUcsWUFBWTtNQUM5QztNQUNBLE9BQU8sSUFBSTtJQUNiLENBQUM7O0lBRUQ7SUFDQTtJQUNBO0lBQ0E7SUFDQTs7SUFFTyxNQUFNN0IsU0FBUyxHQUFHLGVBQUFBLENBQWdCOEIsaUJBQWlCLEVBQUVDLGNBQWMsRUFBRTtNQUMxRSxNQUFNQyxTQUFTLEdBQUcsRUFBRTtNQUNwQixNQUFNL0IsY0FBYyxDQUFDNkIsaUJBQWlCLEVBQUUsVUFBVUcsT0FBTyxFQUFFO1FBQ3pERCxTQUFTLENBQUNFLElBQUksQ0FBQ0MsU0FBUyxDQUFDQyxxQkFBcUIsQ0FBQ0MsTUFBTSxDQUNuREosT0FBTyxFQUFFRixjQUFjLENBQUMsQ0FBQztNQUM3QixDQUFDLENBQUM7TUFFRixPQUFPO1FBQ0xPLElBQUksRUFBRSxTQUFBQSxDQUFBLEVBQVk7VUFDaEJOLFNBQVMsQ0FBQ08sT0FBTyxDQUFDLFVBQVVDLFFBQVEsRUFBRTtZQUNwQ0EsUUFBUSxDQUFDRixJQUFJLENBQUMsQ0FBQztVQUNqQixDQUFDLENBQUM7UUFDSjtNQUNGLENBQUM7SUFDSCxDQUFDO0lBRU0sTUFBTXJDLGNBQWMsR0FBRyxlQUFBQSxDQUFnQjZCLGlCQUFpQixFQUFFVyxlQUFlLEVBQUU7TUFDaEYsTUFBTUMsR0FBRyxHQUFHO1FBQUNDLFVBQVUsRUFBRWIsaUJBQWlCLENBQUNjO01BQWMsQ0FBQztNQUMxRCxNQUFNQyxXQUFXLEdBQUdDLGVBQWUsQ0FBQ0MscUJBQXFCLENBQ3ZEakIsaUJBQWlCLENBQUNrQixRQUFRLENBQUM7TUFDN0IsSUFBSUgsV0FBVyxFQUFFO1FBQ2YsS0FBSyxNQUFNSSxFQUFFLElBQUlKLFdBQVcsRUFBRTtVQUM1QixNQUFNSixlQUFlLENBQUNTLE1BQU0sQ0FBQ0MsTUFBTSxDQUFDO1lBQUNGLEVBQUUsRUFBRUE7VUFBRSxDQUFDLEVBQUVQLEdBQUcsQ0FBQyxDQUFDO1FBQ3JEO1FBQ0EsTUFBTUQsZUFBZSxDQUFDUyxNQUFNLENBQUNDLE1BQU0sQ0FBQztVQUFDQyxjQUFjLEVBQUUsSUFBSTtVQUFFSCxFQUFFLEVBQUU7UUFBSSxDQUFDLEVBQUVQLEdBQUcsQ0FBQyxDQUFDO01BQzdFLENBQUMsTUFBTTtRQUNMLE1BQU1ELGVBQWUsQ0FBQ0MsR0FBRyxDQUFDO01BQzVCO01BQ0E7TUFDQSxNQUFNRCxlQUFlLENBQUM7UUFBRVksWUFBWSxFQUFFO01BQUssQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFJRDtJQUNBO0lBQ0E7SUFDQTVDLGNBQWMsQ0FBQzZDLGNBQWMsR0FBRy9DLE9BQU8sQ0FBQ29CLFNBQVM7SUFBQzRCLHNCQUFBO0VBQUEsU0FBQUMsV0FBQTtJQUFBLE9BQUFELHNCQUFBLENBQUFDLFdBQUE7RUFBQTtFQUFBRCxzQkFBQTtBQUFBO0VBQUFFLElBQUE7RUFBQUMsS0FBQTtBQUFBLEc7Ozs7Ozs7Ozs7Ozs7O0lDN0ZsRCxJQUFBQyxhQUFjO0lBQUEzQyxNQUFNLENBQUFiLElBQUEsdUNBQWlCO01BQUF5RCxRQUFBeEQsQ0FBQTtRQUFBdUQsYUFBQSxHQUFBdkQsQ0FBQTtNQUFBO0lBQUE7SUFBckNZLE1BQUEsQ0FBT2pCLE1BQUEsQ0FBTztNQUFBOEQsZ0JBQU0sRUFBQUEsQ0FBQSxLQUFnQkEsZ0JBQUM7TUFBQTNELFdBQUEsRUFBQUEsQ0FBQSxLQUFBQSxXQUFBO01BQUE0RCxPQUFBLEVBQUFBLENBQUEsS0FBQUE7SUFBQTtJQUFBLElBQUFDLE9BQUE7SUFBQS9DLE1BQUEsQ0FBQWIsSUFBQTtNQUFBeUQsUUFBQXhELENBQUE7UUFBQTJELE9BQUEsR0FBQTNELENBQUE7TUFBQTtJQUFBO0lBQUEsSUFBQW1CLE1BQUE7SUFBQVAsTUFBQSxDQUFBYixJQUFBO01BQUFvQixPQUFBbkIsQ0FBQTtRQUFBbUIsTUFBQSxHQUFBbkIsQ0FBQTtNQUFBO0lBQUE7SUFBQSxJQUFBNEQsaUJBQUE7SUFBQWhELE1BQUEsQ0FBQWIsSUFBQTtNQUFBNkQsa0JBQUE1RCxDQUFBO1FBQUE0RCxpQkFBQSxHQUFBNUQsQ0FBQTtNQUFBO0lBQUE7SUFBQSxJQUFBQyxlQUFBO0lBQUFXLE1BQUEsQ0FBQWIsSUFBQTtNQUFBRSxnQkFBQUQsQ0FBQTtRQUFBQyxlQUFBLEdBQUFELENBQUE7TUFBQTtJQUFBO0lBQUEsSUFBQTZELGdCQUFBO0lBQUFqRCxNQUFBLENBQUFiLElBQUE7TUFBQThELGlCQUFBN0QsQ0FBQTtRQUFBNkQsZ0JBQUEsR0FBQTdELENBQUE7TUFBQTtJQUFBO0lBQUEsSUFBQUksb0JBQUEsV0FBQUEsb0JBQUE7SUFNckMsTUFBTTtNQUFFMEQ7SUFBSSxDQUFFLEdBQUdELGdCQUFnQjtJQUUxQixNQUFNSixnQkFBZ0IsR0FBRyxVQUFVO0lBRTFDLElBQUlNLGNBQWMsR0FBRyxFQUFFQyxPQUFPLENBQUNDLEdBQUcsQ0FBQ0MsMkJBQTJCLElBQUksSUFBSSxDQUFDO0lBQ3ZFLE1BQU1DLFlBQVksR0FBRyxFQUFFSCxPQUFPLENBQUNDLEdBQUcsQ0FBQ0cseUJBQXlCLElBQUksS0FBSyxDQUFDO0lBdUJoRSxNQUFPdEUsV0FBVztNQXNCdEJ1RSxZQUFZQyxRQUFnQixFQUFFQyxNQUFjO1FBQUEsS0FyQnBDQyxTQUFTO1FBQUEsS0FDVkMsT0FBTztRQUFBLEtBQ05DLHlCQUF5QjtRQUFBLEtBQ3pCQyxvQkFBb0I7UUFBQSxLQUNwQkMsYUFBYTtRQUFBLEtBQ2JDLFFBQVE7UUFBQSxLQUNSQyxXQUFXO1FBQUEsS0FDWEMscUJBQXFCO1FBQUEsS0FDckJDLGFBQWE7UUFBQSxLQUNkQyxTQUFTO1FBQUEsS0FDUkMsa0JBQWtCO1FBQUEsS0FDbEJDLG9CQUFvQjtRQUFBLEtBQ3BCQyxnQkFBZ0I7UUFBQSxLQUNoQkMscUJBQXFCO1FBQUEsS0FDckJDLHFCQUFxQjtRQUFBLEtBQ3JCQyxlQUFlO1FBQUEsS0FFZkMsV0FBVyxHQUFHLElBQUlyRSxNQUFNLENBQUNzRSxpQkFBaUIsRUFBRTtRQUFBLEtBQzVDQyxhQUFhLEdBQUcsS0FBSztRQUFBLEtBQ3JCQyxjQUFjLEdBQXlCLElBQUk7UUFHakQsSUFBSSxDQUFDbkIsU0FBUyxHQUFHRixRQUFRO1FBQ3pCLElBQUksQ0FBQ0csT0FBTyxHQUFHRixNQUFNO1FBRXJCLElBQUksQ0FBQ2dCLGVBQWUsR0FBRyxJQUFJO1FBQzNCLElBQUksQ0FBQ2IseUJBQXlCLEdBQUcsSUFBSTtRQUNyQyxJQUFJLENBQUNDLG9CQUFvQixHQUFHLElBQUk7UUFDaEMsSUFBSSxDQUFDQyxhQUFhLEdBQUcsSUFBSTtRQUN6QixJQUFJLENBQUNDLFFBQVEsR0FBRyxLQUFLO1FBQ3JCLElBQUksQ0FBQ0MsV0FBVyxHQUFHLElBQUk7UUFDdkIsSUFBSSxDQUFDQyxxQkFBcUIsR0FBRyxJQUFJO1FBQ2pDLElBQUksQ0FBQ0MsYUFBYSxHQUFHLElBQUlZLE9BQU8sQ0FBQ0MsQ0FBQyxJQUFJLElBQUksQ0FBQ2QscUJBQXFCLEdBQUdjLENBQUMsQ0FBQztRQUNyRSxJQUFJLENBQUNaLFNBQVMsR0FBRyxJQUFJbEQsU0FBUyxDQUFDK0QsU0FBUyxDQUFDO1VBQ3ZDQyxXQUFXLEVBQUUsZ0JBQWdCO1VBQUVDLFFBQVEsRUFBRTtTQUMxQyxDQUFDO1FBQ0YsSUFBSSxDQUFDZCxrQkFBa0IsR0FBRztVQUN4QmUsRUFBRSxFQUFFLElBQUlDLE1BQU0sQ0FBQyxNQUFNLEdBQUc7VUFDdEI7VUFDQS9FLE1BQU0sQ0FBQ2dGLGFBQWEsQ0FBQyxJQUFJLENBQUMxQixPQUFPLEdBQUcsR0FBRyxDQUFDO1VBQ3hDO1VBQ0F0RCxNQUFNLENBQUNnRixhQUFhLENBQUMsWUFBWSxDQUFDLENBQ25DLENBQUNDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUM7VUFFbEJDLEdBQUcsRUFBRSxDQUNIO1lBQUVDLEVBQUUsRUFBRTtjQUFFQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUc7WUFBQztVQUFFLENBQUUsRUFDaEM7WUFBRUQsRUFBRSxFQUFFLEdBQUc7WUFBRSxRQUFRLEVBQUU7Y0FBRUUsT0FBTyxFQUFFO1lBQUk7VUFBRSxDQUFFLEVBQ3hDO1lBQUVGLEVBQUUsRUFBRSxHQUFHO1lBQUUsZ0JBQWdCLEVBQUU7VUFBQyxDQUFFLEVBQ2hDO1lBQUVBLEVBQUUsRUFBRSxHQUFHO1lBQUUsWUFBWSxFQUFFO2NBQUVFLE9BQU8sRUFBRTtZQUFJO1VBQUUsQ0FBRTtTQUUvQztRQUVELElBQUksQ0FBQ3JCLG9CQUFvQixHQUFHLEVBQUU7UUFDOUIsSUFBSSxDQUFDQyxnQkFBZ0IsR0FBRyxJQUFJO1FBRTVCLElBQUksQ0FBQ0MscUJBQXFCLEdBQUcsSUFBSW9CLElBQUksQ0FBQztVQUNwQ0Msb0JBQW9CLEVBQUU7U0FDdkIsQ0FBQztRQUVGLElBQUksQ0FBQ3BCLHFCQUFxQixHQUFHLElBQUksQ0FBQ3FCLGFBQWEsRUFBRTtNQUNuRDtNQUVBLE1BQU16RSxJQUFJQSxDQUFBO1FBQ1IsSUFBSSxJQUFJLENBQUMyQyxRQUFRLEVBQUU7UUFDbkIsSUFBSSxDQUFDQSxRQUFRLEdBQUcsSUFBSTtRQUNwQixJQUFJLElBQUksQ0FBQ0MsV0FBVyxFQUFFO1VBQ3BCLE1BQU0sSUFBSSxDQUFDQSxXQUFXLENBQUM1QyxJQUFJLEVBQUU7UUFDL0I7TUFDRjtNQUVBLE1BQU0wRSxhQUFhQSxDQUFDL0UsT0FBcUIsRUFBRWdGLFFBQWtCO1FBQzNELElBQUksSUFBSSxDQUFDaEMsUUFBUSxFQUFFO1VBQ2pCLE1BQU0sSUFBSWlDLEtBQUssQ0FBQyx3Q0FBd0MsQ0FBQztRQUMzRDtRQUVBLE1BQU0sSUFBSSxDQUFDOUIsYUFBYTtRQUV4QixNQUFNK0IsZ0JBQWdCLEdBQUdGLFFBQVE7UUFFakM7Ozs7O1FBS0FBLFFBQVEsR0FBRzFGLE1BQU0sQ0FBQzZGLGVBQWUsQ0FDL0IsVUFBVUMsWUFBaUI7VUFDekJGLGdCQUFnQixDQUFDRSxZQUFZLENBQUM7UUFDaEMsQ0FBQztRQUNEO1FBQ0EsVUFBVUMsR0FBRztVQUNYL0YsTUFBTSxDQUFDZ0csTUFBTSxDQUFDLHlCQUF5QixFQUFFRCxHQUFHLENBQUM7UUFDL0MsQ0FBQyxDQUNGO1FBRUQsTUFBTUUsWUFBWSxHQUFHLElBQUksQ0FBQ25DLFNBQVMsQ0FBQ2hELE1BQU0sQ0FBQ0osT0FBTyxFQUFFZ0YsUUFBUSxDQUFDO1FBQzdELE9BQU87VUFDTDNFLElBQUksRUFBRSxlQUFBQSxDQUFBLEVBQUs7WUFDVCxNQUFNa0YsWUFBWSxDQUFDbEYsSUFBSSxFQUFFO1VBQzNCO1NBQ0Q7TUFDSDtNQUVBbUYsWUFBWUEsQ0FBQ3hGLE9BQXFCLEVBQUVnRixRQUFrQjtRQUNwRCxPQUFPLElBQUksQ0FBQ0QsYUFBYSxDQUFDL0UsT0FBTyxFQUFFZ0YsUUFBUSxDQUFDO01BQzlDO01BRUFTLGdCQUFnQkEsQ0FBQ1QsUUFBa0I7UUFDakMsSUFBSSxJQUFJLENBQUNoQyxRQUFRLEVBQUU7VUFDakIsTUFBTSxJQUFJaUMsS0FBSyxDQUFDLDRDQUE0QyxDQUFDO1FBQy9EO1FBQ0EsT0FBTyxJQUFJLENBQUN6QixxQkFBcUIsQ0FBQ2tDLFFBQVEsQ0FBQ1YsUUFBUSxDQUFDO01BQ3REO01BRUEsTUFBTVcsa0JBQWtCQSxDQUFBO1FBQ3RCLElBQUksSUFBSSxDQUFDM0MsUUFBUSxFQUFFO1VBQ2pCLE1BQU0sSUFBSWlDLEtBQUssQ0FBQyw2Q0FBNkMsQ0FBQztRQUNoRTtRQUVBLE1BQU0sSUFBSSxDQUFDOUIsYUFBYTtRQUV4QixJQUFJeUMsU0FBUyxHQUFzQixJQUFJO1FBRXZDLE9BQU8sQ0FBQyxJQUFJLENBQUM1QyxRQUFRLEVBQUU7VUFDckIsSUFBSTtZQUNGNEMsU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDL0MseUJBQXlCLENBQUNnRCxZQUFZLENBQzNEakUsZ0JBQWdCLEVBQ2hCLElBQUksQ0FBQ3lCLGtCQUFrQixFQUN2QjtjQUFFeUMsVUFBVSxFQUFFO2dCQUFFQyxFQUFFLEVBQUU7Y0FBQyxDQUFFO2NBQUVDLElBQUksRUFBRTtnQkFBRUMsUUFBUSxFQUFFLENBQUM7Y0FBQztZQUFFLENBQUUsQ0FDbEQ7WUFDRDtVQUNGLENBQUMsQ0FBQyxPQUFPQyxDQUFDLEVBQUU7WUFDVjVHLE1BQU0sQ0FBQ2dHLE1BQU0sQ0FBQyx3Q0FBd0MsRUFBRVksQ0FBQyxDQUFDO1lBQzFEO1lBQ0EsTUFBTTVHLE1BQU0sQ0FBQzZHLEtBQUssQ0FBQyxHQUFHLENBQUM7VUFDekI7UUFDRjtRQUVBLElBQUksSUFBSSxDQUFDbkQsUUFBUSxFQUFFO1FBRW5CLElBQUksQ0FBQzRDLFNBQVMsRUFBRTtRQUVoQixNQUFNRyxFQUFFLEdBQUdILFNBQVMsQ0FBQ0csRUFBRTtRQUN2QixJQUFJLENBQUNBLEVBQUUsRUFBRTtVQUNQLE1BQU1kLEtBQUssQ0FBQywwQkFBMEIsR0FBR21CLElBQUksQ0FBQ0MsU0FBUyxDQUFDVCxTQUFTLENBQUMsQ0FBQztRQUNyRTtRQUVBLElBQUksSUFBSSxDQUFDckMsZ0JBQWdCLElBQUl3QyxFQUFFLENBQUNPLGVBQWUsQ0FBQyxJQUFJLENBQUMvQyxnQkFBZ0IsQ0FBQyxFQUFFO1VBQ3RFO1FBQ0Y7UUFFQSxJQUFJZ0QsV0FBVyxHQUFHLElBQUksQ0FBQ2pELG9CQUFvQixDQUFDa0QsTUFBTTtRQUVsRCxPQUFPRCxXQUFXLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUNqRCxvQkFBb0IsQ0FBQ2lELFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQ1IsRUFBRSxDQUFDVSxXQUFXLENBQUNWLEVBQUUsQ0FBQyxFQUFFO1VBQzNGUSxXQUFXLEVBQUU7UUFDZjtRQUVBLElBQUlHLGVBQWUsR0FBRyxJQUFJO1FBRTFCLE1BQU1DLGNBQWMsR0FBRyxJQUFJNUMsT0FBTyxDQUFDQyxDQUFDLElBQUkwQyxlQUFlLEdBQUcxQyxDQUFDLENBQUM7UUFFNUQ0QyxZQUFZLENBQUMsSUFBSSxDQUFDbEQsZUFBZSxDQUFDO1FBRWxDLElBQUksQ0FBQ0EsZUFBZSxHQUFHbUQsVUFBVSxDQUFDLE1BQUs7VUFDckNDLE9BQU8sQ0FBQ0MsS0FBSyxDQUFDLHlDQUF5QyxFQUFFO1lBQUVoQjtVQUFFLENBQUUsQ0FBQztRQUNsRSxDQUFDLEVBQUUsS0FBSyxDQUFDO1FBRVQsSUFBSSxDQUFDekMsb0JBQW9CLENBQUMwRCxNQUFNLENBQUNULFdBQVcsRUFBRSxDQUFDLEVBQUU7VUFBRVIsRUFBRTtVQUFFa0IsUUFBUSxFQUFFUDtRQUFnQixDQUFFLENBQUM7UUFFcEYsTUFBTUMsY0FBYztRQUVwQkMsWUFBWSxDQUFDLElBQUksQ0FBQ2xELGVBQWUsQ0FBQztNQUNwQztNQUVBLE1BQU13RCxpQkFBaUJBLENBQUE7UUFDckIsT0FBTyxJQUFJLENBQUN2QixrQkFBa0IsRUFBRTtNQUNsQztNQUVBLE1BQU1iLGFBQWFBLENBQUE7UUFDakIsTUFBTXFDLFVBQVUsR0FBR0MsT0FBTyxDQUFDLGFBQWEsQ0FBQztRQUN6QyxJQUFJRCxVQUFVLENBQUNFLEtBQUssQ0FBQyxJQUFJLENBQUMxRSxTQUFTLENBQUMsQ0FBQzJFLFFBQVEsS0FBSyxPQUFPLEVBQUU7VUFDekQsTUFBTSxJQUFJckMsS0FBSyxDQUFDLDZFQUE2RSxDQUFDO1FBQ2hHO1FBRUEsSUFBSSxDQUFDbkMsb0JBQW9CLEdBQUcsSUFBSTFFLGVBQWUsQ0FDN0MsSUFBSSxDQUFDdUUsU0FBUyxFQUFFO1VBQUU0RSxXQUFXLEVBQUUsQ0FBQztVQUFFQyxXQUFXLEVBQUU7UUFBQyxDQUFFLENBQ25EO1FBQ0QsSUFBSSxDQUFDM0UseUJBQXlCLEdBQUcsSUFBSXpFLGVBQWUsQ0FDbEQsSUFBSSxDQUFDdUUsU0FBUyxFQUFFO1VBQUU0RSxXQUFXLEVBQUUsQ0FBQztVQUFFQyxXQUFXLEVBQUU7UUFBQyxDQUFFLENBQ25EO1FBRUQsSUFBSTtVQUFBLElBQUFDLGdCQUFBLEVBQUFDLHFCQUFBLEVBQUFDLHNCQUFBLEVBQUFDLGlCQUFBLEVBQUFDLHFCQUFBLEVBQUFDLHNCQUFBO1VBQ0YsTUFBTUMsV0FBVyxHQUFHLE1BQU0sSUFBSSxDQUFDbEYseUJBQTBCLENBQUNtRixFQUFFLENBQ3pEQyxLQUFLLEVBQUUsQ0FDUEMsT0FBTyxDQUFDO1lBQUVDLFFBQVEsRUFBRTtVQUFDLENBQUUsQ0FBQztVQUUzQixJQUFJLEVBQUVKLFdBQVcsSUFBSUEsV0FBVyxDQUFDSyxPQUFPLENBQUMsRUFBRTtZQUN6QyxNQUFNLElBQUluRCxLQUFLLENBQUMsNkVBQTZFLENBQUM7VUFDaEc7VUFFQSxNQUFNb0QsY0FBYyxHQUFHLE1BQU0sSUFBSSxDQUFDeEYseUJBQXlCLENBQUNnRCxZQUFZLENBQ3RFakUsZ0JBQWdCLEVBQ2hCLEVBQUUsRUFDRjtZQUFFb0UsSUFBSSxFQUFFO2NBQUVDLFFBQVEsRUFBRSxDQUFDO1lBQUMsQ0FBRTtZQUFFSCxVQUFVLEVBQUU7Y0FBRUMsRUFBRSxFQUFFO1lBQUM7VUFBRSxDQUFFLENBQ2xEO1VBRUQsSUFBSXVDLGFBQWEsR0FBQTVHLGFBQUEsS0FBYSxJQUFJLENBQUMyQixrQkFBa0IsQ0FBRTtVQUN2RCxJQUFJZ0YsY0FBYyxFQUFFO1lBQ2xCQyxhQUFhLENBQUN2QyxFQUFFLEdBQUc7Y0FBRXdDLEdBQUcsRUFBRUYsY0FBYyxDQUFDdEM7WUFBRSxDQUFFO1lBQzdDLElBQUksQ0FBQ3hDLGdCQUFnQixHQUFHOEUsY0FBYyxDQUFDdEMsRUFBRTtVQUMzQztVQUVBLE1BQU15QyxrQkFBa0IsSUFBQWYsZ0JBQUEsR0FBR25JLE1BQU0sQ0FBQ21KLFFBQVEsY0FBQWhCLGdCQUFBLHdCQUFBQyxxQkFBQSxHQUFmRCxnQkFBQSxDQUFpQmlCLFFBQVEsY0FBQWhCLHFCQUFBLHdCQUFBQyxzQkFBQSxHQUF6QkQscUJBQUEsQ0FBMkJpQixLQUFLLGNBQUFoQixzQkFBQSx1QkFBaENBLHNCQUFBLENBQWtDaUIsdUJBQXVCO1VBQ3BGLE1BQU1DLGtCQUFrQixJQUFBakIsaUJBQUEsR0FBR3RJLE1BQU0sQ0FBQ21KLFFBQVEsY0FBQWIsaUJBQUEsd0JBQUFDLHFCQUFBLEdBQWZELGlCQUFBLENBQWlCYyxRQUFRLGNBQUFiLHFCQUFBLHdCQUFBQyxzQkFBQSxHQUF6QkQscUJBQUEsQ0FBMkJjLEtBQUssY0FBQWIsc0JBQUEsdUJBQWhDQSxzQkFBQSxDQUFrQ2dCLHVCQUF1QjtVQUVwRixJQUFJTixrQkFBa0IsYUFBbEJBLGtCQUFrQixlQUFsQkEsa0JBQWtCLENBQUVoQyxNQUFNLElBQUlxQyxrQkFBa0IsYUFBbEJBLGtCQUFrQixlQUFsQkEsa0JBQWtCLENBQUVyQyxNQUFNLEVBQUU7WUFDNUQsTUFBTSxJQUFJdkIsS0FBSyxDQUFDLDJHQUEyRyxDQUFDO1VBQzlIO1VBRUEsSUFBSTRELGtCQUFrQixhQUFsQkEsa0JBQWtCLGVBQWxCQSxrQkFBa0IsQ0FBRXJDLE1BQU0sRUFBRTtZQUM5QjhCLGFBQWEsQ0FBQ2xFLEVBQUUsR0FBRztjQUNqQjJFLE1BQU0sRUFBRVQsYUFBYSxDQUFDbEUsRUFBRTtjQUN4QjRFLElBQUksRUFBRUgsa0JBQWtCLENBQUNJLEdBQUcsQ0FBRUMsUUFBZ0IsT0FBQUMsTUFBQSxDQUFRLElBQUksQ0FBQ3ZHLE9BQU8sT0FBQXVHLE1BQUEsQ0FBSUQsUUFBUSxDQUFFO2FBQ2pGO1lBQ0QsSUFBSSxDQUFDbkcsYUFBYSxHQUFHO2NBQUU4RjtZQUFrQixDQUFFO1VBQzdDLENBQUMsTUFBTSxJQUFJTCxrQkFBa0IsYUFBbEJBLGtCQUFrQixlQUFsQkEsa0JBQWtCLENBQUVoQyxNQUFNLEVBQUU7WUFDckM4QixhQUFhLEdBQUc7Y0FDZGMsSUFBSSxFQUFFLENBQ0o7Z0JBQ0U1RSxHQUFHLEVBQUUsQ0FDSDtrQkFBRUosRUFBRSxFQUFFO2dCQUFlLENBQUUsRUFDdkI7a0JBQUVBLEVBQUUsRUFBRTtvQkFBRU0sR0FBRyxFQUFFOEQsa0JBQWtCLENBQUNTLEdBQUcsQ0FBRUMsUUFBZ0IsT0FBQUMsTUFBQSxDQUFRLElBQUksQ0FBQ3ZHLE9BQU8sT0FBQXVHLE1BQUEsQ0FBSUQsUUFBUSxDQUFFO2tCQUFDO2dCQUFFLENBQUU7ZUFFL0YsRUFDRDtnQkFBRTFFLEdBQUcsRUFBRThELGFBQWEsQ0FBQzlEO2NBQUcsQ0FBRSxFQUMxQjtnQkFBRXVCLEVBQUUsRUFBRXVDLGFBQWEsQ0FBQ3ZDO2NBQUUsQ0FBRTthQUUzQjtZQUNELElBQUksQ0FBQ2hELGFBQWEsR0FBRztjQUFFeUY7WUFBa0IsQ0FBRTtVQUM3QztVQUVBLE1BQU0zSSxpQkFBaUIsR0FBRyxJQUFJa0MsaUJBQWlCLENBQzdDSCxnQkFBZ0IsRUFDaEIwRyxhQUFhLEVBQ2I7WUFBRWUsUUFBUSxFQUFFO1VBQUksQ0FBRSxDQUNuQjtVQUVELElBQUksQ0FBQ3BHLFdBQVcsR0FBRyxJQUFJLENBQUNILG9CQUFvQixDQUFDd0csSUFBSSxDQUMvQ3pKLGlCQUFpQixFQUNoQjBKLEdBQVEsSUFBSTtZQUNYLElBQUksQ0FBQzVGLFdBQVcsQ0FBQzFELElBQUksQ0FBQ3NKLEdBQUcsQ0FBQztZQUMxQixJQUFJLENBQUNDLGlCQUFpQixFQUFFO1VBQzFCLENBQUMsRUFDRGxILFlBQVksQ0FDYjtVQUVELElBQUksQ0FBQ1kscUJBQXNCLEVBQUU7UUFDL0IsQ0FBQyxDQUFDLE9BQU82RCxLQUFLLEVBQUU7VUFDZEQsT0FBTyxDQUFDQyxLQUFLLENBQUMseUJBQXlCLEVBQUVBLEtBQUssQ0FBQztVQUMvQyxNQUFNQSxLQUFLO1FBQ2I7TUFDRjtNQUVReUMsaUJBQWlCQSxDQUFBO1FBQ3ZCLElBQUksSUFBSSxDQUFDMUYsY0FBYyxFQUFFO1FBQ3pCLElBQUksQ0FBQ0QsYUFBYSxHQUFHLElBQUk7UUFFekI7UUFDQSxJQUFJLENBQUNDLGNBQWMsR0FBRyxDQUFDLFlBQVc7VUFDaEMsSUFBSTtZQUNGLE9BQU8sQ0FBQyxJQUFJLENBQUNkLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQ1csV0FBVyxDQUFDN0IsT0FBTyxFQUFFLEVBQUU7Y0FDcEQ7Y0FDQTtjQUNBLElBQUksSUFBSSxDQUFDNkIsV0FBVyxDQUFDNkMsTUFBTSxHQUFHdEUsY0FBYyxFQUFFO2dCQUM1QyxNQUFNMEQsU0FBUyxHQUFHLElBQUksQ0FBQ2pDLFdBQVcsQ0FBQzhGLEdBQUcsRUFBRTtnQkFDeEMsSUFBSSxDQUFDOUYsV0FBVyxDQUFDK0YsS0FBSyxFQUFFO2dCQUV4QixJQUFJLENBQUNsRyxxQkFBcUIsQ0FBQ21HLElBQUksQ0FBRTNFLFFBQWtCLElBQUk7a0JBQ3JEQSxRQUFRLEVBQUU7a0JBQ1YsT0FBTyxJQUFJO2dCQUNiLENBQUMsQ0FBQztnQkFFRjtnQkFDQTtnQkFDQSxJQUFJLENBQUM0RSxtQkFBbUIsQ0FBQ2hFLFNBQVMsQ0FBQ0csRUFBRSxDQUFDO2dCQUN0QztjQUNGO2NBRUE7Y0FDQSxNQUFNd0QsR0FBRyxHQUFHLElBQUksQ0FBQzVGLFdBQVcsQ0FBQ2tHLEtBQUssRUFBRTtjQUVwQyxJQUFJO2dCQUNGLE1BQU1DLFNBQVMsQ0FBQyxJQUFJLEVBQUVQLEdBQUcsQ0FBQztnQkFDMUI7Z0JBQ0EsSUFBSUEsR0FBRyxDQUFDeEQsRUFBRSxFQUFFO2tCQUNWLElBQUksQ0FBQzZELG1CQUFtQixDQUFDTCxHQUFHLENBQUN4RCxFQUFFLENBQUM7Z0JBQ2xDO2NBQ0YsQ0FBQyxDQUFDLE9BQU9HLENBQUMsRUFBRTtnQkFDVjtnQkFDQVksT0FBTyxDQUFDQyxLQUFLLENBQUMsK0JBQStCLEVBQUViLENBQUMsQ0FBQztjQUNuRDtZQUNGO1VBQ0YsQ0FBQyxTQUFTO1lBQ1IsSUFBSSxDQUFDcEMsY0FBYyxHQUFHLElBQUk7WUFDMUIsSUFBSSxDQUFDRCxhQUFhLEdBQUcsS0FBSztVQUM1QjtRQUNGLENBQUMsRUFBQyxDQUFFO01BQ047TUFFQStGLG1CQUFtQkEsQ0FBQzdELEVBQU87UUFDekIsSUFBSSxDQUFDeEMsZ0JBQWdCLEdBQUd3QyxFQUFFO1FBQzFCLE9BQU8sQ0FBQ2pFLE9BQU8sQ0FBQyxJQUFJLENBQUN3QixvQkFBb0IsQ0FBQyxJQUFJLElBQUksQ0FBQ0Esb0JBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUN5QyxFQUFFLENBQUNPLGVBQWUsQ0FBQyxJQUFJLENBQUMvQyxnQkFBZ0IsQ0FBQyxFQUFFO1VBQ3BILE1BQU13RyxTQUFTLEdBQUcsSUFBSSxDQUFDekcsb0JBQW9CLENBQUN1RyxLQUFLLEVBQUc7VUFDcERFLFNBQVMsQ0FBQzlDLFFBQVEsRUFBRTtRQUN0QjtNQUNGO01BRUErQyxtQkFBbUJBLENBQUNDLEtBQWE7UUFDL0IvSCxjQUFjLEdBQUcrSCxLQUFLO01BQ3hCO01BRUFDLGtCQUFrQkEsQ0FBQTtRQUNoQmhJLGNBQWMsR0FBRyxFQUFFQyxPQUFPLENBQUNDLEdBQUcsQ0FBQ0MsMkJBQTJCLElBQUksSUFBSSxDQUFDO01BQ3JFOztJQUdJLFNBQVVSLE9BQU9BLENBQUM0QyxFQUFjO01BQ3BDLElBQUlBLEVBQUUsQ0FBQ0EsRUFBRSxLQUFLLEdBQUcsSUFBSUEsRUFBRSxDQUFDQSxFQUFFLEtBQUssR0FBRyxFQUFFO1FBQ2xDLE9BQU9BLEVBQUUsQ0FBQzBGLENBQUMsQ0FBQ0MsR0FBRztNQUNqQixDQUFDLE1BQU0sSUFBSTNGLEVBQUUsQ0FBQ0EsRUFBRSxLQUFLLEdBQUcsRUFBRTtRQUN4QixPQUFPQSxFQUFFLENBQUM0RixFQUFFLENBQUNELEdBQUc7TUFDbEIsQ0FBQyxNQUFNLElBQUkzRixFQUFFLENBQUNBLEVBQUUsS0FBSyxHQUFHLEVBQUU7UUFDeEIsTUFBTVEsS0FBSyxDQUFDLGlEQUFpRCxHQUFHbUIsSUFBSSxDQUFDQyxTQUFTLENBQUM1QixFQUFFLENBQUMsQ0FBQztNQUNyRixDQUFDLE1BQU07UUFDTCxNQUFNUSxLQUFLLENBQUMsY0FBYyxHQUFHbUIsSUFBSSxDQUFDQyxTQUFTLENBQUM1QixFQUFFLENBQUMsQ0FBQztNQUNsRDtJQUNGO0lBRUEsZUFBZXFGLFNBQVNBLENBQUNRLE1BQW1CLEVBQUVmLEdBQWU7TUFDM0QsSUFBSUEsR0FBRyxDQUFDbkYsRUFBRSxLQUFLLFlBQVksRUFBRTtRQUMzQixJQUFJbUYsR0FBRyxDQUFDWSxDQUFDLENBQUNJLFFBQVEsRUFBRTtVQUNsQjtVQUNBO1VBQ0EsSUFBSUMsYUFBYSxHQUFHakIsR0FBRyxDQUFDeEQsRUFBRTtVQUMxQixLQUFLLE1BQU10QixFQUFFLElBQUk4RSxHQUFHLENBQUNZLENBQUMsQ0FBQ0ksUUFBUSxFQUFFO1lBQy9CO1lBQ0EsSUFBSSxDQUFDOUYsRUFBRSxDQUFDc0IsRUFBRSxFQUFFO2NBQ1Z0QixFQUFFLENBQUNzQixFQUFFLEdBQUd5RSxhQUFhO2NBQ3JCQSxhQUFhLEdBQUdBLGFBQWEsQ0FBQ0MsR0FBRyxDQUFDeEksSUFBSSxDQUFDeUksR0FBRyxDQUFDO1lBQzdDO1lBQ0EsTUFBTVosU0FBUyxDQUFDUSxNQUFNLEVBQUU3RixFQUFFLENBQUM7VUFDN0I7VUFDQTtRQUNGO1FBQ0EsTUFBTSxJQUFJUSxLQUFLLENBQUMsa0JBQWtCLEdBQUdtQixJQUFJLENBQUNDLFNBQVMsQ0FBQ2tELEdBQUcsQ0FBQyxDQUFDO01BQzNEO01BRUEsTUFBTXZKLE9BQU8sR0FBaUI7UUFDNUJtQixjQUFjLEVBQUUsS0FBSztRQUNyQkMsWUFBWSxFQUFFLEtBQUs7UUFDbkJxRCxFQUFFLEVBQUU4RTtPQUNMO01BRUQsSUFBSSxPQUFPQSxHQUFHLENBQUNuRixFQUFFLEtBQUssUUFBUSxJQUFJbUYsR0FBRyxDQUFDbkYsRUFBRSxDQUFDdUcsVUFBVSxDQUFDTCxNQUFNLENBQUMxSCxPQUFPLEdBQUcsR0FBRyxDQUFDLEVBQUU7UUFDekU1QyxPQUFPLENBQUNVLFVBQVUsR0FBRzZJLEdBQUcsQ0FBQ25GLEVBQUUsQ0FBQ3dHLEtBQUssQ0FBQ04sTUFBTSxDQUFDMUgsT0FBTyxDQUFDNEQsTUFBTSxHQUFHLENBQUMsQ0FBQztNQUM5RDtNQUVBO01BQ0E7TUFDQSxJQUFJeEcsT0FBTyxDQUFDVSxVQUFVLEtBQUssTUFBTSxFQUFFO1FBQ2pDLElBQUk2SSxHQUFHLENBQUNZLENBQUMsQ0FBQy9JLFlBQVksRUFBRTtVQUN0QixPQUFPcEIsT0FBTyxDQUFDVSxVQUFVO1VBQ3pCVixPQUFPLENBQUNvQixZQUFZLEdBQUcsSUFBSTtRQUM3QixDQUFDLE1BQU0sSUFBSSxNQUFNLElBQUltSSxHQUFHLENBQUNZLENBQUMsRUFBRTtVQUMxQm5LLE9BQU8sQ0FBQ1UsVUFBVSxHQUFHNkksR0FBRyxDQUFDWSxDQUFDLENBQUNVLElBQUk7VUFDL0I3SyxPQUFPLENBQUNtQixjQUFjLEdBQUcsSUFBSTtVQUM3Qm5CLE9BQU8sQ0FBQ2dCLEVBQUUsR0FBRyxJQUFJO1FBQ25CLENBQUMsTUFBTSxJQUFJLFFBQVEsSUFBSXVJLEdBQUcsQ0FBQ1ksQ0FBQyxJQUFJLFNBQVMsSUFBSVosR0FBRyxDQUFDWSxDQUFDLEVBQUU7VUFDbEQ7VUFDQTtRQUFBLENBQ0QsTUFBTTtVQUNMLE1BQU1sRixLQUFLLENBQUMsa0JBQWtCLEdBQUdtQixJQUFJLENBQUNDLFNBQVMsQ0FBQ2tELEdBQUcsQ0FBQyxDQUFDO1FBQ3ZEO01BQ0YsQ0FBQyxNQUFNO1FBQ0w7UUFDQXZKLE9BQU8sQ0FBQ2dCLEVBQUUsR0FBR2EsT0FBTyxDQUFDMEgsR0FBRyxDQUFDO01BQzNCO01BRUEsTUFBTWUsTUFBTSxDQUFDbEgsU0FBUyxDQUFDMEgsSUFBSSxDQUFDOUssT0FBTyxDQUFDO01BRXBDLE1BQU0sSUFBSStELE9BQU8sQ0FBQ2dILE9BQU8sSUFBSUMsWUFBWSxDQUFDRCxPQUFPLENBQUMsQ0FBQztJQUNyRDtJQUFDekosc0JBQUE7RUFBQSxTQUFBQyxXQUFBO0lBQUEsT0FBQUQsc0JBQUEsQ0FBQUMsV0FBQTtFQUFBO0VBQUFELHNCQUFBO0FBQUE7RUFBQUUsSUFBQTtFQUFBQyxLQUFBO0FBQUEsRzs7Ozs7Ozs7Ozs7Ozs7SUN6YUQsSUFBQXdKLHdCQUFvQjtJQUFBbE0sTUFBQSxDQUFnQmIsSUFBQztNQUFBeUQsUUFBQXhELENBQUE7UUFBQThNLHdCQUFBLEdBQUE5TSxDQUFBO01BQUE7SUFBQTtJQUFBLE1BQUErTSxTQUFBO0lBQXJDbk0sTUFBQSxDQUFPakIsTUFBQSxDQUFPO01BQUFxTixrQkFBTSxFQUFBQSxDQUFBLEtBQWlCQTtJQUFBO0lBQUEsSUFBQXJKLE9BQUE7SUFBQS9DLE1BQUEsQ0FBQWIsSUFBQTtNQUFBeUQsUUFBQXhELENBQUE7UUFBQTJELE9BQUEsR0FBQTNELENBQUE7TUFBQTtJQUFBO0lBQUEsSUFBQUksb0JBQUEsV0FBQUEsb0JBQUE7SUFnQi9CLE1BQU80TSxrQkFBa0I7TUFXN0IzSSxZQUFBNEksSUFBQSxFQUFxRTtRQUFBLElBQUFDLEtBQUE7UUFBQSxJQUF6RDtVQUFFQyxPQUFPO1VBQUVDLE1BQU0sR0FBR0EsQ0FBQSxLQUFLLENBQUU7UUFBQyxDQUE2QixHQUFBSCxJQUFBO1FBQUEsS0FWcERJLFFBQVE7UUFBQSxLQUNSQyxPQUFPO1FBQUEsS0FDaEJDLE1BQU07UUFBQSxLQUNOQyxRQUFRO1FBQUEsS0FDUkMsU0FBUztRQUFBLEtBQ0F6SSxhQUFhO1FBQUEsS0FDdEIwSSxRQUFRO1FBQUEsS0FDUkMsTUFBTTtRQUFBLEtBQ05DLHVDQUF1QztRQUc3QyxJQUFJVCxPQUFPLEtBQUtVLFNBQVMsRUFBRSxNQUFNL0csS0FBSyxDQUFDLHNCQUFzQixDQUFDO1FBRTlEO1FBQ0FnSCxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUlBLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FDekNDLEtBQUssQ0FBQ0MsbUJBQW1CLENBQUMsZ0JBQWdCLEVBQUUsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDO1FBRTNFLElBQUksQ0FBQ1gsUUFBUSxHQUFHRixPQUFPO1FBQ3ZCLElBQUksQ0FBQ0csT0FBTyxHQUFHRixNQUFNO1FBQ3JCLElBQUksQ0FBQ0csTUFBTSxHQUFHLElBQUlwTSxNQUFNLENBQUM4TSxrQkFBa0IsRUFBRTtRQUM3QyxJQUFJLENBQUNULFFBQVEsR0FBRyxFQUFFO1FBQ2xCLElBQUksQ0FBQ0MsU0FBUyxHQUFHLElBQUk7UUFDckIsSUFBSSxDQUFDQyxRQUFRLEdBQUcsS0FBSztRQUNyQixJQUFJLENBQUMxSSxhQUFhLEdBQUcsSUFBSVksT0FBTyxDQUFDQyxDQUFDLElBQUksSUFBSSxDQUFDNEgsU0FBUyxHQUFHNUgsQ0FBQyxDQUFDLENBQUNxSSxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUNSLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDMUY7UUFDQSxJQUFJLENBQUNDLE1BQU0sR0FBRyxJQUFJakwsZUFBZSxDQUFDeUwsc0JBQXNCLENBQUM7VUFBRWhCO1FBQU8sQ0FBRSxDQUFDO1FBQ3JFLElBQUksQ0FBQ1MsdUNBQXVDLEdBQUcsQ0FBQztRQUVoRCxJQUFJLENBQUNRLGFBQWEsRUFBRSxDQUFDak0sT0FBTyxDQUFDa00sWUFBWSxJQUFHO1VBQ3pDLElBQVksQ0FBQ0EsWUFBWSxDQUFDLEdBQUcsWUFBbUI7WUFBQSxTQUFBQyxJQUFBLEdBQUFDLFNBQUEsQ0FBQWxHLE1BQUEsRUFBZm1HLElBQVcsT0FBQUMsS0FBQSxDQUFBSCxJQUFBLEdBQUFJLElBQUEsTUFBQUEsSUFBQSxHQUFBSixJQUFBLEVBQUFJLElBQUE7Y0FBWEYsSUFBVyxDQUFBRSxJQUFBLElBQUFILFNBQUEsQ0FBQUcsSUFBQTtZQUFBO1lBQzNDeEIsS0FBSSxDQUFDeUIsY0FBYyxDQUFDTixZQUFZLEVBQUVHLElBQUksQ0FBQztVQUN6QyxDQUFDO1FBQ0gsQ0FBQyxDQUFDO01BQ0o7TUFFQUksMkJBQTJCQSxDQUFDekMsTUFBcUI7UUFDL0MsT0FBTyxJQUFJLENBQUMwQyw0QkFBNEIsQ0FBQzFDLE1BQU0sQ0FBQztNQUNsRDtNQUVBLE1BQU0wQyw0QkFBNEJBLENBQUMxQyxNQUFxQjtRQUN0RCxFQUFFLElBQUksQ0FBQ3lCLHVDQUF1QztRQUU5QztRQUNBRSxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUlBLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQ0MsS0FBSyxDQUFDQyxtQkFBbUIsQ0FDdEUsZ0JBQWdCLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDO1FBRXpDLE1BQU0sSUFBSSxDQUFDVCxNQUFNLENBQUN1QixPQUFPLENBQUMsWUFBVztVQUNuQyxJQUFJLENBQUN0QixRQUFTLENBQUNyQixNQUFNLENBQUNGLEdBQUcsQ0FBQyxHQUFHRSxNQUFNO1VBQ25DLE1BQU0sSUFBSSxDQUFDNEMsU0FBUyxDQUFDNUMsTUFBTSxDQUFDO1VBQzVCLEVBQUUsSUFBSSxDQUFDeUIsdUNBQXVDO1FBQ2hELENBQUMsQ0FBQztRQUNGLE1BQU0sSUFBSSxDQUFDNUksYUFBYTtNQUMxQjtNQUVBLE1BQU1nSyxZQUFZQSxDQUFDbk0sRUFBVTtRQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDb00sTUFBTSxFQUFFLEVBQ2hCLE1BQU0sSUFBSW5JLEtBQUssQ0FBQyxtREFBbUQsQ0FBQztRQUV0RSxPQUFPLElBQUksQ0FBQzBHLFFBQVMsQ0FBQzNLLEVBQUUsQ0FBQztRQUV6QjtRQUNBaUwsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJQSxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUNDLEtBQUssQ0FBQ0MsbUJBQW1CLENBQ3RFLGdCQUFnQixFQUFFLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRTFDLElBQUlySyxPQUFPLENBQUMsSUFBSSxDQUFDNkosUUFBUSxDQUFDLElBQ3hCLElBQUksQ0FBQ0ksdUNBQXVDLEtBQUssQ0FBQyxFQUFFO1VBQ3BELE1BQU0sSUFBSSxDQUFDc0IsS0FBSyxFQUFFO1FBQ3BCO01BQ0Y7TUFFQSxNQUFNQSxLQUFLQSxDQUFBLEVBQTJDO1FBQUEsSUFBMUNDLE9BQUEsR0FBQVosU0FBQSxDQUFBbEcsTUFBQSxRQUFBa0csU0FBQSxRQUFBVixTQUFBLEdBQUFVLFNBQUEsTUFBd0MsRUFBRTtRQUNwRCxJQUFJLENBQUMsSUFBSSxDQUFDVSxNQUFNLEVBQUUsSUFBSSxDQUFDRSxPQUFPLENBQUNDLGNBQWMsRUFDM0MsTUFBTXRJLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQztRQUU1QyxNQUFNLElBQUksQ0FBQ3dHLE9BQU8sRUFBRTtRQUVwQjtRQUNBUSxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUlBLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FDekNDLEtBQUssQ0FBQ0MsbUJBQW1CLENBQUMsZ0JBQWdCLEVBQUUsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFNUUsSUFBSSxDQUFDUixRQUFRLEdBQUcsSUFBSTtNQUN0QjtNQUVBLE1BQU02QixLQUFLQSxDQUFBO1FBQ1QsTUFBTSxJQUFJLENBQUM5QixNQUFNLENBQUMrQixTQUFTLENBQUMsTUFBSztVQUMvQixJQUFJLElBQUksQ0FBQ0wsTUFBTSxFQUFFLEVBQ2YsTUFBTW5JLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQztVQUV6RCxJQUFJLENBQUMsSUFBSSxDQUFDMkcsU0FBUyxFQUFFO1lBQ25CLE1BQU0sSUFBSTNHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQztVQUNyQztVQUVBLElBQUksQ0FBQzJHLFNBQVMsRUFBRTtVQUNoQixJQUFJLENBQUNDLFFBQVEsR0FBRyxJQUFJO1FBQ3RCLENBQUMsQ0FBQztNQUNKO01BRUEsTUFBTTZCLFVBQVVBLENBQUNySSxHQUFVO1FBQ3pCLE1BQU0sSUFBSSxDQUFDcUcsTUFBTSxDQUFDdUIsT0FBTyxDQUFDLE1BQUs7VUFDN0IsSUFBSSxJQUFJLENBQUNHLE1BQU0sRUFBRSxFQUNmLE1BQU1uSSxLQUFLLENBQUMsaURBQWlELENBQUM7VUFDaEUsSUFBSSxDQUFDb0ksS0FBSyxDQUFDO1lBQUVFLGNBQWMsRUFBRTtVQUFJLENBQUUsQ0FBQztVQUNwQyxNQUFNbEksR0FBRztRQUNYLENBQUMsQ0FBQztNQUNKO01BRUEsTUFBTXNJLE9BQU9BLENBQUNDLEVBQWM7UUFDMUIsTUFBTSxJQUFJLENBQUNsQyxNQUFNLENBQUMrQixTQUFTLENBQUMsWUFBVztVQUNyQyxJQUFJLENBQUMsSUFBSSxDQUFDTCxNQUFNLEVBQUUsRUFDaEIsTUFBTW5JLEtBQUssQ0FBQyx1REFBdUQsQ0FBQztVQUN0RSxNQUFNMkksRUFBRSxFQUFFO1FBQ1osQ0FBQyxDQUFDO01BQ0o7TUFFQXJCLGFBQWFBLENBQUE7UUFDWCxPQUFPLElBQUksQ0FBQ2YsUUFBUSxHQUNoQixDQUFDLGFBQWEsRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLFNBQVMsQ0FBQyxHQUNwRCxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDO01BQ3JDO01BRUE0QixNQUFNQSxDQUFBO1FBQ0osT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDdkIsUUFBUTtNQUN4QjtNQUVBaUIsY0FBY0EsQ0FBQ04sWUFBb0IsRUFBRUcsSUFBVztRQUM5QyxJQUFJLENBQUNqQixNQUFNLENBQUMrQixTQUFTLENBQUMsWUFBVztVQUMvQixJQUFJLENBQUMsSUFBSSxDQUFDOUIsUUFBUSxFQUFFO1VBRXBCLE1BQU0sSUFBSSxDQUFDRyxNQUFNLENBQUMrQixXQUFXLENBQUNyQixZQUFZLENBQUMsQ0FBQ3NCLEtBQUssQ0FBQyxJQUFJLEVBQUVuQixJQUFJLENBQUM7VUFDN0QsSUFBSSxDQUFDLElBQUksQ0FBQ1MsTUFBTSxFQUFFLElBQ2ZaLFlBQVksS0FBSyxPQUFPLElBQUlBLFlBQVksS0FBSyxhQUFjLEVBQUU7WUFDOUQsTUFBTSxJQUFJdkgsS0FBSyxRQUFBa0UsTUFBQSxDQUFRcUQsWUFBWSx5QkFBc0IsQ0FBQztVQUM1RDtVQUVBLEtBQUssTUFBTXVCLFFBQVEsSUFBSTlNLE1BQU0sQ0FBQytNLElBQUksQ0FBQyxJQUFJLENBQUNyQyxRQUFRLENBQUMsRUFBRTtZQUNqRCxNQUFNckIsTUFBTSxHQUFHLElBQUksQ0FBQ3FCLFFBQVEsSUFBSSxJQUFJLENBQUNBLFFBQVEsQ0FBQ29DLFFBQVEsQ0FBQztZQUV2RCxJQUFJLENBQUN6RCxNQUFNLEVBQUU7WUFFYixNQUFNdEYsUUFBUSxHQUFJc0YsTUFBYyxLQUFBbkIsTUFBQSxDQUFLcUQsWUFBWSxFQUFHO1lBRXBELElBQUksQ0FBQ3hILFFBQVEsRUFBRTtZQUVmc0YsTUFBTSxDQUFDMkQsZUFBZSxDQUFDNUIsSUFBSSxDQUFDckgsUUFBUSxDQUFDOEksS0FBSyxDQUN4QyxJQUFJLEVBQ0p4RCxNQUFNLENBQUM0RCxvQkFBb0IsR0FBR3ZCLElBQUksR0FBR3dCLEtBQUssQ0FBQ3ZPLEtBQUssQ0FBQytNLElBQUksQ0FBQyxDQUN2RCxDQUFDO1VBQ0o7UUFDRixDQUFDLENBQUM7TUFDSjtNQUVBLE1BQU1PLFNBQVNBLENBQUM1QyxNQUFxQjtRQUNuQyxNQUFNRyxHQUFHLEdBQUcsSUFBSSxDQUFDZSxRQUFRLEdBQUdsQixNQUFNLENBQUM4RCxZQUFZLEdBQUc5RCxNQUFNLENBQUMrRCxNQUFNO1FBQy9ELElBQUksQ0FBQzVELEdBQUcsRUFBRTtRQUVWLE1BQU02RCxXQUFXLEdBQW9CLEVBQUU7UUFFdkMsSUFBSSxDQUFDeEMsTUFBTSxDQUFDeUMsSUFBSSxDQUFDak8sT0FBTyxDQUFDLENBQUNpSixHQUFRLEVBQUV2SSxFQUFVLEtBQUk7VUFDaEQsSUFBSSxFQUFFc0osTUFBTSxDQUFDRixHQUFHLElBQUksSUFBSSxDQUFDdUIsUUFBUyxDQUFDLEVBQUU7WUFDbkMsTUFBTTFHLEtBQUssQ0FBQyxpREFBaUQsQ0FBQztVQUNoRTtVQUVBLE1BQUF1SixLQUFBLEdBQTJCbEUsTUFBTSxDQUFDNEQsb0JBQW9CLEdBQUczRSxHQUFHLEdBQUc0RSxLQUFLLENBQUN2TyxLQUFLLENBQUMySixHQUFHLENBQUM7WUFBekU7Y0FBRWE7WUFBYyxDQUFFLEdBQUFvRSxLQUFBO1lBQVJDLE1BQU0sR0FBQXhELHdCQUFBLENBQUF1RCxLQUFBLEVBQUF0RCxTQUFBO1VBRXRCLE1BQU13RCxPQUFPLEdBQUcsSUFBSSxDQUFDbEQsUUFBUSxHQUMzQmYsR0FBRyxDQUFDekosRUFBRSxFQUFFeU4sTUFBTSxFQUFFLElBQUksQ0FBQyxHQUNyQmhFLEdBQUcsQ0FBQ3pKLEVBQUUsRUFBRXlOLE1BQU0sQ0FBQztVQUVqQkgsV0FBVyxDQUFDck8sSUFBSSxDQUFDeU8sT0FBTyxDQUFDO1FBQzNCLENBQUMsQ0FBQztRQUVGLE1BQU0zSyxPQUFPLENBQUM0SyxHQUFHLENBQUNMLFdBQVcsQ0FBQztRQUU5QmhFLE1BQU0sQ0FBQ3NFLHVCQUF1QixFQUFFO01BQ2xDOztJQUNEdE4sc0JBQUE7RUFBQSxTQUFBQyxXQUFBO0lBQUEsT0FBQUQsc0JBQUEsQ0FBQUMsV0FBQTtFQUFBO0VBQUFELHNCQUFBO0FBQUE7RUFBQUUsSUFBQTtFQUFBQyxLQUFBO0FBQUEsRzs7Ozs7Ozs7Ozs7QUNoTUQxQyxNQUFNLENBQUNqQixNQUFNLENBQUM7RUFBQytRLFVBQVUsRUFBQ0EsQ0FBQSxLQUFJQTtBQUFVLENBQUMsQ0FBQztBQUFuQyxNQUFNQSxVQUFVLENBQUM7RUFDdEJyTSxXQUFXQSxDQUFDc00sZUFBZSxFQUFFO0lBQzNCLElBQUksQ0FBQ0MsZ0JBQWdCLEdBQUdELGVBQWU7SUFDdkM7SUFDQSxJQUFJLENBQUNFLGVBQWUsR0FBRyxJQUFJQyxHQUFHLENBQUMsQ0FBQztFQUNsQzs7RUFFQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQSxNQUFNQyxLQUFLQSxDQUFDdk8sY0FBYyxFQUFFSyxFQUFFLEVBQUV5RCxFQUFFLEVBQUVPLFFBQVEsRUFBRTtJQUM1QyxNQUFNeEQsSUFBSSxHQUFHLElBQUk7SUFHakIyTixLQUFLLENBQUN4TyxjQUFjLEVBQUV5TyxNQUFNLENBQUM7SUFDN0JELEtBQUssQ0FBQzFLLEVBQUUsRUFBRXhELE1BQU0sQ0FBQzs7SUFHakI7SUFDQTtJQUNBLElBQUlPLElBQUksQ0FBQ3dOLGVBQWUsQ0FBQ0ssR0FBRyxDQUFDNUssRUFBRSxDQUFDLEVBQUU7TUFDaENqRCxJQUFJLENBQUN3TixlQUFlLENBQUM5UCxHQUFHLENBQUN1RixFQUFFLENBQUMsQ0FBQ3hFLElBQUksQ0FBQytFLFFBQVEsQ0FBQztNQUMzQztJQUNGO0lBRUEsTUFBTXNLLFNBQVMsR0FBRyxDQUFDdEssUUFBUSxDQUFDO0lBQzVCeEQsSUFBSSxDQUFDd04sZUFBZSxDQUFDTyxHQUFHLENBQUM5SyxFQUFFLEVBQUU2SyxTQUFTLENBQUM7SUFFdkMsSUFBSTtNQUNGLElBQUkvRixHQUFHLEdBQ0wsQ0FBQyxNQUFNL0gsSUFBSSxDQUFDdU4sZ0JBQWdCLENBQUNsSixZQUFZLENBQUNsRixjQUFjLEVBQUU7UUFDeER5SixHQUFHLEVBQUVwSjtNQUNQLENBQUMsQ0FBQyxLQUFLLElBQUk7TUFDYjtNQUNBO01BQ0EsT0FBT3NPLFNBQVMsQ0FBQzlJLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDM0I7UUFDQTtRQUNBO1FBQ0E7UUFDQThJLFNBQVMsQ0FBQzdGLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFMEUsS0FBSyxDQUFDdk8sS0FBSyxDQUFDMkosR0FBRyxDQUFDLENBQUM7TUFDekM7SUFDRixDQUFDLENBQUMsT0FBT3JELENBQUMsRUFBRTtNQUNWLE9BQU9vSixTQUFTLENBQUM5SSxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQzNCOEksU0FBUyxDQUFDN0YsR0FBRyxDQUFDLENBQUMsQ0FBQ3ZELENBQUMsQ0FBQztNQUNwQjtJQUNGLENBQUMsU0FBUztNQUNSO01BQ0E7TUFDQTFFLElBQUksQ0FBQ3dOLGVBQWUsQ0FBQ1EsTUFBTSxDQUFDL0ssRUFBRSxDQUFDO0lBQ2pDO0VBQ0Y7QUFDRixDOzs7Ozs7Ozs7Ozs7OztJQzFEQTFGLE1BQUEsQ0FBT2pCLE1BQUE7TUFBUTJSLG9CQUFNLEVBQUFBLENBQUEsS0FBa0JBO0lBQUE7SUFBQSxJQUFBQyxRQUFBO0lBQUEzUSxNQUFBLENBQUFiLElBQUE7TUFBQXlELFFBQUF4RCxDQUFBO1FBQUF1UixRQUFBLEdBQUF2UixDQUFBO01BQUE7SUFBQTtJQUFBLElBQUFKLFNBQUE7SUFBQWdCLE1BQUEsQ0FBQWIsSUFBQTtNQUFBSCxVQUFBSSxDQUFBO1FBQUFKLFNBQUEsR0FBQUksQ0FBQTtNQUFBO0lBQUE7SUFBQSxJQUFBSSxvQkFBQSxXQUFBQSxvQkFBQTtJQVl2QyxNQUFNb1IsbUJBQW1CLEdBQUcsRUFBRXhOLE9BQU8sQ0FBQ0MsR0FBRyxDQUFDd04sMEJBQTBCLElBQUksRUFBRSxDQUFDLElBQUksRUFBRTtJQUNqRixNQUFNQyxtQkFBbUIsR0FBRyxFQUFFMU4sT0FBTyxDQUFDQyxHQUFHLENBQUMwTiwwQkFBMEIsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLEdBQUcsSUFBSTtJQUV4Rjs7Ozs7Ozs7OztJQVVNLE1BQU9MLG9CQUFvQjtNQWdCL0JqTixZQUFZOEssT0FBb0M7UUFBQSxLQWZ4Q3lDLFFBQVE7UUFBQSxLQUNSQyxrQkFBa0I7UUFBQSxLQUNsQkMsWUFBWTtRQUFBLEtBQ1p6RSxRQUFRO1FBQUEsS0FDUjBFLFlBQVk7UUFBQSxLQUNaQyxjQUFjO1FBQUEsS0FDZG5OLFFBQVE7UUFBQSxLQUNSb04sT0FBTztRQUFBLEtBQ1BDLFFBQVE7UUFBQSxLQUNSQyw0QkFBNEI7UUFBQSxLQUM1QkMsY0FBYztRQUFBLEtBQ2RDLHNCQUFzQjtRQUFBLEtBQ3RCQyxVQUFVO1FBQUEsS0FDVkMscUJBQXFCO1FBRzNCLElBQUksQ0FBQ1gsUUFBUSxHQUFHekMsT0FBTztRQUN2QixJQUFJLENBQUMwQyxrQkFBa0IsR0FBRzFDLE9BQU8sQ0FBQ3pOLGlCQUFpQjtRQUNuRCxJQUFJLENBQUNvUSxZQUFZLEdBQUczQyxPQUFPLENBQUNxRCxXQUFXO1FBQ3ZDLElBQUksQ0FBQ25GLFFBQVEsR0FBRzhCLE9BQU8sQ0FBQ2hDLE9BQU87UUFDL0IsSUFBSSxDQUFDNEUsWUFBWSxHQUFHNUMsT0FBTyxDQUFDc0QsV0FBVztRQUN2QyxJQUFJLENBQUNULGNBQWMsR0FBRyxFQUFFO1FBQ3hCLElBQUksQ0FBQ25OLFFBQVEsR0FBRyxLQUFLO1FBRXJCLElBQUksQ0FBQ29OLE9BQU8sR0FBRyxJQUFJLENBQUNILFlBQVksQ0FBQ1kseUJBQXlCLENBQ3hELElBQUksQ0FBQ2Isa0JBQWtCLENBQUM7UUFFMUIsSUFBSSxDQUFDSyxRQUFRLEdBQUcsSUFBSTtRQUNwQixJQUFJLENBQUNDLDRCQUE0QixHQUFHLENBQUM7UUFDckMsSUFBSSxDQUFDQyxjQUFjLEdBQUcsRUFBRTtRQUV4QixJQUFJLENBQUNDLHNCQUFzQixHQUFHZCxRQUFRLENBQ3BDLElBQUksQ0FBQ29CLGlDQUFpQyxDQUFDQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQ2pELElBQUksQ0FBQ2Ysa0JBQWtCLENBQUMxQyxPQUFPLENBQUMwRCxpQkFBaUIsSUFBSXJCLG1CQUFtQixDQUN6RTtRQUVELElBQUksQ0FBQ2MsVUFBVSxHQUFHLElBQUtuUixNQUFjLENBQUM4TSxrQkFBa0IsRUFBRTtNQUM1RDtNQUVBLE1BQU02RSxLQUFLQSxDQUFBO1FBQUEsSUFBQUMsa0JBQUE7UUFDVCxNQUFNNUQsT0FBTyxHQUFHLElBQUksQ0FBQ3lDLFFBQVE7UUFDN0IsTUFBTW9CLGVBQWUsR0FBRyxNQUFNcFQsU0FBUyxDQUNyQyxJQUFJLENBQUNpUyxrQkFBa0IsRUFDdEI1SyxZQUFpQixJQUFJO1VBQ3BCLE1BQU1nTSxLQUFLLEdBQUlsUixTQUFpQixDQUFDbVIsZ0JBQWdCLEVBQUU7VUFDbkQsSUFBSUQsS0FBSyxFQUFFO1lBQ1QsSUFBSSxDQUFDYixjQUFjLENBQUN0USxJQUFJLENBQUNtUixLQUFLLENBQUNFLFVBQVUsRUFBRSxDQUFDO1VBQzlDO1VBQ0EsSUFBSSxJQUFJLENBQUNoQiw0QkFBNEIsS0FBSyxDQUFDLEVBQUU7WUFDM0MsSUFBSSxDQUFDRSxzQkFBc0IsRUFBRTtVQUMvQjtRQUNGLENBQUMsQ0FDRjtRQUVELElBQUksQ0FBQ0wsY0FBYyxDQUFDbFEsSUFBSSxDQUFDLFlBQVc7VUFBRyxNQUFNa1IsZUFBZSxDQUFDOVEsSUFBSSxFQUFFO1FBQUUsQ0FBQyxDQUFDO1FBRXZFLElBQUlpTixPQUFPLENBQUNvRCxxQkFBcUIsRUFBRTtVQUNqQyxJQUFJLENBQUNBLHFCQUFxQixHQUFHcEQsT0FBTyxDQUFDb0QscUJBQXFCO1FBQzVELENBQUMsTUFBTTtVQUNMLE1BQU1hLGVBQWUsR0FDbkIsSUFBSSxDQUFDdkIsa0JBQWtCLENBQUMxQyxPQUFPLENBQUNrRSxpQkFBaUIsSUFDakQsSUFBSSxDQUFDeEIsa0JBQWtCLENBQUMxQyxPQUFPLENBQUNtRSxnQkFBZ0IsSUFDaEQ1QixtQkFBbUI7VUFFckIsTUFBTTZCLGNBQWMsR0FBR3BTLE1BQU0sQ0FBQ3FTLFdBQVcsQ0FDdkMsSUFBSSxDQUFDbkIsc0JBQXNCLENBQUNPLElBQUksQ0FBQyxJQUFJLENBQUMsRUFDdENRLGVBQWUsQ0FDaEI7VUFFRCxJQUFJLENBQUNwQixjQUFjLENBQUNsUSxJQUFJLENBQUMsTUFBSztZQUM1QlgsTUFBTSxDQUFDc1MsYUFBYSxDQUFDRixjQUFjLENBQUM7VUFDdEMsQ0FBQyxDQUFDO1FBQ0o7UUFFQSxNQUFNLElBQUksQ0FBQ1osaUNBQWlDLEVBQUU7UUFFN0MsQ0FBQUksa0JBQUEsR0FBQWpGLE9BQU8sQ0FBQyxZQUFZLENBQVMsY0FBQWlGLGtCQUFBLHVCQUE3QkEsa0JBQUEsQ0FBK0JoRixLQUFLLENBQUNDLG1CQUFtQixDQUN2RCxnQkFBZ0IsRUFBRSx5QkFBeUIsRUFBRSxDQUFDLENBQUM7TUFDbkQ7TUFFQSxNQUFNMkUsaUNBQWlDQSxDQUFBO1FBQ3JDLElBQUksSUFBSSxDQUFDUiw0QkFBNEIsR0FBRyxDQUFDLEVBQUU7UUFDM0MsRUFBRSxJQUFJLENBQUNBLDRCQUE0QjtRQUNuQyxNQUFNLElBQUksQ0FBQ0csVUFBVSxDQUFDeEQsT0FBTyxDQUFDLFlBQVc7VUFDdkMsTUFBTSxJQUFJLENBQUM0RSxVQUFVLEVBQUU7UUFDekIsQ0FBQyxDQUFDO01BQ0o7TUFFQUMsZUFBZUEsQ0FBQTtRQUNiLEVBQUUsSUFBSSxDQUFDeEIsNEJBQTRCO1FBQ25DLElBQUksQ0FBQ0csVUFBVSxDQUFDeEQsT0FBTyxDQUFDLE1BQUssQ0FBRSxDQUFDLENBQUM7UUFFakMsSUFBSSxJQUFJLENBQUNxRCw0QkFBNEIsS0FBSyxDQUFDLEVBQUU7VUFDM0MsTUFBTSxJQUFJckwsS0FBSyxvQ0FBQWtFLE1BQUEsQ0FBb0MsSUFBSSxDQUFDbUgsNEJBQTRCLENBQUUsQ0FBQztRQUN6RjtNQUNGO01BRUEsTUFBTXlCLGNBQWNBLENBQUE7UUFDbEIsSUFBSSxJQUFJLENBQUN6Qiw0QkFBNEIsS0FBSyxDQUFDLEVBQUU7VUFDM0MsTUFBTSxJQUFJckwsS0FBSyxvQ0FBQWtFLE1BQUEsQ0FBb0MsSUFBSSxDQUFDbUgsNEJBQTRCLENBQUUsQ0FBQztRQUN6RjtRQUNBLE1BQU0sSUFBSSxDQUFDRyxVQUFVLENBQUN4RCxPQUFPLENBQUMsWUFBVztVQUN2QyxNQUFNLElBQUksQ0FBQzRFLFVBQVUsRUFBRTtRQUN6QixDQUFDLENBQUM7TUFDSjtNQUVBLE1BQU1BLFVBQVVBLENBQUE7UUFBQSxJQUFBRyxxQkFBQTtRQUNkLEVBQUUsSUFBSSxDQUFDMUIsNEJBQTRCO1FBRW5DLElBQUksSUFBSSxDQUFDdE4sUUFBUSxFQUFFO1FBRW5CLElBQUlpUCxLQUFLLEdBQUcsS0FBSztRQUNqQixJQUFJQyxVQUFVO1FBQ2QsSUFBSUMsVUFBVSxHQUFHLElBQUksQ0FBQzlCLFFBQVE7UUFFOUIsSUFBSSxDQUFDOEIsVUFBVSxFQUFFO1VBQ2ZGLEtBQUssR0FBRyxJQUFJO1VBQ1pFLFVBQVUsR0FBRyxJQUFJLENBQUMzRyxRQUFRLEdBQUcsRUFBRSxHQUFHLElBQUszSyxlQUF1QixDQUFDdVIsTUFBTSxDQUFOLENBQU07UUFDdkU7UUFFQSxDQUFBSixxQkFBQSxPQUFJLENBQUN0QixxQkFBcUIsY0FBQXNCLHFCQUFBLHVCQUExQkEscUJBQUEsQ0FBQUssSUFBQSxLQUE0QixDQUFFO1FBRTlCLE1BQU1DLGNBQWMsR0FBRyxJQUFJLENBQUMvQixjQUFjO1FBQzFDLElBQUksQ0FBQ0EsY0FBYyxHQUFHLEVBQUU7UUFFeEIsSUFBSTtVQUNGMkIsVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDOUIsT0FBTyxDQUFDbUMsYUFBYSxDQUFDLElBQUksQ0FBQy9HLFFBQVEsQ0FBQztRQUM5RCxDQUFDLENBQUMsT0FBT3RGLENBQU0sRUFBRTtVQUNmLElBQUkrTCxLQUFLLElBQUksT0FBTy9MLENBQUMsQ0FBQ3NNLElBQUssS0FBSyxRQUFRLEVBQUU7WUFDeEMsTUFBTSxJQUFJLENBQUN0QyxZQUFZLENBQUN4QyxVQUFVLENBQ2hDLElBQUl6SSxLQUFLLGtDQUFBa0UsTUFBQSxDQUVML0MsSUFBSSxDQUFDQyxTQUFTLENBQUMsSUFBSSxDQUFDMkosa0JBQWtCLENBQ3hDLFFBQUE3RyxNQUFBLENBQUtqRCxDQUFDLENBQUN1TSxPQUFPLENBQUUsQ0FDakIsQ0FDRjtVQUNIO1VBRUE3RixLQUFLLENBQUNqTixTQUFTLENBQUNNLElBQUksQ0FBQzZOLEtBQUssQ0FBQyxJQUFJLENBQUN5QyxjQUFjLEVBQUUrQixjQUFjLENBQUM7VUFDL0RoVCxNQUFNLENBQUNnRyxNQUFNLGtDQUFBNkQsTUFBQSxDQUNYL0MsSUFBSSxDQUFDQyxTQUFTLENBQUMsSUFBSSxDQUFDMkosa0JBQWtCLENBQUMsR0FBSTlKLENBQUMsQ0FBQztVQUMvQztRQUNGO1FBRUEsSUFBSSxDQUFDLElBQUksQ0FBQ2xELFFBQVEsRUFBRTtVQUNqQm5DLGVBQXVCLENBQUM2UixpQkFBaUIsQ0FDeEMsSUFBSSxDQUFDbEgsUUFBUSxFQUFFMkcsVUFBVSxFQUFFRCxVQUFVLEVBQUUsSUFBSSxDQUFDaEMsWUFBWSxDQUFDO1FBQzdEO1FBRUEsSUFBSStCLEtBQUssRUFBRSxJQUFJLENBQUMvQixZQUFZLENBQUMxQyxLQUFLLEVBQUU7UUFFcEMsSUFBSSxDQUFDNkMsUUFBUSxHQUFHNkIsVUFBVTtRQUUxQixNQUFNLElBQUksQ0FBQ2hDLFlBQVksQ0FBQ3ZDLE9BQU8sQ0FBQyxZQUFXO1VBQ3pDLEtBQUssTUFBTWdGLENBQUMsSUFBSUwsY0FBYyxFQUFFO1lBQzlCLE1BQU1LLENBQUMsQ0FBQ0MsU0FBUyxFQUFFO1VBQ3JCO1FBQ0YsQ0FBQyxDQUFDO01BQ0o7TUFFQSxNQUFNdlMsSUFBSUEsQ0FBQTtRQUFBLElBQUF3UyxtQkFBQTtRQUNSLElBQUksQ0FBQzdQLFFBQVEsR0FBRyxJQUFJO1FBRXBCLEtBQUssTUFBTWdDLFFBQVEsSUFBSSxJQUFJLENBQUNtTCxjQUFjLEVBQUU7VUFDMUMsTUFBTW5MLFFBQVEsRUFBRTtRQUNsQjtRQUVBLEtBQUssTUFBTTJOLENBQUMsSUFBSSxJQUFJLENBQUNwQyxjQUFjLEVBQUU7VUFDbkMsTUFBTW9DLENBQUMsQ0FBQ0MsU0FBUyxFQUFFO1FBQ3JCO1FBRUMsQ0FBQUMsbUJBQUEsR0FBQTVHLE9BQU8sQ0FBQyxZQUFZLENBQVMsY0FBQTRHLG1CQUFBLHVCQUE3QkEsbUJBQUEsQ0FBK0IzRyxLQUFLLENBQUNDLG1CQUFtQixDQUN2RCxnQkFBZ0IsRUFBRSx5QkFBeUIsRUFBRSxDQUFDLENBQUMsQ0FBQztNQUNwRDs7SUFDRDdLLHNCQUFBO0VBQUEsU0FBQUMsV0FBQTtJQUFBLE9BQUFELHNCQUFBLENBQUFDLFdBQUE7RUFBQTtFQUFBRCxzQkFBQTtBQUFBO0VBQUFFLElBQUE7RUFBQUMsS0FBQTtBQUFBLEc7Ozs7Ozs7Ozs7Ozs7O0lDeE1ELElBQUlxUixjQUFjO0lBQUMvVCxNQUFNLENBQUNiLElBQUksQ0FBQyxzQ0FBc0MsRUFBQztNQUFDeUQsT0FBT0EsQ0FBQ3hELENBQUMsRUFBQztRQUFDMlUsY0FBYyxHQUFDM1UsQ0FBQztNQUFBO0lBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUF2R1ksTUFBTSxDQUFDakIsTUFBTSxDQUFDO01BQUNPLGtCQUFrQixFQUFDQSxDQUFBLEtBQUlBO0lBQWtCLENBQUMsQ0FBQztJQUFDLElBQUlnUixHQUFHO0lBQUN0USxNQUFNLENBQUNiLElBQUksQ0FBQyxZQUFZLEVBQUM7TUFBQ3lELE9BQU9BLENBQUN4RCxDQUFDLEVBQUM7UUFBQ2tSLEdBQUcsR0FBQ2xSLENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJMkQsT0FBTztJQUFDL0MsTUFBTSxDQUFDYixJQUFJLENBQUMsZ0JBQWdCLEVBQUM7TUFBQ3lELE9BQU9BLENBQUN4RCxDQUFDLEVBQUM7UUFBQzJELE9BQU8sR0FBQzNELENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJNFUsa0JBQWtCO0lBQUNoVSxNQUFNLENBQUNiLElBQUksQ0FBQyxzQkFBc0IsRUFBQztNQUFDNlUsa0JBQWtCQSxDQUFDNVUsQ0FBQyxFQUFDO1FBQUM0VSxrQkFBa0IsR0FBQzVVLENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJZ1IsS0FBSyxFQUFDNkQsS0FBSztJQUFDalUsTUFBTSxDQUFDYixJQUFJLENBQUMsY0FBYyxFQUFDO01BQUNpUixLQUFLQSxDQUFDaFIsQ0FBQyxFQUFDO1FBQUNnUixLQUFLLEdBQUNoUixDQUFDO01BQUEsQ0FBQztNQUFDNlUsS0FBS0EsQ0FBQzdVLENBQUMsRUFBQztRQUFDNlUsS0FBSyxHQUFDN1UsQ0FBQztNQUFBO0lBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUFDLElBQUk0RCxpQkFBaUI7SUFBQ2hELE1BQU0sQ0FBQ2IsSUFBSSxDQUFDLHNCQUFzQixFQUFDO01BQUM2RCxpQkFBaUJBLENBQUM1RCxDQUFDLEVBQUM7UUFBQzRELGlCQUFpQixHQUFDNUQsQ0FBQztNQUFBO0lBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUFDLElBQUlILGNBQWMsRUFBQ0QsU0FBUztJQUFDZ0IsTUFBTSxDQUFDYixJQUFJLENBQUMsZ0JBQWdCLEVBQUM7TUFBQ0YsY0FBY0EsQ0FBQ0csQ0FBQyxFQUFDO1FBQUNILGNBQWMsR0FBQ0csQ0FBQztNQUFBLENBQUM7TUFBQ0osU0FBU0EsQ0FBQ0ksQ0FBQyxFQUFDO1FBQUNKLFNBQVMsR0FBQ0ksQ0FBQztNQUFBO0lBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUFDLElBQUk4VSxNQUFNO0lBQUNsVSxNQUFNLENBQUNiLElBQUksQ0FBQyxVQUFVLEVBQUM7TUFBQytVLE1BQU1BLENBQUM5VSxDQUFDLEVBQUM7UUFBQzhVLE1BQU0sR0FBQzlVLENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJMEMsZUFBZTtJQUFDOUIsTUFBTSxDQUFDYixJQUFJLENBQUMsbUNBQW1DLEVBQUM7TUFBQ3lELE9BQU9BLENBQUN4RCxDQUFDLEVBQUM7UUFBQzBDLGVBQWUsR0FBQzFDLENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJMEQsT0FBTztJQUFDOUMsTUFBTSxDQUFDYixJQUFJLENBQUMsaUJBQWlCLEVBQUM7TUFBQzJELE9BQU9BLENBQUMxRCxDQUFDLEVBQUM7UUFBQzBELE9BQU8sR0FBQzFELENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJSSxvQkFBb0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNQSxvQkFBb0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQVU5M0IsSUFBSTJVLEtBQUssR0FBRztNQUNWQyxRQUFRLEVBQUUsVUFBVTtNQUNwQkMsUUFBUSxFQUFFLFVBQVU7TUFDcEJDLE1BQU0sRUFBRTtJQUNWLENBQUM7O0lBRUQ7SUFDQTtJQUNBLElBQUlDLGVBQWUsR0FBRyxTQUFBQSxDQUFBLEVBQVksQ0FBQyxDQUFDO0lBQ3BDLElBQUlDLHVCQUF1QixHQUFHLFNBQUFBLENBQVVDLENBQUMsRUFBRTtNQUN6QyxPQUFPLFlBQVk7UUFDakIsSUFBSTtVQUNGQSxDQUFDLENBQUMxRixLQUFLLENBQUMsSUFBSSxFQUFFcEIsU0FBUyxDQUFDO1FBQzFCLENBQUMsQ0FBQyxPQUFPeEcsQ0FBQyxFQUFFO1VBQ1YsSUFBSSxFQUFFQSxDQUFDLFlBQVlvTixlQUFlLENBQUMsRUFDakMsTUFBTXBOLENBQUM7UUFDWDtNQUNGLENBQUM7SUFDSCxDQUFDO0lBRUQsSUFBSXVOLFNBQVMsR0FBRyxDQUFDOztJQUVqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDTyxNQUFNcFYsa0JBQWtCLEdBQUcsU0FBQUEsQ0FBVWlQLE9BQU8sRUFBRTtNQUNuRCxNQUFNOUwsSUFBSSxHQUFHLElBQUk7TUFDakJBLElBQUksQ0FBQ2tTLFVBQVUsR0FBRyxJQUFJLENBQUMsQ0FBRTs7TUFFekJsUyxJQUFJLENBQUM0SSxHQUFHLEdBQUdxSixTQUFTO01BQ3BCQSxTQUFTLEVBQUU7TUFFWGpTLElBQUksQ0FBQ3dPLGtCQUFrQixHQUFHMUMsT0FBTyxDQUFDek4saUJBQWlCO01BQ25EMkIsSUFBSSxDQUFDeU8sWUFBWSxHQUFHM0MsT0FBTyxDQUFDcUQsV0FBVztNQUN2Q25QLElBQUksQ0FBQzBPLFlBQVksR0FBRzVDLE9BQU8sQ0FBQ3NELFdBQVc7TUFFdkMsSUFBSXRELE9BQU8sQ0FBQ2hDLE9BQU8sRUFBRTtRQUNuQixNQUFNckcsS0FBSyxDQUFDLDJEQUEyRCxDQUFDO01BQzFFO01BRUEsTUFBTTBPLE1BQU0sR0FBR3JHLE9BQU8sQ0FBQ3FHLE1BQU07TUFDN0I7TUFDQTtNQUNBLE1BQU1DLFVBQVUsR0FBR0QsTUFBTSxJQUFJQSxNQUFNLENBQUNFLGFBQWEsQ0FBQyxDQUFDO01BRW5ELElBQUl2RyxPQUFPLENBQUN6TixpQkFBaUIsQ0FBQ3lOLE9BQU8sQ0FBQ3dHLEtBQUssRUFBRTtRQUMzQztRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztRQUVBLE1BQU1DLFdBQVcsR0FBRztVQUFFQyxLQUFLLEVBQUVuVCxlQUFlLENBQUN1UjtRQUFPLENBQUM7UUFDckQ1USxJQUFJLENBQUN5UyxNQUFNLEdBQUd6UyxJQUFJLENBQUN3TyxrQkFBa0IsQ0FBQzFDLE9BQU8sQ0FBQ3dHLEtBQUs7UUFDbkR0UyxJQUFJLENBQUMwUyxXQUFXLEdBQUdOLFVBQVU7UUFDN0JwUyxJQUFJLENBQUMyUyxPQUFPLEdBQUdSLE1BQU07UUFDckJuUyxJQUFJLENBQUM0UyxrQkFBa0IsR0FBRyxJQUFJQyxVQUFVLENBQUNULFVBQVUsRUFBRUcsV0FBVyxDQUFDO1FBQ2pFO1FBQ0F2UyxJQUFJLENBQUM4UyxVQUFVLEdBQUcsSUFBSUMsT0FBTyxDQUFDWCxVQUFVLEVBQUVHLFdBQVcsQ0FBQztNQUN4RCxDQUFDLE1BQU07UUFDTHZTLElBQUksQ0FBQ3lTLE1BQU0sR0FBRyxDQUFDO1FBQ2Z6UyxJQUFJLENBQUMwUyxXQUFXLEdBQUcsSUFBSTtRQUN2QjFTLElBQUksQ0FBQzJTLE9BQU8sR0FBRyxJQUFJO1FBQ25CM1MsSUFBSSxDQUFDNFMsa0JBQWtCLEdBQUcsSUFBSTtRQUM5QjtRQUNBNVMsSUFBSSxDQUFDOFMsVUFBVSxHQUFHLElBQUl6VCxlQUFlLENBQUN1UixNQUFNLENBQUQsQ0FBQztNQUM5Qzs7TUFFQTtNQUNBO01BQ0E7TUFDQTVRLElBQUksQ0FBQ2dULG1CQUFtQixHQUFHLEtBQUs7TUFFaENoVCxJQUFJLENBQUN3QixRQUFRLEdBQUcsS0FBSztNQUNyQnhCLElBQUksQ0FBQ2lULFlBQVksR0FBRyxFQUFFO01BQ3RCalQsSUFBSSxDQUFDa1QsZUFBZSxHQUFHLFVBQVVDLGNBQWMsRUFBRTtRQUMvQyxNQUFNQyxlQUFlLEdBQUc1QixLQUFLLENBQUM2QixlQUFlLENBQUM7VUFBRXhVLElBQUksRUFBRXlVO1FBQVMsQ0FBQyxDQUFDO1FBQ2pFO1FBQ0EzRixLQUFLLENBQUN3RixjQUFjLEVBQUUzQixLQUFLLENBQUMrQixLQUFLLENBQUMsQ0FBQ0gsZUFBZSxDQUFDLEVBQUVBLGVBQWUsQ0FBQyxDQUFDO1FBQ3RFcFQsSUFBSSxDQUFDaVQsWUFBWSxDQUFDeFUsSUFBSSxDQUFDMFUsY0FBYyxDQUFDO01BQ3hDLENBQUM7TUFFRDFJLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSUEsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDQyxLQUFLLENBQUNDLG1CQUFtQixDQUN0RSxnQkFBZ0IsRUFBRSx1QkFBdUIsRUFBRSxDQUFDLENBQUM7TUFFL0MzSyxJQUFJLENBQUN3VCxvQkFBb0IsQ0FBQzlCLEtBQUssQ0FBQ0MsUUFBUSxDQUFDO01BRXpDM1IsSUFBSSxDQUFDeVQsUUFBUSxHQUFHM0gsT0FBTyxDQUFDNEgsT0FBTztNQUMvQjtNQUNBO01BQ0EsTUFBTXBQLFVBQVUsR0FBR3RFLElBQUksQ0FBQ3dPLGtCQUFrQixDQUFDMUMsT0FBTyxDQUFDbUIsTUFBTSxJQUFJak4sSUFBSSxDQUFDd08sa0JBQWtCLENBQUMxQyxPQUFPLENBQUN4SCxVQUFVLElBQUksQ0FBQyxDQUFDO01BQzdHdEUsSUFBSSxDQUFDMlQsYUFBYSxHQUFHdFUsZUFBZSxDQUFDdVUsa0JBQWtCLENBQUN0UCxVQUFVLENBQUM7TUFDbkU7TUFDQTtNQUNBdEUsSUFBSSxDQUFDNlQsaUJBQWlCLEdBQUc3VCxJQUFJLENBQUN5VCxRQUFRLENBQUNLLHFCQUFxQixDQUFDeFAsVUFBVSxDQUFDO01BQ3hFLElBQUk2TixNQUFNLEVBQ1JuUyxJQUFJLENBQUM2VCxpQkFBaUIsR0FBRzFCLE1BQU0sQ0FBQzJCLHFCQUFxQixDQUFDOVQsSUFBSSxDQUFDNlQsaUJBQWlCLENBQUM7TUFDL0U3VCxJQUFJLENBQUMrVCxtQkFBbUIsR0FBRzFVLGVBQWUsQ0FBQ3VVLGtCQUFrQixDQUMzRDVULElBQUksQ0FBQzZULGlCQUFpQixDQUFDO01BRXpCN1QsSUFBSSxDQUFDZ1UsWUFBWSxHQUFHLElBQUkzVSxlQUFlLENBQUN1UixNQUFNLENBQUQsQ0FBQztNQUM5QzVRLElBQUksQ0FBQ2lVLGtCQUFrQixHQUFHLElBQUk7TUFDOUJqVSxJQUFJLENBQUNrVSxnQkFBZ0IsR0FBRyxDQUFDO01BRXpCbFUsSUFBSSxDQUFDbVUseUJBQXlCLEdBQUcsS0FBSztNQUN0Q25VLElBQUksQ0FBQ29VLGdDQUFnQyxHQUFHLEVBQUU7SUFDM0MsQ0FBQztJQUVGM1UsTUFBTSxDQUFDQyxNQUFNLENBQUM3QyxrQkFBa0IsQ0FBQ3NCLFNBQVMsRUFBRTtNQUMxQ3NSLEtBQUssRUFBRSxlQUFBQSxDQUFBLEVBQWlCO1FBQ3RCLE1BQU16UCxJQUFJLEdBQUcsSUFBSTs7UUFFakI7UUFDQTtRQUNBQSxJQUFJLENBQUNrVCxlQUFlLENBQUNsVCxJQUFJLENBQUN5TyxZQUFZLENBQUM0RixZQUFZLENBQUNwUSxnQkFBZ0IsQ0FDbEU4Tix1QkFBdUIsQ0FBQyxZQUFZO1VBQ2xDLE9BQU8vUixJQUFJLENBQUNzVSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ2hDLENBQUMsQ0FDSCxDQUFDLENBQUM7UUFFRixNQUFNOVgsY0FBYyxDQUFDd0QsSUFBSSxDQUFDd08sa0JBQWtCLEVBQUUsZ0JBQWdCaFEsT0FBTyxFQUFFO1VBQ3JFd0IsSUFBSSxDQUFDa1QsZUFBZSxDQUFDLE1BQU1sVCxJQUFJLENBQUN5TyxZQUFZLENBQUM0RixZQUFZLENBQUNyUSxZQUFZLENBQ3BFeEYsT0FBTyxFQUFFLFVBQVVvRixZQUFZLEVBQUU7WUFDL0JtTyx1QkFBdUIsQ0FBQyxZQUFZO2NBQ2xDLE1BQU05TyxFQUFFLEdBQUdXLFlBQVksQ0FBQ1gsRUFBRTtjQUMxQixJQUFJVyxZQUFZLENBQUNqRSxjQUFjLElBQUlpRSxZQUFZLENBQUNoRSxZQUFZLEVBQUU7Z0JBQzVEO2dCQUNBO2dCQUNBO2dCQUNBLE9BQU9JLElBQUksQ0FBQ3NVLGdCQUFnQixDQUFDLENBQUM7Y0FDaEMsQ0FBQyxNQUFNO2dCQUNMO2dCQUNBLElBQUl0VSxJQUFJLENBQUN1VSxNQUFNLEtBQUs3QyxLQUFLLENBQUNDLFFBQVEsRUFBRTtrQkFDbEMsT0FBTzNSLElBQUksQ0FBQ3dVLHlCQUF5QixDQUFDdlIsRUFBRSxDQUFDO2dCQUMzQyxDQUFDLE1BQU07a0JBQ0wsT0FBT2pELElBQUksQ0FBQ3lVLGlDQUFpQyxDQUFDeFIsRUFBRSxDQUFDO2dCQUNuRDtjQUNGO1lBQ0YsQ0FBQyxDQUFDLENBQUMsQ0FBQztVQUNOLENBQ0YsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDOztRQUVGO1FBQ0FqRCxJQUFJLENBQUNrVCxlQUFlLENBQUMsTUFBTTNXLFNBQVMsQ0FDbEN5RCxJQUFJLENBQUN3TyxrQkFBa0IsRUFBRSxZQUFZO1VBQ25DO1VBQ0EsTUFBTW9CLEtBQUssR0FBR2xSLFNBQVMsQ0FBQ21SLGdCQUFnQixDQUFDLENBQUM7VUFDMUMsSUFBSSxDQUFDRCxLQUFLLElBQUlBLEtBQUssQ0FBQzhFLEtBQUssRUFDdkI7VUFFRixJQUFJOUUsS0FBSyxDQUFDK0Usb0JBQW9CLEVBQUU7WUFDOUIvRSxLQUFLLENBQUMrRSxvQkFBb0IsQ0FBQzNVLElBQUksQ0FBQzRJLEdBQUcsQ0FBQyxHQUFHNUksSUFBSTtZQUMzQztVQUNGO1VBRUE0UCxLQUFLLENBQUMrRSxvQkFBb0IsR0FBRyxDQUFDLENBQUM7VUFDL0IvRSxLQUFLLENBQUMrRSxvQkFBb0IsQ0FBQzNVLElBQUksQ0FBQzRJLEdBQUcsQ0FBQyxHQUFHNUksSUFBSTtVQUUzQzRQLEtBQUssQ0FBQ2dGLFlBQVksQ0FBQyxrQkFBa0I7WUFDbkMsTUFBTUMsT0FBTyxHQUFHakYsS0FBSyxDQUFDK0Usb0JBQW9CO1lBQzFDLE9BQU8vRSxLQUFLLENBQUMrRSxvQkFBb0I7O1lBRWpDO1lBQ0E7WUFDQSxNQUFNM1UsSUFBSSxDQUFDeU8sWUFBWSxDQUFDNEYsWUFBWSxDQUFDM08saUJBQWlCLENBQUMsQ0FBQztZQUV4RCxLQUFLLE1BQU1vUCxNQUFNLElBQUlyVixNQUFNLENBQUNzVixNQUFNLENBQUNGLE9BQU8sQ0FBQyxFQUFFO2NBQzNDLElBQUlDLE1BQU0sQ0FBQ3RULFFBQVEsRUFDakI7Y0FFRixNQUFNd1QsS0FBSyxHQUFHLE1BQU1wRixLQUFLLENBQUNFLFVBQVUsQ0FBQyxDQUFDO2NBQ3RDLElBQUlnRixNQUFNLENBQUNQLE1BQU0sS0FBSzdDLEtBQUssQ0FBQ0csTUFBTSxFQUFFO2dCQUNsQztnQkFDQTtnQkFDQTtnQkFDQSxNQUFNaUQsTUFBTSxDQUFDcEcsWUFBWSxDQUFDdkMsT0FBTyxDQUFDNkksS0FBSyxDQUFDNUQsU0FBUyxDQUFDO2NBQ3BELENBQUMsTUFBTTtnQkFDTDBELE1BQU0sQ0FBQ1YsZ0NBQWdDLENBQUMzVixJQUFJLENBQUN1VyxLQUFLLENBQUM7Y0FDckQ7WUFDRjtVQUNGLENBQUMsQ0FBQztRQUNKLENBQ0YsQ0FBQyxDQUFDOztRQUVGO1FBQ0E7UUFDQWhWLElBQUksQ0FBQ2tULGVBQWUsQ0FBQ2xULElBQUksQ0FBQ3lPLFlBQVksQ0FBQ3dHLFdBQVcsQ0FBQ2xELHVCQUF1QixDQUN4RSxZQUFZO1VBQ1YsT0FBTy9SLElBQUksQ0FBQ3NVLGdCQUFnQixDQUFDLENBQUM7UUFDaEMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7UUFFTjtRQUNBO1FBQ0EsT0FBT3RVLElBQUksQ0FBQ2tWLGdCQUFnQixDQUFDLENBQUM7TUFDaEMsQ0FBQztNQUNEQyxhQUFhLEVBQUUsU0FBQUEsQ0FBVTNWLEVBQUUsRUFBRXVJLEdBQUcsRUFBRTtRQUNoQyxJQUFJL0gsSUFBSSxHQUFHLElBQUk7UUFDZmxDLE1BQU0sQ0FBQ3NYLGdCQUFnQixDQUFDLFlBQVk7VUFDbEMsSUFBSW5JLE1BQU0sR0FBR3hOLE1BQU0sQ0FBQ0MsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFcUksR0FBRyxDQUFDO1VBQ25DLE9BQU9rRixNQUFNLENBQUNyRSxHQUFHO1VBQ2pCNUksSUFBSSxDQUFDOFMsVUFBVSxDQUFDL0UsR0FBRyxDQUFDdk8sRUFBRSxFQUFFUSxJQUFJLENBQUMrVCxtQkFBbUIsQ0FBQ2hNLEdBQUcsQ0FBQyxDQUFDO1VBQ3REL0gsSUFBSSxDQUFDME8sWUFBWSxDQUFDMkcsS0FBSyxDQUFDN1YsRUFBRSxFQUFFUSxJQUFJLENBQUMyVCxhQUFhLENBQUMxRyxNQUFNLENBQUMsQ0FBQzs7VUFFdkQ7VUFDQTtVQUNBO1VBQ0E7VUFDQSxJQUFJak4sSUFBSSxDQUFDeVMsTUFBTSxJQUFJelMsSUFBSSxDQUFDOFMsVUFBVSxDQUFDd0MsSUFBSSxDQUFDLENBQUMsR0FBR3RWLElBQUksQ0FBQ3lTLE1BQU0sRUFBRTtZQUN2RDtZQUNBLElBQUl6UyxJQUFJLENBQUM4UyxVQUFVLENBQUN3QyxJQUFJLENBQUMsQ0FBQyxLQUFLdFYsSUFBSSxDQUFDeVMsTUFBTSxHQUFHLENBQUMsRUFBRTtjQUM5QyxNQUFNLElBQUloUCxLQUFLLENBQUMsNkJBQTZCLElBQzVCekQsSUFBSSxDQUFDOFMsVUFBVSxDQUFDd0MsSUFBSSxDQUFDLENBQUMsR0FBR3RWLElBQUksQ0FBQ3lTLE1BQU0sQ0FBQyxHQUN0QyxvQ0FBb0MsQ0FBQztZQUN2RDtZQUVBLElBQUk4QyxnQkFBZ0IsR0FBR3ZWLElBQUksQ0FBQzhTLFVBQVUsQ0FBQzBDLFlBQVksQ0FBQyxDQUFDO1lBQ3JELElBQUlDLGNBQWMsR0FBR3pWLElBQUksQ0FBQzhTLFVBQVUsQ0FBQ3BWLEdBQUcsQ0FBQzZYLGdCQUFnQixDQUFDO1lBRTFELElBQUk1SSxLQUFLLENBQUMrSSxNQUFNLENBQUNILGdCQUFnQixFQUFFL1YsRUFBRSxDQUFDLEVBQUU7Y0FDdEMsTUFBTSxJQUFJaUUsS0FBSyxDQUFDLDBEQUEwRCxDQUFDO1lBQzdFO1lBRUF6RCxJQUFJLENBQUM4UyxVQUFVLENBQUM2QyxNQUFNLENBQUNKLGdCQUFnQixDQUFDO1lBQ3hDdlYsSUFBSSxDQUFDME8sWUFBWSxDQUFDa0gsT0FBTyxDQUFDTCxnQkFBZ0IsQ0FBQztZQUMzQ3ZWLElBQUksQ0FBQzZWLFlBQVksQ0FBQ04sZ0JBQWdCLEVBQUVFLGNBQWMsQ0FBQztVQUNyRDtRQUNGLENBQUMsQ0FBQztNQUNKLENBQUM7TUFDREssZ0JBQWdCLEVBQUUsU0FBQUEsQ0FBVXRXLEVBQUUsRUFBRTtRQUM5QixJQUFJUSxJQUFJLEdBQUcsSUFBSTtRQUNmbEMsTUFBTSxDQUFDc1gsZ0JBQWdCLENBQUMsWUFBWTtVQUNsQ3BWLElBQUksQ0FBQzhTLFVBQVUsQ0FBQzZDLE1BQU0sQ0FBQ25XLEVBQUUsQ0FBQztVQUMxQlEsSUFBSSxDQUFDME8sWUFBWSxDQUFDa0gsT0FBTyxDQUFDcFcsRUFBRSxDQUFDO1VBQzdCLElBQUksQ0FBRVEsSUFBSSxDQUFDeVMsTUFBTSxJQUFJelMsSUFBSSxDQUFDOFMsVUFBVSxDQUFDd0MsSUFBSSxDQUFDLENBQUMsS0FBS3RWLElBQUksQ0FBQ3lTLE1BQU0sRUFDekQ7VUFFRixJQUFJelMsSUFBSSxDQUFDOFMsVUFBVSxDQUFDd0MsSUFBSSxDQUFDLENBQUMsR0FBR3RWLElBQUksQ0FBQ3lTLE1BQU0sRUFDdEMsTUFBTWhQLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQzs7VUFFNUM7VUFDQTs7VUFFQSxJQUFJLENBQUN6RCxJQUFJLENBQUM0UyxrQkFBa0IsQ0FBQ21ELEtBQUssQ0FBQyxDQUFDLEVBQUU7WUFDcEM7WUFDQTtZQUNBLElBQUlDLFFBQVEsR0FBR2hXLElBQUksQ0FBQzRTLGtCQUFrQixDQUFDcUQsWUFBWSxDQUFDLENBQUM7WUFDckQsSUFBSUMsTUFBTSxHQUFHbFcsSUFBSSxDQUFDNFMsa0JBQWtCLENBQUNsVixHQUFHLENBQUNzWSxRQUFRLENBQUM7WUFDbERoVyxJQUFJLENBQUNtVyxlQUFlLENBQUNILFFBQVEsQ0FBQztZQUM5QmhXLElBQUksQ0FBQ21WLGFBQWEsQ0FBQ2EsUUFBUSxFQUFFRSxNQUFNLENBQUM7WUFDcEM7VUFDRjs7VUFFQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0EsSUFBSWxXLElBQUksQ0FBQ3VVLE1BQU0sS0FBSzdDLEtBQUssQ0FBQ0MsUUFBUSxFQUNoQzs7VUFFRjtVQUNBO1VBQ0E7VUFDQTtVQUNBLElBQUkzUixJQUFJLENBQUNnVCxtQkFBbUIsRUFDMUI7O1VBRUY7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBLE1BQU0sSUFBSXZQLEtBQUssQ0FBQywyQkFBMkIsQ0FBQztRQUM5QyxDQUFDLENBQUM7TUFDSixDQUFDO01BQ0QyUyxnQkFBZ0IsRUFBRSxTQUFBQSxDQUFVNVcsRUFBRSxFQUFFNlcsTUFBTSxFQUFFSCxNQUFNLEVBQUU7UUFDOUMsSUFBSWxXLElBQUksR0FBRyxJQUFJO1FBQ2ZsQyxNQUFNLENBQUNzWCxnQkFBZ0IsQ0FBQyxZQUFZO1VBQ2xDcFYsSUFBSSxDQUFDOFMsVUFBVSxDQUFDL0UsR0FBRyxDQUFDdk8sRUFBRSxFQUFFUSxJQUFJLENBQUMrVCxtQkFBbUIsQ0FBQ21DLE1BQU0sQ0FBQyxDQUFDO1VBQ3pELElBQUlJLFlBQVksR0FBR3RXLElBQUksQ0FBQzJULGFBQWEsQ0FBQ3VDLE1BQU0sQ0FBQztVQUM3QyxJQUFJSyxZQUFZLEdBQUd2VyxJQUFJLENBQUMyVCxhQUFhLENBQUMwQyxNQUFNLENBQUM7VUFDN0MsSUFBSUcsT0FBTyxHQUFHQyxZQUFZLENBQUNDLGlCQUFpQixDQUMxQ0osWUFBWSxFQUFFQyxZQUFZLENBQUM7VUFDN0IsSUFBSSxDQUFDalcsT0FBTyxDQUFDa1csT0FBTyxDQUFDLEVBQ25CeFcsSUFBSSxDQUFDME8sWUFBWSxDQUFDOEgsT0FBTyxDQUFDaFgsRUFBRSxFQUFFZ1gsT0FBTyxDQUFDO1FBQzFDLENBQUMsQ0FBQztNQUNKLENBQUM7TUFDRFgsWUFBWSxFQUFFLFNBQUFBLENBQVVyVyxFQUFFLEVBQUV1SSxHQUFHLEVBQUU7UUFDL0IsSUFBSS9ILElBQUksR0FBRyxJQUFJO1FBQ2ZsQyxNQUFNLENBQUNzWCxnQkFBZ0IsQ0FBQyxZQUFZO1VBQ2xDcFYsSUFBSSxDQUFDNFMsa0JBQWtCLENBQUM3RSxHQUFHLENBQUN2TyxFQUFFLEVBQUVRLElBQUksQ0FBQytULG1CQUFtQixDQUFDaE0sR0FBRyxDQUFDLENBQUM7O1VBRTlEO1VBQ0EsSUFBSS9ILElBQUksQ0FBQzRTLGtCQUFrQixDQUFDMEMsSUFBSSxDQUFDLENBQUMsR0FBR3RWLElBQUksQ0FBQ3lTLE1BQU0sRUFBRTtZQUNoRCxJQUFJa0UsYUFBYSxHQUFHM1csSUFBSSxDQUFDNFMsa0JBQWtCLENBQUM0QyxZQUFZLENBQUMsQ0FBQztZQUUxRHhWLElBQUksQ0FBQzRTLGtCQUFrQixDQUFDK0MsTUFBTSxDQUFDZ0IsYUFBYSxDQUFDOztZQUU3QztZQUNBO1lBQ0EzVyxJQUFJLENBQUNnVCxtQkFBbUIsR0FBRyxLQUFLO1VBQ2xDO1FBQ0YsQ0FBQyxDQUFDO01BQ0osQ0FBQztNQUNEO01BQ0E7TUFDQW1ELGVBQWUsRUFBRSxTQUFBQSxDQUFVM1csRUFBRSxFQUFFO1FBQzdCLElBQUlRLElBQUksR0FBRyxJQUFJO1FBQ2ZsQyxNQUFNLENBQUNzWCxnQkFBZ0IsQ0FBQyxZQUFZO1VBQ2xDcFYsSUFBSSxDQUFDNFMsa0JBQWtCLENBQUMrQyxNQUFNLENBQUNuVyxFQUFFLENBQUM7VUFDbEM7VUFDQTtVQUNBO1VBQ0EsSUFBSSxDQUFFUSxJQUFJLENBQUM0UyxrQkFBa0IsQ0FBQzBDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBRXRWLElBQUksQ0FBQ2dULG1CQUFtQixFQUNoRWhULElBQUksQ0FBQ3NVLGdCQUFnQixDQUFDLENBQUM7UUFDM0IsQ0FBQyxDQUFDO01BQ0osQ0FBQztNQUNEO01BQ0E7TUFDQTtNQUNBc0MsWUFBWSxFQUFFLFNBQUFBLENBQVU3TyxHQUFHLEVBQUU7UUFDM0IsSUFBSS9ILElBQUksR0FBRyxJQUFJO1FBQ2ZsQyxNQUFNLENBQUNzWCxnQkFBZ0IsQ0FBQyxZQUFZO1VBQ2xDLElBQUk1VixFQUFFLEdBQUd1SSxHQUFHLENBQUNhLEdBQUc7VUFDaEIsSUFBSTVJLElBQUksQ0FBQzhTLFVBQVUsQ0FBQ2pGLEdBQUcsQ0FBQ3JPLEVBQUUsQ0FBQyxFQUN6QixNQUFNaUUsS0FBSyxDQUFDLDJDQUEyQyxHQUFHakUsRUFBRSxDQUFDO1VBQy9ELElBQUlRLElBQUksQ0FBQ3lTLE1BQU0sSUFBSXpTLElBQUksQ0FBQzRTLGtCQUFrQixDQUFDL0UsR0FBRyxDQUFDck8sRUFBRSxDQUFDLEVBQ2hELE1BQU1pRSxLQUFLLENBQUMsbURBQW1ELEdBQUdqRSxFQUFFLENBQUM7VUFFdkUsSUFBSThTLEtBQUssR0FBR3RTLElBQUksQ0FBQ3lTLE1BQU07VUFDdkIsSUFBSUwsVUFBVSxHQUFHcFMsSUFBSSxDQUFDMFMsV0FBVztVQUNqQyxJQUFJbUUsWUFBWSxHQUFJdkUsS0FBSyxJQUFJdFMsSUFBSSxDQUFDOFMsVUFBVSxDQUFDd0MsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQ3JEdFYsSUFBSSxDQUFDOFMsVUFBVSxDQUFDcFYsR0FBRyxDQUFDc0MsSUFBSSxDQUFDOFMsVUFBVSxDQUFDMEMsWUFBWSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUk7VUFDNUQsSUFBSXNCLFdBQVcsR0FBSXhFLEtBQUssSUFBSXRTLElBQUksQ0FBQzRTLGtCQUFrQixDQUFDMEMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQzFEdFYsSUFBSSxDQUFDNFMsa0JBQWtCLENBQUNsVixHQUFHLENBQUNzQyxJQUFJLENBQUM0UyxrQkFBa0IsQ0FBQzRDLFlBQVksQ0FBQyxDQUFDLENBQUMsR0FDbkUsSUFBSTtVQUNSO1VBQ0E7VUFDQTtVQUNBLElBQUl1QixTQUFTLEdBQUcsQ0FBRXpFLEtBQUssSUFBSXRTLElBQUksQ0FBQzhTLFVBQVUsQ0FBQ3dDLElBQUksQ0FBQyxDQUFDLEdBQUdoRCxLQUFLLElBQ3ZERixVQUFVLENBQUNySyxHQUFHLEVBQUU4TyxZQUFZLENBQUMsR0FBRyxDQUFDOztVQUVuQztVQUNBO1VBQ0E7VUFDQSxJQUFJRyxpQkFBaUIsR0FBRyxDQUFDRCxTQUFTLElBQUkvVyxJQUFJLENBQUNnVCxtQkFBbUIsSUFDNURoVCxJQUFJLENBQUM0UyxrQkFBa0IsQ0FBQzBDLElBQUksQ0FBQyxDQUFDLEdBQUdoRCxLQUFLOztVQUV4QztVQUNBO1VBQ0EsSUFBSTJFLG1CQUFtQixHQUFHLENBQUNGLFNBQVMsSUFBSUQsV0FBVyxJQUNqRDFFLFVBQVUsQ0FBQ3JLLEdBQUcsRUFBRStPLFdBQVcsQ0FBQyxJQUFJLENBQUM7VUFFbkMsSUFBSUksUUFBUSxHQUFHRixpQkFBaUIsSUFBSUMsbUJBQW1CO1VBRXZELElBQUlGLFNBQVMsRUFBRTtZQUNiL1csSUFBSSxDQUFDbVYsYUFBYSxDQUFDM1YsRUFBRSxFQUFFdUksR0FBRyxDQUFDO1VBQzdCLENBQUMsTUFBTSxJQUFJbVAsUUFBUSxFQUFFO1lBQ25CbFgsSUFBSSxDQUFDNlYsWUFBWSxDQUFDclcsRUFBRSxFQUFFdUksR0FBRyxDQUFDO1VBQzVCLENBQUMsTUFBTTtZQUNMO1lBQ0EvSCxJQUFJLENBQUNnVCxtQkFBbUIsR0FBRyxLQUFLO1VBQ2xDO1FBQ0YsQ0FBQyxDQUFDO01BQ0osQ0FBQztNQUNEO01BQ0E7TUFDQTtNQUNBbUUsZUFBZSxFQUFFLFNBQUFBLENBQVUzWCxFQUFFLEVBQUU7UUFDN0IsSUFBSVEsSUFBSSxHQUFHLElBQUk7UUFDZmxDLE1BQU0sQ0FBQ3NYLGdCQUFnQixDQUFDLFlBQVk7VUFDbEMsSUFBSSxDQUFFcFYsSUFBSSxDQUFDOFMsVUFBVSxDQUFDakYsR0FBRyxDQUFDck8sRUFBRSxDQUFDLElBQUksQ0FBRVEsSUFBSSxDQUFDeVMsTUFBTSxFQUM1QyxNQUFNaFAsS0FBSyxDQUFDLG9EQUFvRCxHQUFHakUsRUFBRSxDQUFDO1VBRXhFLElBQUlRLElBQUksQ0FBQzhTLFVBQVUsQ0FBQ2pGLEdBQUcsQ0FBQ3JPLEVBQUUsQ0FBQyxFQUFFO1lBQzNCUSxJQUFJLENBQUM4VixnQkFBZ0IsQ0FBQ3RXLEVBQUUsQ0FBQztVQUMzQixDQUFDLE1BQU0sSUFBSVEsSUFBSSxDQUFDNFMsa0JBQWtCLENBQUMvRSxHQUFHLENBQUNyTyxFQUFFLENBQUMsRUFBRTtZQUMxQ1EsSUFBSSxDQUFDbVcsZUFBZSxDQUFDM1csRUFBRSxDQUFDO1VBQzFCO1FBQ0YsQ0FBQyxDQUFDO01BQ0osQ0FBQztNQUNENFgsVUFBVSxFQUFFLFNBQUFBLENBQVU1WCxFQUFFLEVBQUUwVyxNQUFNLEVBQUU7UUFDaEMsSUFBSWxXLElBQUksR0FBRyxJQUFJO1FBQ2ZsQyxNQUFNLENBQUNzWCxnQkFBZ0IsQ0FBQyxZQUFZO1VBQ2xDLElBQUlpQyxVQUFVLEdBQUduQixNQUFNLElBQUlsVyxJQUFJLENBQUN5VCxRQUFRLENBQUM2RCxlQUFlLENBQUNwQixNQUFNLENBQUMsQ0FBQ3FCLE1BQU07VUFFdkUsSUFBSUMsZUFBZSxHQUFHeFgsSUFBSSxDQUFDOFMsVUFBVSxDQUFDakYsR0FBRyxDQUFDck8sRUFBRSxDQUFDO1VBQzdDLElBQUlpWSxjQUFjLEdBQUd6WCxJQUFJLENBQUN5UyxNQUFNLElBQUl6UyxJQUFJLENBQUM0UyxrQkFBa0IsQ0FBQy9FLEdBQUcsQ0FBQ3JPLEVBQUUsQ0FBQztVQUNuRSxJQUFJa1ksWUFBWSxHQUFHRixlQUFlLElBQUlDLGNBQWM7VUFFcEQsSUFBSUosVUFBVSxJQUFJLENBQUNLLFlBQVksRUFBRTtZQUMvQjFYLElBQUksQ0FBQzRXLFlBQVksQ0FBQ1YsTUFBTSxDQUFDO1VBQzNCLENBQUMsTUFBTSxJQUFJd0IsWUFBWSxJQUFJLENBQUNMLFVBQVUsRUFBRTtZQUN0Q3JYLElBQUksQ0FBQ21YLGVBQWUsQ0FBQzNYLEVBQUUsQ0FBQztVQUMxQixDQUFDLE1BQU0sSUFBSWtZLFlBQVksSUFBSUwsVUFBVSxFQUFFO1lBQ3JDLElBQUloQixNQUFNLEdBQUdyVyxJQUFJLENBQUM4UyxVQUFVLENBQUNwVixHQUFHLENBQUM4QixFQUFFLENBQUM7WUFDcEMsSUFBSTRTLFVBQVUsR0FBR3BTLElBQUksQ0FBQzBTLFdBQVc7WUFDakMsSUFBSWlGLFdBQVcsR0FBRzNYLElBQUksQ0FBQ3lTLE1BQU0sSUFBSXpTLElBQUksQ0FBQzRTLGtCQUFrQixDQUFDMEMsSUFBSSxDQUFDLENBQUMsSUFDN0R0VixJQUFJLENBQUM0UyxrQkFBa0IsQ0FBQ2xWLEdBQUcsQ0FBQ3NDLElBQUksQ0FBQzRTLGtCQUFrQixDQUFDcUQsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUNyRSxJQUFJYSxXQUFXO1lBRWYsSUFBSVUsZUFBZSxFQUFFO2NBQ25CO2NBQ0E7Y0FDQTtjQUNBO2NBQ0E7Y0FDQTtjQUNBO2NBQ0E7Y0FDQTtjQUNBLElBQUlJLGdCQUFnQixHQUFHLENBQUU1WCxJQUFJLENBQUN5UyxNQUFNLElBQ2xDelMsSUFBSSxDQUFDNFMsa0JBQWtCLENBQUMwQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFDcENsRCxVQUFVLENBQUM4RCxNQUFNLEVBQUV5QixXQUFXLENBQUMsSUFBSSxDQUFDO2NBRXRDLElBQUlDLGdCQUFnQixFQUFFO2dCQUNwQjVYLElBQUksQ0FBQ29XLGdCQUFnQixDQUFDNVcsRUFBRSxFQUFFNlcsTUFBTSxFQUFFSCxNQUFNLENBQUM7Y0FDM0MsQ0FBQyxNQUFNO2dCQUNMO2dCQUNBbFcsSUFBSSxDQUFDOFYsZ0JBQWdCLENBQUN0VyxFQUFFLENBQUM7Z0JBQ3pCO2dCQUNBc1gsV0FBVyxHQUFHOVcsSUFBSSxDQUFDNFMsa0JBQWtCLENBQUNsVixHQUFHLENBQ3ZDc0MsSUFBSSxDQUFDNFMsa0JBQWtCLENBQUM0QyxZQUFZLENBQUMsQ0FBQyxDQUFDO2dCQUV6QyxJQUFJMEIsUUFBUSxHQUFHbFgsSUFBSSxDQUFDZ1QsbUJBQW1CLElBQ2hDOEQsV0FBVyxJQUFJMUUsVUFBVSxDQUFDOEQsTUFBTSxFQUFFWSxXQUFXLENBQUMsSUFBSSxDQUFFO2dCQUUzRCxJQUFJSSxRQUFRLEVBQUU7a0JBQ1psWCxJQUFJLENBQUM2VixZQUFZLENBQUNyVyxFQUFFLEVBQUUwVyxNQUFNLENBQUM7Z0JBQy9CLENBQUMsTUFBTTtrQkFDTDtrQkFDQWxXLElBQUksQ0FBQ2dULG1CQUFtQixHQUFHLEtBQUs7Z0JBQ2xDO2NBQ0Y7WUFDRixDQUFDLE1BQU0sSUFBSXlFLGNBQWMsRUFBRTtjQUN6QnBCLE1BQU0sR0FBR3JXLElBQUksQ0FBQzRTLGtCQUFrQixDQUFDbFYsR0FBRyxDQUFDOEIsRUFBRSxDQUFDO2NBQ3hDO2NBQ0E7Y0FDQTtjQUNBO2NBQ0FRLElBQUksQ0FBQzRTLGtCQUFrQixDQUFDK0MsTUFBTSxDQUFDblcsRUFBRSxDQUFDO2NBRWxDLElBQUlxWCxZQUFZLEdBQUc3VyxJQUFJLENBQUM4UyxVQUFVLENBQUNwVixHQUFHLENBQ3BDc0MsSUFBSSxDQUFDOFMsVUFBVSxDQUFDMEMsWUFBWSxDQUFDLENBQUMsQ0FBQztjQUNqQ3NCLFdBQVcsR0FBRzlXLElBQUksQ0FBQzRTLGtCQUFrQixDQUFDMEMsSUFBSSxDQUFDLENBQUMsSUFDdEN0VixJQUFJLENBQUM0UyxrQkFBa0IsQ0FBQ2xWLEdBQUcsQ0FDekJzQyxJQUFJLENBQUM0UyxrQkFBa0IsQ0FBQzRDLFlBQVksQ0FBQyxDQUFDLENBQUM7O2NBRS9DO2NBQ0EsSUFBSXVCLFNBQVMsR0FBRzNFLFVBQVUsQ0FBQzhELE1BQU0sRUFBRVcsWUFBWSxDQUFDLEdBQUcsQ0FBQzs7Y0FFcEQ7Y0FDQSxJQUFJZ0IsYUFBYSxHQUFJLENBQUVkLFNBQVMsSUFBSS9XLElBQUksQ0FBQ2dULG1CQUFtQixJQUNyRCxDQUFDK0QsU0FBUyxJQUFJRCxXQUFXLElBQ3pCMUUsVUFBVSxDQUFDOEQsTUFBTSxFQUFFWSxXQUFXLENBQUMsSUFBSSxDQUFFO2NBRTVDLElBQUlDLFNBQVMsRUFBRTtnQkFDYi9XLElBQUksQ0FBQ21WLGFBQWEsQ0FBQzNWLEVBQUUsRUFBRTBXLE1BQU0sQ0FBQztjQUNoQyxDQUFDLE1BQU0sSUFBSTJCLGFBQWEsRUFBRTtnQkFDeEI7Z0JBQ0E3WCxJQUFJLENBQUM0UyxrQkFBa0IsQ0FBQzdFLEdBQUcsQ0FBQ3ZPLEVBQUUsRUFBRTBXLE1BQU0sQ0FBQztjQUN6QyxDQUFDLE1BQU07Z0JBQ0w7Z0JBQ0FsVyxJQUFJLENBQUNnVCxtQkFBbUIsR0FBRyxLQUFLO2dCQUNoQztnQkFDQTtnQkFDQSxJQUFJLENBQUVoVCxJQUFJLENBQUM0UyxrQkFBa0IsQ0FBQzBDLElBQUksQ0FBQyxDQUFDLEVBQUU7a0JBQ3BDdFYsSUFBSSxDQUFDc1UsZ0JBQWdCLENBQUMsQ0FBQztnQkFDekI7Y0FDRjtZQUNGLENBQUMsTUFBTTtjQUNMLE1BQU0sSUFBSTdRLEtBQUssQ0FBQywyRUFBMkUsQ0FBQztZQUM5RjtVQUNGO1FBQ0YsQ0FBQyxDQUFDO01BQ0osQ0FBQztNQUNEcVUsdUJBQXVCLEVBQUUsU0FBQUEsQ0FBQSxFQUFZO1FBQ25DLElBQUk5WCxJQUFJLEdBQUcsSUFBSTtRQUNmQSxJQUFJLENBQUN3VCxvQkFBb0IsQ0FBQzlCLEtBQUssQ0FBQ0UsUUFBUSxDQUFDO1FBQ3pDO1FBQ0E7UUFDQTlULE1BQU0sQ0FBQ2lhLEtBQUssQ0FBQ2hHLHVCQUF1QixDQUFDLGtCQUFrQjtVQUNyRCxPQUFPLENBQUMvUixJQUFJLENBQUN3QixRQUFRLElBQUksQ0FBQ3hCLElBQUksQ0FBQ2dVLFlBQVksQ0FBQytCLEtBQUssQ0FBQyxDQUFDLEVBQUU7WUFDbkQsSUFBSS9WLElBQUksQ0FBQ3VVLE1BQU0sS0FBSzdDLEtBQUssQ0FBQ0MsUUFBUSxFQUFFO2NBQ2xDO2NBQ0E7Y0FDQTtjQUNBO1lBQ0Y7O1lBRUE7WUFDQSxJQUFJM1IsSUFBSSxDQUFDdVUsTUFBTSxLQUFLN0MsS0FBSyxDQUFDRSxRQUFRLEVBQ2hDLE1BQU0sSUFBSW5PLEtBQUssQ0FBQyxtQ0FBbUMsR0FBR3pELElBQUksQ0FBQ3VVLE1BQU0sQ0FBQztZQUVwRXZVLElBQUksQ0FBQ2lVLGtCQUFrQixHQUFHalUsSUFBSSxDQUFDZ1UsWUFBWTtZQUMzQyxJQUFJZ0UsY0FBYyxHQUFHLEVBQUVoWSxJQUFJLENBQUNrVSxnQkFBZ0I7WUFDNUNsVSxJQUFJLENBQUNnVSxZQUFZLEdBQUcsSUFBSTNVLGVBQWUsQ0FBQ3VSLE1BQU0sQ0FBRCxDQUFDOztZQUU5QztZQUNBLE1BQU1xSCxhQUFhLEdBQUcsRUFBRTtZQUV4QmpZLElBQUksQ0FBQ2lVLGtCQUFrQixDQUFDblYsT0FBTyxDQUFDLFVBQVVtRSxFQUFFLEVBQUV6RCxFQUFFLEVBQUU7Y0FDaEQsTUFBTTBZLFlBQVksR0FBRyxJQUFJM1YsT0FBTyxDQUFDLENBQUNnSCxPQUFPLEVBQUU0TyxNQUFNLEtBQUs7Z0JBQ3BEblksSUFBSSxDQUFDeU8sWUFBWSxDQUFDMkosV0FBVyxDQUFDMUssS0FBSyxDQUNqQzFOLElBQUksQ0FBQ3dPLGtCQUFrQixDQUFDclAsY0FBYyxFQUN0Q0ssRUFBRSxFQUNGeUQsRUFBRSxFQUNGOE8sdUJBQXVCLENBQUMsVUFBU2xPLEdBQUcsRUFBRWtFLEdBQUcsRUFBRTtrQkFDekMsSUFBSWxFLEdBQUcsRUFBRTtvQkFDUC9GLE1BQU0sQ0FBQ2dHLE1BQU0sQ0FBQyx3Q0FBd0MsRUFBRUQsR0FBRyxDQUFDO29CQUM1RDtvQkFDQTtvQkFDQTtvQkFDQTtvQkFDQSxJQUFJN0QsSUFBSSxDQUFDdVUsTUFBTSxLQUFLN0MsS0FBSyxDQUFDQyxRQUFRLEVBQUU7c0JBQ2xDM1IsSUFBSSxDQUFDc1UsZ0JBQWdCLENBQUMsQ0FBQztvQkFDekI7b0JBQ0EvSyxPQUFPLENBQUMsQ0FBQztvQkFDVDtrQkFDRjtrQkFFQSxJQUNFLENBQUN2SixJQUFJLENBQUN3QixRQUFRLElBQ2R4QixJQUFJLENBQUN1VSxNQUFNLEtBQUs3QyxLQUFLLENBQUNFLFFBQVEsSUFDOUI1UixJQUFJLENBQUNrVSxnQkFBZ0IsS0FBSzhELGNBQWMsRUFDeEM7b0JBQ0E7b0JBQ0E7b0JBQ0E7b0JBQ0E7b0JBQ0EsSUFBSTtzQkFDRmhZLElBQUksQ0FBQ29YLFVBQVUsQ0FBQzVYLEVBQUUsRUFBRXVJLEdBQUcsQ0FBQztzQkFDeEJ3QixPQUFPLENBQUMsQ0FBQztvQkFDWCxDQUFDLENBQUMsT0FBTzFGLEdBQUcsRUFBRTtzQkFDWnNVLE1BQU0sQ0FBQ3RVLEdBQUcsQ0FBQztvQkFDYjtrQkFDRixDQUFDLE1BQU07b0JBQ0wwRixPQUFPLENBQUMsQ0FBQztrQkFDWDtnQkFDRixDQUFDLENBQ0gsQ0FBQztjQUNILENBQUMsQ0FBQztjQUNGME8sYUFBYSxDQUFDeFosSUFBSSxDQUFDeVosWUFBWSxDQUFDO1lBQ2xDLENBQUMsQ0FBQztZQUNGO1lBQ0EsSUFBSTtjQUNGLE1BQU1HLE9BQU8sR0FBRyxNQUFNOVYsT0FBTyxDQUFDK1YsVUFBVSxDQUFDTCxhQUFhLENBQUM7Y0FDdkQsTUFBTU0sTUFBTSxHQUFHRixPQUFPLENBQ25CRyxNQUFNLENBQUNqQixNQUFNLElBQUlBLE1BQU0sQ0FBQ2tCLE1BQU0sS0FBSyxVQUFVLENBQUMsQ0FDOUNoUixHQUFHLENBQUM4UCxNQUFNLElBQUlBLE1BQU0sQ0FBQ21CLE1BQU0sQ0FBQztjQUUvQixJQUFJSCxNQUFNLENBQUN2VCxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUNyQmxILE1BQU0sQ0FBQ2dHLE1BQU0sQ0FBQyw0QkFBNEIsRUFBRXlVLE1BQU0sQ0FBQztjQUNyRDtZQUNGLENBQUMsQ0FBQyxPQUFPMVUsR0FBRyxFQUFFO2NBQ1ovRixNQUFNLENBQUNnRyxNQUFNLENBQUMsbUNBQW1DLEVBQUVELEdBQUcsQ0FBQztZQUN6RDtZQUNBO1lBQ0EsSUFBSTdELElBQUksQ0FBQ3VVLE1BQU0sS0FBSzdDLEtBQUssQ0FBQ0MsUUFBUSxFQUNoQztZQUNGM1IsSUFBSSxDQUFDaVUsa0JBQWtCLEdBQUcsSUFBSTtVQUNoQztVQUNBO1VBQ0E7VUFDQSxJQUFJalUsSUFBSSxDQUFDdVUsTUFBTSxLQUFLN0MsS0FBSyxDQUFDQyxRQUFRLEVBQ2hDLE1BQU0zUixJQUFJLENBQUMyWSxTQUFTLENBQUMsQ0FBQztRQUMxQixDQUFDLENBQUMsQ0FBQztNQUNMLENBQUM7TUFDREEsU0FBUyxFQUFFLGVBQUFBLENBQUEsRUFBa0I7UUFDM0IsSUFBSTNZLElBQUksR0FBRyxJQUFJO1FBQ2ZBLElBQUksQ0FBQ3dULG9CQUFvQixDQUFDOUIsS0FBSyxDQUFDRyxNQUFNLENBQUM7UUFDdkMsSUFBSStHLE1BQU0sR0FBRzVZLElBQUksQ0FBQ29VLGdDQUFnQyxJQUFJLEVBQUU7UUFDeERwVSxJQUFJLENBQUNvVSxnQ0FBZ0MsR0FBRyxFQUFFO1FBQzFDLE1BQU1wVSxJQUFJLENBQUMwTyxZQUFZLENBQUN2QyxPQUFPLENBQUMsa0JBQWtCO1VBQ2hELElBQUk7WUFDRixLQUFLLE1BQU1nRixDQUFDLElBQUl5SCxNQUFNLEVBQUU7Y0FDdEIsTUFBTXpILENBQUMsQ0FBQ0MsU0FBUyxDQUFDLENBQUM7WUFDckI7VUFDRixDQUFDLENBQUMsT0FBTzFNLENBQUMsRUFBRTtZQUNWWSxPQUFPLENBQUNDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRTtjQUFDcVQ7WUFBTSxDQUFDLEVBQUVsVSxDQUFDLENBQUM7VUFDL0M7UUFDRixDQUFDLENBQUM7TUFDSixDQUFDO01BQ0Q4UCx5QkFBeUIsRUFBRSxTQUFBQSxDQUFVdlIsRUFBRSxFQUFFO1FBQ3ZDLElBQUlqRCxJQUFJLEdBQUcsSUFBSTtRQUNmbEMsTUFBTSxDQUFDc1gsZ0JBQWdCLENBQUMsWUFBWTtVQUNsQ3BWLElBQUksQ0FBQ2dVLFlBQVksQ0FBQ2pHLEdBQUcsQ0FBQzFOLE9BQU8sQ0FBQzRDLEVBQUUsQ0FBQyxFQUFFQSxFQUFFLENBQUM7UUFDeEMsQ0FBQyxDQUFDO01BQ0osQ0FBQztNQUNEd1IsaUNBQWlDLEVBQUUsU0FBQUEsQ0FBVXhSLEVBQUUsRUFBRTtRQUMvQyxJQUFJakQsSUFBSSxHQUFHLElBQUk7UUFDZmxDLE1BQU0sQ0FBQ3NYLGdCQUFnQixDQUFDLFlBQVk7VUFDbEMsSUFBSTVWLEVBQUUsR0FBR2EsT0FBTyxDQUFDNEMsRUFBRSxDQUFDO1VBQ3BCO1VBQ0E7O1VBRUEsSUFBSWpELElBQUksQ0FBQ3VVLE1BQU0sS0FBSzdDLEtBQUssQ0FBQ0UsUUFBUSxLQUM1QjVSLElBQUksQ0FBQ2lVLGtCQUFrQixJQUFJalUsSUFBSSxDQUFDaVUsa0JBQWtCLENBQUNwRyxHQUFHLENBQUNyTyxFQUFFLENBQUMsSUFDM0RRLElBQUksQ0FBQ2dVLFlBQVksQ0FBQ25HLEdBQUcsQ0FBQ3JPLEVBQUUsQ0FBQyxDQUFDLEVBQUU7WUFDL0JRLElBQUksQ0FBQ2dVLFlBQVksQ0FBQ2pHLEdBQUcsQ0FBQ3ZPLEVBQUUsRUFBRXlELEVBQUUsQ0FBQztZQUM3QjtVQUNGO1VBRUEsSUFBSUEsRUFBRSxDQUFDQSxFQUFFLEtBQUssR0FBRyxFQUFFO1lBQ2pCLElBQUlqRCxJQUFJLENBQUM4UyxVQUFVLENBQUNqRixHQUFHLENBQUNyTyxFQUFFLENBQUMsSUFDdEJRLElBQUksQ0FBQ3lTLE1BQU0sSUFBSXpTLElBQUksQ0FBQzRTLGtCQUFrQixDQUFDL0UsR0FBRyxDQUFDck8sRUFBRSxDQUFFLEVBQ2xEUSxJQUFJLENBQUNtWCxlQUFlLENBQUMzWCxFQUFFLENBQUM7VUFDNUIsQ0FBQyxNQUFNLElBQUl5RCxFQUFFLENBQUNBLEVBQUUsS0FBSyxHQUFHLEVBQUU7WUFDeEIsSUFBSWpELElBQUksQ0FBQzhTLFVBQVUsQ0FBQ2pGLEdBQUcsQ0FBQ3JPLEVBQUUsQ0FBQyxFQUN6QixNQUFNLElBQUlpRSxLQUFLLENBQUMsbURBQW1ELENBQUM7WUFDdEUsSUFBSXpELElBQUksQ0FBQzRTLGtCQUFrQixJQUFJNVMsSUFBSSxDQUFDNFMsa0JBQWtCLENBQUMvRSxHQUFHLENBQUNyTyxFQUFFLENBQUMsRUFDNUQsTUFBTSxJQUFJaUUsS0FBSyxDQUFDLGdEQUFnRCxDQUFDOztZQUVuRTtZQUNBO1lBQ0EsSUFBSXpELElBQUksQ0FBQ3lULFFBQVEsQ0FBQzZELGVBQWUsQ0FBQ3JVLEVBQUUsQ0FBQzBGLENBQUMsQ0FBQyxDQUFDNE8sTUFBTSxFQUM1Q3ZYLElBQUksQ0FBQzRXLFlBQVksQ0FBQzNULEVBQUUsQ0FBQzBGLENBQUMsQ0FBQztVQUMzQixDQUFDLE1BQU0sSUFBSTFGLEVBQUUsQ0FBQ0EsRUFBRSxLQUFLLEdBQUcsRUFBRTtZQUN4QjtZQUNBO1lBQ0FBLEVBQUUsQ0FBQzBGLENBQUMsR0FBRzRJLGtCQUFrQixDQUFDdE8sRUFBRSxDQUFDMEYsQ0FBQyxDQUFDO1lBQy9CO1lBQ0E7WUFDQTtZQUNBO1lBQ0E7WUFDQTtZQUNBLElBQUlrUSxTQUFTLEdBQUcsQ0FBQ2hMLEdBQUcsQ0FBQzVLLEVBQUUsQ0FBQzBGLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDa0YsR0FBRyxDQUFDNUssRUFBRSxDQUFDMEYsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUNrRixHQUFHLENBQUM1SyxFQUFFLENBQUMwRixDQUFDLEVBQUUsUUFBUSxDQUFDO1lBQ2hGO1lBQ0E7WUFDQTtZQUNBO1lBQ0EsSUFBSW1RLG9CQUFvQixHQUN0QixDQUFDRCxTQUFTLElBQUlFLDRCQUE0QixDQUFDOVYsRUFBRSxDQUFDMEYsQ0FBQyxDQUFDO1lBRWxELElBQUk2TyxlQUFlLEdBQUd4WCxJQUFJLENBQUM4UyxVQUFVLENBQUNqRixHQUFHLENBQUNyTyxFQUFFLENBQUM7WUFDN0MsSUFBSWlZLGNBQWMsR0FBR3pYLElBQUksQ0FBQ3lTLE1BQU0sSUFBSXpTLElBQUksQ0FBQzRTLGtCQUFrQixDQUFDL0UsR0FBRyxDQUFDck8sRUFBRSxDQUFDO1lBRW5FLElBQUlxWixTQUFTLEVBQUU7Y0FDYjdZLElBQUksQ0FBQ29YLFVBQVUsQ0FBQzVYLEVBQUUsRUFBRUMsTUFBTSxDQUFDQyxNQUFNLENBQUM7Z0JBQUNrSixHQUFHLEVBQUVwSjtjQUFFLENBQUMsRUFBRXlELEVBQUUsQ0FBQzBGLENBQUMsQ0FBQyxDQUFDO1lBQ3JELENBQUMsTUFBTSxJQUFJLENBQUM2TyxlQUFlLElBQUlDLGNBQWMsS0FDbENxQixvQkFBb0IsRUFBRTtjQUMvQjtjQUNBO2NBQ0EsSUFBSTVDLE1BQU0sR0FBR2xXLElBQUksQ0FBQzhTLFVBQVUsQ0FBQ2pGLEdBQUcsQ0FBQ3JPLEVBQUUsQ0FBQyxHQUNoQ1EsSUFBSSxDQUFDOFMsVUFBVSxDQUFDcFYsR0FBRyxDQUFDOEIsRUFBRSxDQUFDLEdBQUdRLElBQUksQ0FBQzRTLGtCQUFrQixDQUFDbFYsR0FBRyxDQUFDOEIsRUFBRSxDQUFDO2NBQzdEMFcsTUFBTSxHQUFHdkosS0FBSyxDQUFDdk8sS0FBSyxDQUFDOFgsTUFBTSxDQUFDO2NBRTVCQSxNQUFNLENBQUN0TixHQUFHLEdBQUdwSixFQUFFO2NBQ2YsSUFBSTtnQkFDRkgsZUFBZSxDQUFDMlosT0FBTyxDQUFDOUMsTUFBTSxFQUFFalQsRUFBRSxDQUFDMEYsQ0FBQyxDQUFDO2NBQ3ZDLENBQUMsQ0FBQyxPQUFPakUsQ0FBQyxFQUFFO2dCQUNWLElBQUlBLENBQUMsQ0FBQ3VVLElBQUksS0FBSyxnQkFBZ0IsRUFDN0IsTUFBTXZVLENBQUM7Z0JBQ1Q7Z0JBQ0ExRSxJQUFJLENBQUNnVSxZQUFZLENBQUNqRyxHQUFHLENBQUN2TyxFQUFFLEVBQUV5RCxFQUFFLENBQUM7Z0JBQzdCLElBQUlqRCxJQUFJLENBQUN1VSxNQUFNLEtBQUs3QyxLQUFLLENBQUNHLE1BQU0sRUFBRTtrQkFDaEM3UixJQUFJLENBQUM4WCx1QkFBdUIsQ0FBQyxDQUFDO2dCQUNoQztnQkFDQTtjQUNGO2NBQ0E5WCxJQUFJLENBQUNvWCxVQUFVLENBQUM1WCxFQUFFLEVBQUVRLElBQUksQ0FBQytULG1CQUFtQixDQUFDbUMsTUFBTSxDQUFDLENBQUM7WUFDdkQsQ0FBQyxNQUFNLElBQUksQ0FBQzRDLG9CQUFvQixJQUNyQjlZLElBQUksQ0FBQ3lULFFBQVEsQ0FBQ3lGLHVCQUF1QixDQUFDalcsRUFBRSxDQUFDMEYsQ0FBQyxDQUFDLElBQzFDM0ksSUFBSSxDQUFDMlMsT0FBTyxJQUFJM1MsSUFBSSxDQUFDMlMsT0FBTyxDQUFDd0csa0JBQWtCLENBQUNsVyxFQUFFLENBQUMwRixDQUFDLENBQUUsRUFBRTtjQUNsRTNJLElBQUksQ0FBQ2dVLFlBQVksQ0FBQ2pHLEdBQUcsQ0FBQ3ZPLEVBQUUsRUFBRXlELEVBQUUsQ0FBQztjQUM3QixJQUFJakQsSUFBSSxDQUFDdVUsTUFBTSxLQUFLN0MsS0FBSyxDQUFDRyxNQUFNLEVBQzlCN1IsSUFBSSxDQUFDOFgsdUJBQXVCLENBQUMsQ0FBQztZQUNsQztVQUNGLENBQUMsTUFBTTtZQUNMLE1BQU1yVSxLQUFLLENBQUMsNEJBQTRCLEdBQUdSLEVBQUUsQ0FBQztVQUNoRDtRQUNGLENBQUMsQ0FBQztNQUNKLENBQUM7TUFFRCxNQUFNbVcscUJBQXFCQSxDQUFBLEVBQUc7UUFDNUIsSUFBSXBaLElBQUksR0FBRyxJQUFJO1FBQ2YsSUFBSUEsSUFBSSxDQUFDd0IsUUFBUSxFQUNmLE1BQU0sSUFBSWlDLEtBQUssQ0FBQyxrQ0FBa0MsQ0FBQztRQUVyRCxNQUFNekQsSUFBSSxDQUFDcVosU0FBUyxDQUFDO1VBQUNDLE9BQU8sRUFBRTtRQUFJLENBQUMsQ0FBQyxDQUFDLENBQUU7O1FBRXhDLElBQUl0WixJQUFJLENBQUN3QixRQUFRLEVBQ2YsT0FBTyxDQUFFOztRQUVYO1FBQ0E7UUFDQSxNQUFNeEIsSUFBSSxDQUFDME8sWUFBWSxDQUFDMUMsS0FBSyxDQUFDLENBQUM7UUFFL0IsTUFBTWhNLElBQUksQ0FBQ3VaLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBRTtNQUMvQixDQUFDO01BRUQ7TUFDQXJFLGdCQUFnQixFQUFFLFNBQUFBLENBQUEsRUFBWTtRQUM1QixPQUFPLElBQUksQ0FBQ2tFLHFCQUFxQixDQUFDLENBQUM7TUFDckMsQ0FBQztNQUVEO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQUksVUFBVSxFQUFFLFNBQUFBLENBQUEsRUFBWTtRQUN0QixJQUFJeFosSUFBSSxHQUFHLElBQUk7UUFDZmxDLE1BQU0sQ0FBQ3NYLGdCQUFnQixDQUFDLFlBQVk7VUFDbEMsSUFBSXBWLElBQUksQ0FBQ3dCLFFBQVEsRUFDZjs7VUFFRjtVQUNBeEIsSUFBSSxDQUFDZ1UsWUFBWSxHQUFHLElBQUkzVSxlQUFlLENBQUN1UixNQUFNLENBQUQsQ0FBQztVQUM5QzVRLElBQUksQ0FBQ2lVLGtCQUFrQixHQUFHLElBQUk7VUFDOUIsRUFBRWpVLElBQUksQ0FBQ2tVLGdCQUFnQixDQUFDLENBQUU7VUFDMUJsVSxJQUFJLENBQUN3VCxvQkFBb0IsQ0FBQzlCLEtBQUssQ0FBQ0MsUUFBUSxDQUFDOztVQUV6QztVQUNBO1VBQ0E3VCxNQUFNLENBQUNpYSxLQUFLLENBQUMsa0JBQWtCO1lBQzdCLE1BQU0vWCxJQUFJLENBQUNxWixTQUFTLENBQUMsQ0FBQztZQUN0QixNQUFNclosSUFBSSxDQUFDdVosYUFBYSxDQUFDLENBQUM7VUFDNUIsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDO01BQ0osQ0FBQztNQUVEO01BQ0EsTUFBTUUsY0FBY0EsQ0FBQzNOLE9BQU8sRUFBRTtRQUM1QixJQUFJOUwsSUFBSSxHQUFHLElBQUk7UUFDZjhMLE9BQU8sR0FBR0EsT0FBTyxJQUFJLENBQUMsQ0FBQztRQUN2QixJQUFJNEUsVUFBVSxFQUFFZ0osU0FBUzs7UUFFekI7UUFDQSxPQUFPLElBQUksRUFBRTtVQUNYO1VBQ0EsSUFBSTFaLElBQUksQ0FBQ3dCLFFBQVEsRUFDZjtVQUVGa1AsVUFBVSxHQUFHLElBQUlyUixlQUFlLENBQUN1UixNQUFNLENBQUQsQ0FBQztVQUN2QzhJLFNBQVMsR0FBRyxJQUFJcmEsZUFBZSxDQUFDdVIsTUFBTSxDQUFELENBQUM7O1VBRXRDO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0EsSUFBSStJLE1BQU0sR0FBRzNaLElBQUksQ0FBQzRaLGVBQWUsQ0FBQztZQUFFdEgsS0FBSyxFQUFFdFMsSUFBSSxDQUFDeVMsTUFBTSxHQUFHO1VBQUUsQ0FBQyxDQUFDO1VBQzdELElBQUk7WUFDRixNQUFNa0gsTUFBTSxDQUFDN2EsT0FBTyxDQUFDLFVBQVVpSixHQUFHLEVBQUU4UixDQUFDLEVBQUU7Y0FBRztjQUN4QyxJQUFJLENBQUM3WixJQUFJLENBQUN5UyxNQUFNLElBQUlvSCxDQUFDLEdBQUc3WixJQUFJLENBQUN5UyxNQUFNLEVBQUU7Z0JBQ25DL0IsVUFBVSxDQUFDM0MsR0FBRyxDQUFDaEcsR0FBRyxDQUFDYSxHQUFHLEVBQUViLEdBQUcsQ0FBQztjQUM5QixDQUFDLE1BQU07Z0JBQ0wyUixTQUFTLENBQUMzTCxHQUFHLENBQUNoRyxHQUFHLENBQUNhLEdBQUcsRUFBRWIsR0FBRyxDQUFDO2NBQzdCO1lBQ0YsQ0FBQyxDQUFDO1lBQ0Y7VUFDRixDQUFDLENBQUMsT0FBT3JELENBQUMsRUFBRTtZQUNWLElBQUlvSCxPQUFPLENBQUN3TixPQUFPLElBQUksT0FBTzVVLENBQUMsQ0FBQ3NNLElBQUssS0FBSyxRQUFRLEVBQUU7Y0FDbEQ7Y0FDQTtjQUNBO2NBQ0E7Y0FDQTtjQUNBLE1BQU1oUixJQUFJLENBQUMwTyxZQUFZLENBQUN4QyxVQUFVLENBQUN4SCxDQUFDLENBQUM7Y0FDckM7WUFDRjs7WUFFQTtZQUNBO1lBQ0E1RyxNQUFNLENBQUNnRyxNQUFNLENBQUMsbUNBQW1DLEVBQUVZLENBQUMsQ0FBQztZQUNyRCxNQUFNNUcsTUFBTSxDQUFDZ2MsV0FBVyxDQUFDLEdBQUcsQ0FBQztVQUMvQjtRQUNGO1FBRUEsSUFBSTlaLElBQUksQ0FBQ3dCLFFBQVEsRUFDZjtRQUVGeEIsSUFBSSxDQUFDK1osa0JBQWtCLENBQUNySixVQUFVLEVBQUVnSixTQUFTLENBQUM7TUFDaEQsQ0FBQztNQUVEO01BQ0FMLFNBQVMsRUFBRSxTQUFBQSxDQUFVdk4sT0FBTyxFQUFFO1FBQzVCLE9BQU8sSUFBSSxDQUFDMk4sY0FBYyxDQUFDM04sT0FBTyxDQUFDO01BQ3JDLENBQUM7TUFFRDtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQXdJLGdCQUFnQixFQUFFLFNBQUFBLENBQUEsRUFBWTtRQUM1QixJQUFJdFUsSUFBSSxHQUFHLElBQUk7UUFDZmxDLE1BQU0sQ0FBQ3NYLGdCQUFnQixDQUFDLFlBQVk7VUFDbEMsSUFBSXBWLElBQUksQ0FBQ3dCLFFBQVEsRUFDZjs7VUFFRjtVQUNBO1VBQ0EsSUFBSXhCLElBQUksQ0FBQ3VVLE1BQU0sS0FBSzdDLEtBQUssQ0FBQ0MsUUFBUSxFQUFFO1lBQ2xDM1IsSUFBSSxDQUFDd1osVUFBVSxDQUFDLENBQUM7WUFDakIsTUFBTSxJQUFJMUgsZUFBZSxDQUFELENBQUM7VUFDM0I7O1VBRUE7VUFDQTtVQUNBOVIsSUFBSSxDQUFDbVUseUJBQXlCLEdBQUcsSUFBSTtRQUN2QyxDQUFDLENBQUM7TUFDSixDQUFDO01BRUQ7TUFDQW9GLGFBQWEsRUFBRSxlQUFBQSxDQUFBLEVBQWtCO1FBQy9CLElBQUl2WixJQUFJLEdBQUcsSUFBSTtRQUVmLElBQUlBLElBQUksQ0FBQ3dCLFFBQVEsRUFDZjtRQUVGLE1BQU14QixJQUFJLENBQUN5TyxZQUFZLENBQUM0RixZQUFZLENBQUMzTyxpQkFBaUIsQ0FBQyxDQUFDO1FBRXhELElBQUkxRixJQUFJLENBQUN3QixRQUFRLEVBQ2Y7UUFFRixJQUFJeEIsSUFBSSxDQUFDdVUsTUFBTSxLQUFLN0MsS0FBSyxDQUFDQyxRQUFRLEVBQ2hDLE1BQU1sTyxLQUFLLENBQUMscUJBQXFCLEdBQUd6RCxJQUFJLENBQUN1VSxNQUFNLENBQUM7UUFFbEQsSUFBSXZVLElBQUksQ0FBQ21VLHlCQUF5QixFQUFFO1VBQ2xDblUsSUFBSSxDQUFDbVUseUJBQXlCLEdBQUcsS0FBSztVQUN0Q25VLElBQUksQ0FBQ3daLFVBQVUsQ0FBQyxDQUFDO1FBQ25CLENBQUMsTUFBTSxJQUFJeFosSUFBSSxDQUFDZ1UsWUFBWSxDQUFDK0IsS0FBSyxDQUFDLENBQUMsRUFBRTtVQUNwQyxNQUFNL1YsSUFBSSxDQUFDMlksU0FBUyxDQUFDLENBQUM7UUFDeEIsQ0FBQyxNQUFNO1VBQ0wzWSxJQUFJLENBQUM4WCx1QkFBdUIsQ0FBQyxDQUFDO1FBQ2hDO01BQ0YsQ0FBQztNQUVEOEIsZUFBZSxFQUFFLFNBQUFBLENBQVVJLGdCQUFnQixFQUFFO1FBQzNDLElBQUloYSxJQUFJLEdBQUcsSUFBSTtRQUNmLE9BQU9sQyxNQUFNLENBQUNzWCxnQkFBZ0IsQ0FBQyxZQUFZO1VBQ3pDO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQSxJQUFJdEosT0FBTyxHQUFHck0sTUFBTSxDQUFDQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUVNLElBQUksQ0FBQ3dPLGtCQUFrQixDQUFDMUMsT0FBTyxDQUFDOztVQUVoRTtVQUNBO1VBQ0FyTSxNQUFNLENBQUNDLE1BQU0sQ0FBQ29NLE9BQU8sRUFBRWtPLGdCQUFnQixDQUFDO1VBRXhDbE8sT0FBTyxDQUFDbUIsTUFBTSxHQUFHak4sSUFBSSxDQUFDNlQsaUJBQWlCO1VBQ3ZDLE9BQU8vSCxPQUFPLENBQUNtTyxTQUFTO1VBQ3hCO1VBQ0EsSUFBSUMsV0FBVyxHQUFHLElBQUkzWixpQkFBaUIsQ0FDckNQLElBQUksQ0FBQ3dPLGtCQUFrQixDQUFDclAsY0FBYyxFQUN0Q2EsSUFBSSxDQUFDd08sa0JBQWtCLENBQUNqUCxRQUFRLEVBQ2hDdU0sT0FBTyxDQUFDO1VBQ1YsT0FBTyxJQUFJMkYsTUFBTSxDQUFDelIsSUFBSSxDQUFDeU8sWUFBWSxFQUFFeUwsV0FBVyxDQUFDO1FBQ25ELENBQUMsQ0FBQztNQUNKLENBQUM7TUFHRDtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBSCxrQkFBa0IsRUFBRSxTQUFBQSxDQUFVckosVUFBVSxFQUFFZ0osU0FBUyxFQUFFO1FBQ25ELElBQUkxWixJQUFJLEdBQUcsSUFBSTtRQUNmbEMsTUFBTSxDQUFDc1gsZ0JBQWdCLENBQUMsWUFBWTtVQUVsQztVQUNBO1VBQ0EsSUFBSXBWLElBQUksQ0FBQ3lTLE1BQU0sRUFBRTtZQUNmelMsSUFBSSxDQUFDNFMsa0JBQWtCLENBQUMxSyxLQUFLLENBQUMsQ0FBQztVQUNqQzs7VUFFQTtVQUNBO1VBQ0EsSUFBSWlTLFdBQVcsR0FBRyxFQUFFO1VBQ3BCbmEsSUFBSSxDQUFDOFMsVUFBVSxDQUFDaFUsT0FBTyxDQUFDLFVBQVVpSixHQUFHLEVBQUV2SSxFQUFFLEVBQUU7WUFDekMsSUFBSSxDQUFDa1IsVUFBVSxDQUFDN0MsR0FBRyxDQUFDck8sRUFBRSxDQUFDLEVBQ3JCMmEsV0FBVyxDQUFDMWIsSUFBSSxDQUFDZSxFQUFFLENBQUM7VUFDeEIsQ0FBQyxDQUFDO1VBQ0YyYSxXQUFXLENBQUNyYixPQUFPLENBQUMsVUFBVVUsRUFBRSxFQUFFO1lBQ2hDUSxJQUFJLENBQUM4VixnQkFBZ0IsQ0FBQ3RXLEVBQUUsQ0FBQztVQUMzQixDQUFDLENBQUM7O1VBRUY7VUFDQTtVQUNBO1VBQ0FrUixVQUFVLENBQUM1UixPQUFPLENBQUMsVUFBVWlKLEdBQUcsRUFBRXZJLEVBQUUsRUFBRTtZQUNwQ1EsSUFBSSxDQUFDb1gsVUFBVSxDQUFDNVgsRUFBRSxFQUFFdUksR0FBRyxDQUFDO1VBQzFCLENBQUMsQ0FBQzs7VUFFRjtVQUNBO1VBQ0E7VUFDQSxJQUFJL0gsSUFBSSxDQUFDOFMsVUFBVSxDQUFDd0MsSUFBSSxDQUFDLENBQUMsS0FBSzVFLFVBQVUsQ0FBQzRFLElBQUksQ0FBQyxDQUFDLEVBQUU7WUFDaER4WCxNQUFNLENBQUNnRyxNQUFNLENBQUMsd0RBQXdELEdBQ3BFLHVEQUF1RCxFQUN2RDlELElBQUksQ0FBQ3dPLGtCQUFrQixDQUFDO1VBQzVCO1VBRUF4TyxJQUFJLENBQUM4UyxVQUFVLENBQUNoVSxPQUFPLENBQUMsVUFBVWlKLEdBQUcsRUFBRXZJLEVBQUUsRUFBRTtZQUN6QyxJQUFJLENBQUNrUixVQUFVLENBQUM3QyxHQUFHLENBQUNyTyxFQUFFLENBQUMsRUFDckIsTUFBTWlFLEtBQUssQ0FBQyxnREFBZ0QsR0FBR2pFLEVBQUUsQ0FBQztVQUN0RSxDQUFDLENBQUM7O1VBRUY7VUFDQWthLFNBQVMsQ0FBQzVhLE9BQU8sQ0FBQyxVQUFVaUosR0FBRyxFQUFFdkksRUFBRSxFQUFFO1lBQ25DUSxJQUFJLENBQUM2VixZQUFZLENBQUNyVyxFQUFFLEVBQUV1SSxHQUFHLENBQUM7VUFDNUIsQ0FBQyxDQUFDO1VBRUYvSCxJQUFJLENBQUNnVCxtQkFBbUIsR0FBRzBHLFNBQVMsQ0FBQ3BFLElBQUksQ0FBQyxDQUFDLEdBQUd0VixJQUFJLENBQUN5UyxNQUFNO1FBQzNELENBQUMsQ0FBQztNQUNKLENBQUM7TUFFRDtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTVHLEtBQUssRUFBRSxlQUFBQSxDQUFBLEVBQWlCO1FBQ3RCLElBQUk3TCxJQUFJLEdBQUcsSUFBSTtRQUNmLElBQUlBLElBQUksQ0FBQ3dCLFFBQVEsRUFDZjtRQUNGeEIsSUFBSSxDQUFDd0IsUUFBUSxHQUFHLElBQUk7O1FBRXBCO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQSxLQUFLLE1BQU0yUCxDQUFDLElBQUluUixJQUFJLENBQUNvVSxnQ0FBZ0MsRUFBRTtVQUNyRCxNQUFNakQsQ0FBQyxDQUFDQyxTQUFTLENBQUMsQ0FBQztRQUNyQjtRQUNBcFIsSUFBSSxDQUFDb1UsZ0NBQWdDLEdBQUcsSUFBSTs7UUFFNUM7UUFDQXBVLElBQUksQ0FBQzhTLFVBQVUsR0FBRyxJQUFJO1FBQ3RCOVMsSUFBSSxDQUFDNFMsa0JBQWtCLEdBQUcsSUFBSTtRQUM5QjVTLElBQUksQ0FBQ2dVLFlBQVksR0FBRyxJQUFJO1FBQ3hCaFUsSUFBSSxDQUFDaVUsa0JBQWtCLEdBQUcsSUFBSTtRQUM5QmpVLElBQUksQ0FBQ29hLGlCQUFpQixHQUFHLElBQUk7UUFDN0JwYSxJQUFJLENBQUNxYSxnQkFBZ0IsR0FBRyxJQUFJO1FBRTVCNVAsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJQSxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUNDLEtBQUssQ0FBQ0MsbUJBQW1CLENBQ3BFLGdCQUFnQixFQUFFLHVCQUF1QixFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQUMsSUFBQTJQLHlCQUFBO1FBQUEsSUFBQUMsaUJBQUE7UUFBQSxJQUFBQyxjQUFBO1FBQUE7VUFFbkQsU0FBQUMsU0FBQSxHQUFBbkosY0FBQSxDQUEyQnRSLElBQUksQ0FBQ2lULFlBQVksR0FBQXlILEtBQUEsRUFBQUoseUJBQUEsS0FBQUksS0FBQSxTQUFBRCxTQUFBLENBQUFFLElBQUEsSUFBQUMsSUFBQSxFQUFBTix5QkFBQSxVQUFFO1lBQUEsTUFBN0J4UixNQUFNLEdBQUE0UixLQUFBLENBQUFqUyxLQUFBO1lBQUE7Y0FDckIsTUFBTUssTUFBTSxDQUFDakssSUFBSSxDQUFDLENBQUM7WUFBQztVQUN0QjtRQUFDLFNBQUFnRixHQUFBO1VBQUEwVyxpQkFBQTtVQUFBQyxjQUFBLEdBQUEzVyxHQUFBO1FBQUE7VUFBQTtZQUFBLElBQUF5Vyx5QkFBQSxJQUFBRyxTQUFBLENBQUFJLE1BQUE7Y0FBQSxNQUFBSixTQUFBLENBQUFJLE1BQUE7WUFBQTtVQUFBO1lBQUEsSUFBQU4saUJBQUE7Y0FBQSxNQUFBQyxjQUFBO1lBQUE7VUFBQTtRQUFBO01BQ0gsQ0FBQztNQUNEM2IsSUFBSSxFQUFFLGVBQUFBLENBQUEsRUFBaUI7UUFDckIsTUFBTW1CLElBQUksR0FBRyxJQUFJO1FBQ2pCLE9BQU8sTUFBTUEsSUFBSSxDQUFDNkwsS0FBSyxDQUFDLENBQUM7TUFDM0IsQ0FBQztNQUVEMkgsb0JBQW9CLEVBQUUsU0FBQUEsQ0FBVXNILEtBQUssRUFBRTtRQUNyQyxJQUFJOWEsSUFBSSxHQUFHLElBQUk7UUFDZmxDLE1BQU0sQ0FBQ3NYLGdCQUFnQixDQUFDLFlBQVk7VUFDbEMsSUFBSTJGLEdBQUcsR0FBRyxJQUFJQyxJQUFJLENBQUQsQ0FBQztVQUVsQixJQUFJaGIsSUFBSSxDQUFDdVUsTUFBTSxFQUFFO1lBQ2YsSUFBSTBHLFFBQVEsR0FBR0YsR0FBRyxHQUFHL2EsSUFBSSxDQUFDa2IsZUFBZTtZQUN6Q3pRLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSUEsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDQyxLQUFLLENBQUNDLG1CQUFtQixDQUN0RSxnQkFBZ0IsRUFBRSxnQkFBZ0IsR0FBRzNLLElBQUksQ0FBQ3VVLE1BQU0sR0FBRyxRQUFRLEVBQUUwRyxRQUFRLENBQUM7VUFDMUU7VUFFQWpiLElBQUksQ0FBQ3VVLE1BQU0sR0FBR3VHLEtBQUs7VUFDbkI5YSxJQUFJLENBQUNrYixlQUFlLEdBQUdILEdBQUc7UUFDNUIsQ0FBQyxDQUFDO01BQ0o7SUFDRixDQUFDLENBQUM7O0lBRUY7SUFDQTtJQUNBO0lBQ0FsZSxrQkFBa0IsQ0FBQ3NlLGVBQWUsR0FBRyxVQUFVOWMsaUJBQWlCLEVBQUVxVixPQUFPLEVBQUU7TUFDekU7TUFDQSxJQUFJNUgsT0FBTyxHQUFHek4saUJBQWlCLENBQUN5TixPQUFPOztNQUV2QztNQUNBO01BQ0EsSUFBSUEsT0FBTyxDQUFDc1AsWUFBWSxJQUFJdFAsT0FBTyxDQUFDdVAsYUFBYSxFQUMvQyxPQUFPLEtBQUs7O01BRWQ7TUFDQTtNQUNBO01BQ0E7TUFDQSxJQUFJdlAsT0FBTyxDQUFDd1AsSUFBSSxJQUFLeFAsT0FBTyxDQUFDd0csS0FBSyxJQUFJLENBQUN4RyxPQUFPLENBQUN0SCxJQUFLLEVBQUUsT0FBTyxLQUFLOztNQUVsRTtNQUNBO01BQ0EsTUFBTXlJLE1BQU0sR0FBR25CLE9BQU8sQ0FBQ21CLE1BQU0sSUFBSW5CLE9BQU8sQ0FBQ3hILFVBQVU7TUFDbkQsSUFBSTJJLE1BQU0sRUFBRTtRQUNWLElBQUk7VUFDRjVOLGVBQWUsQ0FBQ2tjLHlCQUF5QixDQUFDdE8sTUFBTSxDQUFDO1FBQ25ELENBQUMsQ0FBQyxPQUFPdkksQ0FBQyxFQUFFO1VBQ1YsSUFBSUEsQ0FBQyxDQUFDdVUsSUFBSSxLQUFLLGdCQUFnQixFQUFFO1lBQy9CLE9BQU8sS0FBSztVQUNkLENBQUMsTUFBTTtZQUNMLE1BQU12VSxDQUFDO1VBQ1Q7UUFDRjtNQUNGOztNQUVBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQSxPQUFPLENBQUNnUCxPQUFPLENBQUM4SCxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUM5SCxPQUFPLENBQUMrSCxXQUFXLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRUQsSUFBSTFDLDRCQUE0QixHQUFHLFNBQUFBLENBQVUyQyxRQUFRLEVBQUU7TUFDckQsT0FBT2pjLE1BQU0sQ0FBQ2tjLE9BQU8sQ0FBQ0QsUUFBUSxDQUFDLENBQUNFLEtBQUssQ0FBQyxVQUFBaFMsSUFBQSxFQUErQjtRQUFBLElBQXJCLENBQUNpUyxTQUFTLEVBQUU1TyxNQUFNLENBQUMsR0FBQXJELElBQUE7UUFDakUsT0FBT25LLE1BQU0sQ0FBQ2tjLE9BQU8sQ0FBQzFPLE1BQU0sQ0FBQyxDQUFDMk8sS0FBSyxDQUFDLFVBQUE1TyxLQUFBLEVBQTBCO1VBQUEsSUFBaEIsQ0FBQzhPLEtBQUssRUFBRXJULEtBQUssQ0FBQyxHQUFBdUUsS0FBQTtVQUMxRCxPQUFPLENBQUMsU0FBUyxDQUFDK08sSUFBSSxDQUFDRCxLQUFLLENBQUM7UUFDL0IsQ0FBQyxDQUFDO01BQ0osQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUFDaGMsc0JBQUE7RUFBQSxTQUFBQyxXQUFBO0lBQUEsT0FBQUQsc0JBQUEsQ0FBQUMsV0FBQTtFQUFBO0VBQUFELHNCQUFBO0FBQUE7RUFBQUUsSUFBQTtFQUFBQyxLQUFBO0FBQUEsRzs7Ozs7Ozs7Ozs7Ozs7SUNoakNGNUQsT0FBQSxDQUFBQyxNQUFBO01BQUFpVixrQkFBQSxFQUFBQSxDQUFBLEtBQUFBO0lBQUE7SUFBQSxJQUFBNUUsS0FBQTtJQUFBdFEsT0FBQSxDQUFBSyxJQUFBO01BQUFpUSxNQUFBaFEsQ0FBQTtRQUFBZ1EsS0FBQSxHQUFBaFEsQ0FBQTtNQUFBO0lBQUE7SUFBQSxJQUFBSSxvQkFBQSxXQUFBQSxvQkFBQTtJQTREQSxNQUFNaWYscUJBQXFCLEdBQUcsZUFBZTtJQUU3Qzs7O0lBR0EsU0FBU0Msa0JBQWtCQSxDQUFDSCxLQUFhO01BQ3ZDLE9BQU9FLHFCQUFxQixDQUFDRCxJQUFJLENBQUNELEtBQUssQ0FBQztJQUMxQztJQUVBOzs7O0lBSUEsU0FBU0ksZUFBZUEsQ0FBQ0MsUUFBaUI7TUFDeEMsT0FDRUEsUUFBUSxLQUFLLElBQUksSUFDakIsT0FBT0EsUUFBUSxLQUFLLFFBQVEsSUFDNUIsR0FBRyxJQUFJQSxRQUFRLElBQ2RBLFFBQTBCLENBQUNDLENBQUMsS0FBSyxJQUFJLElBQ3RDM2MsTUFBTSxDQUFDK00sSUFBSSxDQUFDMlAsUUFBUSxDQUFDLENBQUNQLEtBQUssQ0FBQ0ssa0JBQWtCLENBQUM7SUFFbkQ7SUFFQTs7OztJQUlBLFNBQVNsWixJQUFJQSxDQUFDc1osTUFBYyxFQUFFcGQsR0FBVztNQUN2QyxPQUFPb2QsTUFBTSxNQUFBMVUsTUFBQSxDQUFNMFUsTUFBTSxPQUFBMVUsTUFBQSxDQUFJMUksR0FBRyxJQUFLQSxHQUFHO0lBQzFDO0lBRUE7Ozs7Ozs7OztJQVNBLFNBQVNxZCxpQkFBaUJBLENBQ3hCM2UsTUFBMkIsRUFDM0I0ZSxNQUFXLEVBQ1hGLE1BQWM7TUFFZCxJQUNFalIsS0FBSyxDQUFDb1IsT0FBTyxDQUFDRCxNQUFNLENBQUMsSUFDckIsT0FBT0EsTUFBTSxLQUFLLFFBQVEsSUFDMUJBLE1BQU0sS0FBSyxJQUFJLElBQ2ZBLE1BQU0sWUFBWUUsS0FBSyxDQUFDQyxRQUFRLElBQ2hDL1AsS0FBSyxDQUFDZ1EsYUFBYSxDQUFDSixNQUFNLENBQUMsRUFDM0I7UUFDQTVlLE1BQU0sQ0FBQzBlLE1BQU0sQ0FBQyxHQUFHRSxNQUFNO1FBQ3ZCO01BQ0Y7TUFFQSxNQUFNWixPQUFPLEdBQUdsYyxNQUFNLENBQUNrYyxPQUFPLENBQUNZLE1BQU0sQ0FBQztNQUN0QyxJQUFJWixPQUFPLENBQUMzVyxNQUFNLEVBQUU7UUFDbEIyVyxPQUFPLENBQUM3YyxPQUFPLENBQUM4SyxJQUFBLElBQWlCO1VBQUEsSUFBaEIsQ0FBQzNLLEdBQUcsRUFBRXdKLEtBQUssQ0FBQyxHQUFBbUIsSUFBQTtVQUMzQjBTLGlCQUFpQixDQUFDM2UsTUFBTSxFQUFFOEssS0FBSyxFQUFFMUYsSUFBSSxDQUFDc1osTUFBTSxFQUFFcGQsR0FBRyxDQUFDLENBQUM7UUFDckQsQ0FBQyxDQUFDO01BQ0osQ0FBQyxNQUFNO1FBQ0x0QixNQUFNLENBQUMwZSxNQUFNLENBQUMsR0FBR0UsTUFBTTtNQUN6QjtJQUNGO0lBRUE7Ozs7Ozs7Ozs7O0lBV0EsU0FBU0ssZ0JBQWdCQSxDQUN2QkMsVUFBc0IsRUFDdEJDLElBQWUsRUFDSjtNQUFBLElBQVhULE1BQU0sR0FBQW5SLFNBQUEsQ0FBQWxHLE1BQUEsUUFBQWtHLFNBQUEsUUFBQVYsU0FBQSxHQUFBVSxTQUFBLE1BQUcsRUFBRTtNQUVYekwsTUFBTSxDQUFDa2MsT0FBTyxDQUFDbUIsSUFBSSxDQUFDLENBQUNoZSxPQUFPLENBQUNrTyxLQUFBLElBQXFCO1FBQUEsSUFBcEIsQ0FBQytQLE9BQU8sRUFBRXRVLEtBQUssQ0FBQyxHQUFBdUUsS0FBQTtRQUM1QyxJQUFJK1AsT0FBTyxLQUFLLEdBQUcsRUFBRTtVQUFBLElBQUFDLGtCQUFBO1VBQ25CO1VBQ0EsQ0FBQUEsa0JBQUEsR0FBQUgsVUFBVSxDQUFDSSxNQUFNLGNBQUFELGtCQUFBLGNBQUFBLGtCQUFBLEdBQWpCSCxVQUFVLENBQUNJLE1BQU0sR0FBSyxFQUFFO1VBQ3hCeGQsTUFBTSxDQUFDK00sSUFBSSxDQUFDL0QsS0FBSyxDQUFDLENBQUMzSixPQUFPLENBQUNHLEdBQUcsSUFBRztZQUMvQjRkLFVBQVUsQ0FBQ0ksTUFBTyxDQUFDbGEsSUFBSSxDQUFDc1osTUFBTSxFQUFFcGQsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJO1VBQzlDLENBQUMsQ0FBQztRQUNKLENBQUMsTUFBTSxJQUFJOGQsT0FBTyxLQUFLLEdBQUcsRUFBRTtVQUFBLElBQUFHLGdCQUFBO1VBQzFCO1VBQ0EsQ0FBQUEsZ0JBQUEsR0FBQUwsVUFBVSxDQUFDTSxJQUFJLGNBQUFELGdCQUFBLGNBQUFBLGdCQUFBLEdBQWZMLFVBQVUsQ0FBQ00sSUFBSSxHQUFLLEVBQUU7VUFDdEJiLGlCQUFpQixDQUFDTyxVQUFVLENBQUNNLElBQUksRUFBRTFVLEtBQUssRUFBRTRULE1BQU0sQ0FBQztRQUNuRCxDQUFDLE1BQU0sSUFBSVUsT0FBTyxLQUFLLEdBQUcsRUFBRTtVQUFBLElBQUFLLGlCQUFBO1VBQzFCO1VBQ0EsQ0FBQUEsaUJBQUEsR0FBQVAsVUFBVSxDQUFDTSxJQUFJLGNBQUFDLGlCQUFBLGNBQUFBLGlCQUFBLEdBQWZQLFVBQVUsQ0FBQ00sSUFBSSxHQUFLLEVBQUU7VUFDdEIxZCxNQUFNLENBQUNrYyxPQUFPLENBQUNsVCxLQUFLLENBQUMsQ0FBQzNKLE9BQU8sQ0FBQ3VlLEtBQUEsSUFBc0I7WUFBQSxJQUFyQixDQUFDcGUsR0FBRyxFQUFFcWUsVUFBVSxDQUFDLEdBQUFELEtBQUE7WUFDOUNSLFVBQVUsQ0FBQ00sSUFBSyxDQUFDcGEsSUFBSSxDQUFDc1osTUFBTSxFQUFFcGQsR0FBRyxDQUFDLENBQUMsR0FBR3FlLFVBQVU7VUFDbEQsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxNQUFNLElBQUlQLE9BQU8sQ0FBQzVULFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRTtVQUNsQztVQUNBLE1BQU1sSyxHQUFHLEdBQUc4ZCxPQUFPLENBQUMzVCxLQUFLLENBQUMsQ0FBQyxDQUFDO1VBQzVCLElBQUk4UyxlQUFlLENBQUN6VCxLQUFLLENBQUMsRUFBRTtZQUMxQjtZQUNBaEosTUFBTSxDQUFDa2MsT0FBTyxDQUFDbFQsS0FBSyxDQUFDLENBQUMzSixPQUFPLENBQUN5ZSxLQUFBLElBQTJCO2NBQUEsSUFBMUIsQ0FBQ0MsUUFBUSxFQUFFRixVQUFVLENBQUMsR0FBQUMsS0FBQTtjQUNuRCxJQUFJQyxRQUFRLEtBQUssR0FBRyxFQUFFO2NBRXRCLE1BQU1DLFdBQVcsR0FBRzFhLElBQUksQ0FBQ3NaLE1BQU0sS0FBQTFVLE1BQUEsQ0FBSzFJLEdBQUcsT0FBQTBJLE1BQUEsQ0FBSTZWLFFBQVEsQ0FBQ3BVLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBRSxDQUFDO2NBQy9ELElBQUlvVSxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxFQUFFO2dCQUN2QlosZ0JBQWdCLENBQUNDLFVBQVUsRUFBRVMsVUFBVSxFQUFFRyxXQUFXLENBQUM7Y0FDdkQsQ0FBQyxNQUFNLElBQUlILFVBQVUsS0FBSyxJQUFJLEVBQUU7Z0JBQUEsSUFBQUksbUJBQUE7Z0JBQzlCLENBQUFBLG1CQUFBLEdBQUFiLFVBQVUsQ0FBQ0ksTUFBTSxjQUFBUyxtQkFBQSxjQUFBQSxtQkFBQSxHQUFqQmIsVUFBVSxDQUFDSSxNQUFNLEdBQUssRUFBRTtnQkFDeEJKLFVBQVUsQ0FBQ0ksTUFBTSxDQUFDUSxXQUFXLENBQUMsR0FBRyxJQUFJO2NBQ3ZDLENBQUMsTUFBTTtnQkFBQSxJQUFBRSxpQkFBQTtnQkFDTCxDQUFBQSxpQkFBQSxHQUFBZCxVQUFVLENBQUNNLElBQUksY0FBQVEsaUJBQUEsY0FBQUEsaUJBQUEsR0FBZmQsVUFBVSxDQUFDTSxJQUFJLEdBQUssRUFBRTtnQkFDdEJOLFVBQVUsQ0FBQ00sSUFBSSxDQUFDTSxXQUFXLENBQUMsR0FBR0gsVUFBVTtjQUMzQztZQUNGLENBQUMsQ0FBQztVQUNKLENBQUMsTUFBTSxJQUFJcmUsR0FBRyxFQUFFO1lBQ2Q7WUFDQTJkLGdCQUFnQixDQUFDQyxVQUFVLEVBQUVwVSxLQUFLLEVBQUUxRixJQUFJLENBQUNzWixNQUFNLEVBQUVwZCxHQUFHLENBQUMsQ0FBQztVQUN4RDtRQUNGO01BQ0YsQ0FBQyxDQUFDO0lBQ0o7SUFFQTs7Ozs7Ozs7O0lBU00sU0FBVXNTLGtCQUFrQkEsQ0FBQ3NMLFVBQXNCO01BQ3ZELElBQUlBLFVBQVUsQ0FBQ2UsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDZixVQUFVLENBQUNDLElBQUksRUFBRTtRQUMzQyxPQUFPRCxVQUFVO01BQ25CO01BRUEsTUFBTWdCLG1CQUFtQixHQUFlO1FBQUVELEVBQUUsRUFBRTtNQUFDLENBQUU7TUFDakRoQixnQkFBZ0IsQ0FBQ2lCLG1CQUFtQixFQUFFaEIsVUFBVSxDQUFDQyxJQUFJLENBQUM7TUFDdEQsT0FBT2UsbUJBQW1CO0lBQzVCO0lBQUMvZCxzQkFBQTtFQUFBLFNBQUFDLFdBQUE7SUFBQSxPQUFBRCxzQkFBQSxDQUFBQyxXQUFBO0VBQUE7RUFBQUQsc0JBQUE7QUFBQTtFQUFBRSxJQUFBO0VBQUFDLEtBQUE7QUFBQSxHOzs7Ozs7Ozs7OztBQy9MRDFDLE1BQUEsQ0FBQWpCLE1BQUE7RUFBQWlFLGlCQUFBLEVBQUFBLENBQUEsS0FBQUE7QUFBQTtBQVFNLE1BQU9BLGlCQUFpQjtFQUs1QlMsWUFBWTdCLGNBQXNCLEVBQUVJLFFBQWEsRUFBRXVNLE9BQXVCO0lBQUEsS0FKMUUzTSxjQUFjO0lBQUEsS0FDZEksUUFBUTtJQUFBLEtBQ1J1TSxPQUFPO0lBR0wsSUFBSSxDQUFDM00sY0FBYyxHQUFHQSxjQUFjO0lBQ3BDO0lBQ0EsSUFBSSxDQUFDSSxRQUFRLEdBQUdrZCxLQUFLLENBQUNxQixVQUFVLENBQUNDLGdCQUFnQixDQUFDeGUsUUFBUSxDQUFDO0lBQzNELElBQUksQ0FBQ3VNLE9BQU8sR0FBR0EsT0FBTyxJQUFJLEVBQUU7RUFDOUI7Ozs7Ozs7Ozs7Ozs7OztJQzlCRixJQUFJNUwsYUFBYTtJQUFDM0MsTUFBTSxDQUFDYixJQUFJLENBQUMsc0NBQXNDLEVBQUM7TUFBQ3lELE9BQU9BLENBQUN4RCxDQUFDLEVBQUM7UUFBQ3VELGFBQWEsR0FBQ3ZELENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBckdZLE1BQU0sQ0FBQ2pCLE1BQU0sQ0FBQztNQUFDTSxlQUFlLEVBQUNBLENBQUEsS0FBSUE7SUFBZSxDQUFDLENBQUM7SUFBQyxJQUFJa0IsTUFBTTtJQUFDUCxNQUFNLENBQUNiLElBQUksQ0FBQyxlQUFlLEVBQUM7TUFBQ29CLE1BQU1BLENBQUNuQixDQUFDLEVBQUM7UUFBQ21CLE1BQU0sR0FBQ25CLENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJcWhCLG1CQUFtQixFQUFDQyxrQkFBa0I7SUFBQzFnQixNQUFNLENBQUNiLElBQUksQ0FBQyw0QkFBNEIsRUFBQztNQUFDc2hCLG1CQUFtQkEsQ0FBQ3JoQixDQUFDLEVBQUM7UUFBQ3FoQixtQkFBbUIsR0FBQ3JoQixDQUFDO01BQUEsQ0FBQztNQUFDc2hCLGtCQUFrQkEsQ0FBQ3RoQixDQUFDLEVBQUM7UUFBQ3NoQixrQkFBa0IsR0FBQ3RoQixDQUFDO01BQUE7SUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQUMsSUFBSXVoQixJQUFJO0lBQUMzZ0IsTUFBTSxDQUFDYixJQUFJLENBQUMsTUFBTSxFQUFDO01BQUN5RCxPQUFPQSxDQUFDeEQsQ0FBQyxFQUFDO1FBQUN1aEIsSUFBSSxHQUFDdmhCLENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJd2hCLGtCQUFrQjtJQUFDNWdCLE1BQU0sQ0FBQ2IsSUFBSSxDQUFDLHVCQUF1QixFQUFDO01BQUN5aEIsa0JBQWtCQSxDQUFDeGhCLENBQUMsRUFBQztRQUFDd2hCLGtCQUFrQixHQUFDeGhCLENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJOFUsTUFBTTtJQUFDbFUsTUFBTSxDQUFDYixJQUFJLENBQUMsVUFBVSxFQUFDO01BQUMrVSxNQUFNQSxDQUFDOVUsQ0FBQyxFQUFDO1FBQUM4VSxNQUFNLEdBQUM5VSxDQUFDO01BQUE7SUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQUMsSUFBSTRELGlCQUFpQjtJQUFDaEQsTUFBTSxDQUFDYixJQUFJLENBQUMsc0JBQXNCLEVBQUM7TUFBQzZELGlCQUFpQkEsQ0FBQzVELENBQUMsRUFBQztRQUFDNEQsaUJBQWlCLEdBQUM1RCxDQUFDO01BQUE7SUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQUMsSUFBSTBRLFVBQVU7SUFBQzlQLE1BQU0sQ0FBQ2IsSUFBSSxDQUFDLGVBQWUsRUFBQztNQUFDMlEsVUFBVUEsQ0FBQzFRLENBQUMsRUFBQztRQUFDMFEsVUFBVSxHQUFDMVEsQ0FBQztNQUFBO0lBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUFDLElBQUlHLE9BQU8sRUFBQ3NoQiwwQkFBMEIsRUFBQ0MsWUFBWSxFQUFDQyxlQUFlO0lBQUMvZ0IsTUFBTSxDQUFDYixJQUFJLENBQUMsZ0JBQWdCLEVBQUM7TUFBQ0ksT0FBT0EsQ0FBQ0gsQ0FBQyxFQUFDO1FBQUNHLE9BQU8sR0FBQ0gsQ0FBQztNQUFBLENBQUM7TUFBQ3loQiwwQkFBMEJBLENBQUN6aEIsQ0FBQyxFQUFDO1FBQUN5aEIsMEJBQTBCLEdBQUN6aEIsQ0FBQztNQUFBLENBQUM7TUFBQzBoQixZQUFZQSxDQUFDMWhCLENBQUMsRUFBQztRQUFDMGhCLFlBQVksR0FBQzFoQixDQUFDO01BQUEsQ0FBQztNQUFDMmhCLGVBQWVBLENBQUMzaEIsQ0FBQyxFQUFDO1FBQUMyaEIsZUFBZSxHQUFDM2hCLENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJNGhCLGFBQWE7SUFBQ2hoQixNQUFNLENBQUNiLElBQUksQ0FBQyxrQkFBa0IsRUFBQztNQUFDNmhCLGFBQWFBLENBQUM1aEIsQ0FBQyxFQUFDO1FBQUM0aEIsYUFBYSxHQUFDNWhCLENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJZ04sa0JBQWtCO0lBQUNwTSxNQUFNLENBQUNiLElBQUksQ0FBQyxxQkFBcUIsRUFBQztNQUFDaU4sa0JBQWtCQSxDQUFDaE4sQ0FBQyxFQUFDO1FBQUNnTixrQkFBa0IsR0FBQ2hOLENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJRSxrQkFBa0I7SUFBQ1UsTUFBTSxDQUFDYixJQUFJLENBQUMsd0JBQXdCLEVBQUM7TUFBQ0csa0JBQWtCQSxDQUFDRixDQUFDLEVBQUM7UUFBQ0Usa0JBQWtCLEdBQUNGLENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxFQUFFLENBQUM7SUFBQyxJQUFJeUQsZ0JBQWdCLEVBQUMzRCxXQUFXO0lBQUNjLE1BQU0sQ0FBQ2IsSUFBSSxDQUFDLGlCQUFpQixFQUFDO01BQUMwRCxnQkFBZ0JBLENBQUN6RCxDQUFDLEVBQUM7UUFBQ3lELGdCQUFnQixHQUFDekQsQ0FBQztNQUFBLENBQUM7TUFBQ0YsV0FBV0EsQ0FBQ0UsQ0FBQyxFQUFDO1FBQUNGLFdBQVcsR0FBQ0UsQ0FBQztNQUFBO0lBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQztJQUFDLElBQUlzUixvQkFBb0I7SUFBQzFRLE1BQU0sQ0FBQ2IsSUFBSSxDQUFDLDBCQUEwQixFQUFDO01BQUN1UixvQkFBb0JBLENBQUN0UixDQUFDLEVBQUM7UUFBQ3NSLG9CQUFvQixHQUFDdFIsQ0FBQztNQUFBO0lBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQztJQUFDLElBQUlJLG9CQUFvQixDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU1BLG9CQUFvQixDQUFDLENBQUMsRUFBRSxDQUFDO0lBY2xpRCxNQUFNeWhCLGlCQUFpQixHQUFHLE9BQU87SUFDakMsTUFBTUMsYUFBYSxHQUFHLFFBQVE7SUFDOUIsTUFBTUMsVUFBVSxHQUFHLEtBQUs7SUFFeEIsTUFBTUMsdUJBQXVCLEdBQUcsRUFBRTtJQUUzQixNQUFNL2hCLGVBQWUsR0FBRyxTQUFBQSxDQUFVZ2lCLEdBQUcsRUFBRTlTLE9BQU8sRUFBRTtNQUFBLElBQUE3RixnQkFBQSxFQUFBQyxxQkFBQSxFQUFBQyxzQkFBQTtNQUNyRCxJQUFJbkcsSUFBSSxHQUFHLElBQUk7TUFDZjhMLE9BQU8sR0FBR0EsT0FBTyxJQUFJLENBQUMsQ0FBQztNQUN2QjlMLElBQUksQ0FBQzZlLG9CQUFvQixHQUFHLENBQUMsQ0FBQztNQUM5QjdlLElBQUksQ0FBQzhlLGVBQWUsR0FBRyxJQUFJMWIsSUFBSSxDQUFELENBQUM7TUFFL0IsTUFBTTJiLFdBQVcsR0FBQTdlLGFBQUEsQ0FBQUEsYUFBQSxLQUNYdWMsS0FBSyxDQUFDdUMsa0JBQWtCLElBQUksQ0FBQyxDQUFDLEdBQzlCLEVBQUEvWSxnQkFBQSxHQUFBbkksTUFBTSxDQUFDbUosUUFBUSxjQUFBaEIsZ0JBQUEsd0JBQUFDLHFCQUFBLEdBQWZELGdCQUFBLENBQWlCaUIsUUFBUSxjQUFBaEIscUJBQUEsd0JBQUFDLHNCQUFBLEdBQXpCRCxxQkFBQSxDQUEyQmlCLEtBQUssY0FBQWhCLHNCQUFBLHVCQUFoQ0Esc0JBQUEsQ0FBa0MyRixPQUFPLEtBQUksQ0FBQyxDQUFDLENBQ3BEO01BRUQsSUFBSW1ULFlBQVksR0FBR3hmLE1BQU0sQ0FBQ0MsTUFBTSxDQUFDO1FBQy9Cd2YsZUFBZSxFQUFFO01BQ25CLENBQUMsRUFBRUgsV0FBVyxDQUFDOztNQUlmO01BQ0E7TUFDQSxJQUFJLGFBQWEsSUFBSWpULE9BQU8sRUFBRTtRQUM1QjtRQUNBO1FBQ0FtVCxZQUFZLENBQUNsWixXQUFXLEdBQUcrRixPQUFPLENBQUMvRixXQUFXO01BQ2hEO01BQ0EsSUFBSSxhQUFhLElBQUkrRixPQUFPLEVBQUU7UUFDNUJtVCxZQUFZLENBQUNqWixXQUFXLEdBQUc4RixPQUFPLENBQUM5RixXQUFXO01BQ2hEOztNQUVBO01BQ0E7TUFDQXZHLE1BQU0sQ0FBQ2tjLE9BQU8sQ0FBQ3NELFlBQVksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUMvQnpHLE1BQU0sQ0FBQzVPLElBQUE7UUFBQSxJQUFDLENBQUMzSyxHQUFHLENBQUMsR0FBQTJLLElBQUE7UUFBQSxPQUFLM0ssR0FBRyxJQUFJQSxHQUFHLENBQUNrZ0IsUUFBUSxDQUFDWCxpQkFBaUIsQ0FBQztNQUFBLEVBQUMsQ0FDekQxZixPQUFPLENBQUNrTyxLQUFBLElBQWtCO1FBQUEsSUFBakIsQ0FBQy9OLEdBQUcsRUFBRXdKLEtBQUssQ0FBQyxHQUFBdUUsS0FBQTtRQUNwQixNQUFNb1MsVUFBVSxHQUFHbmdCLEdBQUcsQ0FBQ29nQixPQUFPLENBQUNiLGlCQUFpQixFQUFFLEVBQUUsQ0FBQztRQUNyRFMsWUFBWSxDQUFDRyxVQUFVLENBQUMsR0FBR2xCLElBQUksQ0FBQ25iLElBQUksQ0FBQ3VjLE1BQU0sQ0FBQ0MsWUFBWSxDQUFDLENBQUMsRUFDeERkLGFBQWEsRUFBRUMsVUFBVSxFQUFFalcsS0FBSyxDQUFDO1FBQ25DLE9BQU93VyxZQUFZLENBQUNoZ0IsR0FBRyxDQUFDO01BQzFCLENBQUMsQ0FBQztNQUVKZSxJQUFJLENBQUN3RyxFQUFFLEdBQUcsSUFBSTtNQUNkeEcsSUFBSSxDQUFDcVUsWUFBWSxHQUFHLElBQUk7TUFDeEJyVSxJQUFJLENBQUNvWSxXQUFXLEdBQUcsSUFBSTtNQUV2QjZHLFlBQVksQ0FBQ08sVUFBVSxHQUFHO1FBQ3hCdkcsSUFBSSxFQUFFLFFBQVE7UUFDZDViLE9BQU8sRUFBRVMsTUFBTSxDQUFDMmhCO01BQ2xCLENBQUM7TUFFRHpmLElBQUksQ0FBQzBmLE1BQU0sR0FBRyxJQUFJNWlCLE9BQU8sQ0FBQzZpQixXQUFXLENBQUNmLEdBQUcsRUFBRUssWUFBWSxDQUFDO01BQ3hEamYsSUFBSSxDQUFDd0csRUFBRSxHQUFHeEcsSUFBSSxDQUFDMGYsTUFBTSxDQUFDbFosRUFBRSxDQUFDLENBQUM7TUFFMUJ4RyxJQUFJLENBQUMwZixNQUFNLENBQUNFLEVBQUUsQ0FBQywwQkFBMEIsRUFBRTloQixNQUFNLENBQUM2RixlQUFlLENBQUNrYyxLQUFLLElBQUk7UUFDekU7UUFDQTtRQUNBO1FBQ0EsSUFDRUEsS0FBSyxDQUFDQyxtQkFBbUIsQ0FBQ0MsSUFBSSxLQUFLLFdBQVcsSUFDOUNGLEtBQUssQ0FBQ0csY0FBYyxDQUFDRCxJQUFJLEtBQUssV0FBVyxFQUN6QztVQUNBL2YsSUFBSSxDQUFDOGUsZUFBZSxDQUFDM1csSUFBSSxDQUFDM0UsUUFBUSxJQUFJO1lBQ3BDQSxRQUFRLENBQUMsQ0FBQztZQUNWLE9BQU8sSUFBSTtVQUNiLENBQUMsQ0FBQztRQUNKO01BQ0YsQ0FBQyxDQUFDLENBQUM7TUFFSCxJQUFJc0ksT0FBTyxDQUFDN0ssUUFBUSxJQUFJLENBQUV3SixPQUFPLENBQUMsZUFBZSxDQUFDLEVBQUU7UUFDbER6SyxJQUFJLENBQUNxVSxZQUFZLEdBQUcsSUFBSTVYLFdBQVcsQ0FBQ3FQLE9BQU8sQ0FBQzdLLFFBQVEsRUFBRWpCLElBQUksQ0FBQ3dHLEVBQUUsQ0FBQ3laLFlBQVksQ0FBQztRQUMzRWpnQixJQUFJLENBQUNvWSxXQUFXLEdBQUcsSUFBSS9LLFVBQVUsQ0FBQ3JOLElBQUksQ0FBQztNQUN6QztJQUVGLENBQUM7SUFFRHBELGVBQWUsQ0FBQ3VCLFNBQVMsQ0FBQytoQixNQUFNLEdBQUcsa0JBQWlCO01BQ2xELElBQUlsZ0IsSUFBSSxHQUFHLElBQUk7TUFFZixJQUFJLENBQUVBLElBQUksQ0FBQ3dHLEVBQUUsRUFDWCxNQUFNL0MsS0FBSyxDQUFDLHlDQUF5QyxDQUFDOztNQUV4RDtNQUNBLElBQUkwYyxXQUFXLEdBQUduZ0IsSUFBSSxDQUFDcVUsWUFBWTtNQUNuQ3JVLElBQUksQ0FBQ3FVLFlBQVksR0FBRyxJQUFJO01BQ3hCLElBQUk4TCxXQUFXLEVBQ2IsTUFBTUEsV0FBVyxDQUFDdGhCLElBQUksQ0FBQyxDQUFDOztNQUUxQjtNQUNBO01BQ0E7TUFDQSxNQUFNbUIsSUFBSSxDQUFDMGYsTUFBTSxDQUFDVSxLQUFLLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBRUR4akIsZUFBZSxDQUFDdUIsU0FBUyxDQUFDaWlCLEtBQUssR0FBRyxZQUFZO01BQzVDLE9BQU8sSUFBSSxDQUFDRixNQUFNLENBQUMsQ0FBQztJQUN0QixDQUFDO0lBRUR0akIsZUFBZSxDQUFDdUIsU0FBUyxDQUFDa2lCLGVBQWUsR0FBRyxVQUFTRixXQUFXLEVBQUU7TUFDaEUsSUFBSSxDQUFDOUwsWUFBWSxHQUFHOEwsV0FBVztNQUMvQixPQUFPLElBQUk7SUFDYixDQUFDOztJQUVEO0lBQ0F2akIsZUFBZSxDQUFDdUIsU0FBUyxDQUFDbWlCLGFBQWEsR0FBRyxVQUFVbmhCLGNBQWMsRUFBRTtNQUNsRSxJQUFJYSxJQUFJLEdBQUcsSUFBSTtNQUVmLElBQUksQ0FBRUEsSUFBSSxDQUFDd0csRUFBRSxFQUNYLE1BQU0vQyxLQUFLLENBQUMsaURBQWlELENBQUM7TUFFaEUsT0FBT3pELElBQUksQ0FBQ3dHLEVBQUUsQ0FBQ3RILFVBQVUsQ0FBQ0MsY0FBYyxDQUFDO0lBQzNDLENBQUM7SUFFRHZDLGVBQWUsQ0FBQ3VCLFNBQVMsQ0FBQ29pQiwyQkFBMkIsR0FBRyxnQkFDdERwaEIsY0FBYyxFQUFFcWhCLFFBQVEsRUFBRUMsWUFBWSxFQUFFO01BQ3hDLElBQUl6Z0IsSUFBSSxHQUFHLElBQUk7TUFFZixJQUFJLENBQUVBLElBQUksQ0FBQ3dHLEVBQUUsRUFDWCxNQUFNL0MsS0FBSyxDQUFDLCtEQUErRCxDQUFDO01BRzlFLE1BQU16RCxJQUFJLENBQUN3RyxFQUFFLENBQUNrYSxnQkFBZ0IsQ0FBQ3ZoQixjQUFjLEVBQzNDO1FBQUV3aEIsTUFBTSxFQUFFLElBQUk7UUFBRXJMLElBQUksRUFBRWtMLFFBQVE7UUFBRUksR0FBRyxFQUFFSDtNQUFhLENBQUMsQ0FBQztJQUN4RCxDQUFDOztJQUVEO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTdqQixlQUFlLENBQUN1QixTQUFTLENBQUMwaUIsZ0JBQWdCLEdBQUcsWUFBWTtNQUN2RCxNQUFNalIsS0FBSyxHQUFHbFIsU0FBUyxDQUFDbVIsZ0JBQWdCLENBQUMsQ0FBQztNQUMxQyxJQUFJRCxLQUFLLEVBQUU7UUFDVCxPQUFPQSxLQUFLLENBQUNFLFVBQVUsQ0FBQyxDQUFDO01BQzNCLENBQUMsTUFBTTtRQUNMLE9BQU87VUFBQ3NCLFNBQVMsRUFBRSxTQUFBQSxDQUFBLEVBQVksQ0FBQztRQUFDLENBQUM7TUFDcEM7SUFDRixDQUFDOztJQUVEO0lBQ0E7SUFDQXhVLGVBQWUsQ0FBQ3VCLFNBQVMsQ0FBQzhXLFdBQVcsR0FBRyxVQUFVelIsUUFBUSxFQUFFO01BQzFELE9BQU8sSUFBSSxDQUFDc2IsZUFBZSxDQUFDNWEsUUFBUSxDQUFDVixRQUFRLENBQUM7SUFDaEQsQ0FBQztJQUVENUcsZUFBZSxDQUFDdUIsU0FBUyxDQUFDMmlCLFdBQVcsR0FBRyxnQkFBZ0JDLGVBQWUsRUFBRUMsUUFBUSxFQUFFO01BQ2pGLE1BQU1oaEIsSUFBSSxHQUFHLElBQUk7TUFFakIsSUFBSStnQixlQUFlLEtBQUssbUNBQW1DLEVBQUU7UUFDM0QsTUFBTXJjLENBQUMsR0FBRyxJQUFJakIsS0FBSyxDQUFDLGNBQWMsQ0FBQztRQUNuQ2lCLENBQUMsQ0FBQ3VjLGVBQWUsR0FBRyxJQUFJO1FBQ3hCLE1BQU12YyxDQUFDO01BQ1Q7TUFFQSxJQUFJLEVBQUVyRixlQUFlLENBQUM2aEIsY0FBYyxDQUFDRixRQUFRLENBQUMsSUFDNUMsQ0FBQ3JVLEtBQUssQ0FBQ2dRLGFBQWEsQ0FBQ3FFLFFBQVEsQ0FBQyxDQUFDLEVBQUU7UUFDakMsTUFBTSxJQUFJdmQsS0FBSyxDQUFDLGlEQUFpRCxDQUFDO01BQ3BFO01BRUEsSUFBSXVSLEtBQUssR0FBR2hWLElBQUksQ0FBQzZnQixnQkFBZ0IsQ0FBQyxDQUFDO01BQ25DLElBQUlNLE9BQU8sR0FBRyxlQUFBQSxDQUFBLEVBQWtCO1FBQzlCLE1BQU1yakIsTUFBTSxDQUFDcWpCLE9BQU8sQ0FBQztVQUFDamlCLFVBQVUsRUFBRTZoQixlQUFlO1VBQUV2aEIsRUFBRSxFQUFFd2hCLFFBQVEsQ0FBQ3BZO1FBQUksQ0FBQyxDQUFDO01BQ3hFLENBQUM7TUFDRCxPQUFPNUksSUFBSSxDQUFDc2dCLGFBQWEsQ0FBQ1MsZUFBZSxDQUFDLENBQUNLLFNBQVMsQ0FDbEQvQyxZQUFZLENBQUMyQyxRQUFRLEVBQUU1QywwQkFBMEIsQ0FBQyxFQUNsRDtRQUNFaUQsSUFBSSxFQUFFO01BQ1IsQ0FDRixDQUFDLENBQUN4VyxJQUFJLENBQUMsTUFBQXdTLEtBQUEsSUFBd0I7UUFBQSxJQUFqQjtVQUFDaUU7UUFBVSxDQUFDLEdBQUFqRSxLQUFBO1FBQ3hCLE1BQU04RCxPQUFPLENBQUMsQ0FBQztRQUNmLE1BQU1uTSxLQUFLLENBQUM1RCxTQUFTLENBQUMsQ0FBQztRQUN2QixPQUFPa1EsVUFBVTtNQUNuQixDQUFDLENBQUMsQ0FBQ0MsS0FBSyxDQUFDLE1BQU03YyxDQUFDLElBQUk7UUFDbEIsTUFBTXNRLEtBQUssQ0FBQzVELFNBQVMsQ0FBQyxDQUFDO1FBQ3ZCLE1BQU0xTSxDQUFDO01BQ1QsQ0FBQyxDQUFDO0lBQ0osQ0FBQzs7SUFHRDtJQUNBO0lBQ0E5SCxlQUFlLENBQUN1QixTQUFTLENBQUNxakIsUUFBUSxHQUFHLGdCQUFnQnJpQixjQUFjLEVBQUVJLFFBQVEsRUFBRTtNQUM3RSxJQUFJa2lCLFVBQVUsR0FBRztRQUFDdmlCLFVBQVUsRUFBRUM7TUFBYyxDQUFDO01BQzdDO01BQ0E7TUFDQTtNQUNBO01BQ0EsSUFBSUMsV0FBVyxHQUFHQyxlQUFlLENBQUNDLHFCQUFxQixDQUFDQyxRQUFRLENBQUM7TUFDakUsSUFBSUgsV0FBVyxFQUFFO1FBQ2YsS0FBSyxNQUFNSSxFQUFFLElBQUlKLFdBQVcsRUFBRTtVQUM1QixNQUFNdEIsTUFBTSxDQUFDcWpCLE9BQU8sQ0FBQzFoQixNQUFNLENBQUNDLE1BQU0sQ0FBQztZQUFDRixFQUFFLEVBQUVBO1VBQUUsQ0FBQyxFQUFFaWlCLFVBQVUsQ0FBQyxDQUFDO1FBQzNEO1FBQUM7TUFDSCxDQUFDLE1BQU07UUFDTCxNQUFNM2pCLE1BQU0sQ0FBQ3FqQixPQUFPLENBQUNNLFVBQVUsQ0FBQztNQUNsQztJQUNGLENBQUM7SUFFRDdrQixlQUFlLENBQUN1QixTQUFTLENBQUN1akIsV0FBVyxHQUFHLGdCQUFnQlgsZUFBZSxFQUFFeGhCLFFBQVEsRUFBRTtNQUNqRixJQUFJUyxJQUFJLEdBQUcsSUFBSTtNQUVmLElBQUkrZ0IsZUFBZSxLQUFLLG1DQUFtQyxFQUFFO1FBQzNELElBQUlyYyxDQUFDLEdBQUcsSUFBSWpCLEtBQUssQ0FBQyxjQUFjLENBQUM7UUFDakNpQixDQUFDLENBQUN1YyxlQUFlLEdBQUcsSUFBSTtRQUN4QixNQUFNdmMsQ0FBQztNQUNUO01BRUEsSUFBSXNRLEtBQUssR0FBR2hWLElBQUksQ0FBQzZnQixnQkFBZ0IsQ0FBQyxDQUFDO01BQ25DLElBQUlNLE9BQU8sR0FBRyxlQUFBQSxDQUFBLEVBQWtCO1FBQzlCLE1BQU1uaEIsSUFBSSxDQUFDd2hCLFFBQVEsQ0FBQ1QsZUFBZSxFQUFFeGhCLFFBQVEsQ0FBQztNQUNoRCxDQUFDO01BRUQsT0FBT1MsSUFBSSxDQUFDc2dCLGFBQWEsQ0FBQ1MsZUFBZSxDQUFDLENBQ3ZDWSxVQUFVLENBQUN0RCxZQUFZLENBQUM5ZSxRQUFRLEVBQUU2ZSwwQkFBMEIsQ0FBQyxFQUFFO1FBQzlEaUQsSUFBSSxFQUFFO01BQ1IsQ0FBQyxDQUFDLENBQ0R4VyxJQUFJLENBQUMsTUFBQTBTLEtBQUEsSUFBNEI7UUFBQSxJQUFyQjtVQUFFcUU7UUFBYSxDQUFDLEdBQUFyRSxLQUFBO1FBQzNCLE1BQU00RCxPQUFPLENBQUMsQ0FBQztRQUNmLE1BQU1uTSxLQUFLLENBQUM1RCxTQUFTLENBQUMsQ0FBQztRQUN2QixPQUFPa04sZUFBZSxDQUFDO1VBQUUvRyxNQUFNLEVBQUc7WUFBQ3NLLGFBQWEsRUFBR0Q7VUFBWTtRQUFFLENBQUMsQ0FBQyxDQUFDRSxjQUFjO01BQ3BGLENBQUMsQ0FBQyxDQUFDUCxLQUFLLENBQUMsTUFBTzFkLEdBQUcsSUFBSztRQUN0QixNQUFNbVIsS0FBSyxDQUFDNUQsU0FBUyxDQUFDLENBQUM7UUFDdkIsTUFBTXZOLEdBQUc7TUFDWCxDQUFDLENBQUM7SUFDTixDQUFDO0lBRURqSCxlQUFlLENBQUN1QixTQUFTLENBQUM0akIsbUJBQW1CLEdBQUcsZ0JBQWU1aUIsY0FBYyxFQUFFO01BQzdFLElBQUlhLElBQUksR0FBRyxJQUFJO01BR2YsSUFBSWdWLEtBQUssR0FBR2hWLElBQUksQ0FBQzZnQixnQkFBZ0IsQ0FBQyxDQUFDO01BQ25DLElBQUlNLE9BQU8sR0FBRyxTQUFBQSxDQUFBLEVBQVc7UUFDdkIsT0FBT3JqQixNQUFNLENBQUNxakIsT0FBTyxDQUFDO1VBQ3BCamlCLFVBQVUsRUFBRUMsY0FBYztVQUMxQkssRUFBRSxFQUFFLElBQUk7VUFDUkcsY0FBYyxFQUFFO1FBQ2xCLENBQUMsQ0FBQztNQUNKLENBQUM7TUFFRCxPQUFPSyxJQUFJLENBQ1JzZ0IsYUFBYSxDQUFDbmhCLGNBQWMsQ0FBQyxDQUM3QmtLLElBQUksQ0FBQyxDQUFDLENBQ053QixJQUFJLENBQUMsTUFBTTBNLE1BQU0sSUFBSTtRQUNwQixNQUFNNEosT0FBTyxDQUFDLENBQUM7UUFDZixNQUFNbk0sS0FBSyxDQUFDNUQsU0FBUyxDQUFDLENBQUM7UUFDdkIsT0FBT21HLE1BQU07TUFDZixDQUFDLENBQUMsQ0FDRGdLLEtBQUssQ0FBQyxNQUFNN2MsQ0FBQyxJQUFJO1FBQ2hCLE1BQU1zUSxLQUFLLENBQUM1RCxTQUFTLENBQUMsQ0FBQztRQUN2QixNQUFNMU0sQ0FBQztNQUNULENBQUMsQ0FBQztJQUNOLENBQUM7O0lBRUQ7SUFDQTtJQUNBOUgsZUFBZSxDQUFDdUIsU0FBUyxDQUFDNmpCLGlCQUFpQixHQUFHLGtCQUFrQjtNQUM5RCxJQUFJaGlCLElBQUksR0FBRyxJQUFJO01BRWYsSUFBSWdWLEtBQUssR0FBR2hWLElBQUksQ0FBQzZnQixnQkFBZ0IsQ0FBQyxDQUFDO01BQ25DLElBQUlNLE9BQU8sR0FBRyxlQUFBQSxDQUFBLEVBQWtCO1FBQzlCLE1BQU1yakIsTUFBTSxDQUFDcWpCLE9BQU8sQ0FBQztVQUFFdmhCLFlBQVksRUFBRTtRQUFLLENBQUMsQ0FBQztNQUM5QyxDQUFDO01BRUQsSUFBSTtRQUNGLE1BQU1JLElBQUksQ0FBQ3dHLEVBQUUsQ0FBQ3liLGFBQWEsQ0FBQyxDQUFDO1FBQzdCLE1BQU1kLE9BQU8sQ0FBQyxDQUFDO1FBQ2YsTUFBTW5NLEtBQUssQ0FBQzVELFNBQVMsQ0FBQyxDQUFDO01BQ3pCLENBQUMsQ0FBQyxPQUFPMU0sQ0FBQyxFQUFFO1FBQ1YsTUFBTXNRLEtBQUssQ0FBQzVELFNBQVMsQ0FBQyxDQUFDO1FBQ3ZCLE1BQU0xTSxDQUFDO01BQ1Q7SUFDRixDQUFDO0lBRUQ5SCxlQUFlLENBQUN1QixTQUFTLENBQUMrakIsV0FBVyxHQUFHLGdCQUFnQm5CLGVBQWUsRUFBRXhoQixRQUFRLEVBQUU0aUIsR0FBRyxFQUFFclcsT0FBTyxFQUFFO01BQy9GLElBQUk5TCxJQUFJLEdBQUcsSUFBSTtNQUVmLElBQUkrZ0IsZUFBZSxLQUFLLG1DQUFtQyxFQUFFO1FBQzNELElBQUlyYyxDQUFDLEdBQUcsSUFBSWpCLEtBQUssQ0FBQyxjQUFjLENBQUM7UUFDakNpQixDQUFDLENBQUN1YyxlQUFlLEdBQUcsSUFBSTtRQUN4QixNQUFNdmMsQ0FBQztNQUNUOztNQUVBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQSxJQUFJLENBQUN5ZCxHQUFHLElBQUksT0FBT0EsR0FBRyxLQUFLLFFBQVEsRUFBRTtRQUNuQyxNQUFNNWMsS0FBSyxHQUFHLElBQUk5QixLQUFLLENBQUMsK0NBQStDLENBQUM7UUFFeEUsTUFBTThCLEtBQUs7TUFDYjtNQUVBLElBQUksRUFBRWxHLGVBQWUsQ0FBQzZoQixjQUFjLENBQUNpQixHQUFHLENBQUMsSUFBSSxDQUFDeFYsS0FBSyxDQUFDZ1EsYUFBYSxDQUFDd0YsR0FBRyxDQUFDLENBQUMsRUFBRTtRQUN2RSxNQUFNNWMsS0FBSyxHQUFHLElBQUk5QixLQUFLLENBQ3JCLCtDQUErQyxHQUMvQyx1QkFBdUIsQ0FBQztRQUUxQixNQUFNOEIsS0FBSztNQUNiO01BRUEsSUFBSSxDQUFDdUcsT0FBTyxFQUFFQSxPQUFPLEdBQUcsQ0FBQyxDQUFDO01BRTFCLElBQUlrSixLQUFLLEdBQUdoVixJQUFJLENBQUM2Z0IsZ0JBQWdCLENBQUMsQ0FBQztNQUNuQyxJQUFJTSxPQUFPLEdBQUcsZUFBQUEsQ0FBQSxFQUFrQjtRQUM5QixNQUFNbmhCLElBQUksQ0FBQ3doQixRQUFRLENBQUNULGVBQWUsRUFBRXhoQixRQUFRLENBQUM7TUFDaEQsQ0FBQztNQUVELElBQUlMLFVBQVUsR0FBR2MsSUFBSSxDQUFDc2dCLGFBQWEsQ0FBQ1MsZUFBZSxDQUFDO01BQ3BELElBQUlxQixTQUFTLEdBQUc7UUFBQ2YsSUFBSSxFQUFFO01BQUksQ0FBQztNQUM1QjtNQUNBLElBQUl2VixPQUFPLENBQUN1VyxZQUFZLEtBQUs3WCxTQUFTLEVBQUU0WCxTQUFTLENBQUNDLFlBQVksR0FBR3ZXLE9BQU8sQ0FBQ3VXLFlBQVk7TUFDckY7TUFDQSxJQUFJdlcsT0FBTyxDQUFDd1csTUFBTSxFQUFFRixTQUFTLENBQUNFLE1BQU0sR0FBRyxJQUFJO01BQzNDLElBQUl4VyxPQUFPLENBQUN5VyxLQUFLLEVBQUVILFNBQVMsQ0FBQ0csS0FBSyxHQUFHLElBQUk7TUFDekM7TUFDQTtNQUNBO01BQ0EsSUFBSXpXLE9BQU8sQ0FBQzBXLFVBQVUsRUFBRUosU0FBUyxDQUFDSSxVQUFVLEdBQUcsSUFBSTtNQUVuRCxJQUFJQyxhQUFhLEdBQUdwRSxZQUFZLENBQUM5ZSxRQUFRLEVBQUU2ZSwwQkFBMEIsQ0FBQztNQUN0RSxJQUFJc0UsUUFBUSxHQUFHckUsWUFBWSxDQUFDOEQsR0FBRyxFQUFFL0QsMEJBQTBCLENBQUM7TUFFNUQsSUFBSXVFLFFBQVEsR0FBR3RqQixlQUFlLENBQUN1akIsa0JBQWtCLENBQUNGLFFBQVEsQ0FBQztNQUUzRCxJQUFJNVcsT0FBTyxDQUFDK1csY0FBYyxJQUFJLENBQUNGLFFBQVEsRUFBRTtRQUN2QyxJQUFJOWUsR0FBRyxHQUFHLElBQUlKLEtBQUssQ0FBQywrQ0FBK0MsQ0FBQztRQUNwRSxNQUFNSSxHQUFHO01BQ1g7O01BRUE7TUFDQTtNQUNBO01BQ0E7O01BRUE7TUFDQTtNQUNBLElBQUlpZixPQUFPO01BQ1gsSUFBSWhYLE9BQU8sQ0FBQ3dXLE1BQU0sRUFBRTtRQUNsQixJQUFJO1VBQ0YsSUFBSXBNLE1BQU0sR0FBRzdXLGVBQWUsQ0FBQzBqQixxQkFBcUIsQ0FBQ3hqQixRQUFRLEVBQUU0aUIsR0FBRyxDQUFDO1VBQ2pFVyxPQUFPLEdBQUc1TSxNQUFNLENBQUN0TixHQUFHO1FBQ3RCLENBQUMsQ0FBQyxPQUFPL0UsR0FBRyxFQUFFO1VBQ1osTUFBTUEsR0FBRztRQUNYO01BQ0Y7TUFDQSxJQUFJaUksT0FBTyxDQUFDd1csTUFBTSxJQUNoQixDQUFFSyxRQUFRLElBQ1YsQ0FBRUcsT0FBTyxJQUNUaFgsT0FBTyxDQUFDd1YsVUFBVSxJQUNsQixFQUFHeFYsT0FBTyxDQUFDd1YsVUFBVSxZQUFZN0UsS0FBSyxDQUFDQyxRQUFRLElBQzdDNVEsT0FBTyxDQUFDa1gsV0FBVyxDQUFDLEVBQUU7UUFDeEI7UUFDQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQSxPQUFPLE1BQU1DLDRCQUE0QixDQUFDL2pCLFVBQVUsRUFBRXVqQixhQUFhLEVBQUVDLFFBQVEsRUFBRTVXLE9BQU8sQ0FBQyxDQUNwRmpCLElBQUksQ0FBQyxNQUFNME0sTUFBTSxJQUFJO1VBQ3BCLE1BQU00SixPQUFPLENBQUMsQ0FBQztVQUNmLE1BQU1uTSxLQUFLLENBQUM1RCxTQUFTLENBQUMsQ0FBQztVQUN2QixJQUFJbUcsTUFBTSxJQUFJLENBQUV6TCxPQUFPLENBQUNvWCxhQUFhLEVBQUU7WUFDckMsT0FBTzNMLE1BQU0sQ0FBQ3VLLGNBQWM7VUFDOUIsQ0FBQyxNQUFNO1lBQ0wsT0FBT3ZLLE1BQU07VUFDZjtRQUNGLENBQUMsQ0FBQztNQUNOLENBQUMsTUFBTTtRQUNMLElBQUl6TCxPQUFPLENBQUN3VyxNQUFNLElBQUksQ0FBQ1EsT0FBTyxJQUFJaFgsT0FBTyxDQUFDd1YsVUFBVSxJQUFJcUIsUUFBUSxFQUFFO1VBQ2hFLElBQUksQ0FBQ0QsUUFBUSxDQUFDUyxjQUFjLENBQUMsY0FBYyxDQUFDLEVBQUU7WUFDNUNULFFBQVEsQ0FBQ1UsWUFBWSxHQUFHLENBQUMsQ0FBQztVQUM1QjtVQUNBTixPQUFPLEdBQUdoWCxPQUFPLENBQUN3VixVQUFVO1VBQzVCN2hCLE1BQU0sQ0FBQ0MsTUFBTSxDQUFDZ2pCLFFBQVEsQ0FBQ1UsWUFBWSxFQUFFL0UsWUFBWSxDQUFDO1lBQUN6VixHQUFHLEVBQUVrRCxPQUFPLENBQUN3VjtVQUFVLENBQUMsRUFBRWxELDBCQUEwQixDQUFDLENBQUM7UUFDM0c7UUFFQSxNQUFNaUYsT0FBTyxHQUFHNWpCLE1BQU0sQ0FBQytNLElBQUksQ0FBQ2tXLFFBQVEsQ0FBQyxDQUFDbEssTUFBTSxDQUFFdlosR0FBRyxJQUFLLENBQUNBLEdBQUcsQ0FBQ2tLLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMzRSxJQUFJbWEsWUFBWSxHQUFHRCxPQUFPLENBQUNyZSxNQUFNLEdBQUcsQ0FBQyxHQUFHLFlBQVksR0FBRyxZQUFZO1FBQ25Fc2UsWUFBWSxHQUNWQSxZQUFZLEtBQUssWUFBWSxJQUFJLENBQUNsQixTQUFTLENBQUNHLEtBQUssR0FDN0MsV0FBVyxHQUNYZSxZQUFZO1FBQ2xCLE9BQU9wa0IsVUFBVSxDQUFDb2tCLFlBQVksQ0FBQyxDQUM1Qi9ULElBQUksQ0FBQ3JRLFVBQVUsQ0FBQyxDQUFDdWpCLGFBQWEsRUFBRUMsUUFBUSxFQUFFTixTQUFTLENBQUMsQ0FDcER2WCxJQUFJLENBQUMsTUFBTTBNLE1BQU0sSUFBSTtVQUNwQixJQUFJZ00sWUFBWSxHQUFHakYsZUFBZSxDQUFDO1lBQUMvRztVQUFNLENBQUMsQ0FBQztVQUM1QyxJQUFJZ00sWUFBWSxJQUFJelgsT0FBTyxDQUFDb1gsYUFBYSxFQUFFO1lBQ3pDO1lBQ0E7WUFDQTtZQUNBLElBQUlwWCxPQUFPLENBQUN3VyxNQUFNLElBQUlpQixZQUFZLENBQUNqQyxVQUFVLEVBQUU7Y0FDN0MsSUFBSXdCLE9BQU8sRUFBRTtnQkFDWFMsWUFBWSxDQUFDakMsVUFBVSxHQUFHd0IsT0FBTztjQUNuQyxDQUFDLE1BQU0sSUFBSVMsWUFBWSxDQUFDakMsVUFBVSxZQUFZeGtCLE9BQU8sQ0FBQzBtQixRQUFRLEVBQUU7Z0JBQzlERCxZQUFZLENBQUNqQyxVQUFVLEdBQUcsSUFBSTdFLEtBQUssQ0FBQ0MsUUFBUSxDQUFDNkcsWUFBWSxDQUFDakMsVUFBVSxDQUFDbUMsV0FBVyxDQUFDLENBQUMsQ0FBQztjQUNyRjtZQUNGO1lBQ0EsTUFBTXRDLE9BQU8sQ0FBQyxDQUFDO1lBQ2YsTUFBTW5NLEtBQUssQ0FBQzVELFNBQVMsQ0FBQyxDQUFDO1lBQ3ZCLE9BQU9tUyxZQUFZO1VBQ3JCLENBQUMsTUFBTTtZQUNMLE1BQU1wQyxPQUFPLENBQUMsQ0FBQztZQUNmLE1BQU1uTSxLQUFLLENBQUM1RCxTQUFTLENBQUMsQ0FBQztZQUN2QixPQUFPbVMsWUFBWSxDQUFDekIsY0FBYztVQUNwQztRQUNGLENBQUMsQ0FBQyxDQUFDUCxLQUFLLENBQUMsTUFBTzFkLEdBQUcsSUFBSztVQUN0QixNQUFNbVIsS0FBSyxDQUFDNUQsU0FBUyxDQUFDLENBQUM7VUFDdkIsTUFBTXZOLEdBQUc7UUFDWCxDQUFDLENBQUM7TUFDTjtJQUNGLENBQUM7O0lBRUQ7SUFDQWpILGVBQWUsQ0FBQzhtQixzQkFBc0IsR0FBRyxVQUFVN2YsR0FBRyxFQUFFO01BRXREO01BQ0E7TUFDQTtNQUNBO01BQ0EsSUFBSTBCLEtBQUssR0FBRzFCLEdBQUcsQ0FBQzhmLE1BQU0sSUFBSTlmLEdBQUcsQ0FBQ0EsR0FBRzs7TUFFakM7TUFDQTtNQUNBO01BQ0EsSUFBSTBCLEtBQUssQ0FBQ3FlLE9BQU8sQ0FBQyxpQ0FBaUMsQ0FBQyxLQUFLLENBQUMsSUFDckRyZSxLQUFLLENBQUNxZSxPQUFPLENBQUMsbUVBQW1FLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtRQUM5RixPQUFPLElBQUk7TUFDYjtNQUVBLE9BQU8sS0FBSztJQUNkLENBQUM7O0lBRUQ7SUFDQTtJQUNBO0lBQ0FobkIsZUFBZSxDQUFDdUIsU0FBUyxDQUFDMGxCLFdBQVcsR0FBRyxnQkFBZ0Ixa0IsY0FBYyxFQUFFSSxRQUFRLEVBQUU0aUIsR0FBRyxFQUFFclcsT0FBTyxFQUFFO01BQzlGLElBQUk5TCxJQUFJLEdBQUcsSUFBSTtNQUlmLElBQUksT0FBTzhMLE9BQU8sS0FBSyxVQUFVLElBQUksQ0FBRXRJLFFBQVEsRUFBRTtRQUMvQ0EsUUFBUSxHQUFHc0ksT0FBTztRQUNsQkEsT0FBTyxHQUFHLENBQUMsQ0FBQztNQUNkO01BRUEsT0FBTzlMLElBQUksQ0FBQ2tpQixXQUFXLENBQUMvaUIsY0FBYyxFQUFFSSxRQUFRLEVBQUU0aUIsR0FBRyxFQUNuRDFpQixNQUFNLENBQUNDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRW9NLE9BQU8sRUFBRTtRQUN6QndXLE1BQU0sRUFBRSxJQUFJO1FBQ1pZLGFBQWEsRUFBRTtNQUNqQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRHRtQixlQUFlLENBQUN1QixTQUFTLENBQUMybEIsSUFBSSxHQUFHLFVBQVUza0IsY0FBYyxFQUFFSSxRQUFRLEVBQUV1TSxPQUFPLEVBQUU7TUFDNUUsSUFBSTlMLElBQUksR0FBRyxJQUFJO01BRWYsSUFBSWtMLFNBQVMsQ0FBQ2xHLE1BQU0sS0FBSyxDQUFDLEVBQ3hCekYsUUFBUSxHQUFHLENBQUMsQ0FBQztNQUVmLE9BQU8sSUFBSWtTLE1BQU0sQ0FDZnpSLElBQUksRUFBRSxJQUFJTyxpQkFBaUIsQ0FBQ3BCLGNBQWMsRUFBRUksUUFBUSxFQUFFdU0sT0FBTyxDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUVEbFAsZUFBZSxDQUFDdUIsU0FBUyxDQUFDa0csWUFBWSxHQUFHLGdCQUFnQjBjLGVBQWUsRUFBRXhoQixRQUFRLEVBQUV1TSxPQUFPLEVBQUU7TUFDM0YsSUFBSTlMLElBQUksR0FBRyxJQUFJO01BQ2YsSUFBSWtMLFNBQVMsQ0FBQ2xHLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDMUJ6RixRQUFRLEdBQUcsQ0FBQyxDQUFDO01BQ2Y7TUFFQXVNLE9BQU8sR0FBR0EsT0FBTyxJQUFJLENBQUMsQ0FBQztNQUN2QkEsT0FBTyxDQUFDd0csS0FBSyxHQUFHLENBQUM7TUFFakIsTUFBTStGLE9BQU8sR0FBRyxNQUFNclksSUFBSSxDQUFDOGpCLElBQUksQ0FBQy9DLGVBQWUsRUFBRXhoQixRQUFRLEVBQUV1TSxPQUFPLENBQUMsQ0FBQzRCLEtBQUssQ0FBQyxDQUFDO01BRTNFLE9BQU8ySyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ25CLENBQUM7O0lBRUQ7SUFDQTtJQUNBemIsZUFBZSxDQUFDdUIsU0FBUyxDQUFDNGxCLGdCQUFnQixHQUFHLGdCQUFnQjVrQixjQUFjLEVBQUU2a0IsS0FBSyxFQUNyQmxZLE9BQU8sRUFBRTtNQUNwRSxJQUFJOUwsSUFBSSxHQUFHLElBQUk7O01BRWY7TUFDQTtNQUNBLElBQUlkLFVBQVUsR0FBR2MsSUFBSSxDQUFDc2dCLGFBQWEsQ0FBQ25oQixjQUFjLENBQUM7TUFDbkQsTUFBTUQsVUFBVSxDQUFDK2tCLFdBQVcsQ0FBQ0QsS0FBSyxFQUFFbFksT0FBTyxDQUFDO0lBQzlDLENBQUM7O0lBRUQ7SUFDQWxQLGVBQWUsQ0FBQ3VCLFNBQVMsQ0FBQzhsQixXQUFXLEdBQ25Dcm5CLGVBQWUsQ0FBQ3VCLFNBQVMsQ0FBQzRsQixnQkFBZ0I7SUFFNUNubkIsZUFBZSxDQUFDdUIsU0FBUyxDQUFDK2xCLGNBQWMsR0FBRyxVQUFVL2tCLGNBQWMsRUFBVztNQUFBLFNBQUE4TCxJQUFBLEdBQUFDLFNBQUEsQ0FBQWxHLE1BQUEsRUFBTm1HLElBQUksT0FBQUMsS0FBQSxDQUFBSCxJQUFBLE9BQUFBLElBQUEsV0FBQUksSUFBQSxNQUFBQSxJQUFBLEdBQUFKLElBQUEsRUFBQUksSUFBQTtRQUFKRixJQUFJLENBQUFFLElBQUEsUUFBQUgsU0FBQSxDQUFBRyxJQUFBO01BQUE7TUFDMUVGLElBQUksR0FBR0EsSUFBSSxDQUFDMUQsR0FBRyxDQUFDMGMsR0FBRyxJQUFJOUYsWUFBWSxDQUFDOEYsR0FBRyxFQUFFL0YsMEJBQTBCLENBQUMsQ0FBQztNQUNyRSxNQUFNbGYsVUFBVSxHQUFHLElBQUksQ0FBQ29oQixhQUFhLENBQUNuaEIsY0FBYyxDQUFDO01BQ3JELE9BQU9ELFVBQVUsQ0FBQ2dsQixjQUFjLENBQUMsR0FBRy9ZLElBQUksQ0FBQztJQUMzQyxDQUFDO0lBRUR2TyxlQUFlLENBQUN1QixTQUFTLENBQUNpbUIsc0JBQXNCLEdBQUcsVUFBVWpsQixjQUFjLEVBQVc7TUFBQSxTQUFBa2xCLEtBQUEsR0FBQW5aLFNBQUEsQ0FBQWxHLE1BQUEsRUFBTm1HLElBQUksT0FBQUMsS0FBQSxDQUFBaVosS0FBQSxPQUFBQSxLQUFBLFdBQUFDLEtBQUEsTUFBQUEsS0FBQSxHQUFBRCxLQUFBLEVBQUFDLEtBQUE7UUFBSm5aLElBQUksQ0FBQW1aLEtBQUEsUUFBQXBaLFNBQUEsQ0FBQW9aLEtBQUE7TUFBQTtNQUNsRm5aLElBQUksR0FBR0EsSUFBSSxDQUFDMUQsR0FBRyxDQUFDMGMsR0FBRyxJQUFJOUYsWUFBWSxDQUFDOEYsR0FBRyxFQUFFL0YsMEJBQTBCLENBQUMsQ0FBQztNQUNyRSxNQUFNbGYsVUFBVSxHQUFHLElBQUksQ0FBQ29oQixhQUFhLENBQUNuaEIsY0FBYyxDQUFDO01BQ3JELE9BQU9ELFVBQVUsQ0FBQ2tsQixzQkFBc0IsQ0FBQyxHQUFHalosSUFBSSxDQUFDO0lBQ25ELENBQUM7SUFFRHZPLGVBQWUsQ0FBQ3VCLFNBQVMsQ0FBQ29tQixnQkFBZ0IsR0FBRzNuQixlQUFlLENBQUN1QixTQUFTLENBQUM0bEIsZ0JBQWdCO0lBRXZGbm5CLGVBQWUsQ0FBQ3VCLFNBQVMsQ0FBQ3FtQixjQUFjLEdBQUcsZ0JBQWdCcmxCLGNBQWMsRUFBRTZrQixLQUFLLEVBQUU7TUFDaEYsSUFBSWhrQixJQUFJLEdBQUcsSUFBSTs7TUFHZjtNQUNBO01BQ0EsSUFBSWQsVUFBVSxHQUFHYyxJQUFJLENBQUNzZ0IsYUFBYSxDQUFDbmhCLGNBQWMsQ0FBQztNQUNuRCxJQUFJc2xCLFNBQVMsR0FBSSxNQUFNdmxCLFVBQVUsQ0FBQ3dsQixTQUFTLENBQUNWLEtBQUssQ0FBQztJQUNwRCxDQUFDO0lBR0RoRyxtQkFBbUIsQ0FBQ2xmLE9BQU8sQ0FBQyxVQUFVNmxCLENBQUMsRUFBRTtNQUN2Qy9uQixlQUFlLENBQUN1QixTQUFTLENBQUN3bUIsQ0FBQyxDQUFDLEdBQUcsWUFBWTtRQUN6QyxNQUFNLElBQUlsaEIsS0FBSyxJQUFBa0UsTUFBQSxDQUNWZ2QsQ0FBQyxxREFBQWhkLE1BQUEsQ0FBa0RzVyxrQkFBa0IsQ0FDdEUwRyxDQUNGLENBQUMsZ0JBQ0gsQ0FBQztNQUNILENBQUM7SUFDSCxDQUFDLENBQUM7SUFHRixJQUFJQyxvQkFBb0IsR0FBRyxDQUFDO0lBSTVCLElBQUkzQiw0QkFBNEIsR0FBRyxlQUFBQSxDQUFnQi9qQixVQUFVLEVBQUVLLFFBQVEsRUFBRTRpQixHQUFHLEVBQUVyVyxPQUFPLEVBQUU7TUFDckY7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBOztNQUVBLElBQUl3VixVQUFVLEdBQUd4VixPQUFPLENBQUN3VixVQUFVLENBQUMsQ0FBQztNQUNyQyxJQUFJdUQsa0JBQWtCLEdBQUc7UUFDdkJ4RCxJQUFJLEVBQUUsSUFBSTtRQUNWa0IsS0FBSyxFQUFFelcsT0FBTyxDQUFDeVc7TUFDakIsQ0FBQztNQUNELElBQUl1QyxrQkFBa0IsR0FBRztRQUN2QnpELElBQUksRUFBRSxJQUFJO1FBQ1ZpQixNQUFNLEVBQUU7TUFDVixDQUFDO01BRUQsSUFBSXlDLGlCQUFpQixHQUFHdGxCLE1BQU0sQ0FBQ0MsTUFBTSxDQUNuQzJlLFlBQVksQ0FBQztRQUFDelYsR0FBRyxFQUFFMFk7TUFBVSxDQUFDLEVBQUVsRCwwQkFBMEIsQ0FBQyxFQUMzRCtELEdBQUcsQ0FBQztNQUVOLElBQUk2QyxLQUFLLEdBQUdKLG9CQUFvQjtNQUVoQyxJQUFJSyxRQUFRLEdBQUcsZUFBQUEsQ0FBQSxFQUFrQjtRQUMvQkQsS0FBSyxFQUFFO1FBQ1AsSUFBSSxDQUFFQSxLQUFLLEVBQUU7VUFDWCxNQUFNLElBQUl2aEIsS0FBSyxDQUFDLHNCQUFzQixHQUFHbWhCLG9CQUFvQixHQUFHLFNBQVMsQ0FBQztRQUM1RSxDQUFDLE1BQU07VUFDTCxJQUFJTSxNQUFNLEdBQUdobUIsVUFBVSxDQUFDaW1CLFVBQVU7VUFDbEMsSUFBRyxDQUFDMWxCLE1BQU0sQ0FBQytNLElBQUksQ0FBQzJWLEdBQUcsQ0FBQyxDQUFDaUQsSUFBSSxDQUFDbm1CLEdBQUcsSUFBSUEsR0FBRyxDQUFDa0ssVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUM7WUFDcEQrYixNQUFNLEdBQUdobUIsVUFBVSxDQUFDbW1CLFVBQVUsQ0FBQzlWLElBQUksQ0FBQ3JRLFVBQVUsQ0FBQztVQUNqRDtVQUNBLE9BQU9nbUIsTUFBTSxDQUNYM2xCLFFBQVEsRUFDUjRpQixHQUFHLEVBQ0gwQyxrQkFBa0IsQ0FBQyxDQUFDaGEsSUFBSSxDQUFDME0sTUFBTSxJQUFJO1lBQ25DLElBQUlBLE1BQU0sS0FBS0EsTUFBTSxDQUFDc0ssYUFBYSxJQUFJdEssTUFBTSxDQUFDK04sYUFBYSxDQUFDLEVBQUU7Y0FDNUQsT0FBTztnQkFDTHhELGNBQWMsRUFBRXZLLE1BQU0sQ0FBQ3NLLGFBQWEsSUFBSXRLLE1BQU0sQ0FBQytOLGFBQWE7Z0JBQzVEaEUsVUFBVSxFQUFFL0osTUFBTSxDQUFDZ08sVUFBVSxJQUFJL2E7Y0FDbkMsQ0FBQztZQUNILENBQUMsTUFBTTtjQUNMLE9BQU9nYixtQkFBbUIsQ0FBQyxDQUFDO1lBQzlCO1VBQ0YsQ0FBQyxDQUFDO1FBQ0o7TUFDRixDQUFDO01BRUQsSUFBSUEsbUJBQW1CLEdBQUcsU0FBQUEsQ0FBQSxFQUFXO1FBQ25DLE9BQU90bUIsVUFBVSxDQUFDbW1CLFVBQVUsQ0FBQzlsQixRQUFRLEVBQUV3bEIsaUJBQWlCLEVBQUVELGtCQUFrQixDQUFDLENBQzFFamEsSUFBSSxDQUFDME0sTUFBTSxLQUFLO1VBQ2Z1SyxjQUFjLEVBQUV2SyxNQUFNLENBQUMrTixhQUFhO1VBQ3BDaEUsVUFBVSxFQUFFL0osTUFBTSxDQUFDZ087UUFDckIsQ0FBQyxDQUFDLENBQUMsQ0FBQ2hFLEtBQUssQ0FBQzFkLEdBQUcsSUFBSTtVQUNmLElBQUlqSCxlQUFlLENBQUM4bUIsc0JBQXNCLENBQUM3ZixHQUFHLENBQUMsRUFBRTtZQUMvQyxPQUFPb2hCLFFBQVEsQ0FBQyxDQUFDO1VBQ25CLENBQUMsTUFBTTtZQUNMLE1BQU1waEIsR0FBRztVQUNYO1FBQ0YsQ0FBQyxDQUFDO01BRU4sQ0FBQztNQUNELE9BQU9vaEIsUUFBUSxDQUFDLENBQUM7SUFDbkIsQ0FBQzs7SUFFRDtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBcm9CLGVBQWUsQ0FBQ3VCLFNBQVMsQ0FBQ3NuQix1QkFBdUIsR0FBRyxVQUNsRHBuQixpQkFBaUIsRUFBRXlMLE9BQU8sRUFBRWdFLFNBQVMsRUFBRTtNQUN2QyxJQUFJOU4sSUFBSSxHQUFHLElBQUk7O01BRWY7TUFDQTtNQUNBLElBQUs4SixPQUFPLElBQUksQ0FBQ2dFLFNBQVMsQ0FBQzRYLFdBQVcsSUFDbkMsQ0FBQzViLE9BQU8sSUFBSSxDQUFDZ0UsU0FBUyxDQUFDdUgsS0FBTSxFQUFFO1FBQ2hDLE1BQU0sSUFBSTVSLEtBQUssQ0FBQyxtQkFBbUIsSUFBSXFHLE9BQU8sR0FBRyxTQUFTLEdBQUcsV0FBVyxDQUFDLEdBQ3JFLDZCQUE2QixJQUM1QkEsT0FBTyxHQUFHLGFBQWEsR0FBRyxPQUFPLENBQUMsR0FBRyxXQUFXLENBQUM7TUFDeEQ7TUFFQSxPQUFPOUosSUFBSSxDQUFDOEgsSUFBSSxDQUFDekosaUJBQWlCLEVBQUUsVUFBVTBKLEdBQUcsRUFBRTtRQUNqRCxJQUFJdkksRUFBRSxHQUFHdUksR0FBRyxDQUFDYSxHQUFHO1FBQ2hCLE9BQU9iLEdBQUcsQ0FBQ2EsR0FBRztRQUNkO1FBQ0EsT0FBT2IsR0FBRyxDQUFDeEQsRUFBRTtRQUNiLElBQUl1RixPQUFPLEVBQUU7VUFDWGdFLFNBQVMsQ0FBQzRYLFdBQVcsQ0FBQ2xtQixFQUFFLEVBQUV1SSxHQUFHLEVBQUUsSUFBSSxDQUFDO1FBQ3RDLENBQUMsTUFBTTtVQUNMK0YsU0FBUyxDQUFDdUgsS0FBSyxDQUFDN1YsRUFBRSxFQUFFdUksR0FBRyxDQUFDO1FBQzFCO01BQ0YsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVEbkwsZUFBZSxDQUFDdUIsU0FBUyxDQUFDa1IseUJBQXlCLEdBQUcsVUFDcERoUixpQkFBaUIsRUFBZ0I7TUFBQSxJQUFkeU4sT0FBTyxHQUFBWixTQUFBLENBQUFsRyxNQUFBLFFBQUFrRyxTQUFBLFFBQUFWLFNBQUEsR0FBQVUsU0FBQSxNQUFHLENBQUMsQ0FBQztNQUMvQixJQUFJbEwsSUFBSSxHQUFHLElBQUk7TUFDZixNQUFNO1FBQUUybEIsZ0JBQWdCO1FBQUVDO01BQWEsQ0FBQyxHQUFHOVosT0FBTztNQUNsREEsT0FBTyxHQUFHO1FBQUU2WixnQkFBZ0I7UUFBRUM7TUFBYSxDQUFDO01BRTVDLElBQUkxbUIsVUFBVSxHQUFHYyxJQUFJLENBQUNzZ0IsYUFBYSxDQUFDamlCLGlCQUFpQixDQUFDYyxjQUFjLENBQUM7TUFDckUsSUFBSTBtQixhQUFhLEdBQUd4bkIsaUJBQWlCLENBQUN5TixPQUFPO01BQzdDLElBQUltVCxZQUFZLEdBQUc7UUFDakJ6YSxJQUFJLEVBQUVxaEIsYUFBYSxDQUFDcmhCLElBQUk7UUFDeEI4TixLQUFLLEVBQUV1VCxhQUFhLENBQUN2VCxLQUFLO1FBQzFCZ0osSUFBSSxFQUFFdUssYUFBYSxDQUFDdkssSUFBSTtRQUN4QmhYLFVBQVUsRUFBRXVoQixhQUFhLENBQUM1WSxNQUFNLElBQUk0WSxhQUFhLENBQUN2aEIsVUFBVTtRQUM1RHdoQixjQUFjLEVBQUVELGFBQWEsQ0FBQ0M7TUFDaEMsQ0FBQzs7TUFFRDtNQUNBLElBQUlELGFBQWEsQ0FBQ2hlLFFBQVEsRUFBRTtRQUMxQm9YLFlBQVksQ0FBQzhHLGVBQWUsR0FBRyxDQUFDLENBQUM7TUFDbkM7TUFFQSxJQUFJQyxRQUFRLEdBQUc5bUIsVUFBVSxDQUFDNGtCLElBQUksQ0FDNUJ6RixZQUFZLENBQUNoZ0IsaUJBQWlCLENBQUNrQixRQUFRLEVBQUU2ZSwwQkFBMEIsQ0FBQyxFQUNwRWEsWUFBWSxDQUFDOztNQUVmO01BQ0EsSUFBSTRHLGFBQWEsQ0FBQ2hlLFFBQVEsRUFBRTtRQUMxQjtRQUNBbWUsUUFBUSxDQUFDQyxhQUFhLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQztRQUN4QztRQUNBO1FBQ0FELFFBQVEsQ0FBQ0MsYUFBYSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUM7O1FBRXpDO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQSxJQUFJNW5CLGlCQUFpQixDQUFDYyxjQUFjLEtBQUtpQixnQkFBZ0IsSUFDdkQvQixpQkFBaUIsQ0FBQ2tCLFFBQVEsQ0FBQ2dGLEVBQUUsRUFBRTtVQUMvQnloQixRQUFRLENBQUNDLGFBQWEsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDO1FBQzdDO01BQ0Y7TUFFQSxJQUFJLE9BQU9KLGFBQWEsQ0FBQ0ssU0FBUyxLQUFLLFdBQVcsRUFBRTtRQUNsREYsUUFBUSxHQUFHQSxRQUFRLENBQUNHLFNBQVMsQ0FBQ04sYUFBYSxDQUFDSyxTQUFTLENBQUM7TUFDeEQ7TUFDQSxJQUFJLE9BQU9MLGFBQWEsQ0FBQ08sSUFBSSxLQUFLLFdBQVcsRUFBRTtRQUM3Q0osUUFBUSxHQUFHQSxRQUFRLENBQUNJLElBQUksQ0FBQ1AsYUFBYSxDQUFDTyxJQUFJLENBQUM7TUFDOUM7TUFFQSxPQUFPLElBQUlqSSxrQkFBa0IsQ0FBQzZILFFBQVEsRUFBRTNuQixpQkFBaUIsRUFBRXlOLE9BQU8sRUFBRTVNLFVBQVUsQ0FBQztJQUNqRixDQUFDOztJQUVEO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBdEMsZUFBZSxDQUFDdUIsU0FBUyxDQUFDMkosSUFBSSxHQUFHLFVBQVV6SixpQkFBaUIsRUFBRWdvQixXQUFXLEVBQUVDLFNBQVMsRUFBRTtNQUNwRixJQUFJdG1CLElBQUksR0FBRyxJQUFJO01BQ2YsSUFBSSxDQUFDM0IsaUJBQWlCLENBQUN5TixPQUFPLENBQUNqRSxRQUFRLEVBQ3JDLE1BQU0sSUFBSXBFLEtBQUssQ0FBQyxpQ0FBaUMsQ0FBQztNQUVwRCxJQUFJa1csTUFBTSxHQUFHM1osSUFBSSxDQUFDcVAseUJBQXlCLENBQUNoUixpQkFBaUIsQ0FBQztNQUU5RCxJQUFJa29CLE9BQU8sR0FBRyxLQUFLO01BQ25CLElBQUlDLE1BQU07TUFFVjFvQixNQUFNLENBQUNpYSxLQUFLLENBQUMsZUFBZTBPLElBQUlBLENBQUEsRUFBRztRQUNqQyxJQUFJMWUsR0FBRyxHQUFHLElBQUk7UUFDZCxPQUFPLElBQUksRUFBRTtVQUNYLElBQUl3ZSxPQUFPLEVBQ1Q7VUFDRixJQUFJO1lBQ0Z4ZSxHQUFHLEdBQUcsTUFBTTRSLE1BQU0sQ0FBQytNLDZCQUE2QixDQUFDSixTQUFTLENBQUM7VUFDN0QsQ0FBQyxDQUFDLE9BQU96aUIsR0FBRyxFQUFFO1lBQ1o7WUFDQXlCLE9BQU8sQ0FBQ0MsS0FBSyxDQUFDMUIsR0FBRyxDQUFDO1lBQ2xCO1lBQ0E7WUFDQTtZQUNBO1lBQ0FrRSxHQUFHLEdBQUcsSUFBSTtVQUNaO1VBQ0E7VUFDQTtVQUNBLElBQUl3ZSxPQUFPLEVBQ1Q7VUFDRixJQUFJeGUsR0FBRyxFQUFFO1lBQ1A7WUFDQTtZQUNBO1lBQ0E7WUFDQXllLE1BQU0sR0FBR3plLEdBQUcsQ0FBQ3hELEVBQUU7WUFDZjhoQixXQUFXLENBQUN0ZSxHQUFHLENBQUM7VUFDbEIsQ0FBQyxNQUFNO1lBQ0wsSUFBSTRlLFdBQVcsR0FBR2xuQixNQUFNLENBQUNDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRXJCLGlCQUFpQixDQUFDa0IsUUFBUSxDQUFDO1lBQy9ELElBQUlpbkIsTUFBTSxFQUFFO2NBQ1ZHLFdBQVcsQ0FBQ3BpQixFQUFFLEdBQUc7Z0JBQUN3QyxHQUFHLEVBQUV5ZjtjQUFNLENBQUM7WUFDaEM7WUFDQTdNLE1BQU0sR0FBRzNaLElBQUksQ0FBQ3FQLHlCQUF5QixDQUFDLElBQUk5TyxpQkFBaUIsQ0FDM0RsQyxpQkFBaUIsQ0FBQ2MsY0FBYyxFQUNoQ3duQixXQUFXLEVBQ1h0b0IsaUJBQWlCLENBQUN5TixPQUFPLENBQUMsQ0FBQztZQUM3QjtZQUNBO1lBQ0E7WUFDQXpHLFVBQVUsQ0FBQ29oQixJQUFJLEVBQUUsR0FBRyxDQUFDO1lBQ3JCO1VBQ0Y7UUFDRjtNQUNGLENBQUMsQ0FBQztNQUVGLE9BQU87UUFDTDVuQixJQUFJLEVBQUUsU0FBQUEsQ0FBQSxFQUFZO1VBQ2hCMG5CLE9BQU8sR0FBRyxJQUFJO1VBQ2Q1TSxNQUFNLENBQUN5RyxLQUFLLENBQUMsQ0FBQztRQUNoQjtNQUNGLENBQUM7SUFDSCxDQUFDO0lBRUQzZ0IsTUFBTSxDQUFDQyxNQUFNLENBQUM5QyxlQUFlLENBQUN1QixTQUFTLEVBQUU7TUFDdkN5b0IsZUFBZSxFQUFFLGVBQUFBLENBQ2Z2b0IsaUJBQWlCLEVBQUV5TCxPQUFPLEVBQUVnRSxTQUFTLEVBQUVwQixvQkFBb0IsRUFBRTtRQUFBLElBQUFtYSxrQkFBQTtRQUM3RCxJQUFJN21CLElBQUksR0FBRyxJQUFJO1FBQ2YsTUFBTWIsY0FBYyxHQUFHZCxpQkFBaUIsQ0FBQ2MsY0FBYztRQUV2RCxJQUFJZCxpQkFBaUIsQ0FBQ3lOLE9BQU8sQ0FBQ2pFLFFBQVEsRUFBRTtVQUN0QyxPQUFPN0gsSUFBSSxDQUFDeWxCLHVCQUF1QixDQUFDcG5CLGlCQUFpQixFQUFFeUwsT0FBTyxFQUFFZ0UsU0FBUyxDQUFDO1FBQzVFOztRQUVBO1FBQ0E7UUFDQSxNQUFNZ1osYUFBYSxHQUFHem9CLGlCQUFpQixDQUFDeU4sT0FBTyxDQUFDeEgsVUFBVSxJQUFJakcsaUJBQWlCLENBQUN5TixPQUFPLENBQUNtQixNQUFNO1FBQzlGLElBQUk2WixhQUFhLEtBQ2RBLGFBQWEsQ0FBQ2xlLEdBQUcsS0FBSyxDQUFDLElBQ3RCa2UsYUFBYSxDQUFDbGUsR0FBRyxLQUFLLEtBQUssQ0FBQyxFQUFFO1VBQ2hDLE1BQU1uRixLQUFLLENBQUMsc0RBQXNELENBQUM7UUFDckU7UUFFQSxJQUFJc2pCLFVBQVUsR0FBR3BhLEtBQUssQ0FBQzlILFNBQVMsQ0FDOUJwRixNQUFNLENBQUNDLE1BQU0sQ0FBQztVQUFDb0ssT0FBTyxFQUFFQTtRQUFPLENBQUMsRUFBRXpMLGlCQUFpQixDQUFDLENBQUM7UUFFdkQsSUFBSStRLFdBQVcsRUFBRTRYLGFBQWE7UUFDOUIsSUFBSUMsV0FBVyxHQUFHLEtBQUs7O1FBRXZCO1FBQ0E7UUFDQTtRQUNBLElBQUlGLFVBQVUsSUFBSS9tQixJQUFJLENBQUM2ZSxvQkFBb0IsRUFBRTtVQUMzQ3pQLFdBQVcsR0FBR3BQLElBQUksQ0FBQzZlLG9CQUFvQixDQUFDa0ksVUFBVSxDQUFDO1FBQ3JELENBQUMsTUFBTTtVQUNMRSxXQUFXLEdBQUcsSUFBSTtVQUNsQjtVQUNBN1gsV0FBVyxHQUFHLElBQUl6RixrQkFBa0IsQ0FBQztZQUNuQ0csT0FBTyxFQUFFQSxPQUFPO1lBQ2hCQyxNQUFNLEVBQUUsU0FBQUEsQ0FBQSxFQUFZO2NBQ2xCLE9BQU8vSixJQUFJLENBQUM2ZSxvQkFBb0IsQ0FBQ2tJLFVBQVUsQ0FBQztjQUM1QyxPQUFPQyxhQUFhLENBQUNub0IsSUFBSSxDQUFDLENBQUM7WUFDN0I7VUFDRixDQUFDLENBQUM7UUFDSjtRQUVBLElBQUlxb0IsYUFBYSxHQUFHLElBQUkzSSxhQUFhLENBQUNuUCxXQUFXLEVBQy9DdEIsU0FBUyxFQUNUcEIsb0JBQ0YsQ0FBQztRQUVELE1BQU15YSxZQUFZLEdBQUcsQ0FBQW5uQixJQUFJLGFBQUpBLElBQUksd0JBQUE2bUIsa0JBQUEsR0FBSjdtQixJQUFJLENBQUVxVSxZQUFZLGNBQUF3UyxrQkFBQSx1QkFBbEJBLGtCQUFBLENBQW9CdGxCLGFBQWEsS0FBSSxDQUFDLENBQUM7UUFDNUQsTUFBTTtVQUFFeUYsa0JBQWtCO1VBQUVLO1FBQW1CLENBQUMsR0FBRzhmLFlBQVk7UUFDL0QsSUFBSUYsV0FBVyxFQUFFO1VBQ2YsSUFBSXZULE9BQU8sRUFBRXZCLE1BQU07VUFDbkIsSUFBSWlWLFdBQVcsR0FBRyxDQUNoQixZQUFZO1lBQ1Y7WUFDQTtZQUNBO1lBQ0EsT0FBT3BuQixJQUFJLENBQUNxVSxZQUFZLElBQUksQ0FBQ3ZLLE9BQU8sSUFDbEMsQ0FBQ2dFLFNBQVMsQ0FBQ29CLHFCQUFxQjtVQUNwQyxDQUFDLEVBQ0QsWUFBWTtZQUNWO1lBQ0E7WUFDQSxJQUFJN0gsa0JBQWtCLGFBQWxCQSxrQkFBa0IsZUFBbEJBLGtCQUFrQixDQUFFckMsTUFBTSxJQUFJcUMsa0JBQWtCLENBQUNnZ0IsUUFBUSxDQUFDbG9CLGNBQWMsQ0FBQyxFQUFFO2NBQzdFLElBQUksQ0FBQ3dmLHVCQUF1QixDQUFDMEksUUFBUSxDQUFDbG9CLGNBQWMsQ0FBQyxFQUFFO2dCQUNyRG1HLE9BQU8sQ0FBQ2dpQixJQUFJLG1GQUFBM2YsTUFBQSxDQUFtRnhJLGNBQWMsc0RBQW1ELENBQUM7Z0JBQ2pLd2YsdUJBQXVCLENBQUNsZ0IsSUFBSSxDQUFDVSxjQUFjLENBQUMsQ0FBQyxDQUFDO2NBQ2hEO2NBQ0EsT0FBTyxLQUFLO1lBQ2Q7WUFDQSxJQUFJNkgsa0JBQWtCLGFBQWxCQSxrQkFBa0IsZUFBbEJBLGtCQUFrQixDQUFFaEMsTUFBTSxJQUFJLENBQUNnQyxrQkFBa0IsQ0FBQ3FnQixRQUFRLENBQUNsb0IsY0FBYyxDQUFDLEVBQUU7Y0FDOUUsSUFBSSxDQUFDd2YsdUJBQXVCLENBQUMwSSxRQUFRLENBQUNsb0IsY0FBYyxDQUFDLEVBQUU7Z0JBQ3JEbUcsT0FBTyxDQUFDZ2lCLElBQUksMkZBQUEzZixNQUFBLENBQTJGeEksY0FBYyxzREFBbUQsQ0FBQztnQkFDekt3Zix1QkFBdUIsQ0FBQ2xnQixJQUFJLENBQUNVLGNBQWMsQ0FBQyxDQUFDLENBQUM7Y0FDaEQ7Y0FDQSxPQUFPLEtBQUs7WUFDZDtZQUNBLE9BQU8sSUFBSTtVQUNiLENBQUMsRUFDRCxZQUFZO1lBQ1Y7WUFDQTtZQUNBLElBQUk7Y0FDRnVVLE9BQU8sR0FBRyxJQUFJNlQsU0FBUyxDQUFDQyxPQUFPLENBQUNucEIsaUJBQWlCLENBQUNrQixRQUFRLENBQUM7Y0FDM0QsT0FBTyxJQUFJO1lBQ2IsQ0FBQyxDQUFDLE9BQU9tRixDQUFDLEVBQUU7Y0FDVjtjQUNBO2NBQ0EsT0FBTyxLQUFLO1lBQ2Q7VUFDRixDQUFDLEVBQ0QsWUFBWTtZQUNWO1lBQ0EsT0FBTzdILGtCQUFrQixDQUFDc2UsZUFBZSxDQUFDOWMsaUJBQWlCLEVBQUVxVixPQUFPLENBQUM7VUFDdkUsQ0FBQyxFQUNELFlBQVk7WUFDVjtZQUNBO1lBQ0EsSUFBSSxDQUFDclYsaUJBQWlCLENBQUN5TixPQUFPLENBQUN0SCxJQUFJLEVBQ2pDLE9BQU8sSUFBSTtZQUNiLElBQUk7Y0FDRjJOLE1BQU0sR0FBRyxJQUFJb1YsU0FBUyxDQUFDRSxNQUFNLENBQUNwcEIsaUJBQWlCLENBQUN5TixPQUFPLENBQUN0SCxJQUFJLENBQUM7Y0FDN0QsT0FBTyxJQUFJO1lBQ2IsQ0FBQyxDQUFDLE9BQU9FLENBQUMsRUFBRTtjQUNWO2NBQ0E7Y0FDQSxPQUFPLEtBQUs7WUFDZDtVQUNGLENBQUMsQ0FDRixDQUFDa1gsS0FBSyxDQUFDNUosQ0FBQyxJQUFJQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBRTs7VUFFcEIsSUFBSTBWLFdBQVcsR0FBR04sV0FBVyxHQUFHdnFCLGtCQUFrQixHQUFHb1Isb0JBQW9CO1VBQ3pFK1ksYUFBYSxHQUFHLElBQUlVLFdBQVcsQ0FBQztZQUM5QnJwQixpQkFBaUIsRUFBRUEsaUJBQWlCO1lBQ3BDOFEsV0FBVyxFQUFFblAsSUFBSTtZQUNqQm9QLFdBQVcsRUFBRUEsV0FBVztZQUN4QnRGLE9BQU8sRUFBRUEsT0FBTztZQUNoQjRKLE9BQU8sRUFBRUEsT0FBTztZQUFHO1lBQ25CdkIsTUFBTSxFQUFFQSxNQUFNO1lBQUc7WUFDakJqRCxxQkFBcUIsRUFBRXBCLFNBQVMsQ0FBQ29CO1VBQ25DLENBQUMsQ0FBQztVQUVGLElBQUk4WCxhQUFhLENBQUN2WCxLQUFLLEVBQUU7WUFDdkIsTUFBTXVYLGFBQWEsQ0FBQ3ZYLEtBQUssQ0FBQyxDQUFDO1VBQzdCOztVQUVBO1VBQ0FMLFdBQVcsQ0FBQ3VZLGNBQWMsR0FBR1gsYUFBYTtRQUM1QztRQUNBaG5CLElBQUksQ0FBQzZlLG9CQUFvQixDQUFDa0ksVUFBVSxDQUFDLEdBQUczWCxXQUFXO1FBQ25EO1FBQ0EsTUFBTUEsV0FBVyxDQUFDN0QsMkJBQTJCLENBQUMyYixhQUFhLENBQUM7UUFFNUQsT0FBT0EsYUFBYTtNQUN0QjtJQUVGLENBQUMsQ0FBQztJQUFDcG5CLHNCQUFBO0VBQUEsU0FBQUMsV0FBQTtJQUFBLE9BQUFELHNCQUFBLENBQUFDLFdBQUE7RUFBQTtFQUFBRCxzQkFBQTtBQUFBO0VBQUFFLElBQUE7RUFBQUMsS0FBQTtBQUFBLEc7Ozs7Ozs7Ozs7Ozs7O0lDeDZCSDFDLE1BQU0sQ0FBQ2pCLE1BQU0sQ0FBQztNQUFDUSxPQUFPLEVBQUNBLENBQUEsS0FBSUEsT0FBTztNQUFDOHFCLGFBQWEsRUFBQ0EsQ0FBQSxLQUFJQSxhQUFhO01BQUN0SixlQUFlLEVBQUNBLENBQUEsS0FBSUEsZUFBZTtNQUFDRiwwQkFBMEIsRUFBQ0EsQ0FBQSxLQUFJQSwwQkFBMEI7TUFBQ0MsWUFBWSxFQUFDQSxDQUFBLEtBQUlBLFlBQVk7TUFBQ3dKLDBCQUEwQixFQUFDQSxDQUFBLEtBQUlBLDBCQUEwQjtNQUFDQyxZQUFZLEVBQUNBLENBQUEsS0FBSUE7SUFBWSxDQUFDLENBQUM7SUFBQyxJQUFJMXBCLEtBQUs7SUFBQ2IsTUFBTSxDQUFDYixJQUFJLENBQUMsY0FBYyxFQUFDO01BQUN5RCxPQUFPQSxDQUFDeEQsQ0FBQyxFQUFDO1FBQUN5QixLQUFLLEdBQUN6QixDQUFDO01BQUE7SUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQUMsSUFBSUksb0JBQW9CLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTUEsb0JBQW9CLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFHNVksTUFBTUQsT0FBTyxHQUFHMkMsTUFBTSxDQUFDQyxNQUFNLENBQUNjLGdCQUFnQixFQUFFO01BQ3JEa2MsUUFBUSxFQUFFbGMsZ0JBQWdCLENBQUNnakI7SUFDN0IsQ0FBQyxDQUFDO0lBa0JLLE1BQU1vRSxhQUFhLEdBQUcsU0FBQUEsQ0FBVTVTLEtBQUssRUFBRW1NLE9BQU8sRUFBRTNkLFFBQVEsRUFBRTtNQUMvRCxPQUFPLFVBQVVLLEdBQUcsRUFBRTBULE1BQU0sRUFBRTtRQUM1QixJQUFJLENBQUUxVCxHQUFHLEVBQUU7VUFDVDtVQUNBLElBQUk7WUFDRnNkLE9BQU8sQ0FBQyxDQUFDO1VBQ1gsQ0FBQyxDQUFDLE9BQU80RyxVQUFVLEVBQUU7WUFDbkIsSUFBSXZrQixRQUFRLEVBQUU7Y0FDWkEsUUFBUSxDQUFDdWtCLFVBQVUsQ0FBQztjQUNwQjtZQUNGLENBQUMsTUFBTTtjQUNMLE1BQU1BLFVBQVU7WUFDbEI7VUFDRjtRQUNGO1FBQ0EvUyxLQUFLLENBQUM1RCxTQUFTLENBQUMsQ0FBQztRQUNqQixJQUFJNU4sUUFBUSxFQUFFO1VBQ1pBLFFBQVEsQ0FBQ0ssR0FBRyxFQUFFMFQsTUFBTSxDQUFDO1FBQ3ZCLENBQUMsTUFBTSxJQUFJMVQsR0FBRyxFQUFFO1VBQ2QsTUFBTUEsR0FBRztRQUNYO01BQ0YsQ0FBQztJQUNILENBQUM7SUFHTSxNQUFNeWEsZUFBZSxHQUFHLFNBQUFBLENBQVUwSixZQUFZLEVBQUU7TUFDckQsSUFBSXpFLFlBQVksR0FBRztRQUFFekIsY0FBYyxFQUFFO01BQUUsQ0FBQztNQUN4QyxJQUFJa0csWUFBWSxFQUFFO1FBQ2hCLElBQUlDLFdBQVcsR0FBR0QsWUFBWSxDQUFDelEsTUFBTTtRQUNyQztRQUNBO1FBQ0E7UUFDQSxJQUFJMFEsV0FBVyxDQUFDM0MsYUFBYSxFQUFFO1VBQzdCL0IsWUFBWSxDQUFDekIsY0FBYyxHQUFHbUcsV0FBVyxDQUFDM0MsYUFBYTtVQUV2RCxJQUFJMkMsV0FBVyxDQUFDMUMsVUFBVSxFQUFFO1lBQzFCaEMsWUFBWSxDQUFDakMsVUFBVSxHQUFHMkcsV0FBVyxDQUFDMUMsVUFBVTtVQUNsRDtRQUNGLENBQUMsTUFBTTtVQUNMO1VBQ0E7VUFDQWhDLFlBQVksQ0FBQ3pCLGNBQWMsR0FBR21HLFdBQVcsQ0FBQ0MsQ0FBQyxJQUFJRCxXQUFXLENBQUNFLFlBQVksSUFBSUYsV0FBVyxDQUFDcEcsYUFBYTtRQUN0RztNQUNGO01BRUEsT0FBTzBCLFlBQVk7SUFDckIsQ0FBQztJQUVNLE1BQU1uRiwwQkFBMEIsR0FBRyxTQUFBQSxDQUFVNEMsUUFBUSxFQUFFO01BQzVELElBQUlyVSxLQUFLLENBQUN5YixRQUFRLENBQUNwSCxRQUFRLENBQUMsRUFBRTtRQUM1QjtRQUNBO1FBQ0E7UUFDQSxPQUFPLElBQUlsa0IsT0FBTyxDQUFDdXJCLE1BQU0sQ0FBQ0MsTUFBTSxDQUFDQyxJQUFJLENBQUN2SCxRQUFRLENBQUMsQ0FBQztNQUNsRDtNQUNBLElBQUlBLFFBQVEsWUFBWWxrQixPQUFPLENBQUN1ckIsTUFBTSxFQUFFO1FBQ3RDLE9BQU9ySCxRQUFRO01BQ2pCO01BQ0EsSUFBSUEsUUFBUSxZQUFZdkUsS0FBSyxDQUFDQyxRQUFRLEVBQUU7UUFDdEMsT0FBTyxJQUFJNWYsT0FBTyxDQUFDMG1CLFFBQVEsQ0FBQ3hDLFFBQVEsQ0FBQ3lDLFdBQVcsQ0FBQyxDQUFDLENBQUM7TUFDckQ7TUFDQSxJQUFJekMsUUFBUSxZQUFZbGtCLE9BQU8sQ0FBQzBtQixRQUFRLEVBQUU7UUFDeEMsT0FBTyxJQUFJMW1CLE9BQU8sQ0FBQzBtQixRQUFRLENBQUN4QyxRQUFRLENBQUN5QyxXQUFXLENBQUMsQ0FBQyxDQUFDO01BQ3JEO01BQ0EsSUFBSXpDLFFBQVEsWUFBWWxrQixPQUFPLENBQUNvQixTQUFTLEVBQUU7UUFDekM7UUFDQTtRQUNBO1FBQ0E7UUFDQSxPQUFPOGlCLFFBQVE7TUFDakI7TUFDQSxJQUFJQSxRQUFRLFlBQVl3SCxPQUFPLEVBQUU7UUFDL0IsT0FBTzFyQixPQUFPLENBQUMyckIsVUFBVSxDQUFDQyxVQUFVLENBQUMxSCxRQUFRLENBQUMySCxRQUFRLENBQUMsQ0FBQyxDQUFDO01BQzNEO01BQ0EsSUFBSWhjLEtBQUssQ0FBQ2dRLGFBQWEsQ0FBQ3FFLFFBQVEsQ0FBQyxFQUFFO1FBQ2pDLE9BQU84RyxZQUFZLENBQUNjLGNBQWMsRUFBRWpjLEtBQUssQ0FBQ2tjLFdBQVcsQ0FBQzdILFFBQVEsQ0FBQyxDQUFDO01BQ2xFO01BQ0E7TUFDQTtNQUNBLE9BQU94VyxTQUFTO0lBQ2xCLENBQUM7SUFFTSxNQUFNNlQsWUFBWSxHQUFHLFNBQUFBLENBQVUyQyxRQUFRLEVBQUU4SCxlQUFlLEVBQUU7TUFDL0QsSUFBSSxPQUFPOUgsUUFBUSxLQUFLLFFBQVEsSUFBSUEsUUFBUSxLQUFLLElBQUksRUFDbkQsT0FBT0EsUUFBUTtNQUVqQixJQUFJK0gsb0JBQW9CLEdBQUdELGVBQWUsQ0FBQzlILFFBQVEsQ0FBQztNQUNwRCxJQUFJK0gsb0JBQW9CLEtBQUt2ZSxTQUFTLEVBQ3BDLE9BQU91ZSxvQkFBb0I7TUFFN0IsSUFBSUMsR0FBRyxHQUFHaEksUUFBUTtNQUNsQnZoQixNQUFNLENBQUNrYyxPQUFPLENBQUNxRixRQUFRLENBQUMsQ0FBQ2xpQixPQUFPLENBQUMsVUFBQThLLElBQUEsRUFBc0I7UUFBQSxJQUFaLENBQUMzSyxHQUFHLEVBQUVncUIsR0FBRyxDQUFDLEdBQUFyZixJQUFBO1FBQ25ELElBQUlzZixXQUFXLEdBQUc3SyxZQUFZLENBQUM0SyxHQUFHLEVBQUVILGVBQWUsQ0FBQztRQUNwRCxJQUFJRyxHQUFHLEtBQUtDLFdBQVcsRUFBRTtVQUN2QjtVQUNBLElBQUlGLEdBQUcsS0FBS2hJLFFBQVEsRUFDbEJnSSxHQUFHLEdBQUc1cUIsS0FBSyxDQUFDNGlCLFFBQVEsQ0FBQztVQUN2QmdJLEdBQUcsQ0FBQy9wQixHQUFHLENBQUMsR0FBR2lxQixXQUFXO1FBQ3hCO01BQ0YsQ0FBQyxDQUFDO01BQ0YsT0FBT0YsR0FBRztJQUNaLENBQUM7SUFFTSxNQUFNbkIsMEJBQTBCLEdBQUcsU0FBQUEsQ0FBVTdHLFFBQVEsRUFBRTtNQUM1RCxJQUFJQSxRQUFRLFlBQVlsa0IsT0FBTyxDQUFDdXJCLE1BQU0sRUFBRTtRQUN0QztRQUNBLElBQUlySCxRQUFRLENBQUNtSSxRQUFRLEtBQUssQ0FBQyxFQUFFO1VBQzNCLE9BQU9uSSxRQUFRO1FBQ2pCO1FBQ0EsSUFBSW9JLE1BQU0sR0FBR3BJLFFBQVEsQ0FBQ3ZZLEtBQUssQ0FBQyxJQUFJLENBQUM7UUFDakMsT0FBTyxJQUFJNGdCLFVBQVUsQ0FBQ0QsTUFBTSxDQUFDO01BQy9CO01BQ0EsSUFBSXBJLFFBQVEsWUFBWWxrQixPQUFPLENBQUMwbUIsUUFBUSxFQUFFO1FBQ3hDLE9BQU8sSUFBSS9HLEtBQUssQ0FBQ0MsUUFBUSxDQUFDc0UsUUFBUSxDQUFDeUMsV0FBVyxDQUFDLENBQUMsQ0FBQztNQUNuRDtNQUNBLElBQUl6QyxRQUFRLFlBQVlsa0IsT0FBTyxDQUFDMnJCLFVBQVUsRUFBRTtRQUMxQyxPQUFPRCxPQUFPLENBQUN4SCxRQUFRLENBQUMySCxRQUFRLENBQUMsQ0FBQyxDQUFDO01BQ3JDO01BQ0EsSUFBSTNILFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSUEsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJdmhCLE1BQU0sQ0FBQytNLElBQUksQ0FBQ3dVLFFBQVEsQ0FBQyxDQUFDaGMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUMzRixPQUFPMkgsS0FBSyxDQUFDMmMsYUFBYSxDQUFDeEIsWUFBWSxDQUFDeUIsZ0JBQWdCLEVBQUV2SSxRQUFRLENBQUMsQ0FBQztNQUN0RTtNQUNBLElBQUlBLFFBQVEsWUFBWWxrQixPQUFPLENBQUNvQixTQUFTLEVBQUU7UUFDekM7UUFDQTtRQUNBO1FBQ0E7UUFDQSxPQUFPOGlCLFFBQVE7TUFDakI7TUFDQSxPQUFPeFcsU0FBUztJQUNsQixDQUFDO0lBRUQsTUFBTW9lLGNBQWMsR0FBRzNQLElBQUksSUFBSSxPQUFPLEdBQUdBLElBQUk7SUFDN0MsTUFBTXNRLGdCQUFnQixHQUFHdFEsSUFBSSxJQUFJQSxJQUFJLENBQUN1USxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBRXhDLFNBQVMxQixZQUFZQSxDQUFDdFAsTUFBTSxFQUFFaVIsS0FBSyxFQUFFO01BQzFDLElBQUksT0FBT0EsS0FBSyxLQUFLLFFBQVEsSUFBSUEsS0FBSyxLQUFLLElBQUksRUFBRTtRQUMvQyxJQUFJcmUsS0FBSyxDQUFDb1IsT0FBTyxDQUFDaU4sS0FBSyxDQUFDLEVBQUU7VUFDeEIsT0FBT0EsS0FBSyxDQUFDaGlCLEdBQUcsQ0FBQ3FnQixZQUFZLENBQUN2WSxJQUFJLENBQUMsSUFBSSxFQUFFaUosTUFBTSxDQUFDLENBQUM7UUFDbkQ7UUFDQSxJQUFJd1EsR0FBRyxHQUFHLENBQUMsQ0FBQztRQUNadnBCLE1BQU0sQ0FBQ2tjLE9BQU8sQ0FBQzhOLEtBQUssQ0FBQyxDQUFDM3FCLE9BQU8sQ0FBQyxVQUFBa08sS0FBQSxFQUF3QjtVQUFBLElBQWQsQ0FBQy9OLEdBQUcsRUFBRXdKLEtBQUssQ0FBQyxHQUFBdUUsS0FBQTtVQUNsRGdjLEdBQUcsQ0FBQ3hRLE1BQU0sQ0FBQ3ZaLEdBQUcsQ0FBQyxDQUFDLEdBQUc2b0IsWUFBWSxDQUFDdFAsTUFBTSxFQUFFL1AsS0FBSyxDQUFDO1FBQ2hELENBQUMsQ0FBQztRQUNGLE9BQU91Z0IsR0FBRztNQUNaO01BQ0EsT0FBT1MsS0FBSztJQUNkO0lBQUMzcEIsc0JBQUE7RUFBQSxTQUFBQyxXQUFBO0lBQUEsT0FBQUQsc0JBQUEsQ0FBQUMsV0FBQTtFQUFBO0VBQUFELHNCQUFBO0FBQUE7RUFBQUUsSUFBQTtFQUFBQyxLQUFBO0FBQUEsRzs7Ozs7Ozs7Ozs7Ozs7SUN6S0QxQyxNQUFNLENBQUNqQixNQUFNLENBQUM7TUFBQzZoQixrQkFBa0IsRUFBQ0EsQ0FBQSxLQUFJQTtJQUFrQixDQUFDLENBQUM7SUFBQyxJQUFJOWUsZUFBZTtJQUFDOUIsTUFBTSxDQUFDYixJQUFJLENBQUMsbUNBQW1DLEVBQUM7TUFBQ3lELE9BQU9BLENBQUN4RCxDQUFDLEVBQUM7UUFBQzBDLGVBQWUsR0FBQzFDLENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJa3JCLDBCQUEwQixFQUFDeEosWUFBWTtJQUFDOWdCLE1BQU0sQ0FBQ2IsSUFBSSxDQUFDLGdCQUFnQixFQUFDO01BQUNtckIsMEJBQTBCQSxDQUFDbHJCLENBQUMsRUFBQztRQUFDa3JCLDBCQUEwQixHQUFDbHJCLENBQUM7TUFBQSxDQUFDO01BQUMwaEIsWUFBWUEsQ0FBQzFoQixDQUFDLEVBQUM7UUFBQzBoQixZQUFZLEdBQUMxaEIsQ0FBQztNQUFBO0lBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUFDLElBQUlJLG9CQUFvQixDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU1BLG9CQUFvQixDQUFDLENBQUMsRUFBRSxDQUFDO0lBU2pZLE1BQU1vaEIsa0JBQWtCLENBQUM7TUFDOUJuZCxXQUFXQSxDQUFDZ2xCLFFBQVEsRUFBRTNuQixpQkFBaUIsRUFBRXlOLE9BQU8sRUFBRTtRQUNoRCxJQUFJLENBQUM0ZCxTQUFTLEdBQUcxRCxRQUFRO1FBQ3pCLElBQUksQ0FBQ3hYLGtCQUFrQixHQUFHblEsaUJBQWlCO1FBRTNDLElBQUksQ0FBQ3NyQixpQkFBaUIsR0FBRzdkLE9BQU8sQ0FBQzZaLGdCQUFnQixJQUFJLElBQUk7UUFDekQsSUFBSTdaLE9BQU8sQ0FBQzhaLFlBQVksSUFBSXZuQixpQkFBaUIsQ0FBQ3lOLE9BQU8sQ0FBQ21PLFNBQVMsRUFBRTtVQUMvRCxJQUFJLENBQUMyUCxVQUFVLEdBQUd2cUIsZUFBZSxDQUFDd3FCLGFBQWEsQ0FDN0N4ckIsaUJBQWlCLENBQUN5TixPQUFPLENBQUNtTyxTQUFTLENBQUM7UUFDeEMsQ0FBQyxNQUFNO1VBQ0wsSUFBSSxDQUFDMlAsVUFBVSxHQUFHLElBQUk7UUFDeEI7UUFFQSxJQUFJLENBQUNFLFdBQVcsR0FBRyxJQUFJenFCLGVBQWUsQ0FBQ3VSLE1BQU0sQ0FBRCxDQUFDO01BQy9DO01BRUEsQ0FBQ21aLE1BQU0sQ0FBQ0MsYUFBYSxJQUFJO1FBQ3ZCLElBQUlyUSxNQUFNLEdBQUcsSUFBSTtRQUNqQixPQUFPO1VBQ0wsTUFBTWdCLElBQUlBLENBQUEsRUFBRztZQUNYLE1BQU1sUyxLQUFLLEdBQUcsTUFBTWtSLE1BQU0sQ0FBQ3NRLGtCQUFrQixDQUFDLENBQUM7WUFDL0MsT0FBTztjQUFFclAsSUFBSSxFQUFFLENBQUNuUyxLQUFLO2NBQUVBO1lBQU0sQ0FBQztVQUNoQztRQUNGLENBQUM7TUFDSDs7TUFFQTtNQUNBO01BQ0EsTUFBTXloQixxQkFBcUJBLENBQUEsRUFBRztRQUM1QixJQUFJO1VBQ0YsT0FBTyxJQUFJLENBQUNSLFNBQVMsQ0FBQy9PLElBQUksQ0FBQyxDQUFDO1FBQzlCLENBQUMsQ0FBQyxPQUFPalcsQ0FBQyxFQUFFO1VBQ1ZZLE9BQU8sQ0FBQ0MsS0FBSyxDQUFDYixDQUFDLENBQUM7UUFDbEI7TUFDRjs7TUFFQTtNQUNBO01BQ0EsTUFBTXVsQixrQkFBa0JBLENBQUEsRUFBSTtRQUMxQixPQUFPLElBQUksRUFBRTtVQUNYLElBQUlsaUIsR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDbWlCLHFCQUFxQixDQUFDLENBQUM7VUFFNUMsSUFBSSxDQUFDbmlCLEdBQUcsRUFBRSxPQUFPLElBQUk7VUFDckJBLEdBQUcsR0FBR3NXLFlBQVksQ0FBQ3RXLEdBQUcsRUFBRThmLDBCQUEwQixDQUFDO1VBRW5ELElBQUksQ0FBQyxJQUFJLENBQUNyWixrQkFBa0IsQ0FBQzFDLE9BQU8sQ0FBQ2pFLFFBQVEsSUFBSSxLQUFLLElBQUlFLEdBQUcsRUFBRTtZQUM3RDtZQUNBO1lBQ0E7WUFDQTtZQUNBO1lBQ0E7WUFDQSxJQUFJLElBQUksQ0FBQytoQixXQUFXLENBQUNqYyxHQUFHLENBQUM5RixHQUFHLENBQUNhLEdBQUcsQ0FBQyxFQUFFO1lBQ25DLElBQUksQ0FBQ2toQixXQUFXLENBQUMvYixHQUFHLENBQUNoRyxHQUFHLENBQUNhLEdBQUcsRUFBRSxJQUFJLENBQUM7VUFDckM7VUFFQSxJQUFJLElBQUksQ0FBQ2doQixVQUFVLEVBQ2pCN2hCLEdBQUcsR0FBRyxJQUFJLENBQUM2aEIsVUFBVSxDQUFDN2hCLEdBQUcsQ0FBQztVQUU1QixPQUFPQSxHQUFHO1FBQ1o7TUFDRjs7TUFFQTtNQUNBO01BQ0E7TUFDQTJlLDZCQUE2QkEsQ0FBQ0osU0FBUyxFQUFFO1FBQ3ZDLElBQUksQ0FBQ0EsU0FBUyxFQUFFO1VBQ2QsT0FBTyxJQUFJLENBQUMyRCxrQkFBa0IsQ0FBQyxDQUFDO1FBQ2xDO1FBQ0EsTUFBTUUsaUJBQWlCLEdBQUcsSUFBSSxDQUFDRixrQkFBa0IsQ0FBQyxDQUFDO1FBQ25ELE1BQU1HLFVBQVUsR0FBRyxJQUFJM21CLEtBQUssQ0FBQyw2Q0FBNkMsQ0FBQztRQUMzRSxNQUFNNG1CLGNBQWMsR0FBRyxJQUFJOW5CLE9BQU8sQ0FBQyxDQUFDZ0gsT0FBTyxFQUFFNE8sTUFBTSxLQUFLO1VBQ3REOVMsVUFBVSxDQUFDLE1BQU07WUFDZjhTLE1BQU0sQ0FBQ2lTLFVBQVUsQ0FBQztVQUNwQixDQUFDLEVBQUU5RCxTQUFTLENBQUM7UUFDZixDQUFDLENBQUM7UUFDRixPQUFPL2pCLE9BQU8sQ0FBQytuQixJQUFJLENBQUMsQ0FBQ0gsaUJBQWlCLEVBQUVFLGNBQWMsQ0FBQyxDQUFDLENBQ3JEOUksS0FBSyxDQUFFMWQsR0FBRyxJQUFLO1VBQ2QsSUFBSUEsR0FBRyxLQUFLdW1CLFVBQVUsRUFBRTtZQUN0QixJQUFJLENBQUNoSyxLQUFLLENBQUMsQ0FBQztZQUNaO1VBQ0Y7VUFDQSxNQUFNdmMsR0FBRztRQUNYLENBQUMsQ0FBQztNQUNOO01BRUEsTUFBTS9FLE9BQU9BLENBQUMwRSxRQUFRLEVBQUUrbUIsT0FBTyxFQUFFO1FBQy9CO1FBQ0EsSUFBSSxDQUFDQyxPQUFPLENBQUMsQ0FBQztRQUVkLElBQUlDLEdBQUcsR0FBRyxDQUFDO1FBQ1gsT0FBTyxJQUFJLEVBQUU7VUFDWCxNQUFNMWlCLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQ2tpQixrQkFBa0IsQ0FBQyxDQUFDO1VBQzNDLElBQUksQ0FBQ2xpQixHQUFHLEVBQUU7VUFDVixNQUFNdkUsUUFBUSxDQUFDcU4sSUFBSSxDQUFDMFosT0FBTyxFQUFFeGlCLEdBQUcsRUFBRTBpQixHQUFHLEVBQUUsRUFBRSxJQUFJLENBQUNkLGlCQUFpQixDQUFDO1FBQ2xFO01BQ0Y7TUFFQSxNQUFNbGlCLEdBQUdBLENBQUNqRSxRQUFRLEVBQUUrbUIsT0FBTyxFQUFFO1FBQzNCLE1BQU1sUyxPQUFPLEdBQUcsRUFBRTtRQUNsQixNQUFNLElBQUksQ0FBQ3ZaLE9BQU8sQ0FBQyxPQUFPaUosR0FBRyxFQUFFaWMsS0FBSyxLQUFLO1VBQ3ZDM0wsT0FBTyxDQUFDNVosSUFBSSxDQUFDLE1BQU0rRSxRQUFRLENBQUNxTixJQUFJLENBQUMwWixPQUFPLEVBQUV4aUIsR0FBRyxFQUFFaWMsS0FBSyxFQUFFLElBQUksQ0FBQzJGLGlCQUFpQixDQUFDLENBQUM7UUFDaEYsQ0FBQyxDQUFDO1FBRUYsT0FBT3RSLE9BQU87TUFDaEI7TUFFQW1TLE9BQU9BLENBQUEsRUFBRztRQUNSO1FBQ0EsSUFBSSxDQUFDZCxTQUFTLENBQUNnQixNQUFNLENBQUMsQ0FBQztRQUV2QixJQUFJLENBQUNaLFdBQVcsR0FBRyxJQUFJenFCLGVBQWUsQ0FBQ3VSLE1BQU0sQ0FBRCxDQUFDO01BQy9DOztNQUVBO01BQ0F3UCxLQUFLQSxDQUFBLEVBQUc7UUFDTixJQUFJLENBQUNzSixTQUFTLENBQUN0SixLQUFLLENBQUMsQ0FBQztNQUN4QjtNQUVBMVMsS0FBS0EsQ0FBQSxFQUFHO1FBQ04sT0FBTyxJQUFJLENBQUNqRyxHQUFHLENBQUNNLEdBQUcsSUFBSUEsR0FBRyxDQUFDO01BQzdCOztNQUVBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7TUFDRTRpQixLQUFLQSxDQUFBLEVBQUc7UUFDTixPQUFPLElBQUksQ0FBQ2pCLFNBQVMsQ0FBQ2lCLEtBQUssQ0FBQyxDQUFDO01BQy9COztNQUVBO01BQ0EsTUFBTTVaLGFBQWFBLENBQUNqSCxPQUFPLEVBQUU7UUFDM0IsSUFBSTlKLElBQUksR0FBRyxJQUFJO1FBQ2YsSUFBSThKLE9BQU8sRUFBRTtVQUNYLE9BQU85SixJQUFJLENBQUMwTixLQUFLLENBQUMsQ0FBQztRQUNyQixDQUFDLE1BQU07VUFDTCxJQUFJMkssT0FBTyxHQUFHLElBQUloWixlQUFlLENBQUN1UixNQUFNLENBQUQsQ0FBQztVQUN4QyxNQUFNNVEsSUFBSSxDQUFDbEIsT0FBTyxDQUFDLFVBQVVpSixHQUFHLEVBQUU7WUFDaENzUSxPQUFPLENBQUN0SyxHQUFHLENBQUNoRyxHQUFHLENBQUNhLEdBQUcsRUFBRWIsR0FBRyxDQUFDO1VBQzNCLENBQUMsQ0FBQztVQUNGLE9BQU9zUSxPQUFPO1FBQ2hCO01BQ0Y7SUFDRjtJQUFDdlksc0JBQUE7RUFBQSxTQUFBQyxXQUFBO0lBQUEsT0FBQUQsc0JBQUEsQ0FBQUMsV0FBQTtFQUFBO0VBQUFELHNCQUFBO0FBQUE7RUFBQUUsSUFBQTtFQUFBQyxLQUFBO0FBQUEsRzs7Ozs7Ozs7Ozs7Ozs7SUMzSkQxQyxNQUFBLENBQU9qQixNQUFFO01BQUFtVixNQUFBLEVBQUFBLENBQUEsS0FBQUE7SUFBc0I7SUFBQSxJQUFBbVosb0JBQTBCLEVBQUEzTSxrQkFBQTtJQUFBMWdCLE1BQTRCLENBQUNiLElBQUE7TUFBQWt1QixxQkFBQWp1QixDQUFBO1FBQUFpdUIsb0JBQUEsR0FBQWp1QixDQUFBO01BQUE7TUFBQXNoQixtQkFBQXRoQixDQUFBO1FBQUFzaEIsa0JBQUEsR0FBQXRoQixDQUFBO01BQUE7SUFBQTtJQUFBLElBQUF5aEIsMEJBQUEsRUFBQUMsWUFBQTtJQUFBOWdCLE1BQUEsQ0FBQWIsSUFBQTtNQUFBMGhCLDJCQUFBemhCLENBQUE7UUFBQXloQiwwQkFBQSxHQUFBemhCLENBQUE7TUFBQTtNQUFBMGhCLGFBQUExaEIsQ0FBQTtRQUFBMGhCLFlBQUEsR0FBQTFoQixDQUFBO01BQUE7SUFBQTtJQUFBLElBQUEwQyxlQUFBO0lBQUE5QixNQUFBLENBQUFiLElBQUE7TUFBQXlELFFBQUF4RCxDQUFBO1FBQUEwQyxlQUFBLEdBQUExQyxDQUFBO01BQUE7SUFBQTtJQUFBLElBQUFJLG9CQUFBLFdBQUFBLG9CQUFBO0lBMEJoRixNQUFPMFUsTUFBTTtNQUtqQnpRLFlBQVltRyxLQUFxQixFQUFFOUksaUJBQW9DO1FBQUEsS0FKaEV3c0IsTUFBTTtRQUFBLEtBQ05yYyxrQkFBa0I7UUFBQSxLQUNsQnNjLGtCQUFrQjtRQUd2QixJQUFJLENBQUNELE1BQU0sR0FBRzFqQixLQUFLO1FBQ25CLElBQUksQ0FBQ3FILGtCQUFrQixHQUFHblEsaUJBQWlCO1FBQzNDLElBQUksQ0FBQ3lzQixrQkFBa0IsR0FBRyxJQUFJO01BQ2hDO01BRUEsTUFBTUMsVUFBVUEsQ0FBQTtRQUNkLE1BQU03ckIsVUFBVSxHQUFHLElBQUksQ0FBQzJyQixNQUFNLENBQUN2SyxhQUFhLENBQUMsSUFBSSxDQUFDOVIsa0JBQWtCLENBQUNyUCxjQUFjLENBQUM7UUFDcEYsT0FBTyxNQUFNRCxVQUFVLENBQUNnbEIsY0FBYyxDQUNwQzdGLFlBQVksQ0FBQyxJQUFJLENBQUM3UCxrQkFBa0IsQ0FBQ2pQLFFBQVEsRUFBRTZlLDBCQUEwQixDQUFDLEVBQzFFQyxZQUFZLENBQUMsSUFBSSxDQUFDN1Asa0JBQWtCLENBQUMxQyxPQUFPLEVBQUVzUywwQkFBMEIsQ0FBQyxDQUMxRTtNQUNIO01BRUF1TSxLQUFLQSxDQUFBO1FBQ0gsTUFBTSxJQUFJbG5CLEtBQUssQ0FDYiwwRUFBMEUsQ0FDM0U7TUFDSDtNQUVBdW5CLFlBQVlBLENBQUE7UUFDVixPQUFPLElBQUksQ0FBQ3hjLGtCQUFrQixDQUFDMUMsT0FBTyxDQUFDbU8sU0FBUztNQUNsRDtNQUVBZ1IsY0FBY0EsQ0FBQ0MsR0FBUTtRQUNyQixNQUFNaHNCLFVBQVUsR0FBRyxJQUFJLENBQUNzUCxrQkFBa0IsQ0FBQ3JQLGNBQWM7UUFDekQsT0FBT3NkLEtBQUssQ0FBQ3FCLFVBQVUsQ0FBQ21OLGNBQWMsQ0FBQyxJQUFJLEVBQUVDLEdBQUcsRUFBRWhzQixVQUFVLENBQUM7TUFDL0Q7TUFFQWlzQixrQkFBa0JBLENBQUE7UUFDaEIsT0FBTyxJQUFJLENBQUMzYyxrQkFBa0IsQ0FBQ3JQLGNBQWM7TUFDL0M7TUFFQWlzQixPQUFPQSxDQUFDdGQsU0FBOEI7UUFDcEMsT0FBT3pPLGVBQWUsQ0FBQ2dzQiwwQkFBMEIsQ0FBQyxJQUFJLEVBQUV2ZCxTQUFTLENBQUM7TUFDcEU7TUFFQSxNQUFNd2QsWUFBWUEsQ0FBQ3hkLFNBQThCO1FBQy9DLE9BQU8sSUFBSXZMLE9BQU8sQ0FBQ2dILE9BQU8sSUFBSUEsT0FBTyxDQUFDLElBQUksQ0FBQzZoQixPQUFPLENBQUN0ZCxTQUFTLENBQUMsQ0FBQyxDQUFDO01BQ2pFO01BRUF5ZCxjQUFjQSxDQUFDemQsU0FBcUMsRUFBa0Q7UUFBQSxJQUFoRGhDLE9BQUEsR0FBQVosU0FBQSxDQUFBbEcsTUFBQSxRQUFBa0csU0FBQSxRQUFBVixTQUFBLEdBQUFVLFNBQUEsTUFBOEMsRUFBRTtRQUNwRyxNQUFNcEIsT0FBTyxHQUFHekssZUFBZSxDQUFDbXNCLGtDQUFrQyxDQUFDMWQsU0FBUyxDQUFDO1FBQzdFLE9BQU8sSUFBSSxDQUFDK2MsTUFBTSxDQUFDakUsZUFBZSxDQUNoQyxJQUFJLENBQUNwWSxrQkFBa0IsRUFDdkIxRSxPQUFPLEVBQ1BnRSxTQUFTLEVBQ1RoQyxPQUFPLENBQUNZLG9CQUFvQixDQUM3QjtNQUNIO01BRUEsTUFBTStlLG1CQUFtQkEsQ0FBQzNkLFNBQXFDLEVBQWtEO1FBQUEsSUFBaERoQyxPQUFBLEdBQUFaLFNBQUEsQ0FBQWxHLE1BQUEsUUFBQWtHLFNBQUEsUUFBQVYsU0FBQSxHQUFBVSxTQUFBLE1BQThDLEVBQUU7UUFDL0csT0FBTyxJQUFJLENBQUNxZ0IsY0FBYyxDQUFDemQsU0FBUyxFQUFFaEMsT0FBTyxDQUFDO01BQ2hEOztJQUdGO0lBQ0EsQ0FBQyxHQUFHOGUsb0JBQW9CLEVBQUViLE1BQU0sQ0FBQzJCLFFBQVEsRUFBRTNCLE1BQU0sQ0FBQ0MsYUFBYSxDQUFDLENBQUNsckIsT0FBTyxDQUFDNnNCLFVBQVUsSUFBRztNQUNwRixJQUFJQSxVQUFVLEtBQUssT0FBTyxFQUFFO01BRTNCbGEsTUFBTSxDQUFDdFQsU0FBaUIsQ0FBQ3d0QixVQUFVLENBQUMsR0FBRyxZQUEwQztRQUNoRixNQUFNaFMsTUFBTSxHQUFHaVMsdUJBQXVCLENBQUMsSUFBSSxFQUFFRCxVQUFVLENBQUM7UUFDeEQsT0FBT2hTLE1BQU0sQ0FBQ2dTLFVBQVUsQ0FBQyxDQUFDLEdBQUF6Z0IsU0FBTyxDQUFDO01BQ3BDLENBQUM7TUFFRCxJQUFJeWdCLFVBQVUsS0FBSzVCLE1BQU0sQ0FBQzJCLFFBQVEsSUFBSUMsVUFBVSxLQUFLNUIsTUFBTSxDQUFDQyxhQUFhLEVBQUU7TUFFM0UsTUFBTTZCLGVBQWUsR0FBRzVOLGtCQUFrQixDQUFDME4sVUFBVSxDQUFDO01BRXJEbGEsTUFBTSxDQUFDdFQsU0FBaUIsQ0FBQzB0QixlQUFlLENBQUMsR0FBRyxZQUEwQztRQUNyRixPQUFPLElBQUksQ0FBQ0YsVUFBVSxDQUFDLENBQUMsR0FBQXpnQixTQUFPLENBQUM7TUFDbEMsQ0FBQztJQUNILENBQUMsQ0FBQztJQUVGLFNBQVMwZ0IsdUJBQXVCQSxDQUFDalMsTUFBbUIsRUFBRXVMLE1BQXVCO01BQzNFLElBQUl2TCxNQUFNLENBQUNuTCxrQkFBa0IsQ0FBQzFDLE9BQU8sQ0FBQ2pFLFFBQVEsRUFBRTtRQUM5QyxNQUFNLElBQUlwRSxLQUFLLGdCQUFBa0UsTUFBQSxDQUFnQmlHLE1BQU0sQ0FBQ3NYLE1BQU0sQ0FBQywwQkFBdUIsQ0FBQztNQUN2RTtNQUVBLElBQUksQ0FBQ3ZMLE1BQU0sQ0FBQ21SLGtCQUFrQixFQUFFO1FBQzlCblIsTUFBTSxDQUFDbVIsa0JBQWtCLEdBQUduUixNQUFNLENBQUNrUixNQUFNLENBQUN4Yix5QkFBeUIsQ0FDakVzSyxNQUFNLENBQUNuTCxrQkFBa0IsRUFDekI7VUFDRW1YLGdCQUFnQixFQUFFaE0sTUFBTTtVQUN4QmlNLFlBQVksRUFBRTtTQUNmLENBQ0Y7TUFDSDtNQUVBLE9BQU9qTSxNQUFNLENBQUNtUixrQkFBa0I7SUFDbEM7SUFBQ2hyQixzQkFBQTtFQUFBLFNBQUFDLFdBQUE7SUFBQSxPQUFBRCxzQkFBQSxDQUFBQyxXQUFBO0VBQUE7RUFBQUQsc0JBQUE7QUFBQTtFQUFBRSxJQUFBO0VBQUFDLEtBQUE7QUFBQSxHOzs7Ozs7Ozs7OztBQ3pIRDFDLE1BQU0sQ0FBQ2pCLE1BQU0sQ0FBQztFQUFDd3ZCLHFCQUFxQixFQUFDQSxDQUFBLEtBQUlBO0FBQXFCLENBQUMsQ0FBQztBQUN6RCxNQUFNQSxxQkFBcUIsR0FBRyxJQUFLLE1BQU1BLHFCQUFxQixDQUFDO0VBQ3BFOXFCLFdBQVdBLENBQUEsRUFBRztJQUNaLElBQUksQ0FBQytxQixpQkFBaUIsR0FBR3RzQixNQUFNLENBQUN1c0IsTUFBTSxDQUFDLElBQUksQ0FBQztFQUM5QztFQUVBQyxJQUFJQSxDQUFDaFQsSUFBSSxFQUFFaVQsSUFBSSxFQUFFO0lBQ2YsSUFBSSxDQUFFalQsSUFBSSxFQUFFO01BQ1YsT0FBTyxJQUFJNVosZUFBZSxDQUFELENBQUM7SUFDNUI7SUFFQSxJQUFJLENBQUU2c0IsSUFBSSxFQUFFO01BQ1YsT0FBT0MsZ0JBQWdCLENBQUNsVCxJQUFJLEVBQUUsSUFBSSxDQUFDOFMsaUJBQWlCLENBQUM7SUFDdkQ7SUFFQSxJQUFJLENBQUVHLElBQUksQ0FBQ0UsMkJBQTJCLEVBQUU7TUFDdENGLElBQUksQ0FBQ0UsMkJBQTJCLEdBQUczc0IsTUFBTSxDQUFDdXNCLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDeEQ7O0lBRUE7SUFDQTtJQUNBLE9BQU9HLGdCQUFnQixDQUFDbFQsSUFBSSxFQUFFaVQsSUFBSSxDQUFDRSwyQkFBMkIsQ0FBQztFQUNqRTtBQUNGLENBQUMsRUFBQztBQUVGLFNBQVNELGdCQUFnQkEsQ0FBQ2xULElBQUksRUFBRW9ULFdBQVcsRUFBRTtFQUMzQyxPQUFRcFQsSUFBSSxJQUFJb1QsV0FBVyxHQUN2QkEsV0FBVyxDQUFDcFQsSUFBSSxDQUFDLEdBQ2pCb1QsV0FBVyxDQUFDcFQsSUFBSSxDQUFDLEdBQUcsSUFBSTVaLGVBQWUsQ0FBQzRaLElBQUksQ0FBQztBQUNuRCxDOzs7Ozs7Ozs7Ozs7OztJQzdCQTFiLE1BQUEsQ0FBT2pCLE1BQUk7TUFBQWd3QixzQkFBb0IsRUFBQUEsQ0FBQSxLQUFBQTtJQUFBO0lBQUEsSUFBQUMsSUFBQTtJQUFBaHZCLE1BQUEsQ0FBQWIsSUFBQTtNQUFBeUQsUUFBQXhELENBQUE7UUFBQTR2QixJQUFBLEdBQUE1dkIsQ0FBQTtNQUFBO0lBQUE7SUFBQSxJQUFBNnZCLHdCQUFBLEVBQUF2TyxrQkFBQSxFQUFBRCxtQkFBQTtJQUFBemdCLE1BQUEsQ0FBQWIsSUFBQTtNQUFBOHZCLHlCQUFBN3ZCLENBQUE7UUFBQTZ2Qix3QkFBQSxHQUFBN3ZCLENBQUE7TUFBQTtNQUFBc2hCLG1CQUFBdGhCLENBQUE7UUFBQXNoQixrQkFBQSxHQUFBdGhCLENBQUE7TUFBQTtNQUFBcWhCLG9CQUFBcmhCLENBQUE7UUFBQXFoQixtQkFBQSxHQUFBcmhCLENBQUE7TUFBQTtJQUFBO0lBQUEsSUFBQUMsZUFBQTtJQUFBVyxNQUFBLENBQUFiLElBQUE7TUFBQUUsZ0JBQUFELENBQUE7UUFBQUMsZUFBQSxHQUFBRCxDQUFBO01BQUE7SUFBQTtJQUFBLElBQUFJLG9CQUFBLFdBQUFBLG9CQUFBO0lBaUQvQixNQUFNdXZCLHNCQUFzQjtNQW9CMUJ0ckIsWUFBWXlyQixRQUFnQixFQUFFM2dCLE9BQTJCO1FBQUEsS0FuQnhDM0UsS0FBSztRQW9CcEIsSUFBSSxDQUFDQSxLQUFLLEdBQUcsSUFBSXZLLGVBQWUsQ0FBQzZ2QixRQUFRLEVBQUUzZ0IsT0FBTyxDQUFDO01BQ3JEO01BRU9tZ0IsSUFBSUEsQ0FBQ2hULElBQVk7UUFDdEIsTUFBTStQLEdBQUcsR0FBdUIsRUFBRTtRQUVsQztRQUNBc0Qsc0JBQXNCLENBQUNJLHlCQUF5QixDQUFDNXRCLE9BQU8sQ0FBRW9tQixNQUFNLElBQUk7VUFDbEU7VUFDQSxNQUFNeUgsV0FBVyxHQUFHLElBQUksQ0FBQ3hsQixLQUFLLENBQUMrZCxNQUFNLENBQXdCO1VBQzdEOEQsR0FBRyxDQUFDOUQsTUFBTSxDQUFDLEdBQUd5SCxXQUFXLENBQUNwZCxJQUFJLENBQUMsSUFBSSxDQUFDcEksS0FBSyxFQUFFOFIsSUFBSSxDQUFDO1VBRWhELElBQUksQ0FBQ3VULHdCQUF3QixDQUFDbkYsUUFBUSxDQUFDbkMsTUFBTSxDQUFDLEVBQUU7VUFFaEQsTUFBTTBILGVBQWUsR0FBRzNPLGtCQUFrQixDQUFDaUgsTUFBTSxDQUFDO1VBQ2xEOEQsR0FBRyxDQUFDNEQsZUFBZSxDQUFDLEdBQUc7WUFBQSxPQUF3QjVELEdBQUcsQ0FBQzlELE1BQU0sQ0FBQyxDQUFDLEdBQUFoYSxTQUFPLENBQUM7VUFBQTtRQUNyRSxDQUFDLENBQUM7UUFFRjtRQUNBOFMsbUJBQW1CLENBQUNsZixPQUFPLENBQUVvbUIsTUFBTSxJQUFJO1VBQ3JDOEQsR0FBRyxDQUFDOUQsTUFBTSxDQUFDLEdBQUcsWUFBOEI7WUFDMUMsTUFBTSxJQUFJemhCLEtBQUssSUFBQWtFLE1BQUEsQ0FDVnVkLE1BQU0sa0RBQUF2ZCxNQUFBLENBQStDc1csa0JBQWtCLENBQ3hFaUgsTUFBTSxDQUNQLGdCQUFhLENBQ2Y7VUFDSCxDQUFDO1FBQ0gsQ0FBQyxDQUFDO1FBRUYsT0FBTzhELEdBQUc7TUFDWjs7SUFHRjtJQXRETXNELHNCQUFzQixDQUdGSSx5QkFBeUIsR0FBRyxDQUNsRCw2QkFBNkIsRUFDN0IsZ0JBQWdCLEVBQ2hCLGtCQUFrQixFQUNsQixrQkFBa0IsRUFDbEIsZ0JBQWdCLEVBQ2hCLHFCQUFxQixFQUNyQix3QkFBd0IsRUFDeEIsTUFBTSxFQUNOLGNBQWMsRUFDZCxhQUFhLEVBQ2IsZUFBZSxFQUNmLGFBQWEsRUFDYixhQUFhLEVBQ2IsYUFBYSxDQUNMO0lBcUNaMXZCLGNBQWMsQ0FBQ3N2QixzQkFBc0IsR0FBR0Esc0JBQXNCO0lBRTlEO0lBQ0F0dkIsY0FBYyxDQUFDNnZCLDZCQUE2QixHQUFHTixJQUFJLENBQUMsTUFBNkI7TUFDL0UsTUFBTU8saUJBQWlCLEdBQXVCLEVBQUU7TUFDaEQsTUFBTUwsUUFBUSxHQUFHOXJCLE9BQU8sQ0FBQ0MsR0FBRyxDQUFDbXNCLFNBQVM7TUFFdEMsSUFBSSxDQUFDTixRQUFRLEVBQUU7UUFDYixNQUFNLElBQUlocEIsS0FBSyxDQUFDLHNDQUFzQyxDQUFDO01BQ3pEO01BRUEsSUFBSTlDLE9BQU8sQ0FBQ0MsR0FBRyxDQUFDb3NCLGVBQWUsRUFBRTtRQUMvQkYsaUJBQWlCLENBQUM3ckIsUUFBUSxHQUFHTixPQUFPLENBQUNDLEdBQUcsQ0FBQ29zQixlQUFlO01BQzFEO01BRUEsTUFBTWxZLE1BQU0sR0FBRyxJQUFJd1gsc0JBQXNCLENBQUNHLFFBQVEsRUFBRUssaUJBQWlCLENBQUM7TUFFdEU7TUFDQWh2QixNQUFNLENBQUNtdkIsT0FBTyxDQUFDLFlBQTBCO1FBQ3ZDLE1BQU1uWSxNQUFNLENBQUMzTixLQUFLLENBQUN1WSxNQUFNLENBQUN3TixPQUFPLEVBQUU7TUFDckMsQ0FBQyxDQUFDO01BRUYsT0FBT3BZLE1BQU07SUFDZixDQUFDLENBQUM7SUFBQ2hWLHNCQUFBO0VBQUEsU0FBQUMsV0FBQTtJQUFBLE9BQUFELHNCQUFBLENBQUFDLFdBQUE7RUFBQTtFQUFBRCxzQkFBQTtBQUFBO0VBQUFFLElBQUE7RUFBQUMsS0FBQTtBQUFBLEc7Ozs7Ozs7Ozs7Ozs7O0lDL0hILElBQUlDLGFBQWE7SUFBQzdELE9BQU8sQ0FBQ0ssSUFBSSxDQUFDLHNDQUFzQyxFQUFDO01BQUN5RCxPQUFPQSxDQUFDeEQsQ0FBQyxFQUFDO1FBQUN1RCxhQUFhLEdBQUN2RCxDQUFDO01BQUE7SUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQXRHLElBQUl3d0IsbUJBQW1CO0lBQUM5d0IsT0FBTyxDQUFDSyxJQUFJLENBQUMsZ0JBQWdCLEVBQUM7TUFBQ3l3QixtQkFBbUJBLENBQUN4d0IsQ0FBQyxFQUFDO1FBQUN3d0IsbUJBQW1CLEdBQUN4d0IsQ0FBQztNQUFBO0lBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUFDLElBQUl5d0IsWUFBWTtJQUFDL3dCLE9BQU8sQ0FBQ0ssSUFBSSxDQUFDLGlCQUFpQixFQUFDO01BQUMwd0IsWUFBWUEsQ0FBQ3p3QixDQUFDLEVBQUM7UUFBQ3l3QixZQUFZLEdBQUN6d0IsQ0FBQztNQUFBO0lBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUFDLElBQUkwd0IsV0FBVztJQUFDaHhCLE9BQU8sQ0FBQ0ssSUFBSSxDQUFDLGdCQUFnQixFQUFDO01BQUMyd0IsV0FBV0EsQ0FBQzF3QixDQUFDLEVBQUM7UUFBQzB3QixXQUFXLEdBQUMxd0IsQ0FBQztNQUFBO0lBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUFDLElBQUkyd0IsWUFBWTtJQUFDanhCLE9BQU8sQ0FBQ0ssSUFBSSxDQUFDLGlCQUFpQixFQUFDO01BQUM0d0IsWUFBWUEsQ0FBQzN3QixDQUFDLEVBQUM7UUFBQzJ3QixZQUFZLEdBQUMzd0IsQ0FBQztNQUFBO0lBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUFDLElBQUk0d0IsYUFBYSxFQUFDQyxnQkFBZ0IsRUFBQ0MsZ0JBQWdCLEVBQUNDLGVBQWUsRUFBQ0MsV0FBVyxFQUFDQyxvQkFBb0IsRUFBQ0Msc0JBQXNCO0lBQUN4eEIsT0FBTyxDQUFDSyxJQUFJLENBQUMsb0JBQW9CLEVBQUM7TUFBQzZ3QixhQUFhQSxDQUFDNXdCLENBQUMsRUFBQztRQUFDNHdCLGFBQWEsR0FBQzV3QixDQUFDO01BQUEsQ0FBQztNQUFDNndCLGdCQUFnQkEsQ0FBQzd3QixDQUFDLEVBQUM7UUFBQzZ3QixnQkFBZ0IsR0FBQzd3QixDQUFDO01BQUEsQ0FBQztNQUFDOHdCLGdCQUFnQkEsQ0FBQzl3QixDQUFDLEVBQUM7UUFBQzh3QixnQkFBZ0IsR0FBQzl3QixDQUFDO01BQUEsQ0FBQztNQUFDK3dCLGVBQWVBLENBQUMvd0IsQ0FBQyxFQUFDO1FBQUMrd0IsZUFBZSxHQUFDL3dCLENBQUM7TUFBQSxDQUFDO01BQUNneEIsV0FBV0EsQ0FBQ2h4QixDQUFDLEVBQUM7UUFBQ2d4QixXQUFXLEdBQUNoeEIsQ0FBQztNQUFBLENBQUM7TUFBQ2l4QixvQkFBb0JBLENBQUNqeEIsQ0FBQyxFQUFDO1FBQUNpeEIsb0JBQW9CLEdBQUNqeEIsQ0FBQztNQUFBLENBQUM7TUFBQ2t4QixzQkFBc0JBLENBQUNseEIsQ0FBQyxFQUFDO1FBQUNreEIsc0JBQXNCLEdBQUNseEIsQ0FBQztNQUFBO0lBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUFDLElBQUlteEIsa0JBQWtCO0lBQUN6eEIsT0FBTyxDQUFDSyxJQUFJLENBQUMsdUJBQXVCLEVBQUM7TUFBQ294QixrQkFBa0JBLENBQUNueEIsQ0FBQyxFQUFDO1FBQUNteEIsa0JBQWtCLEdBQUNueEIsQ0FBQztNQUFBO0lBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUFDLElBQUlJLG9CQUFvQixDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU1BLG9CQUFvQixDQUFDLENBQUMsRUFBRSxDQUFDO0lBYzE4QjtBQUNBO0FBQ0E7QUFDQTtJQUNBMGYsS0FBSyxHQUFHLENBQUMsQ0FBQzs7SUFFVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0E7SUFDQUEsS0FBSyxDQUFDcUIsVUFBVSxHQUFHLFNBQVNBLFVBQVVBLENBQUM3RSxJQUFJLEVBQUVuTixPQUFPLEVBQUU7TUFBQSxJQUFBaWlCLHFCQUFBLEVBQUFDLGNBQUE7TUFDcEQvVSxJQUFJLEdBQUc0VSxzQkFBc0IsQ0FBQzVVLElBQUksQ0FBQztNQUVuQ25OLE9BQU8sR0FBRzBoQixnQkFBZ0IsQ0FBQzFoQixPQUFPLENBQUM7TUFFbkMsSUFBSSxDQUFDbWlCLFVBQVUsSUFBQUYscUJBQUEsR0FBRyxDQUFBQyxjQUFBLEdBQUFULGFBQWEsRUFBQ3poQixPQUFPLENBQUNvaUIsWUFBWSxDQUFDLGNBQUFILHFCQUFBLHVCQUFuQ0EscUJBQUEsQ0FBQWxkLElBQUEsQ0FBQW1kLGNBQUEsRUFBc0MvVSxJQUFJLENBQUM7TUFFN0QsSUFBSSxDQUFDMlEsVUFBVSxHQUFHdnFCLGVBQWUsQ0FBQ3dxQixhQUFhLENBQUMvZCxPQUFPLENBQUNtTyxTQUFTLENBQUM7TUFDbEUsSUFBSSxDQUFDa1UsWUFBWSxHQUFHcmlCLE9BQU8sQ0FBQ3FpQixZQUFZO01BRXhDLElBQUksQ0FBQ0MsV0FBVyxHQUFHVixlQUFlLENBQUN6VSxJQUFJLEVBQUVuTixPQUFPLENBQUM7TUFFakQsTUFBTWdKLE1BQU0sR0FBRzZZLFdBQVcsQ0FBQzFVLElBQUksRUFBRSxJQUFJLENBQUNtVixXQUFXLEVBQUV0aUIsT0FBTyxDQUFDO01BQzNELElBQUksQ0FBQ3VpQixPQUFPLEdBQUd2WixNQUFNO01BRXJCLElBQUksQ0FBQ3daLFdBQVcsR0FBR3haLE1BQU0sQ0FBQ21YLElBQUksQ0FBQ2hULElBQUksRUFBRSxJQUFJLENBQUNtVixXQUFXLENBQUM7TUFDdEQsSUFBSSxDQUFDRyxLQUFLLEdBQUd0VixJQUFJO01BRWpCLElBQUksQ0FBQ3VWLDRCQUE0QixHQUFHLElBQUksQ0FBQ0Msc0JBQXNCLENBQUN4VixJQUFJLEVBQUVuTixPQUFPLENBQUM7TUFFOUU4aEIsb0JBQW9CLENBQUMsSUFBSSxFQUFFM1UsSUFBSSxFQUFFbk4sT0FBTyxDQUFDO01BRXpDMmhCLGdCQUFnQixDQUFDLElBQUksRUFBRXhVLElBQUksRUFBRW5OLE9BQU8sQ0FBQztNQUVyQzJRLEtBQUssQ0FBQ2lTLFlBQVksQ0FBQzNnQixHQUFHLENBQUNrTCxJQUFJLEVBQUUsSUFBSSxDQUFDO0lBQ3BDLENBQUM7SUFFRHhaLE1BQU0sQ0FBQ0MsTUFBTSxDQUFDK2MsS0FBSyxDQUFDcUIsVUFBVSxDQUFDM2YsU0FBUyxFQUFFO01BQ3hDd3dCLGdCQUFnQkEsQ0FBQ3hqQixJQUFJLEVBQUU7UUFDckIsSUFBSUEsSUFBSSxDQUFDbkcsTUFBTSxJQUFJLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQzNCLE9BQU9tRyxJQUFJLENBQUMsQ0FBQyxDQUFDO01BQ3JCLENBQUM7TUFFRHlqQixlQUFlQSxDQUFDempCLElBQUksRUFBRTtRQUNwQixNQUFNLEdBQUdXLE9BQU8sQ0FBQyxHQUFHWCxJQUFJLElBQUksRUFBRTtRQUM5QixNQUFNMGpCLFVBQVUsR0FBRzFCLG1CQUFtQixDQUFDcmhCLE9BQU8sQ0FBQztRQUUvQyxJQUFJOUwsSUFBSSxHQUFHLElBQUk7UUFDZixJQUFJbUwsSUFBSSxDQUFDbkcsTUFBTSxHQUFHLENBQUMsRUFBRTtVQUNuQixPQUFPO1lBQUVpVixTQUFTLEVBQUVqYSxJQUFJLENBQUM0cEI7VUFBVyxDQUFDO1FBQ3ZDLENBQUMsTUFBTTtVQUNMamMsS0FBSyxDQUNIa2hCLFVBQVUsRUFDVnJkLEtBQUssQ0FBQ3NkLFFBQVEsQ0FDWnRkLEtBQUssQ0FBQzZCLGVBQWUsQ0FBQztZQUNwQi9PLFVBQVUsRUFBRWtOLEtBQUssQ0FBQ3NkLFFBQVEsQ0FBQ3RkLEtBQUssQ0FBQytCLEtBQUssQ0FBQzlULE1BQU0sRUFBRStLLFNBQVMsQ0FBQyxDQUFDO1lBQzFEaEcsSUFBSSxFQUFFZ04sS0FBSyxDQUFDc2QsUUFBUSxDQUNsQnRkLEtBQUssQ0FBQytCLEtBQUssQ0FBQzlULE1BQU0sRUFBRTJMLEtBQUssRUFBRWtJLFFBQVEsRUFBRTlJLFNBQVMsQ0FDaEQsQ0FBQztZQUNEOEgsS0FBSyxFQUFFZCxLQUFLLENBQUNzZCxRQUFRLENBQUN0ZCxLQUFLLENBQUMrQixLQUFLLENBQUN3YixNQUFNLEVBQUV2a0IsU0FBUyxDQUFDLENBQUM7WUFDckQ4USxJQUFJLEVBQUU5SixLQUFLLENBQUNzZCxRQUFRLENBQUN0ZCxLQUFLLENBQUMrQixLQUFLLENBQUN3YixNQUFNLEVBQUV2a0IsU0FBUyxDQUFDO1VBQ3JELENBQUMsQ0FDSCxDQUNGLENBQUM7VUFFRCxPQUFBdEssYUFBQTtZQUNFK1osU0FBUyxFQUFFamEsSUFBSSxDQUFDNHBCO1VBQVUsR0FDdkJpRixVQUFVO1FBRWpCO01BQ0Y7SUFDRixDQUFDLENBQUM7SUFFRnB2QixNQUFNLENBQUNDLE1BQU0sQ0FBQytjLEtBQUssQ0FBQ3FCLFVBQVUsRUFBRTtNQUM5QixNQUFNbU4sY0FBY0EsQ0FBQ3RSLE1BQU0sRUFBRXVSLEdBQUcsRUFBRWhzQixVQUFVLEVBQUU7UUFDNUMsSUFBSWdvQixhQUFhLEdBQUcsTUFBTXZOLE1BQU0sQ0FBQzRSLGNBQWMsQ0FDM0M7VUFDRWxXLEtBQUssRUFBRSxTQUFBQSxDQUFTN1YsRUFBRSxFQUFFeU4sTUFBTSxFQUFFO1lBQzFCaWUsR0FBRyxDQUFDN1YsS0FBSyxDQUFDblcsVUFBVSxFQUFFTSxFQUFFLEVBQUV5TixNQUFNLENBQUM7VUFDbkMsQ0FBQztVQUNEdUosT0FBTyxFQUFFLFNBQUFBLENBQVNoWCxFQUFFLEVBQUV5TixNQUFNLEVBQUU7WUFDNUJpZSxHQUFHLENBQUMxVSxPQUFPLENBQUN0WCxVQUFVLEVBQUVNLEVBQUUsRUFBRXlOLE1BQU0sQ0FBQztVQUNyQyxDQUFDO1VBQ0QySSxPQUFPLEVBQUUsU0FBQUEsQ0FBU3BXLEVBQUUsRUFBRTtZQUNwQjByQixHQUFHLENBQUN0VixPQUFPLENBQUMxVyxVQUFVLEVBQUVNLEVBQUUsQ0FBQztVQUM3QjtRQUNGLENBQUM7UUFDRDtRQUNBO1FBQ0E7VUFBRWtOLG9CQUFvQixFQUFFO1FBQUssQ0FDakMsQ0FBQzs7UUFFRDtRQUNBOztRQUVBO1FBQ0F3ZSxHQUFHLENBQUNuaEIsTUFBTSxDQUFDLGtCQUFpQjtVQUMxQixPQUFPLE1BQU1tZCxhQUFhLENBQUNyb0IsSUFBSSxDQUFDLENBQUM7UUFDbkMsQ0FBQyxDQUFDOztRQUVGO1FBQ0EsT0FBT3FvQixhQUFhO01BQ3RCLENBQUM7TUFFRDtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0FuSixnQkFBZ0JBLENBQUN4ZSxRQUFRLEVBQXVCO1FBQUEsSUFBckI7VUFBRXl2QjtRQUFXLENBQUMsR0FBQTlqQixTQUFBLENBQUFsRyxNQUFBLFFBQUFrRyxTQUFBLFFBQUFWLFNBQUEsR0FBQVUsU0FBQSxNQUFHLENBQUMsQ0FBQztRQUM1QztRQUNBLElBQUk3TCxlQUFlLENBQUM0dkIsYUFBYSxDQUFDMXZCLFFBQVEsQ0FBQyxFQUFFQSxRQUFRLEdBQUc7VUFBRXFKLEdBQUcsRUFBRXJKO1FBQVMsQ0FBQztRQUV6RSxJQUFJNkwsS0FBSyxDQUFDb1IsT0FBTyxDQUFDamQsUUFBUSxDQUFDLEVBQUU7VUFDM0I7VUFDQTtVQUNBLE1BQU0sSUFBSWtFLEtBQUssQ0FBQyxtQ0FBbUMsQ0FBQztRQUN0RDtRQUVBLElBQUksQ0FBQ2xFLFFBQVEsSUFBSyxLQUFLLElBQUlBLFFBQVEsSUFBSSxDQUFDQSxRQUFRLENBQUNxSixHQUFJLEVBQUU7VUFDckQ7VUFDQSxPQUFPO1lBQUVBLEdBQUcsRUFBRW9tQixVQUFVLElBQUlFLE1BQU0sQ0FBQzF2QixFQUFFLENBQUM7VUFBRSxDQUFDO1FBQzNDO1FBRUEsT0FBT0QsUUFBUTtNQUNqQjtJQUNGLENBQUMsQ0FBQztJQUVGRSxNQUFNLENBQUNDLE1BQU0sQ0FBQytjLEtBQUssQ0FBQ3FCLFVBQVUsQ0FBQzNmLFNBQVMsRUFBRTJ2QixrQkFBa0IsRUFBRVQsV0FBVyxFQUFFRCxZQUFZLEVBQUVFLFlBQVksQ0FBQztJQUV0Rzd0QixNQUFNLENBQUNDLE1BQU0sQ0FBQytjLEtBQUssQ0FBQ3FCLFVBQVUsQ0FBQzNmLFNBQVMsRUFBRTtNQUN4QztNQUNBO01BQ0FneEIsbUJBQW1CQSxDQUFBLEVBQUc7UUFDcEI7UUFDQSxPQUFPLElBQUksQ0FBQ2YsV0FBVyxJQUFJLElBQUksQ0FBQ0EsV0FBVyxLQUFLdHdCLE1BQU0sQ0FBQ3N4QixNQUFNO01BQy9ELENBQUM7TUFFRCxNQUFNck4sbUJBQW1CQSxDQUFBLEVBQUc7UUFDMUIsSUFBSS9oQixJQUFJLEdBQUcsSUFBSTtRQUNmLElBQUksQ0FBQ0EsSUFBSSxDQUFDc3VCLFdBQVcsQ0FBQ3ZNLG1CQUFtQixFQUN2QyxNQUFNLElBQUl0ZSxLQUFLLENBQUMseURBQXlELENBQUM7UUFDN0UsTUFBTXpELElBQUksQ0FBQ3N1QixXQUFXLENBQUN2TSxtQkFBbUIsQ0FBQyxDQUFDO01BQzdDLENBQUM7TUFFRCxNQUFNeEIsMkJBQTJCQSxDQUFDQyxRQUFRLEVBQUVDLFlBQVksRUFBRTtRQUN4RCxJQUFJemdCLElBQUksR0FBRyxJQUFJO1FBQ2YsSUFBSSxFQUFFLE1BQU1BLElBQUksQ0FBQ3N1QixXQUFXLENBQUMvTiwyQkFBMkIsR0FDdEQsTUFBTSxJQUFJOWMsS0FBSyxDQUNiLGlFQUNGLENBQUM7UUFDSCxNQUFNekQsSUFBSSxDQUFDc3VCLFdBQVcsQ0FBQy9OLDJCQUEyQixDQUFDQyxRQUFRLEVBQUVDLFlBQVksQ0FBQztNQUM1RSxDQUFDO01BRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BQ0VILGFBQWFBLENBQUEsRUFBRztRQUNkLElBQUl0Z0IsSUFBSSxHQUFHLElBQUk7UUFDZixJQUFJLENBQUNBLElBQUksQ0FBQ3N1QixXQUFXLENBQUNoTyxhQUFhLEVBQUU7VUFDbkMsTUFBTSxJQUFJN2MsS0FBSyxDQUFDLG1EQUFtRCxDQUFDO1FBQ3RFO1FBQ0EsT0FBT3pELElBQUksQ0FBQ3N1QixXQUFXLENBQUNoTyxhQUFhLENBQUMsQ0FBQztNQUN6QyxDQUFDO01BRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BQ0UrTyxXQUFXQSxDQUFBLEVBQUc7UUFDWixJQUFJcnZCLElBQUksR0FBRyxJQUFJO1FBQ2YsSUFBSSxFQUFFQSxJQUFJLENBQUNxdUIsT0FBTyxDQUFDbG5CLEtBQUssSUFBSW5ILElBQUksQ0FBQ3F1QixPQUFPLENBQUNsbkIsS0FBSyxDQUFDWCxFQUFFLENBQUMsRUFBRTtVQUNsRCxNQUFNLElBQUkvQyxLQUFLLENBQUMsaURBQWlELENBQUM7UUFDcEU7UUFDQSxPQUFPekQsSUFBSSxDQUFDcXVCLE9BQU8sQ0FBQ2xuQixLQUFLLENBQUNYLEVBQUU7TUFDOUI7SUFDRixDQUFDLENBQUM7SUFFRi9HLE1BQU0sQ0FBQ0MsTUFBTSxDQUFDK2MsS0FBSyxFQUFFO01BQ25CO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRTZTLGFBQWFBLENBQUNyVyxJQUFJLEVBQUU7UUFDbEIsT0FBTyxJQUFJLENBQUN5VixZQUFZLENBQUNoeEIsR0FBRyxDQUFDdWIsSUFBSSxDQUFDO01BQ3BDLENBQUM7TUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRXlWLFlBQVksRUFBRSxJQUFJamhCLEdBQUcsQ0FBQztJQUN4QixDQUFDLENBQUM7O0lBSUY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0FnUCxLQUFLLENBQUNDLFFBQVEsR0FBRzZTLE9BQU8sQ0FBQzdTLFFBQVE7O0lBRWpDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQUQsS0FBSyxDQUFDaEwsTUFBTSxHQUFHcFMsZUFBZSxDQUFDb1MsTUFBTTs7SUFFckM7QUFDQTtBQUNBO0lBQ0FnTCxLQUFLLENBQUNxQixVQUFVLENBQUNyTSxNQUFNLEdBQUdnTCxLQUFLLENBQUNoTCxNQUFNOztJQUV0QztBQUNBO0FBQ0E7SUFDQWdMLEtBQUssQ0FBQ3FCLFVBQVUsQ0FBQ3BCLFFBQVEsR0FBR0QsS0FBSyxDQUFDQyxRQUFROztJQUUxQztBQUNBO0FBQ0E7SUFDQTVlLE1BQU0sQ0FBQ2dnQixVQUFVLEdBQUdyQixLQUFLLENBQUNxQixVQUFVOztJQUVwQztJQUNBcmUsTUFBTSxDQUFDQyxNQUFNLENBQUMrYyxLQUFLLENBQUNxQixVQUFVLENBQUMzZixTQUFTLEVBQUVxeEIsU0FBUyxDQUFDQyxtQkFBbUIsQ0FBQztJQUFDM3ZCLHNCQUFBO0VBQUEsU0FBQUMsV0FBQTtJQUFBLE9BQUFELHNCQUFBLENBQUFDLFdBQUE7RUFBQTtFQUFBRCxzQkFBQTtBQUFBO0VBQUFFLElBQUE7RUFBQUMsS0FBQTtBQUFBLEc7Ozs7Ozs7Ozs7Ozs7O0lDMVF6RSxJQUFJQyxhQUFhO0lBQUMzQyxNQUFNLENBQUNiLElBQUksQ0FBQyxzQ0FBc0MsRUFBQztNQUFDeUQsT0FBT0EsQ0FBQ3hELENBQUMsRUFBQztRQUFDdUQsYUFBYSxHQUFDdkQsQ0FBQztNQUFBO0lBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUFDLElBQUlJLG9CQUFvQixDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU1BLG9CQUFvQixDQUFDLENBQUMsRUFBRSxDQUFDO0lBQWxLUSxNQUFNLENBQUNqQixNQUFNLENBQUM7TUFBQ2l4QixhQUFhLEVBQUNBLENBQUEsS0FBSUEsYUFBYTtNQUFDRyxlQUFlLEVBQUNBLENBQUEsS0FBSUEsZUFBZTtNQUFDQyxXQUFXLEVBQUNBLENBQUEsS0FBSUEsV0FBVztNQUFDRixnQkFBZ0IsRUFBQ0EsQ0FBQSxLQUFJQSxnQkFBZ0I7TUFBQ0csb0JBQW9CLEVBQUNBLENBQUEsS0FBSUEsb0JBQW9CO01BQUNDLHNCQUFzQixFQUFDQSxDQUFBLEtBQUlBLHNCQUFzQjtNQUFDTCxnQkFBZ0IsRUFBQ0EsQ0FBQSxLQUFJQTtJQUFnQixDQUFDLENBQUM7SUFBclIsTUFBTUQsYUFBYSxHQUFHO01BQzNCbUMsS0FBS0EsQ0FBQ3pXLElBQUksRUFBRTtRQUNWLE9BQU8sWUFBVztVQUNoQixNQUFNMFcsR0FBRyxHQUFHMVcsSUFBSSxHQUFHMlcsR0FBRyxDQUFDQyxZQUFZLENBQUMsY0FBYyxHQUFHNVcsSUFBSSxDQUFDLEdBQUdpVyxNQUFNLENBQUNZLFFBQVE7VUFDNUUsT0FBTyxJQUFJclQsS0FBSyxDQUFDQyxRQUFRLENBQUNpVCxHQUFHLENBQUNJLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM5QyxDQUFDO01BQ0gsQ0FBQztNQUNEQyxNQUFNQSxDQUFDL1csSUFBSSxFQUFFO1FBQ1gsT0FBTyxZQUFXO1VBQ2hCLE1BQU0wVyxHQUFHLEdBQUcxVyxJQUFJLEdBQUcyVyxHQUFHLENBQUNDLFlBQVksQ0FBQyxjQUFjLEdBQUc1VyxJQUFJLENBQUMsR0FBR2lXLE1BQU0sQ0FBQ1ksUUFBUTtVQUM1RSxPQUFPSCxHQUFHLENBQUNud0IsRUFBRSxDQUFDLENBQUM7UUFDakIsQ0FBQztNQUNIO0lBQ0YsQ0FBQztJQUVNLFNBQVNrdUIsZUFBZUEsQ0FBQ3pVLElBQUksRUFBRW5OLE9BQU8sRUFBRTtNQUM3QyxJQUFJLENBQUNtTixJQUFJLElBQUluTixPQUFPLENBQUNta0IsVUFBVSxLQUFLLElBQUksRUFBRSxPQUFPLElBQUk7TUFDckQsSUFBSW5rQixPQUFPLENBQUNta0IsVUFBVSxFQUFFLE9BQU9ua0IsT0FBTyxDQUFDbWtCLFVBQVU7TUFDakQsT0FBT255QixNQUFNLENBQUNveUIsUUFBUSxHQUFHcHlCLE1BQU0sQ0FBQ215QixVQUFVLEdBQUdueUIsTUFBTSxDQUFDc3hCLE1BQU07SUFDNUQ7SUFFTyxTQUFTekIsV0FBV0EsQ0FBQzFVLElBQUksRUFBRWdYLFVBQVUsRUFBRW5rQixPQUFPLEVBQUU7TUFDckQsSUFBSUEsT0FBTyxDQUFDdWlCLE9BQU8sRUFBRSxPQUFPdmlCLE9BQU8sQ0FBQ3VpQixPQUFPO01BRTNDLElBQUlwVixJQUFJLElBQ05nWCxVQUFVLEtBQUtueUIsTUFBTSxDQUFDc3hCLE1BQU0sSUFDNUIsT0FBT3B5QixjQUFjLEtBQUssV0FBVyxJQUNyQ0EsY0FBYyxDQUFDNnZCLDZCQUE2QixFQUFFO1FBQzlDLE9BQU83dkIsY0FBYyxDQUFDNnZCLDZCQUE2QixDQUFDLENBQUM7TUFDdkQ7TUFFQSxNQUFNO1FBQUVmO01BQXNCLENBQUMsR0FBR2xtQixPQUFPLENBQUMsK0JBQStCLENBQUM7TUFDMUUsT0FBT2ttQixxQkFBcUI7SUFDOUI7SUFFTyxTQUFTMkIsZ0JBQWdCQSxDQUFDdnVCLFVBQVUsRUFBRStaLElBQUksRUFBRW5OLE9BQU8sRUFBRTtNQUMxRCxJQUFJckIsT0FBTyxDQUFDMGxCLFdBQVcsSUFDckIsQ0FBQ3JrQixPQUFPLENBQUNza0IsbUJBQW1CLElBQzVCbHhCLFVBQVUsQ0FBQ2t2QixXQUFXLElBQ3RCbHZCLFVBQVUsQ0FBQ2t2QixXQUFXLENBQUNpQyxPQUFPLEVBQUU7UUFDaENueEIsVUFBVSxDQUFDa3ZCLFdBQVcsQ0FBQ2lDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsTUFBTW54QixVQUFVLENBQUM0a0IsSUFBSSxDQUFDLENBQUMsRUFBRTtVQUM1RHdNLE9BQU8sRUFBRTtRQUNYLENBQUMsQ0FBQztNQUNKO0lBQ0Y7SUFFTyxTQUFTMUMsb0JBQW9CQSxDQUFDMXVCLFVBQVUsRUFBRStaLElBQUksRUFBRW5OLE9BQU8sRUFBRTtNQUM5RCxJQUFJQSxPQUFPLENBQUN5a0IscUJBQXFCLEtBQUssS0FBSyxFQUFFO01BRTdDLElBQUk7UUFDRnJ4QixVQUFVLENBQUNzeEIsc0JBQXNCLENBQUM7VUFDaENDLFdBQVcsRUFBRTNrQixPQUFPLENBQUM0a0Isc0JBQXNCLEtBQUs7UUFDbEQsQ0FBQyxDQUFDO01BQ0osQ0FBQyxDQUFDLE9BQU9uckIsS0FBSyxFQUFFO1FBQ2QsSUFBSUEsS0FBSyxDQUFDMEwsT0FBTyx5QkFBQXRKLE1BQUEsQ0FBeUJzUixJQUFJLHFDQUFrQyxFQUFFO1VBQ2hGLE1BQU0sSUFBSXhWLEtBQUssMENBQUFrRSxNQUFBLENBQXlDc1IsSUFBSSxPQUFHLENBQUM7UUFDbEU7UUFDQSxNQUFNMVQsS0FBSztNQUNiO0lBQ0Y7SUFFTyxTQUFTc29CLHNCQUFzQkEsQ0FBQzVVLElBQUksRUFBRTtNQUMzQyxJQUFJLENBQUNBLElBQUksSUFBSUEsSUFBSSxLQUFLLElBQUksRUFBRTtRQUMxQm5iLE1BQU0sQ0FBQ2dHLE1BQU0sQ0FDWCx5REFBeUQsR0FDekQseURBQXlELEdBQ3pELGdEQUNGLENBQUM7UUFDRG1WLElBQUksR0FBRyxJQUFJO01BQ2I7TUFFQSxJQUFJQSxJQUFJLEtBQUssSUFBSSxJQUFJLE9BQU9BLElBQUksS0FBSyxRQUFRLEVBQUU7UUFDN0MsTUFBTSxJQUFJeFYsS0FBSyxDQUNiLGlFQUNGLENBQUM7TUFDSDtNQUVBLE9BQU93VixJQUFJO0lBQ2I7SUFFTyxTQUFTdVUsZ0JBQWdCQSxDQUFDMWhCLE9BQU8sRUFBRTtNQUN4QyxJQUFJQSxPQUFPLElBQUlBLE9BQU8sQ0FBQzZrQixPQUFPLEVBQUU7UUFDOUI7UUFDQTdrQixPQUFPLEdBQUc7VUFBRW1rQixVQUFVLEVBQUVua0I7UUFBUSxDQUFDO01BQ25DO01BQ0E7TUFDQSxJQUFJQSxPQUFPLElBQUlBLE9BQU8sQ0FBQzhrQixPQUFPLElBQUksQ0FBQzlrQixPQUFPLENBQUNta0IsVUFBVSxFQUFFO1FBQ3JEbmtCLE9BQU8sQ0FBQ21rQixVQUFVLEdBQUdua0IsT0FBTyxDQUFDOGtCLE9BQU87TUFDdEM7TUFFQSxPQUFBMXdCLGFBQUE7UUFDRSt2QixVQUFVLEVBQUV6bEIsU0FBUztRQUNyQjBqQixZQUFZLEVBQUUsUUFBUTtRQUN0QmpVLFNBQVMsRUFBRSxJQUFJO1FBQ2ZvVSxPQUFPLEVBQUU3akIsU0FBUztRQUNsQjRsQixtQkFBbUIsRUFBRTtNQUFLLEdBQ3ZCdGtCLE9BQU87SUFFZDtJQUFDaE0sc0JBQUE7RUFBQSxTQUFBQyxXQUFBO0lBQUEsT0FBQUQsc0JBQUEsQ0FBQUMsV0FBQTtFQUFBO0VBQUFELHNCQUFBO0FBQUE7RUFBQUUsSUFBQTtFQUFBQyxLQUFBO0FBQUEsRzs7Ozs7Ozs7Ozs7Ozs7SUNsR0QsSUFBSUMsYUFBYTtJQUFDM0MsTUFBTSxDQUFDYixJQUFJLENBQUMsc0NBQXNDLEVBQUM7TUFBQ3lELE9BQU9BLENBQUN4RCxDQUFDLEVBQUM7UUFBQ3VELGFBQWEsR0FBQ3ZELENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJSSxvQkFBb0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNQSxvQkFBb0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUFsS1EsTUFBTSxDQUFDakIsTUFBTSxDQUFDO01BQUM4d0IsWUFBWSxFQUFDQSxDQUFBLEtBQUlBO0lBQVksQ0FBQyxDQUFDO0lBQXZDLE1BQU1BLFlBQVksR0FBRztNQUMxQjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtNQUNFL29CLFlBQVlBLENBQUEsRUFBVTtRQUFBLFNBQUE0RyxJQUFBLEdBQUFDLFNBQUEsQ0FBQWxHLE1BQUEsRUFBTm1HLElBQUksT0FBQUMsS0FBQSxDQUFBSCxJQUFBLEdBQUFJLElBQUEsTUFBQUEsSUFBQSxHQUFBSixJQUFBLEVBQUFJLElBQUE7VUFBSkYsSUFBSSxDQUFBRSxJQUFBLElBQUFILFNBQUEsQ0FBQUcsSUFBQTtRQUFBO1FBQ2xCLE9BQU8sSUFBSSxDQUFDaWpCLFdBQVcsQ0FBQ2pxQixZQUFZLENBQ2xDLElBQUksQ0FBQ3NxQixnQkFBZ0IsQ0FBQ3hqQixJQUFJLENBQUMsRUFDM0IsSUFBSSxDQUFDeWpCLGVBQWUsQ0FBQ3pqQixJQUFJLENBQzNCLENBQUM7TUFDSCxDQUFDO01BRUQwbEIsWUFBWUEsQ0FBQzlvQixHQUFHLEVBQWdCO1FBQUEsSUFBZCtELE9BQU8sR0FBQVosU0FBQSxDQUFBbEcsTUFBQSxRQUFBa0csU0FBQSxRQUFBVixTQUFBLEdBQUFVLFNBQUEsTUFBRyxDQUFDLENBQUM7UUFDNUI7UUFDQSxJQUFJLENBQUNuRCxHQUFHLEVBQUU7VUFDUixNQUFNLElBQUl0RSxLQUFLLENBQUMsNkJBQTZCLENBQUM7UUFDaEQ7O1FBRUE7UUFDQXNFLEdBQUcsR0FBR3RJLE1BQU0sQ0FBQ3VzQixNQUFNLENBQ2pCdnNCLE1BQU0sQ0FBQ3F4QixjQUFjLENBQUMvb0IsR0FBRyxDQUFDLEVBQzFCdEksTUFBTSxDQUFDc3hCLHlCQUF5QixDQUFDaHBCLEdBQUcsQ0FDdEMsQ0FBQztRQUVELElBQUksS0FBSyxJQUFJQSxHQUFHLEVBQUU7VUFDaEIsSUFDRSxDQUFDQSxHQUFHLENBQUNhLEdBQUcsSUFDUixFQUFFLE9BQU9iLEdBQUcsQ0FBQ2EsR0FBRyxLQUFLLFFBQVEsSUFBSWIsR0FBRyxDQUFDYSxHQUFHLFlBQVk2VCxLQUFLLENBQUNDLFFBQVEsQ0FBQyxFQUNuRTtZQUNBLE1BQU0sSUFBSWpaLEtBQUssQ0FDYiwwRUFDRixDQUFDO1VBQ0g7UUFDRixDQUFDLE1BQU07VUFDTCxJQUFJdXRCLFVBQVUsR0FBRyxJQUFJOztVQUVyQjtVQUNBO1VBQ0E7VUFDQSxJQUFJLElBQUksQ0FBQzdCLG1CQUFtQixDQUFDLENBQUMsRUFBRTtZQUM5QixNQUFNOEIsU0FBUyxHQUFHckIsR0FBRyxDQUFDc0Isd0JBQXdCLENBQUN4ekIsR0FBRyxDQUFDLENBQUM7WUFDcEQsSUFBSSxDQUFDdXpCLFNBQVMsRUFBRTtjQUNkRCxVQUFVLEdBQUcsS0FBSztZQUNwQjtVQUNGO1VBRUEsSUFBSUEsVUFBVSxFQUFFO1lBQ2RqcEIsR0FBRyxDQUFDYSxHQUFHLEdBQUcsSUFBSSxDQUFDcWxCLFVBQVUsQ0FBQyxDQUFDO1VBQzdCO1FBQ0Y7O1FBRUE7UUFDQTtRQUNBLElBQUlrRCxxQ0FBcUMsR0FBRyxTQUFBQSxDQUFTNVosTUFBTSxFQUFFO1VBQzNELElBQUl6WixNQUFNLENBQUNzekIsVUFBVSxDQUFDN1osTUFBTSxDQUFDLEVBQUUsT0FBT0EsTUFBTTtVQUU1QyxJQUFJeFAsR0FBRyxDQUFDYSxHQUFHLEVBQUU7WUFDWCxPQUFPYixHQUFHLENBQUNhLEdBQUc7VUFDaEI7O1VBRUE7VUFDQTtVQUNBO1VBQ0FiLEdBQUcsQ0FBQ2EsR0FBRyxHQUFHMk8sTUFBTTtVQUVoQixPQUFPQSxNQUFNO1FBQ2YsQ0FBQztRQUVELElBQUksSUFBSSxDQUFDNFgsbUJBQW1CLENBQUMsQ0FBQyxFQUFFO1VBQzlCLE1BQU1qaUIsT0FBTyxHQUFHLElBQUksQ0FBQ21rQix1QkFBdUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQ3RwQixHQUFHLENBQUMsRUFBRStELE9BQU8sQ0FBQztVQUMzRW9CLE9BQU8sQ0FBQ3JDLElBQUksQ0FBQ3NtQixxQ0FBcUMsQ0FBQztVQUNuRGprQixPQUFPLENBQUNva0IsV0FBVyxHQUFHcGtCLE9BQU8sQ0FBQ29rQixXQUFXLENBQUN6bUIsSUFBSSxDQUFDc21CLHFDQUFxQyxDQUFDO1VBQ3JGamtCLE9BQU8sQ0FBQ3FrQixhQUFhLEdBQUdya0IsT0FBTyxDQUFDcWtCLGFBQWEsQ0FBQzFtQixJQUFJLENBQUNzbUIscUNBQXFDLENBQUM7VUFDekYsT0FBT2prQixPQUFPO1FBQ2hCOztRQUVBO1FBQ0E7UUFDQSxPQUFPLElBQUksQ0FBQ29oQixXQUFXLENBQUN4TixXQUFXLENBQUMvWSxHQUFHLENBQUMsQ0FDckM4QyxJQUFJLENBQUNzbUIscUNBQXFDLENBQUM7TUFDaEQsQ0FBQztNQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRXJRLFdBQVdBLENBQUMvWSxHQUFHLEVBQUUrRCxPQUFPLEVBQUU7UUFDeEIsT0FBTyxJQUFJLENBQUMra0IsWUFBWSxDQUFDOW9CLEdBQUcsRUFBRStELE9BQU8sQ0FBQztNQUN4QyxDQUFDO01BR0Q7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRW9XLFdBQVdBLENBQUMzaUIsUUFBUSxFQUFFbWMsUUFBUSxFQUF5QjtRQUVyRDtRQUNBO1FBQ0EsTUFBTTVQLE9BQU8sR0FBQTVMLGFBQUEsS0FBUyxDQUFBZ0wsU0FBQSxDQUFBbEcsTUFBQSxRQUFBd0YsU0FBQSxHQUFBVSxTQUFBLFFBQXlCLElBQUksQ0FBRztRQUN0RCxJQUFJb1csVUFBVTtRQUNkLElBQUl4VixPQUFPLElBQUlBLE9BQU8sQ0FBQ3dXLE1BQU0sRUFBRTtVQUM3QjtVQUNBLElBQUl4VyxPQUFPLENBQUN3VixVQUFVLEVBQUU7WUFDdEIsSUFDRSxFQUNFLE9BQU94VixPQUFPLENBQUN3VixVQUFVLEtBQUssUUFBUSxJQUN0Q3hWLE9BQU8sQ0FBQ3dWLFVBQVUsWUFBWTdFLEtBQUssQ0FBQ0MsUUFBUSxDQUM3QyxFQUVELE1BQU0sSUFBSWpaLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQztZQUMxRDZkLFVBQVUsR0FBR3hWLE9BQU8sQ0FBQ3dWLFVBQVU7VUFDakMsQ0FBQyxNQUFNLElBQUksQ0FBQy9oQixRQUFRLElBQUksQ0FBQ0EsUUFBUSxDQUFDcUosR0FBRyxFQUFFO1lBQ3JDMFksVUFBVSxHQUFHLElBQUksQ0FBQzJNLFVBQVUsQ0FBQyxDQUFDO1lBQzlCbmlCLE9BQU8sQ0FBQ2tYLFdBQVcsR0FBRyxJQUFJO1lBQzFCbFgsT0FBTyxDQUFDd1YsVUFBVSxHQUFHQSxVQUFVO1VBQ2pDO1FBQ0Y7UUFFQS9oQixRQUFRLEdBQUdrZCxLQUFLLENBQUNxQixVQUFVLENBQUNDLGdCQUFnQixDQUFDeGUsUUFBUSxFQUFFO1VBQ3JEeXZCLFVBQVUsRUFBRTFOO1FBQ2QsQ0FBQyxDQUFDO1FBRUYsSUFBSSxJQUFJLENBQUM2TixtQkFBbUIsQ0FBQyxDQUFDLEVBQUU7VUFDOUIsTUFBTWhrQixJQUFJLEdBQUcsQ0FBQzVMLFFBQVEsRUFBRW1jLFFBQVEsRUFBRTVQLE9BQU8sQ0FBQztVQUUxQyxPQUFPLElBQUksQ0FBQ3VsQix1QkFBdUIsQ0FBQyxhQUFhLEVBQUVsbUIsSUFBSSxFQUFFVyxPQUFPLENBQUM7UUFDbkU7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQSxPQUFPLElBQUksQ0FBQ3dpQixXQUFXLENBQUNwTSxXQUFXLENBQ2pDM2lCLFFBQVEsRUFDUm1jLFFBQVEsRUFDUjVQLE9BQ0YsQ0FBQztNQUNILENBQUM7TUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BQ0U0VixXQUFXQSxDQUFDbmlCLFFBQVEsRUFBZ0I7UUFBQSxJQUFkdU0sT0FBTyxHQUFBWixTQUFBLENBQUFsRyxNQUFBLFFBQUFrRyxTQUFBLFFBQUFWLFNBQUEsR0FBQVUsU0FBQSxNQUFHLENBQUMsQ0FBQztRQUNoQzNMLFFBQVEsR0FBR2tkLEtBQUssQ0FBQ3FCLFVBQVUsQ0FBQ0MsZ0JBQWdCLENBQUN4ZSxRQUFRLENBQUM7UUFFdEQsSUFBSSxJQUFJLENBQUM0dkIsbUJBQW1CLENBQUMsQ0FBQyxFQUFFO1VBQzlCLE9BQU8sSUFBSSxDQUFDa0MsdUJBQXVCLENBQUMsYUFBYSxFQUFFLENBQUM5eEIsUUFBUSxDQUFDLEVBQUV1TSxPQUFPLENBQUM7UUFDekU7O1FBRUE7UUFDQTtRQUNBLE9BQU8sSUFBSSxDQUFDd2lCLFdBQVcsQ0FBQzVNLFdBQVcsQ0FBQ25pQixRQUFRLENBQUM7TUFDL0MsQ0FBQztNQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRSxNQUFNc2tCLFdBQVdBLENBQUN0a0IsUUFBUSxFQUFFbWMsUUFBUSxFQUFFNVAsT0FBTyxFQUFFO1FBQzdDLE9BQU8sSUFBSSxDQUFDb1csV0FBVyxDQUNyQjNpQixRQUFRLEVBQ1JtYyxRQUFRLEVBQUF4YixhQUFBLENBQUFBLGFBQUEsS0FFSDRMLE9BQU87VUFDVm9YLGFBQWEsRUFBRSxJQUFJO1VBQ25CWixNQUFNLEVBQUU7UUFBSSxFQUNiLENBQUM7TUFDTixDQUFDO01BRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRTRCLGNBQWNBLENBQUEsRUFBVTtRQUN0QixPQUFPLElBQUksQ0FBQ29LLFdBQVcsQ0FBQ3BLLGNBQWMsQ0FBQyxHQUFBaFosU0FBTyxDQUFDO01BQ2pELENBQUM7TUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRWtaLHNCQUFzQkEsQ0FBQSxFQUFVO1FBQzlCLE9BQU8sSUFBSSxDQUFDa0ssV0FBVyxDQUFDbEssc0JBQXNCLENBQUMsR0FBQWxaLFNBQU8sQ0FBQztNQUN6RDtJQUNGLENBQUM7SUFBQXBMLHNCQUFBO0VBQUEsU0FBQUMsV0FBQTtJQUFBLE9BQUFELHNCQUFBLENBQUFDLFdBQUE7RUFBQTtFQUFBRCxzQkFBQTtBQUFBO0VBQUFFLElBQUE7RUFBQUMsS0FBQTtBQUFBLEc7Ozs7Ozs7Ozs7O0FDM09EMUMsTUFBTSxDQUFDakIsTUFBTSxDQUFDO0VBQUNneEIsWUFBWSxFQUFDQSxDQUFBLEtBQUlBO0FBQVksQ0FBQyxDQUFDO0FBQXZDLE1BQU1BLFlBQVksR0FBRztFQUMxQjtFQUNBO0VBQ0E7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDRSxNQUFNL0ksZ0JBQWdCQSxDQUFDUCxLQUFLLEVBQUVsWSxPQUFPLEVBQUU7SUFDckMsSUFBSTlMLElBQUksR0FBRyxJQUFJO0lBQ2YsSUFBSSxDQUFDQSxJQUFJLENBQUNzdUIsV0FBVyxDQUFDL0osZ0JBQWdCLElBQUksQ0FBQ3ZrQixJQUFJLENBQUNzdUIsV0FBVyxDQUFDdkssZ0JBQWdCLEVBQzFFLE1BQU0sSUFBSXRnQixLQUFLLENBQUMsc0RBQXNELENBQUM7SUFDekUsSUFBSXpELElBQUksQ0FBQ3N1QixXQUFXLENBQUN2SyxnQkFBZ0IsRUFBRTtNQUNyQyxNQUFNL2pCLElBQUksQ0FBQ3N1QixXQUFXLENBQUN2SyxnQkFBZ0IsQ0FBQ0MsS0FBSyxFQUFFbFksT0FBTyxDQUFDO0lBQ3pELENBQUMsTUFBTTtNQXRCWCxJQUFJMGxCLEdBQUc7TUFBQ2owQixNQUFNLENBQUNiLElBQUksQ0FBQyxnQkFBZ0IsRUFBQztRQUFDODBCLEdBQUdBLENBQUM3MEIsQ0FBQyxFQUFDO1VBQUM2MEIsR0FBRyxHQUFDNzBCLENBQUM7UUFBQTtNQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7TUF5QmpENjBCLEdBQUcsQ0FBQ0MsS0FBSyx1RkFBQTlwQixNQUFBLENBQXdGbUUsT0FBTyxhQUFQQSxPQUFPLGVBQVBBLE9BQU8sQ0FBRW1OLElBQUksb0JBQUF0UixNQUFBLENBQXFCbUUsT0FBTyxDQUFDbU4sSUFBSSxnQkFBQXRSLE1BQUEsQ0FBbUIvQyxJQUFJLENBQUNDLFNBQVMsQ0FBQ21mLEtBQUssQ0FBQyxDQUFHLENBQUcsQ0FBQztNQUM5TCxNQUFNaGtCLElBQUksQ0FBQ3N1QixXQUFXLENBQUMvSixnQkFBZ0IsQ0FBQ1AsS0FBSyxFQUFFbFksT0FBTyxDQUFDO0lBQ3pEO0VBQ0YsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFLE1BQU1pWSxnQkFBZ0JBLENBQUNDLEtBQUssRUFBRWxZLE9BQU8sRUFBRTtJQUNyQyxJQUFJOUwsSUFBSSxHQUFHLElBQUk7SUFDZixJQUFJLENBQUNBLElBQUksQ0FBQ3N1QixXQUFXLENBQUN2SyxnQkFBZ0IsRUFDcEMsTUFBTSxJQUFJdGdCLEtBQUssQ0FBQyxzREFBc0QsQ0FBQztJQUV6RSxJQUFJO01BQ0YsTUFBTXpELElBQUksQ0FBQ3N1QixXQUFXLENBQUN2SyxnQkFBZ0IsQ0FBQ0MsS0FBSyxFQUFFbFksT0FBTyxDQUFDO0lBQ3pELENBQUMsQ0FBQyxPQUFPcEgsQ0FBQyxFQUFFO01BQUEsSUFBQXVCLGdCQUFBLEVBQUFDLHFCQUFBLEVBQUFDLHNCQUFBO01BQ1YsSUFDRXpCLENBQUMsQ0FBQ3VNLE9BQU8sQ0FBQ29XLFFBQVEsQ0FDaEIsOEVBQ0YsQ0FBQyxLQUFBcGhCLGdCQUFBLEdBQ0RuSSxNQUFNLENBQUNtSixRQUFRLGNBQUFoQixnQkFBQSxnQkFBQUMscUJBQUEsR0FBZkQsZ0JBQUEsQ0FBaUJpQixRQUFRLGNBQUFoQixxQkFBQSxnQkFBQUMsc0JBQUEsR0FBekJELHFCQUFBLENBQTJCaUIsS0FBSyxjQUFBaEIsc0JBQUEsZUFBaENBLHNCQUFBLENBQWtDdXJCLDZCQUE2QixFQUMvRDtRQXZEUixJQUFJRixHQUFHO1FBQUNqMEIsTUFBTSxDQUFDYixJQUFJLENBQUMsZ0JBQWdCLEVBQUM7VUFBQzgwQixHQUFHQSxDQUFDNzBCLENBQUMsRUFBQztZQUFDNjBCLEdBQUcsR0FBQzcwQixDQUFDO1VBQUE7UUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO1FBMEQvQzYwQixHQUFHLENBQUNHLElBQUksc0JBQUFocUIsTUFBQSxDQUF1QnFjLEtBQUssV0FBQXJjLE1BQUEsQ0FBVTNILElBQUksQ0FBQ3V1QixLQUFLLDhCQUE0QixDQUFDO1FBQ3JGLE1BQU12dUIsSUFBSSxDQUFDc3VCLFdBQVcsQ0FBQzlKLGNBQWMsQ0FBQ1IsS0FBSyxDQUFDO1FBQzVDLE1BQU1oa0IsSUFBSSxDQUFDc3VCLFdBQVcsQ0FBQ3ZLLGdCQUFnQixDQUFDQyxLQUFLLEVBQUVsWSxPQUFPLENBQUM7TUFDekQsQ0FBQyxNQUFNO1FBQ0x4RyxPQUFPLENBQUNDLEtBQUssQ0FBQ2IsQ0FBQyxDQUFDO1FBQ2hCLE1BQU0sSUFBSTVHLE1BQU0sQ0FBQzJGLEtBQUssOERBQUFrRSxNQUFBLENBQThEM0gsSUFBSSxDQUFDdXVCLEtBQUssUUFBQTVtQixNQUFBLENBQU9qRCxDQUFDLENBQUN1TSxPQUFPLENBQUcsQ0FBQztNQUNwSDtJQUNGO0VBQ0YsQ0FBQztFQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNFZ1QsV0FBV0EsQ0FBQ0QsS0FBSyxFQUFFbFksT0FBTyxFQUFDO0lBQ3pCLE9BQU8sSUFBSSxDQUFDaVksZ0JBQWdCLENBQUNDLEtBQUssRUFBRWxZLE9BQU8sQ0FBQztFQUM5QyxDQUFDO0VBRUQsTUFBTTBZLGNBQWNBLENBQUNSLEtBQUssRUFBRTtJQUMxQixJQUFJaGtCLElBQUksR0FBRyxJQUFJO0lBQ2YsSUFBSSxDQUFDQSxJQUFJLENBQUNzdUIsV0FBVyxDQUFDOUosY0FBYyxFQUNsQyxNQUFNLElBQUkvZ0IsS0FBSyxDQUFDLG9EQUFvRCxDQUFDO0lBQ3ZFLE1BQU16RCxJQUFJLENBQUNzdUIsV0FBVyxDQUFDOUosY0FBYyxDQUFDUixLQUFLLENBQUM7RUFDOUM7QUFDRixDQUFDLEM7Ozs7Ozs7Ozs7Ozs7O0lDMUZELElBQUk5akIsYUFBYTtJQUFDM0MsTUFBTSxDQUFDYixJQUFJLENBQUMsc0NBQXNDLEVBQUM7TUFBQ3lELE9BQU9BLENBQUN4RCxDQUFDLEVBQUM7UUFBQ3VELGFBQWEsR0FBQ3ZELENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJSSxvQkFBb0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNQSxvQkFBb0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUFsS1EsTUFBTSxDQUFDakIsTUFBTSxDQUFDO01BQUN3eEIsa0JBQWtCLEVBQUNBLENBQUEsS0FBSUE7SUFBa0IsQ0FBQyxDQUFDO0lBQW5ELE1BQU1BLGtCQUFrQixHQUFHO01BQ2hDLE1BQU1XLHNCQUFzQkEsQ0FBQ3hWLElBQUksRUFBRTtRQUFBLElBQUEyWSxvQkFBQSxFQUFBQyxxQkFBQTtRQUNqQyxNQUFNN3hCLElBQUksR0FBRyxJQUFJO1FBQ2pCLElBQ0UsRUFDRUEsSUFBSSxDQUFDb3VCLFdBQVcsSUFDaEJwdUIsSUFBSSxDQUFDb3VCLFdBQVcsQ0FBQzBELG1CQUFtQixJQUNwQzl4QixJQUFJLENBQUNvdUIsV0FBVyxDQUFDMkQsbUJBQW1CLENBQ3JDLEVBQ0Q7VUFDQTtRQUNGO1FBR0EsTUFBTUMsa0JBQWtCLEdBQUc7VUFDekI7VUFDQTtVQUNBQyxhQUFhQSxDQUFBLEVBQUc7WUFDZGp5QixJQUFJLENBQUNzdUIsV0FBVyxDQUFDMkQsYUFBYSxDQUFDLENBQUM7VUFDbEMsQ0FBQztVQUNEQyxpQkFBaUJBLENBQUEsRUFBRztZQUNsQixPQUFPbHlCLElBQUksQ0FBQ3N1QixXQUFXLENBQUM0RCxpQkFBaUIsQ0FBQyxDQUFDO1VBQzdDLENBQUM7VUFDRDtVQUNBQyxjQUFjQSxDQUFBLEVBQUc7WUFDZixPQUFPbnlCLElBQUk7VUFDYjtRQUNGLENBQUM7UUFDRCxNQUFNb3lCLGtCQUFrQixHQUFBbHlCLGFBQUE7VUFDdEI7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQSxNQUFNbXlCLFdBQVdBLENBQUNDLFNBQVMsRUFBRUMsS0FBSyxFQUFFO1lBQ2xDO1lBQ0E7WUFDQTtZQUNBO1lBQ0E7WUFDQSxJQUFJRCxTQUFTLEdBQUcsQ0FBQyxJQUFJQyxLQUFLLEVBQUV2eUIsSUFBSSxDQUFDc3VCLFdBQVcsQ0FBQ2tFLGNBQWMsQ0FBQyxDQUFDO1lBRTdELElBQUlELEtBQUssRUFBRSxNQUFNdnlCLElBQUksQ0FBQ3N1QixXQUFXLENBQUMzWSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7VUFDOUMsQ0FBQztVQUVEO1VBQ0E7VUFDQThjLE1BQU1BLENBQUNDLEdBQUcsRUFBRTtZQUNWLElBQUlDLE9BQU8sR0FBR3BELE9BQU8sQ0FBQ3FELE9BQU8sQ0FBQ0YsR0FBRyxDQUFDbHpCLEVBQUUsQ0FBQztZQUNyQyxJQUFJdUksR0FBRyxHQUFHL0gsSUFBSSxDQUFDc3VCLFdBQVcsQ0FBQ3VFLEtBQUssQ0FBQ24xQixHQUFHLENBQUNpMUIsT0FBTyxDQUFDOztZQUU3QztZQUNBO1lBQ0E7WUFDQTs7WUFFQTtZQUNBOztZQUVBO1lBQ0E7WUFDQSxJQUFJNzBCLE1BQU0sQ0FBQ295QixRQUFRLEVBQUU7Y0FDbkIsSUFBSXdDLEdBQUcsQ0FBQ0EsR0FBRyxLQUFLLE9BQU8sSUFBSTNxQixHQUFHLEVBQUU7Z0JBQzlCMnFCLEdBQUcsQ0FBQ0EsR0FBRyxHQUFHLFNBQVM7Y0FDckIsQ0FBQyxNQUFNLElBQUlBLEdBQUcsQ0FBQ0EsR0FBRyxLQUFLLFNBQVMsSUFBSSxDQUFDM3FCLEdBQUcsRUFBRTtnQkFDeEM7Y0FDRixDQUFDLE1BQU0sSUFBSTJxQixHQUFHLENBQUNBLEdBQUcsS0FBSyxTQUFTLElBQUksQ0FBQzNxQixHQUFHLEVBQUU7Z0JBQ3hDMnFCLEdBQUcsQ0FBQ0EsR0FBRyxHQUFHLE9BQU87Z0JBQ2pCLE1BQU05b0IsSUFBSSxHQUFHOG9CLEdBQUcsQ0FBQ3psQixNQUFNO2dCQUN2QixLQUFLLElBQUk2TyxLQUFLLElBQUlsUyxJQUFJLEVBQUU7a0JBQ3RCLE1BQU1uQixLQUFLLEdBQUdtQixJQUFJLENBQUNrUyxLQUFLLENBQUM7a0JBQ3pCLElBQUlyVCxLQUFLLEtBQUssS0FBSyxDQUFDLEVBQUU7b0JBQ3BCLE9BQU9pcUIsR0FBRyxDQUFDemxCLE1BQU0sQ0FBQzZPLEtBQUssQ0FBQztrQkFDMUI7Z0JBQ0Y7Y0FDRjtZQUNGO1lBQ0E7WUFDQTtZQUNBO1lBQ0EsSUFBSTRXLEdBQUcsQ0FBQ0EsR0FBRyxLQUFLLFNBQVMsRUFBRTtjQUN6QixJQUFJclQsT0FBTyxHQUFHcVQsR0FBRyxDQUFDclQsT0FBTztjQUN6QixJQUFJLENBQUNBLE9BQU8sRUFBRTtnQkFDWixJQUFJdFgsR0FBRyxFQUFFL0gsSUFBSSxDQUFDc3VCLFdBQVcsQ0FBQzNZLE1BQU0sQ0FBQ2dkLE9BQU8sQ0FBQztjQUMzQyxDQUFDLE1BQU0sSUFBSSxDQUFDNXFCLEdBQUcsRUFBRTtnQkFDZi9ILElBQUksQ0FBQ3N1QixXQUFXLENBQUN3RSxNQUFNLENBQUN6VCxPQUFPLENBQUM7Y0FDbEMsQ0FBQyxNQUFNO2dCQUNMO2dCQUNBcmYsSUFBSSxDQUFDc3VCLFdBQVcsQ0FBQ21FLE1BQU0sQ0FBQ0UsT0FBTyxFQUFFdFQsT0FBTyxDQUFDO2NBQzNDO2NBQ0E7WUFDRixDQUFDLE1BQU0sSUFBSXFULEdBQUcsQ0FBQ0EsR0FBRyxLQUFLLE9BQU8sRUFBRTtjQUM5QixJQUFJM3FCLEdBQUcsRUFBRTtnQkFDUCxNQUFNLElBQUl0RSxLQUFLLENBQ2IsNERBQ0YsQ0FBQztjQUNIO2NBQ0F6RCxJQUFJLENBQUNzdUIsV0FBVyxDQUFDd0UsTUFBTSxDQUFBNXlCLGFBQUE7Z0JBQUcwSSxHQUFHLEVBQUUrcEI7Y0FBTyxHQUFLRCxHQUFHLENBQUN6bEIsTUFBTSxDQUFFLENBQUM7WUFDMUQsQ0FBQyxNQUFNLElBQUl5bEIsR0FBRyxDQUFDQSxHQUFHLEtBQUssU0FBUyxFQUFFO2NBQ2hDLElBQUksQ0FBQzNxQixHQUFHLEVBQ04sTUFBTSxJQUFJdEUsS0FBSyxDQUNiLHlEQUNGLENBQUM7Y0FDSHpELElBQUksQ0FBQ3N1QixXQUFXLENBQUMzWSxNQUFNLENBQUNnZCxPQUFPLENBQUM7WUFDbEMsQ0FBQyxNQUFNLElBQUlELEdBQUcsQ0FBQ0EsR0FBRyxLQUFLLFNBQVMsRUFBRTtjQUNoQyxJQUFJLENBQUMzcUIsR0FBRyxFQUFFLE1BQU0sSUFBSXRFLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQztjQUNsRSxNQUFNK0ksSUFBSSxHQUFHL00sTUFBTSxDQUFDK00sSUFBSSxDQUFDa21CLEdBQUcsQ0FBQ3psQixNQUFNLENBQUM7Y0FDcEMsSUFBSVQsSUFBSSxDQUFDeEgsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDbkIsSUFBSTBXLFFBQVEsR0FBRyxDQUFDLENBQUM7Z0JBQ2pCbFAsSUFBSSxDQUFDMU4sT0FBTyxDQUFDRyxHQUFHLElBQUk7a0JBQ2xCLE1BQU13SixLQUFLLEdBQUdpcUIsR0FBRyxDQUFDemxCLE1BQU0sQ0FBQ2hPLEdBQUcsQ0FBQztrQkFDN0IsSUFBSTBOLEtBQUssQ0FBQytJLE1BQU0sQ0FBQzNOLEdBQUcsQ0FBQzlJLEdBQUcsQ0FBQyxFQUFFd0osS0FBSyxDQUFDLEVBQUU7b0JBQ2pDO2tCQUNGO2tCQUNBLElBQUksT0FBT0EsS0FBSyxLQUFLLFdBQVcsRUFBRTtvQkFDaEMsSUFBSSxDQUFDaVQsUUFBUSxDQUFDdUIsTUFBTSxFQUFFO3NCQUNwQnZCLFFBQVEsQ0FBQ3VCLE1BQU0sR0FBRyxDQUFDLENBQUM7b0JBQ3RCO29CQUNBdkIsUUFBUSxDQUFDdUIsTUFBTSxDQUFDaGUsR0FBRyxDQUFDLEdBQUcsQ0FBQztrQkFDMUIsQ0FBQyxNQUFNO29CQUNMLElBQUksQ0FBQ3ljLFFBQVEsQ0FBQ3lCLElBQUksRUFBRTtzQkFDbEJ6QixRQUFRLENBQUN5QixJQUFJLEdBQUcsQ0FBQyxDQUFDO29CQUNwQjtvQkFDQXpCLFFBQVEsQ0FBQ3lCLElBQUksQ0FBQ2xlLEdBQUcsQ0FBQyxHQUFHd0osS0FBSztrQkFDNUI7Z0JBQ0YsQ0FBQyxDQUFDO2dCQUNGLElBQUloSixNQUFNLENBQUMrTSxJQUFJLENBQUNrUCxRQUFRLENBQUMsQ0FBQzFXLE1BQU0sR0FBRyxDQUFDLEVBQUU7a0JBQ3BDaEYsSUFBSSxDQUFDc3VCLFdBQVcsQ0FBQ21FLE1BQU0sQ0FBQ0UsT0FBTyxFQUFFalgsUUFBUSxDQUFDO2dCQUM1QztjQUNGO1lBQ0YsQ0FBQyxNQUFNO2NBQ0wsTUFBTSxJQUFJalksS0FBSyxDQUFDLDRDQUE0QyxDQUFDO1lBQy9EO1VBQ0YsQ0FBQztVQUVEO1VBQ0FzdkIsU0FBU0EsQ0FBQSxFQUFHO1lBQ1YveUIsSUFBSSxDQUFDc3VCLFdBQVcsQ0FBQzBFLHFCQUFxQixDQUFDLENBQUM7VUFDMUMsQ0FBQztVQUVEO1VBQ0FDLE1BQU1BLENBQUN6ekIsRUFBRSxFQUFFO1lBQ1QsT0FBT1EsSUFBSSxDQUFDa3pCLE9BQU8sQ0FBQzF6QixFQUFFLENBQUM7VUFDekI7UUFBQyxHQUVFd3lCLGtCQUFrQixDQUN0QjtRQUNELE1BQU1tQixrQkFBa0IsR0FBQWp6QixhQUFBO1VBQ3RCLE1BQU1teUIsV0FBV0EsQ0FBQ0MsU0FBUyxFQUFFQyxLQUFLLEVBQUU7WUFDbEMsSUFBSUQsU0FBUyxHQUFHLENBQUMsSUFBSUMsS0FBSyxFQUFFdnlCLElBQUksQ0FBQ3N1QixXQUFXLENBQUNrRSxjQUFjLENBQUMsQ0FBQztZQUU3RCxJQUFJRCxLQUFLLEVBQUUsTUFBTXZ5QixJQUFJLENBQUNzdUIsV0FBVyxDQUFDNU0sV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1VBQ25ELENBQUM7VUFFRCxNQUFNK1EsTUFBTUEsQ0FBQ0MsR0FBRyxFQUFFO1lBQ2hCLElBQUlDLE9BQU8sR0FBR3BELE9BQU8sQ0FBQ3FELE9BQU8sQ0FBQ0YsR0FBRyxDQUFDbHpCLEVBQUUsQ0FBQztZQUNyQyxJQUFJdUksR0FBRyxHQUFHL0gsSUFBSSxDQUFDc3VCLFdBQVcsQ0FBQ3VFLEtBQUssQ0FBQ24xQixHQUFHLENBQUNpMUIsT0FBTyxDQUFDOztZQUU3QztZQUNBO1lBQ0E7WUFDQSxJQUFJRCxHQUFHLENBQUNBLEdBQUcsS0FBSyxTQUFTLEVBQUU7Y0FDekIsSUFBSXJULE9BQU8sR0FBR3FULEdBQUcsQ0FBQ3JULE9BQU87Y0FDekIsSUFBSSxDQUFDQSxPQUFPLEVBQUU7Z0JBQ1osSUFBSXRYLEdBQUcsRUFBRSxNQUFNL0gsSUFBSSxDQUFDc3VCLFdBQVcsQ0FBQzVNLFdBQVcsQ0FBQ2lSLE9BQU8sQ0FBQztjQUN0RCxDQUFDLE1BQU0sSUFBSSxDQUFDNXFCLEdBQUcsRUFBRTtnQkFDZixNQUFNL0gsSUFBSSxDQUFDc3VCLFdBQVcsQ0FBQ3hOLFdBQVcsQ0FBQ3pCLE9BQU8sQ0FBQztjQUM3QyxDQUFDLE1BQU07Z0JBQ0w7Z0JBQ0EsTUFBTXJmLElBQUksQ0FBQ3N1QixXQUFXLENBQUNwTSxXQUFXLENBQUN5USxPQUFPLEVBQUV0VCxPQUFPLENBQUM7Y0FDdEQ7Y0FDQTtZQUNGLENBQUMsTUFBTSxJQUFJcVQsR0FBRyxDQUFDQSxHQUFHLEtBQUssT0FBTyxFQUFFO2NBQzlCLElBQUkzcUIsR0FBRyxFQUFFO2dCQUNQLE1BQU0sSUFBSXRFLEtBQUssQ0FDYiw0REFDRixDQUFDO2NBQ0g7Y0FDQSxNQUFNekQsSUFBSSxDQUFDc3VCLFdBQVcsQ0FBQ3hOLFdBQVcsQ0FBQTVnQixhQUFBO2dCQUFHMEksR0FBRyxFQUFFK3BCO2NBQU8sR0FBS0QsR0FBRyxDQUFDemxCLE1BQU0sQ0FBRSxDQUFDO1lBQ3JFLENBQUMsTUFBTSxJQUFJeWxCLEdBQUcsQ0FBQ0EsR0FBRyxLQUFLLFNBQVMsRUFBRTtjQUNoQyxJQUFJLENBQUMzcUIsR0FBRyxFQUNOLE1BQU0sSUFBSXRFLEtBQUssQ0FDYix5REFDRixDQUFDO2NBQ0gsTUFBTXpELElBQUksQ0FBQ3N1QixXQUFXLENBQUM1TSxXQUFXLENBQUNpUixPQUFPLENBQUM7WUFDN0MsQ0FBQyxNQUFNLElBQUlELEdBQUcsQ0FBQ0EsR0FBRyxLQUFLLFNBQVMsRUFBRTtjQUNoQyxJQUFJLENBQUMzcUIsR0FBRyxFQUFFLE1BQU0sSUFBSXRFLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQztjQUNsRSxNQUFNK0ksSUFBSSxHQUFHL00sTUFBTSxDQUFDK00sSUFBSSxDQUFDa21CLEdBQUcsQ0FBQ3psQixNQUFNLENBQUM7Y0FDcEMsSUFBSVQsSUFBSSxDQUFDeEgsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDbkIsSUFBSTBXLFFBQVEsR0FBRyxDQUFDLENBQUM7Z0JBQ2pCbFAsSUFBSSxDQUFDMU4sT0FBTyxDQUFDRyxHQUFHLElBQUk7a0JBQ2xCLE1BQU13SixLQUFLLEdBQUdpcUIsR0FBRyxDQUFDemxCLE1BQU0sQ0FBQ2hPLEdBQUcsQ0FBQztrQkFDN0IsSUFBSTBOLEtBQUssQ0FBQytJLE1BQU0sQ0FBQzNOLEdBQUcsQ0FBQzlJLEdBQUcsQ0FBQyxFQUFFd0osS0FBSyxDQUFDLEVBQUU7b0JBQ2pDO2tCQUNGO2tCQUNBLElBQUksT0FBT0EsS0FBSyxLQUFLLFdBQVcsRUFBRTtvQkFDaEMsSUFBSSxDQUFDaVQsUUFBUSxDQUFDdUIsTUFBTSxFQUFFO3NCQUNwQnZCLFFBQVEsQ0FBQ3VCLE1BQU0sR0FBRyxDQUFDLENBQUM7b0JBQ3RCO29CQUNBdkIsUUFBUSxDQUFDdUIsTUFBTSxDQUFDaGUsR0FBRyxDQUFDLEdBQUcsQ0FBQztrQkFDMUIsQ0FBQyxNQUFNO29CQUNMLElBQUksQ0FBQ3ljLFFBQVEsQ0FBQ3lCLElBQUksRUFBRTtzQkFDbEJ6QixRQUFRLENBQUN5QixJQUFJLEdBQUcsQ0FBQyxDQUFDO29CQUNwQjtvQkFDQXpCLFFBQVEsQ0FBQ3lCLElBQUksQ0FBQ2xlLEdBQUcsQ0FBQyxHQUFHd0osS0FBSztrQkFDNUI7Z0JBQ0YsQ0FBQyxDQUFDO2dCQUNGLElBQUloSixNQUFNLENBQUMrTSxJQUFJLENBQUNrUCxRQUFRLENBQUMsQ0FBQzFXLE1BQU0sR0FBRyxDQUFDLEVBQUU7a0JBQ3BDLE1BQU1oRixJQUFJLENBQUNzdUIsV0FBVyxDQUFDcE0sV0FBVyxDQUFDeVEsT0FBTyxFQUFFalgsUUFBUSxDQUFDO2dCQUN2RDtjQUNGO1lBQ0YsQ0FBQyxNQUFNO2NBQ0wsTUFBTSxJQUFJalksS0FBSyxDQUFDLDRDQUE0QyxDQUFDO1lBQy9EO1VBQ0YsQ0FBQztVQUVEO1VBQ0EsTUFBTXN2QixTQUFTQSxDQUFBLEVBQUc7WUFDaEIsTUFBTS95QixJQUFJLENBQUNzdUIsV0FBVyxDQUFDOEUscUJBQXFCLENBQUMsQ0FBQztVQUNoRCxDQUFDO1VBRUQ7VUFDQSxNQUFNSCxNQUFNQSxDQUFDenpCLEVBQUUsRUFBRTtZQUNmLE9BQU9RLElBQUksQ0FBQ3FFLFlBQVksQ0FBQzdFLEVBQUUsQ0FBQztVQUM5QjtRQUFDLEdBQ0V3eUIsa0JBQWtCLENBQ3RCOztRQUdEO1FBQ0E7UUFDQTtRQUNBLElBQUlxQixtQkFBbUI7UUFDdkIsSUFBSXYxQixNQUFNLENBQUNveUIsUUFBUSxFQUFFO1VBQ25CbUQsbUJBQW1CLEdBQUdyekIsSUFBSSxDQUFDb3VCLFdBQVcsQ0FBQzBELG1CQUFtQixDQUN4RDdZLElBQUksRUFDSm1aLGtCQUNGLENBQUM7UUFDSCxDQUFDLE1BQU07VUFDTGlCLG1CQUFtQixHQUFHcnpCLElBQUksQ0FBQ291QixXQUFXLENBQUMyRCxtQkFBbUIsQ0FDeEQ5WSxJQUFJLEVBQ0prYSxrQkFDRixDQUFDO1FBQ0g7UUFFQSxNQUFNbGlCLE9BQU8sNENBQUF0SixNQUFBLENBQTJDc1IsSUFBSSxPQUFHO1FBQy9ELE1BQU1xYSxPQUFPLEdBQUdBLENBQUEsS0FBTTtVQUNwQmh1QixPQUFPLENBQUNnaUIsSUFBSSxHQUFHaGlCLE9BQU8sQ0FBQ2dpQixJQUFJLENBQUNyVyxPQUFPLENBQUMsR0FBRzNMLE9BQU8sQ0FBQ2l1QixHQUFHLENBQUN0aUIsT0FBTyxDQUFDO1FBQzdELENBQUM7UUFFRCxJQUFJLENBQUNvaUIsbUJBQW1CLEVBQUU7VUFDeEIsT0FBT0MsT0FBTyxDQUFDLENBQUM7UUFDbEI7UUFFQSxRQUFBMUIsb0JBQUEsR0FBT3lCLG1CQUFtQixjQUFBekIsb0JBQUEsd0JBQUFDLHFCQUFBLEdBQW5CRCxvQkFBQSxDQUFxQi9tQixJQUFJLGNBQUFnbkIscUJBQUEsdUJBQXpCQSxxQkFBQSxDQUFBaGhCLElBQUEsQ0FBQStnQixvQkFBQSxFQUE0QjRCLEVBQUUsSUFBSTtVQUN2QyxJQUFJLENBQUNBLEVBQUUsRUFBRTtZQUNQRixPQUFPLENBQUMsQ0FBQztVQUNYO1FBQ0YsQ0FBQyxDQUFDO01BQ0o7SUFDRixDQUFDO0lBQUF4ekIsc0JBQUE7RUFBQSxTQUFBQyxXQUFBO0lBQUEsT0FBQUQsc0JBQUEsQ0FBQUMsV0FBQTtFQUFBO0VBQUFELHNCQUFBO0FBQUE7RUFBQUUsSUFBQTtFQUFBQyxLQUFBO0FBQUEsRzs7Ozs7Ozs7Ozs7Ozs7SUN6UUQsSUFBSUMsYUFBYTtJQUFDM0MsTUFBTSxDQUFDYixJQUFJLENBQUMsc0NBQXNDLEVBQUM7TUFBQ3lELE9BQU9BLENBQUN4RCxDQUFDLEVBQUM7UUFBQ3VELGFBQWEsR0FBQ3ZELENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJSSxvQkFBb0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNQSxvQkFBb0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUFsS1EsTUFBTSxDQUFDakIsTUFBTSxDQUFDO01BQUMrd0IsV0FBVyxFQUFDQSxDQUFBLEtBQUlBO0lBQVcsQ0FBQyxDQUFDO0lBQXJDLE1BQU1BLFdBQVcsR0FBRztNQUN6QjtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtNQUNFdkosSUFBSUEsQ0FBQSxFQUFVO1FBQUEsU0FBQTdZLElBQUEsR0FBQUMsU0FBQSxDQUFBbEcsTUFBQSxFQUFObUcsSUFBSSxPQUFBQyxLQUFBLENBQUFILElBQUEsR0FBQUksSUFBQSxNQUFBQSxJQUFBLEdBQUFKLElBQUEsRUFBQUksSUFBQTtVQUFKRixJQUFJLENBQUFFLElBQUEsSUFBQUgsU0FBQSxDQUFBRyxJQUFBO1FBQUE7UUFDVjtRQUNBO1FBQ0E7UUFDQSxPQUFPLElBQUksQ0FBQ2lqQixXQUFXLENBQUN4SyxJQUFJLENBQzFCLElBQUksQ0FBQzZLLGdCQUFnQixDQUFDeGpCLElBQUksQ0FBQyxFQUMzQixJQUFJLENBQUN5akIsZUFBZSxDQUFDempCLElBQUksQ0FDM0IsQ0FBQztNQUNILENBQUM7TUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtNQUNFK25CLE9BQU9BLENBQUEsRUFBVTtRQUFBLFNBQUE3TyxLQUFBLEdBQUFuWixTQUFBLENBQUFsRyxNQUFBLEVBQU5tRyxJQUFJLE9BQUFDLEtBQUEsQ0FBQWlaLEtBQUEsR0FBQUMsS0FBQSxNQUFBQSxLQUFBLEdBQUFELEtBQUEsRUFBQUMsS0FBQTtVQUFKblosSUFBSSxDQUFBbVosS0FBQSxJQUFBcFosU0FBQSxDQUFBb1osS0FBQTtRQUFBO1FBQ2IsT0FBTyxJQUFJLENBQUNnSyxXQUFXLENBQUM0RSxPQUFPLENBQzdCLElBQUksQ0FBQ3ZFLGdCQUFnQixDQUFDeGpCLElBQUksQ0FBQyxFQUMzQixJQUFJLENBQUN5akIsZUFBZSxDQUFDempCLElBQUksQ0FDM0IsQ0FBQztNQUNILENBQUM7TUFHRDtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBOztNQUVBc29CLE9BQU9BLENBQUMxckIsR0FBRyxFQUFFdkUsUUFBUSxFQUFFO1FBQ3JCO1FBQ0EsSUFBSSxDQUFDdUUsR0FBRyxFQUFFO1VBQ1IsTUFBTSxJQUFJdEUsS0FBSyxDQUFDLDZCQUE2QixDQUFDO1FBQ2hEOztRQUdBO1FBQ0FzRSxHQUFHLEdBQUd0SSxNQUFNLENBQUN1c0IsTUFBTSxDQUNqQnZzQixNQUFNLENBQUNxeEIsY0FBYyxDQUFDL29CLEdBQUcsQ0FBQyxFQUMxQnRJLE1BQU0sQ0FBQ3N4Qix5QkFBeUIsQ0FBQ2hwQixHQUFHLENBQ3RDLENBQUM7UUFFRCxJQUFJLEtBQUssSUFBSUEsR0FBRyxFQUFFO1VBQ2hCLElBQ0UsQ0FBQ0EsR0FBRyxDQUFDYSxHQUFHLElBQ1IsRUFBRSxPQUFPYixHQUFHLENBQUNhLEdBQUcsS0FBSyxRQUFRLElBQUliLEdBQUcsQ0FBQ2EsR0FBRyxZQUFZNlQsS0FBSyxDQUFDQyxRQUFRLENBQUMsRUFDbkU7WUFDQSxNQUFNLElBQUlqWixLQUFLLENBQ2IsMEVBQ0YsQ0FBQztVQUNIO1FBQ0YsQ0FBQyxNQUFNO1VBQ0wsSUFBSXV0QixVQUFVLEdBQUcsSUFBSTs7VUFFckI7VUFDQTtVQUNBO1VBQ0EsSUFBSSxJQUFJLENBQUM3QixtQkFBbUIsQ0FBQyxDQUFDLEVBQUU7WUFDOUIsTUFBTThCLFNBQVMsR0FBR3JCLEdBQUcsQ0FBQ3NCLHdCQUF3QixDQUFDeHpCLEdBQUcsQ0FBQyxDQUFDO1lBQ3BELElBQUksQ0FBQ3V6QixTQUFTLEVBQUU7Y0FDZEQsVUFBVSxHQUFHLEtBQUs7WUFDcEI7VUFDRjtVQUVBLElBQUlBLFVBQVUsRUFBRTtZQUNkanBCLEdBQUcsQ0FBQ2EsR0FBRyxHQUFHLElBQUksQ0FBQ3FsQixVQUFVLENBQUMsQ0FBQztVQUM3QjtRQUNGOztRQUdBO1FBQ0E7UUFDQSxJQUFJa0QscUNBQXFDLEdBQUcsU0FBQUEsQ0FBUzVaLE1BQU0sRUFBRTtVQUMzRCxJQUFJelosTUFBTSxDQUFDc3pCLFVBQVUsQ0FBQzdaLE1BQU0sQ0FBQyxFQUFFLE9BQU9BLE1BQU07VUFFNUMsSUFBSXhQLEdBQUcsQ0FBQ2EsR0FBRyxFQUFFO1lBQ1gsT0FBT2IsR0FBRyxDQUFDYSxHQUFHO1VBQ2hCOztVQUVBO1VBQ0E7VUFDQTtVQUNBYixHQUFHLENBQUNhLEdBQUcsR0FBRzJPLE1BQU07VUFFaEIsT0FBT0EsTUFBTTtRQUNmLENBQUM7UUFFRCxNQUFNbWMsZUFBZSxHQUFHQyxZQUFZLENBQ2xDbndCLFFBQVEsRUFDUjJ0QixxQ0FDRixDQUFDO1FBRUQsSUFBSSxJQUFJLENBQUNoQyxtQkFBbUIsQ0FBQyxDQUFDLEVBQUU7VUFDOUIsTUFBTTVYLE1BQU0sR0FBRyxJQUFJLENBQUNxYyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQzdyQixHQUFHLENBQUMsRUFBRTJyQixlQUFlLENBQUM7VUFDeEUsT0FBT3ZDLHFDQUFxQyxDQUFDNVosTUFBTSxDQUFDO1FBQ3REOztRQUVBO1FBQ0E7UUFDQSxJQUFJO1VBQ0Y7VUFDQTtVQUNBO1VBQ0EsSUFBSUEsTUFBTTtVQUNWLElBQUksQ0FBQyxDQUFDbWMsZUFBZSxFQUFFO1lBQ3JCLElBQUksQ0FBQ3BGLFdBQVcsQ0FBQ3dFLE1BQU0sQ0FBQy9xQixHQUFHLEVBQUUyckIsZUFBZSxDQUFDO1VBQy9DLENBQUMsTUFBTTtZQUNMO1lBQ0E7WUFDQW5jLE1BQU0sR0FBRyxJQUFJLENBQUMrVyxXQUFXLENBQUN3RSxNQUFNLENBQUMvcUIsR0FBRyxDQUFDO1VBQ3ZDO1VBRUEsT0FBT29wQixxQ0FBcUMsQ0FBQzVaLE1BQU0sQ0FBQztRQUN0RCxDQUFDLENBQUMsT0FBTzdTLENBQUMsRUFBRTtVQUNWLElBQUlsQixRQUFRLEVBQUU7WUFDWkEsUUFBUSxDQUFDa0IsQ0FBQyxDQUFDO1lBQ1gsT0FBTyxJQUFJO1VBQ2I7VUFDQSxNQUFNQSxDQUFDO1FBQ1Q7TUFDRixDQUFDO01BRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO01BQ0VvdUIsTUFBTUEsQ0FBQy9xQixHQUFHLEVBQUV2RSxRQUFRLEVBQUU7UUFDcEIsT0FBTyxJQUFJLENBQUNpd0IsT0FBTyxDQUFDMXJCLEdBQUcsRUFBRXZFLFFBQVEsQ0FBQztNQUNwQyxDQUFDO01BRUQ7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtNQUNFaXZCLE1BQU1BLENBQUNsekIsUUFBUSxFQUFFbWMsUUFBUSxFQUF5QjtRQUFBLFNBQUFtWSxLQUFBLEdBQUEzb0IsU0FBQSxDQUFBbEcsTUFBQSxFQUFwQjh1QixrQkFBa0IsT0FBQTFvQixLQUFBLENBQUF5b0IsS0FBQSxPQUFBQSxLQUFBLFdBQUFFLEtBQUEsTUFBQUEsS0FBQSxHQUFBRixLQUFBLEVBQUFFLEtBQUE7VUFBbEJELGtCQUFrQixDQUFBQyxLQUFBLFFBQUE3b0IsU0FBQSxDQUFBNm9CLEtBQUE7UUFBQTtRQUM5QyxNQUFNdndCLFFBQVEsR0FBR3d3QixtQkFBbUIsQ0FBQ0Ysa0JBQWtCLENBQUM7O1FBRXhEO1FBQ0E7UUFDQSxNQUFNaG9CLE9BQU8sR0FBQTVMLGFBQUEsS0FBUzR6QixrQkFBa0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUc7UUFDdEQsSUFBSXhTLFVBQVU7UUFDZCxJQUFJeFYsT0FBTyxJQUFJQSxPQUFPLENBQUN3VyxNQUFNLEVBQUU7VUFDN0I7VUFDQSxJQUFJeFcsT0FBTyxDQUFDd1YsVUFBVSxFQUFFO1lBQ3RCLElBQ0UsRUFDRSxPQUFPeFYsT0FBTyxDQUFDd1YsVUFBVSxLQUFLLFFBQVEsSUFDdEN4VixPQUFPLENBQUN3VixVQUFVLFlBQVk3RSxLQUFLLENBQUNDLFFBQVEsQ0FDN0MsRUFFRCxNQUFNLElBQUlqWixLQUFLLENBQUMsdUNBQXVDLENBQUM7WUFDMUQ2ZCxVQUFVLEdBQUd4VixPQUFPLENBQUN3VixVQUFVO1VBQ2pDLENBQUMsTUFBTSxJQUFJLENBQUMvaEIsUUFBUSxJQUFJLENBQUNBLFFBQVEsQ0FBQ3FKLEdBQUcsRUFBRTtZQUNyQzBZLFVBQVUsR0FBRyxJQUFJLENBQUMyTSxVQUFVLENBQUMsQ0FBQztZQUM5Qm5pQixPQUFPLENBQUNrWCxXQUFXLEdBQUcsSUFBSTtZQUMxQmxYLE9BQU8sQ0FBQ3dWLFVBQVUsR0FBR0EsVUFBVTtVQUNqQztRQUNGO1FBRUEvaEIsUUFBUSxHQUFHa2QsS0FBSyxDQUFDcUIsVUFBVSxDQUFDQyxnQkFBZ0IsQ0FBQ3hlLFFBQVEsRUFBRTtVQUNyRHl2QixVQUFVLEVBQUUxTjtRQUNkLENBQUMsQ0FBQztRQUVGLE1BQU1vUyxlQUFlLEdBQUdDLFlBQVksQ0FBQ253QixRQUFRLENBQUM7UUFFOUMsSUFBSSxJQUFJLENBQUMyckIsbUJBQW1CLENBQUMsQ0FBQyxFQUFFO1VBQzlCLE1BQU1oa0IsSUFBSSxHQUFHLENBQUM1TCxRQUFRLEVBQUVtYyxRQUFRLEVBQUU1UCxPQUFPLENBQUM7VUFDMUMsT0FBTyxJQUFJLENBQUM4bkIsa0JBQWtCLENBQUMsUUFBUSxFQUFFem9CLElBQUksRUFBRTNILFFBQVEsQ0FBQztRQUMxRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQSxJQUFJO1VBQ0Y7VUFDQTtVQUNBO1VBQ0EsT0FBTyxJQUFJLENBQUM4cUIsV0FBVyxDQUFDbUUsTUFBTSxDQUM1Qmx6QixRQUFRLEVBQ1JtYyxRQUFRLEVBQ1I1UCxPQUFPLEVBQ1A0bkIsZUFDRixDQUFDO1FBQ0gsQ0FBQyxDQUFDLE9BQU9odkIsQ0FBQyxFQUFFO1VBQ1YsSUFBSWxCLFFBQVEsRUFBRTtZQUNaQSxRQUFRLENBQUNrQixDQUFDLENBQUM7WUFDWCxPQUFPLElBQUk7VUFDYjtVQUNBLE1BQU1BLENBQUM7UUFDVDtNQUNGLENBQUM7TUFFRDtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7TUFDRWlSLE1BQU1BLENBQUNwVyxRQUFRLEVBQUVpRSxRQUFRLEVBQUU7UUFDekJqRSxRQUFRLEdBQUdrZCxLQUFLLENBQUNxQixVQUFVLENBQUNDLGdCQUFnQixDQUFDeGUsUUFBUSxDQUFDO1FBRXRELElBQUksSUFBSSxDQUFDNHZCLG1CQUFtQixDQUFDLENBQUMsRUFBRTtVQUM5QixPQUFPLElBQUksQ0FBQ3lFLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxDQUFDcjBCLFFBQVEsQ0FBQyxFQUFFaUUsUUFBUSxDQUFDO1FBQ2hFOztRQUdBO1FBQ0E7UUFDQSxPQUFPLElBQUksQ0FBQzhxQixXQUFXLENBQUMzWSxNQUFNLENBQUNwVyxRQUFRLENBQUM7TUFDMUMsQ0FBQztNQUVEO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtNQUNFK2lCLE1BQU1BLENBQUMvaUIsUUFBUSxFQUFFbWMsUUFBUSxFQUFFNVAsT0FBTyxFQUFFdEksUUFBUSxFQUFFO1FBQzVDLElBQUksQ0FBQ0EsUUFBUSxJQUFJLE9BQU9zSSxPQUFPLEtBQUssVUFBVSxFQUFFO1VBQzlDdEksUUFBUSxHQUFHc0ksT0FBTztVQUNsQkEsT0FBTyxHQUFHLENBQUMsQ0FBQztRQUNkO1FBRUEsT0FBTyxJQUFJLENBQUMybUIsTUFBTSxDQUNoQmx6QixRQUFRLEVBQ1JtYyxRQUFRLEVBQUF4YixhQUFBLENBQUFBLGFBQUEsS0FFSDRMLE9BQU87VUFDVm9YLGFBQWEsRUFBRSxJQUFJO1VBQ25CWixNQUFNLEVBQUU7UUFBSSxFQUNiLENBQUM7TUFDTjtJQUNGLENBQUM7SUFFRDtJQUNBLFNBQVNxUixZQUFZQSxDQUFDbndCLFFBQVEsRUFBRXl3QixhQUFhLEVBQUU7TUFDN0MsT0FDRXp3QixRQUFRLElBQ1IsVUFBUytCLEtBQUssRUFBRWdTLE1BQU0sRUFBRTtRQUN0QixJQUFJaFMsS0FBSyxFQUFFO1VBQ1QvQixRQUFRLENBQUMrQixLQUFLLENBQUM7UUFDakIsQ0FBQyxNQUFNLElBQUksT0FBTzB1QixhQUFhLEtBQUssVUFBVSxFQUFFO1VBQzlDendCLFFBQVEsQ0FBQytCLEtBQUssRUFBRTB1QixhQUFhLENBQUMxYyxNQUFNLENBQUMsQ0FBQztRQUN4QyxDQUFDLE1BQU07VUFDTC9ULFFBQVEsQ0FBQytCLEtBQUssRUFBRWdTLE1BQU0sQ0FBQztRQUN6QjtNQUNGLENBQUM7SUFFTDtJQUVBLFNBQVN5YyxtQkFBbUJBLENBQUM3b0IsSUFBSSxFQUFFO01BQ2pDO01BQ0E7TUFDQSxJQUNFQSxJQUFJLENBQUNuRyxNQUFNLEtBQ1ZtRyxJQUFJLENBQUNBLElBQUksQ0FBQ25HLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBS3dGLFNBQVMsSUFDbENXLElBQUksQ0FBQ0EsSUFBSSxDQUFDbkcsTUFBTSxHQUFHLENBQUMsQ0FBQyxZQUFZc08sUUFBUSxDQUFDLEVBQzVDO1FBQ0EsT0FBT25JLElBQUksQ0FBQ2xELEdBQUcsQ0FBQyxDQUFDO01BQ25CO0lBQ0Y7SUFBQ25JLHNCQUFBO0VBQUEsU0FBQUMsV0FBQTtJQUFBLE9BQUFELHNCQUFBLENBQUFDLFdBQUE7RUFBQTtFQUFBRCxzQkFBQTtBQUFBO0VBQUFFLElBQUE7RUFBQUMsS0FBQTtBQUFBLEc7Ozs7Ozs7Ozs7O0FDelZEOzs7Ozs7QUFNQXdjLEtBQUssQ0FBQ3lYLG9CQUFvQixHQUFHLFNBQVNBLG9CQUFvQkEsQ0FBRXBvQixPQUFPO0VBQ2pFNkIsS0FBSyxDQUFDN0IsT0FBTyxFQUFFck0sTUFBTSxDQUFDO0VBQ3RCZ2QsS0FBSyxDQUFDdUMsa0JBQWtCLEdBQUdsVCxPQUFPO0FBQ3BDLENBQUMsQzs7Ozs7Ozs7Ozs7Ozs7SUNURCxJQUFJNUwsYUFBYTtJQUFDM0MsTUFBTSxDQUFDYixJQUFJLENBQUMsc0NBQXNDLEVBQUM7TUFBQ3lELE9BQU9BLENBQUN4RCxDQUFDLEVBQUM7UUFBQ3VELGFBQWEsR0FBQ3ZELENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJOE0sd0JBQXdCO0lBQUNsTSxNQUFNLENBQUNiLElBQUksQ0FBQyxnREFBZ0QsRUFBQztNQUFDeUQsT0FBT0EsQ0FBQ3hELENBQUMsRUFBQztRQUFDOE0sd0JBQXdCLEdBQUM5TSxDQUFDO01BQUE7SUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQUMsSUFBSUksb0JBQW9CLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTUEsb0JBQW9CLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFBQyxNQUFBMk0sU0FBQTtJQUF6U25NLE1BQU0sQ0FBQ2pCLE1BQU0sQ0FBQztNQUFDNndCLG1CQUFtQixFQUFDQSxDQUFBLEtBQUlBO0lBQW1CLENBQUMsQ0FBQztJQUFyRCxNQUFNQSxtQkFBbUIsR0FBR3JoQixPQUFPLElBQUk7TUFDNUM7TUFDQSxNQUFBbEMsSUFBQSxHQUFnRGtDLE9BQU8sSUFBSSxDQUFDLENBQUM7UUFBdkQ7VUFBRW1CLE1BQU07VUFBRTNJO1FBQTRCLENBQUMsR0FBQXNGLElBQUE7UUFBZHVxQixZQUFZLEdBQUExcUIsd0JBQUEsQ0FBQUcsSUFBQSxFQUFBRixTQUFBO01BQzNDO01BQ0E7O01BRUEsT0FBQXhKLGFBQUEsQ0FBQUEsYUFBQSxLQUNLaTBCLFlBQVksR0FDWDd2QixVQUFVLElBQUkySSxNQUFNLEdBQUc7UUFBRTNJLFVBQVUsRUFBRTJJLE1BQU0sSUFBSTNJO01BQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUV4RSxDQUFDO0lBQUN4RSxzQkFBQTtFQUFBLFNBQUFDLFdBQUE7SUFBQSxPQUFBRCxzQkFBQSxDQUFBQyxXQUFBO0VBQUE7RUFBQUQsc0JBQUE7QUFBQTtFQUFBRSxJQUFBO0VBQUFDLEtBQUE7QUFBQSxHOzs7Ozs7Ozs7OztBQ1JGMUMsTUFBSSxDQUFBakIsTUFBQTtFQUFBaWlCLGFBQXdCLEVBQUFBLENBQUEsS0FBQUE7QUFBQTtBQUE1QixJQUFJNlYsbUJBQW1CLEdBQUcsQ0FBQztBQU8zQjs7Ozs7QUFLTSxNQUFPN1YsYUFBYTtFQWV4QnZkLFlBQVlvTyxXQUErQixFQUFFdEIsU0FBcUQsRUFBRXBCLG9CQUE2QjtJQUFBLEtBZGpJOUQsR0FBRztJQUFBLEtBQ0g4RixZQUFZO0lBQUEsS0FDWmhDLG9CQUFvQjtJQUFBLEtBQ3BCbEwsUUFBUTtJQUFBLEtBRUQ0TCx1QkFBdUIsR0FBMEIsTUFBSyxDQUFFLENBQUM7SUFBQSxLQUN6RFgsZUFBZTtJQUFBLEtBRXRCSSxNQUFNO0lBQUEsS0FDTkQsWUFBWTtJQUFBLEtBQ1p5bkIsUUFBUTtJQUFBLEtBQ1JDLFlBQVk7SUFBQSxLQUNaQyxRQUFRO0lBcUNSOzs7SUFBQSxLQUdBMTFCLElBQUksR0FBRyxZQUFXO01BQ2hCLElBQUksSUFBSSxDQUFDMkMsUUFBUSxFQUFFO01BQ25CLElBQUksQ0FBQ0EsUUFBUSxHQUFHLElBQUk7TUFDcEIsTUFBTSxJQUFJLENBQUNrTixZQUFZLENBQUMvQyxZQUFZLENBQUMsSUFBSSxDQUFDL0MsR0FBRyxDQUFDO0lBQ2hELENBQUM7SUF6Q0MsSUFBSSxDQUFDOEYsWUFBWSxHQUFHVSxXQUFXO0lBRS9CQSxXQUFXLENBQUNyRSxhQUFhLEVBQUUsQ0FBQ2pNLE9BQU8sQ0FBRW1hLElBQTJCLElBQUk7TUFDbEUsSUFBSW5MLFNBQVMsQ0FBQ21MLElBQUksQ0FBQyxFQUFFO1FBQ25CLElBQUksS0FBQXRSLE1BQUEsQ0FBS3NSLElBQUksRUFBb0MsR0FBR25MLFNBQVMsQ0FBQ21MLElBQUksQ0FBQztRQUNuRTtNQUNGO01BRUEsSUFBSUEsSUFBSSxLQUFLLGFBQWEsSUFBSW5MLFNBQVMsQ0FBQ3VILEtBQUssRUFBRTtRQUM3QyxJQUFJLENBQUN6SSxZQUFZLEdBQUcsZ0JBQWdCcE4sRUFBRSxFQUFFeU4sTUFBTSxFQUFFdW5CLE1BQU07VUFDcEQsTUFBTTFtQixTQUFTLENBQUN1SCxLQUFLLENBQUM3VixFQUFFLEVBQUV5TixNQUFNLENBQUM7UUFDbkMsQ0FBQztNQUNIO0lBQ0YsQ0FBQyxDQUFDO0lBRUYsSUFBSSxDQUFDekwsUUFBUSxHQUFHLEtBQUs7SUFDckIsSUFBSSxDQUFDb0gsR0FBRyxHQUFHd3JCLG1CQUFtQixFQUFFO0lBQ2hDLElBQUksQ0FBQzFuQixvQkFBb0IsR0FBR0Esb0JBQW9CO0lBRWhELElBQUksQ0FBQ0QsZUFBZSxHQUFHLElBQUlsSyxPQUFPLENBQUNnSCxPQUFPLElBQUc7TUFDM0MsTUFBTXlDLEtBQUssR0FBR0EsQ0FBQSxLQUFLO1FBQ2pCekMsT0FBTyxFQUFFO1FBQ1QsSUFBSSxDQUFDa0QsZUFBZSxHQUFHbEssT0FBTyxDQUFDZ0gsT0FBTyxFQUFFO01BQzFDLENBQUM7TUFFRCxNQUFNa3JCLE9BQU8sR0FBR3B2QixVQUFVLENBQUMyRyxLQUFLLEVBQUUsS0FBSyxDQUFDO01BRXhDLElBQUksQ0FBQ29CLHVCQUF1QixHQUFHLE1BQUs7UUFDbENwQixLQUFLLEVBQUU7UUFDUDVHLFlBQVksQ0FBQ3F2QixPQUFPLENBQUM7TUFDdkIsQ0FBQztJQUNILENBQUMsQ0FBQztFQUNKIiwiZmlsZSI6Ii9wYWNrYWdlcy9tb25nby5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE9wbG9nSGFuZGxlIH0gZnJvbSAnLi9vcGxvZ190YWlsaW5nJztcbmltcG9ydCB7IE1vbmdvQ29ubmVjdGlvbiB9IGZyb20gJy4vbW9uZ29fY29ubmVjdGlvbic7XG5pbXBvcnQgeyBPcGxvZ09ic2VydmVEcml2ZXIgfSBmcm9tICcuL29wbG9nX29ic2VydmVfZHJpdmVyJztcbmltcG9ydCB7IE1vbmdvREIgfSBmcm9tICcuL21vbmdvX2NvbW1vbic7XG5cbk1vbmdvSW50ZXJuYWxzID0gZ2xvYmFsLk1vbmdvSW50ZXJuYWxzID0ge307XG5cbk1vbmdvSW50ZXJuYWxzLl9fcGFja2FnZU5hbWUgPSAnbW9uZ28nO1xuXG5Nb25nb0ludGVybmFscy5OcG1Nb2R1bGVzID0ge1xuICBtb25nb2RiOiB7XG4gICAgdmVyc2lvbjogTnBtTW9kdWxlTW9uZ29kYlZlcnNpb24sXG4gICAgbW9kdWxlOiBNb25nb0RCXG4gIH1cbn07XG5cbi8vIE9sZGVyIHZlcnNpb24gb2Ygd2hhdCBpcyBub3cgYXZhaWxhYmxlIHZpYVxuLy8gTW9uZ29JbnRlcm5hbHMuTnBtTW9kdWxlcy5tb25nb2RiLm1vZHVsZS4gIEl0IHdhcyBuZXZlciBkb2N1bWVudGVkLCBidXRcbi8vIHBlb3BsZSBkbyB1c2UgaXQuXG4vLyBYWFggQ09NUEFUIFdJVEggMS4wLjMuMlxuTW9uZ29JbnRlcm5hbHMuTnBtTW9kdWxlID0gbmV3IFByb3h5KE1vbmdvREIsIHtcbiAgZ2V0KHRhcmdldCwgcHJvcGVydHlLZXksIHJlY2VpdmVyKSB7XG4gICAgaWYgKHByb3BlcnR5S2V5ID09PSAnT2JqZWN0SUQnKSB7XG4gICAgICBNZXRlb3IuZGVwcmVjYXRlKFxuICAgICAgICBgQWNjZXNzaW5nICdNb25nb0ludGVybmFscy5OcG1Nb2R1bGUuT2JqZWN0SUQnIGRpcmVjdGx5IGlzIGRlcHJlY2F0ZWQuIGAgK1xuICAgICAgICBgVXNlICdNb25nb0ludGVybmFscy5OcG1Nb2R1bGUuT2JqZWN0SWQnIGluc3RlYWQuYFxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIFJlZmxlY3QuZ2V0KHRhcmdldCwgcHJvcGVydHlLZXksIHJlY2VpdmVyKTtcbiAgfSxcbn0pO1xuXG5Nb25nb0ludGVybmFscy5PcGxvZ0hhbmRsZSA9IE9wbG9nSGFuZGxlO1xuXG5Nb25nb0ludGVybmFscy5Db25uZWN0aW9uID0gTW9uZ29Db25uZWN0aW9uO1xuXG5Nb25nb0ludGVybmFscy5PcGxvZ09ic2VydmVEcml2ZXIgPSBPcGxvZ09ic2VydmVEcml2ZXI7XG5cbi8vIFRoaXMgaXMgdXNlZCB0byBhZGQgb3IgcmVtb3ZlIEVKU09OIGZyb20gdGhlIGJlZ2lubmluZyBvZiBldmVyeXRoaW5nIG5lc3RlZFxuLy8gaW5zaWRlIGFuIEVKU09OIGN1c3RvbSB0eXBlLiBJdCBzaG91bGQgb25seSBiZSBjYWxsZWQgb24gcHVyZSBKU09OIVxuXG5cbi8vIEVuc3VyZSB0aGF0IEVKU09OLmNsb25lIGtlZXBzIGEgVGltZXN0YW1wIGFzIGEgVGltZXN0YW1wIChpbnN0ZWFkIG9mIGp1c3Rcbi8vIGRvaW5nIGEgc3RydWN0dXJhbCBjbG9uZSkuXG4vLyBYWFggaG93IG9rIGlzIHRoaXM/IHdoYXQgaWYgdGhlcmUgYXJlIG11bHRpcGxlIGNvcGllcyBvZiBNb25nb0RCIGxvYWRlZD9cbk1vbmdvREIuVGltZXN0YW1wLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gVGltZXN0YW1wcyBzaG91bGQgYmUgaW1tdXRhYmxlLlxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIExpc3RlbiBmb3IgdGhlIGludmFsaWRhdGlvbiBtZXNzYWdlcyB0aGF0IHdpbGwgdHJpZ2dlciB1cyB0byBwb2xsIHRoZVxuLy8gZGF0YWJhc2UgZm9yIGNoYW5nZXMuIElmIHRoaXMgc2VsZWN0b3Igc3BlY2lmaWVzIHNwZWNpZmljIElEcywgc3BlY2lmeSB0aGVtXG4vLyBoZXJlLCBzbyB0aGF0IHVwZGF0ZXMgdG8gZGlmZmVyZW50IHNwZWNpZmljIElEcyBkb24ndCBjYXVzZSB1cyB0byBwb2xsLlxuLy8gbGlzdGVuQ2FsbGJhY2sgaXMgdGhlIHNhbWUga2luZCBvZiAobm90aWZpY2F0aW9uLCBjb21wbGV0ZSkgY2FsbGJhY2sgcGFzc2VkXG4vLyB0byBJbnZhbGlkYXRpb25Dcm9zc2Jhci5saXN0ZW4uXG5cbmV4cG9ydCBjb25zdCBsaXN0ZW5BbGwgPSBhc3luYyBmdW5jdGlvbiAoY3Vyc29yRGVzY3JpcHRpb24sIGxpc3RlbkNhbGxiYWNrKSB7XG4gIGNvbnN0IGxpc3RlbmVycyA9IFtdO1xuICBhd2FpdCBmb3JFYWNoVHJpZ2dlcihjdXJzb3JEZXNjcmlwdGlvbiwgZnVuY3Rpb24gKHRyaWdnZXIpIHtcbiAgICBsaXN0ZW5lcnMucHVzaChERFBTZXJ2ZXIuX0ludmFsaWRhdGlvbkNyb3NzYmFyLmxpc3RlbihcbiAgICAgIHRyaWdnZXIsIGxpc3RlbkNhbGxiYWNrKSk7XG4gIH0pO1xuXG4gIHJldHVybiB7XG4gICAgc3RvcDogZnVuY3Rpb24gKCkge1xuICAgICAgbGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG4gICAgICAgIGxpc3RlbmVyLnN0b3AoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn07XG5cbmV4cG9ydCBjb25zdCBmb3JFYWNoVHJpZ2dlciA9IGFzeW5jIGZ1bmN0aW9uIChjdXJzb3JEZXNjcmlwdGlvbiwgdHJpZ2dlckNhbGxiYWNrKSB7XG4gIGNvbnN0IGtleSA9IHtjb2xsZWN0aW9uOiBjdXJzb3JEZXNjcmlwdGlvbi5jb2xsZWN0aW9uTmFtZX07XG4gIGNvbnN0IHNwZWNpZmljSWRzID0gTG9jYWxDb2xsZWN0aW9uLl9pZHNNYXRjaGVkQnlTZWxlY3RvcihcbiAgICBjdXJzb3JEZXNjcmlwdGlvbi5zZWxlY3Rvcik7XG4gIGlmIChzcGVjaWZpY0lkcykge1xuICAgIGZvciAoY29uc3QgaWQgb2Ygc3BlY2lmaWNJZHMpIHtcbiAgICAgIGF3YWl0IHRyaWdnZXJDYWxsYmFjayhPYmplY3QuYXNzaWduKHtpZDogaWR9LCBrZXkpKTtcbiAgICB9XG4gICAgYXdhaXQgdHJpZ2dlckNhbGxiYWNrKE9iamVjdC5hc3NpZ24oe2Ryb3BDb2xsZWN0aW9uOiB0cnVlLCBpZDogbnVsbH0sIGtleSkpO1xuICB9IGVsc2Uge1xuICAgIGF3YWl0IHRyaWdnZXJDYWxsYmFjayhrZXkpO1xuICB9XG4gIC8vIEV2ZXJ5b25lIGNhcmVzIGFib3V0IHRoZSBkYXRhYmFzZSBiZWluZyBkcm9wcGVkLlxuICBhd2FpdCB0cmlnZ2VyQ2FsbGJhY2soeyBkcm9wRGF0YWJhc2U6IHRydWUgfSk7XG59O1xuXG5cblxuLy8gWFhYIFdlIHByb2JhYmx5IG5lZWQgdG8gZmluZCBhIGJldHRlciB3YXkgdG8gZXhwb3NlIHRoaXMuIFJpZ2h0IG5vd1xuLy8gaXQncyBvbmx5IHVzZWQgYnkgdGVzdHMsIGJ1dCBpbiBmYWN0IHlvdSBuZWVkIGl0IGluIG5vcm1hbFxuLy8gb3BlcmF0aW9uIHRvIGludGVyYWN0IHdpdGggY2FwcGVkIGNvbGxlY3Rpb25zLlxuTW9uZ29JbnRlcm5hbHMuTW9uZ29UaW1lc3RhbXAgPSBNb25nb0RCLlRpbWVzdGFtcDtcbiIsImltcG9ydCBpc0VtcHR5IGZyb20gJ2xvZGFzaC5pc2VtcHR5JztcbmltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgQ3Vyc29yRGVzY3JpcHRpb24gfSBmcm9tICcuL2N1cnNvcl9kZXNjcmlwdGlvbic7XG5pbXBvcnQgeyBNb25nb0Nvbm5lY3Rpb24gfSBmcm9tICcuL21vbmdvX2Nvbm5lY3Rpb24nO1xuXG5pbXBvcnQgeyBOcG1Nb2R1bGVNb25nb2RiIH0gZnJvbSBcIm1ldGVvci9ucG0tbW9uZ29cIjtcbmNvbnN0IHsgTG9uZyB9ID0gTnBtTW9kdWxlTW9uZ29kYjtcblxuZXhwb3J0IGNvbnN0IE9QTE9HX0NPTExFQ1RJT04gPSAnb3Bsb2cucnMnO1xuXG5sZXQgVE9PX0ZBUl9CRUhJTkQgPSArKHByb2Nlc3MuZW52Lk1FVEVPUl9PUExPR19UT09fRkFSX0JFSElORCB8fCAyMDAwKTtcbmNvbnN0IFRBSUxfVElNRU9VVCA9ICsocHJvY2Vzcy5lbnYuTUVURU9SX09QTE9HX1RBSUxfVElNRU9VVCB8fCAzMDAwMCk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgT3Bsb2dFbnRyeSB7XG4gIG9wOiBzdHJpbmc7XG4gIG86IGFueTtcbiAgbzI/OiBhbnk7XG4gIHRzOiBhbnk7XG4gIG5zOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2F0Y2hpbmdVcFJlc29sdmVyIHtcbiAgdHM6IGFueTtcbiAgcmVzb2x2ZXI6ICgpID0+IHZvaWQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgT3Bsb2dUcmlnZ2VyIHtcbiAgZHJvcENvbGxlY3Rpb246IGJvb2xlYW47XG4gIGRyb3BEYXRhYmFzZTogYm9vbGVhbjtcbiAgb3A6IE9wbG9nRW50cnk7XG4gIGNvbGxlY3Rpb24/OiBzdHJpbmc7XG4gIGlkPzogc3RyaW5nIHwgbnVsbDtcbn1cblxuZXhwb3J0IGNsYXNzIE9wbG9nSGFuZGxlIHtcbiAgcHJpdmF0ZSBfb3Bsb2dVcmw6IHN0cmluZztcbiAgcHVibGljIF9kYk5hbWU6IHN0cmluZztcbiAgcHJpdmF0ZSBfb3Bsb2dMYXN0RW50cnlDb25uZWN0aW9uOiBNb25nb0Nvbm5lY3Rpb24gfCBudWxsO1xuICBwcml2YXRlIF9vcGxvZ1RhaWxDb25uZWN0aW9uOiBNb25nb0Nvbm5lY3Rpb24gfCBudWxsO1xuICBwcml2YXRlIF9vcGxvZ09wdGlvbnM6IHsgZXhjbHVkZUNvbGxlY3Rpb25zPzogc3RyaW5nW107IGluY2x1ZGVDb2xsZWN0aW9ucz86IHN0cmluZ1tdIH0gfCBudWxsO1xuICBwcml2YXRlIF9zdG9wcGVkOiBib29sZWFuO1xuICBwcml2YXRlIF90YWlsSGFuZGxlOiBhbnk7XG4gIHByaXZhdGUgX3JlYWR5UHJvbWlzZVJlc29sdmVyOiAoKCkgPT4gdm9pZCkgfCBudWxsO1xuICBwcml2YXRlIF9yZWFkeVByb21pc2U6IFByb21pc2U8dm9pZD47XG4gIHB1YmxpYyBfY3Jvc3NiYXI6IGFueTtcbiAgcHJpdmF0ZSBfYmFzZU9wbG9nU2VsZWN0b3I6IGFueTtcbiAgcHJpdmF0ZSBfY2F0Y2hpbmdVcFJlc29sdmVyczogQ2F0Y2hpbmdVcFJlc29sdmVyW107XG4gIHByaXZhdGUgX2xhc3RQcm9jZXNzZWRUUzogYW55O1xuICBwcml2YXRlIF9vblNraXBwZWRFbnRyaWVzSG9vazogYW55O1xuICBwcml2YXRlIF9zdGFydFRyYWlsaW5nUHJvbWlzZTogUHJvbWlzZTx2b2lkPjtcbiAgcHJpdmF0ZSBfcmVzb2x2ZVRpbWVvdXQ6IGFueTtcblxuICBwcml2YXRlIF9lbnRyeVF1ZXVlID0gbmV3IE1ldGVvci5fRG91YmxlRW5kZWRRdWV1ZSgpO1xuICBwcml2YXRlIF93b3JrZXJBY3RpdmUgPSBmYWxzZTtcbiAgcHJpdmF0ZSBfd29ya2VyUHJvbWlzZTogUHJvbWlzZTx2b2lkPiB8IG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKG9wbG9nVXJsOiBzdHJpbmcsIGRiTmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5fb3Bsb2dVcmwgPSBvcGxvZ1VybDtcbiAgICB0aGlzLl9kYk5hbWUgPSBkYk5hbWU7XG5cbiAgICB0aGlzLl9yZXNvbHZlVGltZW91dCA9IG51bGw7XG4gICAgdGhpcy5fb3Bsb2dMYXN0RW50cnlDb25uZWN0aW9uID0gbnVsbDtcbiAgICB0aGlzLl9vcGxvZ1RhaWxDb25uZWN0aW9uID0gbnVsbDtcbiAgICB0aGlzLl9vcGxvZ09wdGlvbnMgPSBudWxsO1xuICAgIHRoaXMuX3N0b3BwZWQgPSBmYWxzZTtcbiAgICB0aGlzLl90YWlsSGFuZGxlID0gbnVsbDtcbiAgICB0aGlzLl9yZWFkeVByb21pc2VSZXNvbHZlciA9IG51bGw7XG4gICAgdGhpcy5fcmVhZHlQcm9taXNlID0gbmV3IFByb21pc2UociA9PiB0aGlzLl9yZWFkeVByb21pc2VSZXNvbHZlciA9IHIpO1xuICAgIHRoaXMuX2Nyb3NzYmFyID0gbmV3IEREUFNlcnZlci5fQ3Jvc3NiYXIoe1xuICAgICAgZmFjdFBhY2thZ2U6IFwibW9uZ28tbGl2ZWRhdGFcIiwgZmFjdE5hbWU6IFwib3Bsb2ctd2F0Y2hlcnNcIlxuICAgIH0pO1xuICAgIHRoaXMuX2Jhc2VPcGxvZ1NlbGVjdG9yID0ge1xuICAgICAgbnM6IG5ldyBSZWdFeHAoXCJeKD86XCIgKyBbXG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgTWV0ZW9yLl9lc2NhcGVSZWdFeHAodGhpcy5fZGJOYW1lICsgXCIuXCIpLFxuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIE1ldGVvci5fZXNjYXBlUmVnRXhwKFwiYWRtaW4uJGNtZFwiKSxcbiAgICAgIF0uam9pbihcInxcIikgKyBcIilcIiksXG5cbiAgICAgICRvcjogW1xuICAgICAgICB7IG9wOiB7ICRpbjogWydpJywgJ3UnLCAnZCddIH0gfSxcbiAgICAgICAgeyBvcDogJ2MnLCAnby5kcm9wJzogeyAkZXhpc3RzOiB0cnVlIH0gfSxcbiAgICAgICAgeyBvcDogJ2MnLCAnby5kcm9wRGF0YWJhc2UnOiAxIH0sXG4gICAgICAgIHsgb3A6ICdjJywgJ28uYXBwbHlPcHMnOiB7ICRleGlzdHM6IHRydWUgfSB9LFxuICAgICAgXVxuICAgIH07XG5cbiAgICB0aGlzLl9jYXRjaGluZ1VwUmVzb2x2ZXJzID0gW107XG4gICAgdGhpcy5fbGFzdFByb2Nlc3NlZFRTID0gbnVsbDtcblxuICAgIHRoaXMuX29uU2tpcHBlZEVudHJpZXNIb29rID0gbmV3IEhvb2soe1xuICAgICAgZGVidWdQcmludEV4Y2VwdGlvbnM6IFwib25Ta2lwcGVkRW50cmllcyBjYWxsYmFja1wiXG4gICAgfSk7XG5cbiAgICB0aGlzLl9zdGFydFRyYWlsaW5nUHJvbWlzZSA9IHRoaXMuX3N0YXJ0VGFpbGluZygpO1xuICB9XG5cbiAgYXN5bmMgc3RvcCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5fc3RvcHBlZCkgcmV0dXJuO1xuICAgIHRoaXMuX3N0b3BwZWQgPSB0cnVlO1xuICAgIGlmICh0aGlzLl90YWlsSGFuZGxlKSB7XG4gICAgICBhd2FpdCB0aGlzLl90YWlsSGFuZGxlLnN0b3AoKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBfb25PcGxvZ0VudHJ5KHRyaWdnZXI6IE9wbG9nVHJpZ2dlciwgY2FsbGJhY2s6IEZ1bmN0aW9uKTogUHJvbWlzZTx7IHN0b3A6ICgpID0+IFByb21pc2U8dm9pZD4gfT4ge1xuICAgIGlmICh0aGlzLl9zdG9wcGVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYWxsZWQgb25PcGxvZ0VudHJ5IG9uIHN0b3BwZWQgaGFuZGxlIVwiKTtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLl9yZWFkeVByb21pc2U7XG5cbiAgICBjb25zdCBvcmlnaW5hbENhbGxiYWNrID0gY2FsbGJhY2s7XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGRlcGVuZHMgb24gQXN5bmNocm9ub3VzUXVldWUgdGFza3MgYmVpbmcgd3JhcHBlZCBpbiBgYmluZEVudmlyb25tZW50YCB0b28uXG4gICAgICpcbiAgICAgKiBAdG9kbyBDaGVjayBhZnRlciB3ZSBzaW1wbGlmeSB0aGUgYGJpbmRFbnZpcm9ubWVudGAgaW1wbGVtZW50YXRpb24gaWYgd2UgY2FuIHJlbW92ZSB0aGUgc2Vjb25kIHdyYXAuXG4gICAgICovXG4gICAgY2FsbGJhY2sgPSBNZXRlb3IuYmluZEVudmlyb25tZW50KFxuICAgICAgZnVuY3Rpb24gKG5vdGlmaWNhdGlvbjogYW55KSB7XG4gICAgICAgIG9yaWdpbmFsQ2FsbGJhY2sobm90aWZpY2F0aW9uKTtcbiAgICAgIH0sXG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgIE1ldGVvci5fZGVidWcoXCJFcnJvciBpbiBvcGxvZyBjYWxsYmFja1wiLCBlcnIpO1xuICAgICAgfVxuICAgICk7XG5cbiAgICBjb25zdCBsaXN0ZW5IYW5kbGUgPSB0aGlzLl9jcm9zc2Jhci5saXN0ZW4odHJpZ2dlciwgY2FsbGJhY2spO1xuICAgIHJldHVybiB7XG4gICAgICBzdG9wOiBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGF3YWl0IGxpc3RlbkhhbmRsZS5zdG9wKCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIG9uT3Bsb2dFbnRyeSh0cmlnZ2VyOiBPcGxvZ1RyaWdnZXIsIGNhbGxiYWNrOiBGdW5jdGlvbik6IFByb21pc2U8eyBzdG9wOiAoKSA9PiBQcm9taXNlPHZvaWQ+IH0+IHtcbiAgICByZXR1cm4gdGhpcy5fb25PcGxvZ0VudHJ5KHRyaWdnZXIsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uU2tpcHBlZEVudHJpZXMoY2FsbGJhY2s6IEZ1bmN0aW9uKTogeyBzdG9wOiAoKSA9PiB2b2lkIH0ge1xuICAgIGlmICh0aGlzLl9zdG9wcGVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYWxsZWQgb25Ta2lwcGVkRW50cmllcyBvbiBzdG9wcGVkIGhhbmRsZSFcIik7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9vblNraXBwZWRFbnRyaWVzSG9vay5yZWdpc3RlcihjYWxsYmFjayk7XG4gIH1cblxuICBhc3luYyBfd2FpdFVudGlsQ2F1Z2h0VXAoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuX3N0b3BwZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbGxlZCB3YWl0VW50aWxDYXVnaHRVcCBvbiBzdG9wcGVkIGhhbmRsZSFcIik7XG4gICAgfVxuXG4gICAgYXdhaXQgdGhpcy5fcmVhZHlQcm9taXNlO1xuXG4gICAgbGV0IGxhc3RFbnRyeTogT3Bsb2dFbnRyeSB8IG51bGwgPSBudWxsO1xuXG4gICAgd2hpbGUgKCF0aGlzLl9zdG9wcGVkKSB7XG4gICAgICB0cnkge1xuICAgICAgICBsYXN0RW50cnkgPSBhd2FpdCB0aGlzLl9vcGxvZ0xhc3RFbnRyeUNvbm5lY3Rpb24uZmluZE9uZUFzeW5jKFxuICAgICAgICAgIE9QTE9HX0NPTExFQ1RJT04sXG4gICAgICAgICAgdGhpcy5fYmFzZU9wbG9nU2VsZWN0b3IsXG4gICAgICAgICAgeyBwcm9qZWN0aW9uOiB7IHRzOiAxIH0sIHNvcnQ6IHsgJG5hdHVyYWw6IC0xIH0gfVxuICAgICAgICApO1xuICAgICAgICBicmVhaztcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgTWV0ZW9yLl9kZWJ1ZyhcIkdvdCBleGNlcHRpb24gd2hpbGUgcmVhZGluZyBsYXN0IGVudHJ5XCIsIGUpO1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGF3YWl0IE1ldGVvci5zbGVlcCgxMDApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLl9zdG9wcGVkKSByZXR1cm47XG5cbiAgICBpZiAoIWxhc3RFbnRyeSkgcmV0dXJuO1xuXG4gICAgY29uc3QgdHMgPSBsYXN0RW50cnkudHM7XG4gICAgaWYgKCF0cykge1xuICAgICAgdGhyb3cgRXJyb3IoXCJvcGxvZyBlbnRyeSB3aXRob3V0IHRzOiBcIiArIEpTT04uc3RyaW5naWZ5KGxhc3RFbnRyeSkpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9sYXN0UHJvY2Vzc2VkVFMgJiYgdHMubGVzc1RoYW5PckVxdWFsKHRoaXMuX2xhc3RQcm9jZXNzZWRUUykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgaW5zZXJ0QWZ0ZXIgPSB0aGlzLl9jYXRjaGluZ1VwUmVzb2x2ZXJzLmxlbmd0aDtcblxuICAgIHdoaWxlIChpbnNlcnRBZnRlciAtIDEgPiAwICYmIHRoaXMuX2NhdGNoaW5nVXBSZXNvbHZlcnNbaW5zZXJ0QWZ0ZXIgLSAxXS50cy5ncmVhdGVyVGhhbih0cykpIHtcbiAgICAgIGluc2VydEFmdGVyLS07XG4gICAgfVxuXG4gICAgbGV0IHByb21pc2VSZXNvbHZlciA9IG51bGw7XG5cbiAgICBjb25zdCBwcm9taXNlVG9Bd2FpdCA9IG5ldyBQcm9taXNlKHIgPT4gcHJvbWlzZVJlc29sdmVyID0gcik7XG5cbiAgICBjbGVhclRpbWVvdXQodGhpcy5fcmVzb2x2ZVRpbWVvdXQpO1xuXG4gICAgdGhpcy5fcmVzb2x2ZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJNZXRlb3I6IG9wbG9nIGNhdGNoaW5nIHVwIHRvb2sgdG9vIGxvbmdcIiwgeyB0cyB9KTtcbiAgICB9LCAxMDAwMCk7XG5cbiAgICB0aGlzLl9jYXRjaGluZ1VwUmVzb2x2ZXJzLnNwbGljZShpbnNlcnRBZnRlciwgMCwgeyB0cywgcmVzb2x2ZXI6IHByb21pc2VSZXNvbHZlciEgfSk7XG5cbiAgICBhd2FpdCBwcm9taXNlVG9Bd2FpdDtcblxuICAgIGNsZWFyVGltZW91dCh0aGlzLl9yZXNvbHZlVGltZW91dCk7XG4gIH1cblxuICBhc3luYyB3YWl0VW50aWxDYXVnaHRVcCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5fd2FpdFVudGlsQ2F1Z2h0VXAoKTtcbiAgfVxuXG4gIGFzeW5jIF9zdGFydFRhaWxpbmcoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgbW9uZ29kYlVyaSA9IHJlcXVpcmUoJ21vbmdvZGItdXJpJyk7XG4gICAgaWYgKG1vbmdvZGJVcmkucGFyc2UodGhpcy5fb3Bsb2dVcmwpLmRhdGFiYXNlICE9PSAnbG9jYWwnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCIkTU9OR09fT1BMT0dfVVJMIG11c3QgYmUgc2V0IHRvIHRoZSAnbG9jYWwnIGRhdGFiYXNlIG9mIGEgTW9uZ28gcmVwbGljYSBzZXRcIik7XG4gICAgfVxuXG4gICAgdGhpcy5fb3Bsb2dUYWlsQ29ubmVjdGlvbiA9IG5ldyBNb25nb0Nvbm5lY3Rpb24oXG4gICAgICB0aGlzLl9vcGxvZ1VybCwgeyBtYXhQb29sU2l6ZTogMSwgbWluUG9vbFNpemU6IDEgfVxuICAgICk7XG4gICAgdGhpcy5fb3Bsb2dMYXN0RW50cnlDb25uZWN0aW9uID0gbmV3IE1vbmdvQ29ubmVjdGlvbihcbiAgICAgIHRoaXMuX29wbG9nVXJsLCB7IG1heFBvb2xTaXplOiAxLCBtaW5Qb29sU2l6ZTogMSB9XG4gICAgKTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBpc01hc3RlckRvYyA9IGF3YWl0IHRoaXMuX29wbG9nTGFzdEVudHJ5Q29ubmVjdGlvbiEuZGJcbiAgICAgICAgLmFkbWluKClcbiAgICAgICAgLmNvbW1hbmQoeyBpc21hc3RlcjogMSB9KTtcblxuICAgICAgaWYgKCEoaXNNYXN0ZXJEb2MgJiYgaXNNYXN0ZXJEb2Muc2V0TmFtZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiJE1PTkdPX09QTE9HX1VSTCBtdXN0IGJlIHNldCB0byB0aGUgJ2xvY2FsJyBkYXRhYmFzZSBvZiBhIE1vbmdvIHJlcGxpY2Egc2V0XCIpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBsYXN0T3Bsb2dFbnRyeSA9IGF3YWl0IHRoaXMuX29wbG9nTGFzdEVudHJ5Q29ubmVjdGlvbi5maW5kT25lQXN5bmMoXG4gICAgICAgIE9QTE9HX0NPTExFQ1RJT04sXG4gICAgICAgIHt9LFxuICAgICAgICB7IHNvcnQ6IHsgJG5hdHVyYWw6IC0xIH0sIHByb2plY3Rpb246IHsgdHM6IDEgfSB9XG4gICAgICApO1xuXG4gICAgICBsZXQgb3Bsb2dTZWxlY3RvcjogYW55ID0geyAuLi50aGlzLl9iYXNlT3Bsb2dTZWxlY3RvciB9O1xuICAgICAgaWYgKGxhc3RPcGxvZ0VudHJ5KSB7XG4gICAgICAgIG9wbG9nU2VsZWN0b3IudHMgPSB7ICRndDogbGFzdE9wbG9nRW50cnkudHMgfTtcbiAgICAgICAgdGhpcy5fbGFzdFByb2Nlc3NlZFRTID0gbGFzdE9wbG9nRW50cnkudHM7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGluY2x1ZGVDb2xsZWN0aW9ucyA9IE1ldGVvci5zZXR0aW5ncz8ucGFja2FnZXM/Lm1vbmdvPy5vcGxvZ0luY2x1ZGVDb2xsZWN0aW9ucztcbiAgICAgIGNvbnN0IGV4Y2x1ZGVDb2xsZWN0aW9ucyA9IE1ldGVvci5zZXR0aW5ncz8ucGFja2FnZXM/Lm1vbmdvPy5vcGxvZ0V4Y2x1ZGVDb2xsZWN0aW9ucztcblxuICAgICAgaWYgKGluY2x1ZGVDb2xsZWN0aW9ucz8ubGVuZ3RoICYmIGV4Y2x1ZGVDb2xsZWN0aW9ucz8ubGVuZ3RoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IHVzZSBib3RoIG1vbmdvIG9wbG9nIHNldHRpbmdzIG9wbG9nSW5jbHVkZUNvbGxlY3Rpb25zIGFuZCBvcGxvZ0V4Y2x1ZGVDb2xsZWN0aW9ucyBhdCB0aGUgc2FtZSB0aW1lLlwiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGV4Y2x1ZGVDb2xsZWN0aW9ucz8ubGVuZ3RoKSB7XG4gICAgICAgIG9wbG9nU2VsZWN0b3IubnMgPSB7XG4gICAgICAgICAgJHJlZ2V4OiBvcGxvZ1NlbGVjdG9yLm5zLFxuICAgICAgICAgICRuaW46IGV4Y2x1ZGVDb2xsZWN0aW9ucy5tYXAoKGNvbGxOYW1lOiBzdHJpbmcpID0+IGAke3RoaXMuX2RiTmFtZX0uJHtjb2xsTmFtZX1gKVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLl9vcGxvZ09wdGlvbnMgPSB7IGV4Y2x1ZGVDb2xsZWN0aW9ucyB9O1xuICAgICAgfSBlbHNlIGlmIChpbmNsdWRlQ29sbGVjdGlvbnM/Lmxlbmd0aCkge1xuICAgICAgICBvcGxvZ1NlbGVjdG9yID0ge1xuICAgICAgICAgICRhbmQ6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgJG9yOiBbXG4gICAgICAgICAgICAgICAgeyBuczogL15hZG1pblxcLlxcJGNtZC8gfSxcbiAgICAgICAgICAgICAgICB7IG5zOiB7ICRpbjogaW5jbHVkZUNvbGxlY3Rpb25zLm1hcCgoY29sbE5hbWU6IHN0cmluZykgPT4gYCR7dGhpcy5fZGJOYW1lfS4ke2NvbGxOYW1lfWApIH0gfVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeyAkb3I6IG9wbG9nU2VsZWN0b3IuJG9yIH0sXG4gICAgICAgICAgICB7IHRzOiBvcGxvZ1NlbGVjdG9yLnRzIH1cbiAgICAgICAgICBdXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuX29wbG9nT3B0aW9ucyA9IHsgaW5jbHVkZUNvbGxlY3Rpb25zIH07XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGN1cnNvckRlc2NyaXB0aW9uID0gbmV3IEN1cnNvckRlc2NyaXB0aW9uKFxuICAgICAgICBPUExPR19DT0xMRUNUSU9OLFxuICAgICAgICBvcGxvZ1NlbGVjdG9yLFxuICAgICAgICB7IHRhaWxhYmxlOiB0cnVlIH1cbiAgICAgICk7XG5cbiAgICAgIHRoaXMuX3RhaWxIYW5kbGUgPSB0aGlzLl9vcGxvZ1RhaWxDb25uZWN0aW9uLnRhaWwoXG4gICAgICAgIGN1cnNvckRlc2NyaXB0aW9uLFxuICAgICAgICAoZG9jOiBhbnkpID0+IHtcbiAgICAgICAgICB0aGlzLl9lbnRyeVF1ZXVlLnB1c2goZG9jKTtcbiAgICAgICAgICB0aGlzLl9tYXliZVN0YXJ0V29ya2VyKCk7XG4gICAgICAgIH0sXG4gICAgICAgIFRBSUxfVElNRU9VVFxuICAgICAgKTtcblxuICAgICAgdGhpcy5fcmVhZHlQcm9taXNlUmVzb2x2ZXIhKCk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluIF9zdGFydFRhaWxpbmc6JywgZXJyb3IpO1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfbWF5YmVTdGFydFdvcmtlcigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fd29ya2VyUHJvbWlzZSkgcmV0dXJuO1xuICAgIHRoaXMuX3dvcmtlckFjdGl2ZSA9IHRydWU7XG5cbiAgICAvLyBDb252ZXJ0IHRvIGEgcHJvcGVyIHByb21pc2UtYmFzZWQgcXVldWUgcHJvY2Vzc29yXG4gICAgdGhpcy5fd29ya2VyUHJvbWlzZSA9IChhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICB3aGlsZSAoIXRoaXMuX3N0b3BwZWQgJiYgIXRoaXMuX2VudHJ5UXVldWUuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgLy8gQXJlIHdlIHRvbyBmYXIgYmVoaW5kPyBKdXN0IHRlbGwgb3VyIG9ic2VydmVycyB0aGF0IHRoZXkgbmVlZCB0b1xuICAgICAgICAgIC8vIHJlcG9sbCwgYW5kIGRyb3Agb3VyIHF1ZXVlLlxuICAgICAgICAgIGlmICh0aGlzLl9lbnRyeVF1ZXVlLmxlbmd0aCA+IFRPT19GQVJfQkVISU5EKSB7XG4gICAgICAgICAgICBjb25zdCBsYXN0RW50cnkgPSB0aGlzLl9lbnRyeVF1ZXVlLnBvcCgpO1xuICAgICAgICAgICAgdGhpcy5fZW50cnlRdWV1ZS5jbGVhcigpO1xuXG4gICAgICAgICAgICB0aGlzLl9vblNraXBwZWRFbnRyaWVzSG9vay5lYWNoKChjYWxsYmFjazogRnVuY3Rpb24pID0+IHtcbiAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gRnJlZSBhbnkgd2FpdFVudGlsQ2F1Z2h0VXAoKSBjYWxscyB0aGF0IHdlcmUgd2FpdGluZyBmb3IgdXMgdG9cbiAgICAgICAgICAgIC8vIHBhc3Mgc29tZXRoaW5nIHRoYXQgd2UganVzdCBza2lwcGVkLlxuICAgICAgICAgICAgdGhpcy5fc2V0TGFzdFByb2Nlc3NlZFRTKGxhc3RFbnRyeS50cyk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBQcm9jZXNzIG5leHQgYmF0Y2ggZnJvbSB0aGUgcXVldWVcbiAgICAgICAgICBjb25zdCBkb2MgPSB0aGlzLl9lbnRyeVF1ZXVlLnNoaWZ0KCk7XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgaGFuZGxlRG9jKHRoaXMsIGRvYyk7XG4gICAgICAgICAgICAvLyBQcm9jZXNzIGFueSB3YWl0aW5nIGZlbmNlIGNhbGxiYWNrc1xuICAgICAgICAgICAgaWYgKGRvYy50cykge1xuICAgICAgICAgICAgICB0aGlzLl9zZXRMYXN0UHJvY2Vzc2VkVFMoZG9jLnRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAvLyBLZWVwIHByb2Nlc3NpbmcgcXVldWUgZXZlbiBpZiBvbmUgZW50cnkgZmFpbHNcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHByb2Nlc3Npbmcgb3Bsb2cgZW50cnk6JywgZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB0aGlzLl93b3JrZXJQcm9taXNlID0gbnVsbDtcbiAgICAgICAgdGhpcy5fd29ya2VyQWN0aXZlID0gZmFsc2U7XG4gICAgICB9XG4gICAgfSkoKTtcbiAgfVxuXG4gIF9zZXRMYXN0UHJvY2Vzc2VkVFModHM6IGFueSk6IHZvaWQge1xuICAgIHRoaXMuX2xhc3RQcm9jZXNzZWRUUyA9IHRzO1xuICAgIHdoaWxlICghaXNFbXB0eSh0aGlzLl9jYXRjaGluZ1VwUmVzb2x2ZXJzKSAmJiB0aGlzLl9jYXRjaGluZ1VwUmVzb2x2ZXJzWzBdLnRzLmxlc3NUaGFuT3JFcXVhbCh0aGlzLl9sYXN0UHJvY2Vzc2VkVFMpKSB7XG4gICAgICBjb25zdCBzZXF1ZW5jZXIgPSB0aGlzLl9jYXRjaGluZ1VwUmVzb2x2ZXJzLnNoaWZ0KCkhO1xuICAgICAgc2VxdWVuY2VyLnJlc29sdmVyKCk7XG4gICAgfVxuICB9XG5cbiAgX2RlZmluZVRvb0ZhckJlaGluZCh2YWx1ZTogbnVtYmVyKTogdm9pZCB7XG4gICAgVE9PX0ZBUl9CRUhJTkQgPSB2YWx1ZTtcbiAgfVxuXG4gIF9yZXNldFRvb0ZhckJlaGluZCgpOiB2b2lkIHtcbiAgICBUT09fRkFSX0JFSElORCA9ICsocHJvY2Vzcy5lbnYuTUVURU9SX09QTE9HX1RPT19GQVJfQkVISU5EIHx8IDIwMDApO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpZEZvck9wKG9wOiBPcGxvZ0VudHJ5KTogc3RyaW5nIHtcbiAgaWYgKG9wLm9wID09PSAnZCcgfHwgb3Aub3AgPT09ICdpJykge1xuICAgIHJldHVybiBvcC5vLl9pZDtcbiAgfSBlbHNlIGlmIChvcC5vcCA9PT0gJ3UnKSB7XG4gICAgcmV0dXJuIG9wLm8yLl9pZDtcbiAgfSBlbHNlIGlmIChvcC5vcCA9PT0gJ2MnKSB7XG4gICAgdGhyb3cgRXJyb3IoXCJPcGVyYXRvciAnYycgZG9lc24ndCBzdXBwbHkgYW4gb2JqZWN0IHdpdGggaWQ6IFwiICsgSlNPTi5zdHJpbmdpZnkob3ApKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBFcnJvcihcIlVua25vd24gb3A6IFwiICsgSlNPTi5zdHJpbmdpZnkob3ApKTtcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVEb2MoaGFuZGxlOiBPcGxvZ0hhbmRsZSwgZG9jOiBPcGxvZ0VudHJ5KTogUHJvbWlzZTx2b2lkPiB7XG4gIGlmIChkb2MubnMgPT09IFwiYWRtaW4uJGNtZFwiKSB7XG4gICAgaWYgKGRvYy5vLmFwcGx5T3BzKSB7XG4gICAgICAvLyBUaGlzIHdhcyBhIHN1Y2Nlc3NmdWwgdHJhbnNhY3Rpb24sIHNvIHdlIG5lZWQgdG8gYXBwbHkgdGhlXG4gICAgICAvLyBvcGVyYXRpb25zIHRoYXQgd2VyZSBpbnZvbHZlZC5cbiAgICAgIGxldCBuZXh0VGltZXN0YW1wID0gZG9jLnRzO1xuICAgICAgZm9yIChjb25zdCBvcCBvZiBkb2Muby5hcHBseU9wcykge1xuICAgICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL21ldGVvci9tZXRlb3IvaXNzdWVzLzEwNDIwLlxuICAgICAgICBpZiAoIW9wLnRzKSB7XG4gICAgICAgICAgb3AudHMgPSBuZXh0VGltZXN0YW1wO1xuICAgICAgICAgIG5leHRUaW1lc3RhbXAgPSBuZXh0VGltZXN0YW1wLmFkZChMb25nLk9ORSk7XG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgaGFuZGxlRG9jKGhhbmRsZSwgb3ApO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIGNvbW1hbmQgXCIgKyBKU09OLnN0cmluZ2lmeShkb2MpKTtcbiAgfVxuXG4gIGNvbnN0IHRyaWdnZXI6IE9wbG9nVHJpZ2dlciA9IHtcbiAgICBkcm9wQ29sbGVjdGlvbjogZmFsc2UsXG4gICAgZHJvcERhdGFiYXNlOiBmYWxzZSxcbiAgICBvcDogZG9jLFxuICB9O1xuXG4gIGlmICh0eXBlb2YgZG9jLm5zID09PSBcInN0cmluZ1wiICYmIGRvYy5ucy5zdGFydHNXaXRoKGhhbmRsZS5fZGJOYW1lICsgXCIuXCIpKSB7XG4gICAgdHJpZ2dlci5jb2xsZWN0aW9uID0gZG9jLm5zLnNsaWNlKGhhbmRsZS5fZGJOYW1lLmxlbmd0aCArIDEpO1xuICB9XG5cbiAgLy8gSXMgaXQgYSBzcGVjaWFsIGNvbW1hbmQgYW5kIHRoZSBjb2xsZWN0aW9uIG5hbWUgaXMgaGlkZGVuXG4gIC8vIHNvbWV3aGVyZSBpbiBvcGVyYXRvcj9cbiAgaWYgKHRyaWdnZXIuY29sbGVjdGlvbiA9PT0gXCIkY21kXCIpIHtcbiAgICBpZiAoZG9jLm8uZHJvcERhdGFiYXNlKSB7XG4gICAgICBkZWxldGUgdHJpZ2dlci5jb2xsZWN0aW9uO1xuICAgICAgdHJpZ2dlci5kcm9wRGF0YWJhc2UgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAoXCJkcm9wXCIgaW4gZG9jLm8pIHtcbiAgICAgIHRyaWdnZXIuY29sbGVjdGlvbiA9IGRvYy5vLmRyb3A7XG4gICAgICB0cmlnZ2VyLmRyb3BDb2xsZWN0aW9uID0gdHJ1ZTtcbiAgICAgIHRyaWdnZXIuaWQgPSBudWxsO1xuICAgIH0gZWxzZSBpZiAoXCJjcmVhdGVcIiBpbiBkb2MubyAmJiBcImlkSW5kZXhcIiBpbiBkb2Mubykge1xuICAgICAgLy8gQSBjb2xsZWN0aW9uIGdvdCBpbXBsaWNpdGx5IGNyZWF0ZWQgd2l0aGluIGEgdHJhbnNhY3Rpb24uIFRoZXJlJ3NcbiAgICAgIC8vIG5vIG5lZWQgdG8gZG8gYW55dGhpbmcgYWJvdXQgaXQuXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IEVycm9yKFwiVW5rbm93biBjb21tYW5kIFwiICsgSlNPTi5zdHJpbmdpZnkoZG9jKSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIEFsbCBvdGhlciBvcHMgaGF2ZSBhbiBpZC5cbiAgICB0cmlnZ2VyLmlkID0gaWRGb3JPcChkb2MpO1xuICB9XG5cbiAgYXdhaXQgaGFuZGxlLl9jcm9zc2Jhci5maXJlKHRyaWdnZXIpO1xuXG4gIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gc2V0SW1tZWRpYXRlKHJlc29sdmUpKTtcbn0iLCJpbXBvcnQgaXNFbXB0eSBmcm9tICdsb2Rhc2guaXNlbXB0eSc7XG5pbXBvcnQgeyBPYnNlcnZlSGFuZGxlIH0gZnJvbSAnLi9vYnNlcnZlX2hhbmRsZSc7XG5cbmludGVyZmFjZSBPYnNlcnZlTXVsdGlwbGV4ZXJPcHRpb25zIHtcbiAgb3JkZXJlZDogYm9vbGVhbjtcbiAgb25TdG9wPzogKCkgPT4gdm9pZDtcbn1cblxuZXhwb3J0IHR5cGUgT2JzZXJ2ZUhhbmRsZUNhbGxiYWNrID0gJ2FkZGVkJyB8ICdhZGRlZEJlZm9yZScgfCAnY2hhbmdlZCcgfCAnbW92ZWRCZWZvcmUnIHwgJ3JlbW92ZWQnO1xuXG4vKipcbiAqIEFsbG93cyBtdWx0aXBsZSBpZGVudGljYWwgT2JzZXJ2ZUhhbmRsZXMgdG8gYmUgZHJpdmVuIGJ5IGEgc2luZ2xlIG9ic2VydmUgZHJpdmVyLlxuICpcbiAqIFRoaXMgb3B0aW1pemF0aW9uIGVuc3VyZXMgdGhhdCBtdWx0aXBsZSBpZGVudGljYWwgb2JzZXJ2YXRpb25zXG4gKiBkb24ndCByZXN1bHQgaW4gZHVwbGljYXRlIGRhdGFiYXNlIHF1ZXJpZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBPYnNlcnZlTXVsdGlwbGV4ZXIge1xuICBwcml2YXRlIHJlYWRvbmx5IF9vcmRlcmVkOiBib29sZWFuO1xuICBwcml2YXRlIHJlYWRvbmx5IF9vblN0b3A6ICgpID0+IHZvaWQ7XG4gIHByaXZhdGUgX3F1ZXVlOiBhbnk7XG4gIHByaXZhdGUgX2hhbmRsZXM6IHsgW2tleTogc3RyaW5nXTogT2JzZXJ2ZUhhbmRsZSB9IHwgbnVsbDtcbiAgcHJpdmF0ZSBfcmVzb2x2ZXI6ICgodmFsdWU/OiB1bmtub3duKSA9PiB2b2lkKSB8IG51bGw7XG4gIHByaXZhdGUgcmVhZG9ubHkgX3JlYWR5UHJvbWlzZTogUHJvbWlzZTxib29sZWFuIHwgdm9pZD47XG4gIHByaXZhdGUgX2lzUmVhZHk6IGJvb2xlYW47XG4gIHByaXZhdGUgX2NhY2hlOiBhbnk7XG4gIHByaXZhdGUgX2FkZEhhbmRsZVRhc2tzU2NoZWR1bGVkQnV0Tm90UGVyZm9ybWVkOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoeyBvcmRlcmVkLCBvblN0b3AgPSAoKSA9PiB7fSB9OiBPYnNlcnZlTXVsdGlwbGV4ZXJPcHRpb25zKSB7XG4gICAgaWYgKG9yZGVyZWQgPT09IHVuZGVmaW5lZCkgdGhyb3cgRXJyb3IoXCJtdXN0IHNwZWNpZnkgb3JkZXJlZFwiKTtcblxuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBQYWNrYWdlWydmYWN0cy1iYXNlJ10gJiYgUGFja2FnZVsnZmFjdHMtYmFzZSddXG4gICAgICAgIC5GYWN0cy5pbmNyZW1lbnRTZXJ2ZXJGYWN0KFwibW9uZ28tbGl2ZWRhdGFcIiwgXCJvYnNlcnZlLW11bHRpcGxleGVyc1wiLCAxKTtcblxuICAgIHRoaXMuX29yZGVyZWQgPSBvcmRlcmVkO1xuICAgIHRoaXMuX29uU3RvcCA9IG9uU3RvcDtcbiAgICB0aGlzLl9xdWV1ZSA9IG5ldyBNZXRlb3IuX0FzeW5jaHJvbm91c1F1ZXVlKCk7XG4gICAgdGhpcy5faGFuZGxlcyA9IHt9O1xuICAgIHRoaXMuX3Jlc29sdmVyID0gbnVsbDtcbiAgICB0aGlzLl9pc1JlYWR5ID0gZmFsc2U7XG4gICAgdGhpcy5fcmVhZHlQcm9taXNlID0gbmV3IFByb21pc2UociA9PiB0aGlzLl9yZXNvbHZlciA9IHIpLnRoZW4oKCkgPT4gdGhpcy5faXNSZWFkeSA9IHRydWUpO1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICB0aGlzLl9jYWNoZSA9IG5ldyBMb2NhbENvbGxlY3Rpb24uX0NhY2hpbmdDaGFuZ2VPYnNlcnZlcih7IG9yZGVyZWQgfSk7XG4gICAgdGhpcy5fYWRkSGFuZGxlVGFza3NTY2hlZHVsZWRCdXROb3RQZXJmb3JtZWQgPSAwO1xuXG4gICAgdGhpcy5jYWxsYmFja05hbWVzKCkuZm9yRWFjaChjYWxsYmFja05hbWUgPT4ge1xuICAgICAgKHRoaXMgYXMgYW55KVtjYWxsYmFja05hbWVdID0gKC4uLmFyZ3M6IGFueVtdKSA9PiB7XG4gICAgICAgIHRoaXMuX2FwcGx5Q2FsbGJhY2soY2FsbGJhY2tOYW1lLCBhcmdzKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBhZGRIYW5kbGVBbmRTZW5kSW5pdGlhbEFkZHMoaGFuZGxlOiBPYnNlcnZlSGFuZGxlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMuX2FkZEhhbmRsZUFuZFNlbmRJbml0aWFsQWRkcyhoYW5kbGUpO1xuICB9XG5cbiAgYXN5bmMgX2FkZEhhbmRsZUFuZFNlbmRJbml0aWFsQWRkcyhoYW5kbGU6IE9ic2VydmVIYW5kbGUpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICArK3RoaXMuX2FkZEhhbmRsZVRhc2tzU2NoZWR1bGVkQnV0Tm90UGVyZm9ybWVkO1xuXG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIFBhY2thZ2VbJ2ZhY3RzLWJhc2UnXSAmJiBQYWNrYWdlWydmYWN0cy1iYXNlJ10uRmFjdHMuaW5jcmVtZW50U2VydmVyRmFjdChcbiAgICAgIFwibW9uZ28tbGl2ZWRhdGFcIiwgXCJvYnNlcnZlLWhhbmRsZXNcIiwgMSk7XG5cbiAgICBhd2FpdCB0aGlzLl9xdWV1ZS5ydW5UYXNrKGFzeW5jICgpID0+IHtcbiAgICAgIHRoaXMuX2hhbmRsZXMhW2hhbmRsZS5faWRdID0gaGFuZGxlO1xuICAgICAgYXdhaXQgdGhpcy5fc2VuZEFkZHMoaGFuZGxlKTtcbiAgICAgIC0tdGhpcy5fYWRkSGFuZGxlVGFza3NTY2hlZHVsZWRCdXROb3RQZXJmb3JtZWQ7XG4gICAgfSk7XG4gICAgYXdhaXQgdGhpcy5fcmVhZHlQcm9taXNlO1xuICB9XG5cbiAgYXN5bmMgcmVtb3ZlSGFuZGxlKGlkOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIXRoaXMuX3JlYWR5KCkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCByZW1vdmUgaGFuZGxlcyB1bnRpbCB0aGUgbXVsdGlwbGV4IGlzIHJlYWR5XCIpO1xuXG4gICAgZGVsZXRlIHRoaXMuX2hhbmRsZXMhW2lkXTtcblxuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBQYWNrYWdlWydmYWN0cy1iYXNlJ10gJiYgUGFja2FnZVsnZmFjdHMtYmFzZSddLkZhY3RzLmluY3JlbWVudFNlcnZlckZhY3QoXG4gICAgICBcIm1vbmdvLWxpdmVkYXRhXCIsIFwib2JzZXJ2ZS1oYW5kbGVzXCIsIC0xKTtcblxuICAgIGlmIChpc0VtcHR5KHRoaXMuX2hhbmRsZXMpICYmXG4gICAgICB0aGlzLl9hZGRIYW5kbGVUYXNrc1NjaGVkdWxlZEJ1dE5vdFBlcmZvcm1lZCA9PT0gMCkge1xuICAgICAgYXdhaXQgdGhpcy5fc3RvcCgpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIF9zdG9wKG9wdGlvbnM6IHsgZnJvbVF1ZXJ5RXJyb3I/OiBib29sZWFuIH0gPSB7fSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghdGhpcy5fcmVhZHkoKSAmJiAhb3B0aW9ucy5mcm9tUXVlcnlFcnJvcilcbiAgICAgIHRocm93IEVycm9yKFwic3VycHJpc2luZyBfc3RvcDogbm90IHJlYWR5XCIpO1xuXG4gICAgYXdhaXQgdGhpcy5fb25TdG9wKCk7XG5cbiAgICAvLyBAdHMtaWdub3JlXG4gICAgUGFja2FnZVsnZmFjdHMtYmFzZSddICYmIFBhY2thZ2VbJ2ZhY3RzLWJhc2UnXVxuICAgICAgICAuRmFjdHMuaW5jcmVtZW50U2VydmVyRmFjdChcIm1vbmdvLWxpdmVkYXRhXCIsIFwib2JzZXJ2ZS1tdWx0aXBsZXhlcnNcIiwgLTEpO1xuXG4gICAgdGhpcy5faGFuZGxlcyA9IG51bGw7XG4gIH1cblxuICBhc3luYyByZWFkeSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLl9xdWV1ZS5xdWV1ZVRhc2soKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuX3JlYWR5KCkpXG4gICAgICAgIHRocm93IEVycm9yKFwiY2FuJ3QgbWFrZSBPYnNlcnZlTXVsdGlwbGV4IHJlYWR5IHR3aWNlIVwiKTtcblxuICAgICAgaWYgKCF0aGlzLl9yZXNvbHZlcikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNaXNzaW5nIHJlc29sdmVyXCIpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9yZXNvbHZlcigpO1xuICAgICAgdGhpcy5faXNSZWFkeSA9IHRydWU7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBxdWVyeUVycm9yKGVycjogRXJyb3IpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLl9xdWV1ZS5ydW5UYXNrKCgpID0+IHtcbiAgICAgIGlmICh0aGlzLl9yZWFkeSgpKVxuICAgICAgICB0aHJvdyBFcnJvcihcImNhbid0IGNsYWltIHF1ZXJ5IGhhcyBhbiBlcnJvciBhZnRlciBpdCB3b3JrZWQhXCIpO1xuICAgICAgdGhpcy5fc3RvcCh7IGZyb21RdWVyeUVycm9yOiB0cnVlIH0pO1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgb25GbHVzaChjYjogKCkgPT4gdm9pZCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuX3F1ZXVlLnF1ZXVlVGFzayhhc3luYyAoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuX3JlYWR5KCkpXG4gICAgICAgIHRocm93IEVycm9yKFwib25seSBjYWxsIG9uRmx1c2ggb24gYSBtdWx0aXBsZXhlciB0aGF0IHdpbGwgYmUgcmVhZHlcIik7XG4gICAgICBhd2FpdCBjYigpO1xuICAgIH0pO1xuICB9XG5cbiAgY2FsbGJhY2tOYW1lcygpOiBPYnNlcnZlSGFuZGxlQ2FsbGJhY2tbXSB7XG4gICAgcmV0dXJuIHRoaXMuX29yZGVyZWRcbiAgICAgID8gW1wiYWRkZWRCZWZvcmVcIiwgXCJjaGFuZ2VkXCIsIFwibW92ZWRCZWZvcmVcIiwgXCJyZW1vdmVkXCJdXG4gICAgICA6IFtcImFkZGVkXCIsIFwiY2hhbmdlZFwiLCBcInJlbW92ZWRcIl07XG4gIH1cblxuICBfcmVhZHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhdGhpcy5faXNSZWFkeTtcbiAgfVxuXG4gIF9hcHBseUNhbGxiYWNrKGNhbGxiYWNrTmFtZTogc3RyaW5nLCBhcmdzOiBhbnlbXSkge1xuICAgIHRoaXMuX3F1ZXVlLnF1ZXVlVGFzayhhc3luYyAoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuX2hhbmRsZXMpIHJldHVybjtcblxuICAgICAgYXdhaXQgdGhpcy5fY2FjaGUuYXBwbHlDaGFuZ2VbY2FsbGJhY2tOYW1lXS5hcHBseShudWxsLCBhcmdzKTtcbiAgICAgIGlmICghdGhpcy5fcmVhZHkoKSAmJlxuICAgICAgICAoY2FsbGJhY2tOYW1lICE9PSAnYWRkZWQnICYmIGNhbGxiYWNrTmFtZSAhPT0gJ2FkZGVkQmVmb3JlJykpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBHb3QgJHtjYWxsYmFja05hbWV9IGR1cmluZyBpbml0aWFsIGFkZHNgKTtcbiAgICAgIH1cblxuICAgICAgZm9yIChjb25zdCBoYW5kbGVJZCBvZiBPYmplY3Qua2V5cyh0aGlzLl9oYW5kbGVzKSkge1xuICAgICAgICBjb25zdCBoYW5kbGUgPSB0aGlzLl9oYW5kbGVzICYmIHRoaXMuX2hhbmRsZXNbaGFuZGxlSWRdO1xuXG4gICAgICAgIGlmICghaGFuZGxlKSByZXR1cm47XG5cbiAgICAgICAgY29uc3QgY2FsbGJhY2sgPSAoaGFuZGxlIGFzIGFueSlbYF8ke2NhbGxiYWNrTmFtZX1gXTtcblxuICAgICAgICBpZiAoIWNhbGxiYWNrKSBjb250aW51ZTtcblxuICAgICAgICBoYW5kbGUuaW5pdGlhbEFkZHNTZW50LnRoZW4oY2FsbGJhY2suYXBwbHkoXG4gICAgICAgICAgbnVsbCxcbiAgICAgICAgICBoYW5kbGUubm9uTXV0YXRpbmdDYWxsYmFja3MgPyBhcmdzIDogRUpTT04uY2xvbmUoYXJncylcbiAgICAgICAgKSlcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIF9zZW5kQWRkcyhoYW5kbGU6IE9ic2VydmVIYW5kbGUpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBhZGQgPSB0aGlzLl9vcmRlcmVkID8gaGFuZGxlLl9hZGRlZEJlZm9yZSA6IGhhbmRsZS5fYWRkZWQ7XG4gICAgaWYgKCFhZGQpIHJldHVybjtcblxuICAgIGNvbnN0IGFkZFByb21pc2VzOiBQcm9taXNlPHZvaWQ+W10gPSBbXTtcblxuICAgIHRoaXMuX2NhY2hlLmRvY3MuZm9yRWFjaCgoZG9jOiBhbnksIGlkOiBzdHJpbmcpID0+IHtcbiAgICAgIGlmICghKGhhbmRsZS5faWQgaW4gdGhpcy5faGFuZGxlcyEpKSB7XG4gICAgICAgIHRocm93IEVycm9yKFwiaGFuZGxlIGdvdCByZW1vdmVkIGJlZm9yZSBzZW5kaW5nIGluaXRpYWwgYWRkcyFcIik7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHsgX2lkLCAuLi5maWVsZHMgfSA9IGhhbmRsZS5ub25NdXRhdGluZ0NhbGxiYWNrcyA/IGRvYyA6IEVKU09OLmNsb25lKGRvYyk7XG5cbiAgICAgIGNvbnN0IHByb21pc2UgPSB0aGlzLl9vcmRlcmVkID9cbiAgICAgICAgYWRkKGlkLCBmaWVsZHMsIG51bGwpIDpcbiAgICAgICAgYWRkKGlkLCBmaWVsZHMpO1xuXG4gICAgICBhZGRQcm9taXNlcy5wdXNoKHByb21pc2UpO1xuICAgIH0pO1xuXG4gICAgYXdhaXQgUHJvbWlzZS5hbGwoYWRkUHJvbWlzZXMpO1xuXG4gICAgaGFuZGxlLmluaXRpYWxBZGRzU2VudFJlc29sdmVyKCk7XG4gIH1cbn0iLCJleHBvcnQgY2xhc3MgRG9jRmV0Y2hlciB7XG4gIGNvbnN0cnVjdG9yKG1vbmdvQ29ubmVjdGlvbikge1xuICAgIHRoaXMuX21vbmdvQ29ubmVjdGlvbiA9IG1vbmdvQ29ubmVjdGlvbjtcbiAgICAvLyBNYXAgZnJvbSBvcCAtPiBbY2FsbGJhY2tdXG4gICAgdGhpcy5fY2FsbGJhY2tzRm9yT3AgPSBuZXcgTWFwKCk7XG4gIH1cblxuICAvLyBGZXRjaGVzIGRvY3VtZW50IFwiaWRcIiBmcm9tIGNvbGxlY3Rpb25OYW1lLCByZXR1cm5pbmcgaXQgb3IgbnVsbCBpZiBub3RcbiAgLy8gZm91bmQuXG4gIC8vXG4gIC8vIElmIHlvdSBtYWtlIG11bHRpcGxlIGNhbGxzIHRvIGZldGNoKCkgd2l0aCB0aGUgc2FtZSBvcCByZWZlcmVuY2UsXG4gIC8vIERvY0ZldGNoZXIgbWF5IGFzc3VtZSB0aGF0IHRoZXkgYWxsIHJldHVybiB0aGUgc2FtZSBkb2N1bWVudC4gKEl0IGRvZXNcbiAgLy8gbm90IGNoZWNrIHRvIHNlZSBpZiBjb2xsZWN0aW9uTmFtZS9pZCBtYXRjaC4pXG4gIC8vXG4gIC8vIFlvdSBtYXkgYXNzdW1lIHRoYXQgY2FsbGJhY2sgaXMgbmV2ZXIgY2FsbGVkIHN5bmNocm9ub3VzbHkgKGFuZCBpbiBmYWN0XG4gIC8vIE9wbG9nT2JzZXJ2ZURyaXZlciBkb2VzIHNvKS5cbiAgYXN5bmMgZmV0Y2goY29sbGVjdGlvbk5hbWUsIGlkLCBvcCwgY2FsbGJhY2spIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIFxuICAgIGNoZWNrKGNvbGxlY3Rpb25OYW1lLCBTdHJpbmcpO1xuICAgIGNoZWNrKG9wLCBPYmplY3QpO1xuXG5cbiAgICAvLyBJZiB0aGVyZSdzIGFscmVhZHkgYW4gaW4tcHJvZ3Jlc3MgZmV0Y2ggZm9yIHRoaXMgY2FjaGUga2V5LCB5aWVsZCB1bnRpbFxuICAgIC8vIGl0J3MgZG9uZSBhbmQgcmV0dXJuIHdoYXRldmVyIGl0IHJldHVybnMuXG4gICAgaWYgKHNlbGYuX2NhbGxiYWNrc0Zvck9wLmhhcyhvcCkpIHtcbiAgICAgIHNlbGYuX2NhbGxiYWNrc0Zvck9wLmdldChvcCkucHVzaChjYWxsYmFjayk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgY2FsbGJhY2tzID0gW2NhbGxiYWNrXTtcbiAgICBzZWxmLl9jYWxsYmFja3NGb3JPcC5zZXQob3AsIGNhbGxiYWNrcyk7XG5cbiAgICB0cnkge1xuICAgICAgdmFyIGRvYyA9XG4gICAgICAgIChhd2FpdCBzZWxmLl9tb25nb0Nvbm5lY3Rpb24uZmluZE9uZUFzeW5jKGNvbGxlY3Rpb25OYW1lLCB7XG4gICAgICAgICAgX2lkOiBpZCxcbiAgICAgICAgfSkpIHx8IG51bGw7XG4gICAgICAvLyBSZXR1cm4gZG9jIHRvIGFsbCByZWxldmFudCBjYWxsYmFja3MuIE5vdGUgdGhhdCB0aGlzIGFycmF5IGNhblxuICAgICAgLy8gY29udGludWUgdG8gZ3JvdyBkdXJpbmcgY2FsbGJhY2sgZXhjZWN1dGlvbi5cbiAgICAgIHdoaWxlIChjYWxsYmFja3MubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyBDbG9uZSB0aGUgZG9jdW1lbnQgc28gdGhhdCB0aGUgdmFyaW91cyBjYWxscyB0byBmZXRjaCBkb24ndCByZXR1cm5cbiAgICAgICAgLy8gb2JqZWN0cyB0aGF0IGFyZSBpbnRlcnR3aW5nbGVkIHdpdGggZWFjaCBvdGhlci4gQ2xvbmUgYmVmb3JlXG4gICAgICAgIC8vIHBvcHBpbmcgdGhlIGZ1dHVyZSwgc28gdGhhdCBpZiBjbG9uZSB0aHJvd3MsIHRoZSBlcnJvciBnZXRzIHBhc3NlZFxuICAgICAgICAvLyB0byB0aGUgbmV4dCBjYWxsYmFjay5cbiAgICAgICAgY2FsbGJhY2tzLnBvcCgpKG51bGwsIEVKU09OLmNsb25lKGRvYykpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHdoaWxlIChjYWxsYmFja3MubGVuZ3RoID4gMCkge1xuICAgICAgICBjYWxsYmFja3MucG9wKCkoZSk7XG4gICAgICB9XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIC8vIFhYWCBjb25zaWRlciBrZWVwaW5nIHRoZSBkb2MgYXJvdW5kIGZvciBhIHBlcmlvZCBvZiB0aW1lIGJlZm9yZVxuICAgICAgLy8gcmVtb3ZpbmcgZnJvbSB0aGUgY2FjaGVcbiAgICAgIHNlbGYuX2NhbGxiYWNrc0Zvck9wLmRlbGV0ZShvcCk7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgdGhyb3R0bGUgZnJvbSAnbG9kYXNoLnRocm90dGxlJztcbmltcG9ydCB7IGxpc3RlbkFsbCB9IGZyb20gJy4vbW9uZ29fZHJpdmVyJztcbmltcG9ydCB7IE9ic2VydmVNdWx0aXBsZXhlciB9IGZyb20gJy4vb2JzZXJ2ZV9tdWx0aXBsZXgnO1xuXG5pbnRlcmZhY2UgUG9sbGluZ09ic2VydmVEcml2ZXJPcHRpb25zIHtcbiAgY3Vyc29yRGVzY3JpcHRpb246IGFueTtcbiAgbW9uZ29IYW5kbGU6IGFueTtcbiAgb3JkZXJlZDogYm9vbGVhbjtcbiAgbXVsdGlwbGV4ZXI6IE9ic2VydmVNdWx0aXBsZXhlcjtcbiAgX3Rlc3RPbmx5UG9sbENhbGxiYWNrPzogKCkgPT4gdm9pZDtcbn1cblxuY29uc3QgUE9MTElOR19USFJPVFRMRV9NUyA9ICsocHJvY2Vzcy5lbnYuTUVURU9SX1BPTExJTkdfVEhST1RUTEVfTVMgfHwgJycpIHx8IDUwO1xuY29uc3QgUE9MTElOR19JTlRFUlZBTF9NUyA9ICsocHJvY2Vzcy5lbnYuTUVURU9SX1BPTExJTkdfSU5URVJWQUxfTVMgfHwgJycpIHx8IDEwICogMTAwMDtcblxuLyoqXG4gKiBAY2xhc3MgUG9sbGluZ09ic2VydmVEcml2ZXJcbiAqXG4gKiBPbmUgb2YgdHdvIG9ic2VydmUgZHJpdmVyIGltcGxlbWVudGF0aW9ucy5cbiAqXG4gKiBDaGFyYWN0ZXJpc3RpY3M6XG4gKiAtIENhY2hlcyB0aGUgcmVzdWx0cyBvZiBhIHF1ZXJ5XG4gKiAtIFJlcnVucyB0aGUgcXVlcnkgd2hlbiBuZWNlc3NhcnlcbiAqIC0gU3VpdGFibGUgZm9yIGNhc2VzIHdoZXJlIG9wbG9nIHRhaWxpbmcgaXMgbm90IGF2YWlsYWJsZSBvciBwcmFjdGljYWxcbiAqL1xuZXhwb3J0IGNsYXNzIFBvbGxpbmdPYnNlcnZlRHJpdmVyIHtcbiAgcHJpdmF0ZSBfb3B0aW9uczogUG9sbGluZ09ic2VydmVEcml2ZXJPcHRpb25zO1xuICBwcml2YXRlIF9jdXJzb3JEZXNjcmlwdGlvbjogYW55O1xuICBwcml2YXRlIF9tb25nb0hhbmRsZTogYW55O1xuICBwcml2YXRlIF9vcmRlcmVkOiBib29sZWFuO1xuICBwcml2YXRlIF9tdWx0aXBsZXhlcjogYW55O1xuICBwcml2YXRlIF9zdG9wQ2FsbGJhY2tzOiBBcnJheTwoKSA9PiBQcm9taXNlPHZvaWQ+PjtcbiAgcHJpdmF0ZSBfc3RvcHBlZDogYm9vbGVhbjtcbiAgcHJpdmF0ZSBfY3Vyc29yOiBhbnk7XG4gIHByaXZhdGUgX3Jlc3VsdHM6IGFueTtcbiAgcHJpdmF0ZSBfcG9sbHNTY2hlZHVsZWRCdXROb3RTdGFydGVkOiBudW1iZXI7XG4gIHByaXZhdGUgX3BlbmRpbmdXcml0ZXM6IGFueVtdO1xuICBwcml2YXRlIF9lbnN1cmVQb2xsSXNTY2hlZHVsZWQ6IEZ1bmN0aW9uO1xuICBwcml2YXRlIF90YXNrUXVldWU6IGFueTtcbiAgcHJpdmF0ZSBfdGVzdE9ubHlQb2xsQ2FsbGJhY2s/OiAoKSA9PiB2b2lkO1xuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IFBvbGxpbmdPYnNlcnZlRHJpdmVyT3B0aW9ucykge1xuICAgIHRoaXMuX29wdGlvbnMgPSBvcHRpb25zO1xuICAgIHRoaXMuX2N1cnNvckRlc2NyaXB0aW9uID0gb3B0aW9ucy5jdXJzb3JEZXNjcmlwdGlvbjtcbiAgICB0aGlzLl9tb25nb0hhbmRsZSA9IG9wdGlvbnMubW9uZ29IYW5kbGU7XG4gICAgdGhpcy5fb3JkZXJlZCA9IG9wdGlvbnMub3JkZXJlZDtcbiAgICB0aGlzLl9tdWx0aXBsZXhlciA9IG9wdGlvbnMubXVsdGlwbGV4ZXI7XG4gICAgdGhpcy5fc3RvcENhbGxiYWNrcyA9IFtdO1xuICAgIHRoaXMuX3N0b3BwZWQgPSBmYWxzZTtcblxuICAgIHRoaXMuX2N1cnNvciA9IHRoaXMuX21vbmdvSGFuZGxlLl9jcmVhdGVBc3luY2hyb25vdXNDdXJzb3IoXG4gICAgICB0aGlzLl9jdXJzb3JEZXNjcmlwdGlvbik7XG5cbiAgICB0aGlzLl9yZXN1bHRzID0gbnVsbDtcbiAgICB0aGlzLl9wb2xsc1NjaGVkdWxlZEJ1dE5vdFN0YXJ0ZWQgPSAwO1xuICAgIHRoaXMuX3BlbmRpbmdXcml0ZXMgPSBbXTtcblxuICAgIHRoaXMuX2Vuc3VyZVBvbGxJc1NjaGVkdWxlZCA9IHRocm90dGxlKFxuICAgICAgdGhpcy5fdW50aHJvdHRsZWRFbnN1cmVQb2xsSXNTY2hlZHVsZWQuYmluZCh0aGlzKSxcbiAgICAgIHRoaXMuX2N1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnMucG9sbGluZ1Rocm90dGxlTXMgfHwgUE9MTElOR19USFJPVFRMRV9NU1xuICAgICk7XG5cbiAgICB0aGlzLl90YXNrUXVldWUgPSBuZXcgKE1ldGVvciBhcyBhbnkpLl9Bc3luY2hyb25vdXNRdWV1ZSgpO1xuICB9XG5cbiAgYXN5bmMgX2luaXQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMuX29wdGlvbnM7XG4gICAgY29uc3QgbGlzdGVuZXJzSGFuZGxlID0gYXdhaXQgbGlzdGVuQWxsKFxuICAgICAgdGhpcy5fY3Vyc29yRGVzY3JpcHRpb24sXG4gICAgICAobm90aWZpY2F0aW9uOiBhbnkpID0+IHtcbiAgICAgICAgY29uc3QgZmVuY2UgPSAoRERQU2VydmVyIGFzIGFueSkuX2dldEN1cnJlbnRGZW5jZSgpO1xuICAgICAgICBpZiAoZmVuY2UpIHtcbiAgICAgICAgICB0aGlzLl9wZW5kaW5nV3JpdGVzLnB1c2goZmVuY2UuYmVnaW5Xcml0ZSgpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5fcG9sbHNTY2hlZHVsZWRCdXROb3RTdGFydGVkID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5fZW5zdXJlUG9sbElzU2NoZWR1bGVkKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApO1xuXG4gICAgdGhpcy5fc3RvcENhbGxiYWNrcy5wdXNoKGFzeW5jICgpID0+IHsgYXdhaXQgbGlzdGVuZXJzSGFuZGxlLnN0b3AoKTsgfSk7XG5cbiAgICBpZiAob3B0aW9ucy5fdGVzdE9ubHlQb2xsQ2FsbGJhY2spIHtcbiAgICAgIHRoaXMuX3Rlc3RPbmx5UG9sbENhbGxiYWNrID0gb3B0aW9ucy5fdGVzdE9ubHlQb2xsQ2FsbGJhY2s7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHBvbGxpbmdJbnRlcnZhbCA9XG4gICAgICAgIHRoaXMuX2N1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnMucG9sbGluZ0ludGVydmFsTXMgfHxcbiAgICAgICAgdGhpcy5fY3Vyc29yRGVzY3JpcHRpb24ub3B0aW9ucy5fcG9sbGluZ0ludGVydmFsIHx8XG4gICAgICAgIFBPTExJTkdfSU5URVJWQUxfTVM7XG5cbiAgICAgIGNvbnN0IGludGVydmFsSGFuZGxlID0gTWV0ZW9yLnNldEludGVydmFsKFxuICAgICAgICB0aGlzLl9lbnN1cmVQb2xsSXNTY2hlZHVsZWQuYmluZCh0aGlzKSxcbiAgICAgICAgcG9sbGluZ0ludGVydmFsXG4gICAgICApO1xuXG4gICAgICB0aGlzLl9zdG9wQ2FsbGJhY2tzLnB1c2goKCkgPT4ge1xuICAgICAgICBNZXRlb3IuY2xlYXJJbnRlcnZhbChpbnRlcnZhbEhhbmRsZSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLl91bnRocm90dGxlZEVuc3VyZVBvbGxJc1NjaGVkdWxlZCgpO1xuXG4gICAgKFBhY2thZ2VbJ2ZhY3RzLWJhc2UnXSBhcyBhbnkpPy5GYWN0cy5pbmNyZW1lbnRTZXJ2ZXJGYWN0KFxuICAgICAgXCJtb25nby1saXZlZGF0YVwiLCBcIm9ic2VydmUtZHJpdmVycy1wb2xsaW5nXCIsIDEpO1xuICB9XG5cbiAgYXN5bmMgX3VudGhyb3R0bGVkRW5zdXJlUG9sbElzU2NoZWR1bGVkKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLl9wb2xsc1NjaGVkdWxlZEJ1dE5vdFN0YXJ0ZWQgPiAwKSByZXR1cm47XG4gICAgKyt0aGlzLl9wb2xsc1NjaGVkdWxlZEJ1dE5vdFN0YXJ0ZWQ7XG4gICAgYXdhaXQgdGhpcy5fdGFza1F1ZXVlLnJ1blRhc2soYXN5bmMgKCkgPT4ge1xuICAgICAgYXdhaXQgdGhpcy5fcG9sbE1vbmdvKCk7XG4gICAgfSk7XG4gIH1cblxuICBfc3VzcGVuZFBvbGxpbmcoKTogdm9pZCB7XG4gICAgKyt0aGlzLl9wb2xsc1NjaGVkdWxlZEJ1dE5vdFN0YXJ0ZWQ7XG4gICAgdGhpcy5fdGFza1F1ZXVlLnJ1blRhc2soKCkgPT4ge30pO1xuXG4gICAgaWYgKHRoaXMuX3BvbGxzU2NoZWR1bGVkQnV0Tm90U3RhcnRlZCAhPT0gMSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBfcG9sbHNTY2hlZHVsZWRCdXROb3RTdGFydGVkIGlzICR7dGhpcy5fcG9sbHNTY2hlZHVsZWRCdXROb3RTdGFydGVkfWApO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIF9yZXN1bWVQb2xsaW5nKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLl9wb2xsc1NjaGVkdWxlZEJ1dE5vdFN0YXJ0ZWQgIT09IDEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgX3BvbGxzU2NoZWR1bGVkQnV0Tm90U3RhcnRlZCBpcyAke3RoaXMuX3BvbGxzU2NoZWR1bGVkQnV0Tm90U3RhcnRlZH1gKTtcbiAgICB9XG4gICAgYXdhaXQgdGhpcy5fdGFza1F1ZXVlLnJ1blRhc2soYXN5bmMgKCkgPT4ge1xuICAgICAgYXdhaXQgdGhpcy5fcG9sbE1vbmdvKCk7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBfcG9sbE1vbmdvKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC0tdGhpcy5fcG9sbHNTY2hlZHVsZWRCdXROb3RTdGFydGVkO1xuXG4gICAgaWYgKHRoaXMuX3N0b3BwZWQpIHJldHVybjtcblxuICAgIGxldCBmaXJzdCA9IGZhbHNlO1xuICAgIGxldCBuZXdSZXN1bHRzO1xuICAgIGxldCBvbGRSZXN1bHRzID0gdGhpcy5fcmVzdWx0cztcblxuICAgIGlmICghb2xkUmVzdWx0cykge1xuICAgICAgZmlyc3QgPSB0cnVlO1xuICAgICAgb2xkUmVzdWx0cyA9IHRoaXMuX29yZGVyZWQgPyBbXSA6IG5ldyAoTG9jYWxDb2xsZWN0aW9uIGFzIGFueSkuX0lkTWFwO1xuICAgIH1cblxuICAgIHRoaXMuX3Rlc3RPbmx5UG9sbENhbGxiYWNrPy4oKTtcblxuICAgIGNvbnN0IHdyaXRlc0ZvckN5Y2xlID0gdGhpcy5fcGVuZGluZ1dyaXRlcztcbiAgICB0aGlzLl9wZW5kaW5nV3JpdGVzID0gW107XG5cbiAgICB0cnkge1xuICAgICAgbmV3UmVzdWx0cyA9IGF3YWl0IHRoaXMuX2N1cnNvci5nZXRSYXdPYmplY3RzKHRoaXMuX29yZGVyZWQpO1xuICAgIH0gY2F0Y2ggKGU6IGFueSkge1xuICAgICAgaWYgKGZpcnN0ICYmIHR5cGVvZihlLmNvZGUpID09PSAnbnVtYmVyJykge1xuICAgICAgICBhd2FpdCB0aGlzLl9tdWx0aXBsZXhlci5xdWVyeUVycm9yKFxuICAgICAgICAgIG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBFeGNlcHRpb24gd2hpbGUgcG9sbGluZyBxdWVyeSAke1xuICAgICAgICAgICAgICBKU09OLnN0cmluZ2lmeSh0aGlzLl9jdXJzb3JEZXNjcmlwdGlvbilcbiAgICAgICAgICAgIH06ICR7ZS5tZXNzYWdlfWBcbiAgICAgICAgICApXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KHRoaXMuX3BlbmRpbmdXcml0ZXMsIHdyaXRlc0ZvckN5Y2xlKTtcbiAgICAgIE1ldGVvci5fZGVidWcoYEV4Y2VwdGlvbiB3aGlsZSBwb2xsaW5nIHF1ZXJ5ICR7XG4gICAgICAgIEpTT04uc3RyaW5naWZ5KHRoaXMuX2N1cnNvckRlc2NyaXB0aW9uKX1gLCBlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuX3N0b3BwZWQpIHtcbiAgICAgIChMb2NhbENvbGxlY3Rpb24gYXMgYW55KS5fZGlmZlF1ZXJ5Q2hhbmdlcyhcbiAgICAgICAgdGhpcy5fb3JkZXJlZCwgb2xkUmVzdWx0cywgbmV3UmVzdWx0cywgdGhpcy5fbXVsdGlwbGV4ZXIpO1xuICAgIH1cblxuICAgIGlmIChmaXJzdCkgdGhpcy5fbXVsdGlwbGV4ZXIucmVhZHkoKTtcblxuICAgIHRoaXMuX3Jlc3VsdHMgPSBuZXdSZXN1bHRzO1xuXG4gICAgYXdhaXQgdGhpcy5fbXVsdGlwbGV4ZXIub25GbHVzaChhc3luYyAoKSA9PiB7XG4gICAgICBmb3IgKGNvbnN0IHcgb2Ygd3JpdGVzRm9yQ3ljbGUpIHtcbiAgICAgICAgYXdhaXQgdy5jb21taXR0ZWQoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIHN0b3AoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5fc3RvcHBlZCA9IHRydWU7XG5cbiAgICBmb3IgKGNvbnN0IGNhbGxiYWNrIG9mIHRoaXMuX3N0b3BDYWxsYmFja3MpIHtcbiAgICAgIGF3YWl0IGNhbGxiYWNrKCk7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCB3IG9mIHRoaXMuX3BlbmRpbmdXcml0ZXMpIHtcbiAgICAgIGF3YWl0IHcuY29tbWl0dGVkKCk7XG4gICAgfVxuXG4gICAgKFBhY2thZ2VbJ2ZhY3RzLWJhc2UnXSBhcyBhbnkpPy5GYWN0cy5pbmNyZW1lbnRTZXJ2ZXJGYWN0KFxuICAgICAgXCJtb25nby1saXZlZGF0YVwiLCBcIm9ic2VydmUtZHJpdmVycy1wb2xsaW5nXCIsIC0xKTtcbiAgfVxufSIsImltcG9ydCBoYXMgZnJvbSAnbG9kYXNoLmhhcyc7XG5pbXBvcnQgaXNFbXB0eSBmcm9tICdsb2Rhc2guaXNlbXB0eSc7XG5pbXBvcnQgeyBvcGxvZ1YyVjFDb252ZXJ0ZXIgfSBmcm9tIFwiLi9vcGxvZ192Ml9jb252ZXJ0ZXJcIjtcbmltcG9ydCB7IGNoZWNrLCBNYXRjaCB9IGZyb20gJ21ldGVvci9jaGVjayc7XG5pbXBvcnQgeyBDdXJzb3JEZXNjcmlwdGlvbiB9IGZyb20gJy4vY3Vyc29yX2Rlc2NyaXB0aW9uJztcbmltcG9ydCB7IGZvckVhY2hUcmlnZ2VyLCBsaXN0ZW5BbGwgfSBmcm9tICcuL21vbmdvX2RyaXZlcic7XG5pbXBvcnQgeyBDdXJzb3IgfSBmcm9tICcuL2N1cnNvcic7XG5pbXBvcnQgTG9jYWxDb2xsZWN0aW9uIGZyb20gJ21ldGVvci9taW5pbW9uZ28vbG9jYWxfY29sbGVjdGlvbic7XG5pbXBvcnQgeyBpZEZvck9wIH0gZnJvbSAnLi9vcGxvZ190YWlsaW5nJztcblxudmFyIFBIQVNFID0ge1xuICBRVUVSWUlORzogXCJRVUVSWUlOR1wiLFxuICBGRVRDSElORzogXCJGRVRDSElOR1wiLFxuICBTVEVBRFk6IFwiU1RFQURZXCJcbn07XG5cbi8vIEV4Y2VwdGlvbiB0aHJvd24gYnkgX25lZWRUb1BvbGxRdWVyeSB3aGljaCB1bnJvbGxzIHRoZSBzdGFjayB1cCB0byB0aGVcbi8vIGVuY2xvc2luZyBjYWxsIHRvIGZpbmlzaElmTmVlZFRvUG9sbFF1ZXJ5LlxudmFyIFN3aXRjaGVkVG9RdWVyeSA9IGZ1bmN0aW9uICgpIHt9O1xudmFyIGZpbmlzaElmTmVlZFRvUG9sbFF1ZXJ5ID0gZnVuY3Rpb24gKGYpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgZi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmICghKGUgaW5zdGFuY2VvZiBTd2l0Y2hlZFRvUXVlcnkpKVxuICAgICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfTtcbn07XG5cbnZhciBjdXJyZW50SWQgPSAwO1xuXG4vKipcbiAqIEBjbGFzcyBPcGxvZ09ic2VydmVEcml2ZXJcbiAqIEFuIGFsdGVybmF0aXZlIHRvIFBvbGxpbmdPYnNlcnZlRHJpdmVyIHdoaWNoIGZvbGxvd3MgdGhlIE1vbmdvREIgb3BlcmF0aW9uIGxvZ1xuICogaW5zdGVhZCBvZiByZS1wb2xsaW5nIHRoZSBxdWVyeS5cbiAqXG4gKiBDaGFyYWN0ZXJpc3RpY3M6XG4gKiAtIEZvbGxvd3MgdGhlIE1vbmdvREIgb3BlcmF0aW9uIGxvZ1xuICogLSBEaXJlY3RseSBvYnNlcnZlcyBkYXRhYmFzZSBjaGFuZ2VzXG4gKiAtIE1vcmUgZWZmaWNpZW50IHRoYW4gcG9sbGluZyBmb3IgbW9zdCB1c2UgY2FzZXNcbiAqIC0gUmVxdWlyZXMgYWNjZXNzIHRvIE1vbmdvREIgb3Bsb2dcbiAqXG4gKiBJbnRlcmZhY2U6XG4gKiAtIENvbnN0cnVjdGlvbiBpbml0aWF0ZXMgb2JzZXJ2ZUNoYW5nZXMgY2FsbGJhY2tzIGFuZCByZWFkeSgpIGludm9jYXRpb24gdG8gdGhlIE9ic2VydmVNdWx0aXBsZXhlclxuICogLSBPYnNlcnZhdGlvbiBjYW4gYmUgdGVybWluYXRlZCB2aWEgdGhlIHN0b3AoKSBtZXRob2RcbiAqL1xuZXhwb3J0IGNvbnN0IE9wbG9nT2JzZXJ2ZURyaXZlciA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gIGNvbnN0IHNlbGYgPSB0aGlzO1xuICBzZWxmLl91c2VzT3Bsb2cgPSB0cnVlOyAgLy8gdGVzdHMgbG9vayBhdCB0aGlzXG5cbiAgc2VsZi5faWQgPSBjdXJyZW50SWQ7XG4gIGN1cnJlbnRJZCsrO1xuXG4gIHNlbGYuX2N1cnNvckRlc2NyaXB0aW9uID0gb3B0aW9ucy5jdXJzb3JEZXNjcmlwdGlvbjtcbiAgc2VsZi5fbW9uZ29IYW5kbGUgPSBvcHRpb25zLm1vbmdvSGFuZGxlO1xuICBzZWxmLl9tdWx0aXBsZXhlciA9IG9wdGlvbnMubXVsdGlwbGV4ZXI7XG5cbiAgaWYgKG9wdGlvbnMub3JkZXJlZCkge1xuICAgIHRocm93IEVycm9yKFwiT3Bsb2dPYnNlcnZlRHJpdmVyIG9ubHkgc3VwcG9ydHMgdW5vcmRlcmVkIG9ic2VydmVDaGFuZ2VzXCIpO1xuICB9XG5cbiAgY29uc3Qgc29ydGVyID0gb3B0aW9ucy5zb3J0ZXI7XG4gIC8vIFdlIGRvbid0IHN1cHBvcnQgJG5lYXIgYW5kIG90aGVyIGdlby1xdWVyaWVzIHNvIGl0J3MgT0sgdG8gaW5pdGlhbGl6ZSB0aGVcbiAgLy8gY29tcGFyYXRvciBvbmx5IG9uY2UgaW4gdGhlIGNvbnN0cnVjdG9yLlxuICBjb25zdCBjb21wYXJhdG9yID0gc29ydGVyICYmIHNvcnRlci5nZXRDb21wYXJhdG9yKCk7XG5cbiAgaWYgKG9wdGlvbnMuY3Vyc29yRGVzY3JpcHRpb24ub3B0aW9ucy5saW1pdCkge1xuICAgIC8vIFRoZXJlIGFyZSBzZXZlcmFsIHByb3BlcnRpZXMgb3JkZXJlZCBkcml2ZXIgaW1wbGVtZW50czpcbiAgICAvLyAtIF9saW1pdCBpcyBhIHBvc2l0aXZlIG51bWJlclxuICAgIC8vIC0gX2NvbXBhcmF0b3IgaXMgYSBmdW5jdGlvbi1jb21wYXJhdG9yIGJ5IHdoaWNoIHRoZSBxdWVyeSBpcyBvcmRlcmVkXG4gICAgLy8gLSBfdW5wdWJsaXNoZWRCdWZmZXIgaXMgbm9uLW51bGwgTWluL01heCBIZWFwLFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgIHRoZSBlbXB0eSBidWZmZXIgaW4gU1RFQURZIHBoYXNlIGltcGxpZXMgdGhhdCB0aGVcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICBldmVyeXRoaW5nIHRoYXQgbWF0Y2hlcyB0aGUgcXVlcmllcyBzZWxlY3RvciBmaXRzXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgaW50byBwdWJsaXNoZWQgc2V0LlxuICAgIC8vIC0gX3B1Ymxpc2hlZCAtIE1heCBIZWFwIChhbHNvIGltcGxlbWVudHMgSWRNYXAgbWV0aG9kcylcblxuICAgIGNvbnN0IGhlYXBPcHRpb25zID0geyBJZE1hcDogTG9jYWxDb2xsZWN0aW9uLl9JZE1hcCB9O1xuICAgIHNlbGYuX2xpbWl0ID0gc2VsZi5fY3Vyc29yRGVzY3JpcHRpb24ub3B0aW9ucy5saW1pdDtcbiAgICBzZWxmLl9jb21wYXJhdG9yID0gY29tcGFyYXRvcjtcbiAgICBzZWxmLl9zb3J0ZXIgPSBzb3J0ZXI7XG4gICAgc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIgPSBuZXcgTWluTWF4SGVhcChjb21wYXJhdG9yLCBoZWFwT3B0aW9ucyk7XG4gICAgLy8gV2UgbmVlZCBzb21ldGhpbmcgdGhhdCBjYW4gZmluZCBNYXggdmFsdWUgaW4gYWRkaXRpb24gdG8gSWRNYXAgaW50ZXJmYWNlXG4gICAgc2VsZi5fcHVibGlzaGVkID0gbmV3IE1heEhlYXAoY29tcGFyYXRvciwgaGVhcE9wdGlvbnMpO1xuICB9IGVsc2Uge1xuICAgIHNlbGYuX2xpbWl0ID0gMDtcbiAgICBzZWxmLl9jb21wYXJhdG9yID0gbnVsbDtcbiAgICBzZWxmLl9zb3J0ZXIgPSBudWxsO1xuICAgIHNlbGYuX3VucHVibGlzaGVkQnVmZmVyID0gbnVsbDtcbiAgICAvLyBNZW1vcnkgR3Jvd3RoXG4gICAgc2VsZi5fcHVibGlzaGVkID0gbmV3IExvY2FsQ29sbGVjdGlvbi5fSWRNYXA7XG4gIH1cblxuICAvLyBJbmRpY2F0ZXMgaWYgaXQgaXMgc2FmZSB0byBpbnNlcnQgYSBuZXcgZG9jdW1lbnQgYXQgdGhlIGVuZCBvZiB0aGUgYnVmZmVyXG4gIC8vIGZvciB0aGlzIHF1ZXJ5LiBpLmUuIGl0IGlzIGtub3duIHRoYXQgdGhlcmUgYXJlIG5vIGRvY3VtZW50cyBtYXRjaGluZyB0aGVcbiAgLy8gc2VsZWN0b3IgdGhvc2UgYXJlIG5vdCBpbiBwdWJsaXNoZWQgb3IgYnVmZmVyLlxuICBzZWxmLl9zYWZlQXBwZW5kVG9CdWZmZXIgPSBmYWxzZTtcblxuICBzZWxmLl9zdG9wcGVkID0gZmFsc2U7XG4gIHNlbGYuX3N0b3BIYW5kbGVzID0gW107XG4gIHNlbGYuX2FkZFN0b3BIYW5kbGVzID0gZnVuY3Rpb24gKG5ld1N0b3BIYW5kbGVzKSB7XG4gICAgY29uc3QgZXhwZWN0ZWRQYXR0ZXJuID0gTWF0Y2guT2JqZWN0SW5jbHVkaW5nKHsgc3RvcDogRnVuY3Rpb24gfSk7XG4gICAgLy8gU2luZ2xlIGl0ZW0gb3IgYXJyYXlcbiAgICBjaGVjayhuZXdTdG9wSGFuZGxlcywgTWF0Y2guT25lT2YoW2V4cGVjdGVkUGF0dGVybl0sIGV4cGVjdGVkUGF0dGVybikpO1xuICAgIHNlbGYuX3N0b3BIYW5kbGVzLnB1c2gobmV3U3RvcEhhbmRsZXMpO1xuICB9XG5cbiAgUGFja2FnZVsnZmFjdHMtYmFzZSddICYmIFBhY2thZ2VbJ2ZhY3RzLWJhc2UnXS5GYWN0cy5pbmNyZW1lbnRTZXJ2ZXJGYWN0KFxuICAgIFwibW9uZ28tbGl2ZWRhdGFcIiwgXCJvYnNlcnZlLWRyaXZlcnMtb3Bsb2dcIiwgMSk7XG5cbiAgc2VsZi5fcmVnaXN0ZXJQaGFzZUNoYW5nZShQSEFTRS5RVUVSWUlORyk7XG5cbiAgc2VsZi5fbWF0Y2hlciA9IG9wdGlvbnMubWF0Y2hlcjtcbiAgLy8gd2UgYXJlIG5vdyB1c2luZyBwcm9qZWN0aW9uLCBub3QgZmllbGRzIGluIHRoZSBjdXJzb3IgZGVzY3JpcHRpb24gZXZlbiBpZiB5b3UgcGFzcyB7ZmllbGRzfVxuICAvLyBpbiB0aGUgY3Vyc29yIGNvbnN0cnVjdGlvblxuICBjb25zdCBwcm9qZWN0aW9uID0gc2VsZi5fY3Vyc29yRGVzY3JpcHRpb24ub3B0aW9ucy5maWVsZHMgfHwgc2VsZi5fY3Vyc29yRGVzY3JpcHRpb24ub3B0aW9ucy5wcm9qZWN0aW9uIHx8IHt9O1xuICBzZWxmLl9wcm9qZWN0aW9uRm4gPSBMb2NhbENvbGxlY3Rpb24uX2NvbXBpbGVQcm9qZWN0aW9uKHByb2plY3Rpb24pO1xuICAvLyBQcm9qZWN0aW9uIGZ1bmN0aW9uLCByZXN1bHQgb2YgY29tYmluaW5nIGltcG9ydGFudCBmaWVsZHMgZm9yIHNlbGVjdG9yIGFuZFxuICAvLyBleGlzdGluZyBmaWVsZHMgcHJvamVjdGlvblxuICBzZWxmLl9zaGFyZWRQcm9qZWN0aW9uID0gc2VsZi5fbWF0Y2hlci5jb21iaW5lSW50b1Byb2plY3Rpb24ocHJvamVjdGlvbik7XG4gIGlmIChzb3J0ZXIpXG4gICAgc2VsZi5fc2hhcmVkUHJvamVjdGlvbiA9IHNvcnRlci5jb21iaW5lSW50b1Byb2plY3Rpb24oc2VsZi5fc2hhcmVkUHJvamVjdGlvbik7XG4gIHNlbGYuX3NoYXJlZFByb2plY3Rpb25GbiA9IExvY2FsQ29sbGVjdGlvbi5fY29tcGlsZVByb2plY3Rpb24oXG4gICAgc2VsZi5fc2hhcmVkUHJvamVjdGlvbik7XG5cbiAgc2VsZi5fbmVlZFRvRmV0Y2ggPSBuZXcgTG9jYWxDb2xsZWN0aW9uLl9JZE1hcDtcbiAgc2VsZi5fY3VycmVudGx5RmV0Y2hpbmcgPSBudWxsO1xuICBzZWxmLl9mZXRjaEdlbmVyYXRpb24gPSAwO1xuXG4gIHNlbGYuX3JlcXVlcnlXaGVuRG9uZVRoaXNRdWVyeSA9IGZhbHNlO1xuICBzZWxmLl93cml0ZXNUb0NvbW1pdFdoZW5XZVJlYWNoU3RlYWR5ID0gW107XG4gfTtcblxuT2JqZWN0LmFzc2lnbihPcGxvZ09ic2VydmVEcml2ZXIucHJvdG90eXBlLCB7XG4gIF9pbml0OiBhc3luYyBmdW5jdGlvbigpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcblxuICAgIC8vIElmIHRoZSBvcGxvZyBoYW5kbGUgdGVsbHMgdXMgdGhhdCBpdCBza2lwcGVkIHNvbWUgZW50cmllcyAoYmVjYXVzZSBpdCBnb3RcbiAgICAvLyBiZWhpbmQsIHNheSksIHJlLXBvbGwuXG4gICAgc2VsZi5fYWRkU3RvcEhhbmRsZXMoc2VsZi5fbW9uZ29IYW5kbGUuX29wbG9nSGFuZGxlLm9uU2tpcHBlZEVudHJpZXMoXG4gICAgICBmaW5pc2hJZk5lZWRUb1BvbGxRdWVyeShmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBzZWxmLl9uZWVkVG9Qb2xsUXVlcnkoKTtcbiAgICAgIH0pXG4gICAgKSk7XG4gICAgXG4gICAgYXdhaXQgZm9yRWFjaFRyaWdnZXIoc2VsZi5fY3Vyc29yRGVzY3JpcHRpb24sIGFzeW5jIGZ1bmN0aW9uICh0cmlnZ2VyKSB7XG4gICAgICBzZWxmLl9hZGRTdG9wSGFuZGxlcyhhd2FpdCBzZWxmLl9tb25nb0hhbmRsZS5fb3Bsb2dIYW5kbGUub25PcGxvZ0VudHJ5KFxuICAgICAgICB0cmlnZ2VyLCBmdW5jdGlvbiAobm90aWZpY2F0aW9uKSB7XG4gICAgICAgICAgZmluaXNoSWZOZWVkVG9Qb2xsUXVlcnkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc3Qgb3AgPSBub3RpZmljYXRpb24ub3A7XG4gICAgICAgICAgICBpZiAobm90aWZpY2F0aW9uLmRyb3BDb2xsZWN0aW9uIHx8IG5vdGlmaWNhdGlvbi5kcm9wRGF0YWJhc2UpIHtcbiAgICAgICAgICAgICAgLy8gTm90ZTogdGhpcyBjYWxsIGlzIG5vdCBhbGxvd2VkIHRvIGJsb2NrIG9uIGFueXRoaW5nIChlc3BlY2lhbGx5XG4gICAgICAgICAgICAgIC8vIG9uIHdhaXRpbmcgZm9yIG9wbG9nIGVudHJpZXMgdG8gY2F0Y2ggdXApIGJlY2F1c2UgdGhhdCB3aWxsIGJsb2NrXG4gICAgICAgICAgICAgIC8vIG9uT3Bsb2dFbnRyeSFcbiAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuX25lZWRUb1BvbGxRdWVyeSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gQWxsIG90aGVyIG9wZXJhdG9ycyBzaG91bGQgYmUgaGFuZGxlZCBkZXBlbmRpbmcgb24gcGhhc2VcbiAgICAgICAgICAgICAgaWYgKHNlbGYuX3BoYXNlID09PSBQSEFTRS5RVUVSWUlORykge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLl9oYW5kbGVPcGxvZ0VudHJ5UXVlcnlpbmcob3ApO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLl9oYW5kbGVPcGxvZ0VudHJ5U3RlYWR5T3JGZXRjaGluZyhvcCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KSgpO1xuICAgICAgICB9XG4gICAgICApKTtcbiAgICB9KTtcbiAgXG4gICAgLy8gWFhYIG9yZGVyaW5nIHcuci50LiBldmVyeXRoaW5nIGVsc2U/XG4gICAgc2VsZi5fYWRkU3RvcEhhbmRsZXMoYXdhaXQgbGlzdGVuQWxsKFxuICAgICAgc2VsZi5fY3Vyc29yRGVzY3JpcHRpb24sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gSWYgd2UncmUgbm90IGluIGEgcHJlLWZpcmUgd3JpdGUgZmVuY2UsIHdlIGRvbid0IGhhdmUgdG8gZG8gYW55dGhpbmcuXG4gICAgICAgIGNvbnN0IGZlbmNlID0gRERQU2VydmVyLl9nZXRDdXJyZW50RmVuY2UoKTtcbiAgICAgICAgaWYgKCFmZW5jZSB8fCBmZW5jZS5maXJlZClcbiAgICAgICAgICByZXR1cm47XG4gIFxuICAgICAgICBpZiAoZmVuY2UuX29wbG9nT2JzZXJ2ZURyaXZlcnMpIHtcbiAgICAgICAgICBmZW5jZS5fb3Bsb2dPYnNlcnZlRHJpdmVyc1tzZWxmLl9pZF0gPSBzZWxmO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICBcbiAgICAgICAgZmVuY2UuX29wbG9nT2JzZXJ2ZURyaXZlcnMgPSB7fTtcbiAgICAgICAgZmVuY2UuX29wbG9nT2JzZXJ2ZURyaXZlcnNbc2VsZi5faWRdID0gc2VsZjtcbiAgXG4gICAgICAgIGZlbmNlLm9uQmVmb3JlRmlyZShhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgY29uc3QgZHJpdmVycyA9IGZlbmNlLl9vcGxvZ09ic2VydmVEcml2ZXJzO1xuICAgICAgICAgIGRlbGV0ZSBmZW5jZS5fb3Bsb2dPYnNlcnZlRHJpdmVycztcbiAgXG4gICAgICAgICAgLy8gVGhpcyBmZW5jZSBjYW5ub3QgZmlyZSB1bnRpbCB3ZSd2ZSBjYXVnaHQgdXAgdG8gXCJ0aGlzIHBvaW50XCIgaW4gdGhlXG4gICAgICAgICAgLy8gb3Bsb2csIGFuZCBhbGwgb2JzZXJ2ZXJzIG1hZGUgaXQgYmFjayB0byB0aGUgc3RlYWR5IHN0YXRlLlxuICAgICAgICAgIGF3YWl0IHNlbGYuX21vbmdvSGFuZGxlLl9vcGxvZ0hhbmRsZS53YWl0VW50aWxDYXVnaHRVcCgpO1xuICBcbiAgICAgICAgICBmb3IgKGNvbnN0IGRyaXZlciBvZiBPYmplY3QudmFsdWVzKGRyaXZlcnMpKSB7XG4gICAgICAgICAgICBpZiAoZHJpdmVyLl9zdG9wcGVkKVxuICAgICAgICAgICAgICBjb250aW51ZTtcbiAgXG4gICAgICAgICAgICBjb25zdCB3cml0ZSA9IGF3YWl0IGZlbmNlLmJlZ2luV3JpdGUoKTtcbiAgICAgICAgICAgIGlmIChkcml2ZXIuX3BoYXNlID09PSBQSEFTRS5TVEVBRFkpIHtcbiAgICAgICAgICAgICAgLy8gTWFrZSBzdXJlIHRoYXQgYWxsIG9mIHRoZSBjYWxsYmFja3MgaGF2ZSBtYWRlIGl0IHRocm91Z2ggdGhlXG4gICAgICAgICAgICAgIC8vIG11bHRpcGxleGVyIGFuZCBiZWVuIGRlbGl2ZXJlZCB0byBPYnNlcnZlSGFuZGxlcyBiZWZvcmUgY29tbWl0dGluZ1xuICAgICAgICAgICAgICAvLyB3cml0ZXMuXG4gICAgICAgICAgICAgIGF3YWl0IGRyaXZlci5fbXVsdGlwbGV4ZXIub25GbHVzaCh3cml0ZS5jb21taXR0ZWQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZHJpdmVyLl93cml0ZXNUb0NvbW1pdFdoZW5XZVJlYWNoU3RlYWR5LnB1c2god3JpdGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgKSk7XG4gIFxuICAgIC8vIFdoZW4gTW9uZ28gZmFpbHMgb3Zlciwgd2UgbmVlZCB0byByZXBvbGwgdGhlIHF1ZXJ5LCBpbiBjYXNlIHdlIHByb2Nlc3NlZCBhblxuICAgIC8vIG9wbG9nIGVudHJ5IHRoYXQgZ290IHJvbGxlZCBiYWNrLlxuICAgIHNlbGYuX2FkZFN0b3BIYW5kbGVzKHNlbGYuX21vbmdvSGFuZGxlLl9vbkZhaWxvdmVyKGZpbmlzaElmTmVlZFRvUG9sbFF1ZXJ5KFxuICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gc2VsZi5fbmVlZFRvUG9sbFF1ZXJ5KCk7XG4gICAgICB9KSkpO1xuICBcbiAgICAvLyBHaXZlIF9vYnNlcnZlQ2hhbmdlcyBhIGNoYW5jZSB0byBhZGQgdGhlIG5ldyBPYnNlcnZlSGFuZGxlIHRvIG91clxuICAgIC8vIG11bHRpcGxleGVyLCBzbyB0aGF0IHRoZSBhZGRlZCBjYWxscyBnZXQgc3RyZWFtZWQuXG4gICAgcmV0dXJuIHNlbGYuX3J1bkluaXRpYWxRdWVyeSgpO1xuICB9LFxuICBfYWRkUHVibGlzaGVkOiBmdW5jdGlvbiAoaWQsIGRvYykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBNZXRlb3IuX25vWWllbGRzQWxsb3dlZChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZmllbGRzID0gT2JqZWN0LmFzc2lnbih7fSwgZG9jKTtcbiAgICAgIGRlbGV0ZSBmaWVsZHMuX2lkO1xuICAgICAgc2VsZi5fcHVibGlzaGVkLnNldChpZCwgc2VsZi5fc2hhcmVkUHJvamVjdGlvbkZuKGRvYykpO1xuICAgICAgc2VsZi5fbXVsdGlwbGV4ZXIuYWRkZWQoaWQsIHNlbGYuX3Byb2plY3Rpb25GbihmaWVsZHMpKTtcblxuICAgICAgLy8gQWZ0ZXIgYWRkaW5nIHRoaXMgZG9jdW1lbnQsIHRoZSBwdWJsaXNoZWQgc2V0IG1pZ2h0IGJlIG92ZXJmbG93ZWRcbiAgICAgIC8vIChleGNlZWRpbmcgY2FwYWNpdHkgc3BlY2lmaWVkIGJ5IGxpbWl0KS4gSWYgc28sIHB1c2ggdGhlIG1heGltdW1cbiAgICAgIC8vIGVsZW1lbnQgdG8gdGhlIGJ1ZmZlciwgd2UgbWlnaHQgd2FudCB0byBzYXZlIGl0IGluIG1lbW9yeSB0byByZWR1Y2UgdGhlXG4gICAgICAvLyBhbW91bnQgb2YgTW9uZ28gbG9va3VwcyBpbiB0aGUgZnV0dXJlLlxuICAgICAgaWYgKHNlbGYuX2xpbWl0ICYmIHNlbGYuX3B1Ymxpc2hlZC5zaXplKCkgPiBzZWxmLl9saW1pdCkge1xuICAgICAgICAvLyBYWFggaW4gdGhlb3J5IHRoZSBzaXplIG9mIHB1Ymxpc2hlZCBpcyBubyBtb3JlIHRoYW4gbGltaXQrMVxuICAgICAgICBpZiAoc2VsZi5fcHVibGlzaGVkLnNpemUoKSAhPT0gc2VsZi5fbGltaXQgKyAxKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQWZ0ZXIgYWRkaW5nIHRvIHB1Ymxpc2hlZCwgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAoc2VsZi5fcHVibGlzaGVkLnNpemUoKSAtIHNlbGYuX2xpbWl0KSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiIGRvY3VtZW50cyBhcmUgb3ZlcmZsb3dpbmcgdGhlIHNldFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBvdmVyZmxvd2luZ0RvY0lkID0gc2VsZi5fcHVibGlzaGVkLm1heEVsZW1lbnRJZCgpO1xuICAgICAgICB2YXIgb3ZlcmZsb3dpbmdEb2MgPSBzZWxmLl9wdWJsaXNoZWQuZ2V0KG92ZXJmbG93aW5nRG9jSWQpO1xuXG4gICAgICAgIGlmIChFSlNPTi5lcXVhbHMob3ZlcmZsb3dpbmdEb2NJZCwgaWQpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIGRvY3VtZW50IGp1c3QgYWRkZWQgaXMgb3ZlcmZsb3dpbmcgdGhlIHB1Ymxpc2hlZCBzZXRcIik7XG4gICAgICAgIH1cblxuICAgICAgICBzZWxmLl9wdWJsaXNoZWQucmVtb3ZlKG92ZXJmbG93aW5nRG9jSWQpO1xuICAgICAgICBzZWxmLl9tdWx0aXBsZXhlci5yZW1vdmVkKG92ZXJmbG93aW5nRG9jSWQpO1xuICAgICAgICBzZWxmLl9hZGRCdWZmZXJlZChvdmVyZmxvd2luZ0RvY0lkLCBvdmVyZmxvd2luZ0RvYyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG4gIF9yZW1vdmVQdWJsaXNoZWQ6IGZ1bmN0aW9uIChpZCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBNZXRlb3IuX25vWWllbGRzQWxsb3dlZChmdW5jdGlvbiAoKSB7XG4gICAgICBzZWxmLl9wdWJsaXNoZWQucmVtb3ZlKGlkKTtcbiAgICAgIHNlbGYuX211bHRpcGxleGVyLnJlbW92ZWQoaWQpO1xuICAgICAgaWYgKCEgc2VsZi5fbGltaXQgfHwgc2VsZi5fcHVibGlzaGVkLnNpemUoKSA9PT0gc2VsZi5fbGltaXQpXG4gICAgICAgIHJldHVybjtcblxuICAgICAgaWYgKHNlbGYuX3B1Ymxpc2hlZC5zaXplKCkgPiBzZWxmLl9saW1pdClcbiAgICAgICAgdGhyb3cgRXJyb3IoXCJzZWxmLl9wdWJsaXNoZWQgZ290IHRvbyBiaWdcIik7XG5cbiAgICAgIC8vIE9LLCB3ZSBhcmUgcHVibGlzaGluZyBsZXNzIHRoYW4gdGhlIGxpbWl0LiBNYXliZSB3ZSBzaG91bGQgbG9vayBpbiB0aGVcbiAgICAgIC8vIGJ1ZmZlciB0byBmaW5kIHRoZSBuZXh0IGVsZW1lbnQgcGFzdCB3aGF0IHdlIHdlcmUgcHVibGlzaGluZyBiZWZvcmUuXG5cbiAgICAgIGlmICghc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIuZW1wdHkoKSkge1xuICAgICAgICAvLyBUaGVyZSdzIHNvbWV0aGluZyBpbiB0aGUgYnVmZmVyOyBtb3ZlIHRoZSBmaXJzdCB0aGluZyBpbiBpdCB0b1xuICAgICAgICAvLyBfcHVibGlzaGVkLlxuICAgICAgICB2YXIgbmV3RG9jSWQgPSBzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlci5taW5FbGVtZW50SWQoKTtcbiAgICAgICAgdmFyIG5ld0RvYyA9IHNlbGYuX3VucHVibGlzaGVkQnVmZmVyLmdldChuZXdEb2NJZCk7XG4gICAgICAgIHNlbGYuX3JlbW92ZUJ1ZmZlcmVkKG5ld0RvY0lkKTtcbiAgICAgICAgc2VsZi5fYWRkUHVibGlzaGVkKG5ld0RvY0lkLCBuZXdEb2MpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFRoZXJlJ3Mgbm90aGluZyBpbiB0aGUgYnVmZmVyLiAgVGhpcyBjb3VsZCBtZWFuIG9uZSBvZiBhIGZldyB0aGluZ3MuXG5cbiAgICAgIC8vIChhKSBXZSBjb3VsZCBiZSBpbiB0aGUgbWlkZGxlIG9mIHJlLXJ1bm5pbmcgdGhlIHF1ZXJ5IChzcGVjaWZpY2FsbHksIHdlXG4gICAgICAvLyBjb3VsZCBiZSBpbiBfcHVibGlzaE5ld1Jlc3VsdHMpLiBJbiB0aGF0IGNhc2UsIF91bnB1Ymxpc2hlZEJ1ZmZlciBpc1xuICAgICAgLy8gZW1wdHkgYmVjYXVzZSB3ZSBjbGVhciBpdCBhdCB0aGUgYmVnaW5uaW5nIG9mIF9wdWJsaXNoTmV3UmVzdWx0cy4gSW5cbiAgICAgIC8vIHRoaXMgY2FzZSwgb3VyIGNhbGxlciBhbHJlYWR5IGtub3dzIHRoZSBlbnRpcmUgYW5zd2VyIHRvIHRoZSBxdWVyeSBhbmRcbiAgICAgIC8vIHdlIGRvbid0IG5lZWQgdG8gZG8gYW55dGhpbmcgZmFuY3kgaGVyZS4gIEp1c3QgcmV0dXJuLlxuICAgICAgaWYgKHNlbGYuX3BoYXNlID09PSBQSEFTRS5RVUVSWUlORylcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICAvLyAoYikgV2UncmUgcHJldHR5IGNvbmZpZGVudCB0aGF0IHRoZSB1bmlvbiBvZiBfcHVibGlzaGVkIGFuZFxuICAgICAgLy8gX3VucHVibGlzaGVkQnVmZmVyIGNvbnRhaW4gYWxsIGRvY3VtZW50cyB0aGF0IG1hdGNoIHNlbGVjdG9yLiBCZWNhdXNlXG4gICAgICAvLyBfdW5wdWJsaXNoZWRCdWZmZXIgaXMgZW1wdHksIHRoYXQgbWVhbnMgd2UncmUgY29uZmlkZW50IHRoYXQgX3B1Ymxpc2hlZFxuICAgICAgLy8gY29udGFpbnMgYWxsIGRvY3VtZW50cyB0aGF0IG1hdGNoIHNlbGVjdG9yLiBTbyB3ZSBoYXZlIG5vdGhpbmcgdG8gZG8uXG4gICAgICBpZiAoc2VsZi5fc2FmZUFwcGVuZFRvQnVmZmVyKVxuICAgICAgICByZXR1cm47XG5cbiAgICAgIC8vIChjKSBNYXliZSB0aGVyZSBhcmUgb3RoZXIgZG9jdW1lbnRzIG91dCB0aGVyZSB0aGF0IHNob3VsZCBiZSBpbiBvdXJcbiAgICAgIC8vIGJ1ZmZlci4gQnV0IGluIHRoYXQgY2FzZSwgd2hlbiB3ZSBlbXB0aWVkIF91bnB1Ymxpc2hlZEJ1ZmZlciBpblxuICAgICAgLy8gX3JlbW92ZUJ1ZmZlcmVkLCB3ZSBzaG91bGQgaGF2ZSBjYWxsZWQgX25lZWRUb1BvbGxRdWVyeSwgd2hpY2ggd2lsbFxuICAgICAgLy8gZWl0aGVyIHB1dCBzb21ldGhpbmcgaW4gX3VucHVibGlzaGVkQnVmZmVyIG9yIHNldCBfc2FmZUFwcGVuZFRvQnVmZmVyXG4gICAgICAvLyAob3IgYm90aCksIGFuZCBpdCB3aWxsIHB1dCB1cyBpbiBRVUVSWUlORyBmb3IgdGhhdCB3aG9sZSB0aW1lLiBTbyBpblxuICAgICAgLy8gZmFjdCwgd2Ugc2hvdWxkbid0IGJlIGFibGUgdG8gZ2V0IGhlcmUuXG5cbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkJ1ZmZlciBpbmV4cGxpY2FibHkgZW1wdHlcIik7XG4gICAgfSk7XG4gIH0sXG4gIF9jaGFuZ2VQdWJsaXNoZWQ6IGZ1bmN0aW9uIChpZCwgb2xkRG9jLCBuZXdEb2MpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgTWV0ZW9yLl9ub1lpZWxkc0FsbG93ZWQoZnVuY3Rpb24gKCkge1xuICAgICAgc2VsZi5fcHVibGlzaGVkLnNldChpZCwgc2VsZi5fc2hhcmVkUHJvamVjdGlvbkZuKG5ld0RvYykpO1xuICAgICAgdmFyIHByb2plY3RlZE5ldyA9IHNlbGYuX3Byb2plY3Rpb25GbihuZXdEb2MpO1xuICAgICAgdmFyIHByb2plY3RlZE9sZCA9IHNlbGYuX3Byb2plY3Rpb25GbihvbGREb2MpO1xuICAgICAgdmFyIGNoYW5nZWQgPSBEaWZmU2VxdWVuY2UubWFrZUNoYW5nZWRGaWVsZHMoXG4gICAgICAgIHByb2plY3RlZE5ldywgcHJvamVjdGVkT2xkKTtcbiAgICAgIGlmICghaXNFbXB0eShjaGFuZ2VkKSlcbiAgICAgICAgc2VsZi5fbXVsdGlwbGV4ZXIuY2hhbmdlZChpZCwgY2hhbmdlZCk7XG4gICAgfSk7XG4gIH0sXG4gIF9hZGRCdWZmZXJlZDogZnVuY3Rpb24gKGlkLCBkb2MpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgTWV0ZW9yLl9ub1lpZWxkc0FsbG93ZWQoZnVuY3Rpb24gKCkge1xuICAgICAgc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIuc2V0KGlkLCBzZWxmLl9zaGFyZWRQcm9qZWN0aW9uRm4oZG9jKSk7XG5cbiAgICAgIC8vIElmIHNvbWV0aGluZyBpcyBvdmVyZmxvd2luZyB0aGUgYnVmZmVyLCB3ZSBqdXN0IHJlbW92ZSBpdCBmcm9tIGNhY2hlXG4gICAgICBpZiAoc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIuc2l6ZSgpID4gc2VsZi5fbGltaXQpIHtcbiAgICAgICAgdmFyIG1heEJ1ZmZlcmVkSWQgPSBzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlci5tYXhFbGVtZW50SWQoKTtcblxuICAgICAgICBzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlci5yZW1vdmUobWF4QnVmZmVyZWRJZCk7XG5cbiAgICAgICAgLy8gU2luY2Ugc29tZXRoaW5nIG1hdGNoaW5nIGlzIHJlbW92ZWQgZnJvbSBjYWNoZSAoYm90aCBwdWJsaXNoZWQgc2V0IGFuZFxuICAgICAgICAvLyBidWZmZXIpLCBzZXQgZmxhZyB0byBmYWxzZVxuICAgICAgICBzZWxmLl9zYWZlQXBwZW5kVG9CdWZmZXIgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgLy8gSXMgY2FsbGVkIGVpdGhlciB0byByZW1vdmUgdGhlIGRvYyBjb21wbGV0ZWx5IGZyb20gbWF0Y2hpbmcgc2V0IG9yIHRvIG1vdmVcbiAgLy8gaXQgdG8gdGhlIHB1Ymxpc2hlZCBzZXQgbGF0ZXIuXG4gIF9yZW1vdmVCdWZmZXJlZDogZnVuY3Rpb24gKGlkKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIE1ldGVvci5fbm9ZaWVsZHNBbGxvd2VkKGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYuX3VucHVibGlzaGVkQnVmZmVyLnJlbW92ZShpZCk7XG4gICAgICAvLyBUbyBrZWVwIHRoZSBjb250cmFjdCBcImJ1ZmZlciBpcyBuZXZlciBlbXB0eSBpbiBTVEVBRFkgcGhhc2UgdW5sZXNzIHRoZVxuICAgICAgLy8gZXZlcnl0aGluZyBtYXRjaGluZyBmaXRzIGludG8gcHVibGlzaGVkXCIgdHJ1ZSwgd2UgcG9sbCBldmVyeXRoaW5nIGFzXG4gICAgICAvLyBzb29uIGFzIHdlIHNlZSB0aGUgYnVmZmVyIGJlY29taW5nIGVtcHR5LlxuICAgICAgaWYgKCEgc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIuc2l6ZSgpICYmICEgc2VsZi5fc2FmZUFwcGVuZFRvQnVmZmVyKVxuICAgICAgICBzZWxmLl9uZWVkVG9Qb2xsUXVlcnkoKTtcbiAgICB9KTtcbiAgfSxcbiAgLy8gQ2FsbGVkIHdoZW4gYSBkb2N1bWVudCBoYXMgam9pbmVkIHRoZSBcIk1hdGNoaW5nXCIgcmVzdWx0cyBzZXQuXG4gIC8vIFRha2VzIHJlc3BvbnNpYmlsaXR5IG9mIGtlZXBpbmcgX3VucHVibGlzaGVkQnVmZmVyIGluIHN5bmMgd2l0aCBfcHVibGlzaGVkXG4gIC8vIGFuZCB0aGUgZWZmZWN0IG9mIGxpbWl0IGVuZm9yY2VkLlxuICBfYWRkTWF0Y2hpbmc6IGZ1bmN0aW9uIChkb2MpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgTWV0ZW9yLl9ub1lpZWxkc0FsbG93ZWQoZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGlkID0gZG9jLl9pZDtcbiAgICAgIGlmIChzZWxmLl9wdWJsaXNoZWQuaGFzKGlkKSlcbiAgICAgICAgdGhyb3cgRXJyb3IoXCJ0cmllZCB0byBhZGQgc29tZXRoaW5nIGFscmVhZHkgcHVibGlzaGVkIFwiICsgaWQpO1xuICAgICAgaWYgKHNlbGYuX2xpbWl0ICYmIHNlbGYuX3VucHVibGlzaGVkQnVmZmVyLmhhcyhpZCkpXG4gICAgICAgIHRocm93IEVycm9yKFwidHJpZWQgdG8gYWRkIHNvbWV0aGluZyBhbHJlYWR5IGV4aXN0ZWQgaW4gYnVmZmVyIFwiICsgaWQpO1xuXG4gICAgICB2YXIgbGltaXQgPSBzZWxmLl9saW1pdDtcbiAgICAgIHZhciBjb21wYXJhdG9yID0gc2VsZi5fY29tcGFyYXRvcjtcbiAgICAgIHZhciBtYXhQdWJsaXNoZWQgPSAobGltaXQgJiYgc2VsZi5fcHVibGlzaGVkLnNpemUoKSA+IDApID9cbiAgICAgICAgc2VsZi5fcHVibGlzaGVkLmdldChzZWxmLl9wdWJsaXNoZWQubWF4RWxlbWVudElkKCkpIDogbnVsbDtcbiAgICAgIHZhciBtYXhCdWZmZXJlZCA9IChsaW1pdCAmJiBzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlci5zaXplKCkgPiAwKVxuICAgICAgICA/IHNlbGYuX3VucHVibGlzaGVkQnVmZmVyLmdldChzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlci5tYXhFbGVtZW50SWQoKSlcbiAgICAgICAgOiBudWxsO1xuICAgICAgLy8gVGhlIHF1ZXJ5IGlzIHVubGltaXRlZCBvciBkaWRuJ3QgcHVibGlzaCBlbm91Z2ggZG9jdW1lbnRzIHlldCBvciB0aGVcbiAgICAgIC8vIG5ldyBkb2N1bWVudCB3b3VsZCBmaXQgaW50byBwdWJsaXNoZWQgc2V0IHB1c2hpbmcgdGhlIG1heGltdW0gZWxlbWVudFxuICAgICAgLy8gb3V0LCB0aGVuIHdlIG5lZWQgdG8gcHVibGlzaCB0aGUgZG9jLlxuICAgICAgdmFyIHRvUHVibGlzaCA9ICEgbGltaXQgfHwgc2VsZi5fcHVibGlzaGVkLnNpemUoKSA8IGxpbWl0IHx8XG4gICAgICAgIGNvbXBhcmF0b3IoZG9jLCBtYXhQdWJsaXNoZWQpIDwgMDtcblxuICAgICAgLy8gT3RoZXJ3aXNlIHdlIG1pZ2h0IG5lZWQgdG8gYnVmZmVyIGl0IChvbmx5IGluIGNhc2Ugb2YgbGltaXRlZCBxdWVyeSkuXG4gICAgICAvLyBCdWZmZXJpbmcgaXMgYWxsb3dlZCBpZiB0aGUgYnVmZmVyIGlzIG5vdCBmaWxsZWQgdXAgeWV0IGFuZCBhbGxcbiAgICAgIC8vIG1hdGNoaW5nIGRvY3MgYXJlIGVpdGhlciBpbiB0aGUgcHVibGlzaGVkIHNldCBvciBpbiB0aGUgYnVmZmVyLlxuICAgICAgdmFyIGNhbkFwcGVuZFRvQnVmZmVyID0gIXRvUHVibGlzaCAmJiBzZWxmLl9zYWZlQXBwZW5kVG9CdWZmZXIgJiZcbiAgICAgICAgc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIuc2l6ZSgpIDwgbGltaXQ7XG5cbiAgICAgIC8vIE9yIGlmIGl0IGlzIHNtYWxsIGVub3VnaCB0byBiZSBzYWZlbHkgaW5zZXJ0ZWQgdG8gdGhlIG1pZGRsZSBvciB0aGVcbiAgICAgIC8vIGJlZ2lubmluZyBvZiB0aGUgYnVmZmVyLlxuICAgICAgdmFyIGNhbkluc2VydEludG9CdWZmZXIgPSAhdG9QdWJsaXNoICYmIG1heEJ1ZmZlcmVkICYmXG4gICAgICAgIGNvbXBhcmF0b3IoZG9jLCBtYXhCdWZmZXJlZCkgPD0gMDtcblxuICAgICAgdmFyIHRvQnVmZmVyID0gY2FuQXBwZW5kVG9CdWZmZXIgfHwgY2FuSW5zZXJ0SW50b0J1ZmZlcjtcblxuICAgICAgaWYgKHRvUHVibGlzaCkge1xuICAgICAgICBzZWxmLl9hZGRQdWJsaXNoZWQoaWQsIGRvYyk7XG4gICAgICB9IGVsc2UgaWYgKHRvQnVmZmVyKSB7XG4gICAgICAgIHNlbGYuX2FkZEJ1ZmZlcmVkKGlkLCBkb2MpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZHJvcHBpbmcgaXQgYW5kIG5vdCBzYXZpbmcgdG8gdGhlIGNhY2hlXG4gICAgICAgIHNlbGYuX3NhZmVBcHBlbmRUb0J1ZmZlciA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICAvLyBDYWxsZWQgd2hlbiBhIGRvY3VtZW50IGxlYXZlcyB0aGUgXCJNYXRjaGluZ1wiIHJlc3VsdHMgc2V0LlxuICAvLyBUYWtlcyByZXNwb25zaWJpbGl0eSBvZiBrZWVwaW5nIF91bnB1Ymxpc2hlZEJ1ZmZlciBpbiBzeW5jIHdpdGggX3B1Ymxpc2hlZFxuICAvLyBhbmQgdGhlIGVmZmVjdCBvZiBsaW1pdCBlbmZvcmNlZC5cbiAgX3JlbW92ZU1hdGNoaW5nOiBmdW5jdGlvbiAoaWQpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgTWV0ZW9yLl9ub1lpZWxkc0FsbG93ZWQoZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKCEgc2VsZi5fcHVibGlzaGVkLmhhcyhpZCkgJiYgISBzZWxmLl9saW1pdClcbiAgICAgICAgdGhyb3cgRXJyb3IoXCJ0cmllZCB0byByZW1vdmUgc29tZXRoaW5nIG1hdGNoaW5nIGJ1dCBub3QgY2FjaGVkIFwiICsgaWQpO1xuXG4gICAgICBpZiAoc2VsZi5fcHVibGlzaGVkLmhhcyhpZCkpIHtcbiAgICAgICAgc2VsZi5fcmVtb3ZlUHVibGlzaGVkKGlkKTtcbiAgICAgIH0gZWxzZSBpZiAoc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIuaGFzKGlkKSkge1xuICAgICAgICBzZWxmLl9yZW1vdmVCdWZmZXJlZChpZCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG4gIF9oYW5kbGVEb2M6IGZ1bmN0aW9uIChpZCwgbmV3RG9jKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIE1ldGVvci5fbm9ZaWVsZHNBbGxvd2VkKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBtYXRjaGVzTm93ID0gbmV3RG9jICYmIHNlbGYuX21hdGNoZXIuZG9jdW1lbnRNYXRjaGVzKG5ld0RvYykucmVzdWx0O1xuXG4gICAgICB2YXIgcHVibGlzaGVkQmVmb3JlID0gc2VsZi5fcHVibGlzaGVkLmhhcyhpZCk7XG4gICAgICB2YXIgYnVmZmVyZWRCZWZvcmUgPSBzZWxmLl9saW1pdCAmJiBzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlci5oYXMoaWQpO1xuICAgICAgdmFyIGNhY2hlZEJlZm9yZSA9IHB1Ymxpc2hlZEJlZm9yZSB8fCBidWZmZXJlZEJlZm9yZTtcblxuICAgICAgaWYgKG1hdGNoZXNOb3cgJiYgIWNhY2hlZEJlZm9yZSkge1xuICAgICAgICBzZWxmLl9hZGRNYXRjaGluZyhuZXdEb2MpO1xuICAgICAgfSBlbHNlIGlmIChjYWNoZWRCZWZvcmUgJiYgIW1hdGNoZXNOb3cpIHtcbiAgICAgICAgc2VsZi5fcmVtb3ZlTWF0Y2hpbmcoaWQpO1xuICAgICAgfSBlbHNlIGlmIChjYWNoZWRCZWZvcmUgJiYgbWF0Y2hlc05vdykge1xuICAgICAgICB2YXIgb2xkRG9jID0gc2VsZi5fcHVibGlzaGVkLmdldChpZCk7XG4gICAgICAgIHZhciBjb21wYXJhdG9yID0gc2VsZi5fY29tcGFyYXRvcjtcbiAgICAgICAgdmFyIG1pbkJ1ZmZlcmVkID0gc2VsZi5fbGltaXQgJiYgc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIuc2l6ZSgpICYmXG4gICAgICAgICAgc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIuZ2V0KHNlbGYuX3VucHVibGlzaGVkQnVmZmVyLm1pbkVsZW1lbnRJZCgpKTtcbiAgICAgICAgdmFyIG1heEJ1ZmZlcmVkO1xuXG4gICAgICAgIGlmIChwdWJsaXNoZWRCZWZvcmUpIHtcbiAgICAgICAgICAvLyBVbmxpbWl0ZWQgY2FzZSB3aGVyZSB0aGUgZG9jdW1lbnQgc3RheXMgaW4gcHVibGlzaGVkIG9uY2UgaXRcbiAgICAgICAgICAvLyBtYXRjaGVzIG9yIHRoZSBjYXNlIHdoZW4gd2UgZG9uJ3QgaGF2ZSBlbm91Z2ggbWF0Y2hpbmcgZG9jcyB0b1xuICAgICAgICAgIC8vIHB1Ymxpc2ggb3IgdGhlIGNoYW5nZWQgYnV0IG1hdGNoaW5nIGRvYyB3aWxsIHN0YXkgaW4gcHVibGlzaGVkXG4gICAgICAgICAgLy8gYW55d2F5cy5cbiAgICAgICAgICAvL1xuICAgICAgICAgIC8vIFhYWDogV2UgcmVseSBvbiB0aGUgZW1wdGluZXNzIG9mIGJ1ZmZlci4gQmUgc3VyZSB0byBtYWludGFpbiB0aGVcbiAgICAgICAgICAvLyBmYWN0IHRoYXQgYnVmZmVyIGNhbid0IGJlIGVtcHR5IGlmIHRoZXJlIGFyZSBtYXRjaGluZyBkb2N1bWVudHMgbm90XG4gICAgICAgICAgLy8gcHVibGlzaGVkLiBOb3RhYmx5LCB3ZSBkb24ndCB3YW50IHRvIHNjaGVkdWxlIHJlcG9sbCBhbmQgY29udGludWVcbiAgICAgICAgICAvLyByZWx5aW5nIG9uIHRoaXMgcHJvcGVydHkuXG4gICAgICAgICAgdmFyIHN0YXlzSW5QdWJsaXNoZWQgPSAhIHNlbGYuX2xpbWl0IHx8XG4gICAgICAgICAgICBzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlci5zaXplKCkgPT09IDAgfHxcbiAgICAgICAgICAgIGNvbXBhcmF0b3IobmV3RG9jLCBtaW5CdWZmZXJlZCkgPD0gMDtcblxuICAgICAgICAgIGlmIChzdGF5c0luUHVibGlzaGVkKSB7XG4gICAgICAgICAgICBzZWxmLl9jaGFuZ2VQdWJsaXNoZWQoaWQsIG9sZERvYywgbmV3RG9jKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gYWZ0ZXIgdGhlIGNoYW5nZSBkb2MgZG9lc24ndCBzdGF5IGluIHRoZSBwdWJsaXNoZWQsIHJlbW92ZSBpdFxuICAgICAgICAgICAgc2VsZi5fcmVtb3ZlUHVibGlzaGVkKGlkKTtcbiAgICAgICAgICAgIC8vIGJ1dCBpdCBjYW4gbW92ZSBpbnRvIGJ1ZmZlcmVkIG5vdywgY2hlY2sgaXRcbiAgICAgICAgICAgIG1heEJ1ZmZlcmVkID0gc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIuZ2V0KFxuICAgICAgICAgICAgICBzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlci5tYXhFbGVtZW50SWQoKSk7XG5cbiAgICAgICAgICAgIHZhciB0b0J1ZmZlciA9IHNlbGYuX3NhZmVBcHBlbmRUb0J1ZmZlciB8fFxuICAgICAgICAgICAgICAgICAgKG1heEJ1ZmZlcmVkICYmIGNvbXBhcmF0b3IobmV3RG9jLCBtYXhCdWZmZXJlZCkgPD0gMCk7XG5cbiAgICAgICAgICAgIGlmICh0b0J1ZmZlcikge1xuICAgICAgICAgICAgICBzZWxmLl9hZGRCdWZmZXJlZChpZCwgbmV3RG9jKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIFRocm93IGF3YXkgZnJvbSBib3RoIHB1Ymxpc2hlZCBzZXQgYW5kIGJ1ZmZlclxuICAgICAgICAgICAgICBzZWxmLl9zYWZlQXBwZW5kVG9CdWZmZXIgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoYnVmZmVyZWRCZWZvcmUpIHtcbiAgICAgICAgICBvbGREb2MgPSBzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlci5nZXQoaWQpO1xuICAgICAgICAgIC8vIHJlbW92ZSB0aGUgb2xkIHZlcnNpb24gbWFudWFsbHkgaW5zdGVhZCBvZiB1c2luZyBfcmVtb3ZlQnVmZmVyZWQgc29cbiAgICAgICAgICAvLyB3ZSBkb24ndCB0cmlnZ2VyIHRoZSBxdWVyeWluZyBpbW1lZGlhdGVseS4gIGlmIHdlIGVuZCB0aGlzIGJsb2NrXG4gICAgICAgICAgLy8gd2l0aCB0aGUgYnVmZmVyIGVtcHR5LCB3ZSB3aWxsIG5lZWQgdG8gdHJpZ2dlciB0aGUgcXVlcnkgcG9sbFxuICAgICAgICAgIC8vIG1hbnVhbGx5IHRvby5cbiAgICAgICAgICBzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlci5yZW1vdmUoaWQpO1xuXG4gICAgICAgICAgdmFyIG1heFB1Ymxpc2hlZCA9IHNlbGYuX3B1Ymxpc2hlZC5nZXQoXG4gICAgICAgICAgICBzZWxmLl9wdWJsaXNoZWQubWF4RWxlbWVudElkKCkpO1xuICAgICAgICAgIG1heEJ1ZmZlcmVkID0gc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIuc2l6ZSgpICYmXG4gICAgICAgICAgICAgICAgc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIuZ2V0KFxuICAgICAgICAgICAgICAgICAgc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIubWF4RWxlbWVudElkKCkpO1xuXG4gICAgICAgICAgLy8gdGhlIGJ1ZmZlcmVkIGRvYyB3YXMgdXBkYXRlZCwgaXQgY291bGQgbW92ZSB0byBwdWJsaXNoZWRcbiAgICAgICAgICB2YXIgdG9QdWJsaXNoID0gY29tcGFyYXRvcihuZXdEb2MsIG1heFB1Ymxpc2hlZCkgPCAwO1xuXG4gICAgICAgICAgLy8gb3Igc3RheXMgaW4gYnVmZmVyIGV2ZW4gYWZ0ZXIgdGhlIGNoYW5nZVxuICAgICAgICAgIHZhciBzdGF5c0luQnVmZmVyID0gKCEgdG9QdWJsaXNoICYmIHNlbGYuX3NhZmVBcHBlbmRUb0J1ZmZlcikgfHxcbiAgICAgICAgICAgICAgICAoIXRvUHVibGlzaCAmJiBtYXhCdWZmZXJlZCAmJlxuICAgICAgICAgICAgICAgICBjb21wYXJhdG9yKG5ld0RvYywgbWF4QnVmZmVyZWQpIDw9IDApO1xuXG4gICAgICAgICAgaWYgKHRvUHVibGlzaCkge1xuICAgICAgICAgICAgc2VsZi5fYWRkUHVibGlzaGVkKGlkLCBuZXdEb2MpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoc3RheXNJbkJ1ZmZlcikge1xuICAgICAgICAgICAgLy8gc3RheXMgaW4gYnVmZmVyIGJ1dCBjaGFuZ2VzXG4gICAgICAgICAgICBzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlci5zZXQoaWQsIG5ld0RvYyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFRocm93IGF3YXkgZnJvbSBib3RoIHB1Ymxpc2hlZCBzZXQgYW5kIGJ1ZmZlclxuICAgICAgICAgICAgc2VsZi5fc2FmZUFwcGVuZFRvQnVmZmVyID0gZmFsc2U7XG4gICAgICAgICAgICAvLyBOb3JtYWxseSB0aGlzIGNoZWNrIHdvdWxkIGhhdmUgYmVlbiBkb25lIGluIF9yZW1vdmVCdWZmZXJlZCBidXRcbiAgICAgICAgICAgIC8vIHdlIGRpZG4ndCB1c2UgaXQsIHNvIHdlIG5lZWQgdG8gZG8gaXQgb3Vyc2VsZiBub3cuXG4gICAgICAgICAgICBpZiAoISBzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlci5zaXplKCkpIHtcbiAgICAgICAgICAgICAgc2VsZi5fbmVlZFRvUG9sbFF1ZXJ5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImNhY2hlZEJlZm9yZSBpbXBsaWVzIGVpdGhlciBvZiBwdWJsaXNoZWRCZWZvcmUgb3IgYnVmZmVyZWRCZWZvcmUgaXMgdHJ1ZS5cIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgX2ZldGNoTW9kaWZpZWREb2N1bWVudHM6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5fcmVnaXN0ZXJQaGFzZUNoYW5nZShQSEFTRS5GRVRDSElORyk7XG4gICAgLy8gRGVmZXIsIGJlY2F1c2Ugbm90aGluZyBjYWxsZWQgZnJvbSB0aGUgb3Bsb2cgZW50cnkgaGFuZGxlciBtYXkgeWllbGQsXG4gICAgLy8gYnV0IGZldGNoKCkgeWllbGRzLlxuICAgIE1ldGVvci5kZWZlcihmaW5pc2hJZk5lZWRUb1BvbGxRdWVyeShhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgICB3aGlsZSAoIXNlbGYuX3N0b3BwZWQgJiYgIXNlbGYuX25lZWRUb0ZldGNoLmVtcHR5KCkpIHtcbiAgICAgICAgaWYgKHNlbGYuX3BoYXNlID09PSBQSEFTRS5RVUVSWUlORykge1xuICAgICAgICAgIC8vIFdoaWxlIGZldGNoaW5nLCB3ZSBkZWNpZGVkIHRvIGdvIGludG8gUVVFUllJTkcgbW9kZSwgYW5kIHRoZW4gd2VcbiAgICAgICAgICAvLyBzYXcgYW5vdGhlciBvcGxvZyBlbnRyeSwgc28gX25lZWRUb0ZldGNoIGlzIG5vdCBlbXB0eS4gQnV0IHdlXG4gICAgICAgICAgLy8gc2hvdWxkbid0IGZldGNoIHRoZXNlIGRvY3VtZW50cyB1bnRpbCBBRlRFUiB0aGUgcXVlcnkgaXMgZG9uZS5cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEJlaW5nIGluIHN0ZWFkeSBwaGFzZSBoZXJlIHdvdWxkIGJlIHN1cnByaXNpbmcuXG4gICAgICAgIGlmIChzZWxmLl9waGFzZSAhPT0gUEhBU0UuRkVUQ0hJTkcpXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwicGhhc2UgaW4gZmV0Y2hNb2RpZmllZERvY3VtZW50czogXCIgKyBzZWxmLl9waGFzZSk7XG5cbiAgICAgICAgc2VsZi5fY3VycmVudGx5RmV0Y2hpbmcgPSBzZWxmLl9uZWVkVG9GZXRjaDtcbiAgICAgICAgdmFyIHRoaXNHZW5lcmF0aW9uID0gKytzZWxmLl9mZXRjaEdlbmVyYXRpb247XG4gICAgICAgIHNlbGYuX25lZWRUb0ZldGNoID0gbmV3IExvY2FsQ29sbGVjdGlvbi5fSWRNYXA7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGFuIGFycmF5IG9mIHByb21pc2VzIGZvciBhbGwgdGhlIGZldGNoIG9wZXJhdGlvbnNcbiAgICAgICAgY29uc3QgZmV0Y2hQcm9taXNlcyA9IFtdO1xuXG4gICAgICAgIHNlbGYuX2N1cnJlbnRseUZldGNoaW5nLmZvckVhY2goZnVuY3Rpb24gKG9wLCBpZCkge1xuICAgICAgICAgIGNvbnN0IGZldGNoUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHNlbGYuX21vbmdvSGFuZGxlLl9kb2NGZXRjaGVyLmZldGNoKFxuICAgICAgICAgICAgICBzZWxmLl9jdXJzb3JEZXNjcmlwdGlvbi5jb2xsZWN0aW9uTmFtZSxcbiAgICAgICAgICAgICAgaWQsXG4gICAgICAgICAgICAgIG9wLFxuICAgICAgICAgICAgICBmaW5pc2hJZk5lZWRUb1BvbGxRdWVyeShmdW5jdGlvbihlcnIsIGRvYykge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgIE1ldGVvci5fZGVidWcoJ0dvdCBleGNlcHRpb24gd2hpbGUgZmV0Y2hpbmcgZG9jdW1lbnRzJywgZXJyKTtcbiAgICAgICAgICAgICAgICAgIC8vIElmIHdlIGdldCBhbiBlcnJvciBmcm9tIHRoZSBmZXRjaGVyIChlZywgdHJvdWJsZVxuICAgICAgICAgICAgICAgICAgLy8gY29ubmVjdGluZyB0byBNb25nbyksIGxldCdzIGp1c3QgYWJhbmRvbiB0aGUgZmV0Y2ggcGhhc2VcbiAgICAgICAgICAgICAgICAgIC8vIGFsdG9nZXRoZXIgYW5kIGZhbGwgYmFjayB0byBwb2xsaW5nLiBJdCdzIG5vdCBsaWtlIHdlJ3JlXG4gICAgICAgICAgICAgICAgICAvLyBnZXR0aW5nIGxpdmUgdXBkYXRlcyBhbnl3YXkuXG4gICAgICAgICAgICAgICAgICBpZiAoc2VsZi5fcGhhc2UgIT09IFBIQVNFLlFVRVJZSU5HKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX25lZWRUb1BvbGxRdWVyeSgpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICAgICAgICFzZWxmLl9zdG9wcGVkICYmXG4gICAgICAgICAgICAgICAgICBzZWxmLl9waGFzZSA9PT0gUEhBU0UuRkVUQ0hJTkcgJiZcbiAgICAgICAgICAgICAgICAgIHNlbGYuX2ZldGNoR2VuZXJhdGlvbiA9PT0gdGhpc0dlbmVyYXRpb25cbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgIC8vIFdlIHJlLWNoZWNrIHRoZSBnZW5lcmF0aW9uIGluIGNhc2Ugd2UndmUgaGFkIGFuIGV4cGxpY2l0XG4gICAgICAgICAgICAgICAgICAvLyBfcG9sbFF1ZXJ5IGNhbGwgKGVnLCBpbiBhbm90aGVyIGZpYmVyKSB3aGljaCBzaG91bGRcbiAgICAgICAgICAgICAgICAgIC8vIGVmZmVjdGl2ZWx5IGNhbmNlbCB0aGlzIHJvdW5kIG9mIGZldGNoZXMuICAoX3BvbGxRdWVyeVxuICAgICAgICAgICAgICAgICAgLy8gaW5jcmVtZW50cyB0aGUgZ2VuZXJhdGlvbi4pXG4gICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9oYW5kbGVEb2MoaWQsIGRvYyk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIClcbiAgICAgICAgICB9KVxuICAgICAgICAgIGZldGNoUHJvbWlzZXMucHVzaChmZXRjaFByb21pc2UpO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gV2FpdCBmb3IgYWxsIGZldGNoIG9wZXJhdGlvbnMgdG8gY29tcGxldGVcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgUHJvbWlzZS5hbGxTZXR0bGVkKGZldGNoUHJvbWlzZXMpO1xuICAgICAgICAgIGNvbnN0IGVycm9ycyA9IHJlc3VsdHNcbiAgICAgICAgICAgIC5maWx0ZXIocmVzdWx0ID0+IHJlc3VsdC5zdGF0dXMgPT09ICdyZWplY3RlZCcpXG4gICAgICAgICAgICAubWFwKHJlc3VsdCA9PiByZXN1bHQucmVhc29uKTtcblxuICAgICAgICAgIGlmIChlcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgTWV0ZW9yLl9kZWJ1ZygnU29tZSBmZXRjaCBxdWVyaWVzIGZhaWxlZDonLCBlcnJvcnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgTWV0ZW9yLl9kZWJ1ZygnR290IGFuIGV4Y2VwdGlvbiBpbiBhIGZldGNoIHF1ZXJ5JywgZXJyKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBFeGl0IG5vdyBpZiB3ZSd2ZSBoYWQgYSBfcG9sbFF1ZXJ5IGNhbGwgKGhlcmUgb3IgaW4gYW5vdGhlciBmaWJlcikuXG4gICAgICAgIGlmIChzZWxmLl9waGFzZSA9PT0gUEhBU0UuUVVFUllJTkcpXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICBzZWxmLl9jdXJyZW50bHlGZXRjaGluZyA9IG51bGw7XG4gICAgICB9XG4gICAgICAvLyBXZSdyZSBkb25lIGZldGNoaW5nLCBzbyB3ZSBjYW4gYmUgc3RlYWR5LCB1bmxlc3Mgd2UndmUgaGFkIGFcbiAgICAgIC8vIF9wb2xsUXVlcnkgY2FsbCAoaGVyZSBvciBpbiBhbm90aGVyIGZpYmVyKS5cbiAgICAgIGlmIChzZWxmLl9waGFzZSAhPT0gUEhBU0UuUVVFUllJTkcpXG4gICAgICAgIGF3YWl0IHNlbGYuX2JlU3RlYWR5KCk7XG4gICAgfSkpO1xuICB9LFxuICBfYmVTdGVhZHk6IGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgc2VsZi5fcmVnaXN0ZXJQaGFzZUNoYW5nZShQSEFTRS5TVEVBRFkpO1xuICAgIHZhciB3cml0ZXMgPSBzZWxmLl93cml0ZXNUb0NvbW1pdFdoZW5XZVJlYWNoU3RlYWR5IHx8IFtdO1xuICAgIHNlbGYuX3dyaXRlc1RvQ29tbWl0V2hlbldlUmVhY2hTdGVhZHkgPSBbXTtcbiAgICBhd2FpdCBzZWxmLl9tdWx0aXBsZXhlci5vbkZsdXNoKGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGZvciAoY29uc3QgdyBvZiB3cml0ZXMpIHtcbiAgICAgICAgICBhd2FpdCB3LmNvbW1pdHRlZCgpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJfYmVTdGVhZHkgZXJyb3JcIiwge3dyaXRlc30sIGUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICBfaGFuZGxlT3Bsb2dFbnRyeVF1ZXJ5aW5nOiBmdW5jdGlvbiAob3ApIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgTWV0ZW9yLl9ub1lpZWxkc0FsbG93ZWQoZnVuY3Rpb24gKCkge1xuICAgICAgc2VsZi5fbmVlZFRvRmV0Y2guc2V0KGlkRm9yT3Aob3ApLCBvcCk7XG4gICAgfSk7XG4gIH0sXG4gIF9oYW5kbGVPcGxvZ0VudHJ5U3RlYWR5T3JGZXRjaGluZzogZnVuY3Rpb24gKG9wKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIE1ldGVvci5fbm9ZaWVsZHNBbGxvd2VkKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBpZCA9IGlkRm9yT3Aob3ApO1xuICAgICAgLy8gSWYgd2UncmUgYWxyZWFkeSBmZXRjaGluZyB0aGlzIG9uZSwgb3IgYWJvdXQgdG8sIHdlIGNhbid0IG9wdGltaXplO1xuICAgICAgLy8gbWFrZSBzdXJlIHRoYXQgd2UgZmV0Y2ggaXQgYWdhaW4gaWYgbmVjZXNzYXJ5LlxuXG4gICAgICBpZiAoc2VsZi5fcGhhc2UgPT09IFBIQVNFLkZFVENISU5HICYmXG4gICAgICAgICAgKChzZWxmLl9jdXJyZW50bHlGZXRjaGluZyAmJiBzZWxmLl9jdXJyZW50bHlGZXRjaGluZy5oYXMoaWQpKSB8fFxuICAgICAgICAgICBzZWxmLl9uZWVkVG9GZXRjaC5oYXMoaWQpKSkge1xuICAgICAgICBzZWxmLl9uZWVkVG9GZXRjaC5zZXQoaWQsIG9wKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAob3Aub3AgPT09ICdkJykge1xuICAgICAgICBpZiAoc2VsZi5fcHVibGlzaGVkLmhhcyhpZCkgfHxcbiAgICAgICAgICAgIChzZWxmLl9saW1pdCAmJiBzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlci5oYXMoaWQpKSlcbiAgICAgICAgICBzZWxmLl9yZW1vdmVNYXRjaGluZyhpZCk7XG4gICAgICB9IGVsc2UgaWYgKG9wLm9wID09PSAnaScpIHtcbiAgICAgICAgaWYgKHNlbGYuX3B1Ymxpc2hlZC5oYXMoaWQpKVxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImluc2VydCBmb3VuZCBmb3IgYWxyZWFkeS1leGlzdGluZyBJRCBpbiBwdWJsaXNoZWRcIik7XG4gICAgICAgIGlmIChzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlciAmJiBzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlci5oYXMoaWQpKVxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImluc2VydCBmb3VuZCBmb3IgYWxyZWFkeS1leGlzdGluZyBJRCBpbiBidWZmZXJcIik7XG5cbiAgICAgICAgLy8gWFhYIHdoYXQgaWYgc2VsZWN0b3IgeWllbGRzPyAgZm9yIG5vdyBpdCBjYW4ndCBidXQgbGF0ZXIgaXQgY291bGRcbiAgICAgICAgLy8gaGF2ZSAkd2hlcmVcbiAgICAgICAgaWYgKHNlbGYuX21hdGNoZXIuZG9jdW1lbnRNYXRjaGVzKG9wLm8pLnJlc3VsdClcbiAgICAgICAgICBzZWxmLl9hZGRNYXRjaGluZyhvcC5vKTtcbiAgICAgIH0gZWxzZSBpZiAob3Aub3AgPT09ICd1Jykge1xuICAgICAgICAvLyB3ZSBhcmUgbWFwcGluZyB0aGUgbmV3IG9wbG9nIGZvcm1hdCBvbiBtb25nbyA1XG4gICAgICAgIC8vIHRvIHdoYXQgd2Uga25vdyBiZXR0ZXIsICRzZXRcbiAgICAgICAgb3AubyA9IG9wbG9nVjJWMUNvbnZlcnRlcihvcC5vKVxuICAgICAgICAvLyBJcyB0aGlzIGEgbW9kaWZpZXIgKCRzZXQvJHVuc2V0LCB3aGljaCBtYXkgcmVxdWlyZSB1cyB0byBwb2xsIHRoZVxuICAgICAgICAvLyBkYXRhYmFzZSB0byBmaWd1cmUgb3V0IGlmIHRoZSB3aG9sZSBkb2N1bWVudCBtYXRjaGVzIHRoZSBzZWxlY3Rvcikgb3JcbiAgICAgICAgLy8gYSByZXBsYWNlbWVudCAoaW4gd2hpY2ggY2FzZSB3ZSBjYW4ganVzdCBkaXJlY3RseSByZS1ldmFsdWF0ZSB0aGVcbiAgICAgICAgLy8gc2VsZWN0b3IpP1xuICAgICAgICAvLyBvcGxvZyBmb3JtYXQgaGFzIGNoYW5nZWQgb24gbW9uZ29kYiA1LCB3ZSBoYXZlIHRvIHN1cHBvcnQgYm90aCBub3dcbiAgICAgICAgLy8gZGlmZiBpcyB0aGUgZm9ybWF0IGluIE1vbmdvIDUrIChvcGxvZyB2MilcbiAgICAgICAgdmFyIGlzUmVwbGFjZSA9ICFoYXMob3AubywgJyRzZXQnKSAmJiAhaGFzKG9wLm8sICdkaWZmJykgJiYgIWhhcyhvcC5vLCAnJHVuc2V0Jyk7XG4gICAgICAgIC8vIElmIHRoaXMgbW9kaWZpZXIgbW9kaWZpZXMgc29tZXRoaW5nIGluc2lkZSBhbiBFSlNPTiBjdXN0b20gdHlwZSAoaWUsXG4gICAgICAgIC8vIGFueXRoaW5nIHdpdGggRUpTT04kKSwgdGhlbiB3ZSBjYW4ndCB0cnkgdG8gdXNlXG4gICAgICAgIC8vIExvY2FsQ29sbGVjdGlvbi5fbW9kaWZ5LCBzaW5jZSB0aGF0IGp1c3QgbXV0YXRlcyB0aGUgRUpTT04gZW5jb2RpbmcsXG4gICAgICAgIC8vIG5vdCB0aGUgYWN0dWFsIG9iamVjdC5cbiAgICAgICAgdmFyIGNhbkRpcmVjdGx5TW9kaWZ5RG9jID1cbiAgICAgICAgICAhaXNSZXBsYWNlICYmIG1vZGlmaWVyQ2FuQmVEaXJlY3RseUFwcGxpZWQob3Aubyk7XG5cbiAgICAgICAgdmFyIHB1Ymxpc2hlZEJlZm9yZSA9IHNlbGYuX3B1Ymxpc2hlZC5oYXMoaWQpO1xuICAgICAgICB2YXIgYnVmZmVyZWRCZWZvcmUgPSBzZWxmLl9saW1pdCAmJiBzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlci5oYXMoaWQpO1xuXG4gICAgICAgIGlmIChpc1JlcGxhY2UpIHtcbiAgICAgICAgICBzZWxmLl9oYW5kbGVEb2MoaWQsIE9iamVjdC5hc3NpZ24oe19pZDogaWR9LCBvcC5vKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoKHB1Ymxpc2hlZEJlZm9yZSB8fCBidWZmZXJlZEJlZm9yZSkgJiZcbiAgICAgICAgICAgICAgICAgICBjYW5EaXJlY3RseU1vZGlmeURvYykge1xuICAgICAgICAgIC8vIE9oIGdyZWF0LCB3ZSBhY3R1YWxseSBrbm93IHdoYXQgdGhlIGRvY3VtZW50IGlzLCBzbyB3ZSBjYW4gYXBwbHlcbiAgICAgICAgICAvLyB0aGlzIGRpcmVjdGx5LlxuICAgICAgICAgIHZhciBuZXdEb2MgPSBzZWxmLl9wdWJsaXNoZWQuaGFzKGlkKVxuICAgICAgICAgICAgPyBzZWxmLl9wdWJsaXNoZWQuZ2V0KGlkKSA6IHNlbGYuX3VucHVibGlzaGVkQnVmZmVyLmdldChpZCk7XG4gICAgICAgICAgbmV3RG9jID0gRUpTT04uY2xvbmUobmV3RG9jKTtcblxuICAgICAgICAgIG5ld0RvYy5faWQgPSBpZDtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgTG9jYWxDb2xsZWN0aW9uLl9tb2RpZnkobmV3RG9jLCBvcC5vKTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoZS5uYW1lICE9PSBcIk1pbmltb25nb0Vycm9yXCIpXG4gICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICAvLyBXZSBkaWRuJ3QgdW5kZXJzdGFuZCB0aGUgbW9kaWZpZXIuICBSZS1mZXRjaC5cbiAgICAgICAgICAgIHNlbGYuX25lZWRUb0ZldGNoLnNldChpZCwgb3ApO1xuICAgICAgICAgICAgaWYgKHNlbGYuX3BoYXNlID09PSBQSEFTRS5TVEVBRFkpIHtcbiAgICAgICAgICAgICAgc2VsZi5fZmV0Y2hNb2RpZmllZERvY3VtZW50cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzZWxmLl9oYW5kbGVEb2MoaWQsIHNlbGYuX3NoYXJlZFByb2plY3Rpb25GbihuZXdEb2MpKTtcbiAgICAgICAgfSBlbHNlIGlmICghY2FuRGlyZWN0bHlNb2RpZnlEb2MgfHxcbiAgICAgICAgICAgICAgICAgICBzZWxmLl9tYXRjaGVyLmNhbkJlY29tZVRydWVCeU1vZGlmaWVyKG9wLm8pIHx8XG4gICAgICAgICAgICAgICAgICAgKHNlbGYuX3NvcnRlciAmJiBzZWxmLl9zb3J0ZXIuYWZmZWN0ZWRCeU1vZGlmaWVyKG9wLm8pKSkge1xuICAgICAgICAgIHNlbGYuX25lZWRUb0ZldGNoLnNldChpZCwgb3ApO1xuICAgICAgICAgIGlmIChzZWxmLl9waGFzZSA9PT0gUEhBU0UuU1RFQURZKVxuICAgICAgICAgICAgc2VsZi5fZmV0Y2hNb2RpZmllZERvY3VtZW50cygpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBFcnJvcihcIlhYWCBTVVJQUklTSU5HIE9QRVJBVElPTjogXCIgKyBvcCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgYXN5bmMgX3J1bkluaXRpYWxRdWVyeUFzeW5jKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoc2VsZi5fc3RvcHBlZClcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIm9wbG9nIHN0b3BwZWQgc3VycHJpc2luZ2x5IGVhcmx5XCIpO1xuXG4gICAgYXdhaXQgc2VsZi5fcnVuUXVlcnkoe2luaXRpYWw6IHRydWV9KTsgIC8vIHlpZWxkc1xuXG4gICAgaWYgKHNlbGYuX3N0b3BwZWQpXG4gICAgICByZXR1cm47ICAvLyBjYW4gaGFwcGVuIG9uIHF1ZXJ5RXJyb3JcblxuICAgIC8vIEFsbG93IG9ic2VydmVDaGFuZ2VzIGNhbGxzIHRvIHJldHVybi4gKEFmdGVyIHRoaXMsIGl0J3MgcG9zc2libGUgZm9yXG4gICAgLy8gc3RvcCgpIHRvIGJlIGNhbGxlZC4pXG4gICAgYXdhaXQgc2VsZi5fbXVsdGlwbGV4ZXIucmVhZHkoKTtcblxuICAgIGF3YWl0IHNlbGYuX2RvbmVRdWVyeWluZygpOyAgLy8geWllbGRzXG4gIH0sXG5cbiAgLy8gWWllbGRzIVxuICBfcnVuSW5pdGlhbFF1ZXJ5OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3J1bkluaXRpYWxRdWVyeUFzeW5jKCk7XG4gIH0sXG5cbiAgLy8gSW4gdmFyaW91cyBjaXJjdW1zdGFuY2VzLCB3ZSBtYXkganVzdCB3YW50IHRvIHN0b3AgcHJvY2Vzc2luZyB0aGUgb3Bsb2cgYW5kXG4gIC8vIHJlLXJ1biB0aGUgaW5pdGlhbCBxdWVyeSwganVzdCBhcyBpZiB3ZSB3ZXJlIGEgUG9sbGluZ09ic2VydmVEcml2ZXIuXG4gIC8vXG4gIC8vIFRoaXMgZnVuY3Rpb24gbWF5IG5vdCBibG9jaywgYmVjYXVzZSBpdCBpcyBjYWxsZWQgZnJvbSBhbiBvcGxvZyBlbnRyeVxuICAvLyBoYW5kbGVyLlxuICAvL1xuICAvLyBYWFggV2Ugc2hvdWxkIGNhbGwgdGhpcyB3aGVuIHdlIGRldGVjdCB0aGF0IHdlJ3ZlIGJlZW4gaW4gRkVUQ0hJTkcgZm9yIFwidG9vXG4gIC8vIGxvbmdcIi5cbiAgLy9cbiAgLy8gWFhYIFdlIHNob3VsZCBjYWxsIHRoaXMgd2hlbiB3ZSBkZXRlY3QgTW9uZ28gZmFpbG92ZXIgKHNpbmNlIHRoYXQgbWlnaHRcbiAgLy8gbWVhbiB0aGF0IHNvbWUgb2YgdGhlIG9wbG9nIGVudHJpZXMgd2UgaGF2ZSBwcm9jZXNzZWQgaGF2ZSBiZWVuIHJvbGxlZFxuICAvLyBiYWNrKS4gVGhlIE5vZGUgTW9uZ28gZHJpdmVyIGlzIGluIHRoZSBtaWRkbGUgb2YgYSBidW5jaCBvZiBodWdlXG4gIC8vIHJlZmFjdG9yaW5ncywgaW5jbHVkaW5nIHRoZSB3YXkgdGhhdCBpdCBub3RpZmllcyB5b3Ugd2hlbiBwcmltYXJ5XG4gIC8vIGNoYW5nZXMuIFdpbGwgcHV0IG9mZiBpbXBsZW1lbnRpbmcgdGhpcyB1bnRpbCBkcml2ZXIgMS40IGlzIG91dC5cbiAgX3BvbGxRdWVyeTogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBNZXRlb3IuX25vWWllbGRzQWxsb3dlZChmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoc2VsZi5fc3RvcHBlZClcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICAvLyBZYXksIHdlIGdldCB0byBmb3JnZXQgYWJvdXQgYWxsIHRoZSB0aGluZ3Mgd2UgdGhvdWdodCB3ZSBoYWQgdG8gZmV0Y2guXG4gICAgICBzZWxmLl9uZWVkVG9GZXRjaCA9IG5ldyBMb2NhbENvbGxlY3Rpb24uX0lkTWFwO1xuICAgICAgc2VsZi5fY3VycmVudGx5RmV0Y2hpbmcgPSBudWxsO1xuICAgICAgKytzZWxmLl9mZXRjaEdlbmVyYXRpb247ICAvLyBpZ25vcmUgYW55IGluLWZsaWdodCBmZXRjaGVzXG4gICAgICBzZWxmLl9yZWdpc3RlclBoYXNlQ2hhbmdlKFBIQVNFLlFVRVJZSU5HKTtcblxuICAgICAgLy8gRGVmZXIgc28gdGhhdCB3ZSBkb24ndCB5aWVsZC4gIFdlIGRvbid0IG5lZWQgZmluaXNoSWZOZWVkVG9Qb2xsUXVlcnlcbiAgICAgIC8vIGhlcmUgYmVjYXVzZSBTd2l0Y2hlZFRvUXVlcnkgaXMgbm90IHRocm93biBpbiBRVUVSWUlORyBtb2RlLlxuICAgICAgTWV0ZW9yLmRlZmVyKGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgYXdhaXQgc2VsZi5fcnVuUXVlcnkoKTtcbiAgICAgICAgYXdhaXQgc2VsZi5fZG9uZVF1ZXJ5aW5nKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSxcblxuICAvLyBZaWVsZHMhXG4gIGFzeW5jIF9ydW5RdWVyeUFzeW5jKG9wdGlvbnMpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdmFyIG5ld1Jlc3VsdHMsIG5ld0J1ZmZlcjtcblxuICAgIC8vIFRoaXMgd2hpbGUgbG9vcCBpcyBqdXN0IHRvIHJldHJ5IGZhaWx1cmVzLlxuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAvLyBJZiB3ZSd2ZSBiZWVuIHN0b3BwZWQsIHdlIGRvbid0IGhhdmUgdG8gcnVuIGFueXRoaW5nIGFueSBtb3JlLlxuICAgICAgaWYgKHNlbGYuX3N0b3BwZWQpXG4gICAgICAgIHJldHVybjtcblxuICAgICAgbmV3UmVzdWx0cyA9IG5ldyBMb2NhbENvbGxlY3Rpb24uX0lkTWFwO1xuICAgICAgbmV3QnVmZmVyID0gbmV3IExvY2FsQ29sbGVjdGlvbi5fSWRNYXA7XG5cbiAgICAgIC8vIFF1ZXJ5IDJ4IGRvY3VtZW50cyBhcyB0aGUgaGFsZiBleGNsdWRlZCBmcm9tIHRoZSBvcmlnaW5hbCBxdWVyeSB3aWxsIGdvXG4gICAgICAvLyBpbnRvIHVucHVibGlzaGVkIGJ1ZmZlciB0byByZWR1Y2UgYWRkaXRpb25hbCBNb25nbyBsb29rdXBzIGluIGNhc2VzXG4gICAgICAvLyB3aGVuIGRvY3VtZW50cyBhcmUgcmVtb3ZlZCBmcm9tIHRoZSBwdWJsaXNoZWQgc2V0IGFuZCBuZWVkIGFcbiAgICAgIC8vIHJlcGxhY2VtZW50LlxuICAgICAgLy8gWFhYIG5lZWRzIG1vcmUgdGhvdWdodCBvbiBub24temVybyBza2lwXG4gICAgICAvLyBYWFggMiBpcyBhIFwibWFnaWMgbnVtYmVyXCIgbWVhbmluZyB0aGVyZSBpcyBhbiBleHRyYSBjaHVuayBvZiBkb2NzIGZvclxuICAgICAgLy8gYnVmZmVyIGlmIHN1Y2ggaXMgbmVlZGVkLlxuICAgICAgdmFyIGN1cnNvciA9IHNlbGYuX2N1cnNvckZvclF1ZXJ5KHsgbGltaXQ6IHNlbGYuX2xpbWl0ICogMiB9KTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGN1cnNvci5mb3JFYWNoKGZ1bmN0aW9uIChkb2MsIGkpIHsgIC8vIHlpZWxkc1xuICAgICAgICAgIGlmICghc2VsZi5fbGltaXQgfHwgaSA8IHNlbGYuX2xpbWl0KSB7XG4gICAgICAgICAgICBuZXdSZXN1bHRzLnNldChkb2MuX2lkLCBkb2MpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXdCdWZmZXIuc2V0KGRvYy5faWQsIGRvYyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChvcHRpb25zLmluaXRpYWwgJiYgdHlwZW9mKGUuY29kZSkgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgLy8gVGhpcyBpcyBhbiBlcnJvciBkb2N1bWVudCBzZW50IHRvIHVzIGJ5IG1vbmdvZCwgbm90IGEgY29ubmVjdGlvblxuICAgICAgICAgIC8vIGVycm9yIGdlbmVyYXRlZCBieSB0aGUgY2xpZW50LiBBbmQgd2UndmUgbmV2ZXIgc2VlbiB0aGlzIHF1ZXJ5IHdvcmtcbiAgICAgICAgICAvLyBzdWNjZXNzZnVsbHkuIFByb2JhYmx5IGl0J3MgYSBiYWQgc2VsZWN0b3Igb3Igc29tZXRoaW5nLCBzbyB3ZVxuICAgICAgICAgIC8vIHNob3VsZCBOT1QgcmV0cnkuIEluc3RlYWQsIHdlIHNob3VsZCBoYWx0IHRoZSBvYnNlcnZlICh3aGljaCBlbmRzXG4gICAgICAgICAgLy8gdXAgY2FsbGluZyBgc3RvcGAgb24gdXMpLlxuICAgICAgICAgIGF3YWl0IHNlbGYuX211bHRpcGxleGVyLnF1ZXJ5RXJyb3IoZSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRHVyaW5nIGZhaWxvdmVyIChlZykgaWYgd2UgZ2V0IGFuIGV4Y2VwdGlvbiB3ZSBzaG91bGQgbG9nIGFuZCByZXRyeVxuICAgICAgICAvLyBpbnN0ZWFkIG9mIGNyYXNoaW5nLlxuICAgICAgICBNZXRlb3IuX2RlYnVnKFwiR290IGV4Y2VwdGlvbiB3aGlsZSBwb2xsaW5nIHF1ZXJ5XCIsIGUpO1xuICAgICAgICBhd2FpdCBNZXRlb3IuX3NsZWVwRm9yTXMoMTAwKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc2VsZi5fc3RvcHBlZClcbiAgICAgIHJldHVybjtcblxuICAgIHNlbGYuX3B1Ymxpc2hOZXdSZXN1bHRzKG5ld1Jlc3VsdHMsIG5ld0J1ZmZlcik7XG4gIH0sXG5cbiAgLy8gWWllbGRzIVxuICBfcnVuUXVlcnk6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMuX3J1blF1ZXJ5QXN5bmMob3B0aW9ucyk7XG4gIH0sXG5cbiAgLy8gVHJhbnNpdGlvbnMgdG8gUVVFUllJTkcgYW5kIHJ1bnMgYW5vdGhlciBxdWVyeSwgb3IgKGlmIGFscmVhZHkgaW4gUVVFUllJTkcpXG4gIC8vIGVuc3VyZXMgdGhhdCB3ZSB3aWxsIHF1ZXJ5IGFnYWluIGxhdGVyLlxuICAvL1xuICAvLyBUaGlzIGZ1bmN0aW9uIG1heSBub3QgYmxvY2ssIGJlY2F1c2UgaXQgaXMgY2FsbGVkIGZyb20gYW4gb3Bsb2cgZW50cnlcbiAgLy8gaGFuZGxlci4gSG93ZXZlciwgaWYgd2Ugd2VyZSBub3QgYWxyZWFkeSBpbiB0aGUgUVVFUllJTkcgcGhhc2UsIGl0IHRocm93c1xuICAvLyBhbiBleGNlcHRpb24gdGhhdCBpcyBjYXVnaHQgYnkgdGhlIGNsb3Nlc3Qgc3Vycm91bmRpbmdcbiAgLy8gZmluaXNoSWZOZWVkVG9Qb2xsUXVlcnkgY2FsbDsgdGhpcyBlbnN1cmVzIHRoYXQgd2UgZG9uJ3QgY29udGludWUgcnVubmluZ1xuICAvLyBjbG9zZSB0aGF0IHdhcyBkZXNpZ25lZCBmb3IgYW5vdGhlciBwaGFzZSBpbnNpZGUgUEhBU0UuUVVFUllJTkcuXG4gIC8vXG4gIC8vIChJdCdzIGFsc28gbmVjZXNzYXJ5IHdoZW5ldmVyIGxvZ2ljIGluIHRoaXMgZmlsZSB5aWVsZHMgdG8gY2hlY2sgdGhhdCBvdGhlclxuICAvLyBwaGFzZXMgaGF2ZW4ndCBwdXQgdXMgaW50byBRVUVSWUlORyBtb2RlLCB0aG91Z2g7IGVnLFxuICAvLyBfZmV0Y2hNb2RpZmllZERvY3VtZW50cyBkb2VzIHRoaXMuKVxuICBfbmVlZFRvUG9sbFF1ZXJ5OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIE1ldGVvci5fbm9ZaWVsZHNBbGxvd2VkKGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChzZWxmLl9zdG9wcGVkKVxuICAgICAgICByZXR1cm47XG5cbiAgICAgIC8vIElmIHdlJ3JlIG5vdCBhbHJlYWR5IGluIHRoZSBtaWRkbGUgb2YgYSBxdWVyeSwgd2UgY2FuIHF1ZXJ5IG5vd1xuICAgICAgLy8gKHBvc3NpYmx5IHBhdXNpbmcgRkVUQ0hJTkcpLlxuICAgICAgaWYgKHNlbGYuX3BoYXNlICE9PSBQSEFTRS5RVUVSWUlORykge1xuICAgICAgICBzZWxmLl9wb2xsUXVlcnkoKTtcbiAgICAgICAgdGhyb3cgbmV3IFN3aXRjaGVkVG9RdWVyeTtcbiAgICAgIH1cblxuICAgICAgLy8gV2UncmUgY3VycmVudGx5IGluIFFVRVJZSU5HLiBTZXQgYSBmbGFnIHRvIGVuc3VyZSB0aGF0IHdlIHJ1biBhbm90aGVyXG4gICAgICAvLyBxdWVyeSB3aGVuIHdlJ3JlIGRvbmUuXG4gICAgICBzZWxmLl9yZXF1ZXJ5V2hlbkRvbmVUaGlzUXVlcnkgPSB0cnVlO1xuICAgIH0pO1xuICB9LFxuXG4gIC8vIFlpZWxkcyFcbiAgX2RvbmVRdWVyeWluZzogYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGlmIChzZWxmLl9zdG9wcGVkKVxuICAgICAgcmV0dXJuO1xuXG4gICAgYXdhaXQgc2VsZi5fbW9uZ29IYW5kbGUuX29wbG9nSGFuZGxlLndhaXRVbnRpbENhdWdodFVwKCk7XG5cbiAgICBpZiAoc2VsZi5fc3RvcHBlZClcbiAgICAgIHJldHVybjtcblxuICAgIGlmIChzZWxmLl9waGFzZSAhPT0gUEhBU0UuUVVFUllJTkcpXG4gICAgICB0aHJvdyBFcnJvcihcIlBoYXNlIHVuZXhwZWN0ZWRseSBcIiArIHNlbGYuX3BoYXNlKTtcblxuICAgIGlmIChzZWxmLl9yZXF1ZXJ5V2hlbkRvbmVUaGlzUXVlcnkpIHtcbiAgICAgIHNlbGYuX3JlcXVlcnlXaGVuRG9uZVRoaXNRdWVyeSA9IGZhbHNlO1xuICAgICAgc2VsZi5fcG9sbFF1ZXJ5KCk7XG4gICAgfSBlbHNlIGlmIChzZWxmLl9uZWVkVG9GZXRjaC5lbXB0eSgpKSB7XG4gICAgICBhd2FpdCBzZWxmLl9iZVN0ZWFkeSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZWxmLl9mZXRjaE1vZGlmaWVkRG9jdW1lbnRzKCk7XG4gICAgfVxuICB9LFxuXG4gIF9jdXJzb3JGb3JRdWVyeTogZnVuY3Rpb24gKG9wdGlvbnNPdmVyd3JpdGUpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgcmV0dXJuIE1ldGVvci5fbm9ZaWVsZHNBbGxvd2VkKGZ1bmN0aW9uICgpIHtcbiAgICAgIC8vIFRoZSBxdWVyeSB3ZSBydW4gaXMgYWxtb3N0IHRoZSBzYW1lIGFzIHRoZSBjdXJzb3Igd2UgYXJlIG9ic2VydmluZyxcbiAgICAgIC8vIHdpdGggYSBmZXcgY2hhbmdlcy4gV2UgbmVlZCB0byByZWFkIGFsbCB0aGUgZmllbGRzIHRoYXQgYXJlIHJlbGV2YW50IHRvXG4gICAgICAvLyB0aGUgc2VsZWN0b3IsIG5vdCBqdXN0IHRoZSBmaWVsZHMgd2UgYXJlIGdvaW5nIHRvIHB1Ymxpc2ggKHRoYXQncyB0aGVcbiAgICAgIC8vIFwic2hhcmVkXCIgcHJvamVjdGlvbikuIEFuZCB3ZSBkb24ndCB3YW50IHRvIGFwcGx5IGFueSB0cmFuc2Zvcm0gaW4gdGhlXG4gICAgICAvLyBjdXJzb3IsIGJlY2F1c2Ugb2JzZXJ2ZUNoYW5nZXMgc2hvdWxkbid0IHVzZSB0aGUgdHJhbnNmb3JtLlxuICAgICAgdmFyIG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBzZWxmLl9jdXJzb3JEZXNjcmlwdGlvbi5vcHRpb25zKTtcblxuICAgICAgLy8gQWxsb3cgdGhlIGNhbGxlciB0byBtb2RpZnkgdGhlIG9wdGlvbnMuIFVzZWZ1bCB0byBzcGVjaWZ5IGRpZmZlcmVudFxuICAgICAgLy8gc2tpcCBhbmQgbGltaXQgdmFsdWVzLlxuICAgICAgT2JqZWN0LmFzc2lnbihvcHRpb25zLCBvcHRpb25zT3ZlcndyaXRlKTtcblxuICAgICAgb3B0aW9ucy5maWVsZHMgPSBzZWxmLl9zaGFyZWRQcm9qZWN0aW9uO1xuICAgICAgZGVsZXRlIG9wdGlvbnMudHJhbnNmb3JtO1xuICAgICAgLy8gV2UgYXJlIE5PVCBkZWVwIGNsb25pbmcgZmllbGRzIG9yIHNlbGVjdG9yIGhlcmUsIHdoaWNoIHNob3VsZCBiZSBPSy5cbiAgICAgIHZhciBkZXNjcmlwdGlvbiA9IG5ldyBDdXJzb3JEZXNjcmlwdGlvbihcbiAgICAgICAgc2VsZi5fY3Vyc29yRGVzY3JpcHRpb24uY29sbGVjdGlvbk5hbWUsXG4gICAgICAgIHNlbGYuX2N1cnNvckRlc2NyaXB0aW9uLnNlbGVjdG9yLFxuICAgICAgICBvcHRpb25zKTtcbiAgICAgIHJldHVybiBuZXcgQ3Vyc29yKHNlbGYuX21vbmdvSGFuZGxlLCBkZXNjcmlwdGlvbik7XG4gICAgfSk7XG4gIH0sXG5cblxuICAvLyBSZXBsYWNlIHNlbGYuX3B1Ymxpc2hlZCB3aXRoIG5ld1Jlc3VsdHMgKGJvdGggYXJlIElkTWFwcyksIGludm9raW5nIG9ic2VydmVcbiAgLy8gY2FsbGJhY2tzIG9uIHRoZSBtdWx0aXBsZXhlci5cbiAgLy8gUmVwbGFjZSBzZWxmLl91bnB1Ymxpc2hlZEJ1ZmZlciB3aXRoIG5ld0J1ZmZlci5cbiAgLy9cbiAgLy8gWFhYIFRoaXMgaXMgdmVyeSBzaW1pbGFyIHRvIExvY2FsQ29sbGVjdGlvbi5fZGlmZlF1ZXJ5VW5vcmRlcmVkQ2hhbmdlcy4gV2VcbiAgLy8gc2hvdWxkIHJlYWxseTogKGEpIFVuaWZ5IElkTWFwIGFuZCBPcmRlcmVkRGljdCBpbnRvIFVub3JkZXJlZC9PcmRlcmVkRGljdFxuICAvLyAoYikgUmV3cml0ZSBkaWZmLmpzIHRvIHVzZSB0aGVzZSBjbGFzc2VzIGluc3RlYWQgb2YgYXJyYXlzIGFuZCBvYmplY3RzLlxuICBfcHVibGlzaE5ld1Jlc3VsdHM6IGZ1bmN0aW9uIChuZXdSZXN1bHRzLCBuZXdCdWZmZXIpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgTWV0ZW9yLl9ub1lpZWxkc0FsbG93ZWQoZnVuY3Rpb24gKCkge1xuXG4gICAgICAvLyBJZiB0aGUgcXVlcnkgaXMgbGltaXRlZCBhbmQgdGhlcmUgaXMgYSBidWZmZXIsIHNodXQgZG93biBzbyBpdCBkb2Vzbid0XG4gICAgICAvLyBzdGF5IGluIGEgd2F5LlxuICAgICAgaWYgKHNlbGYuX2xpbWl0KSB7XG4gICAgICAgIHNlbGYuX3VucHVibGlzaGVkQnVmZmVyLmNsZWFyKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIEZpcnN0IHJlbW92ZSBhbnl0aGluZyB0aGF0J3MgZ29uZS4gQmUgY2FyZWZ1bCBub3QgdG8gbW9kaWZ5XG4gICAgICAvLyBzZWxmLl9wdWJsaXNoZWQgd2hpbGUgaXRlcmF0aW5nIG92ZXIgaXQuXG4gICAgICB2YXIgaWRzVG9SZW1vdmUgPSBbXTtcbiAgICAgIHNlbGYuX3B1Ymxpc2hlZC5mb3JFYWNoKGZ1bmN0aW9uIChkb2MsIGlkKSB7XG4gICAgICAgIGlmICghbmV3UmVzdWx0cy5oYXMoaWQpKVxuICAgICAgICAgIGlkc1RvUmVtb3ZlLnB1c2goaWQpO1xuICAgICAgfSk7XG4gICAgICBpZHNUb1JlbW92ZS5mb3JFYWNoKGZ1bmN0aW9uIChpZCkge1xuICAgICAgICBzZWxmLl9yZW1vdmVQdWJsaXNoZWQoaWQpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIE5vdyBkbyBhZGRzIGFuZCBjaGFuZ2VzLlxuICAgICAgLy8gSWYgc2VsZiBoYXMgYSBidWZmZXIgYW5kIGxpbWl0LCB0aGUgbmV3IGZldGNoZWQgcmVzdWx0IHdpbGwgYmVcbiAgICAgIC8vIGxpbWl0ZWQgY29ycmVjdGx5IGFzIHRoZSBxdWVyeSBoYXMgc29ydCBzcGVjaWZpZXIuXG4gICAgICBuZXdSZXN1bHRzLmZvckVhY2goZnVuY3Rpb24gKGRvYywgaWQpIHtcbiAgICAgICAgc2VsZi5faGFuZGxlRG9jKGlkLCBkb2MpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIFNhbml0eS1jaGVjayB0aGF0IGV2ZXJ5dGhpbmcgd2UgdHJpZWQgdG8gcHV0IGludG8gX3B1Ymxpc2hlZCBlbmRlZCB1cFxuICAgICAgLy8gdGhlcmUuXG4gICAgICAvLyBYWFggaWYgdGhpcyBpcyBzbG93LCByZW1vdmUgaXQgbGF0ZXJcbiAgICAgIGlmIChzZWxmLl9wdWJsaXNoZWQuc2l6ZSgpICE9PSBuZXdSZXN1bHRzLnNpemUoKSkge1xuICAgICAgICBNZXRlb3IuX2RlYnVnKCdUaGUgTW9uZ28gc2VydmVyIGFuZCB0aGUgTWV0ZW9yIHF1ZXJ5IGRpc2FncmVlIG9uIGhvdyAnICtcbiAgICAgICAgICAnbWFueSBkb2N1bWVudHMgbWF0Y2ggeW91ciBxdWVyeS4gQ3Vyc29yIGRlc2NyaXB0aW9uOiAnLFxuICAgICAgICAgIHNlbGYuX2N1cnNvckRlc2NyaXB0aW9uKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgc2VsZi5fcHVibGlzaGVkLmZvckVhY2goZnVuY3Rpb24gKGRvYywgaWQpIHtcbiAgICAgICAgaWYgKCFuZXdSZXN1bHRzLmhhcyhpZCkpXG4gICAgICAgICAgdGhyb3cgRXJyb3IoXCJfcHVibGlzaGVkIGhhcyBhIGRvYyB0aGF0IG5ld1Jlc3VsdHMgZG9lc24ndDsgXCIgKyBpZCk7XG4gICAgICB9KTtcblxuICAgICAgLy8gRmluYWxseSwgcmVwbGFjZSB0aGUgYnVmZmVyXG4gICAgICBuZXdCdWZmZXIuZm9yRWFjaChmdW5jdGlvbiAoZG9jLCBpZCkge1xuICAgICAgICBzZWxmLl9hZGRCdWZmZXJlZChpZCwgZG9jKTtcbiAgICAgIH0pO1xuXG4gICAgICBzZWxmLl9zYWZlQXBwZW5kVG9CdWZmZXIgPSBuZXdCdWZmZXIuc2l6ZSgpIDwgc2VsZi5fbGltaXQ7XG4gICAgfSk7XG4gIH0sXG5cbiAgLy8gVGhpcyBzdG9wIGZ1bmN0aW9uIGlzIGludm9rZWQgZnJvbSB0aGUgb25TdG9wIG9mIHRoZSBPYnNlcnZlTXVsdGlwbGV4ZXIsIHNvXG4gIC8vIGl0IHNob3VsZG4ndCBhY3R1YWxseSBiZSBwb3NzaWJsZSB0byBjYWxsIGl0IHVudGlsIHRoZSBtdWx0aXBsZXhlciBpc1xuICAvLyByZWFkeS5cbiAgLy9cbiAgLy8gSXQncyBpbXBvcnRhbnQgdG8gY2hlY2sgc2VsZi5fc3RvcHBlZCBhZnRlciBldmVyeSBjYWxsIGluIHRoaXMgZmlsZSB0aGF0XG4gIC8vIGNhbiB5aWVsZCFcbiAgX3N0b3A6IGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoc2VsZi5fc3RvcHBlZClcbiAgICAgIHJldHVybjtcbiAgICBzZWxmLl9zdG9wcGVkID0gdHJ1ZTtcblxuICAgIC8vIE5vdGU6IHdlICpkb24ndCogdXNlIG11bHRpcGxleGVyLm9uRmx1c2ggaGVyZSBiZWNhdXNlIHRoaXMgc3RvcFxuICAgIC8vIGNhbGxiYWNrIGlzIGFjdHVhbGx5IGludm9rZWQgYnkgdGhlIG11bHRpcGxleGVyIGl0c2VsZiB3aGVuIGl0IGhhc1xuICAgIC8vIGRldGVybWluZWQgdGhhdCB0aGVyZSBhcmUgbm8gaGFuZGxlcyBsZWZ0LiBTbyBub3RoaW5nIGlzIGFjdHVhbGx5IGdvaW5nXG4gICAgLy8gdG8gZ2V0IGZsdXNoZWQgKGFuZCBpdCdzIHByb2JhYmx5IG5vdCB2YWxpZCB0byBjYWxsIG1ldGhvZHMgb24gdGhlXG4gICAgLy8gZHlpbmcgbXVsdGlwbGV4ZXIpLlxuICAgIGZvciAoY29uc3QgdyBvZiBzZWxmLl93cml0ZXNUb0NvbW1pdFdoZW5XZVJlYWNoU3RlYWR5KSB7XG4gICAgICBhd2FpdCB3LmNvbW1pdHRlZCgpO1xuICAgIH1cbiAgICBzZWxmLl93cml0ZXNUb0NvbW1pdFdoZW5XZVJlYWNoU3RlYWR5ID0gbnVsbDtcblxuICAgIC8vIFByb2FjdGl2ZWx5IGRyb3AgcmVmZXJlbmNlcyB0byBwb3RlbnRpYWxseSBiaWcgdGhpbmdzLlxuICAgIHNlbGYuX3B1Ymxpc2hlZCA9IG51bGw7XG4gICAgc2VsZi5fdW5wdWJsaXNoZWRCdWZmZXIgPSBudWxsO1xuICAgIHNlbGYuX25lZWRUb0ZldGNoID0gbnVsbDtcbiAgICBzZWxmLl9jdXJyZW50bHlGZXRjaGluZyA9IG51bGw7XG4gICAgc2VsZi5fb3Bsb2dFbnRyeUhhbmRsZSA9IG51bGw7XG4gICAgc2VsZi5fbGlzdGVuZXJzSGFuZGxlID0gbnVsbDtcblxuICAgIFBhY2thZ2VbJ2ZhY3RzLWJhc2UnXSAmJiBQYWNrYWdlWydmYWN0cy1iYXNlJ10uRmFjdHMuaW5jcmVtZW50U2VydmVyRmFjdChcbiAgICAgICAgXCJtb25nby1saXZlZGF0YVwiLCBcIm9ic2VydmUtZHJpdmVycy1vcGxvZ1wiLCAtMSk7XG5cbiAgICBmb3IgYXdhaXQgKGNvbnN0IGhhbmRsZSBvZiBzZWxmLl9zdG9wSGFuZGxlcykge1xuICAgICAgYXdhaXQgaGFuZGxlLnN0b3AoKTtcbiAgICB9XG4gIH0sXG4gIHN0b3A6IGFzeW5jIGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIHJldHVybiBhd2FpdCBzZWxmLl9zdG9wKCk7XG4gIH0sXG5cbiAgX3JlZ2lzdGVyUGhhc2VDaGFuZ2U6IGZ1bmN0aW9uIChwaGFzZSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBNZXRlb3IuX25vWWllbGRzQWxsb3dlZChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgbm93ID0gbmV3IERhdGU7XG5cbiAgICAgIGlmIChzZWxmLl9waGFzZSkge1xuICAgICAgICB2YXIgdGltZURpZmYgPSBub3cgLSBzZWxmLl9waGFzZVN0YXJ0VGltZTtcbiAgICAgICAgUGFja2FnZVsnZmFjdHMtYmFzZSddICYmIFBhY2thZ2VbJ2ZhY3RzLWJhc2UnXS5GYWN0cy5pbmNyZW1lbnRTZXJ2ZXJGYWN0KFxuICAgICAgICAgIFwibW9uZ28tbGl2ZWRhdGFcIiwgXCJ0aW1lLXNwZW50LWluLVwiICsgc2VsZi5fcGhhc2UgKyBcIi1waGFzZVwiLCB0aW1lRGlmZik7XG4gICAgICB9XG5cbiAgICAgIHNlbGYuX3BoYXNlID0gcGhhc2U7XG4gICAgICBzZWxmLl9waGFzZVN0YXJ0VGltZSA9IG5vdztcbiAgICB9KTtcbiAgfVxufSk7XG5cbi8vIERvZXMgb3VyIG9wbG9nIHRhaWxpbmcgY29kZSBzdXBwb3J0IHRoaXMgY3Vyc29yPyBGb3Igbm93LCB3ZSBhcmUgYmVpbmcgdmVyeVxuLy8gY29uc2VydmF0aXZlIGFuZCBhbGxvd2luZyBvbmx5IHNpbXBsZSBxdWVyaWVzIHdpdGggc2ltcGxlIG9wdGlvbnMuXG4vLyAoVGhpcyBpcyBhIFwic3RhdGljIG1ldGhvZFwiLilcbk9wbG9nT2JzZXJ2ZURyaXZlci5jdXJzb3JTdXBwb3J0ZWQgPSBmdW5jdGlvbiAoY3Vyc29yRGVzY3JpcHRpb24sIG1hdGNoZXIpIHtcbiAgLy8gRmlyc3QsIGNoZWNrIHRoZSBvcHRpb25zLlxuICB2YXIgb3B0aW9ucyA9IGN1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnM7XG5cbiAgLy8gRGlkIHRoZSB1c2VyIHNheSBubyBleHBsaWNpdGx5P1xuICAvLyB1bmRlcnNjb3JlZCB2ZXJzaW9uIG9mIHRoZSBvcHRpb24gaXMgQ09NUEFUIHdpdGggMS4yXG4gIGlmIChvcHRpb25zLmRpc2FibGVPcGxvZyB8fCBvcHRpb25zLl9kaXNhYmxlT3Bsb2cpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIC8vIHNraXAgaXMgbm90IHN1cHBvcnRlZDogdG8gc3VwcG9ydCBpdCB3ZSB3b3VsZCBuZWVkIHRvIGtlZXAgdHJhY2sgb2YgYWxsXG4gIC8vIFwic2tpcHBlZFwiIGRvY3VtZW50cyBvciBhdCBsZWFzdCB0aGVpciBpZHMuXG4gIC8vIGxpbWl0IHcvbyBhIHNvcnQgc3BlY2lmaWVyIGlzIG5vdCBzdXBwb3J0ZWQ6IGN1cnJlbnQgaW1wbGVtZW50YXRpb24gbmVlZHMgYVxuICAvLyBkZXRlcm1pbmlzdGljIHdheSB0byBvcmRlciBkb2N1bWVudHMuXG4gIGlmIChvcHRpb25zLnNraXAgfHwgKG9wdGlvbnMubGltaXQgJiYgIW9wdGlvbnMuc29ydCkpIHJldHVybiBmYWxzZTtcblxuICAvLyBJZiBhIGZpZWxkcyBwcm9qZWN0aW9uIG9wdGlvbiBpcyBnaXZlbiBjaGVjayBpZiBpdCBpcyBzdXBwb3J0ZWQgYnlcbiAgLy8gbWluaW1vbmdvIChzb21lIG9wZXJhdG9ycyBhcmUgbm90IHN1cHBvcnRlZCkuXG4gIGNvbnN0IGZpZWxkcyA9IG9wdGlvbnMuZmllbGRzIHx8IG9wdGlvbnMucHJvamVjdGlvbjtcbiAgaWYgKGZpZWxkcykge1xuICAgIHRyeSB7XG4gICAgICBMb2NhbENvbGxlY3Rpb24uX2NoZWNrU3VwcG9ydGVkUHJvamVjdGlvbihmaWVsZHMpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlLm5hbWUgPT09IFwiTWluaW1vbmdvRXJyb3JcIikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFdlIGRvbid0IGFsbG93IHRoZSBmb2xsb3dpbmcgc2VsZWN0b3JzOlxuICAvLyAgIC0gJHdoZXJlIChub3QgY29uZmlkZW50IHRoYXQgd2UgcHJvdmlkZSB0aGUgc2FtZSBKUyBlbnZpcm9ubWVudFxuICAvLyAgICAgICAgICAgICBhcyBNb25nbywgYW5kIGNhbiB5aWVsZCEpXG4gIC8vICAgLSAkbmVhciAoaGFzIFwiaW50ZXJlc3RpbmdcIiBwcm9wZXJ0aWVzIGluIE1vbmdvREIsIGxpa2UgdGhlIHBvc3NpYmlsaXR5XG4gIC8vICAgICAgICAgICAgb2YgcmV0dXJuaW5nIGFuIElEIG11bHRpcGxlIHRpbWVzLCB0aG91Z2ggZXZlbiBwb2xsaW5nIG1heWJlXG4gIC8vICAgICAgICAgICAgaGF2ZSBhIGJ1ZyB0aGVyZSlcbiAgLy8gICAgICAgICAgIFhYWDogb25jZSB3ZSBzdXBwb3J0IGl0LCB3ZSB3b3VsZCBuZWVkIHRvIHRoaW5rIG1vcmUgb24gaG93IHdlXG4gIC8vICAgICAgICAgICBpbml0aWFsaXplIHRoZSBjb21wYXJhdG9ycyB3aGVuIHdlIGNyZWF0ZSB0aGUgZHJpdmVyLlxuICByZXR1cm4gIW1hdGNoZXIuaGFzV2hlcmUoKSAmJiAhbWF0Y2hlci5oYXNHZW9RdWVyeSgpO1xufTtcblxudmFyIG1vZGlmaWVyQ2FuQmVEaXJlY3RseUFwcGxpZWQgPSBmdW5jdGlvbiAobW9kaWZpZXIpIHtcbiAgcmV0dXJuIE9iamVjdC5lbnRyaWVzKG1vZGlmaWVyKS5ldmVyeShmdW5jdGlvbiAoW29wZXJhdGlvbiwgZmllbGRzXSkge1xuICAgIHJldHVybiBPYmplY3QuZW50cmllcyhmaWVsZHMpLmV2ZXJ5KGZ1bmN0aW9uIChbZmllbGQsIHZhbHVlXSkge1xuICAgICAgcmV0dXJuICEvRUpTT05cXCQvLnRlc3QoZmllbGQpO1xuICAgIH0pO1xuICB9KTtcbn07IiwiLyoqXG4gKiBDb252ZXJ0ZXIgbW9kdWxlIGZvciB0aGUgbmV3IE1vbmdvREIgT3Bsb2cgZm9ybWF0ICg+PTUuMCkgdG8gdGhlIG9uZSB0aGF0IE1ldGVvclxuICogaGFuZGxlcyB3ZWxsLCBpLmUuLCBgJHNldGAgYW5kIGAkdW5zZXRgLiBUaGUgbmV3IGZvcm1hdCBpcyBjb21wbGV0ZWx5IG5ldyxcbiAqIGFuZCBsb29rcyBhcyBmb2xsb3dzOlxuICpcbiAqIGBgYGpzXG4gKiB7ICR2OiAyLCBkaWZmOiBEaWZmIH1cbiAqIGBgYFxuICpcbiAqIHdoZXJlIGBEaWZmYCBpcyBhIHJlY3Vyc2l2ZSBzdHJ1Y3R1cmU6XG4gKiBgYGBqc1xuICoge1xuICogICAvLyBOZXN0ZWQgdXBkYXRlcyAoc29tZXRpbWVzIGFsc28gcmVwcmVzZW50ZWQgd2l0aCBhbiBzLWZpZWxkKS5cbiAqICAgLy8gRXhhbXBsZTogYHsgJHNldDogeyAnZm9vLmJhcic6IDEgfSB9YC5cbiAqICAgaTogeyA8a2V5PjogPHZhbHVlPiwgLi4uIH0sXG4gKlxuICogICAvLyBUb3AtbGV2ZWwgdXBkYXRlcy5cbiAqICAgLy8gRXhhbXBsZTogYHsgJHNldDogeyBmb286IHsgYmFyOiAxIH0gfSB9YC5cbiAqICAgdTogeyA8a2V5PjogPHZhbHVlPiwgLi4uIH0sXG4gKlxuICogICAvLyBVbnNldHMuXG4gKiAgIC8vIEV4YW1wbGU6IGB7ICR1bnNldDogeyBmb286ICcnIH0gfWAuXG4gKiAgIGQ6IHsgPGtleT46IGZhbHNlLCAuLi4gfSxcbiAqXG4gKiAgIC8vIEFycmF5IG9wZXJhdGlvbnMuXG4gKiAgIC8vIEV4YW1wbGU6IGB7ICRwdXNoOiB7IGZvbzogJ2JhcicgfSB9YC5cbiAqICAgczxrZXk+OiB7IGE6IHRydWUsIHU8aW5kZXg+OiA8dmFsdWU+LCAuLi4gfSxcbiAqICAgLi4uXG4gKlxuICogICAvLyBOZXN0ZWQgb3BlcmF0aW9ucyAoc29tZXRpbWVzIGFsc28gcmVwcmVzZW50ZWQgaW4gdGhlIGBpYCBmaWVsZCkuXG4gKiAgIC8vIEV4YW1wbGU6IGB7ICRzZXQ6IHsgJ2Zvby5iYXInOiAxIH0gfWAuXG4gKiAgIHM8a2V5PjogRGlmZixcbiAqICAgLi4uXG4gKiB9XG4gKiBgYGBcbiAqXG4gKiAoYWxsIGZpZWxkcyBhcmUgb3B0aW9uYWwpXG4gKi9cblxuaW1wb3J0IHsgRUpTT04gfSBmcm9tICdtZXRlb3IvZWpzb24nO1xuXG5pbnRlcmZhY2UgT3Bsb2dFbnRyeSB7XG4gICR2OiBudW1iZXI7XG4gIGRpZmY/OiBPcGxvZ0RpZmY7XG4gICRzZXQ/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+O1xuICAkdW5zZXQ/OiBSZWNvcmQ8c3RyaW5nLCB0cnVlPjtcbn1cblxuaW50ZXJmYWNlIE9wbG9nRGlmZiB7XG4gIGk/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+O1xuICB1PzogUmVjb3JkPHN0cmluZywgYW55PjtcbiAgZD86IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4+O1xuICBba2V5OiBgcyR7c3RyaW5nfWBdOiBBcnJheU9wZXJhdG9yIHwgUmVjb3JkPHN0cmluZywgYW55Pjtcbn1cblxuaW50ZXJmYWNlIEFycmF5T3BlcmF0b3Ige1xuICBhOiB0cnVlO1xuICBba2V5OiBgdSR7bnVtYmVyfWBdOiBhbnk7XG59XG5cbmNvbnN0IGFycmF5T3BlcmF0b3JLZXlSZWdleCA9IC9eKGF8W3N1XVxcZCspJC87XG5cbi8qKlxuICogQ2hlY2tzIGlmIGEgZmllbGQgaXMgYW4gYXJyYXkgb3BlcmF0b3Iga2V5IG9mIGZvcm0gJ2EnIG9yICdzMScgb3IgJ3UxJyBldGNcbiAqL1xuZnVuY3Rpb24gaXNBcnJheU9wZXJhdG9yS2V5KGZpZWxkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIGFycmF5T3BlcmF0b3JLZXlSZWdleC50ZXN0KGZpZWxkKTtcbn1cblxuLyoqXG4gKiBUeXBlIGd1YXJkIHRvIGNoZWNrIGlmIGFuIG9wZXJhdG9yIGlzIGEgdmFsaWQgYXJyYXkgb3BlcmF0b3IuXG4gKiBBcnJheSBvcGVyYXRvcnMgaGF2ZSAnYTogdHJ1ZScgYW5kIGtleXMgdGhhdCBtYXRjaCB0aGUgYXJyYXlPcGVyYXRvcktleVJlZ2V4XG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlPcGVyYXRvcihvcGVyYXRvcjogdW5rbm93bik6IG9wZXJhdG9yIGlzIEFycmF5T3BlcmF0b3Ige1xuICByZXR1cm4gKFxuICAgIG9wZXJhdG9yICE9PSBudWxsICYmXG4gICAgdHlwZW9mIG9wZXJhdG9yID09PSAnb2JqZWN0JyAmJlxuICAgICdhJyBpbiBvcGVyYXRvciAmJlxuICAgIChvcGVyYXRvciBhcyBBcnJheU9wZXJhdG9yKS5hID09PSB0cnVlICYmXG4gICAgT2JqZWN0LmtleXMob3BlcmF0b3IpLmV2ZXJ5KGlzQXJyYXlPcGVyYXRvcktleSlcbiAgKTtcbn1cblxuLyoqXG4gKiBKb2lucyB0d28gcGFydHMgb2YgYSBmaWVsZCBwYXRoIHdpdGggYSBkb3QuXG4gKiBSZXR1cm5zIHRoZSBrZXkgaXRzZWxmIGlmIHByZWZpeCBpcyBlbXB0eS5cbiAqL1xuZnVuY3Rpb24gam9pbihwcmVmaXg6IHN0cmluZywga2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gcHJlZml4ID8gYCR7cHJlZml4fS4ke2tleX1gIDoga2V5O1xufVxuXG4vKipcbiAqIFJlY3Vyc2l2ZWx5IGZsYXR0ZW5zIGFuIG9iamVjdCBpbnRvIGEgdGFyZ2V0IG9iamVjdCB3aXRoIGRvdCBub3RhdGlvbiBwYXRocy5cbiAqIEhhbmRsZXMgc3BlY2lhbCBjYXNlczpcbiAqIC0gQXJyYXlzIGFyZSBhc3NpZ25lZCBkaXJlY3RseVxuICogLSBDdXN0b20gRUpTT04gdHlwZXMgYXJlIHByZXNlcnZlZFxuICogLSBNb25nby5PYmplY3RJRHMgYXJlIHByZXNlcnZlZFxuICogLSBQbGFpbiBvYmplY3RzIGFyZSByZWN1cnNpdmVseSBmbGF0dGVuZWRcbiAqIC0gRW1wdHkgb2JqZWN0cyBhcmUgYXNzaWduZWQgZGlyZWN0bHlcbiAqL1xuZnVuY3Rpb24gZmxhdHRlbk9iamVjdEludG8oXG4gIHRhcmdldDogUmVjb3JkPHN0cmluZywgYW55PixcbiAgc291cmNlOiBhbnksXG4gIHByZWZpeDogc3RyaW5nXG4pOiB2b2lkIHtcbiAgaWYgKFxuICAgIEFycmF5LmlzQXJyYXkoc291cmNlKSB8fFxuICAgIHR5cGVvZiBzb3VyY2UgIT09ICdvYmplY3QnIHx8XG4gICAgc291cmNlID09PSBudWxsIHx8XG4gICAgc291cmNlIGluc3RhbmNlb2YgTW9uZ28uT2JqZWN0SUQgfHxcbiAgICBFSlNPTi5faXNDdXN0b21UeXBlKHNvdXJjZSlcbiAgKSB7XG4gICAgdGFyZ2V0W3ByZWZpeF0gPSBzb3VyY2U7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgZW50cmllcyA9IE9iamVjdC5lbnRyaWVzKHNvdXJjZSk7XG4gIGlmIChlbnRyaWVzLmxlbmd0aCkge1xuICAgIGVudHJpZXMuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgICBmbGF0dGVuT2JqZWN0SW50byh0YXJnZXQsIHZhbHVlLCBqb2luKHByZWZpeCwga2V5KSk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgdGFyZ2V0W3ByZWZpeF0gPSBzb3VyY2U7XG4gIH1cbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhbiBvcGxvZyBkaWZmIHRvIGEgc2VyaWVzIG9mICRzZXQgYW5kICR1bnNldCBvcGVyYXRpb25zLlxuICogSGFuZGxlcyBzZXZlcmFsIHR5cGVzIG9mIG9wZXJhdGlvbnM6XG4gKiAtIERpcmVjdCB1bnNldHMgdmlhICdkJyBmaWVsZFxuICogLSBOZXN0ZWQgc2V0cyB2aWEgJ2knIGZpZWxkXG4gKiAtIFRvcC1sZXZlbCBzZXRzIHZpYSAndScgZmllbGRcbiAqIC0gQXJyYXkgb3BlcmF0aW9ucyBhbmQgbmVzdGVkIG9iamVjdHMgdmlhICdzJyBwcmVmaXhlZCBmaWVsZHNcbiAqXG4gKiBQcmVzZXJ2ZXMgdGhlIHN0cnVjdHVyZSBvZiBFSlNPTiBjdXN0b20gdHlwZXMgYW5kIE9iamVjdElEcyB3aGlsZVxuICogZmxhdHRlbmluZyBwYXRocyBpbnRvIGRvdCBub3RhdGlvbiBmb3IgTW9uZ29EQiB1cGRhdGVzLlxuICovXG5mdW5jdGlvbiBjb252ZXJ0T3Bsb2dEaWZmKFxuICBvcGxvZ0VudHJ5OiBPcGxvZ0VudHJ5LFxuICBkaWZmOiBPcGxvZ0RpZmYsXG4gIHByZWZpeCA9ICcnXG4pOiB2b2lkIHtcbiAgT2JqZWN0LmVudHJpZXMoZGlmZikuZm9yRWFjaCgoW2RpZmZLZXksIHZhbHVlXSkgPT4ge1xuICAgIGlmIChkaWZmS2V5ID09PSAnZCcpIHtcbiAgICAgIC8vIEhhbmRsZSBgJHVuc2V0YHNcbiAgICAgIG9wbG9nRW50cnkuJHVuc2V0ID8/PSB7fTtcbiAgICAgIE9iamVjdC5rZXlzKHZhbHVlKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgIG9wbG9nRW50cnkuJHVuc2V0IVtqb2luKHByZWZpeCwga2V5KV0gPSB0cnVlO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChkaWZmS2V5ID09PSAnaScpIHtcbiAgICAgIC8vIEhhbmRsZSAocG90ZW50aWFsbHkpIG5lc3RlZCBgJHNldGBzXG4gICAgICBvcGxvZ0VudHJ5LiRzZXQgPz89IHt9O1xuICAgICAgZmxhdHRlbk9iamVjdEludG8ob3Bsb2dFbnRyeS4kc2V0LCB2YWx1ZSwgcHJlZml4KTtcbiAgICB9IGVsc2UgaWYgKGRpZmZLZXkgPT09ICd1Jykge1xuICAgICAgLy8gSGFuZGxlIGZsYXQgYCRzZXRgc1xuICAgICAgb3Bsb2dFbnRyeS4kc2V0ID8/PSB7fTtcbiAgICAgIE9iamVjdC5lbnRyaWVzKHZhbHVlKS5mb3JFYWNoKChba2V5LCBmaWVsZFZhbHVlXSkgPT4ge1xuICAgICAgICBvcGxvZ0VudHJ5LiRzZXQhW2pvaW4ocHJlZml4LCBrZXkpXSA9IGZpZWxkVmFsdWU7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKGRpZmZLZXkuc3RhcnRzV2l0aCgncycpKSB7XG4gICAgICAvLyBIYW5kbGUgcy1maWVsZHMgKGFycmF5IG9wZXJhdGlvbnMgYW5kIG5lc3RlZCBvYmplY3RzKVxuICAgICAgY29uc3Qga2V5ID0gZGlmZktleS5zbGljZSgxKTtcbiAgICAgIGlmIChpc0FycmF5T3BlcmF0b3IodmFsdWUpKSB7XG4gICAgICAgIC8vIEFycmF5IG9wZXJhdG9yXG4gICAgICAgIE9iamVjdC5lbnRyaWVzKHZhbHVlKS5mb3JFYWNoKChbcG9zaXRpb24sIGZpZWxkVmFsdWVdKSA9PiB7XG4gICAgICAgICAgaWYgKHBvc2l0aW9uID09PSAnYScpIHJldHVybjtcblxuICAgICAgICAgIGNvbnN0IHBvc2l0aW9uS2V5ID0gam9pbihwcmVmaXgsIGAke2tleX0uJHtwb3NpdGlvbi5zbGljZSgxKX1gKTtcbiAgICAgICAgICBpZiAocG9zaXRpb25bMF0gPT09ICdzJykge1xuICAgICAgICAgICAgY29udmVydE9wbG9nRGlmZihvcGxvZ0VudHJ5LCBmaWVsZFZhbHVlLCBwb3NpdGlvbktleSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChmaWVsZFZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICBvcGxvZ0VudHJ5LiR1bnNldCA/Pz0ge307XG4gICAgICAgICAgICBvcGxvZ0VudHJ5LiR1bnNldFtwb3NpdGlvbktleV0gPSB0cnVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvcGxvZ0VudHJ5LiRzZXQgPz89IHt9O1xuICAgICAgICAgICAgb3Bsb2dFbnRyeS4kc2V0W3Bvc2l0aW9uS2V5XSA9IGZpZWxkVmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSBpZiAoa2V5KSB7XG4gICAgICAgIC8vIE5lc3RlZCBvYmplY3RcbiAgICAgICAgY29udmVydE9wbG9nRGlmZihvcGxvZ0VudHJ5LCB2YWx1ZSwgam9pbihwcmVmaXgsIGtleSkpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogQ29udmVydHMgYSBNb25nb0RCIHYyIG9wbG9nIGVudHJ5IHRvIHYxIGZvcm1hdC5cbiAqIFJldHVybnMgdGhlIG9yaWdpbmFsIGVudHJ5IHVuY2hhbmdlZCBpZiBpdCdzIG5vdCBhIHYyIG9wbG9nIGVudHJ5XG4gKiBvciBkb2Vzbid0IGNvbnRhaW4gYSBkaWZmIGZpZWxkLlxuICpcbiAqIFRoZSBjb252ZXJ0ZWQgZW50cnkgd2lsbCBjb250YWluICRzZXQgYW5kICR1bnNldCBvcGVyYXRpb25zIHRoYXQgYXJlXG4gKiBlcXVpdmFsZW50IHRvIHRoZSB2MiBkaWZmIGZvcm1hdCwgd2l0aCBwYXRocyBmbGF0dGVuZWQgdG8gZG90IG5vdGF0aW9uXG4gKiBhbmQgc3BlY2lhbCBoYW5kbGluZyBmb3IgRUpTT04gY3VzdG9tIHR5cGVzIGFuZCBPYmplY3RJRHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvcGxvZ1YyVjFDb252ZXJ0ZXIob3Bsb2dFbnRyeTogT3Bsb2dFbnRyeSk6IE9wbG9nRW50cnkge1xuICBpZiAob3Bsb2dFbnRyeS4kdiAhPT0gMiB8fCAhb3Bsb2dFbnRyeS5kaWZmKSB7XG4gICAgcmV0dXJuIG9wbG9nRW50cnk7XG4gIH1cblxuICBjb25zdCBjb252ZXJ0ZWRPcGxvZ0VudHJ5OiBPcGxvZ0VudHJ5ID0geyAkdjogMiB9O1xuICBjb252ZXJ0T3Bsb2dEaWZmKGNvbnZlcnRlZE9wbG9nRW50cnksIG9wbG9nRW50cnkuZGlmZik7XG4gIHJldHVybiBjb252ZXJ0ZWRPcGxvZ0VudHJ5O1xufSIsImludGVyZmFjZSBDdXJzb3JPcHRpb25zIHtcbiAgbGltaXQ/OiBudW1iZXI7XG4gIHNraXA/OiBudW1iZXI7XG4gIHNvcnQ/OiBSZWNvcmQ8c3RyaW5nLCAxIHwgLTE+O1xuICBmaWVsZHM/OiBSZWNvcmQ8c3RyaW5nLCAxIHwgMD47XG4gIHByb2plY3Rpb24/OiBSZWNvcmQ8c3RyaW5nLCAxIHwgMD47XG4gIGRpc2FibGVPcGxvZz86IGJvb2xlYW47XG4gIF9kaXNhYmxlT3Bsb2c/OiBib29sZWFuO1xuICB0YWlsYWJsZT86IGJvb2xlYW47XG4gIHRyYW5zZm9ybT86IChkb2M6IGFueSkgPT4gYW55O1xufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgdGhlIGFyZ3VtZW50cyB1c2VkIHRvIGNvbnN0cnVjdCBhIGN1cnNvci5cbiAqIFVzZWQgYXMgYSBrZXkgZm9yIGN1cnNvciBkZS1kdXBsaWNhdGlvbi5cbiAqXG4gKiBBbGwgcHJvcGVydGllcyBtdXN0IGJlIGVpdGhlcjpcbiAqIC0gSlNPTi1zdHJpbmdpZmlhYmxlLCBvclxuICogLSBOb3QgYWZmZWN0IG9ic2VydmVDaGFuZ2VzIG91dHB1dCAoZS5nLiwgb3B0aW9ucy50cmFuc2Zvcm0gZnVuY3Rpb25zKVxuICovXG5leHBvcnQgY2xhc3MgQ3Vyc29yRGVzY3JpcHRpb24ge1xuICBjb2xsZWN0aW9uTmFtZTogc3RyaW5nO1xuICBzZWxlY3RvcjogUmVjb3JkPHN0cmluZywgYW55PjtcbiAgb3B0aW9uczogQ3Vyc29yT3B0aW9ucztcblxuICBjb25zdHJ1Y3Rvcihjb2xsZWN0aW9uTmFtZTogc3RyaW5nLCBzZWxlY3RvcjogYW55LCBvcHRpb25zPzogQ3Vyc29yT3B0aW9ucykge1xuICAgIHRoaXMuY29sbGVjdGlvbk5hbWUgPSBjb2xsZWN0aW9uTmFtZTtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgdGhpcy5zZWxlY3RvciA9IE1vbmdvLkNvbGxlY3Rpb24uX3Jld3JpdGVTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgfVxufSIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgQ0xJRU5UX09OTFlfTUVUSE9EUywgZ2V0QXN5bmNNZXRob2ROYW1lIH0gZnJvbSAnbWV0ZW9yL21pbmltb25nby9jb25zdGFudHMnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBBc3luY2hyb25vdXNDdXJzb3IgfSBmcm9tICcuL2FzeW5jaHJvbm91c19jdXJzb3InO1xuaW1wb3J0IHsgQ3Vyc29yIH0gZnJvbSAnLi9jdXJzb3InO1xuaW1wb3J0IHsgQ3Vyc29yRGVzY3JpcHRpb24gfSBmcm9tICcuL2N1cnNvcl9kZXNjcmlwdGlvbic7XG5pbXBvcnQgeyBEb2NGZXRjaGVyIH0gZnJvbSAnLi9kb2NfZmV0Y2hlcic7XG5pbXBvcnQgeyBNb25nb0RCLCByZXBsYWNlTWV0ZW9yQXRvbVdpdGhNb25nbywgcmVwbGFjZVR5cGVzLCB0cmFuc2Zvcm1SZXN1bHQgfSBmcm9tICcuL21vbmdvX2NvbW1vbic7XG5pbXBvcnQgeyBPYnNlcnZlSGFuZGxlIH0gZnJvbSAnLi9vYnNlcnZlX2hhbmRsZSc7XG5pbXBvcnQgeyBPYnNlcnZlTXVsdGlwbGV4ZXIgfSBmcm9tICcuL29ic2VydmVfbXVsdGlwbGV4JztcbmltcG9ydCB7IE9wbG9nT2JzZXJ2ZURyaXZlciB9IGZyb20gJy4vb3Bsb2dfb2JzZXJ2ZV9kcml2ZXInO1xuaW1wb3J0IHsgT1BMT0dfQ09MTEVDVElPTiwgT3Bsb2dIYW5kbGUgfSBmcm9tICcuL29wbG9nX3RhaWxpbmcnO1xuaW1wb3J0IHsgUG9sbGluZ09ic2VydmVEcml2ZXIgfSBmcm9tICcuL3BvbGxpbmdfb2JzZXJ2ZV9kcml2ZXInO1xuXG5jb25zdCBGSUxFX0FTU0VUX1NVRkZJWCA9ICdBc3NldCc7XG5jb25zdCBBU1NFVFNfRk9MREVSID0gJ2Fzc2V0cyc7XG5jb25zdCBBUFBfRk9MREVSID0gJ2FwcCc7XG5cbmNvbnN0IG9wbG9nQ29sbGVjdGlvbldhcm5pbmdzID0gW107XG5cbmV4cG9ydCBjb25zdCBNb25nb0Nvbm5lY3Rpb24gPSBmdW5jdGlvbiAodXJsLCBvcHRpb25zKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHNlbGYuX29ic2VydmVNdWx0aXBsZXhlcnMgPSB7fTtcbiAgc2VsZi5fb25GYWlsb3Zlckhvb2sgPSBuZXcgSG9vaztcblxuICBjb25zdCB1c2VyT3B0aW9ucyA9IHtcbiAgICAuLi4oTW9uZ28uX2Nvbm5lY3Rpb25PcHRpb25zIHx8IHt9KSxcbiAgICAuLi4oTWV0ZW9yLnNldHRpbmdzPy5wYWNrYWdlcz8ubW9uZ28/Lm9wdGlvbnMgfHwge30pXG4gIH07XG5cbiAgdmFyIG1vbmdvT3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe1xuICAgIGlnbm9yZVVuZGVmaW5lZDogdHJ1ZSxcbiAgfSwgdXNlck9wdGlvbnMpO1xuXG5cblxuICAvLyBJbnRlcm5hbGx5IHRoZSBvcGxvZyBjb25uZWN0aW9ucyBzcGVjaWZ5IHRoZWlyIG93biBtYXhQb29sU2l6ZVxuICAvLyB3aGljaCB3ZSBkb24ndCB3YW50IHRvIG92ZXJ3cml0ZSB3aXRoIGFueSB1c2VyIGRlZmluZWQgdmFsdWVcbiAgaWYgKCdtYXhQb29sU2l6ZScgaW4gb3B0aW9ucykge1xuICAgIC8vIElmIHdlIGp1c3Qgc2V0IHRoaXMgZm9yIFwic2VydmVyXCIsIHJlcGxTZXQgd2lsbCBvdmVycmlkZSBpdC4gSWYgd2UganVzdFxuICAgIC8vIHNldCBpdCBmb3IgcmVwbFNldCwgaXQgd2lsbCBiZSBpZ25vcmVkIGlmIHdlJ3JlIG5vdCB1c2luZyBhIHJlcGxTZXQuXG4gICAgbW9uZ29PcHRpb25zLm1heFBvb2xTaXplID0gb3B0aW9ucy5tYXhQb29sU2l6ZTtcbiAgfVxuICBpZiAoJ21pblBvb2xTaXplJyBpbiBvcHRpb25zKSB7XG4gICAgbW9uZ29PcHRpb25zLm1pblBvb2xTaXplID0gb3B0aW9ucy5taW5Qb29sU2l6ZTtcbiAgfVxuXG4gIC8vIFRyYW5zZm9ybSBvcHRpb25zIGxpa2UgXCJ0bHNDQUZpbGVBc3NldFwiOiBcImZpbGVuYW1lLnBlbVwiIGludG9cbiAgLy8gXCJ0bHNDQUZpbGVcIjogXCIvPGZ1bGxwYXRoPi9maWxlbmFtZS5wZW1cIlxuICBPYmplY3QuZW50cmllcyhtb25nb09wdGlvbnMgfHwge30pXG4gICAgLmZpbHRlcigoW2tleV0pID0+IGtleSAmJiBrZXkuZW5kc1dpdGgoRklMRV9BU1NFVF9TVUZGSVgpKVxuICAgIC5mb3JFYWNoKChba2V5LCB2YWx1ZV0pID0+IHtcbiAgICAgIGNvbnN0IG9wdGlvbk5hbWUgPSBrZXkucmVwbGFjZShGSUxFX0FTU0VUX1NVRkZJWCwgJycpO1xuICAgICAgbW9uZ29PcHRpb25zW29wdGlvbk5hbWVdID0gcGF0aC5qb2luKEFzc2V0cy5nZXRTZXJ2ZXJEaXIoKSxcbiAgICAgICAgQVNTRVRTX0ZPTERFUiwgQVBQX0ZPTERFUiwgdmFsdWUpO1xuICAgICAgZGVsZXRlIG1vbmdvT3B0aW9uc1trZXldO1xuICAgIH0pO1xuXG4gIHNlbGYuZGIgPSBudWxsO1xuICBzZWxmLl9vcGxvZ0hhbmRsZSA9IG51bGw7XG4gIHNlbGYuX2RvY0ZldGNoZXIgPSBudWxsO1xuXG4gIG1vbmdvT3B0aW9ucy5kcml2ZXJJbmZvID0ge1xuICAgIG5hbWU6ICdNZXRlb3InLFxuICAgIHZlcnNpb246IE1ldGVvci5yZWxlYXNlXG4gIH1cblxuICBzZWxmLmNsaWVudCA9IG5ldyBNb25nb0RCLk1vbmdvQ2xpZW50KHVybCwgbW9uZ29PcHRpb25zKTtcbiAgc2VsZi5kYiA9IHNlbGYuY2xpZW50LmRiKCk7XG5cbiAgc2VsZi5jbGllbnQub24oJ3NlcnZlckRlc2NyaXB0aW9uQ2hhbmdlZCcsIE1ldGVvci5iaW5kRW52aXJvbm1lbnQoZXZlbnQgPT4ge1xuICAgIC8vIFdoZW4gdGhlIGNvbm5lY3Rpb24gaXMgbm8gbG9uZ2VyIGFnYWluc3QgdGhlIHByaW1hcnkgbm9kZSwgZXhlY3V0ZSBhbGxcbiAgICAvLyBmYWlsb3ZlciBob29rcy4gVGhpcyBpcyBpbXBvcnRhbnQgZm9yIHRoZSBkcml2ZXIgYXMgaXQgaGFzIHRvIHJlLXBvb2wgdGhlXG4gICAgLy8gcXVlcnkgd2hlbiBpdCBoYXBwZW5zLlxuICAgIGlmIChcbiAgICAgIGV2ZW50LnByZXZpb3VzRGVzY3JpcHRpb24udHlwZSAhPT0gJ1JTUHJpbWFyeScgJiZcbiAgICAgIGV2ZW50Lm5ld0Rlc2NyaXB0aW9uLnR5cGUgPT09ICdSU1ByaW1hcnknXG4gICAgKSB7XG4gICAgICBzZWxmLl9vbkZhaWxvdmVySG9vay5lYWNoKGNhbGxiYWNrID0+IHtcbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9KTtcbiAgICB9XG4gIH0pKTtcblxuICBpZiAob3B0aW9ucy5vcGxvZ1VybCAmJiAhIFBhY2thZ2VbJ2Rpc2FibGUtb3Bsb2cnXSkge1xuICAgIHNlbGYuX29wbG9nSGFuZGxlID0gbmV3IE9wbG9nSGFuZGxlKG9wdGlvbnMub3Bsb2dVcmwsIHNlbGYuZGIuZGF0YWJhc2VOYW1lKTtcbiAgICBzZWxmLl9kb2NGZXRjaGVyID0gbmV3IERvY0ZldGNoZXIoc2VsZik7XG4gIH1cblxufTtcblxuTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZS5fY2xvc2UgPSBhc3luYyBmdW5jdGlvbigpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIGlmICghIHNlbGYuZGIpXG4gICAgdGhyb3cgRXJyb3IoXCJjbG9zZSBjYWxsZWQgYmVmb3JlIENvbm5lY3Rpb24gY3JlYXRlZD9cIik7XG5cbiAgLy8gWFhYIHByb2JhYmx5IHVudGVzdGVkXG4gIHZhciBvcGxvZ0hhbmRsZSA9IHNlbGYuX29wbG9nSGFuZGxlO1xuICBzZWxmLl9vcGxvZ0hhbmRsZSA9IG51bGw7XG4gIGlmIChvcGxvZ0hhbmRsZSlcbiAgICBhd2FpdCBvcGxvZ0hhbmRsZS5zdG9wKCk7XG5cbiAgLy8gVXNlIEZ1dHVyZS53cmFwIHNvIHRoYXQgZXJyb3JzIGdldCB0aHJvd24uIFRoaXMgaGFwcGVucyB0b1xuICAvLyB3b3JrIGV2ZW4gb3V0c2lkZSBhIGZpYmVyIHNpbmNlIHRoZSAnY2xvc2UnIG1ldGhvZCBpcyBub3RcbiAgLy8gYWN0dWFsbHkgYXN5bmNocm9ub3VzLlxuICBhd2FpdCBzZWxmLmNsaWVudC5jbG9zZSgpO1xufTtcblxuTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuX2Nsb3NlKCk7XG59O1xuXG5Nb25nb0Nvbm5lY3Rpb24ucHJvdG90eXBlLl9zZXRPcGxvZ0hhbmRsZSA9IGZ1bmN0aW9uKG9wbG9nSGFuZGxlKSB7XG4gIHRoaXMuX29wbG9nSGFuZGxlID0gb3Bsb2dIYW5kbGU7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gUmV0dXJucyB0aGUgTW9uZ28gQ29sbGVjdGlvbiBvYmplY3Q7IG1heSB5aWVsZC5cbk1vbmdvQ29ubmVjdGlvbi5wcm90b3R5cGUucmF3Q29sbGVjdGlvbiA9IGZ1bmN0aW9uIChjb2xsZWN0aW9uTmFtZSkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgaWYgKCEgc2VsZi5kYilcbiAgICB0aHJvdyBFcnJvcihcInJhd0NvbGxlY3Rpb24gY2FsbGVkIGJlZm9yZSBDb25uZWN0aW9uIGNyZWF0ZWQ/XCIpO1xuXG4gIHJldHVybiBzZWxmLmRiLmNvbGxlY3Rpb24oY29sbGVjdGlvbk5hbWUpO1xufTtcblxuTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZS5jcmVhdGVDYXBwZWRDb2xsZWN0aW9uQXN5bmMgPSBhc3luYyBmdW5jdGlvbiAoXG4gIGNvbGxlY3Rpb25OYW1lLCBieXRlU2l6ZSwgbWF4RG9jdW1lbnRzKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBpZiAoISBzZWxmLmRiKVxuICAgIHRocm93IEVycm9yKFwiY3JlYXRlQ2FwcGVkQ29sbGVjdGlvbkFzeW5jIGNhbGxlZCBiZWZvcmUgQ29ubmVjdGlvbiBjcmVhdGVkP1wiKTtcblxuXG4gIGF3YWl0IHNlbGYuZGIuY3JlYXRlQ29sbGVjdGlvbihjb2xsZWN0aW9uTmFtZSxcbiAgICB7IGNhcHBlZDogdHJ1ZSwgc2l6ZTogYnl0ZVNpemUsIG1heDogbWF4RG9jdW1lbnRzIH0pO1xufTtcblxuLy8gVGhpcyBzaG91bGQgYmUgY2FsbGVkIHN5bmNocm9ub3VzbHkgd2l0aCBhIHdyaXRlLCB0byBjcmVhdGUgYVxuLy8gdHJhbnNhY3Rpb24gb24gdGhlIGN1cnJlbnQgd3JpdGUgZmVuY2UsIGlmIGFueS4gQWZ0ZXIgd2UgY2FuIHJlYWRcbi8vIHRoZSB3cml0ZSwgYW5kIGFmdGVyIG9ic2VydmVycyBoYXZlIGJlZW4gbm90aWZpZWQgKG9yIGF0IGxlYXN0LFxuLy8gYWZ0ZXIgdGhlIG9ic2VydmVyIG5vdGlmaWVycyBoYXZlIGFkZGVkIHRoZW1zZWx2ZXMgdG8gdGhlIHdyaXRlXG4vLyBmZW5jZSksIHlvdSBzaG91bGQgY2FsbCAnY29tbWl0dGVkKCknIG9uIHRoZSBvYmplY3QgcmV0dXJuZWQuXG5Nb25nb0Nvbm5lY3Rpb24ucHJvdG90eXBlLl9tYXliZUJlZ2luV3JpdGUgPSBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IGZlbmNlID0gRERQU2VydmVyLl9nZXRDdXJyZW50RmVuY2UoKTtcbiAgaWYgKGZlbmNlKSB7XG4gICAgcmV0dXJuIGZlbmNlLmJlZ2luV3JpdGUoKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4ge2NvbW1pdHRlZDogZnVuY3Rpb24gKCkge319O1xuICB9XG59O1xuXG4vLyBJbnRlcm5hbCBpbnRlcmZhY2U6IGFkZHMgYSBjYWxsYmFjayB3aGljaCBpcyBjYWxsZWQgd2hlbiB0aGUgTW9uZ28gcHJpbWFyeVxuLy8gY2hhbmdlcy4gUmV0dXJucyBhIHN0b3AgaGFuZGxlLlxuTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZS5fb25GYWlsb3ZlciA9IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICByZXR1cm4gdGhpcy5fb25GYWlsb3Zlckhvb2sucmVnaXN0ZXIoY2FsbGJhY2spO1xufTtcblxuTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZS5pbnNlcnRBc3luYyA9IGFzeW5jIGZ1bmN0aW9uIChjb2xsZWN0aW9uX25hbWUsIGRvY3VtZW50KSB7XG4gIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gIGlmIChjb2xsZWN0aW9uX25hbWUgPT09IFwiX19fbWV0ZW9yX2ZhaWx1cmVfdGVzdF9jb2xsZWN0aW9uXCIpIHtcbiAgICBjb25zdCBlID0gbmV3IEVycm9yKFwiRmFpbHVyZSB0ZXN0XCIpO1xuICAgIGUuX2V4cGVjdGVkQnlUZXN0ID0gdHJ1ZTtcbiAgICB0aHJvdyBlO1xuICB9XG5cbiAgaWYgKCEoTG9jYWxDb2xsZWN0aW9uLl9pc1BsYWluT2JqZWN0KGRvY3VtZW50KSAmJlxuICAgICFFSlNPTi5faXNDdXN0b21UeXBlKGRvY3VtZW50KSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJPbmx5IHBsYWluIG9iamVjdHMgbWF5IGJlIGluc2VydGVkIGludG8gTW9uZ29EQlwiKTtcbiAgfVxuXG4gIHZhciB3cml0ZSA9IHNlbGYuX21heWJlQmVnaW5Xcml0ZSgpO1xuICB2YXIgcmVmcmVzaCA9IGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICBhd2FpdCBNZXRlb3IucmVmcmVzaCh7Y29sbGVjdGlvbjogY29sbGVjdGlvbl9uYW1lLCBpZDogZG9jdW1lbnQuX2lkIH0pO1xuICB9O1xuICByZXR1cm4gc2VsZi5yYXdDb2xsZWN0aW9uKGNvbGxlY3Rpb25fbmFtZSkuaW5zZXJ0T25lKFxuICAgIHJlcGxhY2VUeXBlcyhkb2N1bWVudCwgcmVwbGFjZU1ldGVvckF0b21XaXRoTW9uZ28pLFxuICAgIHtcbiAgICAgIHNhZmU6IHRydWUsXG4gICAgfVxuICApLnRoZW4oYXN5bmMgKHtpbnNlcnRlZElkfSkgPT4ge1xuICAgIGF3YWl0IHJlZnJlc2goKTtcbiAgICBhd2FpdCB3cml0ZS5jb21taXR0ZWQoKTtcbiAgICByZXR1cm4gaW5zZXJ0ZWRJZDtcbiAgfSkuY2F0Y2goYXN5bmMgZSA9PiB7XG4gICAgYXdhaXQgd3JpdGUuY29tbWl0dGVkKCk7XG4gICAgdGhyb3cgZTtcbiAgfSk7XG59O1xuXG5cbi8vIENhdXNlIHF1ZXJpZXMgdGhhdCBtYXkgYmUgYWZmZWN0ZWQgYnkgdGhlIHNlbGVjdG9yIHRvIHBvbGwgaW4gdGhpcyB3cml0ZVxuLy8gZmVuY2UuXG5Nb25nb0Nvbm5lY3Rpb24ucHJvdG90eXBlLl9yZWZyZXNoID0gYXN5bmMgZnVuY3Rpb24gKGNvbGxlY3Rpb25OYW1lLCBzZWxlY3Rvcikge1xuICB2YXIgcmVmcmVzaEtleSA9IHtjb2xsZWN0aW9uOiBjb2xsZWN0aW9uTmFtZX07XG4gIC8vIElmIHdlIGtub3cgd2hpY2ggZG9jdW1lbnRzIHdlJ3JlIHJlbW92aW5nLCBkb24ndCBwb2xsIHF1ZXJpZXMgdGhhdCBhcmVcbiAgLy8gc3BlY2lmaWMgdG8gb3RoZXIgZG9jdW1lbnRzLiAoTm90ZSB0aGF0IG11bHRpcGxlIG5vdGlmaWNhdGlvbnMgaGVyZSBzaG91bGRcbiAgLy8gbm90IGNhdXNlIG11bHRpcGxlIHBvbGxzLCBzaW5jZSBhbGwgb3VyIGxpc3RlbmVyIGlzIGRvaW5nIGlzIGVucXVldWVpbmcgYVxuICAvLyBwb2xsLilcbiAgdmFyIHNwZWNpZmljSWRzID0gTG9jYWxDb2xsZWN0aW9uLl9pZHNNYXRjaGVkQnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gIGlmIChzcGVjaWZpY0lkcykge1xuICAgIGZvciAoY29uc3QgaWQgb2Ygc3BlY2lmaWNJZHMpIHtcbiAgICAgIGF3YWl0IE1ldGVvci5yZWZyZXNoKE9iamVjdC5hc3NpZ24oe2lkOiBpZH0sIHJlZnJlc2hLZXkpKTtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIGF3YWl0IE1ldGVvci5yZWZyZXNoKHJlZnJlc2hLZXkpO1xuICB9XG59O1xuXG5Nb25nb0Nvbm5lY3Rpb24ucHJvdG90eXBlLnJlbW92ZUFzeW5jID0gYXN5bmMgZnVuY3Rpb24gKGNvbGxlY3Rpb25fbmFtZSwgc2VsZWN0b3IpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIGlmIChjb2xsZWN0aW9uX25hbWUgPT09IFwiX19fbWV0ZW9yX2ZhaWx1cmVfdGVzdF9jb2xsZWN0aW9uXCIpIHtcbiAgICB2YXIgZSA9IG5ldyBFcnJvcihcIkZhaWx1cmUgdGVzdFwiKTtcbiAgICBlLl9leHBlY3RlZEJ5VGVzdCA9IHRydWU7XG4gICAgdGhyb3cgZTtcbiAgfVxuXG4gIHZhciB3cml0ZSA9IHNlbGYuX21heWJlQmVnaW5Xcml0ZSgpO1xuICB2YXIgcmVmcmVzaCA9IGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICBhd2FpdCBzZWxmLl9yZWZyZXNoKGNvbGxlY3Rpb25fbmFtZSwgc2VsZWN0b3IpO1xuICB9O1xuXG4gIHJldHVybiBzZWxmLnJhd0NvbGxlY3Rpb24oY29sbGVjdGlvbl9uYW1lKVxuICAgIC5kZWxldGVNYW55KHJlcGxhY2VUeXBlcyhzZWxlY3RvciwgcmVwbGFjZU1ldGVvckF0b21XaXRoTW9uZ28pLCB7XG4gICAgICBzYWZlOiB0cnVlLFxuICAgIH0pXG4gICAgLnRoZW4oYXN5bmMgKHsgZGVsZXRlZENvdW50IH0pID0+IHtcbiAgICAgIGF3YWl0IHJlZnJlc2goKTtcbiAgICAgIGF3YWl0IHdyaXRlLmNvbW1pdHRlZCgpO1xuICAgICAgcmV0dXJuIHRyYW5zZm9ybVJlc3VsdCh7IHJlc3VsdCA6IHttb2RpZmllZENvdW50IDogZGVsZXRlZENvdW50fSB9KS5udW1iZXJBZmZlY3RlZDtcbiAgICB9KS5jYXRjaChhc3luYyAoZXJyKSA9PiB7XG4gICAgICBhd2FpdCB3cml0ZS5jb21taXR0ZWQoKTtcbiAgICAgIHRocm93IGVycjtcbiAgICB9KTtcbn07XG5cbk1vbmdvQ29ubmVjdGlvbi5wcm90b3R5cGUuZHJvcENvbGxlY3Rpb25Bc3luYyA9IGFzeW5jIGZ1bmN0aW9uKGNvbGxlY3Rpb25OYW1lKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuXG4gIHZhciB3cml0ZSA9IHNlbGYuX21heWJlQmVnaW5Xcml0ZSgpO1xuICB2YXIgcmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBNZXRlb3IucmVmcmVzaCh7XG4gICAgICBjb2xsZWN0aW9uOiBjb2xsZWN0aW9uTmFtZSxcbiAgICAgIGlkOiBudWxsLFxuICAgICAgZHJvcENvbGxlY3Rpb246IHRydWUsXG4gICAgfSk7XG4gIH07XG5cbiAgcmV0dXJuIHNlbGZcbiAgICAucmF3Q29sbGVjdGlvbihjb2xsZWN0aW9uTmFtZSlcbiAgICAuZHJvcCgpXG4gICAgLnRoZW4oYXN5bmMgcmVzdWx0ID0+IHtcbiAgICAgIGF3YWl0IHJlZnJlc2goKTtcbiAgICAgIGF3YWl0IHdyaXRlLmNvbW1pdHRlZCgpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9KVxuICAgIC5jYXRjaChhc3luYyBlID0+IHtcbiAgICAgIGF3YWl0IHdyaXRlLmNvbW1pdHRlZCgpO1xuICAgICAgdGhyb3cgZTtcbiAgICB9KTtcbn07XG5cbi8vIEZvciB0ZXN0aW5nIG9ubHkuICBTbGlnaHRseSBiZXR0ZXIgdGhhbiBgYy5yYXdEYXRhYmFzZSgpLmRyb3BEYXRhYmFzZSgpYFxuLy8gYmVjYXVzZSBpdCBsZXRzIHRoZSB0ZXN0J3MgZmVuY2Ugd2FpdCBmb3IgaXQgdG8gYmUgY29tcGxldGUuXG5Nb25nb0Nvbm5lY3Rpb24ucHJvdG90eXBlLmRyb3BEYXRhYmFzZUFzeW5jID0gYXN5bmMgZnVuY3Rpb24gKCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgdmFyIHdyaXRlID0gc2VsZi5fbWF5YmVCZWdpbldyaXRlKCk7XG4gIHZhciByZWZyZXNoID0gYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgIGF3YWl0IE1ldGVvci5yZWZyZXNoKHsgZHJvcERhdGFiYXNlOiB0cnVlIH0pO1xuICB9O1xuXG4gIHRyeSB7XG4gICAgYXdhaXQgc2VsZi5kYi5fZHJvcERhdGFiYXNlKCk7XG4gICAgYXdhaXQgcmVmcmVzaCgpO1xuICAgIGF3YWl0IHdyaXRlLmNvbW1pdHRlZCgpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgYXdhaXQgd3JpdGUuY29tbWl0dGVkKCk7XG4gICAgdGhyb3cgZTtcbiAgfVxufTtcblxuTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZS51cGRhdGVBc3luYyA9IGFzeW5jIGZ1bmN0aW9uIChjb2xsZWN0aW9uX25hbWUsIHNlbGVjdG9yLCBtb2QsIG9wdGlvbnMpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIGlmIChjb2xsZWN0aW9uX25hbWUgPT09IFwiX19fbWV0ZW9yX2ZhaWx1cmVfdGVzdF9jb2xsZWN0aW9uXCIpIHtcbiAgICB2YXIgZSA9IG5ldyBFcnJvcihcIkZhaWx1cmUgdGVzdFwiKTtcbiAgICBlLl9leHBlY3RlZEJ5VGVzdCA9IHRydWU7XG4gICAgdGhyb3cgZTtcbiAgfVxuXG4gIC8vIGV4cGxpY2l0IHNhZmV0eSBjaGVjay4gbnVsbCBhbmQgdW5kZWZpbmVkIGNhbiBjcmFzaCB0aGUgbW9uZ29cbiAgLy8gZHJpdmVyLiBBbHRob3VnaCB0aGUgbm9kZSBkcml2ZXIgYW5kIG1pbmltb25nbyBkbyAnc3VwcG9ydCdcbiAgLy8gbm9uLW9iamVjdCBtb2RpZmllciBpbiB0aGF0IHRoZXkgZG9uJ3QgY3Jhc2gsIHRoZXkgYXJlIG5vdFxuICAvLyBtZWFuaW5nZnVsIG9wZXJhdGlvbnMgYW5kIGRvIG5vdCBkbyBhbnl0aGluZy4gRGVmZW5zaXZlbHkgdGhyb3cgYW5cbiAgLy8gZXJyb3IgaGVyZS5cbiAgaWYgKCFtb2QgfHwgdHlwZW9mIG1vZCAhPT0gJ29iamVjdCcpIHtcbiAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcihcIkludmFsaWQgbW9kaWZpZXIuIE1vZGlmaWVyIG11c3QgYmUgYW4gb2JqZWN0LlwiKTtcblxuICAgIHRocm93IGVycm9yO1xuICB9XG5cbiAgaWYgKCEoTG9jYWxDb2xsZWN0aW9uLl9pc1BsYWluT2JqZWN0KG1vZCkgJiYgIUVKU09OLl9pc0N1c3RvbVR5cGUobW9kKSkpIHtcbiAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcihcbiAgICAgIFwiT25seSBwbGFpbiBvYmplY3RzIG1heSBiZSB1c2VkIGFzIHJlcGxhY2VtZW50XCIgK1xuICAgICAgXCIgZG9jdW1lbnRzIGluIE1vbmdvREJcIik7XG5cbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxuXG4gIGlmICghb3B0aW9ucykgb3B0aW9ucyA9IHt9O1xuXG4gIHZhciB3cml0ZSA9IHNlbGYuX21heWJlQmVnaW5Xcml0ZSgpO1xuICB2YXIgcmVmcmVzaCA9IGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICBhd2FpdCBzZWxmLl9yZWZyZXNoKGNvbGxlY3Rpb25fbmFtZSwgc2VsZWN0b3IpO1xuICB9O1xuXG4gIHZhciBjb2xsZWN0aW9uID0gc2VsZi5yYXdDb2xsZWN0aW9uKGNvbGxlY3Rpb25fbmFtZSk7XG4gIHZhciBtb25nb09wdHMgPSB7c2FmZTogdHJ1ZX07XG4gIC8vIEFkZCBzdXBwb3J0IGZvciBmaWx0ZXJlZCBwb3NpdGlvbmFsIG9wZXJhdG9yXG4gIGlmIChvcHRpb25zLmFycmF5RmlsdGVycyAhPT0gdW5kZWZpbmVkKSBtb25nb09wdHMuYXJyYXlGaWx0ZXJzID0gb3B0aW9ucy5hcnJheUZpbHRlcnM7XG4gIC8vIGV4cGxpY3RseSBlbnVtZXJhdGUgb3B0aW9ucyB0aGF0IG1pbmltb25nbyBzdXBwb3J0c1xuICBpZiAob3B0aW9ucy51cHNlcnQpIG1vbmdvT3B0cy51cHNlcnQgPSB0cnVlO1xuICBpZiAob3B0aW9ucy5tdWx0aSkgbW9uZ29PcHRzLm11bHRpID0gdHJ1ZTtcbiAgLy8gTGV0cyB5b3UgZ2V0IGEgbW9yZSBtb3JlIGZ1bGwgcmVzdWx0IGZyb20gTW9uZ29EQi4gVXNlIHdpdGggY2F1dGlvbjpcbiAgLy8gbWlnaHQgbm90IHdvcmsgd2l0aCBDLnVwc2VydCAoYXMgb3Bwb3NlZCB0byBDLnVwZGF0ZSh7dXBzZXJ0OnRydWV9KSBvclxuICAvLyB3aXRoIHNpbXVsYXRlZCB1cHNlcnQuXG4gIGlmIChvcHRpb25zLmZ1bGxSZXN1bHQpIG1vbmdvT3B0cy5mdWxsUmVzdWx0ID0gdHJ1ZTtcblxuICB2YXIgbW9uZ29TZWxlY3RvciA9IHJlcGxhY2VUeXBlcyhzZWxlY3RvciwgcmVwbGFjZU1ldGVvckF0b21XaXRoTW9uZ28pO1xuICB2YXIgbW9uZ29Nb2QgPSByZXBsYWNlVHlwZXMobW9kLCByZXBsYWNlTWV0ZW9yQXRvbVdpdGhNb25nbyk7XG5cbiAgdmFyIGlzTW9kaWZ5ID0gTG9jYWxDb2xsZWN0aW9uLl9pc01vZGlmaWNhdGlvbk1vZChtb25nb01vZCk7XG5cbiAgaWYgKG9wdGlvbnMuX2ZvcmJpZFJlcGxhY2UgJiYgIWlzTW9kaWZ5KSB7XG4gICAgdmFyIGVyciA9IG5ldyBFcnJvcihcIkludmFsaWQgbW9kaWZpZXIuIFJlcGxhY2VtZW50cyBhcmUgZm9yYmlkZGVuLlwiKTtcbiAgICB0aHJvdyBlcnI7XG4gIH1cblxuICAvLyBXZSd2ZSBhbHJlYWR5IHJ1biByZXBsYWNlVHlwZXMvcmVwbGFjZU1ldGVvckF0b21XaXRoTW9uZ28gb25cbiAgLy8gc2VsZWN0b3IgYW5kIG1vZC4gIFdlIGFzc3VtZSBpdCBkb2Vzbid0IG1hdHRlciwgYXMgZmFyIGFzXG4gIC8vIHRoZSBiZWhhdmlvciBvZiBtb2RpZmllcnMgaXMgY29uY2VybmVkLCB3aGV0aGVyIGBfbW9kaWZ5YFxuICAvLyBpcyBydW4gb24gRUpTT04gb3Igb24gbW9uZ28tY29udmVydGVkIEVKU09OLlxuXG4gIC8vIFJ1biB0aGlzIGNvZGUgdXAgZnJvbnQgc28gdGhhdCBpdCBmYWlscyBmYXN0IGlmIHNvbWVvbmUgdXNlc1xuICAvLyBhIE1vbmdvIHVwZGF0ZSBvcGVyYXRvciB3ZSBkb24ndCBzdXBwb3J0LlxuICBsZXQga25vd25JZDtcbiAgaWYgKG9wdGlvbnMudXBzZXJ0KSB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBuZXdEb2MgPSBMb2NhbENvbGxlY3Rpb24uX2NyZWF0ZVVwc2VydERvY3VtZW50KHNlbGVjdG9yLCBtb2QpO1xuICAgICAga25vd25JZCA9IG5ld0RvYy5faWQ7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICB9XG4gIGlmIChvcHRpb25zLnVwc2VydCAmJlxuICAgICEgaXNNb2RpZnkgJiZcbiAgICAhIGtub3duSWQgJiZcbiAgICBvcHRpb25zLmluc2VydGVkSWQgJiZcbiAgICAhIChvcHRpb25zLmluc2VydGVkSWQgaW5zdGFuY2VvZiBNb25nby5PYmplY3RJRCAmJlxuICAgICAgb3B0aW9ucy5nZW5lcmF0ZWRJZCkpIHtcbiAgICAvLyBJbiBjYXNlIG9mIGFuIHVwc2VydCB3aXRoIGEgcmVwbGFjZW1lbnQsIHdoZXJlIHRoZXJlIGlzIG5vIF9pZCBkZWZpbmVkXG4gICAgLy8gaW4gZWl0aGVyIHRoZSBxdWVyeSBvciB0aGUgcmVwbGFjZW1lbnQgZG9jLCBtb25nbyB3aWxsIGdlbmVyYXRlIGFuIGlkIGl0c2VsZi5cbiAgICAvLyBUaGVyZWZvcmUgd2UgbmVlZCB0aGlzIHNwZWNpYWwgc3RyYXRlZ3kgaWYgd2Ugd2FudCB0byBjb250cm9sIHRoZSBpZCBvdXJzZWx2ZXMuXG5cbiAgICAvLyBXZSBkb24ndCBuZWVkIHRvIGRvIHRoaXMgd2hlbjpcbiAgICAvLyAtIFRoaXMgaXMgbm90IGEgcmVwbGFjZW1lbnQsIHNvIHdlIGNhbiBhZGQgYW4gX2lkIHRvICRzZXRPbkluc2VydFxuICAgIC8vIC0gVGhlIGlkIGlzIGRlZmluZWQgYnkgcXVlcnkgb3IgbW9kIHdlIGNhbiBqdXN0IGFkZCBpdCB0byB0aGUgcmVwbGFjZW1lbnQgZG9jXG4gICAgLy8gLSBUaGUgdXNlciBkaWQgbm90IHNwZWNpZnkgYW55IGlkIHByZWZlcmVuY2UgYW5kIHRoZSBpZCBpcyBhIE1vbmdvIE9iamVjdElkLFxuICAgIC8vICAgICB0aGVuIHdlIGNhbiBqdXN0IGxldCBNb25nbyBnZW5lcmF0ZSB0aGUgaWRcbiAgICByZXR1cm4gYXdhaXQgc2ltdWxhdGVVcHNlcnRXaXRoSW5zZXJ0ZWRJZChjb2xsZWN0aW9uLCBtb25nb1NlbGVjdG9yLCBtb25nb01vZCwgb3B0aW9ucylcbiAgICAgIC50aGVuKGFzeW5jIHJlc3VsdCA9PiB7XG4gICAgICAgIGF3YWl0IHJlZnJlc2goKTtcbiAgICAgICAgYXdhaXQgd3JpdGUuY29tbWl0dGVkKCk7XG4gICAgICAgIGlmIChyZXN1bHQgJiYgISBvcHRpb25zLl9yZXR1cm5PYmplY3QpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0Lm51bWJlckFmZmVjdGVkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIGlmIChvcHRpb25zLnVwc2VydCAmJiAha25vd25JZCAmJiBvcHRpb25zLmluc2VydGVkSWQgJiYgaXNNb2RpZnkpIHtcbiAgICAgIGlmICghbW9uZ29Nb2QuaGFzT3duUHJvcGVydHkoJyRzZXRPbkluc2VydCcpKSB7XG4gICAgICAgIG1vbmdvTW9kLiRzZXRPbkluc2VydCA9IHt9O1xuICAgICAgfVxuICAgICAga25vd25JZCA9IG9wdGlvbnMuaW5zZXJ0ZWRJZDtcbiAgICAgIE9iamVjdC5hc3NpZ24obW9uZ29Nb2QuJHNldE9uSW5zZXJ0LCByZXBsYWNlVHlwZXMoe19pZDogb3B0aW9ucy5pbnNlcnRlZElkfSwgcmVwbGFjZU1ldGVvckF0b21XaXRoTW9uZ28pKTtcbiAgICB9XG5cbiAgICBjb25zdCBzdHJpbmdzID0gT2JqZWN0LmtleXMobW9uZ29Nb2QpLmZpbHRlcigoa2V5KSA9PiAha2V5LnN0YXJ0c1dpdGgoXCIkXCIpKTtcbiAgICBsZXQgdXBkYXRlTWV0aG9kID0gc3RyaW5ncy5sZW5ndGggPiAwID8gJ3JlcGxhY2VPbmUnIDogJ3VwZGF0ZU1hbnknO1xuICAgIHVwZGF0ZU1ldGhvZCA9XG4gICAgICB1cGRhdGVNZXRob2QgPT09ICd1cGRhdGVNYW55JyAmJiAhbW9uZ29PcHRzLm11bHRpXG4gICAgICAgID8gJ3VwZGF0ZU9uZSdcbiAgICAgICAgOiB1cGRhdGVNZXRob2Q7XG4gICAgcmV0dXJuIGNvbGxlY3Rpb25bdXBkYXRlTWV0aG9kXVxuICAgICAgLmJpbmQoY29sbGVjdGlvbikobW9uZ29TZWxlY3RvciwgbW9uZ29Nb2QsIG1vbmdvT3B0cylcbiAgICAgIC50aGVuKGFzeW5jIHJlc3VsdCA9PiB7XG4gICAgICAgIHZhciBtZXRlb3JSZXN1bHQgPSB0cmFuc2Zvcm1SZXN1bHQoe3Jlc3VsdH0pO1xuICAgICAgICBpZiAobWV0ZW9yUmVzdWx0ICYmIG9wdGlvbnMuX3JldHVybk9iamVjdCkge1xuICAgICAgICAgIC8vIElmIHRoaXMgd2FzIGFuIHVwc2VydEFzeW5jKCkgY2FsbCwgYW5kIHdlIGVuZGVkIHVwXG4gICAgICAgICAgLy8gaW5zZXJ0aW5nIGEgbmV3IGRvYyBhbmQgd2Uga25vdyBpdHMgaWQsIHRoZW5cbiAgICAgICAgICAvLyByZXR1cm4gdGhhdCBpZCBhcyB3ZWxsLlxuICAgICAgICAgIGlmIChvcHRpb25zLnVwc2VydCAmJiBtZXRlb3JSZXN1bHQuaW5zZXJ0ZWRJZCkge1xuICAgICAgICAgICAgaWYgKGtub3duSWQpIHtcbiAgICAgICAgICAgICAgbWV0ZW9yUmVzdWx0Lmluc2VydGVkSWQgPSBrbm93bklkO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChtZXRlb3JSZXN1bHQuaW5zZXJ0ZWRJZCBpbnN0YW5jZW9mIE1vbmdvREIuT2JqZWN0SWQpIHtcbiAgICAgICAgICAgICAgbWV0ZW9yUmVzdWx0Lmluc2VydGVkSWQgPSBuZXcgTW9uZ28uT2JqZWN0SUQobWV0ZW9yUmVzdWx0Lmluc2VydGVkSWQudG9IZXhTdHJpbmcoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGF3YWl0IHJlZnJlc2goKTtcbiAgICAgICAgICBhd2FpdCB3cml0ZS5jb21taXR0ZWQoKTtcbiAgICAgICAgICByZXR1cm4gbWV0ZW9yUmVzdWx0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGF3YWl0IHJlZnJlc2goKTtcbiAgICAgICAgICBhd2FpdCB3cml0ZS5jb21taXR0ZWQoKTtcbiAgICAgICAgICByZXR1cm4gbWV0ZW9yUmVzdWx0Lm51bWJlckFmZmVjdGVkO1xuICAgICAgICB9XG4gICAgICB9KS5jYXRjaChhc3luYyAoZXJyKSA9PiB7XG4gICAgICAgIGF3YWl0IHdyaXRlLmNvbW1pdHRlZCgpO1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9KTtcbiAgfVxufTtcblxuLy8gZXhwb3NlZCBmb3IgdGVzdGluZ1xuTW9uZ29Db25uZWN0aW9uLl9pc0Nhbm5vdENoYW5nZUlkRXJyb3IgPSBmdW5jdGlvbiAoZXJyKSB7XG5cbiAgLy8gTW9uZ28gMy4yLiogcmV0dXJucyBlcnJvciBhcyBuZXh0IE9iamVjdDpcbiAgLy8ge25hbWU6IFN0cmluZywgY29kZTogTnVtYmVyLCBlcnJtc2c6IFN0cmluZ31cbiAgLy8gT2xkZXIgTW9uZ28gcmV0dXJuczpcbiAgLy8ge25hbWU6IFN0cmluZywgY29kZTogTnVtYmVyLCBlcnI6IFN0cmluZ31cbiAgdmFyIGVycm9yID0gZXJyLmVycm1zZyB8fCBlcnIuZXJyO1xuXG4gIC8vIFdlIGRvbid0IHVzZSB0aGUgZXJyb3IgY29kZSBoZXJlXG4gIC8vIGJlY2F1c2UgdGhlIGVycm9yIGNvZGUgd2Ugb2JzZXJ2ZWQgaXQgcHJvZHVjaW5nICgxNjgzNykgYXBwZWFycyB0byBiZVxuICAvLyBhIGZhciBtb3JlIGdlbmVyaWMgZXJyb3IgY29kZSBiYXNlZCBvbiBleGFtaW5pbmcgdGhlIHNvdXJjZS5cbiAgaWYgKGVycm9yLmluZGV4T2YoJ1RoZSBfaWQgZmllbGQgY2Fubm90IGJlIGNoYW5nZWQnKSA9PT0gMFxuICAgIHx8IGVycm9yLmluZGV4T2YoXCJ0aGUgKGltbXV0YWJsZSkgZmllbGQgJ19pZCcgd2FzIGZvdW5kIHRvIGhhdmUgYmVlbiBhbHRlcmVkIHRvIF9pZFwiKSAhPT0gLTEpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBmYWxzZTtcbn07XG5cbi8vIFhYWCBNb25nb0Nvbm5lY3Rpb24udXBzZXJ0QXN5bmMoKSBkb2VzIG5vdCByZXR1cm4gdGhlIGlkIG9mIHRoZSBpbnNlcnRlZCBkb2N1bWVudFxuLy8gdW5sZXNzIHlvdSBzZXQgaXQgZXhwbGljaXRseSBpbiB0aGUgc2VsZWN0b3Igb3IgbW9kaWZpZXIgKGFzIGEgcmVwbGFjZW1lbnRcbi8vIGRvYykuXG5Nb25nb0Nvbm5lY3Rpb24ucHJvdG90eXBlLnVwc2VydEFzeW5jID0gYXN5bmMgZnVuY3Rpb24gKGNvbGxlY3Rpb25OYW1lLCBzZWxlY3RvciwgbW9kLCBvcHRpb25zKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuXG5cbiAgaWYgKHR5cGVvZiBvcHRpb25zID09PSBcImZ1bmN0aW9uXCIgJiYgISBjYWxsYmFjaykge1xuICAgIGNhbGxiYWNrID0gb3B0aW9ucztcbiAgICBvcHRpb25zID0ge307XG4gIH1cblxuICByZXR1cm4gc2VsZi51cGRhdGVBc3luYyhjb2xsZWN0aW9uTmFtZSwgc2VsZWN0b3IsIG1vZCxcbiAgICBPYmplY3QuYXNzaWduKHt9LCBvcHRpb25zLCB7XG4gICAgICB1cHNlcnQ6IHRydWUsXG4gICAgICBfcmV0dXJuT2JqZWN0OiB0cnVlXG4gICAgfSkpO1xufTtcblxuTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZS5maW5kID0gZnVuY3Rpb24gKGNvbGxlY3Rpb25OYW1lLCBzZWxlY3Rvciwgb3B0aW9ucykge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpXG4gICAgc2VsZWN0b3IgPSB7fTtcblxuICByZXR1cm4gbmV3IEN1cnNvcihcbiAgICBzZWxmLCBuZXcgQ3Vyc29yRGVzY3JpcHRpb24oY29sbGVjdGlvbk5hbWUsIHNlbGVjdG9yLCBvcHRpb25zKSk7XG59O1xuXG5Nb25nb0Nvbm5lY3Rpb24ucHJvdG90eXBlLmZpbmRPbmVBc3luYyA9IGFzeW5jIGZ1bmN0aW9uIChjb2xsZWN0aW9uX25hbWUsIHNlbGVjdG9yLCBvcHRpb25zKSB7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICBzZWxlY3RvciA9IHt9O1xuICB9XG5cbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIG9wdGlvbnMubGltaXQgPSAxO1xuXG4gIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBzZWxmLmZpbmQoY29sbGVjdGlvbl9uYW1lLCBzZWxlY3Rvciwgb3B0aW9ucykuZmV0Y2goKTtcblxuICByZXR1cm4gcmVzdWx0c1swXTtcbn07XG5cbi8vIFdlJ2xsIGFjdHVhbGx5IGRlc2lnbiBhbiBpbmRleCBBUEkgbGF0ZXIuIEZvciBub3csIHdlIGp1c3QgcGFzcyB0aHJvdWdoIHRvXG4vLyBNb25nbydzLCBidXQgbWFrZSBpdCBzeW5jaHJvbm91cy5cbk1vbmdvQ29ubmVjdGlvbi5wcm90b3R5cGUuY3JlYXRlSW5kZXhBc3luYyA9IGFzeW5jIGZ1bmN0aW9uIChjb2xsZWN0aW9uTmFtZSwgaW5kZXgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucykge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgLy8gV2UgZXhwZWN0IHRoaXMgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIGF0IHN0YXJ0dXAsIG5vdCBmcm9tIHdpdGhpbiBhIG1ldGhvZCxcbiAgLy8gc28gd2UgZG9uJ3QgaW50ZXJhY3Qgd2l0aCB0aGUgd3JpdGUgZmVuY2UuXG4gIHZhciBjb2xsZWN0aW9uID0gc2VsZi5yYXdDb2xsZWN0aW9uKGNvbGxlY3Rpb25OYW1lKTtcbiAgYXdhaXQgY29sbGVjdGlvbi5jcmVhdGVJbmRleChpbmRleCwgb3B0aW9ucyk7XG59O1xuXG4vLyBqdXN0IHRvIGJlIGNvbnNpc3RlbnQgd2l0aCB0aGUgb3RoZXIgbWV0aG9kc1xuTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZS5jcmVhdGVJbmRleCA9XG4gIE1vbmdvQ29ubmVjdGlvbi5wcm90b3R5cGUuY3JlYXRlSW5kZXhBc3luYztcblxuTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZS5jb3VudERvY3VtZW50cyA9IGZ1bmN0aW9uIChjb2xsZWN0aW9uTmFtZSwgLi4uYXJncykge1xuICBhcmdzID0gYXJncy5tYXAoYXJnID0+IHJlcGxhY2VUeXBlcyhhcmcsIHJlcGxhY2VNZXRlb3JBdG9tV2l0aE1vbmdvKSk7XG4gIGNvbnN0IGNvbGxlY3Rpb24gPSB0aGlzLnJhd0NvbGxlY3Rpb24oY29sbGVjdGlvbk5hbWUpO1xuICByZXR1cm4gY29sbGVjdGlvbi5jb3VudERvY3VtZW50cyguLi5hcmdzKTtcbn07XG5cbk1vbmdvQ29ubmVjdGlvbi5wcm90b3R5cGUuZXN0aW1hdGVkRG9jdW1lbnRDb3VudCA9IGZ1bmN0aW9uIChjb2xsZWN0aW9uTmFtZSwgLi4uYXJncykge1xuICBhcmdzID0gYXJncy5tYXAoYXJnID0+IHJlcGxhY2VUeXBlcyhhcmcsIHJlcGxhY2VNZXRlb3JBdG9tV2l0aE1vbmdvKSk7XG4gIGNvbnN0IGNvbGxlY3Rpb24gPSB0aGlzLnJhd0NvbGxlY3Rpb24oY29sbGVjdGlvbk5hbWUpO1xuICByZXR1cm4gY29sbGVjdGlvbi5lc3RpbWF0ZWREb2N1bWVudENvdW50KC4uLmFyZ3MpO1xufTtcblxuTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZS5lbnN1cmVJbmRleEFzeW5jID0gTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZS5jcmVhdGVJbmRleEFzeW5jO1xuXG5Nb25nb0Nvbm5lY3Rpb24ucHJvdG90eXBlLmRyb3BJbmRleEFzeW5jID0gYXN5bmMgZnVuY3Rpb24gKGNvbGxlY3Rpb25OYW1lLCBpbmRleCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cblxuICAvLyBUaGlzIGZ1bmN0aW9uIGlzIG9ubHkgdXNlZCBieSB0ZXN0IGNvZGUsIG5vdCB3aXRoaW4gYSBtZXRob2QsIHNvIHdlIGRvbid0XG4gIC8vIGludGVyYWN0IHdpdGggdGhlIHdyaXRlIGZlbmNlLlxuICB2YXIgY29sbGVjdGlvbiA9IHNlbGYucmF3Q29sbGVjdGlvbihjb2xsZWN0aW9uTmFtZSk7XG4gIHZhciBpbmRleE5hbWUgPSAgYXdhaXQgY29sbGVjdGlvbi5kcm9wSW5kZXgoaW5kZXgpO1xufTtcblxuXG5DTElFTlRfT05MWV9NRVRIT0RTLmZvckVhY2goZnVuY3Rpb24gKG0pIHtcbiAgTW9uZ29Db25uZWN0aW9uLnByb3RvdHlwZVttXSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgJHttfSArICBpcyBub3QgYXZhaWxhYmxlIG9uIHRoZSBzZXJ2ZXIuIFBsZWFzZSB1c2UgJHtnZXRBc3luY01ldGhvZE5hbWUoXG4gICAgICAgIG1cbiAgICAgICl9KCkgaW5zdGVhZC5gXG4gICAgKTtcbiAgfTtcbn0pO1xuXG5cbnZhciBOVU1fT1BUSU1JU1RJQ19UUklFUyA9IDM7XG5cblxuXG52YXIgc2ltdWxhdGVVcHNlcnRXaXRoSW5zZXJ0ZWRJZCA9IGFzeW5jIGZ1bmN0aW9uIChjb2xsZWN0aW9uLCBzZWxlY3RvciwgbW9kLCBvcHRpb25zKSB7XG4gIC8vIFNUUkFURUdZOiBGaXJzdCB0cnkgZG9pbmcgYW4gdXBzZXJ0IHdpdGggYSBnZW5lcmF0ZWQgSUQuXG4gIC8vIElmIHRoaXMgdGhyb3dzIGFuIGVycm9yIGFib3V0IGNoYW5naW5nIHRoZSBJRCBvbiBhbiBleGlzdGluZyBkb2N1bWVudFxuICAvLyB0aGVuIHdpdGhvdXQgYWZmZWN0aW5nIHRoZSBkYXRhYmFzZSwgd2Uga25vdyB3ZSBzaG91bGQgcHJvYmFibHkgdHJ5XG4gIC8vIGFuIHVwZGF0ZSB3aXRob3V0IHRoZSBnZW5lcmF0ZWQgSUQuIElmIGl0IGFmZmVjdGVkIDAgZG9jdW1lbnRzLFxuICAvLyB0aGVuIHdpdGhvdXQgYWZmZWN0aW5nIHRoZSBkYXRhYmFzZSwgd2UgdGhlIGRvY3VtZW50IHRoYXQgZmlyc3RcbiAgLy8gZ2F2ZSB0aGUgZXJyb3IgaXMgcHJvYmFibHkgcmVtb3ZlZCBhbmQgd2UgbmVlZCB0byB0cnkgYW4gaW5zZXJ0IGFnYWluXG4gIC8vIFdlIGdvIGJhY2sgdG8gc3RlcCBvbmUgYW5kIHJlcGVhdC5cbiAgLy8gTGlrZSBhbGwgXCJvcHRpbWlzdGljIHdyaXRlXCIgc2NoZW1lcywgd2UgcmVseSBvbiB0aGUgZmFjdCB0aGF0IGl0J3NcbiAgLy8gdW5saWtlbHkgb3VyIHdyaXRlcyB3aWxsIGNvbnRpbnVlIHRvIGJlIGludGVyZmVyZWQgd2l0aCB1bmRlciBub3JtYWxcbiAgLy8gY2lyY3Vtc3RhbmNlcyAodGhvdWdoIHN1ZmZpY2llbnRseSBoZWF2eSBjb250ZW50aW9uIHdpdGggd3JpdGVyc1xuICAvLyBkaXNhZ3JlZWluZyBvbiB0aGUgZXhpc3RlbmNlIG9mIGFuIG9iamVjdCB3aWxsIGNhdXNlIHdyaXRlcyB0byBmYWlsXG4gIC8vIGluIHRoZW9yeSkuXG5cbiAgdmFyIGluc2VydGVkSWQgPSBvcHRpb25zLmluc2VydGVkSWQ7IC8vIG11c3QgZXhpc3RcbiAgdmFyIG1vbmdvT3B0c0ZvclVwZGF0ZSA9IHtcbiAgICBzYWZlOiB0cnVlLFxuICAgIG11bHRpOiBvcHRpb25zLm11bHRpXG4gIH07XG4gIHZhciBtb25nb09wdHNGb3JJbnNlcnQgPSB7XG4gICAgc2FmZTogdHJ1ZSxcbiAgICB1cHNlcnQ6IHRydWVcbiAgfTtcblxuICB2YXIgcmVwbGFjZW1lbnRXaXRoSWQgPSBPYmplY3QuYXNzaWduKFxuICAgIHJlcGxhY2VUeXBlcyh7X2lkOiBpbnNlcnRlZElkfSwgcmVwbGFjZU1ldGVvckF0b21XaXRoTW9uZ28pLFxuICAgIG1vZCk7XG5cbiAgdmFyIHRyaWVzID0gTlVNX09QVElNSVNUSUNfVFJJRVM7XG5cbiAgdmFyIGRvVXBkYXRlID0gYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgIHRyaWVzLS07XG4gICAgaWYgKCEgdHJpZXMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlVwc2VydCBmYWlsZWQgYWZ0ZXIgXCIgKyBOVU1fT1BUSU1JU1RJQ19UUklFUyArIFwiIHRyaWVzLlwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IG1ldGhvZCA9IGNvbGxlY3Rpb24udXBkYXRlTWFueTtcbiAgICAgIGlmKCFPYmplY3Qua2V5cyhtb2QpLnNvbWUoa2V5ID0+IGtleS5zdGFydHNXaXRoKFwiJFwiKSkpe1xuICAgICAgICBtZXRob2QgPSBjb2xsZWN0aW9uLnJlcGxhY2VPbmUuYmluZChjb2xsZWN0aW9uKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBtZXRob2QoXG4gICAgICAgIHNlbGVjdG9yLFxuICAgICAgICBtb2QsXG4gICAgICAgIG1vbmdvT3B0c0ZvclVwZGF0ZSkudGhlbihyZXN1bHQgPT4ge1xuICAgICAgICBpZiAocmVzdWx0ICYmIChyZXN1bHQubW9kaWZpZWRDb3VudCB8fCByZXN1bHQudXBzZXJ0ZWRDb3VudCkpIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbnVtYmVyQWZmZWN0ZWQ6IHJlc3VsdC5tb2RpZmllZENvdW50IHx8IHJlc3VsdC51cHNlcnRlZENvdW50LFxuICAgICAgICAgICAgaW5zZXJ0ZWRJZDogcmVzdWx0LnVwc2VydGVkSWQgfHwgdW5kZWZpbmVkLFxuICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGRvQ29uZGl0aW9uYWxJbnNlcnQoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBkb0NvbmRpdGlvbmFsSW5zZXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGNvbGxlY3Rpb24ucmVwbGFjZU9uZShzZWxlY3RvciwgcmVwbGFjZW1lbnRXaXRoSWQsIG1vbmdvT3B0c0Zvckluc2VydClcbiAgICAgIC50aGVuKHJlc3VsdCA9PiAoe1xuICAgICAgICBudW1iZXJBZmZlY3RlZDogcmVzdWx0LnVwc2VydGVkQ291bnQsXG4gICAgICAgIGluc2VydGVkSWQ6IHJlc3VsdC51cHNlcnRlZElkLFxuICAgICAgfSkpLmNhdGNoKGVyciA9PiB7XG4gICAgICAgIGlmIChNb25nb0Nvbm5lY3Rpb24uX2lzQ2Fubm90Q2hhbmdlSWRFcnJvcihlcnIpKSB7XG4gICAgICAgICAgcmV0dXJuIGRvVXBkYXRlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICB9O1xuICByZXR1cm4gZG9VcGRhdGUoKTtcbn07XG5cbi8vIG9ic2VydmVDaGFuZ2VzIGZvciB0YWlsYWJsZSBjdXJzb3JzIG9uIGNhcHBlZCBjb2xsZWN0aW9ucy5cbi8vXG4vLyBTb21lIGRpZmZlcmVuY2VzIGZyb20gbm9ybWFsIGN1cnNvcnM6XG4vLyAgIC0gV2lsbCBuZXZlciBwcm9kdWNlIGFueXRoaW5nIG90aGVyIHRoYW4gJ2FkZGVkJyBvciAnYWRkZWRCZWZvcmUnLiBJZiB5b3Vcbi8vICAgICBkbyB1cGRhdGUgYSBkb2N1bWVudCB0aGF0IGhhcyBhbHJlYWR5IGJlZW4gcHJvZHVjZWQsIHRoaXMgd2lsbCBub3Qgbm90aWNlXG4vLyAgICAgaXQuXG4vLyAgIC0gSWYgeW91IGRpc2Nvbm5lY3QgYW5kIHJlY29ubmVjdCBmcm9tIE1vbmdvLCBpdCB3aWxsIGVzc2VudGlhbGx5IHJlc3RhcnRcbi8vICAgICB0aGUgcXVlcnksIHdoaWNoIHdpbGwgbGVhZCB0byBkdXBsaWNhdGUgcmVzdWx0cy4gVGhpcyBpcyBwcmV0dHkgYmFkLFxuLy8gICAgIGJ1dCBpZiB5b3UgaW5jbHVkZSBhIGZpZWxkIGNhbGxlZCAndHMnIHdoaWNoIGlzIGluc2VydGVkIGFzXG4vLyAgICAgbmV3IE1vbmdvSW50ZXJuYWxzLk1vbmdvVGltZXN0YW1wKDAsIDApICh3aGljaCBpcyBpbml0aWFsaXplZCB0byB0aGVcbi8vICAgICBjdXJyZW50IE1vbmdvLXN0eWxlIHRpbWVzdGFtcCksIHdlJ2xsIGJlIGFibGUgdG8gZmluZCB0aGUgcGxhY2UgdG9cbi8vICAgICByZXN0YXJ0IHByb3Blcmx5LiAoVGhpcyBmaWVsZCBpcyBzcGVjaWZpY2FsbHkgdW5kZXJzdG9vZCBieSBNb25nbyB3aXRoIGFuXG4vLyAgICAgb3B0aW1pemF0aW9uIHdoaWNoIGFsbG93cyBpdCB0byBmaW5kIHRoZSByaWdodCBwbGFjZSB0byBzdGFydCB3aXRob3V0XG4vLyAgICAgYW4gaW5kZXggb24gdHMuIEl0J3MgaG93IHRoZSBvcGxvZyB3b3Jrcy4pXG4vLyAgIC0gTm8gY2FsbGJhY2tzIGFyZSB0cmlnZ2VyZWQgc3luY2hyb25vdXNseSB3aXRoIHRoZSBjYWxsICh0aGVyZSdzIG5vXG4vLyAgICAgZGlmZmVyZW50aWF0aW9uIGJldHdlZW4gXCJpbml0aWFsIGRhdGFcIiBhbmQgXCJsYXRlciBjaGFuZ2VzXCI7IGV2ZXJ5dGhpbmdcbi8vICAgICB0aGF0IG1hdGNoZXMgdGhlIHF1ZXJ5IGdldHMgc2VudCBhc3luY2hyb25vdXNseSkuXG4vLyAgIC0gRGUtZHVwbGljYXRpb24gaXMgbm90IGltcGxlbWVudGVkLlxuLy8gICAtIERvZXMgbm90IHlldCBpbnRlcmFjdCB3aXRoIHRoZSB3cml0ZSBmZW5jZS4gUHJvYmFibHksIHRoaXMgc2hvdWxkIHdvcmsgYnlcbi8vICAgICBpZ25vcmluZyByZW1vdmVzICh3aGljaCBkb24ndCB3b3JrIG9uIGNhcHBlZCBjb2xsZWN0aW9ucykgYW5kIHVwZGF0ZXNcbi8vICAgICAod2hpY2ggZG9uJ3QgYWZmZWN0IHRhaWxhYmxlIGN1cnNvcnMpLCBhbmQganVzdCBrZWVwaW5nIHRyYWNrIG9mIHRoZSBJRFxuLy8gICAgIG9mIHRoZSBpbnNlcnRlZCBvYmplY3QsIGFuZCBjbG9zaW5nIHRoZSB3cml0ZSBmZW5jZSBvbmNlIHlvdSBnZXQgdG8gdGhhdFxuLy8gICAgIElEIChvciB0aW1lc3RhbXA/KS4gIFRoaXMgZG9lc24ndCB3b3JrIHdlbGwgaWYgdGhlIGRvY3VtZW50IGRvZXNuJ3QgbWF0Y2hcbi8vICAgICB0aGUgcXVlcnksIHRob3VnaC4gIE9uIHRoZSBvdGhlciBoYW5kLCB0aGUgd3JpdGUgZmVuY2UgY2FuIGNsb3NlXG4vLyAgICAgaW1tZWRpYXRlbHkgaWYgaXQgZG9lcyBub3QgbWF0Y2ggdGhlIHF1ZXJ5LiBTbyBpZiB3ZSB0cnVzdCBtaW5pbW9uZ29cbi8vICAgICBlbm91Z2ggdG8gYWNjdXJhdGVseSBldmFsdWF0ZSB0aGUgcXVlcnkgYWdhaW5zdCB0aGUgd3JpdGUgZmVuY2UsIHdlXG4vLyAgICAgc2hvdWxkIGJlIGFibGUgdG8gZG8gdGhpcy4uLiAgT2YgY291cnNlLCBtaW5pbW9uZ28gZG9lc24ndCBldmVuIHN1cHBvcnRcbi8vICAgICBNb25nbyBUaW1lc3RhbXBzIHlldC5cbk1vbmdvQ29ubmVjdGlvbi5wcm90b3R5cGUuX29ic2VydmVDaGFuZ2VzVGFpbGFibGUgPSBmdW5jdGlvbiAoXG4gIGN1cnNvckRlc2NyaXB0aW9uLCBvcmRlcmVkLCBjYWxsYmFja3MpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIC8vIFRhaWxhYmxlIGN1cnNvcnMgb25seSBldmVyIGNhbGwgYWRkZWQvYWRkZWRCZWZvcmUgY2FsbGJhY2tzLCBzbyBpdCdzIGFuXG4gIC8vIGVycm9yIGlmIHlvdSBkaWRuJ3QgcHJvdmlkZSB0aGVtLlxuICBpZiAoKG9yZGVyZWQgJiYgIWNhbGxiYWNrcy5hZGRlZEJlZm9yZSkgfHxcbiAgICAoIW9yZGVyZWQgJiYgIWNhbGxiYWNrcy5hZGRlZCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBvYnNlcnZlIGFuIFwiICsgKG9yZGVyZWQgPyBcIm9yZGVyZWRcIiA6IFwidW5vcmRlcmVkXCIpXG4gICAgICArIFwiIHRhaWxhYmxlIGN1cnNvciB3aXRob3V0IGEgXCJcbiAgICAgICsgKG9yZGVyZWQgPyBcImFkZGVkQmVmb3JlXCIgOiBcImFkZGVkXCIpICsgXCIgY2FsbGJhY2tcIik7XG4gIH1cblxuICByZXR1cm4gc2VsZi50YWlsKGN1cnNvckRlc2NyaXB0aW9uLCBmdW5jdGlvbiAoZG9jKSB7XG4gICAgdmFyIGlkID0gZG9jLl9pZDtcbiAgICBkZWxldGUgZG9jLl9pZDtcbiAgICAvLyBUaGUgdHMgaXMgYW4gaW1wbGVtZW50YXRpb24gZGV0YWlsLiBIaWRlIGl0LlxuICAgIGRlbGV0ZSBkb2MudHM7XG4gICAgaWYgKG9yZGVyZWQpIHtcbiAgICAgIGNhbGxiYWNrcy5hZGRlZEJlZm9yZShpZCwgZG9jLCBudWxsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2FsbGJhY2tzLmFkZGVkKGlkLCBkb2MpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5Nb25nb0Nvbm5lY3Rpb24ucHJvdG90eXBlLl9jcmVhdGVBc3luY2hyb25vdXNDdXJzb3IgPSBmdW5jdGlvbihcbiAgY3Vyc29yRGVzY3JpcHRpb24sIG9wdGlvbnMgPSB7fSkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIGNvbnN0IHsgc2VsZkZvckl0ZXJhdGlvbiwgdXNlVHJhbnNmb3JtIH0gPSBvcHRpb25zO1xuICBvcHRpb25zID0geyBzZWxmRm9ySXRlcmF0aW9uLCB1c2VUcmFuc2Zvcm0gfTtcblxuICB2YXIgY29sbGVjdGlvbiA9IHNlbGYucmF3Q29sbGVjdGlvbihjdXJzb3JEZXNjcmlwdGlvbi5jb2xsZWN0aW9uTmFtZSk7XG4gIHZhciBjdXJzb3JPcHRpb25zID0gY3Vyc29yRGVzY3JpcHRpb24ub3B0aW9ucztcbiAgdmFyIG1vbmdvT3B0aW9ucyA9IHtcbiAgICBzb3J0OiBjdXJzb3JPcHRpb25zLnNvcnQsXG4gICAgbGltaXQ6IGN1cnNvck9wdGlvbnMubGltaXQsXG4gICAgc2tpcDogY3Vyc29yT3B0aW9ucy5za2lwLFxuICAgIHByb2plY3Rpb246IGN1cnNvck9wdGlvbnMuZmllbGRzIHx8IGN1cnNvck9wdGlvbnMucHJvamVjdGlvbixcbiAgICByZWFkUHJlZmVyZW5jZTogY3Vyc29yT3B0aW9ucy5yZWFkUHJlZmVyZW5jZSxcbiAgfTtcblxuICAvLyBEbyB3ZSB3YW50IGEgdGFpbGFibGUgY3Vyc29yICh3aGljaCBvbmx5IHdvcmtzIG9uIGNhcHBlZCBjb2xsZWN0aW9ucyk/XG4gIGlmIChjdXJzb3JPcHRpb25zLnRhaWxhYmxlKSB7XG4gICAgbW9uZ29PcHRpb25zLm51bWJlck9mUmV0cmllcyA9IC0xO1xuICB9XG5cbiAgdmFyIGRiQ3Vyc29yID0gY29sbGVjdGlvbi5maW5kKFxuICAgIHJlcGxhY2VUeXBlcyhjdXJzb3JEZXNjcmlwdGlvbi5zZWxlY3RvciwgcmVwbGFjZU1ldGVvckF0b21XaXRoTW9uZ28pLFxuICAgIG1vbmdvT3B0aW9ucyk7XG5cbiAgLy8gRG8gd2Ugd2FudCBhIHRhaWxhYmxlIGN1cnNvciAod2hpY2ggb25seSB3b3JrcyBvbiBjYXBwZWQgY29sbGVjdGlvbnMpP1xuICBpZiAoY3Vyc29yT3B0aW9ucy50YWlsYWJsZSkge1xuICAgIC8vIFdlIHdhbnQgYSB0YWlsYWJsZSBjdXJzb3IuLi5cbiAgICBkYkN1cnNvci5hZGRDdXJzb3JGbGFnKFwidGFpbGFibGVcIiwgdHJ1ZSlcbiAgICAvLyAuLi4gYW5kIGZvciB0aGUgc2VydmVyIHRvIHdhaXQgYSBiaXQgaWYgYW55IGdldE1vcmUgaGFzIG5vIGRhdGEgKHJhdGhlclxuICAgIC8vIHRoYW4gbWFraW5nIHVzIHB1dCB0aGUgcmVsZXZhbnQgc2xlZXBzIGluIHRoZSBjbGllbnQpLi4uXG4gICAgZGJDdXJzb3IuYWRkQ3Vyc29yRmxhZyhcImF3YWl0RGF0YVwiLCB0cnVlKVxuXG4gICAgLy8gQW5kIGlmIHRoaXMgaXMgb24gdGhlIG9wbG9nIGNvbGxlY3Rpb24gYW5kIHRoZSBjdXJzb3Igc3BlY2lmaWVzIGEgJ3RzJyxcbiAgICAvLyB0aGVuIHNldCB0aGUgdW5kb2N1bWVudGVkIG9wbG9nIHJlcGxheSBmbGFnLCB3aGljaCBkb2VzIGEgc3BlY2lhbCBzY2FuIHRvXG4gICAgLy8gZmluZCB0aGUgZmlyc3QgZG9jdW1lbnQgKGluc3RlYWQgb2YgY3JlYXRpbmcgYW4gaW5kZXggb24gdHMpLiBUaGlzIGlzIGFcbiAgICAvLyB2ZXJ5IGhhcmQtY29kZWQgTW9uZ28gZmxhZyB3aGljaCBvbmx5IHdvcmtzIG9uIHRoZSBvcGxvZyBjb2xsZWN0aW9uIGFuZFxuICAgIC8vIG9ubHkgd29ya3Mgd2l0aCB0aGUgdHMgZmllbGQuXG4gICAgaWYgKGN1cnNvckRlc2NyaXB0aW9uLmNvbGxlY3Rpb25OYW1lID09PSBPUExPR19DT0xMRUNUSU9OICYmXG4gICAgICBjdXJzb3JEZXNjcmlwdGlvbi5zZWxlY3Rvci50cykge1xuICAgICAgZGJDdXJzb3IuYWRkQ3Vyc29yRmxhZyhcIm9wbG9nUmVwbGF5XCIsIHRydWUpXG4gICAgfVxuICB9XG5cbiAgaWYgKHR5cGVvZiBjdXJzb3JPcHRpb25zLm1heFRpbWVNcyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBkYkN1cnNvciA9IGRiQ3Vyc29yLm1heFRpbWVNUyhjdXJzb3JPcHRpb25zLm1heFRpbWVNcyk7XG4gIH1cbiAgaWYgKHR5cGVvZiBjdXJzb3JPcHRpb25zLmhpbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgZGJDdXJzb3IgPSBkYkN1cnNvci5oaW50KGN1cnNvck9wdGlvbnMuaGludCk7XG4gIH1cblxuICByZXR1cm4gbmV3IEFzeW5jaHJvbm91c0N1cnNvcihkYkN1cnNvciwgY3Vyc29yRGVzY3JpcHRpb24sIG9wdGlvbnMsIGNvbGxlY3Rpb24pO1xufTtcblxuLy8gVGFpbHMgdGhlIGN1cnNvciBkZXNjcmliZWQgYnkgY3Vyc29yRGVzY3JpcHRpb24sIG1vc3QgbGlrZWx5IG9uIHRoZVxuLy8gb3Bsb2cuIENhbGxzIGRvY0NhbGxiYWNrIHdpdGggZWFjaCBkb2N1bWVudCBmb3VuZC4gSWdub3JlcyBlcnJvcnMgYW5kIGp1c3Rcbi8vIHJlc3RhcnRzIHRoZSB0YWlsIG9uIGVycm9yLlxuLy9cbi8vIElmIHRpbWVvdXRNUyBpcyBzZXQsIHRoZW4gaWYgd2UgZG9uJ3QgZ2V0IGEgbmV3IGRvY3VtZW50IGV2ZXJ5IHRpbWVvdXRNUyxcbi8vIGtpbGwgYW5kIHJlc3RhcnQgdGhlIGN1cnNvci4gVGhpcyBpcyBwcmltYXJpbHkgYSB3b3JrYXJvdW5kIGZvciAjODU5OC5cbk1vbmdvQ29ubmVjdGlvbi5wcm90b3R5cGUudGFpbCA9IGZ1bmN0aW9uIChjdXJzb3JEZXNjcmlwdGlvbiwgZG9jQ2FsbGJhY2ssIHRpbWVvdXRNUykge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIGlmICghY3Vyc29yRGVzY3JpcHRpb24ub3B0aW9ucy50YWlsYWJsZSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4gb25seSB0YWlsIGEgdGFpbGFibGUgY3Vyc29yXCIpO1xuXG4gIHZhciBjdXJzb3IgPSBzZWxmLl9jcmVhdGVBc3luY2hyb25vdXNDdXJzb3IoY3Vyc29yRGVzY3JpcHRpb24pO1xuXG4gIHZhciBzdG9wcGVkID0gZmFsc2U7XG4gIHZhciBsYXN0VFM7XG5cbiAgTWV0ZW9yLmRlZmVyKGFzeW5jIGZ1bmN0aW9uIGxvb3AoKSB7XG4gICAgdmFyIGRvYyA9IG51bGw7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGlmIChzdG9wcGVkKVxuICAgICAgICByZXR1cm47XG4gICAgICB0cnkge1xuICAgICAgICBkb2MgPSBhd2FpdCBjdXJzb3IuX25leHRPYmplY3RQcm9taXNlV2l0aFRpbWVvdXQodGltZW91dE1TKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAvLyBXZSBzaG91bGQgbm90IGlnbm9yZSBlcnJvcnMgaGVyZSB1bmxlc3Mgd2Ugd2FudCB0byBzcGVuZCBhIGxvdCBvZiB0aW1lIGRlYnVnZ2luZ1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgIC8vIFRoZXJlJ3Mgbm8gZ29vZCB3YXkgdG8gZmlndXJlIG91dCBpZiB0aGlzIHdhcyBhY3R1YWxseSBhbiBlcnJvciBmcm9tXG4gICAgICAgIC8vIE1vbmdvLCBvciBqdXN0IGNsaWVudC1zaWRlIChpbmNsdWRpbmcgb3VyIG93biB0aW1lb3V0IGVycm9yKS4gQWhcbiAgICAgICAgLy8gd2VsbC4gQnV0IGVpdGhlciB3YXksIHdlIG5lZWQgdG8gcmV0cnkgdGhlIGN1cnNvciAodW5sZXNzIHRoZSBmYWlsdXJlXG4gICAgICAgIC8vIHdhcyBiZWNhdXNlIHRoZSBvYnNlcnZlIGdvdCBzdG9wcGVkKS5cbiAgICAgICAgZG9jID0gbnVsbDtcbiAgICAgIH1cbiAgICAgIC8vIFNpbmNlIHdlIGF3YWl0ZWQgYSBwcm9taXNlIGFib3ZlLCB3ZSBuZWVkIHRvIGNoZWNrIGFnYWluIHRvIHNlZSBpZlxuICAgICAgLy8gd2UndmUgYmVlbiBzdG9wcGVkIGJlZm9yZSBjYWxsaW5nIHRoZSBjYWxsYmFjay5cbiAgICAgIGlmIChzdG9wcGVkKVxuICAgICAgICByZXR1cm47XG4gICAgICBpZiAoZG9jKSB7XG4gICAgICAgIC8vIElmIGEgdGFpbGFibGUgY3Vyc29yIGNvbnRhaW5zIGEgXCJ0c1wiIGZpZWxkLCB1c2UgaXQgdG8gcmVjcmVhdGUgdGhlXG4gICAgICAgIC8vIGN1cnNvciBvbiBlcnJvci4gKFwidHNcIiBpcyBhIHN0YW5kYXJkIHRoYXQgTW9uZ28gdXNlcyBpbnRlcm5hbGx5IGZvclxuICAgICAgICAvLyB0aGUgb3Bsb2csIGFuZCB0aGVyZSdzIGEgc3BlY2lhbCBmbGFnIHRoYXQgbGV0cyB5b3UgZG8gYmluYXJ5IHNlYXJjaFxuICAgICAgICAvLyBvbiBpdCBpbnN0ZWFkIG9mIG5lZWRpbmcgdG8gdXNlIGFuIGluZGV4LilcbiAgICAgICAgbGFzdFRTID0gZG9jLnRzO1xuICAgICAgICBkb2NDYWxsYmFjayhkb2MpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIG5ld1NlbGVjdG9yID0gT2JqZWN0LmFzc2lnbih7fSwgY3Vyc29yRGVzY3JpcHRpb24uc2VsZWN0b3IpO1xuICAgICAgICBpZiAobGFzdFRTKSB7XG4gICAgICAgICAgbmV3U2VsZWN0b3IudHMgPSB7JGd0OiBsYXN0VFN9O1xuICAgICAgICB9XG4gICAgICAgIGN1cnNvciA9IHNlbGYuX2NyZWF0ZUFzeW5jaHJvbm91c0N1cnNvcihuZXcgQ3Vyc29yRGVzY3JpcHRpb24oXG4gICAgICAgICAgY3Vyc29yRGVzY3JpcHRpb24uY29sbGVjdGlvbk5hbWUsXG4gICAgICAgICAgbmV3U2VsZWN0b3IsXG4gICAgICAgICAgY3Vyc29yRGVzY3JpcHRpb24ub3B0aW9ucykpO1xuICAgICAgICAvLyBNb25nbyBmYWlsb3ZlciB0YWtlcyBtYW55IHNlY29uZHMuICBSZXRyeSBpbiBhIGJpdC4gIChXaXRob3V0IHRoaXNcbiAgICAgICAgLy8gc2V0VGltZW91dCwgd2UgcGVnIHRoZSBDUFUgYXQgMTAwJSBhbmQgbmV2ZXIgbm90aWNlIHRoZSBhY3R1YWxcbiAgICAgICAgLy8gZmFpbG92ZXIuXG4gICAgICAgIHNldFRpbWVvdXQobG9vcCwgMTAwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4ge1xuICAgIHN0b3A6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHN0b3BwZWQgPSB0cnVlO1xuICAgICAgY3Vyc29yLmNsb3NlKCk7XG4gICAgfVxuICB9O1xufTtcblxuT2JqZWN0LmFzc2lnbihNb25nb0Nvbm5lY3Rpb24ucHJvdG90eXBlLCB7XG4gIF9vYnNlcnZlQ2hhbmdlczogYXN5bmMgZnVuY3Rpb24gKFxuICAgIGN1cnNvckRlc2NyaXB0aW9uLCBvcmRlcmVkLCBjYWxsYmFja3MsIG5vbk11dGF0aW5nQ2FsbGJhY2tzKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGNvbnN0IGNvbGxlY3Rpb25OYW1lID0gY3Vyc29yRGVzY3JpcHRpb24uY29sbGVjdGlvbk5hbWU7XG5cbiAgICBpZiAoY3Vyc29yRGVzY3JpcHRpb24ub3B0aW9ucy50YWlsYWJsZSkge1xuICAgICAgcmV0dXJuIHNlbGYuX29ic2VydmVDaGFuZ2VzVGFpbGFibGUoY3Vyc29yRGVzY3JpcHRpb24sIG9yZGVyZWQsIGNhbGxiYWNrcyk7XG4gICAgfVxuXG4gICAgLy8gWW91IG1heSBub3QgZmlsdGVyIG91dCBfaWQgd2hlbiBvYnNlcnZpbmcgY2hhbmdlcywgYmVjYXVzZSB0aGUgaWQgaXMgYSBjb3JlXG4gICAgLy8gcGFydCBvZiB0aGUgb2JzZXJ2ZUNoYW5nZXMgQVBJLlxuICAgIGNvbnN0IGZpZWxkc09wdGlvbnMgPSBjdXJzb3JEZXNjcmlwdGlvbi5vcHRpb25zLnByb2plY3Rpb24gfHwgY3Vyc29yRGVzY3JpcHRpb24ub3B0aW9ucy5maWVsZHM7XG4gICAgaWYgKGZpZWxkc09wdGlvbnMgJiZcbiAgICAgIChmaWVsZHNPcHRpb25zLl9pZCA9PT0gMCB8fFxuICAgICAgICBmaWVsZHNPcHRpb25zLl9pZCA9PT0gZmFsc2UpKSB7XG4gICAgICB0aHJvdyBFcnJvcihcIllvdSBtYXkgbm90IG9ic2VydmUgYSBjdXJzb3Igd2l0aCB7ZmllbGRzOiB7X2lkOiAwfX1cIik7XG4gICAgfVxuXG4gICAgdmFyIG9ic2VydmVLZXkgPSBFSlNPTi5zdHJpbmdpZnkoXG4gICAgICBPYmplY3QuYXNzaWduKHtvcmRlcmVkOiBvcmRlcmVkfSwgY3Vyc29yRGVzY3JpcHRpb24pKTtcblxuICAgIHZhciBtdWx0aXBsZXhlciwgb2JzZXJ2ZURyaXZlcjtcbiAgICB2YXIgZmlyc3RIYW5kbGUgPSBmYWxzZTtcblxuICAgIC8vIEZpbmQgYSBtYXRjaGluZyBPYnNlcnZlTXVsdGlwbGV4ZXIsIG9yIGNyZWF0ZSBhIG5ldyBvbmUuIFRoaXMgbmV4dCBibG9jayBpc1xuICAgIC8vIGd1YXJhbnRlZWQgdG8gbm90IHlpZWxkIChhbmQgaXQgZG9lc24ndCBjYWxsIGFueXRoaW5nIHRoYXQgY2FuIG9ic2VydmUgYVxuICAgIC8vIG5ldyBxdWVyeSksIHNvIG5vIG90aGVyIGNhbGxzIHRvIHRoaXMgZnVuY3Rpb24gY2FuIGludGVybGVhdmUgd2l0aCBpdC5cbiAgICBpZiAob2JzZXJ2ZUtleSBpbiBzZWxmLl9vYnNlcnZlTXVsdGlwbGV4ZXJzKSB7XG4gICAgICBtdWx0aXBsZXhlciA9IHNlbGYuX29ic2VydmVNdWx0aXBsZXhlcnNbb2JzZXJ2ZUtleV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGZpcnN0SGFuZGxlID0gdHJ1ZTtcbiAgICAgIC8vIENyZWF0ZSBhIG5ldyBPYnNlcnZlTXVsdGlwbGV4ZXIuXG4gICAgICBtdWx0aXBsZXhlciA9IG5ldyBPYnNlcnZlTXVsdGlwbGV4ZXIoe1xuICAgICAgICBvcmRlcmVkOiBvcmRlcmVkLFxuICAgICAgICBvblN0b3A6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBkZWxldGUgc2VsZi5fb2JzZXJ2ZU11bHRpcGxleGVyc1tvYnNlcnZlS2V5XTtcbiAgICAgICAgICByZXR1cm4gb2JzZXJ2ZURyaXZlci5zdG9wKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHZhciBvYnNlcnZlSGFuZGxlID0gbmV3IE9ic2VydmVIYW5kbGUobXVsdGlwbGV4ZXIsXG4gICAgICBjYWxsYmFja3MsXG4gICAgICBub25NdXRhdGluZ0NhbGxiYWNrcyxcbiAgICApO1xuXG4gICAgY29uc3Qgb3Bsb2dPcHRpb25zID0gc2VsZj8uX29wbG9nSGFuZGxlPy5fb3Bsb2dPcHRpb25zIHx8IHt9O1xuICAgIGNvbnN0IHsgaW5jbHVkZUNvbGxlY3Rpb25zLCBleGNsdWRlQ29sbGVjdGlvbnMgfSA9IG9wbG9nT3B0aW9ucztcbiAgICBpZiAoZmlyc3RIYW5kbGUpIHtcbiAgICAgIHZhciBtYXRjaGVyLCBzb3J0ZXI7XG4gICAgICB2YXIgY2FuVXNlT3Bsb2cgPSBbXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAvLyBBdCBhIGJhcmUgbWluaW11bSwgdXNpbmcgdGhlIG9wbG9nIHJlcXVpcmVzIHVzIHRvIGhhdmUgYW4gb3Bsb2csIHRvXG4gICAgICAgICAgLy8gd2FudCB1bm9yZGVyZWQgY2FsbGJhY2tzLCBhbmQgdG8gbm90IHdhbnQgYSBjYWxsYmFjayBvbiB0aGUgcG9sbHNcbiAgICAgICAgICAvLyB0aGF0IHdvbid0IGhhcHBlbi5cbiAgICAgICAgICByZXR1cm4gc2VsZi5fb3Bsb2dIYW5kbGUgJiYgIW9yZGVyZWQgJiZcbiAgICAgICAgICAgICFjYWxsYmFja3MuX3Rlc3RPbmx5UG9sbENhbGxiYWNrO1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgLy8gV2UgYWxzbyBuZWVkIHRvIGNoZWNrLCBpZiB0aGUgY29sbGVjdGlvbiBvZiB0aGlzIEN1cnNvciBpcyBhY3R1YWxseSBiZWluZyBcIndhdGNoZWRcIiBieSB0aGUgT3Bsb2cgaGFuZGxlXG4gICAgICAgICAgLy8gaWYgbm90LCB3ZSBoYXZlIHRvIGZhbGxiYWNrIHRvIGxvbmcgcG9sbGluZ1xuICAgICAgICAgIGlmIChleGNsdWRlQ29sbGVjdGlvbnM/Lmxlbmd0aCAmJiBleGNsdWRlQ29sbGVjdGlvbnMuaW5jbHVkZXMoY29sbGVjdGlvbk5hbWUpKSB7XG4gICAgICAgICAgICBpZiAoIW9wbG9nQ29sbGVjdGlvbldhcm5pbmdzLmluY2x1ZGVzKGNvbGxlY3Rpb25OYW1lKSkge1xuICAgICAgICAgICAgICBjb25zb2xlLndhcm4oYE1ldGVvci5zZXR0aW5ncy5wYWNrYWdlcy5tb25nby5vcGxvZ0V4Y2x1ZGVDb2xsZWN0aW9ucyBpbmNsdWRlcyB0aGUgY29sbGVjdGlvbiAke2NvbGxlY3Rpb25OYW1lfSAtIHlvdXIgc3Vic2NyaXB0aW9ucyB3aWxsIG9ubHkgdXNlIGxvbmcgcG9sbGluZyFgKTtcbiAgICAgICAgICAgICAgb3Bsb2dDb2xsZWN0aW9uV2FybmluZ3MucHVzaChjb2xsZWN0aW9uTmFtZSk7IC8vIHdlIG9ubHkgd2FudCB0byBzaG93IHRoZSB3YXJuaW5ncyBvbmNlIHBlciBjb2xsZWN0aW9uIVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoaW5jbHVkZUNvbGxlY3Rpb25zPy5sZW5ndGggJiYgIWluY2x1ZGVDb2xsZWN0aW9ucy5pbmNsdWRlcyhjb2xsZWN0aW9uTmFtZSkpIHtcbiAgICAgICAgICAgIGlmICghb3Bsb2dDb2xsZWN0aW9uV2FybmluZ3MuaW5jbHVkZXMoY29sbGVjdGlvbk5hbWUpKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUud2FybihgTWV0ZW9yLnNldHRpbmdzLnBhY2thZ2VzLm1vbmdvLm9wbG9nSW5jbHVkZUNvbGxlY3Rpb25zIGRvZXMgbm90IGluY2x1ZGUgdGhlIGNvbGxlY3Rpb24gJHtjb2xsZWN0aW9uTmFtZX0gLSB5b3VyIHN1YnNjcmlwdGlvbnMgd2lsbCBvbmx5IHVzZSBsb25nIHBvbGxpbmchYCk7XG4gICAgICAgICAgICAgIG9wbG9nQ29sbGVjdGlvbldhcm5pbmdzLnB1c2goY29sbGVjdGlvbk5hbWUpOyAvLyB3ZSBvbmx5IHdhbnQgdG8gc2hvdyB0aGUgd2FybmluZ3Mgb25jZSBwZXIgY29sbGVjdGlvbiFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAvLyBXZSBuZWVkIHRvIGJlIGFibGUgdG8gY29tcGlsZSB0aGUgc2VsZWN0b3IuIEZhbGwgYmFjayB0byBwb2xsaW5nIGZvclxuICAgICAgICAgIC8vIHNvbWUgbmV3ZmFuZ2xlZCAkc2VsZWN0b3IgdGhhdCBtaW5pbW9uZ28gZG9lc24ndCBzdXBwb3J0IHlldC5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgbWF0Y2hlciA9IG5ldyBNaW5pbW9uZ28uTWF0Y2hlcihjdXJzb3JEZXNjcmlwdGlvbi5zZWxlY3Rvcik7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAvLyBYWFggbWFrZSBhbGwgY29tcGlsYXRpb24gZXJyb3JzIE1pbmltb25nb0Vycm9yIG9yIHNvbWV0aGluZ1xuICAgICAgICAgICAgLy8gICAgIHNvIHRoYXQgdGhpcyBkb2Vzbid0IGlnbm9yZSB1bnJlbGF0ZWQgZXhjZXB0aW9uc1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIC8vIC4uLiBhbmQgdGhlIHNlbGVjdG9yIGl0c2VsZiBuZWVkcyB0byBzdXBwb3J0IG9wbG9nLlxuICAgICAgICAgIHJldHVybiBPcGxvZ09ic2VydmVEcml2ZXIuY3Vyc29yU3VwcG9ydGVkKGN1cnNvckRlc2NyaXB0aW9uLCBtYXRjaGVyKTtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgIC8vIEFuZCB3ZSBuZWVkIHRvIGJlIGFibGUgdG8gY29tcGlsZSB0aGUgc29ydCwgaWYgYW55LiAgZWcsIGNhbid0IGJlXG4gICAgICAgICAgLy8geyRuYXR1cmFsOiAxfS5cbiAgICAgICAgICBpZiAoIWN1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnMuc29ydClcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBzb3J0ZXIgPSBuZXcgTWluaW1vbmdvLlNvcnRlcihjdXJzb3JEZXNjcmlwdGlvbi5vcHRpb25zLnNvcnQpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgLy8gWFhYIG1ha2UgYWxsIGNvbXBpbGF0aW9uIGVycm9ycyBNaW5pbW9uZ29FcnJvciBvciBzb21ldGhpbmdcbiAgICAgICAgICAgIC8vICAgICBzbyB0aGF0IHRoaXMgZG9lc24ndCBpZ25vcmUgdW5yZWxhdGVkIGV4Y2VwdGlvbnNcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIF0uZXZlcnkoZiA9PiBmKCkpOyAgLy8gaW52b2tlIGVhY2ggZnVuY3Rpb24gYW5kIGNoZWNrIGlmIGFsbCByZXR1cm4gdHJ1ZVxuXG4gICAgICB2YXIgZHJpdmVyQ2xhc3MgPSBjYW5Vc2VPcGxvZyA/IE9wbG9nT2JzZXJ2ZURyaXZlciA6IFBvbGxpbmdPYnNlcnZlRHJpdmVyO1xuICAgICAgb2JzZXJ2ZURyaXZlciA9IG5ldyBkcml2ZXJDbGFzcyh7XG4gICAgICAgIGN1cnNvckRlc2NyaXB0aW9uOiBjdXJzb3JEZXNjcmlwdGlvbixcbiAgICAgICAgbW9uZ29IYW5kbGU6IHNlbGYsXG4gICAgICAgIG11bHRpcGxleGVyOiBtdWx0aXBsZXhlcixcbiAgICAgICAgb3JkZXJlZDogb3JkZXJlZCxcbiAgICAgICAgbWF0Y2hlcjogbWF0Y2hlciwgIC8vIGlnbm9yZWQgYnkgcG9sbGluZ1xuICAgICAgICBzb3J0ZXI6IHNvcnRlciwgIC8vIGlnbm9yZWQgYnkgcG9sbGluZ1xuICAgICAgICBfdGVzdE9ubHlQb2xsQ2FsbGJhY2s6IGNhbGxiYWNrcy5fdGVzdE9ubHlQb2xsQ2FsbGJhY2tcbiAgICAgIH0pO1xuXG4gICAgICBpZiAob2JzZXJ2ZURyaXZlci5faW5pdCkge1xuICAgICAgICBhd2FpdCBvYnNlcnZlRHJpdmVyLl9pbml0KCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFRoaXMgZmllbGQgaXMgb25seSBzZXQgZm9yIHVzZSBpbiB0ZXN0cy5cbiAgICAgIG11bHRpcGxleGVyLl9vYnNlcnZlRHJpdmVyID0gb2JzZXJ2ZURyaXZlcjtcbiAgICB9XG4gICAgc2VsZi5fb2JzZXJ2ZU11bHRpcGxleGVyc1tvYnNlcnZlS2V5XSA9IG11bHRpcGxleGVyO1xuICAgIC8vIEJsb2NrcyB1bnRpbCB0aGUgaW5pdGlhbCBhZGRzIGhhdmUgYmVlbiBzZW50LlxuICAgIGF3YWl0IG11bHRpcGxleGVyLmFkZEhhbmRsZUFuZFNlbmRJbml0aWFsQWRkcyhvYnNlcnZlSGFuZGxlKTtcblxuICAgIHJldHVybiBvYnNlcnZlSGFuZGxlO1xuICB9LFxuXG59KTtcbiIsImltcG9ydCBjbG9uZSBmcm9tICdsb2Rhc2guY2xvbmUnXG5cbi8qKiBAdHlwZSB7aW1wb3J0KCdtb25nb2RiJyl9ICovXG5leHBvcnQgY29uc3QgTW9uZ29EQiA9IE9iamVjdC5hc3NpZ24oTnBtTW9kdWxlTW9uZ29kYiwge1xuICBPYmplY3RJRDogTnBtTW9kdWxlTW9uZ29kYi5PYmplY3RJZCxcbn0pO1xuXG4vLyBUaGUgd3JpdGUgbWV0aG9kcyBibG9jayB1bnRpbCB0aGUgZGF0YWJhc2UgaGFzIGNvbmZpcm1lZCB0aGUgd3JpdGUgKGl0IG1heVxuLy8gbm90IGJlIHJlcGxpY2F0ZWQgb3Igc3RhYmxlIG9uIGRpc2ssIGJ1dCBvbmUgc2VydmVyIGhhcyBjb25maXJtZWQgaXQpIGlmIG5vXG4vLyBjYWxsYmFjayBpcyBwcm92aWRlZC4gSWYgYSBjYWxsYmFjayBpcyBwcm92aWRlZCwgdGhlbiB0aGV5IGNhbGwgdGhlIGNhbGxiYWNrXG4vLyB3aGVuIHRoZSB3cml0ZSBpcyBjb25maXJtZWQuIFRoZXkgcmV0dXJuIG5vdGhpbmcgb24gc3VjY2VzcywgYW5kIHJhaXNlIGFuXG4vLyBleGNlcHRpb24gb24gZmFpbHVyZS5cbi8vXG4vLyBBZnRlciBtYWtpbmcgYSB3cml0ZSAod2l0aCBpbnNlcnQsIHVwZGF0ZSwgcmVtb3ZlKSwgb2JzZXJ2ZXJzIGFyZVxuLy8gbm90aWZpZWQgYXN5bmNocm9ub3VzbHkuIElmIHlvdSB3YW50IHRvIHJlY2VpdmUgYSBjYWxsYmFjayBvbmNlIGFsbFxuLy8gb2YgdGhlIG9ic2VydmVyIG5vdGlmaWNhdGlvbnMgaGF2ZSBsYW5kZWQgZm9yIHlvdXIgd3JpdGUsIGRvIHRoZVxuLy8gd3JpdGVzIGluc2lkZSBhIHdyaXRlIGZlbmNlIChzZXQgRERQU2VydmVyLl9DdXJyZW50V3JpdGVGZW5jZSB0byBhIG5ld1xuLy8gX1dyaXRlRmVuY2UsIGFuZCB0aGVuIHNldCBhIGNhbGxiYWNrIG9uIHRoZSB3cml0ZSBmZW5jZS4pXG4vL1xuLy8gU2luY2Ugb3VyIGV4ZWN1dGlvbiBlbnZpcm9ubWVudCBpcyBzaW5nbGUtdGhyZWFkZWQsIHRoaXMgaXNcbi8vIHdlbGwtZGVmaW5lZCAtLSBhIHdyaXRlIFwiaGFzIGJlZW4gbWFkZVwiIGlmIGl0J3MgcmV0dXJuZWQsIGFuZCBhblxuLy8gb2JzZXJ2ZXIgXCJoYXMgYmVlbiBub3RpZmllZFwiIGlmIGl0cyBjYWxsYmFjayBoYXMgcmV0dXJuZWQuXG5cbmV4cG9ydCBjb25zdCB3cml0ZUNhbGxiYWNrID0gZnVuY3Rpb24gKHdyaXRlLCByZWZyZXNoLCBjYWxsYmFjaykge1xuICByZXR1cm4gZnVuY3Rpb24gKGVyciwgcmVzdWx0KSB7XG4gICAgaWYgKCEgZXJyKSB7XG4gICAgICAvLyBYWFggV2UgZG9uJ3QgaGF2ZSB0byBydW4gdGhpcyBvbiBlcnJvciwgcmlnaHQ/XG4gICAgICB0cnkge1xuICAgICAgICByZWZyZXNoKCk7XG4gICAgICB9IGNhdGNoIChyZWZyZXNoRXJyKSB7XG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgIGNhbGxiYWNrKHJlZnJlc2hFcnIpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyByZWZyZXNoRXJyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHdyaXRlLmNvbW1pdHRlZCgpO1xuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgY2FsbGJhY2soZXJyLCByZXN1bHQpO1xuICAgIH0gZWxzZSBpZiAoZXJyKSB7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICB9O1xufTtcblxuXG5leHBvcnQgY29uc3QgdHJhbnNmb3JtUmVzdWx0ID0gZnVuY3Rpb24gKGRyaXZlclJlc3VsdCkge1xuICB2YXIgbWV0ZW9yUmVzdWx0ID0geyBudW1iZXJBZmZlY3RlZDogMCB9O1xuICBpZiAoZHJpdmVyUmVzdWx0KSB7XG4gICAgdmFyIG1vbmdvUmVzdWx0ID0gZHJpdmVyUmVzdWx0LnJlc3VsdDtcbiAgICAvLyBPbiB1cGRhdGVzIHdpdGggdXBzZXJ0OnRydWUsIHRoZSBpbnNlcnRlZCB2YWx1ZXMgY29tZSBhcyBhIGxpc3Qgb2ZcbiAgICAvLyB1cHNlcnRlZCB2YWx1ZXMgLS0gZXZlbiB3aXRoIG9wdGlvbnMubXVsdGksIHdoZW4gdGhlIHVwc2VydCBkb2VzIGluc2VydCxcbiAgICAvLyBpdCBvbmx5IGluc2VydHMgb25lIGVsZW1lbnQuXG4gICAgaWYgKG1vbmdvUmVzdWx0LnVwc2VydGVkQ291bnQpIHtcbiAgICAgIG1ldGVvclJlc3VsdC5udW1iZXJBZmZlY3RlZCA9IG1vbmdvUmVzdWx0LnVwc2VydGVkQ291bnQ7XG5cbiAgICAgIGlmIChtb25nb1Jlc3VsdC51cHNlcnRlZElkKSB7XG4gICAgICAgIG1ldGVvclJlc3VsdC5pbnNlcnRlZElkID0gbW9uZ29SZXN1bHQudXBzZXJ0ZWRJZDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gbiB3YXMgdXNlZCBiZWZvcmUgTW9uZ28gNS4wLCBpbiBNb25nbyA1LjAgd2UgYXJlIG5vdCByZWNlaXZpbmcgdGhpcyBuXG4gICAgICAvLyBmaWVsZCBhbmQgc28gd2UgYXJlIHVzaW5nIG1vZGlmaWVkQ291bnQgaW5zdGVhZFxuICAgICAgbWV0ZW9yUmVzdWx0Lm51bWJlckFmZmVjdGVkID0gbW9uZ29SZXN1bHQubiB8fCBtb25nb1Jlc3VsdC5tYXRjaGVkQ291bnQgfHwgbW9uZ29SZXN1bHQubW9kaWZpZWRDb3VudDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbWV0ZW9yUmVzdWx0O1xufTtcblxuZXhwb3J0IGNvbnN0IHJlcGxhY2VNZXRlb3JBdG9tV2l0aE1vbmdvID0gZnVuY3Rpb24gKGRvY3VtZW50KSB7XG4gIGlmIChFSlNPTi5pc0JpbmFyeShkb2N1bWVudCkpIHtcbiAgICAvLyBUaGlzIGRvZXMgbW9yZSBjb3BpZXMgdGhhbiB3ZSdkIGxpa2UsIGJ1dCBpcyBuZWNlc3NhcnkgYmVjYXVzZVxuICAgIC8vIE1vbmdvREIuQlNPTiBvbmx5IGxvb2tzIGxpa2UgaXQgdGFrZXMgYSBVaW50OEFycmF5IChhbmQgZG9lc24ndCBhY3R1YWxseVxuICAgIC8vIHNlcmlhbGl6ZSBpdCBjb3JyZWN0bHkpLlxuICAgIHJldHVybiBuZXcgTW9uZ29EQi5CaW5hcnkoQnVmZmVyLmZyb20oZG9jdW1lbnQpKTtcbiAgfVxuICBpZiAoZG9jdW1lbnQgaW5zdGFuY2VvZiBNb25nb0RCLkJpbmFyeSkge1xuICAgIHJldHVybiBkb2N1bWVudDtcbiAgfVxuICBpZiAoZG9jdW1lbnQgaW5zdGFuY2VvZiBNb25nby5PYmplY3RJRCkge1xuICAgIHJldHVybiBuZXcgTW9uZ29EQi5PYmplY3RJZChkb2N1bWVudC50b0hleFN0cmluZygpKTtcbiAgfVxuICBpZiAoZG9jdW1lbnQgaW5zdGFuY2VvZiBNb25nb0RCLk9iamVjdElkKSB7XG4gICAgcmV0dXJuIG5ldyBNb25nb0RCLk9iamVjdElkKGRvY3VtZW50LnRvSGV4U3RyaW5nKCkpO1xuICB9XG4gIGlmIChkb2N1bWVudCBpbnN0YW5jZW9mIE1vbmdvREIuVGltZXN0YW1wKSB7XG4gICAgLy8gRm9yIG5vdywgdGhlIE1ldGVvciByZXByZXNlbnRhdGlvbiBvZiBhIE1vbmdvIHRpbWVzdGFtcCB0eXBlIChub3QgYSBkYXRlIVxuICAgIC8vIHRoaXMgaXMgYSB3ZWlyZCBpbnRlcm5hbCB0aGluZyB1c2VkIGluIHRoZSBvcGxvZyEpIGlzIHRoZSBzYW1lIGFzIHRoZVxuICAgIC8vIE1vbmdvIHJlcHJlc2VudGF0aW9uLiBXZSBuZWVkIHRvIGRvIHRoaXMgZXhwbGljaXRseSBvciBlbHNlIHdlIHdvdWxkIGRvIGFcbiAgICAvLyBzdHJ1Y3R1cmFsIGNsb25lIGFuZCBsb3NlIHRoZSBwcm90b3R5cGUuXG4gICAgcmV0dXJuIGRvY3VtZW50O1xuICB9XG4gIGlmIChkb2N1bWVudCBpbnN0YW5jZW9mIERlY2ltYWwpIHtcbiAgICByZXR1cm4gTW9uZ29EQi5EZWNpbWFsMTI4LmZyb21TdHJpbmcoZG9jdW1lbnQudG9TdHJpbmcoKSk7XG4gIH1cbiAgaWYgKEVKU09OLl9pc0N1c3RvbVR5cGUoZG9jdW1lbnQpKSB7XG4gICAgcmV0dXJuIHJlcGxhY2VOYW1lcyhtYWtlTW9uZ29MZWdhbCwgRUpTT04udG9KU09OVmFsdWUoZG9jdW1lbnQpKTtcbiAgfVxuICAvLyBJdCBpcyBub3Qgb3JkaW5hcmlseSBwb3NzaWJsZSB0byBzdGljayBkb2xsYXItc2lnbiBrZXlzIGludG8gbW9uZ29cbiAgLy8gc28gd2UgZG9uJ3QgYm90aGVyIGNoZWNraW5nIGZvciB0aGluZ3MgdGhhdCBuZWVkIGVzY2FwaW5nIGF0IHRoaXMgdGltZS5cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn07XG5cbmV4cG9ydCBjb25zdCByZXBsYWNlVHlwZXMgPSBmdW5jdGlvbiAoZG9jdW1lbnQsIGF0b21UcmFuc2Zvcm1lcikge1xuICBpZiAodHlwZW9mIGRvY3VtZW50ICE9PSAnb2JqZWN0JyB8fCBkb2N1bWVudCA9PT0gbnVsbClcbiAgICByZXR1cm4gZG9jdW1lbnQ7XG5cbiAgdmFyIHJlcGxhY2VkVG9wTGV2ZWxBdG9tID0gYXRvbVRyYW5zZm9ybWVyKGRvY3VtZW50KTtcbiAgaWYgKHJlcGxhY2VkVG9wTGV2ZWxBdG9tICE9PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIHJlcGxhY2VkVG9wTGV2ZWxBdG9tO1xuXG4gIHZhciByZXQgPSBkb2N1bWVudDtcbiAgT2JqZWN0LmVudHJpZXMoZG9jdW1lbnQpLmZvckVhY2goZnVuY3Rpb24gKFtrZXksIHZhbF0pIHtcbiAgICB2YXIgdmFsUmVwbGFjZWQgPSByZXBsYWNlVHlwZXModmFsLCBhdG9tVHJhbnNmb3JtZXIpO1xuICAgIGlmICh2YWwgIT09IHZhbFJlcGxhY2VkKSB7XG4gICAgICAvLyBMYXp5IGNsb25lLiBTaGFsbG93IGNvcHkuXG4gICAgICBpZiAocmV0ID09PSBkb2N1bWVudClcbiAgICAgICAgcmV0ID0gY2xvbmUoZG9jdW1lbnQpO1xuICAgICAgcmV0W2tleV0gPSB2YWxSZXBsYWNlZDtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gcmV0O1xufTtcblxuZXhwb3J0IGNvbnN0IHJlcGxhY2VNb25nb0F0b21XaXRoTWV0ZW9yID0gZnVuY3Rpb24gKGRvY3VtZW50KSB7XG4gIGlmIChkb2N1bWVudCBpbnN0YW5jZW9mIE1vbmdvREIuQmluYXJ5KSB7XG4gICAgLy8gZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5XG4gICAgaWYgKGRvY3VtZW50LnN1Yl90eXBlICE9PSAwKSB7XG4gICAgICByZXR1cm4gZG9jdW1lbnQ7XG4gICAgfVxuICAgIHZhciBidWZmZXIgPSBkb2N1bWVudC52YWx1ZSh0cnVlKTtcbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgfVxuICBpZiAoZG9jdW1lbnQgaW5zdGFuY2VvZiBNb25nb0RCLk9iamVjdElkKSB7XG4gICAgcmV0dXJuIG5ldyBNb25nby5PYmplY3RJRChkb2N1bWVudC50b0hleFN0cmluZygpKTtcbiAgfVxuICBpZiAoZG9jdW1lbnQgaW5zdGFuY2VvZiBNb25nb0RCLkRlY2ltYWwxMjgpIHtcbiAgICByZXR1cm4gRGVjaW1hbChkb2N1bWVudC50b1N0cmluZygpKTtcbiAgfVxuICBpZiAoZG9jdW1lbnRbXCJFSlNPTiR0eXBlXCJdICYmIGRvY3VtZW50W1wiRUpTT04kdmFsdWVcIl0gJiYgT2JqZWN0LmtleXMoZG9jdW1lbnQpLmxlbmd0aCA9PT0gMikge1xuICAgIHJldHVybiBFSlNPTi5mcm9tSlNPTlZhbHVlKHJlcGxhY2VOYW1lcyh1bm1ha2VNb25nb0xlZ2FsLCBkb2N1bWVudCkpO1xuICB9XG4gIGlmIChkb2N1bWVudCBpbnN0YW5jZW9mIE1vbmdvREIuVGltZXN0YW1wKSB7XG4gICAgLy8gRm9yIG5vdywgdGhlIE1ldGVvciByZXByZXNlbnRhdGlvbiBvZiBhIE1vbmdvIHRpbWVzdGFtcCB0eXBlIChub3QgYSBkYXRlIVxuICAgIC8vIHRoaXMgaXMgYSB3ZWlyZCBpbnRlcm5hbCB0aGluZyB1c2VkIGluIHRoZSBvcGxvZyEpIGlzIHRoZSBzYW1lIGFzIHRoZVxuICAgIC8vIE1vbmdvIHJlcHJlc2VudGF0aW9uLiBXZSBuZWVkIHRvIGRvIHRoaXMgZXhwbGljaXRseSBvciBlbHNlIHdlIHdvdWxkIGRvIGFcbiAgICAvLyBzdHJ1Y3R1cmFsIGNsb25lIGFuZCBsb3NlIHRoZSBwcm90b3R5cGUuXG4gICAgcmV0dXJuIGRvY3VtZW50O1xuICB9XG4gIHJldHVybiB1bmRlZmluZWQ7XG59O1xuXG5jb25zdCBtYWtlTW9uZ29MZWdhbCA9IG5hbWUgPT4gXCJFSlNPTlwiICsgbmFtZTtcbmNvbnN0IHVubWFrZU1vbmdvTGVnYWwgPSBuYW1lID0+IG5hbWUuc3Vic3RyKDUpO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVwbGFjZU5hbWVzKGZpbHRlciwgdGhpbmcpIHtcbiAgaWYgKHR5cGVvZiB0aGluZyA9PT0gXCJvYmplY3RcIiAmJiB0aGluZyAhPT0gbnVsbCkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHRoaW5nKSkge1xuICAgICAgcmV0dXJuIHRoaW5nLm1hcChyZXBsYWNlTmFtZXMuYmluZChudWxsLCBmaWx0ZXIpKTtcbiAgICB9XG4gICAgdmFyIHJldCA9IHt9O1xuICAgIE9iamVjdC5lbnRyaWVzKHRoaW5nKS5mb3JFYWNoKGZ1bmN0aW9uIChba2V5LCB2YWx1ZV0pIHtcbiAgICAgIHJldFtmaWx0ZXIoa2V5KV0gPSByZXBsYWNlTmFtZXMoZmlsdGVyLCB2YWx1ZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuICByZXR1cm4gdGhpbmc7XG59XG4iLCJpbXBvcnQgTG9jYWxDb2xsZWN0aW9uIGZyb20gJ21ldGVvci9taW5pbW9uZ28vbG9jYWxfY29sbGVjdGlvbic7XG5pbXBvcnQgeyByZXBsYWNlTW9uZ29BdG9tV2l0aE1ldGVvciwgcmVwbGFjZVR5cGVzIH0gZnJvbSAnLi9tb25nb19jb21tb24nO1xuXG4vKipcbiAqIFRoaXMgaXMganVzdCBhIGxpZ2h0IHdyYXBwZXIgZm9yIHRoZSBjdXJzb3IuIFRoZSBnb2FsIGhlcmUgaXMgdG8gZW5zdXJlIGNvbXBhdGliaWxpdHkgZXZlbiBpZlxuICogdGhlcmUgYXJlIGJyZWFraW5nIGNoYW5nZXMgb24gdGhlIE1vbmdvREIgZHJpdmVyLlxuICpcbiAqIFRoaXMgaXMgYW4gaW50ZXJuYWwgaW1wbGVtZW50YXRpb24gZGV0YWlsIGFuZCBpcyBjcmVhdGVkIGxhemlseSBieSB0aGUgbWFpbiBDdXJzb3IgY2xhc3MuXG4gKi9cbmV4cG9ydCBjbGFzcyBBc3luY2hyb25vdXNDdXJzb3Ige1xuICBjb25zdHJ1Y3RvcihkYkN1cnNvciwgY3Vyc29yRGVzY3JpcHRpb24sIG9wdGlvbnMpIHtcbiAgICB0aGlzLl9kYkN1cnNvciA9IGRiQ3Vyc29yO1xuICAgIHRoaXMuX2N1cnNvckRlc2NyaXB0aW9uID0gY3Vyc29yRGVzY3JpcHRpb247XG5cbiAgICB0aGlzLl9zZWxmRm9ySXRlcmF0aW9uID0gb3B0aW9ucy5zZWxmRm9ySXRlcmF0aW9uIHx8IHRoaXM7XG4gICAgaWYgKG9wdGlvbnMudXNlVHJhbnNmb3JtICYmIGN1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnMudHJhbnNmb3JtKSB7XG4gICAgICB0aGlzLl90cmFuc2Zvcm0gPSBMb2NhbENvbGxlY3Rpb24ud3JhcFRyYW5zZm9ybShcbiAgICAgICAgY3Vyc29yRGVzY3JpcHRpb24ub3B0aW9ucy50cmFuc2Zvcm0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl90cmFuc2Zvcm0gPSBudWxsO1xuICAgIH1cblxuICAgIHRoaXMuX3Zpc2l0ZWRJZHMgPSBuZXcgTG9jYWxDb2xsZWN0aW9uLl9JZE1hcDtcbiAgfVxuXG4gIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKSB7XG4gICAgdmFyIGN1cnNvciA9IHRoaXM7XG4gICAgcmV0dXJuIHtcbiAgICAgIGFzeW5jIG5leHQoKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gYXdhaXQgY3Vyc29yLl9uZXh0T2JqZWN0UHJvbWlzZSgpO1xuICAgICAgICByZXR1cm4geyBkb25lOiAhdmFsdWUsIHZhbHVlIH07XG4gICAgICB9LFxuICAgIH07XG4gIH1cblxuICAvLyBSZXR1cm5zIGEgUHJvbWlzZSBmb3IgdGhlIG5leHQgb2JqZWN0IGZyb20gdGhlIHVuZGVybHlpbmcgY3Vyc29yIChiZWZvcmVcbiAgLy8gdGhlIE1vbmdvLT5NZXRlb3IgdHlwZSByZXBsYWNlbWVudCkuXG4gIGFzeW5jIF9yYXdOZXh0T2JqZWN0UHJvbWlzZSgpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHRoaXMuX2RiQ3Vyc29yLm5leHQoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFJldHVybnMgYSBQcm9taXNlIGZvciB0aGUgbmV4dCBvYmplY3QgZnJvbSB0aGUgY3Vyc29yLCBza2lwcGluZyB0aG9zZSB3aG9zZVxuICAvLyBJRHMgd2UndmUgYWxyZWFkeSBzZWVuIGFuZCByZXBsYWNpbmcgTW9uZ28gYXRvbXMgd2l0aCBNZXRlb3IgYXRvbXMuXG4gIGFzeW5jIF9uZXh0T2JqZWN0UHJvbWlzZSAoKSB7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIHZhciBkb2MgPSBhd2FpdCB0aGlzLl9yYXdOZXh0T2JqZWN0UHJvbWlzZSgpO1xuXG4gICAgICBpZiAoIWRvYykgcmV0dXJuIG51bGw7XG4gICAgICBkb2MgPSByZXBsYWNlVHlwZXMoZG9jLCByZXBsYWNlTW9uZ29BdG9tV2l0aE1ldGVvcik7XG5cbiAgICAgIGlmICghdGhpcy5fY3Vyc29yRGVzY3JpcHRpb24ub3B0aW9ucy50YWlsYWJsZSAmJiAnX2lkJyBpbiBkb2MpIHtcbiAgICAgICAgLy8gRGlkIE1vbmdvIGdpdmUgdXMgZHVwbGljYXRlIGRvY3VtZW50cyBpbiB0aGUgc2FtZSBjdXJzb3I/IElmIHNvLFxuICAgICAgICAvLyBpZ25vcmUgdGhpcyBvbmUuIChEbyB0aGlzIGJlZm9yZSB0aGUgdHJhbnNmb3JtLCBzaW5jZSB0cmFuc2Zvcm0gbWlnaHRcbiAgICAgICAgLy8gcmV0dXJuIHNvbWUgdW5yZWxhdGVkIHZhbHVlLikgV2UgZG9uJ3QgZG8gdGhpcyBmb3IgdGFpbGFibGUgY3Vyc29ycyxcbiAgICAgICAgLy8gYmVjYXVzZSB3ZSB3YW50IHRvIG1haW50YWluIE8oMSkgbWVtb3J5IHVzYWdlLiBBbmQgaWYgdGhlcmUgaXNuJ3QgX2lkXG4gICAgICAgIC8vIGZvciBzb21lIHJlYXNvbiAobWF5YmUgaXQncyB0aGUgb3Bsb2cpLCB0aGVuIHdlIGRvbid0IGRvIHRoaXMgZWl0aGVyLlxuICAgICAgICAvLyAoQmUgY2FyZWZ1bCB0byBkbyB0aGlzIGZvciBmYWxzZXkgYnV0IGV4aXN0aW5nIF9pZCwgdGhvdWdoLilcbiAgICAgICAgaWYgKHRoaXMuX3Zpc2l0ZWRJZHMuaGFzKGRvYy5faWQpKSBjb250aW51ZTtcbiAgICAgICAgdGhpcy5fdmlzaXRlZElkcy5zZXQoZG9jLl9pZCwgdHJ1ZSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLl90cmFuc2Zvcm0pXG4gICAgICAgIGRvYyA9IHRoaXMuX3RyYW5zZm9ybShkb2MpO1xuXG4gICAgICByZXR1cm4gZG9jO1xuICAgIH1cbiAgfVxuXG4gIC8vIFJldHVybnMgYSBwcm9taXNlIHdoaWNoIGlzIHJlc29sdmVkIHdpdGggdGhlIG5leHQgb2JqZWN0IChsaWtlIHdpdGhcbiAgLy8gX25leHRPYmplY3RQcm9taXNlKSBvciByZWplY3RlZCBpZiB0aGUgY3Vyc29yIGRvZXNuJ3QgcmV0dXJuIHdpdGhpblxuICAvLyB0aW1lb3V0TVMgbXMuXG4gIF9uZXh0T2JqZWN0UHJvbWlzZVdpdGhUaW1lb3V0KHRpbWVvdXRNUykge1xuICAgIGlmICghdGltZW91dE1TKSB7XG4gICAgICByZXR1cm4gdGhpcy5fbmV4dE9iamVjdFByb21pc2UoKTtcbiAgICB9XG4gICAgY29uc3QgbmV4dE9iamVjdFByb21pc2UgPSB0aGlzLl9uZXh0T2JqZWN0UHJvbWlzZSgpO1xuICAgIGNvbnN0IHRpbWVvdXRFcnIgPSBuZXcgRXJyb3IoJ0NsaWVudC1zaWRlIHRpbWVvdXQgd2FpdGluZyBmb3IgbmV4dCBvYmplY3QnKTtcbiAgICBjb25zdCB0aW1lb3V0UHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICByZWplY3QodGltZW91dEVycik7XG4gICAgICB9LCB0aW1lb3V0TVMpO1xuICAgIH0pO1xuICAgIHJldHVybiBQcm9taXNlLnJhY2UoW25leHRPYmplY3RQcm9taXNlLCB0aW1lb3V0UHJvbWlzZV0pXG4gICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICBpZiAoZXJyID09PSB0aW1lb3V0RXJyKSB7XG4gICAgICAgICAgdGhpcy5jbG9zZSgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIGZvckVhY2goY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICAvLyBHZXQgYmFjayB0byB0aGUgYmVnaW5uaW5nLlxuICAgIHRoaXMuX3Jld2luZCgpO1xuXG4gICAgbGV0IGlkeCA9IDA7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGNvbnN0IGRvYyA9IGF3YWl0IHRoaXMuX25leHRPYmplY3RQcm9taXNlKCk7XG4gICAgICBpZiAoIWRvYykgcmV0dXJuO1xuICAgICAgYXdhaXQgY2FsbGJhY2suY2FsbCh0aGlzQXJnLCBkb2MsIGlkeCsrLCB0aGlzLl9zZWxmRm9ySXRlcmF0aW9uKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBtYXAoY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICBjb25zdCByZXN1bHRzID0gW107XG4gICAgYXdhaXQgdGhpcy5mb3JFYWNoKGFzeW5jIChkb2MsIGluZGV4KSA9PiB7XG4gICAgICByZXN1bHRzLnB1c2goYXdhaXQgY2FsbGJhY2suY2FsbCh0aGlzQXJnLCBkb2MsIGluZGV4LCB0aGlzLl9zZWxmRm9ySXRlcmF0aW9uKSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxuXG4gIF9yZXdpbmQoKSB7XG4gICAgLy8ga25vd24gdG8gYmUgc3luY2hyb25vdXNcbiAgICB0aGlzLl9kYkN1cnNvci5yZXdpbmQoKTtcblxuICAgIHRoaXMuX3Zpc2l0ZWRJZHMgPSBuZXcgTG9jYWxDb2xsZWN0aW9uLl9JZE1hcDtcbiAgfVxuXG4gIC8vIE1vc3RseSB1c2FibGUgZm9yIHRhaWxhYmxlIGN1cnNvcnMuXG4gIGNsb3NlKCkge1xuICAgIHRoaXMuX2RiQ3Vyc29yLmNsb3NlKCk7XG4gIH1cblxuICBmZXRjaCgpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAoZG9jID0+IGRvYyk7XG4gIH1cblxuICAvKipcbiAgICogRklYTUU6IChub2RlOjM0NjgwKSBbTU9OR09EQiBEUklWRVJdIFdhcm5pbmc6IGN1cnNvci5jb3VudCBpcyBkZXByZWNhdGVkIGFuZCB3aWxsIGJlXG4gICAqICByZW1vdmVkIGluIHRoZSBuZXh0IG1ham9yIHZlcnNpb24sIHBsZWFzZSB1c2UgYGNvbGxlY3Rpb24uZXN0aW1hdGVkRG9jdW1lbnRDb3VudGAgb3JcbiAgICogIGBjb2xsZWN0aW9uLmNvdW50RG9jdW1lbnRzYCBpbnN0ZWFkLlxuICAgKi9cbiAgY291bnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2RiQ3Vyc29yLmNvdW50KCk7XG4gIH1cblxuICAvLyBUaGlzIG1ldGhvZCBpcyBOT1Qgd3JhcHBlZCBpbiBDdXJzb3IuXG4gIGFzeW5jIGdldFJhd09iamVjdHMob3JkZXJlZCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAob3JkZXJlZCkge1xuICAgICAgcmV0dXJuIHNlbGYuZmV0Y2goKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHJlc3VsdHMgPSBuZXcgTG9jYWxDb2xsZWN0aW9uLl9JZE1hcDtcbiAgICAgIGF3YWl0IHNlbGYuZm9yRWFjaChmdW5jdGlvbiAoZG9jKSB7XG4gICAgICAgIHJlc3VsdHMuc2V0KGRvYy5faWQsIGRvYyk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cbiAgfVxufSIsImltcG9ydCB7IEFTWU5DX0NVUlNPUl9NRVRIT0RTLCBnZXRBc3luY01ldGhvZE5hbWUgfSBmcm9tICdtZXRlb3IvbWluaW1vbmdvL2NvbnN0YW50cyc7XG5pbXBvcnQgeyByZXBsYWNlTWV0ZW9yQXRvbVdpdGhNb25nbywgcmVwbGFjZVR5cGVzIH0gZnJvbSAnLi9tb25nb19jb21tb24nO1xuaW1wb3J0IExvY2FsQ29sbGVjdGlvbiBmcm9tICdtZXRlb3IvbWluaW1vbmdvL2xvY2FsX2NvbGxlY3Rpb24nO1xuaW1wb3J0IHsgQ3Vyc29yRGVzY3JpcHRpb24gfSBmcm9tICcuL2N1cnNvcl9kZXNjcmlwdGlvbic7XG5pbXBvcnQgeyBPYnNlcnZlQ2FsbGJhY2tzLCBPYnNlcnZlQ2hhbmdlc0NhbGxiYWNrcyB9IGZyb20gJy4vdHlwZXMnO1xuXG5pbnRlcmZhY2UgTW9uZ29JbnRlcmZhY2Uge1xuICByYXdDb2xsZWN0aW9uOiAoY29sbGVjdGlvbk5hbWU6IHN0cmluZykgPT4gYW55O1xuICBfY3JlYXRlQXN5bmNocm9ub3VzQ3Vyc29yOiAoY3Vyc29yRGVzY3JpcHRpb246IEN1cnNvckRlc2NyaXB0aW9uLCBvcHRpb25zOiBDdXJzb3JPcHRpb25zKSA9PiBhbnk7XG4gIF9vYnNlcnZlQ2hhbmdlczogKGN1cnNvckRlc2NyaXB0aW9uOiBDdXJzb3JEZXNjcmlwdGlvbiwgb3JkZXJlZDogYm9vbGVhbiwgY2FsbGJhY2tzOiBhbnksIG5vbk11dGF0aW5nQ2FsbGJhY2tzPzogYm9vbGVhbikgPT4gYW55O1xufVxuXG5pbnRlcmZhY2UgQ3Vyc29yT3B0aW9ucyB7XG4gIHNlbGZGb3JJdGVyYXRpb246IEN1cnNvcjxhbnk+O1xuICB1c2VUcmFuc2Zvcm06IGJvb2xlYW47XG59XG5cbi8qKlxuICogQGNsYXNzIEN1cnNvclxuICpcbiAqIFRoZSBtYWluIGN1cnNvciBvYmplY3QgcmV0dXJuZWQgZnJvbSBmaW5kKCksIGltcGxlbWVudGluZyB0aGUgZG9jdW1lbnRlZFxuICogTW9uZ28uQ29sbGVjdGlvbiBjdXJzb3IgQVBJLlxuICpcbiAqIFdyYXBzIGEgQ3Vyc29yRGVzY3JpcHRpb24gYW5kIGxhemlseSBjcmVhdGVzIGFuIEFzeW5jaHJvbm91c0N1cnNvclxuICogKG9ubHkgY29udGFjdHMgTW9uZ29EQiB3aGVuIG1ldGhvZHMgbGlrZSBmZXRjaCBvciBmb3JFYWNoIGFyZSBjYWxsZWQpLlxuICovXG5leHBvcnQgY2xhc3MgQ3Vyc29yPFQsIFUgPSBUPiB7XG4gIHB1YmxpYyBfbW9uZ286IE1vbmdvSW50ZXJmYWNlO1xuICBwdWJsaWMgX2N1cnNvckRlc2NyaXB0aW9uOiBDdXJzb3JEZXNjcmlwdGlvbjtcbiAgcHVibGljIF9zeW5jaHJvbm91c0N1cnNvcjogYW55IHwgbnVsbDtcblxuICBjb25zdHJ1Y3Rvcihtb25nbzogTW9uZ29JbnRlcmZhY2UsIGN1cnNvckRlc2NyaXB0aW9uOiBDdXJzb3JEZXNjcmlwdGlvbikge1xuICAgIHRoaXMuX21vbmdvID0gbW9uZ287XG4gICAgdGhpcy5fY3Vyc29yRGVzY3JpcHRpb24gPSBjdXJzb3JEZXNjcmlwdGlvbjtcbiAgICB0aGlzLl9zeW5jaHJvbm91c0N1cnNvciA9IG51bGw7XG4gIH1cblxuICBhc3luYyBjb3VudEFzeW5jKCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgY29uc3QgY29sbGVjdGlvbiA9IHRoaXMuX21vbmdvLnJhd0NvbGxlY3Rpb24odGhpcy5fY3Vyc29yRGVzY3JpcHRpb24uY29sbGVjdGlvbk5hbWUpO1xuICAgIHJldHVybiBhd2FpdCBjb2xsZWN0aW9uLmNvdW50RG9jdW1lbnRzKFxuICAgICAgcmVwbGFjZVR5cGVzKHRoaXMuX2N1cnNvckRlc2NyaXB0aW9uLnNlbGVjdG9yLCByZXBsYWNlTWV0ZW9yQXRvbVdpdGhNb25nbyksXG4gICAgICByZXBsYWNlVHlwZXModGhpcy5fY3Vyc29yRGVzY3JpcHRpb24ub3B0aW9ucywgcmVwbGFjZU1ldGVvckF0b21XaXRoTW9uZ28pLFxuICAgICk7XG4gIH1cblxuICBjb3VudCgpOiBuZXZlciB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgXCJjb3VudCgpIGlzIG5vdCBhdmFpbGFibGUgb24gdGhlIHNlcnZlci4gUGxlYXNlIHVzZSBjb3VudEFzeW5jKCkgaW5zdGVhZC5cIlxuICAgICk7XG4gIH1cblxuICBnZXRUcmFuc2Zvcm0oKTogKChkb2M6IGFueSkgPT4gYW55KSB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnNvckRlc2NyaXB0aW9uLm9wdGlvbnMudHJhbnNmb3JtO1xuICB9XG5cbiAgX3B1Ymxpc2hDdXJzb3Ioc3ViOiBhbnkpOiBhbnkge1xuICAgIGNvbnN0IGNvbGxlY3Rpb24gPSB0aGlzLl9jdXJzb3JEZXNjcmlwdGlvbi5jb2xsZWN0aW9uTmFtZTtcbiAgICByZXR1cm4gTW9uZ28uQ29sbGVjdGlvbi5fcHVibGlzaEN1cnNvcih0aGlzLCBzdWIsIGNvbGxlY3Rpb24pO1xuICB9XG5cbiAgX2dldENvbGxlY3Rpb25OYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnNvckRlc2NyaXB0aW9uLmNvbGxlY3Rpb25OYW1lO1xuICB9XG5cbiAgb2JzZXJ2ZShjYWxsYmFja3M6IE9ic2VydmVDYWxsYmFja3M8VT4pOiBhbnkge1xuICAgIHJldHVybiBMb2NhbENvbGxlY3Rpb24uX29ic2VydmVGcm9tT2JzZXJ2ZUNoYW5nZXModGhpcywgY2FsbGJhY2tzKTtcbiAgfVxuXG4gIGFzeW5jIG9ic2VydmVBc3luYyhjYWxsYmFja3M6IE9ic2VydmVDYWxsYmFja3M8VT4pOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHJlc29sdmUodGhpcy5vYnNlcnZlKGNhbGxiYWNrcykpKTtcbiAgfVxuXG4gIG9ic2VydmVDaGFuZ2VzKGNhbGxiYWNrczogT2JzZXJ2ZUNoYW5nZXNDYWxsYmFja3M8VT4sIG9wdGlvbnM6IHsgbm9uTXV0YXRpbmdDYWxsYmFja3M/OiBib29sZWFuIH0gPSB7fSk6IGFueSB7XG4gICAgY29uc3Qgb3JkZXJlZCA9IExvY2FsQ29sbGVjdGlvbi5fb2JzZXJ2ZUNoYW5nZXNDYWxsYmFja3NBcmVPcmRlcmVkKGNhbGxiYWNrcyk7XG4gICAgcmV0dXJuIHRoaXMuX21vbmdvLl9vYnNlcnZlQ2hhbmdlcyhcbiAgICAgIHRoaXMuX2N1cnNvckRlc2NyaXB0aW9uLFxuICAgICAgb3JkZXJlZCxcbiAgICAgIGNhbGxiYWNrcyxcbiAgICAgIG9wdGlvbnMubm9uTXV0YXRpbmdDYWxsYmFja3NcbiAgICApO1xuICB9XG5cbiAgYXN5bmMgb2JzZXJ2ZUNoYW5nZXNBc3luYyhjYWxsYmFja3M6IE9ic2VydmVDaGFuZ2VzQ2FsbGJhY2tzPFU+LCBvcHRpb25zOiB7IG5vbk11dGF0aW5nQ2FsbGJhY2tzPzogYm9vbGVhbiB9ID0ge30pOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiB0aGlzLm9ic2VydmVDaGFuZ2VzKGNhbGxiYWNrcywgb3B0aW9ucyk7XG4gIH1cbn1cblxuLy8gQWRkIGN1cnNvciBtZXRob2RzIGR5bmFtaWNhbGx5XG5bLi4uQVNZTkNfQ1VSU09SX01FVEhPRFMsIFN5bWJvbC5pdGVyYXRvciwgU3ltYm9sLmFzeW5jSXRlcmF0b3JdLmZvckVhY2gobWV0aG9kTmFtZSA9PiB7XG4gIGlmIChtZXRob2ROYW1lID09PSAnY291bnQnKSByZXR1cm47XG5cbiAgKEN1cnNvci5wcm90b3R5cGUgYXMgYW55KVttZXRob2ROYW1lXSA9IGZ1bmN0aW9uKHRoaXM6IEN1cnNvcjxhbnk+LCAuLi5hcmdzOiBhbnlbXSk6IGFueSB7XG4gICAgY29uc3QgY3Vyc29yID0gc2V0dXBBc3luY2hyb25vdXNDdXJzb3IodGhpcywgbWV0aG9kTmFtZSk7XG4gICAgcmV0dXJuIGN1cnNvclttZXRob2ROYW1lXSguLi5hcmdzKTtcbiAgfTtcblxuICBpZiAobWV0aG9kTmFtZSA9PT0gU3ltYm9sLml0ZXJhdG9yIHx8IG1ldGhvZE5hbWUgPT09IFN5bWJvbC5hc3luY0l0ZXJhdG9yKSByZXR1cm47XG5cbiAgY29uc3QgbWV0aG9kTmFtZUFzeW5jID0gZ2V0QXN5bmNNZXRob2ROYW1lKG1ldGhvZE5hbWUpO1xuXG4gIChDdXJzb3IucHJvdG90eXBlIGFzIGFueSlbbWV0aG9kTmFtZUFzeW5jXSA9IGZ1bmN0aW9uKHRoaXM6IEN1cnNvcjxhbnk+LCAuLi5hcmdzOiBhbnlbXSk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIHRoaXNbbWV0aG9kTmFtZV0oLi4uYXJncyk7XG4gIH07XG59KTtcblxuZnVuY3Rpb24gc2V0dXBBc3luY2hyb25vdXNDdXJzb3IoY3Vyc29yOiBDdXJzb3I8YW55PiwgbWV0aG9kOiBzdHJpbmcgfCBzeW1ib2wpOiBhbnkge1xuICBpZiAoY3Vyc29yLl9jdXJzb3JEZXNjcmlwdGlvbi5vcHRpb25zLnRhaWxhYmxlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgY2FsbCAke1N0cmluZyhtZXRob2QpfSBvbiBhIHRhaWxhYmxlIGN1cnNvcmApO1xuICB9XG5cbiAgaWYgKCFjdXJzb3IuX3N5bmNocm9ub3VzQ3Vyc29yKSB7XG4gICAgY3Vyc29yLl9zeW5jaHJvbm91c0N1cnNvciA9IGN1cnNvci5fbW9uZ28uX2NyZWF0ZUFzeW5jaHJvbm91c0N1cnNvcihcbiAgICAgIGN1cnNvci5fY3Vyc29yRGVzY3JpcHRpb24sXG4gICAgICB7XG4gICAgICAgIHNlbGZGb3JJdGVyYXRpb246IGN1cnNvcixcbiAgICAgICAgdXNlVHJhbnNmb3JtOiB0cnVlLFxuICAgICAgfVxuICAgICk7XG4gIH1cblxuICByZXR1cm4gY3Vyc29yLl9zeW5jaHJvbm91c0N1cnNvcjtcbn0iLCIvLyBzaW5nbGV0b25cbmV4cG9ydCBjb25zdCBMb2NhbENvbGxlY3Rpb25Ecml2ZXIgPSBuZXcgKGNsYXNzIExvY2FsQ29sbGVjdGlvbkRyaXZlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMubm9Db25uQ29sbGVjdGlvbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICB9XG5cbiAgb3BlbihuYW1lLCBjb25uKSB7XG4gICAgaWYgKCEgbmFtZSkge1xuICAgICAgcmV0dXJuIG5ldyBMb2NhbENvbGxlY3Rpb247XG4gICAgfVxuXG4gICAgaWYgKCEgY29ubikge1xuICAgICAgcmV0dXJuIGVuc3VyZUNvbGxlY3Rpb24obmFtZSwgdGhpcy5ub0Nvbm5Db2xsZWN0aW9ucyk7XG4gICAgfVxuXG4gICAgaWYgKCEgY29ubi5fbW9uZ29fbGl2ZWRhdGFfY29sbGVjdGlvbnMpIHtcbiAgICAgIGNvbm4uX21vbmdvX2xpdmVkYXRhX2NvbGxlY3Rpb25zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICB9XG5cbiAgICAvLyBYWFggaXMgdGhlcmUgYSB3YXkgdG8ga2VlcCB0cmFjayBvZiBhIGNvbm5lY3Rpb24ncyBjb2xsZWN0aW9ucyB3aXRob3V0XG4gICAgLy8gZGFuZ2xpbmcgaXQgb2ZmIHRoZSBjb25uZWN0aW9uIG9iamVjdD9cbiAgICByZXR1cm4gZW5zdXJlQ29sbGVjdGlvbihuYW1lLCBjb25uLl9tb25nb19saXZlZGF0YV9jb2xsZWN0aW9ucyk7XG4gIH1cbn0pO1xuXG5mdW5jdGlvbiBlbnN1cmVDb2xsZWN0aW9uKG5hbWUsIGNvbGxlY3Rpb25zKSB7XG4gIHJldHVybiAobmFtZSBpbiBjb2xsZWN0aW9ucylcbiAgICA/IGNvbGxlY3Rpb25zW25hbWVdXG4gICAgOiBjb2xsZWN0aW9uc1tuYW1lXSA9IG5ldyBMb2NhbENvbGxlY3Rpb24obmFtZSk7XG59XG4iLCJpbXBvcnQgb25jZSBmcm9tICdsb2Rhc2gub25jZSc7XG5pbXBvcnQge1xuICBBU1lOQ19DT0xMRUNUSU9OX01FVEhPRFMsXG4gIGdldEFzeW5jTWV0aG9kTmFtZSxcbiAgQ0xJRU5UX09OTFlfTUVUSE9EU1xufSBmcm9tIFwibWV0ZW9yL21pbmltb25nby9jb25zdGFudHNcIjtcbmltcG9ydCB7IE1vbmdvQ29ubmVjdGlvbiB9IGZyb20gJy4vbW9uZ29fY29ubmVjdGlvbic7XG5cbi8vIERlZmluZSBpbnRlcmZhY2VzIGFuZCB0eXBlc1xuaW50ZXJmYWNlIElDb25uZWN0aW9uT3B0aW9ucyB7XG4gIG9wbG9nVXJsPzogc3RyaW5nO1xuICBba2V5OiBzdHJpbmddOiB1bmtub3duOyAgLy8gQ2hhbmdlZCBmcm9tICdhbnknIHRvICd1bmtub3duJyBmb3IgYmV0dGVyIHR5cGUgc2FmZXR5XG59XG5cbmludGVyZmFjZSBJTW9uZ29JbnRlcm5hbHMge1xuICBSZW1vdGVDb2xsZWN0aW9uRHJpdmVyOiB0eXBlb2YgUmVtb3RlQ29sbGVjdGlvbkRyaXZlcjtcbiAgZGVmYXVsdFJlbW90ZUNvbGxlY3Rpb25Ecml2ZXI6ICgpID0+IFJlbW90ZUNvbGxlY3Rpb25Ecml2ZXI7XG59XG5cbi8vIE1vcmUgc3BlY2lmaWMgdHlwaW5nIGZvciBjb2xsZWN0aW9uIG1ldGhvZHNcbnR5cGUgTW9uZ29NZXRob2RGdW5jdGlvbiA9ICguLi5hcmdzOiB1bmtub3duW10pID0+IHVua25vd247XG5pbnRlcmZhY2UgSUNvbGxlY3Rpb25NZXRob2RzIHtcbiAgW2tleTogc3RyaW5nXTogTW9uZ29NZXRob2RGdW5jdGlvbjtcbn1cblxuLy8gVHlwZSBmb3IgTW9uZ29Db25uZWN0aW9uXG5pbnRlcmZhY2UgSU1vbmdvQ2xpZW50IHtcbiAgY29ubmVjdDogKCkgPT4gUHJvbWlzZTx2b2lkPjtcbn1cblxuaW50ZXJmYWNlIElNb25nb0Nvbm5lY3Rpb24ge1xuICBjbGllbnQ6IElNb25nb0NsaWVudDtcbiAgW2tleTogc3RyaW5nXTogTW9uZ29NZXRob2RGdW5jdGlvbiB8IElNb25nb0NsaWVudDtcbn1cblxuZGVjbGFyZSBnbG9iYWwge1xuICBuYW1lc3BhY2UgTm9kZUpTIHtcbiAgICBpbnRlcmZhY2UgUHJvY2Vzc0VudiB7XG4gICAgICBNT05HT19VUkw6IHN0cmluZztcbiAgICAgIE1PTkdPX09QTE9HX1VSTD86IHN0cmluZztcbiAgICB9XG4gIH1cblxuICBjb25zdCBNb25nb0ludGVybmFsczogSU1vbmdvSW50ZXJuYWxzO1xuICBjb25zdCBNZXRlb3I6IHtcbiAgICBzdGFydHVwOiAoY2FsbGJhY2s6ICgpID0+IFByb21pc2U8dm9pZD4pID0+IHZvaWQ7XG4gIH07XG59XG5cbmNsYXNzIFJlbW90ZUNvbGxlY3Rpb25Ecml2ZXIge1xuICBwcml2YXRlIHJlYWRvbmx5IG1vbmdvOiBNb25nb0Nvbm5lY3Rpb247XG5cbiAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgUkVNT1RFX0NPTExFQ1RJT05fTUVUSE9EUyA9IFtcbiAgICAnY3JlYXRlQ2FwcGVkQ29sbGVjdGlvbkFzeW5jJyxcbiAgICAnZHJvcEluZGV4QXN5bmMnLFxuICAgICdlbnN1cmVJbmRleEFzeW5jJyxcbiAgICAnY3JlYXRlSW5kZXhBc3luYycsXG4gICAgJ2NvdW50RG9jdW1lbnRzJyxcbiAgICAnZHJvcENvbGxlY3Rpb25Bc3luYycsXG4gICAgJ2VzdGltYXRlZERvY3VtZW50Q291bnQnLFxuICAgICdmaW5kJyxcbiAgICAnZmluZE9uZUFzeW5jJyxcbiAgICAnaW5zZXJ0QXN5bmMnLFxuICAgICdyYXdDb2xsZWN0aW9uJyxcbiAgICAncmVtb3ZlQXN5bmMnLFxuICAgICd1cGRhdGVBc3luYycsXG4gICAgJ3Vwc2VydEFzeW5jJyxcbiAgXSBhcyBjb25zdDtcblxuICBjb25zdHJ1Y3Rvcihtb25nb1VybDogc3RyaW5nLCBvcHRpb25zOiBJQ29ubmVjdGlvbk9wdGlvbnMpIHtcbiAgICB0aGlzLm1vbmdvID0gbmV3IE1vbmdvQ29ubmVjdGlvbihtb25nb1VybCwgb3B0aW9ucyk7XG4gIH1cblxuICBwdWJsaWMgb3BlbihuYW1lOiBzdHJpbmcpOiBJQ29sbGVjdGlvbk1ldGhvZHMge1xuICAgIGNvbnN0IHJldDogSUNvbGxlY3Rpb25NZXRob2RzID0ge307XG5cbiAgICAvLyBIYW5kbGUgcmVtb3RlIGNvbGxlY3Rpb24gbWV0aG9kc1xuICAgIFJlbW90ZUNvbGxlY3Rpb25Ecml2ZXIuUkVNT1RFX0NPTExFQ1RJT05fTUVUSE9EUy5mb3JFYWNoKChtZXRob2QpID0+IHtcbiAgICAgIC8vIFR5cGUgYXNzZXJ0aW9uIG5lZWRlZCBiZWNhdXNlIHdlIGtub3cgdGhlc2UgbWV0aG9kcyBleGlzdCBvbiBNb25nb0Nvbm5lY3Rpb25cbiAgICAgIGNvbnN0IG1vbmdvTWV0aG9kID0gdGhpcy5tb25nb1ttZXRob2RdIGFzIE1vbmdvTWV0aG9kRnVuY3Rpb247XG4gICAgICByZXRbbWV0aG9kXSA9IG1vbmdvTWV0aG9kLmJpbmQodGhpcy5tb25nbywgbmFtZSk7XG5cbiAgICAgIGlmICghQVNZTkNfQ09MTEVDVElPTl9NRVRIT0RTLmluY2x1ZGVzKG1ldGhvZCkpIHJldHVybjtcblxuICAgICAgY29uc3QgYXN5bmNNZXRob2ROYW1lID0gZ2V0QXN5bmNNZXRob2ROYW1lKG1ldGhvZCk7XG4gICAgICByZXRbYXN5bmNNZXRob2ROYW1lXSA9ICguLi5hcmdzOiB1bmtub3duW10pID0+IHJldFttZXRob2RdKC4uLmFyZ3MpO1xuICAgIH0pO1xuXG4gICAgLy8gSGFuZGxlIGNsaWVudC1vbmx5IG1ldGhvZHNcbiAgICBDTElFTlRfT05MWV9NRVRIT0RTLmZvckVhY2goKG1ldGhvZCkgPT4ge1xuICAgICAgcmV0W21ldGhvZF0gPSAoLi4uYXJnczogdW5rbm93bltdKTogbmV2ZXIgPT4ge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYCR7bWV0aG9kfSBpcyBub3QgYXZhaWxhYmxlIG9uIHRoZSBzZXJ2ZXIuIFBsZWFzZSB1c2UgJHtnZXRBc3luY01ldGhvZE5hbWUoXG4gICAgICAgICAgICBtZXRob2RcbiAgICAgICAgICApfSgpIGluc3RlYWQuYFxuICAgICAgICApO1xuICAgICAgfTtcbiAgICB9KTtcblxuICAgIHJldHVybiByZXQ7XG4gIH1cbn1cblxuLy8gQXNzaWduIHRoZSBjbGFzcyB0byBNb25nb0ludGVybmFsc1xuTW9uZ29JbnRlcm5hbHMuUmVtb3RlQ29sbGVjdGlvbkRyaXZlciA9IFJlbW90ZUNvbGxlY3Rpb25Ecml2ZXI7XG5cbi8vIENyZWF0ZSB0aGUgc2luZ2xldG9uIFJlbW90ZUNvbGxlY3Rpb25Ecml2ZXIgb25seSBvbiBkZW1hbmRcbk1vbmdvSW50ZXJuYWxzLmRlZmF1bHRSZW1vdGVDb2xsZWN0aW9uRHJpdmVyID0gb25jZSgoKTogUmVtb3RlQ29sbGVjdGlvbkRyaXZlciA9PiB7XG4gIGNvbnN0IGNvbm5lY3Rpb25PcHRpb25zOiBJQ29ubmVjdGlvbk9wdGlvbnMgPSB7fTtcbiAgY29uc3QgbW9uZ29VcmwgPSBwcm9jZXNzLmVudi5NT05HT19VUkw7XG5cbiAgaWYgKCFtb25nb1VybCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIk1PTkdPX1VSTCBtdXN0IGJlIHNldCBpbiBlbnZpcm9ubWVudFwiKTtcbiAgfVxuXG4gIGlmIChwcm9jZXNzLmVudi5NT05HT19PUExPR19VUkwpIHtcbiAgICBjb25uZWN0aW9uT3B0aW9ucy5vcGxvZ1VybCA9IHByb2Nlc3MuZW52Lk1PTkdPX09QTE9HX1VSTDtcbiAgfVxuXG4gIGNvbnN0IGRyaXZlciA9IG5ldyBSZW1vdGVDb2xsZWN0aW9uRHJpdmVyKG1vbmdvVXJsLCBjb25uZWN0aW9uT3B0aW9ucyk7XG5cbiAgLy8gSW5pdGlhbGl6ZSBkYXRhYmFzZSBjb25uZWN0aW9uIG9uIHN0YXJ0dXBcbiAgTWV0ZW9yLnN0YXJ0dXAoYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIGF3YWl0IGRyaXZlci5tb25nby5jbGllbnQuY29ubmVjdCgpO1xuICB9KTtcblxuICByZXR1cm4gZHJpdmVyO1xufSk7XG5cbmV4cG9ydCB7IFJlbW90ZUNvbGxlY3Rpb25Ecml2ZXIsIElDb25uZWN0aW9uT3B0aW9ucywgSUNvbGxlY3Rpb25NZXRob2RzIH07IiwiaW1wb3J0IHsgbm9ybWFsaXplUHJvamVjdGlvbiB9IGZyb20gXCIuLi9tb25nb191dGlsc1wiO1xuaW1wb3J0IHsgQXN5bmNNZXRob2RzIH0gZnJvbSAnLi9tZXRob2RzX2FzeW5jJztcbmltcG9ydCB7IFN5bmNNZXRob2RzIH0gZnJvbSAnLi9tZXRob2RzX3N5bmMnO1xuaW1wb3J0IHsgSW5kZXhNZXRob2RzIH0gZnJvbSAnLi9tZXRob2RzX2luZGV4JztcbmltcG9ydCB7XG4gIElEX0dFTkVSQVRPUlMsIG5vcm1hbGl6ZU9wdGlvbnMsXG4gIHNldHVwQXV0b3B1Ymxpc2gsXG4gIHNldHVwQ29ubmVjdGlvbixcbiAgc2V0dXBEcml2ZXIsXG4gIHNldHVwTXV0YXRpb25NZXRob2RzLFxuICB2YWxpZGF0ZUNvbGxlY3Rpb25OYW1lXG59IGZyb20gJy4vY29sbGVjdGlvbl91dGlscyc7XG5pbXBvcnQgeyBSZXBsaWNhdGlvbk1ldGhvZHMgfSBmcm9tICcuL21ldGhvZHNfcmVwbGljYXRpb24nO1xuXG4vKipcbiAqIEBzdW1tYXJ5IE5hbWVzcGFjZSBmb3IgTW9uZ29EQi1yZWxhdGVkIGl0ZW1zXG4gKiBAbmFtZXNwYWNlXG4gKi9cbk1vbmdvID0ge307XG5cbi8qKlxuICogQHN1bW1hcnkgQ29uc3RydWN0b3IgZm9yIGEgQ29sbGVjdGlvblxuICogQGxvY3VzIEFueXdoZXJlXG4gKiBAaW5zdGFuY2VuYW1lIGNvbGxlY3Rpb25cbiAqIEBjbGFzc1xuICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgVGhlIG5hbWUgb2YgdGhlIGNvbGxlY3Rpb24uICBJZiBudWxsLCBjcmVhdGVzIGFuIHVubWFuYWdlZCAodW5zeW5jaHJvbml6ZWQpIGxvY2FsIGNvbGxlY3Rpb24uXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucy5jb25uZWN0aW9uIFRoZSBzZXJ2ZXIgY29ubmVjdGlvbiB0aGF0IHdpbGwgbWFuYWdlIHRoaXMgY29sbGVjdGlvbi4gVXNlcyB0aGUgZGVmYXVsdCBjb25uZWN0aW9uIGlmIG5vdCBzcGVjaWZpZWQuICBQYXNzIHRoZSByZXR1cm4gdmFsdWUgb2YgY2FsbGluZyBbYEREUC5jb25uZWN0YF0oI0REUC1jb25uZWN0KSB0byBzcGVjaWZ5IGEgZGlmZmVyZW50IHNlcnZlci4gUGFzcyBgbnVsbGAgdG8gc3BlY2lmeSBubyBjb25uZWN0aW9uLiBVbm1hbmFnZWQgKGBuYW1lYCBpcyBudWxsKSBjb2xsZWN0aW9ucyBjYW5ub3Qgc3BlY2lmeSBhIGNvbm5lY3Rpb24uXG4gKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9ucy5pZEdlbmVyYXRpb24gVGhlIG1ldGhvZCBvZiBnZW5lcmF0aW5nIHRoZSBgX2lkYCBmaWVsZHMgb2YgbmV3IGRvY3VtZW50cyBpbiB0aGlzIGNvbGxlY3Rpb24uICBQb3NzaWJsZSB2YWx1ZXM6XG5cbiAtICoqYCdTVFJJTkcnYCoqOiByYW5kb20gc3RyaW5nc1xuIC0gKipgJ01PTkdPJ2AqKjogIHJhbmRvbSBbYE1vbmdvLk9iamVjdElEYF0oI21vbmdvX29iamVjdF9pZCkgdmFsdWVzXG5cblRoZSBkZWZhdWx0IGlkIGdlbmVyYXRpb24gdGVjaG5pcXVlIGlzIGAnU1RSSU5HJ2AuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBvcHRpb25zLnRyYW5zZm9ybSBBbiBvcHRpb25hbCB0cmFuc2Zvcm1hdGlvbiBmdW5jdGlvbi4gRG9jdW1lbnRzIHdpbGwgYmUgcGFzc2VkIHRocm91Z2ggdGhpcyBmdW5jdGlvbiBiZWZvcmUgYmVpbmcgcmV0dXJuZWQgZnJvbSBgZmV0Y2hgIG9yIGBmaW5kT25lQXN5bmNgLCBhbmQgYmVmb3JlIGJlaW5nIHBhc3NlZCB0byBjYWxsYmFja3Mgb2YgYG9ic2VydmVgLCBgbWFwYCwgYGZvckVhY2hgLCBgYWxsb3dgLCBhbmQgYGRlbnlgLiBUcmFuc2Zvcm1zIGFyZSAqbm90KiBhcHBsaWVkIGZvciB0aGUgY2FsbGJhY2tzIG9mIGBvYnNlcnZlQ2hhbmdlc2Agb3IgdG8gY3Vyc29ycyByZXR1cm5lZCBmcm9tIHB1Ymxpc2ggZnVuY3Rpb25zLlxuICogQHBhcmFtIHtCb29sZWFufSBvcHRpb25zLmRlZmluZU11dGF0aW9uTWV0aG9kcyBTZXQgdG8gYGZhbHNlYCB0byBza2lwIHNldHRpbmcgdXAgdGhlIG11dGF0aW9uIG1ldGhvZHMgdGhhdCBlbmFibGUgaW5zZXJ0L3VwZGF0ZS9yZW1vdmUgZnJvbSBjbGllbnQgY29kZS4gRGVmYXVsdCBgdHJ1ZWAuXG4gKi9cbi8vIE1haW4gQ29sbGVjdGlvbiBjb25zdHJ1Y3RvclxuTW9uZ28uQ29sbGVjdGlvbiA9IGZ1bmN0aW9uIENvbGxlY3Rpb24obmFtZSwgb3B0aW9ucykge1xuICBuYW1lID0gdmFsaWRhdGVDb2xsZWN0aW9uTmFtZShuYW1lKTtcblxuICBvcHRpb25zID0gbm9ybWFsaXplT3B0aW9ucyhvcHRpb25zKTtcblxuICB0aGlzLl9tYWtlTmV3SUQgPSBJRF9HRU5FUkFUT1JTW29wdGlvbnMuaWRHZW5lcmF0aW9uXT8uKG5hbWUpO1xuXG4gIHRoaXMuX3RyYW5zZm9ybSA9IExvY2FsQ29sbGVjdGlvbi53cmFwVHJhbnNmb3JtKG9wdGlvbnMudHJhbnNmb3JtKTtcbiAgdGhpcy5yZXNvbHZlclR5cGUgPSBvcHRpb25zLnJlc29sdmVyVHlwZTtcblxuICB0aGlzLl9jb25uZWN0aW9uID0gc2V0dXBDb25uZWN0aW9uKG5hbWUsIG9wdGlvbnMpO1xuXG4gIGNvbnN0IGRyaXZlciA9IHNldHVwRHJpdmVyKG5hbWUsIHRoaXMuX2Nvbm5lY3Rpb24sIG9wdGlvbnMpO1xuICB0aGlzLl9kcml2ZXIgPSBkcml2ZXI7XG5cbiAgdGhpcy5fY29sbGVjdGlvbiA9IGRyaXZlci5vcGVuKG5hbWUsIHRoaXMuX2Nvbm5lY3Rpb24pO1xuICB0aGlzLl9uYW1lID0gbmFtZTtcblxuICB0aGlzLl9zZXR0aW5nVXBSZXBsaWNhdGlvblByb21pc2UgPSB0aGlzLl9tYXliZVNldFVwUmVwbGljYXRpb24obmFtZSwgb3B0aW9ucyk7XG5cbiAgc2V0dXBNdXRhdGlvbk1ldGhvZHModGhpcywgbmFtZSwgb3B0aW9ucyk7XG5cbiAgc2V0dXBBdXRvcHVibGlzaCh0aGlzLCBuYW1lLCBvcHRpb25zKTtcblxuICBNb25nby5fY29sbGVjdGlvbnMuc2V0KG5hbWUsIHRoaXMpO1xufTtcblxuT2JqZWN0LmFzc2lnbihNb25nby5Db2xsZWN0aW9uLnByb3RvdHlwZSwge1xuICBfZ2V0RmluZFNlbGVjdG9yKGFyZ3MpIHtcbiAgICBpZiAoYXJncy5sZW5ndGggPT0gMCkgcmV0dXJuIHt9O1xuICAgIGVsc2UgcmV0dXJuIGFyZ3NbMF07XG4gIH0sXG5cbiAgX2dldEZpbmRPcHRpb25zKGFyZ3MpIHtcbiAgICBjb25zdCBbLCBvcHRpb25zXSA9IGFyZ3MgfHwgW107XG4gICAgY29uc3QgbmV3T3B0aW9ucyA9IG5vcm1hbGl6ZVByb2plY3Rpb24ob3B0aW9ucyk7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKGFyZ3MubGVuZ3RoIDwgMikge1xuICAgICAgcmV0dXJuIHsgdHJhbnNmb3JtOiBzZWxmLl90cmFuc2Zvcm0gfTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2hlY2soXG4gICAgICAgIG5ld09wdGlvbnMsXG4gICAgICAgIE1hdGNoLk9wdGlvbmFsKFxuICAgICAgICAgIE1hdGNoLk9iamVjdEluY2x1ZGluZyh7XG4gICAgICAgICAgICBwcm9qZWN0aW9uOiBNYXRjaC5PcHRpb25hbChNYXRjaC5PbmVPZihPYmplY3QsIHVuZGVmaW5lZCkpLFxuICAgICAgICAgICAgc29ydDogTWF0Y2guT3B0aW9uYWwoXG4gICAgICAgICAgICAgIE1hdGNoLk9uZU9mKE9iamVjdCwgQXJyYXksIEZ1bmN0aW9uLCB1bmRlZmluZWQpXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgbGltaXQ6IE1hdGNoLk9wdGlvbmFsKE1hdGNoLk9uZU9mKE51bWJlciwgdW5kZWZpbmVkKSksXG4gICAgICAgICAgICBza2lwOiBNYXRjaC5PcHRpb25hbChNYXRjaC5PbmVPZihOdW1iZXIsIHVuZGVmaW5lZCkpLFxuICAgICAgICAgIH0pXG4gICAgICAgIClcbiAgICAgICk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRyYW5zZm9ybTogc2VsZi5fdHJhbnNmb3JtLFxuICAgICAgICAuLi5uZXdPcHRpb25zLFxuICAgICAgfTtcbiAgICB9XG4gIH0sXG59KTtcblxuT2JqZWN0LmFzc2lnbihNb25nby5Db2xsZWN0aW9uLCB7XG4gIGFzeW5jIF9wdWJsaXNoQ3Vyc29yKGN1cnNvciwgc3ViLCBjb2xsZWN0aW9uKSB7XG4gICAgdmFyIG9ic2VydmVIYW5kbGUgPSBhd2FpdCBjdXJzb3Iub2JzZXJ2ZUNoYW5nZXMoXG4gICAgICAgIHtcbiAgICAgICAgICBhZGRlZDogZnVuY3Rpb24oaWQsIGZpZWxkcykge1xuICAgICAgICAgICAgc3ViLmFkZGVkKGNvbGxlY3Rpb24sIGlkLCBmaWVsZHMpO1xuICAgICAgICAgIH0sXG4gICAgICAgICAgY2hhbmdlZDogZnVuY3Rpb24oaWQsIGZpZWxkcykge1xuICAgICAgICAgICAgc3ViLmNoYW5nZWQoY29sbGVjdGlvbiwgaWQsIGZpZWxkcyk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICByZW1vdmVkOiBmdW5jdGlvbihpZCkge1xuICAgICAgICAgICAgc3ViLnJlbW92ZWQoY29sbGVjdGlvbiwgaWQpO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIC8vIFB1YmxpY2F0aW9ucyBkb24ndCBtdXRhdGUgdGhlIGRvY3VtZW50c1xuICAgICAgICAvLyBUaGlzIGlzIHRlc3RlZCBieSB0aGUgYGxpdmVkYXRhIC0gcHVibGlzaCBjYWxsYmFja3MgY2xvbmVgIHRlc3RcbiAgICAgICAgeyBub25NdXRhdGluZ0NhbGxiYWNrczogdHJ1ZSB9XG4gICAgKTtcblxuICAgIC8vIFdlIGRvbid0IGNhbGwgc3ViLnJlYWR5KCkgaGVyZTogaXQgZ2V0cyBjYWxsZWQgaW4gbGl2ZWRhdGFfc2VydmVyLCBhZnRlclxuICAgIC8vIHBvc3NpYmx5IGNhbGxpbmcgX3B1Ymxpc2hDdXJzb3Igb24gbXVsdGlwbGUgcmV0dXJuZWQgY3Vyc29ycy5cblxuICAgIC8vIHJlZ2lzdGVyIHN0b3AgY2FsbGJhY2sgKGV4cGVjdHMgbGFtYmRhIHcvIG5vIGFyZ3MpLlxuICAgIHN1Yi5vblN0b3AoYXN5bmMgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gYXdhaXQgb2JzZXJ2ZUhhbmRsZS5zdG9wKCk7XG4gICAgfSk7XG5cbiAgICAvLyByZXR1cm4gdGhlIG9ic2VydmVIYW5kbGUgaW4gY2FzZSBpdCBuZWVkcyB0byBiZSBzdG9wcGVkIGVhcmx5XG4gICAgcmV0dXJuIG9ic2VydmVIYW5kbGU7XG4gIH0sXG5cbiAgLy8gcHJvdGVjdCBhZ2FpbnN0IGRhbmdlcm91cyBzZWxlY3RvcnMuICBmYWxzZXkgYW5kIHtfaWQ6IGZhbHNleX0gYXJlIGJvdGhcbiAgLy8gbGlrZWx5IHByb2dyYW1tZXIgZXJyb3IsIGFuZCBub3Qgd2hhdCB5b3Ugd2FudCwgcGFydGljdWxhcmx5IGZvciBkZXN0cnVjdGl2ZVxuICAvLyBvcGVyYXRpb25zLiBJZiBhIGZhbHNleSBfaWQgaXMgc2VudCBpbiwgYSBuZXcgc3RyaW5nIF9pZCB3aWxsIGJlXG4gIC8vIGdlbmVyYXRlZCBhbmQgcmV0dXJuZWQ7IGlmIGEgZmFsbGJhY2tJZCBpcyBwcm92aWRlZCwgaXQgd2lsbCBiZSByZXR1cm5lZFxuICAvLyBpbnN0ZWFkLlxuICBfcmV3cml0ZVNlbGVjdG9yKHNlbGVjdG9yLCB7IGZhbGxiYWNrSWQgfSA9IHt9KSB7XG4gICAgLy8gc2hvcnRoYW5kIC0tIHNjYWxhcnMgbWF0Y2ggX2lkXG4gICAgaWYgKExvY2FsQ29sbGVjdGlvbi5fc2VsZWN0b3JJc0lkKHNlbGVjdG9yKSkgc2VsZWN0b3IgPSB7IF9pZDogc2VsZWN0b3IgfTtcblxuICAgIGlmIChBcnJheS5pc0FycmF5KHNlbGVjdG9yKSkge1xuICAgICAgLy8gVGhpcyBpcyBjb25zaXN0ZW50IHdpdGggdGhlIE1vbmdvIGNvbnNvbGUgaXRzZWxmOyBpZiB3ZSBkb24ndCBkbyB0aGlzXG4gICAgICAvLyBjaGVjayBwYXNzaW5nIGFuIGVtcHR5IGFycmF5IGVuZHMgdXAgc2VsZWN0aW5nIGFsbCBpdGVtc1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTW9uZ28gc2VsZWN0b3IgY2FuJ3QgYmUgYW4gYXJyYXkuXCIpO1xuICAgIH1cblxuICAgIGlmICghc2VsZWN0b3IgfHwgKCdfaWQnIGluIHNlbGVjdG9yICYmICFzZWxlY3Rvci5faWQpKSB7XG4gICAgICAvLyBjYW4ndCBtYXRjaCBhbnl0aGluZ1xuICAgICAgcmV0dXJuIHsgX2lkOiBmYWxsYmFja0lkIHx8IFJhbmRvbS5pZCgpIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlbGVjdG9yO1xuICB9LFxufSk7XG5cbk9iamVjdC5hc3NpZ24oTW9uZ28uQ29sbGVjdGlvbi5wcm90b3R5cGUsIFJlcGxpY2F0aW9uTWV0aG9kcywgU3luY01ldGhvZHMsIEFzeW5jTWV0aG9kcywgSW5kZXhNZXRob2RzKTtcblxuT2JqZWN0LmFzc2lnbihNb25nby5Db2xsZWN0aW9uLnByb3RvdHlwZSwge1xuICAvLyBEZXRlcm1pbmUgaWYgdGhpcyBjb2xsZWN0aW9uIGlzIHNpbXBseSBhIG1pbmltb25nbyByZXByZXNlbnRhdGlvbiBvZiBhIHJlYWxcbiAgLy8gZGF0YWJhc2Ugb24gYW5vdGhlciBzZXJ2ZXJcbiAgX2lzUmVtb3RlQ29sbGVjdGlvbigpIHtcbiAgICAvLyBYWFggc2VlICNNZXRlb3JTZXJ2ZXJOdWxsXG4gICAgcmV0dXJuIHRoaXMuX2Nvbm5lY3Rpb24gJiYgdGhpcy5fY29ubmVjdGlvbiAhPT0gTWV0ZW9yLnNlcnZlcjtcbiAgfSxcblxuICBhc3luYyBkcm9wQ29sbGVjdGlvbkFzeW5jKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoIXNlbGYuX2NvbGxlY3Rpb24uZHJvcENvbGxlY3Rpb25Bc3luYylcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2FuIG9ubHkgY2FsbCBkcm9wQ29sbGVjdGlvbkFzeW5jIG9uIHNlcnZlciBjb2xsZWN0aW9ucycpO1xuICAgYXdhaXQgc2VsZi5fY29sbGVjdGlvbi5kcm9wQ29sbGVjdGlvbkFzeW5jKCk7XG4gIH0sXG5cbiAgYXN5bmMgY3JlYXRlQ2FwcGVkQ29sbGVjdGlvbkFzeW5jKGJ5dGVTaXplLCBtYXhEb2N1bWVudHMpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKCEgYXdhaXQgc2VsZi5fY29sbGVjdGlvbi5jcmVhdGVDYXBwZWRDb2xsZWN0aW9uQXN5bmMpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdDYW4gb25seSBjYWxsIGNyZWF0ZUNhcHBlZENvbGxlY3Rpb25Bc3luYyBvbiBzZXJ2ZXIgY29sbGVjdGlvbnMnXG4gICAgICApO1xuICAgIGF3YWl0IHNlbGYuX2NvbGxlY3Rpb24uY3JlYXRlQ2FwcGVkQ29sbGVjdGlvbkFzeW5jKGJ5dGVTaXplLCBtYXhEb2N1bWVudHMpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBSZXR1cm5zIHRoZSBbYENvbGxlY3Rpb25gXShodHRwOi8vbW9uZ29kYi5naXRodWIuaW8vbm9kZS1tb25nb2RiLW5hdGl2ZS8zLjAvYXBpL0NvbGxlY3Rpb24uaHRtbCkgb2JqZWN0IGNvcnJlc3BvbmRpbmcgdG8gdGhpcyBjb2xsZWN0aW9uIGZyb20gdGhlIFtucG0gYG1vbmdvZGJgIGRyaXZlciBtb2R1bGVdKGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21vbmdvZGIpIHdoaWNoIGlzIHdyYXBwZWQgYnkgYE1vbmdvLkNvbGxlY3Rpb25gLlxuICAgKiBAbG9jdXMgU2VydmVyXG4gICAqIEBtZW1iZXJvZiBNb25nby5Db2xsZWN0aW9uXG4gICAqIEBpbnN0YW5jZVxuICAgKi9cbiAgcmF3Q29sbGVjdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKCFzZWxmLl9jb2xsZWN0aW9uLnJhd0NvbGxlY3Rpb24pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2FuIG9ubHkgY2FsbCByYXdDb2xsZWN0aW9uIG9uIHNlcnZlciBjb2xsZWN0aW9ucycpO1xuICAgIH1cbiAgICByZXR1cm4gc2VsZi5fY29sbGVjdGlvbi5yYXdDb2xsZWN0aW9uKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IFJldHVybnMgdGhlIFtgRGJgXShodHRwOi8vbW9uZ29kYi5naXRodWIuaW8vbm9kZS1tb25nb2RiLW5hdGl2ZS8zLjAvYXBpL0RiLmh0bWwpIG9iamVjdCBjb3JyZXNwb25kaW5nIHRvIHRoaXMgY29sbGVjdGlvbidzIGRhdGFiYXNlIGNvbm5lY3Rpb24gZnJvbSB0aGUgW25wbSBgbW9uZ29kYmAgZHJpdmVyIG1vZHVsZV0oaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbW9uZ29kYikgd2hpY2ggaXMgd3JhcHBlZCBieSBgTW9uZ28uQ29sbGVjdGlvbmAuXG4gICAqIEBsb2N1cyBTZXJ2ZXJcbiAgICogQG1lbWJlcm9mIE1vbmdvLkNvbGxlY3Rpb25cbiAgICogQGluc3RhbmNlXG4gICAqL1xuICByYXdEYXRhYmFzZSgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKCEoc2VsZi5fZHJpdmVyLm1vbmdvICYmIHNlbGYuX2RyaXZlci5tb25nby5kYikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2FuIG9ubHkgY2FsbCByYXdEYXRhYmFzZSBvbiBzZXJ2ZXIgY29sbGVjdGlvbnMnKTtcbiAgICB9XG4gICAgcmV0dXJuIHNlbGYuX2RyaXZlci5tb25nby5kYjtcbiAgfSxcbn0pO1xuXG5PYmplY3QuYXNzaWduKE1vbmdvLCB7XG4gIC8qKlxuICAgKiBAc3VtbWFyeSBSZXRyaWV2ZSBhIE1ldGVvciBjb2xsZWN0aW9uIGluc3RhbmNlIGJ5IG5hbWUuIE9ubHkgY29sbGVjdGlvbnMgZGVmaW5lZCB3aXRoIFtgbmV3IE1vbmdvLkNvbGxlY3Rpb24oLi4uKWBdKCNjb2xsZWN0aW9ucykgYXJlIGF2YWlsYWJsZSB3aXRoIHRoaXMgbWV0aG9kLiBGb3IgcGxhaW4gTW9uZ29EQiBjb2xsZWN0aW9ucywgeW91J2xsIHdhbnQgdG8gbG9vayBhdCBbYHJhd0RhdGFiYXNlKClgXSgjTW9uZ28tQ29sbGVjdGlvbi1yYXdEYXRhYmFzZSkuXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWVtYmVyb2YgTW9uZ29cbiAgICogQHN0YXRpY1xuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBOYW1lIG9mIHlvdXIgY29sbGVjdGlvbiBhcyBpdCB3YXMgZGVmaW5lZCB3aXRoIGBuZXcgTW9uZ28uQ29sbGVjdGlvbigpYC5cbiAgICogQHJldHVybnMge01vbmdvLkNvbGxlY3Rpb24gfCB1bmRlZmluZWR9XG4gICAqL1xuICBnZXRDb2xsZWN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5fY29sbGVjdGlvbnMuZ2V0KG5hbWUpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBBIHJlY29yZCBvZiBhbGwgZGVmaW5lZCBNb25nby5Db2xsZWN0aW9uIGluc3RhbmNlcywgaW5kZXhlZCBieSBjb2xsZWN0aW9uIG5hbWUuXG4gICAqIEB0eXBlIHtNYXA8c3RyaW5nLCBNb25nby5Db2xsZWN0aW9uPn1cbiAgICogQG1lbWJlcm9mIE1vbmdvXG4gICAqIEBwcm90ZWN0ZWRcbiAgICovXG4gIF9jb2xsZWN0aW9uczogbmV3IE1hcCgpLFxufSlcblxuXG5cbi8qKlxuICogQHN1bW1hcnkgQ3JlYXRlIGEgTW9uZ28tc3R5bGUgYE9iamVjdElEYC4gIElmIHlvdSBkb24ndCBzcGVjaWZ5IGEgYGhleFN0cmluZ2AsIHRoZSBgT2JqZWN0SURgIHdpbGwgYmUgZ2VuZXJhdGVkIHJhbmRvbWx5IChub3QgdXNpbmcgTW9uZ29EQidzIElEIGNvbnN0cnVjdGlvbiBydWxlcykuXG4gKiBAbG9jdXMgQW55d2hlcmVcbiAqIEBjbGFzc1xuICogQHBhcmFtIHtTdHJpbmd9IFtoZXhTdHJpbmddIE9wdGlvbmFsLiAgVGhlIDI0LWNoYXJhY3RlciBoZXhhZGVjaW1hbCBjb250ZW50cyBvZiB0aGUgT2JqZWN0SUQgdG8gY3JlYXRlXG4gKi9cbk1vbmdvLk9iamVjdElEID0gTW9uZ29JRC5PYmplY3RJRDtcblxuLyoqXG4gKiBAc3VtbWFyeSBUbyBjcmVhdGUgYSBjdXJzb3IsIHVzZSBmaW5kLiBUbyBhY2Nlc3MgdGhlIGRvY3VtZW50cyBpbiBhIGN1cnNvciwgdXNlIGZvckVhY2gsIG1hcCwgb3IgZmV0Y2guXG4gKiBAY2xhc3NcbiAqIEBpbnN0YW5jZU5hbWUgY3Vyc29yXG4gKi9cbk1vbmdvLkN1cnNvciA9IExvY2FsQ29sbGVjdGlvbi5DdXJzb3I7XG5cbi8qKlxuICogQGRlcHJlY2F0ZWQgaW4gMC45LjFcbiAqL1xuTW9uZ28uQ29sbGVjdGlvbi5DdXJzb3IgPSBNb25nby5DdXJzb3I7XG5cbi8qKlxuICogQGRlcHJlY2F0ZWQgaW4gMC45LjFcbiAqL1xuTW9uZ28uQ29sbGVjdGlvbi5PYmplY3RJRCA9IE1vbmdvLk9iamVjdElEO1xuXG4vKipcbiAqIEBkZXByZWNhdGVkIGluIDAuOS4xXG4gKi9cbk1ldGVvci5Db2xsZWN0aW9uID0gTW9uZ28uQ29sbGVjdGlvbjtcblxuLy8gQWxsb3cgZGVueSBzdHVmZiBpcyBub3cgaW4gdGhlIGFsbG93LWRlbnkgcGFja2FnZVxuT2JqZWN0LmFzc2lnbihNb25nby5Db2xsZWN0aW9uLnByb3RvdHlwZSwgQWxsb3dEZW55LkNvbGxlY3Rpb25Qcm90b3R5cGUpO1xuXG4iLCJleHBvcnQgY29uc3QgSURfR0VORVJBVE9SUyA9IHtcbiAgTU9OR08obmFtZSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IHNyYyA9IG5hbWUgPyBERFAucmFuZG9tU3RyZWFtKCcvY29sbGVjdGlvbi8nICsgbmFtZSkgOiBSYW5kb20uaW5zZWN1cmU7XG4gICAgICByZXR1cm4gbmV3IE1vbmdvLk9iamVjdElEKHNyYy5oZXhTdHJpbmcoMjQpKTtcbiAgICB9XG4gIH0sXG4gIFNUUklORyhuYW1lKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3Qgc3JjID0gbmFtZSA/IEREUC5yYW5kb21TdHJlYW0oJy9jb2xsZWN0aW9uLycgKyBuYW1lKSA6IFJhbmRvbS5pbnNlY3VyZTtcbiAgICAgIHJldHVybiBzcmMuaWQoKTtcbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cENvbm5lY3Rpb24obmFtZSwgb3B0aW9ucykge1xuICBpZiAoIW5hbWUgfHwgb3B0aW9ucy5jb25uZWN0aW9uID09PSBudWxsKSByZXR1cm4gbnVsbDtcbiAgaWYgKG9wdGlvbnMuY29ubmVjdGlvbikgcmV0dXJuIG9wdGlvbnMuY29ubmVjdGlvbjtcbiAgcmV0dXJuIE1ldGVvci5pc0NsaWVudCA/IE1ldGVvci5jb25uZWN0aW9uIDogTWV0ZW9yLnNlcnZlcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldHVwRHJpdmVyKG5hbWUsIGNvbm5lY3Rpb24sIG9wdGlvbnMpIHtcbiAgaWYgKG9wdGlvbnMuX2RyaXZlcikgcmV0dXJuIG9wdGlvbnMuX2RyaXZlcjtcblxuICBpZiAobmFtZSAmJlxuICAgIGNvbm5lY3Rpb24gPT09IE1ldGVvci5zZXJ2ZXIgJiZcbiAgICB0eXBlb2YgTW9uZ29JbnRlcm5hbHMgIT09ICd1bmRlZmluZWQnICYmXG4gICAgTW9uZ29JbnRlcm5hbHMuZGVmYXVsdFJlbW90ZUNvbGxlY3Rpb25Ecml2ZXIpIHtcbiAgICByZXR1cm4gTW9uZ29JbnRlcm5hbHMuZGVmYXVsdFJlbW90ZUNvbGxlY3Rpb25Ecml2ZXIoKTtcbiAgfVxuXG4gIGNvbnN0IHsgTG9jYWxDb2xsZWN0aW9uRHJpdmVyIH0gPSByZXF1aXJlKCcuLi9sb2NhbF9jb2xsZWN0aW9uX2RyaXZlci5qcycpO1xuICByZXR1cm4gTG9jYWxDb2xsZWN0aW9uRHJpdmVyO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0dXBBdXRvcHVibGlzaChjb2xsZWN0aW9uLCBuYW1lLCBvcHRpb25zKSB7XG4gIGlmIChQYWNrYWdlLmF1dG9wdWJsaXNoICYmXG4gICAgIW9wdGlvbnMuX3ByZXZlbnRBdXRvcHVibGlzaCAmJlxuICAgIGNvbGxlY3Rpb24uX2Nvbm5lY3Rpb24gJiZcbiAgICBjb2xsZWN0aW9uLl9jb25uZWN0aW9uLnB1Ymxpc2gpIHtcbiAgICBjb2xsZWN0aW9uLl9jb25uZWN0aW9uLnB1Ymxpc2gobnVsbCwgKCkgPT4gY29sbGVjdGlvbi5maW5kKCksIHtcbiAgICAgIGlzX2F1dG86IHRydWVcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0dXBNdXRhdGlvbk1ldGhvZHMoY29sbGVjdGlvbiwgbmFtZSwgb3B0aW9ucykge1xuICBpZiAob3B0aW9ucy5kZWZpbmVNdXRhdGlvbk1ldGhvZHMgPT09IGZhbHNlKSByZXR1cm47XG5cbiAgdHJ5IHtcbiAgICBjb2xsZWN0aW9uLl9kZWZpbmVNdXRhdGlvbk1ldGhvZHMoe1xuICAgICAgdXNlRXhpc3Rpbmc6IG9wdGlvbnMuX3N1cHByZXNzU2FtZU5hbWVFcnJvciA9PT0gdHJ1ZVxuICAgIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGlmIChlcnJvci5tZXNzYWdlID09PSBgQSBtZXRob2QgbmFtZWQgJy8ke25hbWV9L2luc2VydEFzeW5jJyBpcyBhbHJlYWR5IGRlZmluZWRgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFRoZXJlIGlzIGFscmVhZHkgYSBjb2xsZWN0aW9uIG5hbWVkIFwiJHtuYW1lfVwiYCk7XG4gICAgfVxuICAgIHRocm93IGVycm9yO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUNvbGxlY3Rpb25OYW1lKG5hbWUpIHtcbiAgaWYgKCFuYW1lICYmIG5hbWUgIT09IG51bGwpIHtcbiAgICBNZXRlb3IuX2RlYnVnKFxuICAgICAgJ1dhcm5pbmc6IGNyZWF0aW5nIGFub255bW91cyBjb2xsZWN0aW9uLiBJdCB3aWxsIG5vdCBiZSAnICtcbiAgICAgICdzYXZlZCBvciBzeW5jaHJvbml6ZWQgb3ZlciB0aGUgbmV0d29yay4gKFBhc3MgbnVsbCBmb3IgJyArXG4gICAgICAndGhlIGNvbGxlY3Rpb24gbmFtZSB0byB0dXJuIG9mZiB0aGlzIHdhcm5pbmcuKSdcbiAgICApO1xuICAgIG5hbWUgPSBudWxsO1xuICB9XG5cbiAgaWYgKG5hbWUgIT09IG51bGwgJiYgdHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJ0ZpcnN0IGFyZ3VtZW50IHRvIG5ldyBNb25nby5Db2xsZWN0aW9uIG11c3QgYmUgYSBzdHJpbmcgb3IgbnVsbCdcbiAgICApO1xuICB9XG5cbiAgcmV0dXJuIG5hbWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVPcHRpb25zKG9wdGlvbnMpIHtcbiAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5tZXRob2RzKSB7XG4gICAgLy8gQmFja3dhcmRzIGNvbXBhdGliaWxpdHkgaGFjayB3aXRoIG9yaWdpbmFsIHNpZ25hdHVyZVxuICAgIG9wdGlvbnMgPSB7IGNvbm5lY3Rpb246IG9wdGlvbnMgfTtcbiAgfVxuICAvLyBCYWNrd2FyZHMgY29tcGF0aWJpbGl0eTogXCJjb25uZWN0aW9uXCIgdXNlZCB0byBiZSBjYWxsZWQgXCJtYW5hZ2VyXCIuXG4gIGlmIChvcHRpb25zICYmIG9wdGlvbnMubWFuYWdlciAmJiAhb3B0aW9ucy5jb25uZWN0aW9uKSB7XG4gICAgb3B0aW9ucy5jb25uZWN0aW9uID0gb3B0aW9ucy5tYW5hZ2VyO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBjb25uZWN0aW9uOiB1bmRlZmluZWQsXG4gICAgaWRHZW5lcmF0aW9uOiAnU1RSSU5HJyxcbiAgICB0cmFuc2Zvcm06IG51bGwsXG4gICAgX2RyaXZlcjogdW5kZWZpbmVkLFxuICAgIF9wcmV2ZW50QXV0b3B1Ymxpc2g6IGZhbHNlLFxuICAgIC4uLm9wdGlvbnMsXG4gIH07XG59XG4iLCJleHBvcnQgY29uc3QgQXN5bmNNZXRob2RzID0ge1xuICAvKipcbiAgICogQHN1bW1hcnkgRmluZHMgdGhlIGZpcnN0IGRvY3VtZW50IHRoYXQgbWF0Y2hlcyB0aGUgc2VsZWN0b3IsIGFzIG9yZGVyZWQgYnkgc29ydCBhbmQgc2tpcCBvcHRpb25zLiBSZXR1cm5zIGB1bmRlZmluZWRgIGlmIG5vIG1hdGNoaW5nIGRvY3VtZW50IGlzIGZvdW5kLlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1ldGhvZCBmaW5kT25lQXN5bmNcbiAgICogQG1lbWJlcm9mIE1vbmdvLkNvbGxlY3Rpb25cbiAgICogQGluc3RhbmNlXG4gICAqIEBwYXJhbSB7TW9uZ29TZWxlY3Rvcn0gW3NlbGVjdG9yXSBBIHF1ZXJ5IGRlc2NyaWJpbmcgdGhlIGRvY3VtZW50cyB0byBmaW5kXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAgICogQHBhcmFtIHtNb25nb1NvcnRTcGVjaWZpZXJ9IG9wdGlvbnMuc29ydCBTb3J0IG9yZGVyIChkZWZhdWx0OiBuYXR1cmFsIG9yZGVyKVxuICAgKiBAcGFyYW0ge051bWJlcn0gb3B0aW9ucy5za2lwIE51bWJlciBvZiByZXN1bHRzIHRvIHNraXAgYXQgdGhlIGJlZ2lubmluZ1xuICAgKiBAcGFyYW0ge01vbmdvRmllbGRTcGVjaWZpZXJ9IG9wdGlvbnMuZmllbGRzIERpY3Rpb25hcnkgb2YgZmllbGRzIHRvIHJldHVybiBvciBleGNsdWRlLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMucmVhY3RpdmUgKENsaWVudCBvbmx5KSBEZWZhdWx0IHRydWU7IHBhc3MgZmFsc2UgdG8gZGlzYWJsZSByZWFjdGl2aXR5XG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IG9wdGlvbnMudHJhbnNmb3JtIE92ZXJyaWRlcyBgdHJhbnNmb3JtYCBvbiB0aGUgW2BDb2xsZWN0aW9uYF0oI2NvbGxlY3Rpb25zKSBmb3IgdGhpcyBjdXJzb3IuICBQYXNzIGBudWxsYCB0byBkaXNhYmxlIHRyYW5zZm9ybWF0aW9uLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9ucy5yZWFkUHJlZmVyZW5jZSAoU2VydmVyIG9ubHkpIFNwZWNpZmllcyBhIGN1c3RvbSBNb25nb0RCIFtgcmVhZFByZWZlcmVuY2VgXShodHRwczovL2RvY3MubW9uZ29kYi5jb20vbWFudWFsL2NvcmUvcmVhZC1wcmVmZXJlbmNlKSBmb3IgZmV0Y2hpbmcgdGhlIGRvY3VtZW50LiBQb3NzaWJsZSB2YWx1ZXMgYXJlIGBwcmltYXJ5YCwgYHByaW1hcnlQcmVmZXJyZWRgLCBgc2Vjb25kYXJ5YCwgYHNlY29uZGFyeVByZWZlcnJlZGAgYW5kIGBuZWFyZXN0YC5cbiAgICogQHJldHVybnMge09iamVjdH1cbiAgICovXG4gIGZpbmRPbmVBc3luYyguLi5hcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbGxlY3Rpb24uZmluZE9uZUFzeW5jKFxuICAgICAgdGhpcy5fZ2V0RmluZFNlbGVjdG9yKGFyZ3MpLFxuICAgICAgdGhpcy5fZ2V0RmluZE9wdGlvbnMoYXJncylcbiAgICApO1xuICB9LFxuXG4gIF9pbnNlcnRBc3luYyhkb2MsIG9wdGlvbnMgPSB7fSkge1xuICAgIC8vIE1ha2Ugc3VyZSB3ZSB3ZXJlIHBhc3NlZCBhIGRvY3VtZW50IHRvIGluc2VydFxuICAgIGlmICghZG9jKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2luc2VydCByZXF1aXJlcyBhbiBhcmd1bWVudCcpO1xuICAgIH1cblxuICAgIC8vIE1ha2UgYSBzaGFsbG93IGNsb25lIG9mIHRoZSBkb2N1bWVudCwgcHJlc2VydmluZyBpdHMgcHJvdG90eXBlLlxuICAgIGRvYyA9IE9iamVjdC5jcmVhdGUoXG4gICAgICBPYmplY3QuZ2V0UHJvdG90eXBlT2YoZG9jKSxcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKGRvYylcbiAgICApO1xuXG4gICAgaWYgKCdfaWQnIGluIGRvYykge1xuICAgICAgaWYgKFxuICAgICAgICAhZG9jLl9pZCB8fFxuICAgICAgICAhKHR5cGVvZiBkb2MuX2lkID09PSAnc3RyaW5nJyB8fCBkb2MuX2lkIGluc3RhbmNlb2YgTW9uZ28uT2JqZWN0SUQpXG4gICAgICApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICdNZXRlb3IgcmVxdWlyZXMgZG9jdW1lbnQgX2lkIGZpZWxkcyB0byBiZSBub24tZW1wdHkgc3RyaW5ncyBvciBPYmplY3RJRHMnXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBnZW5lcmF0ZUlkID0gdHJ1ZTtcblxuICAgICAgLy8gRG9uJ3QgZ2VuZXJhdGUgdGhlIGlkIGlmIHdlJ3JlIHRoZSBjbGllbnQgYW5kIHRoZSAnb3V0ZXJtb3N0JyBjYWxsXG4gICAgICAvLyBUaGlzIG9wdGltaXphdGlvbiBzYXZlcyB1cyBwYXNzaW5nIGJvdGggdGhlIHJhbmRvbVNlZWQgYW5kIHRoZSBpZFxuICAgICAgLy8gUGFzc2luZyBib3RoIGlzIHJlZHVuZGFudC5cbiAgICAgIGlmICh0aGlzLl9pc1JlbW90ZUNvbGxlY3Rpb24oKSkge1xuICAgICAgICBjb25zdCBlbmNsb3NpbmcgPSBERFAuX0N1cnJlbnRNZXRob2RJbnZvY2F0aW9uLmdldCgpO1xuICAgICAgICBpZiAoIWVuY2xvc2luZykge1xuICAgICAgICAgIGdlbmVyYXRlSWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZ2VuZXJhdGVJZCkge1xuICAgICAgICBkb2MuX2lkID0gdGhpcy5fbWFrZU5ld0lEKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gT24gaW5zZXJ0cywgYWx3YXlzIHJldHVybiB0aGUgaWQgdGhhdCB3ZSBnZW5lcmF0ZWQ7IG9uIGFsbCBvdGhlclxuICAgIC8vIG9wZXJhdGlvbnMsIGp1c3QgcmV0dXJuIHRoZSByZXN1bHQgZnJvbSB0aGUgY29sbGVjdGlvbi5cbiAgICB2YXIgY2hvb3NlUmV0dXJuVmFsdWVGcm9tQ29sbGVjdGlvblJlc3VsdCA9IGZ1bmN0aW9uKHJlc3VsdCkge1xuICAgICAgaWYgKE1ldGVvci5faXNQcm9taXNlKHJlc3VsdCkpIHJldHVybiByZXN1bHQ7XG5cbiAgICAgIGlmIChkb2MuX2lkKSB7XG4gICAgICAgIHJldHVybiBkb2MuX2lkO1xuICAgICAgfVxuXG4gICAgICAvLyBYWFggd2hhdCBpcyB0aGlzIGZvcj8/XG4gICAgICAvLyBJdCdzIHNvbWUgaXRlcmFjdGlvbiBiZXR3ZWVuIHRoZSBjYWxsYmFjayB0byBfY2FsbE11dGF0b3JNZXRob2QgYW5kXG4gICAgICAvLyB0aGUgcmV0dXJuIHZhbHVlIGNvbnZlcnNpb25cbiAgICAgIGRvYy5faWQgPSByZXN1bHQ7XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuICAgIGlmICh0aGlzLl9pc1JlbW90ZUNvbGxlY3Rpb24oKSkge1xuICAgICAgY29uc3QgcHJvbWlzZSA9IHRoaXMuX2NhbGxNdXRhdG9yTWV0aG9kQXN5bmMoJ2luc2VydEFzeW5jJywgW2RvY10sIG9wdGlvbnMpO1xuICAgICAgcHJvbWlzZS50aGVuKGNob29zZVJldHVyblZhbHVlRnJvbUNvbGxlY3Rpb25SZXN1bHQpO1xuICAgICAgcHJvbWlzZS5zdHViUHJvbWlzZSA9IHByb21pc2Uuc3R1YlByb21pc2UudGhlbihjaG9vc2VSZXR1cm5WYWx1ZUZyb21Db2xsZWN0aW9uUmVzdWx0KTtcbiAgICAgIHByb21pc2Uuc2VydmVyUHJvbWlzZSA9IHByb21pc2Uuc2VydmVyUHJvbWlzZS50aGVuKGNob29zZVJldHVyblZhbHVlRnJvbUNvbGxlY3Rpb25SZXN1bHQpO1xuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuXG4gICAgLy8gaXQncyBteSBjb2xsZWN0aW9uLiAgZGVzY2VuZCBpbnRvIHRoZSBjb2xsZWN0aW9uIG9iamVjdFxuICAgIC8vIGFuZCBwcm9wYWdhdGUgYW55IGV4Y2VwdGlvbi5cbiAgICByZXR1cm4gdGhpcy5fY29sbGVjdGlvbi5pbnNlcnRBc3luYyhkb2MpXG4gICAgICAudGhlbihjaG9vc2VSZXR1cm5WYWx1ZUZyb21Db2xsZWN0aW9uUmVzdWx0KTtcbiAgfSxcblxuICAvKipcbiAgICogQHN1bW1hcnkgSW5zZXJ0IGEgZG9jdW1lbnQgaW4gdGhlIGNvbGxlY3Rpb24uICBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHdpbGwgcmV0dXJuIHRoZSBkb2N1bWVudCdzIHVuaXF1ZSBfaWQgd2hlbiBzb2x2ZWQuXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWV0aG9kICBpbnNlcnRcbiAgICogQG1lbWJlcm9mIE1vbmdvLkNvbGxlY3Rpb25cbiAgICogQGluc3RhbmNlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBkb2MgVGhlIGRvY3VtZW50IHRvIGluc2VydC4gTWF5IG5vdCB5ZXQgaGF2ZSBhbiBfaWQgYXR0cmlidXRlLCBpbiB3aGljaCBjYXNlIE1ldGVvciB3aWxsIGdlbmVyYXRlIG9uZSBmb3IgeW91LlxuICAgKi9cbiAgaW5zZXJ0QXN5bmMoZG9jLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMuX2luc2VydEFzeW5jKGRvYywgb3B0aW9ucyk7XG4gIH0sXG5cblxuICAvKipcbiAgICogQHN1bW1hcnkgTW9kaWZ5IG9uZSBvciBtb3JlIGRvY3VtZW50cyBpbiB0aGUgY29sbGVjdGlvbi4gUmV0dXJucyB0aGUgbnVtYmVyIG9mIG1hdGNoZWQgZG9jdW1lbnRzLlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1ldGhvZCB1cGRhdGVcbiAgICogQG1lbWJlcm9mIE1vbmdvLkNvbGxlY3Rpb25cbiAgICogQGluc3RhbmNlXG4gICAqIEBwYXJhbSB7TW9uZ29TZWxlY3Rvcn0gc2VsZWN0b3IgU3BlY2lmaWVzIHdoaWNoIGRvY3VtZW50cyB0byBtb2RpZnlcbiAgICogQHBhcmFtIHtNb25nb01vZGlmaWVyfSBtb2RpZmllciBTcGVjaWZpZXMgaG93IHRvIG1vZGlmeSB0aGUgZG9jdW1lbnRzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAgICogQHBhcmFtIHtCb29sZWFufSBvcHRpb25zLm11bHRpIFRydWUgdG8gbW9kaWZ5IGFsbCBtYXRjaGluZyBkb2N1bWVudHM7IGZhbHNlIHRvIG9ubHkgbW9kaWZ5IG9uZSBvZiB0aGUgbWF0Y2hpbmcgZG9jdW1lbnRzICh0aGUgZGVmYXVsdCkuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy51cHNlcnQgVHJ1ZSB0byBpbnNlcnQgYSBkb2N1bWVudCBpZiBubyBtYXRjaGluZyBkb2N1bWVudHMgYXJlIGZvdW5kLlxuICAgKiBAcGFyYW0ge0FycmF5fSBvcHRpb25zLmFycmF5RmlsdGVycyBPcHRpb25hbC4gVXNlZCBpbiBjb21iaW5hdGlvbiB3aXRoIE1vbmdvREIgW2ZpbHRlcmVkIHBvc2l0aW9uYWwgb3BlcmF0b3JdKGh0dHBzOi8vZG9jcy5tb25nb2RiLmNvbS9tYW51YWwvcmVmZXJlbmNlL29wZXJhdG9yL3VwZGF0ZS9wb3NpdGlvbmFsLWZpbHRlcmVkLykgdG8gc3BlY2lmeSB3aGljaCBlbGVtZW50cyB0byBtb2RpZnkgaW4gYW4gYXJyYXkgZmllbGQuXG4gICAqL1xuICB1cGRhdGVBc3luYyhzZWxlY3RvciwgbW9kaWZpZXIsIC4uLm9wdGlvbnNBbmRDYWxsYmFjaykge1xuXG4gICAgLy8gV2UndmUgYWxyZWFkeSBwb3BwZWQgb2ZmIHRoZSBjYWxsYmFjaywgc28gd2UgYXJlIGxlZnQgd2l0aCBhbiBhcnJheVxuICAgIC8vIG9mIG9uZSBvciB6ZXJvIGl0ZW1zXG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgLi4uKG9wdGlvbnNBbmRDYWxsYmFja1swXSB8fCBudWxsKSB9O1xuICAgIGxldCBpbnNlcnRlZElkO1xuICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMudXBzZXJ0KSB7XG4gICAgICAvLyBzZXQgYGluc2VydGVkSWRgIGlmIGFic2VudC4gIGBpbnNlcnRlZElkYCBpcyBhIE1ldGVvciBleHRlbnNpb24uXG4gICAgICBpZiAob3B0aW9ucy5pbnNlcnRlZElkKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICAhKFxuICAgICAgICAgICAgdHlwZW9mIG9wdGlvbnMuaW5zZXJ0ZWRJZCA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgICAgIG9wdGlvbnMuaW5zZXJ0ZWRJZCBpbnN0YW5jZW9mIE1vbmdvLk9iamVjdElEXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnNlcnRlZElkIG11c3QgYmUgc3RyaW5nIG9yIE9iamVjdElEJyk7XG4gICAgICAgIGluc2VydGVkSWQgPSBvcHRpb25zLmluc2VydGVkSWQ7XG4gICAgICB9IGVsc2UgaWYgKCFzZWxlY3RvciB8fCAhc2VsZWN0b3IuX2lkKSB7XG4gICAgICAgIGluc2VydGVkSWQgPSB0aGlzLl9tYWtlTmV3SUQoKTtcbiAgICAgICAgb3B0aW9ucy5nZW5lcmF0ZWRJZCA9IHRydWU7XG4gICAgICAgIG9wdGlvbnMuaW5zZXJ0ZWRJZCA9IGluc2VydGVkSWQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2VsZWN0b3IgPSBNb25nby5Db2xsZWN0aW9uLl9yZXdyaXRlU2VsZWN0b3Ioc2VsZWN0b3IsIHtcbiAgICAgIGZhbGxiYWNrSWQ6IGluc2VydGVkSWQsXG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy5faXNSZW1vdGVDb2xsZWN0aW9uKCkpIHtcbiAgICAgIGNvbnN0IGFyZ3MgPSBbc2VsZWN0b3IsIG1vZGlmaWVyLCBvcHRpb25zXTtcblxuICAgICAgcmV0dXJuIHRoaXMuX2NhbGxNdXRhdG9yTWV0aG9kQXN5bmMoJ3VwZGF0ZUFzeW5jJywgYXJncywgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLy8gaXQncyBteSBjb2xsZWN0aW9uLiAgZGVzY2VuZCBpbnRvIHRoZSBjb2xsZWN0aW9uIG9iamVjdFxuICAgIC8vIGFuZCBwcm9wYWdhdGUgYW55IGV4Y2VwdGlvbi5cbiAgICAvLyBJZiB0aGUgdXNlciBwcm92aWRlZCBhIGNhbGxiYWNrIGFuZCB0aGUgY29sbGVjdGlvbiBpbXBsZW1lbnRzIHRoaXNcbiAgICAvLyBvcGVyYXRpb24gYXN5bmNocm9ub3VzbHksIHRoZW4gcXVlcnlSZXQgd2lsbCBiZSB1bmRlZmluZWQsIGFuZCB0aGVcbiAgICAvLyByZXN1bHQgd2lsbCBiZSByZXR1cm5lZCB0aHJvdWdoIHRoZSBjYWxsYmFjayBpbnN0ZWFkLlxuXG4gICAgcmV0dXJuIHRoaXMuX2NvbGxlY3Rpb24udXBkYXRlQXN5bmMoXG4gICAgICBzZWxlY3RvcixcbiAgICAgIG1vZGlmaWVyLFxuICAgICAgb3B0aW9uc1xuICAgICk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IEFzeW5jaHJvbm91c2x5IHJlbW92ZXMgZG9jdW1lbnRzIGZyb20gdGhlIGNvbGxlY3Rpb24uXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWV0aG9kIHJlbW92ZVxuICAgKiBAbWVtYmVyb2YgTW9uZ28uQ29sbGVjdGlvblxuICAgKiBAaW5zdGFuY2VcbiAgICogQHBhcmFtIHtNb25nb1NlbGVjdG9yfSBzZWxlY3RvciBTcGVjaWZpZXMgd2hpY2ggZG9jdW1lbnRzIHRvIHJlbW92ZVxuICAgKi9cbiAgcmVtb3ZlQXN5bmMoc2VsZWN0b3IsIG9wdGlvbnMgPSB7fSkge1xuICAgIHNlbGVjdG9yID0gTW9uZ28uQ29sbGVjdGlvbi5fcmV3cml0ZVNlbGVjdG9yKHNlbGVjdG9yKTtcblxuICAgIGlmICh0aGlzLl9pc1JlbW90ZUNvbGxlY3Rpb24oKSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NhbGxNdXRhdG9yTWV0aG9kQXN5bmMoJ3JlbW92ZUFzeW5jJywgW3NlbGVjdG9yXSwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLy8gaXQncyBteSBjb2xsZWN0aW9uLiAgZGVzY2VuZCBpbnRvIHRoZSBjb2xsZWN0aW9uMSBvYmplY3RcbiAgICAvLyBhbmQgcHJvcGFnYXRlIGFueSBleGNlcHRpb24uXG4gICAgcmV0dXJuIHRoaXMuX2NvbGxlY3Rpb24ucmVtb3ZlQXN5bmMoc2VsZWN0b3IpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBBc3luY2hyb25vdXNseSBtb2RpZmllcyBvbmUgb3IgbW9yZSBkb2N1bWVudHMgaW4gdGhlIGNvbGxlY3Rpb24sIG9yIGluc2VydCBvbmUgaWYgbm8gbWF0Y2hpbmcgZG9jdW1lbnRzIHdlcmUgZm91bmQuIFJldHVybnMgYW4gb2JqZWN0IHdpdGgga2V5cyBgbnVtYmVyQWZmZWN0ZWRgICh0aGUgbnVtYmVyIG9mIGRvY3VtZW50cyBtb2RpZmllZCkgIGFuZCBgaW5zZXJ0ZWRJZGAgKHRoZSB1bmlxdWUgX2lkIG9mIHRoZSBkb2N1bWVudCB0aGF0IHdhcyBpbnNlcnRlZCwgaWYgYW55KS5cbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZXRob2QgdXBzZXJ0XG4gICAqIEBtZW1iZXJvZiBNb25nby5Db2xsZWN0aW9uXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcGFyYW0ge01vbmdvU2VsZWN0b3J9IHNlbGVjdG9yIFNwZWNpZmllcyB3aGljaCBkb2N1bWVudHMgdG8gbW9kaWZ5XG4gICAqIEBwYXJhbSB7TW9uZ29Nb2RpZmllcn0gbW9kaWZpZXIgU3BlY2lmaWVzIGhvdyB0byBtb2RpZnkgdGhlIGRvY3VtZW50c1xuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy5tdWx0aSBUcnVlIHRvIG1vZGlmeSBhbGwgbWF0Y2hpbmcgZG9jdW1lbnRzOyBmYWxzZSB0byBvbmx5IG1vZGlmeSBvbmUgb2YgdGhlIG1hdGNoaW5nIGRvY3VtZW50cyAodGhlIGRlZmF1bHQpLlxuICAgKi9cbiAgYXN5bmMgdXBzZXJ0QXN5bmMoc2VsZWN0b3IsIG1vZGlmaWVyLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMudXBkYXRlQXN5bmMoXG4gICAgICBzZWxlY3RvcixcbiAgICAgIG1vZGlmaWVyLFxuICAgICAge1xuICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICBfcmV0dXJuT2JqZWN0OiB0cnVlLFxuICAgICAgICB1cHNlcnQ6IHRydWUsXG4gICAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogQHN1bW1hcnkgR2V0cyB0aGUgbnVtYmVyIG9mIGRvY3VtZW50cyBtYXRjaGluZyB0aGUgZmlsdGVyLiBGb3IgYSBmYXN0IGNvdW50IG9mIHRoZSB0b3RhbCBkb2N1bWVudHMgaW4gYSBjb2xsZWN0aW9uIHNlZSBgZXN0aW1hdGVkRG9jdW1lbnRDb3VudGAuXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWV0aG9kIGNvdW50RG9jdW1lbnRzXG4gICAqIEBtZW1iZXJvZiBNb25nby5Db2xsZWN0aW9uXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcGFyYW0ge01vbmdvU2VsZWN0b3J9IFtzZWxlY3Rvcl0gQSBxdWVyeSBkZXNjcmliaW5nIHRoZSBkb2N1bWVudHMgdG8gY291bnRcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBBbGwgb3B0aW9ucyBhcmUgbGlzdGVkIGluIFtNb25nb0RCIGRvY3VtZW50YXRpb25dKGh0dHBzOi8vbW9uZ29kYi5naXRodWIuaW8vbm9kZS1tb25nb2RiLW5hdGl2ZS80LjExL2ludGVyZmFjZXMvQ291bnREb2N1bWVudHNPcHRpb25zLmh0bWwpLiBQbGVhc2Ugbm90ZSB0aGF0IG5vdCBhbGwgb2YgdGhlbSBhcmUgYXZhaWxhYmxlIG9uIHRoZSBjbGllbnQuXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPG51bWJlcj59XG4gICAqL1xuICBjb3VudERvY3VtZW50cyguLi5hcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbGxlY3Rpb24uY291bnREb2N1bWVudHMoLi4uYXJncyk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IEdldHMgYW4gZXN0aW1hdGUgb2YgdGhlIGNvdW50IG9mIGRvY3VtZW50cyBpbiBhIGNvbGxlY3Rpb24gdXNpbmcgY29sbGVjdGlvbiBtZXRhZGF0YS4gRm9yIGFuIGV4YWN0IGNvdW50IG9mIHRoZSBkb2N1bWVudHMgaW4gYSBjb2xsZWN0aW9uIHNlZSBgY291bnREb2N1bWVudHNgLlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1ldGhvZCBlc3RpbWF0ZWREb2N1bWVudENvdW50XG4gICAqIEBtZW1iZXJvZiBNb25nby5Db2xsZWN0aW9uXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIEFsbCBvcHRpb25zIGFyZSBsaXN0ZWQgaW4gW01vbmdvREIgZG9jdW1lbnRhdGlvbl0oaHR0cHM6Ly9tb25nb2RiLmdpdGh1Yi5pby9ub2RlLW1vbmdvZGItbmF0aXZlLzQuMTEvaW50ZXJmYWNlcy9Fc3RpbWF0ZWREb2N1bWVudENvdW50T3B0aW9ucy5odG1sKS4gUGxlYXNlIG5vdGUgdGhhdCBub3QgYWxsIG9mIHRoZW0gYXJlIGF2YWlsYWJsZSBvbiB0aGUgY2xpZW50LlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZTxudW1iZXI+fVxuICAgKi9cbiAgZXN0aW1hdGVkRG9jdW1lbnRDb3VudCguLi5hcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbGxlY3Rpb24uZXN0aW1hdGVkRG9jdW1lbnRDb3VudCguLi5hcmdzKTtcbiAgfSxcbn0iLCJleHBvcnQgY29uc3QgSW5kZXhNZXRob2RzID0ge1xuICAvLyBXZSdsbCBhY3R1YWxseSBkZXNpZ24gYW4gaW5kZXggQVBJIGxhdGVyLiBGb3Igbm93LCB3ZSBqdXN0IHBhc3MgdGhyb3VnaCB0b1xuICAvLyBNb25nbydzLCBidXQgbWFrZSBpdCBzeW5jaHJvbm91cy5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IEFzeW5jaHJvbm91c2x5IGNyZWF0ZXMgdGhlIHNwZWNpZmllZCBpbmRleCBvbiB0aGUgY29sbGVjdGlvbi5cbiAgICogQGxvY3VzIHNlcnZlclxuICAgKiBAbWV0aG9kIGVuc3VyZUluZGV4QXN5bmNcbiAgICogQGRlcHJlY2F0ZWQgaW4gMy4wXG4gICAqIEBtZW1iZXJvZiBNb25nby5Db2xsZWN0aW9uXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcGFyYW0ge09iamVjdH0gaW5kZXggQSBkb2N1bWVudCB0aGF0IGNvbnRhaW5zIHRoZSBmaWVsZCBhbmQgdmFsdWUgcGFpcnMgd2hlcmUgdGhlIGZpZWxkIGlzIHRoZSBpbmRleCBrZXkgYW5kIHRoZSB2YWx1ZSBkZXNjcmliZXMgdGhlIHR5cGUgb2YgaW5kZXggZm9yIHRoYXQgZmllbGQuIEZvciBhbiBhc2NlbmRpbmcgaW5kZXggb24gYSBmaWVsZCwgc3BlY2lmeSBhIHZhbHVlIG9mIGAxYDsgZm9yIGRlc2NlbmRpbmcgaW5kZXgsIHNwZWNpZnkgYSB2YWx1ZSBvZiBgLTFgLiBVc2UgYHRleHRgIGZvciB0ZXh0IGluZGV4ZXMuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gQWxsIG9wdGlvbnMgYXJlIGxpc3RlZCBpbiBbTW9uZ29EQiBkb2N1bWVudGF0aW9uXShodHRwczovL2RvY3MubW9uZ29kYi5jb20vbWFudWFsL3JlZmVyZW5jZS9tZXRob2QvZGIuY29sbGVjdGlvbi5jcmVhdGVJbmRleC8jb3B0aW9ucylcbiAgICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMubmFtZSBOYW1lIG9mIHRoZSBpbmRleFxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMudW5pcXVlIERlZmluZSB0aGF0IHRoZSBpbmRleCB2YWx1ZXMgbXVzdCBiZSB1bmlxdWUsIG1vcmUgYXQgW01vbmdvREIgZG9jdW1lbnRhdGlvbl0oaHR0cHM6Ly9kb2NzLm1vbmdvZGIuY29tL21hbnVhbC9jb3JlL2luZGV4LXVuaXF1ZS8pXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy5zcGFyc2UgRGVmaW5lIHRoYXQgdGhlIGluZGV4IGlzIHNwYXJzZSwgbW9yZSBhdCBbTW9uZ29EQiBkb2N1bWVudGF0aW9uXShodHRwczovL2RvY3MubW9uZ29kYi5jb20vbWFudWFsL2NvcmUvaW5kZXgtc3BhcnNlLylcbiAgICovXG4gIGFzeW5jIGVuc3VyZUluZGV4QXN5bmMoaW5kZXgsIG9wdGlvbnMpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKCFzZWxmLl9jb2xsZWN0aW9uLmVuc3VyZUluZGV4QXN5bmMgfHwgIXNlbGYuX2NvbGxlY3Rpb24uY3JlYXRlSW5kZXhBc3luYylcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2FuIG9ubHkgY2FsbCBjcmVhdGVJbmRleEFzeW5jIG9uIHNlcnZlciBjb2xsZWN0aW9ucycpO1xuICAgIGlmIChzZWxmLl9jb2xsZWN0aW9uLmNyZWF0ZUluZGV4QXN5bmMpIHtcbiAgICAgIGF3YWl0IHNlbGYuX2NvbGxlY3Rpb24uY3JlYXRlSW5kZXhBc3luYyhpbmRleCwgb3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGltcG9ydCB7IExvZyB9IGZyb20gJ21ldGVvci9sb2dnaW5nJztcblxuICAgICAgTG9nLmRlYnVnKGBlbnN1cmVJbmRleEFzeW5jIGhhcyBiZWVuIGRlcHJlY2F0ZWQsIHBsZWFzZSB1c2UgdGhlIG5ldyAnY3JlYXRlSW5kZXhBc3luYycgaW5zdGVhZCR7IG9wdGlvbnM/Lm5hbWUgPyBgLCBpbmRleCBuYW1lOiAkeyBvcHRpb25zLm5hbWUgfWAgOiBgLCBpbmRleDogJHsgSlNPTi5zdHJpbmdpZnkoaW5kZXgpIH1gIH1gKVxuICAgICAgYXdhaXQgc2VsZi5fY29sbGVjdGlvbi5lbnN1cmVJbmRleEFzeW5jKGluZGV4LCBvcHRpb25zKTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IEFzeW5jaHJvbm91c2x5IGNyZWF0ZXMgdGhlIHNwZWNpZmllZCBpbmRleCBvbiB0aGUgY29sbGVjdGlvbi5cbiAgICogQGxvY3VzIHNlcnZlclxuICAgKiBAbWV0aG9kIGNyZWF0ZUluZGV4QXN5bmNcbiAgICogQG1lbWJlcm9mIE1vbmdvLkNvbGxlY3Rpb25cbiAgICogQGluc3RhbmNlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBpbmRleCBBIGRvY3VtZW50IHRoYXQgY29udGFpbnMgdGhlIGZpZWxkIGFuZCB2YWx1ZSBwYWlycyB3aGVyZSB0aGUgZmllbGQgaXMgdGhlIGluZGV4IGtleSBhbmQgdGhlIHZhbHVlIGRlc2NyaWJlcyB0aGUgdHlwZSBvZiBpbmRleCBmb3IgdGhhdCBmaWVsZC4gRm9yIGFuIGFzY2VuZGluZyBpbmRleCBvbiBhIGZpZWxkLCBzcGVjaWZ5IGEgdmFsdWUgb2YgYDFgOyBmb3IgZGVzY2VuZGluZyBpbmRleCwgc3BlY2lmeSBhIHZhbHVlIG9mIGAtMWAuIFVzZSBgdGV4dGAgZm9yIHRleHQgaW5kZXhlcy5cbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBBbGwgb3B0aW9ucyBhcmUgbGlzdGVkIGluIFtNb25nb0RCIGRvY3VtZW50YXRpb25dKGh0dHBzOi8vZG9jcy5tb25nb2RiLmNvbS9tYW51YWwvcmVmZXJlbmNlL21ldGhvZC9kYi5jb2xsZWN0aW9uLmNyZWF0ZUluZGV4LyNvcHRpb25zKVxuICAgKiBAcGFyYW0ge1N0cmluZ30gb3B0aW9ucy5uYW1lIE5hbWUgb2YgdGhlIGluZGV4XG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy51bmlxdWUgRGVmaW5lIHRoYXQgdGhlIGluZGV4IHZhbHVlcyBtdXN0IGJlIHVuaXF1ZSwgbW9yZSBhdCBbTW9uZ29EQiBkb2N1bWVudGF0aW9uXShodHRwczovL2RvY3MubW9uZ29kYi5jb20vbWFudWFsL2NvcmUvaW5kZXgtdW5pcXVlLylcbiAgICogQHBhcmFtIHtCb29sZWFufSBvcHRpb25zLnNwYXJzZSBEZWZpbmUgdGhhdCB0aGUgaW5kZXggaXMgc3BhcnNlLCBtb3JlIGF0IFtNb25nb0RCIGRvY3VtZW50YXRpb25dKGh0dHBzOi8vZG9jcy5tb25nb2RiLmNvbS9tYW51YWwvY29yZS9pbmRleC1zcGFyc2UvKVxuICAgKi9cbiAgYXN5bmMgY3JlYXRlSW5kZXhBc3luYyhpbmRleCwgb3B0aW9ucykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoIXNlbGYuX2NvbGxlY3Rpb24uY3JlYXRlSW5kZXhBc3luYylcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2FuIG9ubHkgY2FsbCBjcmVhdGVJbmRleEFzeW5jIG9uIHNlcnZlciBjb2xsZWN0aW9ucycpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHNlbGYuX2NvbGxlY3Rpb24uY3JlYXRlSW5kZXhBc3luYyhpbmRleCwgb3B0aW9ucyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKFxuICAgICAgICBlLm1lc3NhZ2UuaW5jbHVkZXMoXG4gICAgICAgICAgJ0FuIGVxdWl2YWxlbnQgaW5kZXggYWxyZWFkeSBleGlzdHMgd2l0aCB0aGUgc2FtZSBuYW1lIGJ1dCBkaWZmZXJlbnQgb3B0aW9ucy4nXG4gICAgICAgICkgJiZcbiAgICAgICAgTWV0ZW9yLnNldHRpbmdzPy5wYWNrYWdlcz8ubW9uZ28/LnJlQ3JlYXRlSW5kZXhPbk9wdGlvbk1pc21hdGNoXG4gICAgICApIHtcbiAgICAgICAgaW1wb3J0IHsgTG9nIH0gZnJvbSAnbWV0ZW9yL2xvZ2dpbmcnO1xuXG4gICAgICAgIExvZy5pbmZvKGBSZS1jcmVhdGluZyBpbmRleCAkeyBpbmRleCB9IGZvciAkeyBzZWxmLl9uYW1lIH0gZHVlIHRvIG9wdGlvbnMgbWlzbWF0Y2guYCk7XG4gICAgICAgIGF3YWl0IHNlbGYuX2NvbGxlY3Rpb24uZHJvcEluZGV4QXN5bmMoaW5kZXgpO1xuICAgICAgICBhd2FpdCBzZWxmLl9jb2xsZWN0aW9uLmNyZWF0ZUluZGV4QXN5bmMoaW5kZXgsIG9wdGlvbnMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcihgQW4gZXJyb3Igb2NjdXJyZWQgd2hlbiBjcmVhdGluZyBhbiBpbmRleCBmb3IgY29sbGVjdGlvbiBcIiR7IHNlbGYuX25hbWUgfTogJHsgZS5tZXNzYWdlIH1gKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IEFzeW5jaHJvbm91c2x5IGNyZWF0ZXMgdGhlIHNwZWNpZmllZCBpbmRleCBvbiB0aGUgY29sbGVjdGlvbi5cbiAgICogQGxvY3VzIHNlcnZlclxuICAgKiBAbWV0aG9kIGNyZWF0ZUluZGV4XG4gICAqIEBtZW1iZXJvZiBNb25nby5Db2xsZWN0aW9uXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcGFyYW0ge09iamVjdH0gaW5kZXggQSBkb2N1bWVudCB0aGF0IGNvbnRhaW5zIHRoZSBmaWVsZCBhbmQgdmFsdWUgcGFpcnMgd2hlcmUgdGhlIGZpZWxkIGlzIHRoZSBpbmRleCBrZXkgYW5kIHRoZSB2YWx1ZSBkZXNjcmliZXMgdGhlIHR5cGUgb2YgaW5kZXggZm9yIHRoYXQgZmllbGQuIEZvciBhbiBhc2NlbmRpbmcgaW5kZXggb24gYSBmaWVsZCwgc3BlY2lmeSBhIHZhbHVlIG9mIGAxYDsgZm9yIGRlc2NlbmRpbmcgaW5kZXgsIHNwZWNpZnkgYSB2YWx1ZSBvZiBgLTFgLiBVc2UgYHRleHRgIGZvciB0ZXh0IGluZGV4ZXMuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gQWxsIG9wdGlvbnMgYXJlIGxpc3RlZCBpbiBbTW9uZ29EQiBkb2N1bWVudGF0aW9uXShodHRwczovL2RvY3MubW9uZ29kYi5jb20vbWFudWFsL3JlZmVyZW5jZS9tZXRob2QvZGIuY29sbGVjdGlvbi5jcmVhdGVJbmRleC8jb3B0aW9ucylcbiAgICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMubmFtZSBOYW1lIG9mIHRoZSBpbmRleFxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IG9wdGlvbnMudW5pcXVlIERlZmluZSB0aGF0IHRoZSBpbmRleCB2YWx1ZXMgbXVzdCBiZSB1bmlxdWUsIG1vcmUgYXQgW01vbmdvREIgZG9jdW1lbnRhdGlvbl0oaHR0cHM6Ly9kb2NzLm1vbmdvZGIuY29tL21hbnVhbC9jb3JlL2luZGV4LXVuaXF1ZS8pXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy5zcGFyc2UgRGVmaW5lIHRoYXQgdGhlIGluZGV4IGlzIHNwYXJzZSwgbW9yZSBhdCBbTW9uZ29EQiBkb2N1bWVudGF0aW9uXShodHRwczovL2RvY3MubW9uZ29kYi5jb20vbWFudWFsL2NvcmUvaW5kZXgtc3BhcnNlLylcbiAgICovXG4gIGNyZWF0ZUluZGV4KGluZGV4LCBvcHRpb25zKXtcbiAgICByZXR1cm4gdGhpcy5jcmVhdGVJbmRleEFzeW5jKGluZGV4LCBvcHRpb25zKTtcbiAgfSxcblxuICBhc3luYyBkcm9wSW5kZXhBc3luYyhpbmRleCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoIXNlbGYuX2NvbGxlY3Rpb24uZHJvcEluZGV4QXN5bmMpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbiBvbmx5IGNhbGwgZHJvcEluZGV4QXN5bmMgb24gc2VydmVyIGNvbGxlY3Rpb25zJyk7XG4gICAgYXdhaXQgc2VsZi5fY29sbGVjdGlvbi5kcm9wSW5kZXhBc3luYyhpbmRleCk7XG4gIH0sXG59IiwiZXhwb3J0IGNvbnN0IFJlcGxpY2F0aW9uTWV0aG9kcyA9IHtcbiAgYXN5bmMgX21heWJlU2V0VXBSZXBsaWNhdGlvbihuYW1lKSB7XG4gICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgaWYgKFxuICAgICAgIShcbiAgICAgICAgc2VsZi5fY29ubmVjdGlvbiAmJlxuICAgICAgICBzZWxmLl9jb25uZWN0aW9uLnJlZ2lzdGVyU3RvcmVDbGllbnQgJiZcbiAgICAgICAgc2VsZi5fY29ubmVjdGlvbi5yZWdpc3RlclN0b3JlU2VydmVyXG4gICAgICApXG4gICAgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG5cbiAgICBjb25zdCB3cmFwcGVkU3RvcmVDb21tb24gPSB7XG4gICAgICAvLyBDYWxsZWQgYXJvdW5kIG1ldGhvZCBzdHViIGludm9jYXRpb25zIHRvIGNhcHR1cmUgdGhlIG9yaWdpbmFsIHZlcnNpb25zXG4gICAgICAvLyBvZiBtb2RpZmllZCBkb2N1bWVudHMuXG4gICAgICBzYXZlT3JpZ2luYWxzKCkge1xuICAgICAgICBzZWxmLl9jb2xsZWN0aW9uLnNhdmVPcmlnaW5hbHMoKTtcbiAgICAgIH0sXG4gICAgICByZXRyaWV2ZU9yaWdpbmFscygpIHtcbiAgICAgICAgcmV0dXJuIHNlbGYuX2NvbGxlY3Rpb24ucmV0cmlldmVPcmlnaW5hbHMoKTtcbiAgICAgIH0sXG4gICAgICAvLyBUbyBiZSBhYmxlIHRvIGdldCBiYWNrIHRvIHRoZSBjb2xsZWN0aW9uIGZyb20gdGhlIHN0b3JlLlxuICAgICAgX2dldENvbGxlY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBzZWxmO1xuICAgICAgfSxcbiAgICB9O1xuICAgIGNvbnN0IHdyYXBwZWRTdG9yZUNsaWVudCA9IHtcbiAgICAgIC8vIENhbGxlZCBhdCB0aGUgYmVnaW5uaW5nIG9mIGEgYmF0Y2ggb2YgdXBkYXRlcy4gYmF0Y2hTaXplIGlzIHRoZSBudW1iZXJcbiAgICAgIC8vIG9mIHVwZGF0ZSBjYWxscyB0byBleHBlY3QuXG4gICAgICAvL1xuICAgICAgLy8gWFhYIFRoaXMgaW50ZXJmYWNlIGlzIHByZXR0eSBqYW5reS4gcmVzZXQgcHJvYmFibHkgb3VnaHQgdG8gZ28gYmFjayB0b1xuICAgICAgLy8gYmVpbmcgaXRzIG93biBmdW5jdGlvbiwgYW5kIGNhbGxlcnMgc2hvdWxkbid0IGhhdmUgdG8gY2FsY3VsYXRlXG4gICAgICAvLyBiYXRjaFNpemUuIFRoZSBvcHRpbWl6YXRpb24gb2Ygbm90IGNhbGxpbmcgcGF1c2UvcmVtb3ZlIHNob3VsZCBiZVxuICAgICAgLy8gZGVsYXllZCB1bnRpbCBsYXRlcjogdGhlIGZpcnN0IGNhbGwgdG8gdXBkYXRlKCkgc2hvdWxkIGJ1ZmZlciBpdHNcbiAgICAgIC8vIG1lc3NhZ2UsIGFuZCB0aGVuIHdlIGNhbiBlaXRoZXIgZGlyZWN0bHkgYXBwbHkgaXQgYXQgZW5kVXBkYXRlIHRpbWUgaWZcbiAgICAgIC8vIGl0IHdhcyB0aGUgb25seSB1cGRhdGUsIG9yIGRvIHBhdXNlT2JzZXJ2ZXJzL2FwcGx5L2FwcGx5IGF0IHRoZSBuZXh0XG4gICAgICAvLyB1cGRhdGUoKSBpZiB0aGVyZSdzIGFub3RoZXIgb25lLlxuICAgICAgYXN5bmMgYmVnaW5VcGRhdGUoYmF0Y2hTaXplLCByZXNldCkge1xuICAgICAgICAvLyBwYXVzZSBvYnNlcnZlcnMgc28gdXNlcnMgZG9uJ3Qgc2VlIGZsaWNrZXIgd2hlbiB1cGRhdGluZyBzZXZlcmFsXG4gICAgICAgIC8vIG9iamVjdHMgYXQgb25jZSAoaW5jbHVkaW5nIHRoZSBwb3N0LXJlY29ubmVjdCByZXNldC1hbmQtcmVhcHBseVxuICAgICAgICAvLyBzdGFnZSksIGFuZCBzbyB0aGF0IGEgcmUtc29ydGluZyBvZiBhIHF1ZXJ5IGNhbiB0YWtlIGFkdmFudGFnZSBvZiB0aGVcbiAgICAgICAgLy8gZnVsbCBfZGlmZlF1ZXJ5IG1vdmVkIGNhbGN1bGF0aW9uIGluc3RlYWQgb2YgYXBwbHlpbmcgY2hhbmdlIG9uZSBhdCBhXG4gICAgICAgIC8vIHRpbWUuXG4gICAgICAgIGlmIChiYXRjaFNpemUgPiAxIHx8IHJlc2V0KSBzZWxmLl9jb2xsZWN0aW9uLnBhdXNlT2JzZXJ2ZXJzKCk7XG5cbiAgICAgICAgaWYgKHJlc2V0KSBhd2FpdCBzZWxmLl9jb2xsZWN0aW9uLnJlbW92ZSh7fSk7XG4gICAgICB9LFxuXG4gICAgICAvLyBBcHBseSBhbiB1cGRhdGUuXG4gICAgICAvLyBYWFggYmV0dGVyIHNwZWNpZnkgdGhpcyBpbnRlcmZhY2UgKG5vdCBpbiB0ZXJtcyBvZiBhIHdpcmUgbWVzc2FnZSk/XG4gICAgICB1cGRhdGUobXNnKSB7XG4gICAgICAgIHZhciBtb25nb0lkID0gTW9uZ29JRC5pZFBhcnNlKG1zZy5pZCk7XG4gICAgICAgIHZhciBkb2MgPSBzZWxmLl9jb2xsZWN0aW9uLl9kb2NzLmdldChtb25nb0lkKTtcblxuICAgICAgICAvL1doZW4gdGhlIHNlcnZlcidzIG1lcmdlYm94IGlzIGRpc2FibGVkIGZvciBhIGNvbGxlY3Rpb24sIHRoZSBjbGllbnQgbXVzdCBncmFjZWZ1bGx5IGhhbmRsZSBpdCB3aGVuOlxuICAgICAgICAvLyAqV2UgcmVjZWl2ZSBhbiBhZGRlZCBtZXNzYWdlIGZvciBhIGRvY3VtZW50IHRoYXQgaXMgYWxyZWFkeSB0aGVyZS4gSW5zdGVhZCwgaXQgd2lsbCBiZSBjaGFuZ2VkXG4gICAgICAgIC8vICpXZSByZWVpdmUgYSBjaGFuZ2UgbWVzc2FnZSBmb3IgYSBkb2N1bWVudCB0aGF0IGlzIG5vdCB0aGVyZS4gSW5zdGVhZCwgaXQgd2lsbCBiZSBhZGRlZFxuICAgICAgICAvLyAqV2UgcmVjZWl2ZSBhIHJlbW92ZWQgbWVzc3NhZ2UgZm9yIGEgZG9jdW1lbnQgdGhhdCBpcyBub3QgdGhlcmUuIEluc3RlYWQsIG5vdGluZyB3aWwgaGFwcGVuLlxuXG4gICAgICAgIC8vQ29kZSBpcyBkZXJpdmVkIGZyb20gY2xpZW50LXNpZGUgY29kZSBvcmlnaW5hbGx5IGluIHBlZXJsaWJyYXJ5OmNvbnRyb2wtbWVyZ2Vib3hcbiAgICAgICAgLy9odHRwczovL2dpdGh1Yi5jb20vcGVlcmxpYnJhcnkvbWV0ZW9yLWNvbnRyb2wtbWVyZ2Vib3gvYmxvYi9tYXN0ZXIvY2xpZW50LmNvZmZlZVxuXG4gICAgICAgIC8vRm9yIG1vcmUgaW5mb3JtYXRpb24sIHJlZmVyIHRvIGRpc2N1c3Npb24gXCJJbml0aWFsIHN1cHBvcnQgZm9yIHB1YmxpY2F0aW9uIHN0cmF0ZWdpZXMgaW4gbGl2ZWRhdGEgc2VydmVyXCI6XG4gICAgICAgIC8vaHR0cHM6Ly9naXRodWIuY29tL21ldGVvci9tZXRlb3IvcHVsbC8xMTE1MVxuICAgICAgICBpZiAoTWV0ZW9yLmlzQ2xpZW50KSB7XG4gICAgICAgICAgaWYgKG1zZy5tc2cgPT09ICdhZGRlZCcgJiYgZG9jKSB7XG4gICAgICAgICAgICBtc2cubXNnID0gJ2NoYW5nZWQnO1xuICAgICAgICAgIH0gZWxzZSBpZiAobXNnLm1zZyA9PT0gJ3JlbW92ZWQnICYmICFkb2MpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9IGVsc2UgaWYgKG1zZy5tc2cgPT09ICdjaGFuZ2VkJyAmJiAhZG9jKSB7XG4gICAgICAgICAgICBtc2cubXNnID0gJ2FkZGVkJztcbiAgICAgICAgICAgIGNvbnN0IF9yZWYgPSBtc2cuZmllbGRzO1xuICAgICAgICAgICAgZm9yIChsZXQgZmllbGQgaW4gX3JlZikge1xuICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IF9yZWZbZmllbGRdO1xuICAgICAgICAgICAgICBpZiAodmFsdWUgPT09IHZvaWQgMCkge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBtc2cuZmllbGRzW2ZpZWxkXTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBJcyB0aGlzIGEgXCJyZXBsYWNlIHRoZSB3aG9sZSBkb2NcIiBtZXNzYWdlIGNvbWluZyBmcm9tIHRoZSBxdWllc2NlbmNlXG4gICAgICAgIC8vIG9mIG1ldGhvZCB3cml0ZXMgdG8gYW4gb2JqZWN0PyAoTm90ZSB0aGF0ICd1bmRlZmluZWQnIGlzIGEgdmFsaWRcbiAgICAgICAgLy8gdmFsdWUgbWVhbmluZyBcInJlbW92ZSBpdFwiLilcbiAgICAgICAgaWYgKG1zZy5tc2cgPT09ICdyZXBsYWNlJykge1xuICAgICAgICAgIHZhciByZXBsYWNlID0gbXNnLnJlcGxhY2U7XG4gICAgICAgICAgaWYgKCFyZXBsYWNlKSB7XG4gICAgICAgICAgICBpZiAoZG9jKSBzZWxmLl9jb2xsZWN0aW9uLnJlbW92ZShtb25nb0lkKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKCFkb2MpIHtcbiAgICAgICAgICAgIHNlbGYuX2NvbGxlY3Rpb24uaW5zZXJ0KHJlcGxhY2UpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBYWFggY2hlY2sgdGhhdCByZXBsYWNlIGhhcyBubyAkIG9wc1xuICAgICAgICAgICAgc2VsZi5fY29sbGVjdGlvbi51cGRhdGUobW9uZ29JZCwgcmVwbGFjZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmIChtc2cubXNnID09PSAnYWRkZWQnKSB7XG4gICAgICAgICAgaWYgKGRvYykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAnRXhwZWN0ZWQgbm90IHRvIGZpbmQgYSBkb2N1bWVudCBhbHJlYWR5IHByZXNlbnQgZm9yIGFuIGFkZCdcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHNlbGYuX2NvbGxlY3Rpb24uaW5zZXJ0KHsgX2lkOiBtb25nb0lkLCAuLi5tc2cuZmllbGRzIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKG1zZy5tc2cgPT09ICdyZW1vdmVkJykge1xuICAgICAgICAgIGlmICghZG9jKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAnRXhwZWN0ZWQgdG8gZmluZCBhIGRvY3VtZW50IGFscmVhZHkgcHJlc2VudCBmb3IgcmVtb3ZlZCdcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgc2VsZi5fY29sbGVjdGlvbi5yZW1vdmUobW9uZ29JZCk7XG4gICAgICAgIH0gZWxzZSBpZiAobXNnLm1zZyA9PT0gJ2NoYW5nZWQnKSB7XG4gICAgICAgICAgaWYgKCFkb2MpIHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgdG8gZmluZCBhIGRvY3VtZW50IHRvIGNoYW5nZScpO1xuICAgICAgICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyhtc2cuZmllbGRzKTtcbiAgICAgICAgICBpZiAoa2V5cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB2YXIgbW9kaWZpZXIgPSB7fTtcbiAgICAgICAgICAgIGtleXMuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICAgICAgICBjb25zdCB2YWx1ZSA9IG1zZy5maWVsZHNba2V5XTtcbiAgICAgICAgICAgICAgaWYgKEVKU09OLmVxdWFscyhkb2Nba2V5XSwgdmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFtb2RpZmllci4kdW5zZXQpIHtcbiAgICAgICAgICAgICAgICAgIG1vZGlmaWVyLiR1bnNldCA9IHt9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBtb2RpZmllci4kdW5zZXRba2V5XSA9IDE7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCFtb2RpZmllci4kc2V0KSB7XG4gICAgICAgICAgICAgICAgICBtb2RpZmllci4kc2V0ID0ge307XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG1vZGlmaWVyLiRzZXRba2V5XSA9IHZhbHVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyhtb2RpZmllcikubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICBzZWxmLl9jb2xsZWN0aW9uLnVwZGF0ZShtb25nb0lkLCBtb2RpZmllcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkkgZG9uJ3Qga25vdyBob3cgdG8gZGVhbCB3aXRoIHRoaXMgbWVzc2FnZVwiKTtcbiAgICAgICAgfVxuICAgICAgfSxcblxuICAgICAgLy8gQ2FsbGVkIGF0IHRoZSBlbmQgb2YgYSBiYXRjaCBvZiB1cGRhdGVzLmxpdmVkYXRhX2Nvbm5lY3Rpb24uanM6MTI4N1xuICAgICAgZW5kVXBkYXRlKCkge1xuICAgICAgICBzZWxmLl9jb2xsZWN0aW9uLnJlc3VtZU9ic2VydmVyc0NsaWVudCgpO1xuICAgICAgfSxcblxuICAgICAgLy8gVXNlZCB0byBwcmVzZXJ2ZSBjdXJyZW50IHZlcnNpb25zIG9mIGRvY3VtZW50cyBhY3Jvc3MgYSBzdG9yZSByZXNldC5cbiAgICAgIGdldERvYyhpZCkge1xuICAgICAgICByZXR1cm4gc2VsZi5maW5kT25lKGlkKTtcbiAgICAgIH0sXG5cbiAgICAgIC4uLndyYXBwZWRTdG9yZUNvbW1vbixcbiAgICB9O1xuICAgIGNvbnN0IHdyYXBwZWRTdG9yZVNlcnZlciA9IHtcbiAgICAgIGFzeW5jIGJlZ2luVXBkYXRlKGJhdGNoU2l6ZSwgcmVzZXQpIHtcbiAgICAgICAgaWYgKGJhdGNoU2l6ZSA+IDEgfHwgcmVzZXQpIHNlbGYuX2NvbGxlY3Rpb24ucGF1c2VPYnNlcnZlcnMoKTtcblxuICAgICAgICBpZiAocmVzZXQpIGF3YWl0IHNlbGYuX2NvbGxlY3Rpb24ucmVtb3ZlQXN5bmMoe30pO1xuICAgICAgfSxcblxuICAgICAgYXN5bmMgdXBkYXRlKG1zZykge1xuICAgICAgICB2YXIgbW9uZ29JZCA9IE1vbmdvSUQuaWRQYXJzZShtc2cuaWQpO1xuICAgICAgICB2YXIgZG9jID0gc2VsZi5fY29sbGVjdGlvbi5fZG9jcy5nZXQobW9uZ29JZCk7XG5cbiAgICAgICAgLy8gSXMgdGhpcyBhIFwicmVwbGFjZSB0aGUgd2hvbGUgZG9jXCIgbWVzc2FnZSBjb21pbmcgZnJvbSB0aGUgcXVpZXNjZW5jZVxuICAgICAgICAvLyBvZiBtZXRob2Qgd3JpdGVzIHRvIGFuIG9iamVjdD8gKE5vdGUgdGhhdCAndW5kZWZpbmVkJyBpcyBhIHZhbGlkXG4gICAgICAgIC8vIHZhbHVlIG1lYW5pbmcgXCJyZW1vdmUgaXRcIi4pXG4gICAgICAgIGlmIChtc2cubXNnID09PSAncmVwbGFjZScpIHtcbiAgICAgICAgICB2YXIgcmVwbGFjZSA9IG1zZy5yZXBsYWNlO1xuICAgICAgICAgIGlmICghcmVwbGFjZSkge1xuICAgICAgICAgICAgaWYgKGRvYykgYXdhaXQgc2VsZi5fY29sbGVjdGlvbi5yZW1vdmVBc3luYyhtb25nb0lkKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKCFkb2MpIHtcbiAgICAgICAgICAgIGF3YWl0IHNlbGYuX2NvbGxlY3Rpb24uaW5zZXJ0QXN5bmMocmVwbGFjZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFhYWCBjaGVjayB0aGF0IHJlcGxhY2UgaGFzIG5vICQgb3BzXG4gICAgICAgICAgICBhd2FpdCBzZWxmLl9jb2xsZWN0aW9uLnVwZGF0ZUFzeW5jKG1vbmdvSWQsIHJlcGxhY2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAobXNnLm1zZyA9PT0gJ2FkZGVkJykge1xuICAgICAgICAgIGlmIChkb2MpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgJ0V4cGVjdGVkIG5vdCB0byBmaW5kIGEgZG9jdW1lbnQgYWxyZWFkeSBwcmVzZW50IGZvciBhbiBhZGQnXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBhd2FpdCBzZWxmLl9jb2xsZWN0aW9uLmluc2VydEFzeW5jKHsgX2lkOiBtb25nb0lkLCAuLi5tc2cuZmllbGRzIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKG1zZy5tc2cgPT09ICdyZW1vdmVkJykge1xuICAgICAgICAgIGlmICghZG9jKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAnRXhwZWN0ZWQgdG8gZmluZCBhIGRvY3VtZW50IGFscmVhZHkgcHJlc2VudCBmb3IgcmVtb3ZlZCdcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgYXdhaXQgc2VsZi5fY29sbGVjdGlvbi5yZW1vdmVBc3luYyhtb25nb0lkKTtcbiAgICAgICAgfSBlbHNlIGlmIChtc2cubXNnID09PSAnY2hhbmdlZCcpIHtcbiAgICAgICAgICBpZiAoIWRvYykgdGhyb3cgbmV3IEVycm9yKCdFeHBlY3RlZCB0byBmaW5kIGEgZG9jdW1lbnQgdG8gY2hhbmdlJyk7XG4gICAgICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKG1zZy5maWVsZHMpO1xuICAgICAgICAgIGlmIChrZXlzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHZhciBtb2RpZmllciA9IHt9O1xuICAgICAgICAgICAga2V5cy5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gbXNnLmZpZWxkc1trZXldO1xuICAgICAgICAgICAgICBpZiAoRUpTT04uZXF1YWxzKGRvY1trZXldLCB2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBpZiAoIW1vZGlmaWVyLiR1bnNldCkge1xuICAgICAgICAgICAgICAgICAgbW9kaWZpZXIuJHVuc2V0ID0ge307XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG1vZGlmaWVyLiR1bnNldFtrZXldID0gMTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoIW1vZGlmaWVyLiRzZXQpIHtcbiAgICAgICAgICAgICAgICAgIG1vZGlmaWVyLiRzZXQgPSB7fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbW9kaWZpZXIuJHNldFtrZXldID0gdmFsdWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKG1vZGlmaWVyKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgIGF3YWl0IHNlbGYuX2NvbGxlY3Rpb24udXBkYXRlQXN5bmMobW9uZ29JZCwgbW9kaWZpZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJIGRvbid0IGtub3cgaG93IHRvIGRlYWwgd2l0aCB0aGlzIG1lc3NhZ2VcIik7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIC8vIENhbGxlZCBhdCB0aGUgZW5kIG9mIGEgYmF0Y2ggb2YgdXBkYXRlcy5cbiAgICAgIGFzeW5jIGVuZFVwZGF0ZSgpIHtcbiAgICAgICAgYXdhaXQgc2VsZi5fY29sbGVjdGlvbi5yZXN1bWVPYnNlcnZlcnNTZXJ2ZXIoKTtcbiAgICAgIH0sXG5cbiAgICAgIC8vIFVzZWQgdG8gcHJlc2VydmUgY3VycmVudCB2ZXJzaW9ucyBvZiBkb2N1bWVudHMgYWNyb3NzIGEgc3RvcmUgcmVzZXQuXG4gICAgICBhc3luYyBnZXREb2MoaWQpIHtcbiAgICAgICAgcmV0dXJuIHNlbGYuZmluZE9uZUFzeW5jKGlkKTtcbiAgICAgIH0sXG4gICAgICAuLi53cmFwcGVkU3RvcmVDb21tb24sXG4gICAgfTtcblxuXG4gICAgLy8gT0ssIHdlJ3JlIGdvaW5nIHRvIGJlIGEgc2xhdmUsIHJlcGxpY2F0aW5nIHNvbWUgcmVtb3RlXG4gICAgLy8gZGF0YWJhc2UsIGV4Y2VwdCBwb3NzaWJseSB3aXRoIHNvbWUgdGVtcG9yYXJ5IGRpdmVyZ2VuY2Ugd2hpbGVcbiAgICAvLyB3ZSBoYXZlIHVuYWNrbm93bGVkZ2VkIFJQQydzLlxuICAgIGxldCByZWdpc3RlclN0b3JlUmVzdWx0O1xuICAgIGlmIChNZXRlb3IuaXNDbGllbnQpIHtcbiAgICAgIHJlZ2lzdGVyU3RvcmVSZXN1bHQgPSBzZWxmLl9jb25uZWN0aW9uLnJlZ2lzdGVyU3RvcmVDbGllbnQoXG4gICAgICAgIG5hbWUsXG4gICAgICAgIHdyYXBwZWRTdG9yZUNsaWVudFxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVnaXN0ZXJTdG9yZVJlc3VsdCA9IHNlbGYuX2Nvbm5lY3Rpb24ucmVnaXN0ZXJTdG9yZVNlcnZlcihcbiAgICAgICAgbmFtZSxcbiAgICAgICAgd3JhcHBlZFN0b3JlU2VydmVyXG4gICAgICApO1xuICAgIH1cblxuICAgIGNvbnN0IG1lc3NhZ2UgPSBgVGhlcmUgaXMgYWxyZWFkeSBhIGNvbGxlY3Rpb24gbmFtZWQgXCIke25hbWV9XCJgO1xuICAgIGNvbnN0IGxvZ1dhcm4gPSAoKSA9PiB7XG4gICAgICBjb25zb2xlLndhcm4gPyBjb25zb2xlLndhcm4obWVzc2FnZSkgOiBjb25zb2xlLmxvZyhtZXNzYWdlKTtcbiAgICB9O1xuXG4gICAgaWYgKCFyZWdpc3RlclN0b3JlUmVzdWx0KSB7XG4gICAgICByZXR1cm4gbG9nV2FybigpO1xuICAgIH1cblxuICAgIHJldHVybiByZWdpc3RlclN0b3JlUmVzdWx0Py50aGVuPy4ob2sgPT4ge1xuICAgICAgaWYgKCFvaykge1xuICAgICAgICBsb2dXYXJuKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG59IiwiZXhwb3J0IGNvbnN0IFN5bmNNZXRob2RzID0ge1xuICAvKipcbiAgICogQHN1bW1hcnkgRmluZCB0aGUgZG9jdW1lbnRzIGluIGEgY29sbGVjdGlvbiB0aGF0IG1hdGNoIHRoZSBzZWxlY3Rvci5cbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZXRob2QgZmluZFxuICAgKiBAbWVtYmVyb2YgTW9uZ28uQ29sbGVjdGlvblxuICAgKiBAaW5zdGFuY2VcbiAgICogQHBhcmFtIHtNb25nb1NlbGVjdG9yfSBbc2VsZWN0b3JdIEEgcXVlcnkgZGVzY3JpYmluZyB0aGUgZG9jdW1lbnRzIHRvIGZpbmRcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICAgKiBAcGFyYW0ge01vbmdvU29ydFNwZWNpZmllcn0gb3B0aW9ucy5zb3J0IFNvcnQgb3JkZXIgKGRlZmF1bHQ6IG5hdHVyYWwgb3JkZXIpXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBvcHRpb25zLnNraXAgTnVtYmVyIG9mIHJlc3VsdHMgdG8gc2tpcCBhdCB0aGUgYmVnaW5uaW5nXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBvcHRpb25zLmxpbWl0IE1heGltdW0gbnVtYmVyIG9mIHJlc3VsdHMgdG8gcmV0dXJuXG4gICAqIEBwYXJhbSB7TW9uZ29GaWVsZFNwZWNpZmllcn0gb3B0aW9ucy5maWVsZHMgRGljdGlvbmFyeSBvZiBmaWVsZHMgdG8gcmV0dXJuIG9yIGV4Y2x1ZGUuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy5yZWFjdGl2ZSAoQ2xpZW50IG9ubHkpIERlZmF1bHQgYHRydWVgOyBwYXNzIGBmYWxzZWAgdG8gZGlzYWJsZSByZWFjdGl2aXR5XG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IG9wdGlvbnMudHJhbnNmb3JtIE92ZXJyaWRlcyBgdHJhbnNmb3JtYCBvbiB0aGUgIFtgQ29sbGVjdGlvbmBdKCNjb2xsZWN0aW9ucykgZm9yIHRoaXMgY3Vyc29yLiAgUGFzcyBgbnVsbGAgdG8gZGlzYWJsZSB0cmFuc2Zvcm1hdGlvbi5cbiAgICogQHBhcmFtIHtCb29sZWFufSBvcHRpb25zLmRpc2FibGVPcGxvZyAoU2VydmVyIG9ubHkpIFBhc3MgdHJ1ZSB0byBkaXNhYmxlIG9wbG9nLXRhaWxpbmcgb24gdGhpcyBxdWVyeS4gVGhpcyBhZmZlY3RzIHRoZSB3YXkgc2VydmVyIHByb2Nlc3NlcyBjYWxscyB0byBgb2JzZXJ2ZWAgb24gdGhpcyBxdWVyeS4gRGlzYWJsaW5nIHRoZSBvcGxvZyBjYW4gYmUgdXNlZnVsIHdoZW4gd29ya2luZyB3aXRoIGRhdGEgdGhhdCB1cGRhdGVzIGluIGxhcmdlIGJhdGNoZXMuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBvcHRpb25zLnBvbGxpbmdJbnRlcnZhbE1zIChTZXJ2ZXIgb25seSkgV2hlbiBvcGxvZyBpcyBkaXNhYmxlZCAodGhyb3VnaCB0aGUgdXNlIG9mIGBkaXNhYmxlT3Bsb2dgIG9yIHdoZW4gb3RoZXJ3aXNlIG5vdCBhdmFpbGFibGUpLCB0aGUgZnJlcXVlbmN5IChpbiBtaWxsaXNlY29uZHMpIG9mIGhvdyBvZnRlbiB0byBwb2xsIHRoaXMgcXVlcnkgd2hlbiBvYnNlcnZpbmcgb24gdGhlIHNlcnZlci4gRGVmYXVsdHMgdG8gMTAwMDBtcyAoMTAgc2Vjb25kcykuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBvcHRpb25zLnBvbGxpbmdUaHJvdHRsZU1zIChTZXJ2ZXIgb25seSkgV2hlbiBvcGxvZyBpcyBkaXNhYmxlZCAodGhyb3VnaCB0aGUgdXNlIG9mIGBkaXNhYmxlT3Bsb2dgIG9yIHdoZW4gb3RoZXJ3aXNlIG5vdCBhdmFpbGFibGUpLCB0aGUgbWluaW11bSB0aW1lIChpbiBtaWxsaXNlY29uZHMpIHRvIGFsbG93IGJldHdlZW4gcmUtcG9sbGluZyB3aGVuIG9ic2VydmluZyBvbiB0aGUgc2VydmVyLiBJbmNyZWFzaW5nIHRoaXMgd2lsbCBzYXZlIENQVSBhbmQgbW9uZ28gbG9hZCBhdCB0aGUgZXhwZW5zZSBvZiBzbG93ZXIgdXBkYXRlcyB0byB1c2Vycy4gRGVjcmVhc2luZyB0aGlzIGlzIG5vdCByZWNvbW1lbmRlZC4gRGVmYXVsdHMgdG8gNTBtcy5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IG9wdGlvbnMubWF4VGltZU1zIChTZXJ2ZXIgb25seSkgSWYgc2V0LCBpbnN0cnVjdHMgTW9uZ29EQiB0byBzZXQgYSB0aW1lIGxpbWl0IGZvciB0aGlzIGN1cnNvcidzIG9wZXJhdGlvbnMuIElmIHRoZSBvcGVyYXRpb24gcmVhY2hlcyB0aGUgc3BlY2lmaWVkIHRpbWUgbGltaXQgKGluIG1pbGxpc2Vjb25kcykgd2l0aG91dCB0aGUgaGF2aW5nIGJlZW4gY29tcGxldGVkLCBhbiBleGNlcHRpb24gd2lsbCBiZSB0aHJvd24uIFVzZWZ1bCB0byBwcmV2ZW50IGFuIChhY2NpZGVudGFsIG9yIG1hbGljaW91cykgdW5vcHRpbWl6ZWQgcXVlcnkgZnJvbSBjYXVzaW5nIGEgZnVsbCBjb2xsZWN0aW9uIHNjYW4gdGhhdCB3b3VsZCBkaXNydXB0IG90aGVyIGRhdGFiYXNlIHVzZXJzLCBhdCB0aGUgZXhwZW5zZSBvZiBuZWVkaW5nIHRvIGhhbmRsZSB0aGUgcmVzdWx0aW5nIGVycm9yLlxuICAgKiBAcGFyYW0ge1N0cmluZ3xPYmplY3R9IG9wdGlvbnMuaGludCAoU2VydmVyIG9ubHkpIE92ZXJyaWRlcyBNb25nb0RCJ3MgZGVmYXVsdCBpbmRleCBzZWxlY3Rpb24gYW5kIHF1ZXJ5IG9wdGltaXphdGlvbiBwcm9jZXNzLiBTcGVjaWZ5IGFuIGluZGV4IHRvIGZvcmNlIGl0cyB1c2UsIGVpdGhlciBieSBpdHMgbmFtZSBvciBpbmRleCBzcGVjaWZpY2F0aW9uLiBZb3UgY2FuIGFsc28gc3BlY2lmeSBgeyAkbmF0dXJhbCA6IDEgfWAgdG8gZm9yY2UgYSBmb3J3YXJkcyBjb2xsZWN0aW9uIHNjYW4sIG9yIGB7ICRuYXR1cmFsIDogLTEgfWAgZm9yIGEgcmV2ZXJzZSBjb2xsZWN0aW9uIHNjYW4uIFNldHRpbmcgdGhpcyBpcyBvbmx5IHJlY29tbWVuZGVkIGZvciBhZHZhbmNlZCB1c2Vycy5cbiAgICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMucmVhZFByZWZlcmVuY2UgKFNlcnZlciBvbmx5KSBTcGVjaWZpZXMgYSBjdXN0b20gTW9uZ29EQiBbYHJlYWRQcmVmZXJlbmNlYF0oaHR0cHM6Ly9kb2NzLm1vbmdvZGIuY29tL21hbnVhbC9jb3JlL3JlYWQtcHJlZmVyZW5jZSkgZm9yIHRoaXMgcGFydGljdWxhciBjdXJzb3IuIFBvc3NpYmxlIHZhbHVlcyBhcmUgYHByaW1hcnlgLCBgcHJpbWFyeVByZWZlcnJlZGAsIGBzZWNvbmRhcnlgLCBgc2Vjb25kYXJ5UHJlZmVycmVkYCBhbmQgYG5lYXJlc3RgLlxuICAgKiBAcmV0dXJucyB7TW9uZ28uQ3Vyc29yfVxuICAgKi9cbiAgZmluZCguLi5hcmdzKSB7XG4gICAgLy8gQ29sbGVjdGlvbi5maW5kKCkgKHJldHVybiBhbGwgZG9jcykgYmVoYXZlcyBkaWZmZXJlbnRseVxuICAgIC8vIGZyb20gQ29sbGVjdGlvbi5maW5kKHVuZGVmaW5lZCkgKHJldHVybiAwIGRvY3MpLiAgc28gYmVcbiAgICAvLyBjYXJlZnVsIGFib3V0IHRoZSBsZW5ndGggb2YgYXJndW1lbnRzLlxuICAgIHJldHVybiB0aGlzLl9jb2xsZWN0aW9uLmZpbmQoXG4gICAgICB0aGlzLl9nZXRGaW5kU2VsZWN0b3IoYXJncyksXG4gICAgICB0aGlzLl9nZXRGaW5kT3B0aW9ucyhhcmdzKVxuICAgICk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IEZpbmRzIHRoZSBmaXJzdCBkb2N1bWVudCB0aGF0IG1hdGNoZXMgdGhlIHNlbGVjdG9yLCBhcyBvcmRlcmVkIGJ5IHNvcnQgYW5kIHNraXAgb3B0aW9ucy4gUmV0dXJucyBgdW5kZWZpbmVkYCBpZiBubyBtYXRjaGluZyBkb2N1bWVudCBpcyBmb3VuZC5cbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZXRob2QgZmluZE9uZVxuICAgKiBAbWVtYmVyb2YgTW9uZ28uQ29sbGVjdGlvblxuICAgKiBAaW5zdGFuY2VcbiAgICogQHBhcmFtIHtNb25nb1NlbGVjdG9yfSBbc2VsZWN0b3JdIEEgcXVlcnkgZGVzY3JpYmluZyB0aGUgZG9jdW1lbnRzIHRvIGZpbmRcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICAgKiBAcGFyYW0ge01vbmdvU29ydFNwZWNpZmllcn0gb3B0aW9ucy5zb3J0IFNvcnQgb3JkZXIgKGRlZmF1bHQ6IG5hdHVyYWwgb3JkZXIpXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBvcHRpb25zLnNraXAgTnVtYmVyIG9mIHJlc3VsdHMgdG8gc2tpcCBhdCB0aGUgYmVnaW5uaW5nXG4gICAqIEBwYXJhbSB7TW9uZ29GaWVsZFNwZWNpZmllcn0gb3B0aW9ucy5maWVsZHMgRGljdGlvbmFyeSBvZiBmaWVsZHMgdG8gcmV0dXJuIG9yIGV4Y2x1ZGUuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy5yZWFjdGl2ZSAoQ2xpZW50IG9ubHkpIERlZmF1bHQgdHJ1ZTsgcGFzcyBmYWxzZSB0byBkaXNhYmxlIHJlYWN0aXZpdHlcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gb3B0aW9ucy50cmFuc2Zvcm0gT3ZlcnJpZGVzIGB0cmFuc2Zvcm1gIG9uIHRoZSBbYENvbGxlY3Rpb25gXSgjY29sbGVjdGlvbnMpIGZvciB0aGlzIGN1cnNvci4gIFBhc3MgYG51bGxgIHRvIGRpc2FibGUgdHJhbnNmb3JtYXRpb24uXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBvcHRpb25zLnJlYWRQcmVmZXJlbmNlIChTZXJ2ZXIgb25seSkgU3BlY2lmaWVzIGEgY3VzdG9tIE1vbmdvREIgW2ByZWFkUHJlZmVyZW5jZWBdKGh0dHBzOi8vZG9jcy5tb25nb2RiLmNvbS9tYW51YWwvY29yZS9yZWFkLXByZWZlcmVuY2UpIGZvciBmZXRjaGluZyB0aGUgZG9jdW1lbnQuIFBvc3NpYmxlIHZhbHVlcyBhcmUgYHByaW1hcnlgLCBgcHJpbWFyeVByZWZlcnJlZGAsIGBzZWNvbmRhcnlgLCBgc2Vjb25kYXJ5UHJlZmVycmVkYCBhbmQgYG5lYXJlc3RgLlxuICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgKi9cbiAgZmluZE9uZSguLi5hcmdzKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbGxlY3Rpb24uZmluZE9uZShcbiAgICAgIHRoaXMuX2dldEZpbmRTZWxlY3RvcihhcmdzKSxcbiAgICAgIHRoaXMuX2dldEZpbmRPcHRpb25zKGFyZ3MpXG4gICAgKTtcbiAgfSxcblxuXG4gIC8vICdpbnNlcnQnIGltbWVkaWF0ZWx5IHJldHVybnMgdGhlIGluc2VydGVkIGRvY3VtZW50J3MgbmV3IF9pZC5cbiAgLy8gVGhlIG90aGVycyByZXR1cm4gdmFsdWVzIGltbWVkaWF0ZWx5IGlmIHlvdSBhcmUgaW4gYSBzdHViLCBhbiBpbi1tZW1vcnlcbiAgLy8gdW5tYW5hZ2VkIGNvbGxlY3Rpb24sIG9yIGEgbW9uZ28tYmFja2VkIGNvbGxlY3Rpb24gYW5kIHlvdSBkb24ndCBwYXNzIGFcbiAgLy8gY2FsbGJhY2suICd1cGRhdGUnIGFuZCAncmVtb3ZlJyByZXR1cm4gdGhlIG51bWJlciBvZiBhZmZlY3RlZFxuICAvLyBkb2N1bWVudHMuICd1cHNlcnQnIHJldHVybnMgYW4gb2JqZWN0IHdpdGgga2V5cyAnbnVtYmVyQWZmZWN0ZWQnIGFuZCwgaWYgYW5cbiAgLy8gaW5zZXJ0IGhhcHBlbmVkLCAnaW5zZXJ0ZWRJZCcuXG4gIC8vXG4gIC8vIE90aGVyd2lzZSwgdGhlIHNlbWFudGljcyBhcmUgZXhhY3RseSBsaWtlIG90aGVyIG1ldGhvZHM6IHRoZXkgdGFrZVxuICAvLyBhIGNhbGxiYWNrIGFzIGFuIG9wdGlvbmFsIGxhc3QgYXJndW1lbnQ7IGlmIG5vIGNhbGxiYWNrIGlzXG4gIC8vIHByb3ZpZGVkLCB0aGV5IGJsb2NrIHVudGlsIHRoZSBvcGVyYXRpb24gaXMgY29tcGxldGUsIGFuZCB0aHJvdyBhblxuICAvLyBleGNlcHRpb24gaWYgaXQgZmFpbHM7IGlmIGEgY2FsbGJhY2sgaXMgcHJvdmlkZWQsIHRoZW4gdGhleSBkb24ndFxuICAvLyBuZWNlc3NhcmlseSBibG9jaywgYW5kIHRoZXkgY2FsbCB0aGUgY2FsbGJhY2sgd2hlbiB0aGV5IGZpbmlzaCB3aXRoIGVycm9yIGFuZFxuICAvLyByZXN1bHQgYXJndW1lbnRzLiAgKFRoZSBpbnNlcnQgbWV0aG9kIHByb3ZpZGVzIHRoZSBkb2N1bWVudCBJRCBhcyBpdHMgcmVzdWx0O1xuICAvLyB1cGRhdGUgYW5kIHJlbW92ZSBwcm92aWRlIHRoZSBudW1iZXIgb2YgYWZmZWN0ZWQgZG9jcyBhcyB0aGUgcmVzdWx0OyB1cHNlcnRcbiAgLy8gcHJvdmlkZXMgYW4gb2JqZWN0IHdpdGggbnVtYmVyQWZmZWN0ZWQgYW5kIG1heWJlIGluc2VydGVkSWQuKVxuICAvL1xuICAvLyBPbiB0aGUgY2xpZW50LCBibG9ja2luZyBpcyBpbXBvc3NpYmxlLCBzbyBpZiBhIGNhbGxiYWNrXG4gIC8vIGlzbid0IHByb3ZpZGVkLCB0aGV5IGp1c3QgcmV0dXJuIGltbWVkaWF0ZWx5IGFuZCBhbnkgZXJyb3JcbiAgLy8gaW5mb3JtYXRpb24gaXMgbG9zdC5cbiAgLy9cbiAgLy8gVGhlcmUncyBvbmUgbW9yZSB0d2Vhay4gT24gdGhlIGNsaWVudCwgaWYgeW91IGRvbid0IHByb3ZpZGUgYVxuICAvLyBjYWxsYmFjaywgdGhlbiBpZiB0aGVyZSBpcyBhbiBlcnJvciwgYSBtZXNzYWdlIHdpbGwgYmUgbG9nZ2VkIHdpdGhcbiAgLy8gTWV0ZW9yLl9kZWJ1Zy5cbiAgLy9cbiAgLy8gVGhlIGludGVudCAodGhvdWdoIHRoaXMgaXMgYWN0dWFsbHkgZGV0ZXJtaW5lZCBieSB0aGUgdW5kZXJseWluZ1xuICAvLyBkcml2ZXJzKSBpcyB0aGF0IHRoZSBvcGVyYXRpb25zIHNob3VsZCBiZSBkb25lIHN5bmNocm9ub3VzbHksIG5vdFxuICAvLyBnZW5lcmF0aW5nIHRoZWlyIHJlc3VsdCB1bnRpbCB0aGUgZGF0YWJhc2UgaGFzIGFja25vd2xlZGdlZFxuICAvLyB0aGVtLiBJbiB0aGUgZnV0dXJlIG1heWJlIHdlIHNob3VsZCBwcm92aWRlIGEgZmxhZyB0byB0dXJuIHRoaXNcbiAgLy8gb2ZmLlxuXG4gIF9pbnNlcnQoZG9jLCBjYWxsYmFjaykge1xuICAgIC8vIE1ha2Ugc3VyZSB3ZSB3ZXJlIHBhc3NlZCBhIGRvY3VtZW50IHRvIGluc2VydFxuICAgIGlmICghZG9jKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2luc2VydCByZXF1aXJlcyBhbiBhcmd1bWVudCcpO1xuICAgIH1cblxuXG4gICAgLy8gTWFrZSBhIHNoYWxsb3cgY2xvbmUgb2YgdGhlIGRvY3VtZW50LCBwcmVzZXJ2aW5nIGl0cyBwcm90b3R5cGUuXG4gICAgZG9jID0gT2JqZWN0LmNyZWF0ZShcbiAgICAgIE9iamVjdC5nZXRQcm90b3R5cGVPZihkb2MpLFxuICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoZG9jKVxuICAgICk7XG5cbiAgICBpZiAoJ19pZCcgaW4gZG9jKSB7XG4gICAgICBpZiAoXG4gICAgICAgICFkb2MuX2lkIHx8XG4gICAgICAgICEodHlwZW9mIGRvYy5faWQgPT09ICdzdHJpbmcnIHx8IGRvYy5faWQgaW5zdGFuY2VvZiBNb25nby5PYmplY3RJRClcbiAgICAgICkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgJ01ldGVvciByZXF1aXJlcyBkb2N1bWVudCBfaWQgZmllbGRzIHRvIGJlIG5vbi1lbXB0eSBzdHJpbmdzIG9yIE9iamVjdElEcydcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IGdlbmVyYXRlSWQgPSB0cnVlO1xuXG4gICAgICAvLyBEb24ndCBnZW5lcmF0ZSB0aGUgaWQgaWYgd2UncmUgdGhlIGNsaWVudCBhbmQgdGhlICdvdXRlcm1vc3QnIGNhbGxcbiAgICAgIC8vIFRoaXMgb3B0aW1pemF0aW9uIHNhdmVzIHVzIHBhc3NpbmcgYm90aCB0aGUgcmFuZG9tU2VlZCBhbmQgdGhlIGlkXG4gICAgICAvLyBQYXNzaW5nIGJvdGggaXMgcmVkdW5kYW50LlxuICAgICAgaWYgKHRoaXMuX2lzUmVtb3RlQ29sbGVjdGlvbigpKSB7XG4gICAgICAgIGNvbnN0IGVuY2xvc2luZyA9IEREUC5fQ3VycmVudE1ldGhvZEludm9jYXRpb24uZ2V0KCk7XG4gICAgICAgIGlmICghZW5jbG9zaW5nKSB7XG4gICAgICAgICAgZ2VuZXJhdGVJZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChnZW5lcmF0ZUlkKSB7XG4gICAgICAgIGRvYy5faWQgPSB0aGlzLl9tYWtlTmV3SUQoKTtcbiAgICAgIH1cbiAgICB9XG5cblxuICAgIC8vIE9uIGluc2VydHMsIGFsd2F5cyByZXR1cm4gdGhlIGlkIHRoYXQgd2UgZ2VuZXJhdGVkOyBvbiBhbGwgb3RoZXJcbiAgICAvLyBvcGVyYXRpb25zLCBqdXN0IHJldHVybiB0aGUgcmVzdWx0IGZyb20gdGhlIGNvbGxlY3Rpb24uXG4gICAgdmFyIGNob29zZVJldHVyblZhbHVlRnJvbUNvbGxlY3Rpb25SZXN1bHQgPSBmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgIGlmIChNZXRlb3IuX2lzUHJvbWlzZShyZXN1bHQpKSByZXR1cm4gcmVzdWx0O1xuXG4gICAgICBpZiAoZG9jLl9pZCkge1xuICAgICAgICByZXR1cm4gZG9jLl9pZDtcbiAgICAgIH1cblxuICAgICAgLy8gWFhYIHdoYXQgaXMgdGhpcyBmb3I/P1xuICAgICAgLy8gSXQncyBzb21lIGl0ZXJhY3Rpb24gYmV0d2VlbiB0aGUgY2FsbGJhY2sgdG8gX2NhbGxNdXRhdG9yTWV0aG9kIGFuZFxuICAgICAgLy8gdGhlIHJldHVybiB2YWx1ZSBjb252ZXJzaW9uXG4gICAgICBkb2MuX2lkID0gcmVzdWx0O1xuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICBjb25zdCB3cmFwcGVkQ2FsbGJhY2sgPSB3cmFwQ2FsbGJhY2soXG4gICAgICBjYWxsYmFjayxcbiAgICAgIGNob29zZVJldHVyblZhbHVlRnJvbUNvbGxlY3Rpb25SZXN1bHRcbiAgICApO1xuXG4gICAgaWYgKHRoaXMuX2lzUmVtb3RlQ29sbGVjdGlvbigpKSB7XG4gICAgICBjb25zdCByZXN1bHQgPSB0aGlzLl9jYWxsTXV0YXRvck1ldGhvZCgnaW5zZXJ0JywgW2RvY10sIHdyYXBwZWRDYWxsYmFjayk7XG4gICAgICByZXR1cm4gY2hvb3NlUmV0dXJuVmFsdWVGcm9tQ29sbGVjdGlvblJlc3VsdChyZXN1bHQpO1xuICAgIH1cblxuICAgIC8vIGl0J3MgbXkgY29sbGVjdGlvbi4gIGRlc2NlbmQgaW50byB0aGUgY29sbGVjdGlvbiBvYmplY3RcbiAgICAvLyBhbmQgcHJvcGFnYXRlIGFueSBleGNlcHRpb24uXG4gICAgdHJ5IHtcbiAgICAgIC8vIElmIHRoZSB1c2VyIHByb3ZpZGVkIGEgY2FsbGJhY2sgYW5kIHRoZSBjb2xsZWN0aW9uIGltcGxlbWVudHMgdGhpc1xuICAgICAgLy8gb3BlcmF0aW9uIGFzeW5jaHJvbm91c2x5LCB0aGVuIHF1ZXJ5UmV0IHdpbGwgYmUgdW5kZWZpbmVkLCBhbmQgdGhlXG4gICAgICAvLyByZXN1bHQgd2lsbCBiZSByZXR1cm5lZCB0aHJvdWdoIHRoZSBjYWxsYmFjayBpbnN0ZWFkLlxuICAgICAgbGV0IHJlc3VsdDtcbiAgICAgIGlmICghIXdyYXBwZWRDYWxsYmFjaykge1xuICAgICAgICB0aGlzLl9jb2xsZWN0aW9uLmluc2VydChkb2MsIHdyYXBwZWRDYWxsYmFjayk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBJZiB3ZSBkb24ndCBoYXZlIHRoZSBjYWxsYmFjaywgd2UgYXNzdW1lIHRoZSB1c2VyIGlzIHVzaW5nIHRoZSBwcm9taXNlLlxuICAgICAgICAvLyBXZSBjYW4ndCBqdXN0IHBhc3MgdGhpcy5fY29sbGVjdGlvbi5pbnNlcnQgdG8gdGhlIHByb21pc2lmeSBiZWNhdXNlIGl0IHdvdWxkIGxvc2UgdGhlIGNvbnRleHQuXG4gICAgICAgIHJlc3VsdCA9IHRoaXMuX2NvbGxlY3Rpb24uaW5zZXJ0KGRvYyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBjaG9vc2VSZXR1cm5WYWx1ZUZyb21Db2xsZWN0aW9uUmVzdWx0KHJlc3VsdCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrKGUpO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBJbnNlcnQgYSBkb2N1bWVudCBpbiB0aGUgY29sbGVjdGlvbi4gIFJldHVybnMgaXRzIHVuaXF1ZSBfaWQuXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWV0aG9kICBpbnNlcnRcbiAgICogQG1lbWJlcm9mIE1vbmdvLkNvbGxlY3Rpb25cbiAgICogQGluc3RhbmNlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBkb2MgVGhlIGRvY3VtZW50IHRvIGluc2VydC4gTWF5IG5vdCB5ZXQgaGF2ZSBhbiBfaWQgYXR0cmlidXRlLCBpbiB3aGljaCBjYXNlIE1ldGVvciB3aWxsIGdlbmVyYXRlIG9uZSBmb3IgeW91LlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2tdIE9wdGlvbmFsLiAgSWYgcHJlc2VudCwgY2FsbGVkIHdpdGggYW4gZXJyb3Igb2JqZWN0IGFzIHRoZSBmaXJzdCBhcmd1bWVudCBhbmQsIGlmIG5vIGVycm9yLCB0aGUgX2lkIGFzIHRoZSBzZWNvbmQuXG4gICAqL1xuICBpbnNlcnQoZG9jLCBjYWxsYmFjaykge1xuICAgIHJldHVybiB0aGlzLl9pbnNlcnQoZG9jLCBjYWxsYmFjayk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBzdW1tYXJ5IEFzeW5jaHJvbm91c2x5IG1vZGlmaWVzIG9uZSBvciBtb3JlIGRvY3VtZW50cyBpbiB0aGUgY29sbGVjdGlvbi4gUmV0dXJucyB0aGUgbnVtYmVyIG9mIG1hdGNoZWQgZG9jdW1lbnRzLlxuICAgKiBAbG9jdXMgQW55d2hlcmVcbiAgICogQG1ldGhvZCB1cGRhdGVcbiAgICogQG1lbWJlcm9mIE1vbmdvLkNvbGxlY3Rpb25cbiAgICogQGluc3RhbmNlXG4gICAqIEBwYXJhbSB7TW9uZ29TZWxlY3Rvcn0gc2VsZWN0b3IgU3BlY2lmaWVzIHdoaWNoIGRvY3VtZW50cyB0byBtb2RpZnlcbiAgICogQHBhcmFtIHtNb25nb01vZGlmaWVyfSBtb2RpZmllciBTcGVjaWZpZXMgaG93IHRvIG1vZGlmeSB0aGUgZG9jdW1lbnRzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAgICogQHBhcmFtIHtCb29sZWFufSBvcHRpb25zLm11bHRpIFRydWUgdG8gbW9kaWZ5IGFsbCBtYXRjaGluZyBkb2N1bWVudHM7IGZhbHNlIHRvIG9ubHkgbW9kaWZ5IG9uZSBvZiB0aGUgbWF0Y2hpbmcgZG9jdW1lbnRzICh0aGUgZGVmYXVsdCkuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy51cHNlcnQgVHJ1ZSB0byBpbnNlcnQgYSBkb2N1bWVudCBpZiBubyBtYXRjaGluZyBkb2N1bWVudHMgYXJlIGZvdW5kLlxuICAgKiBAcGFyYW0ge0FycmF5fSBvcHRpb25zLmFycmF5RmlsdGVycyBPcHRpb25hbC4gVXNlZCBpbiBjb21iaW5hdGlvbiB3aXRoIE1vbmdvREIgW2ZpbHRlcmVkIHBvc2l0aW9uYWwgb3BlcmF0b3JdKGh0dHBzOi8vZG9jcy5tb25nb2RiLmNvbS9tYW51YWwvcmVmZXJlbmNlL29wZXJhdG9yL3VwZGF0ZS9wb3NpdGlvbmFsLWZpbHRlcmVkLykgdG8gc3BlY2lmeSB3aGljaCBlbGVtZW50cyB0byBtb2RpZnkgaW4gYW4gYXJyYXkgZmllbGQuXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYWxsYmFja10gT3B0aW9uYWwuICBJZiBwcmVzZW50LCBjYWxsZWQgd2l0aCBhbiBlcnJvciBvYmplY3QgYXMgdGhlIGZpcnN0IGFyZ3VtZW50IGFuZCwgaWYgbm8gZXJyb3IsIHRoZSBudW1iZXIgb2YgYWZmZWN0ZWQgZG9jdW1lbnRzIGFzIHRoZSBzZWNvbmQuXG4gICAqL1xuICB1cGRhdGUoc2VsZWN0b3IsIG1vZGlmaWVyLCAuLi5vcHRpb25zQW5kQ2FsbGJhY2spIHtcbiAgICBjb25zdCBjYWxsYmFjayA9IHBvcENhbGxiYWNrRnJvbUFyZ3Mob3B0aW9uc0FuZENhbGxiYWNrKTtcblxuICAgIC8vIFdlJ3ZlIGFscmVhZHkgcG9wcGVkIG9mZiB0aGUgY2FsbGJhY2ssIHNvIHdlIGFyZSBsZWZ0IHdpdGggYW4gYXJyYXlcbiAgICAvLyBvZiBvbmUgb3IgemVybyBpdGVtc1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7IC4uLihvcHRpb25zQW5kQ2FsbGJhY2tbMF0gfHwgbnVsbCkgfTtcbiAgICBsZXQgaW5zZXJ0ZWRJZDtcbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnVwc2VydCkge1xuICAgICAgLy8gc2V0IGBpbnNlcnRlZElkYCBpZiBhYnNlbnQuICBgaW5zZXJ0ZWRJZGAgaXMgYSBNZXRlb3IgZXh0ZW5zaW9uLlxuICAgICAgaWYgKG9wdGlvbnMuaW5zZXJ0ZWRJZCkge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgIShcbiAgICAgICAgICAgIHR5cGVvZiBvcHRpb25zLmluc2VydGVkSWQgPT09ICdzdHJpbmcnIHx8XG4gICAgICAgICAgICBvcHRpb25zLmluc2VydGVkSWQgaW5zdGFuY2VvZiBNb25nby5PYmplY3RJRFxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignaW5zZXJ0ZWRJZCBtdXN0IGJlIHN0cmluZyBvciBPYmplY3RJRCcpO1xuICAgICAgICBpbnNlcnRlZElkID0gb3B0aW9ucy5pbnNlcnRlZElkO1xuICAgICAgfSBlbHNlIGlmICghc2VsZWN0b3IgfHwgIXNlbGVjdG9yLl9pZCkge1xuICAgICAgICBpbnNlcnRlZElkID0gdGhpcy5fbWFrZU5ld0lEKCk7XG4gICAgICAgIG9wdGlvbnMuZ2VuZXJhdGVkSWQgPSB0cnVlO1xuICAgICAgICBvcHRpb25zLmluc2VydGVkSWQgPSBpbnNlcnRlZElkO1xuICAgICAgfVxuICAgIH1cblxuICAgIHNlbGVjdG9yID0gTW9uZ28uQ29sbGVjdGlvbi5fcmV3cml0ZVNlbGVjdG9yKHNlbGVjdG9yLCB7XG4gICAgICBmYWxsYmFja0lkOiBpbnNlcnRlZElkLFxuICAgIH0pO1xuXG4gICAgY29uc3Qgd3JhcHBlZENhbGxiYWNrID0gd3JhcENhbGxiYWNrKGNhbGxiYWNrKTtcblxuICAgIGlmICh0aGlzLl9pc1JlbW90ZUNvbGxlY3Rpb24oKSkge1xuICAgICAgY29uc3QgYXJncyA9IFtzZWxlY3RvciwgbW9kaWZpZXIsIG9wdGlvbnNdO1xuICAgICAgcmV0dXJuIHRoaXMuX2NhbGxNdXRhdG9yTWV0aG9kKCd1cGRhdGUnLCBhcmdzLCBjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgLy8gaXQncyBteSBjb2xsZWN0aW9uLiAgZGVzY2VuZCBpbnRvIHRoZSBjb2xsZWN0aW9uIG9iamVjdFxuICAgIC8vIGFuZCBwcm9wYWdhdGUgYW55IGV4Y2VwdGlvbi5cbiAgICAvLyBJZiB0aGUgdXNlciBwcm92aWRlZCBhIGNhbGxiYWNrIGFuZCB0aGUgY29sbGVjdGlvbiBpbXBsZW1lbnRzIHRoaXNcbiAgICAvLyBvcGVyYXRpb24gYXN5bmNocm9ub3VzbHksIHRoZW4gcXVlcnlSZXQgd2lsbCBiZSB1bmRlZmluZWQsIGFuZCB0aGVcbiAgICAvLyByZXN1bHQgd2lsbCBiZSByZXR1cm5lZCB0aHJvdWdoIHRoZSBjYWxsYmFjayBpbnN0ZWFkLlxuICAgIC8vY29uc29sZS5sb2coe2NhbGxiYWNrLCBvcHRpb25zLCBzZWxlY3RvciwgbW9kaWZpZXIsIGNvbGw6IHRoaXMuX2NvbGxlY3Rpb259KTtcbiAgICB0cnkge1xuICAgICAgLy8gSWYgdGhlIHVzZXIgcHJvdmlkZWQgYSBjYWxsYmFjayBhbmQgdGhlIGNvbGxlY3Rpb24gaW1wbGVtZW50cyB0aGlzXG4gICAgICAvLyBvcGVyYXRpb24gYXN5bmNocm9ub3VzbHksIHRoZW4gcXVlcnlSZXQgd2lsbCBiZSB1bmRlZmluZWQsIGFuZCB0aGVcbiAgICAgIC8vIHJlc3VsdCB3aWxsIGJlIHJldHVybmVkIHRocm91Z2ggdGhlIGNhbGxiYWNrIGluc3RlYWQuXG4gICAgICByZXR1cm4gdGhpcy5fY29sbGVjdGlvbi51cGRhdGUoXG4gICAgICAgIHNlbGVjdG9yLFxuICAgICAgICBtb2RpZmllcixcbiAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgd3JhcHBlZENhbGxiYWNrXG4gICAgICApO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayhlKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQHN1bW1hcnkgUmVtb3ZlIGRvY3VtZW50cyBmcm9tIHRoZSBjb2xsZWN0aW9uXG4gICAqIEBsb2N1cyBBbnl3aGVyZVxuICAgKiBAbWV0aG9kIHJlbW92ZVxuICAgKiBAbWVtYmVyb2YgTW9uZ28uQ29sbGVjdGlvblxuICAgKiBAaW5zdGFuY2VcbiAgICogQHBhcmFtIHtNb25nb1NlbGVjdG9yfSBzZWxlY3RvciBTcGVjaWZpZXMgd2hpY2ggZG9jdW1lbnRzIHRvIHJlbW92ZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2tdIE9wdGlvbmFsLiAgSWYgcHJlc2VudCwgY2FsbGVkIHdpdGggYW4gZXJyb3Igb2JqZWN0IGFzIHRoZSBmaXJzdCBhcmd1bWVudCBhbmQsIGlmIG5vIGVycm9yLCB0aGUgbnVtYmVyIG9mIGFmZmVjdGVkIGRvY3VtZW50cyBhcyB0aGUgc2Vjb25kLlxuICAgKi9cbiAgcmVtb3ZlKHNlbGVjdG9yLCBjYWxsYmFjaykge1xuICAgIHNlbGVjdG9yID0gTW9uZ28uQ29sbGVjdGlvbi5fcmV3cml0ZVNlbGVjdG9yKHNlbGVjdG9yKTtcblxuICAgIGlmICh0aGlzLl9pc1JlbW90ZUNvbGxlY3Rpb24oKSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NhbGxNdXRhdG9yTWV0aG9kKCdyZW1vdmUnLCBbc2VsZWN0b3JdLCBjYWxsYmFjayk7XG4gICAgfVxuXG5cbiAgICAvLyBpdCdzIG15IGNvbGxlY3Rpb24uICBkZXNjZW5kIGludG8gdGhlIGNvbGxlY3Rpb24xIG9iamVjdFxuICAgIC8vIGFuZCBwcm9wYWdhdGUgYW55IGV4Y2VwdGlvbi5cbiAgICByZXR1cm4gdGhpcy5fY29sbGVjdGlvbi5yZW1vdmUoc2VsZWN0b3IpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAc3VtbWFyeSBBc3luY2hyb25vdXNseSBtb2RpZmllcyBvbmUgb3IgbW9yZSBkb2N1bWVudHMgaW4gdGhlIGNvbGxlY3Rpb24sIG9yIGluc2VydCBvbmUgaWYgbm8gbWF0Y2hpbmcgZG9jdW1lbnRzIHdlcmUgZm91bmQuIFJldHVybnMgYW4gb2JqZWN0IHdpdGgga2V5cyBgbnVtYmVyQWZmZWN0ZWRgICh0aGUgbnVtYmVyIG9mIGRvY3VtZW50cyBtb2RpZmllZCkgIGFuZCBgaW5zZXJ0ZWRJZGAgKHRoZSB1bmlxdWUgX2lkIG9mIHRoZSBkb2N1bWVudCB0aGF0IHdhcyBpbnNlcnRlZCwgaWYgYW55KS5cbiAgICogQGxvY3VzIEFueXdoZXJlXG4gICAqIEBtZXRob2QgdXBzZXJ0XG4gICAqIEBtZW1iZXJvZiBNb25nby5Db2xsZWN0aW9uXG4gICAqIEBpbnN0YW5jZVxuICAgKiBAcGFyYW0ge01vbmdvU2VsZWN0b3J9IHNlbGVjdG9yIFNwZWNpZmllcyB3aGljaCBkb2N1bWVudHMgdG8gbW9kaWZ5XG4gICAqIEBwYXJhbSB7TW9uZ29Nb2RpZmllcn0gbW9kaWZpZXIgU3BlY2lmaWVzIGhvdyB0byBtb2RpZnkgdGhlIGRvY3VtZW50c1xuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gb3B0aW9ucy5tdWx0aSBUcnVlIHRvIG1vZGlmeSBhbGwgbWF0Y2hpbmcgZG9jdW1lbnRzOyBmYWxzZSB0byBvbmx5IG1vZGlmeSBvbmUgb2YgdGhlIG1hdGNoaW5nIGRvY3VtZW50cyAodGhlIGRlZmF1bHQpLlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2tdIE9wdGlvbmFsLiAgSWYgcHJlc2VudCwgY2FsbGVkIHdpdGggYW4gZXJyb3Igb2JqZWN0IGFzIHRoZSBmaXJzdCBhcmd1bWVudCBhbmQsIGlmIG5vIGVycm9yLCB0aGUgbnVtYmVyIG9mIGFmZmVjdGVkIGRvY3VtZW50cyBhcyB0aGUgc2Vjb25kLlxuICAgKi9cbiAgdXBzZXJ0KHNlbGVjdG9yLCBtb2RpZmllciwgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICBpZiAoIWNhbGxiYWNrICYmIHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjYWxsYmFjayA9IG9wdGlvbnM7XG4gICAgICBvcHRpb25zID0ge307XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudXBkYXRlKFxuICAgICAgc2VsZWN0b3IsXG4gICAgICBtb2RpZmllcixcbiAgICAgIHtcbiAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgX3JldHVybk9iamVjdDogdHJ1ZSxcbiAgICAgICAgdXBzZXJ0OiB0cnVlLFxuICAgICAgfSk7XG4gIH0sXG59XG5cbi8vIENvbnZlcnQgdGhlIGNhbGxiYWNrIHRvIG5vdCByZXR1cm4gYSByZXN1bHQgaWYgdGhlcmUgaXMgYW4gZXJyb3JcbmZ1bmN0aW9uIHdyYXBDYWxsYmFjayhjYWxsYmFjaywgY29udmVydFJlc3VsdCkge1xuICByZXR1cm4gKFxuICAgIGNhbGxiYWNrICYmXG4gICAgZnVuY3Rpb24oZXJyb3IsIHJlc3VsdCkge1xuICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgIGNhbGxiYWNrKGVycm9yKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGNvbnZlcnRSZXN1bHQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY2FsbGJhY2soZXJyb3IsIGNvbnZlcnRSZXN1bHQocmVzdWx0KSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYWxsYmFjayhlcnJvciwgcmVzdWx0KTtcbiAgICAgIH1cbiAgICB9XG4gICk7XG59XG5cbmZ1bmN0aW9uIHBvcENhbGxiYWNrRnJvbUFyZ3MoYXJncykge1xuICAvLyBQdWxsIG9mZiBhbnkgY2FsbGJhY2sgKG9yIHBlcmhhcHMgYSAnY2FsbGJhY2snIHZhcmlhYmxlIHRoYXQgd2FzIHBhc3NlZFxuICAvLyBpbiB1bmRlZmluZWQsIGxpa2UgaG93ICd1cHNlcnQnIGRvZXMgaXQpLlxuICBpZiAoXG4gICAgYXJncy5sZW5ndGggJiZcbiAgICAoYXJnc1thcmdzLmxlbmd0aCAtIDFdID09PSB1bmRlZmluZWQgfHxcbiAgICAgIGFyZ3NbYXJncy5sZW5ndGggLSAxXSBpbnN0YW5jZW9mIEZ1bmN0aW9uKVxuICApIHtcbiAgICByZXR1cm4gYXJncy5wb3AoKTtcbiAgfVxufVxuIiwiLyoqXG4gKiBAc3VtbWFyeSBBbGxvd3MgZm9yIHVzZXIgc3BlY2lmaWVkIGNvbm5lY3Rpb24gb3B0aW9uc1xuICogQGV4YW1wbGUgaHR0cDovL21vbmdvZGIuZ2l0aHViLmlvL25vZGUtbW9uZ29kYi1uYXRpdmUvMy4wL3JlZmVyZW5jZS9jb25uZWN0aW5nL2Nvbm5lY3Rpb24tc2V0dGluZ3MvXG4gKiBAbG9jdXMgU2VydmVyXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBVc2VyIHNwZWNpZmllZCBNb25nbyBjb25uZWN0aW9uIG9wdGlvbnNcbiAqL1xuTW9uZ28uc2V0Q29ubmVjdGlvbk9wdGlvbnMgPSBmdW5jdGlvbiBzZXRDb25uZWN0aW9uT3B0aW9ucyAob3B0aW9ucykge1xuICBjaGVjayhvcHRpb25zLCBPYmplY3QpO1xuICBNb25nby5fY29ubmVjdGlvbk9wdGlvbnMgPSBvcHRpb25zO1xufTsiLCJleHBvcnQgY29uc3Qgbm9ybWFsaXplUHJvamVjdGlvbiA9IG9wdGlvbnMgPT4ge1xuICAvLyB0cmFuc2Zvcm0gZmllbGRzIGtleSBpbiBwcm9qZWN0aW9uXG4gIGNvbnN0IHsgZmllbGRzLCBwcm9qZWN0aW9uLCAuLi5vdGhlck9wdGlvbnMgfSA9IG9wdGlvbnMgfHwge307XG4gIC8vIFRPRE86IGVuYWJsZSB0aGlzIGNvbW1lbnQgd2hlbiBkZXByZWNhdGluZyB0aGUgZmllbGRzIG9wdGlvblxuICAvLyBMb2cuZGVidWcoYGZpZWxkcyBvcHRpb24gaGFzIGJlZW4gZGVwcmVjYXRlZCwgcGxlYXNlIHVzZSB0aGUgbmV3ICdwcm9qZWN0aW9uJyBpbnN0ZWFkYClcblxuICByZXR1cm4ge1xuICAgIC4uLm90aGVyT3B0aW9ucyxcbiAgICAuLi4ocHJvamVjdGlvbiB8fCBmaWVsZHMgPyB7IHByb2plY3Rpb246IGZpZWxkcyB8fCBwcm9qZWN0aW9uIH0gOiB7fSksXG4gIH07XG59O1xuIiwiaW1wb3J0IHsgT2JzZXJ2ZUhhbmRsZUNhbGxiYWNrLCBPYnNlcnZlTXVsdGlwbGV4ZXIgfSBmcm9tICcuL29ic2VydmVfbXVsdGlwbGV4JztcblxubGV0IG5leHRPYnNlcnZlSGFuZGxlSWQgPSAxO1xuXG5leHBvcnQgdHlwZSBPYnNlcnZlSGFuZGxlQ2FsbGJhY2tJbnRlcm5hbCA9ICdfYWRkZWQnIHwgJ19hZGRlZEJlZm9yZScgfCAnX2NoYW5nZWQnIHwgJ19tb3ZlZEJlZm9yZScgfCAnX3JlbW92ZWQnO1xuXG5cbmV4cG9ydCB0eXBlIENhbGxiYWNrPFQgPSBhbnk+ID0gKC4uLmFyZ3M6IFRbXSkgPT4gUHJvbWlzZTx2b2lkPiB8IHZvaWQ7XG5cbi8qKlxuICogVGhlIFwib2JzZXJ2ZSBoYW5kbGVcIiByZXR1cm5lZCBmcm9tIG9ic2VydmVDaGFuZ2VzLlxuICogQ29udGFpbnMgYSByZWZlcmVuY2UgdG8gYW4gT2JzZXJ2ZU11bHRpcGxleGVyLlxuICogVXNlZCB0byBzdG9wIG9ic2VydmF0aW9uIGFuZCBjbGVhbiB1cCByZXNvdXJjZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBPYnNlcnZlSGFuZGxlPFQgPSBhbnk+IHtcbiAgX2lkOiBudW1iZXI7XG4gIF9tdWx0aXBsZXhlcjogT2JzZXJ2ZU11bHRpcGxleGVyO1xuICBub25NdXRhdGluZ0NhbGxiYWNrczogYm9vbGVhbjtcbiAgX3N0b3BwZWQ6IGJvb2xlYW47XG5cbiAgcHVibGljIGluaXRpYWxBZGRzU2VudFJlc29sdmVyOiAodmFsdWU6IHZvaWQpID0+IHZvaWQgPSAoKSA9PiB7fTtcbiAgcHVibGljIGluaXRpYWxBZGRzU2VudDogUHJvbWlzZTx2b2lkPlxuXG4gIF9hZGRlZD86IENhbGxiYWNrPFQ+O1xuICBfYWRkZWRCZWZvcmU/OiBDYWxsYmFjazxUPjtcbiAgX2NoYW5nZWQ/OiBDYWxsYmFjazxUPjtcbiAgX21vdmVkQmVmb3JlPzogQ2FsbGJhY2s8VD47XG4gIF9yZW1vdmVkPzogQ2FsbGJhY2s8VD47XG5cbiAgY29uc3RydWN0b3IobXVsdGlwbGV4ZXI6IE9ic2VydmVNdWx0aXBsZXhlciwgY2FsbGJhY2tzOiBSZWNvcmQ8T2JzZXJ2ZUhhbmRsZUNhbGxiYWNrLCBDYWxsYmFjazxUPj4sIG5vbk11dGF0aW5nQ2FsbGJhY2tzOiBib29sZWFuKSB7XG4gICAgdGhpcy5fbXVsdGlwbGV4ZXIgPSBtdWx0aXBsZXhlcjtcblxuICAgIG11bHRpcGxleGVyLmNhbGxiYWNrTmFtZXMoKS5mb3JFYWNoKChuYW1lOiBPYnNlcnZlSGFuZGxlQ2FsbGJhY2spID0+IHtcbiAgICAgIGlmIChjYWxsYmFja3NbbmFtZV0pIHtcbiAgICAgICAgdGhpc1tgXyR7bmFtZX1gIGFzIE9ic2VydmVIYW5kbGVDYWxsYmFja0ludGVybmFsXSA9IGNhbGxiYWNrc1tuYW1lXTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAobmFtZSA9PT0gXCJhZGRlZEJlZm9yZVwiICYmIGNhbGxiYWNrcy5hZGRlZCkge1xuICAgICAgICB0aGlzLl9hZGRlZEJlZm9yZSA9IGFzeW5jIGZ1bmN0aW9uIChpZCwgZmllbGRzLCBiZWZvcmUpIHtcbiAgICAgICAgICBhd2FpdCBjYWxsYmFja3MuYWRkZWQoaWQsIGZpZWxkcyk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLl9zdG9wcGVkID0gZmFsc2U7XG4gICAgdGhpcy5faWQgPSBuZXh0T2JzZXJ2ZUhhbmRsZUlkKys7XG4gICAgdGhpcy5ub25NdXRhdGluZ0NhbGxiYWNrcyA9IG5vbk11dGF0aW5nQ2FsbGJhY2tzO1xuXG4gICAgdGhpcy5pbml0aWFsQWRkc1NlbnQgPSBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIGNvbnN0IHJlYWR5ID0gKCkgPT4ge1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIHRoaXMuaW5pdGlhbEFkZHNTZW50ID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHRpbWVvdXQgPSBzZXRUaW1lb3V0KHJlYWR5LCAzMDAwMClcblxuICAgICAgdGhpcy5pbml0aWFsQWRkc1NlbnRSZXNvbHZlciA9ICgpID0+IHtcbiAgICAgICAgcmVhZHkoKTtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVc2luZyBwcm9wZXJ0eSBzeW50YXggYW5kIGFycm93IGZ1bmN0aW9uIHN5bnRheCB0byBhdm9pZCBiaW5kaW5nIHRoZSB3cm9uZyBjb250ZXh0IG9uIGNhbGxiYWNrcy5cbiAgICovXG4gIHN0b3AgPSBhc3luYyAoKSA9PiB7XG4gICAgaWYgKHRoaXMuX3N0b3BwZWQpIHJldHVybjtcbiAgICB0aGlzLl9zdG9wcGVkID0gdHJ1ZTtcbiAgICBhd2FpdCB0aGlzLl9tdWx0aXBsZXhlci5yZW1vdmVIYW5kbGUodGhpcy5faWQpO1xuICB9XG59Il19
