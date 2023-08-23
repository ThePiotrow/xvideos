import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsResponse,
} from '@nestjs/websockets';
import { firstValueFrom, from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server, Socket } from 'socket.io';
import { Inject, Req } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { IServiceLiveSearchByIdResponse } from './interfaces/live/service-live-search-by-id-response.interface';
import { IServiceLiveSearchByUserIdResponse } from './interfaces/live/service-live-search-by-user-id-response.interface';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class EventsGateway {
    constructor(
        @Inject('LIVE_SERVICE') private readonly liveServiceClient: ClientProxy,
    ) { }

    @WebSocketServer()
    server: Server;

    @SubscribeMessage('events')
    findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
        return from([1, 2, 3]).pipe(map(item => ({ event: 'events', data: item })));
    }

    @SubscribeMessage('disconnectToLive')
    async disconnectToLive(
        @MessageBody() data: any,
        @ConnectedSocket() client: Socket,
    ): Promise<any> {
        client.leave(data.room);
        return { status: 'disconnected', room: data.room, client: client.id };
    }

    @SubscribeMessage('stream')
    handleStream(
        @MessageBody() data: any,
        @ConnectedSocket() client: Socket,
    ): void {
        this.server.to(data.room).emit('stream', { audio: data?.audio ?? null, image: data?.image ?? null });
    }
    @SubscribeMessage('getClients')
    async getClients(
        @ConnectedSocket() client: Socket,
    ): Promise<any> {
        const clients = await this.server.of('/stream').allSockets();
        return { clients: Array.from(clients) };
    }

    @SubscribeMessage('connectToLive')
    async handleEvent(
        @MessageBody() data: { room: string },
        @ConnectedSocket() client: Socket,
    ): Promise<any> {
        const livesResponse: IServiceLiveSearchByIdResponse =
            await firstValueFrom(
                this.liveServiceClient.send('live_search_by_id', data.room),
            );

        if (livesResponse.live === null)
            return { status: 'not_found', room: null, client: client.id };

        client.join(data.room);

        const viewers = this.server.sockets.adapter.rooms.get(data.room);

        this.server.to(data.room).emit('nb_viewers', {
            value:
                viewers === undefined
                    ? 0
                    : viewers.size,
        });
        return { status: 'connected', room: data.room, client: client.id };
    }

    @SubscribeMessage('hostLive')
    async createLiveEvent(
        @MessageBody() data: { user_id: string },
        @ConnectedSocket() client: Socket,
    ): Promise<any> {
        const livesResponse: IServiceLiveSearchByUserIdResponse =
            await firstValueFrom(
                this.liveServiceClient.send('live_search_by_user_id', data.user_id),
            );

        const liveResponse = this.liveServiceClient.send('live_create', {
            user_id: data.user_id,
        });

        const live = await firstValueFrom(liveResponse);

        if (livesResponse.lives.length > 0)
            return { status: 'already_exists', room: null, client: client.id };

        client.join(live.id);
        return { status: 'created', room: live.id, client: client.id };
    }

    @SubscribeMessage('liveStop')
    async liveStop(
        @MessageBody() data: { live_id: string },
        @ConnectedSocket() client: Socket,
    ): Promise<any> {
        console.log('data', data)
        const liveResponse: IServiceLiveSearchByIdResponse =
            await firstValueFrom(
                this.liveServiceClient.send('live_search_by_id', data.live_id),
            );

        if (!liveResponse.live) return { status: 'not_found', room: null, client: client.id };

        const stopResponse = this.liveServiceClient.send('live_stop', {
            live_id: data.live_id,
        });

        const live = await firstValueFrom(stopResponse);

        client.leave(data.live_id);

        console.log('live', live)

        const clientsInRoom = this.server.sockets.adapter.rooms.get(data.live_id);
        if (clientsInRoom) {
            for (const clientId of clientsInRoom) {
                const clientSocket = this.server.sockets.sockets.get(clientId);
                if (clientSocket) {
                    clientSocket.leave(data.live_id);
                }
            }
        }

        return { status: 'stopped', room: data.live_id, client: client.id };
    }
}