import { Tester } from './tester';

import { NestExpressApplication } from '@nestjs/platform-express';

import { AuthenticationService } from '@/authentication/authentication.service';
import { UsersService } from '@/users/users.service';
import { TwoFactorAuthenticationService } from '@/two_factor_authentication/two_factor_authentication.service';


const tester = new Tester;
tester.declare('2FA', () => {
	let app: NestExpressApplication;

	let usersService: UsersService;
	let authenticationService: AuthenticationService;
	let twoFactorAuthenticationService: TwoFactorAuthenticationService;

	let access_token: string;

	beforeAll(async () => {
		await tester.open();

		usersService = await tester.resolve(UsersService);
		authenticationService = await tester.resolve(AuthenticationService);
		twoFactorAuthenticationService = await tester.resolve(TwoFactorAuthenticationService);

		await tester.init();

		await usersService.setUser({
			id: 1,
			username: 'gsharony',
			displayName: 'Guy Sharony',
			emails: [
				{ value: 'gsharony@students.42.fr' }
			]
		});

		access_token = authenticationService.createAccessToken(1);
	});

	tester.test('Generating qrcode', () => {
		return tester.request()
			.post('/2fa/generate')
			.set('Cookie', `access_token=${access_token}`)
			.send({})
			.expect(201);
	});

	afterAll(async () => {
		await tester.close();
	});
});