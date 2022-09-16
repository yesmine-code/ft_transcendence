import React from 'react';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import fetch from '@/bundles/fetch';

import { LevelsProps, LevelsState } from './index.interface';
import styles from './index.styles.scss';


export default class Levels extends React.Component<LevelsProps> {
	state: LevelsState;
	protectState: boolean;

	constructor(props: LevelsProps | Readonly<LevelsProps>) {
		super(props);

		this.state = {
			levels: []
		};


		this.protectState = false;

		/* setters */
		this.setProtectedState = this.setProtectedState.bind(this);

		/* methods */
		this.openProtectedState = this.openProtectedState.bind(this);
		this.closeProtectedState = this.closeProtectedState.bind(this);
		this.init = this.init.bind(this);
	}

	async componentDidMount() {
		this.openProtectedState();
		await this.init();
	}

	componentWillUnmount() {
		this.closeProtectedState();
	}


	/* getters */
	private get userID() {
		return (Number(this.props.profile.id));
	}

	/* setters */
	setProtectedState(props: Record<string, any>, callback?: (() => void)) {
		if (this.protectState) this.setState(props, callback);
	}

	/* methods */
	openProtectedState() { this.protectState = true; }

	closeProtectedState() { this.protectState = false; }

	async init() {
		const levels = await fetch.request.json('/games/levels', { user_id: this.userID });

		this.setProtectedState({ levels });
	}

	render() {
		const { levels } = this.state;

		return (
			<div className={styles.container}>
				<div style={{ width: '100%' }}>
					<HighchartsReact
						highcharts={Highcharts}
						options={{
							title: {
								text: 'Level Historics'
							},
							accessibility: {
								enabled: false
							},
							rangeSelector: {
								selected: 1
							},
							yAxis: {
								title: {
									text: 'Level'
								}
							},
							xAxis: {
								title: {
									text: 'Number of game'
								},
								allowDecimals: false
							},
							series: [{
								name: 'Levels',
								data: levels,
								step: true,
								tooltip: {
									valueDecimals: 0
								}
							}]
						}}
					/>
				</div>
			</div>
		);
	}
}