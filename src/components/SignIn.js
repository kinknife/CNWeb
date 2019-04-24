import React, { Component } from 'react';

class SignIn extends Component {
    constructor() {
        super();

        this.state = {
            email: '',
            password: ''
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

    render() {
        return (
        <div className="Forms">
        <form onSubmit={this.handleSubmit}>
            <div className="Title"><h2>Sign In</h2></div>
            <div className="Form">
                <label className="Label" htmlFor="email">E-Mail Address</label>
                <input type="email" id="email" className="Input" placeholder="Enter your email" name="email" value={this.state.email} onChange={this.handleChange} autocomplete="off" />
            </div>

            <div className="Form">
                <label className="Label" htmlFor="password">Password</label>
                <input type="password" id="password" className="Input" placeholder="Enter your password" name="password" value={this.state.password} onChange={this.handleChange} autocomplete="off" />
            </div>

            <div className="Form">
                <button className="Button">Sign In</button>
            </div>
        </form>
        </div>
        );
    }
}

export default SignIn;