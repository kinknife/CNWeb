import React, { Component } from 'react';
import './App.css';
import { HashRouter as Router, Route, NavLink } from 'react-router-dom';
import AppMain from './components/AppMain.js';
import Account from './components/Account.js';
import { getFromStorage, setInStorage } from './components/utils/storage.js';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import { connectionService } from './components/service/connection';

class App extends Component {
  constructor() {
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
      toggle: false,
      userId: null
    };

    this.handleChange = this.handleChange.bind(this);
    this.logout = this.logout.bind(this);
  }

  componentDidMount() {
    const obj = getFromStorage('cnweb');
    if (obj && obj.token) {
      const { token } = obj;
      connectionService.verify(token).then(json => {
        if (json.success) {
          this.setState({
            token: token,
            userId: json.userId
          });
          if(this.info) {
            this.info.updateInfo();
          }
        } else {
          setInStorage('cnweb', {token: null});
          this.setState({
            token: null
          })
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
      SIModal: !this.state.SIModal,
      SImessage: ''
    });
  }

  toggleSUModal() {
    this.setState({
      SUModal: !this.state.SUModal,
      SUmessage: ''
    });
  }

  submitSignup(e) {
    e.preventDefault();
    const {
      SUemail,
      name,
      SUpassword
    } = this.state;

    connectionService.signup({
      email: SUemail,
      name: name,
      password: SUpassword,
    }).then(json => {
      if (json.success) {
        setInStorage('cnweb', { token: json.token });
        this.setState({
          SUemail: '',
          name: '',
          SUpassword: '',
          SUmessage: '',
          token: json.token,
          SUModal: false
        });
      } else {
        this.setState({
          SUmessage: json.message
        })
      }
    });
  }

  submitSignin(e) {
    e.preventDefault();
    const {
      SIemail,
      SIpassword
    } = this.state;
    connectionService.signin({ email: SIemail, password: SIpassword }).then(json => {
      if (json && json.success) {
        setInStorage('cnweb', { token: json.token });
        this.setState({
          SIemail: '',
          SIpassword: '',
          SImessage: '',
          token: json.token,
          SIModal: false
        });
      } else if (json) {
        this.setState({
          SImessage: json.message
        })
      } else {
        return;
      }
    });
  }

  logout() {
    const { token } = this.state;
    connectionService.logout(token).then(json => {
      if (json.success) {
        setInStorage('cnweb', { token: null });
        this.setState({
          token: null
        });
      }
    });
  }

  render() {
    const token = getFromStorage('cnweb') ? getFromStorage('cnweb').token : null;
    const SImessage = this.state.SImessage;
    const SUmessage = this.state.SUmessage;

    if (!token) {
      return (
        <Router basename="/project/">
          <div className="App">
            <div className="AppForm">
              <div className="PageSwitcher">
                <NavLink to="/" activeClassName="SwitchActive" className="Switch" style={{ textDecoration: 'none' }}>Home</NavLink>
                <button activeClassName="SwitchActive" className="Switch" onClick={this.toggleSIModal.bind(this)}>Sign In</button>
                <Modal isOpen={this.state.SIModal}>
                  <ModalHeader toggle={this.toggleSIModal.bind(this)}>
                    Sign In
                  </ModalHeader>
                  <ModalBody>
                    <div className="Forms">
                      <form onSubmit={(e) => { this.submitSignin(e) }}>
                        <div className="Form">
                          <label className="Label" htmlFor="email">E-Mail Address</label>
                          <input type="email" id="email" className="Input" placeholder="Enter your email" name="SIemail" onChange={this.handleChange} value={this.setState.SIemail} autoComplete="off" />
                        </div>

                        <div className="Form">
                          <label className="Label" htmlFor="password">Password</label>
                          <input type="password" id="password" className="Input" placeholder="Enter your password" name="SIpassword" onChange={this.handleChange} value={this.setState.SIpassword} autoComplete="off" />
                        </div>
                        {(SImessage) ? (<p>{SImessage}</p>) : (null)}
                        <div className="Form">
                          <button className="Button" onClick={(e) => { this.submitSignin(e) }}>Sign In</button>
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
                      <form onSubmit={(e) => { this.submitSignup(e) }}>
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
                          <button className="Button" onClick={(e) => { this.submitSignup(e) }}>Sign Up</button>
                        </div>
                      </form>
                    </div>
                  </ModalBody>
                </Modal>
              </div>

              <Route exact path="/" component={AppMain}>
              </Route>
            </div>
          </div>
        </Router>
      );
    }
    return (
      <Router basename="/project/">
        <div className="App">
          <div className="AppForm">
            <div className="PageSwitcher">
              <NavLink to="/home" activeClassName="SwitchActive" style={{ textDecoration: 'none' }} className="Switch">Home</NavLink>
              <NavLink to="/info" activeClassName="SwitchActive" style={{ textDecoration: 'none' }} className="Switch">Account</NavLink>
              <button activeClassName="SwitchActive" className="Switch" onClick={this.logout}>Log Out</button>
            </div>

            <Route exact path="/home" component={AppMain}>
            </Route>
            <Route exact path="/info" render={() => <Account ref={(info) => {this.info = info}} userId={this.state.userId} connectionService={connectionService}/>}>
            </Route>
          </div>
        </div>
      </Router>
    );
  }
}

export default App;