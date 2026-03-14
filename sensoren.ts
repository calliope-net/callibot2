// Gib deinen Code hier ein
namespace callibot2 // sensoren.ts
{
    // interner Speicher für Sensoren
 let input_Digital: number
    let input_Ultraschallsensor: number
    let input_Spursensoren: number[]
   
    // ========== group="INPUT digital"

    //% group="INPUT digital"
    //% block="Digitaleingänge neu einlesen" weight=8
    export function read_inputs() {
        let bu = i2cWriteReadBuffer(Buffer.fromArray([eRegister.GET_INPUTS]), 1)
        if (bu)
            input_Digital = bu[0]
    }


} // sensoren.ts
