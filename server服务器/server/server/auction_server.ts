import * as express from 'express';
import * as path from 'path';
import {Server} from 'ws';


const app = express();  //app是为了声明服务器端所能提供的http服务的

export class Product{
    constructor(
      public id:number,
      public title:string,
      public price:number,
      public rating:number,
      public desc:string,
      public categories:Array<string>){
  
    }
}

  export class Comment{

    constructor(
      public id:number,
      public productId:number,
      public timestamp:string,
      public user:string,
      public rating:number,
      public content:string
    
    ){
    
    }
    
}

  const products: Product[] = [
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

  const comments:Comment[] = [
    new Comment(1,1,"2017-02-02 22:02:13","张三",5,"闯红灯一次"),
    new Comment(2,1,"2017-03-15 15:36:12","李四",1,"违停一次"),
    new Comment(3,2,"2017-02-06 08:36:22","王五",3,"超速一次"),
    new Comment(4,2,"2017-04-02 10:27:02","赵六",4,"疲劳驾驶一次"),
    new Comment(5,3,"2017-04-20 19:08:46","陈七",4,"逆行一次"),
  ]

app.use('/',express.static(path.join(__dirname, '..', 'client')));

app.get('/api/products', (req,res) => {
    let result = products;
    let params = req.query;

    if(params.title){
        result = result.filter((p) => p.title.indexOf(params.title) !== -1);
    }

    if(params.price && result.length > 0){
        result = result.filter((p) => p.price <= parseInt(params.price));
    }

    if(params.category !=="-1" && result.length > 0){
        result = result.filter((p) => p.categories.indexOf(params.category) !== -1);
    }

    res.json(result);
});

app.get('/api/product/:id', (req,res) => {
    res.json(products.find((product) => product.id == req.params.id));
});

app.get('/api/product/:id/comments', (req,res) => {
    res.json(comments.filter((comment:Comment) => comment.productId == req.params.id));
});


const server = app.listen(8000, "localhost", () => {
    console.log("server is working：http://localhost:8000");
});

const subscriptions = new Map<any,number[]>();

const wsServer = new Server({port:8085});
wsServer.on("connection",websocket =>{
    websocket.send('The message was sent by server');
    websocket.on('message', message => {
        //let str = message;
        //let messageObj = JSON.parse(message);
        //let productIds = subscriptions.get(websocket) || [];
        //subscriptions.set(websocket, [...productIds,messageObj.productId]);
        console.log("接收到消息："+message)
    });
});

const currentBids = new Map<number,number>();

setInterval(() => {

    products.forEach( p=> {
        let currentBid = currentBids.get(p.id) || p.price;
        let newBid = currentBid - Math.random() * 5;
        currentBids.set(p.id, newBid);
    });

    subscriptions.forEach((productIds: number[], ws) => {
        if(ws.readyState === 1){
            let newBids = productIds.map( pid => ({
                productId: pid,
                bid: currentBids.get(pid)
            }));
            ws.send(JSON.stringify(newBids));
        }else{
            subscriptions.delete(ws);
        }
        
    });
    
},2000);