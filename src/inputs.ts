import { Bool, False, True } from "./global";

declare const CC: HTMLCanvasElement
declare const DEBUG: boolean;

export interface InputsFrame {
    mouseAccX: number
    mouseAccY: number
    keysDown: Record<string, Bool>,
}

let newInputsFrame = (): InputsFrame => ({
    mouseAccX: 0,
    mouseAccY: 0,
    keysDown: {},
})

let frame: InputsFrame = newInputsFrame()

let lastMouseDx = 0
let lastMouseDy = 0

let handleMouseMoveEvent = (dx: number, dy: number): void => {
    if (dx*dx > 10000 && dx * lastMouseDx < 0 || dy*dy > 10000 && dy * lastMouseDy < 0) {
        return
    }
    lastMouseDx = dx
    lastMouseDy = dy
    frame.mouseAccX += dx
    frame.mouseAccY += dy
}

if ((window as any).onpointerrawupdate !== undefined) {
    (window as any).onpointerrawupdate = (es: PointerEvent): void => {
        for (let e of es.getCoalescedEvents()) {
            handleMouseMoveEvent(e.movementX, e.movementY)
        }
    }
} else {
    window.onmousemove = (e: MouseEvent): void => {
        handleMouseMoveEvent(e.movementX, e.movementY)
    }
}

document.onmousedown = (e: MouseEvent) => {
    if (document.pointerLockElement !== CC) {
        CC.requestPointerLock()
    } else {
        frame.keysDown['_'+e.button] = True
    }
}

document.onmouseup = (e: MouseEvent) => {
    frame.keysDown['_'+e.button] = False
}

document.onkeydown = (e: KeyboardEvent) => {
    if (DEBUG) {
        if (e.repeat) return false
        frame.keysDown[e.code] = 1
        return !e.code.startsWith('Arrow') && e.code !== 'Space' && e.code !== 'Tab'
    } else {
        frame.keysDown[e.code] = 1
        return false
    }
}

document.onkeyup = (e: KeyboardEvent) => {
    frame.keysDown[e.code] = 0
}

export let inputsConsumeFrame = (): InputsFrame => {
    if (document.pointerLockElement === CC) {
        let outFrame = frame
        frame = newInputsFrame()
        for (let k in outFrame.keysDown) {
            frame.keysDown[k] = outFrame.keysDown[k]
        }
        return outFrame
    }
    return newInputsFrame()
}
