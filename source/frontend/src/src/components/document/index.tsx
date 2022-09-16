import React from 'react';

import styles from './index.styles.scss';


export const Page = ({ children, variant }: { children: any, variant?: string; }) => {
	return (
		<div className={`${styles.page}${variant ? ` ${variant}` : ''}`}>
			{children}
		</div>
	)
}

export const Header = ({ variant, children }: { variant?: string, children: any }) => {
	return (
		<div className={`${styles.header}${variant ? ` ${variant}` : ''}`}>
			{children}
		</div>
	)
}

export const Body = ({ variant, children }: { variant?: string, children: any }) => {
	return (
		<div className={`${styles.body}${variant ? ` ${variant}` : ''}`}>
			{children}
		</div>
	)
}