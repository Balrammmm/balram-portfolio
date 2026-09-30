export const categories = ['SYSTEMS','VENTURES','HARDWARE','AI','FINANCE','WRITING','BEYOND THE BUILD'] as const;
export type Category = typeof categories[number];
export type FilmState = {
  suspended?:boolean; progress: number; orbit: number; reveal: number; mouseX: number; mouseY: number;
  focus: number; selected: number; hover: number; reduced: boolean; paused: boolean;
};
export function createFilmState(): FilmState { return {progress:0,orbit:0,reveal:0,mouseX:0,mouseY:0,focus:0,selected:-1,hover:-1,reduced:false,paused:false}; }
