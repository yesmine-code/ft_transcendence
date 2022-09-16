import * as request from 'supertest';
import * as cookieParser from "cookie-parser";

import { AppModule } from "@/app/app.module";

import { NestExpressApplication } from "@nestjs/platform-express";
import { Test, TestingModule } from "@nestjs/testing";


export class Tester {
	private app: NestExpressApplication;
	private module: TestingModule;

	constructor() {}

	async open() {
		this.module = await Test.createTestingModule({ imports: [AppModule] }).compile();

		this.app = this.module.createNestApplication<NestExpressApplication>();

		this.app.enableCors({
			origin: 'http://127.0.0.1:4000',
			credentials: true,
			exposedHeaders: ['Location']
		});

		this.app.useStaticAssets('/app/dist/static/public/', {
			prefix: '/'
		});

		this.app.disable('x-powered-by');

		this.app.use(cookieParser());
	}

	async close() {
		await this.app.close();
	}

	async resolve(value: any) {
		return await this.module.resolve(value);
	}

	async init() {
		return await this.app.init();
	}

	declare(title: string | number | Function | jest.FunctionLike, callback: jest.EmptyFunction) {
		describe(title, callback);
	}

	test(title: string, callback?: jest.ProvidesCallback) {
		it(title, callback);
	}

	request() {
		return request(this.app.getHttpServer());
	}
}