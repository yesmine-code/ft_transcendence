import React from 'react';

import fetch, { FormError } from '@/bundles/fetch';

import withUser from '@/hoc/withUser';

import { User } from '@/context/user-context';

import Input from '@/components/Input';

import { TfaState } from './index.interface';
import styles from './index.styles.scss';


const Tfa = withUser(class Tfa extends React.Component<{ user: User }> {
	state: TfaState;
	protectState: boolean;

	constructor(props: { user: User; } | Readonly<{ user: User; }>) {
		super(props);

		this.state = {
			values: {
				code: ''
			},
			errors: {}
		};

		this.protectState = false;

		/* handlers */
		this.onChange = this.onChange.bind(this);
		this.onSendCode = this.onSendCode.bind(this);
		this.onSubmit = this.onSubmit.bind(this);

		/* setters */
		this.setProtectedState = this.setProtectedState.bind(this);

		/* methods */
		this.openProtectedState = this.openProtectedState.bind(this);
		this.closeProtectedState = this.closeProtectedState.bind(this);
	}

	componentDidMount() {
		this.openProtectedState();
	}

	componentDidCatch(error: any, errorInfo: any) {
		console.error(error, errorInfo);
	}

	componentWillUnmount() {
		this.closeProtectedState();
	}


	/* handlers */
	onChange({ name, value }: { name: string; value: string; }) {
		const { errors, values } = this.state;

		this.setProtectedState({
			values: {
				...values,
				[name]: value
			},
			errors: {
				...errors,
				[name]: ''
			}
		});
	}

	async onSendCode() {
		await fetch.request.json('/2fa/send_code');
	}

	async onSubmit() {
		const { user } = this.props;
		const { values } = this.state;

		try {
			await fetch.request.json('/2fa/verify_code', { code: values.code });
			user.setUser({
				required_2fa: false,
				phone_number_confirmed: true
			});
		} catch (e: unknown) {
			if (!(e instanceof FormError)) return;

			this.setProtectedState({ errors: e.message });
		}
	}


	/* setters */
	setProtectedState(props: Record<string, any>, callback?: (() => void)) {
		if (this.protectState) this.setState(props, callback);
	}


	/* methods */
	openProtectedState() { this.protectState = true; }

	closeProtectedState() { this.protectState = false; }


	render() {
		const { errors } = this.state;

		return (
			<div className={styles.container}>
				<div className={styles.header}>
					<span className={styles.title} unselectable='on'>2-Step authentication</span>
				</div>
				<div className={styles.form}>
					<div className={styles.code}>
						<Input
							name='code'
							type='text'
							placeholder='Code'
							onChange={this.onChange}
							error={errors.code} />
						<button onClick={this.onSendCode} className={styles.send_code} unselectable='on'>Send code</button>
					</div>
					<button onClick={this.onSubmit} className={styles.submit} unselectable='on'>Verify</button>
				</div>
			</div>
		);
	}
});


export default withUser(({ user, children }: { user: User, children: any }) => {
	return (user.user?.required_2fa) ? <Tfa /> : children;
})