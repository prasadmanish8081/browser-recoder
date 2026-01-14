declare module 'lowdb/node' {
  import { Adapter } from 'lowdb'
  export class JSONFile<T> implements Adapter<T> {
    constructor(filename: string)
    read(): Promise<T | null>
    write(data: T): Promise<void>
  }
}

declare module 'lowdb/node.js' {
  import { Adapter } from 'lowdb'
  export class JSONFile<T> implements Adapter<T> {
    constructor(filename: string)
    read(): Promise<T | null>
    write(data: T): Promise<void>
  }
}
