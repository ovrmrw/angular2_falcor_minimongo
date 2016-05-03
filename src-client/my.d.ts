///////////////////////////////////////////////////
// jQueryプラグイン
declare interface JQuery {
  leanModal: () => void;
}

declare interface EventTarget {
  value: any;
  textContent: string;
}

declare interface MouseEvent {
  path: HTMLElement[];
}