//% color=#007F00 icon="\uf188" block="Calli:bot 2" weight=28
namespace callibot2 // callibot2.ts
/*
https://shop.knotech.de/calli-bot/244/calli-bot-2
*/ {
    const q_i2c_callibot_x22 = 0x22
    let q_i2c_callibot_connected: boolean // undefined

    //% group="Motor (0 .. 255)" subcategory="Fernsteuerung"
    //% block="Motoren %Calli2bot links %pPWM1 (0-255) %pRichtung1 rechts %pPWM2 %pRichtung2" weight=2
    //% pwm1.min=0 pwm1.max=255 pwm1.defl=128 pwm2.min=0 pwm2.max=255 pwm2.defl=128
    //% inlineInputMode=inline
    export function setMotoren(pwm1: number, pRichtung1: eDirection, pwm2: number, pRichtung2: eDirection) {
        if (between(pwm1, 0, 255) && between(pwm2, 0, 255))
            i2cWriteBuffer(Buffer.fromArray([eRegister.SET_MOTOR, eMotor.beide, pRichtung1, pwm1, pRichtung2, pwm2]))
        else // falscher Parameter -> beide Stop
            i2cWriteBuffer(Buffer.fromArray([eRegister.SET_MOTOR, eMotor.beide, 0, 0, 0, 0]))
    }




    function i2cWriteBuffer(bu: Buffer) {
        if (q_i2c_callibot_connected !== false) { // undefined oder true
            q_i2c_callibot_connected = pins.i2cWriteBuffer(q_i2c_callibot_x22, bu) == 0
        }
    }


    export function between(i0: number, i1: number, i2: number): boolean { return (i0 >= i1 && i0 <= i2) }

} // callibot2.ts
