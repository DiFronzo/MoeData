# MoeData - [MoeData.toolforge.org](https://moedata.toolforge.org/)
Import tracklists from Spotify to Wikidata

## Toolforge

```bash
$ ssh USER@login.tools.wmflabs.org
$ become MYTOOL
$ mkdir ~/public_html
$ git clone https://github.com/DiFronzo/MoeData.git
$ cd MoeData
$ npm run build
$ cp -r build/* ../public_html/
$ cd ..
$ vim service.template
```
Add the following in `service.template`:
```config
backend: kubernetes
type: php7.3
canonical: true
```
```bash
$ vim .lighttpd.conf
```
Add the following in `.lighttpd.conf`:
```config
# Look for files on disk and if not found return our index
url.rewrite-if-not-file = (
    "(.*)" => "/index.html",
)
```
```bash
$ webservice --backend=kubernetes --canonical php7.3 start
$ webservice start
```
## Docker

To use the dockerfile, you could do the following (in root folder):

  ``docker build -f dockerfile -t moedata:prod .``
  
Then run the build:

  ```docker run -it --rm -p 1337:80 moedata:prod```

## Usage
![](https://i.imgur.com/kyxpXLS.png)
When deployed use the url `/album/%SPOTIFY CODE%&qid=%WIKIDATA ITEM%`. 
* Example `/album/7e7t0MCrNDcJZsPwUKjmOc&qid=Q96782371` gives [Pop Smokes album Shoot for the Stars, Aim for the Moon](https://moedata.toolforge.org/album/7e7t0MCrNDcJZsPwUKjmOc&qid=Q96782371).
