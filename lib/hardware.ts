export const neoComponents = [
 {id:'display',label:'OLED DISPLAY',detail:'SSD1306 · expression output',note:'The SSD1306 presents animated eyes and expression output.',side:0,row:0},
 {id:'microphone',label:'MICROPHONE',detail:'INMP441 · audio input',note:'The INMP441 microphone provides I2S audio input.',side:1,row:0},
 {id:'controller',label:'ESP32',detail:'Controller + Wi-Fi',note:'ESP32 coordinates peripherals and receives commands over Wi-Fi.',side:0,row:1},
 {id:'driver',label:'MOTOR DRIVER',detail:'Movement control',note:'The motor driver translates control signals into wheel movement.',side:1,row:1},
 {id:'audio',label:'AUDIO MODULE',detail:'MAX98357A',note:'The MAX98357A drives the speaker from digital audio.',side:0,row:2},
 {id:'speaker',label:'SPEAKER',detail:'Audio feedback',note:'The speaker turns audio responses into audible feedback.',side:1,row:2},
 {id:'power',label:'BATTERY / POWER',detail:'Supply + regulation',note:'Battery power and regulation supply logic, audio and drive circuits.',side:0,row:3},
 {id:'motors',label:'DC MOTORS',detail:'Four-wheel movement',note:'Four DC motors provide the prototype’s wheel movement.',side:1,row:3},
 {id:'chassis',label:'CHASSIS',detail:'Prototype structure',note:'The chassis holds the exposed wiring, wheels and electronics together.',side:0,row:4},
] as const;
export const quadComponents = [
 {id:'propellers',label:'PROPELLERS',detail:'Rotor assembly',note:'Propellers connect motor rotation to the aircraft’s mechanical response.',side:0,row:0},
 {id:'motors',label:'BLDC MOTORS',detail:'Four motor channels',note:'Four brushless motors were integrated with separate control channels.',side:1,row:0},
 {id:'esc',label:'ESCs',detail:'Motor response',note:'Electronic speed controllers receive the motor-control signals.',side:0,row:1},
 {id:'controller',label:'ESP32',detail:'Control logic',note:'ESP32 runs sensor acquisition and basic motor-response logic.',side:1,row:1},
 {id:'imu',label:'MPU6050',detail:'Motion sensing',note:'The MPU6050 supplies inertial data for calibration and sensing experiments.',side:0,row:2},
 {id:'regulator',label:'POWER / REGULATION',detail:'DC–DC supply',note:'A buck regulator supplies the low-voltage electronics from the battery.',side:1,row:2},
 {id:'frame',label:'FRAME',detail:'Mechanical structure',note:'The frame sets the physical relationship between the four motor assemblies.',side:0,row:3},
 {id:'battery',label:'LI-PO BATTERY',detail:'Power source',note:'Li-Po power is distributed to the ESCs and regulated electronics supply.',side:1,row:3},
] as const;
export type HardwareComponent=typeof neoComponents[number]|typeof quadComponents[number];
