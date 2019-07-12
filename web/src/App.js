import React, { useEffect, useCallback, useState } from 'react';
import './App.css';

import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Home from './components/Home';
import Login from './components/Login';
import Create from './components/Create';
import Details from './components/Details';
import SmartContract from './SmartContract';
const smartContract = SmartContract.getInstance();

const App = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const initSmartContract = async () => {
      await smartContract.init();
      setLoading(false);
    };
    initSmartContract();
  }, []);

  const logOut = useCallback(() => {
    smartContract.removePrivateKey();
  }, []);

  if (loading) {
    return <h3>loading...</h3>;
  }
  return (
    <div className="App">
      <Router>
        <header>
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/create">Create</Link>
          <Link to="/create">Cash Out</Link>
        </header>
        <div>
          <Route exact path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/create" component={Create} />
          <Route path="/post/:id" component={Details} />
        </div>
      </Router>
    </div>
  );
}

export default App;
