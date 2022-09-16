import React from 'react';
import { Link } from 'react-router-dom';

import fetch, { FormError } from '@/bundles/fetch';

import protectedRoute from '@/hoc/protectedRoute';

import Input from '@/components/Input';

import { SignUpState } from './index.interface';
import styles from './index.styles.scss';


export default protectedRoute({ authenticated: false, fallback: '/' }, class extends React.Component {
	state: SignUpState;
	protectState: boolean;

	constructor(props: {} | Readonly<{}>) {
		super(props);

		this.state = {
			values: {
				username: '',
				email: '',
				password: '',
				confirm_password: ''
			},
			errors: {

			}
		};

		this.protectState = false;

		/* handlers */
		this.onChange = this.onChange.bind(this);
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

	async onSubmit() {
		const { values } = this.state;

		try {
			await fetch.request.json('/api/auth/signup', values);
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
					<span className={styles.title} unselectable='on'>Sign Up</span>
				</div>
				<form className={styles.form} onSubmit={(e) => { e.preventDefault(); return false; }}>
					<Input
						name='username'
						type='text'
						placeholder='Username'
						onChange={this.onChange}
						error={errors.username} />
					<Input
						name='email'
						type='text'
						placeholder='Email'
						onChange={this.onChange}
						error={errors.email} />
					<Input
						name='password'
						type='password'
						placeholder='Password'
						onChange={this.onChange}
						error={errors.password} />
					<Input
						name='confirm_password'
						type='password'
						placeholder='Confirm password'
						onChange={this.onChange}
						error={errors.confirm_password} />
					<button onClick={this.onSubmit} className={styles.submit} unselectable='on'>Sign up</button>
				</form>
				<div className={styles.separator}>
					<div />
					<span unselectable='on'>or</span>
					<div />
				</div>
				<div className={styles.others}>
					<a href="http://127.0.0.1:4000/api/auth/connect_42" className={styles.button} unselectable='on'>Sign up with 42</a>
					<Link className={styles.option} to={"/signin"}>Already have an account? Sign in</Link>
				</div>
			</div>
		);
	}
});