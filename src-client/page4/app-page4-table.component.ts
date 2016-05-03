import {Component, Input, OnChanges} from '@angular/core';
import lodash from 'lodash';

const COMPONENT_SELECTOR = 'my-complicated-table';
const TARGET_PAGE = 'target-page';
@Component({
  selector: COMPONENT_SELECTOR,
  template: `
    <div class="row">
      <div class="col s12">
        <ul *ngIf="totalItems > 0" class="pagination" (click)="onClickPagination($event)">
          <li [ngClass]="{'waves-effect':currentPage!=1,'disabled':currentPage==1}" [attr.target-page]="currentPage > 1 ? currentPage - 1 : 1" class="target-page"><i class="material-icons">chevron_left</i></li>
          <li *ngFor="let page of pagesRange" [ngClass]="{'waves-effect':page!=currentPage,'active':page==currentPage}" [attr.target-page]="page" class="target-page">{{page}}</li>
          <li [ngClass]="{'waves-effect':currentPage!=totalPages,'disabled':currentPage==totalPages}" [attr.target-page]="currentPage != totalPages ? currentPage + 1 : currentPage" class="target-page"><i class="material-icons">chevron_right</i></li>
          <li>Total Items:{{totalItems}}</li>
        </ul>
        <table class="bordered">
          <thead>
            <tr>
              <th *ngFor="let field of fields, #i = index" class="center-align">{{aliases[i] || field | uppercase}}</th>
            </tr>
          </thead>
          <tbody *ngIf="totalItems > 0">
            <tr *ngFor="let document of documents">
              <td *ngFor="let i of columnsRange" [ngClass]="{'center-align':aligns[i]=='center', 'right-align':aligns[i]=='right'}">
                {{ document[fields[i]] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  //inputs: ['fields', 'aliases', 'aligns', 'documents', 'totalItems', 'itemsPerPage', 'currentPage'] // これを書くと@Input()を省略できる。
})
export class AppPage4Table implements OnChanges {
  @Input() fields: string[]; // inputsを書けば@Input()を省略できる。
  @Input() aliases: string[]; // 〃
  @Input() aligns: string[]; // 〃
  @Input() documents: any[]; // 〃
  @Input() totalItems: number; // 〃
  @Input() itemsPerPage: number; // 〃
  @Input() currentPage: number; // 〃
  columnsRange: number[];
  totalPages: number;
  pagesRange: number[];

  ngOnChanges() {
    this.columnsRange = lodash.range(0, this.fields.length);
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.pagesRange = lodash.range(1, this.totalPages + 1);
  }

  onClickPagination(event: MouseEvent) {
    //console.log(event);
    let element = event.target as HTMLElement;
    while (element) { // 条件に一致するHTMLElementを見つけるまでparentElementを辿る。
      if (element.tagName == 'LI' && element.className.indexOf(TARGET_PAGE) > -1) {
        break;
      }
      element = element.parentElement;
    }
    //console.log(element);
    if (element) {
      const targetPage: number = parseInt(element.attributes.getNamedItem(TARGET_PAGE).value);      
      // CustomEventを生成する。
      const customEvent = new CustomEvent('emitTargetPage', { detail: targetPage, bubbles: true });
      // EventTarget型からcustomEventを発火。
      event.target.dispatchEvent(customEvent);
    }
  }
}