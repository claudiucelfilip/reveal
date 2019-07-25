import React, { useContext, useCallback } from 'react';
import '../App.scss';
import Home from '../components/Home';
import { Router, Route } from "@reach/router";
// import Home from '../components/Home';
import Login from '../components/Login';
import Create from '../components/Create';
import Balance from '../components/Balance';
import Layout from "../components/layout";
import PrivateRoute from "../components/PrivateRoute";

const App = () => {
  return (
    <Router>
      <PrivateRoute path="/app/create" component={Create} />
      <PrivateRoute path="/app/balance" component={Balance} />
    </Router>
  );
}

export default App;
