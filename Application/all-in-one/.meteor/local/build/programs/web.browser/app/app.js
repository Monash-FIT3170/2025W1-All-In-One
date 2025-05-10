var require = meteorInstall({"imports":{"ui":{"App.jsx":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// imports/ui/App.jsx                                                                                           //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
!function (module1) {
  module1.export({
    App: () => App
  });
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }
  }, 0);
  let Router, Routes, Route, Link;
  module1.link("react-router-dom", {
    BrowserRouter(v) {
      Router = v;
    },
    Routes(v) {
      Routes = v;
    },
    Route(v) {
      Route = v;
    },
    Link(v) {
      Link = v;
    }
  }, 1);
  let LoginPage;
  module1.link("./LoginPage.jsx", {
    LoginPage(v) {
      LoginPage = v;
    }
  }, 2);
  let HomePage;
  module1.link("./HomePage.jsx", {
    HomePage(v) {
      HomePage = v;
    }
  }, 3);
  let SignUpPage;
  module1.link("./SignUpPage.jsx", {
    SignUpPage(v) {
      SignUpPage = v;
    }
  }, 4);
  ___INIT_METEOR_FAST_REFRESH(module);
  const App = () => /*#__PURE__*/React.createElement(Router, null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Routes, null, /*#__PURE__*/React.createElement(Route, {
    path: "/",
    element: /*#__PURE__*/React.createElement(HomePage, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/login",
    element: /*#__PURE__*/React.createElement(LoginPage, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/signup",
    element: /*#__PURE__*/React.createElement(SignUpPage, null)
  }))));
  _c = App;
  var _c;
  $RefreshReg$(_c, "App");
}.call(this, module);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"HomePage.jsx":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// imports/ui/HomePage.jsx                                                                                      //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
!function (module1) {
  module1.export({
    HomePage: () => HomePage
  });
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }
  }, 0);
  let Link;
  module1.link("react-router-dom", {
    Link(v) {
      Link = v;
    }
  }, 1);
  ___INIT_METEOR_FAST_REFRESH(module);
  // HomePage.jsx

  const HomePage = () => {
    return /*#__PURE__*/React.createElement("div", {
      className: "flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-[#CEF4F1] via-[#FFF7E6] to-[#F3D673] relative"
    }, /*#__PURE__*/React.createElement("div", {
      className: "absolute top-6 right-6 flex gap-4"
    }, /*#__PURE__*/React.createElement(Link, {
      to: "/login"
    }, /*#__PURE__*/React.createElement("button", {
      className: "bg-[#F3D673] hover:bg-yellow-400 text-black font-bold py-2 px-5 rounded-full"
    }, "Log In")), /*#__PURE__*/React.createElement(Link, {
      to: "/signup"
    }, /*#__PURE__*/React.createElement("button", {
      className: "bg-[#F3D673] hover:bg-yellow-400 text-black font-bold py-2 px-5 rounded-full"
    }, "Sign Up"))), /*#__PURE__*/React.createElement("div", {
      className: "text-center mb-4"
    }, /*#__PURE__*/React.createElement("p", {
      className: "text-2xl text-gray-700 font-semibold"
    }, "Your One Stop for Rental Solutions")), /*#__PURE__*/React.createElement("h1", {
      className: "text-7xl font-extrabold text-[#368C87] uppercase tracking-wide"
    }, "All In One"), /*#__PURE__*/React.createElement("img", {
      src: "/images/logo.png",
      alt: "Logo",
      className: "w-40 h-40 mb-8"
    }));
  };
  _c = HomePage;
  var _c;
  $RefreshReg$(_c, "HomePage");
}.call(this, module);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"LoginPage.jsx":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// imports/ui/LoginPage.jsx                                                                                     //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
!function (module1) {
  module1.export({
    LoginPage: () => LoginPage
  });
  let Meteor;
  module1.link("meteor/meteor", {
    Meteor(v) {
      Meteor = v;
    }
  }, 0);
  let React, useState;
  module1.link("react", {
    default(v) {
      React = v;
    },
    useState(v) {
      useState = v;
    }
  }, 1);
  let Link;
  module1.link("react-router-dom", {
    Link(v) {
      Link = v;
    }
  }, 2);
  ___INIT_METEOR_FAST_REFRESH(module);
  var _s = $RefreshSig$();
  const LoginPage = () => {
    _s();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const submit = e => {};
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
    }, "Don't have an account?"), /*#__PURE__*/React.createElement(Link, {
      to: "/signup",
      className: "bg-[#F3D673] hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded flex items-center gap-2 mb-6 no-underline"
    }, " ", /*#__PURE__*/React.createElement("span", null, "Sign Up")), /*#__PURE__*/React.createElement("p", {
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
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"SignUpPage.jsx":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// imports/ui/SignUpPage.jsx                                                                                    //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
!function (module1) {
  module1.export({
    SignUpPage: () => SignUpPage
  });
  let Meteor;
  module1.link("meteor/meteor", {
    Meteor(v) {
      Meteor = v;
    }
  }, 0);
  let React, useState;
  module1.link("react", {
    default(v) {
      React = v;
    },
    useState(v) {
      useState = v;
    }
  }, 1);
  let Link;
  module1.link("react-router-dom", {
    Link(v) {
      Link = v;
    }
  }, 2);
  ___INIT_METEOR_FAST_REFRESH(module);
  const SignUpPage = () => {
    const submit = e => {};
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
    }, "Already have an account?"), /*#__PURE__*/React.createElement(Link, {
      to: "/login",
      className: "bg-[#F3D673] hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded flex items-center gap-2 mb-6 no-underline"
    }, " ", /*#__PURE__*/React.createElement("span", null, "Log In")), /*#__PURE__*/React.createElement("p", {
      className: "text-sm text-gray-600 mb-6"
    }, "Forgot Password?")), /*#__PURE__*/React.createElement("div", {
      className: "w-1/2 bg-[#CEF4F1] flex flex-col items-center justify-center p-10"
    }, /*#__PURE__*/React.createElement("h1", {
      className: "text-3xl font-bold mb-8"
    }, "Create Account"), /*#__PURE__*/React.createElement("form", {
      className: "w-3/4 flex flex-col gap-4"
    }, /*#__PURE__*/React.createElement("input", {
      type: "text",
      placeholder: "First Name",
      className: "border p-2 rounded",
      required: true
    }), /*#__PURE__*/React.createElement("input", {
      type: "text",
      placeholder: "Last Name",
      className: "border p-2 rounded",
      required: true
    }), /*#__PURE__*/React.createElement("input", {
      type: "email",
      placeholder: "Email",
      className: "border p-2 rounded",
      required: true
    }), /*#__PURE__*/React.createElement("input", {
      type: "password",
      placeholder: "New Password",
      className: "border p-2 rounded",
      required: true
    }), /*#__PURE__*/React.createElement("input", {
      type: "password",
      placeholder: "Confirm Password",
      className: "border p-2 rounded",
      required: true
    }), /*#__PURE__*/React.createElement("button", {
      type: "submit",
      className: "bg-[#F3D673] hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded"
    }, "Sign Up"))));
  };
  _c = SignUpPage;
  var _c;
  $RefreshReg$(_c, "SignUpPage");
}.call(this, module);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"client":{"main.jsx":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// client/main.jsx                                                                                              //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
!function (module1) {
  let React;
  module1.link("react", {
    default(v) {
      React = v;
    }
  }, 0);
  let createRoot;
  module1.link("react-dom/client", {
    createRoot(v) {
      createRoot = v;
    }
  }, 1);
  let Meteor;
  module1.link("meteor/meteor", {
    Meteor(v) {
      Meteor = v;
    }
  }, 2);
  let App;
  module1.link("/imports/ui/App", {
    App(v) {
      App = v;
    }
  }, 3);
  ___INIT_METEOR_FAST_REFRESH(module);
  Meteor.startup(() => {
    const container = document.getElementById('react-target');
    const root = createRoot(container);
    root.render(/*#__PURE__*/React.createElement(App, null));
  });
}.call(this, module);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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