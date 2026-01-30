export interface FilterState {
    region: string;
    age: string;
    cat: string;
    win: string;
}

export interface Driver {
    label: string;
    v: number;
}

export interface RowData {
    topic: string;
    seg: string;
    idx: number;
    delta: number;
}

export interface ResultsData {
    responses: number;
    consensus: number;
    shift: number;
    series: number[];
    drivers: Driver[];
    rows: RowData[];
}
