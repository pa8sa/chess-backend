import { MessageBody, SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets"
import { Socket, Server } from "socket.io";
import { v4 as uuidv4 } from 'uuid'
import { Chess } from 'chess.js'

@WebSocketGateway(3002, {})
export class TalkGateway implements OnGatewayConnection, OnGatewayDisconnect {
  lobbies: { [key: string]: { game: Chess, white: Socket, black: Socket } } = {};
  clients: { [key: string]: { socket: Socket, isInGame: boolean } } = {};
  waitingClients: Socket[] = [];

  handleConnection(client: Socket) {
    console.log(`client connected : ${client.id}`);
    this.clients[client.id] = { socket: client, isInGame: false }
    this.tryToPair(client);
  }

  handleDisconnect(client: Socket) {
    console.log(`client disconnected : ${client.id}`);
    delete this.clients[client.id]
  }

  @SubscribeMessage('move')
  handleMove(client: Socket, data: string) {
    const obj: {lobId: string, move: string} = JSON.parse(data)
    const lobby = this.lobbies[obj.lobId]

    lobby.game.move(obj.move)
    console.log(lobby.game.board());
  }

  tryToPair(client: Socket) {
    if (this.waitingClients.length > 0) {
      console.log('pairing');

      const opp = this.waitingClients.pop()
      const game = new Chess()

      const lobId = uuidv4()
      this.lobbies[lobId] = { game: game, white: client, black: opp }

      this.clients[client.id].isInGame = true
      this.clients[opp.id].isInGame = true

      client.emit('game', lobId)
      opp.emit('game', lobId)
    } else {
      console.log('waiting');
      this.waitingClients.push(client);
    }
  }
}