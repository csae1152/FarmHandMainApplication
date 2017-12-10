/**
 * 
 */

angular
  .module('app')
  .factory('$exceptionHandler', function ($log) {
    var airbrake = new airbrakeJs.Client({
      projectId: 166985,
      projectKey: 'b291f40b4baa63a80df05be045a54260'
    });
    airbrake.addFilter(function (notice) {
      notice.context.environment = 'production';
      return notice;
    });

    return function (exception, cause) {
      $log.error(exception);
      airbrake.notify({error: exception, params: {angular_cause: cause}});
    };
  });


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