import { AnimationEvent } from '@angular/animations';
import { Component, OnInit, OnDestroy, Inject, ChangeDetectionStrategy } from '@angular/core';

import { SomeRef } from './some.ref';
import { ToastAnimationState, toastAnimations } from './toast.animation';
import { ToastData, IToastConfig, TOAST_CONFIG_TOKEN } from './toast.type';


@Component({
  selector: 'mc-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  animations: [toastAnimations.toastState],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastComponent implements OnInit, OnDestroy {
  animationState: ToastAnimationState = 'default';
  private intervalId: number;

  constructor(
      readonly data: ToastData,
      readonly sRef: SomeRef,
      @Inject(TOAST_CONFIG_TOKEN) readonly toast: IToastConfig
  ) {
  }

  ngOnInit(): void {
    this.intervalId = setTimeout(() => this.animationState = 'closing', this.toast.duration);
  }

  ngOnDestroy(): void {
    clearTimeout(this.intervalId);
  }

  close(id: number): void {
    this.sRef.close(id);
  }

  onFadeFinished({ toState }: AnimationEvent): void {
    const isFadeOut = (toState as ToastAnimationState) === 'closing';
    const itFinished = this.animationState === 'closing';

    if (isFadeOut && itFinished) {
      this.close(this.data.id || 0);
    }
  }

}
