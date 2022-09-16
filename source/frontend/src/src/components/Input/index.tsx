import React from 'react';

import { Input } from './index.interface';
import styles from './index.styles.scss';


export default function Input({ name, required, type = 'text', placeholder, value = '', error = '', variant, onChange }: Input) {
	return (
		<div className={styles.container}>
			<div className={`${styles.content}${placeholder ? ` ${styles.placeholder}` : ''}${required ? ` ${styles.required}` : ''}${variant ? ` ${variant}` : ''}`}>
				<input name={name} autoCapitalize="none" autoComplete="off" autoCorrect="off" type={type} defaultValue={value} onChange={(e) => { if (onChange) onChange({ name, value: e.target.value }); }} required />
				{
					placeholder &&
					<span unselectable='on'>{placeholder}</span>
				}
			</div>
			{
				error.length > 0 &&
				<div className={styles.footer}>
					<span className={styles.error} unselectable='on'>{error}</span>
				</div>
			}
		</div>
	);
}