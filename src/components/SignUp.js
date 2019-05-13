import React, { Component } from 'react';
<<<<<<< HEAD
import { connectionService } from './service/connection';
=======
import { setInStorage } from './utils/storage';
>>>>>>> 878b955ecc572a3b764a07052f73026316355e1e

class SignUp extends Component {
    constructor() {
        super();

        this.state = {
            email: '',
            password: '',
            name: '',
            alert: false
        };

        this.handleChange = this.handleChange.bind(this);
        this.submitSignUp = this.submitSignUp.bind(this);
    }

    handleChange(e) {
        this.setState({
          [e.target.name]: e.target.value
        });
    }

    submitSignUp() {
        let email = this.state.email;
        let name = this.state.name;
        let password = this.state.password;
    
        fetch('http://localhost:4200/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email,
            name: name,
            password: password,
          }),
        }).then(res => res.json())
          .then(json => {
            if (json.success) {
              setInStorage('cnweb', { token: json.token });
              this.setState({
                password: '',
                email: '',
                name: ''
              });
            }
        });
        this.setState({ alert: true })
      }

    submitSignUp() {
        connectionService.signup({
            email: this.state.email,
            password: this.state.password,
            name: this.state.name
        }).then(res => {
            console.log(res, 'signup');
        })
    }

    render() {
        return (
        <div className="Forms">
            <div className="Title"><h2>Sign Up</h2></div>
            <div className="Form">
                <label className="Label" htmlFor="name">Full Name</label>
                <input type="text" id="name" className="Input" placeholder="Enter your full name" name="name" value={this.state.name} onChange={this.handleChange} autoComplete="off" required/>
            </div>
            <div className="Form">
                <label className="Label" htmlFor="password">Password</label>
                <input type="password" id="password" className="Input" placeholder="Enter your password" name="password" value={this.state.password} onChange={this.handleChange} autoComplete="off" required/>
            </div>
            <div className="Form">
                <label className="Label" htmlFor="email">E-Mail Address</label>
                <input type="email" id="email" className="Input" placeholder="Enter your email" name="email" value={this.state.email} onChange={this.handleChange} autoComplete="off" required/>
            </div>

            <div className="Form">
                <button className="Button" onClick={() => {this.submitSignUp()}}>Sign Up</button> 
            </div>
        </div>
        );
    }
}

export default SignUp;
