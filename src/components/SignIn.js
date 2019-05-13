import React, { Component } from 'react';
import { connectionService } from './service/connection';
import { setInStorage, getFromStorage } from './utils/storage';

class SignIn extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            password: '',
            token: ''
        };

        this.handleChangeEmail = this.handleChangeEmail.bind(this);
        this.handleChangePassword = this.handleChangePassword.bind(this);
        this.submitSignin = this.submitSignin.bind(this);
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
                token,
              });
            }
          });
      }
    }

    handleChangeEmail(e) {
        this.setState({
          email: e.target.value
        });
    }

    handleChangePassword(e) {
        this.setState({
          password: e.target.value
        });
    }

    submitSignin() {
        const {
          email,
          password
        } = this.state;
        fetch('http://localhost:4200/signin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: email,
              password: password,
            })
          }).then(res => res.json())
            .then(json => {
              if (json.success) {
                setInStorage('cnweb', { token: json.token });
                this.setState({
                  password: '',
                  email: '',
                  token: json.token,
                  message: json.message
                });
              }
            });
    }

    submitSignin() {
        let user = {
            email: this.state.email,
            password: this.state.password
        };
        connectionService.signin(user).then(res => {
            console.log(res, 'signin');
        })
    }

    render() {
        return (
        <div className="Forms">
        <form>
            <div className="Title"><h2>Sign In</h2></div>
            <div className="Form">
                <label className="Label" htmlFor="email">E-Mail Address</label>
                <input type="email" id="email" className="Input" placeholder="Enter your email" name="email" onChange={this.handleChangeEmail} value={this.setState.email} autocomplete="off" required/>
            </div>

            <div className="Form">
                <label className="Label" htmlFor="password">Password</label>
                <input type="password" id="password" className="Input" placeholder="Enter your password" name="password" onChange={this.handleChangePassword} value={this.setState.password} autocomplete="off" required/>
            </div>

            <div className="Form">
                <button className="Button" onClick={() => this.submitSignin()}>Sign In</button>
            </div>
        </form>
        </div>
        );
    }
}

export default SignIn;