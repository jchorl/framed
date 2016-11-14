import React, { Component } from 'react';
import { initHighlighting } from 'highlightjs';
import 'highlightjs/styles/solarized-light.css';
import './GettingStarted.css';

export default class GettingStarted extends Component {
  constructor(props) {
    super(props);
    this.state = {loaded: false, link: '<COMPLETE_STEPS_1_AND_2>'}
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
        this.props.setLoaded();
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

  reset = () => {
    let headers = new Headers();
    headers.append('Accept', 'application/json');
    fetch('/api/reset', {
      headers: headers,
      credentials: 'include'
    }).then(resp => resp.json())
      .then(json => {
        this.setState(Object.assign({albumId: '', link: '<COMPLETE_STEPS_1_AND_2>'}, json));
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
    return (
      <div className="getting-started">
        <h2>Getting Started</h2>
        { this.state.loaded ? (
          <div>
            <div className="step">
              <span className={ this.isAuthd() ? 'complete' : '' }><h3>1. Let Framed access your Google Photos</h3></span>{ this.isAuthd() ? null : <span>: <button className="grant-button" onClick={this.grantAccess}>Grant Access</button></span> }
            </div>
            <div className="step">
              <span className={ this.isComplete() ? 'complete' : '' }><h3>2. Select an album to use</h3></span>{
                this.state.loaded && this.state.state !== 'UNAUTHD'
                  ? (<select value={this.state.albumId} onChange={this.selectAlbum} disabled={this.isComplete()}>
                    {this.state.albums.map(album => (<option key={album.id} value={album.id}>{album.title}</option>))}
                  </select>)
                  : null
              }
            </div>
            <div className="step">
              <h3>3. Embed!</h3>
              <div className="snippets">
                <div className="snippet">
                  HTML:
                  <pre><code className="html">{ `<img id="framed" src="${this.state.link}" />` }</code></pre>
                </div>
                <div className="snippet">
                  For rotation:
                  <pre><code className="javascript">{
`setTimeout(function(){
   document.getElementById('framed').src = '${this.state.link}?' + new Date().getTime()
}, 30000, 30000)`
               }</code></pre>
         </div>
         <div className="snippet">
           For a frame:
           <pre><code className="css">{
`#framed {
  border: 20px solid #461f00;
  box-sizing: border-box;
  padding: 10px;
}`
              }</code></pre>
        </div>
      </div>
    </div>
    { this.isComplete()
        ? <button onClick={this.reset}>Make another!</button>
        : null }
  </div>
        ) : null }
      </div>
    )
  }
}
