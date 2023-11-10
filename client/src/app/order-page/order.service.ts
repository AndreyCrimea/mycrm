import { Injectable } from '@angular/core';
import { Position, OrderPosition } from '../shared/interfaces';
import {
  MaterialInstance,
  MaterialService,
} from '../shared/classes/material.service';
@Injectable()
export class OrderService {
  public list: OrderPosition[] = [];
  public price = 0;

  add(position: Position) {
    const orderPosition: OrderPosition = Object.assign(
      {},
      {
        name: position.name,
        cost: position.cost,
        quantity: position.quantity,
        _id: position._id,
      }
    );

    const candidate = this.list.find((p) => p._id === position._id);

    if (candidate) {
      candidate.quantity += position.quantity;
    } else {
      this.list.push(orderPosition);
    }

    this.computePrice();
  }

  remove(orderPosition: OrderPosition) {
    const idx = this.list.findIndex((p) => p._id === orderPosition._id);
    this.list.splice(idx, 1);
    this.computePrice();
  }

  clear() {
    this.list = [];
    this.computePrice();
  }

  private computePrice() {
    this.price = this.list.reduce((total, item) => {
      return (total += item.quantity * item.cost);
    }, 0);
  }
}
