
    import { WebSocketServer , WebSocket  } from "ws";

    const ws = new WebSocketServer({port: 8080});

    const subscriptions: {[keys:string]:{
        ws: WebSocket,
        rooms:string[]
    }} ={

    }

    ws.on('connection', function connection(userSocket){
        const id = randomId();
        subscriptions[id] = {
            ws: userSocket,
            rooms: []
        }

        userSocket.on('message', function message(data){
            const parsedMessage = JSON.parse(data.toString());

            if(parsedMessage.type === "SUBSCRIBE"){
                subscriptions[id]?.rooms.push(parsedMessage.room)
            }

            if(parsedMessage.type == "sendMessage"){
                const message = parsedMessage.message;
            Object.keys(subscriptions).forEach((userId) => {
                const { ws, rooms }: any = subscriptions[userId];
            if (rooms.includes(parsedMessage.room)) {
                ws.send(JSON.stringify(message));

            }
            });

            }
            userSocket.send('hey your send me : '+ JSON.stringify(parsedMessage));
        })
    })


    function randomId(){
        return Math.random();
    }