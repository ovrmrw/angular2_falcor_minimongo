import {AfterViewInit, AfterContentInit, OnInit, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
const falcor = require('falcor'); // import falcor from 'falcor';

export abstract class AppPageParent implements AfterViewInit, AfterContentInit, OnInit, OnDestroy {
  // private static _initializedJQueryPluginSelectors: string[] = [];
  // private get initializedJQueryPluginSelectors() {
  //   return AppPageParent._initializedJQueryPluginSelectors;
  // }
  // private set initializedJQueryPluginSelector(selector: string) {
  //   AppPageParent._initializedJQueryPluginSelectors.push(selector);
  // }

  private _disposableSubscriptions: Subscription[] = [];
  private get disposableSubscriptions() {
    return this._disposableSubscriptions;
  }
  protected set disposableSubscription(subscription: Subscription) {
    this._disposableSubscriptions.push(subscription);
  }

  constructor(private componentSelector: string) {
    //this.initPluginsAndObservables(this.componentSelector);
  }
  ngOnInit() {
    this.initPluginsAndObservables(this.componentSelector);
  }
  ngAfterContentInit() {
    //this.initPluginsAndObservables(this.componentSelector);
  }
  ngAfterViewInit() {
    //this.initPluginsAndObservables(this.componentSelector);
  }
  ngOnDestroy() {
    this.disposeSubscriptions(this.componentSelector);
  }

  private disposeSubscriptions(selector: string): void {
    console.log(`${selector} dispose subscriptions`);
    this.disposableSubscriptions.forEach(subscription => {
      if (!subscription.isUnsubscribed) {
        subscription.unsubscribe();
      }
    });
    this._disposableSubscriptions = void 0;
  }

  private initPluginsAndObservables(selector: string): void {
    console.log(`${selector} initPluginsAndObservables`);
    // if (lodash.indexOf(this.initializedJQueryPluginSelectors, selector) === -1) {
    //   this.initializableJQueryPlugins();
    //   this.initializedJQueryPluginSelector = selector;
    // }
    this.initializableJQueryPlugins();
    this.initializableEventObservables();
  }

  protected abstract initializableJQueryPlugins(): void;
  protected abstract initializableEventObservables(): void;
  
  // ここからFalcorのコード。
  private static _model = null;
  protected get model() {
    if(!AppPageParent._model){
      AppPageParent._model = new falcor.Model({ source: new falcor.HttpDataSource('/model.json') });
    } 
    return AppPageParent._model; 
  }
}