// Actions for All
export class NextNow {
  constructor(public datetime: number) { }
}

// Actions for Page1
export class NextMessageFromFalcorForPage1 {
  constructor(public falcorQuery: any[]) { }
}


// Action types
export type ActionTypeAll = NextNow;

export type ActionTypePage1 = NextMessageFromFalcorForPage1;

export type Action = ActionTypeAll | ActionTypePage1; 