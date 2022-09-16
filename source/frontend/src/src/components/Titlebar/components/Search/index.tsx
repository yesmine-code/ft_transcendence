import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import fetch from '@/bundles/fetch';

import styles from './index.styles.scss';


export default function Search() {
	const [results, setResults] = useState<Record<string, any>[]>([]);
	const [visibility, setVisibility] = useState<boolean>(false);

	const container = React.useRef<HTMLInputElement | null>(null);
	const input = React.useRef<HTMLInputElement | null>(null);

	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const query = e.target.value || '';

		const valid = query.length > 0;

		if (valid) {
			(async () => {
				const res = await fetch.request.json<Record<string, any>[]>('/search', { query });

				setResults(res || []);
			})()
		}

		setVisibility(valid);

		document.body.onclick = (e: any) => {
			const clicked_link = e.composedPath()
			.reduce((p: any, c: any) => !(!p || c.classList?.contains(styles.result)), true);

			setVisibility(
				query.length > 0

				&& e.composedPath()
				.includes(container.current)

				&& (() => {
					if (!clicked_link && input.current) {
						input.current.value = "";
						setResults([]);
					}

					return clicked_link;
				})()
			);
		}
	}

	return (
		<div ref={container} className={styles.container}>
			<div className={styles.content}>
				<div className={styles.input}>
					<input ref={input} onChange={onChange} autoCapitalize="none" autoComplete="off" autoCorrect="off" type="text" required />
					<span unselectable="on">Search</span>
				</div>
				{
					visibility && (input.current && input.current.value.length > 0) &&
					<div className={styles.results}>
						{
							!results.length &&
							<div className={styles.empty}>
								<span unselectable="on">No results found.</span>
							</div>
						}
						{
							!!results.length && results.map(({ url, value }) => (
								<Link
									key={uuidv4()}
									className={styles.result}
									to={url}>
									<div>
										<span unselectable="on">{value}</span>
									</div>
								</Link>
							))
						}
					</div>
				}
			</div>
		</div>
	);
}