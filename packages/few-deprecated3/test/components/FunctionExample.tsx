import { h } from '@/vDom';

export const FunctionComponent = ( { name }: { name: string } ): JSX.Element => <div>Hello {name || 'dummy' }</div>;
FunctionComponent.displayName = 'FunctionComponent';


export default FunctionComponent;

