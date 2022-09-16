import React from 'react';

import { TextArea } from './index.interface';
import styles from './index.styles.scss';


export default function TextArea({ name, placeholder, value = '', variant, onInput, onChange }: TextArea) {
	const textarea = React.createRef<HTMLDivElement>();

	const change = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (onChange && e.code == 'Enter') {
			e.preventDefault();

			if (!e.currentTarget.value.trim().length) return;

			onChange({ name, value: e.currentTarget.value });

			e.currentTarget.value = '';
		}
	};

	const input = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const element = textarea.current;

		if (!element)
			return null;

		if (onInput)
			onInput();

		element.dataset.replicatedValue = e.target.value;
	};

	return (
		<div ref={textarea} className={`${styles.container}${placeholder ? ` ${styles.placeholder}` : ''}${variant ? ` ${variant}` : ''}`}>
			<textarea rows={1} autoCapitalize="none" autoComplete="off" autoCorrect="off" defaultValue={value} onInput={input} onKeyDown={change} required />
			{
				placeholder &&
				<span unselectable='on'>{placeholder}</span>
			}
		</div>
	);
}