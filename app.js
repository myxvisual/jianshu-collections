import http from 'http';
import fs from 'fs';
import cheerio from 'cheerio';
import syncRequest from 'sync-request';
import colors from 'colors';
import path from 'path';

// get jianshu all collections
const collections = [];
const collectionsURL = 'http://www.jianshu.com/collections';
const collectionsBODY = syncRequest('GET', collectionsURL).getBody().toString();
const $collections = cheerio.load(collectionsBODY);

$collections('.collections-list>li').each(() => {
  const collection = {
    title: $collections('.collections-info>h5>a').first().text(),
    url: $collections('.avatar').first().attr('href'),
    description: $collections('.description').first().text(),
    articles: ($collections('.blue-link').first().text()).match(/\d+/)[0],
  };
  $collections('.collections-info>h5>a').first().remove();
  $collections('.collections-info>a').first().remove();
  $collections('.description').first().remove();
  $collections('.blue-link').first().remove();
  collections.push(collection);
});

fs.existsSync('download') || fs.mkdir('download');
console.log(collections);


// get jianshu coder articles
const articlesList = [];
const codeUrl = 'http://www.jianshu.com/collection/NEt52a';
const body = syncRequest('GET', codeUrl).getBody().toString();
const findID = /\{\"id\"\:(\d+)/;
const articlesID = body.match(findID)[1];
const number = 2;
const moreArticles = 'http://www.jianshu.com/collections/' + articlesID +  '/notes?order_by=added_at&page=' + number;
const $ = cheerio.load(body);
$('.article-list>li').each(() => {
  const HOST = 'http://www.jianshu.com/';
  const getRead = /阅读[^\w](\d+)/;
  const getComment = /评论[^\w](\d+)/;
  const getLike = /喜欢[^\w](\d+)/;
  const article = {
    author: $('.author-name', '.article-list>li').first().text(),
    authorUrl: HOST + $('.author-name', '.article-list>li').first().attr('href'),
    img: $('.wrap-img img', '.article-list>li').first().attr('src'),
    time: $('.time', '.article-list>li').first().attr('data-shared-at'),
    title: $('.title a', '.article-list>li').first().text(),
    url: HOST + $('.title a', '.article-list>li').first().attr('href'),
    read: ($('.list-footer', '.article-list>li').first().text().match(getRead))[1],
    comment: ($('.list-footer', '.article-list>li').first().text().match(getComment))[1],
    like: ($('.list-footer', '.article-list>li').first().text().match(getLike))[1],
  };
  $('.author-name', '.article-list>li').first().remove();
  $('.wrap-img img', '.article-list>li').first().remove();
  $('.time', '.article-list>li').first().remove();
  $('.title a', '.article-list>li').first().remove();
  $('.list-footer', '.article-list>li').first().remove();
  articlesList.push(article);
});

console.log(('This Article Collection ID is ' + articlesID).blue);
// console.log(articlesList);
// save data
if (!fs.existsSync('download')) {
  fs.mkdir('download');
}

const writeArticles = fs.createWriteStream('download/articles.json', { flags: 'w' });
writeArticles.write(JSON.stringify(articlesList));

(fs.createWriteStream('download/collections.json')).write(JSON.stringify(collections));
