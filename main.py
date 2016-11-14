import webapp2
import random
import uuid
import json
import os
from httplib2 import Http

from bs4 import BeautifulSoup
import jwt
from oauth2client import client
from google.appengine.ext import ndb

import secrets

GOOGLE_PHOTOS_SCOPES = ['https://picasaweb.google.com/data/', 'https://www.googleapis.com/auth/userinfo.email']
DOMAIN = 'localhost:8080'
APP_URL = 'http://' + DOMAIN

STATE_UNAUTHD = 'UNAUTHD'
STATE_NO_ALBUM = 'NO_ALBUM'
STATE_COMPLETE = 'STATE_COMPLETE'


class Link(ndb.Model):
    link = ndb.TextProperty(required=True)
    credentials = ndb.TextProperty(required=True)
    user_id = ndb.StringProperty(required=True)
    album_id = ndb.TextProperty()
    created = ndb.DateTimeProperty(auto_now_add=True)
    modified = ndb.DateTimeProperty(auto_now=True)

    def get_credentials(self):
        return client.OAuth2Credentials.from_json(str(self.credentials))


def is_production():
    return os.getenv('SERVER_SOFTWARE', '').startswith('Google App Engine/')


def fetch_albums(credentials, user_id):
    http = credentials.authorize(Http())
    resp, content = http.request('https://picasaweb.google.com/data/feed/api/user/' + user_id, 'GET', headers={'GData-Version': '2'})

    if resp.status != 200:
        raise 'Call to Picasa album list API returned status %d with body %s' % (resp, content)

    return content


def get_albums(credentials, user_id):
    content = fetch_albums(credentials, user_id)
    parsed = BeautifulSoup(content)
    return [{'id': entry.find('gphoto:id').string, 'title': entry.title.string} for entry in parsed.find_all('entry')]


def get_photo_links_from_album(credentials, album_id):
    http = credentials.authorize(Http())
    # sizing: https://developers.google.com/picasa-web/docs/2.0/reference#Parameters
    resp, content = http.request('https://picasaweb.google.com/data/feed/api/user/default/albumid/%s?imgmax=%s' % (album_id, '1024u'))

    if resp.status != 200:
        raise 'Call to Picasa list in album API returned status %d with body %s' % (resp, content)

    parsed = BeautifulSoup(content)
    return [entry.content['src'] for entry in parsed.find_all('entry')]


def get_link_from_cookies(cookies):
        encoded = cookies.get('link')
        if not encoded:
            return None
        decoded = jwt.decode(encoded, secrets.JWT, algorithms=['HS256'])
        if not decoded or 'link' not in decoded:
            return None
        key = ndb.Key(urlsafe=decoded['link'])
        return key.get()


def write_json(response, content):
    response.headers['Content-Type'] = 'application/json'
    return response.out.write(json.dumps(content))


class Links(webapp2.RequestHandler):
    def put(self):
        pass


class RandomPhoto(webapp2.RequestHandler):
    def get(self):
        try:
            link = get_link_from_cookies(self.request.cookies)
            credentials = link.get_credentials()
            album_id = link.album_id(credentials)
            if not album_id:
                self.response.write('album_id not found: %s' % album_id)
                self.response.set_status(404)
                return

            photo_ids = get_photo_links_from_album(credentials, album_id)
            if not photo_ids:
                self.response.write('no photos found in album: %s' % album_id)
                self.response.set_status(404)
                return

            self.response.headers['Content-Type'] = 'text/plain'
            self.response.write(random.choice(photo_ids))

        except Exception as e:
            self.response.write(str(e))
            self.response.set_status(500)


def get_flow():
    flow = client.flow_from_clientsecrets(
        'client_secret.json',
        scope=GOOGLE_PHOTOS_SCOPES,
        redirect_uri=APP_URL + '/api/auth/complete')
    flow.params['access_type'] = 'offline'
    return flow


class BeginAuth(webapp2.RequestHandler):
    def get(self):
        flow = get_flow()
        auth_uri = flow.step1_get_authorize_url()
        self.response.headers['Content-Type'] = 'text/plain'
        return self.response.out.write(str(auth_uri))


def create_link(credentials):
    user_id = get_user_id(credentials)
    link = Link(link=uuid.uuid4().hex[:6], credentials=credentials.to_json(), user_id=user_id)
    return link.put()


def get_user_id(credentials):
    http = credentials.authorize(Http())
    resp, content = http.request('https://www.googleapis.com/userinfo/v2/me', 'GET')
    if resp.status != 200:
        raise 'Call to Google userinfo API returned status %d with body %s' % (resp, content)

    parsed = json.loads(content)
    return parsed['id']


class AuthComplete(webapp2.RequestHandler):
    def get(self):
        if 'error' in self.request.GET or 'code' not in self.request.GET:
            return self.redirect(APP_URL)
        code = self.request.GET['code']
        flow = get_flow()
        credentials = flow.step2_exchange(code)
        key = create_link(credentials)
        encoded = jwt.encode({'link': key.urlsafe()}, secrets.JWT, algorithm='HS256')
        if is_production():
            self.response.set_cookie('link', encoded, path='/',
                                     domain=DOMAIN, secure=True, httponly=True,
                                     max_age=60 * 60 * 24 * 7)
        else:
            self.response.set_cookie('link', encoded, path='/', secure=False)
        return self.redirect(APP_URL)


class Reset(webapp2.RequestHandler):
    def get(self):
        link = get_link_from_cookies(self.request.cookies)
        key = create_link(link.get_credentials())
        encoded = jwt.encode({'link': key.urlsafe()}, secrets.JWT, algorithm='HS256')
        self.response.set_cookie('link', encoded, path='/',
                                 domain=DOMAIN, secure=True)


class StateRouter(webapp2.RequestHandler):
    def get(self):
        resp = {}
        link = get_link_from_cookies(self.request.cookies)
        if not link:
            resp['state'] = STATE_UNAUTHD
        elif not link.album_id:
            credentials = link.get_credentials()
            albums = get_albums(credentials, link.user_id)
            resp['state'] = STATE_NO_ALBUM
            resp['albums'] = albums
        else:
            albums = get_albums(credentials, link.user_id)
            resp['state'] = STATE_COMPLETE
            resp['link'] = link.link
            resp['albums'] = albums

        return write_json(self.response, resp)


app = webapp2.WSGIApplication([
    ('/api/state', StateRouter),
    ('/api/links', Links),
    ('/api/photo', RandomPhoto),
    ('/api/auth/begin', BeginAuth),
    ('/api/auth/complete', AuthComplete),
    ('/api/reset', Reset),
], debug=True)
