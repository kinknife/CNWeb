import React, { Component } from 'react';
import { getFromStorage } from './utils/storage';

class Account extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            name: '',
            password: '',
            userId: '',
            message: ''
        };

        this.handleChange = this.handleChange.bind(this);
    }

    componentWillMount(){
      this.setState({
        message: ''
      })

      const obj = getFromStorage('cnweb');
      if (obj && obj.token) {
        const { token } = obj;
        fetch('http://localhost:4200/verify?token=' + token)
          .then(res => res.json())
          .then(json => {
            console.log('json', json);
            if (json.success) {
              let userId = json.userId;
              fetch('http://localhost:4200/info?userId=' + userId)
              .then(res => res.json())
              .then(json => {
                console.log('json', json);
                if (json.success) {
                  this.setState({
                    email: json.user.email,
                    name: json.user.name,
                    password: json.user.password
                })
              }
            });

            }
          })
      }
    }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  submitUpdate() {
    const {
      email,
      name,
      password
    } = this.state;

    fetch('http://localhost:4200/update', {
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
        console.log('json', json);
        if (json.success) {
          this.setState({
            message: json.message,
          });
        } else {
          this.setState({
            message: json.message
          })
        }
      });
  }

    render() {
        const message = this.state.message;

        return (
        <div className="Forms">
        <form>
            <div className="TitleA"><h2>Account Info</h2></div>
            <div className="FormA">
                <label className="LabelA" htmlFor="email">E-Mail Address</label>
                <input type="email" id="email" className="InputA" placeholder={this.state.email} name="email" onChange={this.handleChange} value={this.state.email} autocomplete="off" disabled/>
            </div>

            <div className="FormA">
                <label className="LabelA" htmlFor="email">name</label>
                <input type="text" id="email" className="InputA" placeholder={this.state.name} name="name" onChange={this.handleChange} value={this.state.name} autocomplete="off" />
            </div>

            <div className="FormA">
                <label className="LabelA" htmlFor="password">Password</label>
                <input type="text" id="password" className="InputA" placeholder={this.state.password} name="password" onChange={this.handleChange} value={this.state.password} autocomplete="off" />
            </div>

            {(message) ? (<p>{message}</p>) : (null)}
            <div className="FormA">
                <button className="Button" onClick={() => {this.submitUpdate()}}>Update</button>
            </div>
        </form>
        </div>
        );
    }
}

export default Account;