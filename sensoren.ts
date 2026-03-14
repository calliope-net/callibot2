// Gib deinen Code hier ein
namespace callibot2 // sensoren.ts
{
    // interner Speicher für Sensoren
    let input_Digital: number = 0
    //let input_Ultraschallsensor: number = 0
    // let input_Spursensoren: number[] / analog

    // ========== group="INPUT digital"

    //% group="INPUT digital" subcategory="Sensoren"
    //% block="Digitaleingänge neu einlesen" weight=8
    export function read_inputs() {
        let bu = i2cWriteReadBuffer(Buffer.fromArray([eRegister.GET_INPUTS]), 1)
        if (bu)
            input_Digital = bu[0]
    }

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

    //% group="INPUT digital" subcategory="Sensoren"
    //% block="%inputs" weight=3
    export function get_inputs(inputs: eINPUTS): boolean {
        switch (inputs) {
            //case eINPUTS.sp0: return (input_Digital & 0b00000011) == 0
            case eINPUTS.sp1r: return (input_Digital & 0b00000001) == 1
            case eINPUTS.sp2l: return (input_Digital & 0b00000010) == 2
            //case eINPUTS.sp3b: return (input_Digital & 0b00000011) == 3
            //case eINPUTS.sp4e: return bitINPUTS(eINPUTS.sp1r) || bitINPUTS(eINPUTS.sp2l) || bitINPUTS(eINPUTS.sp3b)
            //case eINPUTS.st0: return (input_Digital & 0b00001100) == 0b00000000
            case eINPUTS.st1r: return (input_Digital & 0b00000100) == 4
            case eINPUTS.st2l: return (input_Digital & 0b00001000) == 8
            //case eINPUTS.st3b: return (input_Digital & 0b00001100) == 0b00001100
            //case eINPUTS.st4e: return bitINPUTS(eINPUTS.st1r) || bitINPUTS(eINPUTS.st2l) || bitINPUTS(eINPUTS.st3b)
            case eINPUTS.ont: return (input_Digital & 0b00010000) == 16
            case eINPUTS.off: return (input_Digital & 0b00100000) == 32
            default: return false
        }
    }





    // ========== group="INPUT Ultraschallsensor"

    //% group="INPUT Ultraschallsensor" advanced=true
    //% block="Ultraschallsensor 16 Bit (mm)" weight=3
    export function read_us() {
        let bu = i2cWriteReadBuffer(Buffer.fromArray([eRegister.GET_INPUT_US]), 3)
        if (bu)
            return bu.getNumber(NumberFormat.UInt16LE, 1)
        else
            return 0
    }

    //% group="INPUT Ultraschallsensor" subcategory="Sensoren"
    //% block="Entfernung %vergleich %cm cm" weight=2
    //% cm.min=1 cm.max=50 cm.defl=15
    export function read_compare_us(vergleich: eVergleich, cm: number) {
        switch (vergleich) {
            case eVergleich.gt: return read_us() / 10 > cm
            case eVergleich.lt: return read_us() / 10 < cm
            default: return false
        }
    }





    //% group="Encoder 2*32 Bit [l,r]" subcategory="Sensoren"
    //% block="Encoder Werte lesen 2*32 Bit [l,r]"
    export function encoderValue(): number[] {
        let bu = i2cWriteReadBuffer(Buffer.fromArray([eRegister.GET_ENCODER_VALUE]), 9)
        if (bu)
            return bu.slice(1, 8).toArray(NumberFormat.Int32LE)
        else
            return [0, 0]
    }

    //% group="Encoder 2*32 Bit [l,r]" subcategory="Sensoren"
    //% block="Encoder Zähler löschen %encoder"
    //% encoder.defl=callibot2.eMotor.beide
    export function resetEncoder(encoder: eMotor) {
        i2cWriteBuffer(Buffer.fromArray([eRegister.RESET_ENCODER, encoder]))
    }

} // sensoren.ts
