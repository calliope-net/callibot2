// Gib deinen Code hier ein
namespace callibot2 // sensoren.ts
{
    // interner Speicher für Sensoren
    let input_Digital: number = 0
    let input_Ultraschallsensor: number = 0
    // let input_Spursensoren: number[] / analog

    // ========== group="INPUT digital"

    //% group="INPUT digital"
    //% block="Digitaleingänge neu einlesen" weight=8
    export function read_inputs() {
        let bu = i2cWriteReadBuffer(Buffer.fromArray([eRegister.GET_INPUTS]), 1)
        if (bu)
            input_Digital = bu[0]
    }

    //% group="INPUT digital"
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

    //% group="INPUT digital"
    //% block="%pINPUTS" weight=3
    export function get_inputs(pINPUTS: eINPUTS): boolean {
        switch (pINPUTS) {
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


} // sensoren.ts
