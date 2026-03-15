// Gib deinen Code hier ein
namespace callibot2 // sensoren.ts
/*
Ich habe eine Antwort von Knotech bekommen:

es ist ein Calli:bot 2E,
wenn von I²C Adresse 0x22, Register 0x82, offset [1] Typ: 3 gelesen wird

Encoder Daten:
3 Impulse pro Umdrehung der Motorwelle
150:1 Getriebe
450 Impulse pro Umdrehung des Rades
45,50 mm Rad Durchmesser
142,94 mm Rad Umfang (45,5*Pi)
3,148 Impulse pro mm Fahrstrecke (450/31,48)

8 cm Abstand der Räder
80 mm * Pi eine volle Drehung = 251,32 mm
791,208 Impulse pro volle Drehung (251,32*3,148)
2,197 Impule pro 1° Grad (791,208/360)
197,80 Impulse pro viertel 90° Drehung
wenn beide Räder gleich schnell in entgegengesetzte Richtung drehen
pro Rad getrennte Encoder
beim rückwärts drehen zählt der Encoder rückwärts und Wert wird negativ
*/ {
    // Encoder Konstanten
    const impulse_cm = 31.481197   // 1cm
    const impulse_grad = 2.1978021 // 1°

    // interner Speicher für Sensoren
    let input_Digital: number = 0
    //let input_Ultraschallsensor: number = 0
    // let input_Spursensoren: number[] / analog



    // ========== group="INPUT digital" subcategory="Sensoren"

    //% group="INPUT digital" subcategory="Sensoren"
    //% block="Digitaleingänge neu einlesen" weight=8
    export function read_inputs() {
        let bu = i2cWriteReadBuffer(Buffer.fromArray([eRegister.GET_INPUTS]), 1)
        if (bu)
            input_Digital = bu[0]
    }

    //% group="INPUT digital" subcategory="Sensoren"
    //% block="%inputs" weight=3
    export function get_inputs(inputs: eINPUTS): boolean {
        switch (inputs) {
            case eINPUTS.sp1r: return (input_Digital & 0b00000001) == 1
            case eINPUTS.sp2l: return (input_Digital & 0b00000010) == 2
            case eINPUTS.st1r: return (input_Digital & 0b00000100) == 4
            case eINPUTS.st2l: return (input_Digital & 0b00001000) == 8
            case eINPUTS.ont: return (input_Digital & 0b00010000) == 16
            case eINPUTS.off: return (input_Digital & 0b00100000) == 32
            default: return false
        }
    }

    // ========== group="INPUT digital" subcategory="Sensoren" deprecated=true

    //% group="INPUT digital" subcategory="Sensoren" deprecated=true
    //% block="Spur Sensor %sensor %status" weight=7
    export function get_spursensor(sensor: eSensor, status: eSensorStatus): boolean {
        switch (sensor) {
            case eSensor.rechts:
                switch (status) {
                    case eSensorStatus.hell: return (input_Digital & 0b00000001) != 0
                    case eSensorStatus.dunkel: return (input_Digital & 0b00000001) == 0
                }
            case eSensor.links:
                switch (status) {
                    case eSensorStatus.hell: return (input_Digital & 0b00000010) != 0
                    case eSensorStatus.dunkel: return (input_Digital & 0b000000010) == 0
                }
            default:
                return false
        }
    }



    // ========== group="INPUT Ultraschallsensor" subcategory="Sensoren"

    //% group="INPUT Ultraschallsensor" subcategory="Sensoren"
    //% block="Entfernung %vergleich %cm cm" weight=4
    //% cm.min=1 cm.max=50 cm.defl=15
    export function read_compare_us(vergleich: eVergleich, cm: number) {
        switch (vergleich) {
            case eVergleich.gt: return read_us() / 10 > cm
            case eVergleich.lt: return read_us() / 10 < cm
            default: return false
        }
    }

    // ========== group="INPUT Ultraschallsensor" advanced=true

    //% group="INPUT Ultraschallsensor" advanced=true
    //% block="Ultraschallsensor 16 Bit (mm)" weight=3
    export function read_us() {
        let bu = i2cWriteReadBuffer(Buffer.fromArray([eRegister.GET_INPUT_US]), 3)
        if (bu)
            return bu.getNumber(NumberFormat.UInt16LE, 1)
        else
            return 0
    }



    // ========== group="Encoder (nur Calli:bot 2E)" subcategory="Sensoren"

    //% group="Encoder (nur Calli:bot 2E)" subcategory="Sensoren"
    //% block="Encoder Array [l,r] ±31 Bit" weight=6
    export function encoder_values(): number[] {
        let bu = i2cWriteReadBuffer(Buffer.fromArray([eRegister.GET_ENCODER_VALUE]), 9)
        if (bu)
            return bu.slice(1, 8).toArray(NumberFormat.Int32LE) // 32 Bit mit Vorzeichen
        else
            return [0, 0]
    }

    //% group="Encoder (nur Calli:bot 2E)" subcategory="Sensoren"
    //% block="Encoder Zähler löschen %encoder" weight=4
    //% encoder.defl=callibot2.eMotor.beide
    export function encoder_reset(encoder: eMotor) {
        i2cWriteBuffer(Buffer.fromArray([eRegister.RESET_ENCODER, encoder]))
    }

    //% group="Encoder (nur Calli:bot 2E)" subcategory="Sensoren"
    //% block="Encoder fahre %zentimeter cm" weight=3
    //% zentimeter.min=1 zentimeter.max=100 zentimeter.defl=20
    export function encoder_wait_cm(zentimeter: number) {
        encoder_reset(eMotor.beide)
        while (q_pwm1 > 0 || q_pwm2 > 0) {
            let values = encoder_values()
            if (Math.abs(values[0]) >= zentimeter * impulse_cm) {
                write_motor(eMotor.m1, 0, eDirection.v) // setzt pwm1 auf 0
            }
            if (Math.abs(values[1]) >= zentimeter * impulse_cm) {
                write_motor(eMotor.m2, 0, eDirection.v) // setzt pwm2 auf 0
            }
        }
    }


    //% group="Encoder (nur Calli:bot 2E)" subcategory="Sensoren"
    //% block="Encoder drehe %grad °" weight=2
    //% grad.min=15 grad.max=360 grad.defl=90
    export function encoder_wait_grad(grad: number) {
        encoder_reset(eMotor.beide)
        while (q_pwm1 > 0 || q_pwm2 > 0) {
            let values = encoder_values()
            if (Math.abs(values[0]) >= grad * impulse_grad) {
                write_motor(eMotor.m1, 0, eDirection.v) // setzt pwm1 auf 0
            }
            if (Math.abs(values[1]) >= grad * impulse_grad) {
                write_motor(eMotor.m2, 0, eDirection.v) // setzt pwm2 auf 0
            }
        }
    }



    // ========== group="I²C Register lesen" advanced=true

    //% group="I²C Register lesen" advanced=true
    //% block="Version %version (HEX)" weight=6
    export function read_fw(version: eVersion): string {
        let bu = i2cWriteReadBuffer(Buffer.fromArray([eRegister.GET_FW_VERSION]), 10)
        if (bu)
            switch (version) {
                case eVersion.Typ: { return bu.slice(1, 1).toHex() }
                case eVersion.Firmware: { return bu.slice(2, 4).toHex() }
                case eVersion.Seriennummer: { return bu.slice(6, 4).toHex() }
                default: { return bu.toHex() }
            }
        else
            return ""
    }

    //% group="I²C Register lesen" advanced=true
    //% block="Calli:bot Typ" weight=5
    export function read_typ(): string {
        let bu = i2cWriteReadBuffer(Buffer.fromArray([eRegister.GET_FW_VERSION]), 2)
        if (bu)
            switch (bu.getUint8(1)) {
                case 3: return "E"
                case 4: return "A"
                default: return bu.getUint8(1).toString()
            }
        else
            return ""
    }

    //% group="I²C Register lesen" advanced=true
    //% block="Versorgungsspannung (V)" weight=4
    export function read_power(): number {
        let bu = i2cWriteReadBuffer(Buffer.fromArray([eRegister.GET_POWER]), 3)
        if (bu)
            //return bu.getNumber(NumberFormat.UInt16LE, 1)
            return Math.roundWithPrecision(bu.getNumber(NumberFormat.UInt16LE, 1) / 1000, 1) // Volt mit 1 Kommastelle
        else
            return 0
    }

    //% group="I²C Register lesen" advanced=true
    //% block="I²C Register lesen %register size %size (Buffer)" weight=2
    //% register.defl=callibot2.eRegister.GET_INPUTS
    //% size.min=1 size.max=10 size.defl=1
    export function i2c_read_register(register: eRegister, size: number): Buffer {
        return i2cWriteReadBuffer(Buffer.fromArray([register]), size)
    }


} // sensoren.ts
