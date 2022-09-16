import React from 'react';

import { GlobalEvent, getPointers } from '@/bundles/pointers';

import withMenu from '@/hoc/withMenu';
import withUser from '@/hoc/withUser';

import { ResizeProps, ResizeState } from './index.interface';
import styles from './index.styles.scss';


export default withMenu(withUser(class Resize extends React.Component<ResizeProps> {
	zoom: React.RefObject<HTMLDivElement>;
	zoom_cursor: React.RefObject<HTMLDivElement>;
	drag: React.RefObject<HTMLDivElement>;
	schema: React.RefObject<HTMLDivElement>;
	image: React.RefObject<HTMLImageElement>;
	protectState: boolean;

	state: ResizeState;

	static listeners(fct: (this: HTMLElement, ev: GlobalEvent) => any) {
		const endFunction = function() {
			document.body.removeAttribute('grabbing');

			document.body.removeEventListener('mousemove', fct);
			document.body.removeEventListener('touchmove', fct);
	
			document.body.removeEventListener('mouseleave', endFunction);
			document.body.removeEventListener('mouseup', endFunction);
			document.body.removeEventListener('touchend', endFunction);
		};

		document.body.setAttribute('grabbing', '');

		document.body.addEventListener('mousemove', fct);
		document.body.addEventListener('mouseleave', endFunction, { once: true });
		document.body.addEventListener('mouseup', endFunction, { once: true });
	
		document.body.addEventListener('touchmove', fct);
		document.body.addEventListener('touchend', endFunction, { once: true });
	}

	constructor(props: ResizeProps | Readonly<ResizeProps>) {
		super(props);

		this.state = {
			image: {
				x: 0,
				y: 0
			},
			size: {
				width: 0,
				height: 0
			},
			progress: null,
			scale: 0,
			cursor: 0
		};

		this.zoom = React.createRef<HTMLDivElement>();
		this.zoom_cursor = React.createRef<HTMLDivElement>();
		this.drag = React.createRef<HTMLDivElement>();
		this.schema = React.createRef<HTMLDivElement>();
		this.image = React.createRef<HTMLImageElement>();

		this.protectState = false;

		/* handlers */
		this.onSave = this.onSave.bind(this);
		this.onZoom = this.onZoom.bind(this);
		this.onDrag = this.onDrag.bind(this);
		this.onRemove = this.onRemove.bind(this);

		/* getters */
		this.getZoomScale = this.getZoomScale.bind(this);

		/* setters */
		this.setProtectedState = this.setProtectedState.bind(this);

		/* methods */
		this.openProtectedState = this.openProtectedState.bind(this);
		this.closeProtectedState = this.closeProtectedState.bind(this);
	}

	componentDidMount() {
		this.openProtectedState();

		const { data } = this.props;

		if (!this.schema_current)
			return null;

		const schema_rect = this.schema_current.getBoundingClientRect();

		let height;
		let width;

		if (data.image.width / data.image.height < schema_rect.width / schema_rect.height)
		{
			height = data.image.height * (schema_rect.width / data.image.width);
			width = data.image.width * (schema_rect.width / data.image.width);
		}
		else
		{
			height = data.image.height * (schema_rect.height / data.image.height);
			width = data.image.width * (schema_rect.height / data.image.height);
		}

		this.setProtectedState({
			size: {
				width,
				height
			}
		});
	}

	componentDidCatch(error: any, errorInfo: any) {
		console.error(error, errorInfo);
	}

	componentWillUnmount() {
		this.closeProtectedState();
	}

	/* handlers */
	onSave(e: any) {
		const { data, remove } = this.props;

		if (!this.drag_current || !this.schema_current)
			return null;

		const canvas = document.createElement('canvas');
		canvas.width = data.width;
		canvas.height = data.height;

		const context = canvas.getContext('2d');
		if (!context || !this.image_current)
			return null;

		const drag_rect = this.drag_current.getBoundingClientRect();
		const schema_rect = this.schema_current.getBoundingClientRect();

		const crop_left = (schema_rect.left - drag_rect.left) / drag_rect.width * data.image.width;
		const crop_top = (schema_rect.top - drag_rect.top) / drag_rect.height * data.image.height;
		const crop_width = schema_rect.width / drag_rect.width * data.image.width;
		const crop_height = schema_rect.height / drag_rect.height * data.image.height;

		context.drawImage(this.image_current, crop_left, crop_top, crop_width, crop_height, 0, 0, data.width, data.height);

		canvas.toBlob((blob: Blob | null) => {
			if (!blob)
				return null;

			data.save(blob);
			remove(e);
		}, 'image/jpeg', this.initial_scale);
	}

	onDrag(init: GlobalEvent) {
		const image_x = this.image_x;
		const image_y = this.image_y;

		let init_pointers = getPointers(init);

		Resize.listeners((event: GlobalEvent) => {
			const event_pointers = getPointers(event);

			if (!event_pointers.length)
				return null;

			if (!init_pointers.length)
				init_pointers = event_pointers;

			const x = -(init_pointers[0].x - event_pointers[0].x);
			const y = -(init_pointers[0].y - event_pointers[0].y);

			this.setImagePosition(image_x + x, image_y + y);
		});
		
	}

	onZoom(_: any) {
		Resize.listeners((event: GlobalEvent) => {
			const pointers = getPointers(event);

			if (!pointers.length || !this.zoom_cursor_current)
				return null;

			const zoom = this.getZoomScale(pointers[0].x);

			if (!zoom)
				return null;

			this.zoom_cursor_current.style.left = `${zoom.cursor}px`;

			this.setProtectedState({
				scale: zoom.scale,
				cursor: zoom.cursor
			});

			this.setImagePosition();
		});
	}

	onRemove(e: any) {
		const { remove } = this.props;

		if (remove)
			remove(e);
	}


	/* getters */
	private get image_y() {
		const { image } = this.state;
		const { y } = image;

		return (y);
	}

	private get image_x() {
		const { image } = this.state;
		const { x } = image;

		return (x);
	}

	private get initial_scale() {
		return (1);
	}

	private get zoom_current() {
		return (this.zoom.current);
	}

	private get zoom_cursor_current() {
		return (this.zoom_cursor.current);
	}

	private get image_current() {
		return (this.image.current);
	}

	private get drag_current() {
		return (this.drag.current);
	}

	private get schema_current() {
		return (this.schema.current);
	}

	getZoomScale(x: number) {
		if (!this.zoom_current || !this.zoom_cursor_current)
			return null;

		const zoom_rect = this.zoom_current.getBoundingClientRect();
		const zoom_cursor_rect = this.zoom_cursor_current.getBoundingClientRect();

		const mouse_left = Math.min(Math.max(0, x - zoom_rect.left), zoom_rect.width);

		const container_width = zoom_rect.width - zoom_cursor_rect.width;
		const cursor_left = mouse_left - (zoom_cursor_rect.width / 2);

		const scale = Math.min(Math.max(0, cursor_left / container_width), 1);

		return {
			scale,
			cursor: scale * container_width
		};
	}

	/* setters */
	setProtectedState(props: Record<string, any>) { if (this.protectState) this.setState(props); }

	setImagePosition(x = this.image_x, y = this.image_y) {
		if (!this.drag_current || !this.schema_current)
			return null;

		const drag_rect = this.drag_current.getBoundingClientRect();
		const schema_rect = this.schema_current.getBoundingClientRect();

		const { scale } = this.state;

		const maximum_x = ((drag_rect.width - schema_rect.width) / (this.initial_scale + scale)) / 2;
		const maximum_y = ((drag_rect.height - schema_rect.height) / (this.initial_scale + scale)) / 2;

		this.setProtectedState({
			image: {
				x: Math.min(Math.max(-maximum_x, x), maximum_x),
				y: Math.min(Math.max(-maximum_y, y), maximum_y)
			}
		});
	}


	/* methods */
	openProtectedState() { this.protectState = true; }

	closeProtectedState() { this.protectState = false; }


	render() {
		const { scale, image, size } = this.state;
		const { data } = this.props;

		return (
			<div className={styles.container}>
				<div className={styles.header}>
					<div className={styles.presentation}>
						<button className={styles.close} onClick={this.onRemove}>
							<svg style={{width: '100%', height: '100%'}} viewBox="0 0 50 50">
								<path d="M4.132,46.577L3.425,45.87,45.993,3.308,46.7,4.015Z M3.424,4.038l0.707-.707L46.7,45.89l-0.707.707Z"/>
							</svg>
						</button>
						<span className={styles.title} unselectable='on'>Edit picture</span>
					</div>
					<div className={styles.actions}>
						<button className={styles.save} unselectable="on" onClick={this.onSave}>Save</button>
					</div>
				</div>
				<div className={styles.body}>
					<div className={styles.box} onMouseDown={this.onDrag} onTouchStart={this.onDrag}>
						<div ref={this.drag} className={styles.box_content} style={{transform: `scale(${this.initial_scale + scale}) translate(${image.x}px, ${image.y}px)`, width: `${size.width}px`, height: `${size.height}px`}}>
							<img
								ref={this.image}
								src={data.image.src}
								style={{
									width: '100%',
									height: '100%'
								}}
								alt="media"
								unselectable="on" />
						</div>
						<div ref={this.schema} className={styles.box_schema} />
					</div>
				</div>
				<div className={styles.footer}>
					<div className={styles.icon}>
						<svg style={{width: '100%', height: '100%'}} viewBox="0 0 50 50">
							<path d="M4 25 L46 25"/>
						</svg>
					</div>
					<div className={styles.zoom}>
						<div ref={this.zoom} className={styles.cursor_background} />
						<div ref={this.zoom_cursor} className={styles.cursor} onTouchStart={this.onZoom} onMouseDown={this.onZoom} />
					</div>
					<div className={styles.icon}>
						<svg style={{width: '100%', height: '100%'}} viewBox="0 0 50 50">
							<path d="M4 25 L46 25 M25 4 L25 46"/>
						</svg>
					</div>
				</div>
			</div>
		);
	}
}))