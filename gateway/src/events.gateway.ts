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
    private users: { [client_id: string]: string | null } = {};

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

    private sendError(message: string, live: any): any {
        return {
            message,
            data: {
                live
            },
            errors: null
        };
    }

    @WebSocketServer()
    server: Server;

    @SubscribeMessage('live.streamer.connect')
    async onStreamerConnect(
        @ConnectedSocket() client: Socket,
    ): Promise<WsResponse<any>> {
        try {
            const { username } = await this.validateUser(client);

            if (!username)
                return { event: 'live.streamer.not_authorized', data: { message: 'Not authorized' } };

            client.join(username);
            this.server.to(client.id).emit('live.connect', { connected: true });

            return { event: 'live.streamer.connected', data: { message: 'Connected' } };
        }
        catch (e) {
            console.error(e);
        }
    }

    @SubscribeMessage('live.streamer.disconnect')
    async onStreamerDisconnect(
        @ConnectedSocket() client: Socket,
    ): Promise<WsResponse<any>> {
        try {
            const { username } = await this.validateUser(client);

            if (!username)
                return { event: 'live.streamer.disconnect', data: { message: 'Not authorized' } };

            this.server.to(username).emit('live.disconnect');

            return { event: 'live.streamer.disconnect', data: { message: 'Disconnected' } };
        }
        catch (e) {
            console.error(e);
        }
    }

    @SubscribeMessage('live.viewer.connect')
    async onViewerConnect(
        @ConnectedSocket() client: Socket,
        @MessageBody() { streamer }: { streamer: string },
    ): Promise<WsResponse<any>> {
        try {
            if (!streamer)
                return { event: 'live.viewer.connect', data: { message: 'Not found' } };

            const { id } = await this.validateUser(client);

            console.log(id, streamer);

            console.log(streamer);
            client.join(streamer);

            this.server.to(streamer).emit('live.viewer.connect', { id });
            return { event: 'live.viewer.connect', data: { message: 'Connected' } };
        }
        catch (e) {
            console.error(e);
        }
    }

    @SubscribeMessage('live.viewer.disconnect')
    async onViewerDisconnect(
        @ConnectedSocket() client: Socket,
        @MessageBody() { streamer }: { streamer: string },
    ): Promise<WsResponse<any>> {
        try {
            if (!streamer || !this.server.of('/').adapter.rooms[streamer])
                return { event: 'live.viewer.disconnect', data: { message: 'Not found' } };

            client.leave(streamer);

            return { event: 'live.disconnect', data: { message: 'Disconnected' } };
        }
        catch (e) {
            console.error(e);
        }
    }

    @SubscribeMessage('live.streamer.stream')
    async onStreamerStream(
        @ConnectedSocket() client: Socket,
        @MessageBody() { stream }: { stream: string },
    ): Promise<WsResponse<any>> {
        try {
            const { username } = await this.validateUser(client);

            if (!username)
                return { event: 'live.streamer.stream', data: { message: 'Not authorized' } };

            this.server.to(username).emit('live.stream', { stream });

            return { event: 'live.streamer.stream', data: { message: 'Streamed' } };
        }
        catch (e) {
            console.error(e);
        }
    }

    handleDisconnect(client: Socket) {
        const { id } = client;
        delete this.users[id];
    }

}