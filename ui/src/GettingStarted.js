import React, { Component } from 'react';
import './GettingStarted.css';

export default class GettingStarted extends Component {
  constructor(props) {
    super(props);

    this.state = {loaded: false}
    fetch('/api/state', {
      credentials: 'include'
    })
      .then(response => response.json())
      .then(json => {
        let newState = Object.assign({
          loaded: true
        }, json);
        this.setState(newState);
      });
  }

  selectAlbum = (e) => {
    let albumId = e.target.options[e.target.selectedIndex].value
    let headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');
    fetch('/api/links', {
      headers: headers,
      credentials: 'include',
      method: 'PUT',
      body: JSON.stringify({
        album_id: albumId
      })
    }).then(resp => resp.json())
      .then(json => {
        this.setState(json);
      })
  }

  grantAccess = () => {
    let headers = new Headers();
    headers.append('Accept', 'text/plain');
    fetch('/api/auth/begin', {headers: headers}).then(resp => resp.text()).then(text => window.location = text)
  }

  // TODO if logged in, dont show 1, shift everything back
  // TODO populate albums for 2
  // TODO generate nice embeddable code
  render() {
    return (
      <div className="getting-started">
        <h2>Getting Started</h2>
        <div>
          1. Let Framed access your Google Photos: <button className="grant-button" onClick={this.grantAccess}>Grant Access</button>
        </div>
        <div>
          2. Select an album to use {
            this.state.loaded && this.state.state !== 'UNAUTHD'
              ? (<select value={this.state.album_name} onChange={this.selectAlbum}>
                {this.state.albums.map(album => (<option key={album.id} value={album.id}>{album.title}</option>))}
                </select>)
              : null
          }
        </div>
        <div>
          3. Embed!
        </div>
      </div>
    );
  }
}
