import React, { Component } from 'react';
import TwitterLogin from 'react-twitter-auth'; // node package for twitter login

class App extends Component {

  constructor() {
    super();

    this.state = { isAuthenticated: false, user: null, token: ''}; // sets initial state of authentication status
  }
// if authenticated 
  onSuccess = (response) => {
    const token = response.headers.get('x-auth-token');
    response.json().then(user => {
      if (token) {
        this.setState({isAuthenticated: true, user: user, token: token});
      }
    });
  };
// if not authenticated
  onFailed = (error) => {
    alert(error);
  };

  logout = () => {
    this.setState({isAuthenticated: false, token: '', user: null})
  };

  render() {
    let content = !!this.state.isAuthenticated ?
      (
        <div>
          <p>Authenticated</p>
          <div>
            {this.state.user.email}
          </div>
          <div>
            <button onClick={this.logout} className="button" >
              Log out
            </button>
          </div>
        </div>
      ) :
      (
        // Twitter Login Code
        <TwitterLogin loginUrl="http://localhost:4000/api/v1/auth/twitter"
                      onFailure={this.onFailed} 
                      onSuccess={this.onSuccess}
                      requestTokenUrl="http://localhost:4000/api/v1/auth/twitter/reverse"/>
      );

    return (
      <div className="App">
        {content}
      </div>
    );
  }
}

export default App;