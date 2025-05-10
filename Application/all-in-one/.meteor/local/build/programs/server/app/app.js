Package["core-runtime"].queue("null",function () {/* Imports for global scope */

MongoInternals = Package.mongo.MongoInternals;
Mongo = Package.mongo.Mongo;
ReactiveVar = Package['reactive-var'].ReactiveVar;
ECMAScript = Package.ecmascript.ECMAScript;
Meteor = Package.meteor.Meteor;
global = Package.meteor.global;
meteorEnv = Package.meteor.meteorEnv;
EmitterPromise = Package.meteor.EmitterPromise;
WebApp = Package.webapp.WebApp;
WebAppInternals = Package.webapp.WebAppInternals;
main = Package.webapp.main;
DDP = Package['ddp-client'].DDP;
DDPServer = Package['ddp-server'].DDPServer;
LaunchScreen = Package['launch-screen'].LaunchScreen;
meteorInstall = Package.modules.meteorInstall;
Promise = Package.promise.Promise;
Autoupdate = Package.autoupdate.Autoupdate;

var require = meteorInstall({"imports":{"api":{"links.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                        //
// imports/api/links.js                                                                   //
//                                                                                        //
////////////////////////////////////////////////////////////////////////////////////////////
                                                                                          //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      LinksCollection: () => LinksCollection
    });
    let Mongo;
    module.link("meteor/mongo", {
      Mongo(v) {
        Mongo = v;
      }
    }, 0);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    const LinksCollection = new Mongo.Collection('links');
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
////////////////////////////////////////////////////////////////////////////////////////////

}}},"server":{"main.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                        //
// server/main.js                                                                         //
//                                                                                        //
////////////////////////////////////////////////////////////////////////////////////////////
                                                                                          //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    let Meteor;
    module.link("meteor/meteor", {
      Meteor(v) {
        Meteor = v;
      }
    }, 0);
    let LinksCollection;
    module.link("/imports/api/links", {
      LinksCollection(v) {
        LinksCollection = v;
      }
    }, 1);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    async function insertLink(_ref) {
      let {
        title,
        url
      } = _ref;
      await LinksCollection.insertAsync({
        title,
        url,
        createdAt: new Date()
      });
    }
    Meteor.startup(async () => {
      // If the Links collection is empty, add some data.
      if ((await LinksCollection.find().countAsync()) === 0) {
        await insertLink({
          title: 'Do the Tutorial',
          url: 'https://www.meteor.com/tutorials/react/creating-an-app'
        });
        await insertLink({
          title: 'Follow the Guide',
          url: 'https://guide.meteor.com'
        });
        await insertLink({
          title: 'Read the Docs',
          url: 'https://docs.meteor.com'
        });
        await insertLink({
          title: 'Discussions',
          url: 'https://forums.meteor.com'
        });
      }

      // We publish the entire Links collection to all clients.
      // In order to be fetched in real-time to the clients
      Meteor.publish("links", function () {
        return LinksCollection.find();
      });
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
////////////////////////////////////////////////////////////////////////////////////////////

}}},{
  "extensions": [
    ".js",
    ".json",
    ".ts",
    ".mjs",
    ".jsx"
  ]
});


/* Exports */
return {
  require: require,
  eagerModulePaths: [
    "/server/main.js"
  ]
}});

//# sourceURL=meteor://💻app/app/app.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvaW1wb3J0cy9hcGkvbGlua3MuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9tYWluLmpzIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydCIsIkxpbmtzQ29sbGVjdGlvbiIsIk1vbmdvIiwibGluayIsInYiLCJfX3JlaWZ5V2FpdEZvckRlcHNfXyIsIkNvbGxlY3Rpb24iLCJfX3JlaWZ5X2FzeW5jX3Jlc3VsdF9fIiwiX3JlaWZ5RXJyb3IiLCJzZWxmIiwiYXN5bmMiLCJNZXRlb3IiLCJpbnNlcnRMaW5rIiwiX3JlZiIsInRpdGxlIiwidXJsIiwiaW5zZXJ0QXN5bmMiLCJjcmVhdGVkQXQiLCJEYXRlIiwic3RhcnR1cCIsImZpbmQiLCJjb3VudEFzeW5jIiwicHVibGlzaCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUFBQSxNQUFNLENBQUNDLE1BQU0sQ0FBQztNQUFDQyxlQUFlLEVBQUNBLENBQUEsS0FBSUE7SUFBZSxDQUFDLENBQUM7SUFBQyxJQUFJQyxLQUFLO0lBQUNILE1BQU0sQ0FBQ0ksSUFBSSxDQUFDLGNBQWMsRUFBQztNQUFDRCxLQUFLQSxDQUFDRSxDQUFDLEVBQUM7UUFBQ0YsS0FBSyxHQUFDRSxDQUFDO01BQUE7SUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQUMsSUFBSUMsb0JBQW9CLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTUEsb0JBQW9CLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFFdEssTUFBTUosZUFBZSxHQUFHLElBQUlDLEtBQUssQ0FBQ0ksVUFBVSxDQUFDLE9BQU8sQ0FBQztJQUFDQyxzQkFBQTtFQUFBLFNBQUFDLFdBQUE7SUFBQSxPQUFBRCxzQkFBQSxDQUFBQyxXQUFBO0VBQUE7RUFBQUQsc0JBQUE7QUFBQTtFQUFBRSxJQUFBO0VBQUFDLEtBQUE7QUFBQSxHOzs7Ozs7Ozs7Ozs7OztJQ0Y3RCxJQUFJQyxNQUFNO0lBQUNaLE1BQU0sQ0FBQ0ksSUFBSSxDQUFDLGVBQWUsRUFBQztNQUFDUSxNQUFNQSxDQUFDUCxDQUFDLEVBQUM7UUFBQ08sTUFBTSxHQUFDUCxDQUFDO01BQUE7SUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQUMsSUFBSUgsZUFBZTtJQUFDRixNQUFNLENBQUNJLElBQUksQ0FBQyxvQkFBb0IsRUFBQztNQUFDRixlQUFlQSxDQUFDRyxDQUFDLEVBQUM7UUFBQ0gsZUFBZSxHQUFDRyxDQUFDO01BQUE7SUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQUMsSUFBSUMsb0JBQW9CLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTUEsb0JBQW9CLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFHNU4sZUFBZU8sVUFBVUEsQ0FBQUMsSUFBQSxFQUFpQjtNQUFBLElBQWhCO1FBQUVDLEtBQUs7UUFBRUM7TUFBSSxDQUFDLEdBQUFGLElBQUE7TUFDdEMsTUFBTVosZUFBZSxDQUFDZSxXQUFXLENBQUM7UUFBRUYsS0FBSztRQUFFQyxHQUFHO1FBQUVFLFNBQVMsRUFBRSxJQUFJQyxJQUFJLENBQUM7TUFBRSxDQUFDLENBQUM7SUFDMUU7SUFFQVAsTUFBTSxDQUFDUSxPQUFPLENBQUMsWUFBWTtNQUN6QjtNQUNBLElBQUksT0FBTWxCLGVBQWUsQ0FBQ21CLElBQUksQ0FBQyxDQUFDLENBQUNDLFVBQVUsQ0FBQyxDQUFDLE1BQUssQ0FBQyxFQUFFO1FBQ25ELE1BQU1ULFVBQVUsQ0FBQztVQUNmRSxLQUFLLEVBQUUsaUJBQWlCO1VBQ3hCQyxHQUFHLEVBQUU7UUFDUCxDQUFDLENBQUM7UUFFRixNQUFNSCxVQUFVLENBQUM7VUFDZkUsS0FBSyxFQUFFLGtCQUFrQjtVQUN6QkMsR0FBRyxFQUFFO1FBQ1AsQ0FBQyxDQUFDO1FBRUYsTUFBTUgsVUFBVSxDQUFDO1VBQ2ZFLEtBQUssRUFBRSxlQUFlO1VBQ3RCQyxHQUFHLEVBQUU7UUFDUCxDQUFDLENBQUM7UUFFRixNQUFNSCxVQUFVLENBQUM7VUFDZkUsS0FBSyxFQUFFLGFBQWE7VUFDcEJDLEdBQUcsRUFBRTtRQUNQLENBQUMsQ0FBQztNQUNKOztNQUVBO01BQ0E7TUFDQUosTUFBTSxDQUFDVyxPQUFPLENBQUMsT0FBTyxFQUFFLFlBQVk7UUFDbEMsT0FBT3JCLGVBQWUsQ0FBQ21CLElBQUksQ0FBQyxDQUFDO01BQy9CLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQztJQUFDYixzQkFBQTtFQUFBLFNBQUFDLFdBQUE7SUFBQSxPQUFBRCxzQkFBQSxDQUFBQyxXQUFBO0VBQUE7RUFBQUQsc0JBQUE7QUFBQTtFQUFBRSxJQUFBO0VBQUFDLEtBQUE7QUFBQSxHIiwiZmlsZSI6Ii9hcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNb25nbyB9IGZyb20gJ21ldGVvci9tb25nbyc7XHJcblxyXG5leHBvcnQgY29uc3QgTGlua3NDb2xsZWN0aW9uID0gbmV3IE1vbmdvLkNvbGxlY3Rpb24oJ2xpbmtzJyk7XHJcbiIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xyXG5pbXBvcnQgeyBMaW5rc0NvbGxlY3Rpb24gfSBmcm9tICcvaW1wb3J0cy9hcGkvbGlua3MnO1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gaW5zZXJ0TGluayh7IHRpdGxlLCB1cmwgfSkge1xyXG4gIGF3YWl0IExpbmtzQ29sbGVjdGlvbi5pbnNlcnRBc3luYyh7IHRpdGxlLCB1cmwsIGNyZWF0ZWRBdDogbmV3IERhdGUoKSB9KTtcclxufVxyXG5cclxuTWV0ZW9yLnN0YXJ0dXAoYXN5bmMgKCkgPT4ge1xyXG4gIC8vIElmIHRoZSBMaW5rcyBjb2xsZWN0aW9uIGlzIGVtcHR5LCBhZGQgc29tZSBkYXRhLlxyXG4gIGlmIChhd2FpdCBMaW5rc0NvbGxlY3Rpb24uZmluZCgpLmNvdW50QXN5bmMoKSA9PT0gMCkge1xyXG4gICAgYXdhaXQgaW5zZXJ0TGluayh7XHJcbiAgICAgIHRpdGxlOiAnRG8gdGhlIFR1dG9yaWFsJyxcclxuICAgICAgdXJsOiAnaHR0cHM6Ly93d3cubWV0ZW9yLmNvbS90dXRvcmlhbHMvcmVhY3QvY3JlYXRpbmctYW4tYXBwJyxcclxuICAgIH0pO1xyXG5cclxuICAgIGF3YWl0IGluc2VydExpbmsoe1xyXG4gICAgICB0aXRsZTogJ0ZvbGxvdyB0aGUgR3VpZGUnLFxyXG4gICAgICB1cmw6ICdodHRwczovL2d1aWRlLm1ldGVvci5jb20nLFxyXG4gICAgfSk7XHJcblxyXG4gICAgYXdhaXQgaW5zZXJ0TGluayh7XHJcbiAgICAgIHRpdGxlOiAnUmVhZCB0aGUgRG9jcycsXHJcbiAgICAgIHVybDogJ2h0dHBzOi8vZG9jcy5tZXRlb3IuY29tJyxcclxuICAgIH0pO1xyXG5cclxuICAgIGF3YWl0IGluc2VydExpbmsoe1xyXG4gICAgICB0aXRsZTogJ0Rpc2N1c3Npb25zJyxcclxuICAgICAgdXJsOiAnaHR0cHM6Ly9mb3J1bXMubWV0ZW9yLmNvbScsXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vIFdlIHB1Ymxpc2ggdGhlIGVudGlyZSBMaW5rcyBjb2xsZWN0aW9uIHRvIGFsbCBjbGllbnRzLlxyXG4gIC8vIEluIG9yZGVyIHRvIGJlIGZldGNoZWQgaW4gcmVhbC10aW1lIHRvIHRoZSBjbGllbnRzXHJcbiAgTWV0ZW9yLnB1Ymxpc2goXCJsaW5rc1wiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gTGlua3NDb2xsZWN0aW9uLmZpbmQoKTtcclxuICB9KTtcclxufSk7XHJcbiJdfQ==
