import { AnimationEvent } from '@angular/animations';
import { Component, OnInit, Inject, ChangeDetectionStrategy, ViewRef, ChangeDetectorRef } from '@angular/core';

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
export class ToastComponent implements OnInit {
  animationState: ToastAnimationState = 'default';
  private intervalId: number;

  constructor(
      readonly data: ToastData,
      readonly sRef: SomeRef,
      @Inject(TOAST_CONFIG_TOKEN) readonly toast: IToastConfig,
      @Inject(ChangeDetectorRef) readonly viewRef: ViewRef
  ) {
  }

  ngOnInit(): void {
    this.intervalId = setTimeout(() => this.animationState = 'closing', this.toast.duration);
  }

  ngOnDestroy(): void {
    clearTimeout(this.intervalId);
  }

  close(): void {
    this.sRef.close(this.viewRef);
  }

  onFadeFinished({ toState }: AnimationEvent): void {
    const isFadeOut = (toState as ToastAnimationState) === 'closing';
    const itFinished = this.animationState === 'closing';

    if (isFadeOut && itFinished && this.data.id) {
      this.close();
    }
  }

}
