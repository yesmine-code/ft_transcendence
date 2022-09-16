import { Tester } from './tester';

import { NestExpressApplication } from '@nestjs/platform-express';

import { AuthService } from '@/auth/auth.service';
import { UsersService } from '@/users/users.service';


const tester = new Tester();
tester.declare('Users', () => {
	let usersService: UsersService;
	let authService: AuthService;

	let access_token_1: string;
	let access_token_2: string;

	beforeAll(async () => {
		await tester.open();

		authService = await tester.resolve(AuthService);
		usersService = await tester.resolve(UsersService);

		await tester.init();

		await usersService.setUser({
			id: 1,
			username: 'gsharony',
			displayName: 'Guy Sharony',
			emails: [
				{ value: 'gsharony@students.42.fr' }
			]
		});

		await usersService.setUser({
			id: 2,
			username: 'tsharony',
			displayName: 'Tom Sharony',
			emails: [
				{ value: 'sharony.guy@gmail.com' }
			]
		});

		access_token_1 = authService.createAccessToken(1);
		access_token_2 = authService.createAccessToken(2);
	});

	tester.test('Get user profile', () => {
		return tester.request()
			.post('/users/profile')
			.set('Cookie', `access_token=${access_token_1}`)
			.send({
				username: 'gsharony'
			})
			.expect(201)
			.expect({
				id: 1,
				username: 'gsharony',
				display_name: 'Guy Sharony',
				isOwner: true,
				avatar: '/users/avatar/1/default_avatar.jpeg'
			});
	});

	tester.test('Get user friends', () => {
		return tester.request()
			.post('/users/friends')
			.set('Cookie', `access_token=${access_token_1}`)
			.send({})
			.expect(201)
			.expect([]);
	});

	afterAll(async () => {
		await tester.close();
	});
});