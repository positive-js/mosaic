import { AnimationEvent } from '@angular/animations';
import { Component, Inject, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';

import { ContainerRef } from './container.ref';
import { ToastAnimationState, toastAnimations } from './toast.animation';
import { ToastData, IToastConfig, TOAST_CONFIG_TOKEN } from './toast.type';


@Component({
  selector: 'mc-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  animations: [toastAnimations.toastState],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastComponent implements AfterViewInit {
  animationState: ToastAnimationState = 'default';
  index: number;
  private intervalId: number;

  constructor(
      readonly data: ToastData,
      readonly sRef: ContainerRef,
      @Inject(TOAST_CONFIG_TOKEN) readonly toast: IToastConfig
  ) {
  }

  ngAfterViewInit(): void {
    this.intervalId = setTimeout(() => this.animationState = 'closing', this.toast.duration);
  }

  ngOnDestroy(): void {
    clearTimeout(this.intervalId);
  }

  close(): void {
    this.sRef.close(this.index);
  }

  onFadeFinished({ toState }: AnimationEvent): void {
    const isFadeOut = (toState as ToastAnimationState) === 'closing';
    const itFinished = this.animationState === 'closing';

    console.log('finished');

    if (isFadeOut && itFinished) {
      this.close();
    }
  }

}
