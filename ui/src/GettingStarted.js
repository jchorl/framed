import React, { Component } from 'react';
import { initHighlighting } from 'highlightjs';
import 'highlightjs/styles/solarized-light.css';
import './GettingStarted.css';

export default class GettingStarted extends Component {
  constructor(props) {
    super(props);
    this.state = {loaded: false}
  }

  componentDidMount() {
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

  componentDidUpdate() {
    initHighlighting();
  }

  selectAlbum = (event) => {
    let albumId = event.target.value;
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
        this.setState(Object.assign(json, {albumId}));
      })
  }

  grantAccess = () => {
    let headers = new Headers();
    headers.append('Accept', 'text/plain');
    fetch('/api/auth/begin', {headers: headers}).then(resp => resp.text()).then(text => window.location = text)
  }

  isAuthd = () => this.state.state !== 'UNAUTHD'
  isComplete = () => this.state.state === 'COMPLETE'

  render() {
    return this.state.loaded ? (
      <div className="getting-started">
        <h2>Getting Started</h2>
        <div className="step">
          <span className={ this.isAuthd() ? 'complete' : '' }>1. Let Framed access your Google Photos</span>{ this.isAuthd() ? null : <span>: <button className="grant-button" onClick={this.grantAccess}>Grant Access</button></span> }
        </div>
        <div className="step">
          <span className={ this.isComplete() ? 'complete' : '' }>2. Select an album to use </span>{
            this.state.loaded && this.state.state !== 'UNAUTHD'
              ? (<select value={this.state.albumId} onChange={this.selectAlbum}>
                {this.state.albums.map(album => (<option key={album.id} value={album.id}>{album.title}</option>))}
              </select>)
              : null
          }
        </div>
        <div className="step">
          3. Embed!
          <div className="snippets">
            <div>
              HTML:
              <pre><code className="html">{ `<img id="framed" src="SOURCE" />` }</code></pre>
            </div>
            <div>
              Javascript:
              <pre><code className="html">{ `document.getElementById('framed').src = getNext()` }</code></pre>
            </div>
          </div>
        </div>
      </div>
    ) : null;
  }
}
