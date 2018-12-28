"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var path = require("path");
var ws_1 = require("ws");
var app = express(); //app是为了声明服务器端所能提供的http服务的
var Product = /** @class */ (function () {
    function Product(id, title, price, rating, desc, categories) {
        this.id = id;
        this.title = title;
        this.price = price;
        this.rating = rating;
        this.desc = desc;
        this.categories = categories;
    }
    return Product;
}());
exports.Product = Product;
var Comment = /** @class */ (function () {
    function Comment(id, productId, timestamp, user, rating, content) {
        this.id = id;
        this.productId = productId;
        this.timestamp = timestamp;
        this.user = user;
        this.rating = rating;
        this.content = content;
    }
    return Comment;
}());
exports.Comment = Comment;
var products = [
    new Product(1, "宝马320", 59, 3.5, "这是第一个商品，是我通过Angular创建的", ["宝马"]),
    new Product(2, "奔驰c200", 299, 4.6, "这是第二个商品，这是第一个商品，是我通过Angular创建的", ["奔驰"]),
    new Product(3, "奥迪A8L", 399, 3.7, "这是第三个商品，这是第一个商品，是我通过Angular创建的", ["奥迪"]),
    new Product(4, "劳斯莱斯幻影", 499, 4.5, "这是第四个商品，是我通过Angular创建的", ["劳斯莱斯"]),
    new Product(5, "保时捷", 599, 2.5, "这是第五个商品，是我通过Angular创建的", ["保时捷"]),
    new Product(6, "法拉利", 699, 3.8, "这是第六个商品，是我通过Angular创建的", ["法拉利"]),
    new Product(7, "宝马5系", 79, 4.5, "这是第七个商品，是我通过Angular创建的", ["宝马"]),
    new Product(8, "宝马7系", 109, 3.5, "这是第八个商品，是我通过Angular创建的", ["宝马"]),
    new Product(9, "奥迪A4L", 39, 3.7, "这是第九个商品，是我通过Angular创建的", ["奥迪"]),
    new Product(10, "奥迪A6L", 68, 3.7, "这是第十个商品，是我通过Angular创建的", ["奥迪"]),
    new Product(11, "奥迪A8", 299, 3.7, "这是第十一个商品，是我通过Angular创建的", ["奥迪"]),
    new Product(12, "奔驰c300", 329, 4.6, "这是第十二个商品，是我通过Angular创建的", ["奔驰"]),
];
var comments = [
    new Comment(1, 1, "2017-02-02 22:02:13", "张三", 5, "闯红灯一次"),
    new Comment(2, 1, "2017-03-15 15:36:12", "李四", 1, "违停一次"),
    new Comment(3, 2, "2017-02-06 08:36:22", "王五", 3, "超速一次"),
    new Comment(4, 2, "2017-04-02 10:27:02", "赵六", 4, "疲劳驾驶一次"),
    new Comment(5, 3, "2017-04-20 19:08:46", "陈七", 4, "逆行一次"),
];
app.use('/', express.static(path.join(__dirname, '..', 'client')));
app.get('/api/products', function (req, res) {
    var result = products;
    var params = req.query;
    if (params.title) {
        result = result.filter(function (p) { return p.title.indexOf(params.title) !== -1; });
    }
    if (params.price && result.length > 0) {
        result = result.filter(function (p) { return p.price <= parseInt(params.price); });
    }
    if (params.category !== "-1" && result.length > 0) {
        result = result.filter(function (p) { return p.categories.indexOf(params.category) !== -1; });
    }
    res.json(result);
});
app.get('/api/product/:id', function (req, res) {
    res.json(products.find(function (product) { return product.id == req.params.id; }));
});
app.get('/api/product/:id/comments', function (req, res) {
    res.json(comments.filter(function (comment) { return comment.productId == req.params.id; }));
});
var server = app.listen(8000, "localhost", function () {
    console.log("server is working：http://localhost:8000");
});
var subscriptions = new Map();
var wsServer = new ws_1.Server({ port: 8085 });
wsServer.on("connection", function (websocket) {
    websocket.send('The message was sent by server');
    websocket.on('message', function (message) {
        //let str = message;
        //let messageObj = JSON.parse(message);
        //let productIds = subscriptions.get(websocket) || [];
        //subscriptions.set(websocket, [...productIds,messageObj.productId]);
        console.log("接收到消息：" + message);
    });
});
var currentBids = new Map();
setInterval(function () {
    products.forEach(function (p) {
        var currentBid = currentBids.get(p.id) || p.price;
        var newBid = currentBid - Math.random() * 5;
        currentBids.set(p.id, newBid);
    });
    subscriptions.forEach(function (productIds, ws) {
        if (ws.readyState === 1) {
            var newBids = productIds.map(function (pid) { return ({
                productId: pid,
                bid: currentBids.get(pid)
            }); });
            ws.send(JSON.stringify(newBids));
        }
        else {
            subscriptions.delete(ws);
        }
    });
}, 2000);
