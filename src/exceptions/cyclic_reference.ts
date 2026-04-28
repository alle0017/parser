export class CyclicReferenceError extends Error {
      constructor(set: Set<string>) {
            super(`found cyclic reference or unresolvable reference ${set.values().toArray().join()}`)
      }
}