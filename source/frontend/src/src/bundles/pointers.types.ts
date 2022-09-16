type GlobalReactEvent<T = Element> = React.TouchEvent<T> | React.MouseEvent<T, MouseEvent>;
type GlobalBaseEvent = MouseEvent | TouchEvent;

export type GlobalEvent = GlobalReactEvent | GlobalBaseEvent;