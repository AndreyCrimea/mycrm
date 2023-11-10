import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { OrderService } from './order.service';
import { OrderPosition, Order } from '../shared/interfaces';
import {
  MaterialService,
  MaterialInstance,
} from '../shared/classes/material.service';
import { OrdersService } from '../shared/services/orders.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-order-page',
  templateUrl: './order-page.component.html',
  styleUrls: ['./order-page.component.scss'],
  providers: [OrderService],
})
export class OrderPageComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('modal') modalRef: ElementRef;
  modal: MaterialInstance;
  isRoot: boolean;
  pending = false;
  oSub: Subscription;

  constructor(
    private router: Router,
    public order: OrderService,
    private ordersService: OrdersService
  ) {}

  ngOnInit(): void {
    this.isRoot = this.router.url === '/order';
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isRoot = this.router.url === '/order';
      }
    });
  }

  ngAfterViewInit(): void {
    this.modal = MaterialService.initModal(this.modalRef);
  }

  ngOnDestroy(): void {
    this.modal.destroy();
    if (this.oSub) {
      this.oSub.unsubscribe();
    }
  }

  open() {
    this.modal.open();
  }

  cancel() {
    this.modal.close();
  }

  submit() {
    this.pending = true;
    const order: Order = {
      list: this.order.list.map((item) => {
        delete item._id;
        return item;
      }),
    };

    this.oSub = this.ordersService.create(order).subscribe(
      (newOrder) => {
        MaterialService.toast(`Заказ №${newOrder.order} был добавлен`);
        this.order.clear();
      },
      (error) => {
        MaterialService.toast(error.error.message);
      },
      () => {
        this.modal.close();
        this.pending = false;
      }
    );
  }

  removePosition(orderPosition: OrderPosition) {
    this.order.remove(orderPosition);

    MaterialService.toast(
      `Удалена из заказа позиция "${orderPosition.name}" с ценой ${orderPosition.cost} руб. в количестве ${orderPosition.quantity} шт.`
    );
  }
}
