import React, { useEffect, useContext, useState } from 'react';
import './App.scss';

import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import Home from './components/Home';
import Login from './components/Login';
import Create from './components/Create';
import Details from './components/Details';
import Header from './components/Header';
import ProtectedRoutes from './components/ProtectedRoutes';

const App = () => {
  return (
    <>
      <Router>
        <Header />
        <main role="main">

          <div className="container">
            <Route path="/login" component={Login} />
            <ProtectedRoutes>
              <Route exact path="/" component={Home} />
              <Route path="/create" component={Create} />
              <Route path="/post/:id" component={Details} />
            </ProtectedRoutes>
          </div>
        </main>
      </Router>
    </>
  );
}

export default App;
