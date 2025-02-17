import { MessageBody, SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets"
import { Socket, Server } from "socket.io";
import { v4 as uuidv4 } from 'uuid'
import { Chess } from 'chess.js'
import { TalkService } from "./talk.service";

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
  handleMove(client: Socket, data: { lobId: string, move: string }) {
    const lobby = this.lobbies[data.lobId]

    if ((lobby.game.turn() === 'w' && client.id === lobby.black.id) || (lobby.game.turn() === 'b' && client.id === lobby.white.id)) {
      client.emit('game', TalkService.responseReturn(false, null, 'not your turn', 'error'))
      return
    }
    if (!lobby.game.moves().includes(data.move)) {
      client.emit('game', TalkService.responseReturn(false, null, 'invalid move', 'error'))
      return
    }

    lobby.game.move(data.move)

    const niceBoard = TalkService.niceBoard(lobby.game.board())
    // lobby.white.emit('game', TalkService.responseReturn(true, niceBoard, null, 'board'))
    // lobby.black.emit('game', TalkService.responseReturn(true, niceBoard, null, 'board'))
    lobby.white.emit('game', niceBoard)
    lobby.black.emit('game', niceBoard)

    console.log(lobby.game.isGameOver(), lobby.game.isCheckmate(), lobby.game.isDraw(), lobby.game.turn());

    if (lobby.game.isGameOver()) {
      if (lobby.game.isDraw()) {
        lobby.white.emit('game', TalkService.responseReturn(true, null, 'game ended in draw !', 'end'))
        lobby.black.emit('game', TalkService.responseReturn(true, null, 'game ended in draw !', 'end'))
      } else if (lobby.game.isCheckmate()) {
        if (lobby.game.turn() === 'w') {
          lobby.white.emit('game', TalkService.responseReturn(true, null, 'black wins !', 'end'))
          lobby.black.emit('game', TalkService.responseReturn(true, null, 'black wins !', 'end'))
        } else {
          lobby.white.emit('game', TalkService.responseReturn(true, null, 'white wins !', 'end'))
          lobby.black.emit('game', TalkService.responseReturn(true, null, 'white wins !', 'end'))
        }
      }

      lobby.white.disconnect()
      lobby.black.disconnect()

      delete this.clients[lobby.white.id]
      delete this.clients[lobby.black.id]
      delete this.lobbies[data.lobId]
    }
  }

  @SubscribeMessage('chat')
  handleChat(client: Socket, data: { lobId: string, msg: string }) {
    const lobby = this.lobbies[data.lobId]

    lobby.white.emit('chat', TalkService.responseReturn(true, data.msg, data.msg, 'chat'))
    lobby.black.emit('chat', TalkService.responseReturn(true, data.msg, data.msg, 'chat'))
  }

  tryToPair(client: Socket) {
    if (this.waitingClients.length > 0) {
      console.log('pairing');

      const opp = this.waitingClients.pop()
      const game = new Chess()

      game.load('7k/5Q2/1Q6/1P3B2/6p1/P1N5/P4PP1/2KR4 w - - 0 37')
      console.log(TalkService.niceBoard(game.board()));
      console.log(game.moves());

      const lobId = uuidv4()
      this.lobbies[lobId] = { game: game, white: client, black: opp }

      this.clients[client.id].isInGame = true
      this.clients[opp.id].isInGame = true

      client.emit('game', TalkService.responseReturn(true, lobId, 'game started! you are white', 'start'))
      opp.emit('game', TalkService.responseReturn(true, lobId, 'game started! you are black', 'start'))
    } else {
      console.log('waiting');
      this.waitingClients.push(client);
      client.emit('game', TalkService.responseReturn(true, null, 'waiting for opponent ...', 'wait'))
    }
  }
}