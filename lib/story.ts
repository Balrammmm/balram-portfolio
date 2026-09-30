export const resumes=[
 {id:'business',label:'Business / Product / Analytics',lines:['BUSINESS','PRODUCT','ANALYTICS'],href:'/resume/business.pdf',download:'Balram-Maurya-Business-Product-Analytics.pdf'},
 {id:'hardware',label:'Hardware / Engineering',lines:['HARDWARE','ENGINEERING'],href:'/resume/hardware.pdf',download:'Balram-Maurya-Hardware-Engineering.pdf'},
] as const;
export const books=[
 {title:'5 Proven Secrets to Crush Procrastination',subtitle:'Simple strategies to reclaim your time and achieve your goals.',author:'Sterling Moriz',url:'https://www.amazon.in/dp/B0DW1C968M'},
 {title:'Master AI Productivity',subtitle:'A co-authored exploration of productivity and AI.',author:'Sterling Moriz · Alex Ross',url:'https://www.amazon.in/dp/B0DXB5JQJK'},
] as const;
export const proof=[
 {value:'500K+',label:'REVIEWS / PRODUCTPULSE',source:'pulse'},
 {value:'56K+',label:'ORDER LINES / RETAILPULSE',source:'retail'},
 {value:'₹2L+',label:'FINANCIAL RESPONSIBILITY',source:'finance'},
 {value:'8+',label:'INSTITUTIONAL INITIATIVES',source:'initiatives'},
 {value:'5+',label:'PUBLISHED DIGITAL WORKS',source:'writing'},
 {value:'ROUND 2',label:'IRoC-U 2025',source:'flight'},
] as const;
export const chapterNames=['Responsibility','Writing','Ways of thinking','Proof of work','Résumés','Contact'];
export type StoryMotion={position:number;reduced:boolean;paused:boolean;chartPoints?:{x:number;y:number}[];};
