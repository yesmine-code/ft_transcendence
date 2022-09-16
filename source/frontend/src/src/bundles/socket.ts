import { io, Socket } from 'socket.io-client';

class Sock {
	socket: Socket | undefined;
	user: { id: number; username: string; display_name: string; avatar: string; } | undefined;
	connected: boolean;

	constructor() {
		const token = window._ft_init.token;

		this.socket = io('http://127.0.0.1:4000', {
			transports: ['websocket'],
			upgrade: false,
			extraHeaders: {
				'x-csrf-token': token
			},
			reconnection: true,
			rejectUnauthorized: false
		});

		this.user = window._ft_init.user;

		this.connected = false;
	}

	ready(callback: () => void) {
		if (!this.user || !this.socket)
			callback();

		this.socket?.on('connected', () => {
			this.connected = true;
			callback();
		})
	}

	reconnecting(callback: ({ connected }: { connected: Boolean }) => void) {
		if (!this.user) return;

		callback({ connected: this.connected });

		this.socket?.on('disconnect', () => {
			this.connected = false;
			callback({ connected: this.connected });
		});

		this.socket?.on('connected', () => {
			this.connected = true;
			callback({ connected: this.connected });
		});
	}

	emit<T = Record<string, any>>(key: string, value: T) {
		if (!this.socket)
			return null;

		this.socket.emit(key, value);
	}

	on<T = Record<string, any>>(key: string, callback: (arg0: T) => void) {
		if (!this.socket)
			return null;

		this.socket.on(key, callback);
	}
}

export default new Sock;