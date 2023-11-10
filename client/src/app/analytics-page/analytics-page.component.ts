import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { AnalyticsService } from '../shared/services/analytics.service';
import { AnalyticsPage } from '../shared/interfaces';
import { Subscription } from 'rxjs';
import { OnDestroy } from '@angular/core';

import {
  Chart,
  ChartConfiguration,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  ChartType,
  CategoryScale,
} from 'chart.js';

@Component({
  selector: 'app-analytics-page',
  templateUrl: './analytics-page.component.html',
  styleUrls: ['./analytics-page.component.scss'],
})
export class AnalyticsPageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gain') gainRef: ElementRef;
  @ViewChild('order') orderRef: ElementRef;

  aSub$: Subscription;
  average: number;
  pending = true;
  lineChartType: ChartType = 'line';

  constructor(private service: AnalyticsService) {}

  ngAfterViewInit(): void {
    Chart.register(
      LineController,
      LineElement,
      PointElement,
      LinearScale,
      CategoryScale,
      Title
    );
    const gainConfig: any = {
      label: 'Выручка',
      color: 'rgb(255, 99, 132)',
    };
    const orderConfig: any = {
      label: 'Выручка',
      color: 'rgb(54, 162, 235)',
    };

    this.aSub$ = this.service
      .getAnalytics()
      .subscribe((data: AnalyticsPage) => {
        console.log(data);
        this.average = data.average;

        gainConfig.labels = data.chart.map((item) => item.label);
        gainConfig.data = data.chart.map((item) => item.gain);

        orderConfig.labels = data.chart.map((item) => item.label);
        orderConfig.data = data.chart.map((item) => item.order);

        const gainCtx = this.gainRef.nativeElement.getContext('2d');
        const orderCtx = this.orderRef.nativeElement.getContext('2d');
        gainCtx.canvas.height = '300px';
        orderCtx.canvas.height = '300px';

        new Chart(gainCtx, this.createChartConfig(gainConfig));
        new Chart(orderCtx, this.createChartConfig(orderConfig));

        this.pending = false;
      });
  }

  ngOnDestroy(): void {
    if (this.aSub$) this.aSub$.unsubscribe();
  }

  createChartConfig({ label, color, labels, data }) {
    return {
      type: this.lineChartType,
      options: {
        responsive: true,
      },
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            borderColor: color,
            steppedLine: false,
            fill: false,
          },
        ],
      },
    };
  }
}
