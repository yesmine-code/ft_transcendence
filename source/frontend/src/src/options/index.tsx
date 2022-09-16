import React, { Suspense } from 'react';
import { v4 as uuidv4 } from 'uuid';

import withOption from '@/hoc/withOption';

import { Option } from '@/context/option-context';

import styles from './index.styles.scss';


export default withOption(({ option }: { option: Option }) => {
	const target = option.option?.target;
	const options = option.option?.options;

	if (!target)
		return null;

	const menu = React.createRef<HTMLDivElement>();

	const listener = (ev: any) => {
		if (!ev.composedPath().includes(target) && !ev.composedPath().includes(menu.current)) {
			option.setOption(undefined);
			return;
		}

		const target_size = target.getBoundingClientRect();

		if (!menu.current)
			return null;

		const menu_size = menu.current.getBoundingClientRect();

		if (menu.current.style.visibility == 'hidden')
			menu.current.style.removeProperty('visibility');
		
		if (target_size.left - (target_size.width / 2) > document.body.clientWidth / 2) {
			menu.current.style.left = `${target_size.left - (menu_size.width - target_size.width)}px`;
			menu.current.style.removeProperty('right');
		} else {
			menu.current.style.right = `${target_size.right - (menu_size.height - target_size.height)}px`;
			menu.current.style.removeProperty('left');
		}

		if (target_size.top - (target_size.height / 2) > document.body.clientHeight / 2) {
			menu.current.style.bottom = `${top}px`;
			menu.current.style.removeProperty('top');
		} else {
			menu.current.style.top = `${target_size.bottom}px`;
			menu.current.style.removeProperty('bottom');
		}
	}

	document.onscroll = listener;
	document.onclick = listener;
	document.onload = listener;

	return (
		<Suspense fallback={null}>
			<div ref={menu} className={styles.container} style={{ visibility: 'hidden' }}>
				{
					options?.map((o) => (
						<button key={uuidv4()} className={`${styles.item}${o.valid? ` ${styles.active}` : ''}`} onClick={() => { option.setOption(undefined); o.action(); }}>
							<span unselectable="on">{o.value}</span>
							{
								o.valid !== undefined &&
								<div className={styles.check}>
									<div />
								</div>
							}
						</button>
					))
				}
			</div>
		</Suspense>
	);
})