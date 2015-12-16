import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operator/map';
var obs = new Observable(obs => {
    var i = 0;
    setInterval(_ => obs.next(++i), 1000);
});
map.call(obs, i => `${i} seconds elapsed`).subscribe(msg => console.log(msg));
// #enddocregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JzZXJ2YWJsZV9wdXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvZXhhbXBsZXMvZmFjYWRlL3RzL2FzeW5jL29ic2VydmFibGVfcHVyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiT0FDTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGlCQUFpQjtPQUNuQyxFQUFDLEdBQUcsRUFBQyxNQUFNLG1CQUFtQjtBQUVyQyxJQUFJLEdBQUcsR0FBRyxJQUFJLFVBQVUsQ0FBQyxHQUFHO0lBQzFCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNWLFdBQVcsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3hDLENBQUMsQ0FBQyxDQUFDO0FBQ0gsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzlFLGdCQUFnQiIsInNvdXJjZXNDb250ZW50IjpbIi8vICNkb2NyZWdpb24gT2JzZXJ2YWJsZVxuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICdyeGpzL09ic2VydmFibGUnO1xuaW1wb3J0IHttYXB9IGZyb20gJ3J4anMvb3BlcmF0b3IvbWFwJztcblxudmFyIG9icyA9IG5ldyBPYnNlcnZhYmxlKG9icyA9PiB7XG4gIHZhciBpID0gMDtcbiAgc2V0SW50ZXJ2YWwoXyA9PiBvYnMubmV4dCgrK2kpLCAxMDAwKTtcbn0pO1xubWFwLmNhbGwob2JzLCBpID0+IGAke2l9IHNlY29uZHMgZWxhcHNlZGApLnN1YnNjcmliZShtc2cgPT4gY29uc29sZS5sb2cobXNnKSk7XG4vLyAjZW5kZG9jcmVnaW9uXG4iXX0=