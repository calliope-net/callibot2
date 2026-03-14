
namespace callibot2 // enums.ts
{

    export enum eRegister {
        // Write
        RESET_OUTPUTS = 0x01, // Alle Ausgänge abschalten (Motor, LEDs, Servo)
        SET_MOTOR = 0x02, // Bit0: 1=Motor 1 setzen;  Bit1: 1=Motor 2 setzen
        /*
Bit0: 1=Motor 1 setzen;  Bit1: 1=Motor 2 setzen
wenn beide auf 11, dann Motor2 Daten nachfolgend senden (also 6 Bytes) Richtung (0:vorwärts, 1:rückwärts) von Motor 1 oder 2
PWM (0..255) Motor 1 oder 2
wenn in [1] Motor 1 & Motor 2 aktiviert
Richtung (0:vorwärts, 1:rückwärts) von Motor 2
PWM rechts (0..255) von Motor 2
        */
        SET_LED = 0x03, // Write: LED´s
        RESET_ENCODER = 0x05, // 2 Byte [0]=5 [1]= 1=links, 2=rechts, 3=beide
        // Read
        GET_INPUTS = 0x80, // Digitaleingänge (1 Byte 6 Bit)
        GET_INPUT_US = 0x81, // Ultraschallsensor (3 Byte 16 Bit)
        GET_FW_VERSION = 0x82, // Typ & Firmwareversion & Seriennummer (10 Byte)
        GET_POWER = 0x83, // Versorgungsspannung [ab CalliBot2E] (3 Byte 16 Bit)
        GET_LINE_SEN_VALUE = 0x84, // Spursensoren links / rechts Werte (5 Byte 2x16 Bit)
        GET_ENCODER_VALUE = 0x91 // 9 Byte links[1-4] rechts [5-8] 2* INT32BE mit Vorzeichen
    }



    export enum eMotor {
        //% block="links"
        m1 = 0b01,
        //% block="rechts"
        m2 = 0b10,
        //% block="beide"
        beide = 0b11
    }

    export enum eRL { rechts = 0, links = 1 } // Index im Array

    export enum eDirection {
        //% block="vorwärts"
        v = 0,
        //% block="rückwärts"
        r = 1
    }

    export enum eLed {
        //% block="linke rote LED"
        redl = 5,
        //% block="rechte rote LED"
        redr = 6,
        //% block="beide rote LED"
        redb = 16,
        //% block="Spursucher LED links"
        spurl = 7,
        //% block="Spursucher LED rechts"
        spurr = 8,
        //% block="Power-ON LED"
        poweron = 0
    }

    export enum eRgbLed {
        //% block="alle (4)"
        All = 0,
        //% block="links vorne"
        LV = 1,
        //% block="links hinten"
        LH = 2,
        //% block="rechts hinten"
        RH = 3,
        //% block="rechts vorne"
        RV = 4
    }

    export enum eSensor { links, rechts }

    export enum eSensorStatus { hell, dunkel }

    export enum eState { aus, an }

    export enum eTaster {
        //% block="Ein-Taster"
        ont,
        //% block="Aus-Taster"
        offt
    }

    export enum eINPUTS {
        //% block="Spursucher dunkel" deprecated=true
        sp0, //= 0b00000000,
        //% block="Spursucher rechts"
        sp1r, //= 0b00000001,
        //% block="Spursucher links"
        sp2l, //= 0b00000010,
        //% block="Spursucher beide"
        sp3b, //= 0b00000011,
        //% block="Spursucher egal"
        sp4e,
        //% block="Stoßstange aus"
        st0, //= 0b00000000,
        //% block="Stoßstange rechts"
        st1r, //= 0b00000100,
        //% block="Stoßstange links"
        st2l, //= 0b00001000,
        //% block="Stoßstange beide"
        st3b, //= 0b00001100,
        //% block="Stoßstange egal"
        st4e,
        //% block="ON-Taster"
        ont, //= 0b00010000,
        //% block="OFF-Taster"
        off //= 0b00100000
    }

    export enum eVergleich {
        //% block=">"
        gt,
        //% block="<"
        lt
    }

    export enum eVersion { Typ, Firmware, Seriennummer }



    //% blockId=callibot2_colorPicker block="%value"
    //% blockHidden=true
    //% shim=TD_ID
    //% value.fieldEditor="colornumber" value.fieldOptions.decompileLiterals=true
    //% value.fieldOptions.colours='["#000000","#0000ff","#00ff00","#00ffdc","#ff0000","#a300ff","#ffff00","#ffffff"]'
    //% value.fieldOptions.columns=4 value.fieldOptions.className='rgbColorPicker'  
    export function callibot2_colorPicker(value: number) { return value }

} // enums.ts
