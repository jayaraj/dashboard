import { PromiseWrapper } from 'angular2/src/facade/async';
export class Rectangle {
    constructor(left, top, width, height) {
        this.left = left;
        this.right = left + width;
        this.top = top;
        this.bottom = top + height;
        this.height = height;
        this.width = width;
    }
}
export class Ruler {
    constructor(domAdapter) {
        this.domAdapter = domAdapter;
    }
    measure(el) {
        var clntRect = this.domAdapter.getBoundingClientRect(el.nativeElement);
        // even if getBoundingClientRect is synchronous we use async API in preparation for further
        // changes
        return PromiseWrapper.resolve(new Rectangle(clntRect.left, clntRect.top, clntRect.width, clntRect.height));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcGxhdGZvcm0vYnJvd3Nlci9ydWxlci50cyJdLCJuYW1lcyI6WyJSZWN0YW5nbGUiLCJSZWN0YW5nbGUuY29uc3RydWN0b3IiLCJSdWxlciIsIlJ1bGVyLmNvbnN0cnVjdG9yIiwiUnVsZXIubWVhc3VyZSJdLCJtYXBwaW5ncyI6Ik9BQU8sRUFBVSxjQUFjLEVBQUMsTUFBTSwyQkFBMkI7QUFJakU7SUFPRUEsWUFBWUEsSUFBSUEsRUFBRUEsR0FBR0EsRUFBRUEsS0FBS0EsRUFBRUEsTUFBTUE7UUFDbENDLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBO1FBQ2pCQSxJQUFJQSxDQUFDQSxLQUFLQSxHQUFHQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUMxQkEsSUFBSUEsQ0FBQ0EsR0FBR0EsR0FBR0EsR0FBR0EsQ0FBQ0E7UUFDZkEsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsR0FBR0EsR0FBR0EsTUFBTUEsQ0FBQ0E7UUFDM0JBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLE1BQU1BLENBQUNBO1FBQ3JCQSxJQUFJQSxDQUFDQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQTtJQUNyQkEsQ0FBQ0E7QUFDSEQsQ0FBQ0E7QUFFRDtJQUVFRSxZQUFZQSxVQUFzQkE7UUFBSUMsSUFBSUEsQ0FBQ0EsVUFBVUEsR0FBR0EsVUFBVUEsQ0FBQ0E7SUFBQ0EsQ0FBQ0E7SUFFckVELE9BQU9BLENBQUNBLEVBQWNBO1FBQ3BCRSxJQUFJQSxRQUFRQSxHQUFRQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxxQkFBcUJBLENBQUNBLEVBQUVBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBO1FBRTVFQSwyRkFBMkZBO1FBQzNGQSxVQUFVQTtRQUNWQSxNQUFNQSxDQUFDQSxjQUFjQSxDQUFDQSxPQUFPQSxDQUN6QkEsSUFBSUEsU0FBU0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsRUFBRUEsUUFBUUEsQ0FBQ0EsR0FBR0EsRUFBRUEsUUFBUUEsQ0FBQ0EsS0FBS0EsRUFBRUEsUUFBUUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDbkZBLENBQUNBO0FBQ0hGLENBQUNBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1Byb21pc2UsIFByb21pc2VXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7RG9tQWRhcHRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9kb21fYWRhcHRlcic7XG5pbXBvcnQge0VsZW1lbnRSZWZ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9lbGVtZW50X3JlZic7XG5cbmV4cG9ydCBjbGFzcyBSZWN0YW5nbGUge1xuICBsZWZ0O1xuICByaWdodDtcbiAgdG9wO1xuICBib3R0b207XG4gIGhlaWdodDtcbiAgd2lkdGg7XG4gIGNvbnN0cnVjdG9yKGxlZnQsIHRvcCwgd2lkdGgsIGhlaWdodCkge1xuICAgIHRoaXMubGVmdCA9IGxlZnQ7XG4gICAgdGhpcy5yaWdodCA9IGxlZnQgKyB3aWR0aDtcbiAgICB0aGlzLnRvcCA9IHRvcDtcbiAgICB0aGlzLmJvdHRvbSA9IHRvcCArIGhlaWdodDtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFJ1bGVyIHtcbiAgZG9tQWRhcHRlcjogRG9tQWRhcHRlcjtcbiAgY29uc3RydWN0b3IoZG9tQWRhcHRlcjogRG9tQWRhcHRlcikgeyB0aGlzLmRvbUFkYXB0ZXIgPSBkb21BZGFwdGVyOyB9XG5cbiAgbWVhc3VyZShlbDogRWxlbWVudFJlZik6IFByb21pc2U8UmVjdGFuZ2xlPiB7XG4gICAgdmFyIGNsbnRSZWN0ID0gPGFueT50aGlzLmRvbUFkYXB0ZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KGVsLm5hdGl2ZUVsZW1lbnQpO1xuXG4gICAgLy8gZXZlbiBpZiBnZXRCb3VuZGluZ0NsaWVudFJlY3QgaXMgc3luY2hyb25vdXMgd2UgdXNlIGFzeW5jIEFQSSBpbiBwcmVwYXJhdGlvbiBmb3IgZnVydGhlclxuICAgIC8vIGNoYW5nZXNcbiAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZShcbiAgICAgICAgbmV3IFJlY3RhbmdsZShjbG50UmVjdC5sZWZ0LCBjbG50UmVjdC50b3AsIGNsbnRSZWN0LndpZHRoLCBjbG50UmVjdC5oZWlnaHQpKTtcbiAgfVxufVxuIl19