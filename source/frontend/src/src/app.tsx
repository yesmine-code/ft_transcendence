import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import '@/bundles/socket';

import Routes from '@/routes';

import fetch, { FormError } from '@/bundles/fetch';
import theme from '@/bundles/theme';
import socket from '@/bundles/socket';

import InitContext from '@/context';
import { MenuData, NavigationData } from '@/context/menu-context';
import { OptionData } from '@/context/option-context';

import Loader from '@/components/Loader';
import Titlebar from '@/components/Titlebar';
import Navigation from '@/components/Navigation';
import Notification from '@/components/Notification';
import TwoStepAuthentication from '@/components/TwoStepAuthentication';
import FirstTimeLogin from '@/components/FirstTimeLogin';

import Menu from '@/menu';
import Options from '@/options';

import styles from '@/app.styles.scss';

import { AppState } from './app.interface';


export default class App extends React.Component {
	protectState: boolean;
	state: AppState;

	constructor(props: any) {
		super(props);

		this.state = {
			loading: false,
			connected: true,
			status: {
				status: 200,
				setStatus: this.setStatus.bind(this)
			},
			user: {
				user: window._ft_init.user,
				setUser: this.setUser.bind(this)
			},
			menu: {
				menu: [],
				addMenu: this.addMenu.bind(this),
				removeMenu: this.removeMenu.bind(this),

				navigation: undefined,
				setNavigation: this.setNavigation.bind(this)
			},
			option: {
				option: undefined,
				setOption: this.setOption.bind(this)
			},
			errors: []
		};

		this.protectState = false;

		/* setters */
		this.setProtectedState = this.setProtectedState.bind(this);
		this.setStatus = this.setStatus.bind(this);
		this.setUser = this.setUser.bind(this);
		this.setError = this.setError.bind(this);
		this.setReconnection = this.setReconnection.bind(this);
		this.removeError = this.removeError.bind(this);

		/* methods */
		this.openProtectedState = this.openProtectedState.bind(this);
		this.closeProtectedState = this.closeProtectedState.bind(this);
	}

	async componentDidMount() {
		if (fetch.define.setStatus)
			fetch.define.setStatus(this.setStatus);

		window.addEventListener('unhandledrejection', event => {
			event.preventDefault();

			const errors = event.reason;

			if (!(errors instanceof FormError)) return;

			for (const error in errors.message) {
				this.setError(errors.message[error]);
			}
		});

		socket.reconnecting(this.setReconnection);

		socket.on('exception', (data: Record<string, any>) => {
			if (data.code == 422) {
				for (const error in data.message) {
					this.setError(data.message[error]);
				}
				return;
			}

			this.setStatus(data.code);
		});

		this.openProtectedState();

		theme(this.state.user.user?.theme || 'auto');
	}

	componentDidCatch(error: any, errorInfo: any) {
		console.error(error, errorInfo);
	}

	componentWillUnmount() {
		this.closeProtectedState();
	}


	/* setters */
	setProtectedState(props: Record<string, any>, callback?: (() => void)) {
		if (this.protectState) this.setState(props, callback);
	}

	setStatus(props: number) {
		const { status } = this.state;

		this.setProtectedState({
			status: {
				...status,
				status: props,
			}
		});
	}

	setUser(props?: Partial<UserData>) {
		const { user } = this.state;

		const data = !Object.keys(props || {}).length
			? undefined
			: ({
				...(user['user'] || {}),
				...props
			} as UserData);

		this.setProtectedState({
			user: {
				...user,
				user: data
			}
		}, () => {
			if (data) theme(data.theme);
		});
	}

	setReconnection({ connected }: { connected: Boolean }) {
		this.setProtectedState({
			connected
		});
	}

	addMenu(props: MenuData) {
		const { menu } = this.state;

		if (!props.key)
			props.key = uuidv4();

		this.setProtectedState({
			menu: {
				...menu,
				menu: menu.menu.concat([props])
			}
		});

		return props.key;
	}

	removeMenu(props?: string) {
		const { menu } = this.state;

		this.setProtectedState({
			menu: {
				...menu,
				menu: menu.menu.filter((m) => m.key != props)
			}
		});
	}

	setNavigation(props?: NavigationData) {
		const { menu } = this.state;

		this.setProtectedState({
			menu: {
				...menu,
				navigation: props
			}
		});
	}

	setOption(props?: OptionData) {
		const { option } = this.state;

		this.setProtectedState({
			option: {
				...option,
				option: props
			}
		});
	}

	setError(value: string) {
		const { errors } = this.state;

		if (errors.length > 0 && errors[errors.length - 1].value == value) return;

		const key = uuidv4();

		this.setProtectedState({
			errors: errors.concat([
				{
					key,
					value,
					process: setTimeout(() => {
						this.removeError(key);
					}, 5000)
				}]
			)
		});
	}

	removeError(key: string) {
		const { errors } = this.state;

		this.setProtectedState({
			errors: errors.filter((error) => {
				const found = error.key === key;

				if (found) clearTimeout(error.process);

				return !found;
			})
		});
	}



	/* methods */
	openProtectedState() { this.protectState = true; }

	closeProtectedState() { this.protectState = false; }

	render() {
		const { loading, connected, status, user, menu, option, errors } = this.state;

		return (
			<InitContext value={{ status, user, menu, option }}>
				<div className={styles.container}>
					<Loader value={loading}>
						<Titlebar connected={connected} />
						<div className={`${styles.content}${!connected ? ` ${styles.disconnected}` : ''}`}>
							<TwoStepAuthentication>
								<FirstTimeLogin>
									<Routes />
								</FirstTimeLogin>
							</TwoStepAuthentication>
							<Navigation />
						</div>
						<Menu />
						<Options />
						<Notification values={errors} remove={this.removeError} />
					</Loader>
				</div>
			</InitContext>
		);
	}
}