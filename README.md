# MoeData
Import tracklists from Spotify to Wikidata

## Docker

To use the dockerfile, you could do the following:

  ``docker build -f dockerfile -t moedata:prod .``
  
Then run the build:

  ```docker run -it --rm -p 1337:80 moedata:prod```
