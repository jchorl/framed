# Framed

See framed.joshchorlton.com for instructions

## Running yourself
1. Install docker
2. Add a file called secrets.py with `JWT = '<JWT KEY>'`
3. Generate an OAuth2 secrets file from App Engine and put it in the project folder called client_secret.json. See https://developers.google.com/identity/protocols/OAuth2.
4. `make build`
5. `make run`
6. Go to `http://localhost:8080`

## Contributing

Yes please
1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request
