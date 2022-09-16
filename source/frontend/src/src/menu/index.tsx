import React from 'react';

import withMenu from '@/hoc/withMenu';

import { Menu } from '@/context/menu-context';

import Profile from './profile';
import Resize from './resize';
import Conversation from './conversation';
import Game from './game';
import ConversationPassword from './conversation_password';
import InvitePeople from './invite_people';
import PhoneNumber from './phone_number';
import Username from './username';

import styles from './index.styles.scss';

const Component = ({ name, data, remove }: { name: string; data: Record<string, any>; remove: (e: any) => void; }) => {
	switch (name) {
		case 'profile':
			return <Profile data={data} remove={remove} />;
		case 'resize':
			return <Resize data={data} remove={remove} />;
		case 'conversation':
			return <Conversation data={data} remove={remove} />;
		case 'conversation_password':
			return <ConversationPassword data={data} remove={remove} />;
		case 'game':
			return <Game data={data} remove={remove} />;
		case 'phone_number':
			return <PhoneNumber data={data} remove={remove} />;
		case 'invite_people':
			return <InvitePeople data={data} remove={remove} />;
		case 'username':
			return <Username data={data} remove={remove} />;
		default:
			return null;
	}
}

export default withMenu(({ menu }: { menu: Menu }) => {
	return (
		<>
			{
				menu.menu.map((m, index) => (
					<div key={m.key} className={`${styles.container}${(index + 1 == menu.menu.length) ? ` ${styles.primary}` : ''}`}>
						<div className={styles.background} onClick={menu.removeMenu.bind(this, m.key)} />
						<div className={`${styles.content}${(m.variant) ? ` ${m.variant}` : ''}`}>
							<Component name={m.name} remove={() => menu.removeMenu(m.key)} data={m.data || {}} />
						</div>
					</div>
				))
			}
		</>
	);
})