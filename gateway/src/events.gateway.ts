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
    private messages: any = {};
    private maxUsersPerRoom = 4;

    constructor(
        @Inject('LIVE_SERVICE') private readonly liveServiceClient: ClientProxy,
        @Inject('TOKEN_SERVICE') private readonly tokenServiceClient: ClientProxy,
    ) { }

    private async validateUser(client: Socket, username?: string): Promise<{ _id: string; _username: string; _connected: boolean }> {
        try {
            const { id, handshake: { query: { token } } } = client;

            if (!token) {
                this.verifiedUsers[id] = {
                    username: username || 'Unknown',
                    connected: false,
                };
            }

            if (!this.verifiedUsers[id] || !this.verifiedUsers[id].connected) {
                const t = await firstValueFrom(
                    this.tokenServiceClient.send('token_decode', {
                        token,
                    }),
                );
                const { data } = t;
                this.verifiedUsers[id] = {
                    username: data?.user?.username || 'Unknown',
                    connected: !!data?.user?.username,
                };
            }

            return {
                _id: id,
                _username: username || this.verifiedUsers[id].username,
                _connected: this.verifiedUsers[id].connected || false,
            };
        }
        catch (e) {
            console.error(e);
        }
    }

    private async isAdmin(client: Socket): Promise<boolean> {
        try {
            const { handshake: { query: { token } } } = client;

            if (!token) {
                return false;
            }

            const t = await firstValueFrom(
                this.tokenServiceClient.send('token_decode', {
                    token,
                }),
            );
            const { data } = t;
            return data?.user?.role === 'admin';
        }
        catch (e) {
            console.error(e);
        }
    }

    private async canManageLive(client: Socket, room: string): Promise<boolean> {
        try {
            const { id, handshake: { query: { token } } } = client;

            if (!token) {
                return false;
            }

            const t = await firstValueFrom(
                this.tokenServiceClient.send('token_decode', {
                    token,
                }),
            );
            const { data } = t;
            return data?.user?.role === 'admin' || data?.user?.username === room;
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

            if (!this.messages[room])
                this.messages[room] = [];

            this.socketRoom[_id] = room;
            client.join(room);

            const users = this.users[room];

            this.server.sockets.to(room).emit('room:users', { username, users, _user: { id: _id, username: _username }, messages: this.messages[room].slice(-100) || [] });
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
        @MessageBody() { candidate, candidateSendId, candidateReceiveId }: { candidate: any, candidateSendId: string, candidateReceiveId: string },
    ): Promise<any> {
        try {
            client.to(candidateReceiveId).emit('candidate:get', { candidate, candidateSendId });
        }
        catch (e) {
            console.error(e);
        }
    }

    handleDisconnect(client: Socket) {
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
        client.to(roomId).emit('users:exit', { users: room, room: roomId, client: client.id });
    }

    @SubscribeMessage('message:send')
    async handleLiveMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() { message, room }: { message: string, room: string },
    ) {
        const { _id, _username, _connected } = await this.validateUser(client);
        if (!_connected) return;
        this.messages[room].push({ username: _username, message, timestamp: +new Date() });
        this.server.sockets.to(room).emit('message:receive', { room, message, username: _username, timestamp: +new Date() });
    }

    @SubscribeMessage('live:stop')
    async handleLiveStop(
        @ConnectedSocket() client: Socket,
        @MessageBody() { live_id, room }: { live_id: string, room: string },
    ) {
        if (!this.canManageLive(client, room)) return;

        const live = await firstValueFrom(
            this.liveServiceClient.send('live_update_by_id', {
                live: { is_ended: true },
                id: live_id,
                all: true,
            })
        )
        this.server.sockets.to(room).emit('live:stop', { room, live });


        delete this.messages[room]
        delete this.users[room];
    }
}