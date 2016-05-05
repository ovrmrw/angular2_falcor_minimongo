declare interface StatePage1 {
  message: string
}

declare interface StatePage2 {
  message: string
}

declare interface StatePage3 {
  documents: {}[]
}

declare interface StatePage4 {
  documents: {}[],
  totalItems: number,
}

declare interface AppState {
  //falcorModel: any,
  now: number,
  page1: Promise<StatePage1>,
  page2: Promise<StatePage2>,
  page3: Promise<StatePage3>,
  page4: Promise<StatePage4>,
}