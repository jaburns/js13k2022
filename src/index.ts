import { csgSolidBake, csgSolidCube, csgSolidOpSubtract } from './csg';
import { gl_COLOR_BUFFER_BIT } from './glConsts'
import { inputsAdd, inputsConsumeFrame, inputsNew } from './inputs';
import { drawGame, shaderCompile } from './render';
import { main_vert, main_frag } from './shaders.gen';
import { gameStateLerp, gameStateNew, gameStateTick } from './state';
import { False, True } from './types';
import { sndOllie, zzfxP } from './zzfx';

declare const CC: HTMLCanvasElement
declare const G: WebGLRenderingContext
declare const k_tickMillis: number

let prevState = gameStateNew()
let curState = gameStateNew()

;[document.body, CC].map((elem: HTMLElement): void => {
    let style = elem.style
    style.overflow = 'hidden'
    style.margin = 0 as any
    style.width = '100%'
    style.height = '100%'
    style.cursor = 'pointer'
    style.imageRendering = 'pixelated'
})

window.onresize = () => {
    let w = window.innerWidth, h = window.innerHeight
    CC.width = w
    CC.height = h
    G.viewport(0, 0, w, h)
}

let accTime = 0
let prevNow = 0
let accTickInputs = inputsNew()

let frame = () => {
    requestAnimationFrame(frame)

    let newNow = performance.now()
    if (!prevNow) prevNow = newNow
    let dt = Math.min (newNow - prevNow, 1000)
    let frameInputs = inputsConsumeFrame()
    let didRunTick = False

    accTime += dt
    prevNow = newNow

    inputsAdd(accTickInputs, frameInputs)

    while (accTime > k_tickMillis) {
        didRunTick = True
        accTime -= k_tickMillis
        prevState = curState
        curState = gameStateTick(curState, accTickInputs)
        accTickInputs.mouseAccX = accTickInputs.mouseAccY = 0
    }
    if (didRunTick) {
        accTickInputs = inputsNew()
    }

    drawGame(accTickInputs, gameStateLerp(prevState, curState, accTime / k_tickMillis))

    G.clearColor(0,1,0,1)
    G.clear(gl_COLOR_BUFFER_BIT)

    if (Math.random() < 0.01) {
        zzfxP(sndOllie)
    }
}

let mesh0 = csgSolidCube([0,0,0], [1,1,1])
let mesh1 = csgSolidCube([1,1,1], [1,1,1])
let [vert, idx, sdfFn] = csgSolidBake(csgSolidOpSubtract(mesh0, mesh1))

let objFileLines = []
for(let i = 0; i < vert.length; i += 3) {
    objFileLines.push(`v ${vert[i]} ${vert[i+1]} ${vert[i+2]}`)
}
for(let i = 0; i < idx.length; i += 3) {
    objFileLines.push(`f ${idx[i]+1} ${idx[i+1]+1} ${idx[i+2]+1}`)
}

console.log(shaderCompile(main_vert, main_frag))
console.log(objFileLines.join('\n'))
console.log('XXX', sdfFn([1,1,1]), sdfFn([.01,.01,.01]))


frame()
