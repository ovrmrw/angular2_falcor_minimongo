declare interface StatePage1 {
  nowByPush: number,
  messageByPush: Promise<string>
}

declare interface StatePage2 {
  nowByPush: number,
  messageByPush: Promise<string>
}

declare interface AppState {
  falcorModel: any,
  statePage1: StatePage1,
  statePage2: StatePage2,
}