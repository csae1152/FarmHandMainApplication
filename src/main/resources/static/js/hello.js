/**
 * 
 */

var AppComponent = ng.core.Component({
    selector : 'app',
    template : '<p>The ID is {{greeting.id}}</p><p>The content is {{greeting.content}}</p>{{farmhand.name}}'
}).Class({
    constructor : function() {
        this.greeting = {id:'XYZ', content:'Hello World'};
        this.farmhand = {name: 'FarmHand'};
    }
});

var AppModule = ng.core.NgModule({
    imports: [ng.platformBrowser.BrowserModule],
    declarations: [AppComponent],
    bootstrap: [AppComponent]
  }).Class({constructor : function(){}})

document.addEventListener('DOMContentLoaded', function() {
    ng.platformBrowserDynamic.platformBrowserDynamic().bootstrapModule(AppModule);
});