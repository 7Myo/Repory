export declare function git(cwd: string, args: string[]): string;
export declare function prepare(input: string, options: {
    branch?: string;
    depth?: number;
    keep: boolean;
}): {
    path: string;
    source: string;
    cleanup: () => void;
    isRemote: boolean;
};
export declare function history(path: string): {
    author: string;
    date: string;
    subject: string;
    files: number;
    add: number;
    del: number;
}[];
export declare function branch(path: string): string;
