import React, { Component } from 'react';
import './App.css';
import { HashRouter as Router, Route, NavLink } from 'react-router-dom';
import AppMain from './components/AppMain.js';
import SignIn from './components/SignIn.js';
import SignUp from './components/SignUp.js';

class App extends Component {
  render(){
    return(
      <Router basename="/project/">
        <div className="App">
          <div className="AppForm">
            <div className="PageSwitcher">
              <NavLink to="/home" activeClassName="SwitchActive" className="Switch">Home</NavLink>
              <NavLink to="/sign-in" activeClassName="SwitchActive" className="Switch">Sign In</NavLink>
              <NavLink exact to="/sign-up" activeClassName="SwitchActive" className="Switch">Sign Up</NavLink>
            </div>

            <Route exact path="/home" component={AppMain}>
            </Route>
            <Route exact path="/sign-up" component={SignUp}>
            </Route>
            <Route path="/sign-in" component={SignIn}>
            </Route>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;