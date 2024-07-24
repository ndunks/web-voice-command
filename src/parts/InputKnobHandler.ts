const TWO_PI = 2 * Math.PI;

export default class InputKnobHandler {
    private rotator: HTMLDivElement
    private _angle: number
    private _rotations: number
    private _centerX: number
    private _centerY: number
    private _initialAngle: number
    private _attemptedAngle: number
    private _attemptedRotations: number
    private _initialTouchAngle: number
    private _touchY: number
    private _touchX: number
    private _attemptedValue: number
    private _previousAttemptedAngle: number


    constructor(private wrapper: HTMLDivElement,
        value = 0,
        private min = 0,
        private max = 1
    ) {
        this.rotator = wrapper.firstElementChild as HTMLDivElement;
        this.setValue(value)

        if ('PointerEvent' in window) {
            this.wrapper.addEventListener('pointerdown', this._onPointerdown);
        } else {
            this.wrapper.addEventListener('touchstart', this._onTouchstart);
            this.wrapper.addEventListener('mousedown', this._onMousedown);
        }
    }

    // init() {
    // }
    /** disconnectedCallback */
    destroy() {
        if ('PointerEvent' in window) {
            this.wrapper.removeEventListener('pointerdown', this._onPointerdown);
        } else {
            this.wrapper.removeEventListener('touchstart', this._onTouchstart);
            this.wrapper.removeEventListener('mousedown', this._onMousedown);
        }
    }
    onChange = (_value: number) => { }
    setValue(value: number) {
        this._angle = TWO_PI * (value % 1);
        this._rotations = Math.floor(value);
        this.rotator.style.setProperty('--angle', `${this._angle}rad`);
        this.onChange(value)

    }

    private _rotationStart = () => {
        window.oncontextmenu = () => { return false; };
        this._centerX = this.wrapper.offsetLeft - this.wrapper.scrollLeft + this.wrapper.clientLeft + this.wrapper.offsetWidth / 2;
        this._centerY = this.wrapper.offsetTop - this.wrapper.scrollTop + this.wrapper.clientTop + this.wrapper.offsetHeight / 2;
        this._initialAngle = this._angle;
        this._attemptedAngle = this._angle;
        this._attemptedRotations = this._rotations;
        this._initialTouchAngle = Math.atan2(
            this._touchY - this._centerY,
            this._touchX - this._centerX
        );

        // const evt = new Event('knob-move-start', { bubbles: true });
        // this.wrapper.dispatchEvent(evt);
    }

    private _rotationChange = () => {
        this._previousAttemptedAngle = this._attemptedAngle;
        this._attemptedAngle =
            this._initialAngle
            - this._initialTouchAngle
            + Math.atan2(this._touchY - this._centerY, this._touchX - this._centerX);
        this._attemptedAngle = (this._attemptedAngle + TWO_PI) % TWO_PI;

        if (this.max !== null && this.min !== null) {
            if (this._attemptedAngle < 1.57 && this._previousAttemptedAngle > 4.71) {
                this._attemptedRotations++;
            } else if (this._previousAttemptedAngle < 1.57 && this._attemptedAngle > 4.71) {
                this._attemptedRotations--;
            }
        }

        this._attemptedValue = (this._attemptedAngle / TWO_PI) + this._attemptedRotations;

        if (
            (this.min === null || this._attemptedValue >= this.min) &&
            (this.max === null || this._attemptedValue <= this.max)
        ) {
            this._angle = this._attemptedAngle;
            this._rotations = this._attemptedRotations;
            this.setValue(this._attemptedValue)
        } else if (this._attemptedValue < this.min) {
            this.setValue(this.min)
        } else if (this._attemptedValue > this.max) {
            this.setValue(this.max)
        }

        // const evt = new Event('knob-move-change', { bubbles: true });
        // this.wrapper.dispatchEvent(evt);
    }

    private _rotationEnd = () => {
        window.oncontextmenu = null;
        // const evt = new Event('knob-move-end', { bubbles: true });
        // this.wrapper.dispatchEvent(evt);
    }

    private _onPointerdown = (e: PointerEvent) => {
        e.preventDefault();
        this._touchX = e.clientX;
        this._touchY = e.clientY;

        this._rotationStart();

        this.wrapper.setPointerCapture(e.pointerId);
        this.wrapper.addEventListener('pointermove', this._onPointermove);
        this.wrapper.addEventListener('pointerup', this._onPointerup);
        this.wrapper.addEventListener('pointercancel', this._onPointerup);
    }

    private _onPointermove = (e: PointerEvent) => {
        e.preventDefault();
        this._touchX = e.clientX;
        this._touchY = e.clientY;
        this._rotationChange();
    }

    private _onPointerup = (e: PointerEvent) => {
        e.preventDefault();
        this._rotationEnd();
        this.wrapper.releasePointerCapture(e.pointerId);
        this.wrapper.removeEventListener('pointermove', this._onPointermove);
        this.wrapper.removeEventListener('pointerup', this._onPointerup);
        this.wrapper.removeEventListener('pointercancel', this._onPointerup);
    }

    private _onMousedown = (e: MouseEvent) => {
        this._touchX = e.clientX;
        this._touchY = e.clientY;
        this._rotationStart();
        document.addEventListener('mousemove', this._onMousemove);
        document.addEventListener('mouseup', this._onMouseup);
    }

    private _onMousemove = (e: MouseEvent) => {
        e.preventDefault();
        this._touchX = e.clientX;
        this._touchY = e.clientY;
        this._rotationChange();
    }

    private _onMouseup = (e: MouseEvent) => {
        e.preventDefault();
        document.removeEventListener('mousemove', this._onMousemove);
        document.removeEventListener('mouseup', this._onMouseup);
        this._rotationEnd();
    }

    private _onTouchstart = (e: TouchEvent) => {
        e.preventDefault();
        this._touchX = e.changedTouches[0].clientX;
        this._touchY = e.changedTouches[0].clientY;
        this._rotationStart();
        this.wrapper.addEventListener('touchmove', this._onTouchmove);
        this.wrapper.addEventListener('touchend', this._onTouchend);
        this.wrapper.addEventListener('touchcancel', this._onTouchend);
    }

    private _onTouchmove = (e: TouchEvent) => {
        e.preventDefault();
        this._touchX = e.targetTouches[0].clientX;
        this._touchY = e.targetTouches[0].clientY;
        this._rotationChange();
    }

    private _onTouchend = (e: TouchEvent) => {
        e.preventDefault();
        this.wrapper.removeEventListener('touchmove', this._onTouchmove);
        this.wrapper.removeEventListener('touchend', this._onTouchend);
        this.wrapper.removeEventListener('touchcancel', this._onTouchend);
        this._rotationEnd();
    }
}