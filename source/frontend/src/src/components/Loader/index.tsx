import React from 'react';

import styles from './index.styles.scss';


export default function Loader({ value, children = null }: { value?: boolean, children?: any }) {
	if (!value)
		return children;

	return (
		<div className={styles.container}>
			<h1 className={styles.title}>FT_TRANSCENDENCE</h1>
			<div className={styles.content}>
				<div />
				<div />
				<div />
				<div />
				<div />
			</div>
		</div>
	);
}