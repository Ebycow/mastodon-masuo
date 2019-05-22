# masuo
[Mastodon.social](https://mastodon.social)のタイムラインで、メディアファイルが拒否されているユーザのアイコンを表示できるようにするUserScript

# usage
## backend
スクリプトはバックエンドのサーバにユーザID(ex. ebycow@mastodon.social)を問い合わせ、画像をキャッシュしながら取得します。

デプロイ用Dockerfileがあります。
```
docker build ./ -t masuo-backend
```
```
docker run -itd --name=masuo-backend --restart=always --volume=masuo:/mastodon-masuo/databases --publish=2243:2243 masuo-backend
```

## frontend
[TamperMonkey](https://www.tampermonkey.net/) をインストールした後、 https://github.com/Ebycow/mastodon-masuo/raw/master/masuo.user.js を開いて下さい。  
