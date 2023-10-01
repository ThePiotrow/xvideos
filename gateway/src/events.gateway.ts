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
    private users: any = {};
    private socketRoom: any = {};

    constructor(
        @Inject('LIVE_SERVICE') private readonly liveServiceClient: ClientProxy,
        @Inject('TOKEN_SERVICE') private readonly tokenServiceClient: ClientProxy,
    ) { }

    private async validateUser(client: Socket): Promise<{ id: string, username: string | null }> {
        try {

            const { id, handshake: { query: { token } } } = client;

            if (!token) {
                this.users[id] = null;
            }

            if (!this.users[id] && token) {
                const t = await firstValueFrom(
                    this.tokenServiceClient.send('token_decode', {
                        token,
                    }),
                );
                const { data } = t;
                this.users[id] = data?.user?.username || null;
            }
            return {
                id,
                username: this.users[id]
            };
        }
        catch (e) {
            console.error(e);
        }
    }

    @WebSocketServer()
    server: Server;

    @SubscribeMessage('join:room')
    async onJoinRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() { room }: { room: string, username: string },
    ): Promise<WsResponse<any>> {
        try {
            const { id, username } = await this.validateUser(client);

            if (this.users[room])
                this.users[room].push({ id, username });
            else
                this.users[room] = [{ id, username }];

            this.socketRoom[id] = room;

            client.join(room);
            console.log(`[${this.socketRoom[id]}]: ${id} enter`);

            const roomUsers = this.users[room].map(({ id }) => id);

            return { event: 'users:all', data: { roomUsers } };
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
            client.to(offerReceiveId).emit('offer:get', { sdp, offerSendId, offerSendUsername });
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
            client.to(answerReceiveId).emit('answer:get', { sdp, answerSendId });
        }
        catch (e) {
            console.error(e);
        }
    }

    @SubscribeMessage('candidate:make')
    async onCandidate(
        @ConnectedSocket() client: Socket,
        @MessageBody() { candidate, candidateSendId, candidateReceiveId }: { candidate: string, candidateSendId: string, candidateReceiveId: string },
    ): Promise<any> {
        try {
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