import React from 'react';
import { createRoot, Root } from 'react-dom/client';

import socket from './bundles/socket';

import App from './app';

import './index.css';


let element: Root | null = null;

socket.ready(() => {
	if (!element)
		element = createRoot(document.getElementById('root') as HTMLElement);

	if (element)
		element.render(<App />);
});