import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TalkService {
  static niceBoard(board: { square: string, type: string, color: string }[][]) {
    let niceBoard: string = ''

    for (let row in board) {
      niceBoard += `${8 - Number(row)}| `
      for (let col in board[row]) 
        niceBoard += board[row][col] === null ? '   ' : `${board[row][col].color}${board[row][col].type} `
      niceBoard += '\n'
    }

    niceBoard += '   '

    for (let row in board) niceBoard += '---'

    niceBoard += '\n'

    niceBoard += '   '
    niceBoard += 'a  '
    niceBoard += 'b  '
    niceBoard += 'c  '
    niceBoard += 'd  '
    niceBoard += 'e  '
    niceBoard += 'f  '
    niceBoard += 'g  '
    niceBoard += 'h  '

    return niceBoard
  }

  static responseReturn(status: boolean, data: any, msg: any, type: string) {
    return { status, data, msg, type }
  }

  static checkToken(token: string) {
    const jwtService = new JwtService();

    const payload = jwtService.verify(token, {secret: process.env.JWT_SECRET})
    if (!payload) return false
    else return true
  }
}
