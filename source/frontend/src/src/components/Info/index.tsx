import React from 'react';
import { v4 as uuidv4 } from 'uuid';

import styles from './index.styles.scss';

function isPositiveInteger(str: string) {
	if (typeof str !== 'string') {
		return false;
	}

	const num = Number(str);

	return (Number.isInteger(num) && num >= 0);
}

export default function InputDigits({ total, onChange }: { total: Number; onChange?: (arg0: number[]) => void; }) {
	return (
		<div className={styles.container}>
			{
				[...Array(total)].map((e, i) => (
					<div key={uuidv4()} className={styles.item}>
						<input
							onKeyDown={
								(e: React.KeyboardEvent<HTMLInputElement>) => {
									const key = e.key;
									const value = e.currentTarget.value;
							
									const event_delete = (value.length >= 1 && key == 'Backspace');
									const event_digit = (value.length == 0 && isPositiveInteger(key));
							
									if (!(event_delete || event_digit)) {
										e.preventDefault();
										return;
									}
								}
							}
							onKeyUp={
								(e: React.KeyboardEvent<HTMLInputElement>) => {
									const value = e.currentTarget.value;

									const parent = e.currentTarget.parentNode?.parentNode;
									const children = parent?.children;
									if (!children) {
										e.preventDefault();
										return;
									}

									if (e.key == 'Enter') {
										const collection: HTMLDivElement[] = [].slice.call(children);

										if (onChange) {
											onChange(
												collection.map((child) => {
													const value = child.getElementsByTagName('input')[0].value;
		
													return value.length > 0 ? Number(value) : 0;
												})
											);
										}
									}

									if (value.length > 0) {
										if (i >= children.length - 1)
											return;

										for (let n = 0; n < i; n++) {
											const child = children[n].getElementsByTagName('input')[0];
											const is_digit = child.value.length > 0;

											if (!is_digit)
												return;
										}

										for (let n = i + 1; n + 1 <= total; n++) {
											const child = children[n].getElementsByTagName('input')[0];
											const is_digit = child.value.length > 0;

											if (is_digit)
												return;
										}

										const element = children[i + 1].getElementsByTagName('input')[0];
										element.focus();
									} else {
										if (i <= 0)
											return;

										for (let n = 0; n < i; n++) {
											const child = children[n].getElementsByTagName('input')[0];
											const is_digit = child.value.length > 0;

											if (!is_digit)
												return;
										}

										for (let n = i + 1; n + 1 <= total; n++) {
											const child = children[n].getElementsByTagName('input')[0];
											const is_digit = child.value.length > 0;

											if (is_digit)
												return;
										}

										const element = children[i - 1].getElementsByTagName('input')[0];
										element.focus();
									}
								}
							}
							type='number'
							required />
						<span unselectable='on'>0</span>
					</div>
				))
			}
		</div>
	);
}