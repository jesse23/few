# Use case 1: passive (browser)
- Example
  ```javascript
  elem.onClick = async( e ) => {
      const content = await loadFromServer(e.target.internalKey);
      dispatch( 'someKey', content );
  }
  ```
- In this case, we will enable/start the session forever or by option
- Once the user interaction happens, it will start a new `profile`.
- during the profile it will keep processing `values` from observables.
  - Considering case like XHR, values could be with `onStart` and `onDone` 2 different states.
- The `TTIPolyfill` logic will be used in this case to decide `a meaningful complete user interaction`.
- Once a `user interaction` has been decided as complete, an `observer` is suppose to accumulate all `values` with a summary, then report to somewhere
- Tradeoff or disadvantage is, there is no `session-id` concept to differentiate the `requestor`. At browser side it is generally fine since we know only one user will operate :),
  - But still there might be case like client side Polling, which might cause side effect. But that is not breaking what we want to test from `user point of view` when we use this approach at client.

# Use case 2: active (nodeJS)
- Example
  ```javascript
  const convertFiles = async( path ) => {
      const files = await readFolder(path);
      const promises = files.forEach( f => readFile(f));
      const contents = await Promise.all(promises);
      const res = postProcessing(contents);
      return res;
  };
  convertFiles('./test/*.xml');
  ```
- In this case we know the actual logical start and stop, no need for `TTIPolyfill`.
- The observable part is the same - processing `values` from observables.
- At the end of the process, we can do the `onComplete` part explicitly.

# Use case 3: passive (nodeJS, express server)
- Example
```javascript
app.get('/convertFiles', async ( req, res ) => {
    // convertFiles in example 2
    const res = await convertFiles(req.path);
    res.send(res.toString());
} )
```
- In this case there is no logical start stop.
- `TTIPolyfill` is not sufficient for this case - there might be multiple request into the same node process, obviously the expectation here is `performance cost per request`.
- Several approaches for this requirement:
  - like sequelize transaction, an explicit `container` and `id`.
  - like react, we use a implicit ctx/session object implicitly in every call, so that we can use that session.id to trace
  - port to a separate resource / process.


