import {Component, Input, OnChanges} from 'angular2/core';
import _ from 'lodash';

const componentSelector = 'my-complicated-table'
@Component({
  selector: componentSelector,
  template: `
    <ul *ngIf="totalItems > 0" class="pagination" (click)="onClickPagination($event)">
      <li [ngClass]="{'waves-effect':currentPage!=1,'disabled':currentPage==1}" [attr.target-page]="currentPage > 1 ? currentPage - 1 : 1" class="target-page"><i class="material-icons">chevron_left</i></li>
      <li *ngFor="#page of pagesRange" [ngClass]="{'waves-effect':page!=currentPage,'active':page==currentPage}" [attr.target-page]="page" class="target-page">{{page}}</li>
      <li [ngClass]="{'waves-effect':currentPage!=totalPages,'disabled':currentPage==totalPages}" [attr.target-page]="currentPage != totalPages ? currentPage + 1 : currentPage" class="target-page"><i class="material-icons">chevron_right</i></li>
      <li>Total Items:{{totalItems}}</li>
    </ul>
    <table class="bordered">
      <thead>
        <tr>
          <th *ngFor="#field of fields, #i = index" class="center-align">{{aliases[i] || field | uppercase}}</th>
        </tr>
      </thead>
      <tbody *ngIf="totalItems > 0">
        <tr *ngFor="#document of documents">
          <td *ngFor="#i of columnsRange" [ngClass]="{'center-align':aligns[i]=='center', 'right-align':aligns[i]=='right'}">
            {{ document[fields[i]] }}
          </td>
        </tr>
      </tbody>
    </table>
  `,
  //inputs: ['fields', 'aliases', 'aligns', 'documents', 'totalItems', 'itemsPerPage', 'currentPage'] // これを書くと@Input()を省略できる。
})
export class AppPage4Table implements OnChanges {
  @Input() fields: string[]; // inputsを書けば省略できる。
  @Input() aliases: string[]; // inputsを書けば省略できる。
  @Input() aligns: string[]; // inputsを書けば省略できる。
  @Input() documents: any[]; // inputsを書けば省略できる。
  @Input() totalItems: number; // inputsを書けば省略できる。
  @Input() itemsPerPage: number; // inputsを書けば省略できる。
  @Input() currentPage: number; // inputsを書けば省略できる。
  columnsRange: number[];
  totalPages: number;
  pagesRange: number[];
  TARGET_PAGE = 'target-page';

  ngOnChanges() {
    this.columnsRange = _.range(0, this.fields.length);
    this.totalPages = Math.floor(this.totalItems / this.itemsPerPage) + 1
    this.pagesRange = _.range(1, this.totalPages + 1);
  }

  onClickPagination(event: MouseEvent) {
    //console.log(event);
    let element = event.target as HTMLElement;
    while (element) { // 条件に一致するHTMLElementを見つけるまでparentElementを辿る。
      if (element.tagName == 'LI' && element.className.indexOf(this.TARGET_PAGE) > -1) {
        break;
      }
      element = element.parentElement;
    }
    //console.log(element);
    if (element) {
      const targetPage: number = parseInt(element.attributes.getNamedItem(this.TARGET_PAGE).value);      
      // CustomEventを生成する。
      const customEvent = new CustomEvent('emitTargetPage', { detail: targetPage, bubbles: true });
      // EventTarget型からcustomEventを発火。
      event.target.dispatchEvent(customEvent);
    }
  }
}