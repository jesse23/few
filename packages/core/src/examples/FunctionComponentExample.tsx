
// use named function for Function.name
export default Object.assign( function FunctionComponent( { name }: { name: string } ): JSX.Element {
    return <div>Hello {name || 'dummy'}</div>;
}, {
    displayName: 'FunctionComponent'
} );

