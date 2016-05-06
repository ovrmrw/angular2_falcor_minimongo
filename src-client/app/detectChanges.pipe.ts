import { Pipe, PipeTransform, ChangeDetectorRef } from '@angular/core';

@Pipe({
  name: 'detectChanges',
  pure: false
})
export class DetectChangesPipe implements PipeTransform {
  transform(value: any): any {
    setTimeout(() => {
      this.cd.detectChanges();
    }, 1000);
    return value;
  }
  constructor(private cd: ChangeDetectorRef) { }
}