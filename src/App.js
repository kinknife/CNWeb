import React, { Component } from 'react';
import './App.css';
import { HashRouter as Router, Route, NavLink } from 'react-router-dom';
import AppMain from './components/AppMain.js';
import Account from './components/Account.js';
import { getFromStorage, setInStorage } from './components/utils/storage.js';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';

class App extends Component {
  constructor(){
    super();

    this.state = {
      SIemail: '',
      SIpassword: '',
      SImessage: '',
      SUemail: '',
      name: '',
      SUpassword: '',
      SUmessage: '',
      SIModal: false,
      SUModal: false,
      token: '',
      toggle: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.logout = this.logout.bind(this);
    //this.submitSignup = this.submitSignup.bind(this);
    //this.submitSignin = this.submitSignin.bind(this);
  }

  componentWillMount(){
    const obj = getFromStorage('cnweb');
    if (obj && obj.token) {
      const { token } = obj;
      fetch('http://localhost:4200/verify?token=' + token)
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            this.setState({
              token: token,
            });
          }
        });
    }
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  toggleSIModal() {
    this.setState({
      SIModal: ! this.state.SIModal,
      SImessage: ''
    });
  }

  toggleSUModal() {
    this.setState({
      SUModal: ! this.state.SUModal,
      SUmessage: ''
    });
  }

  submitSignup() {
    const {
      SUemail,
      name,
      SUpassword
    } = this.state;

    fetch('http://localhost:4200/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: SUemail,
        name: name,
        password: SUpassword,
      }),
    }).then(res => res.json())
      .then(json => {
        console.log('json', json);
        if (json.success) {
          setInStorage('cnweb', { token: json.token });
          this.setState({
            SUemail: '',
            name: '',
            SUpassword: '',
            SUmessage: '',
            token: json.token
          });
        } else {
          this.setState({
            SUmessage: json.message
          })
        }
      });
  }

  submitSignin() {
    const {
      SIemail,
      SIpassword
    } = this.state;

    fetch('http://localhost:4200/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: SIemail,
        password: SIpassword,
      }),
    }).then(res => res.json())
      .then(json => {
        console.log('json', json);
        if (json.success) {
          setInStorage('cnweb', { token: json.token });
          this.setState({
            SIemail: '',
            SIpassword: '',
            SImessage: '',
            token: json.token
          });
        } else {
          this.setState({
            SImessage: json.message
          })
        }
      });
  }

  logout() {
    const { token } = this.state;
      fetch('http://localhost:4200/logout?token=' + token)
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            this.setState({
              token: '',
            });
          }
        });
      
  }


  render(){
    const token = this.state.token;
    const SImessage = this.state.SImessage;
    const SUmessage = this.state.SUmessage;

    if(!token){
    return(
      <Router basename="/project/">
        <div className="App">
          <div className="AppForm">
            <div className="PageSwitcher">
              <NavLink to="/home" activeClassName="SwitchActive" className="Switch">Home</NavLink>
              <button activeClassName="SwitchActive" className="Switch" onClick={this.toggleSIModal.bind(this)}>Sign In</button>
                <Modal isOpen={this.state.SIModal}>
                  <ModalHeader toggle={this.toggleSIModal.bind(this)}>
                  Sign In
                  </ModalHeader>
                  <ModalBody>
                    <div className="Forms">
                      <form>
                          <div className="Form">
                              <label className="Label" htmlFor="email">E-Mail Address</label>
                              <input type="email" id="email" className="Input" placeholder="Enter your email" name="SIemail" onChange={this.handleChange} value={this.setState.SIemail} autocomplete="off" />
                          </div>

                          <div className="Form">
                              <label className="Label" htmlFor="password">Password</label>
                              <input type="password" id="password" className="Input" placeholder="Enter your password" name="SIpassword" onChange={this.handleChange} value={this.setState.SIpassword} autocomplete="off" />
                          </div>
                            {(SImessage) ? (<p>{SImessage}</p>) : (null)}
                          <div className="Form">
                              <button className="Button" onClick={() => {this.submitSignin()}}>Sign In</button>
                          </div>
                      </form>
                    </div>
                  </ModalBody>
                </Modal>
              <button activeClassName="SwitchActive" className="Switch" onClick={this.toggleSUModal.bind(this)}>Sign Up</button>
              <Modal isOpen={this.state.SUModal}>
                <ModalHeader toggle={this.toggleSUModal.bind(this)}>
                Sign Up
                </ModalHeader>
                <ModalBody>
                  <div className="Forms">
                    <div className="Form">
                      <label className="Label" htmlFor="name">Full Name</label>
                      <input type="text" id="name" className="Input" placeholder="Enter your full name" name="name" value={this.state.name} onChange={this.handleChange} autoComplete="off" />
                    </div>
                    <div className="Form">
                      <label className="Label" htmlFor="email">E-Mail Address</label>
                      <input type="email" id="email" className="Input" placeholder="Enter your email" name="SUemail" value={this.state.SUemail} onChange={this.handleChange} autoComplete="off" />
                    </div>
                    <div className="Form">
                      <label className="Label" htmlFor="password">Password</label>
                      <input type="password" id="password" className="Input" placeholder="Enter your password" name="SUpassword" value={this.state.SUpassword} onChange={this.handleChange} autoComplete="off" />
                    </div>
                      {(SUmessage) ? (<p>{SUmessage}</p>) : (null)}
                    <div className="Form">
                      <button className="Button" onClick={() => {this.submitSignup()}}>Sign Up</button> 
                    </div>
                  </div>
                </ModalBody>
              </Modal>
            </div>

            <Route exact path="/home" component={AppMain}>
            </Route>
          </div>
        </div>
      </Router>
    );
    }
      return(
        <Router basename="/project/">
        <div className="App">
          <div className="AppForm">
            <div className="PageSwitcher">
              <NavLink to="/home" activeClassName="SwitchActive" className="Switch">Home</NavLink>
              <NavLink to="/info" activeClassName="SwitchActive" className="Switch">Account</NavLink>
              <button activeClassName="SwitchActive" className="Switch" onClick={this.logout}>Log Out</button>
            </div>
            
              <Route exact path="/home" component={AppMain}>
              </Route>
              <Route exact path="/info" component={Account}>
              </Route>
          </div>
        </div>
        </Router>
      );
    }
}

export default App;