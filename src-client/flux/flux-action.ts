// Actions for All
export class NextNow {
  constructor(public datetime: number) { }
}

// Actions for Page1
export class NextMessageFromFalcorPage1 {
  constructor(public falcorQuery: any[]) { }
}

// Actions for Page2
export class NextMessageFromFalcorPage2 {
  constructor(public falcorQuery: any[]) { }
}


// Action types
export type ActionTypeAll = NextNow;

export type ActionTypePage1 = NextMessageFromFalcorPage1;

export type ActionTypePage2 = NextMessageFromFalcorPage2;

export type Action = ActionTypeAll | ActionTypePage1 | ActionTypePage2; 