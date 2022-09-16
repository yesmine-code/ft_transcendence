import React from "react";
import { v4 as uuidv4 } from "uuid";

import styles from './index.styles.scss';


export default function Notification({ values, remove }: {
	remove: (key: string) => void;
	values: {
		key: string;
		value: string | Record<string, any>;
		process: NodeJS.Timeout;
	}[]
}) {
	if (!values.length) return null;

	return (
		<div className={styles.container}>
			{
				values.map(({ key, value }) => {
					const is_invitation = typeof value == 'object';

					return (
						<div key={key} className={styles.item} onClick={() => { remove(key); }}>
							{
								!is_invitation &&
								<span unselectable="on">{value}</span>
							}
							{
								is_invitation &&
								<>
									<span unselectable="on">{`${value.from.display_name} wants to play with you!`}</span>
									<div className={styles.confirmation}>
										<button unselectable="on">Accept</button>
										<button unselectable="on">Refuse</button>
									</div>
								</>
							}
						</div>
					);
				})
			}
		</div>
	)
}