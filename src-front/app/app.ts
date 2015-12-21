import {Component} from 'angular2/core'
import {Router, Route, RouteConfig, ROUTER_DIRECTIVES, Location} from 'angular2/router'
import {AppPage1} from '../page1/app-page1.component'
import {AppPage2} from '../page2/app-page2.component'
import {AppPage3} from '../page3/app-page3.component'
import {AppPage4} from '../page4/app-page4.component'

const COMPONENT_SELECTOR = 'my-app'
@Component({
  selector: COMPONENT_SELECTOR,
  template: `
    <nav>
      <div class="nav-wrapper">
        <a href="#" class="brand-logo right">Angular2 + Falcor</a>
        <ul id="nav-mobile" class="left hide-on-small-and-down">
          <li id="nav1" [class.active]="getLinkStyle('/p1')"><a [routerLink]="['/Page1']" class="waves-effect waves-light"><i class="material-icons left">info_outline</i>Page1</a></li>
          <li id="nav2" [class.active]="getLinkStyle('/p2')"><a [routerLink]="['/Page2']" class="waves-effect waves-light"><i class="material-icons left">input</i>Page2</a></li>
          <li id="nav3" [class.active]="getLinkStyle('/p3')"><a [routerLink]="['/Page3']" class="waves-effect waves-light"><i class="material-icons left">toc</i>Page3</a></li>
          <li id="nav4" [class.active]="getLinkStyle('/p4')"><a [routerLink]="['/Page4']" class="waves-effect waves-light"><i class="material-icons left">reorder</i>Page4</a></li>
        </ul>
      </div>
    </nav>
    <router-outlet></router-outlet>
    <footer class="page-footer">
      <div class="container">
        <div class="row">
          <div class="col l6 s12">
            <h5 class="white-text">Footer Content</h5>
            <p class="grey-text text-lighten-4">You can use rows and columns here to organize your footer content.</p>
          </div>
          <div class="col l4 offset-l2 s12">
            <h5 class="white-text">Links</h5>
            <ul>
              <li><a class="grey-text text-lighten-3" href="#!">Link 1</a></li>
              <li><a class="grey-text text-lighten-3" href="#!">Link 2</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="footer-copyright">
        <div class="container">
        © 2015 Copyright Text
        <a class="grey-text text-lighten-4 right" href="#!">More Links</a>
        </div>
      </div>
    </footer>
  `,
  directives: [AppPage1, AppPage2, AppPage3, AppPage4, ROUTER_DIRECTIVES]
})
@RouteConfig([
  new Route({ path: '/p1', component: AppPage1, name: 'Page1', useAsDefault: true }),
  new Route({ path: '/p2', component: AppPage2, name: 'Page2' }),
  new Route({ path: '/p3', component: AppPage3, name: 'Page3' }),
  new Route({ path: '/p4', component: AppPage4, name: 'Page4' }),
])
export class App {
  constructor(public location: Location, public router: Router) {
  }
  getLinkStyle(path: string): boolean {
    if (path === this.location.path()) {
      return true;
    }
    else if (path.length > 0) {
      return this.location.path().indexOf(path) > -1;
    }
  }
}