import React from 'react';

import withOption from '@/hoc/withOption';

import { Option, OptionElement } from '@/context/option-context';

import styles from './index.styles.scss';


export default withOption(({ option, orientation = 'vertical', options }: { option: Option, orientation?: 'horizontal' | 'vertical'; options: OptionElement[] }) => {
	const filtered = options.filter((o) => o !== undefined);

	if (filtered.length <= 0)
		return null;

	const button = React.createRef<HTMLButtonElement>();

	const onClick = () => {
		if (!button.current || !option)
			return;

		option.setOption(
			(option.option?.target == button.current)
			? undefined
			: {
				target: button.current,
				options: filtered
			}
		);
	}

	return (
		<button ref={button} onClick={onClick} className={`${styles.container}${orientation == 'vertical' ? ` ${styles.vertical}` : ''}`}>
			<div />
			<div />
			<div />
		</button>
	);
})