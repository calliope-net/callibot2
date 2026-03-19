//% color=#007F00 icon="\uf188" block="Calli:bot 2" weight=28
namespace callibot2 // callibot2.ts
/*
https://shop.knotech.de/calli-bot/244/calli-bot-2

https://github.com/calliope-net/callibot/blob/master/2021-11-12a_Callibot2_Software-Infos.pdf

*/ {
    const q_i2c_callibot_x22 = 0x22
    let q_i2c_callibot_connected: boolean // undefined
    let q_leds = [0, 0, 0, 0, 0, 0, 0, 0, 0] // LED Wert in Register 0x03 merken zum blinken

    let q_richtung1 = eDirection.v // 1 linker Motor; 3 beide
    export let q_pwm1 = 0
    let q_richtung2 = eDirection.v // 2 rechter Motor
    export let q_pwm2 = 0


    // ========== group="I²C 0x22" 

    //% group="I²C 0x22" 
    //% block="Reset (alles aus: Motoren, LEDs)" weight=5
    export function reset_outputs() {
        i2cWriteBuffer(Buffer.fromArray([eRegister.RESET_OUTPUTS]))
        q_pwm1 = 0
        q_pwm2 = 0
    }

    //% group="I²C 0x22" 
    //% block="Calli:bot 2 angeschlossen ?" weight=3
    export function is_connected() {
        if (q_i2c_callibot_connected)
            return true
        else if (q_i2c_callibot_connected === undefined) // nicht false
            read_typ() // testet i2cWriteReadBuffer
        return q_i2c_callibot_connected
    }



    // ========== group="Motoren (-100% .. 0 .. +100%)"

    //% group="Motoren (-100% .. 0 .. +100%)"
    //% block="Motoren links %prozent1 \\% rechts %prozent2 \\%" weight=8
    //% prozent1.shadow="speedPicker" prozent1.defl=0
    //% prozent2.shadow="speedPicker" prozent2.defl=0
    export function write_motoren_prozent(prozent1: number, prozent2: number) {
        write_motoren(
            Math.trunc(Math.abs(prozent1) * 255 / 100),
            (prozent1 < 0 ? eDirection.r : eDirection.v),
            Math.trunc(Math.abs(prozent2) * 255 / 100),
            (prozent2 < 0 ? eDirection.r : eDirection.v)
        )
    }

    //% group="Motoren (-100% .. 0 .. +100%)"
    //% block="Motor %motor %prozent \\%" weight=7
    //% prozent.shadow="speedPicker" prozent.defl=0
    export function write_motor_prozent(motor: eMotor, prozent: number) {
        write_motor(
            motor,
            Math.trunc(Math.abs(prozent) * 255 / 100),
            (prozent < 0 ? eDirection.r : eDirection.v)
        )
    }

    //% group="Motoren (-100% .. 0 .. +100%)"
    //% block="fahre %sekunden Sekunden" weight=6
    //% sekunden.shadow=callibot2_ePause
    export function wait_motor(sekunden: number) {
        if (q_pwm1 > 0 || q_pwm2 > 0) { // mindestens 1 Motor dreht sich
            basic.pause(sekunden * 1000)
            write_motor(eMotor.beide, 0, eDirection.v) // setzt q_pwm1 und q_pwm2 auf 0
        }
    }


    // ========== group="I²C Register Motoren (0 .. 128 .. 255)" advanced=true

    //% group="I²C Register Motoren (0 .. 128 .. 255)" advanced=true
    //% block="Motor %eMotor %pwm %richtung" weight=3
    //% pwm.min=0 pwm.max=255 pwm.defl=128
    //% inlineInputMode=inline
    export function write_motor(motor: eMotor, pwm: number, richtung: eDirection) {
        if (between(pwm, 0, 255)) {
            if (motor == eMotor.m1) { // 1 linker Motor
                if (q_richtung1 != richtung || q_pwm1 != pwm) {
                    q_richtung1 = richtung
                    q_pwm1 = pwm
                    i2cWriteBuffer(Buffer.fromArray([eRegister.SET_MOTOR, motor, richtung, pwm]))
                }
            } else if (motor == eMotor.m2) { // 2 rechter Motor
                if (q_richtung2 != richtung || q_pwm2 != pwm) {
                    q_richtung2 = richtung
                    q_pwm2 = pwm
                    i2cWriteBuffer(Buffer.fromArray([eRegister.SET_MOTOR, motor, richtung, pwm]))
                }
            } else { // beide Motoren
                write_motoren(pwm, richtung, pwm, richtung)
            }
        } else // falscher Parameter -> beide Stop
            write_motoren(0, eDirection.v, 0, eDirection.v)
    }

    //% group="I²C Register Motoren (0 .. 128 .. 255)" advanced=true
    //% block="Motoren links %pwm1 %richtung1 rechts %pwm2 %richtung2" weight=2
    //% pwm1.min=0 pwm1.max=255 pwm1.defl=128 pwm2.min=0 pwm2.max=255 pwm2.defl=128
    //% inlineInputMode=inline
    export function write_motoren(pwm1: number, richtung1: eDirection, pwm2: number, richtung2: eDirection) {
        if (between(pwm1, 0, 255) && between(pwm2, 0, 255)) {
            if (q_richtung1 != richtung1 || q_pwm1 != pwm1 || q_richtung2 != richtung2 || q_pwm2 != pwm2) {
                q_richtung1 = richtung1
                q_pwm1 = pwm1
                q_richtung2 = richtung2
                q_pwm2 = pwm2
                i2cWriteBuffer(Buffer.fromArray([eRegister.SET_MOTOR, eMotor.beide, richtung1, pwm1, richtung2, pwm2]))
            } //else { }
        } else // falscher Parameter -> beide Stop
            write_motoren(0, eDirection.v, 0, eDirection.v)
    }



    // ========== group="LED"

    //% group="LED"
    //% block="4 RGB LED %color || ↖ %lv ↙ %lh ↘ %rh ↗ %rv blinken %blink" weight=7
    //% color.shadow="callibot2_colorPicker"
    //% lv.shadow="toggleOnOff" lh.shadow="toggleOnOff" rh.shadow="toggleOnOff" rv.shadow="toggleOnOff"
    //% lv.defl=true lh.defl=true rh.defl=true rv.defl=true
    //% blink.shadow="toggleYesNo"
    //% inlineInputMode=inline expandableArgumentMode="toggle"
    export function write_rgbled(color: number, lv = true, lh = true, rh = true, rv = true, blink = false) {
        //basic.showString(lv.toString())
        let buffer = Buffer.create(5)
        buffer[0] = eRegister.SET_LED
        buffer.setNumber(NumberFormat.UInt32BE, 1, color) // [1]=0 [2]=r [3]=g [4]=b
        buffer[2] = buffer[2] >>> 4 // durch 16, gültige rgb Werte für callibot: 0-15
        buffer[3] = buffer[3] >>> 4
        buffer[4] = buffer[4] >>> 4

        if (lv) write_rgbled1(eRgbLed.LV, buffer, blink)
        if (lh) write_rgbled1(eRgbLed.LH, buffer, blink)
        if (rh) write_rgbled1(eRgbLed.RH, buffer, blink)
        if (rv) write_rgbled1(eRgbLed.RV, buffer, blink)
    }


    // blinken
    function write_rgbled1(rgbled: eRgbLed, buffer: Buffer, blink: boolean) {
        if (blink && q_leds[rgbled] == buffer.getNumber(NumberFormat.UInt32BE, 1))
            buffer.setNumber(NumberFormat.UInt32BE, 1, 0) // alle Farben aus
        q_leds[rgbled] = buffer.getNumber(NumberFormat.UInt32BE, 1)
        buffer[1] = rgbled // Led-Index 1,2,3,4 für RGB
        i2cWriteBuffer(buffer)
        basic.pause(10) // ms
    }


    //% group="LED"
    //% block="LED %led %on || blinken %blink Helligkeit %pwm" weight=2
    //% on.shadow="toggleOnOff"
    //% blink.shadow="toggleYesNo"
    //% pwm.min=1 pwm.max=16 pwm.defl=16
    //% inlineInputMode=inline 
    export function write_led(led: eLed, on: boolean, blink = false, pwm?: number) {
        if (!on)
            pwm = 0 // LED aus schalten
        else if (!between(pwm, 0, 16))
            pwm = 16 // bei ungültigen Werten max. Helligkeit

        if (led == eLed.redb) {
            write_led(eLed.redl, on, blink, pwm) // 2 mal rekursiv aufrufen für beide rote LED
            write_led(eLed.redr, on, blink, pwm)
        }
        else {
            if (blink && q_leds.get(led) == pwm)
                pwm = 0
            i2cWriteBuffer(Buffer.fromArray([eRegister.SET_LED, led, pwm]))
            q_leds.set(led, pwm)
        }
    }



    // ========== group="Kommentar"

    //% group="Kommentar"
    //% block="// %text"
    export function comment(text: string): void { }



    // ========== private

    export function i2cWriteBuffer(bu: Buffer) {
        if (q_i2c_callibot_connected !== false) // undefined oder true
            q_i2c_callibot_connected = pins.i2cWriteBuffer(q_i2c_callibot_x22, bu) == 0
    }

    export function i2cWriteReadBuffer(bu: Buffer, size: number) {
        let read_buffer: Buffer
        if (q_i2c_callibot_connected !== false) // undefined oder true
            if (pins.i2cWriteBuffer(q_i2c_callibot_x22, bu, false) == 0) { // callibot verträgt kein repeat
                read_buffer = pins.i2cReadBuffer(q_i2c_callibot_x22, size)
                if (read_buffer)
                    q_i2c_callibot_connected = true
            } else
                q_i2c_callibot_connected = false
        return read_buffer
    }


    export function between(i0: number, i1: number, i2: number): boolean { return (i0 >= i1 && i0 <= i2) }

} // callibot2.ts
