import React, { Component } from 'react';
import { connectionService } from './service/connection';

class SignUp extends Component {
    constructor() {
        super();

        this.state = {
            email: '',
            password: '',
            name: ''
        };

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
        this.setState({
          [e.target.name]: e.target.value
        });
    }

    handleSubmit(e){
        e.preventDefault();
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
        <form onSubmit={this.handleSubmit}>
            <div className="Title"><h2>Sign Up</h2></div>
            <div className="Form">
                <label className="Label" htmlFor="name">Full Name</label>
                <input type="text" id="name" className="Input" placeholder="Enter your full name" name="name" value={this.state.name} onChange={this.handleChange} autoComplete="off" />
            </div>
            <div className="Form">
                <label className="Label" htmlFor="password">Password</label>
                <input type="password" id="password" className="Input" placeholder="Enter your password" name="password" value={this.state.password} onChange={this.handleChange} autoComplete="off" />
            </div>
            <div className="Form">
                <label className="Label" htmlFor="email">E-Mail Address</label>
                <input type="email" id="email" className="Input" placeholder="Enter your email" name="email" value={this.state.email} onChange={this.handleChange} autoComplete="off" />
            </div>

            <div className="Form">
                <button className="Button" onClick={() => {this.submitSignUp()}}>Sign Up</button> 
            </div>
        </form>
        </div>
        );
    }
}

export default SignUp;
