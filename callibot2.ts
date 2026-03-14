//% color=#007F00 icon="\uf188" block="Calli:bot 2" weight=28
namespace callibot2 // callibot2.ts
/*
https://shop.knotech.de/calli-bot/244/calli-bot-2
*/ {
    const q_i2c_callibot_x22 = 0x22
    let q_i2c_callibot_connected: boolean // undefined




    //% group="Motor (-100% .. 0 .. +100%)"
    //% block="Motoren links mit %pwm1 \\% rechts mit %pwm2 \\%" weight=8
    //% pwm1.shadow="speedPicker" pwm1.defl=0
    //% pwm2.shadow="speedPicker" pwm2.defl=0
    export function setMotoren2(pwm1: number, pwm2: number) {
        let richtung1 = (pwm1 < 0 ? eDirection.r : eDirection.v)
        let richtung2 = (pwm2 < 0 ? eDirection.r : eDirection.v)
        pwm1 = Math.trunc(Math.abs(pwm1) * 255 / 100)
        pwm2 = Math.trunc(Math.abs(pwm2) * 255 / 100)

        setMotoren(pwm1, richtung1, pwm2, richtung2)
    }

    //% group="Motor (-100% .. 0 .. +100%)"
    //% block="Motor %pMotor mit %pwm \\%" weight=7
    //% pwm.shadow="speedPicker" pwm.defl=0
    export function setMotor(pMotor: eMotor, pwm: number) {
        let richtung = (pwm < 0 ? eDirection.r : eDirection.v)
        pwm = Math.trunc(Math.abs(pwm) * 255 / 100)

        if (!between(pwm, 0, 255)) { // falscher Parameter -> beide Stop
            pMotor = eMotor.beide
            pwm = 0
        }

        if (pMotor == eMotor.beide)
            i2cWriteBuffer(Buffer.fromArray([eRegister.SET_MOTOR, pMotor, richtung, pwm, richtung, pwm]))
        else
            i2cWriteBuffer(Buffer.fromArray([eRegister.SET_MOTOR, pMotor, richtung, pwm]))
    }







    //% group="Motor (0 .. 255)" subcategory="Fernsteuerung"
    //% block="Motoren links %pPWM1 (0-255) %pRichtung1 rechts %pPWM2 %pRichtung2" weight=2
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
