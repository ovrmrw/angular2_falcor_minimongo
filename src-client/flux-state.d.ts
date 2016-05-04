declare interface StatePage1 {
  nowByObservable: number,
  messageByFalcor: Promise<string>
}

declare interface AppState {
  falcorModel: any;
  statePage1: StatePage1;
}