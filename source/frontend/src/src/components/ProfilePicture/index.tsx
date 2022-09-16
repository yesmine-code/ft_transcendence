import React from 'react';

import { Props } from './index.interface';

import styles from './index.styles.scss';


export default ({ src, variant, action }: Props) => {
	return (
		<div className={`${styles.container}${variant ? ` ${variant}` : ''}`} unselectable="on" onClick={(e) => { if (action) action(e); }}>
			{
				src &&
				<img src={src} />
			}
		</div>
	);
}