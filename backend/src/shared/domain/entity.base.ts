export abstract class Entity<T extends string | number> {
  protected readonly _id: T;

  protected constructor(id: T) {
    this._id = id;
  }

  get id(): T {
    return this._id;
  }

  equals(other: Entity<T> | null | undefined): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (this === other) {
      return true;
    }
    if (other.constructor !== this.constructor) {
      return false;
    }
    return this._id === other._id;
  }
}
