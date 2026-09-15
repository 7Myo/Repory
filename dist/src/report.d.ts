import { Analysis } from "./types.js";
export declare function progress(message: string, color: boolean): void;
export declare function welcome(color: boolean): string;
export declare function markdown(a: Analysis): string;
export declare function terminal(a: Analysis, color?: boolean): string;
