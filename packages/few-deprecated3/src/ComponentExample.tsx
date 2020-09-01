import { h } from './vDom';

// somehow the h will be removed without statement below
h;

export const FunctionComponent = ( { name }: { name: string } ): JSX.Element => <div>Hello {name}</div>;
FunctionComponent.displayName = 'FunctionComponent';

export const ObjectComponent = {
    render: Object.assign(
        ( { name }: { name: string } ): JSX.Element => <div>Hello {name}</div>,
        { displayName: 'ObjectComponent' }
    )
};

const dummy = ( a: any ): any => a;

// https://stackoverflow.com/questions/52992932/component-definition-is-missing-display-name-react-display-name
export const ObjectComponent2 = {
    name: 'ObjectComponent',
    render: dummy( ( { name }: { name: string } ): JSX.Element => <div>Hello {name}</div> )
};
