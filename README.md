# MoeData
Import tracklists from Spotify to Wikidata

## Docker

To use the dockerfile, you could do the following:

  ``docker build -f dockerfile -t moedata:prod .``
  
Then run the build:

  ```docker run -it --rm -p 1337:80 moedata:prod```

## Usage
![](https://i.imgur.com/dGqOdzr.png)
When deployed use the url `/album/%SPOTIFY CODE%&qid=%WIKIDATA ITEM%`. Example `/album/
1ATL5GLyefJaxhQzSPVrLX&qid=Q55146346` gives Drakes album Scorpion.
