import { Component, Input, Output, EventEmitter  } from '@angular/core';
/**
 * This class represents the navigation bar component.
 */
@Component({
  selector: 'app-click-edit',
  templateUrl: 'click-edit.component.html',
  styleUrls: ['click-edit.component.css']
})
export class ClickEditComponent {
    @Input() value: any;
    @Input() enabled: Boolean;
    @Output() valueChange: EventEmitter<any> = new EventEmitter();

    actif: Boolean = false;

    updateData(event: any) {
      this.value = event;
      this.valueChange.emit(event);
    }
    edit() {
        if (this.enabled) {
            this.actif = true;
            // TODO: nice to have focus input field
        }
    }
}
