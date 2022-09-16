import React from 'react';
import { v4 as uuidv4 } from 'uuid';

import { SelectProps, SelectPropsOption, SelectState } from './index.interface';
import styles from './index.styles.scss';


export default class Select extends React.Component<SelectProps> {
	state: SelectState;
	protectState: boolean;

	constructor(props: SelectProps<string | number> | Readonly<SelectProps<string | number>>) {
		super(props);

		this.state = { ...props };

		this.protectState = false;

		/* handlers */
		this.onChange = this.onChange.bind(this);
		this.onExecute = this.onExecute.bind(this);

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

	componentDidUpdate() {
		const { value: valueProps } = this.props;
		const { value: valueState } = this.state;

		if (valueProps == valueState)
			return;

		this.setProtectedState({
			value: valueProps
		});
	}

	componentWillUnmount() {
		this.closeProtectedState();
	}


	/* handlers */
	onChange(props: SelectPropsOption<string | number>) {
		if (!props.action) return this.onExecute(props.key);

		props.action(() => {
			this.onExecute(props.key);
		})
	}

	onExecute(value: string | number) {
		const { name, onChange } = this.props;

		this.setProtectedState({ value }, () => {
			if (!onChange) return;
			onChange({ name, value });
		});
	}


	/* setters */
	setProtectedState(props: Record<string, any>, callback?: () => void) { if (this.protectState) this.setState(props, callback); }


	/* methods */
	openProtectedState() { this.protectState = true; }

	closeProtectedState() { this.protectState = false; }


	render() {
		const { options, value } = this.state;

		return (
			<div className={styles.container}>
				{
					options.map((option, index) => (
						<button key={uuidv4()} className={`${styles.item}${((option.key == value) || (!value && !index)) ? ` ${styles.active}` : ''}`} onClick={() => { this.onChange(option); }}>
							<div className={styles.item_check}>
								<div />
							</div>
							<span unselectable='on'>{option.value}</span>
						</button>
					))
				}
			</div>
		);
	}
}