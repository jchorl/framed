import React, { Component } from 'react';

export default class FAQ extends Component {
  render() {
    return (
      <div className="section">
        <h2>FAQ</h2>
        <h4>Why do you need to grant permissions on your photos AND identity?</h4>
        Framed needs these permissions to list your albums and fetch your photos. You can read the source at <a href="https://github.com/jchorl/framed" target="_blank">github.com/jchorl/framed</a>. If you know of a better way of doing this, please do let me know. Also feel free to host this yourself, and then I get none of your data and it's less load on my servers.
        <h4>How can you host this yourself?</h4>
        Clone <a href="https://github.com/jchorl/framed" target="_blank">github.com/jchorl/framed</a>. Create a file called <code>secrets.py</code> with <code>JWT = {`<YOUR_JWT_SECRET>`}</code> in the root directory. Change the domain at the top of <code>main.py</code>. Create a project on App Engine and modify <code>app.yaml</code> to point to your own project. Deploy like any other App Engine app.
        <h4>Image sizing?</h4>
        Should be an option soon, depending on server load. See <code>get_photo_links_from_album</code> function in <code>main.py</code>. Then deploy yourself.
      </div>
    );
  }
}
