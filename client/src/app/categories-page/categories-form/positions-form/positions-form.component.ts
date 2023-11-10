import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { PositionService } from 'src/app/shared/services/positions.service';
import { Position } from '../../../shared/interfaces';
import { OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {
  MaterialInstance,
  MaterialService,
} from 'src/app/shared/classes/material.service';

@Component({
  selector: 'app-positions-form',
  templateUrl: './positions-form.component.html',
  styleUrls: ['./positions-form.component.scss'],
})
export class PositionsFormComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @Input('categoryId') categoryId: string;
  @ViewChild('modal') modalRef: ElementRef;
  modal: MaterialInstance;
  form: FormGroup;
  positions: Position[] = [];
  loading = false;

  positionId = null;

  constructor(private positionService: PositionService) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl(null, Validators.required),
      cost: new FormControl(null, [Validators.required, Validators.min(1)]),
    });

    this.loading = true;
    this.positionService.fetch(this.categoryId).subscribe((positions) => {
      this.positions = positions;
      this.loading = false;
    });
  }

  ngAfterViewInit(): void {
    this.modal = MaterialService.initModal(this.modalRef);
  }

  ngOnDestroy(): void {
    this.modal.destroy();
  }

  onSelectPosition(position: Position) {
    this.positionId = position._id;
    this.form.patchValue({
      name: position.name,
      cost: position.cost,
    });
    this.modal.open();
    MaterialService.updateTextInputs();
  }

  onAddPosition() {
    this.form.reset({ name: null, cost: null });
    this.modal.open();
    this.positionId = null;
    MaterialService.updateTextInputs();
  }

  onCancel() {
    this.modal.close();
    this.positionId = null;
  }

  onSubmit() {
    this.form.disable();

    const newPosition: Position = {
      name: this.form.value.name,
      cost: this.form.value.cost,
      category: this.categoryId,
    };

    const completed = () => {
      this.modal.close();
      this.form.enable();
      this.form.reset({
        name: '',
        cost: null,
      });
    };

    if (this.positionId) {
      newPosition._id = this.positionId;
      this.positionService.update(newPosition).subscribe(
        (position) => {
          const idx = this.positions.findIndex((p) => p._id === position._id);
          this.positions[idx] = position;
          MaterialService.toast(
            `Позиция изменена "${position.name}" с ценой ${position.cost} руб.`
          );
        },
        (error) => MaterialService.toast(error.error.message),
        completed
      );
    } else {
      this.positionService.create(newPosition).subscribe(
        (position) => {
          MaterialService.toast(
            `Позиция "${position.name}" с ценой ${position.cost} руб. создана`
          );
          this.positions.push(position);
        },
        (error) => MaterialService.toast(error.error.message),
        completed
      );
    }
  }

  onDeletePosition(event: Event, position: Position) {
    event.stopPropagation();
    const decision = window.confirm(
      `Удалить позицию "${position.name}" с ценой ${position.cost} руб.?`
    );

    if (decision) {
      this.positionService.delete(position).subscribe(
        (response) => {
          const idx = this.positions.findIndex((p) => p._id === position._id);
          this.positions.splice(idx, 1);
          MaterialService.toast(response.message);
        },
        (error) => {
          MaterialService.toast(error.error.message);
        }
      );
    }
  }
}
