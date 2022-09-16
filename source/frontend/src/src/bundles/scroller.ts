export type ScrollFunction = () => Promise<boolean>;

export class Scroller {
	private loading: boolean;
	private load: boolean;
	private functions?: ScrollFunction[];

	constructor() {
		this.loading = false;
		this.load = true;

		this.functions = undefined;
	}

	private async execute() {
		if (!this.functions) {
			this.stop();
			return;
		}

		if (!await this.functions[0]()) {
			this.functions.shift();

			this[this.functions.length <= 0 ? 'stop' : 'execute' ]();
		}
	}

	start(element: Element | null, fct: ScrollFunction | ScrollFunction[]) {
		if (this.functions || !element)
			return;

		this.functions = Array.isArray(fct) ? fct : [fct];

		const observer = new IntersectionObserver(
			async ([entry]: IntersectionObserverEntry[]) => {
				if (!entry.isIntersecting || !this.load || this.loading)
					return;

				this.loading = true;
				
				if (!this.functions || !this.functions.length)
					this.stop();
				else {
					await this.execute();
				}

				this.loading = false;
			}
		, {
			root: null,
			rootMargin: "0px",
			threshold: 0.1
		});

		observer.observe(element);
	}

	stop() {
		this.load = false;
	}
}