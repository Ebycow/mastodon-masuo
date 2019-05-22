# masuo
美味しさ宮城二段落ち　青釜カッターは海老焼き

# usage
```
docker build ./ -t masuo-backend
```

```
docker run -itd --name=masuo-backend --restart=always --volume=masuo:/mastodon-masuo/databases --publish=2243:2243 masuo-backend
```

https://github.com/Ebycow/mastodon-masuo/raw/master/masuo.user.js