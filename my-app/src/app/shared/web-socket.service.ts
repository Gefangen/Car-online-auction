import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import 'rxjs/Rx';

@Injectable()
export class WebSocketService {
  ws:WebSocket;

  constructor() { }

  createObservableSocket(url:string, id:number) : Observable<any>{
    this.ws = new WebSocket(url);
    return new Observable<string>(
      observer =>{
        this.ws.onmessage = (event) => observer.next(event.data);
        this.ws.onerror = (event) => observer.error(event);
        this.ws.onclose = (event) => observer.complete();
        this.ws.onopen = (event) => this.sendMessage({productId:id});  //send的是一个对象
        return () => this.ws.close();
      }
    ).map(message => {JSON.parse(message)});
  }

  sendMessage(message:any){  //any表示send什么类型都可以
    this.ws.send(JSON.stringify(message));   //但原则上message是一个字符串，所以将message对象转为字符串发出去
    //this.ws.send(message);
  }

}