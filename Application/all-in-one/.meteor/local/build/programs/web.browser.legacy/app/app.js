var require = meteorInstall({"imports":{"ui":{"App.jsx":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                         //
// imports/ui/App.jsx                                                                                      //
//                                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                           //
!function (module1) {
  module1.export({
    App: function () {
      return App;
    }
  });
  var React;
  module1.link("react", {
    "default": function (v) {
      React = v;
    }
  }, 0);
  var Router, Routes, Route, Link;
  module1.link("react-router-dom", {
    BrowserRouter: function (v) {
      Router = v;
    },
    Routes: function (v) {
      Routes = v;
    },
    Route: function (v) {
      Route = v;
    },
    Link: function (v) {
      Link = v;
    }
  }, 1);
  var LoginPage;
  module1.link("./LoginPage.jsx", {
    LoginPage: function (v) {
      LoginPage = v;
    }
  }, 2);
  ___INIT_METEOR_FAST_REFRESH(module);
  var App = function () {
    return /*#__PURE__*/React.createElement(Router, null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Routes, null, /*#__PURE__*/React.createElement(Route, {
      path: "/",
      element: /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, "Home Page"), /*#__PURE__*/React.createElement("p", null, "Already have an account?", /*#__PURE__*/React.createElement(Link, {
        to: "/login",
        style: {
          color: "blue",
          marginLeft: "5px"
        }
      }, "Login here")))
    }), /*#__PURE__*/React.createElement(Route, {
      path: "/login",
      element: /*#__PURE__*/React.createElement(LoginPage, null)
    }))));
  };
  _c = App;
  var _c;
  $RefreshReg$(_c, "App");
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"LoginPage.jsx":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                         //
// imports/ui/LoginPage.jsx                                                                                //
//                                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                           //
!function (module1) {
  var _slicedToArray;
  module1.link("@babel/runtime/helpers/slicedToArray", {
    default: function (v) {
      _slicedToArray = v;
    }
  }, 0);
  module1.export({
    LoginPage: function () {
      return LoginPage;
    }
  });
  var Meteor;
  module1.link("meteor/meteor", {
    Meteor: function (v) {
      Meteor = v;
    }
  }, 0);
  var React, useState;
  module1.link("react", {
    "default": function (v) {
      React = v;
    },
    useState: function (v) {
      useState = v;
    }
  }, 1);
  ___INIT_METEOR_FAST_REFRESH(module);
  var _s = $RefreshSig$();
  var LoginPage = function () {
    _s();
    var _useState = useState(""),
      _useState2 = _slicedToArray(_useState, 2),
      username = _useState2[0],
      setUsername = _useState2[1];
    var _useState3 = useState(""),
      _useState4 = _slicedToArray(_useState3, 2),
      password = _useState4[0],
      setPassword = _useState4[1];
    var submit = function (e) {};
    return /*#__PURE__*/React.createElement("div", {
      className: "flex min-h-screen"
    }, /*#__PURE__*/React.createElement("div", {
      className: "w-1/2 bg-[#FFF7E6] flex flex-col items-center justify-center p-10"
    }, /*#__PURE__*/React.createElement("img", {
      src: "/images/logo.png",
      alt: "All In One Logo",
      className: "mb-8"
    }), /*#__PURE__*/React.createElement("h2", {
      className: "text-2xl font-semibold mb-4"
    }, "Don't have an account?"), /*#__PURE__*/React.createElement("button", {
      className: "bg-[#F3D673] hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded flex items-center gap-2 mb-6"
    }, /*#__PURE__*/React.createElement("span", null, "Sign Up")), /*#__PURE__*/React.createElement("p", {
      className: "text-sm text-gray-600 mb-6"
    }, "Forgot Password?")), /*#__PURE__*/React.createElement("div", {
      className: "w-1/2 bg-[#CEF4F1] flex flex-col items-center justify-center p-10"
    }, /*#__PURE__*/React.createElement("h1", {
      className: "text-3xl font-bold mb-8"
    }, "Log In to Account"), /*#__PURE__*/React.createElement("form", {
      className: "w-3/4 flex flex-col gap-4"
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      placeholder: "Username",
      className: "border p-2 rounded",
      required: true
    }), /*#__PURE__*/React.createElement("input", {
      type: "password",
      placeholder: "Password",
      className: "border p-2 rounded",
      required: true
    }), /*#__PURE__*/React.createElement("div", {
      className: "flex items-center"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      id: "remember",
      className: "mr-2"
    }), /*#__PURE__*/React.createElement("label", {
      htmlFor: "remember",
      className: "text-sm"
    }, "Remember Me")), /*#__PURE__*/React.createElement("button", {
      type: "submit",
      className: "bg-[#F3D673] hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded"
    }, "Log In"))));
  };
  _s(LoginPage, "Lrw7JeD9zj6OUWhT/IH4OIvPKEk=");
  _c = LoginPage;
  var _c;
  $RefreshReg$(_c, "LoginPage");
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"client":{"main.jsx":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                         //
// client/main.jsx                                                                                         //
//                                                                                                         //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                           //
!function (module1) {
  var React;
  module1.link("react", {
    "default": function (v) {
      React = v;
    }
  }, 0);
  var createRoot;
  module1.link("react-dom/client", {
    createRoot: function (v) {
      createRoot = v;
    }
  }, 1);
  var Meteor;
  module1.link("meteor/meteor", {
    Meteor: function (v) {
      Meteor = v;
    }
  }, 2);
  var App;
  module1.link("/imports/ui/App", {
    App: function (v) {
      App = v;
    }
  }, 3);
  ___INIT_METEOR_FAST_REFRESH(module);
  Meteor.startup(function () {
    var container = document.getElementById('react-target');
    var root = createRoot(container);
    root.render(/*#__PURE__*/React.createElement(App, null));
  });
}.call(this, module);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},{
  "extensions": [
    ".js",
    ".json",
    ".html",
    ".ts",
    ".mjs",
    ".css",
    ".jsx"
  ]
});

require("/client/main.jsx");