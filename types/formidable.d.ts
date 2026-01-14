declare module 'formidable' {
  export class IncomingForm {
    constructor(options?: any)
    parse(req: any, cb: (err: any, fields: any, files: any) => void): void
  }
  export type File = any
  export type Files = Record<string, File>
}
