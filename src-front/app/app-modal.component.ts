import {Component, Input} from 'angular2/core'

const COMPONENT_SELECTOR = 'my-modal'
@Component({
  selector:COMPONENT_SELECTOR,
  template: `
    <div class="row">
      <div class="col s12">
        <!-- Modal Trigger -->
        <a class="waves-effect waves-light btn modal-trigger" href="#modal1">explanation</a>
        <!-- Modal Structure -->
        <div id="modal1" class="modal">
          <div class="modal-content">
            <h4>説明</h4>
            <p *ngFor="#text of texts">{{text}}</p>
            <h5>{{now | date:'yyyy-MM-dd HH:mm:ss'}}</h5>
          </div>
          <div class="modal-footer">
            <a class=" modal-action modal-close waves-effect waves-green btn-flat">OK</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AppModal {
  @Input() texts: string[];
  @Input() now: number;
}