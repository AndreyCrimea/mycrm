import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { PositionService } from 'src/app/shared/services/positions.service';
import { Observable } from 'rxjs';
import { Position } from 'src/app/shared/interfaces';
import { map, switchMap } from 'rxjs/operators';
import { OrderService } from '../order.service';
import { MaterialService } from 'src/app/shared/classes/material.service';

@Component({
  selector: 'app-order-positions',
  templateUrl: './order-positions.component.html',
  styleUrls: ['./order-positions.component.scss'],
})
export class OrderPositionsComponent implements OnInit {
  positions$: Observable<Position[]>;

  constructor(
    private route: ActivatedRoute,
    private positionService: PositionService,
    private order: OrderService
  ) {}

  ngOnInit(): void {
    this.positions$ = this.route.params.pipe(
      switchMap((params: Params) => {
        return this.positionService.fetch(params['id']);
      }),
      map((positions: Position[]) => {
        return positions.map((pos) => {
          pos.quantity = 1;
          return pos;
        });
      })
    );
  }

  addToOrder(position: Position) {
    this.order.add(position);
    MaterialService.toast(
      `Добавленна позиция "${position.name}" с ценой ${position.cost} руб. в количестве ${position.quantity} шт.`
    );
  }
}
