export interface Props {
	variant?: string;
	src?: string;
	action?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}