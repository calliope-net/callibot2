//% color=#007F00 icon="\uf188" block="Calli:bot 2" weight=28
namespace callibot2 // callibot2.ts
/*
https://shop.knotech.de/calli-bot/244/calli-bot-2
*/ {
    const q_i2c_callibot_x22 = 0x22
    let q_i2c_callibot_connected: boolean // undefined
    let qLEDs = [0, 0, 0, 0, 0, 0, 0, 0, 0] // LED Wert in Register 0x03 merken zum blinken
    // interner Speicher für Sensoren
    let input_Digital: number
    let input_Ultraschallsensor: number
    let input_Spursensoren: number[]


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





    // ========== group="LED"



    //% group="LED"
    //% block="4 RGB LED %color || ↖ %lv ↙ %lh ↘ %rh ↗ %rv blinken %blink" weight=7
    //% color.shadow="callibot2_colorPicker"
    //% lv.shadow="toggleOnOff" lh.shadow="toggleOnOff" rh.shadow="toggleOnOff" rv.shadow="toggleOnOff"
    //% lv.defl=true lh.defl=true rh.defl=true rv.defl=true
    //% blink.shadow="toggleYesNo"
    //% inlineInputMode=inline expandableArgumentMode="toggle"
    export function set_rgbled(color: number, lv = true, lh = true, rh = true, rv = true, blink = false) {
        //basic.showString(lv.toString())
        let buffer = Buffer.create(5)
        buffer[0] = eRegister.SET_LED
        buffer.setNumber(NumberFormat.UInt32BE, 1, color) // [1]=0 [2]=r [3]=g [4]=b
        buffer[2] = buffer[2] >>> 4 // durch 16, gültige rgb Werte für callibot: 0-15
        buffer[3] = buffer[3] >>> 4
        buffer[4] = buffer[4] >>> 4

        if (lv) set_rgbled1(eRgbLed.LV, buffer, blink)
        if (lh) set_rgbled1(eRgbLed.LH, buffer, blink)
        if (rh) set_rgbled1(eRgbLed.RH, buffer, blink)
        if (rv) set_rgbled1(eRgbLed.RV, buffer, blink)
    }


    // blinken
    function set_rgbled1(pRgbLed: eRgbLed, buffer: Buffer, blink: boolean) {
        if (blink && qLEDs[pRgbLed] == buffer.getNumber(NumberFormat.UInt32BE, 1))
            buffer.setNumber(NumberFormat.UInt32BE, 1, 0) // alle Farben aus
        qLEDs[pRgbLed] = buffer.getNumber(NumberFormat.UInt32BE, 1)
        buffer[1] = pRgbLed // Led-Index 1,2,3,4 für RGB
        i2cWriteBuffer(buffer)
        basic.pause(10) // ms
    }


    //% group="LED"
    //% block="LED %led %onoff || blinken %blink Helligkeit %pwm" weight=2
    //% onoff.shadow="toggleOnOff"
    //% blink.shadow="toggleYesNo"
    //% pwm.min=1 pwm.max=16 pwm.defl=16
    //% inlineInputMode=inline 
    export function setLed1(pLed: eLed, on: boolean, blink = false, pwm?: number) {
        if (!on)
            pwm = 0 // LED aus schalten
        else if (!between(pwm, 0, 16))
            pwm = 16 // bei ungültigen Werten max. Helligkeit

        if (pLed == eLed.redb) {
            setLed1(eLed.redl, on, blink, pwm) // 2 mal rekursiv aufrufen für beide rote LED
            setLed1(eLed.redr, on, blink, pwm)
        }
        else {
            if (blink && qLEDs.get(pLed) == pwm)
                pwm = 0
            i2cWriteBuffer(Buffer.fromArray([eRegister.SET_LED, pLed, pwm]))
            qLEDs.set(pLed, pwm)
        }
    }



    // ========== group="Reset"

    //% group="Reset"
    //% block="alles aus (Motoren, LEDs)"
    export function i2cRESET_OUTPUTS() {
        i2cWriteBuffer(Buffer.fromArray([eRegister.RESET_OUTPUTS]))
    }

    // ========== group="INPUT digital"

    //% group="INPUT digital"
    //% block="Digitaleingänge neu einlesen" weight=8
    export function read_inputs() {
        let bu = i2cWriteReadBuffer(Buffer.fromArray([eRegister.GET_INPUTS]), 1)
        if (bu)
            input_Digital = bu[0]
    }



    //% group="I²C 0x22" 
    //% block="Calli:bot 2 angeschlossen"
    export function is_connected() {
        if (q_i2c_callibot_connected)
            return true
        else if (q_i2c_callibot_connected === undefined) // nicht false
            read_inputs() // testet i2cWriteReadBuffer
        return q_i2c_callibot_connected
    }

    function i2cWriteBuffer(bu: Buffer) {
        if (q_i2c_callibot_connected !== false) // undefined oder true
            q_i2c_callibot_connected = pins.i2cWriteBuffer(q_i2c_callibot_x22, bu) == 0
    }


    function i2cWriteReadBuffer(bu: Buffer, size: number) {
        let read_buffer: Buffer
        if (q_i2c_callibot_connected !== false) // undefined oder true
            if (pins.i2cWriteBuffer(q_i2c_callibot_x22, bu, true) == 0) {
                read_buffer = pins.i2cReadBuffer(q_i2c_callibot_x22, size)
                if (read_buffer)
                    q_i2c_callibot_connected = true
            } else
                q_i2c_callibot_connected = false
        return read_buffer
    }



    export function between(i0: number, i1: number, i2: number): boolean { return (i0 >= i1 && i0 <= i2) }

} // callibot2.ts
