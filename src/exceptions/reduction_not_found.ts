export class ReductionNotFoundError extends Error {
      constructor() {
            super('impossible to find a valid reduction');
      }
}