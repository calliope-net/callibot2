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
142,94 mm Rad Umfang
31,48 Impulse pro cm Fahrstrecke

8 cm * Pi eine volle Drehung = 25,13 cm
791,2 Impulse pro volle Drehung
197,8 Impulse pro viertel 90° Drehung
wenn beide Räder gleich schnell in entgegengesetzte Richtung drehen
pro Rad getrennte Encoder
beim rückwärts drehen zählt der Encoder rückwärts und Wert wird negativ
*/
{
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
    //% block="Encoder Array 2* ±31 Bit [l,r]" weight=6
    export function encoder_value(): number[] {
        let bu = i2cWriteReadBuffer(Buffer.fromArray([eRegister.GET_ENCODER_VALUE]), 9)
        if (bu)
            return bu.slice(1, 8).toArray(NumberFormat.Int32LE)
        else
            return [0, 0]
    }

    //% group="Encoder (nur Calli:bot 2E)" subcategory="Sensoren"
    //% block="Encoder Zähler löschen %encoder" weight=4
    //% encoder.defl=callibot2.eMotor.beide
    export function encoder_reset(encoder: eMotor) {
        i2cWriteBuffer(Buffer.fromArray([eRegister.RESET_ENCODER, encoder]))
    }



    // ========== group="I²C Register lesen" advanced=true

    //% group="I²C Register lesen" advanced=true
    //% block="Version %version (HEX)" weight=6
    export function i2c_read_fw(version: eVersion) {
        let bu = i2cWriteReadBuffer(Buffer.fromArray([eRegister.GET_FW_VERSION]), 10)
        if (bu)
            switch (version) {
                case eVersion.Typ: { return bu.slice(1, 1).toHex() }
                case eVersion.Firmware: { return bu.slice(2, 4).toHex() }
                case eVersion.Seriennummer: { return bu.slice(6, 4).toHex() }
                default: { return bu.toHex() }
            }
        else
            return 0
    }

    //% group="I²C Register lesen" advanced=true
    //% block="Versorgungsspannung (mV)" weight=4
    export function i2c_read_power(): number {
        let bu = i2cWriteReadBuffer(Buffer.fromArray([eRegister.GET_POWER]), 3)
        if (bu)
            return bu.getNumber(NumberFormat.UInt16LE, 1)
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
