import { AnimationEvent } from '@angular/animations';
import { Component, OnInit, OnDestroy } from '@angular/core';

import { ToastAnimationState, toastAnimations } from './toast.animation';
import { ToastRef } from './toast.ref';
import { ToastData } from './toast.type';


const TOAST_DEFAULT_TIMEOUT = 5000;

@Component({
  selector: 'mc-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  animations: [toastAnimations.toastState]
})
export class ToastComponent implements OnInit, OnDestroy {

  animationState: ToastAnimationState = 'default';

  // @ts-ignore
  private intervalId;

  constructor(
      readonly data: ToastData,
      readonly ref: ToastRef
  ) {
  }

  ngOnInit(): void {
    this.intervalId = setTimeout(() => this.animationState = 'closing', TOAST_DEFAULT_TIMEOUT);
  }

  ngOnDestroy(): void {
    clearTimeout(this.intervalId);
  }

  close(): void {
    this.ref.close();
  }

  onFadeFinished({ toState }: AnimationEvent): void {
    const isFadeOut = (toState as ToastAnimationState) === 'closing';
    const itFinished = this.animationState === 'closing';

    if (isFadeOut && itFinished) {
      this.close();
    }
  }

}
