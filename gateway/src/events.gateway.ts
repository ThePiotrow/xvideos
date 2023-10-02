import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsResponse,
} from '@nestjs/websockets';
import { firstValueFrom, } from 'rxjs';
import { Server, Socket } from 'socket.io';
import { Inject, } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class EventsGateway {
    private verifiedUsers: any = {};
    private users: any = {};
    private socketRoom: any = {};
    private maxUsersPerRoom = 4;

    constructor(
        @Inject('LIVE_SERVICE') private readonly liveServiceClient: ClientProxy,
        @Inject('TOKEN_SERVICE') private readonly tokenServiceClient: ClientProxy,
    ) { }

    private async validateUser(client: Socket, username?: string): Promise<{ _id: string, _username: string }> {
        try {
            const { id, handshake: { query: { token } } } = client;

            if (!token) {
                this.verifiedUsers[id] = username || 'Unknown'; // Fallback to 'Unknown' instead of null
            }

            console.log('Verified Users', this.verifiedUsers);

            if (!this.verifiedUsers[id]) {
                const t = await firstValueFrom(
                    this.tokenServiceClient.send('token_decode', {
                        token,
                    }),
                );
                const { data } = t;
                this.verifiedUsers[id] = data?.user?.username || 'Unknown'; // Fallback to 'Unknown' instead of null
            }

            return {
                _id: id,
                _username: username || this.verifiedUsers[id]
            };
        }
        catch (e) {
            console.error(e);
        }
    }

    @WebSocketServer()
    server: Server;

    @SubscribeMessage('room:join')
    async onJoinRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() { room, username }: { room: string, username: string },
    ): Promise<any> {
        try {
            const { _id, _username } = await this.validateUser(client, username);

            if (this.users[room]) {
                if (this.users[room].length >= this.maxUsersPerRoom) {
                    client.emit('room:full', { room });
                    return;
                }
                if (!this.users[room].find(({ id }) => id === _id))
                    this.users[room].push({ id: _id, username: _username });
            }
            else
                this.users[room] = [{ id: _id, username: _username }];

            this.socketRoom[_id] = room;
            client.join(room);

            const roomUsers = this.users[room];

            console.log(roomUsers);

            this.server.sockets.to(room).emit('room:users', { username, roomUsers });
        }
        catch (e) {
            console.error(e);
        }
    }

    @SubscribeMessage('offer:make')
    async onOffer(
        @ConnectedSocket() client: Socket,
        @MessageBody() { sdp, offerSendId, offerReceiveId, offerSendUsername }: { sdp: string, offerSendId: string, offerReceiveId: string, offerSendUsername: string },
    ): Promise<any> {
        try {
            console.log(`[${this.socketRoom[offerSendId]}]: ${offerSendId} offer to ${offerReceiveId}`);
            this.server.to(offerReceiveId).emit('offer:get', { sdp, offerSendId, offerSendUsername });
        }
        catch (e) {
            console.error(e);
        }
    }

    @SubscribeMessage('answer:make')
    async onAnswer(
        @ConnectedSocket() client: Socket,
        @MessageBody() { sdp, answerSendId, answerReceiveId }: { sdp: string, answerSendId: string, answerReceiveId: string, },
    ): Promise<any> {
        try {
            console.log(`[${this.socketRoom[answerSendId]}]: ${answerSendId} answer to ${answerReceiveId}`)
            client.to(answerReceiveId).emit('answer:get', { sdp, answerSendId });
        }
        catch (e) {
            console.error(e);
        }
    }

    @SubscribeMessage('candidate:make')
    async onCandidate(
        @ConnectedSocket() client: Socket,
        @MessageBody() { candidate, candidateSendId, candidateReceiveId }: { candidate: any, candidateSendId: string, candidateReceiveId: string },
    ): Promise<any> {
        try {
            console.log(`[${this.socketRoom[candidateSendId]}]: ${this.verifiedUsers[candidateSendId]} candidate to ${this.verifiedUsers[candidateReceiveId]}`)
            client.to(candidateReceiveId).emit('candidate:get', { candidate, candidateSendId });
        }
        catch (e) {
            console.error(e);
        }
    }

    handleDisconnect(client: Socket) {
        console.log(`[${this.socketRoom[client.id]}]: ${client.id} disconnect`);
        const roomId = this.socketRoom[client.id];

        let room = this.users[roomId];
        if (room) {
            room = room.filter(({ id }) => id !== client.id);
            this.users[roomId] = room;
            if (room.length === 0) {
                delete this.users[roomId];
                return;
            }
        }
        client.to(roomId).emit('users:exit', { id: client.id });
    }

}