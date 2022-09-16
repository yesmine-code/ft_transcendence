import React from 'react';

import withMenu from '@/hoc/withMenu';
import withUser from '@/hoc/withUser';

import Input from '@/components/Input';

import { PhoneNumberFields, PhoneNumberProps, PhoneNumberState, PhoneNumberSteps } from './index.interface';
import styles from './index.styles.scss';
import fetch, { FormError } from '@/bundles/fetch';


export default withMenu(withUser(class PhoneNumber extends React.Component<PhoneNumberProps> {
	protectState: boolean;
	state: PhoneNumberState;

	constructor(props: any) {
		super(props);

		this.state = {
			loading: false,
			step: PhoneNumberSteps.PRESENTATION,
			values: {
				phone_number: '',
				code: ''
			},
			errors: {}
		};

		this.protectState = false;

		/* handlers */
		this.onSave = this.onSave.bind(this);
		this.onRemove = this.onRemove.bind(this);
		this.onContinue = this.onContinue.bind(this);

		/* setters */
		this.setProtectedState = this.setProtectedState.bind(this);
		this.setLoading = this.setLoading.bind(this);
		this.setStep = this.setStep.bind(this);
		this.setValues = this.setValues.bind(this);
		this.setErrors = this.setErrors.bind(this);

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
	async onSave() {
		const { data } = this.props;
		const { values } = this.state;

		if (data.save)
			await data.save({ name: 'phone_number', value: values.phone_number });

		this.onRemove();
	}

	onRemove() {
		const { remove } = this.props;

		if (remove) remove();
	}

	async onContinue() {
		const { user } = this.props;
		const { step, values } = this.state;

		if (step == PhoneNumberSteps.PRESENTATION)
			this.setStep(PhoneNumberSteps.DETAILS);
		else if (step == PhoneNumberSteps.DETAILS) {
			try {
				await fetch.request.json('/2fa/phone_number', { phone_number: values.phone_number });
				user.setUser({ phone_number: values.phone_number });
				this.setStep(PhoneNumberSteps.SEND_CODE);
			} catch (e: unknown) {
				if (!(e instanceof FormError)) return;
	
				this.setErrors(e.message);
			}
		}
		else if (step == PhoneNumberSteps.SEND_CODE) {
			try {
				await fetch.request.json('/2fa/initiate-verification');
				this.setStep(PhoneNumberSteps.CONFIRMATION);
			} catch (e: unknown) {
				if (!(e instanceof FormError)) return;
			}
		} else if (step == PhoneNumberSteps.CONFIRMATION) {
			try {
				await fetch.request.json('/2fa/check-verification-code', { code: values.code });
				user.setUser({ phone_number_confirmed: true });
				this.onSave();
			} catch (e: unknown) {
				if (!(e instanceof FormError)) return;
	
				this.setErrors(e.message);
			}
		}
	}


	/* getters */
	private get user() {
		return (this.props.user.user);
	}

	private get loading() {
		return (this.state.loading);
	}


	/* setters */
	setProtectedState(props: Record<string, any>) { if (this.protectState) this.setState(props); }

	setLoading(loading: boolean) {
		this.setProtectedState({ loading });
	}

	setStep(step: PhoneNumberSteps) {
		this.setProtectedState({ step });
	}

	setValues({ name, value }: { name: string; value: string | number }) {
		const { values, errors } = this.state;

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

	setErrors(props: Partial<PhoneNumberFields>) {
		const { errors } = this.state;

		this.setProtectedState({
			errors: {
				...errors,
				...props
			}
		});
	}


	/* methods */
	openProtectedState() { this.protectState = true; }

	closeProtectedState() { this.protectState = false; }


	render() {
		if (!this.user)
			return null;

		const { step, values, errors } = this.state;

		return (
			<div className={`${styles.container}${this.loading ? ` ${styles.loading}` : ''}`}>
				<div className={styles.header}>
					<div className={styles.presentation}>
						<button className={styles.close} onClick={this.onRemove}>
							<svg style={{ width: '100%', height: '100%' }} viewBox="0 0 50 50">
								<path d="M4.132,46.577L3.425,45.87,45.993,3.308,46.7,4.015Z M3.424,4.038l0.707-.707L46.7,45.89l-0.707.707Z" />
							</svg>
						</button>
						{
							step == PhoneNumberSteps.PRESENTATION && <span className={styles.title} unselectable='on'>Presentation</span>
						}
						{
							step == PhoneNumberSteps.DETAILS && <span className={styles.title} unselectable='on'>Details</span>
						}
						{
							step == PhoneNumberSteps.SEND_CODE && <span className={styles.title} unselectable='on'>Send code</span>
						}
						{
							step == PhoneNumberSteps.CONFIRMATION && <span className={styles.title} unselectable='on'>Confirmation</span>
						}
					</div>
				</div>
				<div className={styles.body}>
					{
						step == PhoneNumberSteps.PRESENTATION &&
						<>
							<span className={styles.description} unselectable='on'>Use your phone number to receive a code in order to enter your account on log in.</span>
							<button className={styles.continue} onClick={this.onContinue} unselectable='on'>Continue</button>
						</>
					}
					{
						step == PhoneNumberSteps.DETAILS &&
						<>
							<span className={styles.description} unselectable='on'>Enter your phone number.</span>
							<Input
								name='phone_number'
								type='text'
								variant={styles.phone_number}
								placeholder='Phone number'
								onChange={this.setValues}
								error={errors.phone_number} />
							<button className={styles.continue} onClick={this.onContinue} unselectable='on'>Continue</button>
						</>
					}
					{
						step == PhoneNumberSteps.SEND_CODE &&
						<>
							<span className={styles.description} unselectable='on'>{`You'll receive a text message with a confirmation code on your mobile phone number (${values.phone_number}). Use the code to confirm this is really your number.`}</span>
							<button className={styles.continue} onClick={this.onContinue} unselectable='on'>Send code</button>
						</>
					}
					{
						step == PhoneNumberSteps.CONFIRMATION &&
						<>
							<span className={styles.description} unselectable='on'>{`Check ${values.phone_number} for your confirmation code, then enter it to confirm this is your phone number.`}</span>
							<Input
								name='code'
								type='text'
								variant={styles.phone_number}
								placeholder='Enter code'
								onChange={this.setValues}
								error={errors.code} />
							<button className={styles.continue} onClick={this.onContinue} unselectable='on'>Confirm</button>
						</>
					}
				</div>
				{
					this.loading &&
					<div className={styles.loading}>
						<div />
						<div />
						<div />
						<div />
					</div>
				}
			</div>
		);
	}
}));