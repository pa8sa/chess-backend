import { MessageBody, SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets"
import { Socket, Server } from "socket.io";
import { v4 as uuidv4 } from 'uuid'
import { Chess } from 'chess.js'
import { TalkService } from "./talk.service";
import { UserService } from '../user/user.service';
import { GameService } from "../game/game.service";
import { Logger } from '@nestjs/common';

@WebSocketGateway(3002, {})
export class TalkGateway implements OnGatewayConnection, OnGatewayDisconnect {
  lobbies: { [key: string]: { game: Chess, white: Socket, black: Socket } } = {};
  clients: { [key: string]: { socket: Socket, isInGame: boolean } } = {};
  waitingClients: Socket[] = [];

  private readonly logger = new Logger(TalkGateway.name)

  constructor(
    private userService: UserService,
    private gameService: GameService,
  ) {}

  handleConnection(client: Socket) {
    if (!TalkService.checkToken(client.handshake.headers.authorization)) {
      client.emit('game', TalkService.responseReturn(false, null, 'first login or signup', 'error'))
      client.disconnect()
      return
    }
    this.logger.log(`client connected : ${client.id}`)
    console.log(`client connected : ${client.id}`);
    this.clients[client.id] = { socket: client, isInGame: false }
    this.tryToPair(client);
  }

  handleDisconnect(client: Socket) {
    console.log(`client disconnected : ${client.id}`);
    delete this.clients[client.id]
  }

  @SubscribeMessage('move')
  async handleMove(client: Socket, data: { lobId: string, move: string }) {
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
      const whiteUsername: string = TalkService.getUsername(lobby.white.handshake.headers.authorization);
      const blackUsername: string = TalkService.getUsername(lobby.black.handshake.headers.authorization);
      if (lobby.game.isDraw()) {
        lobby.white.emit('game', TalkService.responseReturn(true, null, 'game ended in draw !', 'end'))
        lobby.black.emit('game', TalkService.responseReturn(true, null, 'game ended in draw !', 'end'))
        await this.userService.updateUsersGameResult(
          whiteUsername,
          blackUsername,
          true
        );
        await this.gameService.createGame(whiteUsername, blackUsername, true, false, lobby.game.pgn())
      } else if (lobby.game.isCheckmate()) {
        if (lobby.game.turn() === 'w') {
          lobby.white.emit('game', TalkService.responseReturn(true, null, 'black wins !', 'end'))
          lobby.black.emit('game', TalkService.responseReturn(true, null, 'black wins !', 'end'))
          await this.userService.updateUsersGameResult(
            blackUsername,
            whiteUsername,
            false
          );
          await this.gameService.createGame(whiteUsername, blackUsername, false, false, lobby.game.pgn())
        } else {
          lobby.white.emit('game', TalkService.responseReturn(true, null, 'white wins !', 'end'))
          lobby.black.emit('game', TalkService.responseReturn(true, null, 'white wins !', 'end'))
          await this.userService.updateUsersGameResult(
            whiteUsername,
            blackUsername,
            false
          );
          await this.gameService.createGame(whiteUsername, blackUsername, false, true, lobby.game.pgn())
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

      game.loadPgn(`[Event "?"]
                    [Site "?"]
                    [Date "????.??.??"]
                    [Round "?"]
                    [White "?"]
                    [Black "?"]
                    [Result "1-0"]
                    [Link "https://www.chess.com/analysis/game/pgn/RvZ8YhZxA?tab=analysis"]

                    1. d4 d5 2. c4 dxc4 3. e4 Nf6 4. Bxc4 Nxe4 5. Nc3 Nxc3 6. bxc3 Qxd4 7. Qxd4 g6
                    8. f4 Rg8 9. Be3 Rh8 10. O-O-O Rg8 11. Qc5 Rh8 12. Qxc7 Rg8`
                  )
      // game.load('7k/5Q2/1Q6/1P3B2/6p1/P1N5/P4PP1/2KR4 w - - 0 37')
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