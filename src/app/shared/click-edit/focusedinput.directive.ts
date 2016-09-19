import { Directive, Renderer, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector : 'input'
})
export class FocusedInputDirective implements OnInit{
  constructor(
      private renderer: Renderer,
      private elementRef: ElementRef) {}

  ngOnInit() {
    this.renderer.invokeElementMethod(this.elementRef.nativeElement, 'focus', []);
  }
}
