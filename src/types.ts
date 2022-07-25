export type Bool = 0 | 1
export const False: Bool = 0
export const True: Bool = 1

export type Null = 0
export const Null: Null = 0

export let lerp = (a: number, b: number, t: number): number => a + t*(b-a)

export type Vec3 = Readonly<[number, number, number]>
export type Mat4 = Readonly<[
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
]>

// TODO replace usages with for loops and check compression
let range = (a: number, b: number): number[] =>
    (Array(b-a) as any).fill().map((_:any,i:number)=>i+a);

let v3Lift1 = (fn: (n: number) => number): (v: Vec3) => Vec3 => (v: Vec3): Vec3 =>
    v.map(fn) as any as Vec3
let v3Lift2 = (fn: (m: number, n: number) => number): (u: Vec3, v: Vec3) => Vec3 => (u: Vec3, v: Vec3): Vec3 =>
    u.map((x,i)=>fn(x,v[i])) as any as Vec3

export let v3Negate = ([x,y,z]: Vec3): Vec3 => [-x, -y, -z]
export let v3Add = ([x,y,z]: Vec3, [a,b,c]: Vec3): Vec3 => [x+a,y+b,z+c]
export let v3Sub = ([x,y,z]: Vec3, [a,b,c]: Vec3): Vec3 => [x-a,y-b,z-c]
export let v3Mul = ([x,y,z]: Vec3, s: number): Vec3 => [x*s,y*s,z*s]
export let v3Div = ([x,y,z]: Vec3, s: number): Vec3 => [x/s,y/s,z/s]

export let v3Abs = v3Lift1(Math.abs)
export let v3Max = v3Lift2(Math.max)
export let v3Min = v3Lift2(Math.min)

export let v3MulAdd = (a: Vec3, b: Vec3, s: number): Vec3 => a.map((x,i)=>x+s*b[i]) as any as Vec3
export let v3Lerp = (a: Vec3, b: Vec3, t: number): Vec3 => a.map((x,i)=>lerp(x,b[i],t)) as any as Vec3

export let v3Dot = ([x,y,z]: Vec3, [a,b,c]: Vec3): number => x*a + y*b + z*c
export let v3Cross = ([x,y,z]: Vec3, [a,b,c]: Vec3): Vec3 => [y*c - z*b, z*a - x*c, x*b - y*a]

export let v3SqrLength = (a: Vec3): number => v3Dot(a,a)
export let v3Length = (x: Vec3): number => Math.sqrt(v3SqrLength(x))
export let v3Normalize = (a: Vec3): Vec3 => v3Div(a, v3Length(a))

export let m4Perspective = (aspect: number, near: number, far: number): Mat4 => [
    // FOV = PI / 2
    1 / aspect, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, (far + near) / (near - far), -1,
    0, 0, (2 * far * near) / (near - far), 0
]

export let m4Mul = (a: Mat4, b: Mat4): Mat4 =>
    range(0,16).map((x,i,j:any) => (
        i=4*(x/4|0), j=x%4,
        b[i]*a[j] + b[i+1]*a[j+4] + b[i+2]*a[j+8] + b[i+3]*a[j+12]
    )) as any as Mat4