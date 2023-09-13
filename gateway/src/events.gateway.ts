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
import { Body, Inject, Param, Req } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { IServiceLiveSearchByIdResponse } from './interfaces/live/service-live-search-by-id-response.interface';
import { IServiceLiveSearchByUserIdResponse } from './interfaces/live/service-live-search-by-user-id-response.interface';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class EventsGateway {
    private rooms: { [room_id: string]: { users: string[], live: object } } = {}
    private users: { [client_id: string]: { user_id: string, username: string, token: string } } = {}

    constructor(
        @Inject('LIVE_SERVICE') private readonly liveServiceClient: ClientProxy,
        @Inject('TOKEN_SERVICE') private readonly tokenServiceClient: ClientProxy,
    ) { }

    private async validateUser(token: string | string[], client_id: string): Promise<{ user_id: string, username: string, token: string } | false> {
        try {
            const tokenUnique = Array.isArray(token) ? token[0] : token

            let userTokenExists = null;

            for (let key in this.users) {
                if (this.users[key].token === tokenUnique) {
                    userTokenExists = { key, value: this.users[key] };
                    break;
                }
            }

            if (this.users[client_id] !== undefined && this.users[client_id].token === tokenUnique)
                return this.users[client_id];

            if (userTokenExists?.value !== undefined) {
                this.users[client_id] = { ...userTokenExists.value, token: tokenUnique };
                delete this.users[userTokenExists.key];
                return this.users[client_id];
            }

            const userTokenInfo = await firstValueFrom(
                this.tokenServiceClient.send('token_decode', {
                    token: tokenUnique,
                }),
            );

            if (userTokenInfo?.data === null || userTokenInfo?.data === undefined)
                return false;

            const data = userTokenInfo.data;

            this.users[client_id] = {
                user_id: data.userId,
                username: data.username,
                token: tokenUnique
            }

            return this.users[client_id];
        }
        catch (e) {
            console.error(e);
        }
    }

    @WebSocketServer()
    server: Server;

    @SubscribeMessage('events')
    findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
        return from([1, 2, 3]).pipe(map(item => ({ event: 'events', data: item })));
    }

    @SubscribeMessage('disconnectToLive')
    async disconnectToLive(
        @MessageBody() data: { room?: string },
        @ConnectedSocket() client: Socket,
    ): Promise<any> {
        const token = client.handshake.query.token;
        const user = await this.validateUser(token, client.id);

        if (!user)
            return {
                message: "⚠️ User Not Found",
                data: {
                    live: null
                },
                errors: {}
            };

        client.leave(data.room);

        this.getClients({ room: data.room });

        return {
            message: "✅ Disconnected",
            data: {
                live: { room: data.room, client: client.id }
            },
            errors: null
        };

    }

    @SubscribeMessage('stream')
    handleStream(
        @MessageBody() data: { room: string, audio?: string, image?: string },
        @ConnectedSocket() client: Socket,
    ): void {
        this.server.to(data.room).emit('stream', { audio: data?.audio ?? null, image: data?.image ?? null });
    }
    @SubscribeMessage('getClients')
    async getClients(
        @Body() data: { room: string },
    ): Promise<any> {
        const viewers = this.server.sockets.adapter.rooms.get(data.room);

        this.server.to(data.room).emit('nb_viewers', {
            value:
                viewers === undefined
                    ? 0
                    : viewers.size,
        });
    }

    @SubscribeMessage('connectToLive')
    async handleEvent(
        @MessageBody() data: { room?: string, user_id?: string },
        @ConnectedSocket() client: Socket,
    ): Promise<any> {
        const token = client.handshake.query.token;
        const user = await this.validateUser(token, client.id);

        if (user) {
            const livesResponse = data.room
                ? await firstValueFrom(
                    this.liveServiceClient.send('live_search_by_id',
                        {
                            liveId: data.room,
                            onAir: true
                        }),
                )
                : await firstValueFrom(
                    this.liveServiceClient.send('live_search_by_user_id', {
                        userId: data.user_id,
                        onAir: true
                    }),
                );

            const live = Array.isArray(livesResponse) ? livesResponse[0].live : livesResponse.live;

            console.log('live', live, livesResponse)

            if (live === null)
                return { status: '⚠️ Not found', room: null, client: client.id };

            client.join(data.room);

            this.getClients({ room: data.room });

            return {
                message: "✅ Connected",
                data: {
                    live: { room: data.room, client: client.id }
                },
                errors: null
            };
        }
        else {
            return {
                message: "⚠️ User Not Found",
                data: {
                    live: null
                },
                errors: null
            };
        }
    }


    @SubscribeMessage('hostLive')
    async createLiveEvent(
        @ConnectedSocket() client: Socket,
    ): Promise<any> {
        const token = client.handshake.query.token;
        const user = await this.validateUser(token, client.id);

        if (user) {
            try {
                const livesResponse: IServiceLiveSearchByUserIdResponse =
                    await firstValueFrom(
                        this.liveServiceClient.send('live_search_by_user_id', {
                            userId: this.users[client.id].user_id,
                            onAir: true
                        })
                    );

                if (livesResponse.lives.length < 1) {
                    return { status: 'not_found', room: null, client: client.id };
                }

                const live = livesResponse.lives[0];

                this.rooms[live.id] = {
                    live: live,
                    users: [this.users[client.id].user_id]
                }

                client.join(live.id);

                return { status: '✅ Live joined', room: live.id, client: client.id };
            }
            catch (e) {
                console.log(e)
                return { status: 'error', room: null, client: client.id };
            }
        }
        else {
            return { status: '⚠️ Not found', room: null, client: client.id };
        }
    }

    @SubscribeMessage('liveStop')
    async liveStop(
        @MessageBody() data: { live_id: string },
        @ConnectedSocket() client: Socket,
    ): Promise<any> {
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

        return { status: '✅ Live stopped', room: data.live_id, client: client.id };
    }
}