declare interface StatePage1 {
  messageByPush: Promise<string>
}

declare interface StatePage2 {
  messageByPush: Promise<string>
}

declare interface StatePage3 {
  documentsByPush: Promise<{}[]>
}

declare interface AppState {
  //falcorModel: any,
  nowByPush: number,
  page1: StatePage1,
  page2: StatePage2,
  page3: StatePage3,
}