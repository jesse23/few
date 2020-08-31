# How can we share states between component gradually?
- The answer from redux is global, the state will be global and unique
- The answer from ELM is global, all the 'function' will be composed at app level as a monolithic state

# Use case
- Two Point Component, each of them has their own coordination states and has control inside to change it.
- At application level, there is an option to bind those two points y value.
- Application level has no knowledge to point bindings

# Facts
- React doesn't support custom event
- For top-down React use prop to drive the update
