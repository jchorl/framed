import random
from httplib2 import Http

from bs4 import BeautifulSoup
from oauth2client.service_account import ServiceAccountCredentials

GOOGLE_PHOTOS_SCOPES = 'https://picasaweb.google.com/data/'


def get_credentials():
    # TODO support other types of credentials
    return ServiceAccountCredentials.from_json_keyfile_name('creds.json', scopes=GOOGLE_PHOTOS_SCOPES)


def get_delegated_credentials(credentials):
    return credentials.create_delegated('josh@joshchorlton.com')


def is_favourites_album(tag):
    return tag.name == 'entry' and tag.title.string.lower() == 'favourites'


def is_album_id(tag):
    return tag.name == 'id' and tag.prefix == 'gphoto'


def get_favourites_album_id(credentials):
    http = credentials.authorize(Http())
    resp, content = http.request('https://picasaweb.google.com/data/feed/api/user/josh@joshchorlton.com', 'GET', headers={'GData-Version': 2})

    if resp.status != 200:
        print 'Call to Picasa album list API returned status %d with body %s' % (resp, content)
        # TODO return 500 status
        return None

    parsed = BeautifulSoup(content, 'xml')
    found = parsed.find(is_favourites_album)
    if not found:
        return None
    found = found.find(is_album_id)
    if not found:
        return None
    return found.string


def get_photo_links_from_album(credentials, album_id):
    http = credentials.authorize(Http())
    # sizing: https://developers.google.com/picasa-web/docs/2.0/reference#Parameters
    resp, content = http.request('https://picasaweb.google.com/data/feed/api/user/default/albumid/%s?imgmax=%s' % (album_id, '1024u'))

    if resp.status != 200:
        print 'Call to Picasa list in album API returned status %d with body %s' % (resp, content)
        # TODO return 500 status
        return None

    parsed = BeautifulSoup(content, 'xml')
    return [entry.content['src'] for entry in parsed.find_all('entry')]


if __name__ == '__main__':
    creds = get_credentials()
    delegated_creds = get_delegated_credentials(creds)
    album_id = get_favourites_album_id(delegated_creds)
    if not album_id:
        print 'Could not find album'
    else:
        photo_ids = get_photo_links_from_album(delegated_creds, album_id)
        if not photo_ids:
            print 'Album is empty'
        print random.choice(photo_ids)
